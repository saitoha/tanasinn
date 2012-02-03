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
          _("Provides context menu interface which ",
            "emerges when we right-clicks the screen.")
        }</description>
        <version>0.1</version>
    </plugin>,

  get template() 
    let (ui_manager = this._ui_manager)
    let (entries = this._entries)
    {
      tagName: "menupopup",
      parentNode: "#tanasinn_center_area",
      id: "tanasinn_contextmenu",
      childNodes: entries,
      listener: {
        type: "popuphidden", 
        handler: let (session = this._broker) function onpopuphidden(event) 
        {
          if (this.isEqualNode(event.target)) {
            session.notify("command/focus");
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
    this.show.enabled = true;
  },

  /** Uninstalls itself.
   *  @param {Session} session A Session object.
   */
  uninstall: function uninstall(session) 
  {
    // unregister DOM listener.
    this.show.enabled = false;
  },

  "[listen('contextmenu', '#tanasinn_content')]":
  function show(event) 
  {
    let {screenX, screenY} = event;
    let session = this._broker;
    let entries = session
      .notify("get/contextmenu-entries")
      .filter(function(entry) entry);
    if (0 == entries.length) {
      return;
    }
    this._entries = entries;
    let {tanasinn_contextmenu} 
      = session.uniget("command/construct-chrome", this.template);
    tanasinn_contextmenu.openPopupAtScreen(screenX, screenY, true);
  },
};

/**
 * @fn main
 * @brief Module entry point.
 * @param {Desktop} desktop The Desktop object.
 */
function main(desktop) 
{
  desktop.subscribe(
    "@initialized/broker", 
    function(session) 
    {
      new Contextmenu(session);
    });
}



