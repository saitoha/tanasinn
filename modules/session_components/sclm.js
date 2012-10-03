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
 * @class SmoothScrollingMode
 *
 * DECSCLM - Scrolling Mode
 * 
 * This control function selects the way the terminal scrolls lines. 
 * You can select one of two scroll settings, smooth or jump.
 * 
 * Default: Smooth scroll.
 *
 * Format
 *
 * CSI    ?     4     h
 * 9/11   3/15  3/4   6/8
 *
 * Set: smooth scroll.
 *
 * CSI    ?     4     l
 * 9/11   3/15  3/4   6/12
 *
 * Reset: jump scroll.
 *
 *
 * Description
 * 
 * When DECSLM is set, the terminal adds lines to the screen at a moderate,
 * smooth rate. You can select a slow rate or fast rate in Display Set-Up.
 * 
 * When DECSLM is reset, the terminal can add lines to the screen as fast as
 * it receives them.
 *
 */
var SmoothScrollingMode = new Class().extends(Plugin)
                                 .depends("screen");
SmoothScrollingMode.definition = {

  id: "smooth_scrolling_mode",

  getInfo: function getInfo()
  {
    return {
      name: _("Smooth Scrolling Mode"),
      version: "0.1",
      description: _("Switch smooth scrolling mode / jump scrolling mode.")
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
  },

  /** Uninstalls itself.
   */
  "[uninstall]":
  function uninstall() 
  {
    this._mode = null;
  },

  /** Smooth (Slow) Scloll (DECSCLM)
   */
  "[subscribe('sequence/decset/4'), pnp]":
  function activate() 
  {
    this._mode = true;

    // smooth scroll.
    this.sendMessage("command/change-scrolling-mode", true);
  },

  /** Smooth (Slow) Scloll (DECSCLM)
   */
  "[subscribe('sequence/decrst/4'), pnp]":
  function deactivate() 
  {
    this._mode = false;

    // smooth scroll.
    this.sendMessage("command/change-scrolling-mode", false);
  },

  /** Report mode
   */
  "[subscribe('sequence/decrqm/4'), pnp]":
  function report() 
  {
    var mode = this._mode ? 1: 2,
        message = "?4;" + mode + "$y";

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

}; // class SmoothScrollingMode

/**
 * @fn main
 * @brief Module entry point.
 * @param {Broker} broker The Broker object.
 */
function main(broker) 
{
  new SmoothScrollingMode(broker);
}

// EOF
