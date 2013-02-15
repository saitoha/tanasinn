/**
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
 * Portions created by the Initial Developer are Copyright (C) 2010 - 2012
 * the Initial Developer. All Rights Reserved.
 *
 * ***** END LICENSE BLOCK ***** */

"use strict";

/**
 * @class OpenTanasinn
 * @fn Context menu integration.
 */
var OpenTanasinn = new Class().extends(Plugin);
OpenTanasinn.definition = {

  id: "open-tanasinn",

  "[persistable] enabled_when_startup": true,

  /** Installs itself.
   * @param {InstallContext} context A InstallContext object.
   */
  "[install]":
  function install(context)
  {
    var broker = this._broker,
        id = "open-tanasinn",
        dom = {
          menu: broker.window.document.getElementById("contentAreaContextMenu"),
          menuitem: broker.window.document.createElement("menuitem"),
          separator: broker.window.document.getElementById("page-menu-separator"),
        };

    broker.window._tanasinn_tanasinn = this;
    if (!broker.window.document.getElementById(id)) {
      dom.menuitem.setAttribute("id", id);
      dom.menuitem.setAttribute("label", _("Open tanasinn"));
      dom.menuitem.setAttribute("oncommand", "_tanasinn_tanasinn.openTanasinn()");
      dom.menu.insertBefore(dom.menuitem, dom.separator);
      this._dom = dom;
    }
  },

  /** Uninstalls itself.
   */
  "[uninstall]":
  function uninstall()
  {
    var dom = this._dom;
    if (dom) {
      if (dom.menuitem) {
        dom.menuitem.parentNode.removeChild(menuitem);
      }
      if (null !== this._handler) {
        dom.menu.removeEventListener("popupshowing", this._handler, false);
      }
      this._dom = null;
    }
    this._tanasinn_tanasinn = null;
  },

  openTanasinn: function openTanasinn()
  {
    this.sendMessage('command/start-session');
  },
}; // OpenTanasinn

/**
 * @fn main
 * @brief Module entry point
 * @param {Desktop} desktop The Desktop object.
 */
function main(desktop)
{
  new OpenTanasinn(desktop);
}

// EOF
