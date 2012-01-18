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
 * @class Controller
 */
let Controller = new Class().extends(Component);
Controller.definition = {

  get id()
    "tty-controller",

  // shell settings
  "[persistable] command": "login -pfq $USER", // login command (login, bash, screen, ...etc)
  "[persistable] term": "xterm",     // default "TERM" environment

  _screen: null,
  _input: null,
  _output: null,

  /** constructor */
  "[subscribe('@initialized/screen'), enabled]":
  function onLoad(screen)
  {
    this._screen = screen;
    let session = this._broker;
    session.notify(<>initialized/{this.id}</>, this);
  },

  /** Starts TCP client socket, and listen it asynchronously.
   */
  start: function start(control_port) 
  {
    let transport = Components
      .classes["@mozilla.org/network/socket-transport-service;1"]
      .getService(Components.interfaces.nsISocketTransportService)
      .createTransport(null, 0, "127.0.0.1", control_port, null);
    let istream = transport.openInputStream(0, 1024, 1);
    let ostream = transport.openOutputStream(0, 1024, 1);
    let scriptable_input_stream = Components
      .classes["@mozilla.org/scriptableinputstream;1"]
      .createInstance(Components.interfaces.nsIScriptableInputStream);
    scriptable_input_stream.init(istream);

    this._input = scriptable_input_stream;
    this._output = ostream;

    let pump = Components
      .classes["@mozilla.org/network/input-stream-pump;1"]
      .createInstance(Components.interfaces.nsIInputStreamPump);
    pump.init(istream, -1, -1, 0, 0, false);
    pump.asyncRead(this, scriptable_input_stream);
  },

  /** Posts a command message asynchronously. 
   * @param {String} command command message string for external program. 
   */
  post: function post(command) 
  {
    this._output.write(command, command.length);
  },

  /** Close Control channel and stop communication with TTY device.
   */
  "[subscribe('@event/session-stopping'), enabled]":
  function stop() 
  {
    this.post("disconnect\n");
    this._input.close();
    this._output.close();
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
    let session = this._broker;
    coUtils.Debug.reportMessage(
      _("Controller::onStopRequest called. status: %s."), status);
    try {
      session.stop();
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
    let data = context.readBytes(count);
    let command_list = data.split(/[\n\r]/);
    command_list.pop();
    try {
      do {
        let command = command_list.shift();
        let argv = command.split(" ");
        let operation = argv.shift();
        if ("request" == operation) {
          let arg = coUtils.Text.base64decode(argv.shift());
          let screen = this._screen;
          let output = this._output;
          if ("column" == arg) {
            let answer = coUtils.Text.base64encode(screen.width)
            let reply = coUtils.Text.format("answer %s\n", answer);
            output.write(reply, reply.length);
          } else if ("rows" == arg) {
            let answer = coUtils.Text.base64encode(screen.height)
            let reply = coUtils.Text.format("answer %s\n", answer);
            output.write(reply, reply.length);
          }
        } else {
          coUtils.Debug.reportError(_("Unknown command: [%s]."), command);
        }
      } while (command_list.length)
    } catch (e) { 
      coUtils.Debug.reportError(e)
    }
  }
}

/**
 * @class IOManager
 */
let IOManager = new Class().extends(Component);
IOManager.definition = {

  get id()
    "tty-iomanager",

  _input: null,
  _output: null,

  "[persistable] outgoing_buffer_size": 1024 * 4,
  "[persistable] incoming_buffer_size": 1024 * 4,

  /** 
   * initialize it with Session object.
   * @param {Session} session
   */
  "[subscribe('@event/session-started'), enabled]":
  function onLoad(session) 
  {
    let socket = Components
      .classes["@mozilla.org/network/server-socket;1"]
      .createInstance(Components.interfaces.nsIServerSocket);
    socket.init(/* port */ -1, /* loop back */ true, /* connection count */ 1);
    socket.asyncListen(this);
    this._port = socket.port;
    session.notify(<>initialized/{this.id}</>, this);
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
  send: function send(data) 
  {
    this._output.write(data, data.length);
  },

  /** Close I/O channel and stop communication with TTY device.
   */
  "[subscribe('@event/session-stopping'), enabled]":
  function stop() 
  {
    this._input.close();
    this._output.close();
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
    try {
      coUtils.Debug.reportMessage(
        _("Connected to ttydriver. port: %d"), 
        serv.port);
      let ostream = transport.openOutputStream(0, this.incoming_buffer_size, 1);
      let istream = transport.openInputStream(0, this.outgoing_buffer_size, 1);
      coUtils.Debug.reportMessage(_("Started to observe incoming data."));

      // handle given stream as binary stream (null characters are allowed).
      let binary_stream = Components
        .classes["@mozilla.org/binaryinputstream;1"]
        .createInstance(Components.interfaces.nsIBinaryInputStream);
      binary_stream.setInputStream(istream);

      // make "stream pump" object and listen it.
      let stream_pump = Components
        . classes["@mozilla.org/network/input-stream-pump;1"]
        .createInstance(Components.interfaces.nsIInputStreamPump);
      stream_pump.init(istream, -1, -1, 0, 0, false);
      stream_pump.asyncRead(this, binary_stream);

      this._input = binary_stream;
      this._output = ostream;
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
    let session = this._broker;
    coUtils.Debug.reportMessage(
      _("onStopRequest called. status: %s"), status);
    try {
      session.stop();
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
    let data = context.readBytes(count);
    let session = this._broker;
    session.notify("event/data-arrived", data);
  }
}

/**
 * @class ExternalDriver
 */
let ExternalDriver = new Class().extends(Component);
ExternalDriver.definition = {

  get id()
    "externaldriver",

  "[persistable] cygwin_root": "C:\\cygwin",

  _external_process: null,

  /*
   * @param {String} script_path  The first argument which is passed to runtime,
   *                             expected to be script file path. 
   */
  "[persistable] script_path": "modules/ttydriver.py",

  /** post-constructor 
   * @param {Session} session A session object.
   */
  "[subscribe('@event/session-started'), enabled]":
  function onLoad(session) 
  {
    let runtime_path;
    let os = coUtils.Runtime.os;
    if ("WINNT" == os) {
      runtime_path = String(<>{this.cygwin_root}\bin\run.exe</>);
    } else if ("Darwin" == os) {
      runtime_path = "/usr/bin/pythonw";
    } else /* Linux */ {
      runtime_path = "/usr/bin/python";
    }
    // create new localfile object.
    let runtime = Components
      .classes["@mozilla.org/file/local;1"]
      .createInstance(Components.interfaces.nsILocalFile);
    runtime.initWithPath(runtime_path);

    // create new process object.
    let external_process = Components
      .classes["@mozilla.org/process/util;1"]
      .createInstance(Components.interfaces.nsIProcess);
    external_process.init(runtime);
    this._external_process = external_process;
    session.notify("initialized/externaldriver", this);
  },

  /** Kill target process. */
  kill: function kill(pid) 
  {
    let runtime_path;
    let args;
    if ("WINNT" != coUtils.Runtime.os) {
      let external_process = this._external_process;
      //if (external_process.isRunning)
      //  external_process.kill();
      runtime_path = "/bin/kill";
      args = [ "-9", String(pid) ];
    } else { // Darwin, Linux or FreeBSD
      runtime_path = String(<>{this.cygwin_root}\bin\run.exe</>);
      args = [ "/bin/kill", "-9", String(pid) ];
    }
    // create new localfile object.
    let runtime = Components
      .classes["@mozilla.org/file/local;1"]
      .createInstance(Components.interfaces.nsILocalFile);
    runtime.initWithPath(runtime_path);

    // create new process object.
    let process = Components
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
    return 0 == process.exitValue;
  },

  /** Checks if the process is running. */
  processIsAvailable: function processIsAvailable(pid) 
  {
    let runtime_path;
    let args;
    if ("WINNT" == coUtils.Runtime.os) {
      runtime_path = String(<>{this.cygwin_root}\bin\run.exe</>);
      args = [ "/bin/kill", "-0", String(pid) ];
    } else { // Darwin, Linux or FreeBSD
      runtime_path = "/bin/kill";
      args = [ "-0", String(pid) ];
    }

    // create new localfile object.
    let runtime = Components
      .classes["@mozilla.org/file/local;1"]
      .createInstance(Components.interfaces.nsILocalFile);
    runtime.initWithPath(runtime_path);

    // create new process object.
    let process = Components
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
    return 0 == process.exitValue;
  },

  /**
   * Run external driver with arguments 
   * which represents <I/O port No.> <Control port No.>.
   *
   * @param {Number} io_channel_port 
   * @param {Number} control_channel_port 
   *
   */
  start: function start(connection_port) 
  {
    // get script absolute path from abstract path.
    let script_absolute_path
      = coUtils.File
        .getFileLeafFromAbstractPath(this.script_path)
        .path;

    let args;
    if ("WINNT" == coUtils.Runtime.os) { // Windows
      args = [
        "/bin/sh", "-wait", "-l", "-c",
        coUtils.Text.format(
          "exec python \"$(cygpath '%s')\" %d", 
          script_absolute_path,
          connection_port)
      ];
    } else { // Darwin, Linux
      args = [ script_absolute_path, connection_port ];
    }
    this._external_process.runAsync(args, args.length, this, false);
    coUtils.Debug.reportMessage(
      _("TTY Server started. arguments: [%s]."), args.join(", "));
  },

  observe: function observe()
  {
//    if (this.success) {
//      return;
//    }
    let session = this._broker;
    session.stop();
  },

  /** Kills handling process if it was alive. */
  "[subscribe('@event/session-stopping'), enabled]":
  function stop() 
  {
    try {
      let external_process = this._external_process;
      //if (external_process.isRunning)
      //  external_process.kill();
    } catch (e) {
      coUtils.Debug.reportWarning(e);
    }
  },
};

/**
 *  @class SocketTeletypeService
 *  @brief Listen mouse input events and send them to TTY device.
 */
let SocketTeletypeService = new Class().extends(Component);
SocketTeletypeService.definition = {

  get id()
    "tty",

  _io_manager: null,
  _controller: null,

  "[subscribe('@initialized/{tty-iomanager & tty-controller & externaldriver}'), enabled]":
  function onLoad(io_manager, controller, external_driver) 
  {
    this._io_manager = io_manager;
    this._controller = controller;
    this._external_driver = external_driver;

    this.osc97.enabled = true;

    let session = this._broker;
    if (0 == session.command.indexOf("&")) {
      let request_id = session.command.substr(1);
      let record = coUtils.Sessions.get(request_id);
      this.connect(Number(record.control_port));
      this._pid = Number(record.pid);
      coUtils.Sessions.remove(request_id);
      coUtils.Sessions.update();
      let backup_data_path = String(<>$Home/.tanasinn/persist/{request_id}.txt</>);
      if (coUtils.File.exists(backup_data_path)) {
        let context = eval(coUtils.IO.readFromFile(backup_data_path));
        session.notify("command/restore", context);
        let file = coUtils.File.getFileLeafFromAbstractPath(backup_data_path);
        if (file.exists()) {
          file.remove(false)
        }
      }
    } else {
      let socket = Components
        .classes["@mozilla.org/network/server-socket;1"]
        .createInstance(Components.interfaces.nsIServerSocket);
  
      // initialize server socket.
      socket.init(/* port */ -1, /* loop back */ true, /* connection count */ 1);
      socket.asyncListen(this);
  
      coUtils.Timer.setTimeout(function() { // ensure that "runAsync" is called after "asyncListen".
        external_driver.start(socket.port); // nsIProcess::runAsync.

      }, 100);
    }
  },

  "[subscribe('@command/kill'), enabled]": 
  function kill()
  {
    let external_driver = this._external_driver;
    external_driver.kill(this._pid);
  },

  "[subscribe('@command/detach'), enabled]": 
  function detach()
  {
    let context = {};
    let session = this._broker;
    session.notify("command/backup", context);
    let path = String(<>$Home/.tanasinn/persist/{session.request_id}.txt</>);
    coUtils.IO.writeToFile(path, context.toSource());
  },

  "[subscribe('sequence/osc/97')]":
  function osc97(ttyname) 
  {
    this._ttyname = ttyname;
  },

  connect: function connect(control_port) 
  {
    let session = this._broker;
    this._controller.start(control_port);
    let sessiondb_path = coUtils.File
      .getFileLeafFromAbstractPath("$Home/.tanasinn/sessions.txt").path;

    let os = coUtils.Runtime.os;
    if ("WINNT" == os) {
      sessiondb_path 
        = sessiondb_path
          .replace(/\\/g, "/")
          .replace(
            /^([a-zA-Z]):/, 
            function() String(<>/cygdrive/{arguments[1].toLowerCase()}</>))
          ;
    }

    let message = [
      this._io_manager.port, 
      session.request_id,
      coUtils.Text.base64encode(sessiondb_path),
    ].join(" ");
    this._controller.post(message);
    this.send.enabled = true;
    let timer = coUtils.Timer.setInterval(function() {
      this._controller.post("beacon\n") 
    }, 5000, this);
    let id = new Date().getTime().toString();
    session.subscribe("event/session-stopping", function() {
      session.unsubscribe(id);
      timer.cancel();
    }, this, id);
    session.notify("initialized/tty", this);
  },

  onSocketAccepted: function onSocketAccepted(serv, transport) 
  {
    let session = this._broker;
    let istream = transport.openInputStream(0, 1024, 1);
    let ostream = transport.openOutputStream(0, 1024, 1);
    let message = [session.command, session.term]
      .map(function(value) coUtils.Text.base64encode(value))
      .join(" ")
    ostream.write(message, message.length);
    let scriptable_input_stream = Components
      .classes["@mozilla.org/scriptableinputstream;1"]
      .createInstance(Components.interfaces.nsIScriptableInputStream);
    scriptable_input_stream.init(istream);
    let pump = Components
      .classes["@mozilla.org/network/input-stream-pump;1"]
      .createInstance(Components.interfaces.nsIInputStreamPump);
    pump.init(istream, -1, -1, 0, 0, false);
    pump.asyncRead(this, scriptable_input_stream);
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
    let data = context.readBytes(count);
    context.close()
    let [control_port, pid, ttyname] = data.split(":");
    this._pid = Number(pid);
    if (control_port) {
      this.connect(Number(control_port));
    } else {
      coUtils.Debug.reportError(_("Failed to connect to ttydriver."));
    }
  },

  "[subscribe('@command/stop-tty'), enabled]":
  function stop() 
  {
  },
         
  /**
   * Changes screen resolution of TTY device.
   * @param width new horizontal resolution of TTY device.
   * @param height new vertical resolution of TTY device.
   */
  "[subscribe('event/screen-size-changed'), enabled]": 
  function resize(size) 
  {
    let {column, row} = size; 
    let width = coUtils.Text.base64encode(column);
    let height = coUtils.Text.base64encode(row);
    let command = coUtils.Text.format("resize %s %s\n", width, height);
    this._controller.post(command);
  },

  /** Send character sequence data to TTY device.
   * @param {String} data Character seqence data for sending to TTY device.
   */
  "[subscribe('command/send-to-tty')]":
  function send(data) 
  {
    this._io_manager.send(data);
  },

  /** flow controll 
   * Suspend/Resume output.
   * @param {Boolean} flag true: resume output. false: suspend output.
   */
  "[subscribe('command/flow-control'), enabled]":
  function flowControl(flag) 
  {
    this._controller.post(flag ? "xon\n": "xoff\n");
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
};

/**
 * @fn main
 * @brief Module entry point.
 * @param {Desktop} desktop The Desktop object.
 */
function main(desktop) 
{
  desktop.subscribe(
    "@initialized/broker", 
    function(session) 
    {
      new IOManager(session);
      new Controller(session);
      new SocketTeletypeService(session);
      new ExternalDriver(session);
    });
}


