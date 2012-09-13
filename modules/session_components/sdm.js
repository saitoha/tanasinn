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


/**
 * @class SixelScrollingMode
 *
 * DECSDM - Sixel Scrolling Mode
 * 
 * Sixel Scrolling
 *
 * When sixel scrolling is enabled, the sixel image begins at the top left of
 * the active text position. A sixel image will scroll the display when the 
 * image reaches the bottom margin of the display (the image may also scroll 
 * off the top of the display). A graphics new line character (–) is sent 
 * immediately after the sixel dump, and the text cursor is set at the same 
 * position as the sixel cursor upon exiting sixel mode.
 * With sixel scrolling disabled, the sixel image begins at the top left of
 * the display. When the image reaches the bottom margin, the display does not
 * scroll, and additional sixel commands are ignored. Upon exiting sixel mode,
 * the text cursor is set at the same position as when sixel mode was entered.
 *
 * Default: Enable sixel scrolling (TODO: find the evidence)
 *
 * Format
 *
 * CSI    ?     8     0     h
 * 9/11   3/15  3/8   3/0   6/8
 *
 * Set: disable sixel scrolling.
 *
 * CSI    ?     8     0     l
 * 9/11   3/15  3/8   3/0   6/12
 *
 * Reset: enable sixel scrolling.
 *
 */
var SixelScrollingMode = new Class().extends(Plugin);
SixelScrollingMode.definition = {

  id: "sixel_scrolling_mode",

  getInfo: function getInfo()
  {
    return {
      name: _("Sixel Scrolling Mode"),
      version: "0.1",
      description: _("Switch between Sixel Scrolling Mode / Sixel Display Mode")
    };
  },

  "[persistable] enabled_when_startup": true,
  "[persistable] default_value": false,

  _mode: null,

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

  /** Sixel Display Mode (DECSDM)
   */
  "[subscribe('sequence/decset/80'), pnp]":
  function activate() 
  {
    this._mode = true;

    // smooth scroll.
    this.sendMessage("command/change-sixel-display-mode", true);
  },

  /** Sixel Scrolling Mode (DECSDM)
   */
  "[subscribe('sequence/decrst/80'), pnp]":
  function deactivate() 
  {
    this._mode = false;

    // smooth scroll.
    this.sendMessage("command/change-sixel-display-mode", false);
  },

  /** Report mode
   */
  "[subscribe('sequence/decrqm/80'), pnp]":
  function report() 
  {
    var mode = this._mode ? 1: 2,
        message = "?80;" + mode + "$y";

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
   * Deserialize and restore stored state.
   */
  "[subscribe('@command/restore'), type('Object -> Undefined'), pnp]": 
  function restore(context) 
  {
    var data = context[this.id];

    if (data) {
      this._mode = data.mode;
    } else {
      coUtils.Debug.reportWarning(
        _("Cannot restore last state: data not found."));
    }
  },

}; // class SixelScrollingMode

/**
 * @fn main
 * @brief Module entry point.
 * @param {Broker} broker The Broker object.
 */
function main(broker) 
{
  new SixelScrollingMode(broker);
}

// EOF
