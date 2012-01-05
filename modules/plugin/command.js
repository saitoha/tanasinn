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
 * The Original Code is coTerminal
 *
 * The Initial Developer of the Original Code is
 * Hayaki Saito.
 * Portions created by the Initial Developer are Copyright (C) 2010 - 2011
 * the Initial Developer. All Rights Reserved.
 *
 * ***** END LICENSE BLOCK ***** */

/**
 * @class CommandProvider
 *
 */
let CommandProvider = new Class().extends(Component);
CommandProvider.definition = {

  get id()
    "commandprovider",

  "[subscribe('@event/session-started'), enabled]":
  function onLoad(session)
  {
    this.complete.enabled = true;
    this.evaluate.enabled = true;
    session.notify(<>initialized/{this.id}</>, this);
  },

  _getCommand: function _getCommand(command_name)
  {
    let session = this._broker;
    let commands = session.notify("get/commands");
    let filtered_command = commands.filter(function(command) {
      return 0 == command.name.replace(/[\[\]]/g, "")
        .indexOf(command_name);
    });
    if (filtered_command.length == 0) {
      return null;
    }
    if (filtered_command.length > 1) {
      throw coUtils.Debug.Exception(
        _("Ambiguous command name detected: %s"), command_name);
    }
    return filtered_command.shift();
  },
  
  "[subscribe('command/complete')]":
  function complete(completion_info) 
  {
    let {source, listener} = completion_info;
    let pattern = /^\s*(\w+)(\s+)/y;
    let match = pattern.exec(source);
    if (null === match) {
      let session = this._broker;
      let completer = session.uniget("get/completer/command");
      completer.startSearch(source, listener);
    } else {
      let [, command_name, /* blank */] = match;
      let command = this._getCommand(command_name);
      let text = source.substr(pattern.lastIndex);
      command.complete(text, listener);
    }
  },
  
  "[subscribe('command/eval-commandline')]":
  function evaluate(source) 
  {
    try {
    let pattern = /^\s*(\w+)(\s*)/y;
    let match = pattern.exec(source);
    if (null === match) {
      return (null)
    }
    let [, command_name, /* blank */] = match;
    let command = this._getCommand(command_name);
    if (!command) {
      return null; // unknown command;
    }
    let text = source.substr(pattern.lastIndex);
    return command.evaluate(text);
    } catch (e) {
      alert(e)
      return null;
    }
  },
};

/**
 *
 */
let JsCommand = new Class().extends(Component);
JsCommand.definition = {

  get id()
    "jscommand",

  "[command('js', ['js']), _('Run a javascript code.'), enabled]":
  function evaluate(arguments_string)
  {
    let session = this._broker;
    try {
      let result = new Function(
        "with (arguments[0]) { return (" + arguments_string + ");}"
      ) (session.window);
    } catch (e) {
      session.notify("command/report-status-message", e);
    }
  },
};

let SetCommand = new Class().extends(Component);
SetCommand.definition = {

  get id()
    "setcommand",

  "[command('set', ['option']), _('Set an option.'), enabled]":
  function evaluate(arguments_string)
  {
    let session = this._broker;
    let modules = session.notify("get/module-instances");
    let pattern = /^\s*([$_a-zA-Z\.]+)\.([$_a-zA-Z]+)(=?)/y;
    let match = arguments_string.match(pattern);
    if (null === match) {
      session.notify(
        "command/report-status-message",
        _("Ill-formed option name is detected. ",
          "valid format is such as '<component name>.<property name>'."));
      return;
    }
    let [all, component_name, property, equal] = match;
    if (!component_name || !property) {
      session.notify(
        "command/report-status-message",
        _("Ill-formed option name is detected. ",
          "valid format is such as '<component name>.<property name>'."));
      return;
    }
    let [module] = modules.filter(function(module) {
      return module.id == component_name;
    });
    if (!module) {
      session.notify(
        "command/report-status-message",
        _("Module %s is not found."), component_name);
      return;
    }  
    if (!equal) {
      module[property] = true;
    } else {
      let code = arguments_string.substr(all.length); 
      try {
        let result = new Function(
          "with (arguments[0]) { return (" + code + ");}"
        ) (session.window);
        module[property] = result; 
      } catch (e) {
        coUtils.Debug.reportError(e);
      }
    }
  },

};

let GoCommand = new Class().extends(Component);
GoCommand.definition = {

  get id()
    "gocommand",

  "[command('go', ['history']), _('Open an URL in current window.'), enabled]":
  function evaluate(arguments_string)
  {
    let session = this._broker;
    let content = session.window._content;
    if (content) {
      content.location.href = arguments_string;
      session.notify("command/focus");
      session.notify("command/blur");
      session.notify("event/lost-focus");
    }
  },
};

/**
 * @fn main
 * @brief Module entry point.
 * @param {Process} process The Process object.
 */
function main(process)
{
  process.subscribe(
    "initialized/session", 
    function(session) 
    {
      new CommandProvider(session);
      new JsCommand(session);
      new GoCommand(session);
      new SetCommand(session);
    });
}


