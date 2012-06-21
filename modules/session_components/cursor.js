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
    <plugin>
        <name>{_("Cursor")}</name>
        <version>0.1</version>
        <description>{
          _("Make it Enabled to show cursor.")
        }</description>
        <detail lang="ja">
        <![CDATA[
          
        ]]>
        </detail>
    </plugin>,

  /** UI template */
  get template() 
    let (renderer = this.dependency["renderer"])
    let (screen = this.dependency["screen"])
    ({
      parentNode: "#tanasinn_center_area",
      tagName: "html:canvas",
      id: "cursor_canvas",
      width: renderer.char_width * screen.width,
      height: renderer.line_height * screen.height,
    }),

  "[persistable] enabled_when_startup": true,

  _cursorVisibility: true,
  _blinkVisibility: false,
  _blink: true,
  _timer: null,

  "[persistable, watchable] color": "#77ff77",
  "[persistable, watchable] opacity": 0.3,
 
  /** Installs itself. */
  "[install]": 
  function install(session) 
  {
    /** Create cursor element. */
    var {cursor_canvas} 
      = session.uniget("command/construct-chrome", this.template);

    this._canvas = cursor_canvas;
    this._context = this._canvas.getContext("2d");

    //
    // subscribe some events.
    //
    // initial update
    this.update();
  },

  /** Uninstalls itself. */
  "[uninstall]":
  function uninstall(session) 
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
  },

  /**
   *
   * DECSCUSR — Set Cursor Style
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
  function SECSCUSR(n) 
  {
    switch (n) {
      case 1:
      case 2:
      case 3:
      case 4:
      case 5:
      case 6:
        break;

      default:
        break;
    }
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
      this._setVisibility(true);
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
    var screen, cursor_state, is_wide;

    screen = this.dependency["screen"];
    cursor_state = this.dependency["cursorstate"];
    is_wide = screen.currentCharacterIsWide; // take care, it may be NULL!

    this._setVisibility(true);
    this._blink = cursor_state.blink;
    this._render(cursor_state.positionY, cursor_state.positionX, is_wide);
  },

  "[subscribe('event/scroll-session-started'), pnp]":
  function onScrollSessionStarted() 
  {
    this._cursorVisibility = false;
    this.update();
  },
    
  "[subscribe('event/scroll-session-closed'), pnp]":
  function onScrollSessionClosed() 
  {
    this._cursorVisibility = true;
    this.update();
  },

  "[subscribe('command/ime-mode-on'), pnp]": 
  function onImeModeOn(ime) 
  {
    this._cursorVisibility = false;
  },

  "[subscribe('command/ime-mode-off'), pnp]": 
  function onImeModeOff(ime) 
  {
    this._cursorVisibility = true;
  },

  /** Render cursor. */
  _render: function _render(row, column, is_wide) 
  {
    var cursor_state, context, canvas;

    cursor_state = this.dependency["cursorstate"];
    context = this._context;
    canvas = this._canvas;
    context.clearRect(0, 0, canvas.width, canvas.height);

    if (this._cursorVisibility && cursor_state.visibility) {
      this._renderImpl(context, row, column, is_wide);
    }
  },

  _renderImpl: function _renderImpl(context, row, column, is_wide)
  {
    var renderer, y, x, width, height, line_height, char_width;

    renderer = this.dependency["renderer"];
    line_height = renderer.line_height;
    char_width = renderer.char_width;

    // set cursor color
    context.fillStyle = this.color;

    // calculate cursor position
    y = row * line_height;
    x = column * char_width;
    width = char_width * (is_wide ? 2: 1);
    height = line_height;

    // draw cursor
    context.fillRect(x, y, width, height);
  },

  /** Set blink timer. */
  _prepareBlink: function _prepareBlink() 
  {
    if (null !== this._timer) {
      this._timer.cancel();
    } 
    var i = 0;
    this._timer = coUtils.Timer.setInterval(function()
    {
      if (this._blink && i++ % 2) {
        this._canvas.style.opacity = 0.00;
      } else {
        this._canvas.style.opacity = this.opacity;
      }
    }, 500, this);
  },

  /** Set cursor visibility. */
  _setVisibility: function _setVisibility(visibility) 
  {
    if (this._canvas) {
      if (visibility) {
        this._canvas.style.opacity = this.opacity;
      } else {
        this._canvas.style.opacity = 0.00;
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


