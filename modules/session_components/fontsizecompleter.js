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
 * @class FontsizeCompleter
 *
 */
var FontsizeCompleter = new Class().extends(Component);
FontsizeCompleter.definition = {

  id: "fontsize_completer",

  /*
   * Search for a given string and notify a listener (either synchronously
   * or asynchronously) of the result
   *
   * @param context - The completion context object. 
   */
  "[completer('fontsize'), enabled]":
  function complete(context)
  {
    var pattern = /^\s*(.*)(\s?)/,
        match = context.source.match(pattern),
        all,
        size,
        space,
        next_completer_info,
        next_completer,
        option,
        generator;

    if (null === match) {
      this.sendMessage("event/answer-completion", null);
      return;
    }

    [all, size, space] = match;

    if (space) {
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

      generator = function() 
        { 
          var i, str;

          for (i = 8; i < 100; ++i) {
            str = i.toString(); 
            if (-1 !== str.indexOf(context.source)) {
              yield str;
            }
          }
        } ();

      this.sendMessage(
        "event/answer-completion",
        {
          type: "fontsize",
          query: context.source, 
          data: [i for (i in generator)].map(
            function(size)
            {
              return {
                name: size, 
                value: size,
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
  new FontsizeCompleter(broker);
}

// EOF
