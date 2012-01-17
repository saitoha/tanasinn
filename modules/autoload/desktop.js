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
 * @class Desktop
 */
let Desktop = new Class().extends(Component).mix(EventBroker);
Desktop.definition = {

  get id()
    "desktop",

  get window()
    this._window,

  get root_element()
    this._root_element,

  initializeWithWindow: 
  function initializeWithWindow(window)
  {
    this._window = window;
    this.install();
  },

  install: function install()
  {
    this.onShutdown.enabled = true;
    this.getDesktopFromWindow.enabled = true;
    let document = this._window.document;
    this._root_element = document
      .documentElement
      .appendChild(document.createElement("box"));
    this._root_element.id = "tanasinn_desktop";

    let broker = this._broker;
    broker.notify(<>initialized/broker</>, this);

    this.notify("event/desktop-started", this);
  },

  uninstall: function uninstall()
  {
    this.onShutdown.enabled = false;
    this.getDesktopFromWindow.enabled = false;
    this.clear();
    this._root_element.parentNode.removeChild(this._root_element);
  },
  
  "[subscribe('event/enabled'), enabled]":
  function onEnabled()
  {
    this.notify("event/enabled");
  },

  "[subscribe('event/disabled'), enabled]":
  function onDisabled()
  {
    this.notify("event/disabled");
  },

  "[subscribe('event/shutdown')]":
  function onShutdown()
  {
    this.notify("event/shutdown");
    this.uninstall();
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
    box.style.cssText = "position: fixed; top: 0px; left: 0px";
    // create session object;
    let request = { 
      parent: box, 
      command: broker.command, 
      term: broker.term, 
      width: broker.width,
      height: broker.height,
    };
    let session = this.uniget("event/session-requested", request);
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

