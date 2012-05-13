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
 * @class TirtiaryDA
 *
 */
let TirtiaryDA = new Class().extends(Plugin);
TirtiaryDA.definition = {

  get id()
    "tirtiary_da",

  get info()
    <module>
        <name>{_("Tirtiary Device Attribute")}</name>
        <version>0.1</version>
        <description>{
          _("Reply Tirtiary device attribute message against requests.")
        }</description>
    </module>,


  "[persistable] enabled_when_startup": true,

  /** installs itself. 
   *  @param {Broker} broker A Broker object.
   */
  "[install]":
  function install(broker) 
  {
    this.reply.enabled = true;
  },

  /** Uninstalls itself.
   *  @param {Broker} broker A broker object.
   */
  "[uninstall]":
  function uninstall(broker) 
  {
    this.reply.enabled = false;
  },

  /** retuns Device Attribute message */
  "[subscribe('sequence/DA3')]":
  function reply()
  {
    let reply = ["\x1bP!|"]; // DCS ! |
    reply.push("FF");
    reply.push("FF");
    reply.push("FF");
    reply.push("FF");
    reply.push("\x1b\\");
    let message = reply.join("");
    let broker = this._broker;
    broker.notify("command/send-to-tty", message);
    coUtils.Debug.reportMessage(
      _("Tirtiary Device Attributes is requested. reply: '%s'."), message);

  },

}; // class TirtiaryDA

/**
 * @fn main
 * @brief Module entry point.
 * @param {Broker} broker The Broker object.
 */
function main(broker) 
{
  new TirtiaryDA(broker);
}


