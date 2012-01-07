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
 * @class Launcher
 * @brief Manage a terminal UI and a session.
 */
let Launcher = new Class().extends(Component);
Launcher.definition = {

  get id()
    "launcher",

  "[persistable] command_id": "command_CreateTerminal",
  "[persistable] menu_id": "menu_CreateTerminal",
  "[persistable] menu_label": "create new terminal",
  "[persistable] shortcut_id": "key_CreateTerminal",
  "[persistable] shortcut_key": ",",
  "[persistable] shortcut_modifiers": "control",

  top: 20,
  left: 20,

  initializeWithWindow: 
  function initializeWithWindow(window)
  {
    let broker = this._broker;
    let document = window.document;

    let outer = window
      .document.documentElement
      .appendChild(document.createElement("hbox"));
    outer.hidden = true;
    outer.style.cssText = <>
      position: fixed;
      left: 0px;
      top: 10%;
      width: 100%;
    </>;

    let textbox = outer
      .appendChild(document.createElement("textbox"));
    textbox.style.cssText = <>
              border: solid 1px green;
      display: -moz-box;
      font-size: 80px;
      padding: 0px;
      width: 80%;
      margin-left: 10%;
    </>;

    this._element = outer;
    this._textbox = textbox;

    textbox.addEventListener(
      "blur", 
      function onblur(event) 
      {
        outer.hidden = true;
      }, false);

    textbox.addEventListener(
      "change", 
      let (process = this._broker, self = this) 
        function onblur(event) 
        {
          let terminal = process.start(
            document.documentElement,
            this.value,  // command
            null,  // TERM environment
            null,  // size 
            ["modules/core", 
             "modules/standard", 
             "modules/plugin"]);
          this.inputField.value = "";
          terminal.style.left = <>{self.left = (self.left + Math.random() * 40 - 20) % 40 + 10}%</>;
          terminal.style.top = <>{self.top = (self.top + Math.random() * 40 - 20) % 40 + 10}%</>;
        }, false);

    window.addEventListener(
      "keyup", let (self = this) function() {
        self.onkeyup.apply(self, arguments);
      }, /* capture */ true);

    window.addEventListener(
      "keydown", let (self = this) function() {
        self.onkeydown.apply(self, arguments);
      }, /* capture */ true);
  },

  onkeyup: function onkeyup(event) 
  { // nothrow
    if (16 == event.keyCode && 16 == event.which 
        && !event.ctrlKey && !event.altKey 
        && !event.shiftKey && !event.isChar) {
      let broker = this._broker;
      let now = parseInt(new Date().getTime());
      if (now - this._last_ctrlkey_time < 500) {
        //session.notify("command/focus");
        //session.notify("introducer-pressed/double-shift");
        //session.notify("command/report-overlay-message", "shift + shift pressed");
        this._last_ctrlkey_time = 0;
      } else {
        this._last_ctrlkey_time = now;
      }
      //session.notify("event/shift-key-up");
    } else if (17 == event.keyCode && 17 == event.which 
        && !event.ctrlKey && !event.altKey 
        && !event.shiftKey && !event.isChar) {
      let now = parseInt(new Date().getTime());
      if (now - this._last_ctrlkey_time < 500) {
            try {
        let box = this._element;
        let textbox = this._textbox;
        if (box.hidden) {
          box.hidden = false;
          textbox.focus();
          box.parentNode.appendChild(box);
          textbox.focus();
        } else {
          textbox.blur();
          box.hidden = true;
        }
            } catch (e) {alert(e)}
        //session.notify("introducer-pressed/double-ctrl");
        this._last_ctrlkey_time = 0;
      } else {
        this._last_ctrlkey_time = now;
      }
    } else if (18 == event.keyCode && 18 == event.which 
        && !event.ctrlKey && !event.altKey 
        && !event.shiftKey && !event.isChar) {
      //session.notify("event/alt-key-up");
    }
  },

  onkeydown: function onkeydown(event) 
  { // nothrow
    if (16 == event.keyCode && 16 == event.which 
        && !event.ctrlKey && !event.altKey 
        && event.shiftKey && !event.isChar) {
      let session = this._broker;
      session.notify("event/shift-key-down");
    } else if (18 == event.keyCode && 18 == event.which 
        && !event.ctrlKey && event.altKey 
        && !event.shiftKey && !event.isChar) {
      let session = this._broker;
      session.notify("event/alt-key-down");
    }
  },
};

/**
 * @fn main
 * @brief Module entry point.
 * @param {Process} process The Process object.
 */
function main(process) 
{
  process.subscribe(
    "event/new-window-detected",
    function onNewWindow(window) 
    {
      new Launcher(process)
        .initializeWithWindow(window);
    });
}


