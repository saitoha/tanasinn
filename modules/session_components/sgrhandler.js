/* -*- Mode: JAVASCRIPT; tab-width: 2; indent-tabs-mode: nil; c-basic-offset: 2 -*-
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
 * @class SGRHandler
 *
 * SGR - Select Graphic Rendition
 *
 * This control function selects one or more character attributes at the
 * same time.
 *
 * Default: Clear all attributes.
 *
 * Format
 *
 * CSI   Ps    ;     Ps    ...   m
 * 9/11  3/n   3/11  3/n   ...   6/13
 *
 * Parameters
 *
 * Ps is a number representing a certain visual attribute.
 * You can use more than one Ps value to select different character
 * attributes. Table 5-16 lists Ps values and the attributes they select.
 *
 * Default: Ps = 0 (clears all attributes).
 *
 * Table: Visual Character Attribute Values Ps Attribute
 *
 * 0   All attributes off
 * 1   Bold
 * 4   Underline
 * 5   Blinking
 * 7   Negative image
 * 8   Invisible image
 * 10  The ASCII character set is the current 7-bit display character set
 *     (default)-SCO Console only.
 * 11  Map Hex 00-7F of the PC character set codes to the current 7-bit
 *     display character set-SCO Console only.
 * 12  Map Hex 80-FF of the current character set to the current 7-bit
 *     display character set-SCO Console only.
 * 22  Bold off
 * 24  Underline off
 * 25  Blinking off
 * 27  Negative image off
 * 28  Invisible image off
 *
 * Examples
 *
 * When you select more than one attribute in an SGR sequence, then they are
 * executed in order. For example, you can use the following sequence to
 * display text that is bold, blinking, and underlined:
 *
 * CSI 0 ; 1 ; 5 ; 4 m
 *
 * The following sequence displays the negative image of text:
 *
 * CSI 7 m
 *
 * Notes on SGR
 *
 * After you select an attribute, the terminal applies that attribute to all
 * new characters received. If you move characters by scrolling, then the
 * attributes move with the characters.
 * If you display control characters, then the terminal ignores the bold
 * attribute for displayed control characters.
 *
 *
 * When a PC character set is selected . . .   Displays . . .
 *
 * Executing "CSI 10 m"         00-1F: control codes
 *                              20-7F: ASCII characters
 *                              80-FF: 8 bit PC characters
 *
 * Executing "CSI 11 m"         00-1F: PC characters, except the following
 *                                     codes when XON/XOFF is enabled:
 *                                        1B (ESC)
 *                                        11 (DC1)
 *                                        13 (DC3)
 *
 *                              20-7F: ASCII characters (or PC 7 bit character)
 *                              80-FF: 8 bit PC characters
 *
 * Executing "CSI 12 m"         00-1F: PC characters that are located in
 *                                     80 - 9F in PC character set, except
 *                                     the following codes when XON/XOFF is
 *                                     enabled:
 *                                        9B (ESC)
 *                                        91 (DC1)
 *                                        93 (DC3)
 *                              20-7F: PC characters located in A0-FF
 *                              80-FF: 8 bit PC characters.
 *
 *
 * When an ISO/ANSI character set is selected . . .  Displays . . .
 *
 * Executing "CSI 10 m"         00-1F: control codes
 *                              20-7F: ASCII characters
 *                              80-9F: control code
 *                              A0-FF: GR characters
 *
 * Executing "CSI 12 m"         00-1F: control codes
 *                              20-7F: ISO/ANSI characters located in A0-FF
 *                              80-9F: control code
 *                              A0-FF: GR characters
 *
 * Commands "CSI 10-12 m" affect only the Hex 00-7F portion of the display
 * character set. The hex 80-FF region of the display character set is left
 * intact.
 *
 * The ASCII character set with control codes residing in Hex 00 to 1F
 * region is the default 7-bit display character set. This is true
 * regardless of the ISO/ANSI or PC character set. When in an ISO/ANSI
 * character set, issuing "CSI 10 m" is equivalent to "designating and
 * invoking ASCII to G0 and GL."
 *
 * When "ESC 11 m" is executed, the display character set is loaded with
 * codes in the Hex 00 to 7F region of a PC character set. PC characters
 * whose code values are less than 1F can be displayed through this
 * sequence except 1B (ESC) and 11(DC1), 13(DC3) when XON/XOFF is enabled.
 * 1B is always executed as an ESC to allow the application to execute the
 * command to go back to the default character set. Hex 11 and 13 can be
 * displayed only when XON/XOFF is disabled. This command does not work when
 * the ISO/ANSI character set is selected.
 *
 * Command "ESC 12 m" toggles the high bit of the current 8-bit character
 * set. All the characters in Hex 80-FF region can be displayed as 7-bit
 * codes except 9B (ESC) and 91(DC1), 93(DC3) when XON/XOFF is enabled.
 * After the command is executed, 1B is executed as an ESC. Hex 11 and 13
 * can be displayed only when XON/XOFF is disabled.
 *
 * When in an ISO/ANSI character set, issuing "CSI 12 m" is equivalent to
 * "designating and invoking current 8 bit char set to G2 and GL."
 */
var SGRHandler = new Class().extends(Plugin)
                            .depends("palette")
                            .depends("cursorstate");
SGRHandler.definition = {

  id: "sgr_handler",

  /** plugin information */
  getInfo: function getInfo()
  {
    return {
      name: _("SGR Handler"),
      version: "0.1",
      description: _("Handle SGR sequence and enable character attribute support.")
    };
  },

  "[persistable] enabled_when_startup": true,

  _attr: null, // current cursor attribute
  _palette: null,

  /** Installs itself.
   *  @param {InstallContext} context A InstallContext object.
   */
  "[install]":
  function install(context)
  {
    this._palette = context["palette"];
    this._attr = context["cursorstate"].attr;
  },

  /** Uninstalls itself.
   */
  "[uninstall]":
  function uninstall()
  {
    this._palette = null;
    this._attr = null;
  },

  "[subscribe('command/query-da1-capability'), pnp]":
  function onQueryDA1Capability(mode)
  {
    return 22; // ANSI color
  },

  "[profile('vt100'), sequence('CSI Pm m')]":
  function SGR(n)
  { // character attributes
    var attr = this._attr,
        length = arguments.length,
        i,
        p;

    // -- xterm-256color --
    //  setab=\E[%?%p1%{8}%<%t4%p1%d%e%p1%{16}%<%t10%p1%{8}%-%d%e48;5;%p1%d%;m,
    //  setaf=\E[%?%p1%{8}%<%t3%p1%d%e%p1%{16}%<%t9%p1%{8}%-%d%e38;5;%p1%d%;m,
    //  sgr=%?%p9%t\E(0%e\E(B%;\E[0%?%p6%t;1%;%?%p2%t;4%;%?%p1%p3%|%t;7%;%?%p4%t;5%;%?%p7%t;8%;m,
    //
    if (0 === length) {
      attr.clear()
    } else {
      for (i = 0; i < length; ++i) {

        p = arguments[i];

        if (undefined === p) {
          attr.clear();
        } else {

          switch (p) {

            case 0:
              attr.clear();
              break;

            case 1:
              attr.setBold(true);
              break;

            case 2:
              attr.setBold(false);
              attr.setHalfbright(true);
              break;

            case 3:
              attr.setItalic(true);
              break;

            case 4:
              attr.setUnderline(true);
              break;

            case 5:
              attr.setBlink(true); // slow blink, less than 150 times per minute.
              break;

            case 6:
              attr.setRapidBlink(true); // rapid blink, 150 times per minute or more.
              break;

            case 7:
              attr.setInverse(true);
              break;

            case 8:
              attr.setInvisible(true);
              break;

            case 9:
              attr.setStrike(true);
              break;

            case 10:
              this.sendMessage("event/shift-in");
              break;

            case 11:
              this.sendMessage("event/shift-out");
              break;

            case 21:
              attr.setBold(false);
              break;

            case 22:
              attr.setHalfbright(false);
              break;

            case 23:
              attr.setItalic(false);
              break;

            case 24:
              attr.setUnderline(false);
              break;

            case 25:
              attr.setBlink(false);
              attr.setRapidBlink(false);
              break;

            case 27:
              attr.setInverse(false); // SGR positive (not inverse)
              break;

            case 28:
              attr.setInvisible(false);
              break;

            case 29:
              attr.setStrike(false);
              break;

            case 30:
              attr.setForeColor(0);
              //attr.resetForeColor();
              break;

            case 31:
              attr.setForeColor(1);
              break;

            case 32:
              attr.setForeColor(2);
              break;

            case 33:
              attr.setForeColor(3);
              break;

            case 34:
              attr.setForeColor(4);
              break;

            case 35:
              attr.setForeColor(5);
              break;

            case 36:
              attr.setForeColor(6);
              break;

            case 37:
              attr.setForeColor(7);
              break;

            case 38:
              switch (arguments[++i]) {
                /*
                case 2:
                  {
                    var r = arguments[++i],
                        g = arguments[++i],
                        b = arguments[++i];

                    attr.setForeColor(this._palette.getApproximateColorNumber(r, g, b));
                    break;
                  }
                */
                case 5:
                  attr.setForeColor(arguments[++i]);
                  break;

                default:
                  ++i;
                  break;
              }
              break;

            case 39:
              attr.resetForeColor();
              attr.setBold(false); // SGR default fg.
              break;

            case 40:
              attr.setBackColor(0);
              //attr.resetBackColor();
              break;

            case 41:
              attr.setBackColor(1);
              break;

            case 42:
              attr.setBackColor(2);
              break;

            case 43:
              attr.setBackColor(3);
              break;

            case 44:
              attr.setBackColor(4);
              break;

            case 45:
              attr.setBackColor(5);
              break;

            case 46:
              attr.setBackColor(6);
              break;

            case 47:
              attr.setBackColor(7);
              break;

            case 48:
              switch (arguments[++i]) {
                /*
                case 2:
                  {
                    var r = arguments[++i],
                        g = arguments[++i],
                        b = arguments[++i];

                    attr.setBackColor(this._palette.getApproximateColorNumber(r, g, b));
                    break;
                  }
                */
                case 5:
                  attr.setBackColor(arguments[++i]);
                  break;

                default:
                  ++i;
                  break;
              }
              break;

            case 49:
              attr.resetBackColor(); // SGR default bg.
              break;

            case 90:
              attr.setForeColor(8);
              break;

            case 91:
              attr.setForeColor(9);
              break;

            case 92:
              attr.setForeColor(10);
              break;

            case 93:
              attr.setForeColor(11);
              break;

            case 94:
              attr.setForeColor(12);
              break;

            case 95:
              attr.setForeColor(13);
              break;

            case 96:
              attr.setForeColor(14);
              break;

            case 97:
              attr.setForeColor(15);
              break;

            case 100:
              attr.setBackColor(8);
              break;

            case 101:
              attr.setBackColor(9);
              break;

            case 102:
              attr.setBackColor(10);
              break;

            case 103:
              attr.setBackColor(11);
              break;

            case 104:
              attr.setBackColor(12);
              break;

            case 105:
              attr.setBackColor(13);
              break;

            case 106:
              attr.setBackColor(14);
              break;

            case 107:
              attr.setBackColor(15);
              break;

            default:
              if (300 <= p && p <= 399) {
                attr.setBackColor(p - 300);
              } else if (400 <= p && p <= 499) {
                attr.setBackColor(p - 400);
              } else if (3000 <= p && p <= 3255) {
                attr.setBackColor(p - 3000);
              } else if (4000 <= p && p <= 4255) {
                attr.setBackColor(p - 4000);
              } else {
                coUtils.Debug.reportWarning(
                  _("Ignored SGR %s, arguments: [%s]"),
                  p, Array.slice(arguments));
              }
          }
        }
      }
    }
  }, // SGR

  "[subscribe('sequence/decrqss/sgr'), pnp]":
  function onRequestStatus(data)
  {
    var attr = this._attr,
        params = [0],
        message,
        fore_no;
        back_no;

    if (attr.getBold()) {
      params.push(1);
    }

    if (attr.getHalfbright()) {
      params.push(2);
    }

    if (attr.getItalic()) {
      params.push(3);
    }

    if (attr.getUnderline()) {
      params.push(4);
    }

    if (attr.getBlink()) {
      params.push(5);
    }

    if (attr.getRapidBlink()) {
      params.push(6);
    }

    if (attr.getInverse()) {
      params.push(7);
    }

    if (attr.getInvisible()) {
      params.push(8);
    }

    if (attr.hasForeColor()) {
      fore_no = attr.getForeColor();
      if (fore_no <= 7) {
        params.push(30 + fore_no);
      } else if (fore_no <= 15) {
        params.push(82 + fore_no);
      } else {
        params.push(38);
        params.push(5);
        params.push(fore_no);
      }
    } else {
      params.push(39);
    }

    if (attr.hasBackColor()) {
      back_no = attr.getBackColor();
      if (back_no <= 7) {
        params.push(40 + back_no);
      } else if (back_no <= 15) {
        params.push(92 + back_no);
      } else {
        params.push(48);
        params.push(5);
        params.push(back_no);
      }
    } else {
      params.push(49);
    }

    message = params.join(";") + "m";

    this.sendMessage("command/send-sequence/decrpss", message);
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


}; // class SGRHandler

/**
 * @fn main
 * @brief Module entry point.
 * @param {Broker} broker The Broker object.
 */
function main(broker)
{
  new SGRHandler(broker);
}

// EOF
