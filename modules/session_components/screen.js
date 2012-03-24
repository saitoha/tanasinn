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


//////////////////////////////////////////////////////////////////////////////
//
// Concepts
//

/**
 * @concept GrammarConcept
 */
let ScreenConcept = new Concept();
ScreenConcept.definition = {

  get id()
    "ScreenConcept",

  // signature concept
  "allocate :: Uint16 -> Uint16 -> Array":
  _("Allocates n cells at once."),

}; // ScreenConcept

/**
 * @concept ScreenSwitchConcept
 */
let ScreenSwitchConcept = new Concept();
ScreenSwitchConcept.definition = {

  get id()
    "ScreenSwitch",

  "switchToAlternateScreen :: Undefined":
  _("Switch to Alternate screen."),

  "switchToMainScreen :: Undefined":
  _("Switch to Main screen."),

  "selectAlternateScreen :: Undefined":
  _("Memorize cursor state, switch to Main screen, and erase screen."),

  "selectMainScreen :: Undefined":
  _("Erase screen, switch to Main screen, and restore cursor."),

}; // ScreenSwitchConcept

/**
* @concept ScreenBackupConcept
*/
let ScreenBackupConcept = new Concept();
ScreenBackupConcept.definition = {

  get id()
    "ScreenBackup",

  "<command/backup> :: Object -> Undefined": 
  _("Backups screen into serialize context."),

  "<command/restore> :: Object -> Undefined": 
  _("Restores screen from serialize context."),

}; // ScreenBackupConcept

/**
 * @concept ScreenCursorOperationsConcept
 *
 */
let ScreenCursorOperationsConcept = new Concept();
ScreenCursorOperationsConcept.definition = {  

  get id()
    "ScreenCursorOperations",

  "cursorForward :: Uint16 -> Undefined":
  _("Move cursor to forward (right)."),

  "cursorBackward :: Uint16 -> Undefined":
  _("Move cursor to backward (left)."),

  "cursorUp :: Uint16 -> Undefined":
  _("Move CUrsor Up (CUP)."),
  
  "cursorDown :: Uint16 -> Undefined":
  _("Move CUrsor Down (CUD)."),

  "setPositionX :: Uint16 -> Undefined":
  _("cursor CHaracter Absolute column (CHA)."),

  "setPositionY :: Uint16 -> Undefined":
  _("set Virtical Position Absolutely (VPA)."),

  "backSpace :: Undefined":
  _("BackSpace (BS)."),
 
  "carriageReturn :: Undefined":
  _("CarriageReturn (CR)."),
  
  "horizontalTab :: Undefined":
  _("horizontalTab (HT)."),

}; // ScreenCursorOperations

/**
 * @concept ScreenEditConcept
 *
 */
let ScreenEditConcept = new Concept();
ScreenEditConcept.definition = {  

  get id()
    "ScreenEdit",

  "eraseLineToRight :: Undefined":
  _("Erase cells from current position to end of line."),

  "eraseLineToLeft :: Undefined":
  _("Erase cells from specified position to head of line."),

  "eraseLine :: Undefined":
  _("Erase current line"),

  "eraseScreenAbove :: Undefined":
  _("Erase cells from current position to head of buffer."),

  "eraseScreenBelow :: Undefined":
  _("Erase cells from current position to end of buffer."),

  "eraseScreenAll :: Undefined":
  _("Erase every cells in screen."),

  "insertBlanks :: Uint16 -> Undefined":
  _("Insert n cells at specified position."),
      
  "setScrollRegion :: Uint16 -> Uint16 -> Undefined":
  _("Sets top margin and bottom margin of scroll region."),

  "resetScrollRegion :: Undefined":
  _("Resets top margin and bottom margin of scroll region."),

  "reverseIndex :: Undefined":
  _("Reverse Index (RI)."),
  
  "lineFeed :: Undefined":
  _("Line Feed (LF)"),

  "insertLine :: Uint16 -> Undefined":
  _("Inserts new lines at the specified position."),

  "deleteLine :: Uint16 -> Undefined":
  _("Deletes n lines from the specified position."),

  "scrollUpLine :: Uint16 -> Undefined":
  _("Scrolls up n lines."),

  "scrollDownLine :: Uint16 -> Undefined":
  _("Scrolls down n lines."),

  "eraseCharacters :: Uint16 -> Undefined":
  _("Erases n characters."),

  "deleteCharacters :: Uint16 -> Undefined":
  _("Deletes n characters."),

}; // ScreenEditConcept



//////////////////////////////////////////////////////////////////////////////
//
// Implementation
//
const CO_SCREEN_MAIN = true;
const CO_SCREEN_ALTERNATE = false;

/**
 * @trait ScreenSequenceHandler
 *
 */
let ScreenSequenceHandler = new Trait() 
ScreenSequenceHandler.definition = {

  /**
   * ICH — Insert Character
   * 
   * This control function inserts one or more space (SP) characters starting 
   * at the cursor position.
   * 
   * Available in: VT Level 4 mode only
   *
   * Format
   *
   * CSI    Pn    @
   * 9/11   3/n   4/0
   *
   * Parameters
   * 
   * @param {Number} n the number of characters to insert.
   *
   * Default: Pn = 1.
   * Description
   * 
   * The ICH sequence inserts Pn blank characters with the normal character 
   * attribute. The cursor remains at the beginning of the blank characters. 
   * Text between the cursor and right margin moves to the right. Characters 
   * scrolled past the right margin are lost. ICH has no effect outside the 
   * scrolling margins.
   *
   */
  "[sequence('CSI %d@')]":
  function ICH(n) 
  { // Insert (blank) CHaracters.
    this.insertBlanks(n || 1)
  },
  
  /**
   * CUU — Cursor Up
   * 
   * Moves the cursor up a specified number of lines in the same column. 
   * The cursor stops at the top margin. If the cursor is already above the 
   * top margin, then the cursor stops at the top line.
   *
   * Format
   *
   * CSI    Pn    A
   * 9/11   3/n   4/1
   *
   * Parameters
   * 
   * @param {Number} n the number of lines to move the cursor up.
   *
   */
  "[sequence('CSI %dA')]":
  function CUU(n) 
  { // CUrsor Up
    this.cursorUp(n || 1);
  },

  /**
   * CUD — Cursor Down
   * 
   * This control function moves the cursor down a specified number of lines 
   * in the same column. The cursor stops at the bottom margin. If the cursor 
   * is already below the bottom margin, then the cursor stops at the bottom 
   * line.
   *
   * Format
   *
   * CSI    Pn    B
   * 9/11   3/n   4/2
   *
   * @param {Number} n the number of lines to move the cursor down.
   */
  "[sequence('CSI %dB')]":
  function CUD(n) 
  { // CUrsor Down
    this.cursorDown(n || 1);
  },

  /**
   * CUF — Cursor Forward
   * 
   * This control function moves the cursor to the right by a specified 
   * number of columns. The cursor stops at the right border of the page.
   *
   * Format
   *
   * CSI    Pn    C
   * 9/11   3/n   4/3
   *
   * @param {Number} n the number of columns to move the cursor to the right.
   */
  "[sequence('CSI %dC')]":
  function CUF(n) 
  { // CUrsor Forward (right).
    this.cursorForward(n || 1);
  },

  /**
   * CUB — Cursor Backward
   * 
   * This control function moves the cursor to the left by a specified number 
   * of columns. The cursor stops at the left border of the page.
   *
   * Format
   *
   * CSI    Pn    D
   * 9/11   3/n   4/4
   * 
   * @param {Number} n the number of columns to move the cursor to the left.
   */
  "[sequence('CSI %dD')]":
  function CUB(n) 
  { // CUrsor Back (left).
    this.cursorBackward(n || 1);
  },

  /**
   * CHA — Cursor Horizontal Absolute
   * 
   * Move the active position to the n-th character of the active line.
   * 
   * Default: 1.
   *
   * Format
   *
   * CSI    Pn    G
   * 9/11   3/n   4/7
   *
   * @param {Number} n the number of active positions to the n-th character 
   *                   of the active line.
   *
   * Description
   * 
   * The active position is moved to the n-th character position of the
   * active line.
   */
  "[sequence('CSI %dG')]":
  function CHA(n) 
  { // cursor CHaracter Absolute column
    this.setPositionX((n || 1) - 1 + this.cursor.originX);
  },

  /**
   * CUP—Cursor Position
   * 
   * This control function moves the cursor to the specified line and column. 
   * The starting point for lines and columns depends on the setting of 
   * origin mode (DECOM). CUP applies only to the current page.
   *
   * Format
   *
   * CSI    Pl    ;      Pc    H
   * 9/11   3/n   3/11   3/n   4/8
   *
   * Parameters
   * 
   * @param {Number} n1 the number of the line to move to. If n1 is 0 or 1, 
   *                    then the cursor moves to line 1.
   * 
   * @param {Number} n2 the number of the column to move to. If n1 is 0 or 1, 
   *                    then the cursor moves to column 1.
   */
  "[sequence('CSI %dH')]":
  function CUP(n1, n2) 
  { // move CUrsor to absolute Position 
    this.VPA(n1);
    this.CHA(n2);
    // with no parameters, move to origin
  },

  "[sequence('ESC #8')]":
  function DECALN() 
  { // DEC Screen Alignment Test
      this.eraseScreenAllWithTestPattern();
  },

  "[sequence('CSI %dJ')]":
  function ED(n) 
  { // Erase Display
    n == 0 ?   // erase below
      this.eraseScreenBelow()
    : n == 1 ?   // erase above
      this.eraseScreenAbove()
    : n == 2 ? // erase all
      this.eraseScreenAll()
    //: n == 3 ? // erase saved lines (xterm)
    //  undefined // TODO: 
    : coUtils.Debug.reportWarning(
        _("%s sequence [%s] was ignored."),
        arguments.callee.name, Array.slice(arguments));
  },

  "[sequence('CSI %dK')]":
  function EL(n) 
  { // Erase Line
    n == 0 ? // erase to right
      this.eraseLineToRight()
    : n == 1 ? // erase to left
      this.eraseLineToLeft()
    : n == 2 ? // erase all
      this.eraseLine()
    : coUtils.Debug.reportWarning(
        _("%s sequence [%s] was ignored."),
        arguments.callee.name, Array.slice(arguments));
  },

  "[sequence('CSI %dL')]":
  function IL(n) 
  { // Insert Line
    this.insertLine(n || 1);
  },

  "[sequence('CSI %dM')]":
  function DL(n) 
  { // Delete Line.
    this.deleteLine(n || 1);
  },

  /**
   * Delete Character (DCH)  
   *
   * 9/11    5/0 
   * CSI  Pn  P
   *
   *  Deletes Pn characters starting with the character at the cursor position. 
   *  When a character is deleted, all characters to the right of the cursor 
   *  move to the left. 
   *  This creates a space character at the right margin for each character 
   *  deleted. 
   *  Character attributes move with the characters. 
   *  The spaces created at the end of the line have all their character 
   *  attributes off.
   */
  "[sequence('CSI %dP')]":
  function DCH(n) 
  { // Delete CHaracters
    this.deleteCharacters(n || 1);
  },
  
  /**
   * SU—Pan Down
   * 
   * This control function moves the user window down a specified number of 
   * lines in page memory.
   *
   * Format
   *
   * CSI    Pn    S
   * 9/11   3/n   5/3
   *
   * @param {Number} n the number of lines to move the user window down in 
   *                   page memory. Pn new lines appear at the bottom of the 
   *                   display. Pn old lines disappear at the top of the 
   *                   display. You cannot pan past the bottom margin of the 
   *                   current page.
   */
  "[sequence('CSI %dS')]":
  function SU(n) 
  { // Scroll Up line
    this.scrollUpLine(n || 1);
  },

  /**
   * SD — Pan Up
   * 
   * This control function moves the user window up a specified number of 
   * lines in page memory.
   *
   * Format
   *
   * CSI    Pn    T
   * 9/11   3/n   5/4
   *
   * @param {Number} n the number of lines to move the user window up in page 
   *                   memory. Pn new lines appear at the top of the display. 
   *                   Pn old lines disappear at the bottom of the display. 
   *                   You cannot pan past the top margin of the current page.
   */
  "[sequence('CSI %dT')]":
  function SD(n) 
  { // Scroll Down line
    this.scrollDownLine(n || 1);
  },

  /** 
   *  Erase Character (ECH)
   *  (VT200 mode only)
   *
   *  9/11     5/8
   *  CSI  Pn   X
   *
   *  Erases characters at the cursor position and the next Pn-1 characters. 
   *  A parameter of 0 or 1 erases a single character. 
   *  Character attributes are set to normal. No reformatting of data on the 
   *  line occurs.
   *  The cursor remains in the same position.
   */
  "[sequence('CSI %dX')]":
  function ECH(n) 
  { // Erase CHaracters
    this.eraseCharacters(n || 1);
  },

  /**
   * HPR — Horizontal Position Relative
   * 
   * Inquire as to the amount of free memory for programmable key operations.
   *
   * Format
   *
   * CSI    Pn    a
   * 9/11   3/n   6/1
   *
   * @param {Number} n indicates horizontal position.
   *
   * Description
   * 
   * HPR causes the active position to be moved to the n-th following 
   * horizontal position of the active line. If an attempt is made to move 
   * the active position past the last position on the line, then the active 
   * position stops at the last position on the line.
   */
  "[sequence('CSI %da')]":
  function HPR(n) 
  { // 
    this.cursorForward(n || 1);
  },

  "[sequence('CSI ?%dc')]":
  function () 
  {
  },

  /**
   * DA1 — Primary Device Attributes
   * 
   * In this DA exchange, the host asks for the terminal's architectural 
   * class and basic attributes.
   *
   * Host Request
   * 
   * The host uses the following sequence to send this request:
   *
   * CSI    c     or   CSI    0     c
   * 9/11   6/3   or   9/11   3/0   6/3
   *
   * Terminal Response
   * 
   * The terminal responds by sending its architectural class and basic 
   * attributes to the host. This response depends on the terminal's current 
   * operating VT level.
   * 
   * Response from North American Terminal
   *
   * CSI    ?      6     4     ;      Ps1   ;      ...   Psn   c
   * 9/11   3/15   3/6   3/4   3/11   3/n   3/11   ...   3/n   6/3
   *
   * Response from International Terminal
   *
   * CSI    ?      6     4     ;      Ps1   ;      ...   Psn   c
   * 9/11   3/15   3/6   3/4   3/11   3/n   3/11   ...   3/n   6/3
   * 
   * Parameters
   * 
   * Ps1 ; . . . Psn
   * reports different device attributes between the North American terminal 
   * and the international terminal.
   * 
   * The value of the first parameter is encoded so a simple range check can 
   * be performed to determine the basic service class and level of the device. 
   * The VT510 is a level 4 terminal so its service class code is 64. The 
   * following extensions to level 4 are provided:
   *
   * Ps   Meaning
   * 1    132 columns
   * 2    Printer port
   * 4    Sixel
   * 6    Selective erase
   * 7    Soft character set (DRCS)
   * 8    User-defined keys (UDKs)
   * 9    National replacement character sets (NRCS)
   *      (International terminal only)
   * 12   Yugoslavian (SCS)
   * 15   Technical character set
   * 18   Windowing capability
   * 21   Horizontal scrolling
   * 23   Greek
   * 24   Turkish
   * 42   ISO Latin-2 character set
   * 44   PCTerm
   * 45   Soft key map
   * 46   ASCII emulation
   *
   * Primary DA Example
   * 
   * Here is a typical primary DA exchange.
   *
   * Request (Host to VT510)   
   * CSI c or CSI 0 c   
   * The host asks for the terminal's architectural class code and supported 
   * extensions.
   *
   * Response—N.A. (VT510 to host)   
   * CSI ? 64; 1; 2; 7; 8; 9; 15; 18; 21; 44; 45; 46 c   
   * The terminal is a class 4 device (64) and supports the Ps parameters 
   * listed above.
   *
   * Response— International (VT510 to host)   
   * CSI ? 64; 1; 2; 7; 8; 9; 12; 15; 18; 21; 23; 24; 42; 44; 45; 46 c   
   * The terminal is a class 4 device (64) and supports the Ps parameters 
   * listed above.
   */
  "[sequence('CSI %dc')]":
  function DA1(n1, n2) 
  { // TODO: Primary DA (Device Attributes)
    if (n1 !== undefined && n1 != 0) {
      coUtils.Debug.reportWarning(
        _("%s sequence [%s] was ignored."),
        arguments.callee.name, Array.slice(arguments));
    } else { //
      const reply_map = {
        "VT100"  : "\x1b[?1;2c"
        ,"VT100J": "\x1b[?5;2c"
        ,"VT101" : "\x1b[?1;0c"
        ,"VT102" : "\x1b[?6c"
        ,"VT102J": "\x1b[?15c"
        ,"VT220J": "\x1b[?62;1;2;5;6;7;8c"
        ,"VT282" : "\x1b[?62;1;2;4;5;6;7;8;10;11c"
        ,"VT320" : "\x1b[?63;1;2;6;7;8c"
        ,"VT382" : "\x1b[?63;1;2;4;5;6;7;8;10;15c"
        ,"VT420" : "\x1b[?64;1;2;7;8;9;15;18;21c"
        ,"VT520" : "\x1b[?65;1;2;7;8;9;12;18;19;21;23;24;42;44;45;46c"
        ,"VT525" : "\x1b[?65;1;2;7;9;12;18;19;21;22;23;24;42;44;45;46c"
      };
      let reply = [
        "\x1b[?" // header
      ]
      reply.push(65) // VT520
      //if (this.length >= 132) 
      reply.push(1) // 132 columns
      reply.push(2) // Printer
      reply.push(6) // Selective erase
      reply.push(7) // Soft character set (DRCS)
      reply.push(8) // User-defined keys
      reply.push(9) // National replacememnt character sets
      reply.push(15) // Technical characters
      reply.push(22) // ANSI color
      reply.push(29) // ANSI text locator (i.e., DEC Locator mode)
      reply.push("c") // footer
      let message = reply.join(";");
      //let message = "\x1b[?1;2;6c";
      //let message = "\x1b[?c";
      let session = this._broker;
      session.notify("command/send-to-tty", message);
      coUtils.Debug.reportMessage(
        "Primary Device Attributes: \n" 
        + "Send \"" + message.replace("\x1b", "\\e") + "\"." );
    }
  },

  /**
   * DA2 — Secondary Device Attributes
   * 
   * In this DA exchange, the host requests the terminal's identification code, firmware version level, and hardware options.
   * Host Request
   * 
   * The host uses the following sequence to send this request:
   *
   * CSI    >      c     or   CSI    >      0     c
   * 9/11   3/14   6/3   or   9/11   3/14   3/0   6/3
   *
   * Terminal Response
   * 
   * The terminal with a VT keyboard uses the following sequence to respond:
   *
   * CSI    >      6     1     ;      Pv    ;      0     c
   * 9/11   3/14   3/6   3/1   3/11   3/n   3/11   3/0   6/3
   *
   * DA2R for terminal with STD keyboard.
   *
   * CSI    >      6     1     ;      Pv    ;      1     c
   * 9/11   3/14   3/6   3/1   3/11   3/n   3/11   3/1   6/3
   *
   * DA2R for terminal with PC keyboard.
   *
   * Parameters
   * 
   * 61
   * indicates the identification code of the terminal for the secondary 
   * device attributes command.
   * 
   * Pv
   * indicates the version level of the firmware implementing the terminal
   * management functions, for example, editing, as shown in the following 
   * table.
   *
   * Pv   Version
   * 10   V1.0 (released version 1.0)
   * 20   V2.0 (released version 2.0)
   *
   * Secondary DA Example
   * 
   * The following is a typical secondary DA exchange:
   *
   * Request (Host to VT510)   
   * CSI > c or CSI > 0 c   
   * The host asks for the terminal's identification, firmware version, 
   * current hardware options.
   *
   * Response (VT510 to host)   
   * CSI > 61; 20; 1 c   
   * The terminal identifies itself as a VT510 that uses version 2.0 
   * firmware, and has a PC keyboard option.
   */
  "[sequence('CSI >%dc')]":
  function DA2(n1, n2) 
  { // TODO: Secondary DA (Device Attributes)
      let message = "\x1b[>2;100;2c"
      let message = "\x1b[>32;100;2c"
      let reply = ["\x1b[>"]; // CSI >
//      reply.push(65)  // VT520
//      reply.push(100) // Firmware version (for xterm, this is the XFree86 patch number, starting with 95). 
//      reply.push(0);  // DEC Terminal"s ROM cartridge registration number, always zero.
      reply.push(0);
      reply.push(95);
      reply.push("c") // footer
      let message = reply.join(";");
      let session = this._broker;
      session.notify("command/send-to-tty", message);
      coUtils.Debug.reportMessage(
        "Secondary Device Attributes: \n" 
        + "Send \"" + message.replace("\x1b", "\\e") + "\"." );
  },

  /**
   * VPA—Vertical Line Position Absolute
   * 
   * VPA inquires as to the amount of free memory for programmable key operations.
   *
   * Format
   * CSI    Pn    d
   * 9/11   3/n   6/4
   *
   * @param {Number} n column number.
   *
   * Description
   * 
   * VPA causes the active position to be moved to the corresponding 
   * horizontal position.
   * 
   * The default value is 1.
   * 
   * Move cursor to line Pn. VPA causes the active position to be moved to 
   * the corresponding horizontal position at vertical position Pn. If an 
   * attempt is made to move the active position below the last line, then 
   * the active position stops on the last line.
   */
  "[sequence('CSI %dd')]":
  function VPA(n) 
  { // set Virtical Position Absolutely
    this.setPositionY((n || 1) - 1 + this.cursor.originY);
  },

  /**
   * VPR — Vertical Position Relative
   *
   * VPR inquires as to the amount of free memory for programmable key 
   * operations.
   *
   * Format
   * CSI    Pn    e
   * 9/11   3/n   6/5
   *
   * @param {Number} n column number.
   *
   * Description
   * 
   * VPR causes the active position to be moved to the corresponding 
   * horizontal position.
   * This command causes the active position to be moved to the corresponding 
   * horizontal position at n-th following vertical position. If an attempt 
   * is made to move the active position below the last line, the active 
   * position stops at the last line.
   */
  "[sequence('CSI %de')]":
  function VPR(n) 
  { 
    this.cursorDown(n || 1);
  },

  /**
   * VPR — Vertical Position Relative
   *
   * @ref http://vt100.net/docs/vt520-rm/
   *
   * Move vertically Pn lines in the current column. The default value is 1.
   *
   * Format
   *
   * CSI   Pn   e 
   * 9/11  3/n  6/5
   *
   * Parameters
   * @param {Number} n number of lines to move.
   *
   * Description
   * VPR causes the active position to be moved to vertically corresponding Pn 
   * lines following the current position of the active line. If an attempt is 
   * made to move the active position beyond the last line, the active position 
   * stops at the last line.
   *
   */
  "[sequence('CSI %dk')]":
  function VPB(n) 
  { 
    this.cursorUp(n || 1);
  },

  /**
   * CNL — Cursor Next Line
   * 
   * Move the cursor to the next line.
   * 
   * Default: 1.
   *
   * Format
   * CSI    Pn    E
   * 9/11   3/n   4/5
   *
   * @param {Number} n the active position to the first character of the n-th 
   *                 following line.
   *
   * Description
   * 
   * The active position is moved to the first character of the n-th following line.
   */
  "[sequence('CSI %dE')]":
  function CNL(n) 
  {
    this.cursorDown(n || 1);
    this.setPositionX(0);
  },

  /**
   * CPL — Cursor Previous Line
   * 
   * Move the cursor to the preceding line.
   * 
   * Default: 1.
   *
   * Format
   *
   * CSI    Pn    F
   * 9/11   3/n   4/6
   *
   * @param {Number} n the number of active position moved to the first 
   *                   character of the n-th preceding line.
   *
   * Description
   * 
   * The active position is moved to the first character of the n-th preceding line.
   */
  "[sequence('CSI %dF')]":
  function CPL(n) 
  {
    this.cursorUp(n || 1);
    this.setPositionX(0);
  },

  "[sequence('CSI %dI')]":
  function CHT(n) 
  { // TODO: Cursor Horaizontal Tabulation
    coUtils.Debug.reportWarning(
      _("%s sequence [%s] was ignored."),
      arguments.callee.name, Array.slice(arguments));
  },

  "[sequence('CSI %dZ')]":
  function CBT(n) 
  { // Cursor Backward Tabulation
    coUtils.Debug.reportWarning(
      _("%s sequence [%s] was ignored."),
      arguments.callee.name, Array.slice(arguments));
  },

  /**
   * HPA — Horizontal Position Absolute
   * 
   * Inquire as to the amount of free memory for programmable key operations.
   *
   * Format
   *
   * CSI    Pn    `
   * 9/11   3/n   6/0
   *
   * @param {Number} n indicates horizontal position.
   *
   * Description
   * 
   * HPA causes the active position to be moved to the n-th horizontal 
   * position of the active line. If an attempt is made to move the active 
   * position past the last position on the line, then the active position 
   * stops at the last position on the line.
   */
  "[sequence('CSI %d`')]":
  function HPA(n) 
  { 
    this.setPositionX((n || 1) - 1);
  },
  
  REP: function REP(n) 
  { // TODO: REPeat the preceding graphic character
    coUtils.Debug.reportWarning(
      _("%s sequence [%s] was ignored."),
      arguments.callee.name, Array.slice(arguments));
  },

  /**
   *
   * HVP — Horizontal and Vertical Position
   *
   * This control function works the same as the cursor position (CUP) 
   * function. New applications should use CUP instead of HVP. HVP is 
   * provided for compatibility with earlier VT products.
   *
   * Format
   *
   * CSI    f
   * 9/11 	6/6
   *
   * Cursor moves to home position selected by DECOM
   *
   * CSI    Pl    ;     Pc   f
   * 9/11	  3/n   3/11 	3/n  6/6
   *
   * Moves cursor to line Pl, column Pc
   *
   * Parameters
   *
   * Pl; Pc
   *
   * If Pl or Pc is not selected or selected as 0, then the cursor moves to 
   * the first line or column, respectively. Origin mode (DECOM) selects line
   * numbering and the ability to move the cursor into margins.
   */
  "[sequence('CSI %df')]":
  function HVP(n1, n2) 
  { // Horizontal and Vertical Position
    this.setPositionY((n1 || 1) - 1 + this.cursor.originX);
    this.setPositionX((n2 || 1) - 1 + this.cursor.originY);
  },

  /**
   *
   * TBC—Tab Clear
   *
   * This control function clears tab stops.
   *
   * Format
   *
   * CSI    Ps    g
   * 9/11   3/n   6/7
   *
   * Parameters
   *
   * Ps
   * indicates the tab stops to clear. There are only two values for Ps, 0 and 3.
   * 0 or none (default) - The terminal only clears the tab stop at the cursor.
   * 3                   - The terminal clears all tab stops.
   *
   */
  "[sequence('CSI %dg')]":
  function TBC(n) 
  { // TaB Clear

    switch (n || 0) {

      case 0:
        let tab_stops = this.tab_stops;
        let positionX = this.cursor.positionX;;
        for (let i = 0; i < tab_stops.length; ++i) {
          let stop = tab_stops[i];
          if (stop == positionX) {
            tab_stops.splice(i, 1); // remove current tabstop.
          } else if (stop > positionX) {
            break;
          }
        }
        break;

      case 3:
        this.tab_stops = [0];
        break;

      defalut:
        coUtils.Debug.reportWarning(
          _("%s sequence [%s] was ignored."),
          arguments.callee.name, Array.slice(arguments));

    }
  },


  /**
   *
   * DECST8C — Set Tab at Every 8 Columns
   *
   * Set a tab stop at every eight columns starting with column 9.
   *
   * Format
   *
   * CSI    ?      5     W
   * 9/11   3/15   3/5   5/7
   *
   * Description
   *
   * Any tab stop setting before this command is executed is cleared 
   * automatically. Control function TBC clears the tab stops on the display;
   * HTS sets a horizontal tab stop at the active column.
   */
//  "[sequence('CSI ?5W')]":
//  function DECST8C(n) 
//  { // Set Tab at Every 8 Columns
//    coUtils.Debug.reportWarning(
//      _("%s sequence [%s] was ignored."),
//      arguments.callee.name, Array.slice(arguments));
//    //this.setDefaultTaburation();
//  },

  "[sequence('CSI %di')]":
  function MC(n) 
  { // TODO: Media Copy
    coUtils.Debug.reportWarning(
      _("%s sequence [%s] was ignored."),
      arguments.callee.name, Array.slice(arguments));
  },

  "[sequence('CSI ?%di')]":
  function DECMC(n) 
  { // TODO: Media Copy, DEC-specific
    coUtils.Debug.reportWarning(
      _("%s sequence [%s] was ignored."),
      arguments.callee.name, Array.slice(arguments));
  },

  "[sequence('CSI %dn')]":
  function DSR() 
  { // TODO: Device Status Report
    coUtils.Debug.reportWarning(
      _("%s sequence [%s] was ignored."),
      arguments.callee.name, Array.slice(arguments));
  },

  "[sequence('CSI ?%dn')]":
  function DECDSR() 
  { // TODO: Device Status Report
    coUtils.Debug.reportWarning(
      _("%s sequence [%s] was ignored."),
      arguments.callee.name, Array.slice(arguments));
  },
 
  "[sequence('0x90', 'ESC P')]":
  function DCS() 
  {
    let message = String.fromCharCode.apply(String, arguments);
    coUtils.Debug.reportWarning(
      _("Ignored %s [%s]"), arguments.callee.name, message);
  },

  "[sequence('0x98', 'ESC X')]":
  function SOS() 
  {
    let message = String.fromCharCode.apply(String, arguments);
    coUtils.Debug.reportWarning(
      _("Ignored %s [%s]"), arguments.callee.name, message);
  },

} // aspect ScreenSequenceHandler

/**
 * @trait Viewable
 */
let Viewable = new Trait("Viewable");
Viewable.definition = {

  _scrollback_amount: 0,

  /** constructor */
  initialize: function initialize(broker)
  {
  },

  "[subscribe('event/broker-started'), enabled]":
  function(session) 
  {
    this.resetScrollRegion();
  },

  "[subscribe('command/scroll-down-view'), enabled]":
  function scrollDownView(n)
  {
    if (0 == n || 0 == this._scrollback_amount) 
      return;
    // move view position.
    if (this._scrollback_amount < n) {
      this._scrollback_amount = 0;
      // finishes scrolling session.
      let session = this._broker;
      session.notify("event/scroll-session-closed");
    } else {
      this._scrollback_amount -= n;
    }
    this.updateScrollInformation();
  },

  "[subscribe('command/scroll-up-view'), enabled]":
  function scrollUpView(n)
  {
    let buffer_top = this.bufferTop;
    if (0 == n || buffer_top == this._scrollback_amount)
      return;
    if (0 == this._scrollback_amount) {
      // starts scrolling session.
      let session = this._broker;
      session.notify("event/scroll-session-started");
    }
    // move view position.
    if (buffer_top - this._scrollback_amount < n) {
      this._scrollback_amount = buffer_top;
    } else {
      this._scrollback_amount += n;
    }
    this.updateScrollInformation();
  },

  "[subscribe('command/set-scroll-position'), enabled]":
  function setViewPosition(position)
  {
    let buffer_top = this.bufferTop;
    if (0 == this._scrollback_amount) {
      if (position != buffer_top - this._scrollback_amount) {
        // starts scrolling session.
        let session = this._broker;
        session.notify("event/scroll-session-started");
      }
    }
    this._scrollback_amount = buffer_top - position;
    this.updateScrollInformation();
  },

  "[subscribe('command/update-scroll-information'), enabled]":
  function updateScrollInformation()
  {
    let buffer_top = this.bufferTop;
    let session = this._broker;
    session.notify(
      "event/scroll-position-changed", 
      {
        start: buffer_top - this._scrollback_amount,
        end: buffer_top - this._scrollback_amount + this._height,
        size: buffer_top + this._height,
      });

    if (this._scrollback_amount > 0) {
      this.onBeforeInput.enabled = true;
    }

    // redraw view
    let width = this.width;
    this._getCurrentViewLines().forEach(function(line) {
      if (line.length < width)
        line.length = width;
      line.dirty = true;
    });
  },

  _getCurrentViewLines: function _getCurrentViewLines()
  {
    let buffer_top = this.bufferTop;
    let start = buffer_top - this._scrollback_amount;
    let end = start + this.height;
    return this.getLines(start, end);
  },

  "[subscribe('event/before-input')]":
  function onBeforeInput(message) 
  {
    let session = this._broker;
    this.onBeforeInput.enabled = false;
    this._scrollback_amount = 0;
    this.updateScrollInformation();
    session.notify("command/draw", true);
    session.notify("event/scroll-session-closed", true);
  },

  _interracedScan: function _interracedScan(lines) 
  {
    for (let row = 1; row < lines.length; row += 2) {
      yield [row, lines[row]];
    }
    for (let row = 0; row < lines.length; row += 2) {
      yield [row, lines[row]];
    }
  },

  getDirtyWords: function getDirtyWords() 
  {
    let lines = this._getCurrentViewLines();
    for (let [row, line] in Iterator(lines)) { //this._interracedScan(lines)) {
      for (let { codes, column, end, attr } in line.getDirtyWords()) {
        yield { 
          codes: codes, 
          row: row, 
          column: column, 
          end: end,
          attr: attr, 
        };
      }
    }
  },

  /** Gets the range of surround characters. 
   *
   * ex.
   *
   *         point 
   *           v
   * 123 abcdefghijk lmnop 
   *     ^          ^
   *   start       end
   *
   */  
  getWordRangeFromPoint: function getWordRangeFromPoint(column, row) 
  {
    let line = this._getCurrentViewLines()[row];
    if (line) {
      let [start, end] = line.getWordRangeFromPoint(column);
      let positionOffset = this.width * row;
      return [positionOffset + start, positionOffset + end];
    } else {
      throw coUtils.Debug.Exception(
        _("Invalid parameter was passed. ",
          "Probably 'row' parameter was in out of range. row: [%d]."), 
        row);
    }
  },

  /** get text in specified range. 
   */
  getTextInRange: function getTextInRange(start, end, is_rectangle) 
  {
    let width = this.width;
    let start_row = Math.floor(start / width);
    let start_column = start % width;
    let end_row = Math.floor(end / width) + 1;
    let end_column = end % width;
    let buffer = [];
    let lines = this._getCurrentViewLines().slice(start_row, end_row);

    if (is_rectangle) {
      // Rectangle selection mode.
      let max_column = Math.max(start_column, end_column);
      let min_column = Math.min(start_column, end_column);
      for (let [index, line] in Iterator(lines)) {
        let text = line.getTextInRange(min_column, max_column);
        buffer.push(text.replace(/ +$/, ""));
      }
    } else {
      // Line selection mode.
      for (let [index, line] in Iterator(lines)) {
        let start = 0 == index ? start_column: 0;
        let end = lines.length - 1 == index ? end_column: width;
        let text = line.getTextInRange(start, end);
        buffer.push(text.replace(/ +$/, ""));
      }
    }
    let result = buffer.join("\n"); 
    return result;
  },

}; // Viewable



/**
 * @trait Scrollable
 *
 */
let Scrollable = new Trait("Scrollable");
Scrollable.definition = {

  "[persistable] scrollback_limit": 200,

  /** Scroll up the buffer by n lines. */
  _scrollUp: function _scrollUp(top, bottom, n) 
  {
    let lines = this._buffer;
    let offset = this.bufferTop;
    let width = this.width;

    // set dirty flag.
    lines.slice(offset + top, offset + bottom - n)
      .forEach(function(line) line.invalidate());

    // rotate lines.
    let range = lines.splice(offset + bottom - n, n);
    let cursor = this.cursor;
    range.forEach(function(line) line.erase(0, width, cursor.attr));
    range.unshift(offset + top, 0);
    Array.prototype.splice.apply(lines, range);
    this._lines = lines.slice(offset, offset + this.height);
  },

  /** Scroll down the buffer by n lines. */
  _scrollDown: function _scrollDown(top, bottom, n) 
  {
    let lines = this._buffer;
    let offset = this._buffer_top;
    let width = this.width;

    // set dirty flag.
    this._lines.slice(n).forEach(function(line) line.invalidate());

    // rotate lines.
    let range;
    if (top > 0) {
      range = lines.splice(offset + top, n);
      let cursor = this.cursor;
      range.forEach(function(line) line.erase(0, width, cursor.attr));
    } else if (offset < this.scrollback_limit) {
      range = this._createLines(n);
      offset = this._buffer_top += n;
      range.forEach(function(line) line.invalidate());
    } else { // 0 == top && offset == this.scrollback_limit
      range = lines.splice(0, n);
      let width = this._width;
      for (let [, line] in Iterator(range)) {
        line.clear();
        line.invalidate();
        line.length = width;
      }
    }
    // line.splice(offset + bottom -m, 0, ....);
    range.unshift(offset + bottom - n, 0);
    Array.prototype.splice.apply(lines, range);
    this._lines = lines.slice(offset, offset + this._height);
  },

}; // Scrollable

/**
 * @trait Resizable
 */
let Resizable = new Trait("Resizable");
Resizable.definition = {

  /** Pop and Remove last n lines from screen. */
  _popLines: function _popLines(n) 
  {
    let buffer = this._buffer;

    buffer.splice(-n);
    buffer.splice(-this._height, n);

    // decrease height.
    this._height -= n;

    let offset = this._buffer_top;
    this._lines = buffer.slice(offset, offset + this._height);

    // collapse scroll region.
    this._scroll_bottom -= n;

    // fix cursor position.
    if (this.cursor.positionY >= this._height)
      this.cursor.positionY = this._height - 1;
  },
  
  /** Create new lines and Push after last line. */
  _pushLines: function _pushLines(n) 
  {
    let buffer = this._buffer;

    // increase height.
    this._height += n;

    let new_lines = this._createLines(n);
    Array.prototype.push.apply(buffer, new_lines);

    new_lines = this._createLines(n);
    new_lines.unshift(-this._height, 0); // make arguments
    Array.prototype.splice.apply(buffer, new_lines);

    let offset = this._buffer_top;
    this._lines = buffer.slice(offset, offset + this._height);

    // expand scroll region.
    this._scroll_bottom += n;
  },
 
  /** Pop and Remove last n columns from screen. */
  _popColumns: function _popColumns(n) 
  {
    // decrease width
    let new_width = this._width -= n;

    // set new width.
    this._lines.forEach(function(line) line.length = new_width);

    // fix cursor position.
    if (this.cursor.positionX >= this._width) {
      this.cursor.positionX = this._width - 1;
    }
  },
  
  /** Create new colmuns and Push after last column. */
  _pushColumns: function _pushColumns(n) 
  {
    // increase width
    let new_width = this._width += n;

    // set new width.
    this._lines.forEach(function(line) line.length = new_width);
  },

}; // Resize

 
/**
 * @class Screen
 * @brief The Screen class, manages Line objects and provides some functions,
 *        scroll, line operation, buffer-switching,...etc.
 */
let Screen = new Class().extends(Component)
                        .mix(Viewable)
                        .mix(Scrollable)
                        .mix(Resizable)
                        .mix(ScreenSequenceHandler)
                        .requires("ScreenSwitch")
                        .requires("ScreenBackup")
                        .requires("ScreenCursorOperations")
                        .requires("ScreenEdit")
                        ;
Screen.definition = {

  /** Component ID */
  get id()
    "screen",

  /**
   * @property cursor
   * @brief Manages cursor position and some attributes. 
   */
  cursor: null,
  _buffer: null,
  _buffer_top: 0,
  _lines: null,
  _width: 80,
  _height: 24,
  _scroll_top: null,
  _scroll_bottom: null,
  _screen_choice: CO_SCREEN_MAIN,
  _line_generator: null,

  tab_stops: null,

  // geometry (in cell count)
  "[persistable] initial_column": 80,
  "[persistable] initial_row": 24,

  /** post-constructor */
  "[subscribe('initialized/{cursorstate & linegenerator}'), enabled]":
  function onLoad(cursor_state, line_generator) 
  {
    //this._width = this.initial_column;
    //this._height = this.initial_row;
    this._buffer = line_generator.allocate(this._width, this._height * 2);
    this._switchScreen();
    this.cursor = cursor_state;
    this._line_generator = line_generator;
    this.tab_stops = [0, 8, 16, 24, 32, 40, 48, 56, 64, 72, 80, 88, 96, 104, 112, 120];

    let broker = this._broker;
    broker.notify("initialized/screen", this);
  },

  /** 
   * @property dirty
   */
  get dirty()
  {
    return this._lines.some(function(line) line.dirty);
  },

  set dirty(value)
  {
    this._lines.forEach(function(line) line.dirty = value);
  },

  /** 
   * @property width
   * Screen width in counting the number of columns.
   */
  get "[persistable] width"() 
  {
    return this._width;
  },

  set "[persistable] width"(value) 
  {
    if (this._buffer) {
      let width = this._width;
      if (value == width) {
        return;
      } else if (width < value) {
        this._pushColumns(value - width);
      } else if (width > value) {
        this._popColumns(width - value);
      }

      let cursor = this.cursor;
      if (cursor.positionX >= this._width) {
        cursor.positionX = this._width - 1;
      }

      let session = this._broker;
      session.notify("variable-changed/screen.width", this.width);
    } else {
      this._width = value;
    }
  },

  /** 
   * @property height
   * Screen height in counting the number of lines.
   */
  get "[persistable] height"() 
  {
    return this._height;
  },

  set "[persistable] height"(value) 
  {
    if (this._buffer) {
      if (value == this._height) {
        return;
      } else if (this._height < value) {
        this._pushLines(value - this._height);
      } else if (this._height > value) {
        this._popLines(this._height - value);
      }
      // I Wonder if we should trim cursor position when screen is resized.
      let cursor = this.cursor;
      if (cursor.positionY >= this._height) {
        cursor.positionY = this._height - 1;
      }

      let session = this._broker;
      session.notify("variable-changed/screen.height", this.height);
    } else {
      this._height = value;
    }
  },

  get bufferTop()
  {
    return this._buffer_top;
  },

  getLines: function getLines(start, end) 
  {
    return this._buffer.slice(start, end);
  },

  /** Detects whether caracter that is assigned current cursor position is
   *  wide. 
   */
  get currentCharacterIsWide() 
  {
    let line = this._getCurrentLine();
    if (!line)
      return false;
    return line.isWide(this.cursor.positionX);
  },

  /** Write printable charactor seqences. */
  "[type('Array -> Boolean -> Boolean')] write":
  function write(codes, insert_mode, auto_wrap_mode, reverse_wrap_mode) 
  {
    let width = this._width;
    let cursor = this.cursor;
    let it = 0;
    let line = this._getCurrentLine();
    do {
      if (line) {
        if (cursor.positionX >= width) {
          this.carriageReturn();
          if (auto_wrap_mode) {
            this.carriageReturn();
            if (reverse_wrap_mode) {
              this.reverseIndex();
            } else {
              this.lineFeed();
            }
            line = this._getCurrentLine();
          }
        }
        let positionX = cursor.positionX;
        let length = width - positionX;
        let run = codes.slice(it, it + length);
        it += run.length;
        cursor.positionX += run.length;
        line.write(positionX, run, cursor.attr, insert_mode);
      }
    } while (it < codes.length);
    if (cursor.positionX >= width) {
      cursor.positionX = width - 1;
    }
  },

// ScreenCursorOperations Implementation.
  //
  // Cursor operations
  //
  /** Move cursor to forward (right). */
  "[type('Uint16 -> Undefined')] cursorForward":
  function cursorForward(n) 
  {
    let positionX = this.cursor.positionX + n;
    let max = this._width - 1;
    this.cursor.positionX = positionX > max ? max: positionX;
  },

  /** Move cursor to backward (left). */
  "[type('Uint16 -> Undefined')] cursorBackward":
  function cursorBackward(n) 
  {
    let positionX = this.cursor.positionX - n;
    let min = 0;
    this.cursor.positionX = positionX > min ? positionX: min;
  },

  /** Move CUrsor Up (CUP). */
  "[type('Uint16 -> Undefined')] cursorUp":
  function cursorUp(n) 
  { 
    let positionY = this.cursor.positionY - n;
    let min = this._scroll_top;
    //let min = 0;
    this.cursor.positionY = positionY > min ? positionY: min;
  },
  
  /** Move CUrsor Down (CUD). */
  "[type('Uint16 -> Undefined')] cursorDown":
  function cursorDown(n) 
  {
    let positionY = this.cursor.positionY + n;

    // If an attempt is made to move the active position below the last line, 
    // the active position stops at the last line.
    let max = this._scroll_bottom - 1;
    //let max = this._height - 1;
    this.cursor.positionY = positionY > max ? max: positionY;
  },

  /** Move CUrsor Up (CUP). */
  "[type('Uint16 -> Undefined')] cursorUpAbsolutely":
  function cursorUpAbsolutely(n) 
  { 
    let positionY = this.cursor.positionY - n;
    let min = 0;
    this.cursor.positionY = positionY > min ? positionY: min;
  },
  
  /** Move CUrsor Down (CUD). */
  "[type('Uint16 -> Undefined')] cursorDownAbsolutely":
  function cursorDownAbsolutely(n) 
  {
    let positionY = this.cursor.positionY + n;

    // If an attempt is made to move the active position below the last line, 
    // the active position stops at the last line.
    let max = this._height - 1;
    this.cursor.positionY = positionY > max ? max: positionY;
  },

  /** cursor CHaracter Absolute column (CHA). */
  "[type('Uint16 -> Undefined')] setPositionX":
  function setPositionX(n) 
  {
    let max = this._width - 1;
    this.cursor.positionX = n > max ? max: n;
  },

  /** set Virtical Position Absolutely (VPA). */
  "[type('Uint16 -> Undefined')] setPositionY":
  function setPositionY(n) 
  {
    let max = this._height - 1;
    this.cursor.positionY = n > max ? max: n; // max(height - 1, n)
  },

  /** BackSpace (BS). */
  "[type('Undefined')] backSpace":
  function backSpace() 
  {
    this.cursor.positionX > 0 && --this.cursor.positionX;
  },
 
  /** CarriageReturn (CR). */
  "[type('Undefined')] carriageReturn":
  function carriageReturn() 
  {
    this.cursor.positionX = 0;
  },
  
  /** horizontalTab (HT). */
  "[type('Undefined')] horizontalTab":
  function horizontalTab() 
  {
    let tab_stops = this.tab_stops;
    let positionX = this.cursor.positionX;
    let max = this._width - 1;
    for (let i = 0; i < tab_stops.length; ++i) {
      let stop = tab_stops[i];
      if (stop > positionX) {
        this.cursor.positionX = Math.min(max, stop);
        return;
      }
    }
    this.cursor.positionX = max;
  },

// ScreenEditConcept implementation
  /** Erase cells from current position to end of line. */
  "[type('Undefined')] eraseLineToRight":
  function eraseLineToRight() 
  {
    let cursor = this.cursor;
    let line = this._getCurrentLine();
    if (line) {
      line.erase(this.cursor.positionX, this._width, cursor.attr);
    } else {
      coUtils.Debug.reportWarning(
        _("eraseLineToRight: Current line is null."));
    }
  },

  /** Erase cells from specified position to head of line. */
  "[type('Undefined')] eraseLineToLeft":
  function eraseLineToLeft() 
  {
    let cursor = this.cursor;
    this._getCurrentLine().erase(0, this.cursor.positionX + 1, cursor.attr);
  },

  /** Erase current line */
  "[type('Undefined')] eraseLine":
  function eraseLine() 
  {
    let cursor = this.cursor;
    this._getCurrentLine().erase(0, this._width, cursor.attr);
  },

  /** Erase cells from current position to head of buffer. */
  "[type('Undefined')] eraseScreenAbove":
  function eraseScreenAbove() 
  {
    let cursor = this.cursor;
    let width = this._width;
    let range = this._lines.slice(0, cursor.positionY + 1);
    range.pop().erase(0, cursor.positionX + 1, cursor.attr);
    range.forEach(function(line) line.erase(0, width, cursor.attr));
  },

  /** Erase cells from current position to end of buffer. */
  "[type('Undefined')] eraseScreenBelow":
  function eraseScreenBelow() 
  {
    let cursor = this.cursor;
    let width = this._width;
    let range = this._lines.slice(cursor.positionY, this._height);
    range.shift().erase(cursor.positionX, width, cursor.attr);
    range.forEach(function(line) line.erase(0, width, cursor.attr));
  },

  /** Erase every cells in screen. */
  "[type('Undefined')] eraseScreenAll":
  function eraseScreenAll() 
  {
    let cursor = this.cursor;
    let width = this._width;
    this._lines.forEach(function(line) line.erase(0, width, cursor.attr));
  },

  /** Erase every cells in screen. */
  "[type('Undefined')] eraseScreenAllWithTestPattern":
  function eraseScreenAllWithTestPattern() 
  {
    let cursor = this.cursor;
    let width = this._width;
    this._lines.forEach(function(line) line.eraseWithTestPattern(0, width, cursor.attr));
  },

  /** Insert n cells at specified position. */
  "[type('Uint16 -> Undefined')] insertBlanks":
  function insertBlanks(n) 
  {
    let cursor = this.cursor;
    this._getCurrentLine().insertBlanks(this.cursor.positionX, n, cursor.attr);
  },
      
  "[type('Uint16 -> Uint16 -> Undefined')] setScrollRegion":
  function setScrollRegion(top, bottom) 
  {
    [this._scroll_top, this._scroll_bottom] = arguments;
  },

  "[type('Undefined')] resetScrollRegion":
  function resetScrollRegion() 
  {
    this._scroll_top = 0;
    this._scroll_bottom = this._height;
  },

  /** Reverse Index (RI) */
  "[type('Undefined')] reverseIndex":
  function reverseIndex() 
  { // cursor up
    let cursor_state = this.cursor;
    let positionY = cursor_state.positionY;
    if (positionY <= this._scroll_top) {
      this._scrollUp(positionY, this._scroll_bottom, 1);
    } else {
      --cursor_state.positionY;
    }
  },
  
  /** Line Feed (LF) */
  "[type('Undefined')] lineFeed":
  function lineFeed() 
  { // cursor down
    let cursor_state = this.cursor;
    let positionY = cursor_state.positionY;
    if (positionY + 1 >= this._scroll_bottom) {
      this._scrollDown(this._scroll_top, positionY + 1, 1);
    } else {
      ++cursor_state.positionY;
    }
  },

  "[type('Uint16 -> Undefined')] insertLine":
  function insertLine(n) 
  { // Insert Line
    this._scrollUp(this.cursor.positionY, this._scroll_bottom, n);
  },

  "[type('Uint16 -> Undefined')] deleteLine":
  function deleteLine(n) 
  { // Delete Line.
    this._scrollDown(this.cursor.positionY, this._scroll_bottom, n);
  },

  "[type('Uint16 -> Undefined')] scrollUpLine":
  function scrollUpLine(n) 
  { // Scroll Up line
    this._scrollUp(this._scroll_top, this._scroll_bottom, n);
  },

  "[type('Uint16 -> Undefined')] scrollDownLine":
  function scrollDownLine(n) 
  { // Scroll Down line
    this._scrollDown(this._scroll_top, this._scroll_bottom, n);
  },

  "[type('Uint16 -> Undefined')] eraseCharacters":
  function eraseCharacters(n) 
  { // Erase CHaracters
    let start = this.cursor.positionX;
    let end = start + n;
    let cursor = this.cursor;
    this._getCurrentLine().erase(start, end, cursor.attr);
  },

  "[type('Uint16 -> Undefined')] deleteCharacters":
  function deleteCharacters(n) 
  { // Delete CHaracters
    this._getCurrentLine().deleteCells(this.cursor.positionX, n);
  },

// ScreenSwitchConcept implementation

  /** Switch to Alternate screen 
   *
   * @implements ScreenSwitchConcept.switchToAlternateScreen
   */
  "[type('Undefined')] switchToAlternateScreen":
  function switchToAlternateScreen() 
  {
    // select alternate lines.
    if (CO_SCREEN_MAIN == this._screen_choice) {
      this._switchScreen();
      this._screen_choice = CO_SCREEN_ALTERNATE;
    } else {
      coUtils.Debug.reportWarning(
        _("Alternate screen had been already selected."));
    }
  },

  /** Switch to Main screen 
   *
   * @implements ScreenSwitchConcept.switchToMainScreen
   */
  "[type('Undefined')] switchToMainScreen":
  function switchToMainScreen() 
  {
    // select main lines.
    if (CO_SCREEN_ALTERNATE == this._screen_choice) {
      this._switchScreen();
      this._screen_choice = CO_SCREEN_MAIN;
    } else {
      coUtils.Debug.reportWarning(
        _("Main screen has been already serected."));
    }
  },

  /** Memorize cursor state, switch to Main screen, and erase screen.
   *
   * @implements ScreenSwitchConcept.selectAlternateScreen
   *
   */ 
  "[type('Undefined')] selectAlternateScreen":
  function selectAlternateScreen() 
  {
    this.cursor.backup();
    this.switchToAlternateScreen();
    this.eraseScreenAll();
  },

  /** Erase screen, switch to Main screen, and restore cursor. 
   *
   * @implements ScreenSwitchConcept.selectMainScreen
   *
   */ 
  "[type('Undefined')] selectMainScreen":
  function selectMainScreen() 
  {
    this.eraseScreenAll();
    this.switchToMainScreen();
    this.cursor.restore();
  },
  
// ScreenBackupConcept Implementation

  /** Backups screen into serialize context.
   *
   * @implements ScreenBackupConcept.<command/backup>
   */
  "[subscribe('command/backup'), type('Object -> Undefined'), enabled]": 
  function backup(data) 
  {
    data[this.id] = [];
    let context = data[this.id];

    context.push(this.width, this.height, this._buffer_top);
    context.push(this._scroll_top, this._scroll_bottom);
    context.push(this._buffer.length);
    this._buffer.forEach(function(line) line.serialize(context));
    context.push(this._screen_choice);
    this.cursor.serialize(context);
  }, // backup

  /** Restores screen from serialize context.
   *
   * @implements ScreenBackupConcept.<command/restore>
   */
  "[subscribe('command/restore'), type('Object -> Undefined'), enabled]": 
  function restore(data) 
  {
    let context = data[this.id];

    this.width = context.shift();
    this.height = context.shift();
    this._buffer_top = context.shift();
    this._scroll_top = context.shift();
    this._scroll_bottom = context.shift();

    let buffer_length = context.shift();
    this._buffer = this._createLines(buffer_length);
    this._buffer.forEach(function(line) line.deserialize(context));
    this._screen_choice = context.shift();
    this.cursor.deserialize(context);
    this._lines = this._buffer
      .slice(this._buffer_top, this._buffer_top + this._height);
    if (CO_SCREEN_ALTERNATE == this._screen_choice) {
      this.switchToAlternateScreen();
    } else {
      this.switchToMainScreen();
    }
  }, // restore


// private methods
  /** Returns the line object which is on current cursor position. */
  _getCurrentLine: function _getCurrentLine() 
  {
    return this._lines[this.cursor.positionY]
  },

  _createLines: function _createLines(n) 
  {
    let buffer = [];
    let width = this._width;
    let line_generator = this._line_generator;
    return line_generator.allocate(width, n);
  },

  /** Switch between Main/Alternate screens. */
  _switchScreen: function _switchScreen() 
  {
    // select alternate lines.
    let buffer = this._buffer;
    let width = this._width;
    let height = this._height;
    let offset = this._buffer_top = buffer.length - height * 2;
    let lines = buffer.splice(- height);
    lines.forEach(function(line) line.length = width, this);
    this._lines = lines;
    Array.prototype.splice.apply(buffer, [offset, 0].concat(lines));
    this.dirty = true;
  },

};


/**
 * @fn main
 * @brief Module entry point.
 * @param {Broker} broker The Broker object.
 */
function main(broker) 
{
  new Screen(broker);
}


