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
 * @class ApplicationCursorMode
 *
 * DECCKM - Cursor Keys Mode
 * 
 * This control function selects the sequences the arrow keys send. You can
 * use the four arrow keys to move the cursor through the current page or to
 * send special application commands.
 * 
 * Default: Cursor
 *
 * Format
 *
 * CSI   ?     1     h
 * 9/11  3/15  3/1   6/8
 *
 * Set: application sequences.
 *
 *
 * CSI   ?     1     l
 * 9/11  3/15  3/1   6/12
 *
 * Reset: cursor sequences.
 *
 * Description
 * 
 * If the DECCKM function is set, then the arrow keys send application 
 * sequences to the host.
 * 
 * If the DECCKM function is reset, then the arrow keys send ANSI cursor 
 * sequences to the host.
 */
var ApplicationCursorMode = new Class().extends(Plugin);
ApplicationCursorMode.definition = {

  get id()
    "application_cursor",

  get info()
    <module>
        <name>{_("Application Cursor Mode")}</name>
        <version>0.1</version>
        <description>{
          _("Switch between Normal mode/Application Cursor mode.")
        }</description>
    </module>,

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


  /** Activate auto-repeat feature.
   */
  "[subscribe('sequence/decset/1'), pnp]":
  function activate() 
  { 
    this._mode = true;

    // enable application cursor mode.
    this.sendMessage("command/change-cursor-mode", "normal");
  },

  /** Deactivate auto-repeat feature
   */
  "[subscribe('sequence/decrst/1'), pnp]":
  function deactivate() 
  {
    this._mode = false;

    // disable application cursor mode.
    this.sendMessage("command/change-cursor-mode", "application");
  },

  /** Report mode
   */
  "[subscribe('sequence/decrqm/1'), pnp]":
  function report() 
  {
    var mode = this._mode ? 1: 2,
        message = "?1;" + mode + "$y";

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

}; // class ApplicationCursorMode

/**
 * @fn main
 * @brief Module entry point.
 * @param {Broker} broker The Broker object.
 */
function main(broker) 
{
  new ApplicationCursorMode(broker);
}

// EOF
