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
    /*
    let file = Components.stack
        .filename
        .split(" -> ").pop()
        .split("?").shift()
        .replace(/\/[^\/]+?\/[^\/]+$/, "/tanasinn/modules/initialize.js");
        */
    let file = [
      Components.stack.filename.split(" -> ").pop().split("?").shift(),
      "/../../tanasinn/modules/common/process.js"
    ].join("");
    Components
      .classes["@mozilla.org/moz/jssubscript-loader;1"]
      .getService(Components.interfaces.mozIJSSubScriptLoader)
      .loadSubScript(file, {window: window});
    process_class = Components
      .classes["@zuse.jp/tanasinn/process;1"]
  }
  let process = process_class
    .getService(Components.interfaces.nsISupports)
    .wrappedJSObject;
  return process;
}

commands.add(['tan[asinn]'], 
  "Run a terminal emurator into this browser.", 
  function (args) 
  { 
    let process = getTanasinnProcess();
    window.setTimeout(function() {
      let container = document.getElementById("tanasinn-container");
      let desktop = process.getDesktopFromWindow(window);
      desktop.start(
        document.documentElement,
        args.string,  // command
        null, // TERM
        null, // size
        ["modules/core", "modules/plugin"])
    }, 0);
  },
  { 
    argCount: "?",
    completer: function (context) completion.shellCommand(context),
    bang: true,
    literal: 0,
  } 
);

mappings.addUserMap([modes.NORMAL], ["!"],
  'Run commands in tanasinn',
   function () { commandline.open('', 'tanasinn ', modes.EX); }
);

} ();

/*
mappings.addUserMap([modes.NORMAL], [">"],
  'Run commands in tanasinn',
   function () {
     let process = getTanasinnProcess();
     window.setTimeout(function() {
       process.start(
         document.documentElement,
         null, // command 
         null, // TERM evnironment
         null, // size
         ["modules/core", "modules/plugin"])
     }, 0);
   }
);
/*
mappings.add(modes.getCharModes("i"),
  ["<C-S-i>"], "Edit text field with on external editor",
  function() 
  {
    let process = getTanasinnProcess();
    let scope = process.createNewScope();
    let file = Components
      .classes["@mozilla.org/file/directory_service;1"]
      .getService(Components.interfaces.nsIProperties)
      .get("TmpD", Components.interfaces.nsIFile);  
    file.append("suggestedName.tmp");  
    file.append(Date.now());
    //file.createUnique(Components.interfaces.nsIFile.NORMAL_FILE_TYPE, -1);  
    let textbox = liberator.focus;
    with (scope) {
      let path = "$TmpD/" + Date.now();
      coUtils.IO.writeToFile(path, textbox.value, function callback() {
        process.start(
            document.documentElement,
            "vim " + coUtils.File.getFileLeafFromAbstractPath(path).path, 
            null, // TERM environment
            null, // size
            ["modules/core", "modules/plugin"],
            function callback() 
            {
              let content = coUtils.IO.readFromFile(path, "UTF-8");
              textbox.value = content;
              textbox.focus();
            })
      });
    }
  });
*/
