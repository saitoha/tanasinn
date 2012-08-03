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
 * @class ScrollbarMode
 *
 * XT_SCRLBAR - x10-compatible mouse mode
 * 
 * Default: off
 *
 * Format
 *
 * CSI   ?     3     0     h
 * 9/11  3/15  3/3   3/0   6/8
 *
 * Set: enable x10 mouse mode.
 *
 *
 * CSI   ?     3     0     l
 * 9/11  3/15  3/3   3/0   6/12
 *
 * Reset: disable x10 mouse mode.
 *
 */
var ScrollbarMode = new Class().extends(Plugin);
ScrollbarMode.definition = {

  get id()
    "scrollbar_mode",

  get info()
    <module>
        <name>{_("Scrollbar Mode")}</name>
        <version>0.1</version>
        <description>{
          _("Switch show/hide scrollbar.")
        }</description>
    </module>,

  "[persistable] enabled_when_startup": true,
  "[persistable] default_value": true,

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


  /** Show Scrollbar (rxvt)
   */
  "[subscribe('sequence/decset/30'), pnp]":
  function activate() 
  { 
    this._mode = true;

    // Show Scrollbar (rxvt)
    this.sendMessage("command/scrollbar-show");

    coUtils.Debug.reportMessage(
      _("DECSET 30 - Show scrollbar feature (rxvt) is set."));

  },

  /** Deactivate auto-repeat feature
   */
  "[subscribe('sequence/decrst/30'), pnp]":
  function deactivate() 
  {
    this._mode = false;

    this.sendMessage("command/scrollbar-hide");

    coUtils.Debug.reportMessage(
      _("DECRST 30 - Show-scrollbar feature (rxvt) is reset."));

  },

  /** Report mode
   */
  "[subscribe('sequence/decrqm/30'), pnp]":
  function report() 
  {
    var mode = this._mode ? 1: 2;

    this.sendMessage("command/send-sequence/csi");
    this.sendMessage("command/send-to-tty", "?30;" + mode + "$y"); // DECRPM
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

}; // class ScrollbarMode


/**
 * @fn main
 * @brief Module entry point.
 * @param {Broker} broker The Broker object.
 */
function main(broker) 
{
  new ScrollbarMode(broker);
}

// EOF
