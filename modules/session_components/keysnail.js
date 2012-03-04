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
 *  @class KeySnail
 *  @brief apply some fixes for KeySnail-installed environment. 
 */
let KeySnail = new Class().extends(Plugin);
KeySnail.definition = {

  get id()
    "keysnail",

  get info()
    <module>
        <name>KeySnail</name>
        <description>{
          _("Apply some fixes for keysnail-installed environment.")
        }</description>
        <version>0.1</version>
    </module>,
  
  /** Install itself. 
   *  @param {Session} session A session object.
   */
  "[subscribe('install/keysnail'), enabled]":
  function install(session)
  {
    this.onGotFocus();
    this.onGotFocus.enabled = true;  
    this.onLostFocus.enabled = true;  

  },

  /** Uninstall itself. 
   *  @param {Session} session A session object.
   */
  "[subscribe('uninstall/keysnail'), enabled]":
  function uninstall(session) 
  {
    this.onLostFocus();
    this.onGotFocus.enabled = false;  
    this.onLostFocus.enabled = false;  
  },

  /** install focus event. */
  "[subscribe('event/got-focus | command/focus')]":
  function onGotFocus() 
  {
    let key = this._getKeyModule();
    if (!key) {
      return;
    }
    if (key.status) {
      key.toggleStatus();
    }
  },

  /** install blur evnet. */
  "[subscribe('event/lost-focus | command/blur')]":
  function onLostFocus() 
  {
    let key = this._getKeyModule();
    if (!key) {
      return;
    }
    if (!key.status) {
      key.toggleStatus();
    }
  },

  /** Handles stop event. */
  "[subscribe('@event/broker-stopping'), enabled]":
  function onSessionStopping() 
  {
    this.onLostFocus();
  },

  /** get "KeySnail.modules" */
  _getKeyModule: function _getKeyModule()
  {
    let session = this._broker;
    let window = session.window;
    let keysnail = window.KeySnail;
    if (!keysnail) {
      return null;
    }

    let modules = keysnail.modules;
    if (!modules) {
      return null;
    }
    
    let key = modules.key;
    if (!key) {
      return null;
    }

    return key;
  },

} // class 


/**
 * @fn main
 * @brief Module entry point.
 * @param {Broker} broker The Broker object.
 */
function main(broker) 
{
  new KeySnail(broker);
}


