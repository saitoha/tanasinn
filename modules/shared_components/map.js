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
 * @class MappingManagerBase
 * @brief Manage mappings.
 */
let MappingManagerBase = new Abstruct().extends(Plugin);
MappingManagerBase.definition = {

  "[persistable] enabled_when_startup": true,

  _map: null,
  _state: null,

  /** Gets pre-defined mappings and store them. 
   *  @param {String} type "nmap" or "cmap".
   * */
  installImpl: function installImpl(type)
  {
    this._state = this._map = {};
    let broker = this._broker;
    let mappings = broker.notify(<>get/{type}</>);
    if (mappings) {
      mappings.forEach(function(delegate) {
        delegate.expressions.forEach(function(expression) {
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
    let packed_code_array 
      = coUtils.Keyboard.parseKeymapExpression(expression);
    let context = this._map;
    packed_code_array.forEach(function(key_code) {
      context = context[key_code] = context[key_code] || {};
    }, this);
    context.value = delegate;
  },

  /** Unregisters a mapping. */
  unregister: function unregister(expression) 
  {
    let packed_code_array 
      = coUtils.Keyboard.parseKeymapExpression(expression);
    void function(context) {
      let code = packed_code_array.shift();
      let new_context = context[code];
      if (new_context.value) {
        delete new_context.value;
      } else {
        arguments.callee(new_context);
      }
      if (!Object.getOwnPropertyNames(new_context).length) {
        delete context[code];
      }
    } (this._map);
  },

  dispatch: function dispatch(map, info)
  {
    let session = this._broker;
    let result = this._state = this._state[info.code];
    if (result && result.value) {
      session.notify("event/input-state-reset");
      this._state = map;
      return result.value(info);
    } else if (!result) {
      if (map !== this._state) {
        session.notify("event/input-state-reset");
      }
      this._state = map;
    } else {
      session.notify("event/input-state-changed", info.code);
      return true;
    }
    return undefined;
  },

  expand: function expand()
  {
    let result = {};
    let context = this._map;
    void function walk(context, previous) {
      Object.getOwnPropertyNames(context).forEach(function(name) {
        if ("value" == name) {
          let expression = coUtils.Keyboard.convertCodeToExpression(previous);
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
let NormalMappingManager = new Class().extends(MappingManagerBase);
NormalMappingManager.definition = {

  get id()
    "nmap_manager",

  /** Installs itself. 
   *  @param {Broker} a broker object.
   *  @notify initialized/inputmanager
   */
  "[subscribe('install/nmap_manager'), enabled]":
  function install(broker)
  {
    this.installImpl("nmap");
  },

  /** Uninstalls itself. 
   *  @param {Broker} a broker object.
   */
  "[subscribe('uninstall/nmap_manager'), enabled]":
  function uninstall(broker)
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
    let {source, destination} = info;
    let session = this._broker;
    let delegate = function() {
      session.notify("command/input-expression-with-mapping", destination);
      return true;
    };
    delegate.expression = source;
    delegate.description = destination;
    this.register(source, delegate);
  },

  "[subscribe('command/register-nnoremap'), enabled]":
  function registerNnoremap(info)
  {
    let {source, destination} = info;
    let session = this._broker;
    let codes = coUtils.Keyboard.parseKeymapExpression(destination);
    let delegate = function() {
      session.notify("command/input-expression-with-no-mapping", destination);
      return true;
    }
    this.register(source, delegate);
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
let CommandlineMappingManager = new Class().extends(MappingManagerBase);
CommandlineMappingManager.definition = {

  get id()
    "cmap_manager",

  /** Installs itself. 
   *  @param {Broker} a broker object.
   *  @notify initialized/inputmanager
   */
  "[subscribe('install/cmap_manager'), enabled]":
  function install(broker)
  {
    this.installImpl("cmap");
  },

  /** Uninstalls itself. 
   *  @param {Broker} a broker object.
   */
  "[subscribe('uninstall/cmap_manager'), enabled]":
  function uninstall(broker)
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
    let {source, destination} = info;
    let session = this._broker;
    let delegate = function() {
      session.notify("command/input-expression-with-mapping", destination);
      return true;
    };
    delegate.expression = source;
    delegate.description = destination;
    this.register(source, delegate);
  },

  "[subscribe('command/register-cnoremap'), enabled]":
  function registerCnoremap(info)
  {
    let {source, destination} = info;
    let session = this._broker;
    let codes = coUtils.Keyboard.parseKeymapExpression(destination);
    let delegate = function() {
      session.notify("command/input-expression-with-no-mapping", destination);
      return true;
    }
    this.register(source, delegate);
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
let CommandlineKeyHandler = new Class().extends(Component);
CommandlineKeyHandler.definition = {

  get id()
    "emacs_keybind",

  _mark: -1,

  "[cmap('<Esc>', '<C-]>', '<C-2>', '<C-g>', '<2-shift>', '<nmode>'), _('cancel to input.'), enabled]":
  function key_escape(info) 
  {
    let session = this._broker;
    session.notify("command/focus");
    this._mark = -1;
    return true;
  },

  "[cmap('<left>', '<C-b>'), _('move cursor backward.'), enabled]":
  function key_back(info) 
  {
    let textbox = info.textbox;
    let start = textbox.selectionStart;
    let end = textbox.selectionEnd;
    if (-1 != this._mark) {
      textbox.selectionStart = start - 1;
    } else if (start == end) {
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
    let textbox = info.textbox;
    let start = textbox.selectionStart;
    let end = textbox.selectionEnd;
    if (start == end) {
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
    let textbox = info.textbox;
    let value = textbox.value;
    let start = textbox.selectionStart;
    let end = textbox.selectionEnd;
    if (start == end) {
      textbox.value 
        = value.substr(0, textbox.selectionStart);
    } else {
      textbox.value 
        = value.substr(0, textbox.selectionStart) 
        + value.substr(textbox.selectionEnd);
      textbox.selectionStart = start;
      textbox.selectionEnd = start;
    }
    let broker = this._broker;
    broker.notify("command/set-completion-trigger", info);
    return true;
  },

  "[cmap('<C-d>', '<Del>'), _('delete forward char.'), enabled]":
  function key_delete(info) 
  {
    let textbox = info.textbox;
    let value = textbox.value;
    let start = textbox.selectionStart;
    let end = textbox.selectionEnd;
    if (start == end) {
      if (0 == start) {
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
    let broker = this._broker;
    broker.notify("command/set-completion-trigger", info);
    return true;
  },

  "[cmap('<C-h>', '<BS>'), _('delete backward char.'), enabled]":
  function key_backspace(info) 
  {
    let textbox = info.textbox;
    let value = textbox.value;
    let start = textbox.selectionStart;
    let end = textbox.selectionEnd;
    if (start == end) {
      if (0 == start) {
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
    let broker = this._broker;
    broker.notify("command/set-completion-trigger", info);
    return true;
  },
 
  "[cmap('<Home>', '<C-a>'), _('move cursor to head of line.'), enabled]":
  function key_first(info) 
  {
    let textbox = info.textbox;
    textbox.selectionStart = 0;
    textbox.selectionEnd = 0;
    return true;
  },

  "[cmap('<End>', '<C-e>'), _('move cursor to end of line.'), enabled]":
  function key_end(info) 
  {
    let textbox = info.textbox;
    let length = textbox.value.length;
    textbox.selectionStart = length;
    textbox.selectionEnd = length;
    return true;
  },

  "[cmap('<C-j>', '<CR>'), _('submit commandlne text.'), enabled]":
  function key_enter(info) 
  {
    let broker = this._broker;
    broker.notify("command/select-current-candidate", info);
    return true;
  },

  "[cmap('<C-p>', '<Up>', '<S-Tab>'), _('select previous candidate.'), enabled]":
  function key_prev(info) 
  {
    let broker = this._broker;
    broker.notify("command/select-previous-candidate", info);
    return true;
  },

  "[cmap('<C-n>', '<Down>', '<Tab>'), _('select next candidate.'), enabled]":
  function key_next(info) 
  {
    let broker = this._broker;
    broker.notify("command/select-next-candidate", info);
    return true;
  },

  "[cmap('<C-S-p>'), _('select previous history.'), enabled]":
  function key_history_prev(info) 
  {
    let broker = this._broker;
    broker.notify("command/select-previous-history", info);
    return true;
  },

  "[cmap('<C-S-n>'), _('select next history.'), enabled]":
  function key_history_next(info) 
  {
    let broker = this._broker;
    broker.notify("command/select-next-history", info);
    this._mark = -1;
    return true;
  },

  "[cmap('<C-w>'), _('delete backward word.'), enabled]":
  function key_deleteword(info) 
  {
    let textbox = info.textbox;
    let value = textbox.value;
    let position = textbox.selectionEnd;
    textbox.value
      = value.substr(0, position).replace(/\w+$|\W+$/, "") 
      + value.substr(position);
    this._mark = -1;
    let broker = this._broker;
    broker.notify("command/set-completion-trigger", info);
    return true;
  },

  "[cmap('<C-Space>', '<C-@>', '<C-2>'), _('set mark.'), enabled]":
  function set_mark(info) 
  {
    let textbox = info.textbox;
    let value = textbox.value;
    let position = textbox.selectionEnd;
    this._mark = position;
    let broker = this._broker;
    broker.notify("command/set-completion-trigger", info);
    return true;
  },

};


/**
 * @class NMapCommands
 */
let NMapCommands = new Class().extends(Component);
NMapCommands.definition = {

  get id()
    "nmap_command",

  "[command('nmap', ['nmap', 'nmap']), _('Add a normal mapping.'), enabled]":
  function nmap(arguments_string)
  {
    let session = this._broker;
    let pattern = /^\s*(\S+)\s+(.+)\s*$/;
    let match = arguments_string.match(pattern);
    if (!match) {
      return {
        success: false,
        message: _("Failed to parse given commandline code."),
      };
    }
    let [, source_mapping, destination_mapping] = match;
    let mapping_info = {
      source: source_mapping,
      destination: destination_mapping,
    };
    session.notify("command/register-nmap", mapping_info);
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
    let session = this._broker;
    let pattern = /^\s*(\S+)\s+(.+)\s*$/;
    let match = arguments_string.match(pattern);
    if (!match) {
      return {
        success: false,
        message: _("Failed to parse given commandline code."),
      };
    }
    let [, source_mapping, destination_mapping] = match;
    let mapping_info = {
      source: source_mapping,
      destination: destination_mapping,
    };
    session.notify("command/register-nnoremap", mapping_info);
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
    let session = this._broker;
    let pattern = /^\s*(\S+)\s*$/;
    let match = arguments_string.match(pattern);
    if (!match) {
      return {
        success: false,
        message: _("Failed to parse given commandline code."),
      };
    }
    let [, expression] = match;
    session.notify("command/unregister-nmap", expression);
    return {
      success: true,
      message: coUtils.Text.format(_("Map was removed: '%s'."), expression),
    };
  },
};

/**
 * @class CMapCommands
 */
let CMapCommands = new Class().extends(Component);
CMapCommands.definition = {

  get id()
    "cmap_command",

  "[command('cmap', ['cmap', 'cmap']), _('Add a command line mapping.'), enabled]":
  function cmap(arguments_string)
  {
    let session = this._broker;
    let pattern = /^\s*(\S+)\s+(.+)\s*$/;
    let match = arguments_string.match(pattern);
    if (!match) {
      return {
        success: false,
        message: _("Failed to parse given commandline code."),
      };
    }
    let [, source_mapping, destination_mapping] = match;
    let mapping_info = {
      source: source_mapping,
      destination: destination_mapping,
    };
    session.notify("command/register-cmap", mapping_info);
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
    let session = this._broker;
    let pattern = /^\s*(\S+)\s+(.+)\s*$/;
    let match = arguments_string.match(pattern);
    if (!match) {
      return {
        success: false,
        message: _("Failed to parse given commandline code."),
      };
    }
    let [, source_mapping, destination_mapping] = match;
    let mapping_info = {
      source: source_mapping,
      destination: destination_mapping,
    };
    session.notify("command/register-cnoremap", mapping_info);
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
    let session = this._broker;
    let pattern = /^\s*(\S+)\s*$/;
    let match = arguments_string.match(pattern);
    if (!match) {
      return {
        success: false,
        message: _("Failed to parse given commandline code."),
      };
    }
    let [, expression] = match;
    session.notify("command/unregister-cmap", expression);
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

