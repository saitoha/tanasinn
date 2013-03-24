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
 * @class FixedColumnMode
 *
 * DECCOLM - Select 80 or 132 Columns per Page
 *
 * There are two control functions that can set the page width to 80 or 132
 * columns, DECSCPP (DECSCPP - Select 80 or 132 Columns per Page) and DECCOLM.
 *
 * Note
 *
 * It is recommended that new applications use DECSCPP rather than DECCOLM.
 * DECSCPP does not clear page memory or reset the scrolling regions, as does
 * DECCOLM. DECCOLM is provided mainly for compatibility with previous
 * products.
 *
 * Default: 80 columns
 *
 * Format
 *
 * CSI   ?     3     h
 * 9/11  3/15  3/3   6/8
 *
 * Set: 132-column font.
 *
 *
 * CSI   ?     3     l
 * 9/11  3/15  3/3   6/12
 *
 * Reset: 80-column font.
 *
 * Notes on DECCOLM
 *
 * DECCOLM sets the number of columns on the page to 80 or 132 and selects the
 * corresponding 80- or 132-column font.
 *
 *  If you change the DECCOLM setting, the terminal:
 *    - Sets the left, right, top and bottom scrolling margins to their
 *      default positions.
 *    - Erases all data in page memory.
 *
 *  DECCOLM resets vertical split screen mode (DECLRMM) to unavailable.
 *
 *  DECCOLM clears data from the status line if the status line is set to host-writable.
 *
 */
var FixedColumnMode = new Class().extends(Plugin)
                                 .depends("screen");
FixedColumnMode.definition = {

  id: "fixed_column_mode",

  /** plugin information */
  getInfo: function getInfo()
  {
    return {
      name: _("Fixed Column Mode"),
      version: "0.1",
      description: _("Switch 80/132 columns mode.")
    };
  },

  "[persistable] enabled_when_startup": true,
  "[persistable] default_value": false,

  _allow_switch: null,
  _80mode: true,
  _screen: null,

  /** Installs itself.
   *  @param {InstallContext} context A InstallContext object.
   */
  "[install]":
  function install(context)
  {
    this._allow_switch = this.default_value;
    this._screen = context["screen"];
  },

  /** Uninstalls itself.
   */
  "[uninstall]":
  function uninstall()
  {
    this._allow_switch = null;
    this._80mode = true;
    this._screen = null;
  },

  /** Allow 80 <--> 132 mode
   */
  "[subscribe('sequence/decset/40'), pnp]":
  function activate()
  {
    this._allow_switch = true;

    coUtils.Debug.reportMessage(
      _("DECSET 40 - (Allow 80 <--> 132 mode) was called."));
  },

  /** Disallow 80 <--> 132 mode
   */
  "[subscribe('sequence/decrst/40'), pnp]":
  function deactivate()
  {
    this._allow_switch = false;

    coUtils.Debug.reportMessage(
      _("DECRST 40 - (Disallow 80 <--> 132 mode) was called."));
  },

  /** Change to 132 column mode
   */
  "[subscribe('sequence/decset/3'), pnp]":
  function changeTo132ColumnMode()
  {
    var screen = this._screen;

    // 80 column mode (DECCOLM)
    if (this._allow_switch) {
      this._80mode = false;
      this.sendMessage(
        "command/resize-screen",
        {
          column: 132,
          row: screen.height,
        });
      screen.eraseScreenAll();

      this.sendMessage(
        "event/screen-size-changed",
        {
          column: screen.width,
          row: screen.height
        });
    }
  },

  /** Change to 80 column mode
   */
  "[subscribe('sequence/decrst/3'), pnp]":
  function changeTo80ColumnMode()
  {
    var screen = this._screen;

    // 80 column mode (DECCOLM)
    if (this._allow_switch) {
      this._80mode = true;
      this.sendMessage(
        "command/resize-screen",
        {
          column: 80,
          row: screen.height,
        });
      screen.eraseScreenAll();

      this.sendMessage(
        "event/screen-size-changed",
        {
          column: screen.width,
          row: screen.height
        });
    }
  },

  /** Report mode
   */
  "[subscribe('sequence/decrqm/3'), pnp]":
  function report3()
  {
    var mode = this._allow_switch ? 1: 2,
        message = "?3;" + mode + "$y";

    this.sendMessage("command/send-sequence/csi", message);
  },

  /** Report mode
   */
  "[subscribe('sequence/decrqm/40'), pnp]":
  function report()
  {
    var mode = this._allow_switch ? 1: 2,
        message = "?40;" + mode + "$y";

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
      mode: this._allow_switch,
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
      this._allow_switch = data.mode;
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


}; // class FixedColumnMode

/**
 * @fn main
 * @brief Module entry point.
 * @param {Broker} broker The Broker object.
 */
function main(broker)
{
  new FixedColumnMode(broker);
}

// EOF
