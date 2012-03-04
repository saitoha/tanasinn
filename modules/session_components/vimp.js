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
 *  @class Vimperator
 *  @brief apply some fixes for Vimperator-installed environment. 
 */
let Vimperator = new Class().extends(Plugin);
Vimperator.definition = {

  get id()
    "vimperator",

  get info()
    <module>
        <name>Vimperator</name>
        <version>0.1</version>
        <description>{
          _("Apply some fixes for vimperator-installed environment.")
        }</description>
    </module>,
  
  /** Install itself. 
   *  @param {Session} session A session object.
   */
  "[subscribe('install/vimperator'), enabled]":
  function install(session)
  {
    let modules = this._getModules();
    if (modules) {
      this.onGotFocus();
      this.onGotFocus.enabled = true;  
      this.onLostFocus.enabled = true;  
      this.vimperatorCommand.enabled = true;  
    }
  },

  /** Uninstall itself. 
   *  @param {Session} session A session object.
   */
  "[subscribe('uninstall/vimperator'), enabled]":
  function uninstall(session) 
  {
    let modules = this._getModules();
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
    let modules = this._getModules();
    if (!modules)
      return;
    modules.modes.isMenuShown = true;
  },

  /** install blur evnet. */
  "[subscribe('event/lost-focus | command/blur')]":
  function onLostFocus() 
  {
    let modules = this._getModules();
    if (!modules)
      return;
    modules.modes.isMenuShown = false;
  },

  /** Handles stop event. */
  "[subscribe('@event/broker-stopping'), enabled]":
  function onSessionStopping() 
  {
    let modules = this._getModules();
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
    let liberator = this._getLiberator();
    if (!liberator)
      return false;
    liberator.execute(arguments_string);
    return true;
  },

  /** get "liberator" */
  _getLiberator: function _getLiberator()
  {
    let session = this._broker;
    let window = session.window;
    let liberator = window.liberator;
    if (!liberator)
      return null;
    return liberator;
  },
    
  /** get "liberator.modules" */
  _getModules: function _getModules()
  {
    let liberator = this._getLiberator();
    if (!liberator)
      return null;

    let modules = liberator.modules;
    if (!modules)
      return null;
    
    let events = modules.events;
    if (!events)
      return null;

    let modes = modules.modes;
    if (!modes)
      return null;

    return modules;
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


