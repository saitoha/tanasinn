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
 * @class PluginManagementCommands
 */
var PluginManagementCommands = new Class().extends(Plugin);
PluginManagementCommands.definition = {

  id: "plugin_management_commands",

  /** plugin information */
  getInfo: function getInfo()
  {
    return {
      name: _("Plugin Management Commands"),
      description: _("Provides enable/disable commands."),
      version: "0.1",
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

  /** Uninstalls itself.
   */
  "[uninstall]":
  function uninstall()
  {
  },

  "[command('disable', ['plugin/enabled']), _('Disable a plugin.'), pnp]":
  function disable(arguments_string)
  {
    return this._impl(arguments_string, /* is_enable */ false);
  },

  "[command('enable', ['plugin/disabled']), _('Enable a plugin.'), pnp]":
  function enable(arguments_string)
  {
    return this._impl(arguments_string, /* is_enable */ true);
  },

  _impl: function _impl(arguments_string, is_enable)
  {
    var match = arguments_string.match(/^(\s*)([$_\-@0-9a-zA-Z\.]+)(\s*)$/),
        modules,
        space,
        name,
        next;

    if (null === match) {
      return {
        success: false,
        message: _("Failed to parse commandline argument."),
      };
    }

    space = match[1];
    name = match[2];
    next = match[3];

    modules = this.sendMessage("get/components");
    modules = modules.filter(
      function(module)
      {
        return module.id === name;
      });
    if (0 === modules.length) {
      return {
        success: false,
        message: _("Cannot enabled the module specified by given argument."),
      };
    }

    modules.forEach(
      function each(module)
      {
        try {
          module.enabled = is_enable;
        } catch(e) {
          coUtils.Debug.reportError(e);
        }
      });

    this.sendMessage("command/calculate-layout");

    return {
      success: true,
      message: _("Succeeded."),
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


}; // PluginManagementCommands


/**
 * @fn main
 * @brief Module entry point.
 * @param {Broker} broker The Broker object.
 */
function main(broker)
{
  new PluginManagementCommands(broker);
}

// EOF
