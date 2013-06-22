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
 * @class EastAsianWidth
 *
 */
var EastAsianWidth = new Class().extends(Plugin)
                                .depends("parser");
EastAsianWidth.definition = {

  id: "east_asian_width",

  /** plugin information */
  getInfo: function getInfo()
  {
    return {
      name: _("East Asian Width"),
      version: "0.1",
      description: _("Switch to treat east asian ambiguous width ",
                     "characters as single/double.")
    };
  },

  "[persistable] enabled_when_startup": true,
  "[persistable] default_value": false,

  _mode: false,
  _parser: null,

  /** Installs itself.
   *  @param {InstallContext} context A InstallContext object.
   */
  "[install]":
  function install(context)
  {
    this._mode = this.default_value;
    this._parser = context["parser"];
  },

  /** Uninstalls itself.
   */
  "[uninstall]":
  function uninstall()
  {
    this._mode = null;
  },

  /** Treat ambiguous width characters as double-width.
   */
  "[subscribe('sequence/decset/8840'), pnp]":
  function activate8840()
  { // Treat ambiguous characters as double
    var parser = this._parser;

    parser.ambiguous_as_wide = true;
    this._mode = true
    coUtils.Debug.reportMessage("TNAMB: double");
  },

  /** Treat ambiguous width characters as single-width.
   */
  "[subscribe('sequence/decrst/8840'), pnp]":
  function deactivate8840()
  { // Treat ambiguous characters as single
    var parser = this._parser;

    parser.ambiguous_as_wide = false;
    this._mode = false
    coUtils.Debug.reportMessage("TNAMB: single");
  },

  /** Treat ambiguous width characters as single-width.
   */
  "[subscribe('sequence/decset/8428}'), pnp]":
  function activate()
  { // Treat ambiguous characters as double
    var parser = this._parser;

    parser.ambiguous_as_wide = false;
    this._mode = false
    coUtils.Debug.reportMessage("TNAMB: single");
  },

  /** Treat ambiguous width characters as double-width.
   */
  "[subscribe('sequence/decrst/8428}'), pnp]":
  function deactivate()
  { // Treat ambiguous characters as single
    var parser = this._parser;

    parser.ambiguous_as_wide = true;
    this._mode = true
    coUtils.Debug.reportMessage("TNAMB: double");
  },

  /** Report mode
   */
  "[subscribe('sequence/decrqm/8840'), pnp]":
  function report()
  {
    var mode = this._mode ? 1: 2,
        message = "?8840;" + mode + "$y";

    this.sendMessage("command/send-sequence/csi", message);
  },

  /** Report mode
   */
  "[subscribe('sequence/decrqm/8428'), pnp]":
  function report()
  {
    var mode = this._mode ? 2: 1,
        message = "?8428;" + mode + "$y";

    this.sendMessage("command/send-sequence/csi", message);
  },

  /** on hard / soft reset
   */
  "[subscribe('command/{soft | hard}-terminal-reset'), pnp]":
  function reset(broker)
  {
    if (this.default_value) {
      this.deactivate();
    } else {
      this.activate();
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


}; // class EastAsianWidth

/**
 * @fn main
 * @brief Module entry point.
 * @param {Broker} broker The Broker object.
 */
function main(broker)
{
  new EastAsianWidth(broker);
}

// EOF
