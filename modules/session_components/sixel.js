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

  parseChar: function parseChar(code) 
  {
    let c = this.current();
    this.moveNext();
    return c == code;
  },
  
  parseUint: function parseUint() 
  {
    let n = -1;
    let c;
    while (true) {
      if (this.isEnd) {
        throw coUtils.Exception(_("Cannot parse number."));
      }
      c = this.current();
      this.moveNext();
      if (0x30 <= c && c <= 0x39) {
        n = n * 10 + c - 0x30;
      } else {
        break;
      }
    }
    return n;
  },

}; // class ForwardInputIterator

/**
 *  @class Sixel
 */
let Sixel = new Class().extends(Plugin)
                       .depends("renderer")
                       .depends("screen")
                       ;
Sixel.definition = {

  get id()
    "sixel",

  get info()
    <module>
        <name>{_("Sixel")}</name>
        <version>0.1</version>
        <description>{
          _("Provides overlay Sixel rendering layer.")
        }</description>
    </module>,

  "[persistable] enabled_when_startup": true,

  /** UI template */
  get template() 
    let (renderer = this.dependency["renderer"])
    let (screen = this.dependency["screen"])
    ({
      parentNode: "#tanasinn_center_area",
      tagName: "html:canvas",
      id: "sixel_canvas",
      style: <>
        border: solid red 1px;
      </>,
      width: renderer.char_width * screen.width,
      height: renderer.line_height * screen.height,
    }),

  /** installs itself. 
   *  @param {Broker} broker A Broker object.
   */
  "[subscribe('install/sixel'), enabled]":
  function install(broker) 
  {
    this.onDCS.enabled = true;
    let {sixel_canvas} = broker.uniget(
      "command/construct-chrome", this.template);
    this._dom = { 
      canvas: sixel_canvas,
      context: sixel_canvas.getContext("2d"),
    };
    this._color_table = [];
  },

  /** Uninstalls itself.
   *  @param {Broker} broker A broker object.
   */
  "[subscribe('uninstall/sixel'), enabled]":
  function uninstall(broker) 
  {
    this._map = null;
    this.onDCS.enabled = false;
    this._color_table = null;
    if (null !== this._dom) {
      this._dom.canvas.parentNode.removeChild(this._dom.canvas);
      this._dom.canvas = null;
      this._dom.context = null;
      this._dom = null;
    }
  },

  _setSixel: function _setSixel(x, y, c) 
  {

    function char2sixelbits(c) {
      return ("0000000" + (c.charCodeAt(0) - "?".charCodeAt(0)).toString(2))
        .substr(-6).split("").reverse();
    }

    let dom = this._dom;
    let imagedata = dom.context
      .getImageData(0, 0, dom.canvas.width, dom.canvas.height);
    let i = 0;
    let position = y * dom.canvas.width + x;

    imagedata.data[position++] = this._color[0];
    imagedata.data[position++] = this._color[1]; 
    imagedata.data[position++] = this._color[2];
    imagedata.data[position++] = 255;

    dom.context.putImageData(imagedata, 0, 0);


    coUtils.Debug.reportMessage("setsixel:"  + x + " " + y + " " + c);
  },

  _setColor: function _setColor(color_no, r, g, b) 
  {
    let rgb_value = [r, g, b];
    this._color_table[color_no] = rgb;
  },

  _selectColor: function _selectColor(color_no) 
  {
    this._color = this._color_table[color_no];
  },

  "[subscribe('sequence/dcs')]":
  function onDCS(data) 
  {

    try {

    let pattern = /^([0-9]);([01]);([0-9]+);?q((?:.|[\n\r])+)/;
    let match = data.match(pattern);
    if (null === match) {
      return;
    }
    let [, P1, P2, P3, sixel] = match;
    let scanner = new ForwardInputIterator(sixel);
    
    do {
      let color_no, r, g, b;
      let x = 0;
      let y = 0;
      let c = scanner.current();
      scanner.moveNext();
      switch (c) {

        case 0x0d:
        case 0x0a:
          continue;

        case 0x21: // !
          this._count = scanner.parseUint();
          break;

        case 0x22: // "
          scanner.parseUint();
          scanner.parseChar(0x3b);
          scanner.parseUint();
          break;

        case 0x23: // #
          color_no = scanner.parseUint();
          if (-1 == color_no) {
            throw coUtils.Exception(_("Cannot parse sixel format."));
          }
          c = scanner.current();
          scanner.moveNext();

          if (0x3b == c) { // ;

            let space_type = "";
            if (1 == c) { // HSL
              space_type = "HSL"; 
            } else if (2 == c) {
              space_type = "RGB";
            } else {
              throw coUtils.Exception(_("Cannot parse sixel format."));
            }

            if (scanner.parseChar(0x3b)) {
              throw coUtils.Exception(_("Cannot parse sixel format."));
            }

            r = scanner.parseUint();
            if (-1 == r) {
              throw coUtils.Exception(_("Cannot parse sixel format."));
            }

            if (scanner.parseChar(0x3b)) {
              throw coUtils.Exception(_("Cannot parse sixel format."));
            }

            g = scanner.parseUint();
            if (-1 == g) {
              throw coUtils.Exception(_("Cannot parse sixel format."));
            }

            if (scanner.parseChar(0x3b)) {
              throw coUtils.Exception(_("Cannot parse sixel format."));
            }

            b = scanner.parseUint();
            if (-1 == b) {
              throw coUtils.Exception(_("Cannot parse sixel format."));
            }

            this._setColor(color_no, r, g, b);
          } else {
            this._selectColor(color_no);
          }
          break;

        case 0x24: // $
          x = 0;
          break;
          
        case 0x2d: // -
          ++y;
          break;

        case 0x3e:
        case 0x3f:
        case 0x40:
        case 0x41:
        case 0x42:
        case 0x43:
        case 0x44:
        case 0x45:
        case 0x46:
        case 0x47:
        case 0x48:
        case 0x49:
        case 0x4a:
        case 0x4b:
        case 0x4c:
        case 0x4d:
        case 0x4e:
        case 0x4f:
        case 0x50:
        case 0x51:
        case 0x52:
        case 0x53:
        case 0x54:
        case 0x55:
        case 0x56:
        case 0x57:
        case 0x58:
        case 0x59:
        case 0x5a:
        case 0x5b:
        case 0x5c:
        case 0x5d:
        case 0x5e:
        case 0x5f:
        case 0x60:
        case 0x61:
        case 0x62:
        case 0x63:
        case 0x64:
        case 0x65:
        case 0x66:
        case 0x67:
        case 0x68:
        case 0x69:
        case 0x6a:
        case 0x6b:
        case 0x6c:
        case 0x6d:
        case 0x6e:
        case 0x6f:
        case 0x70:
        case 0x71:
        case 0x72:
        case 0x73:
        case 0x74:
        case 0x75:
        case 0x76:
        case 0x77:
        case 0x78:
        case 0x79:
        case 0x7a:
        case 0x7b:
        case 0x7c:
        case 0x7d:
        case 0x7e:
          this._setSixel(x, y, c);
          break;

        default:
          throw coUtils.Exception(_("Cannot parse sixel format."));

      }
    } while (scanner.isEnd);


    } catch (e) {alert(e + " " + e.lineNumber)}
    //alert(sixel)
  },

}; // Sixel 

/**
 * @fn main
 * @brief Module entry point.
 * @param {Broker} broker The Broker object.
 */
function main(broker) 
{
  new Sixel(broker);
}


