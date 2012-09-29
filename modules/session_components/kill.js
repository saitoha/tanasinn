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
 * @class Kill
 */
var Kill = new Class().extends(Plugin);
Kill.definition = {

  id: "kill",

  getInfo: function getInfo()
  {
    return {
      name: _("Kill"),
      version: "0.1",
      description: _("Kill main process of current TTY session.")
    };
  },

  "[persistable] enabled_when_startup": true,

  /** Installs itself. */
  "[install]":
  function install() 
  {
    this.detach.enabled = true;
    this.kill.enabled = true;
    this.onContextMenu.enabled = true;
  }, 

  /** Uninstall itself. */
  "[uninstall]":
  function uninstall() 
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
    var broker;

    // stops TTY device.
    this.sendMessage("command/detach"); 
  },

  /** kill process and stop tty */
  "[command('kill/quit'), _('kill process and stop tty')]":
  function kill() 
  {
    // stops TTY device.
    this.sendMessage("command/kill"); 

    broker = this._broker;
    coUtils.Timer.setTimeout(function() {
      broker.stop(); 
    }, 1500);
  },
}


/**
 * @fn main
 * @brief Module entry point.
 * @param {Broker} broker The Broker object.
 */
function main(broker) 
{
  new Kill(broker);
}


// EOF
