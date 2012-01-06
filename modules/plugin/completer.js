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
    let autocomplete_result = {
      type: "text",
      query: source, 
      labels: commands.map(function(command) command.name.replace(/[\[\]]+/g, "")),
      comments: commands.map(function(command) command.description),
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
  },

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
      type: "text",
      query: source, 
      labels: font_list, 
      comments: null,
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

/**
 * @class ForegroundColorCompleter
 *
 */
let ForegroundColorCompleter = new Class().extends(CompleterBase);
ForegroundColorCompleter.definition = {

  get id()
    "foregroud-color-completer",

  get type()
    "foreground-color",

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
    let colors = [name for ([name, ] in Iterator(web140_color_map))]
      .filter(function(color_name) 
         -1 != color_name.toLowerCase().indexOf(name.toLowerCase()));
    if (0 == colors.length) {
      listener.doCompletion(autocomplete_result);
      return -1;
    }
    let autocomplete_result = {
      type: "foreground-color",
      query: source, 
      labels: colors, 
      comments: null, 
      data: colors.map(function(color_name) ({
        name: color_name, 
        value: web140_color_map[color_name],
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
 * @class BackgroundColorCompleter
 *
 */
let BackgroundColorCompleter = new Class().extends(CompleterBase);
BackgroundColorCompleter.definition = {

  get id()
    "backgroud-color-completer",

  get type()
    "background-color",

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
    let colors = [name for ([name, ] in Iterator(web140_color_map))]
      .filter(function(color_name) 
         -1 != color_name.toLowerCase().indexOf(name.toLowerCase()));
    if (0 == colors.length) {
      listener.doCompletion(autocomplete_result);
      return -1;
    }
    let autocomplete_result = {
      type: "background-color",
      query: source, 
      labels: colors, 
      comments: null, 
      data: colors.map(function(color_name) ({
        name: color_name, 
        value: web140_color_map[color_name],
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
 * @class ColorNumberCompleter
 *
 */
let ColorNumberCompleter = new Class().extends(CompleterBase);
ColorNumberCompleter.definition = {

  get id()
    "colorcompleter",

  get type()
    "color-number",

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
    let pattern = /^\s*([0-9]*)(\s*)/;
    let match = source.match(pattern);
    let [all, name, space] = match;
    if (space) {
      listener.doCompletion(null);
      return all.length;
    }
    let numbers = [i for (i in function() { for (let i = 0; i < 256; ++i) yield i; }())]
      .map(function(number) number.toString())
      .filter(function(number_as_string) -1 != number_as_string.indexOf(name));
    if (0 == numbers.length) {
      listener.doCompletion(autocomplete_result);
      return -1;
    }
    let autocomplete_result = {
      type: "text",
      query: source, 
      labels: numbers, 
      comments: null,
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
 * @class ForegroundColorCompletionDisplayDriver
 *
 */
let ForegroundColorCompletionDisplayDriver = new Class().extends(CompletionDisplayDriverBase);
ForegroundColorCompletionDisplayDriver.definition = {

  get id()
    "foreground-color-completion-display-driver",

  get type()
    "foreground-color",

  "[subscribe('@initialized/renderer'), enabled]":
  function onRendererInitialized(renderer)
  {
    this._renderer = renderer;
  },

  drive: function drive(grid, result, current_index) 
  {
    let document = grid.ownerDocument;
    let rows = grid.appendChild(document.createElement("rows"))
    for (let i = 0; i < result.labels.length; ++i) {
      let row = rows.appendChild(document.createElement("row"))
      row.style.cssText = i == current_index ? <>
        background: #226;
        color: white;
      </>: "";
      let search_string = result.query.toLowerCase();
      let completion_text = result.labels[i];
      if (completion_text) {
        let match_position = completion_text
          .toLowerCase()
          .indexOf(search_string);
        if (-1 != match_position) {
          let before_match = completion_text.substr(0, match_position);
          let match = completion_text.substr(match_position, search_string.length);
          let after_match = completion_text.substr(match_position + search_string.length);
          let box = row.appendChild(document.createElement("hbox"));
          box.style.width = "50%"; 
          box.style.margin = "0px";
          box.style.overflow = "hidden";
          box.appendChild(document.createTextNode(before_match));
          label = box.appendChild(document.createElement("label"));
          label.setAttribute("value", match);
          label.style.cssText = <>
            margin: 0px; 
            font-weight: bold; 
            color: #f00; 
            text-decoration: underline;
          </>;
          box.appendChild(document.createTextNode(after_match));
          let comment = row.appendChild(document.createElement("box"));
          
          let renderer = this._renderer;
          let label = comment.appendChild(document.createTextNode("label"));
          comment.style.margin = "0px";
          comment.style.color = completion_text;
          comment.style.fontSize = renderer.font_size;
          comment.style.fontFamily = renderer.font_family;
          comment.style.backgroundColor = "#4c4c4c";
          comment.style.width = "10em";
          comment.setAttribute("value", "");
          comment.setAttribute("crop", "end");
        }
      }
    } // for i
  },

};


/**
 * @class BackgroundColorCompletionDisplayDriver
 *
 */
let BackgroundColorCompletionDisplayDriver = new Class().extends(CompletionDisplayDriverBase);
BackgroundColorCompletionDisplayDriver.definition = {

  get id()
    "background-color-completion-display-driver",

  get type()
    "background-color",

  "[subscribe('@initialized/renderer'), enabled]":
  function onRendererInitialized(renderer)
  {
    this._renderer = renderer;
  },

  drive: function drive(grid, result, current_index) 
  {
    let document = grid.ownerDocument;
    let rows = grid.appendChild(document.createElement("rows"))
    for (let i = 0; i < result.labels.length; ++i) {
      let row = rows.appendChild(document.createElement("row"))
      row.style.cssText = i == current_index ? <>
        background: #226;
        color: white;
      </>: "";
      let search_string = result.query.toLowerCase();
      let completion_text = result.labels[i];
      if (completion_text) {
        let match_position = completion_text
          .toLowerCase()
          .indexOf(search_string);
        if (-1 != match_position) {
          let before_match = completion_text.substr(0, match_position);
          let match = completion_text.substr(match_position, search_string.length);
          let after_match = completion_text.substr(match_position + search_string.length);
          let box = row.appendChild(document.createElement("hbox"));
          box.style.width = "50%"; 
          box.style.margin = "0px";
          box.style.overflow = "hidden";
          box.appendChild(document.createTextNode(before_match));
          label = box.appendChild(document.createElement("label"));
          label.setAttribute("value", match);
          label.style.cssText = <>
            margin: 0px; 
            font-weight: bold; 
            color: #f00; 
            text-decoration: underline;
          </>;
          box.appendChild(document.createTextNode(after_match));
          let comment = row.appendChild(document.createElement("box"));
          
          let renderer = this._renderer;
          for (let i = 0; i < 16; ++i) {
            let label = comment.appendChild(document.createElement("label"));
            label.value = "#" + (100 + i).toString().substr(1);
            label.style.color = renderer.normal_color[i];
            label.style.fontFamily = renderer.font_family;
            label.style.fontSize = renderer.font_size;
          }
          comment.style.margin = "1px";
          comment.style.border = "1px solid black";
          comment.style.backgroundColor = completion_text;
          comment.style.width = "10em";
          comment.setAttribute("value", "");
          comment.setAttribute("crop", "end");
        }
      }
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
    let rows = grid.appendChild(document.createElement("rows"))
    for (let i = 0; i < result.labels.length; ++i) {
      let row = rows.appendChild(document.createElement("row"))
      row.style.cssText = i == current_index ? <>
        background: #226;
        color: white;
      </>: "";
      let search_string = result.query.toLowerCase();
      let completion_text = result.labels[i];
      if (completion_text) {
        let match_position = completion_text
          .toLowerCase()
          .indexOf(search_string);
        if (-1 != match_position) {
          let before_match = completion_text
            .substr(0, match_position);
          let match = completion_text
            .substr(match_position, search_string.length);
          let after_match = completion_text
            .substr(match_position + search_string.length);
          let box = row.appendChild(document.createElement("hbox"));
          box.style.cssText = <>
            width: 50%;
            margin: 0px;
            overflow: hidden;
          </>;
          box.appendChild(document.createTextNode(before_match));
          label = box.appendChild(document.createElement("label"));
          label.setAttribute("value", match);
          label.style.cssText = <>
            margin: 0px; 
            font-weight: bold; 
            color: #f00; 
            text-decoration: underline;</>;
          box.appendChild(document.createTextNode(after_match));
          let comment = row.appendChild(document.createElement("label"));
          comment.style.opacity = 0.5;
          comment.setAttribute("value", result.comments && result.comments[i]);
          comment.setAttribute("crop", "end");
        }
      }
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
      new JsCompleter(session);
      new HistoryCompleter(session);
      new OptionCompleter(session);
      new CommandCompleter(session);
      new FontCompleter(session);
      new ForegroundColorCompleter(session);
      new BackgroundColorCompleter(session);
      new ColorNumberCompleter(session);

      new ForegroundColorCompletionDisplayDriver(session);
      new BackgroundColorCompletionDisplayDriver(session);
      new TextCompletionDisplayDriver(session);
    });
}


