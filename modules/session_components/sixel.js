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
                       .depends("cursorstate")
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
  _no: 0x0,
  _display_mode: false,

  _renderer: null,
  _screen: null,
  _sixel_parser: null,

  /** Installs itself. 
   *  @param {InstallContext} context A InstallContext object.
   */
  "[install]":
  function install(context) 
  {
    this._buffers = [];

    this._renderer = context["renderer"];
    this._screen = context["screen"];
    this._cursor_state = context["cursorstate"];
    this._sixel_parser = context["sixel_parser"];
  },

  /** Uninstalls itself.
   */
  "[uninstall]":
  function uninstall() 
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
    this._cursor_state = null;
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
    var pattern = /^(?:[0-9;]*)?q((?:.|[\n\r])+)/,
        match = data.match(pattern),
        sixel;

    if (null === match) {
      return;
    }

    sixel = match[1];
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
        cursor_state = this._cursor_state,
        line_height = renderer.line_height,
        char_width = renderer.char_width,
        line_count = Math.ceil(result.max_y / line_height),
        cell_count = Math.ceil(result.max_x / char_width),
        start_code = 0x21,
        end_code = start_code + cell_count,
        full_cell = true,
        buffer,
        screen = this._screen,
        positionX = cursor_state.positionX,
        dscs,
        drcs,
        i = 0,
        j;

    for (; i < line_count; ++i) {
      dscs = " " + String.fromCharCode(0x20 + ++this._no % 94);
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

      buffer = [];
      for (j = start_code; j < end_code; ++j) {
        buffer.push(0x100000 | (0x20 + this._no % 94) << 8 | j);
      }

      screen.write(buffer);

      screen.carriageReturn();
      screen.lineFeed();

      cursor_state.positionX = positionX;
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
