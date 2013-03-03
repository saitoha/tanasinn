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
 * @class TerminalMode
 *
 */
var TerminalMode = new Class().extends(Plugin);
TerminalMode.definition = {

  id: "terminal_mode",

  /** plugin information */
  getInfo: function getInfo()
  {
    return {
      name: _("Terminal Mode"),
      version: "0.1",
      description: _("Select a terminal emulation mode.")
    };
  },

  "[persistable] enabled_when_startup": true,

  /**
   * DECTME - Terminal Mode Emulation
   *
   * Select a terminal emulation mode.
   *
   * Format
   *
   * CSI   Ps    SP    ~
   * 9/11  3/n   2/0   7/17
   *
   * Parameters
   *
   * Ps
   * The Ps parameter selects the terminal emulation mode as follows:
   * Table 5–10 Terminal Emulation Modes
   *
   * Ps             | Terminal Mode
   * ---------------|------------------------
   * 0, 1, or none  | VT500 (VT Level 4)
   * 2              | VT100
   * 3              | VT52
   * 4              | VT420 PCTerm
   * 5              | WYSE 60/160
   * 6              | WYSE 60/160 PCTerm
   * 7              | WYSE 50+
   * 8              | WYSE 150/120
   * 9              | TVI 950
   * 10             | TVI 925
   * 11             | TVI 910+
   * 12             | ADDS A2
   * 13             | SCO Console
   *
   * Description
   *
   * This sequence allows you to select the terminal emulation mode.
   * After any mode change is made, a soft reset is performed.
   *
   * Notes on DECTME
   *
   *     Printer operations are not affected or halted by a change in mode.
   *     A soft reset is always performed as a result of a mode change between
   *     VT modes.
   *
   *     Exception: Entering VT52 mode using DECANM does not cause a soft
   *     reset from VT100 mode.
   *     DECANM and DECSCL can also change the VT operating modes.
   *
   */
  "[profile('vt100'), sequence('CSI Ps \\ ~')]":
  function DECTME(n)
  {
    switch (n || 0) {

      case 0:
      case 1:
        this.sendMessage("command/change-emulation-mode", "vt100");
        break;

      case 2:
        this.sendMessage("command/change-emulation-mode", "vt100");
        break;

      case 3:
        this.sendMessage("command/change-emulation-mode", "vt52");
        break;

      default:
        coUtils.Debug.reportWarning(
          _("Unsupported emulation mode [%s] was specified."),
          Array.slice(arguments));

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


}; // TerminalMode

/**
 * @fn main
 * @brief Module entry point.
 * @param {Broker} broker The Broker object.
 */
function main(broker)
{
  new TerminalMode(broker);
}

// EOF
