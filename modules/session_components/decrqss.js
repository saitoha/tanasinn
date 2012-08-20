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
 *  @class StatusRequest
 */
var StatusRequest = new Class().extends(Plugin);
StatusRequest.definition = {

  get id()
    "request_status_string",

  get info()
    <module>
        <name>{_("Status Request")}</name>
        <version>0.1</version>
        <description>{
          _("Reply against REQRQSS query.")
        }</description>
    </module>,

  "[persistable] enabled_when_startup": true,

  /** installs itself. 
   *  @param {Broker} broker A Broker object.
   */
  "[install]":
  function install(broker) 
  {
  },

  /** Uninstalls itself.
   *  @param {Broker} broker A broker object.
   */
  "[uninstall]":
  function uninstall(broker) 
  {
  },

  "[subscribe('sequence/dcs'), pnp]":
  function onDCS(data) 
  {
    var match, i, chars, value, message, param;

    if (0 === data.indexOf("$q")) {
      data = data.substr(2);
      switch (data) {
        case "\"q":
          // DECSCA
          this.sendMessage("sequence/decrqss/decsca", data);
          break;
        case "\"p":
          // DECSCL
          this.sendMessage("sequence/decrqss/decscl", data);
          break;
        case "r":
          // DECSTBM
          this.sendMessage("sequence/decrqss/decstbm", data);
          break;
        case "m":
          // SGR
          this.sendMessage("sequence/decrqss/sgr", data);
          break;
        case " q":
          // DECSCUSER
          this.sendMessage("sequence/decrqss/decscuser", data);
          break;
        default:
          message = "1$r";
          this.sendMessage("command/send-sequence/dcs", message);
          break;
      }
    }
  },

} // class DRCSBuffer

/**
 * @fn main
 * @brief Module entry point.
 * @param {Broker} broker The Broker object.
 */
function main(broker) 
{
  new StatusRequest(broker);
}

// EOF
