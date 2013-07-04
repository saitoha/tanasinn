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

/**
 *  @class Ime
 *
 *  This plugin makes it enable to supports IME mode.
 *  It watches the value of main inputbox element with polling.
 *  (NOTE that Mozilla's inputbox at IME editing mode does not fires ANY DOM
 *  events!)
 *  object. and shows a line on editing as an watermark/overlay object.
 *
 */
var Ime = new Class().extends(Plugin)
                     .depends("renderer")
                     .depends("cursorstate")
                     .depends("palette")
                     .depends("inputmanager");
Ime.definition = {

  /** Component ID */
  id: "ime",

  /** plugin information */
  getInfo: function getInfo()
  {
    return {
      name: _("IME"),
      version: "0.1",
      description: _("Make you enable to input with IME.")
    };
  },

  "[persistable] enabled_when_startup": true,
  "[persistable] polling_interval": 500, // in milliseconds

  _timer: null,
  _ime_input_flag: false,
  _input_manager: null,
  _renderer: null,
  _cursor_state: null,
  _enabled: true,

  /** Installs itself.
   *  @param {InstallContext} context A InstallContext object.
   */
  "[install]":
  function install(context)
  {
    var input_manager = context["inputmanager"],
        textbox = input_manager.getInputField(),
        input_field = textbox.inputField,
        renderer = context["renderer"],
        version_comparator = coUtils.Services.versionComparator,
        focused_element;

    this._renderer = renderer;
    this._palette = context["palette"];
    this._cursor_state = context["cursorstate"];
    this._input_manager = input_manager;
    this._enabled = true;

    textbox.style.width = "0%";
    if (input_field) {
      input_field.style.imeMode = "inactive"; // disabled -> inactive
    }
    textbox.style.border = "none"; // hide border
    //textbox.style.position = "absolute"; // relative -> absolute
    textbox.style.font = coUtils.Text.format(
      "%dpx %s",
      renderer.font_size,
      renderer.font_family);

    // enables session event handlers.
    if (version_comparator.compare(coUtils.Runtime.version, "10.0") <= 0)
    {
      this.onGotFocus.enabled = true;
      this.onLostFocus.enabled = true;
    }

    focused_element = this.request("get/root-element")
      .ownerDocument
      .commandDispatcher
      .focusedElement;
    if (focused_element && focused_element.isEqualNode(textbox)) {
      this.onGotFocus();
    }

  }, // install

  /** Uninstall plugin
   */
  "[uninstall]":
  function uninstall()
  {
    var textbox = this._input_manager.getInputField();

    this._endPolling(); // stops polling timer.

    if (null !== textbox) {
      textbox.style.width = "";
      if (textbox.inputField) {
        textbox.inputField.style.imeMode = "disabled";
      }
      textbox.style.border = "";
      textbox.style.position = "";
    }

    this._input_manger = null;
    this._cursor_state = null;
    this._renderer = null;
    this._palette = null;

    // disables session event handlers.
    this.onGotFocus.enabled = false;
    this.onLostFocus.enabled = false;
  },

  "[profile('vt100'), sequence('CSI < Ps t')]":
  function TTIMEST(n)
  {
    n = n || 0;
    if (0 === n) {
      this.sendMessage("command/disable-ime");
    } else if (1 === n) {
      this.sendMessage("command/enable-ime");
    }
  },

  "[subscribe('command/input-text'), pnp]":
  function oninput(value)
  {
    this._compositionEnd(); // closes IME input session.
  },

  /** Starts the polling timer. */
  "[subscribe('event/got-focus')]":
  function onGotFocus()
  {
    //if (this._enabled) {
      this._startPolling();
    //}
  },

  /** Stops the polling timer. */
  "[subscribe('event/lost-focus')]":
  function onLostFocus()
  {
    this._endPolling();
  },

  /** Enable IME */
  "[subscribe('command/enable-ime'), pnp]":
  function enableIME()
  {
    var textbox = this._input_manager.getInputField();
    if (textbox.inputField) {
      textbox.style.opacity = 1.0;
      textbox.inputField.style.imeMode = "active";
      this.sendMessage("command/disable-focus-events");
      textbox.blur();
      textbox.focus();
      textbox.focus();
      textbox.focus();
      textbox.focus();
      textbox.style.opacity = 0.0;
    }
    this.sendMessage("command/enable-focus-events");
    this._enabled = true;
    this._startPolling();
  },

  /** Stops the polling timer. */
  "[subscribe('command/disable-ime'), pnp]":
  function disableIME()
  {
    var textbox = this._input_manager.getInputField();

    if (textbox.inputField) {
      textbox.style.opacity = 1.0;
      textbox.inputField.style.imeMode = "inactive";
      this.sendMessage("command/disable-focus-events");
      textbox.blur();
      textbox.focus();
      textbox.focus();
      textbox.focus();
      textbox.focus();
      textbox.style.opacity = 0.0;
    }
    this.sendMessage("command/enable-focus-events");
    this._enabled = false;
    this._endPolling();
  },

  _startPolling: function _startPolling()
  {
    if (this._timer) {
      this._timer.cancel();
    }
    this._ime_input_flag = false;
    this._timer = coUtils.Timer
      .setInterval(this.onpoll, this.polling_interval, this);
  },

  _endPolling: function _endPolling()
  {
    if (this._timer) {
      this._timer.cancel();
      this._timer = null;
    }
  },

  /** compositionend event handler.
   *  @{Event} event A event object.
   */
  "[listen('compositionupdate', '#tanasinn_default_input'), pnp]":
  function oncompositionupdate(event)
  {
    //if (this._enabled) {
      this.onpoll();
    //}
  },

  /** A interval timer handler function that observes the textbox content
   *  value and switches IME enabled/disabled state.
   */
  onpoll: function onpoll()
  {
    var text = this._input_manager.getInputField().value;

    if (text) { // if textbox contains some text data.
      if (!this._ime_input_flag) {
        this._compositionStart(); // makes the IME mode enabled.
      }
    } else {   // if textbox is empty.
      if (this._ime_input_flag) {
        this._compositionEnd(); // makes the IME mode disabled.
      }
    }
  },

  /** Shows textbox element. */
  _compositionStart: function _compositionStart()
  {
    var textbox = this._input_manager.getInputField(),
        renderer = this._renderer,
        palette = this._palette,
        cursor = this._cursor_state,
        line_height = renderer.line_height,
        char_width = renderer.char_width,
        char_height = renderer.char_height,
        char_offset = renderer.char_offset,
        normal_color = palette.color,
        font_size = renderer.font_size,
        top = cursor.position_y * line_height + -4,
        left = cursor.position_x * char_width + -2;

    textbox.setAttribute("top", top);
    textbox.setAttribute("left", left);
    textbox.style.opacity = 1.0;
    textbox.style.backgroundColor = "transparent";
    textbox.style.color = normal_color[7];
    textbox.style.fontSize = font_size + "px";
    textbox.style.width = "100%";

    this._ime_input_flag = true;

    this.sendMessage("event/ime-composition-start", this);
  },

  _compositionEnd: function _compositionEnd()
  {
    this._input_manager.getInputField().style.opacity = 0.0;
    this._ime_input_flag = false;
    this.sendMessage("event/ime-composition-end", this);
  },

  /** test */
  "[test]":
  function()
  {
    var enabled = this.enabled;

    try {
      this.enabled = false;
      this.enabled = true;
      this.enabled = false;
    } finally {
      this.enabled = enabled;
    }
  },


}; // class Ime

/**
 * @fn main
 * @brief Module entry point.
 * @param {Broker} broker The Broker object.
 */
function main(broker)
{
  new Ime(broker);
}

// EOF
