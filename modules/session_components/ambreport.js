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
 * @class AmbiguousWidthReporting
 *
 * http://code.google.com/p/mintty/wiki/CtrlSeqs
 *
 * Applications can ask to be notified when the width of the so-called 
 * ambiguous width character category changes due to the user changing font.
 *
 * sequence   reporting
 * ^[[?7700l  disabled
 * ^[[?7700h  enabled
 *
 * When enabled, ^[[1W is sent when changing to an "ambiguous narrow" font 
 * and ^[[2W is sent when changing to an "ambiguous wide" font. 
 */
var AmbiguousWidthReporting = new Class().extends(Plugin)
                                .depends("parser");
AmbiguousWidthReporting.definition = {

  id: "ambiguous_width_reporting",

  getInfo: function getInfo()
  {
    return {
      name: _("Ambiguous Width Reporting"),
      version: "0.1",
      description: _("Switch ambiguous width reporting. ")
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


  /** Enable ambiguous width reporting.
   */
  "[subscribe('sequence/decset/7700'), pnp]":
  function activate() 
  { // Enable ambiguous width reporting
  },

  /** Disable ambiguous width reporting.
   */
  "[subscribe('sequence/decrst/7700'), pnp]":
  function deactivate() 
  { // Disable ambigous width reporting
  },

  /** Disable ambiguous width reporting.
   */
  "[subscribe('variable-changed/parser.ambiguous_as_wide'), pnp]":
  function onAmbiguousWidthChanged(value) 
  { // Disable ambigous width reporting
    var message;

    if (value) {
      message = "2W";
    } else {
      message = "1W";
    }
    this.sendMessage("command/send-sequence/csi", message);
  },

  /** Report mode
   */
  "[subscribe('sequence/decrqm/7700'), pnp]":
  function report() 
  {
    var mode = this._mode ? 1: 2,
        message = "?7700;" + mode + "$y";

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


}; // class EastAsianWidth


/**
 * @fn main
 * @brief Module entry point.
 * @param {Broker} broker The Broker object.
 */
function main(broker) 
{
  new AmbiguousWidthReporting(broker);
}

// EOF
