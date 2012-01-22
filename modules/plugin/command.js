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
 */
let CommandProvider = new Class().extends(Component);
CommandProvider.definition = {

  get id()
    "commandprovider",

  "[subscribe('@event/broker-started'), enabled]":
  function onLoad(session)
  {
    this.complete.enabled = true;
    this.evaluate.enabled = true;
    session.notify(<>initialized/{this.id}</>, this);
  },

  _getCommand: function _getCommand(command_name)
  {
    let broker = this._broker;
    let commands = broker.notify("get/commands");
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
      coUtils.Debug.reportWarning(
        _("Ambiguous command name detected: %s"), command_name);
      return null;
    }
    return filtered_command.shift();
  },
  
  "[subscribe('command/complete-commandline')]":
  function complete(completion_info) 
  {
    let {source, listener} = completion_info;
    let pattern = /^\s*([0-9]*)(\w*)(\s*)/y;
    let match = pattern.exec(source);
    let [, repeat, command_name, blank] = match;
    if (blank) {
      let command = this._getCommand(command_name);
      if (command) {
        let text = source.substr(pattern.lastIndex);
        command.complete(text, listener);
      }
    } else {
      let broker = this._broker;
      let completer = broker.uniget("get/completer/command");
      completer.startSearch(command_name, listener);
    }
  },
  
  "[subscribe('command/eval-commandline')]":
  function evaluate(source) 
  {
    let broker = this._broker;
    let pattern = /^\s*([0-9]*)(\w+)(\s*)/y;
    let match = pattern.exec(source);
    if (null === match) {
      broker.notify(
        "command/report-status-message", 
        _("Failed to parse given commandline code."));
      return;
    }
    let [, repeat, command_name, /* blank */] = match;
    let command = this._getCommand(command_name);
    if (!command) {
      broker.notify(
        "command/report-status-message", 
        coUtils.Text.format(
          _("Command '%s' is not found."), command_name));
      return; // unknown command;
    }

    try {
      let text = source.substr(pattern.lastIndex);
      repeat = Number(repeat) || 1;
      for (let i = 0; i < repeat; ++i) {
        let result = command.evaluate(text);
        if (result) {
          broker.notify(
            "command/report-status-message", result.message);
        }
      }
    } catch (e) {
      broker.notify(
        "command/report-status-message", 
        coUtils.Text.format(
          _("Failed to evaluate given commandline code: %s"), e));
      return;
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

  "[command('javascript/js', ['js']), _('Run a javascript code.'), enabled]":
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
    let pattern = /^\s*([$_a-zA-Z\.\-]+)\.([$_a-zA-Z]+)(=?)/y;
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

/**
 * @class SetGlobalCommand
 *
 */
let SetGlobalCommand = new Class().extends(Component);
SetGlobalCommand.definition = {

  get id()
    "setglobalcommand",

  "[command('setglobal', ['option/global']), _('Set a global option.'), enabled]":
  function evaluate(arguments_string)
  {
    let session = this._broker;
    let desktop = session._broker;
    let modules = desktop.notify("get/module-instances");
    let pattern = /^\s*([$_a-zA-Z\.\-]+)\.([$_a-zA-Z]+)(=?)/y;
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

  "[command('fontfamily/ff', ['font-family']), _('Select terminal font family.'), enabled]":
  function fontfamily(arguments_string)
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
  "[command('decrease'), key('meta -', 'ctrl shift ='), _('Make font size smaller.'), enabled]":
  function decrease()
  {
    let session = this._broker;
    session.notify("command/change-fontsize-by-offset", -1);
    session.notify("command/draw");
  },

  /** Makes font size bigger. */
  "[command('increase'), key('meta shift \\\\+'), _('Make font size bigger.'), enabled]":
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
 * @class GlobalPersistCommand
 */
let GlobalPersistCommand = new Class().extends(Component);
GlobalPersistCommand.definition = {

  get id()
    "persist",

  "[command('globalsave/ss', ['profile/global']), _('Persist current global settings.'), enabled]":
  function persist(arguments_string)
  {
    let session = this._broker;
    let desktop = session._broker;

    let match = arguments_string.match(/^\s*([$_\-@a-zA-Z\.]*)\s*$/);
    if (null === match) {
      return {
        success: false,
        message: _("Failed to parse commandline argument."),
      };
    }
    let [, profile] = match;

    let settings = desktop.uniget("command/get-settings");
    if (!settings) {
      return {
        success: false,
        message: _("Failed to gather settings information."),
      };
    }
    desktop.notify("command/save-settings", {name: profile || undefined, data: settings});
    return {
      success: true,
      message: _("Succeeded."),
    };
  },

  "[command('globalload/ls', ['profile/global']), _('Load a global settings.'), enabled]":
  function load(arguments_string)
  {
    let session = this._broker;
    let desktop = session._broker;

    let match = arguments_string.match(/^\s*([$_\-@a-zA-Z\.]*)\s*$/);
    if (null === match) {
      return {
        success: false,
        message: _("Failed to parse commandline argument."),
      };
    }
    let [, profile] = match;

    desktop.notify("command/load-settings", profile || undefined);
    desktop.notify("command/draw", true);
    return null;
  },

  "[command('globaldelete/ds', ['profile/global']), _('Delete a global settings.'), enabled]":
  function deleteprofile(arguments_string)
  {
    let session = this._broker;
    let desktop = session._broker;

    let match = arguments_string.match(/^\s*([$_\-@a-zA-Z\.]*)\s*$/);
    if (null === match) {
      return {
        success: false,
        message: _("Failed to parse commandline argument."),
      };
    }
    let [, profile] = match;

    desktop.notify("command/delete-settings", profile || undefined);
    return null;
  },
};


/**
 * @class PersistCommand
 */
let PersistCommand = new Class().extends(Component);
PersistCommand.definition = {

  get id()
    "persist",

  "[command('saveprofile/sp', ['profile']), _('Persist current settings.'), enabled]":
  function persist(arguments_string)
  {
    let session = this._broker;

    let match = arguments_string.match(/^\s*([$_\-@a-zA-Z\.]*)\s*$/);
    if (null === match) {
      return {
        success: false,
        message: _("Failed to parse commandline argument."),
      };
    }
    let [, profile] = match;

    let settings = session.uniget("command/get-settings");
    if (!settings) {
      return {
        success: false,
        message: _("Failed to gather settings information."),
      };
    }
    session.notify("command/save-settings", {name: profile || undefined, data: settings});
    return {
      success: true,
      message: _("Succeeded."),
    };
  },

  "[command('loadprofile/lp', ['profile']), _('Load a profile.'), enabled]":
  function load(arguments_string)
  {
    let session = this._broker;

    let match = arguments_string.match(/^\s*([$_\-@a-zA-Z\.]*)\s*$/);
    if (null === match) {
      return {
        success: false,
        message: _("Failed to parse commandline argument."),
      };
    }
    let [, profile] = match;

    session.notify("command/load-settings", profile || undefined);
    session.notify("command/draw", true);
    return null;
  },

  "[command('deleteprofile/dp', ['profile']), _('Delete a profile.'), enabled]":
  function deleteprofile(arguments_string)
  {
    let session = this._broker;

    let match = arguments_string.match(/^\s*([$_\-@a-zA-Z\.]*)\s*$/);
    if (null === match) {
      return {
        success: false,
        message: _("Failed to parse commandline argument."),
      };
    }
    let [, profile] = match;

    session.notify("command/delete-settings", profile || undefined);
    return null;
  },
};


/**
 * @class LocalizeCommand
 */
let LocalizeCommand = new Class().extends(Component);
LocalizeCommand.definition = {

  get id()
    "localize",

  "[command('localize', ['localize']), _('Edit localization resource.'), enabled]":
  function evaluate(arguments_string)
  {
    let session = this._broker;
    let desktop = session.parent;
    let pattern = /^\s*([a-zA-Z-]+)\s+"((?:[^"])*)"\s+"(.+)"\s*$/;
    let match = arguments_string.match(pattern);
    if (!match) {
      return {
        success: true,
        message: _("Failed to parse given commandline code."),
      };
    }
    let [, language, key, value] = match;
    key = key.replace(/\\(?!\\)/g, "\\");
    value = value.replace(/\\(?!\\)/g, "\\");
    let dict = coUtils.Localize.getDictionary(language);
    dict[key] = value;
    coUtils.Localize.setDictionary(language, dict);
    return {
      success: true,
      message: _("Succeeded."),
    };
  },
};

/**
 * @class DeployCommands
 */
let DeployCommands = new Class().extends(Component);
DeployCommands.definition = {

  get id()
    "deploy",

  _impl: function _impl(arguments_string, is_enable) 
  {
    let session = this._broker;
    let match = arguments_string.match(/^(\s*)([$_\-@a-zA-Z\.]+)(\s*)$/);
    if (null === match) {
      return {
        success: false,
        message: _("Failed to parse commandline argument."),
      };
    }
    let [, space, name, next] = match;
    let modules = session.notify("get/module-instances");
    modules = modules.filter(function(module) module.id == name);
    if (0 == modules.length) {
      return {
        success: false,
        message: _("Cannot enabled the module specified by given argument."),
      };
    }
    modules.forEach(function(module) {
      try {
        module.enabled = is_enable;
      } catch(e) {
        coUtils.Debug.reportError(e); 
      }
    });
    return {
      success: true,
      message: _("Succeeded."),
    };
  },

  "[command('disable', ['plugin/enabled']), _('Disable a plugin.'), enabled]":
  function disable(arguments_string)
  {
    return this._impl(arguments_string, /* is_enable */ false);
  },

  "[command('enable', ['plugin/disabled']), _('Enable a plugin.'), enabled]":
  function enable(arguments_string)
  {
    return this._impl(arguments_string, /* is_enable */ true);
  },

};


/**
 * @class CharsetCommands
 */
let CharsetCommands = new Class().extends(Component);
CharsetCommands.definition = {

  get id()
    "charset",

  _impl: function _impl(arguments_string, is_encoder) 
  {
    let session = this._broker;
    let modules = session.notify(
      is_encoder ? "get/encoders": "get/decoders");
    let name = arguments_string.replace(/^\s+|\s+$/g, "");
    modules = modules.filter(function(module) module.charset == name);
    if (1 != modules.length) {
      return {
        success: false,
        message: _("Cannot enabled the module specified by given argument."),
      };
    }
    session.notify(
      is_encoder ? "change/encoder": "change/decoder", 
      name)
    return {
      success: true,
      message: _("Succeeded."),
    };
  },

  "[command('encoder', ['charset/encoders']), _('Select encoder component.'), enabled]":
  function disable(arguments_string)
  {
    return this._impl(arguments_string, /* is_encoder */ true);
  },

  "[command('decoder', ['charset/decoders']), _('Select a decoder component.'), enabled]":
  function enable(arguments_string)
  {
    return this._impl(arguments_string, /* is_encoder */ false);
  },

};


/**
 * @class ManageCommands
 */
/*
let PluginManagementCommands = new Class().extends(Component);
EnableCommand.definition = {

  get id()
    "enable-command",

  "[command('enable', ['modules']), _('enable a plugin.'), enabled]":
  function evaluate(arguments_string)
  {
    let session = this._broker;
    let modules = session.notify("get/module-instances");
    /*
    let desktop = session.parent;
    let pattern = /^\s*([a-zA-Z-]+)\s+"((?:[^"])*)"\s+"(.+)"\s*$/;
    let match = arguments_string.match(pattern);
    if (!match) {
      session.notify(
        "command/report-status-message", 
        _("Failed to parse given commandline code."));
      return;
    }
    let [, language, key, value] = match;
  },
};
*/


/**
 * @class ShortcutCommand
 */
/*
let ShortcutCommand = new Class().extends(Component);
ShortcutCommand.definition = {

  get id()
    "shortcut",

  "[command('shortcut', ['shortcut']), _('Edit shortcut settings.'), enabled]":
  function evaluate(arguments_string)
  {
    let session = this._broker;
    let desktop = session.parent;
    let pattern = /^\s*([a-zA-Z-]+)\s+"((?:[^"])*)"\s+"(.+)"\s*$/;
    let match = arguments_string.match(pattern);
    if (!match) {
      session.notify(
        "command/report-status-message", 
        _("Failed to parse given commandline code."));
      return;
    }
    let [, language, key, value] = match;
    key = key.replace(/\\(?!\\)/g, "\\");
    value = value.replace(/\\(?!\\)/g, "\\");
    let dict = coUtils.Localize.getDictionary(language);
    dict[key] = value;
    coUtils.Localize.setDictionary(language, dict);
  },
};
*/

/**
 * @fn main
 * @brief Module entry point.
 * @param {Desktop} desktop The Desktop object.
 */
function main(desktop)
{
  desktop.subscribe(
    "@initialized/broker", 
    function(session) 
    {
      new CommandProvider(session);
      new JsCommand(session);
//      new GoCommand(session);
      new SetCommand(session);
      new SetGlobalCommand(session);
      new FontCommands(session);
      new ColorCommands(session);
      new PersistCommand(session);
      new GlobalPersistCommand(session);
      new LocalizeCommand(session);
      new DeployCommands(session);
      new CharsetCommands(session);
    });
}


