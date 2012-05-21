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
 * @class ForwardInputIterator
 */ 
let ForwardInputIterator = new Class();
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
 *  @class Base64Copy
 *  @brief Makes it enable to copy selected region by pressing short cut key.
 */
let Base64Copy = new Class().extends(Plugin)
                            .depends("decoder");
Base64Copy.definition = {

  get id()
    "base64copy",

  get info()
    <Plugin>
        <name>{_("Base64 Copy")}</name>
        <description>{
          _("Accept base64 encoded data and store it to clipboard.")
        }</description>
        <version>0.1</version>
    </Plugin>,

  "[persistable] enabled_when_startup": true,

  /** Installs itself. */
  "[install]": 
  function install(session) 
  {
    this.copy.enabled = true;
  },

  /** Uninstalls itself. */
  "[uninstall]": 
  function uninstall(session) 
  {
    this.copy.enabled = false;
  },

  /** Get selected text and put it to clipboard.  */
  "[subscribe('sequence/osc/52'), _('Copy selected text.')]": 
  function copy(command) 
  {
    var [place, encoded_data] = command.split(";");
    var data = coUtils.Text.base64decode(encoded_data);
    var buffer = [];
    var sanitized_text;
    var clipboard_helper = Components
      .classes["@mozilla.org/widget/clipboardhelper;1"]
      .getService(Components.interfaces.nsIClipboardHelper);
    var status_message;
    var i, c;

    var scanner = new ForwardInputIterator(data);
    var decoder = this.dependency["decoder"];

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
      buffer.push(c);
    }

    sanitized_text = String.fromCharCode.apply(String, buffer);
    clipboard_helper.copyString(sanitized_text);
    status_message = coUtils.Text.format(
      _("Copied text to clipboard: %s"), text);

    let broker = this._broker;
    broker.notify("command/report-status-message", status_message);
  },

};

/**
 * @fn main
 * @brief Module entry point.
 * @param {Broker} broker The Broker object.
 */
function main(broker) 
{
  new Base64Copy(broker);
}


