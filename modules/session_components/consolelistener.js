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
 * @class ConsoleListener
 * Listen console messages and pass them to display manager.
 */
var ConsoleListener = new Class().extends(Plugin)
                                 .depends("displaymanager");
ConsoleListener.definition = {

  id: "consolelistener",

  /** plugin information */
  getInfo: function getInfo()
  {
    return {
      name: _("Message Filter"),
      version: "0.1",
      description: _("Receives raw console messages and formats them.")
    };
  },

  "[persistable] enabled_when_startup": true,
  "[persistable] register_delay": 1000,

  _console_service: null,
  _display_manager: null,

  /** Installs itself.
   *  @param {InstallContext} context A InstallContext object.
   */
  "[install]":
  function install(context)
  {
    this._console_service = coUtils.Components.getConsoleService();
    this._display_manager = context["displaymanager"];

    // set unregistration listener.
    //this.onQuitApplication.enabled = true;
    this.detach.enabled = true;
    this.onSessionStopping.enabled = true;

    coUtils.Timer.setTimeout(function()
      {
        // register object which implements nsIConsoleListener.
        this.register();

        // get histrical console messages and show them.
        this._trackHistricalMessages(this);
      }, this.register_delay, this);
  },

  /** Uninstalls itself.
   */
  "[uninstall]":
  function uninstall()
  {
    this._console_service = null;
    this._display_manager = null;
  },

  "[subscribe('@command/detach')]":
  function detach()
  {
    coUtils.Timer.setTimeout(this.unregister, 10, this);
  },

  "[subscribe('@event/broker-stopping')]":
  function onSessionStopping()
  {
    coUtils.Timer.setTimeout(this.unregister, 10, this);
  },

// nsIConsoleListener
  /**
   * @param {nsIConsoleMessage} console_message nsIConsoleMessage beging posted.
   */
  observe: function observe(console_message)
  {
    var message;

    try {
      message = console_message.message;

      if (/tanasinn/i.test(message)) {
        if (null !== this._display_manager) {
          this._display_manager.append(message);
        }
      }
    } catch (e) {
      try {
        this.unregister(this);
        coUtils.Debug.reportWarning(e);
      } catch (e) {
        // Nothing to do.
        // To guard against stack overflow,
        // we MUST not emit any console output.
      }
    }
  },

  /** Register isself to console service */
  register: function register()
  {
    // register listener.
    this._console_service.registerListener(this);
  },

  /** Unregister isself from console service */
  unregister: function unregister()
  {
    var console_service = this._console_service;

    if (console_service) {
      coUtils.Debug.reportMessage(
        _("Unregister listener from console service."));
      this._console_service.unregisterListener(this);
      coUtils.Debug.reportMessage(
        _("Succeeded to unregister console listener."));
      this.onSessionStopping.enabled = false;
      //this.onQuitApplication.enabled = false;
      this._console_service = null;
    }
  },

  /** Get recent console messages from buffer of console services. */
  _getMessages: function _getMessages()
  {
    var message_array,
        count = {};

    // get latest 250 messages.
    message_array = this._console_service.getMessageArray(count);
    return message_array;
  },

  _trackHistricalMessages: function _trackHistricalMessages()
  {
    var message_array,
        messages,
        i,
        version_comparator = coUtils.Services.versionComparator,
        version = coUtils.Runtime.version;

    // Workaround for BUG 664695
    // https://bugzilla.mozilla.org/show_bug.cgi?id=664695
    if (version_comparator.compare(version, "19.0") >= 0) {
      // in case messages are not found, consoleService returns null.
      messages = this._getMessages();
      for (i = 0; i < messages.length; ++i) {
        this.observe(messages[i]);
      }
    }
  },

  /** test */
  "[test]":
  function()
  {
    var enabled = this.enabled;

    //try {
    //  this.enabled = false;
    //  this.enabled = true;
    //  this.enabled = false;
    //} finally {
    //  this.enabled = enabled;
    //}
  },


};

/**
 * @fn main
 * @brief Module entry point.
 * @param {Broker} broker The Broker object.
 */
function main(broker)
{
  new ConsoleListener(broker);
}

// EOF
