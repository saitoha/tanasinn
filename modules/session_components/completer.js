/* -*- Mode: JAVASCRIPT; tab-width: 1; indent-tabs-mode: nil; c-basic-offset: 2 -*-
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
 * @class CommandCompleter
 *
 */
var CommandCompleter = new Class().extends(Component).requires("Completer");
CommandCompleter.definition = {

  id: "command_completer",

  /*
   * Search for a given string and notify the result.
   *
   * @param source - The string to search for
   */
  "[subscribe('command/query-completion/command'), type('CompletionContext -> Undefined'), enabled]":
  function startSearch(context)
  {
    var lower_command_name = context.source.split(/\s+/).pop().toLowerCase(),
        commands = this.sendMessage("get/commands")
          .filter(
            function(command)
            {
              return 0 === command
                .name
                .replace(/[\[\]]+/g, "")
                .indexOf(lower_command_name);
            }).sort(
              function(lhs, rhs)
              {
                return lhs.name.localeCompare(rhs.name);
              });

    if (0 === commands.length) {
      this.sendMessage("event/answer-completion", null);
    } else {
      this.sendMessage("event/answer-completion", {
        type: "text",
        query: context.source, 
        data: commands.map(
          function(command)
          {
            return {
              name: command.name.replace(/[\[\]]+/g, ""),
              value: command.description,
            };
          }),
      });
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
  new CommandCompleter(broker);
}

// EOF
