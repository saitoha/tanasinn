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
let Cursor = new Class().extends(Plugin)
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

  _cursorVisibility: true,
  _blinkVisibility: false,
  _blink: true,

  "[persistable, watchable] color": "#77ff77",
  "[persistable, watchable] opacity": 0.3,
 
  /** Installs itself. */
  "[subscribe('install/cursor'), enabled]": 
  function install(session) 
  {
    /** Create cursor element. */
    let {cursor_canvas} 
      = session.uniget("command/construct-chrome", this.template);

    this._canvas = cursor_canvas;
    this._context = this._canvas.getContext("2d");

    this._prepareBlink();

    //
    // subscribe some events.
    //
    this.update.enabled = true;
    this.onBlinkingModeChanged.enabled = true;
    this.onWidthChanged.enabled = true;
    this.onHeightChanged.enabled = true;
    this.onImeModeOn.enabled = true;
    this.onImeModeOff.enabled = true;
    this.onScrollSessionStarted.enabled = true;
    this.onScrollSessionClosed.enabled = true;
    this.backup.enabled = true;
    this.restore.enabled = true;
    
    // initial update
    this.update();
  },

  /** Uninstalls itself. */
  "[subscribe('uninstall/cursor'), enabled]": 
  function uninstall(session) 
  {
    this.update.enabled = false;
    this.onBlinkingModeChanged.enabled = false;
    this.onWidthChanged.enabled = false;
    this.onHeightChanged.enabled = false;
    this.onImeModeOn.enabled = false;
    this.onImeModeOff.enabled = false;
    this.onScrollSessionStarted.enabled = false;
    this.onScrollSessionClosed.enabled = false;
    this.backup.enabled = false;
    this.restore.enabled = false;
    this._canvas.parentNode.removeChild(this._canvas);
  },

  "[subscribe('command/backup')]": 
  function backup(context) 
  {
    context.cursor = {
      opacity: this.opacity,
      color: this.color,
    }; 
  },

  "[subscribe('command/restore')]": 
  function restore(context) 
  {
    let {opacity, color} = context.cursor;
    this.opacity = opacity;
    this.color = color;
  },

  "[subscribe('terminal-cursor-blinking-mode-change')]": 
  function onBlinkingModeChanged(blink) 
  {
    this._blink = blink;
    if (blink) {
      this._prepareBlink();
    } else {
      this._setVisibility(true);
    }
  },

  "[subscribe('event/screen-width-changed')]": 
  function onWidthChanged(width)
  {
    this._canvas.width = width;
  },

  "[subscribe('event/screen-height-changed')]": 
  function onHeightChanged(height)
  {
    this._canvas.height = height;
  },

  /** Set cursor position */
  "[subscribe('command/draw | variable-changed/renderer.{line_height | char_width} | variable-changed/cursor.{color | opacity}')]": 
  function update() 
  {
    let screen = this.dependency["screen"];
    let cursor_state = this.dependency["cursorstate"];
    let isWide = screen.currentCharacterIsWide; // take care, it may be NULL!
    this._setVisibility(true);
    this._blink = cursor_state.blink;
    this._render(cursor_state.positionY, cursor_state.positionX, isWide);
  },

  "[subscribe('event/scroll-session-started')]":
  function onScrollSessionStarted() 
  {
    this._cursorVisibility = false;
    this.update();
  },
    
  "[subscribe('event/scroll-session-closed')]":
  function onScrollSessionClosed() 
  {
    this._cursorVisibility = true;
    this.update();
  },

  "[subscribe('command/ime-mode-on')]": 
  function onImeModeOn(ime) 
  {
    this._cursorVisibility = false;
  },

  "[subscribe('command/ime-mode-off')]": 
  function onImeModeOff(ime) 
  {
    this._cursorVisibility = true;
  },

  /** Render cursor. */
  _render: function _render(row, column, isWide) 
  {
    let cursor_state = this.dependency["cursorstate"];
    let renderer = this.dependency["renderer"];
    let line_height = renderer.line_height;
    let char_width = renderer.char_width;
    let context = this._context;
    let canvas = this._canvas;
    context.clearRect(0, 0, canvas.width, canvas.height);
    if (this._cursorVisibility && cursor_state.visibility) {
      context.fillStyle = this.color;
      let y = row * line_height;
      let x = column * char_width;
      let width = char_width * (isWide ? 2: 1);
      let height = line_height;
      context.fillRect(x, y, width, height);

    }
  },

  /** Set blink timer. */
  _prepareBlink: function _prepareBlink() 
  {
    let blink = function blink() {
      let blinkVisibility = this._blinkVisibility = !this._blinkVisibility;
      let visibility = this._cursorVisibility// && this._blink && blinkVisibility;
      this._setVisibility(visibility);
      let callee = arguments.callee;
      coUtils.Timer.setTimeout(function() callee.call(this), 500, this);
    }
    blink.call(this);
  },

  /** Set cursor visibility. */
  _setVisibility: function _setVisibility(visibility) 
  {
    this._canvas.style.opacity = visibility ? this.opacity: 0.00;
  }
}

/**
 * @fn main
 * @brief Module entry point.
 * @param {Desktop} desktop The Desktop object.
 */
function main(desktop) 
{
  desktop.subscribe(
    "@initialized/broker", 
    function(session) new Cursor(session));
}


