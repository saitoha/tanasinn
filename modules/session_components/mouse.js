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

const MOUSE_BUTTON1 = 0;
const MOUSE_BUTTON3 = 1;
const MOUSE_BUTTON2 = 2;
const MOUSE_RELEASE = 3;
const MOUSE_WHEEL_UP = 64;
const MOUSE_WHEEL_DOWN = 65;

/**
 *  @class Mouse
 *  @brief Listen mouse input events and send them to TTY device.
 *
 *  Thanks to:
 *   - brodie's MouseTerm Project    https://github.com/brodie/mouseterm
 *   - Vivek Dasmohapatra            http://rtfm.etla.org/xterm/ctlseq.html
 */
let Mouse = new Class().extends(Plugin).depends("renderer");
Mouse.definition = {

  get id()
    "mouse",

  get info()
    <plugin>
        <name>{_("Mouse")}</name>
        <description>{
          _("Listen mouse input events and send them to TTY device.")
        }</description>
        <version>0.1</version>
    </plugin>,

  "[persistable] enabled_when_startup": true,

  _tracking_mode: coUtils.Constant.TRACKING_NONE,
  _tracking_type: null,

  _dragged: false,
  _installed: false,

  _in_scroll_session: false,

  /** Installs itself. */
  "[subscribe('install/mouse'), enabled]":
  function install(broker) 
  {
    /** Start to listen mouse event. */
    this.onmousedown.enabled = true;
    this.ondragstart.enabled = true;
    this.onmousemove.enabled = true;
    this.onmouseup.enabled = true;
    this.onmousescroll.enabled = true;
    this.onMouseTrackingTypeChanged.enabled = true;
    this.onMouseTrackingModeChanged.enabled = true;
    this.backup.enabled = true;
    this.restore.enabled = true;
  },

  /** Uninstalls itself. */
  "[subscribe('uninstall/mouse'), enabled]":
  function uninstall(broker) 
  {
    // unregister mouse event DOM listeners.
    this.onmousedown.enabled = false;
    this.ondragstart.enabled = false;
    this.onmousemove.enabled = false;
    this.onmouseup.enabled = false;
    this.onmousescroll.enabled = false;
    this.onMouseTrackingTypeChanged.enabled = false;
    this.onMouseTrackingModeChanged.enabled = false;
    this.backup.enabled = false;
    this.restore.enabled = false;
  },
    
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
  "[subscribe('event/mouse-tracking-type-changed')]":
  function onMouseTrackingTypeChanged(data) 
  {
    let broker = this._broker;
    if (coUtils.Constant.TRACKING_NONE == data) {
      broker.notify(_("Leaving mouse tracking type: [%s]."), this._tracking_type)
    } else {
      broker.notify(_("Entering mouse tracking type: [%s]."), data)
    }
    this._tracking_type = data;
  },

  /** Fired at the mouse tracking mode is changed. */
  "[subscribe('event/mouse-tracking-mode-changed')]":
  function onMouseTrackingModeChanged(data) 
  {
    let broker = this._broker;
    if (coUtils.Constant.TRACKING_NONE == data) {
      broker.notify(_("Leaving mouse tracking mode: [%s]."), this._tracking_mode)
    } else {
      broker.notify(_("Entering mouse tracking mode: [%s]."), data)
    }

    this._tracking_mode = data;
  },

  "[subscribe('command/backup')]": 
  function backup(context) 
  {
    context.mouse = {
      tracking_mode: this._tracking_mode,
    }; 
  },

  "[subscribe('command/restore')]": 
  function restore(context) 
  {
    if (context.mouse) {
      let {tracking_mode} = context.mouse;
      this._tracking_mode = tracking_mode;
    }
  },

  /** Make packed mouse event data and send it to tty device. */
  _sendMouseEvent: function _sendMouseEvent(event, button) 
  {

    let message;
    let buffer;

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
             ;
    let code;
    let [column, row] = this._getCurrentPosition(event);

    let tracking_type = this._tracking_type;
    switch (tracking_type) {

      case "urxvt":
        code = button 
             | event.shiftKey << 2 
             | event.metaKey  << 3
             | event.ctrlKey  << 4
             ;
        code += 32;
        message = coUtils.Text.format("\x1b[%d;%d;%dM", code, column, row);
        break;

      case "sgr":
        if (MOUSE_RELEASE == button) {
          if (null !== this._current_button) {
            button = this._current_button;
          }
          code = button 
             | event.shiftKey << 2 
             | event.metaKey  << 3
             | event.ctrlKey  << 4
             ;
          message = coUtils.Text.format("\x1b[<%d;%d;%dm", code, column, row);
          this._current_button = null;
        } else {
          code = button 
             | event.shiftKey << 2 
             | event.metaKey  << 3
             | event.ctrlKey  << 4
             ;
          message = coUtils.Text.format("\x1b[<%d;%d;%dM", code, column, row);
          this._current_button = button;
        }
        //coUtils.Debug.reportError(message)
        break;

      case "utf8":
        code = button 
             | event.shiftKey << 2 
             | event.metaKey  << 3
             | event.ctrlKey  << 4
             ;
        code += 32;
        column += 32;
        row += 32;
        buffer = [0x1b, 0x5b, 0x4d, code];
        function putChar(c) {
          if (c >= 0x80) {
            // 110xxxxx 10xxxxxx
            // (0x00000080 - 0x000007ff) // 11bit
            let c1 = c >> 6 & 0x1f | 0xc0;
            let c2 = c & 0x3f | 0x80;
            buffer.push(c1); 
            buffer.push(c2); 
          } else {
            buffer.push(c);
          }
        }
        putChar(column);
        putChar(row);
        message = String.fromCharCode.apply(String, buffer);
        break;

      default:
        code = button 
             | event.shiftKey << 2 
             | event.metaKey  << 3
             | event.ctrlKey  << 4
             ;
        code += 32;
        column += 32;
        row += 32;
        // send escape sequence. 
        //                            ESC    [     M          
        message = String.fromCharCode(0x1b, 0x5b, 0x4d, code, column, row);

    } // switch (this._tracking_type)

    let broker = this._broker;
    broker.notify("command/send-to-tty", message);

  },

  /** Dragstart event listener. */
  "[listen('dragstart', '#tanasinn_content')]": 
  function ondragstart(event) 
  {
    this._dragged = true;
  },

  /** Mouse down evnet listener */
  "[listen('DOMMouseScroll', '#tanasinn_content')]": 
  function onmousescroll(event) 
  {
    let renderer = this.dependency["renderer"];
    if(event.axis === event.VERTICAL_AXIS) {
      let count = event.detail;
      if (event.hasPixels) {
        let line_height = renderer.line_height;
        count = Math.round(count / line_height + 0.5);
      } else {
        count = Math.round(count / 2);
      }
      if (0 == count) {
        return;
      }

      let tracking_mode = this._tracking_mode;
      let broker = this._broker;
      if (this._in_scroll_session 
          || coUtils.Constant.TRACKING_NONE == tracking_mode) {
        if (count > 0) {
          broker.notify("command/scroll-down-view", count);
          broker.notify("command/draw");
        } else if (count < 0) {
          broker.notify("command/scroll-up-view", -count);
          broker.notify("command/draw");
        } else { // count == 1
          return;
        }

      } else {

        let i;
        if (count > 0) {
          for (i = 0; i < count; ++i) {
            this._sendMouseEvent(event, 0x40); 
          }
        } else {
          for (i = 0; i < -count; ++i) {
            this._sendMouseEvent(event, 0x41); 
          }
        }

      }
    }
  },

  /** Mouse down evnet listener */
  "[listen('mousedown', '#tanasinn_content')]": 
  function onmousedown(event) 
  {
 
    let tracking_mode = this._tracking_mode;
    if (coUtils.Constant.TRACKING_NONE == tracking_mode) {
      return;
    }

    this._dragged = true;

    let button;

    switch (event.button) {

      case 0:
        button = coUtils.Constant.BUTTON_LEFT;
        break;

      case 1:
        button = coUtils.Constant.BUTTON_MIDDLE;
        break;

      case 2:
        button = coUtils.Constant.BUTTONE_RIGHT;
        break;

      default:
        throw coUtils.Debug.Error(
          _("Unhandled mousedown event, button: %d."), 
          event.button);

    }
    this._sendMouseEvent(event, button); 
  },

  /** Mouse move evnet listener */
  "[listen('mousemove', '#tanasinn_content')]": 
  function onmousemove(event) 
  {
    let tracking_mode = this._tracking_mode;
    if (coUtils.Constant.TRACKING_NONE == tracking_mode) {
      return;
    }

    switch (tracking_mode) {

      case coUtils.Constant.TRACKING_NORMAL:
        if (this._dragged) {
          button = 32 + MOUSE_RELEASE;
          this._sendMouseEvent(event, button); 
        }
        break;

      case coUtils.Constant.TRACKING_BUTTON:
        if (this._dragged) {
          button = 32 + event.button;//MOUSE_RELEASE;//event.button;
          this._sendMouseEvent(event, button); 
        }
        break;

      case coUtils.Constant.TRACING_ANY:
      // Send motion event.
        let button;
        if (this._dragged) {
          button = 32 + event.button;
        } else {
          button = MOUSE_RELEASE;
        }
        this._sendMouseEvent(event, button); 
        break;

      case coUtils.Constant.TRACKING_X10:
      case coUtils.Constant.TRACKING_HIGHLIGHT:
      default:
        // pass
    } // switch tracking_mode
  },

  /** Mouse up evnet listener */
  "[listen('mouseup', '#tanasinn_content')]": 
  function onmouseup(event) 
  {
    let tracking_mode = this._tracking_mode;
    if (coUtils.Constant.TRACKING_NONE == tracking_mode) {
      return;
    }

    this._dragged = false;
//    let button = event.button;
    let button = 3;
    this._sendMouseEvent(event, button); // release
  },

  // Helper: get current position from mouse event object.
  _getCurrentPosition: function _getCurrentPosition(event) 
  {
    let broker = this._broker;
    let target_element = broker.uniget(
      "command/query-selector", 
      "#tanasinn_center_area");
    let box = target_element.boxObject;
    let offsetX = box.screenX - broker.root_element.boxObject.screenX;
    let offsetY = box.screenY - broker.root_element.boxObject.screenY;
    let left = event.layerX - offsetX; // left position in pixel.
    let top = event.layerY - offsetY;  // top position in pixel.

    // converts pixel coordinate to [column, row] style.
    let renderer = this.dependency["renderer"];
    let column = Math.round(left / renderer.char_width);
    let row = Math.round(top / renderer.line_height);
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

