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

var MODE_ALPHA = 0,
    MODE_GRAPHICS = 1;

/**
 * @class Tektronix
 */
var Tektronix = new Class().extends(Plugin);
Tektronix.definition = {

  id: "tektronix",

  /** plugin information */
  getInfo: function getInfo()
  {
    return {
      name: _("Tektronix 4010/4014 mode"),
      version: "0.1.0",
      description: _("Provides Tektronix 4010/4014 emuration.")
    };
  },

  "[persistable] enabled_when_startup": true,
  "[persistable] default_line_style": "yellow",
  "[persistable] default_text_color": "white",
  "[persistable] default_text_style": "26px monospace",

  /** Installs itself.
   *  @param {InstallContext} context A InstallContext object.
   */
  "[install]":
  function install(context)
  {
    var tanasinn_tektronix_canvas;

    tanasinn_tektronix_canvas = this.request(
      "command/construct-chrome",
      {
        parentNode: "#tanasinn_center_area",
        tagName: "html:canvas",
        id: "tanasinn_tektronix_canvas",
      }).tanasinn_tektronix_canvas;

    this._x = 0;
    this._y = 0;

    this._mode = MODE_ALPHA;

    this._dom = {
      canvas: tanasinn_tektronix_canvas,
      context: tanasinn_tektronix_canvas.getContext("2d"),
    };
    this.onWidthChanged(this._width);
    this.onHeightChanged(this._height);
  },

  /** Uninstalls itself.
   */
  "[uninstall]":
  function uninstall()
  {
    if (this._dom) {
      this._dom.canvas.parentNode.removeChild(this._dom.canvas);
      this._dom.canvas = null;
      this._dom.renderer = null;
      this._dom = null;
    }
  },

  "[subscribe('event/screen-width-changed'), enabled]":
  function onWidthChanged(width)
  {
    var dom = this._dom,
        scale;

    this._width = width;

    if (dom) {
      dom.canvas.width = width;
      scale = Math.min(width, dom.canvas.height) / 1024;
      this._scale = scale;
      dom.context.scale(scale, scale);
    }
  },

  "[subscribe('event/screen-height-changed'), enabled]":
  function onHeightChanged(height)
  {
    var dom = this._dom,
        scale;

    this._height = height;

    if (dom) {
      dom.canvas.height = height;
      scale = Math.min(dom.canvas.width, height) / 1024;
      dom.context.scale(scale, scale);
      this._scale = scale;
    }
  },

  "[subscribe('get/grammars'), enabled]":
  function onGrammarsRequested()
  {
    return this;
  },

  _parseGraphics: function _parseGraphics(scanner)
  {
    var dom = this._dom,
        high_y,
        low_y,
        high_x,
        low_x,
        path_open = false;

    dom.context.fillStyle = this.default_text_color;
    dom.context.strokeStyle = this.default_line_style;
    dom.context.font = this.default_text_style;

    scanner.moveNext();

    if (scanner.isEnd) {
      return;
    }

    while (!scanner.isEnd) {

      c = scanner.current();
      if (scanner.isEnd) {
        dom.context.stroke();
        path_open = false;
        return;
      }
      if (1 !== c >> 5) {
        dom.context.stroke();
        path_open = false;
        return;
      }
      high_y = c & 0x1f; // 001xxxxx

      scanner.moveNext();

      c = scanner.current();
      if (scanner.isEnd) {
        dom.context.stroke();
        path_open = false;
        return;
      }
      if (3 !== c >> 5) {
        dom.context.stroke();
        path_open = false;
        return;
      }
      low_y  = c & 0x1f; // 011xxxxx

      scanner.moveNext();

      if (scanner.isEnd) {
        dom.context.stroke();
        path_open = false;
        return;
      }

      c = scanner.current();

      if (1 !== c >> 5) {
        if (3 === c >> 5) {
          low_y  = c & 0x1f; // 011xxxxx
          scanner.moveNext();
          c = scanner.current();
          if (scanner.isEnd) {
            dom.context.stroke();
            path_open = false;
            return;
          }
          if (1 !== c >> 5) {
            dom.context.stroke();
            path_open = false;
            return;
          }
        } else {
          dom.context.stroke();
          path_open = false;
          return;
        }
      }
      high_x = c & 0x1f; // 001xxxxx

      scanner.moveNext();

      if (scanner.isEnd) {
        dom.context.stroke();
        path_open = false;
        return;
      }

      c = scanner.current();

      if (2 !== c >> 5) {
        dom.context.stroke();
        path_open = false;
        return;
      }
      low_x  = c & 0x1f; // 010xxxxx

      this._y = (this._height / this._scale) - (high_y << 5 | low_y) - 40;
      this._x = high_x << 5 | low_x;

      if (path_open) {
        dom.context.lineTo(this._x, this._y);
      } else {
        dom.context.beginPath();
        dom.context.moveTo(this._x, this._y);
        path_open = true;
      }

      scanner.setAnchor();

      scanner.moveNext();

    } // while

    if (path_open) {
      dom.context.stroke();
      path_open = false;
    }

  }, // _parseGraphics

  /** Parse and returns asocciated action.
   *  @param {Scanner} scanner A Scanner object.
   *  @param {Function|Undefined} Action object.
   *
   *  @implements Grammar.parse :: Scanner -> Action
   */
  "[type('Scanner -> Action')] parse":
  function parse(scanner)
  {
    var dom = this._dom,
        c,
        buffer,
        text;

    dom.context.fillStyle = this.default_text_color;
    dom.context.strokeStyle = this.default_line_style;
    dom.context.font = this.default_text_style;

    if (MODE_GRAPHICS === this._mode) {
      dom.context.beginPath();
      dom.context.moveTo(this._x, this._y);
      path_open = true;
      this._parseGraphics(scanner);
    }

    try {
scan:
    while (!scanner.isEnd) {

      c = scanner.current();

      if (0x07 === c) {
        scanner.moveNext();
      } else if (0x1d === c) {
        this._mode = MODE_GRAPHICS;
        this._parseGraphics(scanner);
      } else if (0x0a === c) {
        scanner.moveNext();
        this._y += 26;
      } else if (0x0d === c) {
        scanner.moveNext();
        this._x = 0;
      } else if (0x1b === c) {
        scanner.moveNext();
        c = scanner.current();
        if (0x03 === c) {
          scanner.moveNext();
          this.sendMessage(
            "command/change-emulation-mode",
            "vt100");
          coUtils.Debug.reportWarning(
            _("DECSET 38 - Leave Tektronix mode (DECTEK)."));
          return null;
        } else if (0x05 === c) {
          scanner.moveNext();
        } else if (0x0c === c) {
          scanner.moveNext();
          this._mode = MODE_ALPHA;
          dom.context.clearRect(
            0, 0,
            this._width / this._scale,
            this._height / this._scale);
        } else if (0x0e === c) {
          scanner.moveNext();
        } else if (0x0f === c) {
          scanner.moveNext();
        } else if (0x5b === c) {     // [
          scanner.moveNext();
          c = scanner.current();
          if (0x3f === c) {          // ?
            scanner.moveNext();
            c = scanner.current();
            if (0x33 === c) {        // 3
              scanner.moveNext();
              c = scanner.current();
              if (0x38 === c) {      // 8
                scanner.moveNext();
                c = scanner.current();
                if (0x68 === c) {           // h
                } else if (0x6c === c) {    // l
                  this.sendMessage("command/change-emulation-mode", "vt100");
                  coUtils.Debug.reportWarning(
                    _("DECSET 38 - Leave Tektronix mode (DECTEK)."));
                }
              }
            }
          }
        } else if (0x60 === c) { // ` : Normal X Axis and Normal (solid) Vectors.
          coUtils.Debug.reportWarning(_("esc `"));
          scanner.moveNext();
        } else if (0x61 === c) { // a : Normal X Axis and Normal (solid) Vectors.
          coUtils.Debug.reportWarning(_("esc a"));
          scanner.moveNext();
        } else if (0x62 === c) { // b : Normal X Axis and Normal (solid) Vectors.
          coUtils.Debug.reportWarning(_("esc b"));
          scanner.moveNext();
        } else if (0x63 === c) { // c : Normal X Axis and Normal (solid) Vectors.
          coUtils.Debug.reportWarning(_("esc c"));
          scanner.moveNext();
        } else if (0x64 === c) { // d : Normal X Axis and Normal (solid) Vectors.
          coUtils.Debug.reportWarning(_("esc d"));
          scanner.moveNext();
        } else if (0x68 === c) { // h : Normal X Axis and Normal (solid) Vectors.
          coUtils.Debug.reportWarning(_("esc h"));
          scanner.moveNext();
        } else if (0x69 === c) { // i : Normal X Axis and Normal (solid) Vectors.
          coUtils.Debug.reportWarning(_("esc i"));
          scanner.moveNext();
        } else if (0x6a === c) { // j : Normal X Axis and Normal (solid) Vectors.
          coUtils.Debug.reportWarning(_("esc j"));
          scanner.moveNext();
        } else if (0x6b === c) { // k : Normal X Axis and Normal (solid) Vectors.
          coUtils.Debug.reportWarning(_("esc k"));
          scanner.moveNext();
        } else if (0x6c === c) { // l : Normal X Axis and Normal (solid) Vectors.
          coUtils.Debug.reportWarning(_("esc l"));
          scanner.moveNext();
        } else if (0x70 === c) { // p : Normal X Axis and Normal (solid) Vectors.
          coUtils.Debug.reportWarning(_("esc p"));
          scanner.moveNext();
        } else if (0x71 === c) { // q : Normal X Axis and Normal (solid) Vectors.
          coUtils.Debug.reportWarning(_("esc q"));
          scanner.moveNext();
        } else if (0x72 === c) { // r : Normal X Axis and Normal (solid) Vectors.
          coUtils.Debug.reportWarning(_("esc r"));
          scanner.moveNext();
        } else if (0x73 === c) { // s : Normal X Axis and Normal (solid) Vectors.
          coUtils.Debug.reportWarning(_("esc s"));
          scanner.moveNext();
        } else if (0x74 === c) { // t : Normal X Axis and Normal (solid) Vectors.
          coUtils.Debug.reportWarning(_("esc t"));
          scanner.moveNext();
        } else {
          scanner.moveNext();
        }
      } else if (0x0c === c) {
        this._mode = MODE_ALPHA;
        dom.context.clearRect(
          0, 0,
          this._width / this._scale,
          this._height / this._scale);
        scanner.moveNext();
      } else if (0x1f === c) { // <US> Alpha Mode
        this._mode = MODE_ALPHA;
        scanner.moveNext();
        continue;
      } else if (c < 0x20) {
        scanner.moveNext();
        coUtils.Debug.reportWarning(_("Unhandled character: %s"), c);
      } else if (this._mode === MODE_GRAPHICS) {
        this._parseGraphics(scanner);
      } else if (this._mode === MODE_ALPHA) {
        buffer = [];
        while (true) {
          if (scanner.isEnd) {
            break;
          }
          c = scanner.current();
          if (c < 20 || c > 0x7f) {
            break;
          }
          buffer.push(c);
          scanner.moveNext();
        }
        text = coUtils.Text.safeConvertFromArray(buffer);

        dom.context.fillText(text, this._x, this._y);
//        coUtils.Debug.reportError(
//          "text: " + text + "[" + this._x + "," + this._y + "]" + "[" + buffer + "]");

      } else {
        scanner.moveNext();
      }

    } // while


    } catch (e) {
      coUtils.Debug.reportError(e);
    }
    return function() {};
  },

  /** test */
  "[test]":
  function()
  {
  },


}; // tektronix

/**
 * @fn main
 * @brief Module entry point.
 * @param {Broker} broker The Broker object.
 */
function main(broker)
{
  new Tektronix(broker);
}

// EOF
