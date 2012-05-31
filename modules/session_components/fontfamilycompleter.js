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
let FontFamilyCompleter = new Class().extends(Component);
FontFamilyCompleter.definition = {

  get id()
    "font_family_completer",

  /*
   * Search for a given string and notify a listener (either synchronously
   * or asynchronously) of the result
   *
   * @param context - The completion context object. 
   */
  "[completer('font-family'), enabled]":
  function complete(context)
  {
    let broker = this._broker;
    let { source, option, completers } = context;
    let pattern = /^\s*(.*)(\s?)/;
    let match = source.match(pattern);
    let [all, name, space] = match;
    if (space) {
      let next_completer_info = completers.shift();
      if (next_completer_info) {
        let [next_completer, option] = next_completer_info.split("/");
        broker.notify("command/query-completion/" + next_completer, {
          source: source.substr(all.length),
          option: option,
          completers: completers,
        });
      } else {
        broker.notify("event/answer-completion", null);
      }
      return;
    }
    let font_list = Components
      .classes["@mozilla.org/gfx/fontenumerator;1"]
      .getService(Components.interfaces.nsIFontEnumerator)
//      .EnumerateAllFonts({})
      .EnumerateFonts("x-western", "monospace", {})
      .filter(function(font_family) 
        -1 != font_family.toLowerCase().indexOf(name.toLowerCase()));
    let autocomplete_result = {
      type: "font-family",
      query: source, 
      data: font_list.map(function(font) ({
        name: font, 
        value: font,
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
  new FontFamilyCompleter(broker);
}


