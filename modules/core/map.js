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
 * @class MappingManager
 * @brief Manage mappings.
 */
let MappingManager = new Class().extends(Plugin);
MappingManager.definition = {

  get id()
    "mapping_manager",

  _map: null,
  _context: null,

  /** post-constructor */
  "[subscribe('event/session-started'), enabled]": 
  function onLoad(session) 
  {
    this.enabled = this.enabled_when_startup;
  },

  /** Installs itself. 
   *  @param {Session} a session object.
   *  @notify initialized/inputmanager
   */
  "[subscribe('install/' + this.id)]":
  function install(session)
  {
    this._context = this._map = {};
    let cmaps = session.notify("get/cmap");
    cmaps.forEach(function(delegate) {
      delegate.expressions.forEach(function(expression) {
        let packed_code_array = coUtils.Keyboard.parseKeymapExpression(expression);
        let context = this._map;
        packed_code_array.forEach(function(key_code) {
          context = context[key_code] = context[key_code] || {};
        }, this);
        context.value = delegate;
      }, this);
    }, this);
    session.notify(<>initialized/{this.id}</>, this);
  },

  /** Uninstalls itself. 
   *  @param {Session} a session object.
   */
  "[subscribe('uninstall/' + this.id)]":
  function uninstall(session)
  {
  },

  /** Handles command line input event and dispatches stored cmap handler. 
   *  @param {Object} An object includes XUL textbox field element and key code.
   */ 
  "[subscribe('event/commandline-input'), enabled]":
  function onCommandlineInput(info)
  {
    let { textbox, code } = info;
    let result = this._context = this._context[code];
    if (result && result.value) {
      this._context = this._map;
      return result.value(info);
    } else if (!result) {
      this._context = this._map;
    }
    return undefined;
  },
} 

/**
 * @fn main
 * @brief Module entry point.
 * @param {Desktop} desktop The Desktop object.
 */
function main(desktop) 
{
  desktop.subscribe(
    "@initialized/broker", 
    function(session) new MappingManager(session));
}

