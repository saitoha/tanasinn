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
 * The Original Code is coTerminal
 *
 * The Initial Developer of the Original Code is
 * Hayaki Saito.
 * Portions created by the Initial Developer are Copyright (C) 2010 - 2011
 * the Initial Developer. All Rights Reserved.
 *
 * ***** END LICENSE BLOCK ***** */

/**
 * @abstruct CompleterBase
 */
let CompleterBase = new Abstruct().extends(Component);
CompleterBase.definition = {

  "[subscribe('@event/session-started'), enabled]":
  function onLoad(session)
  {
    session.subscribe(
      <>get/completer/{this.type}</>, 
      let (self = this) function() self);
  },

};


/**
 * @class CommandCompleter
 *
 */
let CommandCompleter = new Class().extends(CompleterBase);
CommandCompleter.definition = {

  get id()
    "commandcompleter",

  get type()
    "command",

  /*
   * Search for a given string and notify a listener (either synchronously
   * or asynchronously) of the result
   *
   * @param source - The string to search for
   * @param listener - A listener to notify when the search is complete
   */
  startSearch: function startSearch(source, listener)
  {
    let session = this._broker;
    let command_name = source.split(/\s+/).pop();
    let commands = session.notify("get/commands")
      .filter(function(command) {
        return 0 == command.name.replace(/[\[\]]+/g, "")
          .indexOf(command_name);
      });
    if (0 == commands.length) {
      listener.doCompletion(null);
      return -1;
    }
    let autocomplete_result = {
      type: "text",
      query: source, 
      labels: commands.map(function(command) command.name.replace(/[\[\]]+/g, "")),
      comments: commands.map(function(command) command.description),
      data: commands.map(function(command) ({
        name: command.name.replace(/[\[\]]+/g, ""),
        value: command.description,
      })),
    };
    listener.doCompletion(autocomplete_result);
    return 0;
  },

  /*
   * Stop all searches that are in progress
   */
  stopSearch: function stopSearch() 
  {
  },

};

/**
 * @class JsCompleter
 */
let JsCompleter = new Class().extends(CompleterBase);
JsCompleter.definition = {

  get id()
    "jscompleter",

  get type()
    "js",

  /*
   * Search for a given string and notify a listener (either synchronously
   * or asynchronously) of the result
   *
   * @param source - The string to search for
   * @param listener - A listener to notify when the search is complete
   */
  startSearch: function startSearch(source, listener)
  {
    let session = this._broker;
    try{
    let autocomplete_result = null; 
    let pattern = /(.*?)(?:(\.|\[|\['|\[")(\w*))?$/;
    let match = pattern.exec(source);
    if (match) {
      let [, settled, notation, current] = match;
      let context = new function() void (this.__proto__ = session.window);
      if (notation) {
        try {
          let code = "with (arguments[0]) { return (" + settled + ");}";
          context = new Function(code) (context);
          if (!context) {
            listener.doCompletion(null);
            return -1;
          }
        } catch (e) { 
          listener.doCompletion(null);
          return -1;
        }
      } else {
        current = settled;
      }

      // enumerate and gather properties.
      let properties = [ key for (key in context) ];

      if (true) {
        // add own property names.
        if (null !== context && typeof context != "undefined") {
          Array.prototype.push.apply(
            properties, 
            Object.getOwnPropertyNames(context.__proto__)
              .map(function(key) key));
        }
      }

      properties = let (lower_current = current.toLowerCase()) 
        properties.filter(function(key) {
        if ("." == notation ) {
          if ("number" == typeof key) {
            // Number property after dot notation. 
            // etc. abc.13, abc.3
            return false; 
          }
          if (!/^[$_a-zA-Z]+$/.test(key)) {
            // A property consists of identifier-chars after dot notation. 
            // etc. abc.ab[a cde.er=e
            return false; 
          }
        }
        return -1 != String(key)
          .toLowerCase()
          .indexOf(lower_current);
      }).sort(function(lhs, rhs) 
      {
        return String(lhs).toLowerCase().indexOf(current) ? 1: -1;
      });
      if (0 == properties.lenth) {
        return -1;
      }
      autocomplete_result = {
        type: "text",
        query: current, 
        labels: context && notation ? 
          properties.map(function(key) {
            if ("string" == typeof key) {
              if (/^\["?$/.test(notation)) {
                return <>{key.replace('"', '\\"')}"]</>;
              } else if ("[\'" == notation) {
                return <>{key.replace("'", "\\'")}']</>;
              }
            }
            return key;
          }):
          properties.map(function(key) key),
        comments: context && 
          properties.map(function(key) {
            try {
              let value = context[key];
              let type = typeof value;
              if ("function" == type) {
                return "[Function " + value.name + "] ";
              } else if ("object" == type) { // may be null
                return String(value);
              } else if ("undefined" == type) {
                return "undefined";
              } else if ("string" == type) {
                return <>"{value.replace('"', '\\"')}"</>.toString();
              }
              return String(value);
            } catch (e) {
              return "Error: " + e;
            }
          })
      };
    }
    listener.doCompletion(autocomplete_result);
    } catch(e) {alert("###" + e + " " + e.lineNumber)}
    return 0;
  },

  /*
   * Stop all searches that are in progress
   */
  stopSearch: function stopSearch() 
  {
  },

};


/**
 * @class HistoryCompleter
 */
let HistoryCompleter = new Class().extends(CompleterBase);
HistoryCompleter.definition = {

  get id()
    "historycompleter",

  get type()
    "history",

  _completion_component: Components
    .classes["@mozilla.org/autocomplete/search;1?name=history"]
    .createInstance(Components.interfaces.nsIAutoCompleteSearch),

  /*
   * Search for a given string and notify a listener (either synchronously
   * or asynchronously) of the result
   *
   * @param source - The string to search for
   * @param listener - A listener to notify when the search is complete
   */
  startSearch: function startSearch(source, listener)
  {
    this._completion_component.startSearch(source, "", null, {
        onSearchResult: function onSearchResult(search, result) 
        { 
          try {
            const RESULT_SUCCESS = Components
              .interfaces.nsIAutoCompleteResult.RESULT_SUCCESS;
            if (result.searchResult == RESULT_SUCCESS) {
              listener.doCompletion(result);
            } else {
              coUtils.Debug.reportWarning(
                _("Search component returns following result: %d"), 
                result.searchResult);
            }
          } catch(e) {
            coUtils.Debug.reportError(e);
          }
        }
      });
  },

  /*
   * Stop all searches that are in progress
   */
  stopSearch: function stopSearch() 
  {
  }

};

/**
 * @class OptionCompleter
 */
let OptionCompleter = new Class().extends(CompleterBase);
OptionCompleter.definition = {

  get id()
    "optioncompleter",

  get type()
    "option",

  /*
   * Search for a given string and notify a listener (either synchronously
   * or asynchronously) of the result
   *
   * @param source - The string to search for
   * @param listener - A listener to notify when the search is complete
   */
  startSearch: function startSearch(source, listener)
  {
    let match = source.match(/^(\s*)([$_@a-zA-Z\.]*)(=?)(.*)/);
    if (null === match) {
      listener.doCompletion(null);
      return -1;
    }
    let [, space, option, equal, next] = match;
    if (!equal && next) {
      listener.doCompletion(null);
      return -1;
    }
    
    let session = this._broker;
    let context = {};
    session.notify("command/save-persistable-data", context);
    if (!equal) {
      let options = [
        {
          key: key, 
          value: value
        } for ([key, value] in Iterator(context)) 
          if (key.match(source))
      ];
      if (0 == options.length) {
        listener.doCompletion(null);
        return -1;
      }
      let autocomplete_result = {
        type: "text",
        query: source, 
        labels: options.map(function(option) option.key),
        comments: options.map(function(option) String(option.value)),
        data: options.map(function(option) ({
          name: option.key,
          value: String(option.value),
        })),
      };
      listener.doCompletion(autocomplete_result);
      return 0;
    }
    if (context.hasOwnProperty(option)) {
      let js_completer = session.uniget("get/completer/js");
      if (js_completer) {
        js_completer.startSearch(next, listener);
        return 0;
      }
    }
    listener.doCompletion(null);
    return -1;
  },

  /*
   * Stop all searches that are in progress
   */
  stopSearch: function stopSearch() 
  {
  },

};

/**
 * @class FontsizeCompleter
 *
 */
let FontsizeCompleter = new Class().extends(CompleterBase);
FontsizeCompleter.definition = {

  get id()
    "fontsize-completer",

  get type()
    "fontsize",

  /*
   * Search for a given string and notify a listener (either synchronously
   * or asynchronously) of the result
   *
   * @param source - The string to search for
   * @param listener - A listener to notify when the search is complete
   */
  startSearch: function startSearch(source, listener)
  {
    let session = this._broker;
    let pattern = /^\s*(.*)(\s?)/;
    let match = source.match(pattern);
    let [all, size, space] = match;
    if (space) {
      listener.doCompletion(null);
      return all.length;
    }
    let generator = function() 
    { 
      for (let i = 1; i < 100; ++i) {
        let str = i.toString(); 
        if (-1 != str.indexOf(source)) {
          yield str;
        }
      }
    } ();
    let size_list = [ i for (i in generator) ];
    let autocomplete_result = {
      type: "fontsize",
      query: source, 
      labels: size_list, 
      comments: size_list,
      data: size_list.map(function(size) ({
        name: size, 
        value: size,
      })),
    };
    listener.doCompletion(autocomplete_result);
    return 0;
  },

  /*
   * Stop all searches that are in progress
   */
  stopSearch: function stopSearch() 
  {
  },

};


/**
 * @class FontCompleter
 *
 */
let FontCompleter = new Class().extends(CompleterBase);
FontCompleter.definition = {

  get id()
    "fontcompleter",

  get type()
    "font",

  /*
   * Search for a given string and notify a listener (either synchronously
   * or asynchronously) of the result
   *
   * @param source - The string to search for
   * @param listener - A listener to notify when the search is complete
   */
  startSearch: function startSearch(source, listener)
  {
    let session = this._broker;
    let pattern = /^\s*(.*)(\s?)/;
    let match = source.match(pattern);
    let [, name, space] = match;
    if (space) {
      listener.doCompletion(null);
      return name.length + space.length;
    }
    let font_list = Components
      .classes["@mozilla.org/gfx/fontenumerator;1"]
      .getService(Components.interfaces.nsIFontEnumerator)
      .EnumerateFonts("", "", {})
      .filter(function(font_family) 
        -1 != font_family.toLowerCase().indexOf(name.toLowerCase()));
    let autocomplete_result = {
      type: "font",
      query: source, 
      labels: font_list, 
      comments: font_list,
      data: font_list.map(function(font) ({
        name: font, 
        value: font,
      })),
    };
    listener.doCompletion(autocomplete_result);
    return 0;
  },

  /*
   * Stop all searches that are in progress
   */
  stopSearch: function stopSearch() 
  {
  },

};

let web140_color_map = {
  Black: "#000000",
  Navy: "#000080",
  DarkBlue: "#00008B",
  MediumBlue: "#0000CD",
  Blue: "#0000FF",
  DarkGreen: "#006400",
  Green: "#008000",
  Teal: "#008080",
  DarkCyan: "#008B8B",
  DeepSkyBlue: "#00BFFF",
  DarkTurquoise: "#00CED1",
  MediumSpringGreen: "#00FA9A",
  Lime: "#00FF00",
  SpringGreen: "#00FF7F",
  Aqua: "#00FFFF",
  Cyan: "#00FFFF",
  MidnightBlue: "#191970",
  DodgerBlue: "#1E90FF",
  LightSeaGreen: "#20B2AA",
  ForestGreen: "#228B22",
  SeaGreen: "#2E8B57",
  DarkSlateGray: "#2F4F4F",
  DarkSlateGrey: "#2F4F4F",
  LimeGreen: "#32CD32",
  MediumSeaGreen: "#3CB371",
  Turquoise: "#40E0D0",
  RoyalBlue: "#4169E1",
  SteelBlue: "#4682B4",
  DarkSlateBlue: "#483D8B",
  MediumTurquoise: "#48D1CC",
  Indigo: "#4B0082",
  DarkOliveGreen: "#556B2F",
  CadetBlue: "#5F9EA0",
  CornflowerBlue: "#6495ED",
  MediumAquaMarine: "#66CDAA",
  DimGray: "#696969",
  DimGrey: "#696969",
  SlateBlue: "#6A5ACD",
  OliveDrab: "#6B8E23",
  SlateGray: "#708090",
  SlateGrey: "#708090",
  LightSlateGray: "#778899",
  LightSlateGrey: "#778899",
  MediumSlateBlue: "#7B68EE",
  LawnGreen: "#7CFC00",
  Chartreuse: "#7FFF00",
  Aquamarine: "#7FFFD4",
  Maroon: "#800000",
  Purple: "#800080",
  Olive: "#808000",
  Gray: "#808080",
  Grey: "#808080",
  SkyBlue: "#87CEEB",
  LightSkyBlue: "#87CEFA",
  BlueViolet: "#8A2BE2",
  DarkRed: "#8B0000",
  DarkMagenta: "#8B008B",
  SaddleBrown: "#8B4513",
  DarkSeaGreen: "#8FBC8F",
  LightGreen: "#90EE90",
  MediumPurple: "#9370D8",
  DarkViolet: "#9400D3",
  PaleGreen: "#98FB98",
  DarkOrchid: "#9932CC",
  YellowGreen: "#9ACD32",
  Sienna: "#A0522D",
  Brown: "#A52A2A",
  DarkGray: "#A9A9A9",
  DarkGrey: "#A9A9A9",
  LightBlue: "#ADD8E6",
  GreenYellow: "#ADFF2F",
  PaleTurquoise: "#AFEEEE",
  LightSteelBlue: "#B0C4DE",
  PowderBlue: "#B0E0E6",
  FireBrick: "#B22222",
  DarkGoldenRod: "#B8860B",
  MediumOrchid: "#BA55D3",
  RosyBrown: "#BC8F8F",
  DarkKhaki: "#BDB76B",
  Silver: "#C0C0C0",
  MediumVioletRed: "#C71585",
  IndianRed: "#CD5C5C",
  Peru: "#CD853F",
  Chocolate: "#D2691E",
  Tan: "#D2B48C",
  LightGray: "#D3D3D3",
  LightGrey: "#D3D3D3",
  PaleVioletRed: "#D87093",
  Thistle: "#D8BFD8",
  Orchid: "#DA70D6",
  GoldenRod: "#DAA520",
  Crimson: "#DC143C",
  Gainsboro: "#DCDCDC",
  Plum: "#DDA0DD",
  BurlyWood: "#DEB887",
  LightCyan: "#E0FFFF",
  Lavender: "#E6E6FA",
  DarkSalmon: "#E9967A",
  Violet: "#EE82EE",
  PaleGoldenRod: "#EEE8AA",
  LightCoral: "#F08080",
  Khaki: "#F0E68C",
  AliceBlue: "#F0F8FF",
  HoneyDew: "#F0FFF0",
  Azure: "#F0FFFF",
  SandyBrown: "#F4A460",
  Wheat: "#F5DEB3",
  Beige: "#F5F5DC",
  WhiteSmoke: "#F5F5F5",
  MintCream: "#F5FFFA",
  GhostWhite: "#F8F8FF",
  Salmon: "#FA8072",
  AntiqueWhite: "#FAEBD7",
  Linen: "#FAF0E6",
  LightGoldenRodYellow: "#FAFAD2",
  OldLace: "#FDF5E6",
  Red: "#FF0000",
  Fuchsia: "#FF00FF",
  Magenta: "#FF00FF",
  DeepPink: "#FF1493",
  OrangeRed: "#FF4500",
  Tomato: "#FF6347",
  HotPink: "#FF69B4",
  Coral: "#FF7F50",
  Darkorange: "#FF8C00",
  LightSalmon: "#FFA07A",
  Orange: "#FFA500",
  LightPink: "#FFB6C1",
  Pink: "#FFC0CB",
  Gold: "#FFD700",
  PeachPuff: "#FFDAB9",
  NavajoWhite: "#FFDEAD",
  Moccasin: "#FFE4B5",
  Bisque: "#FFE4C4",
  MistyRose: "#FFE4E1",
  BlanchedAlmond: "#FFEBCD",
  PapayaWhip: "#FFEFD5",
  LavenderBlush: "#FFF0F5",
  SeaShell: "#FFF5EE",
  Cornsilk: "#FFF8DC",
  LemonChiffon: "#FFFACD",
  FloralWhite: "#FFFAF0",
  Snow: "#FFFAFA",
  Yellow: "#FFFF00",
  LightYellow: "#FFFFE0",
  Ivory: "#FFFFF0",
  White: "#FFFFFF",
};

let web140_color_map_reverse = function() {
  let result = {};
  for ([key, value] in Iterator(web140_color_map)) {
    result[value] = key;
  } 
  return result;
} ();

/**
 * @class ColorNumberCompleter
 *
 */
let ColorNumberCompleter = new Class().extends(CompleterBase);
ColorNumberCompleter.definition = {

  get id()
    "colorcompleter",

  get type()
    "color-number",

  "[subscribe('@initialized/renderer'), enabled]":
  function onRendererInitialized(renderer)
  {
    this._renderer = renderer;
  },

  /*
   * Search for a given string and notify a listener (either synchronously
   * or asynchronously) of the result
   *
   * @param source - The string to search for
   * @param listener - A listener to notify when the search is complete
   */
  startSearch: function startSearch(source, listener, option)
  {
    let session = this._broker;
    let renderer = this._renderer;
    let color_map = "fg" == option ? renderer.normal_color: 
                    "bg" == option ? renderer.background_color:
                    null;
    if (null == color_map) {
      coUtils.Debug.reportError(
        _("Unknown option is detected: '%s'."),
        option);
      listener.doCompletion(null);
      return -1;
    }
    let pattern = /^\s*([0-9]*)(\s*)(.*)(\s?)/;
    let match = source.match(pattern);
    let [all, number, space, name, next] = match;
    if (next) {
      listener.doCompletion(null);
      return all.length;
    } else if (!space) {
      let numbers = [i for (i in function() { for (let i = 0; i < 256; ++i) yield i; }())]
        .map(function(number) number.toString())
        .filter(function(number_as_string) -1 != number_as_string.indexOf(number));
      if (0 == numbers.length) {
        listener.doCompletion(autocomplete_result);
        return -1;
      }
      let autocomplete_result = {
        type: "color-number",
        query: source, 
        labels: numbers, 
        comments: numbers.map(function(number) color_map[number]),
        data: numbers.map(function(number) ({
          name: number, 
          value: color_map[number],
        })),
      };
      listener.doCompletion(autocomplete_result);
      return 0;
    }
    let lower_name = name.toLowerCase();
    let data = [
      {
        name: key,
        value: value,
      } for ([key, value] in Iterator(web140_color_map))
    ].filter(function(pair) 
    {
      if (-1 != pair.name.toLowerCase().indexOf(lower_name)) {
        return true;
      }
      if (0 == pair.value.toLowerCase().indexOf(lower_name)) {
        return true;
      }
      return false;
    });
    if (0 == data.length) {
      listener.doCompletion(null);
      return -1;
    }
    let autocomplete_result = {
      type: "color",
      query: name, 
      option: color_map[number],
      labels: data.map(function(pair) pair.name),
      comments: data.map(function(pair) pair.value),
      data: data,
    };
    listener.doCompletion(autocomplete_result);
    return 0;
  },

  /*
   * Stop all searches that are in progress
   */
  stopSearch: function stopSearch() 
  {
  },

};


/**
 * @abstruct ComletionDisplayDriverBase
 */
let CompletionDisplayDriverBase = new Abstruct().extends(Component);
CompletionDisplayDriverBase.definition = {

  "[subscribe('@event/session-started'), enabled]":
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
    try {
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
                padding: 0px 10px; 
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
              text: web140_color_map_reverse[pair.value] || "",
              start: -1, 
            }
          ].map(function(range) {
            return {
              tagName: "box",
              style: <> margin: 0px 10px; </>,
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
    } catch(e) {alert(e)}
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
    try {
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
                padding: 0px 10px; 
              </>,
            },
            {
              tagName: "box",
              style: <> 
                background-color: {pair.name};
                padding: 0px 10px; 
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
              style: <> margin: 0px 10px; </>,
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
    } catch(e) {alert(e)}
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
              value: "abc123%& #\u8853\u2874\u4953\u2231\u4459\u1123\u2123\u0123\u8642",
            },
          ],
        });
    } // for i
  },
};

/**
 * @class FontCompletionDisplayDriver
 *
 */
let FontCompletionDisplayDriver = new Class().extends(CompletionDisplayDriverBase);
FontCompletionDisplayDriver.definition = {

  get id()
    "font-completion-display-driver",

  get type()
    "font",

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
                margin: 0px;
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
                width: 50%;
                margin: 0px;
                overflow: hidden;
                padding-left: 8px;
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
 * @param {Process} process The Process object.
 */
function main(process)
{
  process.subscribe(
    "initialized/session", 
    function(session) 
    {
      try {
      new JsCompleter(session);
      new HistoryCompleter(session);
      new OptionCompleter(session);
      new CommandCompleter(session);
      new FontsizeCompleter(session);
      new FontCompleter(session);
      new ColorNumberCompleter(session);

      new ColorCompletionDisplayDriver(session);
      new ColorNumberCompletionDisplayDriver(session);
      new FontsizeCompletionDisplayDriver(session);
      new FontCompletionDisplayDriver(session);
      new TextCompletionDisplayDriver(session);
      } catch (e) {alert(e)}
    });
}


