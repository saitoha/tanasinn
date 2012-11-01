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
 * @concept ControllerConcept
 */
var ControllerConcept = new Concept();
ControllerConcept.definition = {

  id: "Controller",

// message concept
  "<@event/broker-stopping> :: Undefined":
  _("Close Control channel and stop communication with TTY device."),

// signature concept
  "post :: String -> Undefined":
  _("Posts a command message asynchronously."),

}; // ControllerConcept



/**
 * @class Controller
 */
var Controller = new Class().extends(Plugin)
                            .depends("screen")
                            .requires("Controller");
Controller.definition = {

  id: "tty_controller",

  getInfo: function getInfo()
  {
    return {
      name: _("TTY Controler"),
      version: "0.1",
      description: _("Manage TTY control channel.")
    };
  },

  "[persistable] enabled_when_startup": true,

  "[persistable] beacon_interval": 2000,

  _screen: null,
  _input: null,
  _output: null,

  /** Installs itself. 
   *  @param {InstallContext} context A InstallContext object.
   */
  "[install]":
  function install(context)
  {
    this._screen = context["screen"];
  },

  /** Uninstalls itself.
   */
  "[uninstall]":
  function uninstall()
  {
    this._screen = null;
    this._input = null;
    this._output = null;
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
  "[subscribe('@event/broker-stopping'), type('Undefined'), pnp]":
  function stop() 
  {
    this.post("disconnect\n");

    if (null !== this._input) {
      this._input.close();
      this._input = null;
    }

    if (null !== this._output) {
      this._output.close();
      this._output = null;
    }

    if (null !== this._pump) {
      this._pump.cancel(0);
      this._pump = null;
    }

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
    var width = coUtils.Text.base64encode(size.column),
        height = coUtils.Text.base64encode(size.row),
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

  "[subscribe('event/{control & io}-socket-ready'), pnp]":
  function connect(control_port, io_port) 
  {
    var self = this,
        timer;

    this._start(control_port);

    timer = coUtils.Timer.setInterval(
      function timerProc()
      {
        if (self.post) {
          self.post("beacon\n");
        } else {
          timer.cancel();
          self = null;
          timer = null;
        }
      }, self.beacon_interval);

    this._send_initial_data(io_port);
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
    coUtils.Debug.reportMessage(
      _("Controller::onStopRequest called. status: %s."), status);
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
    var data = this._input.readBytes(count),
        command_list = data.split(/[\n\r]/),
        command,
        argv,
        operation, 
        arg,
        screen,
        output,
        answer,
        reply;

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
  _get_sessiondb_path: function _get_sessiondb_path()
  {
    var virtual_path = coUtils.Runtime.getRuntimePath() + "/sessions.txt",
        sessiondb_path = coUtils.File
          .getFileLeafFromVirtualPath(virtual_path).path;

    if ("WINNT" === coUtils.Runtime.os) {
      sessiondb_path 
        = sessiondb_path
          .replace(/\\/g, "/")
          .replace(
            /^([a-zA-Z]):/, 
            function()
            {
              return "/cygdrive/" + arguments[1].toLowerCase();
            })
    }

    return sessiondb_path;

  },  

  _send_initial_data: function _send_initial_data(io_port)
  {
    var sessiondb_path = this._get_sessiondb_path(),
        message = io_port + " "
                + this._broker.request_id + " "
                + coUtils.Text.base64encode(sessiondb_path);

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
    var transport = Components
          .classes["@mozilla.org/network/socket-transport-service;1"]
          .getService(Components.interfaces.nsISocketTransportService)
          .createTransport(null, 0, "127.0.0.1", control_port, null),
        istream = transport.openInputStream(0, 128, 1),
        ostream = transport.openOutputStream(0, 128, 1),
        scriptable_stream = coUtils.Components.createScriptableInputStream(istream),
        pump = coUtils.Components.createStreamPump(istream, this);

    this._input = scriptable_stream;
    this._output = ostream;
    this._pump = pump;
  },


}; // Controller


/**
 * @fn main
 * @brief Module entry point.
 * @param {Broker} broker The Broker object.
 */
function main(broker) 
{
  new Controller(broker);
}

// EOF
