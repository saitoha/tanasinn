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
      type: "MozMagnifyGesture",
      context: this,
      handler: this.onMagnifyGesture,
      capture: true,
      id: this.id,
    });

    session.notify("command/add-domlistener", {
      target: session.window,
      type: "MozSwipeGesture",
      context: this,
      handler: this.onSwipeGesture,
      capture: true,
      id: this.id,
    });

    session.notify("command/add-domlistener", {
      target: session.window,
      type: "MozRotateGesture",
      context: this,
      handler: this.onRotateGesture,
      capture: true,
      id: this.id,
    });

  }, // onSessionStarted

  "[subscribe('@event/broker-stopping'), enabled]": 
  function onSessionStopping(broker) 
  {
    broker.notify("command/remove-domlistener", this.id);
  },

  onRotateGesture: function onSwipeGesture(event) 
  {
    let original_target = event.explicitOriginalTarget;
    let broker = this._broker;
    let relation = broker.root_element.compareDocumentPosition(original_target);
    if ((relation & original_target.DOCUMENT_POSITION_CONTAINED_BY)) {
      event.preventDefault();
      event.stopPropagation();
      broker.notify("event/rotate-gesture", event.direction);
      event.direction = 0;
    }
  },

  onSwipeGesture: function onSwipeGesture(event) 
  {
    event.preventDefault();
    event.stopPropagation();
    let original_target = event.explicitOriginalTarget;
    let broker = this._broker;
    let relation = broker.root_element.compareDocumentPosition(original_target);
    if ((relation & original_target.DOCUMENT_POSITION_CONTAINED_BY)) {
      broker.notify("event/swipe-gesture", event.direction);
    }
    event.direction = 0;
  },

  onMagnifyGesture: function onMagnifyGesture(event) 
  {
    let original_target = event.explicitOriginalTarget;
    let broker = this._broker;
    let relation = broker.root_element.compareDocumentPosition(original_target);
    if ((relation & original_target.DOCUMENT_POSITION_CONTAINED_BY)) {
      broker.notify("event/magnify-gesture", event.delta);
      event.preventDefault();
      event.stopPropagation();
      event.direction = 0;
    }
  },
  
  /** Handles window resize event. */
  onresize: function onresize(event) 
  {
    let broker = this._broker;
    broker.notify("event/window-resized", event);
  },

  /** Handles window close event. */
  onclose: function onclose(event) 
  {
    let broker = this._broker;
    broker.notify("event/window-closing", event);
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



