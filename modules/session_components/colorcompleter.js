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
 * @class ColorNumberCompleter
 *
 */
let ColorNumberCompleter = new Class().extends(Component)
                                      .depends("renderer");
ColorNumberCompleter.definition = {

  get id()
    "colorcompleter",

  /*
   * Search for a given string and notify a listener (either synchronously
   * or asynchronously) of the result
   *
   * @param context - The completion context object. 
   */
  "[completer('color-number'), enabled]":
  function complete(context)
  {
    let broker = this._broker;
    let { source, option, completers } = context;
    let renderer = this.dependency["renderer"];
    let color_map = "fg" == option ? renderer.normal_color: 
                    "bg" == option ? renderer.background_color:
                    null;
    if (null == color_map) {
      coUtils.Debug.reportError(
        _("Unknown option is detected: '%s'."),
        option);
      broker.notify("event/answer-completion", null);
      return;
    }
    let pattern = /^\s*([0-9]*)(\s*)(.*)(\s?)/;
    let match = source.match(pattern);
    let [all, number, space, name, next] = match;
    if (next) {
      let next_completer_info = completers.shift();
      if (next_completer_info) {
        let [next_completer, option] = next_completer_info.split("/");
        broker.notify(<>command/query-completion/{next_completer}</>, {
          source: source.substr(all.length),
          option: option,
          completers: completers,
        });
      } else {
        broker.notify("event/answer-completion", null);
      }
      return;
    } else if (!space) {
      let numbers = [i for (i in function() { for (let i = 0; i < 256; ++i) yield i; }())]
        .map(function(number) number.toString())
        .filter(function(number_as_string) -1 != number_as_string.indexOf(number));
      if (0 == numbers.length) {
        broker.notify("event/answer-completion", autocomplete_result);
        return;
      }
      let autocomplete_result = {
        type: "color-number",
        query: source, 
        data: numbers.map(function(number) ({
          name: number, 
          value: color_map[number],
        })),
      };
      broker.notify("event/answer-completion", autocomplete_result);
      return;
    }
    let lower_name = name.toLowerCase();
    let data = [
      {
        name: key,
        value: value,
      } for ([key, value] in Iterator(coUtils.Constant.WEB140_COLOR_MAP))
    ].filter(function(pair) 
    {
      if (-1 != pair.name.toLowerCase().indexOf(lower_name)) {
        return true;
      }
      if (0 == pair.value.toLowerCase().indexOf(lower_name)) {
        return true;
      }
      return false;
    });
    if (0 == data.length) {
      broker.notify("event/answer-completion", null);
      return;
    }
    let autocomplete_result = {
      type: "color",
      query: name, 
      option: color_map[number],
      data: data,
    };
    broker.notify("event/answer-completion", autocomplete_result);
  },

};

/**
 * @fn main
 * @brief Module entry point.
 * @param {Broker} broker The Broker object.
 */
function main(broker)
{
  new ColorNumberCompleter(broker);
}


