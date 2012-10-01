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
 *  @class BatchLoader
 */
var BatchLoader = new Class().extends(Plugin);
BatchLoader.definition = {

  id: "batch_loader",

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
 
  /** installs itself. 
   *  @param {Session} session A session object.
   */
  "[install]":
  function install(session) 
  {
  },

  /** Uninstalls itself.
   *  @param {Session} session A session object.
   */
  "[uninstall]":
  function uninstall(session) 
  {
  },

  "[command('import', ['batch']), _('load batch file from search path.'), pnp]":
  function loadBatchCommand(name) 
  {
    var broker = this._broker,
        file = coUtils.File.getFileLeafFromVirtualPath(
          broker.runtime_path + 
          "/" + 
          broker.batch_directory);

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

  "[subscribe('command/source'), command('source', ['file']), _('load and evaluate batch file.'), pnp]":
  function sourceCommand(arguments_string)
  {
    var path = arguments_string.replace(/^\s*|\s*$/g, ""),
        broker,
        cygwin_root,
        home,
        file;

    if ("$" !== path.charAt(0) && !coUtils.File.isAbsolutePath(path)) {
      if ("WINNT" === coUtils.Runtime.os) {
        broker = this._broker;
        cygwin_root = broker.cygwin_root;
        path = cygwin_root + coUtils.File.getPathDelimiter() + path.replace(/\//g, "\\");
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
    var broker = this._broker,
        path = broker.runtime_path + "/" + broker.rcfile;

    this.sendMessage("command/source", path);
  },

  /**
   * @command execcgi
   *
   */
  "[command('execcgi', ['cgi']), subscribe('command/execute-cgi'), enabled]":
  function execCGI(arguments_string) 
  {
    var broker = this._broker,
        path = broker.runtime_path
             + "/cgi-bin/"
             + arguments_string.replace(/^\s+|\s+$/, ""),
        executable_path;
        os = coUtils.Runtime.os,
        runtime,
        external_process;

    if ("WINNT" === os) {
      cygwin_root = broker.cygwin_root;
      executable_path = cygwin_root + "\\bin\\run.exe";
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
