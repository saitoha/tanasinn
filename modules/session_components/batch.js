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
 *  @class BatchLoader
 */
var BatchLoader = new Class().extends(Plugin);
BatchLoader.definition = {

  id: "batch_loader",

  /** plugin information */
  getInfo: function getInfo()
  {
    return {
      name: _("Batch Loader"),
      version: "0.1",
      description: _("Provides command batch loader.")
    };
  },

  "[persistable] enabled_when_startup": true,

  _element: null,

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

  /** load batch files from the search path */
  "[command('import', ['batch']), _('load batchs file from the search path.'), pnp]":
  function loadBatchCommand(name)
  {
    var file = coUtils.File.getFileLeafFromVirtualPath(
          coUtils.Runtime.getBatchDirectory());

    file.append(name);

    if (!file.exists()) {
      return {
        success: false,
        message: coUtils.Text.format(
          _("Specified batch module '%s' is not found."), name),
      };
    }
    return this.sourceCommand(file.path);
  },

  /** load batch commands from a file */
  "[subscribe('command/source'), command('source', ['file']), _('load and evaluate batch file.'), pnp]":
  function sourceCommand(arguments_string)
  {
    var path = arguments_string.replace(/^\s*|\s*$/g, ""),
        home,
        file,
        broker = this._broker;

    if ("$" !== path.charAt(0) && !coUtils.File.isAbsolutePath(path)) {
      if ("WINNT" === coUtils.Runtime.os) {
        path = broker.cygwin_root
             + coUtils.File.getPathDelimiter()
             + path.replace(/\//g, "\\");
      } else {
        home = coUtils.File.getFileLeafFromVirtualPath("$Home");
        path = home.path + coUtils.File.getPathDelimiter() + path;
      }
    }

    file = coUtils.File.getFileLeafFromVirtualPath(path);
    if (file && file.exists()) {
      try {

        this.sendMessage(
          "command/eval-source",
          coUtils.IO.readFromFile(path, "utf-8"));

      } catch (e) {
        coUtils.Debug.reportError(e);
      }
    }
    return {
      success: true,
      message: _("Source file was loaded successfully."),
    };
  },

  /** evaluate source data as command batches */
  "[subscribe('command/eval-source'), enabled]":
  function evalSource(source)
  {
    source.split(/[\n\r]+/).forEach(
      function each(command)
      {
        if (!/^\s*$|^s*#/.test(command)) {
          this.sendMessage("command/eval-commandline", command);
        }
      }, this);
  },


  "[subscribe('@command/focus'), enabled]":
  function onFirstFocus()
  {
    // load rc file.
    var path = coUtils.Runtime.getResourceFilePath();

    this.sendMessage("command/source", path);
  },

  /**
   * @command execcgi
   *
   */
  "[command('execcgi', ['cgi']), subscribe('command/execute-cgi'), enabled]":
  function execCGI(arguments_string)
  {
    var path = coUtils.Runtime.getRuntimePath()
             + "/cgi-bin/"
             + arguments_string.replace(/^\s+|\s+$/, ""),
        executable_path;
        os = coUtils.Runtime.os,
        runtime,
        external_process,
        borker = this._broker;

    if ("WINNT" === os) {
      executable_path = broker.cygwin_root + "\\bin\\run.exe";
    } else {
      executable_path = "/bin/sh";
    }

    // create new localfile object.
    runtime = coUtils.Components.createLocalFile(executable_path);
    if (!runtime.exists() || !runtime.isExecutable()) {
      return false;
    }

    // create new process object.
    external_process = coUtils.Components.createProcessFromFile(runtime);
    path = coUtils.File.getFileLeafFromVirtualPath(path).path;

    if ("WINNT" === coUtils.Runtime.os) { // Windows
      args = [
        "/bin/sh", "-wait", "-l", "-c",
        coUtils.Text.format(
          "\"$(cygpath '%s')\" > /tmp/tanasinn_tmp", path)
      ];
    } else { // Darwin, Linux
      args = [
        "-c",
        path + " > /tmp/tanasinn_tmp"
      ];
    }
    external_process.run(true, args, args.length);

    this.sendMessage("command/source", "/tmp/tanasinn_tmp");

    return true;
  },

  /** test */
  "[test]":
  function()
  {
    var enabled = this.enabled;

    try {
      this.enabled = false;
      this.enabled = true;
      this.enabled = false;
    } finally {
      this.enabled = enabled;
    }
  },


} // class BatchLoader

/**
 * @fn main
 * @brief Module entry point.
 * @param {Broker} broker The Broker object.
 */
function main(broker)
{
  new BatchLoader(broker);
}

// EOF
