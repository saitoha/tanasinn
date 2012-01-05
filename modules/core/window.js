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

  "[subscribe('@event/session-started'), enabled]": 
  function onSessionStarted(session) 
  {
    session.notify("command/add-domlistener", {
      target: session.window,
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
      target: session.window,
      type: "keydown",
      context: this,
      handler: this.onkeydown,
      capture: true,
      id: this.id,
    });
  },

  onkeydown: function onkeydown(event) 
  { // nothrow
    if (17 == event.keyCode && 17 == event.which &&
        event.ctrlKey && !event.altKey && !event.shiftKey && !event.isChar) {
      let now = parseInt(new Date().getTime());
      if (now - this._last_ctrlkey_time < 500) {
        let session = this._broker;
        session.notify("command/focus");
        //session.notify("command/report-overlay-message");
        this._last_ctrlkey_time = 0;
      } else {
        this._last_ctrlkey_time = now;
      }
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
 * @param {Process} process The Process object.
 */
function main(process) 
{
  process.subscribe(
    "initialized/session", 
    function(session) new WindowWatcher(session));
}



