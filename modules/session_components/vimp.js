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
 *  @class Vimperator
 *  @brief apply some fixes for Vimperator-installed environment.
 */
var Vimperator = new Class().extends(Plugin);
Vimperator.definition = {

  id: "vimperator",

  /** plugin information */
  getInfo: function getInfo()
  {
    return {
      name: _("Vimperator"),
      version: "0.1",
      description: _("Apply some fixes for vimperator-installed environment.")
    };
  },

  "[persistable] enabled_when_startup": true,

  /** Installs itself.
   *  @param {InstallContext} context A InstallContext object.
   */
  "[install]":
  function install(context)
  {
    var modules = this._getModules();

    if (modules) {
      this.onGotFocus();
      this.onGotFocus.enabled = true;
      this.onLostFocus.enabled = true;
      this.vimperatorCommand.enabled = true;
    }
  },

  /** Uninstall itself.
   */
  "[uninstall]":
  function uninstall()
  {
    var modules = this._getModules();

    if (modules) {
      this.onLostFocus();
      this.onGotFocus.enabled = false;
      this.onLostFocus.enabled = false;
      this.vimperatorCommand.enabled = false;
    }
  },

  /** install focus event. */
  "[subscribe('event/got-focus | command/focus')]":
  function onGotFocus()
  {
    var modules = this._getModules();

    if (!modules) {
      return;
    }
    modules.modes.isMenuShown = true;
  },

  /** install blur evnet. */
  "[subscribe('event/lost-focus | command/blur | event/before-broker-stopping')]":
  function onLostFocus()
  {
    var modules = this._getModules();

    if (!modules) {
      return;
    }
    modules.modes.isMenuShown = false;
  },

  /** Handles stop event. */
  "[subscribe('@event/broker-stopping'), enabled]":
  function onSessionStopping()
  {
    var modules = this._getModules();
    if (!modules) {
      return;
    }
    modules.events.onEscape();
  },

  /**
   * @command vimperator
   */
  "[command('vimperator')]":
  function vimperatorCommand(arguments_string)
  {
    var liberator = this._getLiberator();

    if (!liberator) {
      return false;
    }
    liberator.execute(arguments_string);

    return true;
  },

  /** get "liberator" */
  _getLiberator: function _getLiberator()
  {
    var liberator = this.request("get/root-element")
      .ownerDocument
      .defaultView
      .liberator;

    if (!liberator) {
      return null;
    }
    return liberator;
  },

  /** get "liberator.modules" */
  _getModules: function _getModules()
  {
    var liberator = this._getLiberator(),
        modules,
        events,
        modes;

    if (!liberator) {
      return null;
    }

    modules = liberator.modules;
    if (!modules) {
      return null;
    }

    events = modules.events;
    if (!events) {
      return null;
    }

    modes = modules.modes;
    if (!modes) {
      return null;
    }

    return modules;
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


} // class


/**
 * @fn main
 * @brief Module entry point.
 * @param {Broker} broker The Broker object.
 */
function main(broker)
{
  new Vimperator(broker);
}

// EOF
