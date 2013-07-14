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
 * Portions created by the Initial Developer are Copyright (C) 2010 - 2013
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

"use strict";

/**
 * @class ExternalDriver
 */
var ExternalDriver = new Class().extends(Plugin);
ExternalDriver.definition = {

  id: "externaldriver",

  getInfo: function getInfo()
  {
    return {
      name: _("External Process Driver"),
      version: "0.1",
      description: _("Manage external process.")
    };
  },

  "[persistable] enabled_when_startup": true,

  /*
   * @param {String} script_path The first argument which is passed to runtime,
   *                             expected to be script file path.
   */
  "[persistable] script_path": "modules/ttydriver.py",

  _external_process: null,

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
  },

  /** Kill target process. */
  kill: function kill(pid)
  {
    var kill_path,
        args,
        external_process,
        runtime,
        process,
        broker = this._broker;

    if ("WINNT" === coUtils.Runtime.os) {
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
  "[subscribe('command/start-ttydriver-process'), pnp]":
  function start(connection_port)
  {
    var executable_path,
        runtime,
        external_process,
        script_absolute_path,
        args,
        broker = this._broker,
        cygwin_root = broker.cygwin_root,
        python_path = broker.python_path;

    if ("WINNT" === coUtils.Runtime.os) {
      executable_path = cygwin_root + "\\bin\\run.exe";
    } else {
      executable_path = python_path;
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
  },

  /** Kills handling process if it was alive. */
  "[subscribe('@event/broker-stopping'), pnp]":
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

    coUtils.Debug.reportMessage(
      _("Resources in ExternalDriver have been cleared."));
  },

// nsIObserver
  observe: function observe(subject, topic, data)
  {
    this._broker.stop();
  },

  /**
   * Provides runtime type discovery.
   * @param aIID the IID of the requested interface.
   * @return the resulting interface pointer.
   */
  QueryInterface: function QueryInterface(a_IID)
  {
    if (!a_IID.equals(Components.interafaces.nsIObserver)
     && !a_IID.equals(Components.interafaces.nsISupports)) {
      throw Components.results.NS_ERROR_NOT_IMPLEMENTED;
    }
    return this;
  },

  /** test */
  "[test]":
  function()
  {
    var enabled = this.enabled;

    try {
//      this.enabled = false;
//      this.enabled = true;
//      this.enabled = false;
    } finally {
//      this.enabled = enabled;
    }
  },


}; // ExternalDriver

/**
 * @fn main
 * @brief Module entry point.
 * @param {Broker} broker The Broker object.
 */
function main(broker)
{
  new ExternalDriver(broker);
}

// EOF
