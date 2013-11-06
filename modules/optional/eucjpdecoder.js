/* -*- Mode: JAVASCRIPT; tab-width: 2; indent-tabs-mode: nil; c-basic-offset: 2 -*-
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
 * Portions created by the Initial Developer are Copyright (C) 2010 - 2013
 * the Initial Developer. All Rights Reserved.
 *
 * ***** END LICENSE BLOCK ***** */

"use strict";

/**
 *
 * @class EUCJPDecoder
 *
 */
var EUCJPDecoder = new Class().extends(Plugin);
EUCJPDecoder.prototype = {

  id: "eucjp_decoder",

  get scheme()
  {
    return "EUC-JP-js";
  },

  getInfo: function getInfo()
  {
    return {
      name: _("EUC-JP Decoder"),
      version: "0.1",
      description: _("Decoder module for EUC-JP character set.")
    };
  },

  "[persistable] enabled_when_startup": true,

  "[persistable] displacement": 0x3f,

  _map: null,

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
      title: "EUC-JP decoder implemented in js",
    };
  },

  activate: function activate()
  {
    var resource_path_jis0208 = "modules/mappings/jis0208.txt.js",
        json_content_jis0208 = coUtils.IO.readFromFile(resource_path_jis0208),
        mapping_jis0208 = eval(json_content_jis0208),
        resource_path_jis0201 = "modules/mappings/jis0201.txt.js",
        json_content_jis0201 = coUtils.IO.readFromFile(resource_path_jis0201),
        mapping_jis0201 = eval(json_content_jis0201),
        resource_path_jis0212 = "modules/mappings/jis0212.txt.js",
        json_content_jis0212 = coUtils.IO.readFromFile(resource_path_jis0212),
        mapping_jis0212 = eval(json_content_jis0212);

    this._jis0201_map = mapping_jis0201.map;
    this._jis0208_map = mapping_jis0208.map;
    this._jis0212_map = mapping_jis0212.map;
  },

  /** Parse EUC-JP character byte sequence and convert it
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
    var c1, c2;

    while (!scanner.isEnd) {
      c1 = scanner.current();
      if (c1 < 0x20) { // control codes.
        break;
      } if (c1 < 0x7f) { // ASCII range.
        yield c1;
      } else if (0x8e === c1) {
        scanner.moveNext();
        c2 = scanner.current();
        code = c2;
        yield this._jis0201_map[code];
      } else if (0x8f === c1) {
        scanner.moveNext();
        c1 = scanner.current();
        scanner.moveNext();
        c2 = scanner.current();
        code = ((c1 - 0x80) << 8) | (c2 - 0x80);
        yield this._jis0212_map[code];
      } else if (c1 <= 0xff)  {
        scanner.moveNext();
        c2 = scanner.current();
        if (0x80 <= c2 && c2 <= 0xff) {
          code = ((c1 - 0x80) << 8) | (c2 - 0x80);
          yield this._jis0208_map[code];
        } else {
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


}; // class EUCJPDecoder

/**
 * @fn main
 * @brief Module entry point.
 * @param {Broker} broker The Broker object.
 */
function main(broker)
{
  new EUCJPDecoder(broker);
}

// EOF
