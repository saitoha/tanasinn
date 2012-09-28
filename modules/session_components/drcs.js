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

function char2sixelbits(c) 
{
  var code = "0000000" + (c.charCodeAt(0) - "?".charCodeAt(0)).toString(2);

  return code
    .substr(-6)
    .split("")
    .reverse();
}

/**
 *  @class DRCSBuffer
 */
var DRCSBuffer = new Class().extends(Plugin);
DRCSBuffer.definition = {

  id: "drcs_buffer",

  getInfo: function getInfo()
  {
    return {
      name: _("DRCS Buffer"),
      version: "0.1",
      description: _("Provides DRCS(Dynamic Rendering Character Set) buffers.")
    };
  },

  "[persistable] enabled_when_startup": true,

  _map: null,
  _g0: "B",
  _g1: "B",

  /** installs itself. 
   *  @param {Broker} broker A Broker object.
   */
  "[install]":
  function install(broker) 
  {
    this._map = {};
  },

  /** Uninstalls itself.
   *  @param {Broker} broker A broker object.
   */
  "[uninstall]":
  function uninstall(broker) 
  {
    var dscs;

    if (null !== this._map) {
      for (dscs in this._map) {
        this._map[dscs].drcs_canvas = null;
      }
      this._map = null;
    }
  },

  getDRCSInfo: function getDRCSInfo(code) 
  {
    var drcs_info;

    if (this._map) {
      drcs_info = this._map[this._g0];
      if (drcs_info) {
        if (drcs_info.start_code <= code && code < drcs_info.end_code) {
          return drcs_info;
        }
      }
    }
    return null;
  },

  "[subscribe('sequence/dcs'), pnp]":
  function onDCS(data) 
  {
    var pattern,
        match,
        canvas;

    //           Pfn    Pcn      Pe      Pcmw     Pw      Pt      Pcmh     Pcss    Dscs
    pattern = /^([01]);([0-9]+);([012]);([0-9]+);([012]);([012]);([0-9]+);([01])\{(\s*[0-~])([\?-~\/;\n\r]+)$/;
    match = data.match(pattern);

    if (null === match) {
      return;
    }

    var [
      all,
      pfn,   // Pfn Font number
      pcn,   // Starting Character
      pe,    // Erase control:
             //   0: erase all characters in the DRCS buffer with this number, 
             //      width and rendition. 
             //   1: erase only characters in locations being reloaded.
             //   2: erase all renditions of the soft character set 
             //      (normal, bold, 80-column, 132-column).
             //   
      pcmw,  // Character matrix width
             //   Selects the maximum character cell width.
             //   0: 15 pxiels wide for 80 columns, 9pixels wide for 132 columns. (Default)
             //   1: illegal
             //   2: 5 x 10 pixel cell
             //   3: 6 x 10 pixel cell
             //   4: 7 x 10 pixel cell
             //   5: 5 pixels wide
             //   6: 6 pixels wide
             //   ...
             //   15: 15 pixcels wide
      pw,    // Font width        
             //   Selects the number of columns per line (font set size).
             //   0: 80 columns. (Default)
             //   1: 80 columns.
             //   2: 132 columns.
      pt,    // Text or full-cell
             //   0: text. (Default)
             //   1: text.
             //   2: full cell.
      pcmh,  // Character matrix height
             //   Selects the maximum character cell height.
             //   0: 12 pxels high. (Default)
             //   1: 1 pixcels high.
             //   2: 2 pixcels high.
             //   2: 3 pixcels high.
             //   ...
             //   12: 12 pixcels high.
      pcss,  // Character set size
             //   Defines the character set as a 94- or 96-character graphic set.
             //   0: 94-character set. (Default)
             //   1: 96-character set.
             //   2: unicode.
      dscs,  //
      value //
    ] = match;

    var char_width = {
      0: 2 === Number(pw) ? 9: 15,
      2: 5,
      3: 6,
      4: 7,
    } [pcmw] || Number(pcmw);

    var char_height = {
      2: 10,
      3: 10,
      4: 10,
    } [pcmw] || Number(pcmh) || 12;

    var charset_size = 0 === Number(pcss) ? 94: 96;
    var full_cell = 2 === Number(pt);
    var start_code = 0 === Number(pcss) ? ({ // 94 character set.
      0: 0x21,
    }  [pcn] || Number(pcn) + 0x21) 
    : 1 === Number(pcss) ? Number(pcn) + 0x20 // 96 character set.
    : Number(pcn) + 0x20; // unicode character set.

    this._map = this._map || {};
    if (this._map[dscs]) {
      canvas = this._map[dscs].drcs_canvas;
    } else {
      canvas = this.request(
        "command/construct-chrome",
        {
          //parentNode: "#tanasinn_chrome",
          tagName: "html:canvas",
        })["#root"];
    }

    canvas.width = char_width * 97;
    canvas.height = char_height * 1;

    var pointer_x = start_code * char_width;
    var imagedata = canvas
      .getContext("2d")
      .getImageData(0, 0, canvas.width, canvas.height);

    var sixels = value.split(";");

    for (var [n, glyph] in Iterator(sixels)) {
      for (var [h, line] in Iterator(glyph.split("/"))) {
        for (var [x, c] in Iterator(line.replace(/[^\?-~]/g, "").split(""))) {
          var bits = char2sixelbits(c); 
          for (var [y, bit] in Iterator(bits)) {
            var position = (((y + h * 6) * 97 + n) * char_width + x) * 4;
            if ("1" === bit) {
              imagedata.data[position + 0] = 255;
              imagedata.data[position + 1] = 255;
              imagedata.data[position + 2] = 255;
              imagedata.data[position + 3] = 255;
            } else {
          //    imagedata.data[position + 3] = 255;
            }
          }
        }
      }
    }

    canvas.getContext("2d").putImageData(imagedata, 0, 0);

    var drcs = {
      dscs: dscs,
      drcs_canvas: canvas,
      drcs_width: char_width,
      drcs_height: char_height,
      drcs_top: 0,
      start_code: start_code,
      end_code: start_code + sixels.length,
      full_cell: full_cell,
      color: false,
    };

    this.sendMessage("command/alloc-drcs", drcs);
  },

  "[subscribe('command/alloc-drcs'), pnp]":
  function allocDRCS(drcs)
  {
    this._map[drcs.dscs] = drcs; 
  },

} // class DRCSBuffer

/**
 * @fn main
 * @brief Module entry point.
 * @param {Broker} broker The Broker object.
 */
function main(broker) 
{
  new DRCSBuffer(broker);
}

// EOF
