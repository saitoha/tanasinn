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
 * @class RectangleChecksumReport
 *
 * DECRQCRA - Request Checksum of Rectangular Area
 *
 * This control function requests a checksum of the specified rectangular area
 * in the specified page. The terminal returns a checksum report (DECCKSR) in
 * response to this request.
 *
 * Format
 *
 * CSI   Pid   ;     Pp    ;     Pt;Pl;Pb;Pr     *     y
 * 9/11  3/n   3/11  3/n   3/11  3/n . . . 3/n   2/10  7/9
 *
 *
 * Parameters
 * 
 * Pid
 * is a numeric label you can provide to identify the checksum request. The
 * checksum report returns this number. The number serves to differentiate
 * between multiple checksum reports.
 * 
 * Pp
 * is the page number that has the rectangular area. If Pp is 0 or omitted,
 * then the terminal ignores the following parameters and reports a checksum
 * for all pages in page memory. If Pp is a higher number than the number of
 * pages available, then the terminal reports on the last page.
 * 
 * Pt;Pl;Pb;Pr
 * are the top, left, bottom, and right borders of the rectangular area. Pt
 * and Pb are line numbers. Pt must be less than or equal to Pb. Pl and Pr are
 * column numbers. Pl must be less than or equal to Pr.
 * 
 * Defaults are Pt = 1, Pb = current page length, Pr = current page width. If
 * these parameters are omitted, then the terminal returns a checksum of page
 * Pp.
 *
 *
 * Note on DECRQCRA
 * 
 * The coordinates of the rectangular area are affected by the setting of
 * origin mode (DECOM).
 *
 */
var RectangleChecksumReport = new Class().extends(Plugin)
                                         .depends("screen");
RectangleChecksumReport.definition = {

  id: "rectangle_checksum_report",

  getInfo: function getInfo()
  {
    return {
      name: _("Rectangle Checksum Report"),
      version: "0.1",
      description: _("Send checksum of specified rectangle area.")
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

  "[profile('vt100'), sequence('CSI %d*y')]":
  function DECRQCRA(n1, n2, n3, n4, n5, n6) 
  { // Request Checksum of Rectangle Area
    var screen = this._screen,
        id,
        page_number,
        top,
        left,
        bottom,
        right,
        checksum,
        message;

    if (6 !== arguments.length) {
      throw coUtils.Debug.Exception(
        _("Invalid arguments length: %d."), arguments.length);
    }

    id = Number(n1);
    page_number = Number(n2);
    top = (Number(n3) || 1) - 1;
    left = (Number(n4) || 1) - 1;
    bottom = Number(n5) || 1;
    right = Number(n6) || 1;

    checksum = screen.calculateHashInRectangle(top, left, bottom, right);
    message = id + "!~" + checksum;

    this.sendMessage("command/send-sequence/dcs", message);
  },

}; // RectangleChecksumReport


/**
 * @fn main
 * @brief Module entry point.
 * @param {Broker} broker The Broker object.
 */
function main(broker) 
{
  new RectangleChecksumReport(broker);
}

// EOF
