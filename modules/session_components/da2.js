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
 * @class SecondaryDA
 *
 */
let SecondaryDA = new Class().extends(Plugin);
SecondaryDA.definition = {

  get id()
    "secondary_da",

  get info()
    <module>
        <name>{_("Secondary Device Attribute")}</name>
        <version>0.1</version>
        <description>{
          _("Reply Secondary device attribute message against requests.")
        }</description>
    </module>,


  "[persistable] enabled_when_startup": true,

  /** installs itself. 
   *  @param {Broker} broker A Broker object.
   */
  "[subscribe('install/secondary_da'), enabled]":
  function install(broker) 
  {
    this.reply.enabled = true;
  },

  /** Uninstalls itself.
   *  @param {Broker} broker A broker object.
   */
  "[subscribe('uninstall/secondary_da'), enabled]":
  function uninstall(broker) 
  {
    this.reply.enabled = false;
  },

  /** retuns Device Attribute message */
  "[subscribe('sequence/DA2')]":
  function reply()
  {
    let reply = [];
    reply.push(32);
    reply.push(277); // Firmware version (for xterm, this is the XFree86 patch number, starting with 95). 
    reply.push(2);   // DEC Terminal"s ROM cartridge registration number, always zero.
    let message = "\x1b[>" + reply.join(";") + "c";
    let broker = this._broker;
    broker.notify("command/send-to-tty", message);
    coUtils.Debug.reportMessage(
      _("Secondary Device Attributes is requested. reply: '%s'."), 
      message.replace("\x1b", "\\e"));
  },

};

/**
 * @fn main
 * @brief Module entry point.
 * @param {Broker} broker The Broker object.
 */
function main(broker) 
{
  new SecondaryDA(broker);
}


