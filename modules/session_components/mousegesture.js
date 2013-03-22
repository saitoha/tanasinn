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

"use strict";

/**
 *  @class MouseGesture
 */
var MouseGesture = new Class().extends(Plugin);
MouseGesture.definition = {

  id: "mouse_gesture",

  /** plugin information */
  getInfo: function getInfo()
  {
    return {
      name: _("Mouse Gesture"),
      version: "0.1",
      description: _("Handle mouse gesture event and send corresponding virtual key event.")
    };
  },

  "[persistable] enabled_when_startup": true,
  "[persistable] magnify_delta_per_fontsize": 100,

  /** Installs itself.
   *  @param {InstallContext} context A InstallContext object.
   */
  "[install]":
  function install(context)
  {
  },

  /** Uninstalls itself.
   */
  "[uninstall]":
  function uninstall()
  {
  },

  /** Swipe down evnet listener */
  "[subscribe('event/swipe-gesture'), pnp]":
  function onSwipeGesture(direction)
  {
    switch (direction) {

      case coUtils.Constant.DIRECTION_LEFT:
        this.sendMessage("command/input-expression-with-remapping", "<SwipeLeft>");
        break;

      case coUtils.Constant.DIRECTION_RIGHT:
        this.sendMessage("command/input-expression-with-remapping", "<SwipeRight>");
        break;

      case coUtils.Constant.DIRECTION_UP:
        this.sendMessage("command/input-expression-with-remapping", "<SwipeUp>");
        break;

      case coUtils.Constant.DIRECTION_DOWN:
        this.sendMessage("command/input-expression-with-remapping", "<SwipeDown>");
        break;

      default:
        coUtils.Debug.reportError(
          _("Unknown direction id was specified: %s."), direction);

    }
  },

   /** Swipe down evnet listener */
  "[subscribe('event/rotate-gesture'), pnp]":
  function onRotateGesture(direction)
  {
    switch (direction) {

      case coUtils.Constant.ROTATION_CLOCKWISE:
        this.sendMessage("command/input-expression-with-remapping", "<RotateRight>");
        break;

      case coUtils.Constant.ROTATION_COUNTERCLOCKWISE:
        this.sendMessage("command/input-expression-with-remapping", "<RotateLeft>");
        break;

      default:
        coUtils.Debug.reportError(
          _("Unknown direction id was specified: %s."), direction);

    }
  },

  /** handles magnify-gesture evnet. */
  "[subscribe('event/magnify-gesture'), pnp]":
  function onMagnifyGesture(delta)
  {
    var i = 0,
        count,
        magnify_delta = this.magnify_delta_per_fontsize;

    if (delta > 0) {
      count = Math.ceil(delta / magnify_delta);
      for (; i < count; ++i) {
        this.sendMessage("command/input-expression-with-remapping", "<PinchOpen>");
      }
    } else if (delta < 0) {
      count = Math.floor(- delta / magnify_delta);
      for (; i < count; ++i) {
        this.sendMessage("command/input-expression-with-remapping", "<PinchClose>");
      }
    }
    this.sendMessage("command/draw");
  },

  /** test */
  "[test]":
  function()
  {
    var enabled = this.enabled;

    try {
      this.enabled = false;
      this.enabled = true;
      this.enabled = false;
    } finally {
      this.enabled = enabled;
    }
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

// EOF
