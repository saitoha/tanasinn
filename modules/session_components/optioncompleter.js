/* -*- Mode: JAVASCRIPT; tab-width: 2; indent-tabs-mode: nil; c-basic-offset: 2 -*-
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


/**
 * @class OptionCompleter
 */
var OptionCompleter = new Class().extends(Plugin);
OptionCompleter.definition = {

  id: "optioncompleter",

  /** plugin information */
  getInfo: function getInfo()
  {
    return {
      name: _("Option Completer"),
      description: _("Provides completion information of options."),
      version: "0.1",
    };
  },

  "[persistable] enabled_when_startup": true,

  /** Installs itself.
   *  @param {InstallContext} context A InstallContext object.
   */
  "[install]":
  function install(context)
  {
  },

  /** Uninstalls itself.
   */
  "[uninstall]":
  function uninstall()
  {
  },

  /*
   * Search for a given string and notify a listener (either synchronously
   * or asynchronously) of the result
   *
   * @param context - The completion context object.
   */
  "[completer('option'), pnp]":
  function complete(context)
  {
    var broker = this._broker,
        match = context.source.match(/^(\s*)([$_\-@a-zA-Z\.]*)\s*(=?)\s*(.*)/),
        name,
        operator_equal,
        next,
        target_broker,
        lower_name,
        scope,
        options;

    if (null === match) {
      this.sendMessage("event/answer-completion", null);
      return;
    }

    name = match[2];
    operator_equal = match[3];
    next = match[4];

    if (!operator_equal && next) {
      this.sendMessage("event/answer-completion", null);
      return;
    }
    target_broker = "global" === context.option ? broker._broker: broker;

    lower_name = name.toLowerCase();
    scope = target_broker.callSync("command/get-settings");

    if (!operator_equal) {
      options = [
        {
          key: key,
          value: value
        } for ([key, value] in Iterator(scope))
          if (-1 !== key.toLowerCase().indexOf(lower_name))
      ];

      if (0 === options.length) {
        this.sendMessage("event/answer-completion", null);
      } else {
        this.sendMessage(
          "event/answer-completion",
          {
            type: "text",
            query: context.source,
            data: options.map(
              function mapFunc(option)
              {
                return {
                  name: option.key,
                  value: String(option.value),
                }
              }),
          });
      }
    } else {

      if (scope.hasOwnProperty(name)) {
        this.sendMessage(
          "command/query-completion/js",
          {
            source: next,
          });
      } else {
        this.sendMessage("event/answer-completion", null);
      }
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


}; // OptionCompleter

/**
 * @fn main
 * @brief Module entry point.
 * @param {Broker} broker The Broker object.
 */
function main(broker)
{
  new OptionCompleter(broker);
}

// EOF
