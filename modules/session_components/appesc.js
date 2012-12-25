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
 * @class ApplicationEscape
 *
 * Application Escape Mode (MinTTY)
 *
 * There are two settings controlling the keycode sent by the Esc key.
 *
 * The first controls application escape key mode, where the escape key
 * sends a keycode that allows applications such as vim to tell it apart
 * from the escape character appearing at the start of many other keycodes,
 * without resorting to a timeout mechanism. 
 *
 * +---------------+---------------+---------+
 * |sequence       |mode           |keycode  |
 * |---------------+---------------+---------|
 * |^[[?7727l      |normal         |^[ or ^\ |
 * |^[[?7727h      |application    |^[O[     |
 * +---------------+---------------+---------+
 *
 * When application escape key mode is off, the escape key can be be configured
 * to send ^\ instead of the standard ^[. This allows the escape key to be used
 * as one of the special keys in the terminal line settings (as set with the
 * stty utility).
 *
 * +---------------+---------+
 * |sequence       |keycode  |
 * +---------------+---------+
 * |^[[?7728l      |^[       |
 * |^[[?7728h      |^\       |
 * +---------------+---------+
 *
 */
var ApplicationEscape = new Class().extends(Plugin);
ApplicationEscape.definition = {

  id: "appescape",

  getInfo: function getInfo()
  {
    return {
      name: _("Application Escape Mode"),
      version: "0.1",
      description: _("Controll the keycode sent by the Esc key")
    };
  },

  "[persistable] enabled_when_startup": true,
  "[persistable] default_value": true,

  _mode: null,

  /** Installs itself. 
   *  @param {InstallContext} context A InstallContext object.
   */
  "[install]":
  function install(context) 
  {
    this._mode = this.default_value;
    this.reset();
  },

  /** Uninstalls itself.
   */
  "[uninstall]":
  function uninstall() 
  {
    this._mode = null;
  },

  /** Activate auto-wrap feature(DECAWM).
   */
  "[subscribe('sequence/decset/7727'), pnp]":
  function activate() 
  { 
    this._mode = true;

    this.sendMessage("command/change-application-escape", true);
  },

  /** Deactivate auto-wrap feature(DECAWM).
   */
  "[subscribe('sequence/decrst/7727'), pnp]":
  function deactivate() 
  {
    this._mode = false;

    this.sendMessage("command/change-application-escape", false);
  },

  /** Report mode
   */
  "[subscribe('sequence/decrqm/7727'), pnp]":
  function report() 
  {
    var mode = this._mode ? 1: 2,
        message = "?7727;" + mode + "$y";

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
    }
  },


}; // class ApplicationEscape

/**
 * @fn main
 * @brief Module entry point.
 * @param {Broker} broker The Broker object.
 */
function main(broker) 
{
  new ApplicationEscape(broker);
}

// EOF
