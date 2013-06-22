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
 * Portions created by the Initial Developer are Copyright (C) 2010 - 2013
 * the Initial Developer. All Rights Reserved.
 *
 * ***** END LICENSE BLOCK ***** */

"use strict";

/**
 * @class CommandProvider
 */
var CommandProvider = new Class().extends(Plugin);
CommandProvider.definition = {

  /** Component ID */ 
  id: "commandprovider",

  /** plugin information */
  getInfo: function getInfo()
  {
    return {
      name: _("Command Provider"),
      version: "0.1",
      description: _("Provides command lookup/execution service.")
    };
  },

  "[persistable] enabled_when_startup": true,

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

  _getCommand: function _getCommand(command_name)
  {
    var commands = this.sendMessage("get/commands"),
        filtered_command = commands.filter(
          function filterProc(command)
          {
            return 0 === command.name.replace(/[\[\]]/g, "")
              .indexOf(command_name);
          }),
        tophit;

    if (0 === filtered_command.length) {
      return null;
    }

    if (filtered_command.length > 1) {
      tophit = filtered_command.shift();
      if (tophit.name.length === command_name.length) {
        return tophit;
      }
      coUtils.Debug.reportWarning(
        _("Ambiguous command name detected: %s"), command_name);
      return null;
    }
    return filtered_command.shift();
  },

  "[subscribe('command/complete-commandline'), pnp]":
  function complete(completion_info)
  {
    var pattern = /^\s*([0-9]*)(\w*)(\s*)/y,
        match = pattern.exec(completion_info.source),
        repeat,
        command_name,
        blank,
        command,
        text;

    repeat = match[1];
    command_name = match[2];
    blank = match[3];

    if (blank) {
      command = this._getCommand(command_name);
      if (command) {
        text = completion_info.source.substr(pattern.lastIndex);
        command.complete(text);
      }
    } else {
      this.sendMessage("command/query-completion/command", completion_info);
    }
  },

  "[subscribe('command/eval-commandline'), pnp]":
  function evaluate(source)
  {
    var pattern = /^\s*([0-9]*)(\w+)(\s*)/y,
        match = pattern.exec(source),
        repeat,
        command_name,
        command,
        text,
        i,
        result;

    if (null === match) {
      this.sendMessage(
        "command/report-status-message",
        _("Failed to parse given commandline code."));
      return;
    }

    [, repeat, command_name, /* blank */] = match;

    command = this._getCommand(command_name);

    if (!command) {
      this.sendMessage(
        "command/report-status-message",
        coUtils.Text.format(
          _("Command '%s' is not found."), command_name));
      return; // unknown command;
    }

    try {
      text = source.substr(pattern.lastIndex);
      repeat = Number(repeat) || 1;
      for (i = 0; i < repeat; ++i) {
        result = command.evaluate(text);
        if (result) {
          this.sendMessage(
            "command/report-status-message", result.message);
        }
      }
    } catch (e) {
      this.sendMessage(
        "command/report-status-message",
        coUtils.Text.format(
          _("Failed to evaluate given commandline code: %s"), e));
      return;
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


};

/**
 * @fn main
 * @brief Module entry point.
 * @param {Broker} broker The Broker object.
 */
function main(broker)
{
  new CommandProvider(broker);
}

// EOF
