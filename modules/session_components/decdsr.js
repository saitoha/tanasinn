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
 * @class DECDeviceStatusReport
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
var DECDeviceStatusReport = new Class().extends(Plugin)
                                       .depends("screen")
                                       .depends("parser");
DECDeviceStatusReport.definition = {

  get id()
    "device_status_report_dec",

  get info()
  {
    return {
      name: _("Device Status Report / DEC"),
      version: "0.1",
      description: _("Send Device Status Report, DEC specific.")
    };
  },

  "[persistable] enabled_when_startup": true,

  _parser: null,
  _screen: null,

  /** installs itself. 
   *  @param {Broker} broker A Broker object.
   */
  "[install]":
  function install()
  {
    this._parser = this.dependency["parser"];
    this._screen = this.dependency["screen"];
  },

  /** uninstalls itself. 
   *  @param {Broker} broker A Broker object.
   */
  "[uninstall]":
  function uninstall()
  {
    this._parser = null;
    this._screen = null;
  },

  "[profile('vt100'), sequence('CSI ?%dn')]":
  function DECDSR(n1, n2) 
  { // Device Status Report, DEC specific
    
    switch (n1) {

      /**
       * DECXCPR - Extended Cursor Position
       * 
       * The host asks the terminal for the current cursor position, 
       * including the current page number.
       *
       * Format
       * 
       * CSI   ?     6     n
       * 9/11  3/15  3/6   6/14
       *
       *
       * Response
       *
       * CSI   Pl  ;   Pc  ;   Pp  R
       *
       *
       * Parameters
       * 
       * Pl; Pc; Pp
       * The terminal indicates that the cursor is currently at line Pl, column Pc, on page Pp.
       *
       */
      case 6:
        message = coUtils.Text.format(
          "%d;%d;0R", 
          cursor.positionY + 1, 
          cursor.positionX + 1,
          0);
        this.sendMessage("command/send-sequence/csi", message);
        break;

      case 53:
        try {
          this.request("event/locator-reporting-requested", null); 
          this.sendMessage("command/send-sequence/csi", "?53n");
        } catch(e) {
          this.sendMessage("command/send-sequence/csi", "?50n");
        }
        break;

      case 63: // DECCKSR Memory Checksum Report
        this.DECCKSR(n2);
        break;

      // report ambiguous width status (TNREPTAMB)
      case 8840:
        if (this._parser.ambiguous_as_wide) {
          message = "?8842n";
        } else {
          message = "?8841n";
        }
        this.sendMessage("command/send-sequence/csi", message);
        break;

      default:
        coUtils.Debug.reportWarning(
          _("%s sequence [%s] was ignored."),
          arguments.callee.name, Array.slice(arguments));
    }
  },

  DECCKSR: function DECCKSR(id)
  {
    var screen = this._screen,
        id,
        top,
        left,
        bottom,
        right,
        checksum,
        message;

    top = 0;
    left = 0;
    bottom = screen.height;
    right = screen.width;

    checksum = screen.calculateHashInRectangle(top, left, bottom, right);
    message = id + "!~" + checksum;

    this.sendMessage("command/send-sequence/dcs", message);
  },

};

/**
 * @fn main
 * @brief Module entry point.
 * @param {Broker} broker The Broker object.
 */
function main(broker) 
{
  new DECDeviceStatusReport(broker);
}

// EOF
