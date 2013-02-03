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
 * @class SetGlobalCommand
 *
 */
var SetGlobalCommand = new Class().extends(Plugin);
SetGlobalCommand.definition = {

  id: "setglobalcommand",

  getInfo: function getInfo()
  {
    return {
      name: _("Global Set Command"),
      version: "0.1",
      description: _("Provides setglobal command.")
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

  "[command('setglobal', ['option/global']), _('Set a global option.'), pnp]":
  function evaluate(arguments_string)
  {
    var desktop = this._broker._broker,
        modules = desktop.notify("get/components"),
        pattern = /^\s*([$_a-zA-Z\.\-]+)\.([$_a-zA-Z]+)(=?)/y,
        match = arguments_string.match(pattern),
        result,
        code;

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
        return module.id === component_name;
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
 * @fn main
 * @brief Module entry point.
 * @param {Broker} broker The Broker object.
 */
function main(broker)
{
  new SetGlobalCommand(broker);
}

// EOF
