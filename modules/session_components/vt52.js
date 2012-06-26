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


var vt52C0Parser = {

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
    var c, action;

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
      return action.parse(scanner);
    }
    return action;
  },

}; // vt52C0Parser

/**
 * @class VT52ParameterParser
 * @brief Parse parameter. 
 */ 
var VT52ParameterParser = new Class().extends(Array);
VT52ParameterParser.definition = {

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
    var params, c, action, self, next, 
        meta_action, default_action, actions;

    params = [param for (param in this._parseParameters(scanner))];

    do {
      if (scanner.isEnd) {
        self = this;
        return function(scanner) 
        {
          var result;

          result = parse.apply(self, scanner);
          yield result;
        };
        return undefined;
      }
      c = scanner.current();
      if (c < 0x20 || 0x7f == c) {
        action = vt52C0Parser.get(c);
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
    } else if (next.hasOwnProperty("parse")) {
      meta_action = next.parse(scanner);
      if (meta_action) {
        action = meta_action(params);
      }
    } else {
      action = next(params);
    }
    default_action = this._default_action;
    if (0 == this._c0action.length && null === default_action) {
      return action;
    } 
    actions = this._c0action;
    actions.push(action);

    this._c0action = [];
    return function() {
      var action, i;

      if (default_action) {
        action = vt52C0Parser.get(default_action);
        if (undefined !== action) {
          action();
        }
      }
      for (i = 0; i < actions.length; ++i) {
        actions[i]();
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
    var accumulator, c, action;

    accumulator = this._first;
    while (!scanner.isEnd) {
      c = scanner.current();
      if (0x30 <= c && c <= 0x39) { // [0-9]
        scanner.moveNext();
        accumulator = accumulator * 10 + c - 0x30;
      } else if (0x3b == c) { // ';'
        scanner.moveNext();
        yield accumulator;
        accumulator = 0;
      } else if (c < 0x20 || 0x7f == c) {
        yield accumulator;
        action = vt52C0Parser.get(c);
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
 * @class VT52SequenceParser
 */
var VT52SequenceParser = new Class().extends(Array);
VT52SequenceParser.definition = {

  /** Construct child parsers from definition and make parser-chain. */
  append: function append(key, value, context) 
  {
    let match = key
      .match(/^(0x[0-9a-zA-Z]+)|^(%p)|^(.)$|^(.)(.+)$/);

    let [, 
      number, char_position,
      normal_char, first, next_chars
    ] = match;
    if (number) { // parse number
      let code = parseInt(number);
      if ("parse" in value) {
        vt52C0Parser.append(code, value);
        this[code] = value;
      } else {
        vt52C0Parser.append(code, function() value.apply(context));
        this[code] = function() value.apply(context);
      }
    } else if (char_position) { // 
      for (let code1 = 0x20; code1 < 0x7f; ++code1) {
        let c1 = String.fromCharCode(code1);
        this[code1] = new VT52SequenceParser();
        for (let code2 = 0x20; code2 < 0x7f; ++code2) {
          this[code1][code2] = let (y = code1, x = code2)
            function() value.call(context, y, x);
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
      let next = this[code] = this[code] || new VT52SequenceParser;
      if (!next.append) {
        next = this[code] = new VT52SequenceParser;
      }
      next.append(next_chars, value, context);
    }
  }, // append

  /** Scan and get asocciated action. 
   *  @param {Scanner} scanner A Scanner object.
   */
  parse: function parse(scanner) 
  {
    var c, next;

    c = scanner.current();
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

}; // class VT52SequenceParser


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
  get id()
    "vt52",

  get info()
    <plugin>
        <name>{_("VT-52 mode")}</name>
        <description>{
          _("Emurate DEC VT-52 terminal.")
        }</description>
        <version>0.1.0</version>
    </plugin>,

  "[persistable] enabled_when_startup": true,


  _tab_controller: null,
  _screen: null,
  _cursor_state: null,

  "[install]":
  function install(broker)
  {
    var sequences, i;

    this._tab_controller = this.dependency["tab_controller"];
    this._screen = this.dependency["screen"];
    this._cursor_state = this.dependency["cursorstate"];

    this.sendMessage("initialized/vt52", this);

    this.ESC = new VT52SequenceParser();
    VT52SequenceParser.prototype[0x1b] = this.ESC;

    this.sendMessage("command/add-sequence/vt52", {
      expression: "0x1B", 
      handler: this.ESC,
      context: this,
    });

    sequences = this.sendMessage("get/sequences/vt52");

    for (i = 0; i < sequences.length; ++i) {
      this.sendMessage("command/add-sequence/vt52", sequences[i]);
    }

  },

  "[uninstall]":
  function uninstall(broker)
  {
    this._tab_controller = null;
    this._screen = null;
    this._cursor_state = null;
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
    var action;

    action = vt52C0Parser.parse(scanner);
    return action;
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
    var match, key, prefix;

    match = information.expression.split(/\s+/);
    key = match.pop();
    prefix = match.pop() || "C0";
    if ("number" == typeof key) {
      key = key.toString();
    }
    if (!this[prefix]) {
      this[prefix] = new VT52SequenceParser();
    }
    this[prefix].append(
      key, 
      information.handler, 
      information.context);

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
      "%s sequence [%s] was ignored.",
      arguments.callee.name, Array.slice(arguments));
  },
  
  /** Start of text.
   */
  "[profile('vt52'), sequence('0x02')]":
  function STX()  
  {
    coUtils.Debug.reportWarning(
      "%s sequence [%s] was ignored.",
      arguments.callee.name, Array.slice(arguments));
  },
 
  /** End of text.
   */
  "[profile('vt52'), sequence('0x03')]":
  function ETX() 
  {
    coUtils.Debug.reportWarning(
      "%s sequence [%s] was ignored.",
      arguments.callee.name, Array.slice(arguments));
  },

  /** Start of transmission.
   */
  "[profile('vt52'), sequence('0x04')]":
  function EOT() 
  {
    coUtils.Debug.reportWarning(
      "%s sequence [%s] was ignored.",
      arguments.callee.name, Array.slice(arguments));
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
      "%s sequence [%s] was ignored.",
      arguments.callee.name, Array.slice(arguments));
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
      "%s sequence [%s] was ignored.",
      arguments.callee.name, Array.slice(arguments));
  },
 
  /** Device control 1.
   */
  "[profile('vt52'), sequence('0x11')]":
  function DC1() 
  {
    //session.notify("command/send-to-tty", "\u0011");
    this.sendMessage("command/flow-control", true);
  },
  
  /** Device control 2.
   */
  "[profile('vt52'), sequence('0x12')]":
  function DC2() 
  {
    coUtils.Debug.reportWarning(
      _("%s sequence [%s] was ignored.",
        arguments.callee.name, Array.slice(arguments)));
  },

  /** Device control 3.
   */
  "[profile('vt52'), sequence('0x13')]":
  function DC3() 
  {
    //session.notify("command/send-to-tty", "\u0013");
    this.sendMessage("command/flow-control", false);
  },
  
  /** Device control 4.
   */
  "[profile('vt52'), sequence('0x14')]":
  function DC4() 
  {
    coUtils.Debug.reportWarning(
      _("%s sequence [%s] was ignored.",
        arguments.callee.name, Array.slice(arguments)));
  },
  
  /** Negative acknowledge.
   */
  "[profile('vt52'), sequence('0x15')]":
  function NAK() 
  {
    coUtils.Debug.reportWarning(
      _("%s sequence [%s] was ignored.",
        arguments.callee.name, Array.slice(arguments)));
  },
  
  /** Synchronous idle.
   */
  "[profile('vt52'), sequence('0x16')]":
  function SYN() 
  {
    coUtils.Debug.reportWarning(
      _("%s sequence [%s] was ignored.",
        arguments.callee.name, Array.slice(arguments)));
  },
  
  /** End of transmission block.
   */
  "[profile('vt52'), sequence('0x17')]":
  function ETB() 
  {
    coUtils.Debug.reportWarning(
      _("%s sequence [%s] was ignored.",
        arguments.callee.name, Array.slice(arguments)));
  },
  
  /** Cancel of previous word or charactor.
   */
  "[profile('vt52'), sequence('0x18')]":
  function CAN() 
  {
    coUtils.Debug.reportWarning(
      _("%s sequence [%s] was ignored.",
        arguments.callee.name, Array.slice(arguments)));
  },
  
  /** End of medium.
   */
  "[profile('vt52'), sequence('0x19')]":
  function EM() 
  {
    coUtils.Debug.reportWarning(
      _("%s sequence [%s] was ignored.",
        arguments.callee.name, Array.slice(arguments)));
  },
  
  /** Substitute.
   */
  "[profile('vt52'), sequence('0x1A')]":
  function SUB()
  {
    coUtils.Debug.reportWarning(
      _("%s sequence [%s] was ignored.",
        arguments.callee.name, Array.slice(arguments)));
  },
  
  /** File separator.
   */
  "[profile('vt52'), sequence('0x1C')]":
  function FS() 
  {
    coUtils.Debug.reportWarning(
      _("%s sequence [%s] was ignored.",
        arguments.callee.name, Array.slice(arguments)));
  },
 
  /** Group separator.
   */
  "[profile('vt52'), sequence('0x1D')]":
  function GS() 
  {
    coUtils.Debug.reportWarning(
      _("%s sequence [%s] was ignored.",
        arguments.callee.name, Array.slice(arguments)));
  },
  
  /** Record separator.
   */
  "[profile('vt52'), sequence('0x1E')]":
  function RS() 
  {
    coUtils.Debug.reportWarning(
      _("%s sequence [%s] was ignored.",
        arguments.callee.name, Array.slice(arguments)));
  },
  
  /** Unit separator.
   */
  "[profile('vt52'), sequence('0x1F')]":
  function US() 
  {
    coUtils.Debug.reportWarning(
      _("%s sequence [%s] was ignored.",
        arguments.callee.name, Array.slice(arguments)));
  },
  
  /** Delete.
   */
  "[profile('vt52'), sequence('0x7F', '0xFF')]":
  function DEL() 
  {
    var screen = this._screen;
    screen.backSpace();

    /*
    coUtils.Debug.reportWarning(
      _("%s sequence [%s] was ignored.",
        arguments.callee.name, Array.slice(arguments)));
        */
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

  "[profile('vt52'), sequence('ESC H')]":
  function HTS()
  {
    var cursor = this._screen.cursor;
    cursor.positionX = cursor.originX;
    cursor.positionY = cursor.originY;
  },

  "[profile('vt52'), sequence('ESC I')]":
  function HTJ()
  {
    var screen = this._screen;
    this.sendMessage("command/draw", true);
    screen.reverseIndex();
    this.sendMessage("command/draw", true);
  },

  "[profile('vt52'), sequence('ESC J')]":
  function VTS()
  {
    var screen = this._screen;
    screen.eraseScreenBelow();
  },

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

  "[profile('vt52'), sequence('ESC Y%p')]":
  function ESC_Y(y, x)
  {
    var screen = this._screen;
    screen.setPositionY(y - 0x20);
    screen.setPositionX(x - 0x20);
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
    this.sendMessage("command/change-mode", "vt100");
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


