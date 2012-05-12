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
 *  @class FocusEvent
 */
let FocusEvent = new Class().extends(Plugin);
FocusEvent.definition = {

  get id()
    "focus_event",

  get info()
    <plugin>
        <name>{_("Focus Event")}</name>
        <description>{
          _("Send focus/blur events.")
        }</description>
        <version>0.1</version>
    </plugin>,

  "[persistable] enabled_when_startup": true,

  _focus_mode: false,

  /** Installs itself. */
  "[subscribe('install/focus_event'), enabled]":
  function install(broker) 
  {
    /** Start to listen mouse event. */
    this.backup.enabled = true;
    this.restore.enabled = true;
    this.onGotFocus.enabled = true;
    this.onLostFocus.enabled = true;
    this.onFocusReportingModeChanged.enabled = true;
  },

  /** Uninstalls itself. */
  "[subscribe('uninstall/focus_event'), enabled]":
  function uninstall(broker) 
  {
    // unregister mouse event DOM listeners.
    this.backup.enabled = false;
    this.restore.enabled = false;
    this.onGotFocus.enabled = false;
    this.onLostFocus.enabled = false;
    this.onFocusReportingModeChanged.enabled = false;
  },

  "[subscribe('command/backup')]": 
  function backup(context) 
  {
    context.focus_event = {
      focus_mode: this._focus_mode,
    }; 
  },

  "[subscribe('command/restore')]": 
  function restore(context) 
  {
    if (context.mouse) {
      this._focus_mode = context.focus_event.focus_mode;
    }
  },
  
  /** Fired at the focus reporting mode is changed. */
  "[subscribe('event/focus-reporting-mode-changed')]": 
  function onFocusReportingModeChanged(mode) 
  {
    this._focus_mode = mode;
  },

  "[subscribe('event/got-focus')]":
  function onGotFocus()
  {
    this.onLostFocus.enabled = true;
    this.onGotFocus.enabled = false;
    if (!this._focus_mode) {
      return;
    }
    let broker = this._broker;
    let message = "\x1b[I"; // focus in
    broker.notify("command/send-to-tty", message);
  },

  "[subscribe('event/lost-focus')]":
  function onLostFocus()
  {
    this.onLostFocus.enabled = false;
    this.onGotFocus.enabled = true;
    if (!this._focus_mode) {
      return;
    }
    let broker = this._broker;
    let message = "\x1b[O"; // focus out
    broker.notify("command/send-to-tty", message);
  },

}; // class FocusEvent


/**
 * @fn main
 * @brief Module entry point.
 * @param {Broker} broker The Broker object.
 */
function main(broker) 
{
  new FocusEvent(broker);
}

