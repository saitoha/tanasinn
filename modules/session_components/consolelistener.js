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
 * @class ConsoleListener
 * Listen console messages and pass them to display manager.
 */ 
var ConsoleListener = new Class().extends(Plugin)
                                 .depends("displaymanager");
ConsoleListener.definition = {

  id: "consolelistener",

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
        this._display_manager.append(message);
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
    coUtils.Debug.reportMessage(
      _("Unregister listener from console service."));
    this._console_service.unregisterListener(this);
    coUtils.Debug.reportMessage(
      _("Succeeded to unregister console listener."));
    this.onSessionStopping.enabled = false;
    //this.onQuitApplication.enabled = false;
  },

  /** Get recent console messages from buffer of console services. */
  _getMessageArray: function _getMessageArray()
  {
    var message_array;
    
    // get latest 250 messages.
    message_array = {};
    this._console_service.getMessageArray(message_array, {});
    return message_array;
  },

  _trackHistricalMessages: function _trackHistricalMessages()
  {
    var message_array;

    // in case messages are not found, consoleService returns null.
    message_array = this._getMessageArray();
    if (null !== message_array) {
      //for (var [index, message] in Iterator(message_array.value.reverse())) {
      //  if (/tanasinn_initialize/.test(message.message)) {
          message_array.value
      //      .slice(0, index + 1)
      //      .reverse()
            .forEach(function(message) this.observe(message), this);
      //    break;
      //  }
      //}
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
  new ConsoleListener(broker);
}

// EOF
