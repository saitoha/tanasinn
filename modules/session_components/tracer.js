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
 *
 * @class Tracer
 *
 */
var Tracer = new Class().extends(Plugin);
Tracer.definition = {

  id: "tracer",

  getInfo: function getInfo()
  {
    return {
      name: _("Tracer"),
      version: "0.1",
      description: _("Intercept I/O events and send its information ",
                     "to Debugger plugin")
    };
  },

  "[persistable] enabled_when_startup": true,

  _mode: "vt100",

  /** Installs itself.
   *  @param {InstallContext} context A InstallContext object.
   */
  "[install]":
  function install(context)
  {
  },

  /** Uninstalls itself
   */
  "[uninstall]":
  function uninstall()
  {
  },

  "[subscribe('command/change-emulation-mode'), pnp]":
  function onChangeMode(mode)
  {
    if (this.onBeforeInput.enabled) {
      this.disable();
      this._mode = mode;
      this.enable();
    } else {
      this._mode = mode;
    }
  },

  /** enable tracing */
  "[subscribe('command/debugger-trace-on'), pnp]":
  function enable()
  {
    var sequences = this.sendMessage("get/sequences/" + this._mode),
        i = 0,
        information;

    this.onBeforeInput.enabled = true;

    // get sequence handlers

    // backup them
    this._backup_sequences = sequences;

    this.sendMessage("command/reset-sequences");

    for (; i < sequences.length; ++i) {
      information = sequences[i];
      this._registerControlHandler(information);
    }
  },

  /** disable tracing */
  "[subscribe('command/debugger-trace-off'), pnp]":
  function disable()
  {
    var sequences = this.sendMessage("get/sequences/" + this._mode),
        i = 0,
        information;

    this.onBeforeInput.enabled = false;

    this.sendMessage("command/reset-sequences");

    for (; i < sequences.length; ++i) {
      information = sequences[i];
      this.sendMessage("command/add-sequence", information);
    }
  },

  /** called when every key input event is occured */
  "[subscribe('command/send-to-tty')]":
  function onBeforeInput(message)
  {
    var info = {
      type: coUtils.Constant.TRACE_INPUT,
      name: undefined,
      value: [message],
    };
    this.sendMessage(
      "command/debugger-trace-sequence",
      [info, undefined]);
  },

  _registerControlHandler:
  function _registerControlHandler(information)
  {
    var handler = information.handler,
        delegate;

    try {

      delegate = function()
      {
        handler.apply(this, arguments);

        return {
          type: coUtils.Constant.TRACE_CONTROL,
          name: handler.name,
          value: Array.slice(arguments),
        };
      };

      this.sendMessage(
        "command/add-sequence",
        {
          expression: information.expression,
          handler: delegate,
          context: information.context,
        });

    } catch (e) {
      coUtils.Debug.reportError(e);
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


}; // class Tracer

/**
 * @fn main
 * @brief Module entry point.
 * @param {Broker} broker The Broker object.
 */
function main(broker)
{
  new Tracer(broker);
}

// EOF
