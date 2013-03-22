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
 * @class SetCommand
 */
var SetCommand = new Class().extends(Plugin);
SetCommand.definition = {

  id: "setcommand",

  /** plugin information */
  getInfo: function getInfo()
  {
    return {
      name: _("Set Command"),
      version: "0.1",
      description: _("Provides set command.")
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

  "[command('set', ['option']), _('Set an option.'), enabled]":
  function evaluate(arguments_string)
  {
    var broker = this._broker,
        modules = this.sendMessage("get/components"),
        pattern = /^\s*([$_a-zA-Z0-9\.\-]+)\.([$_a-zA-Z]+)\s*(=?)\s*/,
        match = arguments_string.match(pattern),
        all,
        component_name,
        property,
        equal,
        candidates,
        module,
        code,
        result;

    modules.push(broker);

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
          return module.id === component_name;
        }
        return false;
      });
    if (0 === candidates.length) {
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

  /** test */
  "[test]":
  function()
  {
    var enabled = this.enabled;

    try {
      this.enabled = false;
      this.enabled = true;
      this.enabled = false;
    } finally {
      this.enabled = enabled;
    }
  },


};

/**
 * @fn main
 * @brief Module entry point.
 * @param {Broker} broker The Broker object.
 */
function main(broker)
{
  new SetCommand(broker);
}

// EOF
