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

let DEC_CKM   = 1
let DEC_ANM   = 2
let DEC_COLM  = 3
let DEC_SCLM  = 4
let DEC_SCNM  = 5
let DEC_OM    = 6
let DEC_AWM   = 7
let DEC_ARM   = 8
let DEC_PFF   = 9
let DEC_PEX   = 10
let DEC_TCEM  = 11
let DEC_RLM   = 12
let DEC_HEBM  = 13
let DEC_HEM   = 14
let DEC_NRCM  = 15
let DEC_NAKB  = 16
let DEC_HCCM  = 17
let DEC_VCCM  = 18
let DEC_PCCM  = 19
let DEC_NKM   = 20
let DEC_BKM   = 21
let DEC_KBUM  = 22
let DEC_LRMM  = 23 // DECVSSM
let DEC_XRLMM = 24
let DEC_NCSM  = 25
let DEC_RLCM  = 26
let DEC_CRTSM = 27
let DEC_ARSM  = 28
let DEC_MCM   = 29
let DEC_AAM   = 30
let DEC_CANSM = 31
let DEC_NULM  = 32
let DEC_HDPXM = 33
let DEC_ESKM  = 34
let DEC_OSCNM = 35
let DEC_FWM   = 36
let DEC_RPL   = 37
let DEC_HWUM  = 38
let DEC_ATCUM = 39
let DEC_ATCBM = 40
let DEC_BBSM  = 41
let DEC_ECM   = 42

/**
 * @trait DecModeSequenceHandler
 */
let DecModeSequenceHandler = new Trait();
DecModeSequenceHandler.definition = {

  _dec_save_buffer: null,
  _dec_alternate_buffer: null,

  /** Constructor */
  initialize: function initialize(broker) 
  {
    this._dec_save_buffer = {};
    this._dec_alternate_buffer = {};
  },

  "[profile('vt100'), sequence('CSI ?%dh')]":
  function DECSET() 
  { // DEC Private Mode Set

    if (0 == arguments.length) {
      coUtils.Debug.reportWarning(_("DECSET: Length of Arguments is zero. "));
    }

    let broker = this._broker;

    for (let i = 0; i < arguments.length; ++i) {

      let n = arguments[i];

      this._dec_save_buffer[i] = true;

      switch (n) {

        // Application Cursor Keys (DECCKM)
        case 1:
          this.DECCKM = true; // application cursor
          break;

        // Designate USASCII for character sets G0-G3 (DECANM), and set VT100 mode.
        case 2:
          broker.notify("sequence/g0", "B");
          broker.notify("sequence/g1", "B");
          broker.notify("sequence/g2", "B");
          broker.notify("sequence/g3", "B");
          broker.notify("command/change-mode", "vt100"); // TODO: write subscriber
          coUtils.Debug.reportWarning(
            _("DECSET - DECANM was not implemented completely."));
          break;

        // 132 column mode (DECCOLM)
        case 3:
          if (this._allow_switching_80_and_132_mode) {
            this.COLM = true;
            this._broker.notify("command/resize-screen", {
              column: 132,
              row: this._screen.height,
            });
            
            let (screen = this._screen) {
              //this._screen.width = 132; // 132 column mode
              screen.eraseScreenAll();
              //screen.reset();

              broker.notify("event/screen-size-changed", { 
                column: screen.width, 
                row: screen.height 
              });
            }

          }
          break;

        // Smooth (Slow) Scloll (DECSCLM)
        case 4:
          // smooth scroll.
          broker.notify("command/change-scrolling-mode", "smooth");
          break;

        // Reverse Video (DECSCNM)
        case 5:
          broker.notify("command/reverse-video", true);
          coUtils.Debug.reportMessage(
            _("DECSET - DECSCNM (Reverse video) was called."));
          break;

        // Origin Mode (DECOM)
        case 6:
          // TODO: origin mode.
          this._screen.cursor.DECOM = true;
          coUtils.Debug.reportMessage(
            _("DECSET - DECOM (Origin mode) was set: (%d, %d)."),
            this._screen.cursor.originX,
            this._screen.cursor.originY);
          break;

        // Wraparound Mode (DECAWM)
        case 7:
          this.DECAWM = true;
          coUtils.Debug.reportMessage(
            _("DECSET - DECAWM (Auto-wrap Mode) was set."));
          break;

        // Auto-repeat Keys (DECARM)
        case 8:
          // enable auto repeat.
          broker.notify("command/change-auto-repeat-mode", true);
          coUtils.Debug.reportMessage(
            _("DECSET - DECARM (Auto-repeat Keys) is set."));
          break;

        // X10_MOUSE mode
        case 9:
          broker.notify("event/mouse-tracking-mode-changed", "X10_MOUSE");
          break;

        // cursor blink mode
        case 12:
          this._screen.cursor.blink = true;
          break;

        // Print from feed (DECPFF)
        case 18:
          // TODO: print from feed.
          coUtils.Debug.reportWarning(
            _("DECSET - DECPFF (Print from feed) was ignored."));
          break;

        // Set print extent to full screen (DECPEX)
        case 19:
          // TODO: print from feed.
          coUtils.Debug.reportWarning(
            _("DECSET - DECPEX (Set print extent to full screen) was ignored."));
          break;

        // Show Cursor (DECTCEM)
        case 25:
          this.TCEM = true;
          break;

        // Show Scrollbar (rxvt)
        case 30:
          broker.notify("command/scrollbar-show");
          coUtils.Debug.reportMessage(
            _("DECSET 30 - Show scrollbar feature (rxvt) is set."));
          break;

        // Enable shifted key-functions (rxvt)
        case 35:
          broker.notify("command/enable-shifted-key-functions");
          coUtils.Debug.reportWarning(
            _("DECSET 35 - Enable-Shifted-Key-Function feature (rxvt) was not ", 
              "implemented completely."));
          break;

        // Enable Tektronix mode (DECTEK)
        case 38:
          coUtils.Debug.reportWarning(
            _("DECSET 38 - Enter Tektronix mode (DECTEK)."));
          broker.notify("command/change-mode", "tektronix");
          break;

        // Allow 80 <--> 132 mode
        case 40:
          this._allow_switching_80_and_132_mode = true;
          coUtils.Debug.reportMessage(
            _("DECSET 40 - (Allow 80 <--> 132 mode) was called."));
          break;

        // more(1) fix.
        case 41:
          coUtils.Debug.reportWarning(
            _("DECSET 41 - enable fix for more(1) ", 
              "was not implemented."));
          break;

        // Enable Nation Replacement Character sets (DECNRCM).
        case 42:
          coUtils.Debug.reportWarning(
            _("DECSET 42 - Enable Nation Replacement Character sets (DECNRCM) ", 
              "was not implemented."));
          break;

        // Turn On Margin Bell
        case 44:
          coUtils.Debug.reportWarning(
            _("DECSET 44 - Turn On Margin Bell, ", 
              "was not implemented."));
          break;

        // Reverse-wraparound Mode
        case 45:
          this.DECRWM = true;
          coUtils.Debug.reportMessage(
            _("DECSET 45 - Reverse-wraparound Mode was set."));
          break;

        // Start Logging
        case 46:
          coUtils.Debug.reportWarning(
            _("DECSET 46 - Start Logging, ", 
              "was not implemented."));
          break;

        // Use Alternate Screen Buffer 
        // (unless disabled by the titleInhibit resource)
        case 47:
          this._screen.switchToAlternateScreen();
          break;

        // Application keypad (DECNKM)
        case 66:
          broker.notify(
            "event/keypad-mode-changed", 
            coUtils.Constant.KEYPAD_MODE_APPLICATION);
          break;

        // Backarrow key sends delete (DECBKM)
        case 67:
          coUtils.Debug.reportWarning(
            _("DECSET 67 - Backarrow key sends delete (DECBKM), ", 
              "was not implemented."));
          break;

        // Send Mouse X & Y on button press and release. 
        // See the section Mouse Tracking.
        case 1000:
          broker.notify("event/mouse-tracking-mode-changed", "VT200_MOUSE");
          break;

        // Use Hilite Mouse Tracking.
        case 1001:
          broker.notify("event/mouse-tracking-mode-changed", "VT200_HIGHLIGHT_MOUSE");
          break;

        // Use Cell Motion Mouse Tracking.
        case 1002:
          broker.notify("event/mouse-tracking-mode-changed", "BTN_EVENT_MOUSE");
          break;

        // Use All Motion Mouse Tracking.
        case 1003:
          broker.notify("event/mouse-tracking-mode-changed", "ANY_EVENT_MOUSE");
          break;

        // Scroll to bottom on tty output (rxvt).
        case 1010:
          coUtils.Debug.reportWarning(
            _("DECSET 1010 - Scroll to bottom on tty output (rxvt), ", 
              "was not implemented."));
          break;

        // Scroll to bottom on key press (rxvt).
        case 1011:
          coUtils.Debug.reportWarning(
            _("DECSET 1011 - Scroll to bottom on key press (rxvt), ", 
              "was not implemented."));
          break;

        // Enable special modifiers for Alt and NumLock keys.
        case 1035:
          coUtils.Debug.reportWarning(
            _("DECSET 1035 - Enable special modifiers for Alt and NumLock keys, ",
              "was not implemented."));
          break;

        // Send ESC when Meta modifies a key 
        // (enables the metaSendsEscape resource).
        case 1036:
          coUtils.Debug.reportWarning(
            _("DECSET 1036 - Send ESC when Meta modifies a key ",
              "(enables the metaSendsEscape resource), ", 
              "was not implemented."));
          break;

        // Send DEL from the editing-keypad Delete key.
        case 1037:
          coUtils.Debug.reportWarning(
            _("DECSET 1037 - Send DEL from ",
              "the editing- keypad Delete key, ", 
              "was not implemented."));
          break;

        // Use Alternate Screen Buffer 
        // (unless disabled by the titleInhibit resource)
        case 1047:
          this._screen.switchToAlternateScreen();
          break;

        // Save cursor as in DECSC 
        // (unless disabled by the titleinhibit resource)
        case 1048:
          this._screen.saveCursor();
          break;

        // Save cursor as in DECSC and use Alternate Screen Buffer, 
        // clearing it first (unless disabled by the titleinhibit resource)
        case 1049:
          this._screen.selectAlternateScreen();
          break;

        // Set Sun function-key mode. 
        case 1051:
          coUtils.Debug.reportWarning(
            _("DECSET 1051 - Set Sun function-key mode, ", 
              "was not implemented."));
          break;

        // Set HP function-key mode. 
        case 1052:
          coUtils.Debug.reportWarning(
            _("DECSET 1052 - Set HP function-key mode, ", 
              "was not implemented."));
          break;

        // Set legacy keyboard emulation (X11R6). 
        case 1060:
          coUtils.Debug.reportWarning(
            _("DECSET 1052 - Set legacy keyboard emulation (X11R6), ", 
              "was not implemented."));
          break;

        // Set Sun/PC keyboard emulation of VT220 keyboard. 
        case 1061:
          coUtils.Debug.reportWarning(
            _("DECSET 1052 - Set Sun/PC keyboard emulation of VT220 keyboard, ", 
              "was not implemented."));
          break;

        // Set bracketed paste mode. 
        case 2004:
          broker.notify("command/change-bracketed-paste-mode", true);
          coUtils.Debug.reportMessage(
            _("DECSET 2004 - Set bracketed paste mode is set."));
          break;

        default:
          coUtils.Debug.reportWarning(
            _("%s sequence [%s] was ignored."),
            arguments.callee.name, n);

      } // end switch
    } // end for
  },
  
  "[profile('vt100'), sequence('CSI ?%dl')]":
  function DECRST() 
  { // TODO: DEC-Private Mode Reset

    if (arguments.length == 0) {
      coUtils.Debug.reportWarning(_("DECRST: Length of Arguments is zero. "));
    }

    let broker = this._broker;

    for (let i = 0; i < arguments.length; ++i) {

      this._dec_save_buffer[i] = false;

      let n = arguments[i];

      switch (n) {

        // Normal Cursor Keys (DECCKM)
        case 1:
          this.DECCKM = false; // normal cursor
          break;

        // Designate VT52 mode.
        case 2:
          broker.notify("command/change-mode", "vt52"); // TODO: write subscriber
          coUtils.Debug.reportWarning(
            _("DECRST - DECANM was not implemented completely."));
          break;

        // 80 column mode (DECCOLM)
        case 3:
          if (this._allow_switching_80_and_132_mode) {
            this.COLM = false;
            broker.notify("command/resize-screen", {
              column: 80,
              row: this._screen.height,
            });
            
            let (screen = this._screen) {
              //this._screen.width = 80; // 80 column mode
              screen.eraseScreenAll();
              //screen.reset();

              broker.notify("event/screen-size-changed", { 
                column: screen.width, 
                row: screen.height 
              });
            }

          }
          break;

        // Smooth (Slow) Scloll (DECSCLM)
        case 4:
          // smooth scroll.
          broker.notify("command/change-scrolling-mode", "normal");
          break;

        // Reverse Video (DECSCNM)
        case 5:
          broker.notify("command/reverse-video", false);
          coUtils.Debug.reportMessage(
            _("DECRST - DECSCNM (Reverse video) was called."));
          break;

        // Reset Origin Mode (DECOM)
        case 6:
          // TODO: reset origin mode.
          this._screen.cursor.DECOM = false;
          coUtils.Debug.reportMessage(
            _("DECSET - DECOM (Origin mode) was reset: (%d, %d)."),
            this._screen.cursor.positionX,
            this._screen.cursor.positionY);
          break;

        // Wraparound Mode (DECAWM)
        case 7:
          this.DECAWM = false;
          coUtils.Debug.reportMessage(
            _("DECRST - DECAWM (Auto-wrap Mode) was set."));
          break;

        // Auto-repeat Keys (DECARM)
        case 8:
          // enable auto repeat.
          broker.notify("command/change-auto-repeat-mode", false);
          coUtils.Debug.reportMessage(
            _("DECRST - DECARM (Auto-repeat Keys) is reset."));
          break;

        // X10_MOUSE mode
        case 9:
          broker.notify("event/mouse-tracking-mode-changed", null);
          break;

        // cursor blink mode
        case 12:
          this._screen.cursor.blink = false;
          break;

        // Print from feed (DECPFF)
        case 18:
          // TODO: print from feed.
          coUtils.Debug.reportWarning(
            _("DECRST - DECPFF (Print from feed) was ignored."));
          break;

        // Set print extent to full screen (DECPEX)
        case 19:
          // TODO: print from feed.
          coUtils.Debug.reportWarning(
            _("DECRST - DECPEX (Set print extent to full screen) was ignored."));
          break;

        // Show Cursor (DECTCEM)
        case 25:
          this.TCEM = false;
          break;

        // TODO: Show Scrollbar (rxvt)
        case 30:
          broker.notify("command/scrollbar-hide");
          coUtils.Debug.reportMessage(
            _("DECRST 30 - Show-scrollbar feature (rxvt) is reset."));
          break;

        // Enable shifted key-functions (rxvt)
        case 35:
          broker.notify("command/disable-shifted-key-functions");
          coUtils.Debug.reportWarning(
            _("DECRST - Enable-Shifted-Key-Function feature (rxvt) was not ", 
              "implemented completely."));
          break;

        // Disallow 80 <--> 132 mode
        case 40:
          this._allow_switching_80_and_132_mode = false;
          coUtils.Debug.reportMessage(
            _("DECRST 40 - (Disallow 80 <--> 132 mode) was called."));
          break;

        // No more(1) fix.
        case 41:
          coUtils.Debug.reportWarning(
            _("DECRST 41 - disable fix for more(1) ", 
              "was not implemented."));
          break;

        // Enable Nation Replacement Character sets (DECNRCM).
        case 42:
          coUtils.Debug.reportWarning(
            _("DECRST 42 - Enable Nation Replacement Character sets (DECNRCM) ", 
              "was not implemented."));
          break;

        // Turn Off Margin Bell
        case 44:
          coUtils.Debug.reportWarning(
            _("DECRST 44 - Turn Off Margin Bell, ", 
              "was not implemented."));
          break;

        // No Reverse-wraparound Mode
        case 45:
          this.DECRWM = false;
          coUtils.Debug.reportMessage(
            _("DECRST 45 - Reverse-wraparound Mode was reset."));
          break;

        // Stop Logging
        case 46:
          coUtils.Debug.reportWarning(
            _("DECRST 46 - Stop Logging, ", 
              "was not implemented."));
          break;

        // Use Normal Screen Buffer 
        // (unless disabled by the titleInhibit resource)
        case 47:
          this._screen.switchToMainScreen();
          break;

        // Numeric keypad (DECNKM)
        case 66:
          broker.notify(
            "event/keypad-mode-changed", 
            coUtils.Constant.KEYPAD_MODE_NUMERIC);
          break;

        // Backarrow key sends backspace (DECBKM)
        case 67:
          coUtils.Debug.reportWarning(
            _("DECRST 67 - Backarrow key sends delete (DECBKM), ", 
              "was not implemented."));
          break;

        // Don't Send Mouse X & Y on button press and release. 
        case 1000:
          broker.notify("event/mouse-tracking-mode-changed", null);
          break;

        // Don't Use Hilite Mouse Tracking.
        case 1001:
          broker.notify("event/mouse-tracking-mode-changed", null);
          break;

        // Don't Use Cell Motion Mouse Tracking.
        case 1002:
          broker.notify("event/mouse-tracking-mode-changed", null);
          break;

        // Don't Use All Motion Mouse Tracking.
        case 1003:
          broker.notify("event/mouse-tracking-mode-changed", null);
          break;

        // Don't scroll to bottom on tty output (rxvt).
        case 1010:
          coUtils.Debug.reportWarning(
            _("DECRST 1010 - Don't scroll to bottom on tty output (rxvt), ", 
              "was not implemented."));
          break;

        // Don't scroll to bottom on key press (rxvt).
        case 1011:
          coUtils.Debug.reportWarning(
            _("DECRST 1010 - Don't scroll to bottom on key press (rxvt), ", 
              "was not implemented."));
          break;

        // Disable special modifiers for Alt and NumLock keys.
        case 1035:
          coUtils.Debug.reportWarning(
            _("DECRST 1035 - Disable special modifiers for Alt and NumLock keys, ",
              "was not implemented."));
          break;

        // Don't send ESC when Meta modifies a key 
        // (disables the metaSendsEscape resource).
        case 1036:
          coUtils.Debug.reportWarning(
            _("DECRST 1036 - Don't send ESC when Meta modifies a key ",
              "(disables the metaSendsEscape resource), ", 
              "was not implemented."));
          break;

        // Send VT220 Remove from the editing- keypad Delete key.
        case 1037:
          coUtils.Debug.reportWarning(
            _("DECRST 1037 - Send VT220 Remove from ",
              "the editing- keypad Delete key, ", 
              "was not implemented."));
          break;

        // Use Normal Screen Buffer, clearing screen first if in the 
        // Alternate Screen (unless disabled by the titleinhibit resource)
        case 1047:
          this._screen.switchToMainScreen();
          break;

        // Restore cursor as in DECRC 
        // (unless disabled by the titleinhibit resource)
        case 1048:
          this._screen.restoreCursor();
          break;

        // Use Normal Screen Buffer and restore cursor as in DECRC 
        // (unless disabled by the titleinhibit resource)
        case 1049:
          this._screen.selectMainScreen();
          break;

        // Reset Sun function-key mode. 
        case 1051:
          coUtils.Debug.reportWarning(
            _("DECRST 1051 - Reset Sun function-key mode, ", 
              "was not implemented."));
          break;

        // Reset HP function-key mode. 
        case 1052:
          coUtils.Debug.reportWarning(
            _("DECRST 1052 - Reset HP function-key mode, ", 
              "was not implemented."));
          break;

        // Reset legacy keyboard emulation (X11R6). 
        case 1060:
          coUtils.Debug.reportWarning(
            _("DECRST 1060 - Reset legacy keyboard emulation (X11R6), ", 
              "was not implemented."));
          break;

        // Reset Sun/PC keyboard emulation of VT220 keyboard. 
        case 1061:
          coUtils.Debug.reportWarning(
            _("DECRST 1061 - Reset Sun/PC keyboard emulation of VT220 keyboard, ", 
              "was not implemented."));
          break;

        // Reset bracketed paste mode. 
        case 2004:
          broker.notify("command/change-bracketed-paste-mode", false);
          coUtils.Debug.reportMessage(
            _("DECRST 2004 - Reset bracketed paste mode is reset."));
          break;

        default:
          coUtils.Debug.reportWarning(
            _("%s sequence [%s] was ignored."),
            arguments.callee.name, n);

      } // end switch

    } // end for

  },

  "[profile('vt100'), sequence('CSI ?%dr')]":
  function DECRSTR(n) 
  { // DEC Private Mode Restore
    let save_buffer = this._dec_save_buffer;
    let alternate_buffer = this._dec_alternate_buffer;
    for (let i = 0; i < arguments.length; ++i) {
      let key = arguments[i];
      let value = save_buffer[key] = alternate_buffer[key];
      if (value) {
        this.DECSET(n);
      } else {
        this.DECRST(n);
      }
    }
  },

  "[profile('vt100'), sequence('CSI ?%ds')]":
  function DECSAVE() 
  {  // DEC Private Mode Save
    let save_buffer = this._dec_save_buffer;
    let alternate_buffer = this._dec_alternate_buffer;
    for (let i = 0; i < arguments.length; ++i) {
      let key = arguments[i];
      alternate_buffer[key] = save_buffer[key];
    }
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
  "[profile('vt100'), sequence('CSI %dr', 'CSI %d>')]":
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

    if (top > bottom) {
      // swap
      let tmp = top;
      top = bottom;
      bottom = top;
    }

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
        arguments.callee.name, Array.slice(arguments));
    }
    // TODO: I wonder if I should implement this feature.
    // DECSTBM moves the cursor to column 1, line 1 of the page.
    screen.setPositionX(0);
    screen.setPositionY(top);
//    screen.cursor.originX = screen.cursor.positionX; 
    screen.cursor.originY = screen.cursor.positionY; 

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
   * Mode                              Mnemonic   State after DECSTR
   *
   * Text cursor enable                DECTCEM    Cursor enabled.
   * Insert/replace                    IRM        TODO: Replace mode.
   * Origin                            DECOM      TODO: Absolute (cursor origin at 
   *                                              upper-left of screen.)
   * Autowrap                          DECAWM     TODO: No autowrap.
   * National replacement CS           DECNRCM    TODO: Multinational set.
   * Keyboard action                   KAM        TODO: Unlocked.
   * Numeric keypad                    DECNKM     TODO: Numeric characters.
   * Cursor keys                       DECCKM     TODO: Normal (arrow keys).
   * Set top and bottom margins        DECSTBM    TODO: Top margin = 1; 
   *                                              TODO: bottom margin = page length.
   * All character sets                G0-3,GL,GR TODO: Default settings.
   * Select graphic rendition          SGR        TODO: Normal rendition.
   * Select character attribute        DECSCA     TODO: Normal (erasable by DECSEL 
   *                                              TODO: and DECSED).
   * Save cursor state                 DECSC      TODO: Home position.
   * Assign user-pref supplemental set DECAUPSS   TODO: Set selected in Set-Up.
   * Select active status display      DECSASD    TODO: Main display.
   * Keyboard position mode            DECKPM     TODO: Character codes.
   * Cursor direction                  DECRLM     TODO: Reset (Left-to-right), 
   *                                              TODO: regardless of NVR setting.
   * PC Term mode                      DECPCTERM  TODO: Always reset.
   */
  "[profile('vt100'), sequence('CSI !p')]": 
  function DECSTR() 
  { // TODO: DEC specific - Soft Terminal Reset
    this.DECSET(25);
    coUtils.Debug.reportWarning(
      _("DECSTR is not implemented completely."));
  },

  set_DECSCL: function set_DECSCL()
  { // TODO: set conformance level DECSCL
    coUtils.Debug.reportWarning(
      _("%s sequence [%s] was ignored."),
      arguments.callee.name, Array.slice(arguments));
  },

  set_DECSCA: function set_DECSCA() 
  { //TODO: set character protection attribute DECSCA
    coUtils.Debug.reportWarning(
      _("%s sequence [%s] was ignored."),
      arguments.callee.name, Array.slice(arguments));
  },

  DECEFR: function DECEFR() 
  { // TODO: Enable Filter Rectangle
    coUtils.Debug.reportWarning(
      _("%s sequence [%s] was ignored."),
      arguments.callee.name, Array.slice(arguments));
  },

  DECREQTPARM: function DECREQTPARM() 
  { // TODO: Request Terminal Parameters
    coUtils.Debug.reportWarning(
      "%s sequence [%s] was ignored.",
      arguments.callee.name, Array.slice(arguments));
  },

  DECELR: function DECELR() 
  { // TODO: Enable Locator Reporting
    coUtils.Debug.reportWarning(
      _("%s sequence [%s] was ignored."),
      arguments.callee.name, Array.slice(arguments));
  },

  DECSLE: function DECSLE() 
  { // TODO: Select Locator Events
    coUtils.Debug.reportWarning(
      _("%s sequence [%s] was ignored."),
      arguments.callee.name, Array.slice(arguments));
  },

  DECRQLP: function DECRQLP() 
  { // TODO: Request Locator Position
    coUtils.Debug.reportWarning(
      _("%s sequence [%s] was ignored."),
      arguments.callee.name, Array.slice(arguments));
  },

  DECLRP: function DECLRP() 
  { // TODO: Locator Report
    coUtils.Debug.reportWarning(
      _("%s sequence [%s] was ignored."),
      arguments.callee.name, Array.slice(arguments));
  },

  DECSED: function DECSED(n) 
  { // TODO: DEC Selectively Erase in Display
    coUtils.Debug.reportWarning(
      _("%s sequence [%s] was ignored."),
      arguments.callee.name, Array.slice(arguments));
  },

  DECSEL: function DECSEL(n) 
  { // DEC Selectively Elase in Line
    coUtils.Debug.reportWarning(
      _("%s sequence [%s] was ignored."),
      arguments.callee.name, Array.slice(arguments));
  },

  "[profile('vt100'), sequence('CSI %d\\ ~')]":
  function DECTME(n) 
  { // DEC Selectively Elase in Line
    coUtils.Debug.reportWarning(
      _("%s sequence [%s] was ignored."),
      arguments.callee.name, Array.slice(arguments));
  },


};

/**
 * @class DecPrivateMode
 */
let DecPrivateMode = new Class().extends(Component)
                                .mix(DecModeSequenceHandler);
DecPrivateMode.definition = {

  get id()
    "decmode",

  "[subscribe('initialized/{screen & cursorstate}'), enabled]":
  function onLoad(screen, cursor_state)
  {
    this._screen = screen;
    this._cursor_state = cursor_state;
    this.DECAWM = true;
    let broker = this._broker;
    broker.notify("initialized/decmode", this);
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
  
  _awm: false,

  "[subscribe('command/change-mode'), enabled]":
  function (mode)
  {
//    this.DECAWM = false;
//    this.DECRWM = false;
  },

  // Autowrap Mode (true: autowrap, false: no autowrap)
  get DECAWM()
  {
    return this._awm;
  },

  set DECAWM(value)
  {
    let broker = this._broker;
    if (value) {
      broker.notify("command/enable-wraparound");
    } else {
      broker.notify("command/disable-wraparound");
    }
    this._awm = value;
  },

  
  // Reverse Autowrap Mode (true: autowrap, false: no autowrap)
  get DECRWM()
  {
    return this._rwm;
  },

  set DECRWM(value)
  {
    let broker = this._broker;
    if (value) {
      broker.notify("command/enable-reverse-wraparound");
    } else {
      broker.notify("command/disable-reverse-wraparound");
    }
    this._rwm = value;
  },

  /* 
   * @Property DECCKM
   */
  get DECCKM() 
  {
    return this._ckm;
  },

  set DECCKM(value) 
  {
    let broker = this._broker;
    let mode;
    if (value) {
      mode = "normal";
    } else {
      mode = "application";
    }
    broker.notify("command/change-cursor-mode", mode);
    this._ckm = value;
  },

  /* 
   * @Property TCEM
   * Text Cursor Enable Mode 
   * true:  makes the cursor visible 
   * false: makes the cursor invisible
   */
  get TCEM() 
  {
    return this._tcem;
  },

  set TCEM(value) 
  {
    let broker = this._broker;
    let cursor_state = this._cursor_state;
    cursor_state.visibility = value;
    this._tcem = value;
  },

  _tcem: true,


//  CKM:   false,   // Cursor Keys Mode (false: cursor sequence , true: application sequence)
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
  new DecPrivateMode(broker);
}


