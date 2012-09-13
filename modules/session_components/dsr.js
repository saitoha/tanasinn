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
                                        .depends("cursorstate");
ANSIDeviceStatusReport.definition = {

  id: "device_status_report",

  getInfo: function getInfo()
  {
    return {
      name: _("Device Status Report / ANSI"),
      version: "0.1",
      description: _("Send Device Status Report, ANSI format."),
    };
  },

  "[persistable] enabled_when_startup": true,

  /** installs itself. 
   *  @param {Broker} broker A Broker object.
   */
  "[install]":
  function install()
  {
    this._cursor = this.dependency["cursorstate"];
  },

  /** uninstalls itself. 
   *  @param {Broker} broker A Broker object.
   */
  "[uninstall]":
  function uninstall()
  {
    this._cursor = null;
  },

  "[profile('vt100'), sequence('CSI %dn')]":
  function DSR(n) 
  { // Device Status Report

    var cursor = this._cursor,
        message;

    switch (n) {

      // report terminal status
      case 5:
        this.sendMessage("command/send-sequence/csi", "0n");
        break;

      // report cursor position
      case 6:
        message = coUtils.Text.format(
          "%d;%dR", 
          cursor.positionY + 1, 
          cursor.positionX + 1);
        this.sendMessage("command/send-sequence/csi", message);
        break;

      default:
        coUtils.Debug.reportWarning(
          _("%s sequence [%s] was ignored."),
          arguments.callee.name, Array.slice(arguments));
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
