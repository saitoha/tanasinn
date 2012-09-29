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

/**
 * @class Parser
 * @brief Parse byte sequence emitted by TTY device.
 */
var Parser = new Class().extends(Plugin)
                        .depends("screen")
                        .depends("decoder")
                        .depends("drcs_converter")
                        .depends("scanner");
Parser.definition = {

  id: "parser",

  getInfo: function getInfo()
  {
    return {
      name: _("Parser"),
      version: "0.1",
      description: _("Parse control sequences.")
    };
  },

  "[persistable] enabled_when_startup": true,
  "[persistable] initial_grammar": "vt100",
  "[persistable, watchable] ambiguous_as_wide": false,

  _grammar: null,
  _screen: null,
  _decoder: null,
  _scanner: null,
  _timer: null,

  _wcwidth: null,

  /** installs itself. 
   *  @param {Broker} broker A Broker object.
   */
  "[install]":
  function install(broker)
  {
    var grammars = this.sendMessage("get/grammars"),
        grammar,
        i = 0;

    this._scanner = this.dependency["scanner"];    
    this._screen = this.dependency["screen"];
    this._decoder = this.dependency["decoder"];
    this._drcs_converter = this.dependency["drcs_converter"];

    this.onDataArrivedRecursively.enabled = true;

    this._grammars = {};

    for (; i < grammars.length; ++i) {
      grammar = grammars[i];
      this._grammars[grammar.id] = grammar;
    }

    this._grammar = this._grammars[this.initial_grammar];
    this.onChangeAmbiguousCharacterWidth(this.ambiguous_as_wide);
  },

  /** uninstalls itself. 
   *  @param {Broker} broker A Broker object.
   */
  "[uninstall]":
  function uninstall(broker)
  {
    this.onDataArrivedRecursively.enabled = false;
  },

  "[subscribe('variable-changed/parser.ambiguous_as_wide'), pnp]":
  function onChangeAmbiguousCharacterWidth(is_wide)
  {
    if (is_wide) {
      this._wcwidth = wcwidth_amb_as_double;
    } else {
      this._wcwidth = wcwidth_amb_as_single;
    }
  },

  "[subscribe('command/change-emulation-mode'), pnp]":
  function onChangeMode(mode)
  {
    var grammars = this._grammars,
        value;

    if (grammars.hasOwnProperty(mode)) {
      if (this._grammar === grammars[mode]) {
        // nothing to do
      } else {
        this._grammar = grammars[mode];
        value = this._scanner.drain();
        this._scanner.generator = null;
        this.drive(value);
      }
    } else {
      coUtils.Debug.reportError(
        _("Specified mode '%s' was not found."),
        mode);
    }
  },

  "[subscribe('command/enable-default-parser'), pnp]": 
  function enableDefaultParser()
  {
    this.drive.enabled = true;
  },

  "[subscribe('command/disable-default-parser'), pnp]": 
  function disableDefaultParser()
  {
    this.drive.enabled = false;
  },

  /** Parse and evaluate control codes and text pieces from the scanner. 
   *  @param {String} data incoming data in text format.
   */
  "[subscribe('event/data-arrived'), pnp]": 
  function drive(data)
  {
    var scanner = this._scanner,
        action;

    scanner.assign(data);

    for (action in this.parse(scanner, data)) {
      action();
    }
    this.sendMessage("command/draw"); // fire "draw" event.
  },

  /** Parse and evaluate control codes and text pieces from the scanner. 
   *  @param {String} data incoming data in text format.
   */
  "[subscribe('event/data-arrived-recursively')]": 
  function onDataArrivedRecursively(data)
  {
    var scanner = new Scanner(broker),
        action;

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
    var grammar = this._grammar,
        screen = this._screen,
        drcs_converter = this._drcs_converter,
        action,
        codes,
        result,
        next;

    if (null !== scanner.generator) {
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

    function make_handler(codes)
    {
      return function()
      {
        var converted_codes;

        converted_codes = drcs_converter.convert(codes);
        screen.write(converted_codes);
      };
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
 
        codes = this._decode(scanner);
        if (0 !== codes.length) {
          yield make_handler(codes);
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
    var decoder = this._decoder,
        generator = decoder.decode(scanner),
        codes = [],
        c,
        base;

    if (null === generator) {
      return [ 0x3f ]; // ?
    }

    for (c in generator) {

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
        switch (this._wcwidth(c)) {

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

}; // Parser

/**
 * @fn main
 * @brief Module entry point.
 * @param {Broker} broker The Broker object.
 */
function main(broker) 
{
  new Parser(broker);
}

// EOF
