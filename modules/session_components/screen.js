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

var thread_manager = Components
  .classes["@mozilla.org/thread-manager;1"]
  .getService();

function wait(span) 
{
  var end_time = Date.now() + span;
  var current_thread = thread_manager.currentThread;
  do {
    current_thread.processNextEvent(true);
  } while ((current_thread.hasPendingEvents()) || Date.now() < end_time);
};


//////////////////////////////////////////////////////////////////////////////
//
// Concepts
//

/**
 * @concept GrammarConcept
 */
var ScreenConcept = new Concept();
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
var ScreenSwitchConcept = new Concept();
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
var ScreenBackupConcept = new Concept();
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
var ScreenCursorOperationsConcept = new Concept();
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
var ScreenEditConcept = new Concept();
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
var ScreenSequenceHandler = new Trait() 
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
  "[profile('vt100'), sequence('CSI %d@')]":
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
  "[profile('vt100'), sequence('CSI %dA')]":
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
  "[profile('vt100'), sequence('CSI %dB')]":
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
  "[profile('vt100'), sequence('CSI %dC')]":
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
  "[profile('vt100'), sequence('CSI %dD')]":
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
  "[profile('vt100'), sequence('CSI %dG')]":
  function CHA(n) 
  { // cursor CHaracter Absolute column
    this.setPositionX((n || 1) - 1);
    //this.setPositionX((n || 1) - 1 + this.cursor.originX);
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
  "[profile('vt100'), sequence('CSI %dH')]":
  function CUP(n1, n2) 
  { // move CUrsor to absolute Position 
    var x, y;

    // with no parameters, move to origin
//    this.setPositionY((n1 || 1) - 1);
//    this.setPositionY((n1 || 1) - 1 + this._scroll_top);
    y = (n1 || 1) - 1 + this.cursor.originY;
//    if (y >= this._scroll_bottom) {
//      y = this._scroll_bottom - 1;
//    }
    x = (n2 || 1) - 1;// + this.cursor.originX;
    this.setPositionY(y);
    this.setPositionX(x);
  },

  /** 
   *
   * DECDHL — Double-Width, Double-Height Line
   *
   * These two control functions make the line with the cursor the top or 
   * bottom half of a double-height, double-width line. You must use these 
   * sequences in pairs on adjacent lines. In other words, the same display 
   * characters must appear in the same positions on both lines to form 
   * double-height characters. If the line was single width and single height,
   * then all characters to the right of the screen center are lost.
   *
   * Format
   *
   * ESC    #    3
   * 1/11   2/3  3/3  
   *
   * Top Half
   *
   *
   * ESC    #    4
   * 1/11   2/3  3/4  
   *
   * Bottom Half
   *
   * Description
   *
   * The following sequences make the phrase "VT510 Video Terminal" a 
   * double-height, double-width line.
   *
   * ESC#3 VT510 Video Terminal
   * ESC#4 VT510 Video Terminal
   *
   * */
  /** DEC double-height line, top half. */
  "[profile('vt100'), sequence('ESC #3')]": 
  function DECDHL_top() 
  {
    var line;

    line = this._getCurrentLine();
    line.type = coUtils.Constant.LINETYPE_TOP;
    line.dirty = 1;
  },

  /** DEC double-height line, bottom half. */
  "[profile('vt100'), sequence('ESC #4')]": 
  function DECDHL_bottom() 
  {
    var line;

    line = this._getCurrentLine();
    line.type = coUtils.Constant.LINETYPE_BOTTOM;
    line.dirty = 1;
  },

  /** DEC single-height line. */
  "[profile('vt100'), sequence('ESC #5')]": 
  function DECSWL() 
  {
    var line;

    line = this._getCurrentLine();
    line.type = coUtils.Constant.LINETYPE_NORMAL;
    line.dirty = 1;
  },

  /** DEC double-width line. 
   *
   * DECDWL — Double-Width, Single-Height Line
   *
   * This control function makes the line with the cursor a double-width, 
   * single-height line. If the line was single width and single height, then 
   * all characters to the right of the screen's center are lost.
   *
   * Format
   *
   * ESC    #     6
   * 1/11   2/3   3/6
   *
   */
  "[profile('vt100'), sequence('ESC #6')]": 
  function DECDWL() 
  {
    var line;
   
    line = this._getCurrentLine();
    line.type = coUtils.Constant.LINETYPE_DOUBLEWIDTH;
    line.dirty = 1;
  },

  /**
   *
   * DECALN — Screen Alignment Pattern
   *
   * This control function fills the complete screen area with a test pattern 
   * used for adjusting screen alignment. Normally, only manufacturing and 
   * service personnel would use DECALN.
   *
   * Format
   *
   * ESC    #    8
   * 1/11   2/3  3/8
   *
   * Notes on DECALN
   *
   * DECALN sets the margins to the extremes of the page, and moves the cursor
   * to the home position.
   *
   * Also see the screen alignment in Chapter 2.
   *
   */
  "[profile('vt100'), sequence('ESC #8')]":
  function DECALN() 
  { // DEC Screen Alignment Test
    this.eraseScreenAllWithTestPattern();
  },

  /**
   * ED — Erase in Display
   * 
   * This control function erases characters from part or all of the display.
   * When you erase complete lines, they become single-height, single-width 
   * lines, with all visual character attributes cleared. ED works inside or 
   * outside the scrolling margins.
   *
   * Format
   *
   * CSI    Ps    J
   * 9/11 	3/n   4/10
   *
   * Parameters
   * 
   * Ps   represents the amount of the display to erase.
   *
   * Ps 	Area Erased
   *      0 (default) 	From the cursor through the end of the display
   *      1 	From the beginning of the display through the cursor
   *      2 	The complete display
   * 
   * Programming Tip
   * Use a Ps value of 2 to erase the complete display in a fast, 
   * efficient manner.
   */
  "[profile('vt100'), sequence('CSI %dJ')]":
  function ED(n) 
  { // Erase Display
   
    switch (n || 0) {

      case 0:   // erase below
        this.eraseScreenBelow();
        break;

      case 1:   // erase above
        this.eraseScreenAbove();
        break;

      case 2: // erase all
        this.eraseScreenAll();
        break;
      
      case 3: // TODO: erase saved lines (xterm)  
        coUtils.Debug.reportWarning(
          _("ED 3 (xterm, erase saved lines) was ignored."));
        break;

      default:
        coUtils.Debug.reportWarning(
          _("%s sequence [%s] was ignored."),
          arguments.callee.name, Array.slice(arguments));
    }

  },

  /**
   *
   * EL — Erase in Line
   * 
   * This control function erases characters on the line that has the cursor.
   * EL clears all character attributes from erased character positions. EL 
   * works inside or outside the scrolling margins.
   *
   * Format
   *
   * CSI    Ps    K
   * 9/11 	3/n   4/11
   *
   * Parameters
   * 
   * Ps   represents the section of the line to erase.
   *
   * Ps 	Section Erased
   *      0 (default) 	From the cursor through the end of the line
   *      1 	From the beginning of the line through the cursor
   *      2 	The complete line
   */
  "[profile('vt100'), sequence('CSI %dK')]":
  function EL(n) 
  { // Erase Line
   
    switch (n || 0) {

      case 0: // erase to right
        this.eraseLineToRight();
        break;

      case 1: // erase to left
        this.eraseLineToLeft();
        break;

      case 2: // erase all
        this.eraseLine();
        break;

      default:
        coUtils.Debug.reportWarning(
          _("%s sequence [%s] was ignored."),
          arguments.callee.name, Array.slice(arguments));
    }
  },

  /**
   *
   *  IL — Insert Line
   *
   *  This control function inserts one or more blank lines, starting at the 
   *  cursor.
   *
   *  Format
   *
   *  CSI   Pn    L
   *  9/11  3/n   4/12
   *
   *  Parameters
   *
   *  Pn is the number of lines to insert.
   *
   *  Default: Pn = 1.
   *
   *  Description
   *
   *  As lines are inserted, lines below the cursor and in the scrolling region
   *  move down. Lines scrolled off the page are lost. IL has no effect outside 
   *  the page margins. 
   *
   */
  "[profile('vt100'), sequence('CSI %dL')]":
  function IL(n) 
  { // Insert Line
    this.insertLine(n || 1);
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
  "[profile('vt100'), sequence('CSI %dM')]":
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
  "[profile('vt100'), sequence('CSI %dP')]":
  function DCH(n) 
  { // Delete CHaracters
    this.deleteCharacters(n || 1);
  },
   
  /**
   *
   * SL — Scroll Left
   * 
   * Format
   *
   * CSI    Pn    SP    @
   * 9/11   3/n   2/0   4/0
   *
   * Parameter default value: Pn = 1
   *
   * SL causes the data in the presentation component to be moved by n 
   * character positions if the line orientation is horizontal, or by n 
   * line positions if the line orientation is vertical, such that the data 
   * appear to move to the left; where n equals the value of Pn.
   * The active presentation position is not affected by this control function.
   *
   */
  "[profile('vt100'), sequence('CSI %d @')]":
  function SL(n) 
  { // Scroll Left
    this.scrollLeft(n || 1);
  },
   
  /**
   *
   * SR — Scroll Right
   * 
   * Format
   *
   * CSI    Pn    SP    A
   * 9/11   3/n   2/0   4/1
   *
   * Parameter default value: Pn = 1
   *
   * SR causes the data in the presentation component to be moved by n 
   * character positions if the line orientation is horizontal, or by n line 
   * positions if the line orientation is vertical, such that the data appear
   * to move to the right; where n equals the value of Pn.
   * The active presentation position is not affected by this control function.
   *
   */
  "[profile('vt100'), sequence('CSI %d A')]":
  function SR(n) 
  { // Scroll Right
    this.scrollRight(n || 1);
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
  "[profile('vt100'), sequence('CSI %dS')]":
  function SU(n) 
  { // Scroll Up line
    this.scrollDownLine(n || 1);
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
  "[profile('vt100'), sequence('CSI %dT')]":
  function SD(n) 
  { // Scroll Down line
    var argc = arguments.length;

    switch (argc) {

      case 0:
        this.scrollUpLine(1);
        break;

      case 1:
        this.scrollUpLine(n);
        break;

      case 6:
        this.sendMessage(
          "event/start-highlight-mouse", 
          Array.slice(arguments));
        break;

      default:
        coUtils.Debug.reportError(
          _("The size of arguments is wrong: [%s]."),
            Array.slice(arguments));

    } // switch argc
  },

  /** 
   *
   * Erase Character (ECH)
   * (VT200 mode only)
   *
   * 9/11     5/8
   * CSI  Pn   X
   *
   * Erases characters at the cursor position and the next Pn-1 characters. 
   * A parameter of 0 or 1 erases a single character. 
   * Character attributes are set to normal. No reformatting of data on the 
   * line occurs.
   * The cursor remains in the same position.
   *
   */
  "[profile('vt100'), sequence('CSI %dX')]":
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
  "[profile('vt100'), sequence('CSI %da')]":
  function HPR(n) 
  { // 
    this.cursorForward(n || 1);
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
  "[profile('vt100'), sequence('CSI %dd')]":
  function VPA(n) 
  { // set Virtical Position Absolutely
    this.setPositionY((n || 1) - 1);
    //this.setPositionY((n || 1) - 1 + this.cursor.originY);
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
  "[profile('vt100'), sequence('CSI %de')]":
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
  "[profile('vt100'), sequence('CSI %dk')]":
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
  "[profile('vt100'), sequence('CSI %dE')]":
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
  "[profile('vt100'), sequence('CSI %dF')]":
  function CPL(n) 
  {
    this.cursorUp(n || 1);
    this.setPositionX(0);
  },

  /**
   *
   * CHT — Cursor Horizontal Forward Tabulation
   *
   * Move the active position n tabs forward.
   *
   * Default: 1.
   *
   * Format
   *
   * CSI    Pn   I
   * 9/11   3/n  4/9
   *
   * Parameters
   *
   * Pn is the number of active position tabs to move forward.
   * Description
   *
   * The active position is moved to the character position corresponding to
   * the following n-th horizontal tabulation stop.
   *
   */
  "[profile('vt100'), sequence('CSI %dI')]":
  function CHT(n) 
  { // Cursor Horaizontal Tabulation
    var tab_stops, cursor, width, positionX, i, stop, index;

    n = (n || 1) - 1;

    tab_stops = this.tab_stops;
    cursor = this.cursor;
    width = this._width;
    positionX = cursor.positionX;;
 
    if (positionX > width - 1) {
      if (this._wraparound_mode) {
        cursor.positionX = 0;
        this.lineFeed();
        return;
      }
    }
   
    for (i = 0; i < tab_stops.length; ++i) {
      stop = tab_stops[i];
      if (stop > positionX) {
        index = i + n;
        cursor.positionX = tab_stops[index % tab_stops.length];
        return;
      }
    }
  },

  /**
   *
   * CBT — Cursor Backward Tabulation
   *
   * Move the active position n tabs backward.
   *
   * Default: 1.
   *
   * Format
   *
   * CSI    Pn   Z
   * 9/11   3/n  5/10
   *
   * Parameters
   *
   * Pn is the number of active position tabs to move backward.
   *
   * Description
   *
   * The active position is moved to the character position corresponding to
   * the n-th preceding horizontal tabulation stop. If an attempt is made to 
   * move the active position past the first character position on the line, 
   * then the active position stays at column one.
   *
   */
  "[profile('vt100'), sequence('CSI %dZ')]":
  function CBT(n) 
  { // Cursor Backward Tabulation
    var tab_stops, cursor, positionX, i, stop, index;

    n = (n || 1) - 1;

    tab_stops = this.tab_stops;
    cursor = this.cursor;
    positionX = cursor.positionX;;

    for (i = tab_stops.length - 1; i >= 0; --i) {
      stop = tab_stops[i];
      if (stop < positionX) {
        index = Math.max(0, i - n);
        cursor.positionX = tab_stops[index];
        break;
      }
    }
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
  "[profile('vt100'), sequence('CSI %d`')]":
  function HPA(n) 
  { 
    this.setPositionX((n || 1) - 1);
  },
  
  /**
   *
   * REP - Repeat 
   *
   * Format
   *
   * ESC [ Pn b
   *
   * Causes the single graphic character immediately preceding the control
   * to be repeated Pn times.
   *
   */
  "[profile('vt100'), sequence('CSI %db')]":
  function REP(n) 
  { // REPeat the preceding graphic character
    this.repeat(n || 1);
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
  "[profile('vt100'), sequence('CSI %df')]":
  function HVP(n1, n2) 
  { // Horizontal and Vertical Position
    this.setPositionY((n1 || 1) - 1 + this.cursor.originY);
    this.setPositionX((n2 || 1) - 1 + this.cursor.originX);
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
  "[profile('vt100'), sequence('CSI %dg')]":
  function TBC(n) 
  { // TaB Clear

    var tab_stops, pisitionX, i, stop;

    switch (n || 0) {

      case 0:
        tab_stops = this.tab_stops;
        positionX = this.cursor.positionX;;
        for (i = 0; i < tab_stops.length; ++i) {
          stop = tab_stops[i];
          if (stop == positionX) {
            tab_stops.splice(i, 1); // remove current tabstop.
          } else if (stop > positionX) {
            break;
          }
        }
        break;

      case 3:
        this.tab_stops = [];
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
  "[profile('vt100'), sequence('CSI ?%dW')]":
  function DECST8C(n) 
  { 
    if (5 === n) {
      // Set Tab at Every 8 Columns
      this._resetTabStop();
    } else {
      coUtils.Debug.reportWarning(
        _("%s sequence [%s] was ignored."),
        arguments.callee.name, Array.slice(arguments));
    }
  },

  "[profile('vt100'), sequence('CSI %di')]":
  function MC(n) 
  { // TODO: Media Copy
    coUtils.Debug.reportWarning(
      _("%s sequence [%s] was ignored."),
      arguments.callee.name, Array.slice(arguments));
  },

  "[profile('vt100'), sequence('CSI ?%di')]":
  function DECMC(n) 
  { // TODO: Media Copy, DEC-specific
    coUtils.Debug.reportWarning(
      _("%s sequence [%s] was ignored."),
      arguments.callee.name, Array.slice(arguments));
  },

  "[profile('vt100'), sequence('0x98', 'ESC X')]":
  function SOS(message) 
  {
    coUtils.Debug.reportWarning(
      _("Ignored %s [%s]"), arguments.callee.name, message);
  },

} // aspect ScreenSequenceHandler

/**
 * @trait Viewable
 */
var Viewable = new Trait("Viewable");
Viewable.definition = {

  _scrollback_amount: 0,

  "[subscribe('event/broker-started'), enabled]":
  function(broker) 
  {
    this.resetScrollRegion();
  },

  "[subscribe('command/scroll-down-view'), enabled]":
  function scrollDownView(n)
  {
    if (0 == n || 0 == this._scrollback_amount) {
      return;
    }
    // move view position.
    if (this._scrollback_amount < n) {
      this._scrollback_amount = 0;
      // finishes scrolling session.
      this.sendMessage("event/scroll-session-closed");
    } else {
      this._scrollback_amount -= n;
    }
    this.updateScrollInformation();
  },

  "[subscribe('command/scroll-up-view'), enabled]":
  function scrollUpView(n)
  {
    var buffer_top;
    
    buffer_top = this.bufferTop;
    if (0 == n || buffer_top == this._scrollback_amount) {
      return;
    }
    if (0 == this._scrollback_amount) {
      // starts scrolling session.
      this.sendMessage("event/scroll-session-started");
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
    var buffer_top;

    buffer_top = this.bufferTop;
    if (0 == this._scrollback_amount) {
      if (position != buffer_top - this._scrollback_amount) {
        // starts scrolling session.
        this.sendMessage("event/scroll-session-started");
      }
    }
    this._scrollback_amount = buffer_top - position;
    this.updateScrollInformation();
  },

  "[subscribe('command/update-scroll-information'), enabled]":
  function updateScrollInformation()
  {
    var buffer_top, width, lines, i, line;

    buffer_top = this.bufferTop;
    this.sendMessage(
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
    width = this.width;
    lines = this._getCurrentViewLines();
    for (i = 0; i < lines.length; ++i) {
      line = lines[i];
      if (line.length < width) {
        line.length = width;
      }
      line.dirty = true;
    }
  },

  _getCurrentViewLines: function _getCurrentViewLines()
  {
    var buffer_top, start, end;

    buffer_top = this.bufferTop;
    start = buffer_top - this._scrollback_amount;
    end = start + this.height;
    return this.getLines(start, end);
  },

  markAsSixelLine: function markAsSixelLine(buffer, position)
  {
    var line;
    
    line = this._getCurrentLine();
    line.type = coUtils.Constant.LINETYPE_SIXEL;
    line.dirty = true;
    line.sixel_info = {
      buffer: buffer, 
      position: position,
    };
  },

  "[subscribe('event/before-input')]":
  function onBeforeInput(message) 
  {
    this.onBeforeInput.enabled = false;
    this._scrollback_amount = 0;
    this.updateScrollInformation();
    this.sendMessage("command/draw", true);
    this.sendMessage("event/scroll-session-closed", true);
  },

  _interracedScan: function _interracedScan(lines) 
  {
    var row;
    
    for (row = 1; row < lines.length; row += 2) {
      yield [row, lines[row]];
    }
    for (row = 0; row < lines.length; row += 2) {
      yield [row, lines[row]];
    }
  },

  getDirtyWords: function getDirtyWords() 
  {
    var liens;

    lines = this._getCurrentViewLines();
    for (let [row, line] in Iterator(lines)) { //this._interracedScan(lines)) {
      for (let { codes, column, end, attr } in line.getDirtyWords()) {
        yield { 
          codes: codes, 
          row: row, 
          column: column, 
          end: end,
          attr: attr, 
          line: line,
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
    var line, start, end, offset;

    line = this._getCurrentViewLines()[row];
    if (line) {
      [start, end] = line.getWordRangeFromPoint(column);
      offset = this.width * row;
      return [offset + start, offset + end];
    } else {
      throw coUtils.Debug.Exception(
        _("Invalid parameter was passed. ",
          "Probably 'row' parameter was in out of range. row: [%d]."), 
        row);
    }
  },

  _getTextInRectangle: 
  function _getTextInRectangle(lines, start_column, end_column)
  {
    var max_column, min_column, line, text, i, buffer;

    buffer = [];

    // Rectangle selection mode.
    if (start_column < end_column) {
      max_column = end_column;
      min_column = start_column;
    } else {
      max_column = start_column;
      min_column = end_column;
    }
    for (i = 0; i < lines.length; ++i) {
      line = lines[i];
      text = line.getTextInRange(min_column, max_column);
      buffer.push(text.replace(/ +$/, ""));
    }
    return buffer.join("\n"); 
  },

  _getTextInRangeImpl: 
  function _getTextInRangeImpl(lines, start_column, end_column)
  {
    var buffer, i, line, width, start, end, text;

    buffer = [];
    width = this.width;

    // Line selection mode.
    for (i = 0; i < lines.length; ++i) {
      line = lines[i];
      start = 0 == i ? start_column: 0;
      end = lines.length - 1 == i ? end_column: width;
      text = line.getTextInRange(start, end);
      buffer.push(text.replace(/ +$/, ""));
    }
    return buffer.join("\n"); 
  },

  /** get text in specified range. 
   */
  getTextInRange: function getTextInRange(start, end, is_rectangle) 
  {
    var start_row, start_column, end_row, end_column, lines, width;

    width = this.width;
    start_column = start % width;
    end_column = end % width;
    start_row = Math.floor(start / width);
    end_row = Math.floor(end / width) + 1;
    lines = this._getCurrentViewLines().slice(start_row, end_row);

    if (is_rectangle) {
      return this._getTextInRectangle(lines, start_column, end_column);
    } else {
      return this._getTextInRangeImpl(lines, start_column, end_column);
    }

  },

}; // Viewable



/**
 * @trait Scrollable
 *
 */
var Scrollable = new Trait("Scrollable");
Scrollable.definition = {

  "[persistable] scrollback_limit": 500,
  "[persistable] smooth_scrolling_delay": 0,

  _smooth_scrolling: false,

  "[subscribe('command/change-scrolling-mode'), enabled]":
  function onScrollingModeChanged(mode) 
  {
    this._smooth_scrolling = false;
  },

  /** Scroll up the buffer by n lines. */
  _scrollUp: function _scrollUp(top, bottom, n) 
  {
    var lines, offset, width, height, attr, i, line, range;

    lines = this._buffer;
    offset = this.bufferTop;
    width = this._width;
    height = this._height;
    attr = this.cursor.attr;

    // set dirty flag.
    for (i = offset + top; i < offset + bottom - n; ++i) {
      line = lines[i];
      line.invalidate();
    }

    // rotate lines.
    range = lines.splice(offset + bottom - n, n);
    for (i = 0; i < range.length; ++i) {
      line = range[i];
      line.erase(0, width, attr);
      line.type = coUtils.Constant.LINETYPE_NORMAL;
    }
    range.unshift(offset + top, 0);
    Array.prototype.splice.apply(lines, range);
    this._lines = lines.slice(offset, offset + height);

    if (this._smooth_scrolling) {
      this.sendMessage("command/draw");
      wait(this.smooth_scrolling_delay);
    }
  },

  /** Scroll down the buffer by n lines. */
  _scrollDown: function _scrollDown(top, bottom, n) 
  {
    var lines, offset, width, height, attr, i, range, line;

    lines = this._buffer;
    offset = this._buffer_top;
    width = this._width;
    height = this._height;
    attr = this.cursor.attr;

    // set dirty flag.
    for (i = n; i < this._lines.length; ++i) {
      line = this._lines[i];
      line.invalidate();
    }

    // rotate lines.
    if (top > 0) {
      range = lines.splice(offset + top, n);
      for (i = 0; i < range.length; ++i) {
        line = range[i];
        line.erase(0, width, attr);
        line.type = coUtils.Constant.LINETYPE_NORMAL;
      }
    } else if (offset < this.scrollback_limit) {
      range = this._createLines(n, attr);
      offset = this._buffer_top += n;
      for (i = 0; i < range.length; ++i) {
        line = range[i];
        line.invalidate();
      }
    } else { // 0 == top && offset == this.scrollback_limit
      range = lines.splice(0, n);
      for (i = 0; i < range.length; ++i) {
        line = range[i];
        line.erase(0, width, attr);
        line.length = width;
        line.invalidate();
        line.type = coUtils.Constant.LINETYPE_NORMAL;
      }
    }

    // line.splice(offset + bottom -m, 0, ....);
    range.unshift(offset + bottom - n, 0);
    Array.prototype.splice.apply(lines, range);
    this._lines = lines.slice(offset, offset + height);

    if (this._smooth_scrolling) {
      this.sendMessage("command/draw");
      wait(this.smooth_scrolling_delay);
    }

  },

}; // Scrollable

/**
 * @trait Resizable
 */
var Resizable = new Trait("Resizable");
Resizable.definition = {

  /** Pop and Remove last n lines from screen. */
  _popLines: function _popLines(n) 
  {
    var buffer, offset;

    buffer = this._buffer;

    buffer.splice(-n);
    buffer.splice(-this._height, n);

    // decrease height.
    this._height -= n;

    offset = this._buffer_top;
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
    var buffer, new_lines, offset;

    buffer = this._buffer;

    // increase height.
    this._height += n;

    new_lines = this._createLines(n);
    Array.prototype.push.apply(buffer, new_lines);

    new_lines = this._createLines(n);
    new_lines.unshift(-this._height, 0); // make arguments
    Array.prototype.splice.apply(buffer, new_lines);

    offset = this._buffer_top;
    this._lines = buffer.slice(offset, offset + this._height);

    // expand scroll region.
    this._scroll_bottom += n;
  },
 
  /** Pop and Remove last n columns from screen. */
  _popColumns: function _popColumns(n) 
  {
    var cursor, width, lines, i;

    // decrease width
    cursor = this.cursor;
    width = this._width -= n;
    lines = this._lines;

    // set new width.
    for (i = 0; i < lines.length; ++i) {
      lines[i].length = width;
    }

    // fix cursor position.
    if (cursor.positionX >= width) {
      cursor.positionX = width - 1;
    }
  },
  
  /** Create new colmuns and Push after last column. */
  _pushColumns: function _pushColumns(n) 
  {
    var width, lines, i;

    // increase width
    width = this._width += n;
    lines = this._lines;

    // set new width.
    for (i = 0; i < lines.length; ++i) {
      lines[i].length = width;
    }
  },

}; // Resize

 
/**
 * @class Screen
 * @brief The Screen class, manages Line objects and provides some functions,
 *        scroll, line operation, buffer-switching,...etc.
 */
var Screen = new Class().extends(Component)
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

  _wraparound_mode: true,
  _insert_mode: false,
  _reverse_wraparound_mode: false,

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

    this._resetTabStop();

    this.sendMessage("initialized/screen", this);
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
    var lines, i;

    lines = this._lines;

    for (i = 0; i < lines.length; ++i) {
      lines[i].dirty = value;
    }
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
    var width, cursor;

    if (this._buffer) {
      width = this._width;
      if (value == width) {
        return;
      } else if (width < value) {
        this._pushColumns(value - width);
      } else if (width > value) {
        this._popColumns(width - value);
      }

      cursor = this.cursor;
      if (cursor.positionX >= this._width) {
        cursor.positionX = this._width - 1;
      }

      // update tab stops
      this._resetTabStop();

      this.sendMessage("variable-changed/screen.width", this.width);
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
    var cursor;
    
    if (this._buffer) {
      if (value == this._height) {
        return;
      } else if (this._height < value) {
        this._pushLines(value - this._height);
      } else if (this._height > value) {
        this._popLines(this._height - value);
      }

      // I Wonder if we should trim cursor position when screen is resized.
      cursor = this.cursor;
      if (cursor.positionY >= this._height) {
        cursor.positionY = this._height - 1;
      }

      this.sendMessage("variable-changed/screen.height", this.height);
    } else {
      this._height = value;
    }
  },

  get bufferTop()
  {
    return this._buffer_top;
  },

  _resetTabStop: function _resetTabStop()
  {
    var i, width;

    // update tab stops
    width = this._width;
    this.tab_stops = [];
    for (i = 0; i < width; i += 8) {
      this.tab_stops.push(i);
    }
    if (i != width - 1) {
      this.tab_stops.push(width - 1);
    }
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
    var line = this._getCurrentLine();
    if (!line) {
      return false;
    }
    return line.isWide(this.cursor.positionX);
  },

  "[subscribe('command/enable-insert-mode'), enabled]":
  function enableInsertMode() 
  {
    this._insert_mode = true;
  },

  "[subscribe('command/disable-insert-mode'), enabled]":
  function disableInsertMode() 
  {
    this._insert_mode = false;
  },

  "[subscribe('command/enable-wraparound'), enabled]":
  function enableWraparound() 
  {
    this._wraparound_mode = true;
  },

  "[subscribe('command/disable-wraparound'), enabled]":
  function disableWraparound() 
  {
    this._wraparound_mode = false;
  },

  "[subscribe('command/enable-reverse-wraparound'), enabled]":
  function enableReverseWraparound() 
  {
    this._reverse_wraparound_mode = true;
  },

  "[subscribe('command/disable-reverse-wraparound'), enabled]":
  function disableReverseWraparound() 
  {
    this._reverse_wraparound_mode = false;
  },

  /** Write printable charactor seqences. */
  "[subscribe('command/write'), type('Array -> Boolean -> Undefined')] write":
  function write(codes) 
  {
    var width, cursor, it, line, positionX, length, run, insert_mode;

    insert_mode = this._insert_mode;
/*    
//    if (this._smooth_scrolling) {
        if ((this.flag = (this.flag + 1) % 10) == 0) {
          this.sendMessage("command/draw");
          wait(0);
        }
//    }
*/

    width = this._width;
    cursor = this.cursor;
    it = 0;
    line = this._getCurrentLine();

    if (cursor.positionX >= width) {
      if (this._wraparound_mode) {
        cursor.positionX = 0;
        this.lineFeed();
      } else {
        cursor.positionX = width - 1;
      }
    }


    do {
      if (line) {
        if (cursor.positionX >= width) {
          if (this._wraparound_mode) {
            cursor.positionX = 0;
            //this.carriageReturn();
            this.lineFeed();
            line = this._getCurrentLine();
          } else {
            cursor.positionX = width - 1;
            break;
          }
        }
        positionX = cursor.positionX;
        length = width - positionX;
        run = codes.slice(it, it + length);
        cursor.positionX += run.length;
        length = run.length;
        //if (0 == run[length - 1]) {
        //  run.pop();
        //}
        it += run.length;
        line.write(positionX, run, cursor.attr, insert_mode);
      }
    } while (it < codes.length);

    if (undefined !== run) {
      this._last_char = run.pop();
    }
  },

  /** REPeat the preceding graphic character */
  repeat: function repeat(n)
  {
    var codes, i, last_char;

    last_char = this._last_char;
    codes = [];
    for (i = 0; i < n; ++i) {
      codes.push(last_char);
    }
    this.write(codes);
  },

// ScreenCursorOperations Implementation.
  //
  // Cursor operations
  //
  /** Move cursor to forward (right). */
  "[type('Uint16 -> Undefined')] cursorForward":
  function cursorForward(n) 
  {
    var cursor, positionX, max;

    cursor = this.cursor;
    positionX = cursor.positionX + n;
    max = this._width - 1;
    cursor.positionX = positionX > max ? max: positionX;
  },

  /** Move cursor to backward (left). */
  "[type('Uint16 -> Undefined')] cursorBackward":
  function cursorBackward(n) 
  {
    var width, cursor, positionX, min;

    width = this._width;
    cursor = this.cursor;

    positionX = cursor.positionX;;
    if (positionX > width - 1) {
      positionX = width - 1;
    }

    cursor = this.cursor;
    positionX = positionX - n;
    min = 0;
    cursor.positionX = positionX > min ? positionX: min;
  },

  /** Move CUrsor Up (CUP). */
  "[type('Uint16 -> Undefined')] cursorUp":
  function cursorUp(n) 
  { 
    var cursor, positionY, min;

    cursor = this.cursor;
    positionY = cursor.positionY - n;
    min = this._scroll_top;
    cursor.positionY = positionY > min ? positionY: min;
  },
  
  /** Move CUrsor Down (CUD). */
  "[type('Uint16 -> Undefined')] cursorDown":
  function cursorDown(n) 
  {
    var cursor, positionY, max;

    cursor = this.cursor;
    positionY = cursor.positionY + n;

    // If an attempt is made to move the active position below the last line, 
    // the active position stops at the last line.
    max = this._scroll_bottom - 1;
    cursor.positionY = positionY > max ? max: positionY;
  },

  /** Move CUrsor Up (CUP). */
  "[type('Uint16 -> Undefined')] cursorUpAbsolutely":
  function cursorUpAbsolutely(n) 
  { 
    var cursor, positionY, min;

    cursor = this.cursor;
    positionY = cursor.positionY - n;
    min = 0;
    cursor.positionY = positionY > min ? positionY: min;
  },
  
  /** Move CUrsor Down (CUD). */
  "[type('Uint16 -> Undefined')] cursorDownAbsolutely":
  function cursorDownAbsolutely(n) 
  {
    var cursor, positionY, max;

    cursor = this.cursor;
    positionY = cursor.positionY + n;

    // If an attempt is made to move the active position below the last line, 
    // the active position stops at the last line.
    max = this._height - 1;
    cursor.positionY = positionY > max ? max: positionY;
  },

  /** cursor CHaracter Absolute column (CHA). */
  "[type('Uint16 -> Undefined')] setPositionX":
  function setPositionX(n) 
  {
    var max;

    max = this._width - 1;
    this.cursor.positionX = n > max ? max: n;
  },

  /** set Virtical Position Absolutely (VPA). */
  "[type('Uint16 -> Undefined')] setPositionY":
  function setPositionY(n) 
  {
    var max;

    max = this._height - 1;
    this.cursor.positionY = n > max ? max: n; // max(height - 1, n)
  },

  /** BackSpace (BS). */
  "[type('Undefined')] backSpace":
  function backSpace() 
  {
    var cursor, width, positionX;

    cursor = this.cursor;
    width = this._width;

    positionX = cursor.positionX;;
    if (positionX >= width) {
      positionX = width - 1;
    }

    if (positionX > 0) {
      cursor.positionX = positionX - 1;
    } else if (this._reverse_wraparound_mode) { // positionX == 0
      //this.reverseIndex(); // 
      this.cursorUp(1);
      cursor.positionX = width - 1;
    }
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
    var cursor, tab_stops, line, width, max, positionX, i, stop;

    cursor = this.cursor;
    tab_stops = this.tab_stops;
    line = this._getCurrentLine();
    width = this._width;

    if (coUtils.Constant.LINETYPE_NORMAL == line.type) {
      max = width - 1;
    } else {
      max = width / 2 - 1 | 0;
    }

    positionX = cursor.positionX;
    if (positionX > max) {
      if (this._wraparound_mode) {
        cursor.positionX = 0;
        this.lineFeed();
        return;
      }
    }

    for (i = 0; i < tab_stops.length; ++i) {
      stop = tab_stops[i];
      if (stop > positionX) {
        cursor.positionX = stop;
        if (cursor.positionX >= max) {
          break;
        }
        return;
      }
    }
    cursor.positionX = max;
  },

// ScreenEditConcept implementation
  /** Erase cells from current position to end of line. */
  "[type('Undefined')] eraseLineToRight":
  function eraseLineToRight() 
  {
    var cursor, line, width;

    line = this._getCurrentLine();
    if (line) {
      cursor = this.cursor;
      width = this._width;
      line.erase(cursor.positionX, width, cursor.attr);
    } else {
      coUtils.Debug.reportWarning(
        _("eraseLineToRight: Current line is null."));
    }
  },

  /** Erase cells from specified position to head of line. */
  "[type('Undefined')] eraseLineToLeft":
  function eraseLineToLeft() 
  {
    var cursor, line;

    cursor = this.cursor;
    line = this._getCurrentLine();
    line.erase(0, cursor.positionX + 1, cursor.attr);
  },

  /** Erase current line */
  "[type('Undefined')] eraseLine":
  function eraseLine() 
  {
    var cursor, line, width;

    cursor = this.cursor;
    line = this._getCurrentLine();
    width = this._width;
    line.erase(0, width, cursor.attr);
  },

  /** Erase cells marked as "erasable" from current position to end 
   *  of line. */
  "[type('Undefined')] selectiveEraseLineToRight":
  function selectiveEraseLineToRight() 
  {
    var cursor, line, width;

    line = this._getCurrentLine();
    if (line) {
      cursor = this.cursor;
      width = this._width;
      line.selectiveErase(cursor.positionX, width, cursor.attr);
    } else {
      coUtils.Debug.reportWarning(
        _("selectiveEraseLineToRight: Current line is null."));
    }
  },

  /** Erase cells marked as "erasable" from specified position to head 
   *  of line. */
  "[type('Undefined')] selectiveEraseLineToLeft":
  function selectiveEraseLineToLeft() 
  {
    var cursor, line;

    cursor = this.cursor;
    line = this._getCurrentLine();
    line.selectiveErase(0, cursor.positionX + 1, cursor.attr);
  },

  /** Erase cells marked as "erasable" from line */
  "[type('Undefined')] selectiveEraseLine":
  function selectiveEraseLine() 
  {
    var cursor, line, width;

    cursor = this.cursor;
    line = this._getCurrentLine();
    width = this._width;
    line.selectiveErase(0, width, cursor.attr);
  },

  /** Erase cells from current position to head of buffer. */
  "[type('Undefined')] eraseScreenAbove":
  function eraseScreenAbove() 
  {
    var cursor, width, lines, attr, i, positionY;

    cursor = this.cursor;
    width = this._width;
    lines = this._lines;
    attr = cursor.attr;
    
    positionY = cursor.positionY;
    lines[positionY].erase(0, cursor.positionX + 1, attr);
    for (i = 0; i < positionY; ++i) {
      lines[i].erase(0, width, attr);
    }
  },

  /** Erase cells from current position to end of buffer. */
  "[type('Undefined')] eraseScreenBelow":
  function eraseScreenBelow() 
  {
    var cursor, width, attr, lines, positionY, height, i;

    cursor = this.cursor;
    width = this._width;
    attr = cursor.attr;
    lines = this._lines;
    positionY = cursor.positionY;
    height = this._height;
   
    lines[positionY].erase(cursor.positionX, width, attr);
    for (i = positionY + 1; i < height; ++i) {
      lines[i].erase(0, width, attr);
    }
  },

  /** Erase every cells in screen. */
  "[type('Undefined')] eraseScreenAll":
  function eraseScreenAll() 
  {
    var width, cursor, lines, attr, length, i, line;

    width = this._width;
    cursor = this.cursor;
    lines = this._lines;
    attr = cursor.attr;
    length = lines.length;

    for (i = 0; i < length; ++i) {
      line = lines[i];
      line.erase(0, width, attr);
      line.type = coUtils.Constant.LINETYPE_NORMAL;
    }
  },

  /** Erase cells from current position to head of buffer. */
  "[type('Undefined')] selectiveEraseScreenAbove":
  function selectiveEraseScreenAbove() 
  {
    var cursor, width, lines, attr, i, positionY;

    cursor = this.cursor;
    width = this._width;
    lines = this._lines;
    attr = cursor.attr;
    
    positionY = cursor.positionY;
    lines[positionY].selectiveErase(0, cursor.positionX + 1, attr);
    for (i = 0; i < positionY; ++i) {
      lines[i].selectiveErase(0, width, attr);
    }
  },

  /** Erase cells from current position to end of buffer. */
  "[type('Undefined')] selectiveEraseScreenBelow":
  function selectiveEraseScreenBelow() 
  {
    var cursor, width, attr, lines, positionY, height, i;

    cursor = this.cursor;
    width = this._width;
    attr = cursor.attr;
    lines = this._lines;
    positionY = cursor.positionY;
    height = this._height;
   
    lines[positionY].selectiveErase(cursor.positionX, width, attr);
    for (i = positionY + 1; i < height; ++i) {
      lines[i].selectiveErase(0, width, attr);
    }
  },

  /** Erase every cells marked as "erasable" in screen. */
  "[type('Undefined')] selectiveEraseScreenAll":
  function selectiveEraseScreenAll() 
  {
    var width, cursor, lines, attr, length, i, line;

    width = this._width;
    cursor = this.cursor;
    lines = this._lines;
    attr = cursor.attr;
    length = lines.length;

    for (i = 0; i < length; ++i) {
      line = lines[i];
      line.selectiveErase(0, width, attr);
      line.type = coUtils.Constant.LINETYPE_NORMAL;
    }
  },

  /** Erase every cells marked as "erasable" in rectanglar area. */
  "[type('Undefined')] selectiveEraseRectangle":
  function selectiveEraseRectangle(top, left, bottom, right) 
  {
    var cursor, lines, attr, length, i, line;

    cursor = this.cursor;
    lines = this._lines;
    attr = cursor.attr;
    length = lines.length;

    for (i = top; i < bottom; ++i) {
      line = lines[i];
      line.selectiveErase(left, right, attr);
      line.type = coUtils.Constant.LINETYPE_NORMAL;
    }
  },

  /** Erase every cells in screen. */
  "[type('Undefined')] eraseScreenAllWithTestPattern":
  function eraseScreenAllWithTestPattern() 
  {
    var attr, width, lines, i, line;

    attr = this.cursor.attr;
    width = this._width;
    lines = this._lines;

    for (i = 0; i < lines.length; ++i) {
      line = lines[i];
      line.eraseWithTestPattern(0, width, attr);
    }
  },

  /** Insert n cells at specified position. */
  "[type('Uint16 -> Undefined')] insertBlanks":
  function insertBlanks(n) 
  {
    var line, cursor, attr;

    line = this._getCurrentLine();
    cursor = this.cursor;
    attr = cursor.attr;
    line.insertBlanks(cursor.positionX, n, attr);
  },
      
  "[type('Uint16 -> Uint16 -> Undefined')] setScrollRegion":
  function setScrollRegion(top, bottom) 
  {
    this._scroll_top = top;
    this._scroll_bottom = bottom;
  },

  "[type('Undefined')] resetScrollRegion":
  function resetScrollRegion() 
  {
    this._scroll_top = 0;
    this._scroll_bottom = this._height;

  },

  "[subscribe('command/{soft | hard}-terminal-reset'), enabled]": 
  function reset()
  {
    var lines, i, line;

    this.eraseScreenAll();
    this.switchToMainScreen();
    this.resetScrollRegion();

    lines = this._getCurrentViewLines();

    for (i = 0; i < lines.length; ++i) {
      line = lines[i];
      line.type = coUtils.Constant.LINETYPE_NORMAL;
    }
  },

  /** Reverse Index (RI) */
  "[type('Undefined')] reverseIndex":
  function reverseIndex() 
  { // cursor up
    var cursor_state, line, top, bottom, positionY;

    cursor_state = this.cursor;
    line = this._getCurrentLine();
    top = this._scroll_top;
    bottom = this._scroll_bottom;
    positionY = cursor_state.positionY;

    if (positionY <= top) {
      this._scrollUp(top, bottom, 1);
    } else {
      --cursor_state.positionY;
    }
  },
  
  /** Line Feed (LF) */
  "[type('Undefined')] lineFeed":
  function lineFeed() 
  { // cursor down
    var cursor, top, bottom, positionY;

    cursor = this.cursor;
    top = this._scroll_top;
    bottom = this._scroll_bottom;
    positionY = cursor.positionY;

    if (positionY == bottom - 1) {
      this._scrollDown(top, bottom, 1);
    } else if (positionY > bottom - 1) {
      cursor.positionY = bottom - 1;
    } else {
      ++cursor.positionY;
    }
  },

  "[type('Uint16 -> Undefined')] insertLine":
  function insertLine(n) 
  { // Insert Line
    var positionY, bottom, delta;

    positionY = this.cursor.positionY;
    bottom = this._scroll_bottom;
    delta = Math.min(n, bottom - positionY);
    this._scrollUp(positionY, bottom, delta);
  },

  "[type('Uint16 -> Undefined')] deleteLine":
  function deleteLine(n) 
  { // Delete Line.
    var positionY, bottom, delta;

    positionY = this.cursor.positionY;
    bottom = this._scroll_bottom;
    delta = Math.min(n, bottom - positionY);
    this._scrollDown(positionY, bottom, delta);
  },

  "[type('Uint16 -> Undefined')] scrollLeft":
  function scrollLeft(n) 
  { // Scroll Left
    var lines, attr, i, line;

    lines = this._lines;
    attr = this.cursor.attr;
    i, line;
    for (i = 0; i < lines.length; ++i) {
      line = lines[i];
      line.deleteCells(0, n, attr);
    }
  },

  "[type('Uint16 -> Undefined')] scrollRight":
  function scrollRight(n) 
  { // Scroll Right
    var lines, attr, i, line;

    lines = this._lines;
    attr = this.cursor.attr;
    for (i = 0; i < lines.length; ++i) {
      line = lines[i];
      line.insertBlanks(0, n, attr);
    }
  },

  "[type('Uint16 -> Undefined')] scrollUpLine":
  function scrollUpLine(n) 
  { // Scroll Up line
    var top, bottom;

    top = this._scroll_top;
    bottom = this._scroll_bottom;
    this._scrollUp(top, bottom, n);
  },

  "[type('Uint16 -> Undefined')] scrollDownLine":
  function scrollDownLine(n) 
  { // Scroll Down line
    var top, bottom;

    top = this._scroll_top;
    bottom = this._scroll_bottom;
    this._scrollDown(top, bottom, n);
  },

  "[type('Uint16 -> Undefined')] eraseCharacters":
  function eraseCharacters(n) 
  { // Erase CHaracters
    var line, start, end, cursor;

    line = this._getCurrentLine();
    attr = this.cursor.attr;
    start = this.cursor.positionX;
    end = start + n;
    if (end > line.length) {
      end = line.length;
    }
    line.erase(start, end, attr);
  },

  "[type('Uint16 -> Undefined')] deleteCharacters":
  function deleteCharacters(n) 
  { // Delete CHaracters
    var line, attr;

    line = this._getCurrentLine();
    attr = this.cursor.attr;
    line.deleteCells(this.cursor.positionX, n, attr);
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
        _("Main screen has been already selected."));
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
    var context, lines, i;

    context = data[this.id] = [];
    lines = this._buffer;

    // serialize members.
    context.push(this.width, this.height, this._buffer_top);
    context.push(this._scroll_top, this._scroll_bottom);
    context.push(this._buffer.length);

    // serialize each lines.
    for (i = 0; i < lines.length; ++i) {
      lines[i].serialize(context);
    }

    context.push(this._screen_choice);

    // serialize cursor.
    this.cursor.serialize(context);

  }, // backup

  /** Restores screen from serialize context.
   *
   * @implements ScreenBackupConcept.<command/restore>
   */
  "[subscribe('command/restore'), type('Object -> Undefined'), enabled]": 
  function restore(data) 
  {
    var context, i, buffer_length, lines;

    context = data[this.id];

    this.width = context.shift();
    this.height = context.shift();
    this._buffer_top = context.shift();
    this._scroll_top = context.shift();
    this._scroll_bottom = context.shift();

    buffer_length = context.shift();
    lines = this._buffer = this._createLines(buffer_length);
    for (i = 0; i < lines.length; ++i) {
      lines[i].deserialize(context);
    }

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

  _createLines: function _createLines(n, attr) 
  {
    var buffer, width, line_generator;

    buffer = [];
    width = this._width;
    line_generator = this._line_generator;
    return line_generator.allocate(width, n, attr);
  },

  /** Switch between Main/Alternate screens. */
  _switchScreen: function _switchScreen() 
  {
    var buffer, width, height, offset, lines, i;

    // select alternate lines.
    buffer = this._buffer;
    width = this._width;
    height = this._height;
    offset = this._buffer_top = buffer.length - height * 2;
    lines = buffer.splice(- height);
    for (i = 0; i < lines.length; ++i) {
      lines[i].length = width;
    }
    this._lines = lines;
    Array.prototype.splice.apply(buffer, [offset, 0].concat(lines));
    this.dirty = true;
  },

}; // class Screen


/**
 * @fn main
 * @brief Module entry point.
 * @param {Broker} broker The Broker object.
 */
function main(broker) 
{
  new Screen(broker);
}


