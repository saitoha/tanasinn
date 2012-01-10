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
      let tophit = filtered_command.shift();
      if (tophit.name.length == command_name.length) {
        return tophit;
      }
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
    let pattern = /^\s*(\w+)(\s*)/y;
    let match = pattern.exec(source);
    if (null === match) {
      let session = this._broker;
      session.notify(
        "command/report-status-message", 
        _("Fail to parse given commandline code."));
      return null
    }
    let [, command_name, /* blank */] = match;
    let command = this._getCommand(command_name);
    if (!command) {
      let session = this._broker;
      session.notify(
        "command/report-status-message", 
        coUtils.Text.format(
          _("Command '%s' is not found."), command_name));
      return null; // unknown command;
    }

    try {
      let text = source.substr(pattern.lastIndex);
      return command.evaluate(text);
    } catch (e) {
      let session = this._broker;
      session.notify(
        "command/report-status-message", 
        coUtils.Text.format(
          _("Fail to evaluate given commandline code: %s"), e));
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
 * @class FontCommands
 */
let FontCommands = new Class().extends(Component);
FontCommands.definition = {

  get id()
    "fontcommands",

  "[command('fontsize/fsize', ['fontsize']), _('Change terminal font size.'), enabled]":
  function fontsize(arguments_string)
  {
    let session = this._broker;
    let pattern = /^\s*([0-9]+)\s*$/;
    let match = arguments_string.match(pattern);
    if (null === match) {
      let session = this._broker;
      session.notify(
        "command/report-status-message", 
        _("Ill-formed arguments: %s."), 
        arguments_string);
      return false;
    }
    let [, font_size] = match;
    session.notify("set/font-size", font_size);
    session.notify("command/draw", true);
    return true;
  },

  "[command('fontsel', ['font']), _('Select terminal font.'), enabled]":
  function fontsel(arguments_string)
  {
    let session = this._broker;
    let pattern = /^\s*(.+)\s*$/;
    let match = arguments_string.match(pattern);
    if (null === match) {
      let session = this._broker;
      session.notify(
        "command/report-status-message", 
        _("Ill-formed arguments: %s."), 
        arguments_string);
      return false;
    }
    let [, font_family] = match;
    session.notify("set/font-family", font_family);
    session.notify("command/draw", true);
    return true;
  },

  /** Makes font size smaller. */
  "[command('decrement/df'), key('meta -', 'ctrl shift ='), _('Make font size smaller.'), enabled]":
  function decrease()
  {
    let session = this._broker;
    session.notify("command/change-fontsize-by-offset", -1);
    session.notify("command/draw");
  },

  /** Makes font size bigger. */
  "[command('inc[lement]/if'), key('meta shift \\\\+'), _('Make font size bigger.'), enabled]":
  function increase()
  {
    let session = this._broker;
    session.notify("command/change-fontsize-by-offset", +1);
    session.notify("command/draw");
  },

};

/**
 * @class ColorCommands
 */
let ColorCommands = new Class().extends(Component);
ColorCommands.definition = {

  get id()
    "colorcommands",

  _renderer: null,

  "[subscribe('@initialized/renderer'), enabled]":
  function onRendererInitialized(renderer)
  {
    this._renderer = renderer;
  },

  "[command('fgcolor', ['color-number/fg']), _('Select terminal color.'), enabled]":
  function fgcolor(arguments_string)
  {
    let session = this._broker;
    let pattern = /\s*([0-9]+)\s+([a-zA-Z]+|#[0-9a-fA-F]+)/;
    let match = arguments_string.match(pattern);
    if (null === match) {
      let session = this._broker;
      session.notify(
        "command/report-status-message", 
        _("Ill-formed arguments: %s."), 
        arguments_string);
      return false;
    }
    let [, number, color] = match;
    let renderer = this._renderer;
    renderer.normal_color[number] = color;
    session.notify("command/draw", /* redraw */true);
    return true;
  },

  "[command('bgcolor', ['color-number/bg']), _('Select terminal color.'), enabled]":
  function bgcolor(arguments_string)
  {
    let session = this._broker;
    let pattern = /\s*([0-9]+)\s+([a-zA-Z]+|#[0-9a-fA-F]+)/;
    let match = arguments_string.match(pattern);
    if (null === match) {
      session.notify(
        "command/report-status-message", 
        _("Ill-formed arguments: %s."), 
        arguments_string);
      return false;
    }
    let [, number, color] = match;
    let renderer = this._renderer;
    renderer.background_color[number] = color;
    session.notify("command/draw", /* redraw */true);
    return true;
  },
};

/**
 * @fn main
 * @brief Module entry point.
 * @param {Desktop} desktop The Desktop object.
 */
function main(desktop)
{
  desktop.subscribe(
    "initialized/session", 
    function(session) 
    {
      new CommandProvider(session);
      new JsCommand(session);
      new GoCommand(session);
      new SetCommand(session);
      new FontCommands(session);
      new ColorCommands(session);
    });
}


