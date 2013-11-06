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
 * @class UCSMapping
 *
 */
var UCSMapping = new Class().extends(Plugin);
UCSMapping.definition = {

  id: "ucsmapping",

  getInfo: function getInfo()
  {
    return {
      name: _("ISO-2022 UCS Mapping Mode"),
      version: "0.1",
      description: _("Enable/disable iso-2022 to ucs conversion feature",
                     " by escape seqnence.")
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

  /** Activate UCS mapping feature.
   */
  "[subscribe('sequence/decset/8800'), pnp]":
  function activate()
  {
    this._mode = false;

    // UCS mapping mode
    this.sendMessage("command/enable-ucs-mapping");

    coUtils.Debug.reportMessage(
      _("DECSET 8800 - UCS mapping mode was set."));
  },

  /** Deactivate UCS mapping feature.
   */
  "[subscribe('sequence/decrst/8800'), pnp]":
  function deactivate()
  {
    this._mode = false;

    // No UCS mapping mode
    this.sendMessage("command/disable-ucs-mapping");

    coUtils.Debug.reportMessage(
      _("DECRST 8800 - UCS mapping mode was reset."));
  },

  /** Report mode
   */
  "[subscribe('sequence/decrqm/8800'), pnp]":
  function report()
  {
    var mode = this._mode ? 1: 2,
        message = "?8800;" + mode + "$y";

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



}; // class UCSMapping

/**
 * @fn main
 * @brief Module entry point.
 * @param {Broker} broker The Broker object.
 */
function main(broker)
{
  new UCSMapping(broker);
}

// EOF
