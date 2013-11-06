/* -*- Mode: JAVASCRIPT; tab-width: 2; indent-tabs-mode: nil; c-basic-offset: 2 -*-
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
 * Portions created by the Initial Developer are Copyright (C) 2010 - 2013
 * the Initial Developer. All Rights Reserved.
 *
 * ***** END LICENSE BLOCK ***** */

"use strict";

/**
 * @class InputMacro
 */
var InputMacro = new Class().extends(Plugin);
InputMacro.definition = {

  id: "input_macro",

  /** plugin information */
  getInfo: function getInfo()
  {
    return {
      name: _("Input Macro"),
      version: "0.1",
      description: _("Record/Play keyboard input macro.")
    };
  },

  "[persistable] enabled_when_startup": true,

  _macros: null,
  _macro_buffer: null,
  _current_macro_name: null,

  /** Installs itself.
   *  @param {InstallContext} context A InstallContext object.
   */
  "[install]":
  function install(context)
  {
  },

  /** Uninstalls itself.
   */
  "[uninstall]":
  function uninstall()
  {
    this._macros = null;
    this._macro_buffer = null;
    this._current_macro_name = null;
  },

  "[command('recordinputmacro', []), _('Record input macro with given name.'), pnp]":
  function recordInputMacro(name)
  {
    if (!name) {
      throw coUtils.Debug.Exception(_("Given argument is invalid."));
    }

    if (null === this._macros) {
      // Create the macro DB.
      this._macros = {};
    }

    // Create a macro buffer.
    this._macro_buffer = [];
    this._current_macro_name = name;
    return {
      success: true,
      message: coUtils.Text.format(_("Recording macro '%s'."), name),
    }
  },

  "[command('playinputmacro', []), _('Play input macro.'), pnp]":
  function playInputMacro(name)
  {
    var buffer = this._macros[name];
        i,
        complete,
        thread;

    if (!buffer) {
      throw coUtils.Debug.Exception(
        _("The macro specified by given name is not found."));
    }

    thread = Components.classes["@mozilla.org/thread-manager;1"]
      .getService(Components.interfaces.nsIThreadManager)
      .currentThread;

    for (i = 0; i < buffer.length; ++i) {

      complete = false;

      coUtils.Timer.setTimeout(
        function()
        {
          complete = true;
        }, 200);

      do {
        thread.processNextEvent(true);
      } while (!complete);

      this.sendMessage("command/input-with-no-remapping", buffer[i]);
    }

    return {
      success: true,
      message: _("Done."),
    }
  },

  "[command('completeinputmacro', []), _('Stop to recording current macro.'), pnp]":
  function completeInputMacro()
  {
    var buffer = this._macro_buffer,
        name = this._current_macro_name;

    this._macro_buffer = null;
    this._current_macro_name = null;
    this._macros[name] = buffer;
    return {
      success: true,
      message: coUtils.Text.format(_("Macro '%s' is defined."), name),
    }
  },

  "[subscribe('command/input-with-no-remapping'), pnp] _":
  function _inputWithNoMapping(packed_code)
  {
    if (null !== this._macro_buffer) {
      this._macro_buffer.push(packed_code);
    }
  },

  /** test */
  "[test]":
  function()
  {
    var enabled = this.enabled;

    try {
      this.enabled = false;
      this.enabled = true;
      this.enabled = false;
    } finally {
      this.enabled = enabled;
    }
  },

}; // InputMacro



/**
 * @fn main
 * @brief Module entry point.
 * @param {Broker} broker The Broker object.
 */
function main(broker)
{
  new InputMacro(broker);
}

// EOF
