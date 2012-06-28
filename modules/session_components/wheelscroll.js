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
 *
 * @class WheelScroll
 *
 *
 */
var WheelScroll = new Class().extends(Plugin);
WheelScroll.definition = {

  get id()
    "wheel_scroll",

  get info()
    <plugin>
        <name>{_("Wheel Scroll")}</name>
        <description>{
          _("Handle Wheel/Touch scroll event.")
        }</description>
        <version>0.1</version>
    </plugin>,

  "[persistable] enabled_when_startup": true,

  /** Installs itself. */
  "[install]":
  function install(broker) 
  {
  },

  /** Uninstalls itself. */
  "[uninstall]":
  function uninstall(broker) 
  {
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
  "[listen('DOMMouseScroll', '#tanasinn_content'), pnp]": 
  function onmousescroll(event) 
  {
    var count;

    if(event.axis === event.VERTICAL_AXIS) {

      count = event.detail;

      if (event.hasPixels) {
        let line_height = renderer.line_height;
        count = Math.round(count / line_height + 0.5);
      } else {
        count = Math.round(count / 2);
      }

      if (0 == count) {
        return;
      }

      if (this._in_scroll_session) {
        if (count > 0) {
          this.sendMessage("command/scroll-down-view", count);
          this.sendMessage("command/draw");
        } else if (count < 0) {
          this.sendMessage("command/scroll-up-view", -count);
          this.sendMessage("command/draw");
        } else { // count == 1
          return;
        }
      }
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
