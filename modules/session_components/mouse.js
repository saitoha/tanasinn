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

var MOUSE_BUTTON1 = 0,
    MOUSE_BUTTON3 = 1,
    MOUSE_BUTTON2 = 2,
    MOUSE_RELEASE = 3,
    MOUSE_WHEEL_UP = 64,
    MOUSE_WHEEL_DOWN = 65;

/**
 *  @class Mouse
 *  @brief Listen mouse input events and send them to TTY device.
 *
 *  Thanks to:
 *   - brodie's MouseTerm Project    https://github.com/brodie/mouseterm
 *   - Vivek Dasmohapatra            http://rtfm.etla.org/xterm/ctlseq.html
 */
var Mouse = new Class().extends(Plugin).depends("renderer");
Mouse.definition = {

  id: "mouse",

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

  _in_scroll_session: false,

  /** Fired at scroll session is started. */
  "[subscribe('event/scroll-session-started'), enabled]":
  function onScrollSessionStarted() 
  {
    this._in_scroll_session = true;
  },

  /** Fired at scroll session is closed. */
  "[subscribe('event/scroll-session-closed'), enabled]":
  function onScrolSessionClosed() 
  {
    this._in_scroll_session = false;
  },

  /** Fired at the mouse tracking type is changed. */
  "[subscribe('event/mouse-tracking-type-changed'), pnp]":
  function onMouseTrackingTypeChanged(data) 
  {
    if (coUtils.Constant.TRACKING_NONE === data) {
      this.onmousescroll.enabled = false;
      this.sendMessage(_("Leaving mouse tracking type: [%s]."), this._tracking_type)
    } else {
      this.onmousescroll.enabled = true;
      this.sendMessage(_("Entering mouse tracking type: [%s]."), data)
    }
    this._tracking_type = data;
  },

  /** Fired at the mouse tracking mode is changed. */
  "[subscribe('event/mouse-tracking-mode-changed'), pnp]":
  function onMouseTrackingModeChanged(data) 
  {
    if (coUtils.Constant.TRACKING_NONE === data) {
      this.sendMessage(_("Leaving mouse tracking mode: [%s]."), this._tracking_mode)
    } else {
      this.sendMessage(_("Entering mouse tracking mode: [%s]."), data)
    }

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

  /** Make packed mouse event data and send it to tty device. */
  _sendMouseEvent: function _sendMouseEvent(event, button) 
  {
    var message, buffer, code, action, column, row,
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

    [column, row] = this._getCurrentPosition(event);

    tracking_type = this._tracking_type;

    switch (tracking_type) {

      // urxvt-style 
      case "urxvt":
        if ("mouseup" === event.type) {
          button = 3;
        }
        code = button 
             | event.shiftKey << 2 
             | event.metaKey  << 3
             | event.ctrlKey  << 4
             ;
        code += 32;
        //column += 32;
        //row += 32;
        message = coUtils.Text.format(
          "%d;%d;%dM", 
          code, column, row);
//        coUtils.Debug.reportError(message)
        break;

      // sgr-style 
      case "sgr":
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
//        coUtils.Debug.reportError(message)
        break;

      case "utf8":
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

        function putChar(c) 
        {
          var c1, c2;

          if (c >= 0x80) {
            // 110xxxxx 10xxxxxx
            // (0x00000080 - 0x000007ff) // 11bit
            c1 = c >> 6 & 0x1f | 0xc0;
            c2 = c & 0x3f | 0x80;
            buffer.push(c1, c2); 
          } else {
            buffer.push(c);
          }
        }
        putChar(column);
        putChar(row);
        message = String.fromCharCode.apply(String, buffer);
        break;

      default:
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
//        coUtils.Debug.reportMessage(message)

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
    var renderer, tracking_mode, count, line_height, i;
    
    renderer = this.dependency["renderer"];

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

      tracking_mode = this._tracking_mode;
      if (this._in_scroll_session 
          || coUtils.Constant.TRACKING_NONE === tracking_mode) {
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

        if (count > 0) {
          for (i = 0; i < count; ++i) {
            this._sendMouseEvent(event, 0x41); 
          }
        } else {
          for (i = 0; i < -count; ++i) {
            this._sendMouseEvent(event, 0x40); 
          }
        }

      }
    }
  },

  /** Mouse down evnet listener */
  "[listen('mousedown', '#tanasinn_content'), pnp]": 
  function onmousedown(event) 
  {
    var tracking_mode, button;
 
    this._pressed = true;

    tracking_mode = this._tracking_mode;
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
    this._sendMouseEvent(event, button); 
  },

  /** Mouse move evnet listener */
  "[listen('mousemove', '#tanasinn_content'), pnp]": 
  function onmousemove(event) 
  {
    var tracking_mode, button;

    tracking_mode = this._tracking_mode;

    switch (tracking_mode) {

      case coUtils.Constant.TRACKING_BUTTON:
        if (this._pressed) {
          button = 32 + event.button;//MOUSE_RELEASE;//event.button;
          this._sendMouseEvent(event, button); 
        }
        break;

      case coUtils.Constant.TRACKING_ANY:
      // Send motion event.
        if (this._pressed) {
          button = 32 + event.button;
        } else {
          button = 32 + MOUSE_RELEASE;
        }
        this._sendMouseEvent(event, button); 
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
    var tracking_mode, button;

    this._pressed = false;

    tracking_mode = this._tracking_mode;
    if (coUtils.Constant.TRACKING_NONE === tracking_mode) {
      return;
    }

    button = event.button;
    this._sendMouseEvent(event, button); // release
  },

  // Helper: get current position from mouse event object.
  _getCurrentPosition: function _getCurrentPosition(event) 
  {
    var target_element, box, offsetX, offsetY, 
        left, top, renderer, column, row, root_element;

    target_element = this.request(
      "command/query-selector", 
      "#tanasinn_center_area");
    box = target_element.boxObject;

    root_element = this.request("get/root-element");
    offsetX = box.screenX - root_element.boxObject.screenX;
    offsetY = box.screenY - root_element.boxObject.screenY;
    left = event.layerX - offsetX; // left position in pixel.
    top = event.layerY - offsetY;  // top position in pixel.

    // converts pixel coordinate to [column, row] style.
    renderer = this.dependency["renderer"];
    column = Math.round(left / renderer.char_width);
    row = Math.round(top / renderer.line_height);
    return [column, row];
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
