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
 * Portions created by the Initial Developer are Copyright (C) 2010 - 2013
 * the Initial Developer. All Rights Reserved.
 *
 * ***** END LICENSE BLOCK ***** */

"use strict";


/**
 * @class DeviceStatusReport
 *
 * DSR - Device Status Reports
 *
 * The host computer and terminal exchange DSR sequences to provide the host
 * with the operating status of the following features:
 *
 * Operating status
 * Keyboard status - language
 * Cursor position report
 * Cursor position with page
 * Printer port   User-defined keys
 * Macro space report
 * Memory checksum
 * Data integrity report
 *
 * DSR requests and reports follow one of two formats, ANSI or DEC format.
 * The format for each is as follows:
 *
 * Format
 *
 * ANSI format
 *
 * CSI    Ps   n
 * 9/11   3/n  6/14
 *
 * DEC format
 *
 * CSI    ?      Ps   n
 * 9/11   3/15   3/n  6/14
 *
 *
 * Parameters
 *
 * Ps
 * indicates the type of DSR requested. See the following individual DSR
 * reports for specific parameters within each report.
 *
 * Description
 *
 * There is a different DSR request for each feature. The following sections
 * describe the possible DSR reports. If the terminal is in printer
 * controller mode, then the printer receives the DSR request. The printer
 * can respond through the bidirectional printer port.
 *
 */
var ANSIDeviceStatusReport = new Class().extends(Plugin)
                                        .depends("screen");
ANSIDeviceStatusReport.definition = {

  id: "device_status_report",

  /** plugin information */
  getInfo: function getInfo()
  {
    return {
      name: _("Device Status Report / ANSI"),
      version: "0.1",
      description: _("Send Device Status Report, ANSI format."),
    };
  },

  "[persistable] enabled_when_startup": true,

  _screen: null,

  /** Installs itself.
   *  @param {InstallContext} context A InstallContext object.
   */
  "[install]":
  function install(context)
  {
    this._screen = context["screen"];
  },

  /** Uninstalls itself.
   */
  "[uninstall]":
  function uninstall()
  {
    this._screen = null;
  },

  "[profile('vt100'), sequence('CSI Ps n')]":
  function DSR(n)
  { // Device Status Report

    var screen = this._screen;

    switch (n) {

      // report terminal status
      case 5:
        this.sendMessage("command/send-sequence/csi", "0n");
        break;

      // report cursor position
      case 6:
        screen.reportCursorPosition();
        break;

      default:
        coUtils.Debug.reportWarning(
          _("%s sequence [%s] was ignored."),
          "DSR", Array.slice(arguments));
    }
  },

  /** test */
  "[test]":
  function()
  {
    var enabled = this.enabled;

    try {
      if (enabled) {
        assert(this._screen);
      } else {
        assert(null === this._screen);
      }
    } finally {
    }
  },

};

/**
 * @fn main
 * @brief Module entry point.
 * @param {Broker} broker The Broker object.
 */
function main(broker)
{
  new ANSIDeviceStatusReport(broker);
}

// EOF
