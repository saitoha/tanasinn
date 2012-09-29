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
  "[persistable] locale": "ja_JP.UTF-8",

  /** Installs itself.
   *  @param broker {Broker} A broker object.
   */
  "[install]":
  function install(broker) 
  {
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
   *  @param broker {Broker} A broker object.
   */
  "[uninstall]":
  function uninstall(broker) 
  {
  },

  "[subscribe('command/set-environment/term'), pnp]":
  function setTerm(term) 
  {
    this.term = term;
  },

  "[subscribe('command/set-environment/command'), pnp]":
  function setLocale(command) 
  {
    this.command = command;
  },

  "[subscribe('command/set-environment/locale'), pnp]":
  function setLocale(locale) 
  {
    this.locale = locale;
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
