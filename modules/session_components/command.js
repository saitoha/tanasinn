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
var CommandProvider = new Class().extends(Component);
CommandProvider.definition = {

  get id()
    "commandprovider",

  "[subscribe('@event/broker-started'), enabled]":
  function onLoad(broker)
  {
    this.complete.enabled = true;
    this.evaluate.enabled = true;
  },

  _getCommand: function _getCommand(command_name)
  {
    var commands, filtered_command, tophit;

    commands = this.sendMessage("get/commands");
    filtered_command = commands.filter(
      function(command) 
      {
        return 0 == command.name.replace(/[\[\]]/g, "")
          .indexOf(command_name);
      });

    if (filtered_command.length == 0) {
      return null;
    }
    if (filtered_command.length > 1) {
      tophit = filtered_command.shift();
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
    var pattern, match, repeat, commnad_name, blank, command, text;

    var {source} = completion_info;

    pattern = /^\s*([0-9]*)(\w*)(\s*)/y;
    match = pattern.exec(source);
    [, repeat, command_name, blank] = match;

    if (blank) {
      command = this._getCommand(command_name);
      if (command) {
        text = source.substr(pattern.lastIndex);
        command.complete(text);
      }
    } else {
      this.sendMessage("command/query-completion/command", completion_info);
    }
  },
  
  "[subscribe('command/eval-commandline')]":
  function evaluate(source) 
  {
    var pattern, match, repeat, command_name, command, text, i, result;

    pattern = /^\s*([0-9]*)(\w+)(\s*)/y;
    match = pattern.exec(source);
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
};

/**
 * @class JsCommand
 */
var JsCommand = new Class().extends(Component);
JsCommand.definition = {

  get id()
    "jscommand",

  "[command('javascript/js', ['js']), _('Run a javascript code.'), enabled]":
  function evaluate(arguments_string)
  {
    var result;

    try {
      result = new Function(
        "with (arguments[0]) { return (" + arguments_string + ");}"
      ) (this._broker.window);
    } catch (e) {
      this.sendMessage("command/report-status-message", e);
    }
  },
};

/**
 * @class SetCommand
 */
var SetCommand = new Class().extends(Component);
SetCommand.definition = {

  get id()
    "setcommand",

  "[command('set', ['option']), _('Set an option.'), enabled]":
  function evaluate(arguments_string)
  {
    var modules, pattern, match, all, component_name, property, equal, candidates,
        module, code, result, broker;

    broker = this._broker;
    modules = this.sendMessage("get/components");
    modules.push(broker);
    pattern = /^\s*([$_a-zA-Z\.\-]+)\.([$_a-zA-Z]+)\s*(=?)\s*/;
    match = arguments_string.match(pattern);
    if (null === match) {
      return {
        success: false,
        message: _("Ill-formed option name is detected. ",
                   "valid format is such as '<component name>.<property name>'."),
      }
    }

    [all, component_name, property, equal] = match;

    if (!component_name || !property) {
      return {
        success: false,
        message: _("Ill-formed option name is detected. ",
                   "valid format is such as '<component name>.<property name>'."),
      };
    }

    candidates = modules.filter(
      function(module) 
      {
        if ("id" in module) {
          return module.id == component_name;
        }
        return false;
      });
    if (0 == candidates.length) {
      return {
        success: false,
        message: coUtils.Text.format(
          _("Module %s is not found."), 
          component_name),
      };
    } 
    module = candidates.shift();
    if (!equal) {
      return {
        success: true,
        message: module[property].toSource(),
      };
    }
    code = arguments_string.substr(all.length); 
    result = new Function(
      "with (arguments[0]) { return (" + code + ");}"
    ) (this._broker.window);
    module[property] = result; 
    return {
      success: true,
      message: coUtils.Text.format(
        _("%s.%s -> %s"), 
        component_name, property, result && result.toSource()),
    };
  },

};

/**
 * @class SetGlobalCommand
 *
 */
var SetGlobalCommand = new Class().extends(Component);
SetGlobalCommand.definition = {

  get id()
    "setglobalcommand",

  "[command('setglobal', ['option/global']), _('Set a global option.'), enabled]":
  function evaluate(arguments_string)
  {
    var broker, desktop, modules, pattern, match, result, code;

    broker = this._broker;
    desktop = broker._broker;
    modules = desktop.notify("get/components");
    pattern = /^\s*([$_a-zA-Z\.\-]+)\.([$_a-zA-Z]+)(=?)/y;
    match = arguments_string.match(pattern);
    if (null === match) {
      return {
        success: false,
        message: _("Ill-formed option name is detected. ",
                   "valid format is such as '<component name>.<property name>'."),
      };
    }
    var [all, component_name, property, equal] = match;
    if (!component_name || !property) {
      return {
        success: false,
        message: _("Ill-formed option name is detected. ",
                   "valid format is such as '<component name>.<property name>'."),
      };
    }
    var [module] = modules.filter(
      function(module) 
      {
        return module.id == component_name;
      });
    if (!module) {
      return {
        success: false,
        message: coUtils.Text.format(_("Module %s is not found."), component_name),
      };
    }  
    if (!equal) {
      return {
        success: true,
        message: module[property].toSource(),
      };
    } else {
      code = arguments_string.substr(all.length); 
      try {
        result = new Function(
          "with (arguments[0]) { return (" + code + ");}"
        ) (this._broker.window);
        module[property] = result; 
      } catch (e) {
        return {
          success: false,
          message: String(e),
        };
      }
    }
    return {
      success: true,
      message: coUtils.Text.format(
        _("%s.%s -> %s"), component_name, property, result && result.toSource()),
    };
  },

};

/**
 * @class FontCommands
 */
var FontCommands = new Class().extends(Component);
FontCommands.definition = {

  get id()
    "fontcommands",

  "[command('fontsize/fsize', ['fontsize']), _('Change terminal font size.'), enabled]":
  function fontsize(arguments_string)
  {
    var pattern, match, font_size;

    pattern = /^\s*([0-9]+)\s*$/;
    match = arguments_string.match(pattern);
    if (null === match) {
      return {
        success: false,
        message: coUtils.Text.format(
          _("Ill-formed arguments: %s."), 
          arguments_string),
      };
    }

    [, font_size] = match;

    this.sendMessage("set/font-size", font_size);
    this.sendMessage("command/draw", true);
    return {
      success: true,
      message: _("Font size was changed."),
    };
  },

  "[command('fontfamily/ff', ['font-family']), _('Select terminal font family.'), enabled]":
  function fontfamily(arguments_string)
  {
    var pattern, match, font_size;

    pattern = /^\s*(.+)\s*$/;
    match = arguments_string.match(pattern);
    
    if (null === match) {
      return {
        success: false,
        message: coUtils.Text.format(
          _("Ill-formed arguments: %s."), 
          arguments_string),
      };
    }

    [, font_family] = match;

    this.sendMessage("set/font-family", font_family);
    this.sendMessage("command/draw", true);

    return {
      success: true,
      message: _("Font family was changed."),
    };
  },

  /** Makes font size smaller. */
  "[command('decrease'), _('Make font size smaller.'), enabled]":
  function decrease()
  {
    this.sendMessage("command/change-fontsize-by-offset", -1);
    this.sendMessage("command/draw");

    return {
      success: true,
      message: _("Font size was changed."),
    };
  },

  /** Makes font size bigger. */
  "[command('increase'), _('Make font size bigger.'), enabled]":
  function increase()
  {
    this.sendMessage("command/change-fontsize-by-offset", +1);
    this.sendMessage("command/draw");

    return {
      success: true,
      message: _("Font size was changed."),
    };
  },

};

/**
 * @class ColorCommands
 */
var ColorCommands = new Class().extends(Component);
ColorCommands.definition = {

  get id()
    "colorcommands",

  _renderer: null,

  "[subscribe('@initialized/renderer'), enabled]":
  function onRendererInitialized(renderer)
  {
    this._renderer = renderer;
  },

  "[command('changepallet', ['color-number/fg']), _('Change pallet.'), enabled]":
  function changepallet(arguments_string)
  {
    var pattern, match, number, color, renderer;

    pattern = /\s*([0-9]+)\s+([a-zA-Z]+|#[0-9a-fA-F]+)/;
    match = arguments_string.match(pattern);

    if (null === match) {
      return {
        success: false,
        message: coUtils.Text.format(
          _("Ill-formed arguments: %s."), 
          arguments_string),
      };
    }

    [, number, color] = match;

    renderer = this._renderer;
    renderer.color[number] = color;

    this.sendMessage("command/draw", /* redraw */true);

    return {
      success: true,
      message: _("Foreground color was changed."),
    };
  },
};


/**
 * @class GlobalPersistCommand
 */
var GlobalPersistCommand = new Class().extends(Component);
GlobalPersistCommand.definition = {

  get id()
    "persist",

  "[command('globalsave/gs', ['profile/global']), _('Persist current global settings.'), enabled]":
  function persist(arguments_string)
  {
    var broker, desktop, match, profile;

    broker = this._broker;
    desktop = broker._broker;

    match = arguments_string.match(/^\s*([$_\-@a-zA-Z\.]*)\s*$/);
    if (null === match) {
      return {
        success: false,
        message: _("Failed to parse commandline argument."),
      };
    }

    [, profile] = match;

    desktop.notify("command/save-settings",  profile);
    return {
      success: true,
      message: _("Succeeded."),
    };
  },

  "[command('globalload/gl', ['profile/global']), _('Load a global settings.'), enabled]":
  function load(arguments_string)
  {
    var broker, desktop, match, profile;

    broker = this._broker;
    desktop = broker._broker;

    match = arguments_string.match(/^\s*([$_\-@a-zA-Z\.]*)\s*$/);
    if (null === match) {
      return {
        success: false,
        message: _("Failed to parse commandline argument."),
      };
    }
    [, profile] = match;

    desktop.notify("command/load-settings", profile || undefined);
    desktop.notify("command/draw", true);
    return {
      success: true,
      message: _("Succeeded."),
    };
  },

  "[command('globaldelete/gd', ['profile/global']), _('Delete a global settings.'), enabled]":
  function deleteprofile(arguments_string)
  {
    var broker, desktop, match, profile;

    broker = this._broker;
    desktop = broker._broker;

    match = arguments_string.match(/^\s*([$_\-@a-zA-Z\.]*)\s*$/);
    if (null === match) {
      return {
        success: false,
        message: _("Failed to parse commandline argument."),
      };
    }
    [, profile] = match;

    desktop.notify("command/delete-settings", profile || undefined);
    return {
      success: true,
      message: _("Succeeded."),
    };
  },
};


/**
 * @class PersistCommand
 */
var PersistCommand = new Class().extends(Component);
PersistCommand.definition = {

  get id()
    "persist",

  "[command('saveprofile/sp', ['profile']), _('Persist current settings.'), enabled]":
  function persist(arguments_string)
  {
    var match, profile;

    match = arguments_string.match(/^\s*([$_\-@a-zA-Z\.]*)\s*$/);
    if (null === match) {
      return {
        success: false,
        message: _("Failed to parse commandline argument."),
      };
    }

    [, profile] = match;

    this.sendMessage("command/save-settings", profile);
    return {
      success: true,
      message: _("Succeeded."),
    };
  },

  "[command('loadprofile/lp', ['profile']), _('Load a profile.'), enabled]":
  function load(arguments_string)
  {
    var match, profile;

    match = arguments_string.match(/^\s*([$_\-@a-zA-Z\.]*)\s*$/);
    if (null === match) {
      return {
        success: false,
        message: _("Failed to parse commandline argument."),
      };
    }
    [, profile] = match;

    this.sendMessage("command/load-settings", profile || undefined);
    this.sendMessage("command/draw", true);

    return {
      success: true,
      message: _("Succeeded."),
    };
  },

  "[command('deleteprofile/dp', ['profile']), _('Delete a profile.'), enabled]":
  function deleteprofile(arguments_string)
  {
    var match, profile;

    match = arguments_string.match(/^\s*([$_\-@a-zA-Z\.]*)\s*$/);
    if (null === match) {
      return {
        success: false,
        message: _("Failed to parse commandline argument."),
      };
    }

    [, profile] = match;

    this.sendMessage("command/delete-settings", profile || undefined);

    return {
      success: true,
      message: _("Succeeded."),
    };
  },
};


/**
 * @class LocalizeCommand
 */
var LocalizeCommand = new Class().extends(Component);
LocalizeCommand.definition = {

  get id()
    "localize",

  "[command('localize', ['localize']), _('Edit localization resource.'), enabled]":
  function evaluate(arguments_string)
  {
    var broker, desktop, pattern, match, language, key, value, dict;

    broker = this._broker;
    desktop = broker.parent;
    pattern = /^\s*([a-zA-Z-]+)\s+"((?:[^"])*)"\s+"(.+)"\s*$/;
    match = arguments_string.match(pattern);

    if (!match) {
      return {
        success: true,
        message: _("Failed to parse given commandline code."),
      };
    }

    [, language, key, value] = match;

    key = key.replace(/\\(?!\\)/g, "\\");
    value = value.replace(/\\(?!\\)/g, "\\");

    dict = coUtils.Localize.getDictionary(language);

    dict[key] = value;
    coUtils.Localize.setDictionary(language, dict);
    return {
      success: true,
      message: _("Succeeded."),
    };
  },
};

/**
 * @class CharsetCommands
 */
var CharsetCommands = new Class().extends(Component);
CharsetCommands.definition = {

  get id()
    "charset",

  _impl: function _impl(arguments_string, is_encoder) 
  {
    var modules, name;

    modules = this.sendMessage(is_encoder ? "get/encoders": "get/decoders");

    name = arguments_string.replace(/^\s+|\s+$/g, "");
    modules = modules.filter(function(module) module.charset == name);

    if (1 != modules.length) {
      return {
        success: false,
        message: _("Cannot enabled the module specified by given argument."),
      };
    }

    this.sendMessage(
      is_encoder ? "change/encoder": "change/decoder", 
      name)

    return {
      success: true,
      message: _("Succeeded."),
    };
  },

  "[command('encoder', ['charset/encoders']), _('Select encoder component.'), enabled]":
  function encoder(arguments_string)
  {
    return this._impl(arguments_string, /* is_encoder */ true);
  },

  "[command('decoder', ['charset/decoders']), _('Select a decoder component.'), enabled]":
  function decoder(arguments_string)
  {
    return this._impl(arguments_string, /* is_encoder */ false);
  },

};

/**
 * @class LscomponentCommand
 */
var LscomponentCommand = new Class().extends(Component);
LscomponentCommand.definition = {

  get id()
    "lscomponent_command",

  "[command('lscomponent/lc', ['components']), _('list components.'), enabled]":
  function evaluate(arguments_string)
  {
    return true;
  },

};

/**
 * @class EchoCommand
 */
var EchoCommand = new Class().extends(Component);
EchoCommand.definition = {

  get id()
    "echo_command",

  "[command('echo'), _('echo message to status line.'), enabled]":
  function evaluate(arguments_string)
  {
    return {
      success: true,
      message: arguments_string,
    };
  },

};

/**
 * @class OverlayEchoCommand
 */
var OverlayEchoCommand = new Class().extends(Component);
OverlayEchoCommand.definition = {

  get id()
    "echo_command",

  "[command('overlayecho/oe'), _('echo message at overlay indicator.'), enabled]":
  function evaluate(arguments_string)
  {
    this.sendMessage("command/report-overlay-message", arguments_string);
    return {
      success: true,
      message: _("Succeeded."),
    };
  },

}; // OverlayEchoCommand

/**
 * @fn main
 * @brief Module entry point.
 * @param {Broker} broker The Broker object.
 */
function main(broker)
{
  new CommandProvider(broker);
  new JsCommand(broker);
  new SetCommand(broker);
  new SetGlobalCommand(broker);
  new FontCommands(broker);
  new ColorCommands(broker);
  new PersistCommand(broker);
  new GlobalPersistCommand(broker);
  new LocalizeCommand(broker);
  new CharsetCommands(broker);
  new LscomponentCommand(broker);
  new EchoCommand(broker);
  new OverlayEchoCommand(broker);
}


