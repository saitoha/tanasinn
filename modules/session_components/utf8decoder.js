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
 * @class UTF8Decoder
 */
var UTF8Decoder = new Class().extends(Plugin);
UTF8Decoder.definition = {

  id: "utf8_decoder",

  _surplus: null,

  get scheme()
  {
    return "UTF8-js";
  },

  getInfo: function getInfo()
  {
    return {
      name: _("UTF-8 Decoder"),
      version: "0.1",
      description: _("Decoder module for UTF-8 character set.")
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
    this._surplus = null;
  },

  /** uninstalls itself.
   */
  "[uninstall]":
  function uninstall()
  {
  },

  /** Constructor **/
  "[subscribe('get/decoders'), pnp]":
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
    /* skip */
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
    var c,
        result,
        i;

    if (null !== this._surplus) {
      i = this._surplus[0];
      result = this._surplus[1];

      for (; i >= 0; --i) {
        c = scanner.current();
        if (0x2 !== c >>> 6) {
          break;
        }
        result |= (c & 0x3f) << (i * 6);
        scanner.moveNext();
      }
      yield result;

      this._surplus = null;
    }

    while (!scanner.isEnd) {
      c = scanner.current();

      if (c < 0x20) {
        break;
      } else if (c < 0x7f) { // 8bit (ASCII/DEC/ISO)
        yield c;
      } else if (c === 0x7f) {
        break;
      } else if (c < 0xe0) {
        // 110xxxxx 10xxxxxx
        // (0x00000080 - 0x000007ff) // 11bit
        if (0x6 !== c >>> 5) {
          scanner.moveNext();
          yield this.displacement;
          continue;
        }
        result = (c & 0x1f) << 6;
        for (i = 0; i >= 0; --i) {
          scanner.moveNext();
          if (scanner.isEnd) {
            this._surplus = [i, result];
            return;
          }
          c = scanner.current();
          if (0x2 !== c >>> 6) {
            yield this.displacement;
            continue;
          }
          result |= (c & 0x3f) << (i * 6);
        }
        if (result < 0x9f) {
          scanner.moveNext();
          yield this.displacement;
          continue;
        }
        yield result;
      } else if (c < 0xf0) {
        // 1110xxxx 10xxxxxx 10xxxxxx
        // (0x00000800 - 0x0000ffff) // 16bit
        if (0xe !== c >>> 4) {
          scanner.moveNext();
          yield this.displacement;
          continue;
        }
        result = (c & 0xf) << 12;

        for (i = 1; i >= 0; --i) {
          scanner.moveNext();
          if (scanner.isEnd) {
            this._surplus = [i, result];
            return;
          }
          c = scanner.current();
          if (0x2 !== c >>> 6) {
            yield this.displacement;
            continue;
          }
          result |= (c & 0x3f) << (i * 6);
        }
        if (result < 0x800) {
          scanner.moveNext();
          yield this.displacement;
          continue;
        }
        yield result;
      } else if (c < 0xf8) {
        // 11110xxx 10xxxxxx 10xxxxxx 10xxxxxx
        // (0x00010000 - 0x001fffff) // 21bit
        if (0x1e !== c >>> 3) {
          scanner.moveNext();
          yield this.displacement;
          continue;
        }
        result = (c & 0x7) << 18;

        for (i = 2; i >= 0; --i) {
          scanner.moveNext();
          if (scanner.isEnd) {
            this._surplus = [i, result];
            return;
          }
          c = scanner.current();
          if (0x2 !== c >>> 6) {
            yield this.displacement;
            continue;
          }
          result |= (c & 0x3f) << (i * 6);
        }
        if (result < 0x10000) {
          scanner.moveNext();
          yield this.displacement;
          continue;
        }
        yield result;
      } else if (c < 0xfc) {
        // 111110xx 10xxxxxx 10xxxxxx 10xxxxxx 10xxxxxx
        // (0x00200000 - 0x03ffffff) // 26bit
        if (0x3e !== c >>> 2) {
          scanner.moveNext();
          yield this.displacement;
        }
        result = (c & 0x3) << 24;

        for (i = 3; i >= 0; --i) {
          scanner.moveNext();
          if (scanner.isEnd) {
            this._surplus = [i, result];
            return;
          }
          c = scanner.current();
          if (0x2 !== c >>> 6) {
            yield this.displacement;
            continue;
          }
          result |= (c & 0x3f) << (i * 6);
        }
        if (result < 0x200000) {
          scanner.moveNext();
          yield this.displacement;
          continue;
        }
        yield this.displacement;
      } else {
        // 1111110x 10xxxxxx 10xxxxxx 10xxxxxx 10xxxxxx 10xxxxxx
        // (0x04000000 - 0x7fffffff) // 31bit
        if (0x7e !== c >>> 1) {
          scanner.moveNext();
          yield this.displacement;
          continue;
        }
        result = (c & 0x3) << 30;

        for (i = 4; i >= 0; --i) {
          scanner.moveNext();
          if (scanner.isEnd) {
            this._surplus = [i, result];
            return;
          }
          c = scanner.current();
          if (0x2 !== c >>> 6) {
            yield this.displacement;
            continue;
          }
          result |= (c & 0x3f) << (i * 6);
        }
        if (result < 0x4000000) {
          scanner.moveNext();
          yield this.displacement;
          continue;
        }
        yield this.displacement;
      }
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
