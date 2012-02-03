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
let Mouse = new Class().extends(Plugin);
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

  _tracking_mode: null,
  _installed: false,

  _keypad_mode: coUtils.Constant.KEYPAD_MODE_NORMAL,
  _in_scroll_session: false,

  _renderer: null,

  "[subscribe('initialized/renderer'), enabled]":
  function onLoad(renderer)
  {
    this._renderer = renderer;
    this.enabled = this.enabled_when_startup;
  },

  /** Installs itself. */
  install: function install(session) 
  {
    /** Start to listen mouse event. */
    this.onmousedown.enabled = true;
    this.ondragstart.enabled = true;
    this.onmousemove.enabled = true;
    this.onmouseup.enabled = true;
    this.onmousescroll.enabled = true;
    this.onMouseTrackingModeChanged.enabled = true;
    this.backup.enabled = true;
    this.restore.enabled = true;
  },

  /** Uninstalls itself. */
  uninstall: function uninstall(session) 
  {
    // unregister mouse event DOM listeners.
    this.onmousedown.enabled = false;
    this.ondragstart.enabled = false;
    this.onmousemove.enabled = false;
    this.onmouseup.enabled = false;
    this.onmousescroll.enabled = false;
    this.onMouseTrackingModeChanged.enabled = false;
    this.backup.enabled = false;
    this.restore.enabled = false;
  },
    
  /** Fired at the keypad mode is changed. */
  "[subscribe('event/keypad-mode-changed'), enabled]": 
  function onKeypadModeChanged(mode) 
  {
    this._keypad_mode = mode;
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

  /** Fired at the mouse tracking mode is changed. */
  "[subscribe('event/mouse-tracking-mode-changed')]":
  function onMouseTrackingModeChanged(data) 
  {
    if ("VT200_HIGHLIGHT_MOUSE" == data) {
      coUtils.Debug.reportWarning(
        _("FIXME: Now, We have not implemented ",
          "VT200_HIGHLIGHT_MOUSE mouse tracking mode."));
    }
    let session = this._broker;
    if (null == data) {
      session.notify(_("Leaving mouse tracking mode: [%s]."), this._tracking_mode)
    } else {
      session.notify(_("Entering mouse tracking mode: [%s]."), data)
    }
    this._tracking_mode = data;
  },

  "[subscribe('command/backup')]": 
  function backup(context) 
  {
    context.mouse = {
      tracking_mode: this._tracking_mode,
      keypad_mode: this._keypad_mode,
    }; 
  },

  "[subscribe('command/restore')]": 
  function restore(context) 
  {
    let {tracking_mode, keypad_mode} = context.mouse;
    this._tracking_mode = tracking_mode;
    this._keypad_mode = keypad_mode;
  },

  /** Make packed mouse event data and send it to tty device. */
  _sendMouseEvent: function _sendMouseEvent(event, button) 
  {
    if ("VT200_HIGHLIGHT_MOUSE" == this._tracking_mode) {
      coUtils.Debug.reportWarning(
        _("FIXME: Now, We have not implemented ",
          "VT200_HIGHLIGHT_MOUSE mouse tracking mode."));
      return;
    }
    // 0: button1, 1: button2, 2: button3, 3: release
    //
    // +-+-+-+-+-+-+-+-+
    // | | | | | | | | |
    // +-+-+-+-+-+-+-+-+
    //              0 0  button1
    //              0 1  button2
    //              1 0  button3
    //              1 1  release
    //        0 0 0      
    //        0 0 1      shift
    //        0 1 0      meta
    //        1 0 0      control
    //  0 0 1            magic
    //
    let code = button 
             | (event.shiftKey << 2) 
             | (event.metaKey << 3)
             | (event.ctrlKey << 4)
             | (1 << 5);
    let [column, row] = this._getCurrentPosition(event);

    // send escape sequence. 
    //                                 ESC    [     M          
    let message = String.fromCharCode(0x1b, 0x5b, 0x4d, code, column + 32, row + 32);

    let session = this._broker;
    session.notify("command/send-to-tty", message);
//    coUtils.Debug.reportMessage("Mouse position reporting: " 
//        + left + " " + top + " " + column + " " + row + "[" + message + "]")
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
    let renderer = this._renderer;
    if(event.axis === event.VERTICAL_AXIS) {
      let count = event.detail;
      if (event.hasPixels) {
        let line_height = renderer.line_height;
        count = Math.round(count / line_height + 0.5);
      } else {
        count = Math.round(count / 2);
      }
      if (0 == count)
        return;
      let keypad_mode = this._keypad_mode;
      let tracking_mode = this._tracking_mode;
      let session = this._broker;
      if (this._in_scroll_session 
          || null === tracking_mode 
          && coUtils.Constant.KEYPAD_MODE_NORMAL == keypad_mode) {
        if (count > 0) {
          session.notify("command/scroll-down-view", count);
          session.notify("command/draw");
        } else if (count < 0) {
          session.notify("command/scroll-up-view", -count);
          session.notify("command/draw");
        } else { // count == 1
          return;
        }
      } else { //if (coUtils.Constant.KEYPAD_MODE_APPLICATION == keypad_mode) {
        let sequences = [];
        if (count > 0) {
          while (count--)
            sequences.push("\x1bOB")
        } else if (count < 0) {
          //sequences.push("\x1b[B")
          while (count++)
            sequences.push("\x1bOA")
        } else {
          return; 
        }
        message = sequences.join("");
        session.notify("command/send-to-tty", message);
      }
      //  else {
      //  throw coUtils.Debug.Exception(
      //    _("keypad_mode has ill value: [%d]"), keypad_mode);
      //}
    }
  },

  /** Mouse down evnet listener */
  "[listen('mousedown', '#tanasinn_content')]": 
  function onmousedown(event) 
  {
    if (null !== this._tracking_mode) {
      let button = 0 == event.button ? MOUSE_BUTTON1
    //             : 2 == event.button ? MOUSE_BUTTON2
                 : null;
                 ; 
      if (null !== button) {
        this._sendMouseEvent(event, button); 
      }
    }
    // ev.button - 0: left click, 2: right click
  },

  /** Mouse move evnet listener */
  "[listen('mousemove', '#tanasinn_content')]": 
  function onmousemove(event) 
  {
    if (!this._dragged)
      return;
    let tracking_mode = this._tracking_mode;
    if  (/BTN_EVENT_MOUSE|ANY_EVENT_MOUSE/.test(tracking_mode)) {
      // Send motion event.
      let code = 32 + 0 + 32;
      let [column, row] = this._getCurrentPosition(event);
      column += 32;
      row += 32;
      let message = String.fromCharCode(0x1b, 0x5b, 0x4d, code, column, row);

      let session = this._broker;
      session.notify("command/send-to-tty", message);
    }
  },

  /** Mouse up evnet listener */
  "[listen('mouseup', '#tanasinn_content')]": 
  function onmouseup(event) 
  {
    this._dragged = false;
    if (null !== this._tracking_mode) {
      this._sendMouseEvent(event, MOUSE_RELEASE); // release
    }
  },

  // Helper: get current position from mouse event object.
  _getCurrentPosition: function _getCurrentPosition(event) 
  {
    let session = this._broker;
    let target_element = session.uniget(
      "command/query-selector", 
      "#tanasinn_center_area");
    let box = target_element.boxObject;
    let offsetX = box.screenX - session.root_element.boxObject.screenX;
    let offsetY = box.screenY - session.root_element.boxObject.screenY;
    let left = event.layerX - offsetX; // left position in pixel.
    let top = event.layerY - offsetY;  // top position in pixel.

    // converts pixel coordinate to [column, row] style.
    let renderer = this._renderer;
    let column = Math.round(left / renderer.char_width);
    let row = Math.round(top / renderer.line_height);
    return [column, row];
  },

};

/**
 * @fn main
 * @brief Module entry point.
 * @param {Desktop} desktop The Desktop object.
 */
function main(desktop) 
{
  desktop.subscribe(
    "@initialized/broker", 
    function(session) new Mouse(session));
}

