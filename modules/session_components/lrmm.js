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
 * @class LeftRightMarginMode
 *
 * Application Wheel Mode (MinTTY)
 *
 */
var LeftRightMarginMode = new Class().extends(Plugin);
LeftRightMarginMode.definition = {

  id: "lrmm",

  /** plugin information */
  getInfo: function getInfo()
  {
    return {
      name: _("Left Right Margin Mode"),
      version: "0.1",
      description: _("Enable/Disable left-right margin mode (DECLRMM).")
    };
  },

  "[persistable] enabled_when_startup": true,
  "[persistable] default_value": false,

  _mode: null,

  /** Installs itself.
   *  @param {InstallContext} context A InstallContext object.
   */
  "[install]":
  function install(context)
  {
    this._mode = this.default_value;
    this.reset();
  },

  /** Uninstalls itself.
   */
  "[uninstall]":
  function uninstall()
  {
    this._mode = null;
  },

  /** Activate application wheel mode feature(MinTTY).
   */
  "[subscribe('sequence/decset/69'), pnp]":
  function activate()
  {
    this._mode = true;

    this.sendMessage("command/change-left-right-margin-mode", true);
  },

  /** Deactivate application wheel mode feature(MinTTY).
   */
  "[subscribe('sequence/decrst/69'), pnp]":
  function deactivate()
  {
    this._mode = false;

    this.sendMessage("command/change-left-right-margin-mode", false);
  },

  /** Report mode
   */
  "[subscribe('sequence/decrqm/69'), pnp]":
  function report()
  {
    var mode = this._mode ? 1: 2,
        message = "?69;" + mode + "$y";

    this.sendMessage("command/send-sequence/csi", message);
  },

  /** handle terminal reset event.
   */
  "[subscribe('command/{soft | hard}-terminal-reset'), pnp]":
  function reset()
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
    var data;

    data = context[this.id];
    if (data) {
      this._mode = data.mode;
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



}; // class ApplicationEscape

/**
 * @fn main
 * @brief Module entry point.
 * @param {Broker} broker The Broker object.
 */
function main(broker)
{
  new LeftRightMarginMode(broker);
}

// EOF
