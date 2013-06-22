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
 * @class ReverseWrap
 *
 */
var ReverseWrap = new Class().extends(Plugin);
ReverseWrap.definition = {

  id: "reversewrap",

  /** plugin information */
  getInfo: function getInfo()
  {
    return {
      name: _("Reverse Wraparound Mode"),
      version: "0.1",
      description: _("Enable/disable reverse-wraparound feature",
                     " by escape seqnence.")
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

  /** Activate reverse-auto-wrap feature.
   */
  "[subscribe('sequence/decset/45'), pnp]":
  function activate()
  {
    this._mode = false;

    // Reverse-wraparound Mode
    this.sendMessage("command/enable-reverse-wraparound");

    coUtils.Debug.reportMessage(
      _("DECSET 45 - Reverse-wraparound Mode was set."));
  },

  /** Deactivate reverse reverse-auto-wrap feature.
   */
  "[subscribe('sequence/decrst/45'), pnp]":
  function deactivate()
  {
    this._mode = false;

    // No Reverse-wraparound Mode
    this.sendMessage("command/disable-reverse-wraparound");

    coUtils.Debug.reportMessage(
      _("DECRST 45 - Reverse-wraparound Mode was reset."));
  },

  /** Report mode
   */
  "[subscribe('sequence/decrqm/45'), pnp]":
  function report()
  {
    var mode = this._mode ? 1: 2,
        message = "?45;" + mode + "$y";

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



}; // class ReverseWrap

/**
 * @fn main
 * @brief Module entry point.
 * @param {Broker} broker The Broker object.
 */
function main(broker)
{
  new ReverseWrap(broker);
}

// EOF
