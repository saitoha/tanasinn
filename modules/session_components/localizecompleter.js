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
 * @class LocalizeCompleter
 *
 */
var LocalizeCompleter = new Class().extends(Plugin);
LocalizeCompleter.definition = {

  id: "localize-completer",

  /** plugin information */
  getInfo: function getInfo()
  {
    return {
      name: _("Localize Strings Completer"),
      description: _("Provides completion information of localize strings."),
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
  "[completer('localize'), pnp]":
  function complete(context)
  {
    var pattern = /^\s*([a-zA-Z-]*)(\s*)("?)((?:[^"])*)("?)(\s*)(.*)/,
        match = context.source.match(pattern),
        language = match[1],
        space = match[2],
        message_id = match[4],
        space2 = match[6],
        next = match[7],
        languages,
        lower_message_id,
        dict,
        data;

    if (!space) {
      languages = [key for ([key, ] in Iterator(coUtils.Constant.LOCALE_ID_MAP))]
        .filter(
          function filterFunc(iso639_language)
          {
            return -1 !== iso639_language.toLowerCase()
              .indexOf(language.toLowerCase());
          });
      if (0 === languages.length) {
        this.sendMessage("event/answer-completion", null);
      } else {
        this.sendMessage(
          "event/answer-completion",
          {
            type: "text",
            query: context.source,
            data: languages.map(
              function mapFunc(language)
              {
                return {
                  name: language,
                  value: coUtils.Constant.LOCALE_ID_MAP[language],
                };
              }),
          });
      }
    } else {
      lower_message_id = message_id.toLowerCase();

      if (!this._keys) {
        this._keys = coUtils.Localize.getMessages();
      }

      dict = coUtils.Localize.getDictionary(language);
      data = [
        {
          name: '"' + key + '"',
          value: dict[key] || "",
        } for ([, key] in Iterator(this._keys))
      ].filter(
        function filterFunc(pair)
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


}; // LocalizeCompleter


/**
 * @fn main
 * @brief Module entry point.
 * @param {Broker} broker The Broker object.
 */
function main(broker)
{
  new LocalizeCompleter(broker);
}

// EOF
