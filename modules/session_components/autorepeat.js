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
 * @class AutoRepeat
 *
 * DECARM - Autorepeat Mode
 *
 * This control function determines whether or not keys automatically repeat 
 * their character when held down. If DECARM is set, then most keys you press 
 * for more than 0.5 seconds send a character repeatedly until you release 
 * the key.
 *
 * Default: Repeat (set)
 *
 * Format
 *
 * CSI    ?      8    h
 * 9/11   3/15   3/8  6/8  
 *
 * Set: keys autorepeat when pressed for more than 0.5 seconds.
 *
 *
 * CSI    ?      8    l
 * 9/11   3/15   3/8  6/12   
 *
 * Reset: keys do not autorepeat.
 *
 * Notes on DECARM
 *
 * The following keys on the VT keyboard do not repeat:
 *   F1 (Hold)
 *   F2 (Print)
 *   F3 (Set-Up)
 *   F4 (Session)
 *   F5 (Break) 
 *   Compose Character
 *   Shift
 *   Alt Function
 *   Return
 *   Lock
 *   Ctrl
 *   Extend
 *
 * The following keys on the PC keyboard do not repeat:
 *   Alt
 *   Caps Lock
 *   Ctrl
 *   Enter
 *   Num Lock
 *   AltGr
 *   Pause
 *   Print Screen
 *   Scroll Lock
 *   Shift
 */
var AutoRepeat = new Class().extends(Plugin)
                            .depends("parser");
AutoRepeat.definition = {

  get id()
    "auto_repeat",

  get info()
    <module>
        <name>{_("Auto Repeat")}</name>
        <version>0.1</version>
        <description>{
          _("Enable/disable Auto repeat feature(DECARM) ",
            "with escape seqnence.")
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
    this.reset();
  },

  /** Uninstalls itself.
   *  @param {Broker} broker A broker object.
   */
  "[uninstall]":
  function uninstall(broker) 
  {
    this._mode = null;
  },

  /** Activate auto-repeat feature.
   */
  "[subscribe('sequence/decset/8'), pnp]":
  function activate() 
  { 
    this._mode = true;

    // Auto-repeat Keys (DECARM)
    // enable auto repeat.
    this.sendMessage("command/change-auto-repeat-mode", true);
    coUtils.Debug.reportMessage(
      _("DECSET - DECARM (Auto-repeat Keys) is set."));
  },

  /** Deactivate auto-repeat feature
   */
  "[subscribe('sequence/decrst/8'), pnp]":
  function deactivate() 
  {
    this._mode = false;

    // Auto-repeat Keys (DECARM)
    // enable auto repeat.
    this.sendMessage("command/change-auto-repeat-mode", false);
    coUtils.Debug.reportMessage(
      _("DECRST - DECARM (Auto-repeat Keys) is reset."));
  },

  /** Report mode
   */
  "[subscribe('sequence/decrqm/8'), pnp]":
  function report() 
  {
    var mode = this._mode ? 1: 2,
        message = "?8;" + mode + "$y";

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


}; // class AutoRepeat

/**
 * @fn main
 * @brief Module entry point.
 * @param {Broker} broker The Broker object.
 */
function main(broker) 
{
  new AutoRepeat(broker);
}

// EOF
