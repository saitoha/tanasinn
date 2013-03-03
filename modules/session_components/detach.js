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
 * @class Detach
 */
var Detach = new Class().extends(Plugin);
Detach.definition = {

  id: "detach",

  /** plugin information */
  getInfo: function getInfo()
  {
    return {
      name: _("Detach"),
      version: "0.1",
      description: _("Detach from current TTY session.")
    };
  },

  "[persistable] enabled_when_startup": true,

  /** Installs itself.
   *  @param {InstallContext} context A InstallContext object.
   */
  "[install]":
  function install(context)
  {
  },

  /** Uninstall itself. */
  "[uninstall]":
  function uninstall()
  {
  },

  /** provides menu items */
  "[subscribe('get/contextmenu-entries'), pnp]":
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
    ];
  },

  /** detach from process */
  "[command('detach'), nmap('<M-d>', '<C-S-d>'), _('detach from current process.'), pnp]":
  function detach()
  {
    // stops TTY device.
    this.sendMessage("command/detach");
  },


  /** test */
  "[test]":
  function()
  {
    var enabled = this.enabled;

    try {
      this.enabled = false;
      this.enabled = true;
      this.enabled = false;
    } finally {
      this.enabled = enabled;
    }
  },


}; // Detach


/**
 * @fn main
 * @brief Module entry point.
 * @param {Broker} broker The Broker object.
 */
function main(broker)
{
  new Detach(broker);
}


// EOF
