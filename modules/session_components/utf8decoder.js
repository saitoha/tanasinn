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
 * @class UTF8Decoder
 */
var UTF8Decoder = new Class().extends(Component);
UTF8Decoder.definition = {

  get id()
    "utf8_decoder",

  get scheme()
    "UTF8-js",

  get info()
    <module>
        <name>{_("UTF-8 Decoder")}</name>
        <version>0.1</version>
        <description>{
          _("Decoder module for UTF-8 character set.")
        }</description>
    </module>,

  "[persistable] displacement": 0x3f,
  _offset: 0,

  /** Constructor **/
  "[subscribe('get/decoders'), enabled]":
  function getDecoders() 
  {
    return {
      charset: this.scheme,
      converter: this,
      title: "UTF-8 decoder implemented in js",
    };
  },

  activate: function activate() 
  {
  },

  /** Parse UTF-8 string sequence and convert it 
   *  to UCS-4 code point sequence. 
   */
  decode: function decode(scanner) 
  {
    return this._generate(scanner);
  },

  _generate: function _generate(scanner)
  {
    var c;

    while (!scanner.isEnd) {
      c = this._getNextCharacter(scanner);
      if (null === c) {
        break;
      }
      yield c;
      scanner.moveNext();
    };
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
        first,
        second,
        third,
        fourth,
        result;

    if (c < 0x20 || (0x7f <= c && c < 0xa0)) {
      return null;
    } else if (c < 0x7f) { // 8bit (ASCII/DEC/ISO)
      return c;
    } else if (c < 0xe0) {
      // 110xxxxx 10xxxxxx 
      // (0x00000080 - 0x000007ff) // 11bit
      if (0x6 !== c >>> 5) {
        scanner.moveNext();
        return this.displacement;
      }
      first = (c & 0x1f) << 6;
      scanner.moveNext();
      c = scanner.current();
      if (0x2 !== c >>> 6) {
        return this.displacement;
      }
      second = c & 0x3f;
      result = first | second;
      if (result < 0x80) {
        return this.displacement;
      }
      return result;
    } else if (c < 0xf0) {
      // 1110xxxx 10xxxxxx 10xxxxxx 
      // (0x00000800 - 0x0000ffff) // 16bit (UCS-2)
      if (0xe !== c >>> 4) {
        scanner.moveNext();
        scanner.moveNext();
        return this.displacement;
      }
      first = (c & 0xf) << 12;
      scanner.moveNext();
      c = scanner.current();
      if (0x2 !== c >>> 6) {
        scanner.moveNext();
        return this.displacement;
      }
      second = (c & 0x3f) << 6;
      scanner.moveNext();
      c = scanner.current();
      if (0x2 !== c >>> 6) {
        return this.displacement;
      }
      third = c & 0x3f;
      result = first | second | third;
      if (result < 0x800) {
        return this.displacement;
      }
      return result;
    } else if (c < 0xf8) {
      // 11110xxx 10xxxxxx 10xxxxxx 10xxxxxx 
      // (0x00010000 - 0x001fffff) // 21bit (UCS-4)
      if (0x1e !== c >>> 3) {
        scanner.moveNext();
        scanner.moveNext();
        scanner.moveNext();
        return this.displacement;
      }
      first = (c & 0x7) << 18;
      scanner.moveNext();
      c = scanner.current();
      if (0x2 !== c >>> 6) {
        scanner.moveNext();
        scanner.moveNext();
        return this.displacement;
      }
      second = (c & 0x3f) << 12;
      scanner.moveNext();
      c = scanner.current();
      if (0x2 !== c >>> 6) {
        scanner.moveNext();
        return this.displacement;
      }
      third = (c & 0x3f) << 6;
      scanner.moveNext();
      c = scanner.current();
      if (0x2 !== c >>> 6) {
        return this.displacement;
      }
      fourth = c & 0x3f;
      result = first | second | third | fourth;
      if (result < 0x10000) {
        return this.displacement;
      }
      return result;
    }
    return null;
  },

}; // class UTF8Decoder

/**
 * @fn main
 * @brief Module entry point.
 * @param {Broker} broker The Broker object.
 */
function main(broker) 
{
  new UTF8Decoder(broker);
}

// EOF
