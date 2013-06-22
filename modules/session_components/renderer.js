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
 * Portions created by the Initial Developer are Copyright (C) 2010 - 2013
 * the Initial Developer. All Rights Reserved.
 *
 * ***** END LICENSE BLOCK ***** */

"use strict";

function wait(span)
{
  var end_time = Date.now() + span,
      current_thread = coUtils.Services.getThreadManager().currentThread;

  do {
    current_thread.processNextEvent(true);
  } while ((current_thread.hasPendingEvents()) || Date.now() < end_time);
};


//////////////////////////////////////////////////////////////////////////////
//
// Concepts
//

/**
 * @Concept PersistentConcept
 *
 */
var PersistentConcept = new Concept();
PersistentConcept.definition = {

  id: "PersistentConcept",

  "<@command/backup> :: Object -> Undefined":
  _("Serialize and persist current state."),

  "<@command/restore-fast> :: Object -> Undefined":
  _("Deserialize and restore stored state."),

}; // concept PersistentConcept

/**
 * @trait PersistentTrait
 */
var PersistentTrait = new Trait();
PersistentTrait.definition = {

   _thumb_lastupdate: 0,

  /**
   * Serialize snd persist current state.
   */
  "[subscribe('@command/backup'), type('Object -> Undefined'), enabled]":
  function backup(context)
  {
    var path,
        file;

    // serialize this plugin object.
    context[this.id] = {
      line_height: this.line_height,
      font_family: this.font_family,
      font_size: this.font_size,
      force_precious_rendering: this.force_precious_rendering,
    };

    this.onIdle();
  },

  /**
   * Deserialize snd restore stored state.
   */
  "[subscribe('@command/restore-fast'), type('Object -> Undefined'), pnp]":
  function restore(context)
  {
    var data = context[this.id];

    if (data) {
      this.force_monospace_rendering = data.force_precious_rendering;
      this.line_height = data.line_height;
      this.font_family = data.font_family;
      this.font_size = data.font_size;
    } else {
      coUtils.Debug.reportWarning(
        _("Cannot restore last state of renderer: data not found."));
    }
  },

  "[subscribe('event/idle'), pnp]":
  function onIdle()
  {
    var thumb_update = new Date().getTime();

    if (thumb_update - this._thumb_lastupdate > 30 * 1000) {

      this._thumb_lastupdate = thumb_update;
      // make image file path
      var path = coUtils.Runtime.getRuntimePath()
               + "/persist/"
               + this._broker.request_id
               + ".png",
          file = coUtils.File.getFileLeafFromVirtualPath(path),
          canvas = this._main_layer.canvas,
          background = this._palette.background_color;

      coUtils.IO.saveCanvas(canvas, file, false, background);
    }
  },

}; // trait PersistentTrait

/**
 * @trait SlowBlinkTrait
 */
var SlowBlinkTrait = new Trait();
SlowBlinkTrait.definition = {

  /**
   *
   */
  createSlowBlinkLayer: function createSlowBlinkLayer()
  {
    var broker = this._broker,
        layer = new Layer(broker, "slowblink_canvas");

    layer.setWidth(this._main_layer.getWidth());
    layer.setHeight(this._main_layer.getHeight());

    this._slow_blink_layer = layer;

    coUtils.Timer.setTimeout(
      function timerProc()
      {
        if (null !== this._slow_blink_layer) {
          this._slow_blink_layer.canvas.style.opacity
            = 1 - this._slow_blink_layer.canvas.style.opacity;
          coUtils.Timer.setTimeout(timerProc, this.slow_blink_interval, this);
        }
      }, this.slow_blink_interval, this);

  }, // createSlowBlinkLayer

}; // SlowBlinkTrait

/**
 * @trait RapidBlinkTrait
 */
var RapidBlinkTrait = new Trait();
RapidBlinkTrait.definition = {

  /**
   *
   */
  createRapidBlinkLayer: function createRapidBlinkLayer()
  {
    var broker = this._broker;

    this._rapid_blink_layer = new Layer(broker, "rapidblink_canvas");
    this._rapid_blink_layer.setWidth(this._main_layer.getWidth());
    this._rapid_blink_layer.setHeight(this._main_layer.getHeight());

    coUtils.Timer.setTimeout(
      function timerProc()
      {
        if (null !== this._rapid_blink_layer) {
          this._rapid_blink_layer.canvas.style.opacity
            = 1 - this._rapid_blink_layer.canvas.style.opacity;
          coUtils.Timer.setTimeout(timerProc, this.rapid_blink_interval, this);
        }
      }, this.rapid_blink_interval, this);

  }, // createRapidBlinkLayer

}; // RapidBlinkTrait

/**
 * @class Layer
 */
var Layer = new Class();
Layer.definition = {

  canvas: null,
  context: null,

  getWidth: function getWidth()
  {
    return this.canvas.width;
  },

  setWidth: function setWidth(value)
  {
    this.canvas.width = value;
  },

  getHeight: function getHeight()
  {
    return this.canvas.height;
  },

  setHeight: function setHeight(value)
  {
    this.canvas.height = value;
  },

  get smoothing()
  {
    return this.context.mozImageSmoothingEnabled;
  },

  set smoothing(value)
  {
    this.context.mozImageSmoothingEnabled = value;
  },

  /** Constructor */
  initialize: function initialize(broker, id)
  {
    var canvas = broker.callSync(
      "command/construct-chrome",
      {
        parentNode: "#tanasinn_center_area",
        tagName: "html:canvas",
        id: id,
        dir: "ltr",
      })[id];

    this.canvas = canvas;
    this.context = canvas.getContext("2d");
  },

  /** Release and destroy DOM resources. */
  destroy: function destroy()
  {
    this.canvas.parentNode.removeChild(this.canvas);
    this.canvas = null;
    this.context = null;
  },

}; // class Layer


/**
 * @class Renderer
 * @brief Scan screen state and render it to canvas element.
 */
var Renderer = new Class().extends(Plugin)
                          .mix(PersistentTrait)
                          .mix(SlowBlinkTrait)
                          .mix(RapidBlinkTrait)
                          .depends("palette")
                          .depends("screen")
                          .requires("PersistentConcept");
Renderer.definition = {

  id: "renderer",

  /** plugin information */
  getInfo: function getInfo()
  {
    return {
      name: _("Renderer"),
      version: "0.2.0",
      description: _("Handles draw event and render output data to main canvas.")
    };
  },

  "[persistable] enabled_when_startup": true,

  // cell geometry (in pixel)
  "[watchable, persistable] line_height": 18,
  "[watchable] char_width": 6.5,
  "[watchable] char_height": 4,
  "[watchable] char_offset": 11,
  "[persistable] slow_blink_interval": 800,
  "[persistable] rapid_blink_interval": 400,

  _text_offset: 10,

  _offset: 0,

  _main_layer: null,
  _slow_blink_layer: null,
  _rapid_blink_layer: null,
  _drcs_map: null,
  _drcs_canvas: null,

  // font
  "[watchable, persistable] font_family":
    "Monaco,Menlo,Lucida Console,DejaVu Sans Mono,monospace",

  "[watchable, persistable] font_size": 16,

  "[persistable] force_precious_rendering": false,
  "[persistable] normal_alpha": 1.00,
  "[persistable] halfbright_alpha": 0.64,
  "[persistable] background_alpha": 0.64,
  "[persistable] bold_alpha": 1.00,
  "[persistable] bold_as_blur": false,
  "[persistable] enable_text_shadow": false,
  "[persistable] enable_render_bold_as_textshadow": true,
  "[persistable] shadow_color": "white",
  "[persistable] shadow_offset_x": 0.00,
  "[persistable] shadow_offset_y": 0.00,
  "[persistable] shadow_blur": 2.00,
  "[persistable] transparent_color": 0,
  "[persistable, watchable] smoothing": true,

  _screen: null,
  _palette: null,

  /** Installs itself.
   *  @param {InstallContext} context A InstallContext object.
   */
  "[install]":
  function install(context)
  {
    this._screen = context["screen"];
    this._palette = context["palette"];

    this._main_layer = new Layer(this._broker, "foreground_canvas");

    // set smoothing configuration
    this._main_layer.smoothing = this.smoothing;

    this._calculateGlyphSize();
    this.onWidthChanged();
    this.onHeightChanged();

    this._drcs_map = {};
  },

  /** Uninstalls itself.
   */
  "[uninstall]":
  function uninstall()
  {
    this._screen = null;

    if (null !== this._main_layer) {
      this._main_layer.destroy();
      this._main_layer = null;
    }

    if (null !== this._slow_blink_layer) {
      this._slow_blink_layer.destroy();
      this._slow_blink_layer = null;
    }

    if (null !== this._rapid_blink_layer) {
      this._rapid_blink_layer.destroy();
      this._rapid_blink_layer = null;
    }

    this._drcs_map = null;
    this._drcs_canvas = null;

    this._screen = null;
  },

  "[subscribe('command/calculate-layout'), pnp]":
  function calculateLayout()
  {
    this.onWidthChanged();
    this.onHeightChanged();
    this.sendMessage("command/draw", true);
  },

  "[subscribe('@command/focus'), pnp]":
  function onFirstFocus()
  {
    this.onWidthChanged();
    this.onHeightChanged();
  },

  getCanvas: function getCanvas(context)
  {
    return this._main_layer.canvas;
  },

  "[subscribe('command/paint-foreground'), pnp]":
  function paintForeground(context)
  {
    context.drawImage(this._main_layer.canvas, 0, 0);
  },

  /** Take screen capture and save it in png format. */
  "[subscribe('command/capture-screen'), pnp]":
  function captureScreen(info)
  {
    var canvas = this._main_layer.canvas,
        background = this._palette.background_color,
        path = info.path,
        file;

    file = coUtils.File
      .getFileLeafFromVirtualPath(path)
      .QueryInterface(Components.interfaces.nsIFile);

    // create base directories recursively (= mkdir -p).
    void function make_directory(current)
    {
      var parent;

      parent = current.parent;

      if (!parent.exists()) {
        make_directory(parent);
        parent.create(Components.interfaces.nsIFile.DIRECTORY_TYPE, -1);
      }
    } (file);

    coUtils.IO.saveCanvas(canvas,
                          file,
                          info.thumbnail,
                          background);
  },

  /** Called when the setting variable renderer.smoothing is changed. */
  "[subscribe('variable-changed/renderer.smoothing'), enabled]":
  function onSmoothingChanged(value)
  {
    if (this._main_layer) {
      this._main_layer.smoothing = value;
    }
    if (this._slow_blink_layer) {
      this._slow_blink_layer.smoothing = value;
    }
    if (this._rapid_blink_layer) {
      this._rapid_blink_layer.smoothing = value;
    }
  },

  /** Change font size and dispatch 'event/font-size-changed' event. */
  "[subscribe('set/font-size'), pnp]":
  function setFontSize(font_size)
  {
    this.line_height += font_size - this.font_size;
    this.font_size = font_size;

    this.sendMessage("event/font-size-changed", this.font_size);
  },

  /** Change font family */
  "[subscribe('set/font-family'), pnp]":
  function setFontFamily(font_family)
  {
    this.font_family = font_family;
  },

  /** Called when the setting variable renderer.{size|family} is changed. */
  "[subscribe('variable-changed/renderer.font_{size | family}'), pnp]":
  function onFontChanged(font_size)
  {
    this._screen.dirty = true;
    this._calculateGlyphSize();
  },

  "[subscribe('command/change-fontsize-by-offset'), pnp]":
  function changeFontSizeByOffset(offset)
  {
    this.font_size = Number(this.font_size) + offset;
    this.line_height = Number(this.line_height) + offset;

    this.sendMessage("event/font-size-changed", this.font_size);
  },

  "[subscribe('variable-changed/{screen.width | renderer.char_width}'), pnp]":
  function onWidthChanged(width, char_width)
  {
    var canvas_width;

    width = width || this._screen.width;
    char_width = char_width || this.char_width;
    canvas_width = 0 | (width * char_width);

    this._main_layer.setWidth(canvas_width);

    if (this._slow_blink_layer) {
      this._slow_blink_layer.setWidth(canvas_width);
    }
    if (this._rapid_blink_layer) {
      this._rapid_blink_layer.setWidth(canvas_width);
    }

    this.sendMessage("event/screen-width-changed", canvas_width);
  },

  "[subscribe('variable-changed/{screen.height | renderer.line_height}'), pnp]":
  function onHeightChanged(height, line_height)
  {
    var canvas_height;

    height = height || this._screen.height;
    line_height = line_height || this.line_height;
    canvas_height = 0 | (height * line_height);

    this._main_layer.setHeight(canvas_height);
    if (this._slow_blink_layer) {
      this._slow_blink_layer.setHeight(canvas_height);
    }
    if (this._rapid_blink_layer) {
      this._rapid_blink_layer.setHeight(canvas_height);
    }
    this.sendMessage("event/screen-height-changed", canvas_height);
  },

  /** Draw to canvas */
  "[subscribe('command/draw'), pnp]":
  function draw(redraw_flag)
  {
    var info,
        screen = this._screen;

    if (redraw_flag) {
      screen.dirty = true;
    }

    for (info in screen.getDirtyWords()) {
      this._drawLine(info);
    }

  }, // draw

  _drawNormalText:
  function _drawNormalText(codes, row, column, end, attr, type)
  {
    var context = this._main_layer.context,
        line_height = this.line_height,
        char_width = this.char_width,
        font_size = this.font_size,
        font_family = this.font_family,
        text_offset = this._text_offset,
        left = char_width * column,
        top = line_height * row,
        width = (char_width * (end - column)),
        height = line_height;

    this._drawBackground(context,
                         left,// | 0,
                         top,
			 width,
                         //Math.round(width + Math.ceil(left) - left),
                         height,
                         attr);

    context.font = font_size + "px " + font_family;
    if (1 === attr.italic) {
      context.font = "italic " + context.font;
    }

    this._drawWord(context,
                   codes,
                   left,// | 0,
                   top + text_offset,
                   char_width,
                   end - column,
                   height,
                   attr,
                   type);

  },

  _drawDoubleHeightTextTop:
  function _drawDoubleHeightTextTop(codes, row, column, end, attr, type)
  {
    var context = this._main_layer.context,
        line_height = this.line_height,
        char_width = this.char_width,
        font_size = this.font_size,
        font_family = this.font_family,
        text_offset = this._text_offset,
        left = char_width * 2 * column,
        top = line_height * (row + 1) + 6,
        width = char_width * 2 * (end - column),
        height = line_height;

    context.font = (font_size * 2) + "px " + font_family;
    if (1 === attr.italic) {
      context.font = "italic " + context.font;
    }

    this._drawBackground(context,
                         left | 0,
                         line_height * row,
                         width + Math.ceil(left) - left,
                         height,
                         attr);

    context.save();
    context.beginPath();
    context.rect(left, line_height * row, width, height);
    context.clip();

    this._drawWord(context,
                   codes,
                   left,
                   top + text_offset / 2,
                   char_width * 2,
                   end - column,
                   height,
                   attr,
                   type);

    context.restore();

  },

  _drawDoubleHeightTextBottom:
  function _drawDoubleHeightTextBottom(codes, row, column, end, attr, type)
  {
    var context = this._main_layer.context,
        line_height = this.line_height,
        char_width = this.char_width,
        font_size = this.font_size,
        font_family = this.font_family,
        text_offset = this._text_offset,
        left = char_width * 2 * column,
        top = line_height * row + 6,
        width = char_width * 2 * (end - column),
        height = line_height;

    context.font = (font_size * 2) + "px " + font_family;

    if (1 === attr.italic) {
      context.font = "italic " + context.font;
    }

    this._drawBackground(context,
                         left | 0,
                         line_height * row,
                         width + Math.ceil(left) - left,
                         height,
                         attr);

    context.save();
    context.beginPath();
    context.rect(left, line_height * row, width, height);
    context.clip();

    this._drawWord(context,
                   codes,
                   left,
                   top + text_offset / 2,
                   char_width * 2,
                   end - column,
                   height,
                   attr,
                   type);

    context.restore();

  },

  _drawDoubleWidthText:
  function _drawDoubleWidthText(codes, row, column, end, attr, type)
  {
    var context = this._main_layer.context,
        line_height = this.line_height,
        char_width = this.char_width,
        font_size = this.font_size,
        font_family = this.font_family,
        text_offset = this._text_offset,
        left,
        top,
        width,
        height;

    context.font = (font_size * 2) + "px " + font_family;

    if (1 === attr.italic) {
      context.font = "italic " + context.font;
    }

    left = char_width * 2 * column;
    top = line_height * row;
    width = char_width * 2 * (end - column);
    height = line_height;

    this._drawBackground(context,
                         left | 0,
                         line_height * row,
                         width + Math.ceil(left) - left,
                         height,
                         attr);

    context.save();
    context.beginPath();
    context.rect(left, line_height * row, width, height);
    context.transform(1, 0, 0, 0.5, 0, (top + text_offset) / 2);
    context.clip();

    this._drawWord(context,
                   codes,
                   left,
                   top + text_offset,
                   char_width * 2,
                   end - column,
                   height,
                   attr,
                   type);

    context.restore();

  },

  _drawLine: function _drawLine(info)
  {
    var type;

    if (info.end === info.column) {
      return;
    }

    type = info.line.type;

    switch (type) {

      case coUtils.Constant.LINETYPE_NORMAL:
        this._drawNormalText(info.codes,
                             info.row,
                             info.column,
                             info.end,
                             info.attr,
                             type);
        break;

      case coUtils.Constant.LINETYPE_TOP:
        this._drawDoubleHeightTextTop(info.codes,
                                      info.row,
                                      info.column,
                                      info.end,
                                      info.attr,
                                      type);
        break;

      case coUtils.Constant.LINETYPE_BOTTOM:
        this._drawDoubleHeightTextBottom(info.codes,
                                         info.row,
                                         info.column,
                                         info.end,
                                         info.attr,
                                         type);
        break;

      case coUtils.Constant.LINETYPE_DOUBLEWIDTH:
        this._drawDoubleWidthText(info.codes,
                                  info.row,
                                  info.column,
                                  info.end,
                                  info.attr,
                                  type);
        break;

      default:
        throw coUtils.Debug.Exception(
          _("Invalid double height mode was detected: %d."),
          type);
    }
  },

  /** Render background attribute.
   *
   */
  _drawBackground:
  function _drawBackground(context, x, y, width, height, attr)
  {
    if (1 === attr.blink) {
      if (null === this._slow_blink_layer) {
        this.createSlowBlinkLayer(this.slow_blink_interval);
      }
      this._drawBackgroundImpl(context, x, y, width, height, attr);
      this._drawBackgroundImpl(this._slow_blink_layer.context, x, y, width, height, attr);
    } else if (1 === attr.rapid_blink) {
      if (null === this._rapid_blink_layer) {
        this.createRapidBlinkLayer(this.rapid_blink_interval);
      }
      this._drawBackgroundImpl(context, x, y, width, height, attr);
      this._drawBackgroundImpl(this._rapid_blink_layer.context, x, y, width, height, attr);
    } else {
      this._drawBackgroundImpl(context, x, y, width, height, attr);
      if (null !== this._slow_blink_layer) {
        this._slow_blink_layer.context.clearRect(x, y, width, height);
      }
      if (null !== this._rapid_blink_layer) {
        this._rapid_blink_layer.context.clearRect(x, y, width, height);
      }
    }
  },

  _drawBackgroundImpl:
  function _drawBackgroundImpl(context, x, y, width, height, attr)
  {
    var back_color = this._palette.getBackColor(attr);

    if (null === back_color) {
      context.clearRect(x, y, width, height);
    } else {
      context.globalAlpha = this.background_alpha;

      /* Draw background */
      context.fillStyle = back_color;
      context.clearRect(x, y, width, height);
      context.fillRect(x, y, width, height);
    }
  },

  /** Render text in specified cells.
   */
  _drawWord:
  function _drawWord(context,
                     codes,
                     x,
                     y,
                     char_width,
                     length,
                     height,
                     attr,
                     type)
  {
    var fore_color = this._palette.getForeColor(attr),
        code,
        dscs,
        drcs_state = attr.drcs;

    if (1 === attr.invisible) {
      return;
    } else if (1 === attr.blink) {
      if (null === this._slow_blink_layer) {
        this.createSlowBlinkLayer(this.slow_blink_interval);
      }
      context = this._slow_blink_layer.context;
      context.font = this._main_layer.context.font;
    } else if (1 === attr.rapid_blink) {
      if (null === this._rapid_blink_layer) {
        this.createRapidBlinkLayer(this.rapid_blink_interval);
      }
      context = this._rapid_blink_layer.context;
      context.font = this._main_layer.context.font;
    }

    if (1 === attr.bold) {
      context.globalAlpha = this.bold_alpha;
    } else if (1 === attr.halfbright) {
      context.globalAlpha = this.halfbright_alpha;
    } else {
      context.globalAlpha = this.normal_alpha;
    }

    context.fillStyle = fore_color;

    code = codes[0];

    if (code >= 0xf0000 && 1 === codes.length) {
      length = 1;
      if (code < 0x100000) {
        codes[0] = code & 0xffff;
      } else {
        dscs = String.fromCharCode(code >>> 8 & 0xff);
        drcs_state = this._drcs_map[" " + dscs];
        codes[0] = code & 0xff;
      }
    }

    if (1 === attr.underline) {
      this._drawUnderline(context, x, y, char_width * length, fore_color);
    }

    if (drcs_state) {
      this._drawDrcs(context, codes, x, y, char_width, drcs_state, type);
    } else {
      this._drawText(context, codes, x, y, char_width, length, attr);
    }
  },

  _drawText: function _drawText(context, codes, x, y, char_width, length, attr)
  {
    var text = String.fromCharCode.apply(null, codes);

    if (this.enable_text_shadow) {
      context.shadowColor = context.fillStyle;//this.shadow_color;
      context.shadowOffsetX = this.shadow_offset_x;
      context.shadowOffsetY = this.shadow_offset_y;
      context.shadowBlur = this.shadow_blur;
      context.fillText(text, x, y, char_width * length);
    //} else {
    //  context.shadowOffsetX = 0;
    //  context.shadowBlur = 0;
    }

    context.fillText(text, x, y, char_width * length);
    //context.fillText(text.replace(/ +$/, ""), x, y);
    if ( this.bold_as_blur && 1 === attr.bold) {
      context.fillText(text, x + 1, y, char_width * length - 1);
    }
  },

  _drawDrcs: function _drawDrcs(context, codes, x, y, char_width, drcs_state, type)
  {
    var index = 0,
        code,
        glyph_index,
        source_top,
        source_left,
        source_width,
        source_height,
        destination_top,
        destination_left,
        destination_width,
        destination_height,
        drcs_context;

    for (; index < codes.length; ++index) {
      code = codes[index] - this._offset;
      if (drcs_state.start_code <= code && code <= drcs_state.end_code) {
        //var glyph = drcs_state.glyphs[code - drcs_state.start_code];
        //context.putImageData(glyph, 0, 0)

        glyph_index = code - drcs_state.start_code;

        switch (type) {

          case 0:
            source_left = glyph_index * drcs_state.drcs_width;
            source_top = drcs_state.drcs_top;
            source_width = drcs_state.drcs_width;
            source_height = drcs_state.drcs_height;
            destination_left = Math.floor(x + index * char_width);
            destination_top = y - this._text_offset;
            destination_width = Math.ceil(char_width);
            destination_height = this.line_height;
            break;

          case 1:
            source_left = glyph_index * drcs_state.drcs_width;
            source_top = drcs_state.drcs_top;
            source_width = drcs_state.drcs_width;
            source_height = drcs_state.drcs_height / 2;
            destination_left = Math.floor(x + index * char_width);
            destination_top = y - this._text_offset - this.line_height;
            destination_width = Math.ceil(char_width);
            destination_height = this.line_height;
            break;

          case 2:
            source_left = glyph_index * drcs_state.drcs_width;
            source_top = drcs_state.drcs_top + drcs_state.drcs_height / 2;
            source_width = drcs_state.drcs_width;
            source_height = drcs_state.drcs_height / 2;
            destination_left = Math.floor(x + index * char_width);
            destination_top = y - this._text_offset;
            destination_width = Math.ceil(char_width);
            destination_height = this.line_height;
            break;

          case 3:
            source_left = glyph_index * drcs_state.drcs_width;
            source_top = drcs_state.drcs_top;
            source_width = drcs_state.drcs_width;
            source_height = drcs_state.drcs_height;
            destination_left = Math.floor(x + index * char_width);
            destination_top = y - this._text_offset
            destination_width = Math.ceil(char_width);
            destination_height = this.line_height;
            break;
        }
        if (drcs_state.color) {
          context.drawImage(
            drcs_state.drcs_canvas,
            source_left,            // source left
            source_top,             // source top
            source_width,           // source width
            source_height,          // source height
            destination_left,       // destination left
            destination_top,        // destination top
            destination_width,      // destination width
            destination_height);    // destination height
        } else {
          if (null === this._drcs_canvas) {
            this._drcs_canvas = this.request(
              "command/construct-chrome",
              {
                tagName: "html:canvas",
                id: "tanasinn_drcs_offscreen_canvas",
                width: 300,
                height: 300,
              }).tanasinn_drcs_offscreen_canvas;
          }
          drcs_context = this._drcs_canvas.getContext("2d");
          context.globalAlpha = 1.0;
          drcs_context.clearRect(
            0,                          // destination left
            0,                          // destination top
            destination_width,          // destination width
            destination_height);        // destination height
          drcs_context.drawImage(
            drcs_state.drcs_canvas,
            source_left,                // source left
            source_top,                 // source top
            source_width,               // source width
            source_height,              // source height
            0,                          // destination left
            0,                          // destination top
            destination_width,          // destination width
            destination_height);        // destination height
          drcs_context.fillStyle = context.fillStyle;
          drcs_context.globalCompositeOperation = "source-atop";
          drcs_context.fillRect(0,
                                0,
                                destination_width,
                                destination_height);
          drcs_context.globalCompositeOperation = "source-over";
          context.drawImage(
            this._drcs_canvas,
            0,                          // source left
            0,                          // source top
            destination_width,          // source width
            destination_height,         // source height
            destination_left,           // destination left
            destination_top,            // destination top
            destination_width,          // destination width
            destination_height);        // destination height
        }
      }
    }
  },

  "[subscribe('command/alloc-drcs'), pnp]":
  function allocDRCS(drcs)
  {
    this._drcs_map[drcs.dscs] = drcs;
  },

  /** Rnder underline at specified position.
   * @param {nsIRenderingContext} context  a rendering context object.
   * @param {Number} x  the horizontal start position.
   * @param {Number} y  the vertical base-line position.
   * @param {String} fore_color  the stroke color of underline.
   */
  _drawUnderline: function _drawUnderline(context, x, y, width, fore_color)
  {
     // Render underline
     context.lineWidth = 1;
     context.strokeStyle = fore_color;
     context.beginPath();
     context.moveTo(x, y + 2);
     context.lineTo(x + width, y + 2);
     context.stroke();
  },

  /** Do test rendering and calculate glyph width with current font and font size.
   */
  _calculateGlyphSize: function _calculateGlyphSize()
  {
    var font_size = this.font_size,
        font_family = this.font_family,
        glyph_info = coUtils.Font.getAverageGlyphSize(font_size, font_family),
        char_width = glyph_info[0],
        char_height = glyph_info[1],
        char_offset = glyph_info[2];

    // store result
    this.char_width = char_width;
    this.char_offset = char_offset;
    this.char_height = char_height;
    this._text_offset = ((this.line_height + char_height + char_offset / 2) / 2 - 3);
  },

  /** test */
  "[test]":
  function()
  {
    var enabled = this.enabled;

    //try {
    //  this.enabled = false;
    //  this.enabled = true;
    //  this.enabled = false;
    //} finally {
    //  this.enabled = enabled;
    //}
  },

};

/**
 * @fn main
 * @brief Module entry point.
 * @param {Broker} broker The Broker object.
 */
function main(broker)
{
  new Renderer(broker);
}

// EOF
