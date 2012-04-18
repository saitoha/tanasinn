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
let GrammarConcept = new Concept();
GrammarConcept.definition = {

  get id()
    "GrammarConcept",

  // message concept
  "<command/add-sequence> :: SequenceInfo -> Undefined":
  _('Append a sequence handler and (re-)construct a FSM object.'),

  // signature concept
  "parse :: Scanner -> Action":
  _('Receives a scanner object, get input sequence and parse it with the FSM.'),

}; // GrammarConcept


/**
 * @concept ScannerConcept
 */
let ScannerConcept = new Concept();
ScannerConcept.definition = {

  get id()
    "ScannerConcept",

  // signature concept
  "assign :: String -> Undefined":
  _("Assign new string data. position is reset."),

  "current :: Uint16":
  _("Returns a code point at current scanning position."),

  "moveNext :: Undefined":
  _("Moves to next position."),

  "setAnchor :: Undefined":
  _("Momorize current position."),

  "setSurplus :: Undefined":
  _("Momorize surplus chars."),

  "getCurrentToken :: String":
  _("Returns chars from the momorized position to current position."),

}; // ScannerConcept


//////////////////////////////////////////////////////////////////////////////
//
// implementation
//


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
      if (0x1b == c) {    // '\e'
        scanner.moveNext();
        if (scanner.isEnd) {
          break;
        }
        let c = scanner.current();
//        if (0x5c == c) { // '\
//          break;
//        }
        if (0x5d != c && 0x0d != c && 0xdd != c) {
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
 * handle control characters in C0 area.
 *
 */
let C0Parser = {

  _map: [],

  append: function append(key, value)
  {
    this._map[key] = value;
  },

  get: function get(key)
  {
    return this._map[key];
  },

  parse: function parse(scanner) 
  {
    if (scanner.isEnd) {
      return undefined;
    }
    let c = scanner.current();
    let action = this._map[c];
    if (undefined === action) {
      return undefined;
    }
    if ("parse" in action) {
      scanner.moveNext();
      return action.parse(scanner);
    }
    return action;
  },

}; // C0Parser

/**
 * @class ParameterParser
 * @brief Parse parameter. 
 */ 
let ParameterParser = new Class().extends(Array);
ParameterParser.definition = {

  _default_action: null,
  _c0action: null,

  /** constructor */
  initialize: function initialize(first, c)
  {
    this._first = first;
    this._c0action = [];

    if (2 == arguments.length) {
      this._default_action = c;
    }
  },

  /** Parse parameters and returns the correspond action.
   *  @param {Scanner} scanner A Scanner object.
   */
  parse: function parse(scanner) 
  {
    let params = [param for (param in this._parseParameters(scanner))];
    let c;
    do {
      if (scanner.isEnd) {
        //return let (self = this) function(scanner) {
        //  let result = parse.apply(self, scanner);
        //  yield result;
        //};
        return undefined;
      }
      c = scanner.current();
      if (c < 0x20 || 0x7f == c) {
        let action = C0Parser.get(c);
        if (undefined !== action) {
          this._c0action.push(action);
        }
        scanner.moveNext(); 
        continue;
      }
      break;
    } while (true);

    let next = this[c];
    let action;
    if (undefined === next) {
    } else if (next.hasOwnProperty("parse")) {
      let meta_action = next.parse(scanner);
      if (meta_action) {
        action = meta_action(params);
      }
    } else {
      action = next(params);
    }
    let default_action = this._default_action;
    if (0 == this._c0action.length && null === default_action) {
      return action;
    } 
    let actions = this._c0action;
    actions.push(action);

    this._c0action = [];
    return function() {
      if (default_action) {
        let action = C0Parser.get(default_action);
        if (undefined !== action) {
          action();
        }
      }
      for (let i = 0; i < actions.length; ++i) {
        let action = actions[i];
        if (action) {
          try {
            action();
          } catch(e) {
            alert("["+action+"]")
          }
        }
      }
    };
  }, // parse

  /** Parse numeric parameters separated by semicolons ";". 
   *  @param {Scanner} scanner A Scanner object.
   *
   * Paramter -> ([0-9]+, ";")*, [0-9]+
   *
   */
  _parseParameters: 
  function _parseParameters(scanner) 
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
      } else if (c < 0x20 || 0x7f == c) {
        yield accumulator;
        let action = C0Parser.get(c);
        if (undefined !== action) {
          this._c0action.push(action);
        }
        scanner.moveNext();
      } else {
        yield accumulator;
        break;
      }
    }
  }, // _parseParameters
};

/**
 * @class ParameterParserStartingWithSemicolon
 */
let ParameterParserStartingWithSemicolon = new Class().extends(ParameterParser);
ParameterParserStartingWithSemicolon.definition = {

  /** Parse numeric parameters separated by semicolons ";". 
   *  @param {Scanner} scanner A Scanner object.
   *
   * Paramter -> ([0-9]+, ";")*, [0-9]+
   *
   */
  _parseParameters: 
  function _parseParameters(scanner) 
  {
    yield 0;
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
      } else if (c < 0x20 || 0x7f == c) {
        yield accumulator;
        let action = C0Parser.get(c);
        if (undefined !== action) {
          this._c0action.push(action);
        }
        scanner.moveNext();
      } else {
        yield accumulator;
        break;
      }
    }
  }, // _parseParameters

}; // class ParameterParserStartingWithSemicolon

/**
 * @class SequenceParser
 */
let SequenceParser = new Class().extends(Array);
SequenceParser.definition = {

  /** Construct child parsers from definition and make parser-chain. */
  append: function append(key, value, context) 
  {
    let match = key
      .match(/^(0x[0-9a-zA-Z]+)|^%d(.+)$|^(.)%s$|^(%p)$|^(%c)$|^(.)$|^(.)(.+)$/);

    let [, 
      number, 
      char_with_param, 
      char_with_string, 
      char_position,
      single_char, 
      normal_char, first, next_chars
    ] = match;
    if (number) { // parse number
      let code = parseInt(number);
      if ("parse" in value) {
        C0Parser.append(code, value);
      } else {
        C0Parser.append(code, function() 
        {
          return value.apply(context);
        });
      }
    } else if (char_with_param) {
      let action = function(params) function() value.apply(context, params);
      let accept_char = char_with_param.charCodeAt(0);

      let codes = [
        0x00, 0x01, 0x02, 0x03, 0x04, 0x05, 0x06, 0x07, 
        0x08, 0x09, 0x0a, 0x0b, 0x0c, 0x0d, 0x0e, 0x0f,
        0x30, 0x31, 0x32, 0x33, 0x34, 0x35, 0x36, 0x37, 0x38, 0x39,
        0x7f,
        0x3b
      ];
      for (let i = 0; i < codes.length; ++i) {
        let code = codes[i];
        if (0x30 <= code && code < 0x3a) {
          this[code] = this[code] || new ParameterParser(code - 0x30);
        } else if (0x3b == code) {
          this[code] = this[code] || new ParameterParserStartingWithSemicolon(0);
        } else {
          this[code] = this[code] || new ParameterParser(0, code);
        }
        if (1 == char_with_param.length) {
          this[code][accept_char] = action;
        } else {
          let next_chars = char_with_param.substr(1);
          this[code][accept_char] = {

            parse: function parse(scanner) 
            {
              for (let i = 0; i < next_chars.length; ++i) {
                scanner.moveNext();
                if (scanner.isEnd) {
                  return let (self = this) function(scanner) {
                    let result = parse.apply(self, scanner);
                    yield result;
                  };
                }
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
      let index = char_with_string.charCodeAt(0);
      this[index] = new StringParser(action) // chain to string parser.
    } else if (single_char) { // parse a char.
      this[0x20] = this[0x20] || new SequenceParser();
      for (let code = 0x21; code < 0x7f; ++code) {
        let c = String.fromCharCode(code);
        this[0x20][code] = this[code] = function() value.call(context, c)
      }
    } else if (char_position) { // 
      for (let code1 = 0x21; code1 < 0x7f; ++code1) {
        let c1 = String.fromCharCode(code1);
        for (let code2 = 0x21; code2 < 0x7f; ++code2) {
          let c2 = String.fromCharCode(code2);
          this[code1] = new SequenceParser();
          this[code1][code2] = function() value.apply(context, [code1, code2])
        }
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
  }, // append

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
        return next.parse(scanner);
      } else { 
        return next // next is action.
      }
    } else {
      return undefined;
    }
  }, // parse

}; // class SequenceParser

/**
 * @class VT100Grammar
 *
 *
 */
let VT100Grammar = new Class().extends(Component)
                              .requires("GrammarConcept");
VT100Grammar.definition = {

  get id()
    "vt100",

  /** post constructor. 
   *  @param {Broker} broker A Broker object.
   */
  "[subscribe('@event/broker-started'), enabled]":
  function onLoad(broker)
  {
    this.ESC = new SequenceParser();
    this.CSI = new SequenceParser();
    SequenceParser.prototype[0x1b] = this.ESC;
    broker.notify("command/add-sequence", {
      expression: "0x1B", 
      handler: this.ESC,
      context: this,
    });
    broker.notify("command/add-sequence", {
      expression: "ESC [", 
      handler: this.CSI,
      context: this,
    });
    let sequences = broker.notify("get/sequences/vt100");
    for (let i = 0; i < sequences.length; ++i) {
      broker.notify("command/add-sequence", sequences[i]);
    }
    broker.notify("initialized/grammar", this);
  },

  "[subscribe('get/grammars'), enabled]":
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
    let action = C0Parser.parse(scanner);
    return action;
  },

  /** Append a sequence handler.
   *  @param {Object} information A register information object that has 
   *                              "expression", "handler", and "context" key.
   *
   *  @implements Grammar.<command/add-sequence> :: SequenceInfo -> Undefined
   */
  "[subscribe('command/add-sequence'), type('SequenceInfo -> Undefined'), enabled]":
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
  }, // append

}; // VT100Grammar

/** 
 * @class Scanner
 * @brief Character scanner for UTF-8 characters sequence.
 */ 
let Scanner = new Class().extends(Component).requires("ScannerConcept");
Scanner.definition = {

  get id()
    "scanner",

  _value: null,
  _position: 0,
  _anchor: 0,
  _nextvalue: null,

  /** Constructor **/
  "[subscribe('@event/broker-started'), enabled]":
  function onLoad(broker) 
  {
    broker.notify("initialized/scanner", this);
  },

  /** Assign new string data. position is reset. */
  "[type('String -> Undefined')] assign":
  function assign(value) 
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
  "[type('Uint16')] current":
  function current() 
  {
    let code = this._value.charCodeAt(this._position);
    return code;
  },

  /** Moves to next position. */
  "[type('Undefined')] moveNext":
  function moveNext() 
  {
    ++this._position;
    if (this.isEnd) {
      if (this._hasNextValue()) {
        this._switchToNextValue();
      }
    }
  },

  /** Returns whether scanner position is at end. */
  get isEnd() 
  {
    return this._position >= this._value.length;
  },

  "[type('Undefined')] setAnchor":
  function setAnchor() 
  {
    this._anchor = this._position;
  },

  "[type('Undefined')] setSurplus":
  function setSurplus() 
  {
    this._nextvalue = this._value.substr(this._anchor);
  },

  "[type('String')] getCurrentToken":
  function getCurrentToken() 
  {
    return this._value.slice(this._anchor, this._position + 1);
  },

  drain: function drain()
  {
    let value = this._value.substr(this._position + 1);
    this._value = "";
    this._position = 0;
    this._anchor = 0;
    this._anchor = 0;
    this._nextvalue = null;
    return value;
  },

  _hasNextValue: function _hasNextValue() 
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

  _grammar: null,
  _emurator: null,
  _decoder: null,
  _scanner: null,

  "[persistable] initial_grammar": "vt100",

// post-constructor
  "[subscribe('initialized/{scanner & emurator & decoder & drcs_converter}'), enabled]":
  function onLoad(scanner, emurator, decoder, drcs_converter)
  {
    this._scanner = scanner;    
    this._emurator = emurator;
    this._decoder = decoder;
    this._drcs_converter = drcs_converter;

    this.install(this._broker);
  },

  /** installs itself. 
   *  @param {Broker} broker A Broker object.
   */
  install: function install(broker)
  {
    this.drive.enabled = true;
    this.onDataArrivedRecursively.enabled = true;

    this._grammars = {};
    let grammars = broker.notify("get/grammars");
    for (let i = 0; i < grammars.length; ++i) {
      let grammar = grammars[i];
      this._grammars[grammar.id] = grammar;
    }
    this._grammar = this._grammars[this.initial_grammar];

    broker.notify("initialized/parser", this);
  },

  /** uninstalls itself. 
   *  @param {Broker} broker A Broker object.
   */
  uninstall: function uninstall(broker)
  {
    this.drive.enabled = false;
    this.onDataArrivedRecursively.enabled = false;
  },

  "[subscribe('command/change-mode'), enabled]":
  function onChangeMode(mode)
  {
    let grammars = this._grammars;
    if (grammars.hasOwnProperty(mode)) {
      this._grammar = grammars[mode];
      let value = this._scanner.drain();
      this._scanner.generator = null;
      this.drive(value);
    } else {
      coUtils.Debug.reportError(
        _("Specified mode '%s' was not found."), mode);
    }
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
    let broker = this._broker;
    let scanner = this._scanner;

//    coUtils.Timer.setTimeout(function(){
    scanner.assign(data);
    for (let action in this.parse(scanner, data)) {
      action();
    }
    broker.notify("command/draw"); // fire "draw" event.
//    }, 10, this);
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
    let grammar = this._grammar;
    let drcs_converter = this._drcs_converter;

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

      let action = grammar.parse(scanner);
      if (action) {
        if (action.isGenerator()) {
          scanner.generator = action;
        } else {
          yield action;
          scanner.moveNext();
        }
      } else if (!scanner.isEnd) {
 
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
        let codes = [];
        for (let c in decoder.decode(scanner)) {
          let character = String.fromCharCode(c);
          //let match = coUtils.Unicode
          //  .detectCategory(character);
          //if (match) {
          //  let [, is_spacing_combining_mark] = match;  
          //  if (is_spacing_combining_mark) {
          //    continue;
          //  }
          //}
          if (c >= 0x1100 && coUtils.Unicode.doubleWidthTest(character)) {
            codes.push(0);
          }
          codes.push(c);
        }

//        let codes = decoder.decode(scanner);
        if (codes.length) {
          yield function () 
          {
            let converted_codes = drcs_converter.convert(codes);
            emurator.write(converted_codes);
          };
        } else {
          continue;
          let c1 = scanner.current();
          alert(c1)
          coUtils.Debug.reportError(
            _("Failed to decode text. text length: %d, source text: [%s]."), 
            data.length, c1);
          //if (scanner.isEnd) {
            break;
          //}
          //scanner.moveNext();
        }
      } else { // scanner.isEnd
        scanner.setSurplus(); // backup surplus (unparsed) sequence.
      }
    }

  },
  /*
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
  */

}; // Grammar

/**
 * @fn main
 * @brief Module entry point.
 * @param {Broker} broker The Broker object.
 */
function main(broker) 
{
  new Parser(broker);
  new Scanner(broker);
  new VT100Grammar(broker);
}

