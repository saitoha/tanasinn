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

const DEC_CKM   = 0
const DEC_ANM   = 1
const DEC_COLM  = 2
const DEC_SCLM  = 3
const DEC_SCNM  = 4
const DEC_OM    = 5
const DEC_AWM   = 6
const DEC_ARM   = 7
const DEC_PFF   = 8
const DEC_PEX   = 9
const DEC_TCEM  = 10
const DEC_RLM   = 11
const DEC_HEBM  = 12
const DEC_HEM   = 13
const DEC_NRCM  = 14
const DEC_NAKB  = 15
const DEC_HCCM  = 16
const DEC_VCCM  = 17
const DEC_PCCM  = 18
const DEC_NKM   = 19
const DEC_BKM   = 20
const DEC_KBUM  = 21
const DEC_LRMM  = 22 // DECVSSM
const DEC_XRLMM = 23
const DEC_NCSM  = 24
const DEC_RLCM  = 25
const DEC_CRTSM = 26
const DEC_ARSM  = 27
const DEC_MCM   = 28
const DEC_AAM   = 29
const DEC_CANSM = 30
const DEC_NULM  = 31
const DEC_HDPXM = 32
const DEC_ESKM  = 33
const DEC_OSCNM = 34
const DEC_FWM   = 35
const DEC_RPL   = 36
const DEC_HWUM  = 37
const DEC_ATCUM = 38
const DEC_ATCBM = 39
const DEC_BBSM  = 40
const DEC_ECM   = 41

/**
 * @aspect DecModeSequenceHandler
 */
let DecModeSequenceHandler = new Aspect();
DecModeSequenceHandler.definition = {

  _mouseMode: null,
  _decsaveBuffer: null,

  get mouseMode() 
  {
    return this._mouseMode;
  },

  set mouseMode(value) 
  {
    this._mouseMode = value;

    let session = this._broker;
    session.notify("event/mouse-tracking-mode-changed", value);
  },

  initialize: function initialize(session) 
  {
    this._decsave_buffer = {};
  },

  "[sequence('CSI ?%dh')]":
  function DECSET(n) 
  { // DEC Private Mode Set
    if (arguments.length == 0)
      coUtils.Debug.reportWarning(_("DECSET: Length of Arguments is zero. "));
    [].slice.apply(arguments).forEach(function(n) {
        n == 1    ? this.CKM = true // application cursor
      : n == 3    ? this.COLM = true // TODO: 132 column mode
      : n == 7    ? this.AWM = true
      : n == 9    ? this.mouseMode = "X10_MOUSE"
      : n == 12   ? this._screen.cursor.blink = true
      : n == 25   ? this.TCEM = true
      : n == 47   ? this._screen.switchToAlternateScreen()
      : n == 1000 ? this.mouseMode = "VT200_MOUSE"
      : n == 1001 ? this.mouseMode = "VT200_HIGHLIGHT_MOUSE"
      : n == 1002 ? this.mouseMode = "BTN_EVENT_MOUSE"
      : n == 1003 ? this.mouseMode = "ANY_EVENT_MOUSE"
      : n == 1047 ? this._screen.switchToAlternateScreen()
      : n == 1048 ? this._screen.saveCursor()
      : n == 1049 ? this._screen.selectAlternateScreen()
      : coUtils.Debug.reportWarning(
        _("%s sequence [%s] was ignored."),
        arguments.callee.name, n);
    }, this);
  },
  
  "[sequence('CSI ?%dl')]":
  function DECRST() 
  { // TODO: DEC-Private Mode Reset
    if (arguments.length == 0)
      coUtils.Debug.reportWarning(_("DECRST: Length of Arguments is zero. "));
    [].slice.apply(arguments).forEach(function(n) {
        n == 1    ? this.CKM = false
      : n == 3    ? this.COLM = false // TODO: 80 column mode
      : n == 7    ? this.AWM = false
      : n == 9    ? this.mouseMode = null
      : n == 12   ? this._screen.cursor.blink = false  
      : n == 25   ? this.TCEM = false
      : n == 47   ? this._screen.switchToMainScreen()
      : n == 1000 ? this.mouseMode = null
      : n == 1001 ? this.mouseMode = null
      : n == 1002 ? this.mouseMode = null
      : n == 1003 ? this.mouseMode = null
      : n == 1047 ? this._screen.switchToMainScreen()
      : n == 1048 ? this._screen.restoreCursor()
      : n == 1049 ? this._screen.selectMainScreen()
      : coUtils.Debug.reportWarning(
        _("%s sequence [%s] was ignored."),
        arguments.callee.name, n);
    }, this);
  },

  "[sequence('CSI ?%dr')]":
  function DECRSTR() 
  { // TODO: DEC Private Mode Restore
    [].slice.apply(arguments).forEach(function(n) {
      let value = this._decsave_buffer[n];
      delete this._decsave_buffer[n];
      if (value) {
        value.call(this);
      } else {
        coUtils.Debug.reportWarning(
          _("%s sequence [%s] was ignored."),
          arguments.callee.name, n);
      }
    }, this);
  },

  "[sequence('CSI ?%ds')]":
  function DECSAVE(n) 
  {  // TODO: DEC Private Mode Save
    [].slice.apply(arguments).forEach(function(n) {
      let value = n == 1    ? let (value = this.CKM) 
                  function() this.CKM = value // application cursor
                : n == 3    ? let (value = this.COLM)
                  function() this.COLM = value // TODO: 132 column mode
                : n == 7    ? let (value = this.AEM)
                  function() this.AWM = value
                : n == 9    ? let (value = this.mouseMode) 
                  function() this.mouseMode = value
                : n == 12   ? let (value = this._screen.cursor.blink)
                  function() this._screen.cursor.blink = value
                : n == 25   ? let (value = this.TCEM)
                  function() this.TCEM = value
                : n == 47   ? 
                  function() this._screen.switchToAlternateScreen()
                : n == 1000 ? let (value = this.mouseMode) 
                  function() this.mouseMode = value 
                : n == 1001 ? let (value = this.mouseMode) 
                  function() this.mouseMode = value
                : n == 1002 ? let (value = this.mouseMode) 
                  function() this.mouseMode = value 
                : n == 1003 ? let (value = this.mouseMode) 
                  function() this.mouseMode = value 
                : n == 1047 ? 
                  function() this._screen.switchToAlternateScreen()
                : n == 1048 ? 
                  function() this._screen.saveCursor()
                : n == 1049 ? 
                  function() this._screen.selectAlternateScreen()
                : coUtils.Debug.reportWarning(_("Ignored DECSAVE [%d]."), n);
      if (value) {
        this._decsave_buffer[n] = value;
      }
    }, this);
  },

  /**
   * DECSTBM — Set Top and Bottom Margins
   *
   * This control function sets the top and bottom margins for the current 
   * page. You cannot perform scrolling outside the margins.
   * Default: Margins are at the page limits.
   * 
   *  CSI  Pt  ;    Pb  r
   *  9/11 3/n 3/11 3/n 7/2
   *
   *  Pt is the line number for the top of margin.
   *  Default: Pt = 1.
   *
   *  Pb is the line number for the bottom of margin.
   *  Default: Pb = current number of lines per screen.
   *
   *  Notes on DECSTBM
   *  - The value of the top margin (Pt) must be less than the bottom 
   *    margin (Pb).
   *  - The maximum size of the scrolling region is the page size.
   *  - DECSTBM moves the cursor to column 1, line 1 of the page.
   *
   */
  "[sequence('CSI %dr', 'CSI %d>')]":
  function DECSTBM(n1, n2) 
  {
    // set scrolling region
    let screen = this._screen;
    let min = 0;
    let max = screen.height;
    let top = (n1 || min + 1) - 1, bottom = n2 || max;
    let bottom = arguments.length > 1 ? n2: max;
    // Trim top, bottom with min, max.
    top = Math.max(top, min);
    top = Math.min(top, max);
    bottom = Math.max(bottom, min);
    bottom = Math.min(bottom, max);
    if (top < bottom) {
      screen.setScrollRegion(top, bottom);
      /*
      coUtils.Debug.reportMessage(
        "Scrolling region was set [%d:%d]. arguments: (%d, %d).", 
        top, bottom, n1, n2);
        */
    } else {
      coUtils.Debug.reportWarning(
        _("%s sequence [%s] was ignored."),
        arguments.callee.name, [].slice.apply(arguments));
    }
    // TODO: I wonder if I should implement this feature.
    // DECSTBM moves the cursor to column 1, line 1 of the page.
    //screen.setPositionX(0);
    //screen.setPositionY(0); // 0 or top
  },

  /**
   * DECSTR — Soft Terminal Reset
   * 
   * Perform a soft reset to the default values listed in following Table.
   *
   * Format
   *
   * CSI    !     p
   * 9/11   2/1   7/0
   *
   * Description
   * 
   * Terminal's Default Settings
   *
   * Mode                                     Mnemonic                State after DECSTR
   * Text cursor enable                       DECTCEM                 Cursor enabled.
   * Insert/replace                           IRM                     Replace mode.
   * Origin                                   DECOM                   Absolute (cursor origin at upper-left of screen.)
   * Autowrap                                 DECAWM                  No autowrap.
   * National replacement character set       DECNRCM                 Multinational set.
   * Keyboard action                          KAM                     Unlocked.
   * Numeric keypad                           DECNKM                  Numeric characters.
   * Cursor keys                              DECCKM                  Normal (arrow keys).
   * Set top and bottom margins               DECSTBM                 Top margin = 1; bottom margin = page length.
   * All character sets                       G0, G1, G2, G3, GL, GR  Default settings.
   * Select graphic rendition                 SGR                     Normal rendition.
   * Select character attribute               DECSCA                  Normal (erasable by DECSEL and DECSED).
   * Save cursor state                        DECSC                   Home position.
   * Assign user preference supplemental set  DECAUPSS                Set selected in Set-Up.
   * Select active status display             DECSASD                 Main display.
   * Keyboard position mode                   DECKPM                  Character codes.
   * Cursor direction                         DECRLM                  Reset (Left-to-right), regardless of NVR setting.
   * PC Term mode                             DECPCTERM               Always reset.
   */
  "[sequence('CSI !p')]": 
  function DECSTR() 
  { // TODO: DEC specific - Soft Terminal Reset
    coUtils.Debug.reportWarning(
      _("%s sequence [%s] was ignored."),
      arguments.callee.name, [].slice.apply(arguments));
  },

  set_DECSCL: function set_DECSCL()
  { // TODO: set conformance level DECSCL
    coUtils.Debug.reportWarning(
      _("%s sequence [%s] was ignored."),
      arguments.callee.name, [].slice.apply(arguments));
  },

  set_DECSCA: function set_DECSCA() 
  { //TODO: set character protection attribute DECSCA
    coUtils.Debug.reportWarning(
      _("%s sequence [%s] was ignored."),
      arguments.callee.name, [].slice.apply(arguments));
  },

  DECEFR: function DECEFR() 
  { // TODO: Enable Filter Rectangle
    coUtils.Debug.reportWarning(
      _("%s sequence [%s] was ignored."),
      arguments.callee.name, [].slice.apply(arguments));
  },

  DECREQTPARM: function DECREQTPARM() 
  { // TODO: Request Terminal Parameters
    coUtils.Debug.reportWarning(
      "%s sequence [%s] was ignored.",
      arguments.callee.name, [].slice.apply(arguments));
  },

  DECELR: function DECELR() 
  { // TODO: Enable Locator Reporting
    coUtils.Debug.reportWarning(
      _("%s sequence [%s] was ignored."),
      arguments.callee.name, [].slice.apply(arguments));
  },

  DECSLE: function DECSLE() 
  { // TODO: Select Locator Events
    coUtils.Debug.reportWarning(
      _("%s sequence [%s] was ignored."),
      arguments.callee.name, [].slice.apply(arguments));
  },

  DECRQLP: function DECRQLP() 
  { // TODO: Request Locator Position
    coUtils.Debug.reportWarning(
      _("%s sequence [%s] was ignored."),
      arguments.callee.name, [].slice.apply(arguments));
  },

  DECLRP: function DECLRP() 
  { // TODO: Locator Report
    coUtils.Debug.reportWarning(
      _("%s sequence [%s] was ignored."),
      arguments.callee.name, [].slice.apply(arguments));
  },

  DECSED: function DECSED(n) 
  { // TODO: DEC Selectively Erase in Display
    coUtils.Debug.reportWarning(
      _("%s sequence [%s] was ignored."),
      arguments.callee.name, [].slice.apply(arguments));
  },

  DECSEL: function DECSEL(n) 
  { // DEC Selectively Elase in Line
    coUtils.Debug.reportWarning(
      _("%s sequence [%s] was ignored."),
      arguments.callee.name, [].slice.apply(arguments));
  },


};

/**
 * @class DecPrivateMode
 */
let DecPrivateMode = new Class().extends(Component)
                                .mix(DecModeSequenceHandler);
DecPrivateMode.definition = {

  get id()
    "module.decmode",

  "[subscribe('initialized/{screen & cursorstate}'), enabled]":
  function onLoad(screen, cursor_state)
  {
    this._screen = screen;
    this._cursor_state = cursor_state;
    let session = this._broker;
    session.notify("initialized/decmode", this);
  },

  /* 
   * @Property AWM
   *
   * @ref http://vt100.net/docs/vt510-rm/DECAWM 
   *
   * This control function determines whether or not received characters 
   * automatically wrap to the next line when the cursor reaches the right 
   * border of a page in page memory.
   *
   * Default: No autowrap
   *
   * If the DECAWM function is set, then graphic characters received when the 
   * cursor is at the right border of the page appear at the beginning of the 
   * next line. Any text on the page scrolls up if the cursor is at the end of
   * the scrolling region.
   *
   * If the DECAWM function is reset, then graphic characters received when 
   * the cursor is at the right border of the page replace characters already 
   * on the page.
   */
  AWM: false,   // Autowrap Mode (true: autowrap, false: no autowrap)

  /* 
   * @Property TCEM
   * Text Cursor Enable Mode (true: makes the cursor visible, false: makes the cursor invisible)             
   */
  get TCEM() this._tcem,

  set TCEM(value) 
  {
    let cursor_state = this._cursor_state;
    cursor_state.visibility = value;
    this._tcem = value;
  },

  _tcem: true,


  CKM:   false,   // Cursor Keys Mode (false: cursor sequence , true: application sequence)
  ANM:   false,   // Ansi Mode (use VT52 mode)
  COLM:  false,   // Selecting 80 or 132 Columns per Page (false: 80 columns, true: 132 columns)
  SCLM:  true,    // Scrolling Mode (true: smooth scroll, false: jump scroll)
  SCNM:  true,    // Screen Mode: Light or Dark Screen (true: reverse video, false: normal display)
  OM:    false,   // Origin Mode (true: within margins, false: upper-left corner)
  ARM:   true,    // Autorepeat Mode (true: keys autorepeat when pressed for more than 0.5 seconds, false: keys do not autorepeat)
  PFF:   false,   // Print Form Feed Mode (true:  The terminal sends a form feed (FF) to the printer at the end of a printing function.
                 //                       false: The terminal sends nothing to the printer at the end of a printing function.)
  PEX:   false,   // Print Extent Mode (true:  The print function prints the complete page.
                 //                    false: The print function prints the scrolling region only (data inside the margins).)    
  RLM:   false,   // Right-to-Left Mode
  HEBM:  false,   // Hebrew/N-A Keyboard Mapping Mode
  HEM:   false,   // Hebrew Encoding Mode
  NRCM:  true,    // National Replacement Character Set Mode (true: 7-bit characters, false: 8-bit characters)
  NAKB:  false,   // Greek/N-A Keyboard Mapping Mode
  HCCM:  false,   // Horizontal Cursor-Coupling Mode (Always false)
  VCCM:  true,    // Vertical Cursor-Coupling Mode
  PCCM:  true,    // Page Cursor-Coupling Mode

  // Numeric Keypad Mode (true: application sequence, false: keypad characters)
  NKM:   true,

  BKM:   false,   // Backarrow Key Mode (true: backspace key, false: delete key)
  KBUM:  false,   // Typewriter or Data Processing Keys (true: data processing keys, false: typewriter keys)
  LRMM:  false,   // Left Right Margin Mode (true: DECSLRM can set margins, false: DECSLRM cannot set margins)
  XRLM:  false,   // Transmit Rate Limiting (true: limited transmit rate, false: unlimited transmit rate)
  NCSM:  false,   // Selecting 80 or 132 Columns per Page
  RLCM:  false,   // Right-to-Left Copy Mode (true: Enable right-to-left copy, false: Disable right-to-left copy)
  CRTSM: true,    // Set/Reset CRT Save Mode (true: enable CRT saver, false: disable CRT saver)
  ARSM:  false,   // Set/Reset Auto Resize Mode (true: enable auto resize, false: disable auto resize)
  MCM:   false,   // Modem Control Mode (true: Enable Modem Control, false: Disable modem control)
  AAM:   false,   // Set/Reset Auto Answerback Mode (true: enables auto answerback, false: disables auto answerback)
  CANSM: false,   // Conceal Answerback Message Mode (true: Conceal answerback message, false: Answerback message is not concealed)
  NULM:  true,    // Null Mode (true: discard NUL characters, false: pass NULL characters to printer)
  HDPXM: false,   // Set/Reset Half-Duplex Mode (true: Set to half-duplex mode, false: Set to full-duplex mode)
  ESKM:  false,   // Enable Secondary Keyboard Language Mode (true: Secondary keyboard mapping, false: Primary keyboard mapping)
  OSCNM: false,   // Set/Reset Overscan Mode (VT520 only, true: Enable overscan, false: Disable overscan)
  FWM:   true,    // Set/Reset Framed Window Mode (true: enables framed windows, false: disables framed windows)
  RPL:   false,   // Review Previous Lines Mode (true: enables review previous lines, false: disables review previous lines)
  HWUM:  false,   // Host Wake-Up Mode (CRT and Energy Saver, true: enables host wake-up mode, false: disables host wake-up mode)
  ATCUM: false,   // Set/Reset Alternate Text Color Underline Mode (true: enables underline text mode, false: disables underline text mode)
  ATCBM: false,   // Set/Reset Alternate Text Color Blink Mode (true: enables blink text mode, false: disables blink text mode)
  BBSM:  false,   // Bold and Blink Style Mode (true: foreground and background, false: foreground only)
  ECM:   false,   // Erase Color Mode (true: erase to screen background [VT], false: erase to text background [PC]

}

/**
 * @fn main
 * @brief Module entry point.
 * @param {Broker} broker The Broker object.
 */
function main(broker) 
{
  broker.subscribe(
    "@initialized/broker", 
    function(broker) new DecPrivateMode(broker));
}


