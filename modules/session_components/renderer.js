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

  _drcs_state: null, 

  // font
  "[watchable, persistable] font_family": "Monaco,Menlo,Lucida Console,monospace",
  "[watchable, persistable] font_size": 14,

  "[persistable] force_precious_rendering": false,
  "[persistable] normal_alpha": 0.80,
  "[persistable] bold_alpha": 1.00,
//  "[persistable] enable_text_shadow": false,
  "[persistable] enable_render_bold_as_textshadow": false,
  "[persistable] shadow_offset_x": 0.50,
  "[persistable] shadow_offset_y": 0.00,
  "[persistable] shadow_blur": 0.50,
  "[persistable] transparent_color": 0,
  "[persistable, watchable] smoothing": true,

  /** Installs itself.
   *  @param session {Session} A session object.
   */
  "[subscribe('install/renderer'), enabled]":
  function install(session) 
  {
    let {foreground_canvas} = session.uniget(
      "command/construct-chrome", 
      {
        parentNode: "#tanasinn_center_area",
        tagName: "html:canvas",
        style: "letter-spacing: 1em",
        id: "foreground_canvas",
      });

    this._canvas = foreground_canvas;
    this._context = this._canvas.getContext("2d");
    this._context.mozImageSmoothingEnabled = this.smoothing;
    this._calculateGryphWidth();
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
    session.notify("initialized/renderer", this);
  },

  /** Uninstalls itself.
   *  @param session {Session} A session object.
   */
  "[subscribe('uninstall/renderer'), enabled]":
  function uninstall(session) 
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
  },

  "[subscribe('event/shift-out'), enabled]": 
  function shiftOut() 
  {
    this._offset += 0x80;
  },

  "[subscribe('event/shift-in'), enabled]": 
  function shiftIn() 
  {
    if (0 != this._offset) {
      this._offset -= 0x80;
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
    let source_canvas = this._canvas;
    coUtils.IO.saveCanvas(source_canvas, info.file, info.thumbnail);
  },

  "[subscribe('command/backup')]": 
  function backup(context) 
  {
    context[this.id] = {
      line_height: this.line_height,
      font_family: this.font_family,
      font_size: this.font_size,
      force_precious_rendering: this.force_precious_rendering,
    };
    let session = this._broker;
    let path = String(<>$Home/.tanasinn/persist/{session.request_id}.png</>);
    let file = coUtils.File.getFileLeafFromVirtualPath(path);
    let source_canvas = this._canvas;
    coUtils.IO.saveCanvas(source_canvas, file, true);
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
      this.draw();
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
    let session = this._broker;
    session.notify("event/font-size-changed", this.font_size);
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
    this._calculateGryphWidth();
  },

  "[subscribe('command/change-fontsize-by-offset')]":
  function changeFontSizeByOffset(offset) 
  {
    this.font_size = Number(this.font_size) + offset;
    this.line_height = Number(this.line_height) + offset;
    let session = this._broker;
    session.notify("event/font-size-changed", this.font_size);
  },

  "[subscribe('variable-changed/{screen.width | renderer.char_width}')]":
  function onWidthChanged(width, char_width) 
  {
    width = width || this.dependency["screen"].width;
    char_width = char_width || this.char_width;
    let canvas_width = 0 | (width * char_width);
    this._canvas.width = canvas_width;
    let session = this._broker;
    session.notify("event/screen-width-changed", canvas_width);
  },

  "[subscribe('variable-changed/{screen.height | renderer.line_height}')]":
  function onHeightChanged(height, line_height)
  {
    height = height || this.dependency["screen"].height;
    line_height = line_height || this.line_height;
    let canvas_height = 0 | (height * line_height);
    let session = this._broker;
    session.notify("event/screen-height-changed", canvas_height);
    this._canvas.height = canvas_height;
  },

  /** Draw to canvas */
  "[subscribe('command/draw')]": 
  function draw(redraw_flag)
  {
    if (redraw_flag) {
      this.dependency["screen"].dirty = true;
    }
    let context = this._context;
    let screen = this.dependency["screen"];
    let font_size = this.font_size;
    let font_family = this.font_family;
    let line_height = this.line_height;
    let char_width = this.char_width;
    let text_offset = this._text_offset;
    for (let { codes, row, column, end, attr } in screen.getDirtyWords()) {
      let left = (char_width * column);// | 0;
      let top = line_height * row;
      let width = (char_width * (end - column));// | 0;
      let height = line_height;// | 0;
      this._drawBackground(context, left | 0, top, width + Math.ceil(left) - left, height, attr.bg);
      this._drawWord(context, codes, left, top + text_offset, char_width, end - column, height, attr);
    }
  },

  /** Render background attribute. 
   *
   */
  _drawBackground: function _drawBackground(context, x, y, width, height, bg)
  {
    if (this.transparent_color == bg) {
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
  },

  /** Render text in specified cells.
   */
  _drawWord: function _drawWord(context, cells, x, y, char_width, length, height, attr)
  {
    // Get hexadecimal formatted text color (#xxxxxx) 
    // form given attribute structure. 
    let fore_color_map = this.normal_color;// attr.bold ? this.bold_color: this.normal_color;
    let fore_color = fore_color_map[attr.fg];
    this._setFont(context, attr.bold); 
    context.globalAlpha = attr.bold ? this.bold_alpha: this.normal_alpha;
    context.fillStyle = fore_color;
    if (attr.underline) {
      this._drawUnderline(context, x, y, char_width * length, fore_color);
    }
    let codes = [code for (code in function () {
      for (let [, cell] in Iterator(cells)) {
        let code = cell.c;
        if (code > 0xffff) {
          // emit 16bit + 16bit surrogate pair.
          code -= 0x10000;
          yield (code >> 10) | 0xD800;
          yield (code & 0x3FF) | 0xDC00;
        } else {
          yield code;
        }
      }
    }())];


    if (this._drcs_state === null || !attr.drcs) {
      let text = String.fromCharCode.apply(String, codes);
      if (this.enable_render_bold_as_textshadow && attr.bold) {
        context.shadowColor = "white";//fore_color;
        context.shadowOffsetX = this.shadow_offset_x;
        context.shadowOffsetY = this.shadow_offset_y;
        context.shadowBlur = this.shadow_blur;
      } else {
        context.shadowOffsetX = 0;
        context.shadowBlur = 0;
      }
      context.fillText(text, x, y, char_width * length);
    } else {
      let {
        drcs_canvas,
        drcs_width,
        drcs_height,
        start_code,
        end_code,
        glyphs,
      } = this._drcs_state;
      for (let [index, code] in Iterator(codes)) {
        code = code - this._offset;
        if (start_code <= code && code <= end_code) {
          //let glyph = glyphs[code - start_code];
          //context.putImageData(glyph, 0, 0)
          context.drawImage(
            drcs_canvas, 
            (code - start_code) * drcs_width, 0, drcs_width, drcs_height, 
            x + index * char_width, y - this._text_offset, 
            Math.ceil(char_width + 0.5), this.line_height); 
          context.globalCompositeOperation = "source-atop";
          context.fillRect(
            x, Math.ceil(y - this._text_offset + 0.5), char_width + 1, this.line_height);
          context.globalCompositeOperation = "source-over";
        }
      }
    }
  },

  /** Rnder underline at specified position.
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

  _calculateGryphWidth: function _calculateGryphWidth() 
  {
    let font_size = this.font_size;
    let font_family = this.font_family;
    let [char_width, char_height, char_offset] 
      = coUtils.Font.getAverageGryphWidth(font_size, font_family);
    this.char_width = char_width;
    this.char_offset = char_offset;
    this.char_height = char_height;
    this._text_offset = ((this.line_height + char_height + char_offset / 2) / 2 - 3);// | 0;
  },

  _setFont: function setFontSize(context, is_bold) 
  {
    let font_size = this.font_size;
    let font_family = this.font_family;
    context.font = " "//(is_bold ? "bold ": " ") 
                 + (font_size/* | 0*/) + "px "
                 + font_family;
  },
        
}

/**
 * @fn main
 * @brief Module entry point.
 * @param {Broker} broker The Broker object.
 */
function main(broker) 
{
  new Renderer(broker);
}

