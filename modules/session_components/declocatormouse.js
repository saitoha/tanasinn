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
 * Portions created by the Initial Developer are Copyright (C) 2010 - 2013
 * the Initial Developer. All Rights Reserved.
 *
 * ***** END LICENSE BLOCK ***** */

"use strict";


/**
 * @class DECLocatorMouse
 *
 */
var DECLocatorMouse = new Class().extends(Plugin)
                                 .depends("renderer");
DECLocatorMouse.definition = {

  id: "dec_locator_mouse",

  /** plugin information */
  getInfo: function getInfo()
  {
    return {
      name: _("DEC Locator Mouse"),
      version: "0.1",
      description: _("Send DEC Locator mouse input events to TTY device.")
    };
  },

  "[persistable] enabled_when_startup": true,

  _locator_reporting_mode: null,
  _locator_buttonup_reporting: true,
  _locator_buttondown_reporting: true,
  _locator_state: 0,
  _locator_event: null,
  _in_scroll_session: false,
  _renderer: null,

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

    // unregister mouse event DOM listeners.
    this._locator_event = null;
    this.onmousescroll.enabled = false;
  },

  "[subscribe('command/query-da1-capability'), pnp]":
  function onQueryDA1Capability(mode)
  {
    return 29; // ANSI Text locator
  },

  "[subscribe('command/backup'), pnp]":
  function backup(context)
  {
    context.decmouse = {
      locator_reporting_mode: this._locator_reporting_mode,
    };
  },

  "[subscribe('command/restore'), pnp]":
  function restore(context)
  {
    if (context.decmouse) {
      var {locator_reporting_mode} = context.decmouse;
      this._locator_reporting_mode = locator_reporting_mode;
    }
  },

  /** Fired at scroll session is started. */
  "[subscribe('event/scroll-session-started'), enabled]":
  function onScrollSessionStarted()
  {
    this._in_scroll_session = true;
  },

  /**
   *
   * Enable Locator Reporting (DECELR)
   *
   * CSI Ps ; Pu ' z
   *
   * Valid values for the first parameter:
   * Ps = 0 → Locator disabled (default)
   * Ps = 1 → Locator enabled
   * Ps = 2 → Locator enabled for one report, then disabled
   *
   * The second parameter specifies the coordinate unit for locator reports.
   *
   * Valid values for the second parameter:
   * Pu = 0 or omitted → default to character cells
   * Pu = 1 → device physical pixels
   * Pu = 2 → character cells
   *
   */
  "[profile('vt100'), sequence('CSI Ps;Pu \\' z')]":
  function DECELR(n1, n2)
  { // Enable Locator Reporting

    var oneshot, pixel;

    switch (n1 || 0) {

      case 0:
        // Locator disabled (default)
        this.sendMessage(
          "command/change-locator-reporting-mode",
          null);
        return;

      case 1:
        // Locator enabled
        oneshot = false;
        break;

      case 2:
        // Locator enabled
        oneshot = true;
        break;

      default:
        throw coUtils.Debug.Error(
          _("Invalid locator mode was specified: %d."), n1);

    }

    switch (n2 || 0) {

      case 0:
      case 2:
        // character cells
        pixel = false;
        break;

      case 1:
        // device physical pixels
        pixel = true;
        break;

      default:
        throw coUtils.Debug.Error(
          _("Invalid locator unit was specified: %d."), n1);

    }

    this.sendMessage(
      "command/change-locator-reporting-mode", {
        oneshot: oneshot,
        pixel: pixel,
      });

  },

  /**
   * Select the locator event.
   *
   * Pm = 0      Disables button up/down events, Disables filter rectangle.
   *    = 1      Enables button down event.
   *    = 2      Disables button down event.
   *    = 3      Enables button up event.
   *    = 4      Disables button up event.
   */
  "[profile('vt100'), sequence('CSI Pm \\' {')]":
  function DECSLE(n)
  { // TODO: Select Locator Events

    switch (n) {

      case 0:
        this.sendMessage("command/change-decterm-buttonup-event-mode", false);
        this.sendMessage("command/change-decterm-buttondown-event-mode", false);
        break;

      case 1:
        this.sendMessage("command/change-decterm-buttondown-event-mode", true);
        break;

      case 2:
        this.sendMessage("command/change-decterm-buttondown-event-mode", false);
        break;

      case 3:
        this.sendMessage("command/change-decterm-buttonup-event-mode", true);
        break;

      case 3:
        this.sendMessage("command/change-decterm-buttonup-event-mode", false);
        break;

      default:
        throw coUtils.Debug.Error(
          _("Invalid locator event mode was specified: %d."), n);
    }
  },

  /**
   * Requests Locator Report.
   *
   * Response: CSI Pe ; Pb ; Pr ; Pc ; Pp & w
   * Pe: Event code.
   * Pe =  0    Received a locator report request (DECRQLP), but the locator is unavailable.
   *    =  1    Received a locator report request (DECRQLP).
   *    =  2    Left button down.
   *    =  3    Left button up.
   *    =  4    Middle button down.
   *    =  5    Middle button up.
   *    =  6    Right button down.
   *    =  7    Right button up.
   *    =  8    Button 4 down. (not supported)
   *    =  9    Button 4 up. (not supported)
   *    = 10    Locator outside filter rectangle.
   *
   * Pb: Button code, ASCII decimal 0-15 indicating which buttons are down if any.
   *     The state of the four buttons on the locator correspond to the low four
   *     bits of the decimal value, "1" means button depressed.
   *   1    Right button.
   *   2    Middle button.
   *   4    Left button.
   *   8    Button 4. (not supported)
   *
   * Pr: Row coordinate.
   *
   * Pc: Column coordinate.
   *
   * Pp: Page. Always 1.
   *
   */
  "[profile('vt100'), sequence('CSI Pe;Pb;Pr;Pc;Pp & w')]":
  function DECRQLP(n)
  { // Request Locator Position
    this.sendMessage("event/locator-reporting-requested");
  },


  /** Fired at scroll session is closed. */
  "[subscribe('event/scroll-session-closed'), enabled]":
  function onScrolSessionClosed()
  {
    this._in_scroll_session = false;
  },

  /** Fired at the mouse tracking mode is changed. */
  "[subscribe('event/mouse-tracking-mode-changed'), pnp]":
  function onMouseTrackingModeChanged(data)
  {
    this._locator_reporting_mode = null;
    this.onmousescroll.enabled = false;
  },

  /** Fired at the locator reporting mode is changed. */
  "[subscribe('command/change-locator-reporting-mode'), enabled]":
  function onChangeLocatorReportingMode(mode)
  {
    this._locator_reporting_mode = mode;
    if (mode) {
      this.onmousescroll.enabled = true;
    } else {
      this.onmousescroll.enabled = false;
    }
  },

  /** Fired at the locator reporting mode(button up) is changed. */
  "[subscribe('command/change-decterm-buttonup-event-mode'), enabled]":
  function onChangeLocatorReportingButtonUpMode(mode)
  {
    this._locator_buttonup_reporting = mode;
  },

  /** Fired at the locator reporting mode(button down) is changed. */
  "[subscribe('command/change-decterm-buttondown-event-mode'), enabled]":
  function onChangeLocatorReportingButtonDownMode(mode)
  {
    this._locator_buttondown_reporting = mode;
  },

  /** Fired at the mouse tracking type is changed. */
  "[subscribe('event/mouse-tracking-type-changed'), pnp]":
  function onMouseTrackingTypeChanged(data)
  {
    this._locator_reporting_mode = null;
  },

  "[subscribe('event/locator-reporting-requested'), enabled]":
  function reportDECTermStyleLocatorInfo()
  {
    var code,
        event = this._locator_event,
        locator_reporting_mode = this._locator_reporting_mode,
        message,
        column,
        row;

    if (null === locator_reporting_mode) {
      return;
    }

    if (null === event) {
      code = 0;
    } else {
      code = 1;
    }

    if (locator_reporting_mode.pixel) {
      [column, row] = this._getCurrentPositionInPixel(event);
    } else {
      [column, row] = this._getCurrentPosition(event);
    }

    message = coUtils.Text.format(
      "%d;%d;%d;%d;1&w",
      code, this._locator_state, row, column);

    this.sendMessage("command/send-sequence/csi", message);

  },

  /** Mouse down evnet listener */
  "[listen('DOMMouseScroll', '#tanasinn_content')]":
  function onmousescroll(event)
  {
    var renderer = this._renderer,
        count,
        line_height,
        locator_reporting_mode,
        sequences;

    if (event.axis === event.VERTICAL_AXIS) {

      count = event.detail;
      if (event.hasPixels) {
        line_height = renderer.line_height;
        count = Math.round(count / line_height + 0.5);
      } else {
        count = Math.round(count / 2);
      }
      if (0 === count) {
        return;
      }

      locator_reporting_mode = this._locator_reporting_mode;

      if (this._in_scroll_session
          || null === locator_reporting_mode) {
        if (count > 0) {
          this.sendMessage("command/scroll-down-view", count);
          this.sendMessage("command/draw");
        } else if (count < 0) {
          this.sendMessage("command/scroll-up-view", -count);
          this.sendMessage("command/draw");
        } else { // count === 1
          return;
        }

      } else {

        sequences = [];
        if (count > 0) {
          while (count--)
            sequences.push("\x1bOB")
        } else if (count < 0) {
          while (count++)
            sequences.push("\x1bOA")
        } else {
          return;
        }
        this.sendMessage("command/send-to-tty", sequences.join(""));

      }
    }
  },

  /** Mouse down evnet listener */
  "[listen('mousedown', '#tanasinn_content'), pnp]":
  function onmousedown(event)
  {
    var column,
        row,
        message,
        locator_reporting_mode,
        code;

    if (null === this._locator_reporting_mode) {
      return;
    }

    locator_reporting_mode = this._locator_reporting_mode;

    if (null === locator_reporting_mode) {
      return;
    }


    switch (event.button) {

      case 0:
        code = 2;
        this._locator_state |= 4;
        break;

      case 1:
        code = 4;
        this._locator_state |= 2;
        break;

      case 2:
        code = 6;
        this._locator_state |= 1;
        break;

      case 3:
        code = 8;
        this._locator_state |= 8;
        break;

      default:
        throw coUtils.Debug.Error(
          _("Unhandled mousedown event, button: %d."),
          event.button);

    }

    if (locator_reporting_mode.oneshot) {
      this._locator_reporting_mode = null;
    }
    if (locator_reporting_mode.pixel) {
      [column, row] = this._getCurrentPositionInPixel(event);
    } else {
      [column, row] = this._getCurrentPosition(event);
    }

    message = coUtils.Text.format(
      "%d;%d;%d;%d;1&w",
      code, this._locator_state, row, column);

    this.sendMessage("command/send-sequence/csi", message);
  },

  /** Mouse move evnet listener */
  "[listen('mousemove', '#tanasinn_content'), pnp]":
  function onmousemove(event)
  {
    this._locator_event = event;
  },

  /** Mouse up evnet listener */
  "[listen('mouseup', '#tanasinn_content'), pnp]":
  function onmouseup(event)
  {
    var column,
        row,
        message,
        code;

    if (null === this._locator_reporting_mode) {
      return;
    }

    switch (event.button) {

      case 0:
        code = 3;
        this._locator_state ^= 4;
        break;

      case 1:
        code = 5;
        this._locator_state ^= 2;
        break;

      case 2:
        code = 7;
        this._locator_state ^= 1;
        break;

      case 3:
        code = 9;
        this._locator_state ^= 8;
        break;

      default:
        throw coUtils.Debug.Error(
          _("Unhandled mouseup event, button: %d."),
          event.button);
    }

    if (locator_reporting_mode.oneshot) {
      this._locator_reporting_mode = null;
    }

    if (locator_reporting_mode.pixel) {
      [column, row] = this._getCurrentPositionInPixel(event);
    } else {
      [column, row] = this._getCurrentPosition(event);
    }

    message = coUtils.Text.format(
      "%d;%d;%d;%d;1&w",
      code, this._locator_state, row, column);

    this.sendMessage("command/send-sequence/csi", message);

  },

  // Helper: get current position from mouse event object.
  _getCurrentPosition: function _getCurrentPosition(event)
  {
    var root_element = this.request("get/root-element"),
        target_element = this.request(
          "command/query-selector",
          "#tanasinn_center_area"),
        box = target_element.boxObject,
        offsetX = box.screenX - root_element.boxObject.screenX,
        offsetY = box.screenY - root_element.boxObject.screenY,
        left = event.layerX - offsetX, // left position in pixel.
        top = event.layerY - offsetY,  // top position in pixel.

        // converts pixel coordinate to [column, row] style.
        renderer = this._renderer,

        column = Math.round(left / renderer.char_width),
        row = Math.round(top / renderer.line_height);

    return [column, row];
  },

  // Helper: get current position from mouse event object in pixel.
  _getCurrentPositionInPixel: function _getCurrentPositionInPixel(event)
  {
    var root_element = this.request("get/root-element"),
        target_element = this.request(
          "command/query-selector",
          "#tanasinn_center_area"),
        box = target_element.boxObject,
        offsetX = box.screenX - root_element.boxObject.screenX,
        offsetY = box.screenY - root_element.boxObject.screenY,
        left = event.layerX - offsetX, // left position in pixel.
        top = event.layerY - offsetY;  // top position in pixel.

    return [left, top];
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


};

/**
 * @fn main
 * @brief Module entry point.
 * @param {Broker} broker The Broker object.
 */
function main(broker)
{
  new DECLocatorMouse(broker);
}

// EOF
