/* -*- Mode: JAVASCRIPT; tab-width: 2; indent-tabs-mode: nil; c-basic-offset: 4 -*-
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
 * @class SessionsCompletionDisplayDriver
 *
 */
var SessionsCompletionDisplayDriver = new Class().extends(Plugin);
SessionsCompletionDisplayDriver.definition = {

  id: "sessions-completion-display-driver",

  /** plugin information */
  getInfo: function getInfo()
  {
    return {
      name: _("Session Completion Display Driver"),
      version: "0.1",
      description: _("Draw completion list of suspended sessions.")
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

  "[subscribe('get/completion-display-driver/sessions'), pnp]":
  function onDisplayDriverRequested(broker)
  {
    return this;
  },

  drive: function drive(grid, result, current_index)
  {
    var rows = grid.appendChild(grid.ownerDocument.createElement("rows")),
        i,
        search_string,
        completion_text,
        image_url;

    for (i = 0; i < result.labels.length; ++i) {

      search_string = result.query.toLowerCase().substr(1);
      completion_text = result.comments[i].command;

      if (completion_text.length > 20 && i !== current_index) {
        completion_text = completion_text.substr(0, 20) + "...";
      }

      image_url = result.data[i].image;

      if (image_url) {
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
                childNodes: {
                  tagName: "image",
                  width: 120,
                  height: 80,
                  style: {
                    border: "1px solid #66f",
                    margin: "9px",
                  },
                  src: image_url || "",
                },
              },
              {
                tagName: "vbox",
                style: {
                  fontSize: "1.2em",
                  width: "50%",
                  margin: "0px",
                  overflow: "hidden",
                  paddingLeft: "8px",
                },
                childNodes: [
                  {
                    tagName: "html:div",
                    childNodes: { text: result.comments[i].command },
                  },
                  {
                    tagName: "html:div",
                    childNodes: { text: result.comments[i].ttyname + " $$" + result.comments[i].pid },
                  },
                  {
                    tagName: "html:div",
                    childNodes: { text: result.comments[i].request_id },
                  },
                ],
              },
            ],
          });
      }
    } // for i
  },
};


/**
 * @fn main
 * @brief Module entry point
 * @param {Desktop} desktop The Desktop object.
 */
function main(desktop)
{
  new SessionsCompletionDisplayDriver(desktop);
}

// EOF
