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
 *  @class Sixel
 */
var Sixel = new Class().extends(Plugin)
                       .depends("sixel_parser")
                       .depends("renderer")
                       .depends("screen")
                       ;
Sixel.definition = {

  id: "sixel",

  getInfo: function getInfo()
  {
    return {
      name: _("Sixel"),
      version: "0.1",
      description: _("Provides overlay Sixel rendering layer.")
    };
  },

  "[persistable] enabled_when_startup": true,

  /** UI template */
  getTemplate: function getTemplate() 
  {
    return {
      parentNode: "#tanasinn_center_area",
      tagName: "html:canvas",
      id: "sixel_canvas",
    };
  },

  _color: null,
  _buffers: null,
  _no: 0x20,
  _display_mode: false,

  /** installs itself. 
   *  @param {Broker} broker A Broker object.
   */
  "[install]":
  function install(broker) 
  {
    this._buffers = [];

    this._renderer = this.dependency["renderer"];
    this._screen = this.dependency["screen"];
    this._sixel_parser = this.dependency["sixel_parser"];
  },

  /** Uninstalls itself.
   *  @param {Broker} broker A broker object.
   */
  "[uninstall]":
  function uninstall(broker) 
  {
    var i = 0,
        buffer;

    this._map = null;

    for (; i < this._buffers.length; ++i) {
      buffer = this._buffers[i];
      if (buffer.canvas.parentNode) {
      //  buffer.canvas.parentNode.removeChild(buffer.canvas);
      }
      buffer.canvas = null;
      buffer.context = null;
    }

    this._buffers = null;
    this._renderer = null;
    this._screen = null;
    this._sixel_parser = null;
  },

  _createNewCanvas: function _createNewCanvas()
  {
    var renderer = this._renderer,
        screen = this._screen,
        sixel_canvas,
        dom;

    if (this._display_mode) { // sixel display mode

      sixel_canvas = this.request(
        "command/construct-chrome",
        {
          parentNode: "#tanasinn_center_area",
          tagName: "html:canvas",
          id: "sixel_canvas",
        }).sixel_canvas,

      sixel_canvas.width = renderer.char_width * screen.width;
      sixel_canvas.height = renderer.line_height * screen.height;

      dom = { 
        canvas: sixel_canvas,
        context: sixel_canvas.getContext("2d"),
      };

    } else { // sixel scrolling mode

      sixel_canvas = this.request(
        "command/construct-chrome",
        {
          tagName: "html:canvas",
          id: "sixel_canvas",
        }).sixel_canvas,

      sixel_canvas.width = renderer.char_width * screen.width;
      sixel_canvas.height = renderer.line_height * screen.height * 2;

      dom = { 
        canvas: sixel_canvas,
        context: sixel_canvas.getContext("2d"),
      };

      this._buffers.push(dom);
    }
    return dom;
  },

  "[subscribe('command/change-sixel-display-mode'), pnp]":
  function onSixelDisplayModeChanged(mode)
  {
    this._display_mode = mode;
  },

  "[subscribe('sequence/dcs'), pnp]":
  function onDCS(data) 
  {
    var pattern = /^([0-9]);([01]);([0-9]+);?q((?:.|[\n\r])+)/,
        match = data.match(pattern),
        sixel;

    if (null === match) {
      return;
    }

    sixel = match[4];
    if (!sixel) {
      return;
    }

    this._parseSixel(sixel);
  },

  _parseSixel: function _parseSixel(sixel)
  {
    var dom = this._createNewCanvas(),
        result = this._sixel_parser.parse(sixel, dom),
        renderer = this._renderer,
        line_height = renderer.line_height,
        char_width = renderer.char_width,
        line_count = Math.ceil(result.max_y / line_height),
        cell_count = Math.ceil(result.max_x / char_width),
        start_code = 0x21,
        end_code = start_code + cell_count,
        full_cell = true,
        buffer = [],
        screen = this._screen,
        positionX = screen.cursor.positionX,
        dscs,
        drcs,
        i;

    for (i = start_code; i < end_code; ++i) {
      buffer.push(i);
    }

    for (i = 0; i < line_count; ++i) {
      dscs = "_" + String.fromCharCode(++this._no);
      drcs = {
        dscs: dscs,
        drcs_canvas: result.canvas,
        drcs_width: char_width,
        drcs_height: line_height,
        drcs_top: line_height * i,
        start_code: start_code,
        end_code: end_code,
        full_cell: full_cell,
        color: true,
      };
      this.sendMessage("command/alloc-drcs", drcs);
      this.sendMessage("sequence/g0", dscs);
      screen.write(buffer);
      this.sendMessage("sequence/g0", "B");
      screen.carriageReturn();
      screen.lineFeed();
      screen.cursor.positionX = positionX;
    }
    screen.lineFeed();
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

// EOF
