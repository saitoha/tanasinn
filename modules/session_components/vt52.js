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

"use strict";

var _STATE_GROUND = 0,
    _STATE_ESC    = 1,
    _STATE_ESC_Y1 = 2,
    _STATE_ESC_Y2 = 3;

/**
 * @class VT52
 */
var VT52 = new Class().extends(Plugin)
                      .depends("tab_controller")
                      .depends("screen")
                      .depends("cursorstate")
                      ;
VT52.definition = {

  /** Component ID */
  id: "vt52",

  getInfo: function getInfo()
  {
    return {
      name: _("VT-52 mode"),
      version: "0.2.0",
      description: _("Emurate DEC VT-52 terminal.")
    };
  },

  "[persistable] enabled_when_startup": true,


  _tab_controller: null,
  _screen: null,
  _cursor_state: null,
  _esc_map: null,
  _char_map: null,
  _state: _STATE_GROUND,

  /** Installs itself. 
   *  @param {InstallContext} context A InstallContext object.
   */
  "[install]":
  function install(context)
  {
    this._tab_controller = context["tab_controller"];
    this._screen = context["screen"];
    this._cursor_state = context["cursorstate"];
    this._esc_map = [];
    this._char_map = [];
    this._state = _STATE_GROUND;
  },

  /** Unnstalls itself. 
   */
  "[uninstall]":
  function uninstall()
  {
    this._tab_controller = null;
    this._screen = null;
    this._cursor_state = null;
    this._esc_map = null;
    this._char_map = null;
  },

  "[subscribe('event/session-initialized'), pnp]":
  function onSessionInitialized()
  {
    var sequences = this.sendMessage("get/sequences/vt52"),
        i = 0;

    for (; i < sequences.length; ++i) {
      this.sendMessage("command/add-sequence/vt52", sequences[i]);
    }
  },

  "[subscribe('get/grammars'), pnp]":
  function onGrammarsRequested()
  {
    return this;
  },

  /** Parse and returns asocciated action. 
   *  @param {Scanner} scanner A Scanner object.
   *  @param {Function|Undefined} Action object.
   *
   *  @implements Grammar.parse :: Scanner -> Action
   */
  "[type('Scanner -> Action')] parse":
  function parse(scanner) 
  {
    var c,
        action,
        state,
        screen;

    while (!scanner.isEnd) {
      c = scanner.current()
      state = this._state;
      if (0x1b === c) {
        this._state = _STATE_ESC;
      } else if (c < 0x20) {
        action = this._char_map[c];
        if (action) {
          action();
        }
        //this._state = _STATE_GROUND;
      } else if (_STATE_ESC === state) {
        action = this._esc_map[c];
        if (0x59 === c) {
          this._state = _STATE_ESC_Y1;
        } else {
          if (action) {
            action();
          }
          this._state = _STATE_GROUND;
        }
      } else if (_STATE_ESC_Y1 === state) {
        this._c1 = c;
        this._state = _STATE_ESC_Y2;
      } else if (_STATE_ESC_Y2 === state) {
        if (action) {
          action(this._c1, c);
        }
        this._state = _STATE_GROUND;
      } else if (c < 0x80) /*if (_STATE_GROUND === state)*/ {
        //return false; 
        screen = this._screen;
        if (screen.cursor.positionX < this._screen.width) {
          screen.write([c])
        }
      }
      scanner.moveNext();
    }
  },

  /** Append a sequence handler.
   *  @param {Object} information A register information object that has 
   *                              "expression", "handler", and "context" key.
   *
   *  @implements Grammar.<command/add-sequence/vt52> :: SequenceInfo -> Undefined
   */
  "[subscribe('command/add-sequence/vt52'), type('SequenceInfo -> Undefined'), pnp]":
  function append(information) 
  {
    var expression = information.expression,
        tokens = expression.split(/\s+/),
        context = information.context,
        handler = information.handler,
        length = tokens.length,
        key;

    this._esc_map = this._esc_map || [];
    this._char_map = this._char_map || [];

    if (1 === length) {
      key = Number(tokens[0]);
      this._char_map[key] = 
        function action()
        {
          return handler.call(context);
        };
      //this._hookmap.body[handler.name] = [key, handler];
    } else if (2 === length) {
      key = tokens.pop().charCodeAt();
      length = tokens.length;
      this._esc_map[key] =
        function action()
        {
          return handler.call(context);
        };
    } else if (3 == length) {
      key = tokens[1].charCodeAt(0);
      length = tokens.length;
      this._esc_map[key] =
        function action(py, px)
        {
          return handler.call(context, py, px);
        };
    }
  }, // append


  /** Null.
   */
  "[profile('vt52'), sequence('0x00')]":
  function NUL() 
  {
  },
  
  /** Start of heading.
   */
  "[profile('vt52'), sequence('0x01')]":
  function SOH() 
  {
    coUtils.Debug.reportWarning(
      _("%s sequence [%s] was ignored."),
      "SOH", Array.slice(arguments));
  },
  
  /** Start of text.
   */
  "[profile('vt52'), sequence('0x02')]":
  function STX()  
  {
    coUtils.Debug.reportWarning(
      _("%s sequence [%s] was ignored."),
      "STX", Array.slice(arguments));
  },
 
  /** End of text.
   */
  "[profile('vt52'), sequence('0x03')]":
  function ETX() 
  {
    coUtils.Debug.reportWarning(
      _("%s sequence [%s] was ignored."),
      "ETX", Array.slice(arguments));
  },

  /** Start of transmission.
   */
  "[profile('vt52'), sequence('0x04')]":
  function EOT() 
  {
    coUtils.Debug.reportWarning(
      _("%s sequence [%s] was ignored."),
      "EOT", Array.slice(arguments));
  },
  
  /** Enquire.
   */
  "[profile('vt52'), sequence('0x05')]":
  function ENQ() 
  {
    this.sendMessage("command/answerback");
  },
  
  /** Acknowledge.
   */
  "[profile('vt52'), sequence('0x06')]":
  function ACK() 
  {
    coUtils.Debug.reportWarning(
      _("%s sequence [%s] was ignored."),
      "ACK", Array.slice(arguments));
  },
   
  /** Bell.
   */
  "[profile('vt52'), sequence('0x07', 'ESC \\\\')]":
  function BEL() 
  {
    this.sendMessage("sequence/bel");
  },

  /** Back space.
   */
  "[profile('vt52'), sequence('0x08')]":
  function BS() 
  { // BackSpace
    var screen = this._screen;
    screen.backSpace();
  },
   
  /** Horizontal tabulation.
   */
  "[profile('vt52'), sequence('0x09'), _('Horizontal tabulation')]":
  function HT() 
  { // Horizontal Tab
    var screen = this._screen;
    screen.horizontalTab();
  },
  
  /** Linefeed.
   */
  "[profile('vt52'), sequence('0x0A'), _('Line Feed')]":
  function LF() 
  {
    var screen = this._screen;
    screen.lineFeed();
  },
 
  /** Index.
   */
  "[profile('vt52'), sequence('0x84'), _('Index')]":
  function IND() 
  {
    var screen = this._screen;
    screen.lineFeed();
  },
 
  /** Vertical tabulation.
   */
  "[profile('vt52'), sequence('0x0B')]":
  function VT() 
  {
    var screen = this._screen;
    screen.lineFeed();
  },

  /** Form feed.
   */
  "[profile('vt52'), sequence('0x0C')]":
  function FF() 
  {
    var screen = this._screen;
    screen.lineFeed();
  },

  /** Carriage return.
   */
  "[profile('vt52'), sequence('0x0D')]":
  function CR() 
  { // Carriage Return
    var screen = this._screen;
    screen.carriageReturn();
  },
    
  /** Shift out.
   */
  "[profile('vt52'), sequence('0x0E')]":
  function SO() 
  { // shift out
    this.sendMessage("event/shift-out");
  },
  
  /** Shift in.
   */
  "[profile('vt52'), sequence('0x0F')]":
  function SI() 
  { // shift out
    this.sendMessage("event/shift-in");
  },

  /** Data link escape.
   */
  "[profile('vt52'), sequence('0x10')]":
  function DLE() 
  {
    coUtils.Debug.reportWarning(
      _("%s sequence [%s] was ignored."),
      "DLE", Array.slice(arguments));
  },
 
  /** Device control 1.
   */
  "[profile('vt52'), sequence('0x11')]":
  function DC1() 
  {
    this.sendMessage("command/flow-control", true);
  },
  
  /** Device control 2.
   */
  "[profile('vt52'), sequence('0x12')]":
  function DC2() 
  {
    coUtils.Debug.reportWarning(
      _("%s sequence [%s] was ignored."),
        "DC2", Array.slice(arguments));
  },

  /** Device control 3.
   */
  "[profile('vt52'), sequence('0x13')]":
  function DC3() 
  {
    this.sendMessage("command/flow-control", false);
  },
  
  /** Device control 4.
   */
  "[profile('vt52'), sequence('0x14')]":
  function DC4() 
  {
    coUtils.Debug.reportWarning(
      _("%s sequence [%s] was ignored."),
        "DC4", Array.slice(arguments));
  },
  
  /** Negative acknowledge.
   */
  "[profile('vt52'), sequence('0x15')]":
  function NAK() 
  {
    coUtils.Debug.reportWarning(
      _("%s sequence [%s] was ignored."),
        "NAK", Array.slice(arguments));
  },
  
  /** Synchronous idle.
   */
  "[profile('vt52'), sequence('0x16')]":
  function SYN() 
  {
    coUtils.Debug.reportWarning(
      _("%s sequence [%s] was ignored."),
        "SYN", Array.slice(arguments));
  },
  
  /** End of transmission block.
   */
  "[profile('vt52'), sequence('0x17')]":
  function ETB() 
  {
    coUtils.Debug.reportWarning(
      _("%s sequence [%s] was ignored."),
        "ETB", Array.slice(arguments));
  },
  
  /** Cancel of previous word or charactor.
   */
  "[profile('vt52'), sequence('0x18')]":
  function CAN() 
  {
    coUtils.Debug.reportWarning(
      _("%s sequence [%s] was ignored."),
        "CAN", Array.slice(arguments));
  },
  
  /** End of medium.
   */
  "[profile('vt52'), sequence('0x19')]":
  function EM() 
  {
    coUtils.Debug.reportWarning(
      _("%s sequence [%s] was ignored."),
        "EM", Array.slice(arguments));
  },
  
  /** Substitute.
   */
  "[profile('vt52'), sequence('0x1A')]":
  function SUB()
  {
    coUtils.Debug.reportWarning(
      _("%s sequence [%s] was ignored."),
        "SUB", Array.slice(arguments));
  },
  
  /** File separator.
   */
  "[profile('vt52'), sequence('0x1C')]":
  function FS() 
  {
    coUtils.Debug.reportWarning(
      _("%s sequence [%s] was ignored."),
        "FS", Array.slice(arguments));
  },
 
  /** Group separator.
   */
  "[profile('vt52'), sequence('0x1D')]":
  function GS() 
  {
    coUtils.Debug.reportWarning(
      _("%s sequence [%s] was ignored."),
        "GS", Array.slice(arguments));
  },
  
  /** Record separator.
   */
  "[profile('vt52'), sequence('0x1E')]":
  function RS() 
  {
    coUtils.Debug.reportWarning(
      _("%s sequence [%s] was ignored."),
        "RS", Array.slice(arguments));
  },
  
  /** Unit separator.
   */
  "[profile('vt52'), sequence('0x1F')]":
  function US() 
  {
    coUtils.Debug.reportWarning(
      _("%s sequence [%s] was ignored."),
        "US", Array.slice(arguments));
  },
  
  /** Delete.
   */
  "[profile('vt52'), sequence('0x7F', '0xFF')]":
  function DEL() 
  {
    var screen = this._screen;
    screen.backSpace();
  },

  "[profile('vt52'), sequence('ESC A')]":
  function CUP()
  {
    var screen = this._screen;
    screen.cursorUp(1);
  },

  "[profile('vt52'), sequence('ESC B')]":
  function BPH()
  {
    var screen = this._screen;
    screen.cursorDown(1);
  },

  "[profile('vt52'), sequence('ESC C')]":
  function NPH()
  {
    var screen = this._screen;
    screen.cursorForward(1);
  },

  "[profile('vt52'), sequence('ESC D')]":
  function IND()
  {
    var screen = this._screen;
    screen.cursorBackward(1);
  },

  "[profile('vt52'), sequence('ESC E')]":
  function NEL()
  {
    var screen = this._screen;
    screen.cursorDown();
    screen.carriageReturn();
  },

  "[profile('vt52'), sequence('ESC F'), _('Enter graphics mode.')]":
  function SSA()
  {
    this.sendMessage("sequence/g0", "0");
    this.sendMessage("event/shift-in");
  },

  "[profile('vt52'), sequence('ESC G'), _('Exit graphics mode.')]":
  function ESA()
  {
    this.sendMessage("sequence/g0", "B");
    this.sendMessage("event/shift-in"); 
  },

  /** Move the cursor to the home position.
   */
  "[profile('vt52'), sequence('ESC H')]":
  function HTS()
  {
    var cursor = this._cursor_state;

    cursor.positionX = 0;
    cursor.positionY = 0;
  },

  "[profile('vt52'), sequence('ESC I')]":
  function HTJ()
  {
    var screen = this._screen;
    screen.reverseIndex();
  },

  /** Erase from the cursor to the end of the screen
   */
  "[profile('vt52'), sequence('ESC J')]":
  function VTS()
  {
    var screen = this._screen;

    screen.eraseScreenBelow();
  },

  /** Erase from the cursor to the end of the line.
   */
  "[profile('vt52'), sequence('ESC K')]":
  function PLD()
  {
    var screen = this._screen;

    screen.eraseLineToRight();
  },

  "[profile('vt52'), sequence('ESC L')]":
  function PLU()
  {
    coUtils.Debug.reportWarning(
      _("PLU was not implemented."));
  },

  "[profile('vt52'), sequence('ESC Y PyPx')]":
  function ESC_Y(y, x)
  {
    var screen = this._screen;

    screen.setPositionY(y - 0x20);
    screen.setPositionX(x - 0x20);
    screen.cursor.positionY = y - 0x20;
    screen.cursor.positionX = x - 0x20;
  },

  "[profile('vt52'), sequence('ESC Z')]":
  function SCI()
  {
    this.sendMessage("command/send-to-tty", "\x1b/Z");
  },

  "[profile('vt52'), sequence('ESC =')]": 
  function () 
  {
    coUtils.Debug.reportWarning(
      _("EnterAlternativeKeypadMode was not implemented."));
  },

  "[profile('vt52'), sequence('ESC >')]": 
  function () 
  {
    coUtils.Debug.reportWarning(
      _("ExitAlternativeKeypadMode was not implemented."));
  },

  /** Exit VT52 mode. 
   * exit VT52 mode
   */
  "[profile('vt52'), sequence('ESC <')]": 
  function V5EX() 
  {
    this.sendMessage("command/change-emulation-mode", "vt100");
    coUtils.Debug.reportMessage("Exit VT52 mode.");
  },

  "[profile('vt100'), sequence('ESC <')]": 
  function V5EX_VT100() 
  {
  },

}; // VT52

/**
 * @fn main
 * @brief Module entry point.
 * @param {Broker} broker The Broker object.
 */
function main(broker) 
{
  new VT52(broker);
}

// EOF
