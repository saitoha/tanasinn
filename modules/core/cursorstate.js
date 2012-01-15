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
  DECOM: false,

  // Using this flag insted of emurator._decMode.TCEM.
  visibility: true,

  blink: false,

  _backup_instance: null,

  /** constructor */
  "[subscribe('@initialized/linegenerator'), enabled]":
  function construct(line_generator) 
  {
    this.attr = line_generator.allocate(1, 1).shift().cells.shift();
    let session = this._broker;
    session.notify("initialized/" + this.id, this);
  },

  /** reset cursor state. */
  reset: function reset() 
  {
    this.positionX = 0;
    this.positionY = 0;
    this._backup_instance = null;
    this.blink = false;
    this.attr.clear(); // turns all character attributes off (normal settings).
  },

  /** backup current cursor state. */
  backup: function backup() 
  {
    let backup = new this.constructor;
    backup.positionX = this.positionX;
    backup.positionY = this.positionY;
    backup.visibility = this.visibility;
    backup.blink = this.blink;
    this._backup_instance = backup;
  },

  /** restore cursor state from the backup instance. */
  restore: function restore() 
  {
    let backup = this._backup_instance;
    if (backup === null) {
      coUtils.Debug.reportWarning(
        _('Cursor backup instance not found. We create new instance and use it.'));
      this._backup_instance = backup = new this.constructor;
    }
    this.positionX = backup.positionX;
    this.positionY = backup.positionY;
    this.visibility = backup.visibility;
    this.blink = backup.blink;
  },

  serialize: function serialize(context)
  {
    context.push(this.positionX);
    context.push(this.positionY);
    context.push(this.visibility);
    context.push(this.blink);
    context.push(null !== this._backup_instance);
    let backup = this._backup_instance;
    if (backup) {
      context.push(backup.positionX);
      context.push(backup.positionY);
      context.push(backup.visibility);
      context.push(backup.blink);
    }
  },

  deserialize: function deserialize(context)
  {
    this.positionX = context.shift();
    this.positionY = context.shift();
    this.visibility = context.shift();
    this.blink = context.shift();
    let backup_exists = context.shift();
    if (backup_exists) {
      let backup = this._backup_instance = new this.constructor;
      backup.positionX = context.shift();
      backup.positionY = context.shift();
      backup.visibility = context.shift();
      backup.blink = context.shift();
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
   *   - TODO: Character attributes set by the SGR command
   *   - Character sets (G0, G1, G2, or G3) currently in GL and GR
   *   - TODO: Wrap flag (autowrap or no autowrap)
   *   - TODO: State of origin mode (DECOM)
   *   - TODO: Selective erase attribute
   *   - TODO: Any single shift 2 (SS2) or single shift 3 (SS3) functions sent
   */
  "[sequence('ESC 7')] DECSC": 
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
   *   - TODO: Resets origin mode (DECOM).
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
  "[sequence('ESC 8')] DECRC": 
  function DECRC() 
  {
    this.restore();
  },

  "[sequence('CSI %dm')]":
  function SGR(n) 
  { // character attributes
    // -- xterm-256color --
    //  setab=\E[%?%p1%{8}%<%t4%p1%d%e%p1%{16}%<%t10%p1%{8}%-%d%e48;5;%p1%d%;m,
    //  setaf=\E[%?%p1%{8}%<%t3%p1%d%e%p1%{16}%<%t9%p1%{8}%-%d%e38;5;%p1%d%;m,
    //  sgr=%?%p9%t\E(0%e\E(B%;\E[0%?%p6%t;1%;%?%p2%t;4%;%?%p1%p3%|%t;7%;%?%p4%t;5%;%?%p7%t;8%;m,
    //
    let attr = this.attr;
    if (0 == arguments.length) {
      attr.clear()
    } else {
      for (let i = 0; i < arguments.length; ++i) {
        let p = arguments[i];
            0    == p ? attr.clear()
          : 1    == p ? attr.bold = true
          : 2    == p ? attr.halfbright = true // TODO: halfbright
          //: 3    == p ? undefined
          : 4    == p ? attr.underline = true
          : 5    == p ? attr.blink = true // TODO: slow blink
          : 6    == p ? attr.blink = true // TODO: rapid blink
          : 7    == p ? attr.inverse = true
          : 8    == p ? undefined // TODO: SGR invisible
//          : 10   == p ? this.SI() // shift in
//          : 11   == p ? this.SO() // shift out
          : 21   == p ? attr.bold = false
          : 22   == p ? attr.halfbright = false
          //: 2  3 == p ? undefined
          : 24   == p ? attr.underline = false
          : 25   == p ? attr.blink = false
          : 27   == p ? attr.inverse = false // SGR positive (not inverse)
          : 30   == p ? attr.fg = 0
          : 31   == p ? attr.fg = 1
          : 32   == p ? attr.fg = 2
          : 33   == p ? attr.fg = 3
          : 34   == p ? attr.fg = 4
          : 35   == p ? attr.fg = 5
          : 36   == p ? attr.fg = 6
          : 37   == p ? attr.fg = 7
          : 38   == p ? arguments[++i] == 5 && (attr.fg = arguments[++i])
          : 39   == p ? [attr.fg, attr.bold] = [7, false] // SGR default fg.
          : 40   == p ? attr.bg = 0
          : 41   == p ? attr.bg = 1
          : 42   == p ? attr.bg = 2
          : 43   == p ? attr.bg = 3
          : 44   == p ? attr.bg = 4
          : 45   == p ? attr.bg = 5
          : 46   == p ? attr.bg = 6
          : 47   == p ? attr.bg = 7
          : 48   == p ? arguments[++i] == 5 && (attr.bg = arguments[++i])
          : 49   == p ? attr.bg = 0 // SGR default bg.
          : 90   == p ? attr.fg = 8
          : 91   == p ? attr.fg = 9
          : 92   == p ? attr.fg = 10
          : 93   == p ? attr.fg = 11
          : 94   == p ? attr.fg = 12
          : 95   == p ? attr.fg = 13
          : 96   == p ? attr.fg = 14
          : 97   == p ? attr.fg = 15
          : 100  == p ? attr.bg = 8
          : 101  == p ? attr.bg = 9
          : 102  == p ? attr.bg = 10
          : 103  == p ? attr.bg = 11
          : 104  == p ? attr.bg = 12
          : 105  == p ? attr.bg = 13
          : 106  == p ? attr.bg = 14
          : 107  == p ? attr.bg = 15
          : coUtils.Debug.reportWarning(
            _("Ignored SGR %s, arguments: [%s]"), 
            p, [n for each (n in arguments)]);
      }
    }
  },

};

/**
 * @fn main
 * @brief Module entry point.
 * @param {Desktop} desktop The Desktop object.
 */
function main(desktop) 
{
  desktop.subscribe(
    "@initialized/broker", 
    function(session) new CursorState(session));
}


