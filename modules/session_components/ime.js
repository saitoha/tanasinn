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
 *  When IME mode turns on, we moves inputbox at the position of cursor 
 *  object. and shows a line on editing as an watermark/overlay object. 
 *
 */ 
let Ime = new Class().extends(Plugin)
                     .depends("renderer")
                     .depends("cursorstate")
                     .depends("inputmanager");
Ime.definition = {

  get id()
    "ime",

  get info()
    <plugin>
        <name>{_("IME")}</name>
        <description>{
          _("Make you enable to input with IME.")
        }</description>
        <version>0.1</version>
    </plugin>,

  "[persistable] polling_interval": 500, // in milliseconds

  _timer: null,
  _ime_input_flag: false,

  /** Installs plugin 
   *  @param {Session} session A session object.
   */ 
  "[subscribe('install/ime'), enabled]":
  function install(session) 
  {
    let textbox = this.dependency["inputmanager"].getInputField();
    let renderer = this.dependency["renderer"];
    textbox.style.width = "0%";
    textbox.style.imeMode = "inactive"; // disabled -> inactive
    textbox.style.border = "none"; // hide border
    //textbox.style.position = "absolute"; // relative -> absolute
    textbox.style.font = coUtils.Text.format(
      "%dpx %s", 
      renderer.font_size,
      renderer.font_family);

    // enables session event handlers.
    let version_comparator = Components
      .classes["@mozilla.org/xpcom/version-comparator;1"]
      .getService(Components.interfaces.nsIVersionComparator);
    if (version_comparator.compare(coUtils.Runtime.version, "9.0") < 0)
    {
      this.startPolling.enabled = true;
      this.endPolling.enabled = true;
    }
    this.oninput.enabled = true;
    this.oncompositionupdate.enabled = true;

    let document = session.window.document;
    let focusedElement = document.commandDispatcher.focusedElement;
    if (focusedElement && focusedElement.isEqualNode(textbox)) {
      this.startPolling();
    }
      
  }, // install

  /** Uninstall plugin 
   *  @param {Session} session A session object.
   */
  "[subscribe('uninstall/ime'), enabled]":
  function uninstall(session) 
  {
    this.endPolling(); // stops polling timer. 
    let textbox = this.dependency["inputmanager"].getInputField();
    textbox.style.width = "";
    textbox.style.imeMode = "disabled";
    textbox.style.border = "";  
    textbox.style.position = ""; 

    // disables session event handlers.
    this.startPolling.enabled = false;
    this.endPolling.enabled = false;
    this.oninput.enabled = false;
    this.oncompositionupdate.enabled = false;
  },

  "[subscribe('command/input-text'), enabled]": 
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
  "[listen('compositionupdate', '#tanasinn_default_input')]":
  function oncompositionupdate(event) 
  {
    this.onpoll();
  },

  /** A interval timer handler function that observes the textbox content
   *  value and switches IME enabled/disabled state. 
   */  
  onpoll: function onpoll() 
  {
    let text = this.dependency["inputmanager"].getInputField().value;
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
    let textbox = this.dependency["inputmanager"].getInputField();
    let renderer = this.dependency["renderer"];
    let cursor = this.dependency["cursorstate"];
    let line_height = renderer.line_height;
    let char_width = renderer.char_width;
    let char_height = renderer.char_height;
    let char_offset = renderer.char_offset;
    let normal_color = renderer.normal_color;
    let font_size = renderer.font_size;
    let top = cursor.positionY * line_height + -4;
    let left = cursor.positionX * char_width + -2;
    textbox.setAttribute("top", top);
    textbox.setAttribute("left", left);
    textbox.style.opacity = 1.0;
    textbox.style.backgroundColor = "transparent";
    textbox.style.color = normal_color[7];
    textbox.style.fontSize = font_size + "px";
    textbox.style.width = "100%";
    this._ime_input_flag = true;
    let session = this._broker;
    session.notify("command/ime-mode-on", this);
  },

  _disableImeMode: function _disableImeMode() 
  {
    this.dependency["inputmanager"].getInputField().style.opacity = 0.0;
    this._ime_input_flag = false;
    let session = this._broker;
    session.notify("command/ime-mode-off", this);
  }
}

/**
 * @fn main
 * @brief Module entry point.
 * @param {Broker} broker The Broker object.
 */
function main(broker) 
{
  broker.subscribe(
    "@initialized/broker", 
    function(broker) 
    {
      new Ime(broker);
    });
}

