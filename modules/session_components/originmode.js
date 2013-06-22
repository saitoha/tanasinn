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
 * @class OriginMode
 *
 * DECOM - Origin Mode
 *
 * This control function sets the origin for the cursor. DECOM determines if
 * the cursor position is restricted to inside the page margins. When you
 * power up or reset the terminal, you reset origin mode.
 *
 * Default: Origin is at the upper-left of the screen, independent of margins.
 *
 * Format
 *
 * CSI   ?     6     h
 * 9/11  3/15  3/6   6/8
 *
 * Set: within margins.
 *
 *
 * CSI   ?     6     l
 * 9/11  3/15  3/6   6/12
 *
 * Reset: upper-left corner.
 *
 *
 * Description
 *
 * When DECOM is set, the home cursor position is at the upper-left corner of
 * the screen, within the margins. The starting point for line numbers depends
 * on the current top margin setting. The cursor cannot move outside of the
 * margins.
 *
 * When DECOM is reset, the home cursor position is at the upper-left corner of
 * the screen. The starting point for line numbers is independent of the
 * margins. The cursor can move outside of the margins.
 *
 */
var OriginMode = new Class().extends(Plugin)
                            .depends("cursorstate");
OriginMode.definition = {

  id: "origin_mode",

  /** plugin information */
  getInfo: function getInfo()
  {
    return {
      name: _("Origin Mode(DECOM)"),
      version: "0.1",
      description: _("Switch the cursor's show/hide status.")
    };
  },

  "[persistable] enabled_when_startup": true,
  "[persistable] default_value": false,

  _mode: null,
  _cursor: null,

  /** Installs itself.
   *  @param {InstallContext} context A InstallContext object.
   */
  "[install]":
  function install(context)
  {
    this._mode = this.default_value;
    this._cursor = context["cursorstate"];
  },

  /** Uninstalls itself.
   */
  "[uninstall]":
  function uninstall()
  {
    this._mode = null;
    this._cusor = null;
  },

  /** Enable origin mode (DECOM)
   */
  "[subscribe('sequence/decset/6'), pnp]":
  function activate()
  {
    var cursor = this._cursor;

    this._mode = true;

    // set
    cursor.DECOM = true;

    coUtils.Debug.reportMessage(
      _("DECSET - DECOM (Origin mode) was set: (%d, %d)."),
      cursor.originX,
      cursor.originY);

  },

  /** Disable origin mode (DECOM)
   */
  "[subscribe('sequence/decrst/6'), pnp]":
  function deactivate()
  {
    var cursor = this._cursor;

    this._mode = false;

    // reset
    cursor.DECOM = false;

    coUtils.Debug.reportMessage(
      _("DECSET - DECOM (Origin mode) was reset: (%d, %d)."),
      cursor.positionX,
      cursor.positionY);
  },

  /** Report mode
   */
  "[subscribe('sequence/decrqm/6'), pnp]":
  function report()
  {
    var mode = this._mode ? 1: 2,
        message = "?6;" + mode + "$y";

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


}; // class OriginMode

/**
 * @fn main
 * @brief Module entry point.
 * @param {Broker} broker The Broker object.
 */
function main(broker)
{
  new OriginMode(broker);
}

// EOF
