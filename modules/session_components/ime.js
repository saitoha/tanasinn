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
                     .depends("inputmanager");
Ime.definition = {

  get id()
    "ime",

  get info()
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

  /** Installs plugin 
   *  @param {Broker} broker A Broker object.
   */ 
  "[install]":
  function install(broker) 
  {
    var textbox = this.dependency["inputmanager"].getInputField(),
        renderer = this.dependency["renderer"],
        version_comparator = coUtils.Services.versionComparator,
        focused_element;

    textbox.style.width = "0%";
    textbox.style.imeMode = "inactive"; // disabled -> inactive
    textbox.style.border = "none"; // hide border
    //textbox.style.position = "absolute"; // relative -> absolute
    textbox.style.font = coUtils.Text.format(
      "%dpx %s", 
      renderer.font_size,
      renderer.font_family);

    // enables session event handlers.
    if (version_comparator.compare(coUtils.Runtime.version, "10.0") <= 0)
    {
      this.startPolling.enabled = true;
      this.endPolling.enabled = true;
    }

    focused_element = this.request("get/root-element")
      .ownerDocument
      .commandDispatcher
      .focusedElement;
    if (focused_element && focused_element.isEqualNode(textbox)) {
      this.startPolling();
    }
      
  }, // install

  /** Uninstall plugin 
   *  @param {Broker} broker A Broker object.
   */
  "[uninstall]":
  function uninstall(broker) 
  {
    var textbox;

    this.endPolling(); // stops polling timer. 
    textbox = this.dependency["inputmanager"].getInputField();
    textbox.style.width = "";
    textbox.style.imeMode = "disabled";
    textbox.style.border = "";  
    textbox.style.position = ""; 

    // disables session event handlers.
    this.startPolling.enabled = false;
    this.endPolling.enabled = false;
  },

  "[subscribe('command/input-text'), pnp]": 
  function oninput(value) 
  {
    this._disableImeMode(); // closes IME input session.
  },

  /** Starts the polling timer. */
  "[subscribe('event/got-focus')]":
  function startPolling() 
  {
    if (this._timer) {
      this._timer.cancel();
    }
    this._ime_input_flag = false;
    this._timer = coUtils.Timer
      .setInterval(this.onpoll, this.polling_interval, this);
  },

  /** Stops the polling timer. */
  "[subscribe('event/lost-focus')]":
  function endPolling() 
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
    this.onpoll();
  },

  /** A interval timer handler function that observes the textbox content
   *  value and switches IME enabled/disabled state. 
   */  
  onpoll: function onpoll() 
  {
    var text;

    text = this.dependency["inputmanager"].getInputField().value;
    if (text) { // if textbox contains some text data.
      if (!this._ime_input_flag) {
        this._enableImeMode(); // makes the IME mode enabled.
      }
    } else {   // if textbox is empty.
      if (this._ime_input_flag) {
        this._disableImeMode(); // makes the IME mode disabled.
      }
    }
  },

  /** Shows textbox element. */
  _enableImeMode: function _enableImeMode() 
  {
    var textbox, renderer, cursor, line_height, char_width, char_height,
        char_offset, normal_color, font_size, top, left;;

    textbox = this.dependency["inputmanager"].getInputField();
    renderer = this.dependency["renderer"];
    cursor = this.dependency["cursorstate"];
    line_height = renderer.line_height;
    char_width = renderer.char_width;
    char_height = renderer.char_height;
    char_offset = renderer.char_offset;
    normal_color = renderer.color;
    font_size = renderer.font_size;
    top = cursor.positionY * line_height + -4;
    left = cursor.positionX * char_width + -2;
    textbox.setAttribute("top", top);
    textbox.setAttribute("left", left);
    textbox.style.opacity = 1.0;
    textbox.style.backgroundColor = "transparent";
    textbox.style.color = normal_color[7];
    textbox.style.fontSize = font_size + "px";
    textbox.style.width = "100%";
    this._ime_input_flag = true;
    this.sendMessage("command/ime-mode-on", this);
  },

  _disableImeMode: function _disableImeMode() 
  {
    this.dependency["inputmanager"].getInputField().style.opacity = 0.0;
    this._ime_input_flag = false;
    this.sendMessage("command/ime-mode-off", this);
  }
};

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
