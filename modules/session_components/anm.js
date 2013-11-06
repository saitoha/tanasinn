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
 * @class ANMSwitch
 *
 * DECANM - ANSI Mode
 *
 * DECANM changes the terminal to the VT52 mode of operation. In VT52 mode,
 * the terminal acts like a VT52 terminal. This mode lets you use applications
 * designed for the VT52 terminal.
 *
 * Format
 *
 * CSI   ?     2     l
 * 9/11  3/15  3/2   6/12
 *
 * Description
 *
 * Table 5-1 VT52 Escape Sequences Sequence  Action
 *
 * ESC A   Cursor up.
 * ESC B   Cursor down.
 * ESC C   Cursor right.
 * ESC D   Cursor left.
 * ESC F   Enter graphics mode.
 * ESC G   Exit graphics mode.
 * ESC H   Cursor to home position.
 * ESC I   Reverse line feed.
 * ESC J   Erase from cursor to end of screen.
 * ESC K   Erase from cursor to end of line.
 * ESC Y Pn  Move cursor to column Pn.
 * ESC Z   Identify (host to terminal).
 * ESC /Z  Report (terminal to host).
 * ESC =   Enter alternate keypad mode.
 * ESC >   Exit alternate keypad mode.
 * ESC <   Exit VT52 mode. Enter VT100 mode.
 * ESC ^   Enter autoprint mode.
 * ESC _   Exit autoprint mode.
 * ESC W   Enter printer controller mode.
 * ESC X   Exit printer controller mode.
 * ESC ]   Print screen.
 * ESC V   Print the line with the cursor.
 *
 */
var ANMSwitch = new Class().extends(Plugin);
ANMSwitch.definition = {

  id: "anm_switch",

  /** plugin information */
  getInfo: function getInfo()
  {
    return {
      name: _("VT52 Switching Mode"),
      version: "0.1",
      description: _("Switch between VT100/VT52 mode.")
    };
  },

  "[persistable] enabled_when_startup": true,
  "[persistable] default_value": true,

  _mode: null,

  /** Installs itself.
   *  @param {InstallContext} context A InstallContext object.
   */
  "[install]":
  function install(context)
  {
    this._mode = this.default_value;
  },

  /** Uninstalls itself.
   */
  "[uninstall]":
  function uninstall()
  {
    this._mode = null;
  },


  /** Designate USASCII for character sets G0-G3 (DECANM), and set VT100 mode.
   */
  "[subscribe('sequence/decset/2'), pnp]":
  function activate()
  {
    this._mode = true;

    this.sendMessage("sequence/g0", "B");
    this.sendMessage("sequence/g1", "B");
    this.sendMessage("sequence/g2", "B");
    this.sendMessage("sequence/g3", "B");
    this.sendMessage("command/change-emulation-mode", "vt100");

    coUtils.Debug.reportWarning(
      _("DECSET - DECANM was not implemented completely."));
  },

  /** Deactivate auto-repeat feature
   */
  "[subscribe('sequence/decrst/2'), pnp]":
  function deactivate()
  {
    this._mode = false;

    // Designate VT52 mode.
    this.sendMessage("command/change-emulation-mode", "vt52");

    coUtils.Debug.reportWarning(
      _("DECRST - DECANM was not implemented completely."));
  },

  /** Report mode
   */
  "[subscribe('sequence/decrqm/2'), pnp]":
  function report()
  {
    var mode = this._mode ? 1: 2,
        message = "?2;" + mode + "$y";

    this.sendMessage("command/send-sequence/csi", message);
  },

  /** on hard / soft reset
   */
  "[subscribe('command/{soft | hard}-terminal-reset'), pnp]":
  function reset(broker)
  {
    if (this.default_value) {
      this.activate();
    } else {
      this.deactivate();
    }
  },

  /**
   * Serialize snd persist current state.
   */
  "[subscribe('@command/backup'), type('Object -> Undefined'), pnp]":
  function backup(context)
  {
    // serialize this plugin object.
    context[this.id] = {
      mode: this._mode,
    };
  },

  /**
   * Deserialize snd restore stored state.
   */
  "[subscribe('@command/restore'), type('Object -> Undefined'), pnp]":
  function restore(context)
  {
    var data = context[this.id];

    if (data) {
      this._mode = data.mode;
    } else {
      coUtils.Debug.reportWarning(
        _("Cannot restore last state of renderer: data not found."));
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


}; // class ANMSwitch

/**
 * @fn main
 * @brief Module entry point.
 * @param {Broker} broker The Broker object.
 */
function main(broker)
{
  new ANMSwitch(broker);
}

// EOF
