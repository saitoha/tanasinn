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
 *  @class PublishCommand
 */
var PublishCommand = new Class().extends(Plugin);
PublishCommand.definition = {

  id: "publish",

  getInfo: function getInfo()
  {
    return {
      name: _("Publish Command"),
      description: _("Provides publish command."),
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

  /** publish a message */
  "[command('publish', ['event', 'js']), _('Publish a message'), pnp]":
  function publish(arguments_string)
  {
    var pattern = /^(\S+)\s*(.*)$/,
        match = arguments_string.match(pattern),
        topic,
        message;

    if (null === match) {
      return {
        success: false,
        message: _("Ill-formed message."),
      };
    }

    topic = match[1];
    message = match[2];

    this.sendMessage(topic,
                     new Function("return (" + message + ");")())

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


} // class PublishCommand

/**
 * @fn main
 * @brief Module entry point.
 * @param {Broker} broker The Broker object.
 */
function main(broker)
{
  new PublishCommand(broker);
}

// EOF
