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
 *  @class ShellRPC
 */
let ShellRPC = new Class().extends(Plugin);
ShellRPC.definition = {

  get id()
    "shell_rpc",

  get info()
    <module>
        <name>{_("Shell RPC")}</name>
        <version>0.1</version>
        <description>{
          _("Provides command line bridge between shell <-> tanasinn.")
        }</description>
    </module>,

  /** installs itself. 
   *  @param {Session} session A session object.
   */
  "[subscribe('install/shell_rpc'), enabled]":
  function install(session) 
  {
    this.onCall.enabled = true;
  },

  /** Uninstalls itself.
   *  @param {Session} session A session object.
   */
  "[subscribe('uninstall/shell_rpc'), enabled]":
  function uninstall(session) 
  {
    this.onCall.enabled = false;
  },

  "[subscribe('sequence/osc/220'), enabled]":
  function onCall(command) 
  {
    let session = this._broker;
    session.notify("command/eval-commandline", command);
  },

} // class OverlayIndicator

/**
 * @fn main
 * @brief Module entry point.
 * @param {Broker} broker The Broker object.
 */
function main(broker) 
{
  new ShellRPC(broker);
}


