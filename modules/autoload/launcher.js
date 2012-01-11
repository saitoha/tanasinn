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
    let window = desktop.window;
    let broker = this._broker;
    let document = window.document;
    //let parent = window
    //  .document.documentElement
    //  .appendChild(document.createElement("box"));
    let parent = desktop.uniget("command/construct-chrome", {
      parentNode: document.documentElement,
      tagName: "box",
      id: "coterimnal_launcher",
    })["#root"];

    let outer = window
      .document.documentElement
      .appendChild(document.createElement("box"));
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
      font-size: 80px;
      padding: 0px;
      width: 80%;
      margin-left: 10%;
    </>;

    this._desktop = parent;
    this._element = outer;
    this._textbox = textbox;

    textbox.addEventListener(
      "blur", let (self = this)
      function onblur(event) 
      {
        self.hide();
      }, false);

    textbox.addEventListener(
      "keypress", let (self = this) function () 
      {
        self.onkeypress.apply(self, arguments);
      }, false);

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
  },

  onDoubleCtrl: function onDoubleCtrl() 
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
        this._desktop,
        this._textbox.value.replace(/^\s+|\s+$/, ""),  // command
        null,  // TERM environment
        null,  // size 
        ["modules/core", 
         "modules/standard", 
         "modules/plugin"]);
      terminal.style.left = <>{this.left = (this.left + Math.random() * 40 - 20) % 40 + 10}%</>;
      terminal.style.top = <>{this.top = (this.top + Math.random() * 40 - 20) % 40 + 10}%</>;
    }, 0, this);
  },

  onkeypress: function onkeypress(event) 
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
    if (16 == event.keyCode && 16 == event.which 
        && !event.ctrlKey && !event.altKey 
        && !event.shiftKey && !event.isChar) {
      let broker = this._broker;
      let now = parseInt(new Date().getTime());
      let diff = now - this._last_ctrlkey_time;
      if (30 < diff && diff < 400) {
        //session.notify("command/focus");
        //session.notify("introducer-pressed/double-shift");
        //session.notify("command/report-overlay-message", "shift + shift pressed");
        this._last_ctrlkey_time = 0;
      } else {
        this._last_ctrlkey_time = now;
      }
      //session.notify("event/shift-key-up");
    } else if (17 == event.keyCode && 17 == event.which 
        /*&& !event.ctrlKey*/ && !event.altKey 
        && !event.shiftKey && !event.isChar) {
      let now = parseInt(new Date().getTime());
      let diff = now - this._last_ctrlkey_time;
      if (30 < diff && diff < 400) {
        this.onDoubleCtrl();
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
 * @brief Module entry point
 * @param {Process} process The Process object.
 */
function main(process) 
{
  process.subscribe(
    "initialized/desktop",
    function(desktop) 
    {
      new Launcher(desktop);
    });
}


