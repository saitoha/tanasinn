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
 *  @class DRCSBuffer
 */
let DRCSBuffer = new Class().extends(Plugin);
DRCSBuffer.definition = {

  get id()
    "drcs_buffer",

  get info()
    <module>
        <name>{_("DRCS Buffer")}</name>
        <version>0.1</version>
        <description>{
          _("Provides DRCS(Dynamic Rendering Character Set) buffers.")
        }</description>
    </module>,

  get template()
    ({
      tagName: "html:canvas",
      id: "tanasinn_drcs_canvas",
    }),

  "[persistable] enabled_when_startup": true,

  _map: null,
  _g0: "B",
  _g1: "B",

  /** installs itself. 
   *  @param {Session} session A session object.
   */
  "[subscribe('install/drcs_buffer'), enabled]":
  function install(session) 
  {
    this.onDCS.enabled = true;
    this.onSCSG0.enabled = true;
    this.onSCSG1.enabled = true;
    this._map = {};

    let {tanasinn_drcs_canvas} = session.uniget(
      "command/construct-chrome", this.template);
    // set initial size.
    this._canvas = tanasinn_drcs_canvas;
  },

  /** Uninstalls itself.
   *  @param {Session} session A session object.
   */
  "[subscribe('uninstall/drcs_buffer'), enabled]":
  function uninstall(session) 
  {
    this._map = null;
    this.onDCS.enabled = false;
    this.onSCSG0.enabled = false;
    this.onSCSG1.enabled = false;
    this._canvas = null;
  },

  "[subscribe('sequence/g0')]":
  function onSCSG0(mode) 
  {
    let broker = this._broker;
    this._g0 = mode;
    if (this._map[mode]) {
      broker.notify("event/drcs-state-changed/g0", this._map[mode]);
    } else {
      broker.notify("event/drcs-state-changed/g0", null);
    }
  },

  "[subscribe('sequence/g1')]":
  function onSCSG1(mode) 
  {
    let broker = this._broker;
    this._g1 = mode;
    if (this._map[mode]) {
      broker.notify("event/drcs-state-changed/g1", this._map[mode]);
    } else {
      broker.notify("event/drcs-state-changed/g1", null);
    }
  },

  getDRCSInfo: function getDRCSInfo(code) 
  {
    if (this._map) {
      let drcs_info = this._map[this._g0];
      if (drcs_info) {
        if (drcs_info.start_code <= code && code < drcs_info.end_code) {
          return drcs_info;
        }
      }
    }
    return null;
  },

  "[subscribe('sequence/dcs')]":
  function onDCS(data) 
  {
    //               Pfn    Pcn      Pe      Pcmw     Pw      Pt      Pcmh     Pcss    Dscs
    let pattern = /^([01]);([0-9]+);([012]);([0-9]+);([012]);([012]);([0-9]+);([01])\{\s*([0-~])([\?-~\/;\n\r]+)$/;
    let match = data.match(pattern);
    if (null === match) {
      return;
    }
    let [
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

    let char_width = {
      0: 2 == pw ? 9: 15,
      2: 5,
      3: 6,
      4: 7,
    } [pcmw] || Number(pcmw);
    let char_height = {
      2: 10,
      3: 10,
      4: 10,
    } [pcmw] || Number(pcmh) || 12;
    let charset_size = 0 == pcss ? 94: 96;
    let full_cell = pt == 2;
    let start_code = 0 == pcss ? ({ // 94 character set.
      0: 0x21,
    }  [pcn] || Number(pcn) + 0x21) 
    : 1 == pcss ? Number(pcn) + 0x20 // 96 character set.
    : Number(pcn) + 0x20; // unicode character set.

    this._canvas.width = char_width * 96;
    this._canvas.height = char_height * 1;
    let pointer_x = start_code * char_width;

    function char2sixelbits(c) {
      return ("0000000" + (c.charCodeAt(0) - "?".charCodeAt(0)).toString(2))
        .substr(-6).split("").reverse();
    }

    let imagedata = this._canvas
      .getContext("2d")
      .getImageData(0, 0, this._canvas.width, this._canvas.height);
    let sixels = value.split(";");
    for (let [n, glyph] in Iterator(sixels)) {
      for (let [h, line] in Iterator(glyph.split("/"))) {
        for (let [x, c] in Iterator(line.replace(/[^\?-~]/g, "").split(""))) {
          let bits = char2sixelbits(c); 
          for (let [y, bit] in Iterator(bits)) {
            let position = (((y + h * 6) * 96 + n) * char_width + x) * 4;
            if ("1" == bit) {
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

    this._canvas.getContext("2d").putImageData(imagedata, 0, 0);
    this._map[dscs] = {
      dscs: dscs,
      drcs_canvas: this._canvas,
      drcs_width: char_width,
      drcs_height: char_height,
      start_code: start_code,
      end_code: start_code + sixels.length,
      full_cell: full_cell,
    };
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

