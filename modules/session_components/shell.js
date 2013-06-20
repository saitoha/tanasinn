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
 * @trait ShellSettings
 */
var ShellSettings = new Class().extends(Plugin)
                               .depends("tty");
ShellSettings.definition = {

  id: "shell_settings",

  /** provide plugin information */
  getInfo: function getInfo()
  {
    return {
      name: _("Shell Settings"),
      version: "0.1",
      description: _("Provides shell settings information.")
    };
  },

  "[persistable] enabled_when_startup": true,
  "[persistable] term": "xterm",
  "[persistable] command": "login -pf $USER",
  "[persistable] locale": coUtils.Localize.locale.replace(/-/, "_") + ".UTF-8",

  /** Installs itself.
   *  @param {InstallContext} context A InstallContext object.
   */
  "[install]":
  function install(context)
  {
    var broker = this._broker;

    this.term = broker.term;
    this.command = broker.command;

    this.sendMessage(
      "command/start-tty-service",
      {
        term: this.term,
        command: this.command,
        locale: this.locale,
      });
  },

  /** Uninstalls itself.
   */
  "[uninstall]":
  function uninstall()
  {
  },

  /** set $TERM environment value */
  "[subscribe('command/set-environment/term'), pnp]":
  function setTerm(term)
  {
    this.term = term;
  },

  /** set start up command setting */
  "[subscribe('command/set-environment/command'), pnp]":
  function setLocale(command)
  {
    this.command = command;
  },

  /** set locale environment value setting */
  "[subscribe('command/set-environment/locale'), pnp]":
  function setLocale(locale)
  {
    this.locale = locale;
  },

  /** called when the broker is initialized */
  "[subscribe('event/session-initialized'), pnp]":
  function onSessionInitialized(session)
  {
    this.sendMessage("command/send-titlebar-string", this.command);
  },

  /** test */
  "[test]":
  function()
  {
    var enabled = this.enabled;

    try {
      assert(this.term);
      assert(this.command);
    } finally {
    }
  },


}; // ShellSettings

/**
 * @fn main
 * @brief Module entry point.
 * @param {Broker} broker The Broker object.
 */
function main(broker)
{
  new ShellSettings(broker);
}

// EOF
