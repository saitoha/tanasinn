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
 * @trait ConformanceLevel
 */
var ConformanceLevel = new Class().extends(Plugin);
ConformanceLevel.definition = {
  
  /** Component ID */
  id: "conformanse_level",

  getInfo: function getInfo()
  {
    return {
      name: _("Conformance Level"),
      version: "0.1.0",
      description: _("Manage conformanse level and 7bit/8bit response mode.")
    };
  },

  "[persistable] enabled_when_startup": true,

  _8bit_mode: false,
  _conformance_level: 4,

  /**
   *
   * DECSCL - Select Conformance Level
   *
   * ref: http://www.vt100.net/docs/vt510-rm/DECSCL
   *
   * You select the terminal's operating level by using the following select 
   * conformance level (DECSCL) control sequences. The factory default is level 
   * 4 (VT Level 4 mode, 7-bit controls).
   *
   * Note
   *
   * When you change the conformance level, the terminal performs a hard reset (RIS).
   *
   */
  "[profile('vt100'), sequence('CSI Ps;Ps \" p')]": 
  function DECSCL(n1, n2) 
  {
    var level = n1,
        submode = n2;

    if (61 === level) {
      level = 1;
      this._8bit_mode = false;
    } else if (62 <= level && level <= 69) {
      if (0 === submode || 2 === submode) {
        this._8bit_mode = true;
      } else if (1 === submode) {
        this._8bit_mode = false;
      } else {
        coUtils.Debug.reportWarning(
          _("%s sequence [%s] was ignored."),
          "DECSCL", Array.slice(arguments));
        return;
      }
      level = 4;
    }
    if (level !== this._conformance_level) {
      this._conformance_level = level;
      this.sendMessage("command/hard-terminal-reset");
    }
  },

  "[subscribe('sequence/decrqss/decscl'), pnp]":
  function onRequestStatus(data) 
  {
    var level,
        submode,
        message;

    if (1 === this._conformance_level) {
      level = 61;
      submode = 0;
    } else {
      level = this._conformance_level + 60;
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
    this._8bit_mode = false;
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
    this._8bit_mode = true;
  },

  "[subscribe('command/send-sequence/sos'), pnp]":
  function send_PM() 
  {
    var message;

    if (this._8bit_mode) {
      message = "\x98";
    } else {
      message = "\x1bX";
    }

    this.sendMessage("command/send-to-tty", message);
  },


  "[subscribe('command/send-sequence/apc'), pnp]":
  function send_PM() 
  {
    var message;

    if (this._8bit_mode) {
      message = "\x9f";
    } else {
      message = "\x1b_";
    }

    this.sendMessage("command/send-to-tty", message);
  },


  "[subscribe('command/send-sequence/pm'), pnp]":
  function send_PM() 
  {
    var message;

    if (this._8bit_mode) {
      message = "\x9e";
    } else {
      message = "\x1b^";
    }

    this.sendMessage("command/send-to-tty", message);
  },


  "[subscribe('command/send-sequence/osc'), pnp]":
  function send_OSC(data) 
  {
    var message = "";

    if (this._8bit_mode) {
      message += "\x9d";
    } else {
      message += "\x1b]";
    }

    message += data;

    if (this._8bit_mode) {
      message += "\x07";
    } else {
      message += "\x1b\\";
    }

    this.sendMessage("command/send-to-tty", message);
  },

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

  "[subscribe('command/send-sequence/csi'), pnp]":
  function send_CSI(data) 
  {
    var message = this.get_CSI();

    message += data;

    this.sendMessage("command/send-to-tty", message);
  },

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

  "[subscribe('command/send-sequence/ss3'), pnp]":
  function send_SS3(data) 
  {
    var message = this.get_SS3();

    message += data;

    this.sendMessage("command/send-to-tty", message);
  },

  "[subscribe('command/send-sequence/decrpss'), pnp]":
  function send_DECRPSS_string(data) 
  {
    this.send_DCS_string("0$" + data);
  },

  "[subscribe('command/send-sequence/dcs'), pnp]":
  function send_DCS_string(data) 
  {
    var message = "";

    if (this._8bit_mode) {
      message += "\x90";
    } else {
      message += "\x1bP";
    }

    message += data;

    if (this._8bit_mode) {
      message += "\x07";
    } else {
      message += "\x1b\\";
    }

    this.sendMessage("command/send-to-tty", message);

  },

  /** return 8bit mode state */
  "[subscribe('get/8bit-mode-state')]":
  function get8bitModeState() 
  {
    return this._8bit_mode;
  },

}; // ConformanceLevel

/**
 * @fn main
 * @brief Module entry point.
 * @param {Broker} broker The Broker object.
 */
function main(broker) 
{
  new ConformanceLevel(broker);
}

// EOF
