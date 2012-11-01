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
 * @class TextCompletionDisplayDriver
 *
 */
var TextCompletionDisplayDriver = new Class().extends(Plugin);
TextCompletionDisplayDriver.definition = {

  id: "text-completion-display-driver",

  getInfo: function getInfo()
  {
    return {
      name: _("Text Completion Display Driver"),
      version: "0.1",
      description: _("The display component of text completion.")
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

  /** Uninstalls itself 
   */
  "[uninstall]":
  function uninstall() 
  {
  },


  "[subscribe('get/completion-display-driver/text'), pnp]":
  function onDisplayDriversRequested()
  {
    return this;
  },

  drive: function drive(grid, result, current_index) 
  {
    var owner_document = grid.ownerDocument,
        rows = grid.appendChild(owner_document.createElement("rows")),
        i,
        data,
        search_string,
        completion_text,
        match_position;

    for (i = 0; i < result.data.length; ++i) {
      data = result.data[i];
      search_string = result.query.toLowerCase();
      completion_text = data.name;

      if ("quoted" === result.option) {
        completion_text = completion_text.slice(1, -1);
      }
      if (completion_text.length > 32 && i !== current_index) {
        completion_text = completion_text.substr(0, 32) + "...";
      }

      match_position = completion_text
        .toLowerCase()
        .indexOf(search_string);

      this.request(
        "command/construct-chrome", 
        {
          parentNode: rows,
          tagName: "row",
          style: i === current_index ? {
            background: "#226",
            padding: "2px",
            color: "white",
          }: "",
          childNodes: [
            {
              tagName: "box",
              style: { 
                paddingTop: "3px",
                margin: "0px",
                overflow: "hidden",
                paddingLeft: "8px",
                fontSize: "19px",
              },
              childNodes: -1 === match_position ? 
                { 
                  text: completion_text
                }:
                [
                  { text: completion_text.substr(0, match_position) },
                  {
                    tagName: "label",
                    value: completion_text.substr(match_position, search_string.length),
                    style: { 
                      margin: "0px", 
                      fontWeight: "bold", 
                      color: "#f00", 
                      textDecoration: "underline",
                    },
                  },
                  { 
                    text: completion_text.substr(match_position + search_string.length)
                  },
                ],
            },
            {
              tagName: "label",
              style: { 
                paddingTop: "2px",
                fontSize: "16px",
                textShadow: "0px 0px 2px white",
                fontFamily: "Times New Roman",
                color: "#000",
              },
              value: data.value,
              crop: "end",
            },
          ],
        });
    } // for i
  },
}; // TextCompletionDisplayDriver

/**
 * @fn main
 * @brief Module entry point.
 * @param {Broker} broker The Broker object.
 */
function main(broker)
{
  new TextCompletionDisplayDriver(broker);
}

// EOF
