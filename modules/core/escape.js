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

/** @class KeypadMode
 */
let KeypadMode = new Class().extends(Component);
KeypadMode.definition = {
 
  get id()
    "keypadmode",

  /** normal keypad (Normal). 
   *
   * DECKPNM / DECKPNM — Keypad Numeric Mode
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
   * key—number, comma, period, or minus sign. Keys PF1 to PF4 send 
   * application sequences. See DECKPAM—Keypad Application Mode for more 
   * information.
   *
   * Note on DECKPNM
   * 
   * The setting is not saved in NVM. When you turn on or reset the terminal, 
   * it automatically selects numeric keypad mode.
   */ 
  "[sequence('ESC >')]": function DECPNM() 
  {
    let session = this._broker;
    session.notify(
      "event/keypad-mode-changed", 
      coUtils.Constant.KEYPAD_MODE_NORMAL);
  },
 
  /** application keypad (NumLock). 
   *
   * DECKPAM / DECPAM — Keypad Application Mode
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
  "[sequence('ESC =')]": function DECPAM() 
  {
    let session = this._broker;
    session.notify(
      "event/keypad-mode-changed", 
      coUtils.Constant.KEYPAD_MODE_APPLICATION);
  },

};

/**
 * @class CharsetMode
 */
let CharsetMode = new Class().extends(Component)
CharsetMode.definition = {  

  get id()
    "charsetmode",

  /**
   * SCS — Select Character Set
   * 
   * Designate character sets to G-sets.
   *
   * Format
   *
   * ESC    I     Dscs
   * 1/11   ...   ...
   *
   * Parameters
   * 
   * I is the intermediate character representing the G-set designator.
   *
   * I   94-Character G-set
   * (   G0
   * )   G1
   * *   G2
   * +   G3
   * I   96-Character G-set
   * -   G1
   * .   G2
   * /   G3
   * 
   * Dscs represents a character set designator.
   * Dscs         Default 94-Character Set
   * % 5          DEC Supplemental
   * " ?          DEC Greek
   * " 4          DEC Hebrew
   * % 0          DEC Turkish
   * & 4          DEC Cyrillic
   * A            U.K. NRCS
   * R            French NRCS
   * 9 or Q       French Canadian NRCS
   * `, E, or 6   Norwegian/Danish NRCS
   * 5 or C       Finnish NRCS
   * K            German NRCS
   * Y            Italian NRCS
   * =            Swiss NRCS
   * 7 or H       Swedish NRCS
   * Z            Spanish NRCS
   * % 6          Portuguese NRCS
   * " >          Greek NRCS
   * % =          Hebrew NRCS
   * % 2          Turkish NRCS
   * % 3          SCS NRCS
   * & 5          Russian NRCS
   * 0            DEC Special Graphic
   * >            DEC Technical Character Set
   * <            User-preferred Supplemental
   * Dscs         Default 96-Character Set
   * A            ISO Latin-1 Supplemental
   * B            ISO Latin-2 Supplemental
   * F            ISO Greek Supplemental
   * H            ISO Hebrew Supplemental
   * M            ISO Latin-5 Supplemental
   * L            ISO Latin-Cyrillic
   * <            User-preferred Supplemental
   */
  "[sequence('ESC (%c')]": 
  function SCSG0(mode) 
  {
    let session = this._broker;
    session.notify("sequnece/g0", mode);
  },
  
  "[sequence('ESC )%c')]": 
  function SCSG1(mode) 
  {
    let session = this._broker;
    session.notify("sequence/g1", mode);
  },
};


/**
 * @class Escape
 */
let Escape = new Class().extends(Component);
Escape.definition = {

  get id()
    "escape",

  "[sequence('ESC P%s', 'ESC X%s', 'ESC _%s')]": 
  function APC() 
  {
    let message = String.fromCharCode.apply(String, arguments);
    session.notify("sequence/apc", message);
  },
  
  "[sequence('ESC ]%s')]": 
  function OSC() 
  {
    let message = String.fromCharCode.apply(String, arguments);
    let args = message.split(";");
    let num = args.shift();
    let command = args.shift();
    let session = this._broker;
    session.notify("sequence/osc/" + num, command);
  },
  
  /** private message */
  "[sequence('ESC ^%s')]": 
  function PM() 
  {
    let message = String.fromCharCode.apply(String, arguments);
    session.notify("sequence/pm", message);
  },

  /** 
   * RIS — Reset to Initial State
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
   *   - Sets all features listed on set-up screens to their saved settings.
   *   - Causes a communication line disconnect.
   *   - TODO: Clears user-defined keys.
   *   - TODO: Clears the screen and all off-screen page memory.
   *   - Clears the soft character set.
   *   - Clears page memory. All data stored in page memory is lost.
   *   - Clears the screen.
   *   - Returns the cursor to the upper-left corner of the screen.
   *   - Sets the select graphic rendition (SGR) function to normal rendition.
   *   - Selects the default character sets (ASCII in GL, and DEC Supplemental Graphic in GR).
   *   - Clears all macro definitions.
   *   - Erases the paste buffer.
   *
   */
  "[sequence('ESC c')]": 
  function RIS() 
  {
    let session = this._broker;
    session.notify("sequence/g0", coUtils.Constant.CHARSET_US);
    session.notify("sequence/g1", coUtils.Constant.CHARSET_US);
    session.notify("command/hard-terminal-reset");
    this._ansi_mode.reset();
    let screen = this._screen;
    screen.resetScrollRegion();
    screen.cursor.reset();
  },
  
  /** reverse index */
  "[sequence('ESC M')] RI": 
  function RI() 
  {
    let screen = this._screen;
    screen.reverseIndex();
    if (this._ansi_mode.LNM) {
      screen.carriageReturn();
    }
  },

  /** constructor */
  "[subscribe('initialized/{screen & ansimode}'), enabled]": 
  function onLoad(screen, ansi_mode) 
  {
    this._screen = screen;
    this._ansi_mode = ansi_mode;
  },
};

/**
 * @fn main
 * @brief Module entry point.
 * @param {Desktop} desktop The Desktop object.
 */
function main(desktop) 
{
  desktop.subscribe(
    "initialized/session", 
    function(session) 
    {
      new Escape(session);
      new KeypadMode(session);
      new CharsetMode(session);
    });
}


