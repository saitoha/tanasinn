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
        <description>{
          _("Apply some fixes for vimperator-installed environment.")
        }</description>
        <version>0.1</version>
    </module>,
  
  /** Install itself. 
   *  @param {Session} session A session object.
   */
  "[subscribe('install/vimperator'), enabled]":
  function install(session)
  {
    this.onGotFocus();
    this.onGotFocus.enabled = true;  
    this.onLostFocus.enabled = true;  
  },

  /** Uninstall itself. 
   *  @param {Session} session A session object.
   */
  "[subscribe('uninstall/vimperator'), enabled]":
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
  "[subscribe('@event/session-stopping'), enabled]":
  function onSessionStopping() 
  {
    let modules = this._getModules();
    if (!modules)
      return;
    modules.events.onEscape();
  },

  /** get "liberator.modules" */
  _getModules: function _getModules()
  {
    let session = this._broker;
    let window = session.window;
    let liberator = window.liberator;
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
 * @param {Desktop} desktop The Desktop object.
 */
function main(desktop) 
{
  desktop.subscribe(
    "@initialized/broker", 
    function(session) new Vimperator(session));
}


