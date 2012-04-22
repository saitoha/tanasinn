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
  function onLoad(broker)
  {
    this.complete.enabled = true;
    this.evaluate.enabled = true;
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
    let {source} = completion_info;
    let pattern = /^\s*([0-9]*)(\w*)(\s*)/y;
    let match = pattern.exec(source);
    let [, repeat, command_name, blank] = match;
    if (blank) {
      let command = this._getCommand(command_name);
      if (command) {
        let text = source.substr(pattern.lastIndex);
        command.complete(text);
      }
    } else {
      let broker = this._broker;
      broker.notify("command/query-completion/command", completion_info);
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
 * @class JsCommand
 */
let JsCommand = new Class().extends(Component);
JsCommand.definition = {

  get id()
    "jscommand",

  "[command('javascript/js', ['js']), _('Run a javascript code.'), enabled]":
  function evaluate(arguments_string)
  {
    let broker = this._broker;
    try {
      let result = new Function(
        "with (arguments[0]) { return (" + arguments_string + ");}"
      ) (broker.window);
    } catch (e) {
      broker.notify("command/report-status-message", e);
    }
  },
};

/**
 * @class SetCommand
 */
let SetCommand = new Class().extends(Component);
SetCommand.definition = {

  get id()
    "setcommand",

  "[command('set', ['option']), _('Set an option.'), enabled]":
  function evaluate(arguments_string)
  {
    let broker = this._broker;
    let modules = broker.notify("get/components");
    modules.push(broker);
    let pattern = /^\s*([$_a-zA-Z\.\-]+)\.([$_a-zA-Z]+)\s*(=?)\s*/;
    let match = arguments_string.match(pattern);
    if (null === match) {
      return {
        success: false,
        message: _("Ill-formed option name is detected. ",
                   "valid format is such as '<component name>.<property name>'."),
      }
    }
    let [all, component_name, property, equal] = match;
    if (!component_name || !property) {
      return {
        success: false,
        message: _("Ill-formed option name is detected. ",
                   "valid format is such as '<component name>.<property name>'."),
      };
    }
    let candidates = modules.filter(function(module) {
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
    let module = candidates.shift();
    if (!equal) {
      return {
        success: true,
        message: module[property].toSource(),
      };
    }
    let code = arguments_string.substr(all.length); 
    let result = new Function(
      "with (arguments[0]) { return (" + code + ");}"
    ) (broker.window);
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
let SetGlobalCommand = new Class().extends(Component);
SetGlobalCommand.definition = {

  get id()
    "setglobalcommand",

  "[command('setglobal', ['option/global']), _('Set a global option.'), enabled]":
  function evaluate(arguments_string)
  {
    let broker = this._broker;
    let desktop = broker._broker;
    let modules = desktop.notify("get/components");
    let pattern = /^\s*([$_a-zA-Z\.\-]+)\.([$_a-zA-Z]+)(=?)/y;
    let match = arguments_string.match(pattern);
    if (null === match) {
      return {
        success: false,
        message: _("Ill-formed option name is detected. ",
                   "valid format is such as '<component name>.<property name>'."),
      };
    }
    let [all, component_name, property, equal] = match;
    if (!component_name || !property) {
      return {
        success: false,
        message: _("Ill-formed option name is detected. ",
                   "valid format is such as '<component name>.<property name>'."),
      };
    }
    let [module] = modules.filter(function(module) {
      return module.id == component_name;
    });
    if (!module) {
      return {
        success: false,
        message: coUtils.Text.format(_("Module %s is not found."), component_name),
      };
    }  
    let result;
    if (!equal) {
      return {
        success: true,
        message: module[property].toSource(),
      };
    } else {
      let code = arguments_string.substr(all.length); 
      try {
        result = new Function(
          "with (arguments[0]) { return (" + code + ");}"
        ) (broker.window);
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
let FontCommands = new Class().extends(Component);
FontCommands.definition = {

  get id()
    "fontcommands",

  "[command('fontsize/fsize', ['fontsize']), _('Change terminal font size.'), enabled]":
  function fontsize(arguments_string)
  {
    let broker = this._broker;
    let pattern = /^\s*([0-9]+)\s*$/;
    let match = arguments_string.match(pattern);
    if (null === match) {
      return {
        success: false,
        message: coUtils.Text.format(
          _("Ill-formed arguments: %s."), 
          arguments_string),
      };
    }
    let [, font_size] = match;
    broker.notify("set/font-size", font_size);
    broker.notify("command/draw", true);
    return {
      success: true,
      message: _("Font size was changed."),
    };
  },

  "[command('fontfamily/ff', ['font-family']), _('Select terminal font family.'), enabled]":
  function fontfamily(arguments_string)
  {
    let broker = this._broker;
    let pattern = /^\s*(.+)\s*$/;
    let match = arguments_string.match(pattern);
    if (null === match) {
      return {
        success: false,
        message: coUtils.Text.format(
          _("Ill-formed arguments: %s."), 
          arguments_string),
      };
    }
    let [, font_family] = match;
    broker.notify("set/font-family", font_family);
    broker.notify("command/draw", true);
    return {
      success: true,
      message: _("Font family was changed."),
    };
  },

  /** Makes font size smaller. */
  "[command('decrease'), _('Make font size smaller.'), enabled]":
  function decrease()
  {
    let broker = this._broker;
    broker.notify("command/change-fontsize-by-offset", -1);
    broker.notify("command/draw");
    return {
      success: true,
      message: _("Font size was changed."),
    };
  },

  /** Makes font size bigger. */
  "[command('increase'), _('Make font size bigger.'), enabled]":
  function increase()
  {
    let broker = this._broker;
    broker.notify("command/change-fontsize-by-offset", +1);
    broker.notify("command/draw");
    return {
      success: true,
      message: _("Font size was changed."),
    };
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

  "[command('fgcolor', ['color-number/fg']), _('Select foreground color.'), enabled]":
  function fgcolor(arguments_string)
  {
    let broker = this._broker;
    let pattern = /\s*([0-9]+)\s+([a-zA-Z]+|#[0-9a-fA-F]+)/;
    let match = arguments_string.match(pattern);
    if (null === match) {
      return {
        success: false,
        message: coUtils.Text.format(
          _("Ill-formed arguments: %s."), 
          arguments_string),
      };
    }
    let [, number, color] = match;
    let renderer = this._renderer;
    renderer.color[number] 
      = coUtils.Constant.WEB140_COLOR_MAP[color] || color;
    broker.notify("command/draw", /* redraw */true);
    return {
      success: true,
      message: _("Foreground color was changed."),
    };
  },

  "[command('bgcolor', ['color-number/bg']), _('Select background color.'), enabled]":
  function bgcolor(arguments_string)
  {
    let broker = this._broker;
    let pattern = /\s*([0-9]+)\s+([a-zA-Z]+|#[0-9a-fA-F]+)/;
    let match = arguments_string.match(pattern);
    if (null === match) {
      return {
        success: false,
        message: coUtils.Text.format(
          _("Ill-formed arguments: %s."), 
          arguments_string),
      };
    }
    let [, number, color] = match;
    let renderer = this._renderer;
    renderer.color[number] 
      = coUtils.Constant.WEB140_COLOR_MAP[color] || color;
    broker.notify("command/draw", /* redraw */true);
    return {
      success: true,
      message: _("Background color was changed."),
    };
  },
};


/**
 * @class GlobalPersistCommand
 */
let GlobalPersistCommand = new Class().extends(Component);
GlobalPersistCommand.definition = {

  get id()
    "persist",

  "[command('globalsave/gs', ['profile/global']), _('Persist current global settings.'), enabled]":
  function persist(arguments_string)
  {
    let broker = this._broker;
    let desktop = broker._broker;

    let match = arguments_string.match(/^\s*([$_\-@a-zA-Z\.]*)\s*$/);
    if (null === match) {
      return {
        success: false,
        message: _("Failed to parse commandline argument."),
      };
    }
    let [, profile] = match;
    desktop.notify("command/save-settings",  profile);
    return {
      success: true,
      message: _("Succeeded."),
    };
  },

  "[command('globalload/gl', ['profile/global']), _('Load a global settings.'), enabled]":
  function load(arguments_string)
  {
    let broker = this._broker;
    let desktop = broker._broker;

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
    return {
      success: true,
      message: _("Succeeded."),
    };
  },

  "[command('globaldelete/gd', ['profile/global']), _('Delete a global settings.'), enabled]":
  function deleteprofile(arguments_string)
  {
    let broker = this._broker;
    let desktop = broker._broker;

    let match = arguments_string.match(/^\s*([$_\-@a-zA-Z\.]*)\s*$/);
    if (null === match) {
      return {
        success: false,
        message: _("Failed to parse commandline argument."),
      };
    }
    let [, profile] = match;

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
let PersistCommand = new Class().extends(Component);
PersistCommand.definition = {

  get id()
    "persist",

  "[command('saveprofile/sp', ['profile']), _('Persist current settings.'), enabled]":
  function persist(arguments_string)
  {
    let broker = this._broker;
    let match = arguments_string.match(/^\s*([$_\-@a-zA-Z\.]*)\s*$/);
    if (null === match) {
      return {
        success: false,
        message: _("Failed to parse commandline argument."),
      };
    }
    let [, profile] = match;
    broker.notify("command/save-settings", profile);
    return {
      success: true,
      message: _("Succeeded."),
    };
  },

  "[command('loadprofile/lp', ['profile']), _('Load a profile.'), enabled]":
  function load(arguments_string)
  {
    let broker = this._broker;

    let match = arguments_string.match(/^\s*([$_\-@a-zA-Z\.]*)\s*$/);
    if (null === match) {
      return {
        success: false,
        message: _("Failed to parse commandline argument."),
      };
    }
    let [, profile] = match;

    broker.notify("command/load-settings", profile || undefined);
    broker.notify("command/draw", true);
    return {
      success: true,
      message: _("Succeeded."),
    };
  },

  "[command('deleteprofile/dp', ['profile']), _('Delete a profile.'), enabled]":
  function deleteprofile(arguments_string)
  {
    let broker = this._broker;

    let match = arguments_string.match(/^\s*([$_\-@a-zA-Z\.]*)\s*$/);
    if (null === match) {
      return {
        success: false,
        message: _("Failed to parse commandline argument."),
      };
    }
    let [, profile] = match;

    broker.notify("command/delete-settings", profile || undefined);
    return {
      success: true,
      message: _("Succeeded."),
    };
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
    let broker = this._broker;
    let desktop = broker.parent;
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
 * @class CharsetCommands
 */
let CharsetCommands = new Class().extends(Component);
CharsetCommands.definition = {

  get id()
    "charset",

  _impl: function _impl(arguments_string, is_encoder) 
  {
    let broker = this._broker;
    let modules = broker.notify(
      is_encoder ? "get/encoders": "get/decoders");
    let name = arguments_string.replace(/^\s+|\s+$/g, "");
    modules = modules.filter(function(module) module.charset == name);
    if (1 != modules.length) {
      return {
        success: false,
        message: _("Cannot enabled the module specified by given argument."),
      };
    }
    broker.notify(
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
let LscomponentCommand = new Class().extends(Component);
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
let EchoCommand = new Class().extends(Component);
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
let OverlayEchoCommand = new Class().extends(Component);
OverlayEchoCommand.definition = {

  get id()
    "echo_command",

  "[command('overlayecho/oe'), _('echo message at overlay indicator.'), enabled]":
  function evaluate(arguments_string)
  {
    let broker = this._broker;
    broker.notify("command/report-overlay-message", arguments_string);
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


