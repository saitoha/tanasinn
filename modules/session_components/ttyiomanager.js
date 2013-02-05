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
var IOManager = new Class().extends(Plugin)
                           .depends("tty_controller")
                           .depends("parser")
                           .requires("IOManager");
IOManager.definition = {

  id: "tty_iomanager",

  "[persistable] enabled_when_startup": true,
  "[persistable] outgoing_buffer_size": 1024 * 64,
  "[persistable] incoming_buffer_size": 1024 * 1,

  _input: null,
  _output: null,
  _socket: null,
  _parser: null,

  /** Installs itself.
   *  @param {InstallContext} context A InstallContext object.
   */
  "[install]":
  function install(context)
  {
    var socket = coUtils.Components.createLoopbackServerSocket(this);

    this._socket = socket;
    this._port = socket.port;
    this._parser = context["parser"];

    this.sendMessage("event/io-socket-ready", socket.port);
  },

  /** Uninstalls itself.
   */
  "[uninstall]":
  function uninstall()
  {
    this._socket = null;
    this._port = null;
    this._parser = null;
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
  "[subscribe('command/send-to-tty'), type('String -> Undefined'), pnp]":
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
  "[subscribe('@event/broker-stopping'), type('Undefined'), pnp]":
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
    //  this.sendMessage("command/stop");
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
        this._parser.drive(data);
    //this.sendMessage("event/data-arrived", data);
    //  }, 30, this);
  },
};


/**
 * @fn main
 * @brief Module entry point.
 * @param {Broker} broker The Broker object.
 */
function main(broker)
{
  new IOManager(broker);
}

// EOF
