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

//////////////////////////////////////////////////////////////////////////////
//
// Concepts
//

/**
 * @concept GrammarConcept
 */
var GrammarConcept = new Concept();
GrammarConcept.definition = {

  id: "GrammarConcept",

  // message concept
  "<command/add-sequence> :: SequenceInfo -> Undefined":
  _('Append a sequence handler and (re-)construct a FSM object.'),

  // signature concept
  "parse :: Scanner -> Action":
  _('Receives a scanner object, get input sequence and parse it with the FSM.'),

}; // GrammarConcept


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
    var sequence = previous || [],
        self = this,
        c;

    for (c in this._parseString(scanner)) {
      sequence.push(c);
    }

    if (scanner.isEnd) {
      return function(scanner) 
      {
        yield parse.apply(self, [scanner, sequence]);
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
};

function null_function()
{
}

/**
 * handle control characters in C0 area.
 *
 */
var C0Parser = {

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
    var c,
        action;

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
    var params = [],
        c,
        action,
        meta_action,
        default_action,
        actions,
        next,
        param;

    for (param in this._parseParameters(scanner)) {
      params.push(param);
    }

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

    return function()
      {
        var i,
            action;

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
   * Paramter -> ([0-9]+, (";" or ":"))*, [0-9]+
   *
   */
  _parseParameters: 
  function _parseParameters(scanner) 
  {
    var accumulator = this._first,
        c,
        action;

    while (!scanner.isEnd) {
      c = scanner.current();
      if (0x30 <= c && c <= 0x39) { // [0-9]
        scanner.moveNext();
        accumulator = accumulator * 10 + c - 0x30;
      } else if (0x3a === c || 0x3b === c) { // ':' or ';'
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
   * Paramter -> ([0-9]+, (";" | ":"))*, [0-9]+
   *
   */
  _parseParameters: 
  function _parseParameters(scanner) 
  {
    var accumulator,
        c,
        action;

    yield 0;

    accumulator = this._first;

    while (!scanner.isEnd) {
      c = scanner.current();
      if (0x30 <= c && c <= 0x39) { // [0-9]
        scanner.moveNext();
        accumulator = accumulator * 10 + c - 0x30;
      } else if (0x3a === c || 0x3b === c) { // ':' or ';'
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
    var match = key.match(
          /^(0x[0-9a-zA-Z]{2})(.*)$|^%d([\x20-\x7f]+)$|^%<Ps>([\x20-\x7f]+)$|^(.)%s$|^(%p)$|^(%c)$|^(.)$|^(.)(.+)$/),
        code,
        next,
        accept_char,
        codes,
        i,
        j,
        next_char,
        parser,
        action,
        index,
        code1,
        code2,
        c,
        make_handler;

    var [, 
      number, number2,
      char_with_param, 
      char_with_single_param,
      char_with_string, 
      char_position,
      single_char, 
      normal_char, first, next_chars
    ] = match;

    if (number) { // parse number
      code = parseInt(number, 16);
      if ("%s" === number2) {

        var action = function(params) 
        {
          var data = coUtils.Text.safeConvertFromArray(params);
          return function() 
          {
            return value.call(context, data);
          };
        };

        C0Parser.append(code, new StringParser(action));

      } else if (number2) {

        code = parseInt(number, 16);
        next = this[code] = this[code] || new SequenceParser;
        next.append(number2, value, context);

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

      action = function action(params) 
      {
        return function() 
        {
          return value.apply(context, params);
        };
      };
      accept_char = char_with_param.charCodeAt(0);

      codes = [
        0x00, 0x01, 0x02, 0x03, 0x04, 0x05, 0x06, 0x07, 
        0x08, 0x09, 0x0a, 0x0b, 0x0c, 0x0d, 0x0e, 0x0f,
        0x30, 0x31, 0x32, 0x33, 0x34, 0x35, 0x36, 0x37, 0x38, 0x39,
        0x7f,
        0x3b,
        0x90, 0x9d
      ];

      for (i = 0; i < codes.length; ++i) {

        code = codes[i];
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
          next_char = char_with_param.charCodeAt(1);
          this[code][accept_char] = this[code][accept_char] 
                                 || new SequenceParser();
          this[code][accept_char][next_char] = action;
        } else {
          throw coUtile.Exception(_("Cannot add handler: %s."), key);
        }
      }

      parser = this;

      for (j = 0; j < char_with_param.length - 1; ++j) {
        accept_char = char_with_param.charCodeAt(j);
        parser = parser[accept_char] 
               = parser[accept_char] || new SequenceParser();
      }
      code = char_with_param.charCodeAt(char_with_param.length - 1);

      parser[code] = parser[code] || function() 
        {
          return value.call(context, 0);
        };

    } else if (char_with_single_param) {

      action = function(params)
      {
        return function() 
        {
          return value.apply(context, params);
        };
      };
      for (i = 0; i < 10; ++i) {
        code = 0x30 + i;
        this[code] = this[code] || new SequenceParser(0, code);
        parser = this[code];
        for (j = 0; j < char_with_single_param.length - 1; ++j) {
          accept_char = char_with_single_param.charCodeAt(j);
          parser = parser[accept_char] = new SequenceParser();
        }
        code = char_with_single_param.charCodeAt(char_with_single_param.length - 1);
        parser[code] = action;
      }

      parser = this;

      for (j = 0; j < char_with_single_param.length - 1; ++j) {
        accept_char = char_with_single_param.charCodeAt(j);
        parser = parser[accept_char] = parser[accept_char] || new SequenceParser();
      }
      code = char_with_single_param.charCodeAt(char_with_single_param.length - 1);
      parser[code] = parser[code] || action;

    } else if (char_with_string) {
      // define action
      action = function(params) 
      {
        var data = coUtils.Text.safeConvertFromArray(params);

        return function()
        {
          return value.call(context, data);
        };
      };

      index = char_with_string.charCodeAt(0);
      this[index] = new StringParser(action) // chain to string parser.
    } else if (single_char) { // parse a char.

      this[0x20] = this[0x20] || new SequenceParser();

      make_handler = function make_handler(c)
      {
        return function()
        {
          return value.call(context, c)
        };
      }

      for (code = 0x21; code < 0x7f; ++code) {
        c = String.fromCharCode(code);
        this[code] = this[code] || make_handler(c);
        this[0x20][code] = this[0x20][code] || make_handler(" " + c);
      }

    } else if (char_position) { // 

      make_handler = function make_handler(code1, code2)
      {
        return function()
        {
          return value.apply(context, [code1, code2]);
        };
      }

      for (code1 = 0x21; code1 < 0x7f; ++code1) {
        for (code2 = 0x21; code2 < 0x7f; ++code2) {
          this[code1] = this[code1] || new SequenceParser();
          this[code1][code2] = this[code1][code2] 
                            || make_handler(code1, code2)
        }
      }
    } else if (normal_char) {

      code = normal_char.charCodeAt(0);
      if ("parse" in value) {
        this[code] = value;
      } else {
        this[code] = this[code] || function()
          {
            return value.apply(context);
          };
      }
    } else {

      code = first.charCodeAt(0);
      next = this[code] = this[code] || new SequenceParser;

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
    var c = scanner.current(),
        next = this[c];

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
var VT100Grammar = new Class().extends(Plugin)
                              .requires("GrammarConcept");
VT100Grammar.definition = {

  id: "vt100",

  getInfo: function getInfo()
  {
    return {
      name: _("VT100 Grammar"),
      version: "0.1",
      description: _("Provides the definition of VT terminal parser.")
    };
  },

  "[persistable] enabled_when_startup": true,

  ESC: null,
  CSI: null,

  /** Installs itself. 
   *  @param {InstallContext} context A InstallContext object.
   */
  "[install]":
  function install(context)
  {
    var i,
        sequences;

    this.resetSequences();

    sequences = this.sendMessage("get/sequences/vt100");

    for (i = 0; i < sequences.length; ++i) {
      this.sendMessage("command/add-sequence", sequences[i]);
    }
  },

  /** Uninstalls itself. 
   */
  "[uninstall]":
  function uninstall()
  {
    this.ESC = null;
    this.CSI = null;
  },

  "[subscribe('command/reset-sequences'), pnp]":
  function resetSequences()
  {
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
    var action = C0Parser.parse(scanner);
    return action;
  },

  /** Append a sequence handler.
   *  @param {Object} information A register information object that has 
   *                              "expression", "handler", and "context" key.
   *
   *  @implements Grammar.<command/add-sequence> :: SequenceInfo -> Undefined
   */
  "[subscribe('command/add-sequence'), type('SequenceInfo -> Undefined'), pnp]":
  function append(information) 
  {
    var expression = information.expression,
        pos = expression.indexOf(" "),
        key = expression.substr(pos + 1),
        prefix;

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

    this[prefix].append(
        key,
        information.handler,
        information.context);

  }, // append

}; // VT100Grammar


/**
 * @fn main
 * @brief Module entry point.
 * @param {Broker} broker The Broker object.
 */
function main(broker) 
{
  new VT100Grammar(broker);
}

// EOF
