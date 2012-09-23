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

function wait(span) 
{
  var end_time = Date.now() + span,
      current_thread = coUtils.Services.threadManager.currentThread;

  do {
    current_thread.processNextEvent(true);
  } while ((current_thread.hasPendingEvents()) || Date.now() < end_time);
};


var CO_XTERM_256_COLOR_PROFILE = [
  /* 0       */ "#000000", // black
  /* 1       */ "#cd9988", // red
  /* 2       */ "#44cd44", // green
  /* 3       */ "#cdcd88", // yellow
  /* 4       */ "#8899ef", // blue
  /* 5       */ "#cd88cd", // magenta
  /* 6       */ "#66cdcd", // cyan
  /* 7       */ "#e5e5e5", // white
  /* 8       */ "#7f7f7f", // blight black
  /* 9       */ "#ff0000", // blight red
  /* 10      */ "#00ff00", // blight green
  /* 11      */ "#ffff00", // blight yellow
  /* 12      */ "#5c5cff", // blight blue
  /* 13      */ "#ff00ff", // blight magenta
  /* 14      */ "#00ffff", // blight cyan
  /* 15      */ "#ffffff", // blight white
  /* 16 -19  */ "#000000", "#00005f", "#000087", "#0000af", 
  /* 20 -23  */ "#0000d7", "#0000ff", "#005f00", "#005f5f",
  /* 24 -27  */ "#005f87", "#005faf", "#005fd7", "#005fff", 
  /* 28 -31  */ "#008700", "#00875f", "#008787", "#0087af",
  /* 32 -35  */ "#0087d7", "#0087ff", "#00af00", "#00af5f", 
  /* 36 -39  */ "#00af87", "#00afaf", "#00afd7", "#00afff",
  /* 40 -43  */ "#00d700", "#00d75f", "#00d787", "#00d7af", 
  /* 44 -47  */ "#00d7d7", "#00d7ff", "#00ff00", "#00ff5f",
  /* 48 -51  */ "#00ff87", "#00ffaf", "#00ffd7", "#00ffff", 
  /* 52 -55  */ "#5f0000", "#5f005f", "#5f0087", "#5f00af",
  /* 56 -59  */ "#5f00d7", "#5f00ff", "#5f5f00", "#5f5f5f", 
  /* 60 -63  */ "#5f5f87", "#5f5faf", "#5f5fd7", "#5f5fff",
  /* 64 -67  */ "#5f8700", "#5f875f", "#5f8787", "#5f87af", 
  /* 68 -71  */ "#5f87d7", "#5f87ff", "#5faf00", "#5faf5f",
  /* 72 -75  */ "#5faf87", "#5fafaf", "#5fafd7", "#5fafff", 
  /* 76 -79  */ "#5fd700", "#5fd75f", "#5fd787", "#5fd7af",
  /* 80 -83  */ "#5fd7d7", "#5fd7ff", "#5fff00", "#5fff5f", 
  /* 84 -87  */ "#5fff87", "#5fffaf", "#5fffd7", "#5fffff",
  /* 88 -91  */ "#870000", "#87005f", "#870087", "#8700af", 
  /* 92 -95  */ "#8700d7", "#8700ff", "#875f00", "#875f5f",
  /* 96 -99  */ "#875f87", "#875faf", "#875fd7", "#875fff", 
  /* 100-103 */ "#878700", "#87875f", "#878787", "#8787af",
  /* 104-107 */ "#8787d7", "#8787ff", "#87af00", "#87af5f", 
  /* 108-111 */ "#87af87", "#87afaf", "#87afd7", "#87afff",
  /* 112-115 */ "#87d700", "#87d75f", "#87d787", "#87d7af", 
  /* 116-119 */ "#87d7d7", "#87d7ff", "#87ff00", "#87ff5f",
  /* 120-123 */ "#87ff87", "#87ffaf", "#87ffd7", "#87ffff", 
  /* 124-127 */ "#af0000", "#af005f", "#af0087", "#af00af",
  /* 128-131 */ "#af00d7", "#af00ff", "#af5f00", "#af5f5f", 
  /* 132-135 */ "#af5f87", "#af5faf", "#af5fd7", "#af5fff",
  /* 136-139 */ "#af8700", "#af875f", "#af8787", "#af87af", 
  /* 140-143 */ "#af87d7", "#af87ff", "#afaf00", "#afaf5f",
  /* 144-147 */ "#afaf87", "#afafaf", "#afafd7", "#afafff",
  /* 148-151 */ "#afd700", "#afd75f", "#afd787", "#afd7af",
  /* 152-155 */ "#afd7d7", "#afd7ff", "#afff00", "#afff5f", 
  /* 156-159 */ "#afff87", "#afffaf", "#afffd7", "#afffff",
  /* 160-163 */ "#d70000", "#d7005f", "#d70087", "#d700af", 
  /* 164-167 */ "#d700d7", "#d700ff", "#d75f00", "#d75f5f",
  /* 168-171 */ "#d75f87", "#d75faf", "#d75fd7", "#d75fff", 
  /* 172-175 */ "#d78700", "#d7875f", "#d78787", "#d787af",
  /* 176-179 */ "#d787d7", "#d787ff", "#d7af00", "#d7af5f", 
  /* 180-183 */ "#d7af87", "#d7afaf", "#d7afd7", "#d7afff",
  /* 184-187 */ "#d7d700", "#d7d75f", "#d7d787", "#d7d7af", 
  /* 188-191 */ "#d7d7d7", "#d7d7ff", "#d7ff00", "#d7ff5f",
  /* 192-195 */ "#d7ff87", "#d7ffaf", "#d7ffd7", "#d7ffff", 
  /* 196-199 */ "#ff0000", "#ff005f", "#ff0087", "#ff00af",
  /* 200-203 */ "#ff00d7", "#ff00ff", "#ff5f00", "#ff5f5f", 
  /* 204-207 */ "#ff5f87", "#ff5faf", "#ff5fd7", "#ff5fff",
  /* 208-211 */ "#ff8700", "#ff875f", "#ff8787", "#ff87af", 
  /* 212-215 */ "#ff87d7", "#ff87ff", "#ffaf00", "#ffaf5f",
  /* 216-219 */ "#ffaf87", "#ffafaf", "#ffafd7", "#ffafff", 
  /* 220-223 */ "#ffd700", "#ffd75f", "#ffd787", "#ffd7af",
  /* 224-227 */ "#ffd7d7", "#ffd7ff", "#ffff00", "#ffff5f", 
  /* 228-231 */ "#ffff87", "#ffffaf", "#ffffd7", "#ffffff",
  /* 232-235 */ "#080808", "#121212", "#1c1c1c", "#262626", 
  /* 236-239 */ "#303030", "#3a3a3a", "#444444", "#4e4e4e",
  /* 240-243 */ "#585858", "#626262", "#6c6c6c", "#767676", 
  /* 244-247 */ "#808080", "#8a8a8a", "#949494", "#9e9e9e",
  /* 248-251 */ "#a8a8a8", "#b2b2b2", "#bcbcbc", "#c6c6c6", 
  /* 252-255 */ "#d0d0d0", "#dadada", "#e4e4e4", "#eeeeee"
]; // CO_XTERM_256_COLOR_PROFILE

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

  "<@command/restore> :: Object -> Undefined": 
  _("Deserialize and restore stored state."),

}; // concept PersistentConcept

/**
 * @trait PersistentTrait
 */
var PersistentTrait = new Trait();
PersistentTrait.definition = {

  /**
   * Serialize snd persist current state.
   */
  "[subscribe('@command/backup'), type('Object -> Undefined'), pnp]": 
  function backup(context) 
  {
    var broker = this._broker,
        path,
        file;
    
    // serialize this plugin object.
    context[this.id] = {
      line_height: this.line_height,
      font_family: this.font_family,
      font_size: this.font_size,
      force_precious_rendering: this.force_precious_rendering,
      reverse: this._reverse,
      color: this.color,
    };

    // make image file path
    path = broker.runtime_path 
             + "/persist/" 
             + broker.request_id 
             + ".png";

    // get file object
    file = coUtils.File.getFileLeafFromVirtualPath(path);

    coUtils.IO.saveCanvas(this._main_layer.canvas, file, true);
  },

  /**
   * Deserialize snd restore stored state.
   */
  "[subscribe('@command/restore'), type('Object -> Undefined'), pnp]": 
  function restore(context) 
  {
    var data = context[this.id];

    if (data) {
      this.force_monospace_rendering = data.force_precious_rendering;
      this.line_height = data.line_height;
      this.font_family = data.font_family;
      this.font_size = data.font_size;
      this._reverse = data.reverse;
      this.color = data.color;
//      this.sendMessage("command/draw");
    } else {
      coUtils.Debug.reportWarning(
        _("Cannot restore last state of renderer: data not found."));
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
      function()
      {
        if (null !== this._slow_blink_layer) {
          this._slow_blink_layer.canvas.style.opacity 
            = 1 - this._slow_blink_layer.canvas.style.opacity;
          coUtils.Timer.setTimeout(arguments.callee, this.slow_blink_interval, this);
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
      function() 
      {
        if (null !== this._rapid_blink_layer) {
          this._rapid_blink_layer.canvas.style.opacity 
            = 1 - this._rapid_blink_layer.canvas.style.opacity;
          coUtils.Timer.setTimeout(arguments.callee, this.rapid_blink_interval, this);
        }
      }, this.rapid_blink_interval, this);

  }, // createRapidBlinkLayer

}; // RapidBlinkTrait


/**
 * @trait ReverseVideoTrait
 */
var ReverseVideoTrait = new Trait();
ReverseVideoTrait.definition = {

  _reverse: false,

  "[subscribe('command/reverse-video'), enabled]": 
  function reverseVideo(value) 
  {
    var map,
        i,
        value;

    if (this._reverse !== value) {

      this._reverse = value;

      map = this.color;

      for (i = 0; i < map.length; ++i) {
        value = (parseInt(map[i].substr(1), 16) ^ 0x1ffffff)
          .toString(16)
          .replace(/^1/, "#");
        map[i] = value;
      }

      this._screen.dirty = true;
    }

  },

}; // ReverseVideoTrait

/**
 * @trait PalletManagerTrait
 */
var PalletManagerTrait = new Trait();
PalletManagerTrait.definition = {
  
  // color map (index No. is spacified by SGR escape sequences)
  
  /** color map for Normal characters. */
  "[watchable, persistable] color": CO_XTERM_256_COLOR_PROFILE.slice(0),       

  _reverse: false,

  "[subscribe('sequence/osc/4'), enabled]": 
  function osc4(value) 
  {
    var message,
        color,
        [number, spec] = value.split(";");

    // range check.
    if (0 > number && number > 255) {
      throw coUtils.Debug.Exception(
        _("Specified number is out of range: %d."), number);
    }

    // parse arguments.
    if ("?" === spec) { // get specified color value
      color = this.color[number];
      color = "rgb:" + color.substr(1, 2) 
            + "/" + color.substr(3, 2) 
            + "/" + color.substr(5, 2)
      message = "4;" + number + ";" + color;
      this.sendMessage("command/send-to-tty", message);
    } else { // set color
      this.color[number] = coUtils.Color.parseX11ColorSpec(spec);
    }
  },

  "[subscribe('sequence/osc/104'), pnp]":
  function osc104(value)
  {
    var color,
        [number] = value.split(";"),
        scope = {};

    // range check.
    if (0 > number && number > 255) {
      throw coUtils.Debug.Exception(
        _("Specified number is out of range: %d."), number);
    }

    this.sendMessage("command/load-persistable-data", scope);

    color = scope["renderer.color"] || this.__proto__.color;
    this.color[number] = color[number];
  },

  /**
   * Set foreground color (xterm)
   *
   */
  "[subscribe('sequence/osc/10'), pnp]": 
  function osc10(value) 
  {
    var outerchrome = this._outerchrome,
        color,
        message;

    if ("?" === value) {
      color = outerchrome.foreground_color;
      color = "rgb:" + color.substr(1, 2) 
            + "/" + color.substr(3, 2) 
            + "/" + color.substr(5, 2)
      message = "10;" + color;
      this.sendMessage("command/send-to-tty", message);
    } else { 
      color = coUtils.Color.parseX11ColorSpec(value);
      outerchrome.foreground_color = color;
      this.foreground_color = color;
      this.draw(true);
    }
  },

  "[subscribe('sequence/osc/110'), pnp]":
  function osc110()
  {
    var outerchrome = this._outerchrome,
        scope = {};

    this.sendMessage("command/load-persistable-data", scope);

    outerchrome.foreground_color 
      = scope["outerchrome.foreground_color"] 
      || outerchrome.__proto__.foreground_color;
  },

  /**
   * Set background color (xterm)
   *
   */
  "[subscribe('sequence/osc/11'), pnp]": 
  function osc11(value) 
  {
    var outerchrome = this._outerchrome,
        color,
        message;

    if ("?" === value) {
      color = outerchrome.background_color;
      color = "rgb:" + color.substr(1, 2) 
            + "/" + color.substr(3, 2) 
            + "/" + color.substr(5, 2)
      message = "11;" + color;
      this.sendMessage("command/send-to-tty", message);
    } else {
      color = coUtils.Color.parseX11ColorSpec(value);
      outerchrome.background_color = color;
      this.background_color = color;
      this.draw(true);
    }
  },

  "[subscribe('sequence/osc/111'), pnp]":
  function osc111()
  {
    var outerchrome = this._outerchrome,
        scope = {};

    this.sendMessage("command/load-persistable-data", scope);

    outerchrome.background_color 
      = scope["outerchrome.background_color"] 
      || outerchrome.__proto__.background_color;
  },

}; // PalletManagerTrait


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
        style: "position: absolute",
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
                          .mix(ReverseVideoTrait)
                          .mix(PalletManagerTrait)
                          .depends("outerchrome")
                          .depends("screen")
                          .requires("PersistentConcept");
Renderer.definition = {

  id: "renderer",

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
  "[watchable, persistable] line_height": 16,
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

  // font
  "[watchable, persistable] font_family": 
    "Monaco,Menlo,Lucida Console,monospace",

  "[watchable, persistable] font_size": 14,

  "[persistable] force_precious_rendering": false,
  "[persistable] normal_alpha": 1.00,
  "[persistable] halfbright_alpha": 0.50,
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

  /** Installs itself.
   *  @param broker {Broker} A broker object.
   */
  "[install]":
  function install(broker) 
  {
    this._outerchrome = this.dependency["outerchrome"];
    this._screen = this.dependency["screen"];

    this._main_layer = new Layer(broker, "foreground_canvas");

    // set smoothing configuration
    this._main_layer.smoothing = this.smoothing;

    this._calculateGlyphSize();
    this.onWidthChanged();
    this.onHeightChanged();

    this.foreground_color = this._outerchrome.foreground_color;
    this.background_color = this._outerchrome.background_color;

    this._drcs_map = [];
  },

  /** Uninstalls itself.
   *  @param broker {Broker} A Broker object.
   */
  "[uninstall]":
  function uninstall(broker) 
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

  /** Take screen capture and save it in png format. */
  "[subscribe('command/capture-screen'), pnp]": 
  function captureScreen(info) 
  {
    coUtils.IO.saveCanvas(this._main_layer.canvas, 
                          info.file, 
                          info.thumbnail);
  },

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

  "[subscribe('set/font-size'), pnp]": 
  function setFontSize(font_size) 
  {
    this.line_height += font_size - this.font_size;
    this.font_size = font_size;

    this.sendMessage("event/font-size-changed", this.font_size);
  },

  "[subscribe('set/font-family'), pnp]": 
  function setFontFamily(font_family) 
  {
    this.font_family = font_family;
  },

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
  "[subscribe('command/draw'), enabled]": 
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
                         left | 0, 
                         top, 
                         Math.round(width + Math.ceil(left) - left), 
                         height, 
                         attr);

    context.font = font_size + "px " + font_family;
    if (attr.italic) {
      context.font = "italic " + context.font;
    }

    this._drawWord(context, 
                   codes, 
                   left, 
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
    if (attr.italic) {
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

    if (attr.italic) {
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

    if (attr.italic) {
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
    if (attr.blink) {
      if (null === this._slow_blink_layer) {
        this.createSlowBlinkLayer(this.slow_blink_interval);
      }
      this._drawBackgroundImpl(context, x, y, width, height, attr);
      this._drawBackgroundImpl(this._slow_blink_layer.context, x, y, width, height, attr);
    } else if (attr.rapid_blink) {
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
    var back_color;

    //if (!this._reverse && !attr.bgcolor) {
    //  context.clearRect(x, y, width, height);
    //} else {
    
    /* Get hexadecimal formatted background color (#xxxxxx) 
     * form given attribute structure. */
    if (attr.bgcolor) {
      if (attr.inverse) {
        back_color = this.color[attr.fg];
      } else {
        back_color = this.color[attr.bg];
      }
    } else {
      if (attr.inverse) {
        back_color = this.foreground_color;
      } else {
        context.clearRect(x, y, width, height);
        return;
      }
    }

    if (this._reverse) {
      back_color = (parseInt(back_color.substr(1), 16) ^ 0x1ffffff)
        .toString(16)
        .replace(/^1/, "#");
    }

    context.globalAlpha = 1.0;

    /* Draw background */
    context.fillStyle = back_color;
    context.fillRect(x, y, width, height);
    //}
    context = null;
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
    var fore_color,
        fore_color_map,
        text,
        code,
        drcs_state;

    if (attr.blink) {
      if (null === this._slow_blink_layer) {
        this.createSlowBlinkLayer(this.slow_blink_interval);
      }
      context = this._slow_blink_layer.context;
      context.font = this._main_layer.context.font;
    }

    if (attr.rapid_blink) {
      if (null === this._rapid_blink_layer) {
        this.createRapidBlinkLayer(this.rapid_blink_interval);
      }
      context = this._rapid_blink_layer.context;
      context.font = this._main_layer.context.font;
    }

    if (attr.invisible) {
      context.globalAlpha = 0.0;
    } else if (attr.bold) {
      context.globalAlpha = this.bold_alpha;
    } else if (attr.halfbright) {
      context.globalAlpha = this.halfbright_alpha;
    } else {
      context.globalAlpha = this.normal_alpha;
    }

    // Get hexadecimal formatted text color (#xxxxxx) 
    // form given attribute structure. 
    fore_color_map = this.color;

    if (attr.fgcolor) {
      if (attr.inverse) {
        fore_color = fore_color_map[attr.bg];
      } else {
        fore_color = fore_color_map[attr.fg];
      }
    } else {
      if (attr.inverse) {
        fore_color = this.background_color;
      } else {
        fore_color = this.foreground_color;
      }
    }

    if (this._reverse) {
      fore_color = (parseInt(fore_color.substr(1), 16) ^ 0x1ffffff)
        .toString(16)
        .replace(/^1/, "#");
    }

    context.fillStyle = fore_color;

    if (attr.underline) {
      this._drawUnderline(context, x, y, char_width * length, fore_color);
    }

    drcs_state = attr.drcs;

    if (codes[0] > 0x100000) {
      drcs_state = this._drcs_map[String.fromCharCode((codes[0] & 0xff00) >>> 8)];
      //alert([String.fromCharCode((codes[0] & 0xff00) >>> 8), codes[0] & 0xff])
      codes[0] = codes[0] & 0xff;
    }

    if (!drcs_state) {

      text = String.fromCharCode.apply(String, codes);

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
      if (attr.bold && this.bold_as_blur) {
        context.fillText(text, x + 1, y, char_width * length - 1);
      }

    } else {
      this._drawDrcs(context, codes, x, y, char_width, drcs_state, type);
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
        destination_height;

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
        if (!drcs_state.color) {
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
          var drcs_context = drcs_state.drcs_canvas.getContext("2d");
          context.globalAlpha = 1.0;
          drcs_context.clearRect(
            drcs_state.drcs_width * 96, // destination left
            source_top,                 // destination top
            destination_width,          // destination width
            destination_height);        // destination height
          drcs_context.drawImage(
            drcs_state.drcs_canvas, 
            source_left,                // source left
            source_top,                 // source top
            source_width,               // source width
            source_height,              // source height
            drcs_state.drcs_width * 96, // destination left
            source_top,                 // destination top
            destination_width,          // destination width
            destination_height);        // destination height
          drcs_context.fillStyle = context.fillStyle;
          drcs_context.globalCompositeOperation = "source-atop";
          drcs_context.fillRect(drcs_state.drcs_width * 96,
                                source_top, 
                                destination_width, 
                                destination_height);
          drcs_context.globalCompositeOperation = "source-over";
          context.drawImage(
            drcs_state.drcs_canvas, 
            drcs_state.drcs_width * 96, // source left
            source_top,                 // source top
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
