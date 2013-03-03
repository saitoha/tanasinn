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
 * @class CP932Decoder
 *
 */
var CP932Decoder = new Class().extends(Plugin);
CP932Decoder.definition = {

  id: "cp932_decoder",

  get scheme()
  {
    return "cp932";
  },

  getInfo: function getInfo()
  {
    return {
      name: _("CP-932 Decoder"),
      version: "0.1",
      description: _("Decoder module for CP-932 character set.")
    };
  },

  "[persistable] enabled_when_startup": true,

  "[persistable] displacement": 0x3f, // ?

  _map: null,
  _offset: 0,

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
      title: "Shift-JIS decoder implemented in js",
    };
  },

  activate: function activate()
  {
    var resource_path = "modules/mappings/cp932.txt.js",
        json_content = coUtils.IO.readFromFile(resource_path),
        mapping = eval(json_content);

    this._map = mapping.map;
  },

  /** Parse CP-932 character byte sequence and convert it
   *  to UCS-4 code point sequence.
   *
   *  @param {Scanner} scanner A scanner object that attached to
   *                   current input stream.
   *  @return {Array} Converted sequence
   */
  decode: function decode(scanner)
  {
    return this._generate(scanner);
  },

  _generate: function _generate(scanner)
  {
     var c1,
         c2;

     while (!scanner.isEnd) {
       c1 = scanner.current();// + this._offset;
       if (c1 < 0x20) { // control codes.
         break;
       } if (c1 < 0x7f) { // ASCII range.
         yield c1;
       } else if (
         (0x81 <= c1 && c1 <= 0x9f) ||
         (0xe0 <= c1 && c1 <= 0xfc)) { // cp932 first character
         scanner.moveNext();
         c2 = scanner.current();
         if (
           (0x40 <= c2 && c2 <= 0x7e) ||
           (0x80 <= c2 && c2 <= 0xfc)) { // cp932 second character
           code = (c1 << 8) | (c2);
           yield this._map[code];
         } else {
           coUtils.Debug.reportWarning(_("Invalid cp932 second character: [%d]."), c2)
           yield this.displacement; // c1
           yield this.displacement; // c2
           break;
         }
       } else {
         break;
       }
       scanner.moveNext();
     };
  },

  /** test */
  "[test]":
  function()
  {
    var enabled = this.enabled;

    try {
      this.enabled = false;
      this.enabled = true;
      this.enabled = false;
    } finally {
      this.enabled = enabled;
    }
  },


};

/**
 * @fn main
 * @brief Module entry point.
 * @param {Broker} broker The Broker object.
 */
function main(broker)
{
  new CP932Decoder(broker);
}

// EOF
