/* -*- Mode: JAVASCRIPT; tab-width: 2; indent-tabs-mode: nil; c-basic-offset: 4 -*-
 *
 * ***** BEGIN LICENSE BLOCK *****
 * Version: MPL 1.1
 *
 * The contents of this file are subject to the Mozilla Public License Version
 * 1.1 (the "License"); you may not use this file except in compliance with
 * the License. You may obtain a copy of the License at
 * http://www.mozilla.org/MPL/
 *
 * Software distributed under the License is distributed on an "AS IS" basis,
 * WITHOUT WARRANTY OF ANY KIND, either express or implied. See the License
 * for the specific language governing rights and limitations under the
 * License.
 *
 * The Original Code is tanasinn
 *
 * The Initial Developer of the Original Code is
 * Hayaki Saito.
 * Portions created by the Initial Developer are Copyright (C) 2010 - 2011
 * the Initial Developer. All Rights Reserved.
 *
 * ***** END LICENSE BLOCK ***** */

/**
 * @package tty
 *
 * <pre>
 *    TTY Device pair            Python script                   tanasinn
 *    Master / Slave          class TeletypeDriver          socket_tty_service.js
 *  +-----------------+       +------------------+           +-----------------+
 *  |                 |       |                  |           |                 |
 *  | +-------------+ |       | +--------------+ |           | +-------------+ |
 *  | |             |---------->| Writing Proc |<--- recv -----|             | |
 *  | |             | | read  | +--------------+ |           | |             | |
 *  | |             | |       |                  <I/O channel> | I/O Manager | |
 *  | |             | |       | +--------------+ |           | |             | |
 *  | |   Master    |<----------| Reading Proc |---- send ---->|             | |
 *  | |             | | write | +--------------+ |           | +-------------+ |
 *  | |             | |       |                  |           |                 |
 *  | |             | |       | +--------------+ |           | +-------------+ |
 *  | |             |<----------| Control Proc |<- send/recv ->| Controller  | |
 *  | +-------------+ | ioctl | +--------------+ |           | +-------------+ |
 *  |        |        |       |                <Control channel>               |
 *  | +-------------+ |       | +--------------+ |           +-----------------+
 *  | |    Slave    |<--------->|   App Proc   | |
 *  | +-------------+ | stdio | +--------------+ |
 *  |                 |       |                  |
 *  +-----------------+       +------------------+
 *
 *    figure-1. Communication among TTY device pair, TeletypeDrive, tanasinn.
 * </pre>
 *
 * -*- About [Control channel]'s protocol -*-
 *
 *   [ Protocol Overview ]
 *
 *     1. This protocol is line-oriented. line terminator is '\n' (0x0a).
 *
 *     2. This protocol is command-based. 1 line should be interpreted as 1 
 *        command.
 *        A command is composed of 1 or multiple tokens. token's delimiter is 
 *        ' ' (0x20).
 *
 *     3. First token is <b>opecode</b>, represent a operation.
 *        An opecode consists of lower-case alphabetic sets ([a-z]+).
 *
 *     4. Tokens after <b>opecode</b> represent arguments.
 *        An arguments consists of multiple printable characters, that is 
 *        encoded in base64 Data Encodings, defined in RFC-3548.
 * <pre>
 *        example 1:
 *          xoff\n
 * </pre>
 *          Opecode of this command is "xoff". "\n" is line terminator.
 * <pre>
 *        example 2: 
 *          resize ODA= MjQ=\n
 * </pre>
 *          In this case, opecode is "resize".
 *          Arguments are "ODA=" and "MjQ=", these strings mean "80" and "24"
 *          when decoded.
 *
 *   [ Protocol Details ]
 *
 *     Comming soon...
 */

/**
 * @concept ControllerConcept
 */
var ControllerConcept = new Concept();
ControllerConcept.definition = {

  get id()
    "Controller",

// message concept
  "<@event/broker-stopping> :: Undefined":
  _("Close Control channel and stop communication with TTY device."),

// signature concept
  "post :: String -> Undefined":
  _("Posts a command message asynchronously."),

}; // ControllerConcept


/**
 * @concept IOManagerConcept
 */
var IOManagerConcept = new Concept();
IOManagerConcept.definition = {

  get id()
    "IOManager",
  
// message concept
  "<@event/broker-stopping> :: Undefined":
  _("Close I/O channel and stop communication with TTY device."),

// signature concept
  "send :: String -> Undefined":
  _("Send character sequence data to TTY device."),

}; // IOManagerConcept


/**
 * @class Controller
 */
var Controller = new Class().extends(Component).requires("Controller");
Controller.definition = {

  get id()
    "tty_controller",

  _screen: null,
  _input: null,
  _output: null,

  "[persistable] beacon_interval": 2000,

  /** constructor */
  "[subscribe('@initialized/screen'), enabled]":
  function onLoad(screen)
  {
    this._screen = screen;
  },

  /** Posts a command message asynchronously. 
   * @param {String} command command message string for external program. 
   */
  "[type('String -> Undefined')]":
  function post(command) 
  {
    if (this._output) {
      this._output.write(command, command.length);
    }
  },

  /** Close Control channel and stop communication with TTY device.
   */
  "[subscribe('@event/broker-stopping'), type('Undefined'), enabled]":
  function stop() 
  {
    this.post("disconnect\n");
    this._input.close();
    this._output.close();
    this._pump.cancel(0);
    this._input = null;
    this._output = null;
    this._pump = null;
    this._screen = null;
    coUtils.Debug.reportMessage(
      _("Resources in Controller have been cleared."));
  },

  /**
   * Changes screen resolution of TTY device.
   * @param width new horizontal resolution of TTY device.
   * @param height new vertical resolution of TTY device.
   */
  "[subscribe('event/screen-size-changed')]": 
  function resize(size) 
  {
    var {column, row} = size,
        width = coUtils.Text.base64encode(column),
        height = coUtils.Text.base64encode(row),
        command = coUtils.Text.format("resize %s %s\n", width, height);

    this.post(command);
  },

  "[subscribe('@command/kill')]": 
  function kill()
  {
    this.post("kill\n");
  },

  /** flow controll 
   * Suspend/Resume output.
   * @param {Boolean} flag true: resume output. false: suspend output.
   */
  "[subscribe('command/flow-control')]":
  function flowControl(flag) 
  {
    this.post(flag ? "xon\n": "xoff\n");
  },

  "[subscribe('event/{control & io}-socket-ready'), enabled]":
  function connect(control_port, io_port) 
  {
    var self = this,
        timer;

    this._start(control_port);

    timer = coUtils.Timer.setInterval(function() {
      if (self.post) {
        self.post("beacon\n");
      } else {
        timer.cancel();
        self = null;
        timer = null;
      }
    }, self.beacon_interval);

    this._send_initial_data(io_port);
    this.sendMessage("initialized/tty", this);
  },

// nsIRequestObserver implementation.
  /**
   * Called to signify the beginning of an asynchronous request.
   *
   * @param aRequest request being observed
   * @param aContext user defined context
   *
   * An exception thrown from onStartRequest has the side-effect of
   * causing the request to be canceled.
   */
  onStartRequest: function onStartRequest(request, context)
  {
    coUtils.Debug.reportMessage(_("Controller::onStartRequest called. "));
  },

  /**
   * Called to signify the end of an asynchronous request.  This
   * call is always preceded by a call to onStartRequest.
   *
   * @param aRequest request being observed
   * @param aContext user defined context
   * @param aStatusCode reason for stopping (NS_OK if completed successfully)
   *
   * An exception thrown from onStopRequest is generally ignored.
   */
  onStopRequest: function onStopRequest(request, context, status)
  {
    var broker = this._broker;

    coUtils.Debug.reportMessage(
      _("Controller::onStopRequest called. status: %s."), status);
    try {
      broker.stop();
    } catch (e) { 
      coUtils.Debug.reportError(e)
    }
  },

// nsIStreamListener implementation
   /**
    * Called when the next chunk of data (corresponding to the request) may
    * be read without blocking the calling thread.  The onDataAvailable impl
    * must read exactly |aCount| bytes of data before returning.
    *
    * @param aRequest request corresponding to the source of the data
    * @param aContext user defined context
    * @param aInputStream input stream containing the data chunk
    * @param aOffset
    *        Number of bytes that were sent in previous onDataAvailable calls
    *        for this request. In other words, the sum of all previous count
    *        parameters.
    *        If that number is greater than or equal to 2^32, this parameter
    *        will be PR_UINT32_MAX (2^32 - 1).
    * @param aCount number of bytes available in the stream
    *
    * NOTE: The aInputStream parameter must implement readSegments.
    *
    * An exception thrown from onDataAvailable has the side-effect of
    * causing the request to be canceled.
    */
  onDataAvailable: 
  function onDataAvailable(request, context, input, offset, count) 
  {
    var data, command_list, command, argv, operation, 
        arg, screen, output, answer, reply;

    data = context.readBytes(count);
    command_list = data.split(/[\n\r]/);

    command_list.pop();
    try {
      do {
        command = command_list.shift();
        argv = command.split(" ");
        operation = argv.shift();
        if ("request" === operation) {
          arg = coUtils.Text.base64decode(argv.shift());
          screen = this._screen;
          output = this._output;
          if ("column" === arg) {
            answer = coUtils.Text.base64encode(screen.width)
            reply = coUtils.Text.format("answer %s\n", answer);
            output.write(reply, reply.length);
          } else if ("rows" === arg) {
            answer = coUtils.Text.base64encode(screen.height)
            reply = coUtils.Text.format("answer %s\n", answer);
            output.write(reply, reply.length);
          }
        } else {
          coUtils.Debug.reportError(_("Unknown command: [%s]."), command);
        }
      } while (command_list.length)
    } catch (e) { 
      coUtils.Debug.reportError(e)
    }
  },

// private
  _send_initial_data: function _send_initial_data(io_port)
  {
    var broker = this._broker,
        sessiondb_path, 
        message;

    sessiondb_path = coUtils.File
      .getFileLeafFromVirtualPath(broker.runtime_path + "/sessions.txt").path;

    if ("WINNT" === coUtils.Runtime.os) {
      sessiondb_path 
        = sessiondb_path
          .replace(/\\/g, "/")
          .replace(
            /^([a-zA-Z]):/, 
            function() "/cygdrive/" + arguments[1].toLowerCase())
          ;
    }

    message = [
      io_port, 
      broker.request_id,
      coUtils.Text.base64encode(sessiondb_path),
    ].join(" ");

    this.post(message);

    this.flowControl.enabled = true;
    this.post.enabled = true;
    this.resize.enabled = true;
    this.kill.enabled = true;

  },

  /** Starts TCP client socket, and listen it asynchronously.
   */
  _start: function _start(control_port) 
  {
    var transport, istream, ostream, scriptable_input_stream, pump;

    transport = Components
      .classes["@mozilla.org/network/socket-transport-service;1"]
      .getService(Components.interfaces.nsISocketTransportService)
      .createTransport(null, 0, "127.0.0.1", control_port, null),

    istream = transport.openInputStream(0, 128, 1);

    ostream = transport.openOutputStream(0, 128, 1);

    scriptable_input_stream = Components
      .classes["@mozilla.org/scriptableinputstream;1"]
      .createInstance(Components.interfaces.nsIScriptableInputStream);
    scriptable_input_stream.init(istream);

    this._input = scriptable_input_stream;
    this._output = ostream;

    pump = Components
      .classes["@mozilla.org/network/input-stream-pump;1"]
      .createInstance(Components.interfaces.nsIInputStreamPump);
    pump.init(istream, -1, -1, 0, 0, false);
    pump.asyncRead(this, scriptable_input_stream);
    this._pump = pump;
  },


}; // Controller

/**
 * @class IOManager
 */
var IOManager = new Class().extends(Component)
                           .requires("IOManager");
IOManager.definition = {

  get id()
    "tty_iomanager",

  _input: null,
  _output: null,
  _socket: null,

  "[persistable] outgoing_buffer_size": 1024 * 16,
  "[persistable] incoming_buffer_size": 1024 * 8,

  /** 
   * initialize it with Session object.
   * @param {Session} broker
   */
  "[subscribe('@event/broker-started'), enabled]":
  function onLoad(broker) 
  {
    var socket;

    socket = Components
      .classes["@mozilla.org/network/server-socket;1"]
      .createInstance(Components.interfaces.nsIServerSocket);

    socket.init(/* port */ -1, /* loop back */ true, /* connection count */ 1);
    socket.asyncListen(this);
    this._socket = socket;
    this._port = socket.port;
    this.send.enabled = true;

    this.sendMessage("event/io-socket-ready", socket.port);
  },

  /**
   * @property {Number} port Port number for I/O communication.
   */
  get port() 
  {
    if (!this._port) {
      throw coUtils.Debug.Exception(_("I/O socket is not available."));
    }
    return this._port;
  },

  /** Send character sequence data to TTY device.
   * @param {String} data Character seqence data for sending to TTY device.
   */
  "[subscribe('command/send-to-tty'), type('String -> Undefined')]":
  function send(data) 
  {
    //if (this._output) {
    //  this._output
    //    .QueryInterface(Components.interfaces.nsIAsyncOutputStream)
    //    .asyncWait({
    //      onOutputStreamReady: function onOutputStreamReady(stream) {
    //        stream.write(data, data.length);
    //      },
    //    }, 0, 0, null)
    //}
    
    if (this._output) {
      this._output.write(data, data.length);
      this._output.flush();
    }
    
  },

  /** Close I/O channel and stop communication with TTY device.
   */
  "[subscribe('@event/broker-stopping'), type('Undefined'), enabled]":
  function stop() 
  {
    if (this._input) {
      this._input.close();
    }
    if (this._output) {
      this._output.close();
    }
    if (this._binary_stream) {
      this._binary_stream.close();
    }
    if (this._socket) {
      this._socket.close();
    }
    if (this._stream_pump) {
      this._stream_pump.cancel(0);
    }
    this._input = null;
    this._output = null;
    this._socket = null;
    this._stream_pump = null;
    this._binary_stream = null;
    coUtils.Debug.reportMessage(
      _("Resources in IOManager have been cleared."));
  },

// nsIServerSocketListener implementation
  /**
   * nsIServerSocketListener::onSocketAccepted
   *
   * This method is called when a client connection is accepted.
   *
   * @param serv
   *        The server socket.
   * @param transport
   *        The connected socket transport.
   */
  onSocketAccepted: 
  function onSocketAccepted(serv, transport) 
  {
    var ostream, istream, binary_stream, stream_pump;

    try {
      coUtils.Debug.reportMessage(
        _("Connected to ttydriver. port: %d"), 
        serv.port);
      ostream = transport.openOutputStream(0, this.incoming_buffer_size, 1);
      istream = transport.openInputStream(0, this.outgoing_buffer_size, 1);
      coUtils.Debug.reportMessage(_("Started to observe incoming data."));

      // handle given stream as binary stream (null characters are allowed).
      binary_stream = Components
        .classes["@mozilla.org/binaryinputstream;1"]
        .createInstance(Components.interfaces.nsIBinaryInputStream);
      binary_stream.setInputStream(istream);
      this._binary_stream = binary_stream;

      // make "stream pump" object and listen it.
      stream_pump = Components
        . classes["@mozilla.org/network/input-stream-pump;1"]
        .createInstance(Components.interfaces.nsIInputStreamPump);
      stream_pump.init(istream, -1, -1, 0, 0, false);
      stream_pump.asyncRead(this, binary_stream);
      this._stream_pump = stream_pump;

      this._input = binary_stream;
      this._output = ostream;

      this.send.enabled = true;
    } catch (e) {
      coUtils.Debug.reportError(e);
    }
  },

  /**
   * nsIServerSocketListener::onStopListening
   *
   * This method is called when the listening socket stops for some reason.
   * The server socket is effectively dead after this notification.
   *
   * @param a_serv
   *        The server socket.
   * @param a_status
   *        The reason why the server socket stopped listening.  If the
   *        server socket was manually closed, then this value will be
   *        NS_BINDING_ABORTED.
   */
  onStopListening: 
  function nsIServerSocketListener_onStopListening(a_serv, a_status) 
  {
  },
 
// nsIRequestObserver implementation.
  /**
   * Called to signify the beginning of an asynchronous request.
   *
   * @param aRequest request being observed
   * @param aContext user defined context
   *
   * An exception thrown from onStartRequest has the side-effect of
   * causing the request to be canceled.
   */
  onStartRequest: function onStartRequest(request, context)
  {
  },

  /**
   * Called to signify the end of an asynchronous request.  This
   * call is always preceded by a call to onStartRequest.
   *
   * @param aRequest request being observed
   * @param aContext user defined context
   * @param a_status_code reason for stopping (NS_OK if completed successfully)
   *
   * An exception thrown from onStopRequest is generally ignored.
   */
  onStopRequest: function onStopRequest(request, context, status)
  {
    coUtils.Debug.reportMessage(
      _("onStopRequest called. status: %s"), status);
    try {
      this._broker.stop();
    } catch (e) { 
      coUtils.Debug.reportError(e)
    }
  },

// nsIStreamListener implementation
   /**
    * Called when the next chunk of data (corresponding to the request) may
    * be read without blocking the calling thread.  The onDataAvailable impl
    * must read exactly |aCount| bytes of data before returning.
    *
    * @param request request corresponding to the source of the data
    * @param context user defined context
    * @param input input stream containing the data chunk
    * @param offset
    *        Number of bytes that were sent in previous onDataAvailable calls
    *        for this request. In other words, the sum of all previous count
    *        parameters.
    *        If that number is greater than or equal to 2^32, this parameter
    *        will be PR_UINT32_MAX (2^32 - 1).
    * @param aCount number of bytes available in the stream
    *
    * NOTE: The aInputStream parameter must implement readSegments.
    *
    * An exception thrown from onDataAvailable has the side-effect of
    * causing the request to be canceled.
    */
  onDataAvailable: 
  function onDataAvailable(request, context, input, offset, count)
  {
    var data;

    data = context.readBytes(count);
  //  coUtils.Timer.setTimeout(function() {
    this.sendMessage("event/data-arrived", data);
  //  }, 30);
  },
}

/**
 * @class ExternalDriver
 */
var ExternalDriver = new Class().extends(Component);
ExternalDriver.definition = {

  get id()
    "externaldriver",

  _external_process: null,

  /*
   * @param {String} script_path The first argument which is passed to runtime,
   *                             expected to be script file path. 
   */
  "[persistable] script_path": "modules/ttydriver.py",

  /** Kill target process. */
  kill: function kill(pid) 
  {
    var kill_path, args, broker, cygwin_root, external_process, 
        runtime, process;

    if ("WINNT" === coUtils.Runtime.os) {
      broker = this._broker;
      cygwin_root = broker.cygwin_root;
      kill_path = broker.cygwin_root + "\\bin\\run.exe";
      args = [ "/bin/kill", "-9", String(pid) ];
    } else { // Darwin, Linux or FreeBSD
      external_process = this._external_process;
      //if (external_process.isRunning)
      //  external_process.kill();
      kill_path = "/bin/kill";
      args = [ "-9", String(pid) ];
    }
    // create new localfile object.
    runtime = Components
      .classes["@mozilla.org/file/local;1"]
      .createInstance(Components.interfaces.nsILocalFile);
    runtime.initWithPath(kill_path);

    // create new process object.
    process = Components
      .classes["@mozilla.org/process/util;1"]
      .createInstance(Components.interfaces.nsIProcess);
    process.init(runtime);

    try {
      process.run(/* blocking */ true, args, args.length);
    } catch (e) {
      coUtils.Debug.reportMessage(
        _("command '%s' failed."), 
        args.join(" "));
      return false;
    }
    return 0 === process.exitValue;
  },

  /**
   * Run external driver with arguments 
   * which represents <I/O port No.> <Control port No.>.
   *
   * @param {Number} control_port 
   *
   */
  "[subscribe('command/start-ttydriver-process'), enabled]": 
  function start(connection_port) 
  {
    var broker, executable_path, cygwin_root, runtime, 
        external_process, script_absolute_path, args, python_path;

    broker = this._broker;

    if ("WINNT" === coUtils.Runtime.os) {
      cygwin_root = broker.cygwin_root;
      executable_path = cygwin_root + "\\bin\\run.exe";
    } else {
      executable_path = broker.uniget("get/python-path");
    }
    // create new localfile object.
    runtime = Components
      .classes["@mozilla.org/file/local;1"]
      .createInstance(Components.interfaces.nsILocalFile);
    runtime.initWithPath(executable_path);
    if (!runtime.exists() || !runtime.isExecutable()) {
      throw coUtils.Debug.Exeption(_("Could not launch python: file not found."));
    }
    // create new process object.
    external_process = Components
      .classes["@mozilla.org/process/util;1"]
      .createInstance(Components.interfaces.nsIProcess);
    external_process.init(runtime);
    this._external_process = external_process;

    // get script absolute path from abstract path.
    script_absolute_path = coUtils.File
      .getFileLeafFromVirtualPath(this.script_path)
      .path;

    python_path = this.request("get/python-path");

    if ("WINNT" === coUtils.Runtime.os) { // Windows
      args = [
        "/bin/sh", "-wait", "-l", "-c",
        coUtils.Text.format(
          "exec %s \"$(cygpath '%s')\" %d", 
          python_path,
          script_absolute_path,
          connection_port)
      ];
    } else { // Darwin, Linux
      args = [ script_absolute_path, connection_port ];
    }
    this._external_process
      .runAsync(args, args.length, this, false /* hold weak */);
    coUtils.Debug.reportMessage(
      _("TTY Server started. arguments: [%s]."), args.join(", "));

    broker.notify("initialized/externaldriver", this);

  },

  observe: function observe(subject, topic, data)
  {
    var broker;

    broker = this._broker;
    broker.stop();
  },

  /** Kills handling process if it was alive. */
  "[subscribe('@event/broker-stopping'), enabled]":
  function stop() 
  {
    var external_process;

    try {
      external_process = this._external_process;
      //if (external_process.isRunning)
      //  external_process.kill();
    } catch (e) {
      coUtils.Debug.reportWarning(e);
    }
    this._external_process = null;
    coUtils.Debug.reportMessage(_("Resources in ExternalDriver have been cleared."));
  },

  QueryInterface: function QueryInterface(a_IID)
  {
    return this;
  },

};

/**
 *  @class SocketTeletypeService
 *  @brief Listen mouse input events and send them to TTY device.
 */
var SocketTeletypeService = new Class().extends(Plugin);
SocketTeletypeService.definition = {

  get id()
    "tty",

  get info()
    <plugin>
        <name>{_("TTY")}</name>
        <version>0.1</version>
        <description>{
          _("Drives a TTY device and control it.")
        }</description>
    </plugin>,

  "[persistable] enabled_when_startup": true,

  _socket: null,

  "[install]":
  function install(broker) 
  {
    var request_id, record, backup_data_path, context, file, socket;

    this.osc97.enabled = true;
    if (0 === broker.command.indexOf("&")) {
      request_id = broker.command.substr(1);
      record = coUtils.Sessions.get(request_id);
      broker.notify("event/control-socket-ready", Number(record.control_port));
      this._pid = Number(record.pid);

      coUtils.Sessions.remove(broker, request_id);
      coUtils.Sessions.update();

      backup_data_path = broker.runtime_path + "/persist/" + request_id + ".txt";
      if (coUtils.File.exists(backup_data_path)) {
        context = JSON.parse(coUtils.IO.readFromFile(backup_data_path, "utf-8"));
        broker.notify("command/restore", context);

        file = coUtils.File.getFileLeafFromVirtualPath(backup_data_path);
        if (file.exists()) {
          file.remove(false)
        }
        broker.notify("command/draw", true);
      }
    } else {
      socket = Components
        .classes["@mozilla.org/network/server-socket;1"]
        .createInstance(Components.interfaces.nsIServerSocket);
  
      // initialize server socket.
      socket.init(/* port */ -1, /* loop back */ true, /* connection count */ 1);
      socket.asyncListen(this);
      this._socket = socket;
  
      // nsIProcess::runAsync.
      broker.notify("command/start-ttydriver-process", socket.port); 
    }
    this.detach.enabled = true;
  },

  "[uninstall]":
  function uninstall(broker)
  {
    this.detach.enabled = false;
    this.osc97.enabled = false;

    if (this._socket) {
      this._socket.close();
    }
    if (this._pump) {
      this._pump.cancel(0);
    }
    this._socket = null;
    this._pump = null;
    coUtils.Debug.reportMessage(_("Resources in TTY have been cleared."));

  },

  "[subscribe('@command/detach')]": 
  function detach()
  {
    var context, broker, path, data;

    context = {};
    broker = this._broker;

    this.sendMessage("command/backup", context);

    path = broker.runtime_path + "/persist/" + broker.request_id + ".txt";
    data = JSON.stringify(context);
    coUtils.IO.writeToFile(path, data);
  },

  "[subscribe('sequence/osc/97')]":
  function osc97(ttyname) 
  {
    this._ttyname = ttyname;
  },

  onSocketAccepted: function onSocketAccepted(serv, transport) 
  {
    var broker, istream, ostream, message,
        scriptable_input_stream, pump;

    broker = this._broker;

    istream = transport.openInputStream(0, 1024, 1);
    ostream = transport.openOutputStream(0, 1024, 1);

    message = [broker.command, broker.term]
      .map(function(value) coUtils.Text.base64encode(value))
      .join(" ")

    ostream.write(message, message.length);

    scriptable_input_stream = Components
      .classes["@mozilla.org/scriptableinputstream;1"]
      .createInstance(Components.interfaces.nsIScriptableInputStream);
    scriptable_input_stream.init(istream);

    pump = Components
      .classes["@mozilla.org/network/input-stream-pump;1"]
      .createInstance(Components.interfaces.nsIInputStreamPump);
    pump.init(istream, -1, -1, 0, 0, false);
    pump.asyncRead(this, null);
    this._pump = pump;
    this._input = scriptable_input_stream;
  },

  /**
   * nsIServerSocketListener::onStopListening
   *
   * This method is called when the listening socket stops for some reason.
   * The server socket is effectively dead after this notification.
   *
   * @param a_serv
   *        The server socket.
   * @param a_satus
   *        The reason why the server socket stopped listening.  If the
   *        server socket was manually closed, then this value will be
   *        NS_BINDING_ABORTED.
   */
  onStopListening: function onStopListening(a_serv, a_status) 
  {
  },

// nsIRequestObserver implementation.
  /**
   * Called to signify the beginning of an asynchronous request.
   *
   * @param aRequest request being observed
   * @param aContext user defined context
   *
   * An exception thrown from onStartRequest has the side-effect of
   * causing the request to be canceled.
   */
  onStartRequest: function onStartRequest(request, context)
  {
  },

  /**
   * Called to signify the end of an asynchronous request.  This
   * call is always preceded by a call to onStartRequest.
   *
   * @param request being observed
   * @param context user defined context
   * @param status reason for stopping (NS_OK if completed successfully)
   *
   * An exception thrown from onStopRequest is generally ignored.
   */
  onStopRequest: function onStopRequest(request, context, status)
  {
  },

  onDataAvailable: 
  function onDataAvailable(request, context, input, offset, count) 
  {
    var data;

    data = this._input.readBytes(count);
    this._input.close();
    this._input = null;
    var [control_port, pid, ttyname, termattr] = data.split(":");
    this.sendMessage("event/termattr-changed", termattr);
    this._pid = Number(pid);
    if (control_port) {
      this.sendMessage("event/control-socket-ready", Number(control_port));
    } else {
      coUtils.Debug.reportError(_("Failed to connect to ttydriver."));
    }
  },

  /** @property Retrieve "pid" property value from TTY driver. */
  get pid() 
  {
    return this._pid;
  },

  /** @property Retrieve "name" property value from TTY driver. */
  get name() 
  {
    return this._ttyname;
  },

}; // class SocketTeletypeService

/**
 * @fn main
 * @brief Module entry point.
 * @param {Broker} broker The Broker object.
 */
function main(broker) 
{
  new IOManager(broker);
  new Controller(broker);
  new ExternalDriver(broker);
  new SocketTeletypeService(broker);
}


