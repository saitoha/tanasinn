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
 *  @class FocusEvent
 */
var FocusEvent = new Class().extends(Plugin);
FocusEvent.definition = {

  id: "focus_event",

  getInfo: function getInfo()
  {
    return {
      name: _("Focus Event"),
      version: "0.1",
      description: _("Send focus/blur events.")
    };
  },

  "[persistable] enabled_when_startup": true,

  _focus_mode: false,

  /** Installs itself. */
  "[install]":
  function install(broker) 
  {
  },

  /** Uninstalls itself. */
  "[uninstall]":
  function uninstall(broker) 
  {
  },

  "[subscribe('command/backup'), pnp]": 
  function backup(context) 
  {
    context[this.id] = {
      focus_mode: this._focus_mode,
    }; 
  },

  "[subscribe('command/restore'), pnp]": 
  function restore(context) 
  {
    var data = context[this.id];

    if (data) {
      this._focus_mode = data.focus_mode;
    }
  },
  
  /** Fired at the focus reporting mode is changed. */
  "[subscribe('event/focus-reporting-mode-changed'), pnp]": 
  function onFocusReportingModeChanged(mode) 
  {
    this._focus_mode = mode;
  },

  "[subscribe('event/got-focus'), pnp]":
  function onGotFocus()
  {
    this.onLostFocus.enabled = true;
    this.onGotFocus.enabled = false;

    if (this._focus_mode) {
      this.sendMessage("command/send-sequence/csi", "I");
    }
  },

  "[subscribe('event/lost-focus'), pnp]":
  function onLostFocus()
  {
    this.onLostFocus.enabled = false;
    this.onGotFocus.enabled = true;

    if (this._focus_mode) {
      this.sendMessage("command/send-sequence/csi", "O");
    }
  },

}; // class FocusEvent


/**
 * @fn main
 * @brief Module entry point.
 * @param {Broker} broker The Broker object.
 */
function main(broker) 
{
  new FocusEvent(broker);
}

// EOF
