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
 * @class HighlightMouseMode
 *
 * XT_MSE_HL - highlight mouse mode
 * 
 * Default: off
 *
 * Format
 *
 * CSI   ?     1     0     0     1     h
 * 9/11  3/15  3/1   3/0   3/0   3/1   6/8
 *
 * Set: enable highlight mouse mode.
 *
 *
 * CSI   ?     1     0     0     1     l
 * 9/11  3/15  3/1   3/0   3/0   3/1   6/12
 *
 * Reset: disable highlight mouse mode.
 *
 */
var HighlightMouseMode = new Class().extends(Plugin);
HighlightMouseMode.definition = {

  id: "highlight_mouse_mode",

  getInfo: function getInfo()
  {
    return {
      name: _("Highlight Mouse Mode"),
      version: "0.1",
      description: _("Switch highlight mouse mode.")
    };
  },

  "[persistable] enabled_when_startup": true,
  "[persistable] default_value": false,

  _mode: false,

  /** installs itself. 
   *  @param {Broker} broker A Broker object.
   */
  "[install]":
  function install(broker) 
  {
    this._mode = this.default_value;
  },

  /** Uninstalls itself.
   *  @param {Broker} broker A broker object.
   */
  "[uninstall]":
  function uninstall(broker) 
  {
    this._mode = null;
  },

  /** Send Mouse X & Y on button press and release. 
   */
  "[subscribe('sequence/decset/1001'), pnp]":
  function activate() 
  { 
    this._mode = true;

    this.sendMessage(
      "event/mouse-tracking-mode-changed", 
      coUtils.Constant.TRACKING_HIGHLIGHT);
    coUtils.Debug.reportMessage(
      _("DECSET 1001 - xterm hilite mouse tracking mode was set."));
  },
 
  /** Don't Use Hilite Mouse Tracking.
   */
  "[subscribe('sequence/decrst/1001'), pnp]":
  function deactivate() 
  {
    this._mode = false;

    this.sendMessage(
      "event/mouse-tracking-mode-changed", 
      coUtils.Constant.TRACKING_NONE);
    coUtils.Debug.reportMessage(
      _("DECRST 1001 - xterm hilite mouse tracking mode was reset."));
  },

  /** Report mode
   */
  "[subscribe('sequence/decrqm/1001'), pnp]":
  function report() 
  {
    var mode = this._mode ? 1: 2,
        message = "?1001;" + mode + "$y";

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


}; // class HighlightMouseMode

/**
 * @fn main
 * @brief Module entry point.
 * @param {Broker} broker The Broker object.
 */
function main(broker) 
{
  new HighlightMouseMode(broker);
}

// EOF
