/* -*- Mode: JAVASCRIPT; tab-width: 2; indent-tabs-mode: nil; c-basic-offset: 2 -*-
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
 * @class ProcessManager
 *
 */
var ProcessManager = new Class().extends(Plugin);
ProcessManager.definition = {

  id: "process_manager",

  /** plugin information */
  getInfo: function getInfo()
  {
    return {
      name: _("Process Manager"),
      version: "0.1",
      description: _("Manage suspended processes.")
    };
  },

  "[persistable, watchable] enabled_when_startup": true,

  /** Installs itself.
   *  @param {InstallContext} context A InstallContext object.
   */
  "[install]":
  function install(context)
  {
  },

  /** Uninstalls itself.
   *  @param {InstallContext} context A InstallContext object.
   */
  "[uninstall]":
  function uninstall(context)
  {
  },

  /** Checks if the process is running.
   *  It runs the command "kill -0 <pid>" and checks return value... if it
   *  failed, the process is not available.
   *  @param {Number} pid the process ID to be checked.
   *  @return {Boolean} boolean value whether the specified process is
   *                    available.
   */
  processIsAvailable: function processIsAvailable(pid)
  {
    if ("WINNT" === coUtils.Runtime.os) {
      return true;
    }
    return 0 === this.sendSignal(0, pid);
  },

  /** Sends a signal to specified process. it runs "kill" command.
   *  @param {Number} signal value to be sent.
   *  @param {Number} pid the process ID to be checked.
   *  @return {Number} a return value of kill command.
   */
  sendSignal: function sendSignal(signal, pid)
  {
    var runtime_path,
        args,
        runtime,
        process;

    if ("number" !== typeof signal || "number" !== typeof pid) {
      throw coUtils.Debug.Exception(
        _("sendSignal: Invalid arguments are detected. [%s, %s]"),
        signal, pid);
    }

    if ("WINNT" === coUtils.Runtime.os) {
      runtime_path = coUtils.Runtime.getCygwinRoot() + "\\bin\\run.exe";
      args = [ "kill", "-wait", "-" + signal, String(pid) ];
    } else { // Darwin, Linux or FreeBSD
      runtime_path = "/bin/kill";
      args = [ "-" + signal, String(pid) ];
    }

    // create new localfile object.
    runtime = coUtils.Components.createLocalFile(runtime_path);

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

    return process.exitValue;
  },
};

/**
 * @fn main
 * @brief Module entry point
 * @param {Desktop} desktop The Desktop object.
 */
function main(desktop)
{
  new ProcessManager(desktop);
}

// EOF
