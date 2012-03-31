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

const CO_XTERM_256_COLOR_PROFILE = [
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
  /* 16 -23  */ "#000000", "#00005f", "#000087", "#0000af", "#0000d7", "#0000ff", "#005f00", "#005f5f",
  /* 24 -31  */ "#005f87", "#005faf", "#005fd7", "#005fff", "#008700", "#00875f", "#008787", "#0087af",
  /* 32 -39  */ "#0087d7", "#0087ff", "#00af00", "#00af5f", "#00af87", "#00afaf", "#00afd7", "#00afff",
  /* 40 -47  */ "#00d700", "#00d75f", "#00d787", "#00d7af", "#00d7d7", "#00d7ff", "#00ff00", "#00ff5f",
  /* 48 -55  */ "#00ff87", "#00ffaf", "#00ffd7", "#00ffff", "#5f0000", "#5f005f", "#5f0087", "#5f00af",
  /* 56 -63  */ "#5f00d7", "#5f00ff", "#5f5f00", "#5f5f5f", "#5f5f87", "#5f5faf", "#5f5fd7", "#5f5fff",
  /* 64 -71  */ "#5f8700", "#5f875f", "#5f8787", "#5f87af", "#5f87d7", "#5f87ff", "#5faf00", "#5faf5f",
  /* 72 -79  */ "#5faf87", "#5fafaf", "#5fafd7", "#5fafff", "#5fd700", "#5fd75f", "#5fd787", "#5fd7af",
  /* 80 -87  */ "#5fd7d7", "#5fd7ff", "#5fff00", "#5fff5f", "#5fff87", "#5fffaf", "#5fffd7", "#5fffff",
  /* 88 -95  */ "#870000", "#87005f", "#870087", "#8700af", "#8700d7", "#8700ff", "#875f00", "#875f5f",
  /* 96 -103 */ "#875f87", "#875faf", "#875fd7", "#875fff", "#878700", "#87875f", "#878787", "#8787af",
  /* 104-111 */ "#8787d7", "#8787ff", "#87af00", "#87af5f", "#87af87", "#87afaf", "#87afd7", "#87afff",
  /* 112-119 */ "#87d700", "#87d75f", "#87d787", "#87d7af", "#87d7d7", "#87d7ff", "#87ff00", "#87ff5f",
  /* 120-127 */ "#87ff87", "#87ffaf", "#87ffd7", "#87ffff", "#af0000", "#af005f", "#af0087", "#af00af",
  /* 128-135 */ "#af00d7", "#af00ff", "#af5f00", "#af5f5f", "#af5f87", "#af5faf", "#af5fd7", "#af5fff",
  /* 136-143 */ "#af8700", "#af875f", "#af8787", "#af87af", "#af87d7", "#af87ff", "#afaf00", "#afaf5f",
  /* 144-151 */ "#afaf87", "#afafaf", "#afafd7", "#afafff", "#afd700", "#afd75f", "#afd787", "#afd7af",
  /* 152-159 */ "#afd7d7", "#afd7ff", "#afff00", "#afff5f", "#afff87", "#afffaf", "#afffd7", "#afffff",
  /* 160-167 */ "#d70000", "#d7005f", "#d70087", "#d700af", "#d700d7", "#d700ff", "#d75f00", "#d75f5f",
  /* 168-175 */ "#d75f87", "#d75faf", "#d75fd7", "#d75fff", "#d78700", "#d7875f", "#d78787", "#d787af",
  /* 176-183 */ "#d787d7", "#d787ff", "#d7af00", "#d7af5f", "#d7af87", "#d7afaf", "#d7afd7", "#d7afff",
  /* 184-191 */ "#d7d700", "#d7d75f", "#d7d787", "#d7d7af", "#d7d7d7", "#d7d7ff", "#d7ff00", "#d7ff5f",
  /* 192-199 */ "#d7ff87", "#d7ffaf", "#d7ffd7", "#d7ffff", "#ff0000", "#ff005f", "#ff0087", "#ff00af",
  /* 200-207 */ "#ff00d7", "#ff00ff", "#ff5f00", "#ff5f5f", "#ff5f87", "#ff5faf", "#ff5fd7", "#ff5fff",
  /* 208-215 */ "#ff8700", "#ff875f", "#ff8787", "#ff87af", "#ff87d7", "#ff87ff", "#ffaf00", "#ffaf5f",
  /* 216-223 */ "#ffaf87", "#ffafaf", "#ffafd7", "#ffafff", "#ffd700", "#ffd75f", "#ffd787", "#ffd7af",
  /* 224-231 */ "#ffd7d7", "#ffd7ff", "#ffff00", "#ffff5f", "#ffff87", "#ffffaf", "#ffffd7", "#ffffff",
  /* 232-239 */ "#080808", "#121212", "#1c1c1c", "#262626", "#303030", "#3a3a3a", "#444444", "#4e4e4e",
  /* 240-247 */ "#585858", "#626262", "#6c6c6c", "#767676", "#808080", "#8a8a8a", "#949494", "#9e9e9e",
  /* 248-255 */ "#a8a8a8", "#b2b2b2", "#bcbcbc", "#c6c6c6", "#d0d0d0", "#dadada", "#e4e4e4", "#eeeeee"
]; // CO_XTERM_256_COLOR_PROFILE

/** 
 * @class Renderer
 * @brief Scan screen state and render it to canvas element.
 */ 
let Renderer = new Class().extends(Plugin)
                          .depends("screen");
Renderer.definition = {

  get id()
    "renderer",

  get info()
    <plugin>
        <name>{_("Renderer")}</name>
        <description>{
          _("Handles draw event and render output data to main canvas.")
        }</description>
        <version>0.2.0</version>
    </plugin>,

  "[persistable] enabled_when_startup": true,

  _context: null,
  _canvas: null,

  // color map (index No. is spacified by SGR escape sequences)
  
  /** color map for Normal characters. */
  "[watchable, persistable] normal_color": CO_XTERM_256_COLOR_PROFILE.slice(0),       

  /** color map for Bold characters. */
  "[watchable, persistable] bold_color": CO_XTERM_256_COLOR_PROFILE.slice(0),         

  /** color map for background. */
  "[watchable, persistable] background_color": CO_XTERM_256_COLOR_PROFILE.slice(0),   

  // cell geometry (in pixel)
  "[watchable, persistable] line_height": 16,
  "[watchable] char_width": 6.5, 
  "[watchable] char_height": 4, 
  "[watchable] char_offset": 11, 

  _text_offset: 10, 

  _offset: 0,
  _reverse: false,

  _drcs_state: null, 
  _double_height_mode : 0,

  // font
  "[watchable, persistable] font_family": "Monaco,Menlo,Lucida Console,monospace",
  "[watchable, persistable] font_size": 14,

  "[persistable] force_precious_rendering": false,
  "[persistable] normal_alpha": 0.80,
  "[persistable] bold_alpha": 1.00,
//  "[persistable] enable_text_shadow": false,
  "[persistable] enable_render_bold_as_textshadow": false,
  "[persistable] shadow_color": "white",
  "[persistable] shadow_offset_x": 0.50,
  "[persistable] shadow_offset_y": 0.00,
  "[persistable] shadow_blur": 0.50,
  "[persistable] transparent_color": 0,
  "[persistable, watchable] smoothing": true,

  /** Installs itself.
   *  @param broker {Broker} A broker object.
   */
  "[subscribe('install/renderer'), enabled]":
  function install(broker) 
  {
    let { tanasinn_renderer_canvas } = broker.uniget(
      "command/construct-chrome", 
      {
        parentNode: "#tanasinn_center_area",
        tagName: "html:canvas",
        style: <>
          letter-spacing: 1em;
        </>,
        id: "tanasinn_renderer_canvas",
      });

    this._canvas = tanasinn_renderer_canvas;
    this._context = this._canvas.getContext("2d");
    this._context.mozImageSmoothingEnabled = this.smoothing;
    this._calculateGlyphSize();
    this.onWidthChanged();
    this.onHeightChanged();

    this.onWidthChanged.enabled = true;
    this.onHeightChanged.enabled = true;
    this.onFontChanged.enabled = true;
    this.setFontSize.enabled = true;
    this.setFontFamily.enabled = true;
    this.changeFontSizeByOffset.enabled = true;
    this.draw.enabled = true;
    this.backup.enabled = true;
    this.restore.enabled = true;
    this.captureScreen.enabled = true;
    this.onDRCSStateChangedG0.enabled = true;
    this.onDRCSStateChangedG1.enabled = true;
    coUtils.Timer.setTimeout(function() this._drawImpl(), 100, this);
  },

  /** Uninstalls itself.
   *  @param broker {Broker} A Broker object.
   */
  "[subscribe('uninstall/renderer'), enabled]":
  function uninstall(broker) 
  {
    this.onWidthChanged.enabled = false;
    this.onHeightChanged.enabled = false;
    this.onFontChanged.enabled = false;
    this.setFontSize.enabled = false;
    this.setFontFamily.enabled = false;
    this.changeFontSizeByOffset.enabled = false;
    this.draw.enabled = false;
    this.backup.enabled = false;
    this.restore.enabled = false;
    this.captureScreen.enabled = false;
    this.onDRCSStateChangedG0.enabled = false;
    this.onDRCSStateChangedG1.enabled = false;
    this._canvas.parentNode.removeChild(this._canvas);
    this._canvas = null;
    this._context = null;
  },

  "[subscribe('command/reverse-video'), enabled]": 
  function reverseVideo(value) 
  {
    if (this._reverse != value) {
      this._reverse = value;
      let maps = [this.normal_color, this.bold_color, this.background_color];
      for (let [, map] in Iterator(maps)) {
        for (let i = 0; i < map.length; ++i) {
          let value = (parseInt(map[i].substr(1), 16) ^ 0x1ffffff)
            .toString(16)
            .replace(/^1/, "#");
          map[i] = value;
        }
      }
      let broker = this._broker;
      broker.notify("command/draw", true);
    }
  },

  "[subscribe('event/drcs-state-changed/g0')]": 
  function onDRCSStateChangedG0(state) 
  {
    if (state) {
      this._drcs_state = state;
    }
  },

  "[subscribe('event/drcs-state-changed/g1')]": 
  function onDRCSStateChangedG1(state) 
  {
    if (state) {
      this._drcs_state = state;
    }
  },

  "[subscribe('command/capture-screen')]": 
  function captureScreen(info) 
  {
    coUtils.IO.saveCanvas(this._canvas, info.file, info.thumbnail);
  },

  "[subscribe('command/backup')]": 
  function backup(context) 
  {
    let broker = this._broker;
    context[this.id] = {
      line_height: this.line_height,
      font_family: this.font_family,
      font_size: this.font_size,
      force_precious_rendering: this.force_precious_rendering,
      reverse: this.reverse,
    };
    let path = broker.runtime_path 
             + "/persist/" 
             + broker.request_id 
             + ".png";
    let file = coUtils.File.getFileLeafFromVirtualPath(path);
    coUtils.IO.saveCanvas(this._source_canvas, file, true);
  },

  "[subscribe('@command/restore')]": 
  function restore(context) 
  {
    let data = context[this.id];
    if (data) {
      this.force_monospace_rendering = data.force_precious_rendering;
      this.line_height = data.line_height;
      this.font_family = data.font_family;
      this.font_size = data.font_size;
      this._reverse = data.reverse;
      let broker = this._broker;
      broker.notify("command/draw");
    } else {
      coUtils.Debug.reportWarning(
        _("Cannot restore last state of renderer: data not found."));
    }
  },

  "[subscribe('variable-changed/renderer.smoothing'), enabled]": 
  function onSmoothingChanged(value) 
  {
    if (this._context) {
      this._context.mozImageSmoothingEnabled = value;
    }
  },

  "[subscribe('set/font-size')]": 
  function setFontSize(font_size) 
  {
    this.line_height += font_size - this.font_size;
    this.font_size = font_size;
    let broker = this._broker;
    broker.notify("event/font-size-changed", this.font_size);
  },

  "[subscribe('set/font-family')]": 
  function setFontFamily(font_family) 
  {
    this.font_family = font_family;
  },

  "[subscribe('variable-changed/renderer.font_{size | family}')]": 
  function onFontChanged(font_size) 
  {
    this.dependency["screen"].dirty = true;
    this._calculateGlyphSize();
  },

  "[subscribe('command/change-fontsize-by-offset')]":
  function changeFontSizeByOffset(offset) 
  {
    this.font_size = Number(this.font_size) + offset;
    this.line_height = Number(this.line_height) + offset;
    let broker = this._broker;
    broker.notify("event/font-size-changed", this.font_size);
  },

  "[subscribe('variable-changed/{screen.width | renderer.char_width}')]":
  function onWidthChanged(width, char_width) 
  {
    width = width || this.dependency["screen"].width;
    char_width = char_width || this.char_width;
    let canvas_width = 0 | (width * char_width);
    this._canvas.width = canvas_width;
    let broker = this._broker;
    broker.notify("event/screen-width-changed", canvas_width);
  },

  "[subscribe('variable-changed/{screen.height | renderer.line_height}')]":
  function onHeightChanged(height, line_height)
  {
    height = height || this.dependency["screen"].height;
    line_height = line_height || this.line_height;
    let canvas_height = 0 | (height * line_height);
    this._canvas.height = canvas_height;
    let broker = this._broker;
    broker.notify("event/screen-height-changed", canvas_height);
  },

  _timer: null,

  /** Draw to canvas */
  "[subscribe('command/draw')]": 
  function draw(redraw_flag)
  {
    if (redraw_flag) {
      this.dependency["screen"].dirty = true;
    }
    try {
    if (null !== this._timer) {
      this._timer.cancel();
    }
    this._timer = coUtils.Timer.setTimeout(function() {
      this._timer = null;
      this._drawImpl();
    }, 20, this);
    } catch (e) {alert(e)}
  },

  _drawImpl: function _drawImpl()
  {
    let context = this._context;
    let screen = this.dependency["screen"];
    let font_size = this.font_size;
    let font_family = this.font_family;
    let line_height = this.line_height;
    let char_width = this.char_width;
    let text_offset = this._text_offset;


    for (let { codes, row, column, end, attr, size } in screen.getDirtyWords()) {

      let left, top, width, height;

      switch (size) {

        case 0:
          left = char_width * column;
          top = line_height * row;
          width = (char_width * (end - column));
          height = line_height;

          this._drawBackground(
            context, 
            left | 0, 
            top, 
            width + Math.ceil(left) - left, 
            height, 
            attr.bg);
          context.font = font_size + "px " + font_family;
          break;

        case 1:
          context.font = (font_size * 2) + "px " + font_family;

          left = char_width * 2 * column;
          top = line_height * (row + 1);
          width = char_width * 2 * (end - column);
          height = line_height;

          this._drawBackground(
            context, 
            left | 0, 
            line_height * row, 
            width + Math.ceil(left) - left, 
            height, 
            attr.bg);

          context.save();
          context.beginPath();
          context.rect(left, line_height * row, width, height);
          context.clip();
          break;

        case 2:
          context.font = (font_size * 2) + "px " + font_family;

          left = char_width * 2 * column;
          top = line_height * row;
          width = char_width * 2 * (end - column);
          height = line_height;

          this._drawBackground(
            context, 
            left | 0, 
            line_height * row, 
            width + Math.ceil(left) - left, 
            height, 
            attr.bg);

          context.save();
          context.beginPath();
          context.rect(left, line_height * row, width, height);
          context.clip();
          break;

        case 3:
          context.font = (font_size * 2) + "px " + font_family;
          //context.font = font_size + "px " + font_family;

          left = char_width * 2 * column;
          top = line_height * row;
          width = char_width * 2 * (end - column);
          height = line_height;

          this._drawBackground(
            context, 
            left | 0, 
            line_height * row, 
            width + Math.ceil(left) - left, 
            height, 
            attr.bg);

          context.save();
          context.beginPath();
          context.rect(left, line_height * row, width, height);
          context.transform(1, 0, 0, 0.5, 0, (top + text_offset) / 2);
          context.clip();
          break;

        default:
          throw coUtils.Debug.Exception(
            _("Invalid double height mode was detected: %d."), 
            this._double_height_mode);
      }


      this._drawWord(
        context, 
        codes, 
        left, 
        top + text_offset, 
        char_width * (0 == size ? 1: 2), 
        end - column, 
        height, 
        attr, size);

      if (0 != size) {
        context.restore();
      }
    }

  }, // draw

  /** Render background attribute. 
   *
   */
  _drawBackground: 
  function _drawBackground(context, x, y, width, height, bg)
  {
    if (!this._reverse && this.transparent_color == bg) {
      context.clearRect(x, y, width, height);
    } else {
      /* Get hexadecimal formatted background color (#xxxxxx) 
       * form given attribute structure. */
      let back_color = this.background_color[bg];
      context.globalAlpha = 1.0;

      /* Draw background */
      context.fillStyle = back_color;
      context.fillRect(x, y, width, height);
    }
    context = null;
  },

  /** Render text in specified cells.
   */
  _drawWord: 
  function _drawWord(context, 
                     cells, 
                     x, y, 
                     char_width, 
                     length, 
                     height, 
                     attr, size)
  {
    // Get hexadecimal formatted text color (#xxxxxx) 
    // form given attribute structure. 
    let fore_color_map = this.normal_color;// attr.bold ? this.bold_color: this.normal_color;
    let fore_color = fore_color_map[attr.fg];

    context.globalAlpha = attr.bold ? this.bold_alpha: this.normal_alpha;
    context.fillStyle = fore_color;
    if (attr.underline) {
      this._drawUnderline(context, x, y, char_width * length, fore_color);
    }
    let codes = [];
    for (let [, cell] in Iterator(cells)) {
      let code = cell.c;
      if (code > 0xffff) {
        // emit 16bit + 16bit surrogate pair.
        code -= 0x10000;
        codes.push(
          (code >> 10) | 0xD800, 
          (code & 0x3FF) | 0xDC00);
      } else {
        codes.push(code);
      }
    }

    if (null === this._drcs_state || !attr.drcs) {
      let text = String.fromCharCode.apply(String, codes);
      if (this.enable_render_bold_as_textshadow && attr.bold) {
        context.shadowColor = this.shadow_color;
        context.shadowOffsetX = this.shadow_offset_x;
        context.shadowOffsetY = this.shadow_offset_y;
        context.shadowBlur = this.shadow_blur;
      } else {
        context.shadowOffsetX = 0;
        context.shadowBlur = 0;
      }
      context.fillText(text, x, y, char_width * length);
    } else {
      let drcs_state = this._drcs_state;
      for (let index = 0; index < codes.length; ++index) {
        let code = codes[index] - this._offset;
        if (drcs_state.start_code <= code && code <= drcs_state.end_code) {
          //let glyph = drcs_state.glyphs[code - drcs_state.start_code];
          //context.putImageData(glyph, 0, 0)
          let glyph_index = code - drcs_state.start_code;
          let source_top, source_left, source_width, source_height;
          let destination_top, destination_left, destination_width, destination_height;
          switch (size) {

            case 0:
              source_left = glyph_index * drcs_state.drcs_width;
              source_top = 0;
              source_width = drcs_state.drcs_width;
              source_height = drcs_state.drcs_height;
              destination_left = x + index * char_width;
              destination_top = y - this._text_offset;
              destination_width = Math.round(char_width);
              destination_height = this.line_height;
              break;

            case 1:
              source_left = glyph_index * drcs_state.drcs_width;
              source_top = 0;
              source_width = drcs_state.drcs_width;
              source_height = drcs_state.drcs_height / 2;
              destination_left = x + index * char_width;
              destination_top = y - this._text_offset - this.line_height;
              destination_width = Math.round(char_width);
              destination_height = this.line_height;
              break;

            case 2:
              source_left = glyph_index * drcs_state.drcs_width;
              source_top = drcs_state.drcs_height / 2;
              source_width = drcs_state.drcs_width;
              source_height = drcs_state.drcs_height / 2;
              destination_left = x + index * char_width;
              destination_top = y - this._text_offset;
              destination_width = Math.round(char_width);
              destination_height = this.line_height;
              break;

            case 3:
              source_left = glyph_index * drcs_state.drcs_width;
              source_top = 0;
              source_width = drcs_state.drcs_width;
              source_height = drcs_state.drcs_height;
              destination_left = x + index * char_width;
              destination_top = y - this._text_offset 
              destination_width = Math.round(char_width);
              destination_height = this.line_height;
              break;
          }
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
          /*
          context.globalCompositeOperation = "source-atop";
          context.fillRect(
            x,
            Math.ceil(y - this._text_offset + 0.5), 
            char_width + 1, 
            this.line_height);
          context.globalCompositeOperation = "source-over";
          */
        }
      }
    }
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
//     context = null;
  },

  /** Do test rendering and calculate glyph width with current font and font size.
   */
  _calculateGlyphSize: function _calculateGlyphSize() 
  {
    let font_size = this.font_size;
    let font_family = this.font_family;
    let [char_width, char_height, char_offset] 
      = coUtils.Font.getAverageGlyphSize(font_size, font_family);
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

