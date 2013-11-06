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
 * @class TextCompletionDisplayDriver
 *
 */
var TextCompletionDisplayDriver = new Class().extends(Plugin);
TextCompletionDisplayDriver.definition = {

  id: "text-completion-display-driver",

  /** plugin information */
  getInfo: function getInfo()
  {
    return {
      name: _("Launcher Text Completion Display Driver"),
      version: "0.1",
      description: _("Draw text completion information for launcher.")
    };
  },

  "[persistable, watchable] enabled_when_startup": true,

  /** Installs itself.
   *  @param {InstallContext} context A InstallContext object.
   */
  "[install]":
  function install(context)
  {
  },

  /** Uninstalls itself.
   *  @param {InstallContext} context A InstallContext object.
   */
  "[uninstall]":
  function uninstall(context)
  {
  },

  "[subscribe('get/completion-display-driver/text'), pnp]":
  function onDisplayDriverRequested(broker)
  {
    return this;
  },

  drive: function drive(grid, result, current_index)
  {
    var rows = grid.appendChild(grid.ownerDocument.createElement("rows")),
        i = 0,
        search_string,
        completion_text,
        match_position;

    for (; i < result.labels.length; ++i) {
      search_string = result.query.toLowerCase();
      completion_text = result.labels[i];

      if ("quoted" === result.option) {
        completion_text = completion_text.slice(1, -1);
      }
      if (completion_text.length > 20 && i !== current_index) {
        completion_text = completion_text.substr(0, 20) + "...";
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
            color: "white",
          }: {
          },
          childNodes: [
            {
              tagName: "box",
              style: {
                fontSize: "1.2em",
                width: "50%",
                margin: "0px",
                overflow: "hidden",
                paddingLeft: "8px",
              },
              childNodes: -1 === match_position ?
                { text: completion_text }:
                [
                  { text: completion_text.substr(0, match_position) },
                  {
                    tagName: "label",
                    value: completion_text.substr(match_position, search_string.length),
                    style: {
                      margin: "0px",
                      fontWeight: "bold",
                      textShadow: "1px 1px 2px black",
                      color: "#f88",
                    },
                  },
                  { text: completion_text.substr(match_position + search_string.length) },
                ],
            },
            {
              tagName: "label",
              style: {
                fontSize: "1em",
                color: "#555",
                textShadow: "none",
              },
              value: result.comments && result.comments[i],
              crop: "end",
            },
          ],
        });
    } // for i
  },
}; // TextCompletionDisplayDriver


/**
 * @fn main
 * @brief Module entry point
 * @param {Desktop} desktop The Desktop object.
 */
function main(desktop)
{
  new TextCompletionDisplayDriver(desktop);
}

// EOF
