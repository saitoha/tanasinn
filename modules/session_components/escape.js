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
let KeypadModeHandler = new Class().extends(Component);
KeypadModeHandler.definition = {
 
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
  "[profile('vt100'), sequence('ESC >')]": function DECPNM() 
  {
    let broker = this._broker;
    broker.notify(
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
  "[profile('vt100'), sequence('ESC =')]": function DECPAM() 
  {
    let broker = this._broker;
    broker.notify(
      "event/keypad-mode-changed", 
      coUtils.Constant.KEYPAD_MODE_APPLICATION);
  },

}; // KeypadMode

/**
 * @class CharsetModeHandler
 */
let CharsetModeHandler = new Class().extends(Component)
CharsetModeHandler.definition = {  

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
  "[profile('vt100'), sequence('ESC (%c'), _('Select Character Set G0')]": 
  function SCSG0(mode) 
  {
    let broker = this._broker;
    broker.notify("sequence/g0", mode);
  },
  
  "[profile('vt100'), sequence('ESC )%c'), _('Select Character Set G1')]": 
  function SCSG1(mode) 
  {
    let broker = this._broker;
    broker.notify("sequence/g1", mode);
  },

  "[profile('vt100'), sequence('ESC *%c'), _('Select Character Set G2')]": 
  function SCSG2(mode) 
  {
    let broker = this._broker;
    broker.notify("sequence/g2", mode);
  },

  "[profile('vt100'), sequence('ESC +%c'), _('Select Character Set G3')]": 
  function SCSG3(mode) 
  {
    let broker = this._broker;
    broker.notify("sequence/g3", mode);
  },

}; // CharsetModeHandler


/**
 * @class Escape
 */
let Escape = new Class().extends(Component);
Escape.definition = {

  get id()
    "escape",

  /** Next line.
   */

  /**
   * NEL — Next Line
   *
   * Moves cursor to first position on next line. If cursor is at bottom 
   * margin, then screen performs a scroll-up.
   *
   * Format
   *
   * ESC    E
   * 1/11   4/5
   *
   */
  "[profile('vt100'), sequence('0x85', 'ESC E'), _('Next line')]":
  function NEL() 
  { // Carriage Return
    let screen = this._screen;
    screen.carriageReturn();
    screen.lineFeed();
  },

  /**
   * HTS — Horizontal Tab Set
   *
   * HTS sets a horizontal tab stop at the column position indicated by the 
   * value of the active column when the terminal receives an HTS.
   *
   * You can use either one of the following formats:
   *
   * Format
   * HTS  or  ESC    H
   * 8/8  or  1/11   4/8
   *
   * Description
   * Executing an HTS does not effect the other horizontal tab stop settings.
   *
   */
  "[profile('vt100'), sequence('0x88', 'ESC H'), _('Tab set.')]": 
  function HTS() 
  {
    let screen = this._screen;
    screen.tab_stops.push(screen.cursor.positionX);
    screen.tab_stops.sort(function(lhs, rhs) lhs > rhs);
  },

  /**
   *
   * RI – Reverse Index
   * ESC M   
   *
   * Move the active position to the same horizontal position on the preceding 
   * line. If the active position is at the top margin, a scroll down is 
   * performed. Format Effector
   *
   */
  "[profile('vt100'), sequence('0x8d', 'ESC M'), _('Reverse index.')]": 
  function RI() 
  {
    let screen = this._screen;
    screen.reverseIndex();
    if (this._ansi_mode.LNM) {
      screen.carriageReturn();
    }
  },


  /**
   * Device Control Strings
   *
   * The terminal control DCS (ESC P) is used to load the programmable 
   * strings. The Ambassador recognizes characters following this control 
   * as programming instructions to the terminal.
   *
   * These programming instructions consist of a series of one or more string 
   * table entries. Each entry indexes to one of the programmable strings and
   * loads it with the character codes that follow. These characters then 
   * become the string that is transmitted when a programmable key is 
   * depressed, or an operational string is activated.
   *
   * Since DCS controls are normally sent from a host program to the 
   * Ambassador for execution, the commands are designed to facilitate 
   * programmatic control of the programmable strings. However, a terminal 
   * operator may also make use of the DCS control by placing the Ambassador 
   * into Local Test Mode (Setup T) and manually keying in the control sequence.
   *
   */
  "[profile('vt100'), sequence('0x90%s', 'ESC P%s')]": 
  function DCS(message) 
  {
    let broker = this._broker;
    if (/[\x00-\x1f]/.test(message[0])) {
      message = message.replace(/\x00/g, "\\");
      broker.notify("event/data-arrived-recursively", message);
    } else {
      broker.notify("sequence/dcs", message);
    }
  },

  "[profile('vt100'), sequence('ESC X%s')]": 
  function SOS() 
  {
    let broker = this._broker;
    let message = String.fromCharCode.apply(String, arguments);
    broker.notify("sequence/sos", message);
  },

  "[profile('vt100'), sequence('ESC _%s')]": 
  function APC() 
  {
    let broker = this._broker;
    let message = String.fromCharCode.apply(String, arguments);
    broker.notify("sequence/apc", message);
  },
  
  "[profile('vt100'), sequence('ESC ]%s')]": 
  function OSC(message) 
  {
    let delimiter_position = message.indexOf(";");
    let num = message.substr(0, delimiter_position);
    let command = message.substr(delimiter_position + 1);
    let broker = this._broker;
    broker.notify("sequence/osc/" + num, command);
  },
  
  /** private message */
  "[profile('vt100'), sequence('ESC ^%s')]": 
  function PM() 
  {
    let broker = this._broker;
    let message = String.fromCharCode.apply(String, arguments);
    broker.notify("sequence/pm", message);
  },

  /** Select default character set. */
  "[profile('vt100'), sequence('ESC %@')]": 
  function ISO_8859_1() 
  {
    let broker = this._broker;
    broker.notify("change/decoder", "ISO-8859-1");
    broker.notify("change/encoder", "ISO-8859-1");
  },

  /** Select UTF-8 character set. */
  "[profile('vt100'), sequence('ESC %G')]": 
  function UTF_8() 
  {
    let broker = this._broker;
    broker.notify("change/decoder", "UTF-8");
    broker.notify("change/encoder", "UTF-8");
  },

  /** Selective Erace Rectangle Area. */
  "[profile('vt100'), sequence('CSI %d${')]": 
  function DECSERA(n1, n2, n3, n4) 
  {
    coUtils.Debug.reportWarning(
      "%s sequence [%s] was ignored.",
      arguments.callee.name, [].slice.apply(arguments));
  },

  /** Soft Terminal reset. */
  "[profile('vt100'), sequence('CSI %d\"p')]": 
  function DECSCL() 
  {
    coUtils.Debug.reportWarning(
      "%s sequence [%s] was ignored.",
      arguments.callee.name, [].slice.apply(arguments));
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
  "[profile('vt100'), sequence('ESC c')]": 
  function RIS() 
  {
    let broker = this._broker;
    broker.notify("sequence/g0", coUtils.Constant.CHARSET_US);
    broker.notify("sequence/g1", coUtils.Constant.CHARSET_US);
    broker.notify("command/hard-terminal-reset");

    broker.notify("command/enable-wraparound");
    broker.notify("command/disable-reverse-wraparound");

    this._ansi_mode.reset();
    let screen = this._screen;
    screen.eraseScreenAll();
    screen.resetScrollRegion();
    screen.cursor.reset();
  },

  /**
   * DL — Delete Line
   *
   * This control function deletes one or more lines in the scrolling region, 
   * starting with the line that has the cursor.
   *
   * Format
   *
   * CSI    Pn   M
   * 9/11   3/n  4/13
   *
   * Parameters
   *
   * Pn is the number of lines to delete.
   *
   * Default: Pn = 1.
   *
   * Description
   *
   * As lines are deleted, lines below the cursor and in the scrolling region 
   * move up. The terminal adds blank lines with no visual character 
   * attributes at the bottom of the scrolling region. If Pn is greater than 
   * the number of lines 
   *
   */
  "[profile('vt100'), sequence('CSI %dy')]": 
  function DECTST() 
  {
    let i;
    let broker = this._broker;

    for (i = 0; i < arguments.length; ++i) {

      let n = arguments[i];
      switch (n) {

        case 0:
          coUtils.Debug.reportWarning(
            _("DECTST 0: Invoking all test is not implemented."));
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
 * @param {Broker} broker The Broker object.
 */
function main(broker) 
{
  new Escape(broker);
  new KeypadModeHandler(broker);
  new CharsetModeHandler(broker);
}


