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

"use strict";

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
 * @concept IOManagerConcept
 */
var IOManagerConcept = new Concept();
IOManagerConcept.definition = {

  id: "IOManager",
  
// message concept
  "<@event/broker-stopping> :: Undefined":
  _("Close I/O channel and stop communication with TTY device."),

// signature concept
  "send :: String -> Undefined":
  _("Send character sequence data to TTY device."),

}; // IOManagerConcept


/**
 * @class IOManager
 */
var IOManager = new Class().extends(Component)
                           .requires("IOManager");
IOManager.definition = {

  id: "tty_iomanager",

  _input: null,
  _output: null,
  _socket: null,

  "[persistable] outgoing_buffer_size": 1024 * 32,
  "[persistable] incoming_buffer_size": 1024 * 1,

  /** 
   * initialize it with Session object.
   * @param {Session} broker
   */
  "[subscribe('@event/broker-started'), enabled]":
  function onLoad(broker) 
  {
    var socket = coUtils.Components.createLoopbackServerSocket(this);

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
      //this._output.flush();
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
    var ostream,
        istream,
        binary_stream,
        stream_pump;

    try {
      coUtils.Debug.reportMessage(
        _("Connected to ttydriver. port: %d"), 
        serv.port);
      ostream = transport.openOutputStream(0, this.incoming_buffer_size, 1);
      istream = transport.openInputStream(0, this.outgoing_buffer_size, 1);
      coUtils.Debug.reportMessage(_("Started to observe incoming data."));

      // handle given stream as binary stream (null characters are allowed).
      this._binary_stream = coUtils.Components.createBinaryInputStream(istream);

      // make "stream pump" object and listen it.
      this._stream_pump = coUtils.Components.createStreamPump(istream, this);

      this._input = this._binary_stream;
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
      this.sendMessage("command/stop");
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
    var data = this._input.readBytes(count);

    //coUtils.Timer.setTimeout(
    //  function timerProc()
    //  {
    this.sendMessage("event/data-arrived", data);
    //  }, 30, this);
  },
}

/**
 * @class ExternalDriver
 */
var ExternalDriver = new Class().extends(Component);
ExternalDriver.definition = {

  id: "externaldriver",

  _external_process: null,

  /*
   * @param {String} script_path The first argument which is passed to runtime,
   *                             expected to be script file path. 
   */
  "[persistable] script_path": "modules/ttydriver.py",

  /** Kill target process. */
  kill: function kill(pid) 
  {
    var kill_path,
        args,
        broker = this._broker,
        cygwin_root,
        external_process, 
        runtime,
        process;

    if ("WINNT" === coUtils.Runtime.os) {
      cygwin_root = broker.cygwin_root;
      kill_path = broker.cygwin_root + "\\bin\\run.exe";
      args = [ "/bin/kill", "-9", String(pid) ];
    } else { // Darwin, Linux or FreeBSD
      external_process = this._external_process;
      kill_path = "/bin/kill";
      args = [ "-9", String(pid) ];
    }
    // create new localfile object.
    runtime = coUtils.Components.createLocalFile(kill_path);

    // create new process object.
    process = coUtils.Components.createProcessFromFile(runtime);

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
    var broker = this._broker,
        executable_path,
        cygwin_root,
        runtime, 
        external_process,
        script_absolute_path,
        args,
        python_path;

    if ("WINNT" === coUtils.Runtime.os) {
      cygwin_root = broker.cygwin_root;
      executable_path = cygwin_root + "\\bin\\run.exe";
    } else {
      executable_path = this.request("get/python-path");
    }

    // create new localfile object.
    runtime = coUtils.Components.createLocalFile(executable_path);

    if (!runtime.exists() || !runtime.isExecutable()) {
      throw coUtils.Debug.Exeption(_("Could not launch python: file not found."));
    }

    // create new process object.
    external_process = coUtils.Components.createProcessFromFile(runtime);
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

    this.sendMessage("initialized/externaldriver", this);

  },

  observe: function observe(subject, topic, data)
  {
    this.sendMessage("command/stop");
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

  id: "tty",

  getInfo: function getInfo()
  {
    return {
      name: _("TTY"),
      version: "0.1",
      description: _("Drives a TTY device and control it.")
    };
  },

  "[persistable] enabled_when_startup": true,

  _socket: null,
  _pump: null,
  _settings: null,

  /** Installs itself.
   *  @param broker {Broker} A broker object.
   */
  "[install]":
  function install(broker) 
  {
  },

  /** Uninstalls itself.
   *  @param broker {Broker} A broker object.
   */
  "[uninstall]":
  function uninstall(broker)
  {
    if (this._socket) {
      this._socket.close();
    }
    if (this._pump) {
      this._pump.cancel(0);
    }
    this._socket = null;
    this._pump = null;
    this._settings = null;

    coUtils.Debug.reportMessage(_("Resources in TTY have been cleared."));
  },

  "[subscribe('@command/start-tty-service'), pnp]":
  function startService(settings)
  {
    var record,
        socket,
        request_id;

    this._settings = settings;

    if (0 === settings.command.indexOf("&")) {

      request_id = settings.command.substr(1);
      record = coUtils.Sessions.get(request_id);

      this.sendMessage(
        "event/control-socket-ready",
        Number(record.control_port));

      this._pid = Number(record.pid);

      coUtils.Sessions.remove(this._broker, request_id);
      coUtils.Sessions.update();

      this.sendMessage("command/attach-session", request_id);

    } else {

      this._socket = coUtils.Components.createLoopbackServerSocket(this);
  
      // nsIProcess::runAsync.
      this.sendMessage("command/start-ttydriver-process", this._socket.port); 
    }
  },
 
  /**
   * Attach to an existing session
   * @param {Number} request_id the ID of the session to attach to.
   */
  "[subscribe('@command/attach-session'), pnp]":
  function attachSession(request_id)
  {
    var backup_data_path = this._broker.runtime_path + "/persist/" + request_id + ".txt",
        context;

    if (coUtils.File.exists(backup_data_path)) {
      // resume 
      context = JSON.parse(coUtils.IO.readFromFile(backup_data_path, "utf-8"));
      this.sendMessage("command/restore", context);
      var file = coUtils.File.getFileLeafFromVirtualPath(backup_data_path);
      if (file.exists()) {
        file.remove(false)
      }
      this.onFirstFocus.enabled = true;
    }
  },

  "[subscribe('@command/focus')]": 
  function onFirstFocus()
  {
    this.sendMessage("command/draw", true);
  },

  "[subscribe('@command/detach'), pnp]": 
  function detach()
  {
    var context = {},
        path = this._broker.runtime_path + "/persist/" + this._broker.request_id + ".txt",
        data;

    this.sendMessage("command/backup", context);
    data = JSON.stringify(context);

    coUtils.IO.writeToFile(path, data);

    this.sendMessage("command/stop");
  },

  "[subscribe('sequence/osc/97'), pnp]":
  function osc97(ttyname) 
  {
    this._ttyname = ttyname;
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
  onSocketAccepted: function onSocketAccepted(serv, transport) 
  {
    var istream = transport.openInputStream(0, 1024, 1),
        ostream = transport.openOutputStream(0, 1024, 1),
        settings = this._settings,
        message = coUtils.Text.base64encode(settings.command) + " "
                + coUtils.Text.base64encode(settings.term) + " "
                + coUtils.Text.base64encode(settings.locale),
        scriptable_stream = coUtils.Components.createScriptableInputStream(istream),
        pump = coUtils.Components.createStreamPump(istream, this);

    ostream.write(message, message.length);


    this._pump = pump;
    this._input = scriptable_stream;
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

// nsIStreamListener
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
   * @param count number of bytes available in the stream
   *
   * NOTE: The aInputStream parameter must implement readSegments.
   *
   * An exception thrown from onDataAvailable has the side-effect of
   * causing the request to be canceled.
   */
  onDataAvailable: 
  function onDataAvailable(request, context, input, offset, count) 
  {
    var data = this._input.readBytes(count),
        args = data.split(":"),
        control_port = Number(args[0]),
        pid = Number(args[1]),
        ttyname = args[2],
        termattr = args[3];

    this._input.close();
    this._input = null;

    this.sendMessage("event/termattr-changed", termattr);
    this._pid = pid;

    if (control_port) {
      this.sendMessage("event/control-socket-ready", control_port);
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

  /**
   * Provides runtime type discovery.
   * @param aIID the IID of the requested interface.
   * @return the resulting interface pointer.
   */
  QueryInterface: function QueryInterface(a_IID)
  {
    if (!a_IID.equals(Components.interafaces.nsIRequestObserver) 
     && !a_IID.equals(Components.interafaces.nsIServerSocketListener)
     && !a_IID.equals(Components.interafaces.nsIServerSocketListener)
     && !a_IID.equals(Components.interafaces.nsIStreamListener)
     && !a_IID.equals(Components.interafaces.nsISupports))
      throw Components.results.NS_ERROR_NOT_IMPLEMENTED;
    return this;
  },

}; // class SocketTeletypeService

/**
 * @fn main
 * @brief Module entry point.
 * @param {Broker} broker The Broker object.
 */
function main(broker) 
{
  new ExternalDriver(broker);
  new SocketTeletypeService(broker);
}

// EOF
