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
 *
 * @class AsciiDecoder
 *
 */
var AsciiDecoder = new Class().extends(Plugin);
AsciiDecoder.definition = {

  id: "ascii_decoder",

  get scheme()
  {
    return "ascii";
  },

  getInfo: function getInfo()
  {
    return {
      name: _("ASCII Decoder"),
      version: "0.1",
      description: _("Decoder for ISO 646-US(ASCII).")
    };
  },

  "[persistable] enabled_when_startup": true,

  "[persistable] displacement": 0x3f,

  /** Installs itself. 
   *  @param {InstallContext} context A InstallContext object.
   */
  "[install]":
  function install(context) 
  {
  },

  /** uninstalls itself. 
   */
  "[uninstall]":
  function uninstall() 
  {
  },

  "[subscribe('get/decoders'), pnp]":
  function getDecoders() 
  {
    return {
      charset: this.scheme,
      converter: this,
      title: this.scheme,
    };
  },

  activate: function activate() 
  {
  },

  decode: function decode(scanner) 
  {
    return this._generate(scanner);
  },

  _generate: function _generate(scanner) 
  {
    var c;

    while (!scanner.isEnd) {
      c = scanner.current();
      if (c < 0x20) {     // controll code
        break;
      } else if (c < 0x80) { // ascii range.
        yield c;
      } else {
        yield this.displacement;
      }
      scanner.moveNext();
    }
  },

}; // clas AsciiDecoder

/**
 * @fn main
 * @brief Module entry point.
 * @param {Broker} broker The Broker object.
 */
function main(broker) 
{
  new AsciiDecoder(broker);
}

// EOF
