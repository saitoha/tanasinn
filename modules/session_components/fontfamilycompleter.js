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
 * @class FontFamilyCompleter
 *
 */
var FontFamilyCompleter = new Class().extends(Component);
FontFamilyCompleter.definition = {

  id: "font_family_completer",

  /*
   * Search for a given string and notify a listener (either synchronously
   * or asynchronously) of the result
   *
   * @param context - The completion context object. 
   */
  "[completer('font-family'), enabled]":
  function complete(context)
  {
    var broker, pattern, match, all, name, space,
        next_completer_info, next_completer, option,
        font_list;

    broker = this._broker;

    pattern = /^\s*(.*)(\s?)/;
    match = context.source.match(pattern);
    [all, name, space] = match;

    if (space) {
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
    } else {

      font_list = Components
        .classes["@mozilla.org/gfx/fontenumerator;1"]
        .getService(Components.interfaces.nsIFontEnumerator)
//        .EnumerateAllFonts({})
        .EnumerateFonts("x-western", "monospace", {})
        .filter(function(font_family) 
          -1 != font_family.toLowerCase().indexOf(name.toLowerCase()));

      this.sendMessage(
        "event/answer-completion",
        {
          type: "font-family",
          query: context.source, 
          data: font_list.map(
            function(font)
            {
              return {
                name: font, 
                value: font,
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
  new FontFamilyCompleter(broker);
}

// EOF
