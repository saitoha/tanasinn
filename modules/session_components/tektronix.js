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


let TektronixC0Parser = {

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

}; // TektronixC0Parser

/**
 * @class TektronixSequenceParser
 */
let TektronixSequenceParser = new Class().extends(Array);
TektronixSequenceParser.definition = {

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
        TektronixC0Parser.append(code, value);
        this[code] = value;
      } else {
        TektronixC0Parser.append(code, function() value.apply(context));
        this[code] = function() value.apply(context);
      }
    } else if (char_position) { // 
      for (let code1 = 0x20; code1 < 0x7f; ++code1) {
        let c1 = String.fromCharCode(code1);
        this[code1] = new TektronixSequenceParser();
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
      let next = this[code] = this[code] || new TektronixSequenceParser;
      if (!next.append) {
        next = this[code] = new TektronixSequenceParser;
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

}; // class TektronixSequenceParser


/**
 * @class Tektronix
 */
let Tektronix = new Class().extends(Plugin);
Tektronix.definition = {

  get id()
    "tektronix",

  get info()
    <plugin>
        <name>{_("Tektronix 4014 mode")}</name>
        <description>{
          _("Provides Tektronix 4014 emuration.")
        }</description>
        <version>0.1.0</version>
    </plugin>,

  "[persistable] enabled_when_startup": true,
  "[persistable] default_line_style": "yellow",
  "[persistable] default_text_color": "white",
  "[persistable] default_text_style": "26px monospace",

  /** post constructor. 
   *  @param {Broker} broker A Broker object.
   */
  "[subscribe('initialized/screen'), enabled]":
  function onLoad(screen)
  {
    this._screen = screen;
  },

  "[subscribe('install/tektronix'), enabled]":
  function install(broker) 
  {
    let { tanasinn_tektronix_canvas } = broker.uniget(
      "command/construct-chrome", 
      {
        parentNode: "#tanasinn_center_area",
        tagName: "html:canvas",
        id: "tanasinn_tektronix_canvas",
      });

    this._dom = {
      canvas: tanasinn_tektronix_canvas,
      context: tanasinn_tektronix_canvas.getContext("2d"),
    };
    this.onWidthChanged(this._width);
    this.onHeightChanged(this._height);
  },

  "[subscribe('uninstall/tektronix'), enabled]":
  function uninstall(broker) 
  {
    if (this._dom) {
      this._dom.canvas.parentNode.removeChild(this._dom.canvas);
      this._dom.canvas = null;
      this._dom.renderer = null;
      this._dom = null;
    }
  },

  "[subscribe('event/screen-width-changed'), enabled]":
  function onWidthChanged(width) 
  {
    //width = 1024;
    let dom = this._dom;
    this._width = width;
    if (dom) {
      dom.canvas.width = width;
      let scale = Math.min(width, dom.canvas.height) / 1024;
      this._scale = scale;
      dom.context.scale(scale, scale);
    }
  },

  "[subscribe('event/screen-height-changed'), enabled]": 
  function onHeightChanged(height) 
  {
    //height = 1024;
    let dom = this._dom;
    this._height = height;
    if (dom) {
      dom.canvas.height = height;
      let scale = Math.min(dom.canvas.width, height) / 1024;
      dom.context.scale(scale, scale);
      this._scale = scale;
    }
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
    try {

    let dom = this._dom;
    dom.context.fillStyle = this.default_text_color;
    dom.context.strokeStyle = this.default_line_style;
    dom.context.font = this.default_text_style;

    let x1 = 0, y1 = 0;
    let path_is_open = false;

scan:
    while (!scanner.isEnd) {

      let c = scanner.current();

      if (0x1d == c) {
        let high_y, low_y, high_x, low_x;
        let arg = [];

        while (!scanner.isEnd) {

          scanner.moveNext();

          c = scanner.current();
          if (1 != c >> 5) {
            dom.context.stroke();
            path_is_open = false;
            continue scan;
          }
          high_y = c & 0x1f; // 001xxxxx

          scanner.moveNext();

          c = scanner.current();
          if (3 != c >> 5) {
            dom.context.stroke();
            path_is_open = false;
            continue scan;
          }
          low_y  = c & 0x1f; // 011xxxxx

          scanner.moveNext();

          c = scanner.current();
          if (1 != c >> 5) {
            dom.context.stroke();
            path_is_open = false;
            continue scan;
          }
          high_x = c & 0x1f; // 001xxxxx

          scanner.moveNext();

          c = scanner.current();
          if (2 != c >> 5) {
            dom.context.stroke();
            path_is_open = false;
            continue scan;
          }
          low_x  = c & 0x1f; // 010xxxxx

          y1 = (this._height / this._scale) - (high_y << 5 | low_y) + 0;
          x1 = high_x << 5 | low_x;

          if (path_is_open) {
            dom.context.lineTo(x1, y1);
          } else {
            dom.context.beginPath();
            dom.context.moveTo(x1, y1);
            path_is_open = true;
          }
        } // while
        
      } else if (0x0a == c) {
        scanner.moveNext();
      } else if (0x0d == c) {
        scanner.moveNext();
      } else if (0x1b == c) {
        if (path_is_open) {
          dom.context.stroke();
          path_is_open = false;
        }
        scanner.moveNext();
        c = scanner.current();
        if (0x0c == c) {
          dom.context.clearRect(
            0, 0, 
            this._width / this._scale, 
            this._height / this._scale);
        } else if (0x5b == c) {     // [
          scanner.moveNext();
          c = scanner.current();    // ?
          let broker = this._broker;
          broker.notify("command/change-mode", "vt100");
          if (true || 0x3f == c) {
            scanner.moveNext(); 
            c = scanner.current();
            if (true || 0x33 == c) {        // 3
              scanner.moveNext();
              c = scanner.current();
              if (0x38 == c) {      // 8
                scanner.moveNext();
                c = scanner.current();
                if (0x6c == c) {    // l
                  coUtils.Debug.reportWarning(
                    _("DECSET 38 - Leave Tektronix mode (DECTEK)."));
                    broker.notify("command/change-mode", "vt100");
                }
                else
                {
                  continue;
                }
              }
              else
              {
                continue;
              }
            }
            else
            {
              continue;
            }
          }
          else
          {
            continue;
          }
        }
        scanner.moveNext();
      } else if (0x0c == c) {
        if (path_is_open) {
          dom.context.stroke();
          path_is_open = false;
        }
        dom.context.clearRect(
          0, 0, 
          this._width / this._scale, 
          this._height / this._scale);
        scanner.moveNext();
      } else if (0x1f == c) { // <US> Alpha Mode
        if (path_is_open) {
          dom.context.stroke();
          path_is_open = false;
        }

        let buffer = [];
        while (true) {
          scanner.moveNext();
          if (scanner.isEnd) {
            break;
          }
          c = scanner.current();
          if (c == 0x0d) {
            scanner.moveNext();
            c = scanner.current();
            if (c == 0x0a) {
              scanner.moveNext();
              break;
            }
          }
          if (c < 20 || c > 0x7f) {
            break;
          }
          buffer.push(c);
        }
        if (buffer.length) {
          let text = String.fromCharCode.apply(String, buffer);
          dom.context.fillText(text, x1, y1);
        }

      } else {
        if (path_is_open) {
          dom.context.stroke();
          path_is_open = false;
        }
        let c;
        let buffer = [];
        while (true) {
          if (scanner.isEnd) {
            break;
          }
          c = scanner.current();
          if (0x1d == c || 0x1b == c || 0x1f == c || 0x0a == c || 0x0c == c || 0x0d == c) {
            break;
          }
          buffer.push(c);
          scanner.moveNext();
        }
        let text = String.fromCharCode.apply(String, buffer);
        coUtils.Debug.reportError("text: " + text + "[" + buffer + "]");
      } 

    } // while

    if (path_is_open) {
      dom.context.stroke();
      path_is_open = false;
    }
    //let action = TektronixC0Parser.parse(scanner);
    //return action;
    } catch (e) {alert(e)}
  },

  /** Append a sequence handler.
   *  @param {Object} information A register information object that has 
   *                              "expression", "handler", and "context" key.
   *
   *  @implements Grammar.<command/add-sequence/tektronix> :: SequenceInfo -> Undefined
   */
  "[subscribe('command/add-sequence/tektronix'), type('SequenceInfo -> Undefined'), enabled]":
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
      this[prefix] = new TektronixSequenceParser();
    }
    this[prefix].append(key, handler, context);
  }, // append

}; // tektronix

/**
 * @fn main
 * @brief Module entry point.
 * @param {Broker} broker The Broker object.
 */
function main(broker) 
{
  new Tektronix(broker);
}


