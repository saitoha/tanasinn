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
 * @class ForwardInputIterator
 */
var ForwardInputIterator = new Class();
ForwardInputIterator.definition = {

  _value: null,
  _position: 0,

  /** Assign new string data. position is reset. */
  initialize: function initialize(value)
  {
    this._value = value;
    this._position = 0;
  },

  /** Returns single byte code point. */
  current: function current()
  {
    return this._value.charCodeAt(this._position);
  },

  /** Moves to next position. */
  moveNext: function moveNext()
  {
    ++this._position;
  },

  /** Returns whether scanner position is at end. */
  get isEnd()
  {
    return this._position >= this._value.length;
  },
};


/**
 *  @class Base64CopyPaste
 *  @brief Makes it enable to copy selected region by pressing short cut key.
 */
var Base64CopyPaste = new Class().extends(Plugin)
                                 .depends("decoder");
Base64CopyPaste.definition = {

  id: "base64copypaste",

  getInfo: function getInfo()
  {
    return {
      name: _("Base64 Copy/Paste"),
      version: "0.1",
      description: _("Accesss local clipboard and send/recieve text data in base64 encoded format.")
    };
  },

  "[persistable] enabled_when_startup": true,
  "[persistable] enable_get_access": false,
  "[persistable] enable_set_access": true,

  _decoder: null,

  /** Installs itself.
   *  @param {InstallContext} context A InstallContext object.
   */
  "[install]":
  function install(context)
  {
    this._decoder = context["decoder"];
  },

  /** Uninstalls itself.
   */
  "[uninstall]":
  function uninstall()
  {
    this._decoder = null;
  },

  /** Get selected text and put it to clipboard.  */
  "[subscribe('sequence/osc/52'), _('Copy/Paste selected text.'), pnp]":
  function osc52(data)
  {
    var encoded_data,
        scanner,
        buffer,
        text;
    if (/^[0-7psc]*;\?$/.test(data)) {
      if (this.enable_get_access) {
        text = coUtils.Clipboard.get();
        text = "52;c;?;" + coUtils.Text.base64encode(text);
        this.sendMessage("command/send-sequence/osc", text);
        this._showPasteMessage(text);
      }
    } else {
      if (this.enable_set_access) {
        encoded_data = this._parseOSC52Data(data),
        scanner = this._getScanner(encoded_data),
        buffer = [c for (c in this._decode(scanner))],
        text = coUtils.Text.safeConvertFromArray(buffer);

        coUtils.Clipboard.set(text);
        this._showCopyMessage(text);
      }
    }
  },

  /** parse OSC 52 text data stream. */
  _parseOSC52Data: function _parseOSC52Data(data)
  {
    var position = data.indexOf(";");

    if (-1 === position) {
      throw coUtils.Debug.Exception(_("Cannot parse OSC 52 data."));
    }
    if (!/^[0-9psc]*;/.test(data)) {
      throw coUtils.Debug.Exception(_("Cannot parse OSC 52 data."));
    }

    ++position;

    return data.substr(position);
  },

  _setToClipboard: function _setToClipboard(text)
  {
    var clipboard_helper

    clipboard_helper = Components
      .classes["@mozilla.org/widget/clipboardhelper;1"]
      .getService(Components.interfaces.nsIClipboardHelper);
    clipboard_helper.copyString(text);
  },

  _getScanner: function _getScanner(text)
  {
    var data = coUtils.Text.base64decode(text);
    return new ForwardInputIterator(data);
  },

  /** send message text to status bar. */
  _showCopyMessage: function _showCopyMessage(text)
  {
    var status_message = coUtils.Text.format(
      _("Copied text to clipboard: %s"),
      text);

    this.sendMessage(
      "command/report-status-message",
      status_message);
  },

  /** send message text to status bar. */
  _showPasteMessage: function _showPasteMessage(text)
  {
    var status_message = coUtils.Text.format(
      _("Send text data from clipboard: %s"),
      text);

    this.sendMessage(
      "command/report-status-message",
      status_message);
  },

  /** decode and sanitize encoded byte stream.  */
  _decode: function _decode(scanner)
  {
    var decoder = this._decoder,
        c;

    while (true) {

      for (c in decoder.decode(scanner)) {

        switch (c) {
          case 0x00: // nul
          case 0x01: // soh
          case 0x02: // stx
          case 0x03: // etx
          case 0x04: // eot
          case 0x05: // enq
          case 0x06: // ack
          case 0x07: // bel
          case 0x08: // bs
          //case 0x09: // ht
          //case 0x0a: // nl
          case 0x0b: // vt
          case 0x0c: // np
          //case 0x0d: // cr
          case 0x0e: // so
          case 0x0f: // si
          case 0x10: // dle
          case 0x11: // dc1
          case 0x12: // dc2
          case 0x13: // dc3
          case 0x14: // dc4
          case 0x15: // nak
          case 0x16: // syn
          case 0x17: // etb
          case 0x18: // can
          case 0x19: // em
          case 0x1a: // sub
          case 0x1b: // esc
          case 0x1c: // fs
          case 0x1d: // gs
          case 0x1e: // rs
          case 0x1f: // us
            continue;
        }
        yield c;
      }
      if (scanner.isEnd) {
        break;
      }
      scanner.moveNext();
    }
 },

}; // Base64CopyPaste

/**
 * @fn main
 * @brief Module entry point.
 * @param {Broker} broker The Broker object.
 */
function main(broker)
{
  new Base64CopyPaste(broker);
}

// EOF
