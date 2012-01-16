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
 * @class Kill
 */
let Kill = new Class().extends(Plugin);
Kill.definition = {

  get id()
    "kill",

  get info()
    <plugin>
        <name>{_("Kill")}</name>
        <description>{
          _("Kill main process of current TTY session.")
        }</description>
        <version>0.1</version>
    </plugin>,

  /** post-constructor */
  "[subscribe('event/session-started'), enabled]":
  function onLoad(session) 
  {
    this.enabled = this.enabled_when_startup;
  },

  /** Installs itself. */
  install: function install() 
  {
    this.detach.enabled = true;
    this.kill.enabled = true;
    this.onContextMenu.enabled = true;
  }, 

  /** Uninstall itself. */
  uninstall: function() 
  {
    this.detach.enabled = false;
    this.kill.enabled = false;
    this.onContextMenu.enabled = false;
  },

  "[subscribe('get/contextmenu-entries')]":
  function onContextMenu() 
  {
    return [
      {
        tagName: "menuitem",
        label: _("Detach from process"), 
        listener: {
          type: "command", 
          context: this,
          handler: this.detach,
        }
      },
      {
        tagName: "menuitem",
        label: _("Shutdown process"), 
        listener: {
          type: "command", 
          context: this,
          handler: this.kill,
        }
      }
    ];
  },

  /** detach from process */
  "[command('detach'), _('detach from process.')]":
  function detach() 
  {
    // stops TTY device.
    let session = this._broker;
    session.notify("command/detach"); 
    session.stop();
  },

  /** kill process and stop tty */
  "[command('kill'), _('kill process and stop tty')]":
  function kill() 
  {
    // stops TTY device.
    let session = this._broker;
    session.notify("command/kill"); 
    session.stop();
  },
}


/**
 * @fn main
 * @brief Module entry point.
 * @param {Desktop} desktop The Desktop object.
 */
function main(desktop) 
{
  desktop.subscribe(
    "@initialized/broker", 
    function(session) new Kill(session));
}



