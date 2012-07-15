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
    var broker, match, space, name, operator_equal, next,
        target_broker, lower_name, scope, options;

    broker = this._broker;

    match = context.source.match(/^(\s*)([$_\-@a-zA-Z\.]*)\s*(=?)\s*(.*)/);

    if (null === match) {
      this.sendMessage("event/answer-completion", null);
      return;
    }

    [, space, name, operator_equal, next] = match;
    if (!operator_equal && next) {
      this.sendMessage("event/answer-completion", null);
      return;
    }
    target_broker = "global" === context.option ? broker._broker: broker;

    lower_name = name.toLowerCase();
    scope = target_broker.uniget("command/get-settings");

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

// EOF
