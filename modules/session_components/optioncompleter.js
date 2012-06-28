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
 * @class OptionCompleter
 */
var OptionCompleter = new Class().extends(Component);
OptionCompleter.definition = {

  get id()
    "optioncompleter",

  /*
   * Search for a given string and notify a listener (either synchronously
   * or asynchronously) of the result
   *
   * @param context - The completion context object. 
   */
  "[completer('option'), enabled]":
  function complete(context)
  {
    var broker, match;

    broker = this._broker;

    var { source, completers } = context;
    match = source.match(/^(\s*)([$_\-@a-zA-Z\.]*)\s*(=?)\s*(.*)/);

    if (null === match) {
      this.sendMessage("event/answer-completion", null);
      return;
    }

    let [, space, name, operator_equal, next] = match;
    if (!operator_equal && next) {
      this.sendMessage("event/answer-completion", null);
      return;
    }
    let target_broker = "global" ==  context.option ? broker._broker: broker;

    let lower_name = name.toLowerCase();
    let scope = target_broker.uniget("command/get-settings");
    if (!operator_equal) {
      let options = [
        {
          key: key, 
          value: value
        } for ([key, value] in Iterator(scope)) 
          if (-1 != key.toLowerCase().indexOf(lower_name))
      ];
      if (0 == options.length) {
        this.sendMessage("event/answer-completion", null);
        return;
      }
      let autocomplete_result = {
        type: "text",
        query: source, 
        data: options.map(function(option) ({
          name: option.key,
          value: String(option.value),
        })),
      };
      this.sendMessage("event/answer-completion", autocomplete_result);
      return;
    }

    if (scope.hasOwnProperty(name)) {
      let completion_context = {
        source: next,
      };
      this.sendMessage("command/query-completion/js", completion_context);
      return;
    }
    this.sendMessage("event/answer-completion", null);
    return;
  },

};

/**
 * @fn main
 * @brief Module entry point.
 * @param {Broker} broker The Broker object.
 */
function main(broker)
{
  new OptionCompleter(broker);
}


