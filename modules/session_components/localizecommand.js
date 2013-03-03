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
 * @class LocalizeCommand
 */
var LocalizeCommand = new Class().extends(Plugin);
LocalizeCommand.definition = {

  id: "localize",

  getInfo: function getInfo()
  {
    return {
      name: _("Localize Command"),
      version: "0.1",
      description: _("Provides localize command.")
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

  "[command('localize', ['localize']), _('Edit localization resource.'), pnp]":
  function evaluate(arguments_string)
  {
    var broker = this._broker,
        desktop = broker.parent,
        pattern = /^\s*([a-zA-Z-]+)\s+"((?:[^"])*)"\s+"(.+)"\s*$/,
        match = arguments_string.match(pattern),
        language,
        key,
        value,
        dict;

    if (!match) {
      return {
        success: true,
        message: _("Failed to parse given commandline code."),
      };
    }

    language = match[1];
    key = match[2];
    value = match[3];

    key = key.replace(/\\(?!\\)/g, "\\");
    value = value.replace(/\\(?!\\)/g, "\\");

    dict = coUtils.Localize.getDictionary(language);

    dict[key] = value;
    coUtils.Localize.setDictionary(language, dict);

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
  new LocalizeCommand(broker);
}

// EOF
