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
    if (scanner.isEnd)
      return undefined;
    let c = scanner.current();
    if (scanner.isEnd)
      return undefined;
    let handler = this[c];
    return handler && handler(params);
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
    let match = key.match(/^(0x[0-9a-zA-Z]+)$|^%d(.)$|^(.)%s$|^(%c)|^(.)$|^(.)(.+)$/);
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
        this[code][accept_char] = action;
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
 * @fn main
 * @brief Module entry point.
 * @param {Broker} broker The Broker object.
 */
function main(broker) 
{
  new Grammer(broker);
}

