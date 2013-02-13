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
 *  @class StatusRequest
 *
 * DECRQSS - Request Selection or Setting
 *
 * The host requests the terminal setting. See DECRPSS for the terminal's
 * response.
 *
 * Format
 *
 * DCS   $     q     D . . . D  ST
 * 9/0   2/4   7/1   * ...      9/12
 *
 * Parameters
 *
 * D ... D
 * indicates the current setting of a valid control function that the host
 * asked about. D . . . D consists of all the characters in the control
 * function, except the CSI (9/11) or ESC [(1/11, 5/11) introducer characters.
 *
 *
 * Description
 *
 * DECRQSS (and DECRPSS) support the following settings or selections:
 *
 * Setting                            Mnemonic  Final Character(s)
 * --------------------------------------------------------------------
 * Select Active Status Display       DECSASD   $ }
 * Select Attribute Change Extent     DECSACE   * x
 * Set Character Attribute            DECSCA    " q
 * Set Conformance Level              DECSCL    " p
 * Set Columns Per Page               DECSCPP   $ |
 * Set Lines Per Page                 DECSLPP   t
 * Set Number of Lines per Screen     DECSNLS   * |
 * Set Status Line Type               DECSSDT   $ ~
 * Set Left and Right Margins         DECSLRM   s
 * Set Top and Bottom Margins         DECSTBM   r
 * Set Graphic Rendition              SGR       m
 * Select Set-Up Language             DECSSL    p
 * Select Printer Type                DECSPRTT  $ s
 * Select Refresh Rate                DECSRFR   " t
 * Select Digital Printed Data Type   DECSDPT   ( p
 * Select ProPrinter Character Set    DECSPPCS  * p
 * Select Communication Speed         DECSCS    * r
 * Select Communication Port          DECSCP    * u
 * Set Scroll Speed                   DECSSCLS  SP p
 * Set Cursor Style                   DECSCUSR  SP q
 * Set Key Click Volume               DECSKCV   SP r
 * Set Warning Bell Volume            DECSWBV   SP t
 * Set Margin Bell Volume             DECSMBV   SP u
 * Set Lock Key Style                 DECSLCK   SP v
 * Select Flow Control Type           DECSFC    * s
 * Select Disconnect Delay Time       DECSDDT   $ q
 * Set Transmit Rate Limit            DECSTRL   " u
 * Set Port Parameter                 DECSPP    + w
 *
 */
var StatusRequest = new Class().extends(Plugin);
StatusRequest.definition = {

  id: "request_status_string",

  getInfo: function getInfo()
  {
    return {
      name: _("Status Request"),
      version: "0.1",
      description: _("Reply against REQRQSS query.")
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

  /** Uninstalls itself.
   */
  "[uninstall]":
  function uninstall()
  {
  },

  "[subscribe('sequence/dcs/2471'), pnp]":
  function onDCS(data)
  {
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
          this.sendMessage("command/send-sequence/dcs", "1$r");
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
