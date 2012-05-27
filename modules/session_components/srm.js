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
 * @class SendReceiveMode
 *
 * SRM — Local Echo: Send/Receive Mode
 *
 * This control function turns local echo on or off. When local echo is on,
 * the terminal sends keyboard characters to the screen. The host does not 
 * have to send (echo) the characters back to the terminal display. When 
 * local echo is off, the terminal only sends characters to the host. It is 
 * up to the host to echo characters back to the screen.
 *
 * Default: No local echo
 *
 * Format
 *
 * CSI    1    2    h
 * 9/11   3/1  3/2  6/8
 *
 * Set: local echo off.
 * 
 *
 * CSI    1    2    l
 * 9/11   3/1  3/2  6/12
 *
 * Reset: local echo on.
 *
 * Description
 *
 * When the SRM function is set, the terminal sends keyboard characters to
 * the host only. The host can echo the characters back to the screen.
 *
 * When the SRM function is reset, the terminal sends keyboard characters to
 * the host and to the screen. The host does have to echo characters back to
 * the terminal.
 *
 */
var SendReceiveMode = new Class().extends(Plugin);
SendReceiveMode.definition = {

  get id()
    "send_receive_mode",

  get info()
    <module>
        <name>{_("SRM Switch")}</name>
        <version>0.1</version>
        <description>{
          _("Switch local echo mode(SRM) with escape seqnence.")
        }</description>
    </module>,


  "[persistable] enabled_when_startup": true,

  /** set new line.
   */
  "[subscribe('sequence/sm/12'), pnp]":
  function activate() 
  { 
    // enable insert mode.
    this.sendMessage("set/local-echo-mode", false);
  },

  /** set line feed.
   */
  "[subscribe('sequence/rm/12'), pnp]":
  function deactivate() 
  {
    // disable insert mode.
    this.sendMessage("set/local-echo-mode", true);
  },

}; // class SendReceiveMode

/**
 * @fn main
 * @brief Module entry point.
 * @param {Broker} broker The Broker object.
 */
function main(broker) 
{
  new SendReceiveMode(broker);
}


