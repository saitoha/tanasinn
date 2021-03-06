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
 * @class PersistCommand
 */
var PersistCommand = new Class().extends(Plugin);
PersistCommand.definition = {

  id: "persist",

  /** plugin information */
  getInfo: function getInfo()
  {
    return {
      name: _("Persist Commands"),
      version: "0.1",
      description: _("Provides saveprofile/loadprofile/deleteprofile command.")
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


  "[command('saveprofile/sp', ['profile']), _('Persist current settings.'), pnp]":
  function persist(arguments_string)
  {
    var match = arguments_string.match(/^\s*([$_\-@a-zA-Z\.]*)\s*$/),
        profile;

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

  "[command('loadprofile/lp', ['profile']), _('Load a profile.'), pnp]":
  function load(arguments_string)
  {
    var match = arguments_string.match(/^\s*([$_\-@a-zA-Z\.]*)\s*$/),
        profile;

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

  "[command('deleteprofile/dp', ['profile']), _('Delete a profile.'), pnp]":
  function deleteprofile(arguments_string)
  {
    var match = arguments_string.match(/^\s*([$_\-@a-zA-Z\.]*)\s*$/),
        profile;

    if (null === match) {
      return {
        success: false,
        message: _("Failed to parse commandline argument."),
      };
    }

    profile = match[1];

    this.sendMessage("command/delete-settings", profile || undefined);

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


};

/**
 * @fn main
 * @brief Module entry point.
 * @param {Broker} broker The Broker object.
 */
function main(broker)
{
  new PersistCommand(broker);
}

// EOF
