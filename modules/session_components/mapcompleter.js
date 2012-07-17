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
var NMapCompleter = new Class().extends(Component);
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

    [all, name, next] = match;

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

};


/**
 * @class CMapCompleter
 *
 */
var CMapCompleter = new Class().extends(Component);
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
    var match, all, name, next,
        next_completer_info, next_completer, option,
        expressions, lower_name, candidates;

    match = context.source.match(/^\s*(\S*)(\s*)/);

    if (null === match) {
      this.sendMessage("event/answer-completion", null);
      return;
    }

    [all, name, next] = match;

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
      return;
    }

    expressions = this.request("get/registered-cmap");
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
            function(candidate)
            {
              return {
                name: candidate.key,
                value: String(candidate.value),
              }
            }),
        });
    }
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

// EOF
