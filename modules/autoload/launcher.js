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
 * @class Launcher
 */
let Launcher = new Class().extends(Component);
Launcher.definition = {

  get id()
    "launcher",

  top: 20,
  left: 20,

  "[subscribe('event/desktop-started'), enabled]":
  function onLoad(desktop)
  {
    try {
    let window = desktop.window;
    let broker = this._broker;
    let document = window.document;
    let {
      tanasinn_window_layer,
      tanasinn_launcher_layer,
      tanasinn_launcher_textbox,
    } = desktop.uniget("command/construct-chrome", 
    [
      {
        parentNode: desktop.root_element,
        tagName: "box",
        id: "tanasinn_window_layer",
      },
      {
        parentNode: desktop.root_element,
        tagName: "box",
        id: "tanasinn_launcher_layer",
        hidden: true,
        style: <>
          position: fixed;
          left: 0px;
          top: 10%;
          width: 100%;
        </>,
        childNodes: {
          tagName: "textbox",
          id: "tanasinn_launcher_textbox",
          style: <>
            font-size: 80px;
            padding: 0px;
            width: 80%;
            margin-left: 10%;
          </>,
        },
      },
    ]);
    this.onkeypress.enabled = true;
    this.onblur.enabled = true;
    this._window_layer = tanasinn_window_layer;
    this._element = tanasinn_launcher_layer;
    this._textbox = tanasinn_launcher_textbox;

    window.addEventListener(
      "keyup", let (self = this) function() 
      {
        self.onkeyup.apply(self, arguments);
      }, /* capture */ true);

    window.addEventListener(
      "keydown", let (self = this) function() 
      {
        self.onkeydown.apply(self, arguments);
      }, /* capture */ true);

    broker.notify(<>initialized/{this.id}</>, this);
    } catch(e) {alert(e)}
  },

  "[subscribe('event/hotkey-double-ctrl'), enabled]":
  function onDoubleCtrl() 
  {
    let box = this._element;
    if (box.hidden) {
      this.show();
    } else {
      this.hide();
    }
  },

  show: function show()
  {
    let box = this._element;
    let textbox = this._textbox;
    box.hidden = false;
    textbox.focus();
    box.parentNode.appendChild(box);
    textbox.focus();
  },

  hide: function hide()
  {
    let box = this._element;
    let textbox = this._textbox;
    textbox.blur();
    box.hidden = true;
  },

  launch: function launch() 
  {
    let desktop = this._broker; 
    let document = this._element.ownerDocument;
    this.hide();
    coUtils.Timer.setTimeout(function() {
      let terminal =  desktop.start(
        this._window_layer,
        this._textbox.value.replace(/^\s+|\s+$/, ""),  // command
        null,  // TERM environment
        null,  // size 
        ["modules/core", 
         "modules/plugin"]);
      terminal.style.left = <>{this.left = (this.left + Math.random() * 40 - 20) % 40 + 10}%</>;
      terminal.style.top = <>{this.top = (this.top + Math.random() * 40 - 20) % 40 + 10}%</>;
    }, 0, this);
  },

  "[listen('blur', '#tanasinn_launcher_textbox')]":
  function onblur(event) 
  {
    this.hide();
  },

  "[listen('keypress', '#tanasinn_launcher_textbox')]":
  function onkeypress(event) 
  { // nothrow
    if (13 == event.keyCode && 13 == event.which 
        && !event.ctrlKey && !event.altKey 
        && !event.shiftKey && !event.isChar) {
      this.launch();
    }// else alert(event.keyCode + " " +event.which);
  },

  onkeyup: function onkeyup(event) 
  { // nothrow
    //alert([event.keyCode, event.keyCode, event.ctrlKey, event.shiftKey, event.altKey, event.isChar].join("/"))
    let broker = this._broker;
    let diff_min = 30;
    let diff_max = 400;
    if (16 == event.keyCode && 16 == event.which 
        && !event.ctrlKey && !event.altKey && !event.isChar) {
      let now = parseInt(new Date().getTime());
      let diff = now - this._last_shiftup_time;
      if (diff_min < diff && diff < diff_max) {
        broker.notify("introducer-pressed/double-shift");
        this._last_shiftup_time = 0;
      } else {
        this._last_shiftup_time = now;
      }
      broker.notify("event/shift-key-up");
    } else if (17 == event.keyCode && 17 == event.which 
        && !event.altKey && !event.shiftKey && !event.isChar) {
      let now = parseInt(new Date().getTime());
      let diff = now - this._last_ctrlup_time;
      if (diff_min < diff && diff < diff_max) {
        this._last_ctrlup_time = 0;
        broker.notify("event/hotkey-double-ctrl");
      } else {
        this._last_ctrlup_time = now;
      }
      broker.notify("event/ctrl-key-up");
    } else if (18 == event.keyCode && 18 == event.which 
        && !event.ctrlKey && !event.shiftKey && !event.isChar) {
      let now = parseInt(new Date().getTime());
      let diff = now - this._last_altup_time;
      if (diff_min < diff && diff < diff_max) {
        this._last_altup_time = 0;
      } else {
        this._last_altup_time = now;
      }
      broker.notify("event/alt-key-up");
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
 * @brief Module entry point
 * @param {Process} process The Process object.
 */
function main(process) 
{
  process.subscribe(
    "initialized/desktop",
    function(desktop) new Launcher(desktop));
}


