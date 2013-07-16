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
 * Portions created by the Initial Developer are Copyright (C) 2010 - 2013
 * the Initial Developer. All Rights Reserved.
 *
 * ***** END LICENSE BLOCK ***** */

"use strict";

/**
 * @class C1Control
 */
var C1Control = new Class().extends(Plugin)
                           .depends("screen");
C1Control.definition = {

  id: "c1control",

  getInfo: function getInfo()
  {
    return {
      name: _("C1 Control Handlers"),
      version: "0.1",
      description: _("Handle C1 control characters.")
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

  /** uninstalls itself.
   */
  "[uninstall]":
  function uninstall()
  {
    this._screen = null;
  },

  /**
   * PAD
   */
  "[profile('vt100'), sequence('0x80', 'ESC @')]":
  function PAD()
  {
    coUtils.Debug.reportWarning(
      _("%s sequence [%s] was ignored."),
      "PAD", Array.slice(arguments));
  },

  /**
   * HOP
   */
  "[profile('vt100'), sequence('0x81', 'ESC A')]":
  function HOP()
  {
    coUtils.Debug.reportWarning(
      _("%s sequence [%s] was ignored."),
      "HOP", Array.slice(arguments));
  },

  /**
   * BPH
   */
  "[profile('vt100'), sequence('0x82', 'ESC B')]":
  function BPH()
  {
    coUtils.Debug.reportWarning(
      _("%s sequence [%s] was ignored."),
      "BPH", Array.slice(arguments));
  },

  /**
   * NBH
   */
  "[profile('vt100'), sequence('0x83', 'ESC C')]":
  function NBH()
  {
    coUtils.Debug.reportWarning(
      _("%s sequence [%s] was ignored."),
      "NBH", Array.slice(arguments));
  },

  /**
   *
   * IND - Index
   *
   * IND moves the cursor down one line in the same column. If the cursor is
   * at the bottom margin, then the screen performs a scroll-up.
   *
   * Format
   *
   * ESC   D
   * 1/11  4/4
   *
   */
  "[profile('vt100'), sequence('0x84', 'ESC D'), _('Index')]":
  function IND()
  {
    this._screen.lineFeed();
  },

  /**
   * NEL - Next Line
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
    var screen = this._screen;

    screen.carriageReturn();
    screen.lineFeed();
  },

  /**
   * SSA
   */
  "[profile('vt100'), sequence('0x86', 'ESC F')]":
  function SSA()
  {
    coUtils.Debug.reportWarning(
      _("%s sequence [%s] was ignored."),
      "SSA", Array.slice(arguments));
  },

  /**
   * ESA
   */
  "[profile('vt100'), sequence('0x87', 'ESC G')]":
  function ESA()
  {
    coUtils.Debug.reportWarning(
      _("%s sequence [%s] was ignored."),
      "ESA", Array.slice(arguments));
  },

  /** 0x88 HTS is in tabcontroller.js */

  /**
   *
   * HTJ - Horizontal Tab with Justify
   * ESC I
   *
   * TODO:
   * Same as HT except that the entry is right-justified before moving to the
   * next tab stop. The control may be loaded into a programmable key for
   * operator use when desired.
   */
  "[profile('vt100'), sequence('0x89', 'ESC I')]":
  function HTJ()
  {
    coUtils.Debug.reportWarning(
      _("%s sequence [%s] was ignored."),
      "HTJ", Array.slice(arguments));
  },

  /**
   * VTS
   */
  "[profile('vt100'), sequence('0x8a', 'ESC J')]":
  function VTS()
  {
    coUtils.Debug.reportWarning(
      _("%s sequence [%s] was ignored."),
      "VTS", Array.slice(arguments));
  },

  /**
   * PLD
   */
  "[profile('vt100'), sequence('0x8b', 'ESC K')]":
  function PLD()
  {
    coUtils.Debug.reportWarning(
      _("%s sequence [%s] was ignored."),
      "PLD", Array.slice(arguments));
  },

  /**
   * PLU
   */
  "[profile('vt100'), sequence('0x8b', 'ESC L')]":
  function PLU()
  {
    coUtils.Debug.reportWarning(
      _("%s sequence [%s] was ignored."),
      "PLU", Array.slice(arguments));
  },

  /**
   *
   * RI - Reverse Index
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
    this._screen.reverseIndex();
  },

  /**
   * SS - Single Shifts
   *
   * You use a single shift when you want to display the next character from a
   * different character set. A single shift maps the G2 or G3 set into GL.
   * The character set is active for only one character, then the terminal
   * returns to the previous character set in GL.
   *
   * The terminal has two single-shift control functions available.
   *
   * Format
   *
   * Single-Shift Control  8-Bit   7-Bit         Function
   * -------------------------------------------------------------------------
   * Single shift 2        SS2     ESC   N       Maps G2 into GL for the
   *                       8/14    1/11  4/14    next character.
   * Single shift 3        SS3     ESC   O       Maps G3 into GL for the
   *                       8/15    1/11  4/15    next character.
   *
   * Example
   *
   * Suppose the ASCII character set is in GL. You want to display the alpha
   * character from the DEC Technical character set, already designated as G3.
   * You do not want to replace the ASCII set just to display one character.
   * Instead, you can use single shift 3 to temporarily map the DEC Technical
   * set (G3) into GL.
   *
   * SS3
   * single shift 3  a
   * alpha character
   *
   * After displaying the alpha character, the terminal maps the ASCII set
   * (G1) back into GL, replacing the DEC Technical set (G3).
   *
   */

  /** SS2.
   */
  "[profile('vt100'), sequence('0x8e', 'ESC N'), _('SS2')]":
  function SS2()
  {
    this.sendMessage("sequences/ss2");
  },

  /** SS3.
   */
  "[profile('vt100'), sequence('0x8f', 'ESC O'), _('SS3')]":
  function SS3()
  {
    this.sendMessage("sequences/ss3");
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
  "[profile('vt100'), sequence('0x90 ... ST', 'ESC P ... ST')]":
  function DCS(message)
  {
    var i,
        code,
        tag;

    if (/[\x00-\x1f]/.test(message[0])) {
      message = message.replace(/\x00/g, "\\");
      this.sendMessage("event/data-arrived-recursively", message);
    } else {
      tag = "";
      for (i = 0; i < message.length; ++i) {
        code = message[i].charCodeAt(0);
        if (code >= 0x20 && code <= 0x2f) {
          tag += code.toString(16).toLowerCase();
        } else if (code >= 0x40 && code <= 0x7e) { // a-z
          tag += code.toString(16).toLowerCase();
          this.sendMessage("sequence/dcs/" + tag, message);
          break;
        }
      }
    }
  },

  /**
   * PU1
   */
  "[profile('vt100'), sequence('0x91', 'ESC Q')]":
  function PU1()
  {
    coUtils.Debug.reportWarning(
      _("%s sequence [%s] was ignored."),
      "PU1", Array.slice(arguments));
  },

  /**
   * PU2
   */
  "[profile('vt100'), sequence('0x92', 'ESC R')]":
  function PU2()
  {
    coUtils.Debug.reportWarning(
      _("%s sequence [%s] was ignored."),
      "PU2", Array.slice(arguments));
  },

  /**
   * STS
   */
  "[profile('vt100'), sequence('0x93', 'ESC S')]":
  function STS()
  {
    coUtils.Debug.reportWarning(
      _("%s sequence [%s] was ignored."),
      "STS", Array.slice(arguments));
  },

  /**
   * CCH
   */
  "[profile('vt100'), sequence('0x94', 'ESC T')]":
  function CCH()
  {
    coUtils.Debug.reportWarning(
      _("%s sequence [%s] was ignored."),
      "CCH", Array.slice(arguments));
  },

  /**
   * MW
   */
  "[profile('vt100'), sequence('0x95', 'ESC U')]":
  function MW()
  {
    coUtils.Debug.reportWarning(
      _("%s sequence [%s] was ignored."),
      "MW", Array.slice(arguments));
  },

  /**
   * SPA
   */
  "[profile('vt100'), sequence('0x96', 'ESC V')]":
  function SPA()
  {
    coUtils.Debug.reportWarning(
      _("%s sequence [%s] was ignored."),
      "SPA", Array.slice(arguments));
  },

  /**
   * EPA
   */
  "[profile('vt100'), sequence('0x97', 'ESC W')]":
  function EPA()
  {
    coUtils.Debug.reportWarning(
      _("%s sequence [%s] was ignored."),
      "EPA", Array.slice(arguments));
  },

  /**
   *
   * SOS - START OF STRING
   *
   * Notation: (C1)
   * Representation: 09/08 or ESC 05/08
   * SOS is used as the opening delimiter of a control string. The character
   * string following may consist of any bit combination, except those
   * representing SOS or STRING TERMINATOR (ST). The control string is closed
   * by the terminating delimiter STRING TERMINATOR (ST). The interpretation
   * of the character string depends on the application.
   *
   */
  "[profile('vt100'), sequence('0x98 ... ST', 'ESC X ... ST')]":
  function SOS(message)
  {
    this.sendMessage("sequence/sos", message);
  },

  /**
   * SGCI
   */
  "[profile('vt100'), sequence('0x99', 'ESC Y')]":
  function SGCI()
  {
    coUtils.Debug.reportWarning(
      _("%s sequence [%s] was ignored."),
      "SGCI", Array.slice(arguments));
  },

  /**
   * SCI
   */
  "[profile('vt100'), sequence('0x9a', 'ESC Z')]":
  function SCI()
  {
    coUtils.Debug.reportWarning(
      _("%s sequence [%s] was ignored."),
      "SCI", Array.slice(arguments));
  },

  /**
   * ST
   */
  "[profile('vt100'), sequence('0x9c', 'ESC \\\\')]":
  function ST()
  {
    coUtils.Debug.reportWarning(
      _("%s sequence [%s] was ignored."),
      "ST", Array.slice(arguments));
  },

  /**
   *
   * OSC - OPERATING SYSTEM COMMAND
   *
   * Notation: (C1)
   *
   * Representation: 09/13 or ESC 05/13
   *
   * OSC is used as the opening delimiter of a control string for operating
   * system use. The command string following may consist of a sequence of
   * bit combinations in the range 00/08 to 00/13 and 02/00 to 07/14. The
   * control string is closed by the terminating delimiter STRING TERMINATOR
   * (ST). The interpretation of the command string depends on the relevant
   * operating system.
   *
   */
  "[profile('vt100'), sequence('0x9d ... ST', 'ESC ] ... ST')]":
  function OSC(message)
  {
    var delimiter_position = message.indexOf(";"),
        num,
        command;

    if (-1 === delimiter_position) {
      num = message;
      this.sendMessage("sequence/osc/" + num);
    } else {
      num = message.substr(0, delimiter_position),
      command = message.substr(delimiter_position + 1);
      this.sendMessage("sequence/osc/" + num, command);
    }
  },

  /**
   *
   * PM - PRIVACY MESSAGE
   *
   * Notation: (C1)
   * Representation: 09/14 or ESC 05/14
   * PM is used as the opening delimiter of a control string for privacy
   * message use. The command string following may consist of a sequence of
   * bit combinations in the range 00/08 to 00/13 and 02/00 to 07/14. The
   * control string is closed by the terminating delimiter STRING TERMINATOR
   * (ST). The interpretation of the command string depends on the relevant
   * privacy discipline.
   *
   */
  /** private message */
  "[profile('vt100'), sequence('0x9e ... ST', 'ESC ^ ... ST')]":
  function PM(message)
  {
    this.sendMessage("sequence/pm", message);
  },

  /**
   *
   * APC - APPLICATION PROGRAM COMMAND
   *
   * Notation: (C1)
   * Representation: 09/15 or ESC 05/15
   * APC is used as the opening delimiter of a control string for application
   * program use. The command string following may consist of bit combinations
   * in the range 00/08 to 00/13 and 02/00 to 07/14. The control string is
   * closed by the terminating delimiter STRING TERMINATOR (ST). The
   * interpretation of the command string depends on the relevant application
   * program.
   *
   */
  "[profile('vt100'), sequence('0x9f ... ST', 'ESC _ ... ST')]":
  function APC(message)
  {
    this.sendMessage("sequence/apc", message);
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


}; // C1Control

/**
 * @fn main
 * @brief Module entry point.
 * @param {Broker} broker The Broker object.
 */
function main(broker)
{
  new C1Control(broker);
}

// EOF
