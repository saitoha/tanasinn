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
 * @class AlternateWheel
 *
 * Application Wheel Mode (MinTTY)
 *
 */
var AlternateWheel = new Class().extends(Plugin);
AlternateWheel.definition = {

  id: "altwheel",

  /** plugin information */
  getInfo: function getInfo()
  {
    return {
      name: _("Alternate Wheel Mode"),
      version: "0.1",
      description: _("Enable/Disable alternate scroll(xterm), mousewheel reporting(MinTTY) feature")
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
    this.reset();
  },

  /** Uninstalls itself.
   */
  "[uninstall]":
  function uninstall()
  {
    this._mode = null;
  },

  /** Activate alternate wheel mode feature(xterm/MinTTY).
   */
  "[subscribe('sequence/decset/{1007 | 7786}'), pnp]":
  function activate()
  {
    this._mode = true;

    this.sendMessage("command/change-alternate-wheel-mode", true);
  },

  /** Deactivate alternate wheel mode feature(xterm/MinTTY).
   */
  "[subscribe('sequence/decrst/{1007 | 7786}'), pnp]":
  function deactivate()
  {
    this._mode = false;

    this.sendMessage("command/change-alternate-wheel-mode", false);
  },

  /** Report mode
   */
  "[subscribe('sequence/decrqm/1007'), pnp]":
  function report()
  {
    var mode = this._mode ? 1: 2,
        message = "?1007;" + mode + "$y";

    this.sendMessage("command/send-sequence/csi", message);
  },

  /** Report mode
   */
  "[subscribe('sequence/decrqm/7786'), pnp]":
  function report()
  {
    var mode = this._mode ? 1: 2,
        message = "?7786;" + mode + "$y";

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
  new AlternateWheel(broker);
}

// EOF
