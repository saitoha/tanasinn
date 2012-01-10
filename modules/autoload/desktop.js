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
 * @class Desktop
 */
let Desktop = new Class().extends(Component).mix(EventBroker);
Desktop.definition = {

  get id()
    "desktop",

  get window()
    this._window,

  initializeWithWindow: 
  function initializeWithWindow(window)
  {
    this._window = window;
    this.getDesktopFromWindow.enabled = true;
    let broker = this._broker;
    broker.notify(<>initialized/{this.id}</>, this);
  },
  
  "[subscribe('get/desktop-from-window')]":
  function getDesktopFromWindow(window)
  {
    return window === this._window ? this: null;
  },

  /** Creates a session object and starts it. 
   */
  start: function start(parent, command, term, size, search_path, callback) 
  {
    let broker = this._broker;
    let box = broker.start(parent, command, term, size, search_path, callback, this); 

    // create session object;
    broker.notify("event/process-started", this);
    let request = { 
      parent: box, 
      command: broker.command, 
      term: broker.term, 
      width: broker.width,
      height: broker.height,
    };
    let session = this.uniget("event/session-requested", request);
    if (callback) {
      let id = session.subscribe(
        "event/session-stopping", 
        function onSessionStoping() {
          session.unsubscribe(id);
          if (callback) {
            let shadow_copy = callback;
            callback = null;
            shadow_copy();
          }
        });
    }
    return box;

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
    "event/new-window-detected",
    function onNewWindow(window) 
    {
      new Desktop(process)
        .initializeWithWindow(window);
    });
}

