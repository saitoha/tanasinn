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
 * @class SaveCursorMode
 *
 * XT_SAVECURSOR - save cursor mode
 * 
 * Default: off
 *
 * Format
 *
 * CSI   ?     1     0     4     8     h
 * 9/11  3/15  3/1   3/0   3/4   3/8   6/8
 *
 * Set: save cursor state.
 *
 *
 * CSI   ?     1     0     4     8     l
 * 9/11  3/15  3/1   3/0   3/4   3/8   6/12
 *
 * Reset: restore cursor state.
 *
 */
var SaveCursorMode = new Class().extends(Plugin)
                                .depends("screen");
SaveCursorMode.definition = {

  id: "save_cursor_mode",

  getInfo: function getInfo()
  {
    return {
      name: _("Save Cursor"),
      version: "0.1",
      description: _("Save / Restore cursor state.")
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
    this._screen = this.dependency["screen"];
  },

  /** Uninstalls itself.
   *  @param {Broker} broker A broker object.
   */
  "[uninstall]":
  function uninstall(broker) 
  {
    this._mode = null;
    this._screen = null;
  },

  /** Save cursor as in DECSC 
   *  (unless disabled by the titleinhibit resource)
   */
  "[subscribe('sequence/decset/1048'), pnp]":
  function activate() 
  { 
    this._mode = true;

    this.sendMessage("command/backup-cursor-state");
  },

  /** Restore cursor as in DECRC 
   *  (unless disabled by the titleinhibit resource)
   */
  "[subscribe('sequence/decrst/1048'), pnp]":
  function deactivate() 
  {
    this._mode = false;
   
    this.sendMessage("command/restore-cursor-state");
  },

  /** Report mode
   */
  "[subscribe('sequence/decrqm/1048'), pnp]":
  function report() 
  {
    var mode = this._mode ? 1: 2,
        message = "?1048;" + mode + "$y";

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


}; // class SaveCursorMode

/**
 * @fn main
 * @brief Module entry point.
 * @param {Broker} broker The Broker object.
 */
function main(broker) 
{
  new SaveCursorMode(broker);
}

// EOF
