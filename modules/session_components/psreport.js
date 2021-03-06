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
 * @trait PresentationStateReport
 */
var PresentationStateReport = new Class().extends(Plugin);
PresentationStateReport.definition = {

  /** Component ID */
  id: "presentation_state_report",

  /** plugin inforamtion */
  getInfo: function getInfo()
  {
    return {
      name: _("Presentation State Report"),
      version: "0.1.0",
      description: _("Report presentation state ",
                     "(cursor / tab-stop inforamtion)")
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

  /**
   *
   * DECRQPSR - Request Presentation State Report
   *
   * The host sends this sequence to request a cursor information report
   * (DECCIR) or tabulation stop report (DECTABSR).
   *
   * Format
   *
   * CSI   Ps    $     w
   * 9/11  3/n   2/4   7/7
   *
   * Parameters
   *
   * Ps indicates which report the host requests.
   *
   * Ps  Report Requested
   * ---------------------------------------------
   * 0   Error. Request ignored
   * 1   Cursor information report (DECCIR)
   * 2   Tab stop report (DECTABSR)
   *
   */
  "[profile('vt100'), sequence('CSI Ps $ w')]":
  function DECRQPSR(n)
  {
    switch (n || 0) {

      case 0: // error
        break;

      case 1: // cursor information
        this.sendMessage("command/report-cursor-information");
        break;

      case 2: // tab-stop
        this.sendMessage("command/report-tabstop-information");
        break;

      default:
        break;
    }

  },

  /** test */
  "[test]":
  function()
  {
    var enabled = this.enabled;

    try {
      this.enabled = false;
      this.enabled = true;
      this.enabled = false;
    } finally {
      this.enabled = enabled;
    }
  }

}; // PresentationStateReport

/**
 * @fn main
 * @brief Module entry point.
 * @param {Broker} broker The Broker object.
 */
function main(broker)
{
  new PresentationStateReport(broker);
}

// EOF
