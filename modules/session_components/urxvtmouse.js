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
 * @class UrxvtMouseMode
 *
 * XT_MSE_URXVT - rxvt-unicode mouse mode
 * 
 * Default: off
 *
 * Format
 *
 * CSI   ?     1     0     1     5     h
 * 9/11  3/15  3/1   3/0   3/1   3/5   6/8
 *
 * Set: enable urxvt mouse mode.
 *
 *
 * CSI   ?     1     0     1     5     l
 * 9/11  3/15  3/1   3/0   3/1   3/5   6/12
 *
 * Reset: disable urxvt mouse mode.
 *
 */
var UrxvtMouseMode = new Class().extends(Plugin);
UrxvtMouseMode.definition = {

  get id()
    "urxvt_mouse_mode",

  get info()
    <module>
        <name>{_("URXVT 1015 Mouse Mode")}</name>
        <version>0.1</version>
        <description>{
          _("Switch urxvt mouse mode.")
        }</description>
    </module>,


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

  /** Enable urxvt-style mouse reporting.
   */
  "[subscribe('sequence/decset/1015'), pnp]":
  function activate() 
  { 
    this._mode = true;

    this.sendMessage("event/mouse-tracking-type-changed", "urxvt");
    coUtils.Debug.reportMessage(
      _("DECSET 1015 - Enable urxvt-style mouse reporting, was set."));
  },

  /** Disable urxvt-style mouse reporting.
   */
  "[subscribe('sequence/decrst/1015'), pnp]":
  function deactivate() 
  {
    this._mode = false;
           
    this.sendMessage("event/mouse-tracking-type-changed", null);
    coUtils.Debug.reportMessage(
      _("DECRST 1015 - Disable urxvt-style mouse reporting, was reset."));
  },

  /** Report mode
   */
  "[subscribe('sequence/decrqm/1015'), pnp]":
  function report() 
  {
    var mode = this._mode ? 1: 2,
        message = "?1015;" + mode + "$y";

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


}; // class UrxvtMouseMode

/**
 * @fn main
 * @brief Module entry point.
 * @param {Broker} broker The Broker object.
 */
function main(broker) 
{
  new UrxvtMouseMode(broker);
}

// EOF
