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
 *  @class Cursor
 */ 
var Cursor = new Class().extends(Plugin)
                        .depends("renderer")
                        .depends("screen")
                        .depends("cursorstate");
Cursor.definition = {

  get id()
    "cursor",

  get info()
  {
    return {
      name: _("Cursor"),
      version: "0.1",
      description: _("Make it Enabled to show cursor.")
    };
  },

  /** UI template */
  get template() 
    ({
      parentNode: "#tanasinn_center_area",
      tagName: "html:canvas",
      id: "cursor_canvas",
      MozTransitionProperty: "opacity",
      style: "position: absolute;",
    }),

  "[persistable] enabled_when_startup": true,

  _cursor_visibility: true,
  _cursor_visibility_backup: null,

  _timer: null,

  _blink: true,
  _style: coUtils.Constant.CURSOR_STYLE_BLOCK,

  _initial_color: null,

  "[persistable, watchable] color": "#77ff77",
  "[persistable, watchable] opacity": 0.7,
  "[persistable, watchable] opacity2": 0.1,
  "[persistable] blink_duration": 700, /* in msec */
  "[persistable] blink_transition_duration": 600, /* in msec */
  "[persistable] timing_function": "ease-in-out",
  "[persistable] initial_blink": true,
 
  /** Installs itself. 
   *  @param {Broker} broker A Broker object.
   */
  "[install]": 
  function install(broker) 
  {
    this._screen = this.dependency["screen"];
    this._renderer = this.dependency["renderer"];
    this._cursor_state = this.dependency["cursorstate"];

    /** Create cursor element. */
    var {cursor_canvas} 
      = this.request("command/construct-chrome", this.template);

    this._canvas = cursor_canvas;
    this._context = this._canvas.getContext("2d");
    this._cursor_visibility_backup = [];
    this._initial_color = this._color;

    //
    // subscribe some events.
    //
    // initial update
    this.onFirstFocus();
    this.update();
    this._prepareBlink();
  },

  /** Uninstalls itself. 
   *  @param {Broker} broker A Broker object.
   */
  "[subscribe('uninstall/cursor'), enabled]":
  function uninstall(broker) 
  {
    if (null !== this._timer) {
      this._timer.cancel();
      this._timer = null;
    }
    if (null !== this._canvas) {
      this._canvas.parentNode.removeChild(this._canvas);
      this._canvas = null;
    }
    this._context = null;
    this._initial_color = null;

    this._screen = null;
    this._renderer = null;
    this._cursor_state = null;
  },

  "[subscribe('@command/focus'), pnp]":
  function onFirstFocus()
  {
    var renderer = this._renderer,
        screen = this._screen;

    this._canvas.width = renderer.char_width * screen.width;
    this._canvas.height = renderer.line_height * screen.height;
  },

  "[subscribe('sequence/sm/33'), pnp]":
  function WYSTCURM_ON()
  {
    this._screen.cursor.blink = true;
  },

  "[subscribe('sequence/rm/33'), pnp]":
  function WYSTCURM_OFF()
  {
    this._screen.cursor.blink = false;
  },

  "[subscribe('sequence/sm/34'), pnp]":
  function WYULCURM_ON()
  {
    this._style = coUtils.Constant.CURSOR_STYLE_UNDERLINE;
  },

  "[subscribe('sequence/rm/34'), pnp]":
  function WYULCURM_OFF()
  {
    this._style = coUtils.Constant.CURSOR_STYLE_BLOCK;
  },

  "[subscribe('sequence/osc/12'), pnp]":
  function OSC12(value)
  {
    var message, color;

    // parse arguments.
    if ("?" === value) {
      color = this.color;
      color = "rgb:" + color.substr(1, 2) 
            + "/" + color.substr(3, 2) 
            + "/" + color.substr(5, 2)
      message = "12;" + color;
      this.sendMessage("command/send-to-tty", message);
    } else {
      this.color = coUtils.Color.parseX11ColorSpec(value);
    }
  },

  "[subscribe('sequence/osc/112'), pnp]":
  function OSC112()
  {
    var scope = {};
    this.sendMessage("command/load-persistable-data", scope);

    this.color = scope[this.id + ".color"] || this.__proto__.color;
  },

  /**
   *
   * DECSCUSR - Set Cursor Style
   *
   * ref: http://www.vt100.net/docs/vt510-rm/DECSCUSR
   * 
   * Select the style of the cursor on the screen.
   *
   * Format
   *
   * CSI   Ps    SP    q
   * 9/11  3/n   2/0   7/1
   *
   * Parameters
   * 
   * Ps indicates the style of the cursor.
   *
   * Ps             Cursor Style
   * --------------------------------------
   * 0, 1 or none   Blink Block (Default)
   * 2              Steady Block
   * 3              Blink Underline
   * 4              Steady Underline
   * 5              Blink IBEAM (TeraTerm, mintty)
   * 6              Steady IBEAM (TeraTerm, mintty)
   * 
   * This sequence causes the cursor to be displayed in a different style when
   * the cursor is enabled.
   *
   * Note on DECSCUSR
   * 
   * The escape sequence DECTCEM can enable or disable the cursor display.
   *
   */
  "[profile('vt100'), sequence('CSI %d q')]":
  function DECSCUSR(n) 
  {
    var cursor_state = this._cursor_state;

    switch (n) {

      case 0:
      case 1:
        this._style = coUtils.Constant.CURSOR_STYLE_BLOCK;
        cursor_state.blink = true;
        break;

      case 2:
        this._style = coUtils.Constant.CURSOR_STYLE_BLOCK;
        cursor_state.blink = false;
        break;

      case 3:
        this._style = coUtils.Constant.CURSOR_STYLE_UNDERLINE;
        cursor_state.blink = true;
        break;

      case 4:
        this._style = coUtils.Constant.CURSOR_STYLE_UNDERLINE;
        cursor_state.blink = false;
        break;

      case 5:
        this._style = coUtils.Constant.CURSOR_STYLE_BEAM;
        cursor_state.blink = true;
        break;

      case 6:
        this._style = coUtils.Constant.CURSOR_STYLE_BEAM;
        cursor_state.blink = false;
        break;

      default:
        coUtils.Debug.reportError(
          _("DECSCUSR: Unknkown cursor style: %d."));
        break;
    }
  },
 
  "[subscribe('sequence/decrqss/decscusr'), pnp]":
  function onRequestStatus(data) 
  {
    var cursor_state = this._cursor_state,
        param;
        message;

    switch (this._style) {
      case coUtils.Constant.CURSOR_STYLE_BLOCK:
        if (cursor_state.blink) {
          param = 1;
        } else {
          param = 2;
        }
        break;

      case coUtils.Constant.CURSOR_STYLE_UNDERLINE:
        if (cursor_state.blink) {
          param = 3;
        } else {
          param = 4;
        }
        break;

      case coUtils.Constant.CURSOR_STYLE_BEAM:
        if (cursor_state.blink) {
          param = 5;
        } else {
          param = 6;
        }
        break;
    }

    message = "0$r" + param + " q";

    this.sendMessage("command/send-sequence/dcs", message);
  },
 
  "[subscribe('event/cursor-visibility-changed'), pnp]": 
  function onCursorVisibilityChanged(value) 
  {
    this._cursor_visibility = value;
  },

  "[subscribe('command/backup'), pnp]": 
  function backup(context) 
  {
    context.cursor = {
      opacity: this.opacity,
      color: this.color,
    }; 
  },

  "[subscribe('command/restore'), pnp]": 
  function restore(context) 
  {
    var cursor;

    if (context.cursor) {
      cursor = context.cursor;
      this.opacity = cursor.opacity;
      this.color = cursor.color;
    }
  },

  "[subscribe('command/terminal-cursor-blinking-mode-change'), pnp]": 
  function onBlinkingModeChanged(blink) 
  {
    this._blink = blink;

    if (blink) {
      this._prepareBlink();
    } else {
      if (null !== this._timer) {
        this._timer.cancel();
        this._timer = null;
      }
    }
  },

  "[subscribe('event/screen-width-changed'), pnp]": 
  function onWidthChanged(width)
  {
    this._canvas.width = width;
  },

  "[subscribe('event/screen-height-changed'), pnp]": 
  function onHeightChanged(height)
  {
    this._canvas.height = height;
  },

  "[subscribe('command/draw'), pnp]": 
  function onDraw() 
  {
    this.update();
  },

  "[subscribe('variable-changed/renderer.{line_height | char_width}'), pnp]": 
  function onCursorSizeChanged() 
  {
    this.update();
  },

  /** Set cursor position */
  "[subscribe('variable-changed/cursor.{color | opacity}'), pnp]": 
  function onCursorSettingsChanged() 
  {
    this.update();
  },

  /** Set cursor position */
  update: function update() 
  {
    var screen = this._screen,
        cursor_state = this._cursor_state,
        is_wide = screen.currentCharacterIsWide; // take care, it may be NULL!

    this._setVisibility(true);
    this._blink = cursor_state.blink;
    this._render(cursor_state.positionY, cursor_state.positionX, is_wide);
  },

  "[subscribe('event/scroll-session-started'), pnp]":
  function onScrollSessionStarted() 
  {
    this._cursor_visibility_backup.push(this._cursor_visibility);
    this._cursor_visibility = false;
    this.update();
  },
    
  "[subscribe('event/scroll-session-closed'), pnp]":
  function onScrollSessionClosed() 
  {
    if (0 !== this._cursor_visibility_backup.length) {
      this._cursor_visibility = this._cursor_visibility_backup.pop();
    }
    this.update();
  },

  "[subscribe('command/ime-mode-on'), pnp]": 
  function onImeModeOn(ime) 
  {
    this._cursor_visibility_backup.push(this._cursor_visibility);
    this._cursor_visibility = false;
  },

  "[subscribe('command/ime-mode-off'), pnp]": 
  function onImeModeOff(ime) 
  {
    if (0 !== this._cursor_visibility_backup.length) {
      this._cursor_visibility = this._cursor_visibility_backup.pop();
    }
  },

  /** Render cursor. */
  _render: function _render(row, column, is_wide) 
  {
    var context = this._context,
        canvas = this._canvas;

    context.clearRect(0, 0, canvas.width, canvas.height);

    if (this._cursor_visibility) {
      this._renderImpl(context, row, column, is_wide);
    }
  },

  _renderImpl: function _renderImpl(context, row, column, is_wide)
  {

    var renderer = this._renderer,
        line_height = renderer.line_height,
        char_width = renderer.char_width;

    var y, x, width, height, line_height;

    // set cursor color
    context.fillStyle = this.color;
  
    // calculate cursor position, size
    switch (this._style) {

      case coUtils.Constant.CURSOR_STYLE_BLOCK:
        y = row * line_height;
        x = column * char_width;
        width = char_width * (is_wide ? 2: 1);
        height = line_height;
        break;

      case coUtils.Constant.CURSOR_STYLE_UNDERLINE:
        y = row * line_height + (line_height - 2);
        x = column * char_width;
        width = char_width * (is_wide ? 2: 1);
        height = 2;
        break;

      case coUtils.Constant.CURSOR_STYLE_BEAM:
        y = row * line_height;
        x = column * char_width;
        width = 2;
        height = line_height;
        break;

      default:
        coUtils.Debug.reportError(
          _("Unknown cursor style: %d."), this._style);
        return;

    }

    // draw cursor
    context.fillRect(x, y, width, height);
  },

  /** Set blink timer. */
  _prepareBlink: function _prepareBlink() 
  {
    var i;

    if (null !== this._timer) {
      this._timer.cancel();
    } 

    i = 0;

    this._timer = coUtils.Timer.setInterval(
      function()
      {
        if (this._blink && i++ % 2) {
          this._setVisibility(false);
        } else {
          this._setVisibility(true);
        }
      }, this.blink_duration, this);
  },

  /** Set cursor visibility. */
  _setVisibility: function _setVisibility(visibility) 
  {
    if (this._canvas) {
      this._canvas.style.MozTransitionDuration = this.blink_transition_duration + "ms";
      this._canvas.style.transitionTimingFunction = this.transition_function;
      if (visibility) {
        this._canvas.style.opacity = this.opacity;
      } else {
        this._canvas.style.opacity = this.opacity2;
      }
    }
  }
}

/**
 * @fn main
 * @brief Module entry point.
 * @param {Broker} broker The Broker object.
 */
function main(broker) 
{
  new Cursor(broker);
}

// EOF
