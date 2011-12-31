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
 * The Original Code is coTerminal
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
let Cursor = new Class().extends(Plugin);
Cursor.definition = {

  get id()
    "cursor",

  get info()
    <plugin>
        <name>{_("Cursor")}</name>
        <description>{
          _("Make it Enabled to show cursor.")
        }</description>
        <version>0.1</version>
    </plugin>,

  /** UI template */
  get template() 
    ({
      parentNode: "#coterminal_center_area",
      tagName: "html:canvas",
      id: "cursor_canvas",
      style: { opacity: 0.5, },
      width: this._renderer.char_width * this._screen.width,
      height: this._renderer.line_height * this._screen.height,
    }),

  _cursorVisibility: true,
  _blinkVisibility: false,
  _blink: true,
  _screen: null,
  _renderer: null,

  _color: "#77ff77",
  _opacity: 0.6,

  // color
  get "[persistable] color"() 
  {
    return this._color;
  },

  set "[persistable] color"(value) 
  {
    this._color = value;
  },

  // opacity
  get "[persistable] opacity"() 
  {
    return this._opacity;
  },

  set "[persistable] opacity"(value) 
  {
    this._opacity = value;
  },
  
  /** post-constructor */
  "[subscribe('@initialized/{renderer & screen & cursorstate}'), enabled]":
  function onLoad(renderer, screen, cursor_state) 
  {
    this._renderer = renderer;
    this._screen = screen;
    this._cursor_state = cursor_state;
    this.enabled = this.enabled_when_startup;
  },

  /** Installs itself. */
  install: function install(session) 
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
    
    // initial update
    this.update();
  },

  /** Uninstalls itself. */
  uninstall: function uninstall(session) 
  {
    this.update.enabled = false;
    this.onBlinkingModeChanged.enabled = false;
    this.onWidthChanged.enabled = false;
    this.onHeightChanged.enabled = false;
    this.onImeModeOn.enabled = false;
    this.onImeModeOff.enabled = false;
    this.onScrollSessionStarted.enabled = false;
    this.onScrollSessionClosed.enabled = false;
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
  "[subscribe('command/draw | variable-changed/renderer.{line_height | char_width}')]": 
  function update() 
  {
    let screen = this._screen;
    let cursor_state = this._cursor_state;
    let isWide = screen.currentCharacterIsWide; // take care, it may be NULL!
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
    let cursor_state = this._cursor_state;
    let renderer = this._renderer;
    let line_height = renderer.line_height;
    let char_width = renderer.char_width;
    let context = this._context;
    let canvas = this._canvas;
    context.clearRect(0, 0, canvas.width, canvas.height);
    if (this._cursorVisibility && cursor_state.visibility) {
      context.fillStyle = "yellow";
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
    this._canvas.style.opacity = visibility ? this._opacity: 0.00;
  }
}

/**
 * @fn main
 * @brief Module entry point.
 * @param {Process} process The Process object.
 */
function main(process) 
{
  process.subscribe(
    "initialized/session", 
    function(session) new Cursor(session));
}


