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
var KeypadModeHandler = new Class().extends(Component);
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
    this.sendMessage(
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
  "[profile('vt100'), sequence('ESC =')]": 
  function DECPAM() 
  {
    this.sendMessage(
      "event/keypad-mode-changed", 
      coUtils.Constant.KEYPAD_MODE_APPLICATION);
  },

}; // KeypadMode


/**
 * @class Escape
 */
var Escape = new Class().extends(Component);
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
    var screen;
   
    screen = this._screen;
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
    var screen;

    screen = this._screen;
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
    var screen;

    screen = this._screen;
    screen.reverseIndex();
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
    var message;

    if (/[\x00-\x1f]/.test(message[0])) {
      message = message.replace(/\x00/g, "\\");
      this.sendMessage("event/data-arrived-recursively", message);
    } else {
      this.sendMessage("sequence/dcs", message);
    }
  },

  "[profile('vt100'), sequence('ESC X%s')]": 
  function SOS() 
  {
    var message;

    message = String.fromCharCode.apply(String, arguments);
    this.sendMessage("sequence/sos", message);
  },

  "[profile('vt100'), sequence('ESC _%s')]": 
  function APC() 
  {
    var message;

    message = String.fromCharCode.apply(String, arguments);
    this.sendMessage("sequence/apc", message);
  },
  
  "[profile('vt100'), sequence('ESC ]%s')]": 
  function OSC(message) 
  {
    var delimiter_position, num, command;

    delimiter_position = message.indexOf(";");
    num = message.substr(0, delimiter_position);
    command = message.substr(delimiter_position + 1);
    this.sendMessage("sequence/osc/" + num, command);
  },
  
  /** private message */
  "[profile('vt100'), sequence('ESC ^%s')]": 
  function PM(message) 
  {
    this.sendMessage("sequence/pm", message);
  },

  /** Select default character set. */
  "[profile('vt100'), sequence('ESC %@')]": 
  function ISO_8859_1() 
  {
    this.sendMessage("change/decoder", "ISO-8859-1");
    this.sendMessage("change/encoder", "ISO-8859-1");
  },

  /** Select UTF-8 character set. */
  "[profile('vt100'), sequence('ESC %G')]": 
  function UTF_8() 
  {
    this.sendMessage("change/decoder", "UTF-8");
    this.sendMessage("change/encoder", "UTF-8");
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
   * DECTST — Invoke Confidence Test
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
   *   0 	  "All Tests" (1,2,3,6)
   *   1 	  Power-Up Self Test
   *   2 	  RS-232 Port Data Loopback Test
   *   3 	  Printer Port Loopback Test
   *   4 	  Speed Select and Speed Indicator Test
   *   5 	  Reserved - No action
   *   6 	  RS-232 Port Modem Control Line Loopback Test
   *   7 	  EIA-423 Port Loopback Test
   *   8 	  Parallel Port Loopback Test
   *   9 	  Repeat (Loop On) Other Tests In Parameter String
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
  "[profile('vt100'), sequence('CSI %dy')]": 
  function DECTST() 
  {
    var i, n;

    for (i = 0; i < arguments.length; ++i) {

      n = arguments[i];

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
  "[subscribe('initialized/screen'), enabled]": 
  function onLoad(screen) 
  {
    this._screen = screen;
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
}


