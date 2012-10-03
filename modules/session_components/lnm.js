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
 * @class NewLineMode
 *
 * LNM - Line Feed/New Line Mode
 *
 * @ref http://vt100.net/docs/vt510-rm/LNM
 *
 * This control function selects the characters sent to the host when you 
 * press the Return key. LNM also controls how the terminal interprets line 
 * feed (LF), form feed (FF), and vertical tab (VT) characters.
 *
 * Note
 *
 * For compatibility with Digital's software, you should keep LNM reset 
 * (line feed).
 *
 *
 * Default: Line feed
 *
 * Format
 *
 * CSI   2     0     h
 * 9/11  3/2   3/0   6/8
 * Set: new line.
 *
 * CSI   2     0     l
 * 9/11  3/2   3/0   6/12
 * Reset: line feed.
 *
 * Description
 *
 * If LNM is set, then the cursor moves to the first column on the next 
 * line when the terminal receives an LF, FF, or VT character. When you 
 * press Return, the terminal sends both a carriage return (CR) and line 
 * feed (LF).
 *
 * If LNM is reset, then the cursor moves to the current column on the next 
 * line when the terminal receives an LF, FF, or VT character. When you 
 * press Return, the terminal sends only a carriage return (CR) character.
 *
 * Note on LNM
 *
 * When the auxiliary keypad is in keypad numeric mode (DECKPNM), the Enter 
 * key sends the same characters as the Return key.
 */
var NewLineMode = new Class().extends(Plugin);
NewLineMode.definition = {

  id: "new_line_mode",

  getInfo: function getInfo()
  {
    return {
      name: _("LNM Switch"),
      version: "0.1",
      description: _("Switch Line Feed/New Line mode(NLM) with escape seqnence.")
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

  /** set new line.
   */
  "[subscribe('sequence/sm/20'), pnp]":
  function activate() 
  { 
    this._mode = true;

    // enable insert mode.
    this.sendMessage("set/newline-mode", true);
  },

  /** set line feed.
   */
  "[subscribe('sequence/rm/20'), pnp]":
  function deactivate() 
  {
    this._mode = false;

    // disable insert mode.
    this.sendMessage("set/newline-mode", false);
  },

  /** Report mode
   */
  "[subscribe('sequence/rqm/20'), pnp]":
  function report() 
  {
    var mode = this._mode ? 1: 2,
        message = "20;" + mode + "$y";

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
    var data;

    data = context[this.id];
    if (data) {
      this._mode = data.mode;
    } else {
      coUtils.Debug.reportWarning(
        _("Cannot restore last state of renderer: data not found."));
    }
  },

}; // class NewLineMode

/**
 * @fn main
 * @brief Module entry point.
 * @param {Broker} broker The Broker object.
 */
function main(broker) 
{
  new NewLineMode(broker);
}

// EOF
