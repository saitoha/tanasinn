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
 * @class AppMenu
 */
let AppMenu = new Class().extends(Component);
AppMenu.definition = {

  get id()
    "appmenu",

  "[persistable] command_id": "command_CreateTerminal",
  "[persistable] menu_id": "menu_CreateTerminal",
  "[persistable] menu_label": "create new terminal",
  "[persistable] shortcut_id": "key_CreateTerminal",
  "[persistable] shortcut_key": ",",
  "[persistable] shortcut_modifiers": "control",

  initialize: function initialize(desktop)
  {
    let window = desktop.window;
    this._createCommand(window);
    this._createMenu(window);
    this._createShortcut(window);
  },

  _createCommand: function _createCommand(window)
  {
    with (window) {
      let main_command_set = document.documentElement.appendChild(
          document.createElement("commandset"));
      let command = document.createElement("command");
      command.id = this.command_id;
      main_command_set.appendChild(command);
      command.setAttribute("oncommand", <>
        Components.classes['@zuse.jp/tanasinn/process;1']
          .getService(Components.interfaces.nsISupports)
          .wrappedJSObject
          .start(
            document.documentElement,
            null,  // command
            null,  // TERM environment
            null,  // size 
            ["modules/core", 
             "modules/plugin"]);
        </>.toString());
    } // with window
  },

  _createMenu: function _createNenu(window) 
  {
    with (window) {
      // Get tools menu element.
      let menu_tools_popup = document.getElementById("menu_ToolsPopup");
      if (menu_tools_popup) { // if Firefox etc...
        let menuitem = document.createElement("menuitem");
        menu_tools_popup.appendChild(menuitem);
        menuitem.setAttribute("label", _(this.menu_label));
        menuitem.setAttribute("key", this.shortcut_id);
        menuitem.setAttribute("command", this.command_id);
      }
    } // with(window)
  },

  _createShortcut: function _createShortcut(window) 
  {
    with (window) {
      let main_key_set = document.documentElement.appendChild(
          document.createElement("keyset"));
      let key = document.createElement("key");
      main_key_set.appendChild(key);
      key.id = this.shortcut_id;
      key.setAttribute("key", this.shortcut_key); 
      key.setAttribute("modifiers", this.shortcut_modifiers);
      key.setAttribute("command", this.command_id);
    } // with(window)
  },

}; 

function main(process)
{
  process.subscribe(
    "initialized/desktop", 
    function(desktop) new AppMenu(desktop));
}

