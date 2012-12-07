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

var _STATE_GROUND        = 0,
    _STATE_ESC           = 1,
    _STATE_ESC_IBYTES    = 2,
    _STATE_CSI_PBYTES    = 3,
    _STATE_CSI_IBYTES    = 4,
    _STATE_OSC           = 5,
    _STATE_OSC_FINAL     = 6,
    _STATE_STRING        = 7,
    _STATE_STRING_FINAL  = 8;

/**
 * @class VT100Grammar
 *
 *
 */
var VT100Grammar = new Class().extends(Plugin)
                              .requires("GrammarConcept");
VT100Grammar.definition = {

  id: "vt100",

  _state: _STATE_GROUND,
  _str: null,

  getInfo: function getInfo()
  {
    return {
      name: _("VT100 Grammar"),
      version: "0.1",
      description: _("Provides the definition of VT terminal parser.")
    };
  },

  "[persistable] enabled_when_startup": true,

  /** Installs itself. 
   *  @param {InstallContext} context A InstallContext object.
   */
  "[install]":
  function install(context)
  {
    this._str = null;
  },

  /** Uninstalls itself. 
   */
  "[uninstall]":
  function uninstall()
  {
    this._state = _STATE_GROUND;
    this._str = null;
    this._hookmap = null;
  },

  "[subscribe('event/session-initialized'), pnp]":
  function onSessionInitialized()
  {
    var sequences = this.sendMessage("get/sequences/vt100"),
        i;

    this.resetSequences();

    for (i = 0; i < sequences.length; ++i) {
      this.sendMessage("command/add-sequence", sequences[i]);
    }
  },

  "[subscribe('get/hook-map'), pnp]":
  function getHookMap()
  {
    return this._hookmap;
  },

  "[subscribe('command/reset-sequences'), pnp]":
  function resetSequences()
  {
    this._char_map = [];
    this._esc_map = {};
    this._csi_map = {};
    this._str_map = [];
    this._hookmap = [];
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
    var c;
    while (!scanner.isEnd) {
      c = scanner.current();
      if (0x18 === c || 0x1a === c) {
        this._state = _STATE_GROUND;
      } else if (_STATE_OSC === this._state) {
        if (0x1b === c) {
          this._state = _STATE_OSC_FINAL;
        } else if (0x07 === c) {
          this._state = _STATE_GROUND;
          return this._dispatch_string(this._str);
        } else if (c < 0x20) {
        //  this._state = _STATE_GROUND;
        } else {
          this._str.push(c);
        }
      } else if (_STATE_OSC_FINAL === this._state) {
        if (0x5c === c) {
          this._state = _STATE_GROUND;
          return this._dispatch_string(this._str);
        } else if (c < 0x20) {
        //  this._state = _STATE_GROUND;
        } else {
          this._state = _STATE_OSC;
          this._str.push(c);
        }
      } else if (_STATE_STRING === this._state) {
        if (0x1b === c) {
          this._state = _STATE_STRING_FINAL;
        } else if (0x07 === c || 0x9c === c) {
          this._state = _STATE_GROUND;
          return this._dispatch_string(this._str);
        } else if (c < 0x20) {
        //  this._state = _STATE_GROUND;
        } else {
          this._str.push(c);
        }
      } else if (_STATE_STRING_FINAL === this._state) {
        if (0x5c === c) {
          this._state = _STATE_GROUND;
          return this._dispatch_string(this._str);
        } else if (c < 0x20) {
        //  this._state = _STATE_GROUND;
        } else {
          this._state = _STATE_STRING;
          this._str.push(c);
        }
      } else if (0x1b === c) {
        this._state = _STATE_ESC;
      } else if (c < 0x20) { // C0
        return this._dispatch_char(c);
      } else if (c > 0x9f) {
        this._state = _STATE_GROUND;
        return false;
      } else if (c >= 0x7f) { // DEL, C1
        if (0x90 === c) {
          this._str = [c - 0x40];
          this._state = _STATE_STRING;
        } else {
          return this._dispatch_char(c);
        }
      } else if (_STATE_ESC === this._state) {
        if (c <= 0x2f) { // SP to / 
          this._ibytes = [c];
          this._state = _STATE_ESC_IBYTES;
        } else if (0x50 === c || 0x58 === c || 0x5e === c || 0x5f === c) {
          this._str = [c];
          this._state = _STATE_STRING;
        } else if (0x5b === c) { // [
          this._ibytes = [];
          this._pbytes = [];
          this._state = _STATE_CSI_PBYTES;
        } else if (0x5d === c) { // ]
          this._str = [c];
          this._state = _STATE_OSC;
        } else if (c <= 0x7f) { // 0 to ~
          this._state = _STATE_GROUND;
          return this._dispatch_single_esc(c);
        } else if (c <= 0x9f) {
          this._state = _STATE_GROUND;
        } else {
          this._state = _STATE_GROUND;
          return false;
        }
      } else if (_STATE_ESC_IBYTES === this._state) {
        if (c <= 0x2f) { // SP to / 
          this._ibytes.push(c);
        } else if (c <= 0x7f) { // 0 to ~
          this._state = _STATE_GROUND;
          return this._dispatch_esc(this._ibytes, c)
        } else if (c <= 0x9f) {
          this._state = _STATE_GROUND;
        } else {
          this._state = _STATE_GROUND;
          return false;
        }
      } else if (_STATE_CSI_PBYTES === this._state) {
        if (c <= 0x2f) { // SP to / 
          this._ibytes.push(c);
          this._satte = _STATE_CSI_IBYTES;
        } else if (c <= 0x3f) {
          this._pbytes.push(c);
        } else if (c <= 0x7e) {
          this._state = _STATE_GROUND;
          return this._dispatch_csi(this._pbytes, this._ibytes, c)
        } else if (c <= 0x9f) {
          this._state = _STATE_GROUND;
        } else {
          this._state = _STATE_GROUND;
          return false;
        }
      } else if (_STATE_CSI_IBYTES === this._state) {
        if (c <= 0x2f) { // SP to / 
          this._ibytes.push(c);
        } else if (c <= 0x7e) {
          this._state = _STATE_GROUND;
          return this._dispatch_csi(this._pbytes, this._ibytes, c)
        } else if (c <= 0x9f) {
          this._state = _STATE_GROUND;
        } else {
          this._state = _STATE_GROUND;
          return false;
        }
      } else {
        this._state = _STATE_GROUND;
        return false;
      }
      scanner.moveNext()
    }
    return false;
  },

  _dispatch_csi: function _dispatch_csi(pbytes, ibytes, fbyte)
  {
    var prefix = pbytes[0],
        key,
        action,
        handler,
        params,
        i,
        param; 

    if (prefix >= 0x3c && prefix <= 0x3f) {
      pbytes.shift();
      ibytes.unshift(prefix);
    }
    ibytes.push(fbyte);
    key = String.fromCharCode.apply(String, ibytes),
    params = String.fromCharCode.apply(String, pbytes).split(/[;:]/);

    for (i = 0; i < params.length; ++i) {
      param = params[i];
      if (0 === param.length) {
        params[i] = 0;
      } else {
        params[i] = parseInt(param);
      }
    }
    handler = this._csi_map[key];
    if (!handler) {
      return false;
    }
    handler(params);

    return true;
  },

  _dispatch_single_esc: function _dispatch_single_esc(fbyte)
  {
    var f = String.fromCharCode(fbyte),
        handler = this._esc_map[f];
    if (!handler) {
      return false;
    }
    handler();
    return true;
  },

  _dispatch_esc: function _dispatch_esc(ibytes, fbyte)
  {
    var action,
        key,
        handler,
        params,
        f = String.fromCharCode(fbyte),
        i = String.fromCharCode.apply(String, ibytes);
    handler = this._esc_map[i + f];
    if (handler) {
      handler();
      return true;
    }
    handler = this._esc_map[i[0]];
    if (handler) {
      handler(i.substr(1) + f);
      return true;
    }
    return false;
  },

  _dispatch_char: function _dispatch_char(c)
  {
    var action = this._char_map[c];

    if (!action) {
      return false;
    }
    action();
    return true;
  },

  _dispatch_string: function _dispatch_string(value)
  {
    var c = value.shift(),
        handler = this._str_map[c],
        action,
        data;
    if (!handler) {
      return false;
    }
    data = coUtils.Text.safeConvertFromArray(value);
    handler(data);
    return true;
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
        handler = information.handler,
        context = information.context,
        tokens = expression.split(" "),
        token,
        key,
        key_chars,
        prefix,
        length,
        i;
    if (1 === tokens.length) {
      key = Number(tokens[0]);
      this._char_map[key] = function(params) { return handler.apply(context, params) };
      //this._hookmap.body[handler.name] = [key, handler];
    } else {
      prefix = tokens.shift();
      length = tokens.length;
      if ("ESC" === prefix) {
        if (tokens[length - 1] === "ST"
         && tokens[length - 2] === "...") {
          prefix = tokens[0].charCodeAt(0);
          this._str_map[prefix] = function(param) { return handler.call(context, param) };
        } else {
          key = tokens.map(function (token)
          {
            if ("SP" === token) {
              return " ";
            } else if (token.length > 1) {
              return "";
            }
            return token;
          }).join("");
          this._esc_map[key] = function(param) { return handler.call(context, param) };
        }
      } else if ("CSI" === prefix) {
        key = tokens.map(function (token)
        {
          if ("SP" === token) {
            return " ";
          } else if (token.length > 1) {
            return "";
          }
          return token;
        }).join("");
        this._csi_map[key] = function(params) { return handler.apply(context, params) };
      }
    }
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
