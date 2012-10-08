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

"use strict";

/**
 *  @class CommandlineIme
 *  
 *  This plugin makes it enable to supports IME mode.
 *  It watches the value of main inputbox element with polling. 
 *  (NOTE that Mozilla's inputbox at IME editing mode does not fires ANY DOM 
 *  events!)
 *  object. and shows a line on editing as an watermark/overlay object. 
 *
 */ 
var CommandlineIme = new Class().extends(Plugin)
                                .depends("commandline");
CommandlineIme.definition = {

  id: "commandline_ime",

  getInfo: function getInfo()
  {
    return {
      name: _("Commandline IME"),
      version: "0.1",
      description: _("Make you enable to input with IME at the commandline field.")
    };
  },

  "[persistable] enabled_when_startup": true,

  "[persistable] polling_interval": 500, // in milliseconds

  _timer: null,
  _ime_input_flag: false,
  _commandline: null,

  /** Installs itself. 
   *  @param {InstallContext} context A InstallContext object.
   */
  "[install]":
  function install(context) 
  {
    var version_comparator = coUtils.Services.versionComparator,
        focused_element = this.request("get/root-element")
          .ownerDocument
          .commandDispatcher
          .focusedElement,
        textbox;

    this._commandline = context["commandline"];

    textbox = this._commandline.getInputField(),
    textbox.style.width = "0%";
    textbox.style.imeMode = "inactive"; // disabled -> inactive
    textbox.style.border = "none"; // hide border

    // enables session event handlers.
    if (version_comparator.compare(coUtils.Runtime.version, "10.0") <= 0)
    {
      this.startPolling.enabled = true;
      this.endPolling.enabled = true;
    }

    if (focused_element && focused_element.isEqualNode(textbox)) {
      this.startPolling();
    }
      
  }, // install

  /** Uninstall plugin 
   */
  "[uninstall]":
  function uninstall() 
  {
    var textbox = this._commandline.getInputField();

    this.endPolling(); // stops polling timer. 

    if (null !== textbox) {
      textbox.style.width = "";
      textbox.style.imeMode = "disabled";
      textbox.style.border = "";  
      textbox.style.position = ""; 
    }

    // disables session event handlers.
    this.startPolling.enabled = false;
    this.endPolling.enabled = false;

    this._commandline = null;
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
 
  /** input event handler. 
   *  @param {Event} event A event object.
   *  @notify event/input Notifies that a input event is occured.
   */
  "[listen('input', '#tanasinn_default_input')]":
  function oninput(event) 
  {
    this._commandline.commit();
    this._disableImeMode();
  },
 
  /** compositionend event handler. 
   *  @{Event} event A event object.
   */
  "[listen('compositionupdate', '#tanasinn_commandline'), pnp]":
  function oncompositionupdate(event) 
  {
    this.onpoll();
  },
 
  /** compositionstart event handler. 
   *  @{Event} event A event object.
   */
  "[listen('compositionstart', '#tanasinn_commandline'), pnp]":
  function oncompositionstart(event) 
  {
    var version_comparator = coUtils.Services.versionComparator;

    if (version_comparator.compare(coUtils.Runtime.version, "10.0") >= 0) {
      this.oninput.enabled = false;
    }
  },
  
  /** compositionend event handler. 
   *  @{Event} event A event object.
   */
  "[listen('compositionend', '#tanasinn_commandline'), pnp]":
  function oncompositionend(event) 
  {
    var version_comparator = coUtils.Services.versionComparator;

    if (version_comparator.compare(coUtils.Runtime.version, "10.0") >= 0) {
      this.oninput.enabled = true;
      this.oninput(event);
    }
  },

  /** A interval timer handler function that observes the textbox content
   *  value and switches IME enabled/disabled state. 
   */  
  onpoll: function onpoll() 
  {
    var text = this._commandline.getInputField().value;

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
    var commandline = this._commandline,
        textbox = commandline.getInputField(),
        top = 0, // cursor.positionY * line_height + -4;
        left = commandline.getCaretPosition(); // cursor.positionX * char_width + -2;

    textbox.style.opacity = 1.0;
    this._ime_input_flag = true;

    this.sendMessage("command/ime-mode-on", this);
  },

  _disableImeMode: function _disableImeMode() 
  {
    var commandline = this._commandline,
        textbox = this._commandline.getInputField();

    textbox.style.opacity = 0.0;
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
  new CommandlineIme(broker);
}

// EOF
