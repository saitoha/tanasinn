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
 * @class ColorCompletionDisplayDriver
 *
 */
var ColorCompletionDisplayDriver = new Class().extends(Plugin)
                                              .depends("renderer");
ColorCompletionDisplayDriver.definition = {

  id: "color-completion-display-driver",

  getInfo: function getInfo()
  {
    return {
      name: _("Color Completion Display Driver"),
      version: "0.1",
      description: _("The display component of color completion.")
    };
  },

  "[persistable] enabled_when_startup": true,

  _renderer: null,

  /** Installs itself. 
   *  @param {InstallContext} context A InstallContext object.
   */
  "[install]":
  function install(context) 
  {
    this._renderer = context["renderer"];
  },

  /** Uninstalls itself 
   */
  "[uninstall]":
  function uninstall() 
  {
    this._renderer = null;
  },

  "[subscribe('get/completion-display-driver/color'), pnp]":
  function onDisplayDriversRequested()
  {
    return this;
  },

  drive: function drive(grid, result, current_index) 
  {
    var owner_document = grid.ownerDocument,
        columns,
        rows;

    columns = grid.appendChild(owner_document.createElement("colmns"))
    columns.appendChild(owner_document.createElement("column"));
    columns.appendChild(owner_document.createElement("column")).flex = 1;
    rows = grid.appendChild(owner_document.createElement("rows"))

    //rows.style.border = "1px solid blue";
    result.data.forEach(function(pair, index) 
    {
      var search_string, renderer;

      search_string = result.query.toLowerCase();
      renderer = this._renderer;

      this.request(
        "command/construct-chrome", 
        {
          parentNode: rows,
          tagName: "row",
          style: current_index === index && { 
            border: "solid 2px blue",
            background: "#226",
            color: "white",
          },
          childNodes: [
            {
              tagName: "box",
              style: { 
                backgroundColor: result.option,
                padding: "0px 20px", 
              },
            },
            {
              tagName: "box",
              style: { 
                backgroundColor: pair.name,
                padding: "0px 20px", 
              },
            },
          ].concat([
            { 
              text: pair.name,
              start: pair.name.toLowerCase().indexOf(search_string), 
              length: search_string.length,
            },
            { 
              text: pair.value,
              start: pair.value.toLowerCase().indexOf(search_string), 
              length: search_string.length,
            }
          ].map(function(range) {
            return {
              tagName: "box",
              style: { 
                fontSize: "20px",
                margin: "0px 10px", 
              },
              childNodes: -1 === range.start ?
                { text: range.text }:
                [
                  { text: range.text.substr(0, range.start) },
                  {
                    tagName: "label",
                    value: range.text.substr(range.start, range.length),
                    style: { 
                      margin: "0px", 
                      fontWeight: "bold",
                      color: "#f00",
                      textDecoration: "underline",
                    },
                  },
                  { text: range.text.substr(range.start + range.length) },
                ],
            };
          }))
        });
    }, this); 
  },

}; // ColorCompletionDisplayDriver

/**
 * @fn main
 * @brief Module entry point.
 * @param {Broker} broker The Broker object.
 */
function main(broker)
{
  new ColorCompletionDisplayDriver(broker);
}

// EOF
