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

"use strict";


/**
 * @class CharsetCommands
 */
var CharsetCommands = new Class().extends(Plugin);
CharsetCommands.definition = {

  id: "charset",

  getInfo: function getInfo()
  {
    return {
      name: _("Charset Commands"),
      version: "0.1",
      description: _("Provides encoder/decoder command.")
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


  _impl: function _impl(arguments_string, is_encoder) 
  {
    var modules, name;

    modules = this.sendMessage(is_encoder ? "get/encoders": "get/decoders");

    name = arguments_string.replace(/^\s+|\s+$/g, "");
    modules = modules.filter(function(module) module.charset === name);

    if (1 !== modules.length) {
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
 * @fn main
 * @brief Module entry point.
 * @param {Broker} broker The Broker object.
 */
function main(broker)
{
  new CharsetCommands(broker);
}

// EOF
