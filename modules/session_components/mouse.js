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

var MOUSE_BUTTON1    = 0,
    MOUSE_BUTTON3    = 1,
    MOUSE_BUTTON2    = 2,
    MOUSE_RELEASE    = 3,
    MOUSE_WHEEL_UP   = 64,
    MOUSE_WHEEL_DOWN = 65;

/**
 *  @class Mouse
 *  @brief Listen mouse input events and send them to TTY device.
 *
 *  Thanks to:
 *   - brodie's MouseTerm Project    https://github.com/brodie/mouseterm
 *   - Vivek Dasmohapatra            http://rtfm.etla.org/xterm/ctlseq.html
 */
var Mouse = new Class().extends(Plugin)
                       .depends("screen")
                       .depends("renderer");
Mouse.definition = {

  id: "mouse",

  /** plugin information */
  getInfo: function getInfo()
  {
    return {
      name: _("Mouse"),
      version: "0.1",
      description: _("Listen mouse input events and send them to TTY device.")
    };
  },

  "[persistable] enabled_when_startup": true,

  _tracking_mode: coUtils.Constant.TRACKING_NONE,
  _tracking_type: null,

  _pressed: false,
  _installed: false,
  _last_position: null,

  _in_scroll_session: false,
  _renderer: null,
  _screen: null,
  _cursor_mode: coUtils.Constant.CURSOR_MODE_APPLICATION,
  _application_wheel_mode: false,
  _alternate_wheel_mode: false,

  /** Installs itself.
   *  @param {InstallContext} context A InstallContext object.
   */
  "[install]":
  function install(context)
  {
    this._renderer = context["renderer"];
    this._screen = context["screen"];
  },

  /** Uninstalls itself.
   */
  "[uninstall]":
  function uninstall()
  {
    this._renderer = null;
    this._screen = null;
    this._cursor_mode = coUtils.Constant.CURSOR_MODE_APPLICATION;
    this._application_wheel_mode = false;
    this._alternate_wheel_mode = false;
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

  /** Fired when cursor mode is changed. */
  "[subscribe('command/change-cursor-mode'), pnp]":
  function onCursorModeChanged(value)
  {
    this._cursor_mode = value;
  },

  /** Fired when wheel mode is changed. */
  "[subscribe('command/change-application-wheel-mode'), pnp]":
  function onApplicationWheelModeChanged(value)
  {
    this._application_wheel_mode = value;
  },

  /** Fired when wheel mode is changed. */
  "[subscribe('command/change-alternate-wheel-mode'), pnp]":
  function onApplicationWheelModeChanged(value)
  {
    this._alternate_wheel_mode = value;
  },

  /** Fired at the mouse tracking type is changed. */
  "[subscribe('event/mouse-tracking-type-changed'), pnp]":
  function onMouseTrackingTypeChanged(data)
  {
    if (coUtils.Constant.TRACKING_NONE === data) {
//      this.onmousescroll.enabled = false;
      coUtils.Debug.reportMessage(
        _("Leaving mouse tracking type: [%s]."),
        this._tracking_type)
    } else {
//      this.onmousescroll.enabled = true;
      coUtils.Debug.reportMessage(
        _("Entering mouse tracking type: [%s]."),
        data)
    }

    this._last_position = null,
    this._tracking_type = data;
  },

  /** Fired at the mouse tracking mode is changed. */
  "[subscribe('event/mouse-tracking-mode-changed'), pnp]":
  function onMouseTrackingModeChanged(data)
  {
    if (coUtils.Constant.TRACKING_NONE === data) {
      coUtils.Debug.reportMessage(
        _("Leaving mouse tracking mode: [%s]."),
        this._tracking_mode)
    } else {
      coUtils.Debug.reportMessage(
        _("Entering mouse tracking mode: [%s]."),
        data)
    }

    this._last_position = null,
    this._tracking_mode = data;
  },

  /** Fired at the locator reporting mode is changed. */
  "[subscribe('command/change-locator-reporting-mode'), enabled]":
  function onChangeLocatorReportingMode(mode)
  {
    if (mode) {
      this.onmousescroll.enabled = false;
    } else {
      this.onmousescroll.enabled = true;
    }
  },

  "[subscribe('command/backup'), pnp]":
  function backup(context)
  {
    context.mouse = {
      tracking_mode: this._tracking_mode,
    };
  },

  "[subscribe('command/restore'), pnp]":
  function restore(context)
  {
    if (context.mouse) {
      this._tracking_mode = context.mouse.tracking_mode;
    }
  },

  _getUrxvtMouseReport: function _getUrxvtMouseReport(event, button, coordinate)
  {
    var code,
        message,
        column = coordinate[0],
        row = coordinate[1];

    if ("mouseup" === event.type) {
      button = 3;
    }
    code = button
         | event.shiftKey << 2
         | event.metaKey  << 3
         | event.ctrlKey  << 4
         ;

    code += 32; // add offset +32

    message = coUtils.Text.format(
      "%d;%d;%dM",
      code, column, row);

    return message;
  },

  _getSgrMouseReport: function _getSgrMouseReport(event, button, coordinate)
  {
    var code,
        action,
        message,
        column = coordinate[0],
        row = coordinate[1];

    code = button
       | event.shiftKey << 2
       | event.metaKey  << 3
       | event.ctrlKey  << 4
       ;

    if ("mouseup" === event.type) {
      action = "m";
    } else {
      action = "M";
    }

    message = coUtils.Text.format(
      "<%d;%d;%d%s",
      code, column, row, action);

    return message;
  },


  _getUtf8MouseReport: function _getUtf8MouseReport(event, button, coordinate)
  {
    var code,
        button,
        message,
        column = coordinate[0],
        row = coordinate[1],
        buffer;

    if ("mouseup" === event.type) {
      button = 3;
    }

    code = button
         | event.shiftKey << 2
         | event.metaKey  << 3
         | event.ctrlKey  << 4
         ;

    code += 32;
    column += 32;
    row += 32;

    buffer = [0x4d, code];

    if (column >= 0x80) {
      buffer.push(column >> 6 & 0x1f | 0xc0, column & 0x3f | 0x80);
    } else {
      buffer.push(column);
    }

    if (row >= 0x80) {
      buffer.push(row >> 6 & 0x1f | 0xc0, row & 0x3f | 0x80);
    } else {
      buffer.push(row);
    }

    message = String.fromCharCode.apply(String, buffer);

    return message;
  },

  _getNormalMouseReport: function _getNormalMouseReport(event, button, coordinate)
  {
    var code,
        button,
        message,
        column = coordinate[0],
        row = coordinate[1];

    if ("mouseup" === event.type) {
      button = 3;
    }

    code = button
         | event.shiftKey << 2
         | event.metaKey  << 3
         | event.ctrlKey  << 4
         ;

    code += 32;
    column += 32;
    row += 32;

    // send escape sequence.
    //                            M
    message = String.fromCharCode(0x4d, code, column, row);

    return message;
  },

  /** Make packed mouse event data and send it to tty device. */
  _sendMouseEvent:
  function _sendMouseEvent(event, button, coordinate)
  {
    var message,
        buffer,
        code,
        action,
        column,
        row,
        tracking_type;

    // 0: button1, 1: button2, 2: button3, 3: release
    //
    // +-+-+-+-+-+-+-+-+
    // | | | | | | | | |
    // +-+-+-+-+-+-+-+-+
    //
    // --------------------------
    //              0 0  button1
    //              0 1  button2
    //              1 0  button3
    //              1 1  release
    //    1           1  button4
    //    1         1    button5
    // --------------------------
    //        0 0 0
    //        0 0 1      shift
    //        0 1 0      meta
    //        1 0 0      control
    // --------------------------
    //  0 0 1            magic // +32
    // --------------------------
    //
    //             | 1              << 5

    switch (this._tracking_type) {

      // urxvt-style
      case "urxvt":
        message = this._getUrxvtMouseReport(event, button, coordinate);
        break;

      // sgr-style
      case "sgr":
        message = this._getSgrMouseReport(event, button, coordinate);
        break;

      case "utf8":
        message = this._getUtf8MouseReport(event, button, coordinate);
        break;

      default:
        message = this._getNormalMouseReport(event, button, coordinate);
        break;

    } // switch (this._tracking_type)

    this.sendMessage("command/send-sequence/csi", message);

  },

  /** Dragstart event listener. */
  "[listen('dragstart', '#tanasinn_content'), pnp]":
  function ondragstart(event)
  {
    this._pressed = true;
  },

  /** Mouse down evnet listener */
  "[listen('DOMMouseScroll', '#tanasinn_content'), pnp]":
  function onmousescroll(event)
  {
    var renderer = this._renderer,
        screen = this._screen,
        tracking_mode,
        count,
        line_height,
        i,
        coordinate;

    if (event.axis === event.VERTICAL_AXIS) {

      count = event.detail;
      if (event.hasPixels) {
        line_height = renderer.line_height;
        count = Math.round(count / line_height + 0.5);
      } else {
        count = Math.round(count);
      }
      if (0 === count) {
        return;
      }

      tracking_mode = this._tracking_mode;
      if (!this._in_scroll_session
          && this._alternate_wheel_mode
          && screen.isAltScreen()
          && coUtils.Constant.TRACKING_NONE === tracking_mode) {
        if (coUtils.Constant.CURSOR_MODE_APPLICATION === this._cursor_mode) {
          if (count > 0) {
            for (i = 0; i < count; ++i) {
              if (this._application_wheel_mode) {
                this.sendMessage("command/send-sequence/ss3", "b");
              } else {
                this.sendMessage("command/send-sequence/ss3", "B");
              }
            }
          } else {
            for (i = 0; i < -count; ++i) {
              if (this._application_wheel_mode) {
                this.sendMessage("command/send-sequence/ss3", "a");
              } else {
                this.sendMessage("command/send-sequence/ss3", "A");
              }
            }
          }
        } else {
          if (count > 0) {
            for (i = 0; i < count; ++i) {
              if (this._application_wheel_mode) {
                this.sendMessage("command/send-sequence/csi", "b");
              } else {
                this.sendMessage("command/send-sequence/csi", "B");
              }
            }
          } else {
            for (i = 0; i < -count; ++i) {
              if (this._application_wheel_mode) {
                this.sendMessage("command/send-sequence/csi", "a");
              } else {
                this.sendMessage("command/send-sequence/csi", "A");
              }
            }
          }
        }
      } else if (!this._in_scroll_session
                 && coUtils.Constant.TRACKING_NONE !== tracking_mode) {
        coordinate = this._getCurrentPosition(event);

        if (count > 0) {
          for (i = 0; i < count; ++i) {
            this._sendMouseEvent(event, 0x41, coordinate);
          }
        } else {
          for (i = 0; i < -count; ++i) {
            this._sendMouseEvent(event, 0x40, coordinate);
          }
        }
//      } else {
//        if (count > 0) {
//          this.sendMessage("command/scroll-down-view", count);
//          this.sendMessage("command/draw");
//        } else if (count < 0) {
//          this.sendMessage("command/scroll-up-view", -count);
//          this.sendMessage("command/draw");
//        } else { // count === 1
//          // do nothing
//        }
      }
    }
  },

  /** Mouse down evnet listener */
  "[listen('mousedown', '#tanasinn_content'), pnp]":
  function onmousedown(event)
  {
    var tracking_mode = this._tracking_mode,
        button,
        coordinate;

    this._pressed = true;

    if (coUtils.Constant.TRACKING_NONE === tracking_mode) {
      return;
    }

    switch (event.button) {

      case 0:
        button = coUtils.Constant.BUTTON_LEFT;
        break;

      case 1:
        button = coUtils.Constant.BUTTON_MIDDLE;
        break;

      case 2:
        button = coUtils.Constant.BUTTON_RIGHT;
        break;

      default:
        throw coUtils.Debug.Error(
          _("Unhandled mousedown event, button: %d."),
          event.button);

    }

    coordinate = this._getCurrentPosition(event);
    this._sendMouseEvent(event, button, coordinate);
  },

  /** Mouse move evnet listener */
  "[listen('mousemove', '#tanasinn_content'), pnp]":
  function onmousemove(event)
  {
    var tracking_mode = this._tracking_mode,
        button,
        coordinate,
        last_position;

    switch (tracking_mode) {

      case coUtils.Constant.TRACKING_BUTTON:
        if (this._pressed) {
          button = 32 + event.button;//MOUSE_RELEASE;//event.button;
          coordinate = this._getCurrentPosition(event);
          last_position = this._last_position;
          if (null === last_position
              || coordinate[0] !== last_position[0]
              || coordinate[1] !== last_position[1]) {
            this._sendMouseEvent(event, button, coordinate);
            this._last_position = coordinate;
          }
        }
        break;

      case coUtils.Constant.TRACKING_ANY:
        // Send motion event.
        if (this._pressed) {
          button = 32 + event.button;
        } else {
          button = 32 + MOUSE_RELEASE;
        }
        coordinate = this._getCurrentPosition(event);
        last_position = this._last_position;
        if (null === last_position
            || coordinate[0] !== last_position[0]
            || coordinate[1] !== last_position[1]) {
          this._sendMouseEvent(event, button, coordinate);
          this._last_position = coordinate;
        }
        break;

      case coUtils.Constant.TRACKING_NORMAL:
      case coUtils.Constant.TRACKING_NONE:
      case coUtils.Constant.TRACKING_X10:
      case coUtils.Constant.TRACKING_HIGHLIGHT:
      default:
        // pass
    } // switch tracking_mode
  },

  /** Mouse up evnet listener */
  "[listen('mouseup', '#tanasinn_content'), pnp]":
  function onmouseup(event)
  {
    var tracking_mode = this._tracking_mode,
        button,
        coordinate;

    this._pressed = false;

    if (coUtils.Constant.TRACKING_NONE !== tracking_mode) {
      button = event.button;
      coordinate = this._getCurrentPosition(event);
      this._sendMouseEvent(event, button, coordinate); // release
    }

  },

  // Helper: get current position from mouse event object.
  _getCurrentPosition: function _getCurrentPosition(event)
  {
    var renderer = this._renderer,
        screen = this._screen,
        width = screen.getWidth(),
        height = screen.getHeight(),
        target_element = this.request(
          "command/query-selector",
          "#tanasinn_center_area"),
        box = target_element.boxObject,
        root_element = this.request("get/root-element"),
        offsetX = box.screenX - root_element.boxObject.screenX,
        offsetY = box.screenY - root_element.boxObject.screenY,
        left = event.layerX - offsetX, // left position in pixel.
        top = event.layerY - offsetY,  // top position in pixel.
        column = Math.ceil(left / renderer.char_width),
        row = Math.ceil(top / renderer.line_height);
    if (column < 1) {
      column = 1;
    }
    if (column > width) {
      column = width;
    }
    if (row < 1) {
      row = 1;
    }
    if (row > height) {
      row = height;
    }
    return [column, row];
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


}; // class Mouse

/**
 * @fn main
 * @brief Module entry point.
 * @param {Broker} broker The Broker object.
 */
function main(broker)
{
  new Mouse(broker);
}

// EOF
