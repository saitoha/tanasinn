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
 * @class PluginsCompleter
 */
var PluginsCompleter = new Class().extends(Plugin);
PluginsCompleter.definition = {

  id: "plugins_completer",

  getInfo: function getInfo()
  {
    return {
      name: _("Plugins Completer"),
      description: _("Provides completion information of plugins."),
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
   * @param source - The string to search for
   * @param listener - A listener to notify when the search is complete
   */
  "[completer('plugin'), pnp]":
  function complete(context)
  {
    var match = context.source.match(/^(\s*)([$_\-@a-zA-Z\.]*)(\s?)/),
        all,
        space,
        name,
        next,
        next_completer_info,
        next_completer,
        option,
        modules,
        candidates;

    if (null === match) {
      this.sendMessage("event/answer-completion", null);
      return;
    }

    all = match[0];
    space = match[1];
    name = match[2];
    next = match[3];

    if (next) {
      next_completer_info = context.completers.shift();
      if (next_completer_info) {
        [next_completer, option] = next_completer_info.split("/");
        this.sendMessage("command/query-completion/" + next_completer, {
          source: context.source.substr(all.length),
          option: option,
          completers: context.completers,
        });
      } else {
        this.sendMessage("event/answer-completion", null);
      }
      return;
    }

    modules = this.sendMessage("get/components");
    candidates = [
      {
        key: module.id,
        value: module
      } for ([, module] in Iterator(modules))
        if (module.id && module.id.match(context.source)
            && module.getEnabled && module.getEnabled() === ("enabled" === context.option))
    ];
    if (0 === candidates.length) {
      this.sendMessage("event/answer-completion", null);
      return;
    }

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
  },

}; // PluginsCompleter

/**
 * @fn main
 * @brief Module entry point.
 * @param {Broker} broker The Broker object.
 */
function main(broker)
{
  new PluginsCompleter(broker);
}

// EOF
