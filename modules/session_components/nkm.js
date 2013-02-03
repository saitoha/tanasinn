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
 * @class NumericKeypadMode
 *
 * DECNKM - Numeric Keypad Mode
 *
 * This control function works like the DECKPAM and DECKPNM functions.
 * DECNKM is provided mainly for use with the request and report mode
 * (DECRQM/DECRPM) control functions.
 *
 * Available in: VT Level 4 mode only
 *
 * Default: Numeric
 *
 * Format
 *
 * CSI   ?     6     6     h
 * 9/11  3/15  3/6   3/6   6/8
 *
 * Set: application sequences.
 *
 *
 * CSI   ?     6     6     l
 * 9/11  3/15  3/6   3/6   6/12
 *
 * Reset: keypad characters.
 *
 */
var NumericKeypadMode = new Class().extends(Plugin);
NumericKeypadMode.definition = {

  id: "numeric_keypad_mode",

  getInfo: function getInfo()
  {
    return {
      name: _("Numeric Keypad Mode"),
      version: "0.1",
      description: _("Switch Numeric/Application keypad mode.")
    };
  },

  "[persistable] enabled_when_startup": true,
  "[persistable] default_value": false,

  _mode: false,

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

  /** set new line.
   */
  "[subscribe('sequence/decset/66'), pnp]":
  function activate()
  {
    this._mode = true;

    // application keypad mode.
    this.sendMessage(
      "event/keypad-mode-changed",
      coUtils.Constant.KEYPAD_MODE_APPLICATION);
  },

  /** set line feed.
   */
  "[subscribe('sequence/decrst/66'), pnp]":
  function deactivate()
  {
    this._mode = false;

    // numeric keypad mode.
    this.sendMessage(
      "event/keypad-mode-changed",
      coUtils.Constant.KEYPAD_MODE_NUMERIC);
  },

  /** Report mode
   */
  "[subscribe('sequence/decrqm/66'), pnp]":
  function report()
  {
    var mode = this._mode ? 1: 2,
        message = "?66;" + mode + "$y";

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


}; // class NumericKeypadMode

/**
 * @fn main
 * @brief Module entry point.
 * @param {Broker} broker The Broker object.
 */
function main(broker)
{
  new NumericKeypadMode(broker);
}

// EOF
