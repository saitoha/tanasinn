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
 * @class TextCursorEnableMode
 *
 * DECTCEM — Text Cursor Enable Mode
 *
 * This control function makes the cursor visible or invisible.
 *
 * Default: Visible
 *
 * Format
 *
 * CSI   ?     2     5     h
 * 9/11  3/15  3/2   3/5   6/8
 *
 * Set: makes the cursor visible.
 *
 *
 * CSI   ?     2     5     l
 * 9/11  3/15  3/2   3/5   6/12
 *
 * Reset: makes the cursor invisible.
 */
var TextCursorEnableMode = new Class().extends(Plugin)
                                  .depends("cursorstate");
TextCursorEnableMode.definition = {

  id: "text_cursor_enable_mode",

  getInfo: function getInfo()
  {
    return {
      name: _("Text Cursor Enable Mode (DECTCEM)"),
      version: "0.1",
      description: _("Switch the cursor's show/hide status.")
    };
  },

  "[persistable] enabled_when_startup": true,
  "[persistable] default_value": true,

  _mode: null,
  _cursor: null,

  /** Installs itself. 
   *  @param {InstallContext} context A InstallContext object.
   */
  "[install]":
  function install(context) 
  {
    this._mode = this.default_value;
    this._cursor = context["cursorstate"];
  },

  /** Uninstalls itself.
   */
  "[uninstall]":
  function uninstall() 
  {
    this._mode = null;
    this._cursor = null;
  },

  /** Show Cursor (DECTCEM)
   */
  "[subscribe('sequence/decset/25'), pnp]":
  function activate() 
  { 
    var cursor = this._cursor;

    this._mode = true;

    this.sendMessage("event/cursor-visibility-changed", true);
  },

  /** Hide Cursor (DECTCEM)
   */
  "[subscribe('sequence/decrst/25'), pnp]":
  function deactivate() 
  {
    var cursor = this._cursor;

    this._mode = false;

    this.sendMessage("event/cursor-visibility-changed", false);
  },

  /** Report mode
   */
  "[subscribe('sequence/decrqm/25'), pnp]":
  function report() 
  {
    var mode = this._mode ? 1: 2,
        message = "?25;" + mode + "$y";

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

}; // class TextCursorEnableMode

/**
 * @fn main
 * @brief Module entry point.
 * @param {Broker} broker The Broker object.
 */
function main(broker) 
{
  new TextCursorEnableMode(broker);
}

// EOF
