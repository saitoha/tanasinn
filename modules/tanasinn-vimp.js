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

void function() {

let liberator = window.liberator;
let commands = liberator.modules.commands;
let completion = liberator.modules.completion;
let mappings = liberator.modules.mappings;
let modes = liberator.modules.modes;

function getTanasinnProcess() 
{
  let process_class = Components
    .classes["@zuse.jp/tanasinn/process;1"]
  if (!process_class) {
    let file = [
      Components.stack.filename.split(" -> ").pop().split("?").shift(),
      "/../../tanasinn/modules/common/process.js"
    ].join("");
    Components
      .classes["@mozilla.org/moz/jssubscript-loader;1"]
      .getService(Components.interfaces.mozIJSSubScriptLoader)
      .loadSubScript(file);
    process_class = Components
      .classes["@zuse.jp/tanasinn/process;1"]
  }
  let process = process_class
    .getService(Components.interfaces.nsISupports)
    .wrappedJSObject;
  return process;
}

commands.add(["tanasinnlaunch", "tlaunch"], 
  "Show tanasinn's Launcher.", 
  function (args) 
  { 
    let process = getTanasinnProcess();
    let desktop = process.getDesktopFromWindow(window);
    desktop.post("command/show-launcher");
  }
);

commands.add(["tanasinncommand", "tcommand"], 
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

getTanasinnProcess().notify("event/new-window-detected", window);

} ();

