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
 * @class X10MouseMode
 *
 * XT_MSE_X10 - x10-compatible mouse mode
 * 
 * Default: off
 *
 * Format
 *
 * CSI   ?     9     h
 * 9/11  3/15  3/9   6/8
 *
 * Set: enable x10 mouse mode.
 *
 *
 * CSI   ?     9     l
 * 9/11  3/15  3/9   6/12
 *
 * Reset: disable x10 mouse mode.
 *
 */
var X10MouseMode = new Class().extends(Plugin);
X10MouseMode.definition = {

  id: "x10_mouse_mode",

  getInfo: function getInfo()
  {
    return {
      name: _("X10 Compatible Mouse Mode"),
      version: "0.1",
      description: _("Switch X10 mouse mode.")
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

  /** Enable x10-style mouse reporting.
   */
  "[subscribe('sequence/decset/9'), pnp]":
  function activate() 
  { 
    this._mode = true;

    this.sendMessage(
      "event/mouse-tracking-mode-changed", 
      coUtils.Constant.TRACKING_X10);
    coUtils.Debug.reportMessage(
      _("DECSET 9 - X10 mouse tracking mode was set."));
  },

  /** Disable x10-style mouse reporting.
   */
  "[subscribe('sequence/decrst/9'), pnp]":
  function deactivate() 
  {
    this._mode = false;
           
    this.sendMessage(
      "event/mouse-tracking-mode-changed", 
      coUtils.Constant.TRACKING_NONE);
    coUtils.Debug.reportMessage(
      _("DECRST 9 - X10 mouse tracking mode was reset."));
  },

  /** Report mode
   */
  "[subscribe('sequence/decrqm/9'), pnp]":
  function report() 
  {
    var mode = this._mode ? 1: 2,
        message = "?9;" + mode + "$y";

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


}; // class X10MouseMode

/**
 * @fn main
 * @brief Module entry point.
 * @param {Broker} broker The Broker object.
 */
function main(broker) 
{
  new X10MouseMode(broker);
}

// EOF
