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
      target: session.window,
      type: "MozMagnifyGesture",
      context: this,
      handler: this.onmagnifyGesture,
      capture: true,
      id: this.id,
    });

  },

  "[subscribe('@event/broker-stopping'), enabled]": 
  function onSessionStopping(session) 
  {
    session.notify("command/remove-domlistener", this.id);
  },

  onmagnifyGesture: function onmagnifyGesture(event) 
  {
    let original_target = event.explicitOriginalTarget;
    let session = this._broker;
    let relation = session.root_element.compareDocumentPosition(original_target);
    if ((relation & original_target.DOCUMENT_POSITION_CONTAINED_BY)) {
      session.notify("event/magnify-gesture", event.delta);
    }
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



