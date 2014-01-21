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
    return this._value[this._position];
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
var SixelParser = new Class().extends(Plugin)
                             .depends("palette");
SixelParser.definition = {

  id: "sixel_parser",

  /** plugin information */
  getInfo: function getInfo()
  {
    return {
      name: _("Sixel Parser"),
      version: "0.1",
      description: _("Parse sixel graphics data.")
    };
  },

  _color: 0,
  _palette: null,
  _color_palette: null,

  "[persistable] enabled_when_startup": true,

  /** Installs itself.
   *  @param {InstallContext} context A InstallContext object.
   */
  "[install]":
  function install(context)
  {
    var palette = context["palette"];

    this._palette = palette;
  },

  /** Uninstalls itself.
   */
  "[uninstall]":
  function uninstall()
  {
    this._palette = null;
  },


  _setSixel: function _setSixel(imagedata, x, y, c)
  {
    var color,
        r,
        g,
        b,
        data = imagedata.data,
        i = 0,
        position;

    color = this._color_table[this._color];

    if (undefined === color) {
      return;
    }

    r = color[0];
    g = color[1];
    b = color[2];

    c -= 0x3f;

    for (; i < 6; ++i) {
      if (c & 0x1 << i) {
        position = ((y + i) * imagedata.width * 1 + x) * 4;
        data[position + 0] = r;
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

  _initcolor: function _initcolor()
  {
    var palette_table = this._palette.color.slice(0),
        c,
        r,
        g,
        b,
        i,
        color_table = [];

    function c2hex(c)
    {
      if (c >= 0x30 && c <= 0x39) {
         return c - 0x30;
      } else if (c >= 0x61 && c <= 0x66) {
         return c - 0x51;
      } else if (c >= 0x41 && c <= 0x46) {
         return c - 0x31;
      }
      return 0;
    }

    c = this._palette.foreground_color;
    r = c2hex(c.charCodeAt(1)) << 4 | c2hex(c.charCodeAt(2));
    g = c2hex(c.charCodeAt(3)) << 4 | c2hex(c.charCodeAt(4));
    b = c2hex(c.charCodeAt(5)) << 4 | c2hex(c.charCodeAt(6));
    color_table[0] = [r, g, b];

    for (i = 1; i < 0x100; ++i) {
      c = palette_table[i];
      r = c2hex(c.charCodeAt(1)) << 4 | c2hex(c.charCodeAt(2));
      g = c2hex(c.charCodeAt(3)) << 4 | c2hex(c.charCodeAt(4));
      b = c2hex(c.charCodeAt(5)) << 4 | c2hex(c.charCodeAt(6));
      color_table[i] = [r, g, b];
    }

    this._color_table = color_table;
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

    this._initcolor();

    do {
      c = scanner.current();
      switch (c) {

        // DECGRI - Graphics Repeat Introducer control character 
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
              throw coUtils.Debug.Exception(_("HSL format is not implemented."));
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
            this._color = color_no;
          }
          break;

        // DECGCR - Graphics Carriage Return control character
        case 0x24: // $ 
          if (max_x < x) {
            max_x = x;
          }
          count = 1;
          x = 0;
          scanner.moveNext();
          break;

        // DECGNL - Graphics Next Line control character 
        case 0x2d: // -
          x = 0;
          y += 6;
          scanner.moveNext();
          break;

        default:
          if (c >= 0x3f && c <= 0x7e) {
            for (i = 0; i < count; ++i) {
              this._setSixel(imagedata, x, y, c);
              ++x;
            }
            count = 1;
          }
          scanner.moveNext();
      }
    } while (!scanner.isEnd);

    dom.context.putImageData(imagedata, 0, 0);

    return {
      canvas: dom.canvas,
      max_x: max_x,
      max_y: y,
    };
  },

  /** test */
  "[test]":
  function test()
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
