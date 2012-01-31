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
 * @abstruct ComletionDisplayDriverBase
 */
let CompletionDisplayDriverBase = new Abstruct().extends(Component);
CompletionDisplayDriverBase.definition = {

  "[subscribe('@event/broker-started'), enabled]":
  function onLoad(session)
  {
    session.subscribe(
      <>get/completion-display-driver/{this.type}</>, 
      let (self = this) function() self);
    session.notify(<>initialized/{this.id}</>, this);
  },

};


/**
 * @class ColorNumberCompletionDisplayDriver
 *
 */
let ColorNumberCompletionDisplayDriver = new Class().extends(CompletionDisplayDriverBase);
ColorNumberCompletionDisplayDriver.definition = {

  get id()
    "color-number-completion-display-driver",

  get type()
    "color-number",

  _renderer: null,

  "[subscribe('@initialized/renderer'), enabled]":
  function onRendererInitialized(renderer)
  {
    this._renderer = renderer;
  },

  drive: function drive(grid, result, current_index) 
  {
    let document = grid.ownerDocument;
    let columns = grid.appendChild(document.createElement("colmns"))
    columns.appendChild(document.createElement("column"));
    columns.appendChild(document.createElement("column")).flex = 1;
    let rows = grid.appendChild(document.createElement("rows"))
    //rows.style.border = "1px solid blue";
    result.data.forEach(function(pair, index) {
      let search_string = result.query.toLowerCase();
      let renderer = this._renderer;
      let session = this._broker;
      session.uniget(
        "command/construct-chrome", 
        {
          parentNode: rows,
          tagName: "row",
          style: current_index == index && <> 
            border: solid 2px blue;
            outer: solid 3px red;
            background: #226;
            color: white;
          </>,
          childNodes: [
            {
              tagName: "box",
              style: <> 
                background-color: {pair.value};
                padding: 10px 20px; 
              </>,
            },
          ].concat([
            { 
              text: pair.name,
              start: pair.name.toLowerCase().indexOf(search_string), 
              length: search_string.length,
            },
            { 
              text: pair.value,
              start: -1, 
            },
            { 
              text: coUtils.Constant.WEB140_COLOR_MAP_REVERSE[pair.value] || "",
              start: -1, 
            }
          ].map(function(range) {
            return {
              tagName: "box",
              style: <> 
                font-size: 20px; 
                margin: 0px 10px; 
              </>,
              childNodes: -1 == range.start ?
                { text: range.text }:
                [
                  { text: range.text.substr(0, range.start) },
                  {
                    tagName: "label",
                    innerText: range.text.substr(range.start, range.length),
                    style: <> 
                      margin: 0px; 
                      font-weight: bold; 
                      color: #f00; 
                      text-decoration: underline; 
                    </>,
                  },
                  { text: range.text.substr(range.start + range.length) },
                ],
            };
          }))
        });
    }, this); 
  },

};

/**
 * @class ColorCompletionDisplayDriver
 *
 */
let ColorCompletionDisplayDriver = new Class().extends(CompletionDisplayDriverBase);
ColorCompletionDisplayDriver.definition = {

  get id()
    "color-completion-display-driver",

  get type()
    "color",

  _renderer: null,

  "[subscribe('@initialized/renderer'), enabled]":
  function onRendererInitialized(renderer)
  {
    this._renderer = renderer;
  },

  drive: function drive(grid, result, current_index) 
  {
    let document = grid.ownerDocument;
    let columns = grid.appendChild(document.createElement("colmns"))
    columns.appendChild(document.createElement("column"));
    columns.appendChild(document.createElement("column")).flex = 1;
    let rows = grid.appendChild(document.createElement("rows"))
    //rows.style.border = "1px solid blue";
    result.data.forEach(function(pair, index) {
      let search_string = result.query.toLowerCase();
      let renderer = this._renderer;
      let session = this._broker;
      session.uniget(
        "command/construct-chrome", 
        {
          parentNode: rows,
          tagName: "row",
          style: current_index == index && <> 
            border: solid 2px blue;
            outer: solid 3px red;
            background: #226;
            color: white;
          </>,
          childNodes: [
            {
              tagName: "box",
              style: <> 
                background-color: {result.option};
                padding: 0px 20px; 
              </>,
            },
            {
              tagName: "box",
              style: <> 
                background-color: {pair.name};
                padding: 0px 20px; 
              </>,
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
              style: <> 
                font-size: 20px;
                margin: 0px 10px; 
              </>,
              childNodes: -1 == range.start ?
                { text: range.text }:
                [
                  { text: range.text.substr(0, range.start) },
                  {
                    tagName: "label",
                    innerText: range.text.substr(range.start, range.length),
                    style: <> 
                      margin: 0px; 
                      font-weight: bold; 
                      color: #f00; 
                      text-decoration: underline; 
                    </>,
                  },
                  { text: range.text.substr(range.start + range.length) },
                ],
            };
          }))
        });
    }, this); 
  },

};

/**
 * @class FontsizeCompletionDisplayDriver
 *
 */
let FontsizeCompletionDisplayDriver = new Class().extends(CompletionDisplayDriverBase);
FontsizeCompletionDisplayDriver.definition = {

  get id()
    "fontsize-completion-display-driver",

  get type()
    "fontsize",

  drive: function drive(grid, result, current_index) 
  {
    let document = grid.ownerDocument;
    let session = this._broker;
    let rows = grid.appendChild(document.createElement("rows"))
    for (let i = 0; i < result.labels.length; ++i) {
      let search_string = result.query.toLowerCase();
      let completion_text = result.labels[i];
      let match_position = completion_text
        .toLowerCase()
        .indexOf(search_string);
      session.uniget(
        "command/construct-chrome", 
        {
          parentNode: rows,
          tagName: "row",
          style: i == current_index ? <>
            background: #226;
            color: white;
          </>: "",
          childNodes: [
            {
              tagName: "box",
              style: <>
                font-size: 20px;
                margin: 0px 8px;
              </>,
              childNodes: -1 == match_position ? 
                { text: completion_text }:
                [
                  { text: completion_text.substr(0, match_position) },
                  {
                    tagName: "label",
                    innerText: completion_text.substr(match_position, search_string.length),
                    style: <>
                      margin: 0px; 
                      font-weight: bold; 
                      color: #f00; 
                      text-decoration: underline;
                    </>,
                  },
                  { text: completion_text.substr(match_position + search_string.length) + "px" },
                ],
            },
            {
              tagName: "label",
              style: <>
                font-size: {completion_text}px;
                margin: 0px;
              </>,
              value: "abc123%& \u0353\u2874\u2953\u2231\u7453\u1123\u2123\u0123\uC642",
            },
          ],
        });
    } // for i
  },
};

/**
 * @class FontFamilyCompletionDisplayDriver
 *
 */
let FontFamilyCompletionDisplayDriver = new Class().extends(CompletionDisplayDriverBase);
FontFamilyCompletionDisplayDriver.definition = {

  get id()
    "font-family-completion-display-driver",

  get type()
    "font-family",

  drive: function drive(grid, result, current_index) 
  {
    let document = grid.ownerDocument;
    let session = this._broker;
    let rows = grid.appendChild(document.createElement("rows"))
    for (let i = 0; i < result.labels.length; ++i) {
      let search_string = result.query.toLowerCase();
      let completion_text = result.labels[i];
      let match_position = completion_text
        .toLowerCase()
        .indexOf(search_string);
      session.uniget(
        "command/construct-chrome", 
        {
          parentNode: rows,
          tagName: "row",
          style: i == current_index ? <>
            background: #226;
            color: white;
          </>: "",
          childNodes: [
            {
              tagName: "box",
              style: <>
                font-size: 40px;
                font-family: '{completion_text}';
                font-weight: normal;
                margin: 0px;
                margin-left: 8px;
              </>,
              childNodes: -1 == match_position ? 
                { text: completion_text }:
                [
                  { text: completion_text.substr(0, match_position) },
                  {
                    tagName: "label",
                    innerText: completion_text.substr(match_position, search_string.length),
                    style: <>
                      margin: 0px; 
                      font-weight: bold; 
                      color: #f00; 
                      text-decoration: underline;
                    </>,
                  },
                  { text: completion_text.substr(match_position + search_string.length) },
                ],
            },
          ],
        });
    } // for i
  },
};

/**
 * @class TextCompletionDisplayDriver
 *
 */
let TextCompletionDisplayDriver = new Class().extends(CompletionDisplayDriverBase);
TextCompletionDisplayDriver.definition = {

  get id()
    "text-completion-display-driver",

  get type()
    "text",

  drive: function drive(grid, result, current_index) 
  {
    let document = grid.ownerDocument;
    let session = this._broker;
    let rows = grid.appendChild(document.createElement("rows"))
    for (let i = 0; i < result.labels.length; ++i) {
      let search_string = result.query.toLowerCase();
      let completion_text = result.labels[i];
      if ("quoted" == result.option) {
        completion_text = completion_text.slice(1, -1);
      }
      if (completion_text.length > 32 && i != current_index) {
        completion_text = completion_text.substr(0, 32) + "...";
      }
      let match_position = completion_text
        .toLowerCase()
        .indexOf(search_string);
      session.uniget(
        "command/construct-chrome", 
        {
          parentNode: rows,
          tagName: "row",
          style: i == current_index ? <>
            background: #226;
            padding: 2px;
            color: white;
          </>: "",
          childNodes: [
            {
              tagName: "box",
              style: <>
                padding-top: 3px;
                margin: 0px;
                overflow: hidden;
                padding-left: 8px;
                font-size: 19px;
              </>,
              childNodes: -1 == match_position ? 
                { text: completion_text }:
                [
                  { text: completion_text.substr(0, match_position) },
                  {
                    tagName: "label",
                    innerText: completion_text.substr(match_position, search_string.length),
                    style: <>
                      margin: 0px; 
                      font-weight: bold; 
                      color: #f00; 
                      text-decoration: underline;
                    </>,
                  },
                  { text: completion_text.substr(match_position + search_string.length) },
                ],
            },
            {
              tagName: "label",
              style: <>
                padding-top: 2px;
                font-size: 16px;
                text-shadow: 0px 0px 2px white;
                font-family: 'Times New Roman';
                color: #000;
              </>,
              value: result.comments && result.comments[i],
              crop: "end",
            },
          ],
        });
    } // for i
  },
};

/**
 * @fn main
 * @brief Module entry point.
 * @param {Desktop} desktop The Desktop object.
 */
function main(desktop)
{
  desktop.subscribe(
    "@initialized/broker", 
    function(session) 
    {
      new ColorCompletionDisplayDriver(session);
      new ColorNumberCompletionDisplayDriver(session);
      new FontsizeCompletionDisplayDriver(session);
      new FontFamilyCompletionDisplayDriver(session);
      new TextCompletionDisplayDriver(session);
    });
}


