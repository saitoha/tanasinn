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
 * @class ComponentsCompleter
 */
let ComponentsCompleter = new Class().extends(Component);
ComponentsCompleter.definition = {

  get id()
    "components_completer",

  /*
   * Search for a given string and notify a listener (either synchronously
   * or asynchronously) of the result
   *
   * @param context - The completion context object. 
   */
  "[completer('components'), enabled]":
  function complete(context)
  {
    let broker = this._broker;
    let { source, option, completers } = context;
    let match = source.match(/^(\s*)([$_\-@a-zA-Z\.]*)(\s?)/);
    if (null === match) {
      broker.notify("event/answer-completion", null);
      return;
    }
    let [all, space, name, next] = match;
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
    }
    let modules = broker.notify("get/components");
    let candidates = [
      {
        key: module.id, 
        value: module.info ? 
          "[" + module.info..name + "] " + module.info..description: module.toString()
      } for ([, module] in Iterator(modules)) 
        if (module.id && module.id.match(source))
    ];
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
 * @class PluginsCompleter
 */
let PluginsCompleter = new Class().extends(Component);
PluginsCompleter.definition = {

  get id()
    "plugins_completer",

  /*
   * Search for a given string and notify a listener (either synchronously
   * or asynchronously) of the result
   *
   * @param source - The string to search for
   * @param listener - A listener to notify when the search is complete
   */
  "[completer('plugin'), enabled]":
  function complete(context)
  {
    let broker = this._broker;
    let { source, option, completers } = context;
    let match = source.match(/^(\s*)([$_\-@a-zA-Z\.]*)(\s?)/);
    if (null === match) {
      broker.notify("event/answer-completion", null);
      return;
    }
    let [all, space, name, next] = match;
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
    }
    let modules = broker.notify("get/components");
    let candidates = [
      {
        key: module.id, 
        value: module
      } for ([, module] in Iterator(modules)) 
        if (module.id && module.id.match(source) 
            && module.enabled == (option == "enabled"))
    ];
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

};

/**
 * @fn main
 * @brief Module entry point.
 * @param {Broker} broker The Broker object.
 */
function main(broker)
{
  new ComponentsCompleter(broker);
  new PluginsCompleter(broker);
}


