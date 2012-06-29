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
 * @class LocalizeCompleter
 *
 */
var LocalizeCompleter = new Class().extends(Component);
LocalizeCompleter.definition = {

  get id()
    "localize-completer",

  /*
   * Search for a given string and notify a listener (either synchronously
   * or asynchronously) of the result
   *
   * @param context - The completion context object. 
   */
  "[completer('localize'), enabled]":
  function complete(context)
  {
    var pattern, match, all, language, space,
        quote_start, message_id, quote_end, space2, next,
        languages, lower_message_id, dict, data;

    pattern = /^\s*([a-zA-Z-]*)(\s*)("?)((?:[^"])*)("?)(\s*)(.*)/;
    match = context.source.match(pattern);

    [all, language, space, quote_start, message_id, quote_end, space2, next] = match;

    if (!space) {
      languages = [key for ([key, ] in Iterator(coUtils.Constant.LOCALE_ID_MAP))]
        .filter(function(iso639_language) 
          { 
            return -1 != iso639_language.toLowerCase()
              .indexOf(language.toLowerCase()); 
          });
      if (0 === languages.length) {
        this.sendMessage("event/answer-completion", autocomplete_result);
      } else {
        this.sendMessage(
          "event/answer-completion",
          {
            type: "text",
            query: context.source, 
            data: languages.map(function(language) ({
              name: language, 
              value: coUtils.Constant.LOCALE_ID_MAP[language],
            })),
          });
      }
    } else {
      lower_message_id = message_id.toLowerCase();

      if (!this._keys) {
        this._keys = [id for (id in coUtils.Localize.generateMessages())];
      }

      dict = coUtils.Localize.getDictionary(language);
      data = [
        {
          name: '"' + key + '"',
          value: dict[key] || "",
        } for ([, key] in Iterator(this._keys))
      ].filter(function(pair) 
      {
        if (-1 !== pair.name.toLowerCase().indexOf(lower_message_id)) {
          return true;
        }
        return false;
      });
      if (0 === data.length) {
        this.sendMessage("event/answer-completion", null);
      } else {
        if (!space2) {
          this.sendMessage(
            "event/answer-completion", 
            {
              type: "text",
              option: "quoted",
              query: message_id, 
              data: data,
            });
        } else {
          this.sendMessage(
            "event/answer-completion",
            {
              type: "text",
              option: "quoted",
              query: next, 
              data: data,
            });
        }
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
  new LocalizeCompleter(broker);
}


