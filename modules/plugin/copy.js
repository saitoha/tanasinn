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
 *  @class Copy
 *  @brief Makes it enable to copy selected region by pressing short cut key.
 */
let Copy = new Class().extends(Plugin);
Copy.definition = {

  get id()
    "copy",

  get info()
    <TanasinnPlugin>
        <name>Copy</name>
        <description>{
          _("Makes it enable to copy selected text by context menu or pressing short cut key.")
        }</description>
        <version>0.1</version>
    </TanasinnPlugin>,

  _screen: null,
  _selection: null,

  /** post-constructor */
  "[subscribe('@initialized/{screen & selection}'), enabled]":
  function onLoad(screen, selection) 
  {
    this._screen = screen;
    this._selection = selection;
    this.enabled = this.enabled_when_startup;
  },

  /** Installs itself. */
  install: function install(session) 
  {
    this.copy.enabled = true;
    this.onContextMenuEntriesRequested.enabled = true;
  },

  /** Uninstalls itself. */
  uninstall: function uninstall(session) 
  {
    this.copy.enabled = false;
    this.onContextMenuEntriesRequested.enabled = false;
  },

  "[subscribe('get/contextmenu-entries')]":
  function onContextMenuEntriesRequested() 
  {
    let range = this._selection.getRange();
    return range && {
        tagName: "menuitem",
        label: _("Copy Selected Text"), 
        listener: {
          type: "command", 
          context: this,
          handler: function() this.copy()
        }
      };
  },

  /** Get selected text and put it to clipboard.  */
  "[command('copy'), key('meta + c', 'ctrl + shift + c'), _('Copy selected text.')] copy": 
  function copy(info) 
  {
    // get selection range from "selection plugin"
    let range = this._selection.getRange();
    if (range) {
      // and pass it to "screen". "screen" returns selected text.
      let {start, end, is_rectangle} = range;
      let text = this._screen.getTextInRange(start, end, is_rectangle);
      const clipboardHelper = Components
        .classes["@mozilla.org/widget/clipboardhelper;1"]
        .getService(Components.interfaces.nsIClipboardHelper);
      clipboardHelper.copyString(text);
      let statusMessage = coUtils.Text.format(
        _("Copied text to clipboard: %s"), text);

      let session = this._broker;
      session.notify("command/report-status-message", statusMessage);
    }
  }
};

/**
 * @fn main
 * @brief Module entry point.
 * @param {Desktop} desktop The Desktop object.
 */
function main(desktop) 
{
  desktop.subscribe(
    "initialized/session", 
    function(session) new Copy(session));
}


