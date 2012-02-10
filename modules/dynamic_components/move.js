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
 * @class Move
 */
let MoveShortcut = new Class().extends(Plugin);
MoveShortcut.definition = {

  get id()
    "moveshortcut",

  get info()
    <plugin>
        <name>{_("Move Shortcut")}</name>
        <description>{
          _("Enables you to move window by keyboard short cut.")
        }</description>
        <version>0.1</version>
    </plugin>,

  "[persistable] step": 60,

  /** Installs itself. 
   *  @param {Session} session A Session object.
   */
  "[subscribe('install/moveshortcut')]":
  function install(session) 
  {
    this.left.enabled = true;
    this.down.enabled = true;
    this.up.enabled = true;
    this.right.enabled = true;
  },
  
  /** Uninstalls itself.
   *  @param {Session} session A Session object.
   */
  "[subscribe('uninstall/moveshortcut')]":
  function uninstall(session) 
  {
    this.left.enabled = false;
    this.down.enabled = false;
    this.up.enabled = false;
    this.right.enabled = false;
  },

  /** Moves window to right. 
   *  @param {Object} A shortcut information object.
   */
  "[command('left'), nmap('<M-h>', '<C-S-h>'), _('Move window to left')]":
  function left(info)
  {
    let session = this._broker;
    session.notify("command/move-by", [-this.step, 0]);
    return true;
  },

  /** Moves window down. 
   *  @param {Object} A shortcut information object.
   */
  "[command('down'), nmap('<M-j>', '<C-S-j>'), _('Move window down')]":
  function down(info)
  {
    let session = this._broker;
    session.notify("command/move-by", [0, this.step]);
    return true;
  },

  /** Moves window up. 
   *  @param {Object} A shortcut information object.
   */
  "[command('up'), nmap('<M-k>', '<C-S-k>'), _('Move window up')]":
  function up(info)
  {
    let session = this._broker;
    session.notify("command/move-by", [0, -this.step]);
    return true;
  },

  /** Moves window to right. 
   *  @param {Object} A shortcut information object.
   */
  "[command('right'), nmap('<M-l>', '<C-S-l>'), _('Move window to right')]":
  function right(info)
  {
    let session = this._broker;
    session.notify("command/move-by", [this.step, 0]);
    return true;
  },

  "[subscribe('command/test')]":
  function onTest()
  { 
    let enabled = this.enabled;
    return {
      context: this,
      action: [
        function() this.enabled = false,
        function() this.enabled = true,
        function() this.left(),
        function() this.down(),
        function() this.up(),
        function() this.right(),
        function() this.enabled = false,
        function() this.enabled = enabled,
      ],
    };
  }

};


/**
 * @fn main
 * @brief Module entry point.
 * @param {Desktop} desktop The Desktop object.
 */
function main(desktop)
{
  desktop.subscribe(
    "@initialized/broker", 
    function(session) new MoveShortcut(session));
}

