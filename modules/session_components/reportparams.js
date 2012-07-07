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
 * @class ReportParams
 *
 */
var ReportParams = new Class().extends(Plugin);
ReportParams.definition = {

  get id()
    "reportparams",

  get info()
    <module>
        <name>{_("Report Parameters")}</name>
        <version>0.1</version>
        <description>{
          _("Reply against DECREQTPARM.")
        }</description>
    </module>,

  "[persistable] enabled_when_startup": true,

  "[subscribe('event/termattr-changed'), enabled]":
  function onTermattrChanged(termattr)
  {
    this._termattr = termattr;
  },

  /**
   *
   * DECREQTPARM – Request Terminal Parameters
   *
   * ESC [ <sol> x   
   *
   * The sequence DECREPTPARM is sent by the terminal controller to notify 
   * the host of the status of selected terminal parameters. The status 
   * sequence may be sent when requested by the host or at the terminal's 
   * discretion. DECREPTPARM is sent upon receipt of a DECREQTPARM. 
   * On power-up or reset, the VT100 is inhibited from sending unsolicited 
   * reports.
   *
   * The meanings of the sequence parameters are:
   *
   * Parameter  Value       Meaning
   *
   * <sol>      0 or none   This message is a request (DECREQTPARM) and the 
   *                        terminal will be allowed to send unsolicited 
   *                        reports. (Unsolicited reports are sent when the 
   *                        terminal exits the SET-UP mode).
   *
   *            1           This message is a request; from now on the 
   *                        terminal may only report in response to a request.
   *
   *            2           This message is a report (DECREPTPARM).
   *
   *            3           This message is a report and the terminal is only 
   *                        reporting on request.
   *
   * <par>      1           No parity set
   *
   *            4           Parity is set and odd
   *
   *            5           Parity is set and even
   *
   * <nbits>    1           8 bits per character
   *
   *            2           7 bits per character
   *
   * <xspeed>, 
   * <rspeed>   0           50  Bits per second
   *
   *            8           75
   * 
   *            16          110
   * 
   *            24          134.5
   *
   *            32          150
   *
   *            40          200
   *
   *            48          300
   *
   *            56          600
   *
   *            64          1200
   *
   *            72          1800
   *
   *            80          2000
   *
   *            88          2400
   *
   *            96          3600
   *
   *            104         4800
   *            
   *            112         9600
   *
   *            120         19200
   *
   * <clkmul>   1           The bit rate multiplier is 16.
   *
   * <flags>    0-15        This value communicates the four switch values in
   *                        block 5 of SET UP B, which are only visible to the 
   *                        user when an STP option is installed. These bits 
   *                        may be assigned for an STP device. The four bits 
   *                        are a decimal-encoded binary number.
   *
   *
   * DECREPTPARM – Report Terminal Parameters
   *
   * ESC [ <sol>; <par>; <nbits>; <xspeed>; <rspeed>; <clkmul>; <flags> x    
   *
   * These sequence parameters are explained below in the DECREQTPARM sequence.
   *
   */
  "[profile('vt100'), sequence('CSI %dx')]": 
  function DECREQTPARM(n) 
  { // Request Terminal Parameters

    var message;

    switch (n || 0) {

      // This message is a request (DECREQTPARM) and the terminal will be 
      // allowed to send unsolicited reports. (Unsolicited reports are 
      // sent when the terminal exits the SET-UP mode).
      case 0:
        message = "2;" + this._termattr;
        this.sendMessage("command/send-sequence/csi");
        this.sendMessage("command/send-to-tty", message);
        break;

      // This message is a request; from now on the 
      // terminal may only report in response to a request.
      case 1:
        message = "3;" + this._termattr;
        this.sendMessage("command/send-sequence/csi");
        this.sendMessage("command/send-to-tty", message);
        break;

      default:
        coUtils.Debug.reportWarning(
          "%s sequence [%s] was ignored.",
          arguments.callee.name, Array.slice(arguments));
    }
  },

}; // class ReportParams

/**
 * @fn main
 * @brief Module entry point.
 * @param {Broker} broker The Broker object.
 */
function main(broker) 
{
  new ReportParams(broker);
}

// EOF
