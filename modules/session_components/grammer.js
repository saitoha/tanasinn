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
 * Portions created by the Initial Developer are Copyright (C) 2010 - 2013
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
    _STATE_STRING        = 6,
    _STATE_ST            = 7;

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

  /** provide plugin information */
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
    this._ibytes = [];
    this._pbytes = [];
  },

  /** Uninstalls itself.
   */
  "[uninstall]":
  function uninstall()
  {
    this._state = _STATE_GROUND;
    this._ibytes = null;
    this._pbytes = null;
  },

  /** The post-initializer method which called when the session
   *  is initialized. */
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

  "[subscribe('command/reset-sequences'), pnp]":
  function resetSequences()
  {
    this._char_map = [];
    this._esc_map = [];
    this._csi_map = [];
    this._str_map = [];
  },

  /** 
   *
   */
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
    var c,
        state = this._state,
        ibytes = this._ibytes,
        pbytes = this._pbytes;

    while (!scanner.isEnd) {
      c = scanner.current();
      if (_STATE_GROUND === state) {
        if (0x1b === c) {
          state = _STATE_ESC;
        } else if (c < 0x20) { // C0
          this._dispatch_char(c);
        } else if (c < 0x7f) {
          break;
        } else if (c <= 0x9f) { // DEL, C1
          if (0x90 === c) {
            ibytes = [c - 0x40];
            state = _STATE_STRING;
          } else {
            this._dispatch_char(c);
          }
        } else {
          break;
        }
      } else if (_STATE_ESC === state) {
        if (0x5b === c) { // [
          ibytes = [];
          pbytes = [];
          state = _STATE_CSI_PBYTES;
        } else if (0x18 === c || 0x1a === c) {
          state = _STATE_GROUND;
        } else if (c < 0x20) { // C0
          this._dispatch_char(c);
        } else if (c <= 0x2f) { // SP to /
          ibytes = [c];
          state = _STATE_ESC_IBYTES;
        } else if (0x5d === c) { // ]
          ibytes = [c];
          state = _STATE_OSC;
        } else if (0x50 === c || 0x58 === c || 0x5e === c || 0x5f === c) {
          ibytes = [c];
          state = _STATE_STRING;
        } else if (c <= 0x7e) { // 0 to ~
          state = _STATE_GROUND;
          this._dispatch_single_esc(c);
        } else {
          state = _STATE_GROUND;
        }
      } else if (_STATE_CSI_PBYTES === state) {
        if (c <= 0x2f) { // SP to /
          if (c >= 0x20) { // C0
            ibytes.push(c);
            state = _STATE_CSI_IBYTES;
          } else {
            if (0x1b === c) {
              state = _STATE_ESC;
            } else if (0x18 === c || 0x1a === c) {
              state = _STATE_GROUND;
            } else {
              this._dispatch_char(c);
            }
          }
        } else if (c <= 0x3f) {
          pbytes.push(c);
        } else if (c <= 0x7e) {
          state = _STATE_GROUND;
          this._dispatch_csi_no_ibytes(pbytes, c)
        } else if (c <= 0x9f) {
          this._dispatch_char(c)
        } else {
          state = _STATE_GROUND;
        }
      } else if (_STATE_CSI_IBYTES === state) {
        if (0x1b === c) {
          state = _STATE_ESC;
        } else if (0x18 === c || 0x1a === c) {
          state = _STATE_GROUND;
          this._dispatch_char(c);
        } else if (c < 0x20) { // C0
          this._dispatch_char(c);
        } else if (c <= 0x2f) { // SP to /
          ibytes.push(c);
        } else if (c <= 0x7e) {
          state = _STATE_GROUND;
          this._dispatch_csi(pbytes, ibytes, c)
        } else if (c <= 0x9f) {
          this._dispatch_char(c)
        } else {
          state = _STATE_GROUND;
        }
      } else if (_STATE_OSC === state) {
        if (0x1b === c) {
          state = _STATE_ST;
        } else if (0x07 === c) {
          state = _STATE_GROUND;
          this._dispatch_string(ibytes);
        } else if (0x18 === c || 0x1a === c) {
          state = _STATE_GROUND;
        } else if (c < 0x08) {
          state = _STATE_GROUND;
        } else if (c < 0x0e) {
          state = _STATE_GROUND;
          ibytes.push(c);
        } else if (c < 0x20) {
          state = _STATE_GROUND;
        } else {
          ibytes.push(c);
        }
      } else if (_STATE_STRING === state) {
        if (0x1b === c) {
          state = _STATE_ST;
          this._dispatch_char(c);
        } else if (0x07 === c || 0x9c === c) {
          state = _STATE_GROUND;
          this._dispatch_string(ibytes);
        } else if (0x18 === c || 0x1a === c) {
          state = _STATE_GROUND;
        } else if (c < 0x08) {
          state = _STATE_GROUND;
        } else if (c < 0x0e) {
          ibytes.push(c);
        } else if (c < 0x20) {
          state = _STATE_GROUND;
        } else {
          ibytes.push(c);
        }
      } else if (_STATE_ST === state) {
        if (0x5c === c) {
          this._dispatch_string(ibytes);
        } else if (0x5b === c) { // [
          ibytes = [];
          pbytes = [];
          state = _STATE_CSI_PBYTES;
        } else if (0x18 === c || 0x1a === c) {
          state = _STATE_GROUND;
        } else if (c < 0x20) { // C0
          this._dispatch_char(c);
        } else if (c <= 0x2f) { // SP to /
          ibytes = [c];
          state = _STATE_ESC_IBYTES;
        } else if (0x50 === c || 0x58 === c || 0x5e === c || 0x5f === c) {
          ibytes = [c];
          state = _STATE_STRING;
        } else if (0x5d === c) { // ]
          ibytes = [c];
          state = _STATE_OSC;
        } else if (c <= 0x7e) { // 0 to ~
          state = _STATE_GROUND;
          this._dispatch_single_esc(c);
        } else {
          state = _STATE_GROUND;
        }
      } else if (_STATE_ESC_IBYTES === state) {
        if (c < 0x20) { // C0
          if (0x1b === c) {
            state = _STATE_ESC;
          } else if (0x18 === c || 0x1a === c) {
            state = _STATE_GROUND;
            this._dispatch_char(c);
          } else {
            this._dispatch_char(c);
          }
        } else if (c <= 0x2f) { // SP to /
          // 00101111
          ibytes.push(c);
        } else if (c <= 0x7e) { // 0 to ~
          state = _STATE_GROUND;
          this._dispatch_esc(ibytes, c)
        } else if (c <= 0x9f) {
          this._dispatch_char(c)
        } else {
          state = _STATE_GROUND;
        }
      }
      scanner.moveNext()
    }
    this._state = state;
    this._pbytes = pbytes;
    this._ibytes = ibytes;
  },

  _dispatch_csi:
  function _dispatch_csi(pbytes, ibytes, fbyte)
  {
    var action,
        handler,
        params,
        i,
        c,
        param,
        key = 0;

    params = [];
    param = 0;

    for (i = 0; i < pbytes.length; ++i) {
      c = pbytes[i];
      if (c < 0x3a) {
        param = param * 10 + c - 0x30;
      } else if (c < 0x3c) {
        params.push(param);
        param = 0;
      } else {
        key = key << 8 | c;
      }
    }
    params.push(param);
    for (i = 0; i < ibytes.length; ++i) {
      c = ibytes[i];
      key = key << 8 | c;
    }
    key = key << 8 | fbyte;
    handler = this._csi_map[key];
    if (!handler) {
      return;
    }
    handler(params);
  },

  _dispatch_csi_no_ibytes:
  function _dispatch_csi_no_ibytes(pbytes, fbyte)
  {
    var action,
        handler,
        params,
        i,
        c,
        param,
        key = 0;

    params = [];
    param = 0;

    for (i = 0; i < pbytes.length; ++i) {
      c = pbytes[i];
      if (c < 0x3a) {
        param = param * 10 + c - 0x30;
      } else if (c < 0x3c) {
        params.push(param);
        param = 0;
      } else {
        key = key << 8 | c;
      }
    }
    params.push(param);
    key = key << 8 | fbyte;
    handler = this._csi_map[key];
    if (!handler) {
      return;
    }
    handler(params);
  },

  _dispatch_single_esc: function _dispatch_single_esc(fbyte)
  {
    var handler = this._esc_map[fbyte];

    if (!handler) {
      return;
    }
    handler();
  },

  _dispatch_esc: function _dispatch_esc(ibytes, fbyte)
  {
    var action,
        key = 0,
        handler,
        params,
        c,
        i;

    for (i = 0; i < ibytes.length; ++i) {
      c = ibytes[i];
      key = key << 8 | c;
    }
    key = key << 8 | fbyte;
    handler = this._esc_map[key];
    if (handler) {
      handler();
      return;
    }

    handler = this._esc_map[ibytes[0]];
    if (handler) {
      key = key ^ (ibytes[0] << 8 * ibytes.length);
      handler(key);
    }
  },

  _dispatch_char: function _dispatch_char(c)
  {
    var action = this._char_map[c];

    if (!action) {
      return;
    }
    action();
  },

  _dispatch_string: function _dispatch_string(value)
  {
    var c = value.shift(),
        handler = this._str_map[c],
        action,
        data;
    if (!handler) {
      return;
    }
    data = coUtils.Text.safeConvertFromArray(value);
    handler(data);
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

    // store binded actions
    if (1 === tokens.length) {
      key = Number(tokens[0]);
      this._char_map[key] = function(params) { return handler.apply(context, params) };
    } else {
      prefix = tokens.shift();
      length = tokens.length;
      if ("ESC" === prefix) {
        if (tokens[length - 1] === "ST"
         && tokens[length - 2] === "...") {
          prefix = tokens[0].charCodeAt(0);
          this._str_map[prefix] = function(param) { return handler.call(context, param) };
        } else {
          key = 0;
          for (i = 0; i < tokens.length; ++i) {
            token = tokens[i];
            if ("SP" === token) {
              key = key << 8 | 0x20;
            } else if (1 === token.length) {
              key = key << 8 | token.charCodeAt(0);
            }
          }
          this._esc_map[key] = function(param) { return handler.call(context, param) };
        }
      } else if ("CSI" === prefix) {
        key = 0;
        for (i = 0; i < tokens.length; ++i) {
          token = tokens[i];
          if ("SP" === token) {
            key = key << 8 | 0x20;
          } else if (1 === token.length) {
            key = key << 8 | token.charCodeAt(0);
          }
        }
        this._csi_map[key] = function(params) { return handler.apply(context, params) };
      }
    }
  }, // append

  /** test */
  "[test]":
  function()
  {
    var enabled = this.enabled;

    try {
      if (enabled) {
        coUtils.Debug.assert(null !== this._ibytes);
        coUtils.Debug.assert(null !== this._pbytes);
      } else {
        coUtils.Debug.assert(null === this._ibytes);
        coUtils.Debug.assert(null === this._pbytes);
      }
    } finally {
    }
  },


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
