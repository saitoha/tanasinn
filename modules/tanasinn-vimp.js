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
    <description>character hint mode.</description>
    <author mail="user@zuse.jp" homepage="http://zuse.jp/tanasinn/usermanual.html">hogelog</author>
    <version>0.3.1</version>
    <minVersion>3.1</minVersion>
    <maxVersion>3.1.1</maxVersion>
    <updateURL>http://svn.coderepos.org/share/lang/javascript/vimperator-plugins/trunk/char-hints-mod2.js</updateURL>
    <detail><![CDATA[
== Usage ==
== SETTING ==
let g:tanasinneditor:
    set editor used by char-hint.
    e.g.)
      let g:tanasinneditor="vim"
    Set the external text editor, running on tanasinn window. 
    The editor must be console editor.
    If this variable is empty or undefined, default procedure 
    will be called when <C-i> is pressed in Insert and TextArea.
== TODO ==

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
    let file = current_file + "/../../tanasinn/modules/common/process.js";
    Components
      .classes["@mozilla.org/moz/jssubscript-loader;1"]
      .getService(Components.interfaces.mozIJSSubScriptLoader)
      .loadSubScript(file);
    process_class = Components.classes[contractID]
    getTanasinnProcess().notify("event/new-window-detected", window);
  }
  let process = process_class
    .getService(Components.interfaces.nsISupports)
    .wrappedJSObject;
  return process;
}
let process = getTanasinnProcess();

/**
 * @command tanasinnlaunch 
 */
commands.add(["tanasinnlaunch", "tla[unch]"], 
  "Show tanasinn's Launcher.", 
  function (args) 
  { 
    let process = getTanasinnProcess();
    let desktop = process.getDesktopFromWindow(window);
    desktop.post("command/show-launcher");
  }
);

/**
 * @command tanasinncommand 
 */
commands.add(["tanasinncommand", "tco[mmand]"], 
  "Run a command on tanasinn.", 
  function (args) 
  { 
    let process = getTanasinnProcess();
    let desktop = process.getDesktopFromWindow(window);
    desktop.post("command/start-session", args.string);
  },
  { 
    argCount: "?",
    completer: function (context) completion.shellCommand(context),
    bang: true,
    literal: 0,
  } 
);

/**
 * Hooks "<C-i>" and "gF" key mappings and runs "g:tanasinneditor" 
 * instead of default "editor" option.
 */
let editor = liberator.modules.editor;
editor.editFileExternally = let (default_func = editor.editFileExternally) function (path) 
{
  let tanasinn_editor = liberator.globalVariables.tanasinneditor;
  let viewsource_command = liberator.globalVariables.tanasinnviewsourcecommand;

  if (/^[a-z]+:\/\//.test(path)) { // when path is url spec.
    if (!viewsource_command) {
      default_func.apply(liberator.modules.editor, arguments);
    } else {
      process.getDesktopFromWindow(window)
        .notify(
          "command/start-session", 
          viewsource_command.replace(/%/g, path));
    };
  } else { // when path is native one.
    if (!tanasinn_editor) {
      default_func.apply(liberator.modules.editor, arguments);
    } else {
      let complete = false;
      let desktop = process.getDesktopFromWindow(window);
      desktop.subscribe("@initialized/broker", function(session) {
        session.subscribe("@event/session-stopping", function(session) {
          complete = true;
        }, this);
      }, this);
      desktop.notify("command/start-session", String(<>{tanasinn_editor} "{path}"</>));
      let thread = Components.classes["@mozilla.org/thread-manager;1"]
        .getService(Components.interfaces.nsIThreadManager)
        .currentThread;
      while (!complete) {
        thread.processNextEvent(true);
      }
    };
  }
};

} ();

