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
 *  @class Paste
 */
var Paste = new Class().extends(Plugin);
Paste.definition = {

  get id()
    "paste",

  get info()
    <plugin>
        <name>{_("Paste")}</name>
        <version>0.1</version>
        <description>{
          _("Paste a string from clipboard.")
        }</description>
    </plugin>,

  "[persistable] enabled_when_startup": true,

  _bracketed_paste_mode: false,

  /** Installs itself. 
   *  @param {Broker} broker A Broker object.
   */
  "[install]":
  function install(broker) 
  {
  },

  /** Uninstalls itself. 
   *  @param {Broker} broker A Broker object.
   */
  "[uninstall]":
  function uninstall(broker) 
  {
  },
  
  /** Context menu handler. */
  "[subscribe('get/contextmenu-entries'), pnp]": 
  function onContextMenu() 
  {
    return {
      tagName: "menuitem",
      label: _("paste"), 
      listener: {
        type: "command", 
        context: this,
        handler: this.paste,
      }
    };
  },

  /** paste the text from clipboard. */
  "[command('paste'), nmap('<M-v>', '<C-S-V>'), _('Paste from clipboard.'), pnp]": 
  function paste() 
  {
    var clipboard = Components
          .classes["@mozilla.org/widget/clipboard;1"]
          .getService(Components.interfaces.nsIClipboard),
        trans = Components
          .classes["@mozilla.org/widget/transferable;1"]
          .createInstance(Components.interfaces.nsITransferable),
        str = {},
        str_length = {},
        text;

    trans.addDataFlavor("text/unicode");

    clipboard.getData(trans, clipboard.kGlobalClipboard);
	  trans.getTransferData("text/unicode", str, str_length);

    if (str.value && str_length.value) {
      text = str.value
        .QueryInterface(Components.interfaces.nsISupportsString)
        .data
        .substring(0, str_length.value / 2);

      // sanitize text.
      text = text.replace(/[\x00-\x08\x0a-\x0c\x0e-\x1f]/g, "");

      // Encodes the text message and send it to the tty device.
      if (true === this._bracketed_paste_mode) {
        // add bracket sequences.
        this.sendMessage("command/send-sequence/csi");
        this.sendMessage("command/send-to-tty", "200~");
        this.sendMessage("command/input-text", text);
        this.sendMessage("command/send-sequence/csi");
        this.sendMessage("command/send-to-tty", "201~");
      } else {
        this.sendMessage("command/input-text", text);
      }
    }
    return true; /* prevent default action */
  },

  "[subscribe('command/paste'), pnp]":
  function pasteFromClipboard(mode) 
  {
    this.paste();
  },

  /** Set/Reset bracketed paste mode. */
  "[subscribe('command/change-bracketed-paste-mode'), pnp]":
  function onBracketedPasteModeChanged(mode) 
  {
    this._bracketed_paste_mode = mode;
  },

}; // class Paste

/**
 * @fn main
 * @brief Module entry point.
 * @param {Broker} broker The Broker object.
 */
function main(broker) 
{
  new Paste(broker);
}

// EOF
