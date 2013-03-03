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
 *  @class ConfidenceTest
 *
 * DECTST - Invoke Confidence Test
 *
 * Select tests to be performed.
 *
 * Format
 *
 * CSI    4     ;      Ps   ...  ;     Ps   y
 * 9/11   3/4   3/11   3/n  ...  3/11  3/n  7/9
 *
 *
 * Parameters
 *
 * Ps is the parameter indicating a test to be done.
 *
 *   Ps   Test
 *   0    "All Tests" (1,2,3,6)
 *   1    Power-Up Self Test
 *   2    RS-232 Port Data Loopback Test
 *   3    Printer Port Loopback Test
 *   4    Speed Select and Speed Indicator Test
 *   5    Reserved - No action
 *   6    RS-232 Port Modem Control Line Loopback Test
 *   7    EIA-423 Port Loopback Test
 *   8    Parallel Port Loopback Test
 *   9    Repeat (Loop On) Other Tests In Parameter String
 *
 * Description
 *
 * After the first parameter, "4", the parameters each select one test.
 * Several tests may be invoked at once by chaining the parameters together
 * separated by semicolons. The tests are not necessarily executed in the
 * order in which they are entered in the parameter string.
 *
 * "ESC # 8" invokes the Screen Alignment test for the VT510. Additionally,
 * after executing the power-up selftest, the terminal displays either the
 * diagnostic messages in the upper left corner of the screen or the
 * "VT510 OK" message in the center of the screen and within a box. Upon
 * receipt of any character except XON or if the user types a keystroke,
 * the screen is cleared. If the terminal is in local mode, then characters
 * from the host are ignored and the message remains visible even if
 * characters are received from the host. DECTST causes a disconnect;
 * therefore, it should not be used in conjunction with a modem.
 *
 */
var ConfidenceTest = new Class().extends(Plugin);
ConfidenceTest.definition = {

  id: "confidence_test",

  getInfo: function getInfo()
  {
    return {
      name: _("Confidence Test"),
      version: "0.1",
      description: _("Invoke Confidence Test.")
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

  /** Invoke Confidence Test */
  "[profile('vt100'), sequence('CSI Ps y')]":
  function DECTST()
  {
    var i,
        n;

    for (i = 0; i < arguments.length; ++i) {

      n = arguments[i];

      switch (n) {

        case 0:
          this.sendMessage("command/test");
          //coUtils.Debug.reportWarning(
          //  _("DECTST 0: Invoking all test is not implemented."));
          break;

        case 1:
          coUtils.Debug.reportWarning(
            _("DECTST 1: Invoking Power-Up self test is not implemented."));
          break;

        case 2:
          coUtils.Debug.reportWarning(
            _("DECTST 2: Invoking RS-232 port data loopback test ",
              "is not implemented."));
          break;

        case 3:
          coUtils.Debug.reportWarning(
            _("DECTST 3: Invoking printer port loopback test ",
              "is not implemented."));
          break;

        case 4:
          coUtils.Debug.reportWarning(
            _("DECTST 4: Invoking speed select and speed indicator test ",
              "is not implemented."));
          break;

        case 5:
          coUtils.Debug.reportWarning(
            _("DECTST 5: Invoking this test(reserved) is not implemented."));
          break;

        case 6:
          coUtils.Debug.reportWarning(
            _("DECTST 6: Invoking RS-232 port modem control line ",
              "loopback test is not implemented."));
          break;

        case 7:
          coUtils.Debug.reportWarning(
            _("DECTST 7: Invoking EIA-423 port loopback test ",
              "is not implemented."));
          break;

        case 8:
          coUtils.Debug.reportWarning(
            _("DECTST 8: Invoking parallel port loopback test ",
              "is not implemented."));
          break;

        case 9:
          coUtils.Debug.reportWarning(
            _("DECTST 8: Repeat (Loop on) other tests in parameter string ",
              "is not implemented."));
          break;

        default:
          coUtils.Debug.reportWarning(
            _("DECTST: Unknown test parameter is specified: %d."), n);

      }
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
  },


} // class DRCSBuffer

/**
 * @fn main
 * @brief Module entry point.
 * @param {Broker} broker The Broker object.
 */
function main(broker)
{
  new ConfidenceTest(broker);
}

// EOF
