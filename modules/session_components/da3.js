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

  /**
   *
   * DA3 — Tertiary Device Attributes
   *
   * In this DA exchange, the host asks for the terminal unit identification 
   * code. This ID code serves as a way to identify each terminal in a system. 
   * The unit ID code is preset at the factory.
   *
   * Host Request
   *
   * The host uses the following sequence to send this request:
   *
   * CSI    =      c        CSI    =      0    c
   * 9/11   3/13   6/3  or  9/11   3/13   3/0  6/3
   *
   * Terminal Response
   *
   * The terminal responds by sending a report terminal unit ID (DECRPTUI) 
   * control string to the host. DECRPTUI is available in VT Level 4 mode only.
   *
   * DCS  !    |      D . . . D   ST
   * 9/0  2/1  7/12   ...         9/12
   *
   * Parameters
   *
   * D...D
   * is the unit ID of the terminal, consisting of four hexadecimal pairs. The
   * first pair represents the manufacturing site code. This code can be any 
   * hexadecimal value from 00 through FF.
   *
   * The last three hexadecimal pairs are the terminal ID number. This number 
   * is unique for each terminal manufactured at that site.
   *
   * Tertiary DA Example
   *
   * Here is a typical tertiary DA exchange.
   *
   * Request (Host to Terminal)   
   *
   * CSI = c or CSI = 0 c      The host asks for the terminal unit ID.
   *
   * DECRPTUI Response (Terminal to host)   
   *
   * DCS ! | 00 01 02 05 ST    The terminal was manufactured at site 00 and 
   *                           has a unique ID number of 125.
   */
  "[profile('vt100'), sequence('CSI =%dc')]":
  function DA3(n) 
  { // Tirtiary DA (Device Attributes)
    if (n !== undefined && n !== 0) {
      coUtils.Debug.reportWarning(
        _("%s sequence [%s] was ignored."),
        arguments.callee.name, Array.slice(arguments));
    } else { //
      let broker = this._broker;
      broker.notify("sequence/DA3");
    }
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


