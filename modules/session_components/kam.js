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
 * @class KeyboardActionMode
 *
 * KAM - Keyboard Action Mode
 *
 * This control function locks or unlocks the keyboard.
 *
 * Default: Unlocked
 *
 * Format
 *
 * CSI    2    h
 * 9/11   3/2  6/8
 *
 * Set: locks the keyboard.
 *
 *
 * CSI    2    l
 * 9/11   3/2  6/12
 *
 * Reset: unlocks the keyboard.
 *
 * Description
 *
 * If KAM is set, then the keyboard cannot send characters to the host. The
 * Wait indicator appears on the keyboard indicator line at the bottom of the
 * screen. The terminal ignores all keystrokes that send characters to the
 * host. KAM does not affect the F3 (Set-Up) or F4 (Session) keys.
 *
 * If KAM is reset, then the terminal unlocks the keyboard. The keyboard can
 * send characters to the host.
 *
 */
var KeyboardActionMode = new Class().extends(Plugin);
KeyboardActionMode.definition = {

  id: "keyboard_action_mode",

  /** plugin information */
  getInfo: function getInfo()
  {
    return {
      name: _("Keyboard action mode"),
      version: "0.1",
      description: _("Lock/Unlock the keyboard.")
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

  /** disable input handler.
   */
  "[subscribe('sequence/sm/2'), pnp]":
  function activate()
  {
    this._mode = true;

    // lock input manager.
    this.sendMessage("command/disable-input-manager", true);
  },

  /** enable input handler.
   */
  "[subscribe('sequence/rm/2'), pnp]":
  function deactivate()
  {
    this._mode = false;

    // unlock input manager.
    this.sendMessage("command/enable-input-manager", true);
  },

  /** Report mode
   */
  "[subscribe('sequence/rqm/2'), pnp]":
  function report()
  {
    var mode = this._mode ? 1: 2,
        message = "2;" + mode + "$y";

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

}; // class KeyboardActionMode

/**
 * @fn main
 * @brief Module entry point.
 * @param {Broker} broker The Broker object.
 */
function main(broker)
{
  new KeyboardActionMode(broker);
}

// EOF
