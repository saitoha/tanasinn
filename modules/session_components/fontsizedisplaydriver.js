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
 * @class FontsizeCompletionDisplayDriver
 *
 */
var FontsizeCompletionDisplayDriver = new Class().extends(Plugin);
FontsizeCompletionDisplayDriver.definition = {

  id: "fontsize-completion-display-driver",

  /** plugin information */
  getInfo: function getInfo()
  {
    return {
      name: _("Color Completion Display Driver"),
      version: "0.1",
      description: _("The display component of font size completion.")
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

  "[subscribe('get/completion-display-driver/color'), pnp]":
  function onDisplayDriversRequested()
  {
    return this;
  },

  "[subscribe('get/completion-display-driver/fontsize'), pnp]":
  function onDisplayDriversRequested()
  {
    return this;
  },

  drive: function drive(grid, result, current_index)
  {
    var owner_document = grid.ownerDocument,
        rows = grid.appendChild(owner_document.createElement("rows")),
        i,
        search_string,
        completion_text,
        match_position;

    for (i = 0; i < result.data.length; ++i) {
      search_string = result.query.toLowerCase();
      completion_text = result.data[i].name;
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
            color: "white",
          }: "",
          childNodes: [
            {
              tagName: "box",
              style: {
                fontSize: "20px",
                margin: "0px 8px",
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
                    text: completion_text.substr(match_position + search_string.length) + "px"
                  },
                ],
            },
            {
              tagName: "label",
              style: {
                fontSize: completion_text + "px",
                margin: "0px",
              },
              value: "abc123%& \u0353\u2874\u2953\u2231\u7453\u1123\u2123\u0123\uC642",
            },
          ],
        });
    } // for i
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


}; // FontSizeDisplayDriver

/**
 * @fn main
 * @brief Module entry point.
 * @param {Broker} broker The Broker object.
 */
function main(broker)
{
  new FontsizeCompletionDisplayDriver(broker);
}

// EOF
