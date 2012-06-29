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
 * @class EventCompleter
 *
 */
var EventCompleter = new Class().extends(Component);
EventCompleter.definition = {

  get id()
    "event_completer",

  /*
   * Search for a given string and notify a listener (either synchronously
   * or asynchronously) of the result
   *
   * @param context - The completion context object. 
   */
  "[completer('event'), enabled]":
  function complete(context)
  {
    var broker, pattern, match, all, name, space,
        next_completer_info, next_completer, option,
        lower_name, candidates;;

    broker = this._broker;

    var { source, option, completers } = context;
    pattern = /^\s*(\S*)(\s*)/;
    match = source.match(pattern);
    [all, name, space] = match;

    if (space) {
      next_completer_info = completers.shift();
      if (next_completer_info) {
        [next_completer, option] = next_completer_info.split("/");
        this.sendMessage("command/query-completion/" + next_completer, {
          source: source.substr(all.length),
          option: option,
          completers: completers,
        });
      } else {
        this.sendMessage("event/answer-completion", null);
      }
      return;
    }

    lower_name = name.toLowerCase();
    candidates = broker.keys.filter(
      function(candidate) 
      {
        return -1 !== candidate.toLowerCase().indexOf(lower_name);
      });

    this.sendMessage(
      "event/answer-completion",
      {
        type: "text",
        query: source, 
        data: candidates.map(
          function(candidate)
          {
            return {
              name: candidate, 
              value: candidate,
            };
          });
      });
  },

};

/**
 * @fn main
 * @brief Module entry point.
 * @param {Broker} broker The Broker object.
 */
function main(broker)
{
  new EventCompleter(broker);
}

// EOF
