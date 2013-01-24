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

"use strict";

/**
 *  @class Copy
 *  @brief Makes it enable to copy selected region by pressing short cut key.
 */
var Copy = new Class().extends(Plugin)
                      .depends("selection")
                      .depends("screen");
Copy.definition = {

  id: "copy",

  getInfo: function getInfo()
  {
    return {
      name: _("Copy"),
      version: "0.1",
      description: _("Makes it enable to copy selected text by context menu",
                     " or pressing short cut key.")
    };
  },

  "[persistable] enabled_when_startup": true,

  _selection: null,
  _screen: null,

  /** Installs itself. 
   *  @param {InstallContext} context A InstallContext object.
   */
  "[install]": 
  function install(context) 
  {
    this._selection = context["selection"];
    this._screen = context["screen"];
  },

  /** Uninstalls itself. 
   */
  "[uninstall]":
  function uninstall() 
  {
    this._selection = null;
    this._screen = null;
  },

  "[subscribe('get/contextmenu-entries'), pnp]":
  function onContextMenuEntriesRequested() 
  {
    var range = this._selection.getRange();

    return range && {
        tagName: "menuitem",
        label: _("Copy Selected Text"), 
        listener: {
          type: "command", 
          context: this,
          handler: function() 
          {
            return this.copyImpl(range);
          },
        }
      };
  },

  /** Get selected text and put it to clipboard.  */
  "[command('copy'), nmap('<M-c>', '<C-S-c>'), _('Copy selected text.'), pnp]": 
  function copy(info) 
  {
    // get selection range from "selection plugin"
    var range = this._selection.getRange();

    if (range) {
      this.copyImpl(range);
    }
    return true;
  },

  copyImpl: function copyImpl(range) 
  {
    var text,
        status_message,
        clipboard_helper,
        screen = this._screen;

    // and pass it to "screen". "screen" returns selected text.
    if (range.is_rectangle) {
      text = screen
        .getTextInRect(range.start, range.end)
        .replace(/[\x00\r]/g, "");
    } else {
      text = screen
        .getTextInRange(range.start, range.end)
        .replace(/[\x00\r]/g, "");
    }

    clipboard_helper = coUtils.Services.getClipboardHelper()
    clipboard_helper.copyString(text);

    status_message = coUtils.Text.format(
      _("Copied text to clipboard: %s"), text);

    this.sendMessage("command/report-status-message", status_message);
  },

};

/**
 * @fn main
 * @brief Module entry point.
 * @param {Broker} broker The Broker object.
 */
function main(broker) 
{
  new Copy(broker);
}

// EOF
