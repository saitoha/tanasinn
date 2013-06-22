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
 * @class EventCompleter
 *
 */
var EventCompleter = new Class().extends(Plugin);
EventCompleter.definition = {

  id: "event_completer",

  /** plugin information */
  getInfo: function getInfo()
  {
    return {
      name: _("Event Completer"),
      description: _("Provides completion information of tupstart events."),
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
  "[completer('event'), pnp]":
  function complete(context)
  {
    var broker = this._broker,
        pattern = /^\s*(\S*)(\s*)/,
        match = context.source.match(pattern),
        all,
        name,
        space,
        next_completer_info,
        next_completer,
        option,
        lower_name,
        candidates,
        completion_info;

    [all, name, space] = match;

    if (space) {
      next_completer_info = completers.shift();
      if (next_completer_info) {
        completion_info = next_completer_info.split("/");
        next_completer = completion_info[0];
        option = completion_info[1];
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
        query: context.source,
        data: candidates.map(
          function(candidate)
          {
            return {
              name: candidate,
              value: candidate,
            };
          }),
      });
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


}; // EventCompleter

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
