/* -*- Mode: JAVASCRIPT; tab-width: 2; indent-tabs-mode: nil; c-basic-offset: 2 -*-
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
 * Portions created by the Initial Developer are Copyright (C) 2010 - 2013
 * the Initial Developer. All Rights Reserved.
 *
 * ***** END LICENSE BLOCK ***** */

"use strict";

/**
 *
 * @class WheelScroll
 *
 *
 */
var WheelScroll = new Class().extends(Plugin)
                             .depends("renderer");
WheelScroll.definition = {

  id: "wheel_scroll",

  /** plugin information */
  getInfo: function getInfo()
  {
    return {
      name: _("Wheel Scroll"),
      version: "0.1",
      description: _("Handle Wheel/Touch scroll event.")
    };
  },

  "[persistable] enabled_when_startup": true,
 
  _in_scroll_session: false,
  _renderer: null,
  _counter: 0,

  /** Installs itself.
   *  @param {InstallContext} context A InstallContext object.
   */
  "[install]":
  function install(context)
  {
    this._renderer = context["renderer"];
  },

  /** Uninstalls itself.
   */
  "[uninstall]":
  function uninstall()
  {
    this._renderer = null;
  },

  /** Fired when scroll session is started. */
  "[subscribe('event/scroll-session-started'), pnp]":
  function onScrollSessionStarted()
  {
    this._in_scroll_session = true;
  },

  /** Fired when scroll session is closed. */
  "[subscribe('event/scroll-session-closed'), pnp]":
  function onScrolSessionClosed()
  {
    this._in_scroll_session = false;
  },


  /** Fired at the mouse tracking mode is changed. */
  "[subscribe('event/mouse-tracking-mode-changed'), pnp]":
  function onMouseTrackingModeChanged(data)
  {
  },

  /** Fired at the mouse tracking type is changed. */
  "[subscribe('event/mouse-tracking-type-changed'), pnp]":
  function onMouseTrackingTypeChanged(data)
  {
  },

  /** Fired at the locator reporting mode is changed. */
  "[subscribe('command/change-locator-reporting-mode'), enabled]":
  function onChangeLocatorReportingMode(mode)
  {
  },

  /** Mouse down evnet listener */
  "[listen('MozMousePixelScroll', '#tanasinn_content'), pnp]":
  function onmousescroll(event)
  {
    var count,
        detail,
        line_height;

    if(event.axis === event.VERTICAL_AXIS) {

      event.preventDefault();

      detail = event.detail;
      this._counter += detail;
      line_height = this._renderer.line_height;
      count = (this._counter / line_height + 0.5) | 0;

      if (0 === count) {
        return;
      }

      this._counter = 0;

      //if (this._in_scroll_session) {
      if (count > 0) {
        this.sendMessage("command/scroll-down-view", count);
      } else {
        this.sendMessage("command/scroll-up-view", -count);
      }
      this.sendMessage("command/draw");
      //}
    }
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

}; // class WheelScroll

/**
 * @fn main
 * @brief Module entry point.
 * @param {Broker} broker The Broker object.
 */
function main(broker)
{
  new WheelScroll(broker);
}

// EOF
