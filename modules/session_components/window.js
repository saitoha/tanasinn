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

/** @file Window
 *
 */

/**
 * @class WindowWatcher
 *
 */
let WindowWatcher = new Class().extends(Component);
WindowWatcher.definition = {

  get id()
    "windowwatcher",

  "[subscribe('@event/broker-started'), enabled]": 
  function onSessionStarted(session) 
  {
    session.notify("command/add-domlistener", {
      target: session.window.document,
      type: "resize",
      context: this,
      handler: this.onresize,
      id: this.id,
    });

    session.notify("command/add-domlistener", {
      target: session.window,
      type: "close",
      context: this,
      handler: this.onclose,
      id: this.id,
    });

    session.notify("command/add-domlistener", {
      target: session.window.document,
      type: "keyup",
      context: this,
      handler: this.onkeyup,
      capture: true,
      id: this.id,
    });

    session.notify("command/add-domlistener", {
      target: session.window.document,
      type: "keydown",
      context: this,
      handler: this.onkeydown,
      capture: true,
      id: this.id,
    });
  },

  onkeyup: function onkeyup(event) 
  { // nothrow
    if (16 == event.keyCode && 16 == event.which 
        && !event.ctrlKey && !event.altKey && !event.isChar) {
      let session = this._broker;
      session.notify("event/shift-key-up");
    } else if (17 == event.keyCode && 17 == event.which 
        && !event.altKey && !event.shiftKey && !event.isChar) {
    } else if (18 == event.keyCode && 18 == event.which 
        && !event.ctrlKey && !event.shiftKey && !event.isChar) {
      let session = this._broker;
      session.notify("event/alt-key-up");
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

  "[subscribe('@event/session-stopping'), enabled]": 
  function onSessionStopping(session) 
  {
    session.notify("command/remove-domlistener", this.id);
  },
  
  /** Handles window resize event. */
  onresize: function onresize(event) 
  {
    let session = this._broker;
    session.notify("event/window-resized", event);
  },

  /** Handles window close event. */
  onclose: function onclose(event) 
  {
    let session = this._broker;
    session.notify("event/window-closing", event);
  }

};

/**
 * @fn main
 * @brief Module entry point.
 * @param {Broker} broker The Broker object.
 */
function main(broker) 
{
  new WindowWatcher(broker);
}



