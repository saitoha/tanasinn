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

/**
 * @class Contextmenu
 */
let Contextmenu = new Class().extends(Plugin);
Contextmenu.definition = {

  get id()
    "contextmenu",

  get info()
    <plugin>
        <name>Context Menu</name>
        <description>{
          _("Provides context menu interface which emerges when we right-clicks the screen.")
        }</description>
        <version>0.1</version>
    </plugin>,

  get template() 
    let (ui_manager = this._ui_manager)
    let (entries = this._entries)
    {
      tagName: "menupopup",
      parentNode: "#coterminal_center_area",
      childNodes: entries,
      listener: {
        type: "popuphidden", 
        handler: function onpopuphidden(event) 
        {
          if (this.isEqualNode(event.target)) {
            ui_manager.refocus();
            this.parentNode.removeChild(this);
          }
        },
      } ,
    },

  _entries: null,
  _ui_manager: null,

  /** post-constructor */
  "[subscribe('initialized/chrome'), enabled]": 
  function onLoad(ui_manager) 
  {
    this._ui_manager = ui_manager;
    this.enabled = this.enabled_when_startup;
  },

  /** Installs itself.
   *  @param {Session} session A Session object.
   */
  install: function install(session) 
  {
    // register DOM listener.
    session.notify(
      "command/add-domlistener", 
      {
        target: session.root_element,
        type: "contextmenu",
        id: "contextmenu.install",
        context: this,
        handler: function oncontextmenu(event) 
        {
          this.show(event.screenX, event.screenY);
        }
      });
  },

  /** Uninstalls itself.
   *  @param {Session} session A Session object.
   */
  uninstall: function uninstall(session) 
  {
    // unregister DOM listener.
    session.notify(
      "command/remove-domlistener", 
      "contextmenu.install");
  },

  show: function show(x, y) 
  {
    let session = this._broker;
    let entries = session
      .notify("get/contextmenu-entries")
      .filter(function(entry) entry);
    if (0 == entries.length)
      return;
    this._entries = entries;
    let [ [contextmenu] ] = session.notify("command/construct-ui", this.template);
    contextmenu.openPopupAtScreen(x, y, true);
  },
};

/**
 * @fn main
 * @brief Module entry point.
 * @param {Process} process The Process object.
 */
function main(process) 
{
  process.subscribe(
    "initialized/session", 
    function(session) new Contextmenu(session));
}



