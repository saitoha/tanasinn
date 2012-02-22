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
 *  @class BatchLoader
 */
let BatchLoader = new Class().extends(Plugin);
BatchLoader.definition = {

  get id()
    "batch_loader",

  get info()
    <module>
        <name>{_("Batch Loader")}</name>
        <description>{
          _("Provides command batch loader.")
        }</description>
        <version>0.1</version>
    </module>,

  _element: null,
 
  /** installs itself. 
   *  @param {Session} session A session object.
   */
  "[subscribe('install/batch_loader'), enabled]":
  function install(session) 
  {
    this.loadBatchCommand.enabled = true;
    this.sourceCommand.enabled = true;
  },

  /** Uninstalls itself.
   *  @param {Session} session A session object.
   */
  "[subscribe('uninstall/batch_loader'), enabled]":
  function uninstall(session) 
  {
    this.loadBatchCommand.enabled = false;
    this.sourceCommand.enabled = false;
  },

  "[command('import', ['batch']), _('load batch file from search path.')]":
  function loadBatchCommand(name) 
  {
    let session = this._broker;
    let file = coUtils.File.getFileLeafFromVirtualPath(session.batch_directory);
    file.append(name);
    if (!file.exists()) {
      return {
        success: false,
        message: coUtils.Text.format(
          _("Specified batch module '%s' is not found."), name),
      }
    }
    return this.sourceCommand(file.path);
  },

  "[subscribe('command/source'), command('source', ['file']), _('load and evaluate batch file.')]":
  function sourceCommand(arguments_string)
  {
    let path = arguments_string.replace(/^\s*|\s*$/g, "");
    if ("$" != path.charAt(0) && !coUtils.File.isAbsolutePath(path)) {
      if ("WINNT" == coUtils.Runtime.os) {
        let session = this._broker;
        let cygwin_root = session.uniget("get/cygwin-root");
        path = cygwin_root + coUtils.File.getPathDelimiter() + path;
      } else {
        let home = coUtils.File.getFileLeafFromVirtualPath("$Home");
        path = home.path + coUtils.File.getPathDelimiter() + path;
      }
    }
    let file = coUtils.File.getFileLeafFromVirtualPath(path);
    if (file && file.exists()) {
      try {
        let session = this._broker;
        let content = coUtils.IO.readFromFile(path, "utf-8");
        content.split(/[\n\r]+/).forEach(function(command) {
          if (!/^\s*$/.test(command)) {
            session.notify("command/eval-commandline", command);
          }
        });
      } catch (e) {
        coUtils.Debug.reportError(e);
      }
    }
    return {
      success: true,
      message: _("Source file was loaded successfully."),
    };
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


