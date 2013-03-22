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
 * Portions created by the Initial Developer are Copyright (C) 2010 - 2011
 * the Initial Developer. All Rights Reserved.
 *
 * ***** END LICENSE BLOCK ***** */

"use strict";

/**
 * @class NMapCompleter
 *
 */
var NMapCompleter = new Class().extends(Plugin);
NMapCompleter.definition = {

  id: "nmap_completer",

  /** plugin information */
  getInfo: function getInfo()
  {
    return {
      name: _("Normal Mode Mapping Completer"),
      description: _("Provides completion information of normal mode mappings."),
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
  "[completer('nmap'), pnp]":
  function complete(context)
  {
    var match = context.source.match(/^\s*(\S*)(\s*)/),
        all,
        name,
        next,
        next_completer_info,
        next_completer,
        option,
        expressions,
        lower_name,
        candidates;

    if (null === match) {
      this.sendMessage("event/answer-completion", null);
      return;
    }

    all = match[0];
    name = match[1];
    next = match[2];

    if (next) {
      next_completer_info = context.completers.shift();
      if (next_completer_info) {
        [next_completer, option] = next_completer_info.split("/");
        this.sendMessage(
          "command/query-completion/" + next_completer,
          {
            source: context.source.substr(all.length),
            option: option,
            completers: context.completers,
          });
      } else {
        this.sendMessage("event/answer-completion", null);
      }

    } else {

      expressions = this.request("get/registered-nmap");
      lower_name = name.toLowerCase();
      candidates = Object.getOwnPropertyNames(expressions)
        .filter(
          function filterFunc(expression)
          {
            return -1 !== expression.toLowerCase().indexOf(lower_name);
          })
        .map(
          function mapFunc(key)
          {
            return {
              key: key,
              value: expressions[key],
            };
          });

      if (0 === candidates.length) {
        this.sendMessage("event/answer-completion", null);
      } else {
        this.sendMessage(
          "event/answer-completion",
          {
            type: "text",
            query: context.source,
            data: candidates.map(
              function mapFunc(candidate)
              {
                return {
                  name: candidate.key,
                  value: String(candidate.value),
                }
              }),
          });
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


}; // NMapCompleter


/**
 * @fn main
 * @brief Module entry point.
 * @param {Broker} broker The Broker object.
 */
function main(broker)
{
  new NMapCompleter(broker);
}

// EOF
