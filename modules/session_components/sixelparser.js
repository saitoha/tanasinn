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
 * @class SixelForwardInputIterator
 */
var SixelForwardInputIterator = new Class();
SixelForwardInputIterator.definition = {

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

  parseChar: function parseChar(code)
  {
    var c;

    if (this.isEnd) {
      throw coUtils.Debug.Exception(_("Cannot parse number."));
    }
    c = this.current();
    return c === code;
  },

  parseUint: function parseUint()
  {
    var n = 0,
        c = this.current();

    if (0x30 <= c && c <= 0x39) {
      n = c - 0x30;
      while (true) {
        this.moveNext();
        if (this.isEnd) {
          throw coUtils.Debug.Exception(_("Cannot parse number."));
        }
        c = this.current();
        if (0x30 <= c && c <= 0x39) {
          n = n * 10 + c - 0x30;
        } else {
          break;
        }
      }
    } else {
      n = -1;
    }
    return n;
  },

}; // class ForwardInputIterator

/**
 *  @class SixelParser
 */
var SixelParser = new Class().extends(Plugin);
SixelParser.definition = {

  id: "sixel_parser",

  getInfo: function getInfo()
  {
    return {
      name: _("Sixel Parser"),
      version: "0.1",
      description: _("Parse sixel graphics data.")
    };
  },

  "[persistable] enabled_when_startup": true,

  _setSixel: function _setSixel(imagedata, x, y, c)
  {
    var color = this._color_table[this._color],
        r = color[0],
        g = color[1],
        b = color[2],
        data = imagedata.data,
        i = 0,
        position;

    c -= 0x3f;

    for (; i < 6; ++i) {
      if (c & 0x1 << i) {
        position = ((y + i) * imagedata.width * 1 + x) * 4;
        data[position] = r;
        data[position + 1] = g;
        data[position + 2] = b;
        data[position + 3] = 255;
      }
    }
  },

  _setColor: function _setColor(color_no, r, g, b)
  {
    var rgb_value = [
      Math.floor(r / 101 * 255),
      Math.floor(g / 101 * 255),
      Math.floor(b / 101 * 255)
    ];
    this._color_table[color_no] = rgb_value;
  },

  _selectColor: function _selectColor(color_no)
  {
    this._color = color_no;
  },

  parse: function parse(sixel, dom)
  {
    var scanner = new SixelForwardInputIterator(sixel),
        width = dom.canvas.width,
        height = dom.canvas.height * 2,
        imagedata = dom.context.getImageData(0, 0, width, height),
        x = 0,
        y = 0,
        count = 1,
        color_no,
        r,
        g,
        b,
        i,
        space_type,
        c,
        max_x = 0;

    this._color_table = [];

    do {
      c = scanner.current();
      switch (c) {

        case 0x21: // !
          scanner.moveNext();
          count = scanner.parseUint();
          break;

        case 0x22: // "
          scanner.moveNext();
          c = scanner.parseUint();
          if (!scanner.parseChar(0x3b)) {
            throw coUtils.Debug.Exception(_("Cannot parse sixel format."));
          }

          scanner.moveNext();
          c = scanner.parseUint();

          if (scanner.parseChar(0x3b)) {
            scanner.moveNext();
            c = scanner.parseUint();
            if (scanner.parseChar(0x3b)) {
              scanner.moveNext();
              c = scanner.parseUint();
            }
          }
          break;

        case 0x23: // #
          scanner.moveNext();
          color_no = scanner.parseUint();
          if (-1 === color_no) {
            throw coUtils.Debug.Exception(_("Cannot parse sixel format."));
          }

          c = scanner.current();
          if (0x3b === c) { // ;
            scanner.moveNext();
            c = scanner.parseUint();

            space_type = "";

            if (1 === c) { // HSL
              space_type = "HSL";
            } else if (2 === c) {
              space_type = "RGB";
            } else {
              throw coUtils.Debug.Exception(_("Cannot parse sixel format."));
            }

            if (!scanner.parseChar(0x3b)) {
              throw coUtils.Debug.Exception(_("Cannot parse sixel format."));
            }

            scanner.moveNext();
            r = scanner.parseUint();
            if (-1 === r) {
              throw coUtils.Debug.Exception(_("Cannot parse sixel format."));
            }
            if (!scanner.parseChar(0x3b)) {
              throw coUtils.Debug.Exception(_("Cannot parse sixel format."));
            }

            scanner.moveNext();
            g = scanner.parseUint();
            if (-1 === g) {
              throw coUtils.Debug.Exception(_("Cannot parse sixel format."));
            }
            if (!scanner.parseChar(0x3b)) {
              throw coUtils.Debug.Exception(_("Cannot parse sixel format."));
            }

            scanner.moveNext();
            b = scanner.parseUint();
            if (-1 === b) {
              throw coUtils.Debug.Exception(_("Cannot parse sixel format."));
            }

            this._setColor(color_no, r, g, b);
          } else {
            this._selectColor(color_no);
          }
          break;

        case 0x24: // $
          if (max_x < x) {
            max_x = x;
          }
          count = 1;
          x = 0;
          scanner.moveNext();
          break;

        case 0x2d: // -
          y += 6;
          scanner.moveNext();
          break;

        case 0x3f:
        case 0x40: case 0x41: case 0x42: case 0x43: case 0x44: case 0x45: case 0x46: case 0x47:
        case 0x48: case 0x49: case 0x4a: case 0x4b: case 0x4c: case 0x4d: case 0x4e: case 0x4f:
        case 0x50: case 0x51: case 0x52: case 0x53: case 0x54: case 0x55: case 0x56: case 0x57:
        case 0x58: case 0x59: case 0x5a: case 0x5b: case 0x5c: case 0x5d: case 0x5e: case 0x5f:
        case 0x60: case 0x61: case 0x62: case 0x63: case 0x64: case 0x65: case 0x66: case 0x67:
        case 0x68: case 0x69: case 0x6a: case 0x6b: case 0x6c: case 0x6d: case 0x6e: case 0x6f:
        case 0x70: case 0x71: case 0x72: case 0x73: case 0x74: case 0x75: case 0x76: case 0x77:
        case 0x78: case 0x79: case 0x7a: case 0x7b: case 0x7c: case 0x7d: case 0x7e:
          for (i = 0; i < count; ++i) {
            this._setSixel(imagedata, x, y, c);
            ++x;
          }
          count = 1;
          scanner.moveNext();
          break;

        case 0x9c: //
        case 0x0d:
        case 0x0a:
        default:
          scanner.moveNext();
          //throw coUtils.Debug.Exception(_("Cannot parse sixel format."));

      }
    } while (!scanner.isEnd);

    dom.context.putImageData(imagedata, 0, 0);

    return {
      canvas: dom.canvas,
      max_x: max_x,
      max_y: y,
    };
  },
}; // class SixelParser

/**
 * @fn main
 * @brief Module entry point.
 * @param {Broker} broker The Broker object.
 */
function main(broker)
{
  new SixelParser(broker);
}

// EOF
