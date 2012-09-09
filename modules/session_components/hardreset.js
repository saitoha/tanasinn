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
 * @class HardReset
 *
 */
var HardReset = new Class().extends(Plugin);
HardReset.definition = {

  get id()
    "hard_reset",

  get info()
  {
    return {
      name: _("Hard Reset"),
      version: "0.1",
      description: _("Hard terminal reset with escape sequence.")
    };
  },

  "[persistable] enabled_when_startup": true,

  /** 
   * RIS - Reset to Initial State
   * 
   * This control function causes a nonvolatile memory (NVR) recall to 
   * occur. RIS replaces all set-up features with their saved settings.
   * 
   * The terminal stores these saved settings in NVR memory. 
   * The saved setting for a feature is the same as the factory-default 
   * setting, unless you saved a new setting.
   *
   * Note
   * 
   * It is recommended that you not use RIS to reset the terminal. 
   * You should use a soft terminal reset (DECSTR) instead. 
   * RIS usually causes a communication line disconnect and may change the 
   * current baud rate settings. When performing a RIS, the terminal sends 
   * XOFF to the host to stop communication. When the RIS is complete, the 
   * terminal sends XON to resume communication.
   *
   * Format
   *
   * ESC    c
   * 1/11   6/3
   *
   * RIS Actions
   * 
   *   Sets all features listed on set-up screens to their saved settings.
   *
   *   - TODO: Causes a communication line disconnect.
   *   - TODO: Clears user-defined keys.
   *   - TODO: Clears the screen and all off-screen page memory.
   *   - TODO: Clears the soft character set.
   *   - TODO: Clears page memory. All data stored in page memory is lost.
   *   - Clears the screen.
   *   - Returns the cursor to the upper-left corner of the screen.
   *   - Sets the select graphic rendition (SGR) function to normal rendition.
   *   - Selects the default character sets (ASCII in GL, and DEC Supplemental
   *     Graphic in GR).
   *   - TODO: Clears all macro definitions.
   *   - TODO: Erases the paste buffer.
   *
   */
  "[profile('vt100'), sequence('ESC c')]": 
  function RIS() 
  {
    this.sendMessage("command/hard-terminal-reset");
  },

}; // class HardReset

/**
 * @fn main
 * @brief Module entry point.
 * @param {Broker} broker The Broker object.
 */
function main(broker) 
{
  new HardReset(broker);
}

// EOF
