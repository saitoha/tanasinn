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
 *
 * @class Hooker
 *
 */
var Hooker = new Class().extends(Plugin)
                        .depends("parser");
Hooker.definition = {

  id: "hooker",

  /** plugin information */
  getInfo: function getInfo()
  {
    return {
      name: _("Hooker"),
      version: "0.1",
      description: _("Switch Debugger's step execution state")
    };
  },

  "[persistable] enabled_when_startup": true,

  _buffer: null,
  _hooked: false,
  _step_mode: false,

  /** Installs itself.
   *  @param {InstallContext} context A InstallContext object.
   */
  "[install]":
  function install(context)
  {
    this._buffer = [];
    this._parser = context["parser"];
  },

  /** Uninstalls itself
   */
  "[uninstall]":
  function uninstall()
  {
    this._buffer = null;
    this._parser = null;
  },

  /** Suspend TTY and enter debug session. */
  "[subscribe('command/debugger-pause'), enabled]":
  function pause()
  {
    this._step_mode = true;
  },

  /** Resume TTY and close debug session */
  "[subscribe('command/debugger-resume'), enabled]":
  function resume()
  {
    var buffer = this._buffer,
        action,
        result;

    this._step_mode = false;

    // drain queued actions.
    while (0 !== buffer.length) {
      action = buffer.shift();
      result = action();
      this.sendMessage("command/debugger-trace-sequence", result);
    }
    this.sendMessage("command/flow-control", true);
    this.sendMessage("command/draw"); // redraw
  },

  /** Execute 1 command. */
  "[subscribe('command/debugger-step'), enabled]":
  function step()
  {
    var buffer,
        action,
        result;

    if (this._hooked) {
      buffer = this._buffer;
      action = buffer.shift();
      if (action) {
        result = action();
        this.sendMessage("command/debugger-trace-sequence", result);
        this.sendMessage("command/draw"); // redraw
      } else {
        this.sendMessage("command/flow-control", true);
      }
    }
  },

  "[subscribe('command/debugger-trace-on'), enabled]":
  function set()
  {
    var parser,
        buffer,
        self,
        action,
        result_cache,
        result,
        sequence;

    function make_action(sequence, action)
    {
      buffer.push(
        function do_action()
        {
          var result = action();
          return [result, sequence];
        });
    }

    if (!this._hooked) {

      parser = this.dependency["parser"];
      buffer = this._buffer;
      self = this;
      this._hooked = true;

      // hook parser
      parser.parse = function parse_alternative(data)
        {
          if (self._step_mode) {
            this.sendMessage("command/flow-control", false);
          }
          for (action in parser.__proto__.parse.call(parser, data)) {
            sequence = parser._scanner.getCurrentToken();
            make_action(sequence, action);
          }

          // do action
          if (!self._step_mode) {
            while (buffer.length) {
              action = buffer.shift();
              result_cache = [];
              this.sendMessage("command/debugger-trace-sequence", result_cache);
              result = action();
              result_cache[0] = result[0];
              result_cache[1] = result[1];
            }
          }
        };
    };
  },

  "[subscribe('command/debugger-trace-off'), enabled]":
  function unset()
  {
    var parser;

    if (this._hooked) {
      parser = this._parser;
      delete parser.parse; // uninstall hook
      this._hooked = false;
    }
  },

  /** test */
  "[test]":
  function()
  {
    var enabled = this.enabled;

    try {
      this.enabled = false;
      this.enabled = true;
      this.enabled = false;
    } finally {
      this.enabled = enabled;
    }
  },


}; // Hooker


/**
 * @fn main
 * @brief Module entry point.
 * @param {Broker} broker The Broker object.
 */
function main(broker)
{
  new Hooker(broker);
}

// EOF
