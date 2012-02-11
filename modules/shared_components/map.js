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
          let expression = coUtils.Keyboard
            .convertCodeToExpression(previous);
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
    let codes = coUtils.Keyboard.parseKeymapExpression(destination);
    if (0 < codes.length) {
      let delegate = function() {
        codes.forEach(function(packed_code) {
          session.notify("command/input-with-mapping", packed_code); 
        });
        return true;
      }
      delegate.expression = source;
      delegate.description = destination;
      this.register(source, delegate);
    }
  },

  "[subscribe('command/register-nnoremap'), enabled]":
  function registerNnoremap(info)
  {
    let {source, destination} = info;
    let session = this._broker;
    let codes = coUtils.Keyboard.parseKeymapExpression(destination);
    let delegate = function() {
      codes.forEach(function(packed_code) {
        session.notify("command/input-with-no-mapping", packed_code); 
      });
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
  "[subscribe('uninstall/cmap_manager') enabled]":
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
    let codes = coUtils.Keyboard.parseKeymapExpression(destination);
    let delegate = function() {
      codes.forEach(function(packed_code) {
//        session.notify("command/input-with-mapping", packed_code); 
      });
    }
    this.register(source, delegate);
  },

  "[subscribe('command/register-cnoremap'), enabled]":
  function registerCnoremap(info)
  {
    let {source, destination} = info;
    let session = this._broker;
    let codes = coUtils.Keyboard.parseKeymapExpression(destination);
    let delegate = function() {
      codes.forEach(function(packed_code) {
//        session.notify("command/input-with-no-mapping", packed_code); 
      });
    }
    this.register(source, delegate);
  },

};

/**
 * @Aspect CommandlineKeyHandler
 * @brief Provides emacs-like keybinds for command line input field.
 */
let CommandlineKeyHandler = new Class().extends(Component);
CommandlineKeyHandler.definition = {

  get id()
    "commandline-key-handler",

  "[cmap('<Esc>', '<C-Esc>', '<C-g>'), enabled]":
  function key_escape(info) 
  {
    let session = this._broker;
    session.notify("command/focus");
    return true;
  },

  "[cmap('<C-b>'), enabled]":
  function key_back(info) 
  {
    let textbox = info.textbox;
    let start = textbox.selectionStart;
    let end = textbox.selectionEnd;
    if (start == end) {
      textbox.selectionStart = start - 1;
      textbox.selectionEnd = start - 1;
    } else {
      textbox.selectionEnd = start;
    }
    return true;
  },

  "[cmap('<C-f>'), enabled]":
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

  "[cmap('<C-k>'), enabled]":
  function key_truncate(info) 
  {
    let textbox = info.textbox;
    let value = textbox.value;
    let start = textbox.selectionStart;
    let end = textbox.selectionEnd;
    if (start == end) {
      textbox.inputField.value 
        = value.substr(0, textbox.selectionStart);
    } else {
      textbox.inputField.value 
        = value.substr(0, textbox.selectionStart) 
        + value.substr(textbox.selectionEnd);
      textbox.selectionStart = start;
      textbox.selectionEnd = start;
    }
    let broker = this._broker;
    broker.notify("command/set-completion-trigger");
    return true;
  },

  "[cmap('<C-h>', '<BS>'), enabled]":
  function key_truncate(info) 
  {
    let textbox = info.textbox;
    let value = textbox.value;
    let position = textbox.selectionEnd;
    if (position > 0) {
      textbox.inputField.value 
        = value.substr(0, position - 1) + value.substr(position);
      let broker = this._broker;
      broker.notify("command/set-completion-trigger");
    }
    return true;
  },
 
  "[cmap('<C-a>'), enabled]":
  function key_first(info) 
  {
    let textbox = info.textbox;
    textbox.selectionStart = 0;
    textbox.selectionEnd = 0;
    return true;
  },

  "[cmap('<C-e>'), enabled]":
  function key_end(info) 
  {
    let textbox = info.textbox;
    let length = textbox.value.length;
    textbox.selectionStart = length;
    textbox.selectionEnd = length;
    return true;
  },

  "[cmap('<C-j>', '<CR>'), enabled]":
  function key_enter(info) 
  {
    let broker = this._broker;
    broker.notify("command/select-current-candidate");
    return true;
  },

  "[cmap('<C-p>', '<Up>', '<S-Tab>'), enabled]":
  function key_down(info) 
  {
    let broker = this._broker;
    broker.notify("command/select-previous-candidate");
    return true;
  },

  "[cmap('<C-n>', '<Down>', '<Tab>'), enabled]":
  function key_next(info) 
  {
    let broker = this._broker;
    broker.notify("command/select-next-candidate");
    return true;
  },

  "[cmap('<C-w>'), enabled]":
  function key_deleteword(info) 
  {
    let textbox = info.textbox;
    let value = textbox.value;
    let position = textbox.selectionEnd;
    textbox.inputField.value
      = value.substr(0, position).replace(/\w+$|\W+$/, "") 
      + value.substr(position);
    let broker = this._broker;
    broker.notify("command/set-completion-trigger");
    return true;
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
}

