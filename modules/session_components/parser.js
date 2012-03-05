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
 * @class StringParser
 * @brief Parse string.
 */
let StringParser = new Class();
StringParser.definition = {

  _action: null, // semantic action

  /** constructor 
   *  @param {Function} action A semantic action.
   */
  initialize: function initialize(action) 
  {
    this._action = action;
  },

  /** Parse string parameter. 
   *  @param {Scanner} scanner A Scanner object.
   */
  parse: function parse(scanner, previous) 
  {
    let sequence = previous || [];
    for (let c in this._parseString(scanner)) {
      sequence.push(c);
    }
    if (scanner.isEnd) {
      return let (self = this) function(scanner) {
        let result = parse.apply(self, [scanner, sequence]);
        yield result;
      };
    }
    return this._action(sequence);
  },

  /* 
   *  StringTerminator ->   ( <0x07> | "<0x1b>\" | <LastCharacterOfStream> )
   *  StringCharacter  -> any 1byte characters without StringTerminator
   *  String           -> <StringCharacter>+  , <StringTerminator>
   */
  _parseString: function _parseString(scanner) 
  {
    while (!scanner.isEnd) {
      let c = scanner.current();
      if (0x1b == c) {
        scanner.moveNext();
        if (scanner.isEnd) {
          break;
        }
        let c = scanner.current();
        if (0x5c == c) {
          break;
        }
        yield 0x1b;
        yield c;
        scanner.moveNext();
      }
      if (0x07 == c) {
        break;
      }
      yield c;
      scanner.moveNext();
    }
  },
}

/**
 * @class ParameterParser
 * @brief Parse parameter. 
 */ 
let ParameterParser = new Class().extends(Array);
ParameterParser.definition = {

  /** constructor */
  initialize: function initialize(first)  
  {
    this._first = first;
  },

  /** Parse parameters and returns the correspond action.
   *  @param {Scanner} scanner A Scanner object.
   */
  parse: function parse(scanner) 
  {
    let params = [param for (param in this._parseParameters(scanner))];
    if (scanner.isEnd) {
      return undefined;
    }
    let c = scanner.current();
    let next = this[c];
    if (undefined === next) {
      return undefined;
    }
    if ("parse" in next) {
      let action = next.parse(scanner);
      return action && action(params);
    }
    return next(params);
  },

  /** Parse numeric parameters separated by semicolons ";". 
   *  @param {Scanner} scanner A Scanner object.
   *
   * Paramter -> ([0-9]+, ";")*, [0-9]+
   *
   */
  _parseParameters: function _parseParameters(scanner) 
  {
    let accumulator = this._first;
    while (!scanner.isEnd) {
      let c = scanner.current();
      if (0x30 <= c && c <= 0x39) { // [0-9]
        scanner.moveNext();
        accumulator = accumulator * 10 + c - 0x30;
      } else if (0x3b == c) { // ';'
        scanner.moveNext();
        yield accumulator;
        accumulator = 0;
      } else {
        yield accumulator;
        break;
      }
    }
  },
};

/**
 * @class SequenceParser
 */
let SequenceParser = new Class().extends(Array);
SequenceParser.definition = {

  /** Construct child parsers from definition and make parser-chain. */
  append: function append(key, value, context) 
  {
    let match = key.match(/^(0x[0-9a-zA-Z]+)$|^%d(.+)$|^(.)%s$|^(%c)|^(.)$|^(.)(.+)$/);
    let [, 
      number, char_with_param, 
      char_with_string, single_char, 
      normal_char, first, next_chars
    ] = match;
    if (number) { // parse number
      let code = parseInt(number);
      if ("parse" in value) {
        this[code] = value;
      } else {
        this[code] = function() value.apply(context);
      }
    } else if (char_with_param) {
      let action = function(params) function() value.apply(context, params);
      let accept_char = char_with_param.charCodeAt(0);
      for (let i = 0; i < 10; ++i) {
        let code = i + 0x30;
        this[code] = this[code] || new ParameterParser(i);
        if (1 == char_with_param.length) {
          this[code][accept_char] = action;
        } else {
          let next_chars = char_with_param.substr(1);
          this[code][accept_char] = {
            parse: function parse(scanner) {
              for (let i = 0; i < next_chars.length; ++i) {
                scanner.moveNext();
                let c = scanner.current();
                if (c != next_chars.charCodeAt(i)) {
                  return undefined;
                }
              }
              return action;
            }
          };
        }
      }
      this[accept_char] = function() value.call(context, 0);
    } else if (char_with_string) {
      // define action
      let action = function(params) function() value.apply(context, params)
      this[char_with_string.charCodeAt(0)] = new StringParser(action) // chain to string parser.
    } else if (single_char) { // parse a char.
      this[0x20] = this[0x20] || new SequenceParser();
      for (let code = 0x21; code < 0x7f; ++code) {
        this[0x20][code] = this[code] = let (c = String.fromCharCode(code)) function() value.call(context, c)
      }
    } else if (normal_char) {
      let code = normal_char.charCodeAt(0);
      if ("parse" in value) {
        this[code] = value;
      } else {
        this[code] = function() value.apply(context);
      }
    } else {
      let code = first.charCodeAt(0);
      let next = this[code] = this[code] || new SequenceParser;
      if (!next.append) {
        next = this[code] = new SequenceParser;
      }
      next.append(next_chars, value, context);
    }
  },

  /** Scan and get asocciated action. 
   *  @param {Scanner} scanner A Scanner object.
   */
  parse: function parse(scanner) 
  {
    let c = scanner.current();
    let next = this[c];
    if (next) { // c is part of control sequence.
      if ("parse" in next) { // next is parser.
        scanner.moveNext();
        return next.parse(scanner) 
      } else { 
        return next // next is action.
      }
    }
    return undefined;
  },

}

/**
 * @class Grammer
 */
let Grammer = new Class().extends(Component);
Grammer.definition = {

  get id()
    "grammer",

  /** post constructor. 
   *  @param {Session} session A Session object.
   */
  "[subscribe('@event/broker-started'), enabled]":
  function onLoad(session)
  {
    this.ESC = new SequenceParser();
    this.CSI = new SequenceParser();
    session.notify("command/add-sequence", {
      expression: "C0 0x1B", 
      handler: this.ESC,
      context: this,
    });
    session.notify("command/add-sequence", {
      expression: "ESC [", 
      handler: this.CSI,
      context: this,
    });
    let sequences = session.notify("get/sequences");
    sequences.forEach(function(information) {
      session.notify("command/add-sequence", information);
    }, this);
    session.notify("initialized/grammer", this);
  },

  /** Parse and returns asocciated action. 
   *  @param {Scanner} scanner A Scanner object.
   */
  parse: function parse(scanner) 
  {
    let action = this.C0.parse(scanner);
    return action;
  },

  /** Append a sequence handler.
   *  @param {Object} information A register information object that has 
   *                              "expression", "handler", and "context" key.
   */
  "[subscribe('command/add-sequence'), enabled]":
  function append(information) 
  {
    let {expression, handler, context} = information;
    let match = expression.split(/\s+/);
    let key = match.pop();
    let prefix = match.pop() || "C0";
    if ("number" == typeof key) {
      key = key.toString();
    }
    if (!this[prefix]) {
      this[prefix] = new SequenceParser();
    }
    this[prefix].append(key, handler, context);
  },

};

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
  "[subscribe('@event/broker-started'), enabled]":
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

  rollback: function rollback()
  {
    this._position = this._anchor;
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
    this.onDataArrivedRecursively.enabled = true;
    session.notify("initialized/parser", this);
  },

  /** uninstalls itself. 
   *  @param {Session} session A session object.
   */
  uninstall: function uninstall(session)
  {
    this.drive.enabled = false;
    this.onDataArrivedRecursively.enabled = false;
  },

  "[subscribe('command/enable-default-parser'), enabled]": 
  function enableDefaultParser()
  {
    this.drive.enabled = true;
  },

  "[subscribe('command/disable-default-parser'), enabled]": 
  function disableDefaultParser()
  {
    this.drive.enabled = false;
  },

  /** Parse and evaluate control codes and text pieces from the scanner. 
   *  @param {String} data incoming data in text format.
   */
  "[subscribe('event/data-arrived')]": 
  function drive(data)
  {
    let scanner = this._scanner;
    scanner.assign(data);
    for (let action in this.parse(scanner, data)) {
      action();
    }
//    [action for (action in this.parse(scanner, data))].forEach(function(action) action());
    let session = this._broker;
    session.notify("command/draw"); // fire "draw" event.
  },

  /** Parse and evaluate control codes and text pieces from the scanner. 
   *  @param {String} data incoming data in text format.
   */
  "[subscribe('event/data-arrived-recursively')]": 
  function onDataArrivedRecursively(data)
  {
    let broker = this._broker;
    let scanner = new Scanner(broker);
    scanner.assign(data);
    for (let action in this.parse(scanner, data)) {
      action();
    }
    broker.notify("command/draw"); // fire "draw" event.
  },

  /** Parse control codes and text pieces from the scanner. 
   *  @param {String} data incoming data in text format.
   */
  parse: function parse(scanner, data)
  {
    let broker = this._broker;
    let emurator = this._emurator;
    let decoder = this._decoder;
    let grammer = this._grammer;
    if (scanner.generator) {
      let result = scanner.generator(scanner);
      if (result) {
        let next = result.next();
        if (next.isGenerator()) {
          scanner.generator = next;
        } else {
          scanner.generator = null;
          yield next;
          scanner.moveNext();
        }
      }
    }
    while (!scanner.isEnd) {
      scanner.setAnchor(); // memorize current position.
      let action = grammer.parse(scanner);
      if (action) {
        if (action.isGenerator()) {
          scanner.generator = action;
        } else {
          yield action;
          scanner.moveNext();
        }
      } else if (!scanner.isEnd) {
        let generator = function() {
          for (let c in decoder.decode(scanner)) {
            if (c >= 0x1100 && coUtils.Unicode.doubleWidthTest(c)) {
              yield 0;
            }
            yield c;
          }
        };
        let codes = [c for (c in generator())];
        if (codes && codes.length) {
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
      let match = coUtils.Unicode
        .detectCategory(String.fromCharCode(c));
      if (match) {
        let [is_non_spacing_mark, is_spacing_combining_mark] = match;  
        if (is_non_spacing_mark || is_spacing_combining_mark) {
          continue;
        }
      }
      let is_wide = coUtils.Unicode.doubleWidthTest(c);
      if (is_wide) {
        yield 0;
      }
      yield c;
    }
  },

}

/**
 * @fn main
 * @brief Module entry point.
 * @param {Broker} broker The Broker object.
 */
function main(broker) 
{
  new Parser(broker);
  new Scanner(broker);
  new Grammer(broker);
}

