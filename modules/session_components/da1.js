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
 * @class PrimaryDA
 *
 */
let PrimaryDA = new Class().extends(Plugin);
PrimaryDA.definition = {

  get id()
    "primary_da",

  get info()
    <module>
        <name>{_("Primary Device Attribute")}</name>
        <version>0.1</version>
        <description>{
          _("Reply primary device attribute message against requests.")
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
  "[subscribe('sequence/DA1')]":
  function reply()
  {
//    let reply_map = {
//      "VT100"  : "\x1b[?1;2c"
//      ,"VT100J": "\x1b[?5;2c"
//      ,"VT101" : "\x1b[?1;0c"
//      ,"VT102" : "\x1b[?6c"
//      ,"VT102J": "\x1b[?15c"
//      ,"VT220J": "\x1b[?62;1;2;5;6;7;8c"
//      ,"VT282" : "\x1b[?62;1;2;4;5;6;7;8;10;11c"
//      ,"VT320" : "\x1b[?63;1;2;6;7;8c"
//      ,"VT382" : "\x1b[?63;1;2;4;5;6;7;8;10;15c"
//      ,"VT420" : "\x1b[?64;1;2;7;8;9;15;18;21c"
//      ,"VT520" : "\x1b[?65;1;2;7;8;9;12;18;19;21;23;24;42;44;45;46c"
//      ,"VT525" : "\x1b[?65;1;2;7;9;12;18;19;21;22;23;24;42;44;45;46c"
//    };
    let reply = [
      "\x1b[?65" // header
    ]
    //reply.push(65) // VT520
    //if (this.length >= 132) 
    //reply.push(1) // 132 columns
    //reply.push(2) // Printer
    //reply.push(6) // Selective erase
    //reply.push(7) // Soft character set (DRCS)
    //reply.push(8) // User-defined keys
    //reply.push(9) // National replacememnt character sets
    //reply.push(15) // Technical characters
    //reply.push(22) // ANSI color
    //reply.push(29) // ANSI text locator (i.e., DEC Locator mode)
    //let message = reply.join(";") + "c";
    let message = "\x1b[?1;2c";
    //let message = "\x1b[?1;2;6c";
    //let message = "\x1b[?c";
    let broker = this._broker;
    //coUtils.Timer.setTimerout(function() {
    broker.notify("command/send-to-tty", message);
    coUtils.Debug.reportMessage(
      _("Primary Device Attributes: '%s'."), 
      message.replace("\x1b", "\\e"));
    //}, 100);
  },

};

/**
 * @fn main
 * @brief Module entry point.
 * @param {Broker} broker The Broker object.
 */
function main(broker) 
{
  new PrimaryDA(broker);
}


