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
 * The Original Code is coTerminal
 *
 * The Initial Developer of the Original Code is
 * Hayaki Saito.
 * Portions created by the Initial Developer are Copyright (C) 2010 - 2011
 * the Initial Developer. All Rights Reserved.
 *
 * ***** END LICENSE BLOCK ***** */

void function coterminal_initialize(window, parent, install_path) 
{
  with (window) {
    //    <box id="coterminal-window" 
    //        style="position: fixed; top: 20px; left: 0px;">
    //    </box>
    try {
      let box = document.createElement("box");
      box.id = "coterminal-container";
      box.style.position = "fixed";
      box.style.top = "20px";
      box.style.left = "0px";
      document.documentElement.appendChild(box);
      let file = [
        Components.stack.filename.split(" -> ").pop().split("?").shift(),
        "/../common/process.js?" + new Date().getTime()
      ].join("");
      Components
        .classes["@mozilla.org/moz/jssubscript-loader;1"]
        .getService(Components.interfaces.mozIJSSubScriptLoader)
        .loadSubScript(file);
      let main_command_set = document.documentElement.appendChild(
          document.createElement("commandset"));
      let command = document.createElement("command");
      command.id = "CreateTerminal";
      main_command_set.appendChild(command);
      command.setAttribute("oncommand", <>
        Components.classes['@zuse.jp/coterminal/process;1']
          .getService(Components.interfaces.nsISupports)
          .wrappedJSObject
          .start(
            document.getElementById("coterminal-container"),  // parent
            null,  // command
            null,  // TERM environment
            null,  // size 
            ["modules/core", 
             "modules/standard", 
             "modules/plugin"]);
        </>.toString());
      // Create keyset element.
      let main_key_set = document.documentElement.appendChild(
          document.createElement("keyset"));
      let key = document.createElement("key");
      main_key_set.appendChild(key);
      key.id = "key_CreateTerminal";
      key.setAttribute("key", "E");
      key.setAttribute("modifiers", "meta");
      key.setAttribute("command", "CreateTerminal");
      
      // Get tools menu element.
      let menu_tools_popup = document.getElementById("menu_ToolsPopup");
      if (menu_tools_popup) { // if Firefox etc...
        let menuitem = document.createElement("menuitem");
        menu_tools_popup.appendChild(menuitem);
        menuitem.setAttribute("label", "Create Terminal Window");
        menuitem.setAttribute("key", "key_CreateTerminal");
        menuitem.setAttribute("command", "CreateTerminal");
      }
      let process = Components
        .classes["@zuse.jp/coterminal/process;1"]
        .getService(Components.interfaces.nsISupports)
        .wrappedJSObject;
    } catch(e) {
      let message = <>{e.fileName}({e.lineNumber}):{e.toString()}</>.toString();
      Components.reportError(message);
      window.setTimeout(function() window.alert(message), 1000);
    }
  }

} (window, window.document.getElementById("coterminal-window"));

