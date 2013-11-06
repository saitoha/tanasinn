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
 * @class MappingManagerBase
 * @brief Manage mappings.
 */
var MappingManagerBase = new Abstruct().extends(Plugin);
MappingManagerBase.definition = {

  _map: null,
  _state: null,

  /** Gets pre-defined mappings and store them.
   *  @param {String} type "nmap" or "cmap".
   * */
  installImpl: function installImpl(type)
  {
    var mappings;

    this._state = this._map = {};

    mappings = this.sendMessage("get/" + type);

    if (mappings) {
      mappings.forEach(
        function(delegate)
        {
          delegate.expressions.forEach(
            function(expression)
            {
              this.register(expression, delegate);
            }, this);
        }, this);
    }
  },

  /** Clear the key mappings and the input state.
   *  @param {EventBroker} broker parent broker object.
   */
  uninstallImpl: function uninstallImpl(broker)
  {
    this._state = this._map = null;
  },

  /** Registers a mapping specified by given expression. */
  register: function register(expression, delegate)
  {
    var packed_code_array = coUtils.Keyboard.parseKeymapExpression(expression),
        context = this._map;

    packed_code_array.forEach(
      function(key_code)
      {
        context = context[key_code] = context[key_code] || {};
      }, this);
    context.value = delegate;
  },

  /** Unregisters a mapping. */
  unregister: function unregister(expression)
  {
    var packed_code_array = coUtils.Keyboard.parseKeymapExpression(expression);

    void function impl(context)
    {
      var code = packed_code_array.shift(),
          new_context = context[code];

      if (new_context.value) {
        delete new_context.value;
      } else {
        impl(new_context);
      }
      if (!Object.getOwnPropertyNames(new_context).length) {
        delete context[code];
      }
    } (this._map);
  },

  dispatch: function dispatch(map, info)
  {
    var code = info.code,
        result;

    // swap mapleader as <Leader>
    if (this._state[coUtils.Keyboard.KEYNAME_PACKEDCODE_MAP.leader]) {
      if (code === coUtils.Keyboard.parseKeymapExpression(this.mapleader)) {
        code = coUtils.Keyboard.KEYNAME_PACKEDCODE_MAP.leader;
      }
    }

    result = this._state = this._state[code];
    if (result && result.value) {
      this.sendMessage("event/input-state-reset");
      this._state = map;
      return result.value(info);
    } else if (!result) {
      if (map !== this._state) {
        this.sendMessage("event/input-state-reset");
      }
      this._state = map;
    } else {
      this.sendMessage("event/input-state-changed", code);
      return true;
    }
    return undefined;
  },

  expand: function expand()
  {
    var result = {},
        context = this._map,
        mapleader = this.mapleader;

    void function walk(context, previous)
    {
      Object.getOwnPropertyNames(context).forEach(function(name)
      {
        var expression;

        if ("value" === name) {
          expression = coUtils.Keyboard
            .convertCodeToExpression(previous, mapleader);
          result[expression] = context[name].description || context[name];
        } else {
          walk(context[name], previous.concat(Number(name)));
        }
      });
    } (this._map, []);

    return result;
  },

};

/**
 * @class NormalMappingManager
 * @brief Manage mappings.
 */
var NormalMappingManager = new Class().extends(MappingManagerBase);
NormalMappingManager.definition = {

  id: "nmap_manager",

  "[persistable] enabled_when_startup": true,
  "[persistable] mapleader": "<C-s>",

  /** Installs itself.
   *  @param {InstallContext} context A InstallContext object.
   */
  "[install]":
  function install(context)
  {
    this.installImpl("nmap");
  },

  /** Uninstalls itself.
   */
  "[uninstall]":
  function uninstall()
  {
    this.uninstallImpl();
  },

  /** Handles normal input event and dispatches stored nmap handler.
   *  @param {Object} An object includes XUL textbox field element
   *                  and key code.
   */
  "[subscribe('event/normal-input'), enabled]":
  function onNormalInput(info)
  {
    return this.dispatch(this._map, info);
  },

  "[subscribe('get/registered-nmap'), enabled]":
  function getRegisteredNmap()
  {
    return this.expand();
  },

  "[subscribe('command/register-nmap'), enabled]":
  function registerNmap(info)
  {
    var delegate,
        self = this;

    delegate = function()
    {
      self.sendMessage(
        "command/input-expression-with-remapping",
        info.destination);
      return true;
    };
    delegate.expression = info.source;
    delegate.description = info.destination;
    this.register(info.source, delegate);
  },

  "[subscribe('command/register-nnoremap'), enabled]":
  function registerNnoremap(info)
  {
    var delegate,
        self = this;

    delegate = function()
    {
      self.sendMessage(
        "command/input-expression-with-no-remapping",
        info.destination);
      return true;
    }
    this.register(info.source, delegate);
  },

  "[subscribe('command/unregister-nmap'), enabled]":
  function unregisterNmap(expression)
  {
    this.unregister(expression);
  },

};


/**
 * @class CommandlineMappingManager
 * @brief Manage mappings.
 */
var CommandlineMappingManager = new Class().extends(MappingManagerBase);
CommandlineMappingManager.definition = {

  id: "cmap_manager",

  "[persistable] enabled_when_startup": true,
  "[persistable] mapleader": "<C-s>",

  /** Installs itself.
   *  @param {InstallContext} context A InstallContext object.
   */
  "[install]":
  function install(context)
  {
    this.installImpl("cmap");
  },

  /** Uninstalls itself.
   */
  "[uninstall]":
  function uninstall()
  {
    this.uninstallImpl();
  },

  /** Handles command line input event and dispatches stored cmap handler.
   *  @param {Object} An object includes XUL textbox field element
   *                  and key code.
   */
  "[subscribe('event/commandline-input'), enabled]":
  function onCommandlineInput(info)
  {
    return this.dispatch(this._map, info);
  },

  "[subscribe('get/registered-cmap'), enabled]":
  function getRegisteredCmap()
  {
    return this.expand();
  },

  "[subscribe('command/register-cmap'), enabled]":
  function registerCmap(info)
  {
    var delegate,
        self = this;

    delegate = function()
    {
      self.sendMessage(
        "command/input-expression-with-remapping",
        info.destination);
      return true;
    };
    delegate.expression = info.source;
    delegate.description = info.destination;
    this.register(info.source, delegate);
  },

  "[subscribe('command/register-cnoremap'), enabled]":
  function registerCnoremap(info)
  {
    var delegate,
        self = this;

    delegate = function()
    {
      self.sendMessage(
        "command/input-expression-with-no-remapping",
        info.destination);
      return true;
    }
    this.register(info.source, delegate);
  },

  "[subscribe('command/unregister-cmap'), enabled]":
  function unregisterNmap(expression)
  {
    this.unregister(expression);
  },

};

/**
 * @class CommandlineKeyHandler
 * @brief Provides emacs-like keybinds for command line input field.
 */
var CommandlineKeyHandler = new Class().extends(Component);
CommandlineKeyHandler.definition = {

  id: "emacs_keybind",

  _mark: -1,

  "[cmap('<Esc>', '<C-]>', '<C-2>', '<C-g>', '<2-shift>', '<nmode>'), _('cancel to input.'), enabled]":
  function key_escape(info)
  {
    this.sendMessage("command/focus");
    this._mark = -1;

    return true;
  },

  "[cmap('<left>', '<C-b>'), _('move cursor backward.'), enabled]":
  function key_back(info)
  {
    var textbox, start, end;

    textbox = info.textbox;
    start = textbox.selectionStart;
    end = textbox.selectionEnd;

    if (-1 !== this._mark) {
      textbox.selectionStart = start - 1;
    } else if (start === end) {
      textbox.selectionStart = start - 1;
      textbox.selectionEnd = start - 1;
    } else {
      textbox.selectionEnd = start;
    }

    return true;
  },

  "[cmap('<right>', '<C-f>'), _('move cursor forward.'), enabled]":
  function key_forward(info)
  {
    var textbox, start, end;

    textbox = info.textbox;
    start = textbox.selectionStart;
    end = textbox.selectionEnd;

    if (start === end) {
      textbox.selectionStart = start + 1;
      textbox.selectionEnd = start + 1;
    } else {
      textbox.selectionStart = end;
    }
    return true;
  },

  "[cmap('<C-k>'), _('delete chars after cursor position.'), enabled]":
  function key_truncate(info)
  {
    var textbox, value, start, end;

    textbox = info.textbox;
    value = textbox.value;
    start = textbox.selectionStart;
    end = textbox.selectionEnd;

    if (start === end) {
      textbox.value
        = value.substr(0, textbox.selectionStart);
    } else {
      textbox.value
        = value.substr(0, textbox.selectionStart)
        + value.substr(textbox.selectionEnd);
      textbox.selectionStart = start;
      textbox.selectionEnd = start;
    }

    this.sendMessage("command/set-completion-trigger", info);

    return true;
  },

  "[cmap('<C-d>', '<Del>'), _('delete forward char.'), enabled]":
  function key_delete(info)
  {
    var textbox, value, start, end;

    textbox = info.textbox;
    value = textbox.value;
    start = textbox.selectionStart;
    end = textbox.selectionEnd;

    if (start === end) {
      if (0 === start) {
        return true;
      }
      textbox.value
        = value.substr(0, start)
        + value.substr(start + 1)
      textbox.selectionStart = start;
      textbox.selectionEnd = start;
    } else {
      textbox.value
        = value.substr(0, start)
        + value.substr(end);
      textbox.selectionStart = start;
      textbox.selectionEnd = start;
    }

    this.sendMessage("command/set-completion-trigger", info);

    return true;
  },

  "[cmap('<C-h>', '<BS>'), _('delete backward char.'), enabled]":
  function key_backspace(info)
  {
    var textbox, value, start, end;

    textbox = info.textbox;
    value = textbox.value;
    start = textbox.selectionStart;
    end = textbox.selectionEnd;

    if (start === end) {
      if (0 === start) {
        return true;
      }
      textbox.value
        = value.substr(0, start - 1)
        + value.substr(start)
      textbox.selectionStart = start - 1;
      textbox.selectionEnd = start - 1;
    } else {
      textbox.value
        = value.substr(0, start)
        + value.substr(end);
      textbox.selectionStart = start;
      textbox.selectionEnd = start;
    }

    this.sendMessage("command/set-completion-trigger", info);

    return true;
  },

  "[cmap('<Home>', '<C-a>'), _('move cursor to head of line.'), enabled]":
  function key_first(info)
  {
    var textbox = info.textbox;

    textbox.selectionStart = 0;
    textbox.selectionEnd = 0;
    return true;
  },

  "[cmap('<End>', '<C-e>'), _('move cursor to end of line.'), enabled]":
  function key_end(info)
  {
    var textbox = info.textbox,
        length = textbox.value.length;

    textbox.selectionStart = length;
    textbox.selectionEnd = length;

    return true;
  },

  "[cmap('<C-j>', '<CR>'), _('submit commandlne text.'), enabled]":
  function key_enter(info)
  {
    this.sendMessage("command/select-current-candidate", info);
    return true;
  },

  "[cmap('<C-p>', '<Up>', '<S-Tab>'), _('select previous candidate.'), enabled]":
  function key_prev(info)
  {
    this.sendMessage("command/select-previous-candidate", info);
    return true;
  },

  "[cmap('<C-n>', '<Down>', '<Tab>'), _('select next candidate.'), enabled]":
  function key_next(info)
  {
    this.sendMessage("command/select-next-candidate", info);
    return true;
  },

  "[cmap('<C-S-p>'), _('select previous history.'), enabled]":
  function key_history_prev(info)
  {
    this.sendMessage("command/select-previous-history", info);
    return true;
  },

  "[cmap('<C-S-n>'), _('select next history.'), enabled]":
  function key_history_next(info)
  {
    this.sendMessage("command/select-next-history", info);
    this._mark = -1;
    return true;
  },

  "[cmap('<C-w>'), _('delete backward word.'), enabled]":
  function key_deleteword(info)
  {
    var textbox = info.textbox,
        value = textbox.value,
        position = textbox.selectionEnd;

    textbox.value
      = value.substr(0, position).replace(/\w+$|\W+$/, "")
      + value.substr(position);
    this._mark = -1;

    this.sendMessage("command/set-completion-trigger", info);
    return true;
  },

  "[cmap('<C-Space>', '<C-@>', '<C-2>'), _('set mark.'), enabled]":
  function set_mark(info)
  {
    var textbox = info.textbox,
        value = textbox.value,
        position = textbox.selectionEnd;

    this._mark = position;

    this.sendMessage("command/set-completion-trigger", info);

    return true;
  },

};


/**
 * @class NMapCommands
 */
var NMapCommands = new Class().extends(Component);
NMapCommands.definition = {

  id: "nmap_command",

  "[command('nmap', ['nmap', 'nmap']), _('Add a normal mapping.'), enabled]":
  function nmap(arguments_string)
  {
    var pattern = /^\s*(\S+)\s+(.+)\s*$/,
        match = arguments_string.match(pattern),
        source_mapping,
        destination_mapping,
        mapping_info;

    if (null === match) {
      return {
        success: false,
        message: _("Failed to parse given commandline code."),
      };
    }

    source_mapping = match[1];
    destination_mapping = match[2];

    mapping_info = {
      source: source_mapping,
      destination: destination_mapping,
    };

    this.sendMessage("command/register-nmap", mapping_info);

    return {
      success: true,
      message: coUtils.Text.format(
        _("Map was defined: '%s' -> '%s' (with re-mapping)."),
        source_mapping,
        destination_mapping),
    };
  },

  "[command('nnoremap', ['nmap', 'nmap']), _('Add a normal mapping (without re-mapping).'), enabled]":
  function nnoremap(arguments_string)
  {
    var pattern = /^\s*(\S+)\s+(.+)\s*$/,
        match = arguments_string.match(pattern),
        source_mapping,
        destination_mapping,
        mapping_info;

    if (null === match) {
      return {
        success: false,
        message: _("Failed to parse given commandline code."),
      };
    }

    source_mapping = match[1];
    destination_mapping = match[2];

    mapping_info = {
      source: source_mapping,
      destination: destination_mapping,
    };

    this.sendMessage("command/register-nnoremap", mapping_info);

    return {
      success: true,
      message: coUtils.Text.format(
        _("Map was defined: '%s' -> '%s' (without re-mapping)."),
        source_mapping,
        destination_mapping),
    };
  },

  "[command('nunmap', ['nmap']), _('Delete a normal mapping.'), enabled]":
  function nunmap(arguments_string)
  {
    var pattern = /^\s*(\S+)\s*$/,
        match = arguments_string.match(pattern),
        expression;

    if (null === match) {
      return {
        success: false,
        message: _("Failed to parse given commandline code."),
      };
    }

    expression = match[1];

    this.sendMessage("command/unregister-nmap", expression);
    return {
      success: true,
      message: coUtils.Text.format(_("Map was removed: '%s'."), expression),
    };
  },
};

/**
 * @class CMapCommands
 */
var CMapCommands = new Class().extends(Component);
CMapCommands.definition = {

  id: "cmap_command",

  "[command('cmap', ['cmap', 'cmap']), _('Add a command line mapping.'), enabled]":
  function cmap(arguments_string)
  {
    var pattern = /^\s*(\S+)\s+(.+)\s*$/,
        match = arguments_string.match(pattern),
        source_mapping,
        destination_mapping,
        mapping_info;

    if (null === match) {
      return {
        success: false,
        message: _("Failed to parse given commandline code."),
      };
    }

    [, source_mapping, destination_mapping] = match;

    mapping_info = {
      source: source_mapping,
      destination: destination_mapping,
    };
    this.sendMessage("command/register-cmap", mapping_info);
    return {
      success: true,
      message: coUtils.Text.format(
        _("Map was defined: '%s' -> '%s' (with re-mapping)."),
        source_mapping,
        destination_mapping),
    };
  },

  "[command('cnoremap', ['cmap', 'cmap']), _('Add a command line mapping (without re-mapping).'), enabled]":
  function cnoremap(arguments_string)
  {
    var pattern = /^\s*(\S+)\s+(.+)\s*$/,
        match = arguments_string.match(pattern),
        source_mapping,
        destination_mapping,
        mapping_info;

    if (null === match) {
      return {
        success: false,
        message: _("Failed to parse given commandline code."),
      };
    }

    source_mapping = match[1];
    destination_mapping = match[2];

    mapping_info = {
      source: source_mapping,
      destination: destination_mapping,
    };

    this.sendMessage("command/register-cnoremap", mapping_info);

    return {
      success: true,
      message: coUtils.Text.format(
        _("Map was defined: '%s' -> '%s' (without re-mapping)."),
        source_mapping,
        destination_mapping),
    };
  },

  "[command('cunmap', ['cmap']), _('Delete a normal mapping.'), enabled]":
  function cunmap(arguments_string)
  {
    var pattern = /^\s*(\S+)\s*$/,
        match = arguments_string.match(pattern),
        source_mapping,
        expression;

    if (null === match) {
      return {
        success: false,
        message: _("Failed to parse given commandline code."),
      };
    }

    expression = match[1];

    this.sendMessage("command/unregister-cmap", expression);
    return {
      success: true,
      message: coUtils.Text.format(_("Map was removed: '%s'."), expression),
    };
  },

};

/**
 * @fn main
 * @brief Module entry point.
 * @param {Broker} broker A broker object.
 */
function main(broker)
{
  new CommandlineMappingManager(broker);
  new NormalMappingManager(broker);
  new CommandlineKeyHandler(broker);
  new NMapCommands(broker);
  new CMapCommands(broker);
}

// EOF
