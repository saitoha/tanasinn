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
var WindowWatcher = new Class().extends(Component);
WindowWatcher.definition = {

  get id()
    "windowwatcher",

  "[subscribe('@event/broker-started'), enabled]": 
  function onSessionStarted(broker) 
  {
    this.sendMessage("command/add-domlistener", {
      target: broker.window,
      type: "resize",
      context: this,
      handler: this.onresize,
      id: this.id,
    });

    this.sendMessage("command/add-domlistener", {
      target: broker.window,
      type: "close",
      context: this,
      handler: this.onclose,
      id: this.id,
    });

    this.sendMessage("command/add-domlistener", {
      target: broker.window,
      type: "MozMagnifyGesture",
      context: this,
      handler: this.onMagnifyGesture,
      capture: true,
      id: this.id,
    });

    this.sendMessage("command/add-domlistener", {
      target: broker.window,
      type: "MozSwipeGesture",
      context: this,
      handler: this.onSwipeGesture,
      capture: true,
      id: this.id,
    });

    this.sendMessage("command/add-domlistener", {
      target: broker.window,
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
    this.sendMessage("command/remove-domlistener", this.id);
  },

  onRotateGesture: function onSwipeGesture(event) 
  {
    var origninal_target, relation;

    original_target = event.explicitOriginalTarget;
    relation = broker.root_element.compareDocumentPosition(original_target);
    if ((relation & original_target.DOCUMENT_POSITION_CONTAINED_BY)) {
      event.preventDefault();
      event.stopPropagation();
      this.sendMessage("event/rotate-gesture", event.direction);
      event.direction = 0;
    }
  },

  onSwipeGesture: function onSwipeGesture(event) 
  {
    var origninal_target, relation;

    event.preventDefault();
    event.stopPropagation();
    original_target = event.explicitOriginalTarget;
    relation = broker.root_element.compareDocumentPosition(original_target);
    if ((relation & original_target.DOCUMENT_POSITION_CONTAINED_BY)) {
      this.sendMessage("event/swipe-gesture", event.direction);
    }
    event.direction = 0;
  },

  onMagnifyGesture: function onMagnifyGesture(event) 
  {
    var origninal_target, relation;

    original_target = event.explicitOriginalTarget;
    relation = broker.root_element.compareDocumentPosition(original_target);
    if ((relation & original_target.DOCUMENT_POSITION_CONTAINED_BY)) {
      this.sendMessage("event/magnify-gesture", event.delta);
      event.preventDefault();
      event.stopPropagation();
      event.direction = 0;
    }
  },
  
  /** Handles window resize event. */
  onresize: function onresize(event) 
  {
    this.sendMessage("event/window-resized", event);
  },

  /** Handles window close event. */
  onclose: function onclose(event) 
  {
    this.sendMessage("event/window-closing", event);
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



