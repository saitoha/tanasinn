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
 * @class CursorState
 * @brief Manages cursor position.
 */
let CursorState = new Class().extends(Component);
CursorState.definition = {

  get id()
    "cursorstate",

  positionX: 0,
  positionY: 0,

  attr: null,

  _originX: 0,
  _originY: 0,

  _DECOM: false,

  get originX()
  {
    if (this._DECOM) {
      return this._originX;
    }
    return 0;
  },

  set originX(value)
  {
    this._originX = value;
  },

  get originY()
  {
    if (this._DECOM) {
      return this._originY;
    }
    return 0;
  },

  set originY(value)
  {
    this._originY = value;
  },

  get DECOM()
  {
    return this._DECOM;
  },

  set DECOM(value)
  {
    this._DECOM = value;
    if (value) {
      this._originY = this.positionY;
      this._originX = this.positionX;
    } else {
      this._originY = 0;
      this._originX = 0;
    }
  },

  // Using this flag insted of emurator._decMode.TCEM.
  visibility: true,

  blink: false,

  _backup_instance: null,

  _drcs_state: null, 

  /** constructor */
  "[subscribe('@initialized/linegenerator'), enabled]":
  function onLoad(line_generator) 
  {
    this.attr = line_generator.allocate(1, 1).shift().cells.shift();
    let broker = this._broker;
    broker.notify("initialized/" + this.id, this);
  },

  /** reset cursor state. */
  reset: function reset() 
  {
    this.positionX = 0;
    this.positionY = 0;
    this.originX = 0;
    this.originY = 0;
    this._backup_instance = null;
    this.blink = false;
    this.attr.clear(); // turns all character attributes off (normal settings).
  },

  /** backup current cursor state. */
  backup: function backup() 
  {
    let broker = this._broker;
    let context = {};
    this._backup_instance = context;
    broker.notify("command/save-cursor", context);

    context.positionX = this.positionX;
    context.positionY = this.positionY;
    context.originX = this.originX;
    context.originY = this.originY;
    context.visibility = this.visibility;
    context.blink = this.blink;
    context.attr_value = this.attr.value;
  },

  /** restore cursor state from the backup instance. */
  restore: function restore() 
  {
    let broker = this._broker;
    let context = this._backup_instance;
    if (null === context) {
      coUtils.Debug.reportWarning(
        _('Cursor backup instance not found.'));
      return;
    }
    broker.notify("command/restore-cursor", context);

    this.positionX = context.positionX;
    this.positionY = context.positionY;
    this.originX = context.originX;
    this.originY = context.originY;
    this.visibility = context.visibility;
    this.blink = context.blink;
    this.attr.value = context.attr_value;
  },

  serialize: function serialize(context)
  {
    context.push(this.positionX);
    context.push(this.positionY);
    context.push(this.originX);
    context.push(this.originY);
    context.push(this.visibility);
    context.push(this.blink);
    context.push(this.attr.value);
    context.push(null !== this._backup_instance);
    let backup = this._backup_instance;
    if (null !== backup) {
      context.push(backup.positionX);
      context.push(backup.positionY);
      context.push(backup.originX);
      context.push(backup.originY);
      context.push(backup.visibility);
      context.push(backup.blink);
      context.push(backup.attr_value);
    }
  },

  deserialize: function deserialize(context)
  {
    this.positionX = context.shift();
    this.positionY = context.shift();
    this.originX = context.shift();
    this.originY = context.shift();
    this.visibility = context.shift();
    this.blink = context.shift();
    this.attr.value = context.shift();
    let backup_exists = context.shift();
    if (backup_exists) {
      let backup = this._backup_instance = {};
      backup.positionX = context.shift();
      backup.positionY = context.shift();
      backup.originX = context.shift();
      backup.originY = context.shift();
      backup.visibility = context.shift();
      backup.blink = context.shift();
      backup.attr_value = context.shift();
    }
  },
 
  "[subscribe('event/drcs-state-changed/g0'), enabled]": 
  function onDRCSStateChangedG0(state) 
  {
    if (null !== state) {
      this.attr.drcs = true;
    } else {
      this.attr.drcs = false;
    }
  },
 
  "[subscribe('event/drcs-state-changed/g1'), enabled]": 
  function onDRCSStateChangedG1(state) 
  {
    if (null !== state) {
      this.attr.drcs = true;
    } else {
      this.attr.drcs = false;
    }
  },

  /**
   *
   * DECSC — Save Cursor
   *
   * Format
   *    ESC    7
   *    1/11   3/7
   *
   * Description
   * 
   * Saves the following items in the terminal's memory:
   * 
   *   - Cursor position
   *   - Character attributes set by the SGR command
   *   - Character sets (G0, G1, G2, or G3) currently in GL and GR
   *   - TODO: Wrap flag (autowrap or no autowrap)
   *   - State of origin mode (DECOM)
   *   - TODO: Selective erase attribute
   *   - TODO: Any single shift 2 (SS2) or single shift 3 (SS3) functions sent
   */
  "[profile('vt100'), sequence('ESC 7')] DECSC": 
  function DECSC() 
  {
    this.backup(); 
  },
   
  /**
   * DECRC — Restore Cursor
   * 
   * Restores the terminal to the state saved by the save cursor (DECSC) function.
   *
   * Format
   *    ESC     8
   *    1/11    3/8
   *
   * Description
   * 
   * If nothing was saved by DECSC, then DECRC performs the following actions:
   * 
   *   - Moves the cursor to the home position (upper left of screen).
   *   - Resets origin mode (DECOM).
   *   - Turns all character attributes off (normal setting).
   *   - TODO: Maps the ASCII character set into GL, and the DEC Supplemental 
   *     Graphic set into GR.
   * 
   * Notes on DECSC and DECRC
   * 
   * The terminal maintains a separate DECSC buffer for the main display and 
   * the status line. This feature lets you save a separate operating state 
   * for the main display and the status line.
   */
  "[profile('vt100'), sequence('ESC 8')] DECRC": 
  function DECRC() 
  {
    this.restore();
  },

  /**
   * SGR — Select Graphic Rendition
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
   * attributes. Table 5–16 lists Ps values and the attributes they select.
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
   *     (default)—SCO Console only.
   * 11  Map Hex 00-7F of the PC character set codes to the current 7-bit 
   *     display character set—SCO Console only.
   * 12  Map Hex 80-FF of the current character set to the current 7-bit 
   *     display character set—SCO Console only.
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
  "[profile('vt100'), sequence('CSI %dm')]":
  function SGR(n) 
  { // character attributes
    // -- xterm-256color --
    //  setab=\E[%?%p1%{8}%<%t4%p1%d%e%p1%{16}%<%t10%p1%{8}%-%d%e48;5;%p1%d%;m,
    //  setaf=\E[%?%p1%{8}%<%t3%p1%d%e%p1%{16}%<%t9%p1%{8}%-%d%e38;5;%p1%d%;m,
    //  sgr=%?%p9%t\E(0%e\E(B%;\E[0%?%p6%t;1%;%?%p2%t;4%;%?%p1%p3%|%t;7%;%?%p4%t;5%;%?%p7%t;8%;m,
    //
    let attr = this.attr;
    let broker = this._broker;

    if (0 == arguments.length) {
      attr.clear()
    } else {

      for (let i = 0; i < arguments.length; ++i) {

        let p = arguments[i];

        switch (p) {

          case 0:
            attr.clear();
            break;

          case 1:
            attr.bold = true;
            break;

          case 2:
            attr.bold = false;
            attr.halfbright = true; // TODO: halfbright
            break;

          case 3:
            attr.italic = true;
            break;

          case 4:
            attr.underline = true;
            break;

          case 5:
            attr.blink = true; // slow blink, less than 150 times per minute.
            break;

          case 6:
            attr.rapid_blink = true; // rapid blink, 150 times per minute or more.
            break;

          case 7:
            attr.inverse = true;
            break;

          case 8:
            attr.invisible = true; // TODO: SGR invisible
            break;

          case 10:
            broker.notify("event/shift-in");
            break;

          case 11:
            broker.notify("event/shift-out");
            break;

          case 21:
            attr.bold = false;
            break;

          case 22:
            attr.halfbright = false;
            break;

          case 23:
            attr.italic = false;
            break;
          
          case 24:
            attr.underline = false;
            break;

          case 25:
            attr.blink = false;
            attr.rapid_blink = false;
            break;

          case 27:
            attr.inverse = false; // SGR positive (not inverse)
            break;

          case 30:
            attr.fg = 0;
            break;

          case 31:
            attr.fg = 1;
            break;

          case 32:
            attr.fg = 2;
            break;

          case 33:
            attr.fg = 3;
            break;

          case 34:
            attr.fg = 4;
            break;

          case 35:
            attr.fg = 5;
            break;

          case 36:
            attr.fg = 6;
            break;

          case 37:
            attr.fg = 7;
            break;

          case 38:
            arguments[++i] == 5 && (attr.fg = arguments[++i]);
            break;

          case 39:
            attr.fgcolor = false;
            attr.bold = false; // SGR default fg.
            break;

          case 40:
            attr.bg = 0;
            break;

          case 41:
            attr.bg = 1;
            break;

          case 42:
            attr.bg = 2;
            break;

          case 43:
            attr.bg = 3;
            break;

          case 44:
            attr.bg = 4;
            break;
            
          case 45:
            attr.bg = 5;
            break;

          case 46:
            attr.bg = 6;
            break;

          case 47:
            attr.bg = 7;
            break;

          case 48:
            arguments[++i] == 5 && (attr.bg = arguments[++i]);
            break;

          case 49:
            attr.bgcolor = false; // SGR default bg.
            break;

          case 90:
            attr.fg = 8;
            break;

          case 91:
            attr.fg = 9;
            break;

          case 92:
            attr.fg = 10;
            break;

          case 93:
            attr.fg = 11;
            break;

          case 94:
            attr.fg = 12;
            break;

          case 95:
            attr.fg = 13
            break;

          case 96:
            attr.fg = 14;
            break;

          case 97:
            attr.fg = 15
            break;

          case 100:
            attr.bg = 8;
            break;

          case 101:
            attr.bg = 9;
            break;

          case 102:
            attr.bg = 10;
            break;

          case 103:
            attr.bg = 11;
            break;

          case 104:
            attr.bg = 12;
            break;

          case 105:
            attr.bg = 13;
            break;

          case 106:
            attr.bg = 14;
            break;

          case 107:
            attr.bg = 15;
            break;

          default:
            if (300 <= p && p <= 399) {
              attr.bg = p - 300;
            } else if (400 <= p && p <= 499) {
              attr.bg = p - 400;
            } else if (3000 <= p && p <= 3255) {
              attr.bg = p - 3000;
            } else if (4000 <= p && p <= 4255) {
              attr.bg = p - 4000;
            } else {
              coUtils.Debug.reportWarning(
                _("Ignored SGR %s, arguments: [%s]"), 
                p, Array.slice(arguments));
            }
        }
      }
    }
  },

};

/**
 * @fn main
 * @brief Module entry point.
 * @param {Broker} broker The Broker object.
 */
function main(broker) 
{
  new CursorState(broker);
}


