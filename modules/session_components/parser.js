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
var GrammarConcept = new Concept();
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
var ScannerConcept = new Concept();
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
var StringParser = new Class();
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
    var sequence = previous || [];
    var c;
    var self = this;

    for (c in this._parseString(scanner)) {
      sequence.push(c);
    }
    if (scanner.isEnd) {
      return function(scanner) 
      {
        var result = parse.apply(self, [scanner, sequence]);
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
    var c;

    while (!scanner.isEnd) {
      c = scanner.current();
      if (0x1b === c) {    // '\e'
        scanner.moveNext();
        if (scanner.isEnd) {
          break;
        }
        c = scanner.current();
        if (0x5d !== c && 0x0d !== c && 0xdd !== c) {
          break;
        }
        yield 0x1b;
        yield c;
        scanner.moveNext();
      }
      if (0x07 === c) {
        break;
      }
      yield c;
      scanner.moveNext();
    }
  },
}

function null_function()
{
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
    var c;
    var action;

    if (scanner.isEnd) {
      return undefined;
    }
    c = scanner.current();
    action = this._map[c];
    if (undefined === action) {
      return undefined;
    }
    if ("parse" in action) {
      scanner.moveNext();
      action = action.parse(scanner);
      if (undefined === action && !scanner.isEnd) {
        return null_function;
      }
      return action;
    }
    return action;
  },

}; // C0Parser

/**
 * @class ParameterParser
 * @brief Parse parameter. 
 */ 
var ParameterParser = new Class().extends(Array);
ParameterParser.definition = {

  _default_action: null,
  _c0action: null,

  /** constructor */
  initialize: function initialize(first, c)
  {
    this._first = first;
    this._c0action = [];

    if (2 === arguments.length) {
      this._default_action = c;
    }
  },

  /** Parse parameters and returns the correspond action.
   *  @param {Scanner} scanner A Scanner object.
   */
  parse: function parse(scanner) 
  {
    var params = [param for (param in this._parseParameters(scanner))];
    var c;
    var action;
    var meta_action;
    var default_action;
    var actions;
    var next;

    do {
      if (scanner.isEnd) {
        return undefined;
      }
      c = scanner.current();
      if (c < 0x20 || 0x7f === c) {
        action = C0Parser.get(c);
        if (undefined !== action) {
          this._c0action.push(action);
        }
        scanner.moveNext(); 
        continue;
      }
      break;
    } while (true);

    next = this[c];
    if (undefined === next) {
    } else if ("parse" in next) {
      scanner.moveNext();
      c = scanner.current();
      meta_action = next[c];
      if (meta_action) {
        action = meta_action(params);
      }
    } else {
      action = next(params);
    }
    default_action = this._default_action;
    if (0 === this._c0action.length && null === default_action) {
      return action;
    } 
    actions = this._c0action;
    actions.push(action);

    this._c0action = [];

    return function() {
      var i;
      var action;

      if (default_action) {
        action = C0Parser.get(default_action);
        if (undefined !== action) {
          action();
        }
      }
      for (i = 0; i < actions.length; ++i) {
        action = actions[i];
        if (action) {
          try {
            action();
          } catch(e) {
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
    var accumulator = this._first;
    var c;
    var action;

    while (!scanner.isEnd) {
      c = scanner.current();
      if (0x30 <= c && c <= 0x39) { // [0-9]
        scanner.moveNext();
        accumulator = accumulator * 10 + c - 0x30;
      } else if (0x3b === c) { // ';'
        scanner.moveNext();
        yield accumulator;
        accumulator = 0;
      } else if (c < 0x20 || 0x7f === c) {
        yield accumulator;
        action = C0Parser.get(c);
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
var ParameterParserStartingWithSemicolon = new Class().extends(ParameterParser);
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
    var accumulator;
    var c;
    var action;

    yield 0;

    accumulator = this._first;
    while (!scanner.isEnd) {
      c = scanner.current();
      if (0x30 <= c && c <= 0x39) { // [0-9]
        scanner.moveNext();
        accumulator = accumulator * 10 + c - 0x30;
      } else if (0x3b === c) { // ';'
        scanner.moveNext();
        yield accumulator;
        accumulator = 0;
      } else if (c < 0x20 || 0x7f === c) {
        yield accumulator;
        action = C0Parser.get(c);
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
var SequenceParser = new Class().extends(Array);
SequenceParser.definition = {

  /** Construct child parsers from definition and make parser-chain. */
  append: function append(key, value, context) 
  {
    let match = key
      .match(/^(0x[0-9a-zA-Z]+)(%s)?$|^%d([\x20-\x7f]+)$|^%<Ps>([\x20-\x7f]+)$|^(.)%s$|^(%p)$|^(%c)$|^(.)$|^(.)(.+)$/);
    let [, 
      number, number2,
      char_with_param, 
      char_with_single_param,
      char_with_string, 
      char_position,
      single_char, 
      normal_char, first, next_chars
    ] = match;
    if (number) { // parse number
      let code = parseInt(number, 16);
      if (number2) {

        let action = function(params) 
        {
          var data = coUtils.Text.safeConvertFromArray(params);
          return function() 
          {
            return value.call(context, data);
          };
        };

        C0Parser.append(code, new StringParser(action));

      } else {
        if ("parse" in value) {
          C0Parser.append(code, value);
        } else {
          C0Parser.append(code, function() 
          {
            return value.apply(context);
          });
        }
      }
    } else if (char_with_param) {

      let action = function(params) 
      {
        return function() 
        {
          return value.apply(context, params);
        };
      };
      let accept_char = char_with_param.charCodeAt(0);

      let codes = [
        0x00, 0x01, 0x02, 0x03, 0x04, 0x05, 0x06, 0x07, 
        0x08, 0x09, 0x0a, 0x0b, 0x0c, 0x0d, 0x0e, 0x0f,
        0x30, 0x31, 0x32, 0x33, 0x34, 0x35, 0x36, 0x37, 0x38, 0x39,
        0x7f,
        0x3b
      ];
      let i;
      for (i = 0; i < codes.length; ++i) {
        let code = codes[i];
        if (0x30 <= code && code < 0x3a) {
          this[code] = this[code] 
                     || new ParameterParser(code - 0x30);
        } else if (0x3b === code) {
          this[code] = this[code] 
                     || new ParameterParserStartingWithSemicolon(0);
        } else {
          this[code] = this[code] 
                     || new ParameterParser(0, code);
        }
        if (1 === char_with_param.length) {
          this[code][accept_char] = action;
        } else if (2 === char_with_param.length) {
          let next_char = char_with_param.charCodeAt(1);
          this[code][accept_char] = this[code][accept_char] 
                                 || new SequenceParser();
          this[code][accept_char][next_char] = action;
        } else {
          throw coUtile.Exception(_("Cannot add handler: %s."), key);
        }
      }
      let parser = this;
      let j;
      for (j = 0; j < char_with_param.length - 1; ++j) {
        let accept_char = char_with_param.charCodeAt(j);
        parser = parser[accept_char] 
               = parser[accept_char] || new SequenceParser();
      }
      code = char_with_param.charCodeAt(char_with_param.length - 1);
      parser[code] = parser[code] || function() 
      {
        return value.call(context, 0);
      };

    } else if (char_with_single_param) {

      let action = function(params)
      {
        return function() 
        {
          return value.apply(context, params);
        };
      };
      for (let i = 0; i < 10; ++i) {
        let code = 0x30 + i;
        this[code] = this[code] || new SequenceParser(0, code);
        let parser = this[code];
        for (let j = 0; j < char_with_single_param.length - 1; ++j) {
          let accept_char = char_with_single_param.charCodeAt(j);
          parser = parser[accept_char] = new SequenceParser();
        }
        code = char_with_single_param.charCodeAt(char_with_single_param.length - 1);
        parser[code] = action;
      }
      let parser = this;
      for (let j = 0; j < char_with_single_param.length - 1; ++j) {
        let accept_char = char_with_single_param.charCodeAt(j);
        parser = parser[accept_char] = parser[accept_char] || new SequenceParser();
      }
      code = char_with_single_param.charCodeAt(char_with_single_param.length - 1);
      parser[code] = parser[code] || action;

    } else if (char_with_string) {
      // define action
      let action = function(params) 
      {
        let data = String.fromCharCode.apply(String, params);
        return function() value.call(context, data);
      };
      let index = char_with_string.charCodeAt(0);
      this[index] = new StringParser(action) // chain to string parser.
    } else if (single_char) { // parse a char.
      this[0x20] = this[0x20] || new SequenceParser();
      for (let code = 0x21; code < 0x7f; ++code) {
        let c = String.fromCharCode(code);
        this[0x20][code] = this[code] = this[code] 
                        || function() value.call(context, c)
      }
    } else if (char_position) { // 
      for (let code1 = 0x21; code1 < 0x7f; ++code1) {
        let c1 = String.fromCharCode(code1);
        for (let code2 = 0x21; code2 < 0x7f; ++code2) {
          let c2 = String.fromCharCode(code2);
          this[code1] = this[code1] || new SequenceParser();
          this[code1][code2] = this[code1][code2] 
                            || function() value.apply(context, [code1, code2])
        }
      }
    } else if (normal_char) {
      let code = normal_char.charCodeAt(0);
      if ("parse" in value) {
        this[code] = value;
      } else {
        this[code] = this[code] || function() value.apply(context);
      }
    } else {
      let code = first.charCodeAt(0);
      let next = this[code] = this[code] || new SequenceParser;
      if (!next.append) {
        next = this[code] = this[code] || new SequenceParser;
      }
      next.append(next_chars, value, context);
    }
  }, // append

  /** Scan and get asocciated action. 
   *  @param {Scanner} scanner A Scanner object.
   */
  parse: function parse(scanner) 
  {
    var c = scanner.current();
    var next = this[c];

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
var VT100Grammar = new Class().extends(Component)
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
    var i;
    var sequences;

    this.ESC = new SequenceParser();
    this.CSI = new SequenceParser();
    SequenceParser.prototype[0x1b] = this.ESC;
    this.sendMessage("command/add-sequence", {
      expression: "0x1B", 
      handler: this.ESC,
      context: this,
    });
    this.sendMessage("command/add-sequence", {
      expression: "0x9C", 
      handler: this.CSI,
      context: this,
    });
    this.sendMessage("command/add-sequence", {
      expression: "ESC [", 
      handler: this.CSI,
      context: this,
    });
    sequences = this.sendMessage("get/sequences/vt100");
    for (i = 0; i < sequences.length; ++i) {
      this.sendMessage("command/add-sequence", sequences[i]);
    }
    this.sendMessage("initialized/grammar", this);
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
    var action = C0Parser.parse(scanner);
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
    var {expression, handler, context} = information;
    var match = expression.split(/\s+/);
    var pos = expression.indexOf(" ");
    var key = expression.substr(pos + 1)
    var prefix;

    if (-1 === pos) {
      prefix = "C0";
    } else {
      prefix = expression.substr(0, pos) || "C0";
    }
    if ("number" === typeof key) {
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
var Scanner = new Class().extends(Component).requires("ScannerConcept");
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
    this.sendMessage("initialized/scanner", this);
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
    var code = this._value.charCodeAt(this._position);
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
    var value = this._value.substr(this._position + 1);
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
var Parser = new Class().extends(Component);
Parser.definition = {

  get id()
    "parser",

  _grammar: null,
  _screen: null,
  _decoder: null,
  _scanner: null,

  "[persistable] initial_grammar": "vt100",
  "[persistable, watchable] ambiguous_as_wide": false,
  wcwidth: null,

// post-constructor
  "[subscribe('initialized/{scanner & screen & decoder & drcs_converter}'), enabled]":
  function onLoad(scanner, screen, decoder, drcs_converter)
  {
    this._scanner = scanner;    
    this._screen = screen;
    this._decoder = decoder;
    this._drcs_converter = drcs_converter;

    this.install(this._broker);
  },

  /** installs itself. 
   *  @param {Broker} broker A Broker object.
   */
  install: function install(broker)
  {
    var grammars;
    var grammar;
    var i;

    this.drive.enabled = true;
    this.onDataArrivedRecursively.enabled = true;

    this._grammars = {};
    grammars = this.sendMessage("get/grammars");
    for (i = 0; i < grammars.length; ++i) {
      grammar = grammars[i];
      this._grammars[grammar.id] = grammar;
    }
    this._grammar = this._grammars[this.initial_grammar];
    this.onChangeAmbiguousCharacterWidth(this.ambiguous_as_wide);

    this.sendMessage("initialized/parser", this);
  },

  /** uninstalls itself. 
   *  @param {Broker} broker A Broker object.
   */
  uninstall: function uninstall(broker)
  {
    this.drive.enabled = false;
    this.onDataArrivedRecursively.enabled = false;
  },

  "[subscribe('variable-changed/parser.ambiguous_as_wide'), enabled]":
  function onChangeAmbiguousCharacterWidth(is_wide)
  {
    if (is_wide) {
      this.wcwidth = wcwidth_amb_as_double;
    } else {
      this.wcwidth = wcwidth_amb_as_single;
    }
  },

  "[subscribe('command/change-mode'), enabled]":
  function onChangeMode(mode)
  {
    var grammars = this._grammars;
    var value;

    if (grammars.hasOwnProperty(mode)) {
      this._grammar = grammars[mode];
      value = this._scanner.drain();
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
    var scanner = this._scanner;
    var action;

//    coUtils.Timer.setTimeout(function(){
    scanner.assign(data);
    for (action in this.parse(scanner, data)) {
      action();
    }
    this.sendMessage("command/draw"); // fire "draw" event.
//    }, 10, this);
  },

  /** Parse and evaluate control codes and text pieces from the scanner. 
   *  @param {String} data incoming data in text format.
   */
  "[subscribe('event/data-arrived-recursively')]": 
  function onDataArrivedRecursively(data)
  {
    var scanner, action;

    scanner = new Scanner(broker);

    scanner.assign(data);
    for (action in this.parse(scanner)) {
      action();
    }
    this.sendMessage("command/draw"); // fire "draw" event.
  },

  /** Parse control codes and text pieces from the scanner. 
   *  @param {String} data incoming data in text format.
   */
  parse: function parse(scanner)
  {
    var action, codes, grammar, screen, drcs_converter, result, next;
    
    grammar = this._grammar;
    screen = this._screen;
    drcs_converter = this._drcs_converter;

    if (scanner.generator) {
      result = scanner.generator(scanner);
      if (result) {
        next = result.next();
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

      action = grammar.parse(scanner);
      if (action) {
        if (action.isGenerator()) {
          scanner.generator = action;
        } else {
          yield action;
          scanner.moveNext();
        }
      } else if (!scanner.isEnd) {
 
        codes = this._decode(scanner);;
        if (codes.length) {
          yield let (codes = codes) function () 
          {
            var converted_codes;

            converted_codes = drcs_converter.convert(codes);
            screen.write(converted_codes);
          };
        } else {
          if (scanner.isEnd) {
            break;
          }
          scanner.moveNext();
          break;
        }
      } else { // scanner.isEnd
        scanner.setSurplus(); // backup surplus (unparsed) sequence.
      }
    }

  },

  _decode: function _decode(scanner)
  {
    var decoder = this._decoder;
    var codes = [];
    var c;
    var base;

    for (c in decoder.decode(scanner)) {

      if (c < 0xa1) {
        codes.push(c);
      } else {

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
        switch (this.wcwidth(c)) {

          case 1:
            codes.push(c);
            break;

          case 2:
            codes.push(0, c);
            break;

          default: // 0
            if (0 === codes.length) {
              codes.push(c);
            } else {
              base = codes[codes.length - 1];
              if ("number" === typeof base) {
                codes[codes.length - 1] = [base, c];
              } else {
                base.push(c);
              }
            }
        }
      }
    }
    return codes;
  },

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

