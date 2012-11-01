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
   *  @param {InstallContext} context A InstallContext object.
   */
  "[install]":
  function install(context) 
  {
  },

  /** Uninstalls itself.
   */
  "[uninstall]":
  function uninstall()
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

      if (record) {
        this.sendMessage(
          "event/control-socket-ready",
          Number(record.control_port));

        this._pid = Number(record.pid);

        coUtils.Sessions.remove(this._broker, request_id);
        coUtils.Sessions.update();

        this.sendMessage("command/attach-session", request_id);
        return;
      }

    }
    this._socket = coUtils.Components.createLoopbackServerSocket(this);
  
    // nsIProcess::runAsync.
    this.sendMessage("command/start-ttydriver-process", this._socket.port); 
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
        runtime_path = this._broker.runtime_path,
        request_id = this._broker.request_id,
        path = runtime_path + "/persist/" + request_id + ".txt",
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
     && !a_IID.equals(Components.interafaces.nsIStreamListener)
     && !a_IID.equals(Components.interafaces.nsISupports)) {
      throw Components.results.NS_ERROR_NOT_IMPLEMENTED;
    }
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
  new SocketTeletypeService(broker);
}

// EOF
