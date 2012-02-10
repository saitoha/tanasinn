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
 * The Initial Developer of the Original Code is * Hayaki Saito.
 * Portions created by the Initial Developer are Copyright (C) 2010 - 2011
 * the Initial Developer. All Rights Reserved.
 *
 * ***** END LICENSE BLOCK ***** */

// PLUGIN_INFO//{{{
var PLUGIN_INFO =
<VimperatorPlugin>
    <name>{NAME}</name>
    <description>Provides some commands for driving tanasinn.</description>
    <detail><![CDATA[

let g:tanasinneditorcommand:
    e.g.)
      let g:tanasinneditorcommand="vim '%'"
    Set the external text editor command running on tanasinn window. 
    The editor must be console editor.
    If this variable is empty or undefined, default procedure 
    will be called when <C-i> is pressed in Insert and TextArea.

let g:tanasinnviewsourcecommand:
    e.g.)
      let g:tanasinnviewsourcecommand="vim +e '%'"

     ]]></detail>
</VimperatorPlugin>;
//}}}

void function() {

let liberator = window.liberator;
let commands = liberator.modules.commands;
let completion = liberator.modules.completion;
let mappings = liberator.modules.mappings;
let modes = liberator.modules.modes;

/**
 * @fn getTanasinnProcess
 */
function getTanasinnProcess() 
{
  let contractID = "@zuse.jp/tanasinn/process;1";
  let process_class = Components
    .classes[contractID]
  if (!process_class) {
    let current_file = Components.stack
      .filename
      .split(" -> ").pop()
      .split("?").shift();
    let file = current_file + "/../../tanasinn/modules/common/process.js?" + new Date().getTime();
    Components
      .classes["@mozilla.org/moz/jssubscript-loader;1"]
      .getService(Components.interfaces.mozIJSSubScriptLoader)
      .loadSubScript(file);
    process_class = Components.classes[contractID]
  }
  let process = process_class
    .getService(Components.interfaces.nsISupports)
    .wrappedJSObject;
  return process;
}
let process = getTanasinnProcess();

function getDesktop() 
{
  let desktops = process.notify("get/desktop-from-window", window);
  if (desktops) {
    let [desktop] = desktops.filter(function(desktop) desktop);
    if (desktop) {
      return desktop;
    }
  }
  let desktop = process.uniget("event/new-window-detected", window);
  return desktop;
}
getDesktop();

/**
 * @command tanasinnlaunch 
 */
commands.addUserCommand(["tanasinnlaunch", "tla[unch]"], 
  "Show tanasinn's Launcher.", 
  function (args) 
  { 
    getDesktop().post("command/show-launcher");
  }
);

/**
 * @command tanasinncommand 
 */
commands.addUserCommand(["tanasinncommand", "tco[mmand]"], 
  "Run a command on tanasinn.", 
  function (args) 
  { 
    getDesktop().post("command/start-session", args.string);
  },
  { 
    argCount: "?",
    completer: function (context) completion.shellCommand(context),
    bang: true,
    literal: 0,
  } 
);

/**
 * Hooks "<C-i>" and "gF" key mappings and runs "g:tanasinneditorcommand" 
 * or "g:tanasinnviewsourcecommand", instead of default "editor" option.
 */
let editor = liberator.modules.editor;
editor.editFileExternally = let (default_func = editor.editFileExternally) function (path) 
{
  let editor_command = liberator.globalVariables.tanasinneditorcommand;
  let viewsource_command = liberator.globalVariables.tanasinnviewsourcecommand;
  let desktop = getDesktop();
  if (/^[a-z]+:\/\//.test(path)) { // when path is url spec. (path is expected to be escaped.)
    if (!viewsource_command) {
      default_func.apply(liberator.modules.editor, arguments);
    } else {
      desktop.notify(
        "command/start-session", 
        viewsource_command.replace(/%/g, path));
    };
  } else { // when path is native one.
    if (!editor_command) {
      default_func.apply(liberator.modules.editor, arguments);
    } else {
      let complete = false;
      desktop.subscribe("@initialized/broker", function(session) {
        session.subscribe("@event/session-stopping", function(session) {
          complete = true;
        }, this);
      }, this);
      desktop.notify("command/start-session", editor_command.replace(/%/g, path));
      let thread = components.classes["@mozilla.org/thread-manager;1"]
        .getservice(components.interfaces.nsithreadmanager)
        .currentthread;
      while (!complete) {
        thread.processnextevent(true);
      }
    };
  }
};

} ();

