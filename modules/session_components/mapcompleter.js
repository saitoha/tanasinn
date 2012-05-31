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

/**
 * @class NMapCompleter
 *
 */
let NMapCompleter = new Class().extends(Component);
NMapCompleter.definition = {

  get id()
    "nmap_completer",

  /*
   * Search for a given string and notify a listener (either synchronously
   * or asynchronously) of the result
   *
   * @param context - The completion context object. 
   */
  "[completer('nmap'), enabled]":
  function complete(context)
  {
    let broker = this._broker;
    let { source, option, completers } = context;
    let match = source.match(/^\s*(\S*)(\s*)/);
    if (null === match) {
      broker.notify("event/answer-completion", null);
      return;
    }
    let [all, name, next] = match;
    if (next) {
      let next_completer_info = completers.shift();
      if (next_completer_info) {
        let [next_completer, option] = next_completer_info.split("/");
        broker.notify("command/query-completion/" + next_completer, {
          source: source.substr(all.length),
          option: option,
          completers: completers,
        });
      } else {
        broker.notify("event/answer-completion", null);
      }
      return;
    }

    let expressions = broker.uniget("get/registered-nmap");
    let lower_name = name.toLowerCase();
    let candidates = Object.getOwnPropertyNames(expressions)
      .filter(function(expression) {
        return -1 != expression.toLowerCase().indexOf(lower_name); 
      })
      .map(function(key) {
        return { 
          key: key, 
          value: expressions[key],
        };
      });
    if (0 == candidates.length) {
      broker.notify("event/answer-completion", null);
      return;
    }
    let autocomplete_result = {
      type: "text",
      query: source, 
      data: candidates.map(function(candidate) ({
        name: candidate.key,
        value: String(candidate.value),
      })),
    };
    broker.notify("event/answer-completion", autocomplete_result);
  },

};


/**
 * @class CMapCompleter
 *
 */
let CMapCompleter = new Class().extends(Component);
CMapCompleter.definition = {

  get id()
    "cmap_completer",

  /*
   * Search for a given string and notify a listener (either synchronously
   * or asynchronously) of the result
   *
   * @param context - The completion context object. 
   */
  "[completer('cmap'), enabled]":
  function complete(context)
  {
    let broker = this._broker;
    let { source, option, completers } = context;
    let match = source.match(/^\s*(\S*)(\s*)/);
    if (null === match) {
      broker.notify("event/answer-completion", null);
      return;
    }
    let [all, name, next] = match;
    if (next) {
      let next_completer_info = completers.shift();
      if (next_completer_info) {
        let [next_completer, option] = next_completer_info.split("/");
        broker.notify("command/query-completion/" + next_completer, {
          source: source.substr(all.length),
          option: option,
          completers: completers,
        });
      } else {
        broker.notify("event/answer-completion", null);
      }
      return;
    }

    let expressions = broker.uniget("get/registered-cmap");
    let lower_name = name.toLowerCase();
    let candidates = Object.getOwnPropertyNames(expressions)
      .filter(function(expression) {
        return -1 != expression.toLowerCase().indexOf(lower_name); 
      })
      .map(function(key) {
        return { 
          key: key,
          value: expressions[key],
        };
      });
    if (0 == candidates.length) {
      broker.notify("event/answer-completion", null);
      return;
    }
    let autocomplete_result = {
      type: "text",
      query: source, 
      data: candidates.map(function(candidate) ({
        name: candidate.key,
        value: String(candidate.value),
      })),
    };
    broker.notify("event/answer-completion", autocomplete_result);
    return;
  },

}; // CMapCompleter

/**
 * @fn main
 * @brief Module entry point.
 * @param {Broker} broker The Broker object.
 */
function main(broker)
{
  new NMapCompleter(broker);
  new CMapCompleter(broker);
}


