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
 * @class Scanner
 * @brief Character scanner for UTF-8 characters sequence.
 */ 
let Scanner = new Class().extends(Component);
Scanner.definition = {

  get id()
    "scanner",

  _value: null,
  _position: 0,
  _anchor: 0,
  _nextvalue: null,

  /** Constructor **/
  "[subscribe('event/session-started'), enabled]":
  function onLoad(session) 
  {
    session.notify("initialized/scanner", this);
  },

  /** Assign new string data. position is reset. */
  assign: function assign(value) 
  { // re-assign new value.
    if (this._nextvalue) {
      this._value = this._nextvalue;  // TODO: performance improvment.
      this._nextvalue = value;
    } else {
      this._value = value;
    }
    this._position = 0;
  },

  /** Returns single byte code point. */
  current: function current() 
  {
    return this._value.charCodeAt(this._position);
  },

  /** Moves to next position. */
  moveNext: function moveNext() 
  {
    ++this._position;
    if (this.isEnd) {
      if (this.hasNextValue()) {
        this._switchToNextValue();
      }
    }
  },

  /** Returns whether scanner position is at end. */
  get isEnd() 
  {
    return this._position >= this._value.length;
  },

  setAnchor: function setAnchor() 
  {
    this._anchor = this._position;
  },

  setSurplus: function setSurplus() 
  {
    this._nextvalue = this._value.substr(this._anchor);
  },

  getCurrentToken: function getCurrentToken() 
  {
    return this._value.slice(this._anchor, this._position + 1);
  },

  hasNextValue: function hasNextValue() 
  {
    return null !== this._nextvalue;
  },

  _switchToNextValue: function _switchToNextValue() 
  {
    this._value = this._nextvalue;
    this._nextvalue = null;
    this._position = 0;
  },
}

/**
 * @class Parser
 * @brief Parse byte sequence emitted by TTY device.
 */
let Parser = new Class().extends(Component);
Parser.definition = {

  get id()
    "parser",

  _grammer: null,
  _emurator: null,
  _decoder: null,
  _scanner: null,

// post-constructor
  "[subscribe('initialized/{scanner & grammer & emurator & decoder}'), enabled]":
  function onLoad(scanner, grammer, emurator, decoder)
  {
    this._scanner = scanner;    
    this._grammer = grammer;
    this._emurator = emurator;
    this._decoder = decoder;

    this.install(this._broker);
  },

  /** installs itself. 
   *  @param {Session} session A session object.
   */
  install: function install(session)
  {
    this.drive.enabled = true;
    session.notify("initialized/parser", this);
  },

  /** uninstalls itself. 
   *  @param {Session} session A session object.
   */
  uninstall: function uninstall(session)
  {
    this.drive.enabled = false;
  },

  /** Parse and evaluate control codes and text pieces from the scanner. 
   *  @param {String} data incoming data in text format.
   */
  "[subscribe('event/data-arrived')]": 
  function drive(data)
  {
    for (let action in this.parse(data)) {
      action();
    }
    let session = this._broker;
    session.notify("command/draw"); // fire "draw" event.
  },

  /** Parse control codes and text pieces from the scanner. 
   *  @param {String} data incoming data in text format.
   */
  parse: function parse(data)
  {
    let scanner = this._scanner;
    let emurator = this._emurator;
    let decoder = this._decoder;
    let grammer = this._grammer;
    scanner.assign(data);
    while (!scanner.isEnd) {
      scanner.setAnchor(); // memorize current position.
      let action = grammer.parse(scanner);
      if (action) {
        yield action;
        scanner.moveNext();
      } else if (!scanner.isEnd) {
        let codes = decoder.decode(scanner);
        if (codes && codes.length) {
          codes = [c for (c in this._padWideCharacter(codes))];
          yield function() emurator.write(codes);
        } else {
          break;
          //throw coUtils.Debug.Exception(
          //  _("Failed to decode text. text length: %d, source text: [%s]."), 
          //  data.length, scanner._nextvalue);
        }
      } else { // scanner.isEnd
        scanner.setSurplus(); // backup surplus (unparsed) sequence.
      }
    }
  },

  /** Pads NULL characters before each of wide characters.
   *
   *  example:
   *
   *  +--------+--------+--------+--------+--------+--------+-
   *  | 0x0041 | 0x0042 | 0x0043 | 0x3042 | 0x0044 | 0x3044 |  
   *  +--------+--------+--------+--------+--------+--------+-
   *                        ^                          ^
   *                       wide                       wide
   *
   *  Above character sequence will to be converted as follows.
   *
   *  +--------+--------+--------+--------+--------+--------+--------+--------+-
   *  | 0x0041 | 0x0042 | 0x0043 | 0x0000 | 0x3042 | 0x0044 | 0x0000 | 0x3044 |  
   *  +--------+--------+--------+--------+--------+--------+--------+--------+-
   *                                 ^                          ^
   *                              inserted                   inserted
   */
  _padWideCharacter: function _padWideCharacter(codes)
  {
    for (let [, c] in Iterator(codes)) {
      let is_wide = coUtils.Unicode.doubleWidthTest(c);
      if (is_wide)
        yield 0;
      yield c;
    }
  },

}

/**
 * @fn main
 * @brief Module entry point.
 * @param {Desktop} desktop The Desktop object.
 */
function main(desktop) 
{
  desktop.subscribe(
    "@initialized/broker", 
    function (session) {
      new Parser(session);
      new Scanner(session);
    });
}

