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


/** 
 * @class ForwardInputIterator
 */ 
var ForwardInputIterator = new Class();
ForwardInputIterator.definition = {

  _value: null,
  _position: 0,

  /** Assign new string data. position is reset. */
  initialize: function initialize(value) 
  {
    this._value = value;
    this._position = 0;
  },

  /** Returns single byte code point. */
  current: function current() 
  {
    return this._value.charCodeAt(this._position);
  },

  /** Moves to next position. */
  moveNext: function moveNext() 
  {
    ++this._position;
  },

  /** Returns whether scanner position is at end. */
  get isEnd() 
  {
    return this._position >= this._value.length;
  },
};

/**
 * @class NotificationService
 */
var NotificationService = new Class().extends(Plugin)
                                     .depends("decoder");
NotificationService.definition = {

  id: "alert_service",

  getInfo: function getInfo()
  {
    return {
      name: _("Alert Service"),
      version: "0.1",
      description: _("Provides asyncronous popup alert window.")
    };
  },

  "[persistable] enabled_when_startup": true,

  /** Installs itself.
   *  @param {Broker} broker A Broker object.
   */
  "[install]":
  function install(broker) 
  {
  },

  /** Uninstalls itself. 
   *  @param {Broker} broker A Broker object.
   */
  "[uninstall]":
  function uninstall(broker) 
  {
  },

  "[subscribe('sequence/osc/9'), pnp]":
  function osc9(data)
  {
    var scanner = new ForwardInputIterator(data),
        decoder = this.dependency["decoder"],
        sequence = [c for (c in decoder.decode(scanner))],
        decoded_text = coUtils.Text.safeConvertFromArray(sequence),
        values = decoded_text.split(";"),
        title = values[0],
        text = values[1],
        self = this,
        path = "content/tanasinn.png",
        file = coUtils.File.getFileLeafFromVirtualPath(path),
        url = coUtils.File.getURLSpec(file);

    Components.classes["@mozilla.org/alerts-service;1"]
      .getService(Components.interfaces.nsIAlertsService)
      .showAlertNotification(
        url,
        title,
        text,
        true,  // textClickable
        text,     // cookie
        this,
        "" // name
        ); 
  },

// nsIObserver implementation
  observe: function observe(subject, topic, data) 
  {
    if ("alertclickcallback" === topic) {
      this.sendMessage("command/focus");
    }
  },

  /**
   * Provides runtime type discovery.
   * @param aIID the IID of the requested interface.
   * @return the resulting interface pointer.
   */
  QueryInterface: function QueryInterface(a_IID)
  {
    if (!a_IID.equals(Components.interafaces.nsIObserver)
     && !a_IID.equals(Components.interafaces.nsISupports))
      throw Components.results.NS_ERROR_NOT_IMPLEMENTED;
    return this;
  },
 
}; // NotificationService


/**
 * @class AlertService
 */
var AlertService = new Class().extends(Plugin);
AlertService.definition = {

  id: "notification_service",

  getInfo: function getInfo()
  {
    return {
      name: _("Notification Service"),
      version: "0.1",
      description: _("Provides asyncronous popup notification window.")
    };
  },

  "[persistable] enabled_when_startup": true,

  /** Installs itself.
   *  @param {Broker} broker A Broker object.
   */
  "[install]":
  function install(broker) 
  {
  },

  /** Uninstalls itself. 
   *  @param {Broker} broker A Broker object.
   */
  "[uninstall]":
  function uninstall(broker) 
  {
  },

  "[subscribe('command/show-popup-alert'), pnp]":
  function show(data)
  {
    var self = this;

    try {
      Components.classes["@mozilla.org/alerts-service;1"]
        .getService(Components.interfaces.nsIAlertsService)
        .showAlertNotification(
          "chrome://mozapps/skin/extensions/alerticon-error.png",
          data.title,
          data.text,
          true,  // textClickable
          data.text,     // cookie
          {
            observe: function observe(subject, topic, data) 
            {
              if ("alertclickcallback" === topic) {
                self.sendMessage("command/select-panel", "!console.panel");
              }
            }
          },   // listener
          "" // name
          ); 
    } catch (e) {
      ; // pass
      // Ignore this error.
      // This is typically NS_ERROR_NOT_AVAILABLE,
      // which may happen, for example, on Mac OS X if Growl is not installed.
    }
  },

}; // NotificationSerice

/**
 * @fn main
 * @brief Module entry point.
 * @param {Broker} broker The Broker object.
 */
function main(broker) 
{
  new AlertService(broker);
  new NotificationService(broker);
}

// EOF
