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
 * @class UTF8_CP932Decoder
 */
var UTF8_CP932Decoder = new Class().extends(Plugin);
UTF8_CP932Decoder.definition = {

  id: "utf8_cp932_decoder",

  get scheme()
  {
    return "utf8-cp932-js";
  },

  getInfo: function getInfo()
  {
    return {
      name: _("UTF-8 Decoder"),
      version: "0.1",
      description: _("Parallel decoder module for UTF-8/CP 932 character sets.")
    };
  },

  "[persistable] enabled_when_startup": true,

  _cp932_map: null,
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

  /** Constructor **/
  "[subscribe('get/decoders'), pnp]":
  function getDecoders(map)
  {
    return {
      charset: this.scheme,
      converter: this,
      title: "UTF-8/Shift-JIS parallel decoder implemented in js",
    };
  },

  activate: function activate()
  {
    var resource_path_cp932 = "modules/mappings/cp932.txt.js",
        json_content_cp932 = coUtils.IO.readFromFile(resource_path_cp932),
        mapping_cp932 = eval(json_content_cp932);

    this._cp932_map = mapping_cp932.map;
  },

  /** Parse UTF-8 string sequence and convert it
   *  to UCS-4 code point sequence.
   */
  decode: function decode(scanner)
  {
    var self = this;

    return function(scanner)
    {
      var c;

      while (!scanner.isEnd) {
        c = self._getNextCharacter(scanner);// + offset;
        if (c < 0x20 || 0x7f === c) {
          break;
        }
        yield c;
        scanner.moveNext();
      };
    } (scanner);
  },

  /** Decode UTF-8 encoded byte sequences
   *  and Return UCS-4 character set code point.
   *
   *  @param {Scanner} scanner A scanner object that attached to
   *                   current input stream.
   *  @return {Array} Converted sequence
   */
  _getNextCharacter: function _getNextCharacter(scanner)
  {
    var c = scanner.current(),
        c2,
        first,
        second,
        third,
        fourth;

    if (c < 0x20 || 0x7f === c) {
      return null;
    } else if (c < 0x7f) { // 8bit (ASCII/DEC/ISO)
      return c;
    } else if (c < 0xe0) {
      scanner.moveNext();
      c2 = scanner.current();
      if (0x81 <= c && c <= 0x9f) { // cp932 first character
        if ((0x40 <= c2 && c2 <= 0x7e) || (0x80 <= c2 && c2 <= 0xfc)) { // cp932 second character
          code = (c << 8) | (c2);
          return this._cp932_map[code];
        }
        if (c < 0xa0) {
          return null;
        }
      }
      // 110xxxxx 10xxxxxx
      // (0x00000080 - 0x000007ff) // 11bit
      first = (c & 0x1f) << 6;
      second = c2 & 0x3f;
      return first | second;
    } else if (c < 0xf0) {
      scanner.moveNext();
      c2 = scanner.current();
      // 1110xxxx 10xxxxxx 10xxxxxx
      // (0x00000800 - 0x0000ffff) // 16bit (UCS-2)
      if (0xe === c >>> 4) {
        first = (c & 0xf) << 12;
        if (0x2 === c2 >>> 6) {
          second = (c2 & 0x3f) << 6;
          scanner.moveNext();
          c2 = scanner.current();
          if (0x2 === c2 >>> 6) {
            third = c2 & 0x3f;
            return first | second | third;
          }
        }
      }
      if (0xe0 <= c && c <= 0xfc) { // cp932 first character
        if ((0x40 <= c2 && c2 <= 0x7e) || (0x80 <= c2 && c2 <= 0xfc)) { // cp932 second character
          code = (c << 8) | (c2);
          return this._cp932_map[code];
        }
      }
    } else if (c < 0xf8) {
      // 11110xxx 10xxxxxx 10xxxxxx 10xxxxxx
      // (0x00010000 - 0x001fffff) // 21bit (UCS-4)
      first = (c & 0x7) << 18;
      scanner.moveNext();
      second = (scanner.current() & 0x3f) << 12;
      scanner.moveNext();
      third = (scanner.current() & 0x3f) << 6;
      scanner.moveNext();
      fourth = scanner.current() & 0x3f;
      return first | second | third | fourth;
    } else {
      return null;
    }
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


}

/**
 * @fn main
 * @brief Module entry point.
 * @param {Broker} broker The Broker object.
 */
function main(broker)
{
  new UTF8_CP932Decoder(broker);
}

// EOF
