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
 *  @class MouseGesture
 */
let MouseGesture = new Class().extends(Plugin);
MouseGesture.definition = {

  get id()
    "mouse_gesture",

  get info()
    <plugin>
        <name>{_("Mouse Gesture")}</name>
        <description>{
          _("Handle mouse gesture event and send corresponding virtual key event.")
        }</description>
        <version>0.1</version>
    </plugin>,

  "[persistable] enabled_when_startup": true,
  "[persistable] magnify_delta_per_fontsize": 100,

  /** Installs itself. */
  "[subscribe('install/mouse_gesture'), enabled]":
  function install(broker) 
  {
    /** Start to listen gesture event. */
    this.onMagnifyGesture.enabled = true;
    this.onSwipeGesture.enabled = true;
    this.onRotateGesture.enabled = true;
  },

  /** Uninstalls itself. */
  "[subscribe('uninstall/mouse_gesture'), enabled]":
  function uninstall(broker) 
  {
    // unregister gesture event DOM listeners.
    this.onMagnifyGesture.enabled = false;
    this.onSwipeGesture.enabled = false;
    this.onRotateGesture.enabled = false;
  },

  /** Swipe down evnet listener */
  "[subscribe('event/swipe-gesture')]": 
  function onSwipeGesture(direction) 
  {
    let broker = this._broker

    switch (direction) {

      case coUtils.Constant.DIRECTION_LEFT:
        broker.notify("command/input-expression-with-remapping", "<SwipeLeft>");
        break;

      case coUtils.Constant.DIRECTION_RIGHT:
        broker.notify("command/input-expression-with-remapping", "<SwipeRight>");
        break;

      case coUtils.Constant.DIRECTION_UP:
        broker.notify("command/input-expression-with-remapping", "<SwipeUp>");
        break;

      case coUtils.Constant.DIRECTION_DOWN:
        broker.notify("command/input-expression-with-remapping", "<SwipeDown>");
        break;

      default:
        coUtils.Debug.reportError(
          _("Unknown direction id was specified: %s."), direction);

    }
  },

   /** Swipe down evnet listener */
  "[subscribe('event/rotate-gesture')]": 
  function onRotateGesture(direction) 
  {
    let broker = this._broker

    switch (direction) {

      case coUtils.Constant.ROTATION_CLOCKWISE:
        broker.notify("command/input-expression-with-remapping", "<RotateRight>");
        break;

      case coUtils.Constant.ROTATION_COUNTERCLOCKWISE:
        broker.notify("command/input-expression-with-remapping", "<RotateLeft>");
        break;

      default:
        coUtils.Debug.reportError(
          _("Unknown direction id was specified: %s."), direction);

    }
  },
 
  /** handles magnify-gesture evnet. */
  "[subscribe('event/magnify-gesture')]": 
  function onMagnifyGesture(delta) 
  {
    let broker = this._broker
    let i;
    let magnify_delta = this.magnify_delta_per_fontsize;
    if (delta > 0) {
      let count = Math.ceil(delta / magnify_delta);
      for (i = 0; i < count; ++i) {
        broker.notify("command/input-expression-with-remapping", "<PinchOpen>");
      }
    } else if (delta < 0) {
      let count = Math.floor(- delta / magnify_delta);
      for (i = 0; i < count; ++i) {
        broker.notify("command/input-expression-with-remapping", "<PinchClose>");
      }
    }
    broker.notify("command/draw");
  },

}; // class MouseGesture

/**
 * @fn main
 * @brief Module entry point.
 * @param {Broker} broker The Broker object.
 */
function main(broker) 
{
  new MouseGesture(broker);
}

