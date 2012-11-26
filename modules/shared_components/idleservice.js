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
 * @class IdleService
 *
 */
var IdleService = new Class().extends(Plugin);
IdleService.definition = {

  id: "idle_service",

  getInfo: function getInfo()
  {
    return {
      name: _("Idle Service"),
      version: "0.1",
      description: _("Invoke idle notification.")
    };
  },

  "[persistable] enabled_when_startup": true,
  "[persistable, watchable] timer_interval": 10,

  _idle_service: null,

  /** Installs itself. 
   *  @param {InstallContext} context A InstallContext object.
   */
  "[install]": 
  function install(context) 
  {
    this._idle_service = Components
      .classes["@mozilla.org/widget/idleservice;1"]
      .getService(Components.interfaces.nsIIdleService);

    this.set();
  },

  /** Uninstalls itself. 
   */
  "[uninstall]": 
  function uninstall() 
  {
    this.reset();

    this._idle_service = null;
  },

  set: function set()
  {
    this._idle_service.addIdleObserver(this, this.timer_interval);
  },

  reset: function reset()
  {
    this._idle_service.removeIdleObserver(this, this.timer_interval);
  },

  observe: function observe(subject, topic, data)
  {
    this.reset();
    this.sendMessage("event/idle");
    this.set();
  },
 
// nsIObserver implementation
  /**
   * Provides runtime type discovery.
   * @param aIID the IID of the requested interface.
   * @return the resulting interface pointer.
   */
  QueryInterface: function QueryInterface(a_IID)
  {
    if (!a_IID.equals(Components.interafaces.nsIObserver) 
     && !a_IID.equals(Components.interafaces.nsISupports)) {
      throw Components.results.NS_ERROR_NOT_IMPLEMENTED;
    }
    return this;
  },


}; // IdleService

/**
 * @fn main
 * @brief Module entry point.
 * @param {Broker} broker The Broker object.
 */
function main(broker) 
{
  new IdleService(broker);
}

// EOF
