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
 * @class OpenInW3m
 * @fn Context menu integration.
 */
var OpenInW3m = new Class().extends(Plugin);
OpenInW3m.definition = {

  id: "open-in-w3m",

  "[persistable] enabled_when_startup": true,

  /** Installs itself.
   * @param {InstallContext} context A InstallContext object.
   */
  "[install]":
  function install(context)
  {
    var broker = this._broker,
    dom = {
      menu: broker.window.document.getElementById("contentAreaContextMenu"),
      menuitem: broker.window.document.createElement("menuitem"),
      separator: broker.window.document.getElementById("context-sep-open"),
    };
    broker.window._tanasinn_w3m = this;
    dom.menuitem.setAttribute("id", "open-in-w3m");
    dom.menuitem.setAttribute("label", _("Open in w3m"));
    dom.menuitem.setAttribute("oncommand", "_tanasinn_w3m.openInW3m()");
    dom.menu.insertBefore(dom.menuitem, dom.separator);
    this._dom = dom;
    this._handler = function onPopupShowing()
    {
      dom.menuitem.hidden = broker.window.document.popupNode.onImage
                         || broker.window.document.popupNode.onLink;
    };
    dom.menu.addEventListener("popupshowing", this._handler);
  },

  /** Uninstalls itself.
   */
  "[uninstall]":
  function uninstall()
  {
    var dom = this._dom;
    if (dom.menuitem) {
      dom.menuitem.parentNode.removeChild(menuitem);
    }
    if (null !== this._handler) {
      dom.menu.removeEventListener("popupshowing", this._handler);
    }
    this._dom = null;
    this._tanasinn_w3m = null;
  },

  openInW3m: function openInW3m()
  {
    var window = this._broker._window,
        node = window.document.popupNode,
        url = window.gContextMenu.linkURL,
        command = coUtils.Text.format("w3m '%s'", url);
    this.sendMessage('command/start-session', command);
  },
}; // OpenInW3m

/**
 * @fn main
 * @brief Module entry point
 * @param {Desktop} desktop The Desktop object.
 */
function main(desktop)
{
  new OpenInW3m(desktop);
}
