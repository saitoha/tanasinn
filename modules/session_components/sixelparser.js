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
 *
 * The implementation of _setHlsColor is derived from kmiya's sixel converter
 * http://nanno.dip.jp/softlib/man/rlogin/sixel.tar.gz
 *
 * Portions created by the Initial Developer are Copyright (C) 2010 - 2014
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
          if (n > 1 << 16) {
            n = (1 << 16) - 1;
          }
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

var HLSMAX = 100,
    RGBMAX = 256,
    _SPACE_TYPE_HLS = 1,
    _SPACE_TYPE_RGB = 2;

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

  /**
   * The implementation of _setHlsColor is derived from kmiya's sixel converter
   * http://nanno.dip.jp/softlib/man/rlogin/sixel.tar.gz
   */
  _setHlsColor: function _setHlsColor(color_no, hue, lum, sat)
  {
    var r,
        g,
        b,
        magic1,
        magic2;

    function _hue_to_rgb(n1, n2, hue)
    {
      if (hue < 0) {
        hue += HLSMAX;
      }
      if (hue > HLSMAX) {
        hue -= HLSMAX;
      }
      if (hue < (HLSMAX / 6)) {
        return n1 + ((n2 - n1) * hue + HLSMAX / 12) / (HLSMAX / 6);
      }
      if (hue < (HLSMAX / 2)) {
        return n2;
      }
      if (hue < ((HLSMAX * 2) / 3)) {
          return n1 + ((n2 - n1) * (HLSMAX * 2 / 3 - hue) + HLSMAX / 12) / (HLSMAX / 6);
      } else {
        return n1;
      }
    }

    if (sat == 0) {
      r = g = b = (lum * RGBMAX) / HLSMAX;
    } else {
      if (lum <= (HLSMAX / 2)) {
        magic2 = (lum * (HLSMAX + sat) + (HLSMAX / 2)) / HLSMAX;
      } else {
        magic2 = lum + sat - ((lum * sat) + (HLSMAX / 2)) / HLSMAX;
      }
      magic1 = 2 * lum - magic2;

      r = (_hue_to_rgb(magic1, magic2, hue + (HLSMAX / 3)) * RGBMAX + (HLSMAX / 2)) / HLSMAX;
      g = (_hue_to_rgb(magic1, magic2, hue) * RGBMAX + (HLSMAX / 2)) / HLSMAX;
      b = (_hue_to_rgb(magic1, magic2, hue - (HLSMAX / 3)) * RGBMAX + (HLSMAX / 2)) / HLSMAX;
    }

    var rgb_value = [
      r | 0,
      g | 0,
      b | 0
    ];
    this._color_table[color_no] = rgb_value;
  },

  _setRgbColor: function _setRgbColor(color_no, r, g, b)
  {
    var rgb_value = [
      r / 101 * 255 | 0,
      g / 101 * 255 | 0,
      b / 101 * 255 | 0
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
        c1,
        c2,
        c3,
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
            space_type = scanner.parseUint();

            if (!scanner.parseChar(0x3b)) {
              throw coUtils.Debug.Exception(_("Cannot parse sixel format."));
            }

            scanner.moveNext();
            c1 = scanner.parseUint();
            if (-1 === c1) {
              throw coUtils.Debug.Exception(_("Cannot parse sixel format."));
            }
            if (!scanner.parseChar(0x3b)) {
              throw coUtils.Debug.Exception(_("Cannot parse sixel format."));
            }

            scanner.moveNext();
            c2 = scanner.parseUint();
            if (-1 === c2) {
              throw coUtils.Debug.Exception(_("Cannot parse sixel format."));
            }
            if (!scanner.parseChar(0x3b)) {
              throw coUtils.Debug.Exception(_("Cannot parse sixel format."));
            }

            scanner.moveNext();
            c3 = scanner.parseUint();
            if (-1 === c3) {
              throw coUtils.Debug.Exception(_("Cannot parse sixel format."));
            }

            if (_SPACE_TYPE_RGB === space_type) {
              this._setRgbColor(color_no, c1, c2, c3);
            } else if (_SPACE_TYPE_HLS === space_type) {
              this._setHlsColor(color_no, c1, c2, c3);
            } else {
              throw coUtils.Debug.Exception(_("Cannot parse sixel format."));
            }
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
