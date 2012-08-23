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

/** @class KeypadModeHandler
 */
var KeypadModeHandler = new Class().extends(Plugin)
                                   .depends("screen");
KeypadModeHandler.definition = {
 
  get id()
    "keypadmode",

  get info()
    <module>
        <name>{_("Keypad Mode Handler")}</name>
        <version>0.1</version>
        <description>{
          _("Switch keypad modes.")
        }</description>
    </module>,

  "[persistable] enabled_when_startup": true,

  _screen: null,
    
  /** installs itself. 
   *  @param {Broker} broker A broker object.
   */
  "[install]": 
  function install(broker) 
  {
    this._screen = this.dependency["screen"];
  },
    
  /** uninstalls itself. 
   *  @param {Broker} broker A broker object.
   */
  "[uninstall]": 
  function uninstall(broker) 
  {
    this._screen = null;
  },

  /** normal keypad (Normal). 
   *
   * DECKPNM / DECKPNM - Keypad Numeric Mode
   * 
   * DECKPNM enables the keypad to send numeric characters to the host. 
   * DECKPAM enables the keypad to send application sequences.
   * 
   * DECKPNM and DECKPAM function the same as numeric keypad mode (DECNKM).
   * 
   * Default: Send numeric keypad characters.
   *
   * Format
   *
   * ESC    >
   * 1/11   3/14   Send numeric keypad characters.
   *
   * Description
   * 
   * DECKPNM enables the numeric keypad to send the characters shown on each 
   * key-number, comma, period, or minus sign. Keys PF1 to PF4 send 
   * application sequences. See DECKPAM-Keypad Application Mode for more 
   * information.
   *
   * Note on DECKPNM
   * 
   * The setting is not saved in NVM. When you turn on or reset the terminal, 
   * it automatically selects numeric keypad mode.
   */ 
  "[profile('vt100'), sequence('ESC >')]":
  function DECPNM() 
  {
    this.sendMessage(
      "event/keypad-mode-changed", 
      coUtils.Constant.KEYPAD_MODE_NORMAL);
  },
 
  /** application keypad (NumLock). 
   *
   * DECKPAM / DECPAM - Keypad Application Mode
   * 
   * DECKPAM enables the numeric keypad to send application sequences to the 
   * host. DECKPNM enables the numeric keypad to send numeric characters.
   * 
   * DECKPAM and DECKPNM function the same as numeric keypad mode (DECNKM).
   *
   * Format
   *
   * ESC    =
   * 1/11   3/13   Send application sequences.
   *
   * Note on DECKPAM
   * 
   * The setting is not saved in NVM. When you turn on or reset the terminal, 
   * it automatically selects numeric keypad mode.
   */
  "[profile('vt100'), sequence('ESC =')]": 
  function DECPAM() 
  {
    this.sendMessage(
      "event/keypad-mode-changed", 
      coUtils.Constant.KEYPAD_MODE_APPLICATION);
  },

}; // KeypadMode

/**
 * @fn main
 * @brief Module entry point.
 * @param {Broker} broker The Broker object.
 */
function main(broker) 
{
  new KeypadModeHandler(broker);
}

// EOF
