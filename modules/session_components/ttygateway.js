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
 * @trait TTYGateway
 */
var TTYGateway = new Class().extends(Plugin);
TTYGateway.definition = {

  /** Component ID */
  id: "tty_gateway",

  getInfo: function getInfo()
  {
    return {
      name: _("TTY Gateway"),
      version: "0.1.0",
      description: _("Manage conformanse level and 7bit/8bit response mode.")
    };
  },

  "[persistable] enabled_when_startup": true,
  "[persistable] response_delay": 1,
  "[persistable] initial_conformance_level": 4,
  "[persistable] initial_8bit_mode": false,

  _8bit_mode: false,
  _conformance_level: 4,

  /** Installs itself.
   *  @param {InstallContext} context A InstallContext object.
   */
  "[install]":
  function install(context)
  {
    this._8bit_mode = this.initial_8bit_mode;
    this._conformance_level = this.initial_conformance_level;
  },

  /** uninstalls itself.
   */
  "[uninstall]":
  function uninstall()
  {
  },

  /** Report conformance level (DECSCL) state
   */
  "[subscribe('sequence/decrqss/decscl'), pnp]":
  function onRequestStatus(data)
  {
    var level,
        submode,
        message;

    if (1 === this.conformance_level) {
      level = 61;
      submode = 0;
    } else {
      level = this.conformance_level + 60;
      if (this._8bit_mode) {
        submode = 0;
      } else {
        submode = 1;
      }
    }

    message = "0$r" + level + ";" + submode + "\"p";

    this.sendMessage("command/send-sequence/dcs", message);
  },

  /**
   *
   * S7C1T - Send C1 Control Character to the Host
   *
   * The VT510 can send C1 control characters to the host as single 8-bit
   * characters or as 7-bit escape sequences. You should select the format
   * that matches the operating level you are using.
   *
   * The following sequence causes the terminal to send all C1 control
   * characters as 7-bit escape sequences or single 8-bit characters:
   *
   * Format
   *
   * ESC   SP    F
   * 1/11  2/0   4/7
   *
   * Description
   *
   * This sequence changes the terminal mode as follows:
   *
   * Mode Before                             | Mode After
   * ----------------------------------------+---------------------------------
   * VT Level 4 mode, 8-bit controls         | VT Level 4 mode, 7-bit controls.
   * VT Level 4 mode, 7-bit controls         | Same. Terminal ignores sequence.
   * VT Level 1 or VT52 mode, 7-bit controls | Same. Terminal ignores sequence.
   *
   */
  "[profile('vt100'), sequence('ESC SP F')]":
  function S7C1T(n)
  {
    this.set8bitModeState(false);
  },

  /**
   *
   * S8C1T - Send C1 Control Character to the Host
   *
   * The following sequence causes the terminal to send C1 control characters
   * to the host as single 8-bit characters:
   *
   * Format
   *
   * ESC   SP    G
   * 1/11  2/0   4/6
   *
   * Description
   *
   * This sequence changes the terminal mode as follows:
   *
   * Mode Before                     | Mode After
   * --------------------------------+---------------------------------
   * VT Level 4 mode, 8-bit controls | Same. Terminal ignores sequence.
   * VT Level 4 mode, 7-bit controls | VT Level 4 mode, 8-bit controls.
   * VT Level 1 mode  Same. Terminal | ignores sequence.
   *
   */
  "[profile('vt100'), sequence('ESC SP G')]":
  function S8C1T()
  {
    this.set8bitModeState(true);
  },

  /** Send SOS sequence (ESC X ... ST or \x98 ... ST)
   */
  "[subscribe('command/send-sequence/sos'), pnp]":
  function send_SOS()
  {
    var message;

    if (this._8bit_mode) {
      message = "\x98";
    } else {
      message = "\x1bX";
    }

    // add internal data
    message += data;

    // add postfix
    if (this._8bit_mode) {
    //  message += "\x07";
      message += "\x9c";
    } else {
      message += "\x1b\\";
    }

    this.sendMessage("command/send-to-tty", message);
  },

  /** Send APC sequence (ESC _ ... ST or \x9f ... ST)
   */
  "[subscribe('command/send-sequence/apc'), pnp]":
  function send_APC()
  {
    var message;

    if (this._8bit_mode) {
      message = "\x9f";
    } else {
      message = "\x1b_";
    }

    // add internal data
    message += data;

    // add postfix
    if (this._8bit_mode) {
    //  message += "\x07";
      message += "\x9c";
    } else {
      message += "\x1b\\";
    }

    this.sendMessage("command/send-to-tty", message);
  },

  /** Send PM sequence (ESC ^ ... ST or \x9e ... ST)
   */
  "[subscribe('command/send-sequence/pm'), pnp]":
  function send_PM(data)
  {
    var message = "";

    if (this._8bit_mode) {
      message += "\x9e";
    } else {
      message += "\x1b^";
    }

    // add internal data
    message += data;

    // add postfix
    if (this._8bit_mode) {
    //  message += "\x07";
      message += "\x9c";
    } else {
      message += "\x1b\\";
    }

    this.sendMessage("command/send-to-tty", message);
  },

  /** Wrap given text with OSC sequence (ESC ] ... ST or \x9d ... ST)
   *  and send it to the TTY device.
   */
  "[subscribe('command/send-sequence/osc'), pnp]":
  function send_OSC(data)
  {
    var message = "";

    // add prefix
    if (this._8bit_mode) {
      message += "\x9d";
    } else {
      message += "\x1b]";
    }

    // add internal data
    message += data;

    // add postfix
    if (this._8bit_mode) {
    //  message += "\x07";
      message += "\x9c";
    } else {
      message += "\x1b\\";
    }

    // send to tty
    this.sendMessage("command/send-to-tty", message);
  },

  /** Get CSI sequence */
  "[subscribe('command/get-sequence/csi'), pnp]":
  function get_CSI()
  {
    var message;

    if (this._8bit_mode) {
      message = "\x9b";
    } else {
      message = "\x1b[";
    }
    return message;
  },

  /** Send a text data in CSI(\x1b[ or \x9b) prefixed format. */
  "[subscribe('command/send-sequence/csi'), pnp]":
  function send_CSI(data)
  {
    var message = this.get_CSI();

    message += data;

    //coUtils.Timer.setTimeout(
    //  function timerProc()
    //  {
        this.sendMessage("command/send-to-tty", message);
    //  }, this.response_delay, this);
  },

  /** Return SS3 sequence */
  "[subscribe('command/get-sequence/ss3'), pnp]":
  function get_SS3()
  {
    var message;

    if (this._8bit_mode) {
      message = "\x8f";
    } else {
      message = "\x1bO";
    }
    return message;
  },

  /** Send a text data in SS3(\x1bO or \x8f) prefixed format. */
  "[subscribe('command/send-sequence/ss3'), pnp]":
  function send_SS3(data)
  {
    var message = this.get_SS3();

    message += data;

    this.sendMessage("command/send-to-tty", message);
  },

  /** Send a DECRPSS formatted report sequence */
  "[subscribe('command/send-sequence/decrpss'), pnp]":
  function send_DECRPSS_string(data)
  {
    this.sendMessage("command/send-sequence/dcs", "0$" + data);
  },

  /** Wrap given text with DCS sequence (ESC P ... ST or \x90 ... ST)
   *  and send it to the TTY device.
   */
  "[subscribe('command/send-sequence/dcs'), pnp]":
  function send_DCS_string(data)
  {
    var message;

    if (this._8bit_mode) {
      message = "\x90";
    } else {
      message = "\x1bP";
    }

    message += data;

    if (this._8bit_mode) {
      message += "\x07";
    } else {
      message += "\x1b\\";
    }

    this.sendMessage("command/send-to-tty", message);

  },

  /** Change 8bit mode state */
  set8bitModeState: function set8bitModeState(value)
  {
    this._8bit_mode = value;
  },

  /** Chenge conformance level */
  setConformanceLevel: function setConformanceLevel(value)
  {
    if (value !== this._conformance_level) {
      this._conformance_level = value;

      // When the conformance level is changed, the terminal performs a
      // hard reset (RIS).
      this.sendMessage("command/hard-terminal-reset");

      coUtils.Debug.reportMessage(
          _("Conformance level was changed: [%d]."),
          value);
    }
  },

}; // TTYGateway

/**
 * @fn main
 * @brief Module entry point.
 * @param {Broker} broker The Broker object.
 */
function main(broker)
{
  new TTYGateway(broker);
}

// EOF
