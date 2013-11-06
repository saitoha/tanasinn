/* -*- Mode: JAVASCRIPT; tab-width: 2; indent-tabs-mode: nil; c-basic-offset: 2 -*-
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
 * Portions created by the Initial Developer are Copyright (C) 2010 - 2013
 * the Initial Developer. All Rights Reserved.
 *
 * ***** END LICENSE BLOCK ***** */

"use strict";

/**
 * @class Move
 */
var MoveShortcut = new Class().extends(Plugin);
MoveShortcut.definition = {

  id: "moveshortcut",

  /** plugin information */
  getInfo: function getInfo()
  {
    return {
      name: _("Move Shortcut"),
      version: "0.1",
      description: _("Enables you to move window by keyboard short cut.")
    };
  },

  "[persistable] enabled_when_startup": true,

  "[persistable] step": 60,

  /** Installs itself.
   *  @param {InstallContext} context A InstallContext object.
   */
  "[install]":
  function install(context)
  {
  },

  /** Uninstalls itself.
   */
  "[uninstall]":
  function uninstall()
  {
  },

  /** Moves window to right.
   *  @param {Object} A shortcut information object.
   */
  "[command('left'), nmap('<M-h>', '<C-S-h>'), _('Move window to left'), pnp]":
  function left(info)
  {
    this.sendMessage("command/move-by", [-this.step, 0]);

    return true;
  },

  /** Moves window down.
   *  @param {Object} A shortcut information object.
   */
  "[command('down'), nmap('<M-j>', '<C-S-j>'), _('Move window down'), pnp]":
  function down(info)
  {
    this.sendMessage("command/move-by", [0, this.step]);

    return true;
  },

  /** Moves window up.
   *  @param {Object} A shortcut information object.
   */
  "[command('up'), nmap('<M-k>', '<C-S-k>'), _('Move window up'), pnp]":
  function up(info)
  {
    this.sendMessage("command/move-by", [0, -this.step]);

    return true;
  },

  /** Moves window to right.
   *  @param {Object} A shortcut information object.
   */
  "[command('right'), nmap('<M-l>', '<C-S-l>'), _('Move window to right'), pnp]":
  function right(info)
  {
    this.sendMessage("command/move-by", [this.step, 0]);

    return true;
  },

  /** test */
  "[test('do-basic-actions'), _('move commands')]":
  function()
  {
    var enabled = this.enabled;

    try {
      this.enabled = false;
      this.enabled = true;
      this.left();
      this.down();
      this.up();
      this.right();
      this.enabled = false;
    } finally {
      this.enabled = enabled;
    }
  },

}; // MoveShortcut


/**
 * @fn main
 * @brief Module entry point.
 * @param {Broker} broker The Broker object.
 */
function main(broker)
{
  new MoveShortcut(broker);
}

// EOF
