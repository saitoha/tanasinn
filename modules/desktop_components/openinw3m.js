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
  "[persistable] text_browser_command": "w3m '%s'",

  _menupopup: null,

  /** Installs itself.
   * @param {InstallContext} context A InstallContext object.
   */
  "[install]":
  function install(context)
  {
    var broker = this._broker,
        id = "tanasinn_open_in_w3m",
        contextmenu;

    if (!broker.window.document.getElementById(id)) {
      contextmenu = broker.window.document
              .getElementById("contentAreaContextMenu");

      this._menupopup = this.request(
        "command/construct-chrome",
        {
          parentNode: contextmenu,
          tagName: "menuitem",
          id: id,
          label: _("Open in text browser"),
          listener: {
            type: "command",
            id: id,
            context: this,
            handler: function oncommand()
            {
              this.openInW3m();
            },
          },
        })[id];
    }
  },

  /** Uninstalls itself.
   */
  "[uninstall]":
  function uninstall()
  {
    this._menupopup = null;
    this.sendMessage("command/remove-domlistener", this.id);
  },

  /** open linkURL under the cursor with w3m */
  openInW3m: function openInW3m()
  {
    var win = this._broker._window,
        node = win.document.popupNode,
        url = win.gContextMenu.linkURL
            || win.gBrowser.currentURI.spec,
        template = this.text_browser_command,
        command = coUtils.Text.format(template, url);

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

// EOF
