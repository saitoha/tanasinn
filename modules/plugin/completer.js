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
      }).sort(function(lhs, rhs) lhs.name.localeCompare(rhs.name));
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
 * @class ProfileCompleter
 *
 */
let ProfileCompleter = new Class().extends(CompleterBase);
ProfileCompleter.definition = {

  get id()
    "profile-completer",

  get type()
    "profile",

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

    let match = source.match(/^(\s*)([$_\-@a-zA-Z\.]*)(\s?)/);
    if (null === match) {
      listener.doCompletion(null);
      return -1;
    }
    let [, space, name, next] = match;
    if (next) {
      return space.length + name.length;
    }
    let entries = coUtils.File.getFileEntriesFromSerchPath([session.profile_directory]);

    let lower_name = name.toLowerCase();
    let candidates = [
      {
        key: file.leafName.replace(/\.js$/, ""), 
        value: file.path,
      } for (file in entries) 
        if (-1 != file.leafName.toLowerCase().indexOf(lower_name))
    ];
    if (0 == candidates.length) {
      listener.doCompletion(null);
      return -1;
    }
    let autocomplete_result = {
      type: "text",
      query: source, 
      labels: candidates.map(function(candidate) candidate.key),
      comments: candidates.map(function(candidate) String(candidate.value)),
      data: candidates.map(function(candidate) ({
        name: candidate.key,
        value: String(candidate.value),
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
    "history-completer",

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
 * @class CharsetCompleter
 */
let CharsetCompleter = new Class().extends(CompleterBase);
CharsetCompleter.definition = {

  get id()
    "charset-completer",

  get type()
    "charset",

  /*
   * Search for a given string and notify a listener (either synchronously
   * or asynchronously) of the result
   *
   * @param source - The string to search for
   * @param listener - A listener to notify when the search is complete
   */
  startSearch: function startSearch(source, listener, option)
  {
    let match = source.match(/^(\s*)([$_\-@a-zA-Z\.]*)(\s?)/);
    if (null === match) {
      listener.doCompletion(null);
      return -1;
    }
    let [, space, name, next] = match;
    if (next) {
      return space.length + name.length;
    }
    let session = this._broker;
    let components = session.notify(<>get/{option}</>);
    let lower_source = source.toLowerCase();
    let candidates = [
      {
        key: component.charset, 
        value: component.title
      } for ([, component] in Iterator(components)) 
        if (-1 != component.charset.toLowerCase().indexOf(lower_source))
    ];
    if (0 == candidates.length) {
      listener.doCompletion(null);
      return -1;
    }
    let autocomplete_result = {
      type: "text",
      query: source, 
      labels: candidates.map(function(candidate) candidate.key),
      comments: candidates.map(function(candidate) String(candidate.value)),
      data: candidates.map(function(candidate) ({
        name: candidate.key,
        value: String(candidate.value),
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
 * @class PluginsCompleter
 */
let PluginsCompleter = new Class().extends(CompleterBase);
PluginsCompleter.definition = {

  get id()
    "plugins-completer",

  get type()
    "plugin",

  /*
   * Search for a given string and notify a listener (either synchronously
   * or asynchronously) of the result
   *
   * @param source - The string to search for
   * @param listener - A listener to notify when the search is complete
   */
  startSearch: function startSearch(source, listener, option)
  {
    let match = source.match(/^(\s*)([$_\-@a-zA-Z\.]*)(\s?)/);
    if (null === match) {
      listener.doCompletion(null);
      return -1;
    }
    let [, space, name, next] = match;
    if (next) {
      return space.length + name.length;
    }
    let session = this._broker;
    let modules = session.notify("get/module-instances");
    let candidates = [
      {
        key: module.id, 
        value: module
      } for ([, module] in Iterator(modules)) 
        if (Plugin.prototype.isPrototypeOf(module) 
            && module.id && module.id.match(source) 
            && module.enabled == (option == "enabled"))
    ];
    if (0 == candidates.length) {
      listener.doCompletion(null);
      return -1;
    }
    let autocomplete_result = {
      type: "text",
      query: source, 
      labels: candidates.map(function(candidate) candidate.key),
      comments: candidates.map(function(candidate) String(candidate.value)),
      data: candidates.map(function(candidate) ({
        name: candidate.key,
        value: String(candidate.value),
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
    let match = source.match(/^(\s*)([$_\-@a-zA-Z\.]*)(=?)(.*)/);
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
      for (let i = 8; i < 100; ++i) {
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
 * @class FontFamilyCompleter
 *
 */
let FontFamilyCompleter = new Class().extends(CompleterBase);
FontFamilyCompleter.definition = {

  get id()
    "font-family-completer",

  get type()
    "font-family",

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
//      .EnumerateAllFonts({})
      .EnumerateFonts("x-western", "monospace", {})
      .filter(function(font_family) 
        -1 != font_family.toLowerCase().indexOf(name.toLowerCase()));
    let autocomplete_result = {
      type: "font-family",
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

let locale_id_map = {
  af:"Afrikaans / Afrikaans",
  'af-ZA':"Afrikaans (South Africa) / Afrikaans (Suid Afrika)",
  sq:"Albanian / shqipe",
  'sq-AL':"Albanian (Albania) / shqipe (Shqip\xEBria)",
  gsw:"Alsatian / Els\xE4ssisch",
  'gsw-FR':"Alsatian (France) / Els\xE4ssisch (Fr\xE0nkrisch)",
  am:"Amharic / \u12A0\u121B\u122D\u129B",
  'am-ET':"Amharic (Ethiopia) / \u12A0\u121B\u122D\u129B (\u12A2\u1275\u12EE\u1335\u12EB)",
  ar:"Arabic\u200E / \u0627\u0644\u0639\u0631\u0628\u064A\u0629\u200F",
  'ar-DZ':"Arabic (Algeria)\u200E / \u0627\u0644\u0639\u0631\u0628\u064A\u0629 (\u0627\u0644\u062C\u0632\u0627\u0626\u0631)\u200F",
  'ar-BH':"Arabic (Bahrain)\u200E / \u0627\u0644\u0639\u0631\u0628\u064A\u0629 (\u0627\u0644\u0628\u062D\u0631\u064A\u0646)\u200F",
  'ar-EG':"Arabic (Egypt)\u200E / \u0627\u0644\u0639\u0631\u0628\u064A\u0629 (\u0645\u0635\u0631)\u200F",
  'ar-IQ':"Arabic (Iraq)\u200E / \u0627\u0644\u0639\u0631\u0628\u064A\u0629 (\u0627\u0644\u0639\u0631\u0627\u0642)\u200F",
  'ar-JO':"Arabic (Jordan)\u200E / \u0627\u0644\u0639\u0631\u0628\u064A\u0629 (\u0627\u0644\u0623\u0631\u062F\u0646)\u200F",
  'ar-KW':"Arabic (Kuwait)\u200E / \u0627\u0644\u0639\u0631\u0628\u064A\u0629 (\u0627\u0644\u0643\u0648\u064A\u062A)\u200F",
  'ar-LB':"Arabic (Lebanon)\u200E / \u0627\u0644\u0639\u0631\u0628\u064A\u0629 (\u0644\u0628\u0646\u0627\u0646)\u200F",
  'ar-LY':"Arabic (Libya)\u200E / \u0627\u0644\u0639\u0631\u0628\u064A\u0629 (\u0644\u064A\u0628\u064A\u0627)\u200F",
  'ar-MA':"Arabic (Morocco)\u200E / \u0627\u0644\u0639\u0631\u0628\u064A\u0629 (\u0627\u0644\u0645\u0645\u0644\u0643\u0629 \u0627\u0644\u0645\u063A\u0631\u0628\u064A\u0629)\u200F",
  'ar-OM':"Arabic (Oman)\u200E / \u0627\u0644\u0639\u0631\u0628\u064A\u0629 (\u0639\u0645\u0627\u0646)\u200F",
  'ar-QA':"Arabic (Qatar)\u200E / \u0627\u0644\u0639\u0631\u0628\u064A\u0629 (\u0642\u0637\u0631)\u200F",
  'ar-SA':"Arabic (Saudi Arabia)\u200E / \u0627\u0644\u0639\u0631\u0628\u064A\u0629 (\u0627\u0644\u0645\u0645\u0644\u0643\u0629 \u0627\u0644\u0639\u0631\u0628\u064A\u0629 \u0627\u0644\u0633\u0639\u0648\u062F\u064A\u0629)\u200F",
  'ar-SY':"Arabic (Syria)\u200E / \u0627\u0644\u0639\u0631\u0628\u064A\u0629 (\u0633\u0648\u0631\u064A\u0627)\u200F",
  'ar-TN':"Arabic (Tunisia)\u200E / \u0627\u0644\u0639\u0631\u0628\u064A\u0629 (\u062A\u0648\u0646\u0633)\u200F",
  'ar-AE':"Arabic (U.A.E.)\u200E / \u0627\u0644\u0639\u0631\u0628\u064A\u0629 (\u0627\u0644\u0625\u0645\u0627\u0631\u0627\u062A \u0627\u0644\u0639\u0631\u0628\u064A\u0629 \u0627\u0644\u0645\u062A\u062D\u062F\u0629)\u200F",
  'ar-YE':"Arabic (Yemen)\u200E / \u0627\u0644\u0639\u0631\u0628\u064A\u0629 (\u0627\u0644\u064A\u0645\u0646)\u200F",
  hy:"Armenian / \u0540\u0561\u0575\u0565\u0580\u0565\u0576",
  'hy-AM':"Armenian (Armenia) / \u0540\u0561\u0575\u0565\u0580\u0565\u0576 (\u0540\u0561\u0575\u0561\u057D\u057F\u0561\u0576)",
  as:"Assamese / \u0985\u09B8\u09AE\u09C0\u09AF\u09BC\u09BE",
  'as-IN':"Assamese (India) / \u0985\u09B8\u09AE\u09C0\u09AF\u09BC\u09BE (\u09AD\u09BE\u09F0\u09A4)",
  az:"Azeri / Az\u0259rbaycan\xAD\u0131l\u0131",
  'az-Cyrl':"Azeri (Cyrillic) / \u0410\u0437\u04D9\u0440\u0431\u0430\u0458\u04B9\u0430\u043D \u0434\u0438\u043B\u0438",
  'az-Cyrl-AZ':"Azeri (Cyrillic, Azerbaijan) / \u0410\u0437\u04D9\u0440\u0431\u0430\u0458\u04B9\u0430\u043D (\u0410\u0437\u04D9\u0440\u0431\u0430\u0458\u04B9\u0430\u043D)",
  'az-Latn':"Azeri (Latin) / Az\u0259rbaycan\xAD\u0131l\u0131",
  'az-Latn-AZ':"Azeri (Latin, Azerbaijan) / Az\u0259rbaycan\xAD\u0131l\u0131 (Az\u0259rbaycan)",
  ba:"Bashkir / \u0411\u0430\u0448\u04A1\u043E\u0440\u0442",
  'ba-RU':"Bashkir (Russia) / \u0411\u0430\u0448\u04A1\u043E\u0440\u0442 (\u0420\u043E\u0441\u0441\u0438\u044F)",
  eu:"Basque / euskara",
  'eu-ES':"Basque (Basque) / euskara (euskara)",
  be:"Belarusian / \u0411\u0435\u043B\u0430\u0440\u0443\u0441\u043A\u0456",
  'be-BY':"Belarusian (Belarus) / \u0411\u0435\u043B\u0430\u0440\u0443\u0441\u043A\u0456 (\u0411\u0435\u043B\u0430\u0440\u0443\u0441\u044C)",
  bn:"Bengali / \u09AC\u09BE\u0982\u09B2\u09BE",
  'bn-BD':"Bengali (Bangladesh) / \u09AC\u09BE\u0982\u09B2\u09BE (\u09AC\u09BE\u0982\u09B2\u09BE\u09A6\u09C7\u09B6)",
  'bn-IN':"Bengali (India) / \u09AC\u09BE\u0982\u09B2\u09BE (\u09AD\u09BE\u09B0\u09A4)",
  bs:"Bosnian / bosanski",
  'bs-Cyrl':"Bosnian (Cyrillic) / \u0431\u043E\u0441\u0430\u043D\u0441\u043A\u0438 (\u040B\u0438\u0440\u0438\u043B\u0438\u0446\u0430)",
  'bs-Cyrl-BA':"Bosnian (Cyrillic, Bosnia and Herzegovina) / \u0431\u043E\u0441\u0430\u043D\u0441\u043A\u0438 (\u0411\u043E\u0441\u043D\u0430 \u0438 \u0425\u0435\u0440\u0446\u0435\u0433\u043E\u0432\u0438\u043D\u0430)",
  'bs-Latn':"Bosnian (Latin) / bosanski (Latinica)",
  'bs-Latn-BA':"Bosnian (Latin, Bosnia and Herzegovina) / bosanski (Bosna i Hercegovina)",
  br:"Breton / brezhoneg",
  'br-FR':"Breton (France) / brezhoneg (Fra\xF1s)",
  bg:"Bulgarian / \u0431\u044A\u043B\u0433\u0430\u0440\u0441\u043A\u0438",
  'bg-BG':"Bulgarian (Bulgaria) / \u0431\u044A\u043B\u0433\u0430\u0440\u0441\u043A\u0438 (\u0411\u044A\u043B\u0433\u0430\u0440\u0438\u044F)",
  ca:"Catalan / catal\xE0",
  'ca-ES':"Catalan (Catalan) / catal\xE0 (catal\xE0)",
  zh:"Chinese / \u4E2D\u6587",
  'zh-Hans':"Chinese (Simplified) / \u4E2D\u6587(\u7B80\u4F53)",
  'zh-CN':"Chinese (Simplified, PRC) / \u4E2D\u6587(\u4E2D\u534E\u4EBA\u6C11\u5171\u548C\u56FD)",
  'zh-SG':"Chinese (Simplified, Singapore) / \u4E2D\u6587(\u65B0\u52A0\u5761)",
  'zh-Hant':"Chinese (Traditional) / \u4E2D\u6587(\u7E41\u9AD4)",
  'zh-HK':"Chinese (Traditional, Hong Kong S.A.R.) / \u4E2D\u6587(\u9999\u6E2F\u7279\u5225\u884C\u653F\u5340)",
  'zh-MO':"Chinese (Traditional, Macao S.A.R.) / \u4E2D\u6587(\u6FB3\u9580\u7279\u5225\u884C\u653F\u5340)",
  'zh-TW':"Chinese (Traditional, Taiwan) / \u4E2D\u6587(\u53F0\u7063)",
  co:"Corsican / Corsu",
  'co-FR':"Corsican (France) / Corsu (France)",
  hr:"Croatian / hrvatski",
  'hr-HR':"Croatian (Croatia) / hrvatski (Hrvatska)",
  'hr-BA':"Croatian (Latin, Bosnia and Herzegovina) / hrvatski (Bosna i Hercegovina)",
  cs:"Czech / \u010De\u0161tina",
  'cs-CZ':"Czech (Czech Republic) / \u010De\u0161tina (\u010Cesk\xE1 republika)",
  da:"Danish / dansk",
  'da-DK':"Danish (Denmark) / dansk (Danmark)",
  prs:"Dari\u200E / \u062F\u0631\u0649\u200F",
  'prs-AF':"Dari (Afghanistan)\u200E / \u062F\u0631\u0649 (\u0627\u0641\u063A\u0627\u0646\u0633\u062A\u0627\u0646)\u200F",
  dv:"Divehi\u200E / \u078B\u07A8\u0788\u07AC\u0780\u07A8\u0784\u07A6\u0790\u07B0\u200F",
  'dv-MV':"Divehi (Maldives)\u200E / \u078B\u07A8\u0788\u07AC\u0780\u07A8\u0784\u07A6\u0790\u07B0 (\u078B\u07A8\u0788\u07AC\u0780\u07A8 \u0783\u07A7\u0787\u07B0\u0796\u07AC)\u200F",
  nl:"Dutch / Nederlands",
  'nl-BE':"Dutch (Belgium) / Nederlands (Belgi\xEB)",
  'nl-NL':"Dutch (Netherlands) / Nederlands (Nederland)",
  en:"English / English",
  'en-AU':"English (Australia) / English (Australia)",
  'en-BZ':"English (Belize) / English (Belize)",
  'en-CA':"English (Canada) / English (Canada)",
  'en-029':"English (Caribbean) / English (Caribbean)",
  'en-IN':"English (India) / English (India)",
  'en-IE':"English (Ireland) / English (Ireland)",
  'en-JM':"English (Jamaica) / English (Jamaica)",
  'en-MY':"English (Malaysia) / English (Malaysia)",
  'en-NZ':"English (New Zealand) / English (New Zealand)",
  'en-PH':"English (Republic of the Philippines) / English (Philippines)",
  'en-SG':"English (Singapore) / English (Singapore)",
  'en-ZA':"English (South Africa) / English (South Africa)",
  'en-TT':"English (Trinidad and Tobago) / English (Trinidad y Tobago)",
  'en-GB':"English (United Kingdom) / English (United Kingdom)",
  'en-US':"English (United States) / English (United States)",
  'en-ZW':"English (Zimbabwe) / English (Zimbabwe)",
  et:"Estonian / eesti",
  'et-EE':"Estonian (Estonia) / eesti (Eesti)",
  fo:"Faroese / f\xF8royskt",
  'fo-FO':"Faroese (Faroe Islands) / f\xF8royskt (F\xF8royar)",
  fil:"Filipino / Filipino",
  'fil-PH':"Filipino (Philippines) / Filipino (Pilipinas)",
  fi:"Finnish / suomi",
  'fi-FI':"Finnish (Finland) / suomi (Suomi)",
  fr:"French / fran\xE7ais",
  'fr-BE':"French (Belgium) / fran\xE7ais (Belgique)",
  'fr-CA':"French (Canada) / fran\xE7ais (Canada)",
  'fr-FR':"French (France) / fran\xE7ais (France)",
  'fr-LU':"French (Luxembourg) / fran\xE7ais (Luxembourg)",
  'fr-MC':"French (Monaco) / fran\xE7ais (Principaut\xE9 de Monaco)",
  'fr-CH':"French (Switzerland) / fran\xE7ais (Suisse)",
  fy:"Frisian / Frysk",
  'fy-NL':"Frisian (Netherlands) / Frysk (Nederl\xE2n)",
  gl:"Galician / galego",
  'gl-ES':"Galician (Galician) / galego (galego)",
  ka:"Georgian / \u10E5\u10D0\u10E0\u10D7\u10E3\u10DA\u10D8",
  'ka-GE':"Georgian (Georgia) / \u10E5\u10D0\u10E0\u10D7\u10E3\u10DA\u10D8 (\u10E1\u10D0\u10E5\u10D0\u10E0\u10D7\u10D5\u10D4\u10DA\u10DD)",
  de:"German / Deutsch",
  'de-AT':"German (Austria) / Deutsch (\xD6sterreich)",
  'de-DE':"German (Germany) / Deutsch (Deutschland)",
  'de-LI':"German (Liechtenstein) / Deutsch (Liechtenstein)",
  'de-LU':"German (Luxembourg) / Deutsch (Luxemburg)",
  'de-CH':"German (Switzerland) / Deutsch (Schweiz)",
  el:"Greek / \u0395\u03BB\u03BB\u03B7\u03BD\u03B9\u03BA\u03AC",
  'el-GR':"Greek (Greece) / \u0395\u03BB\u03BB\u03B7\u03BD\u03B9\u03BA\u03AC (\u0395\u03BB\u03BB\u03AC\u03B4\u03B1)",
  kl:"Greenlandic / kalaallisut",
  'kl-GL':"Greenlandic (Greenland) / kalaallisut (Kalaallit Nunaat)",
  gu:"Gujarati / \u0A97\u0AC1\u0A9C\u0AB0\u0ABE\u0AA4\u0AC0",
  'gu-IN':"Gujarati (India) / \u0A97\u0AC1\u0A9C\u0AB0\u0ABE\u0AA4\u0AC0 (\u0AAD\u0ABE\u0AB0\u0AA4)",
  ha:"Hausa / Hausa",
  'ha-Latn':"Hausa (Latin) / Hausa (Latin)",
  'ha-Latn-NG':"Hausa (Latin, Nigeria) / Hausa (Nigeria)",
  he:"Hebrew\u200E / \u05E2\u05D1\u05E8\u05D9\u05EA\u200F",
  'he-IL':"Hebrew (Israel)\u200E / \u05E2\u05D1\u05E8\u05D9\u05EA (\u05D9\u05E9\u05E8\u05D0\u05DC)\u200F",
  hi:"Hindi / \u0939\u093F\u0902\u0926\u0940",
  'hi-IN':"Hindi (India) / \u0939\u093F\u0902\u0926\u0940 (\u092D\u093E\u0930\u0924)",
  hu:"Hungarian / magyar",
  'hu-HU':"Hungarian (Hungary) / magyar (Magyarorsz\xE1g)",
  is:"Icelandic / \xEDslenska",
  'is-IS':"Icelandic (Iceland) / \xEDslenska (\xCDsland)",
  ig:"Igbo / Igbo",
  'ig-NG':"Igbo (Nigeria) / Igbo (Nigeria)",
  id:"Indonesian / Bahasa Indonesia",
  'id-ID':"Indonesian (Indonesia) / Bahasa Indonesia (Indonesia)",
  iu:"Inuktitut / Inuktitut",
  'iu-Latn':"Inuktitut (Latin) / Inuktitut (Qaliujaaqpait)",
  'iu-Latn-CA':"Inuktitut (Latin, Canada) / Inuktitut",
  'iu-Cans':"Inuktitut (Syllabics) / \u1403\u14C4\u1483\u144E\u1450\u1466 (\u1583\u14C2\u1405\u152E\u1585\u1438\u1403\u1466)",
  'iu-Cans-CA':"Inuktitut (Syllabics, Canada) / \u1403\u14C4\u1483\u144E\u1450\u1466 (\u1472\u14C7\u1455\u14A5)",
  ga:"Irish / Gaeilge",
  'ga-IE':"Irish (Ireland) / Gaeilge (\xC9ire)",
  xh:"isiXhosa / isiXhosa",
  'xh-ZA':"isiXhosa (South Africa) / isiXhosa (uMzantsi Afrika)",
  zu:"isiZulu / isiZulu",
  'zu-ZA':"isiZulu (South Africa) / isiZulu (iNingizimu Afrika)",
  it:"Italian / italiano",
  'it-IT':"Italian (Italy) / italiano (Italia)",
  'it-CH':"Italian (Switzerland) / italiano (Svizzera)",
  ja:"Japanese / \u65E5\u672C\u8A9E",
  'ja-JP':"Japanese (Japan) / \u65E5\u672C\u8A9E (\u65E5\u672C)",
  kn:"Kannada / \u0C95\u0CA8\u0CCD\u0CA8\u0CA1",
  'kn-IN':"Kannada (India) / \u0C95\u0CA8\u0CCD\u0CA8\u0CA1 (\u0CAD\u0CBE\u0CB0\u0CA4)",
  kk:"Kazakh / \u049A\u0430\u0437\u0430\u049B",
  'kk-KZ':"Kazakh (Kazakhstan) / \u049A\u0430\u0437\u0430\u049B (\u049A\u0430\u0437\u0430\u049B\u0441\u0442\u0430\u043D)",
  km:"Khmer / \u1781\u17D2\u1798\u17C2\u179A",
  'km-KH':"Khmer (Cambodia) / \u1781\u17D2\u1798\u17C2\u179A (\u1780\u1798\u17D2\u1796\u17BB\u1787\u17B6)",
  qut:"K'iche / K'iche",
  'qut-GT':"K'iche (Guatemala) / K'iche (Guatemala)",
  rw:"Kinyarwanda / Kinyarwanda",
  'rw-RW':"Kinyarwanda (Rwanda) / Kinyarwanda (Rwanda)",
  sw:"Kiswahili / Kiswahili",
  'sw-KE':"Kiswahili (Kenya) / Kiswahili (Kenya)",
  kok:"Konkani / \u0915\u094B\u0902\u0915\u0923\u0940",
  'kok-IN':"Konkani (India) / \u0915\u094B\u0902\u0915\u0923\u0940 (\u092D\u093E\u0930\u0924)",
  ko:"Korean / \uD55C\uAD6D\uC5B4",
  'ko-KR':"Korean (Korea) / \uD55C\uAD6D\uC5B4 (\uB300\uD55C\uBBFC\uAD6D)",
  ky:"Kyrgyz / \u041A\u044B\u0440\u0433\u044B\u0437",
  'ky-KG':"Kyrgyz (Kyrgyzstan) / \u041A\u044B\u0440\u0433\u044B\u0437 (\u041A\u044B\u0440\u0433\u044B\u0437\u0441\u0442\u0430\u043D)",
  lo:"Lao / \u0EA5\u0EB2\u0EA7",
  'lo-LA':"Lao (Lao P.D.R.) / \u0EA5\u0EB2\u0EA7 (\u0EAA.\u0E9B.\u0E9B. \u0EA5\u0EB2\u0EA7)",
  lv:"Latvian / latvie\u0161u",
  'lv-LV':"Latvian (Latvia) / latvie\u0161u (Latvija)",
  lt:"Lithuanian / lietuvi\u0173",
  'lt-LT':"Lithuanian (Lithuania) / lietuvi\u0173 (Lietuva)",
  dsb:"Lower Sorbian / dolnoserb\u0161\u0107ina",
  'dsb-DE':"Lower Sorbian (Germany) / dolnoserb\u0161\u0107ina (Nimska)",
  lb:"Luxembourgish / L\xEBtzebuergesch",
  'lb-LU':"Luxembourgish (Luxembourg) / L\xEBtzebuergesch (Luxembourg)",
  'mk-MK':"Macedonian (Former Yugoslav Republic of Macedonia) / \u043C\u0430\u043A\u0435\u0434\u043E\u043D\u0441\u043A\u0438 \u0458\u0430\u0437\u0438\u043A (\u041C\u0430\u043A\u0435\u0434\u043E\u043D\u0438\u0458\u0430)",
  mk:"Macedonian (FYROM) / \u043C\u0430\u043A\u0435\u0434\u043E\u043D\u0441\u043A\u0438 \u0458\u0430\u0437\u0438\u043A",
  ms:"Malay / Bahasa Melayu",
  'ms-BN':"Malay (Brunei Darussalam) / Bahasa Melayu (Brunei Darussalam)",
  'ms-MY':"Malay (Malaysia) / Bahasa Melayu (Malaysia)",
  ml:"Malayalam / \u0D2E\u0D32\u0D2F\u0D3E\u0D33\u0D02",
  'ml-IN':"Malayalam (India) / \u0D2E\u0D32\u0D2F\u0D3E\u0D33\u0D02 (\u0D2D\u0D3E\u0D30\u0D24\u0D02)",
  mt:"Maltese / Malti",
  'mt-MT':"Maltese (Malta) / Malti (Malta)",
  mi:"Maori / Reo M\u0101ori",
  'mi-NZ':"Maori (New Zealand) / Reo M\u0101ori (Aotearoa)",
  arn:"Mapudungun / Mapudungun",
  'arn-CL':"Mapudungun (Chile) / Mapudungun (Chile)",
  mr:"Marathi / \u092E\u0930\u093E\u0920\u0940",
  'mr-IN':"Marathi (India) / \u092E\u0930\u093E\u0920\u0940 (\u092D\u093E\u0930\u0924)",
  moh:"Mohawk / Kanien'k\xE9ha",
  'moh-CA':"Mohawk (Mohawk) / Kanien'k\xE9ha",
  mn:"Mongolian (Cyrillic) / \u041C\u043E\u043D\u0433\u043E\u043B \u0445\u044D\u043B",
  'mn-Cyrl':"Mongolian (Cyrillic) / \u041C\u043E\u043D\u0433\u043E\u043B \u0445\u044D\u043B",
  'mn-MN':"Mongolian (Cyrillic, Mongolia) / \u041C\u043E\u043D\u0433\u043E\u043B \u0445\u044D\u043B (\u041C\u043E\u043D\u0433\u043E\u043B \u0443\u043B\u0441)",
  'mn-Mong':"Mongolian (Traditional Mongolian) / \u182E\u1824\u1828\u182D\u182D\u1824\u182F \u182C\u1821\u182F\u1821",
  'mn-Mong-CN':"Mongolian (Traditional Mongolian, PRC) / \u182E\u1824\u1828\u182D\u182D\u1824\u182F \u182C\u1821\u182F\u1821 (\u182A\u1826\u182D\u1826\u1833\u1821 \u1828\u1820\u1822\u1837\u1820\u182E\u1833\u1820\u182C\u1824 \u1833\u1824\u182E\u1833\u1820\u1833\u1824 \u1820\u1837\u1820\u1833 \u1823\u182F\u1823\u1830)",
  ne:"Nepali / \u0928\u0947\u092A\u093E\u0932\u0940",
  'ne-NP':"Nepali (Nepal) / \u0928\u0947\u092A\u093E\u0932\u0940 (\u0928\u0947\u092A\u093E\u0932)",
  no:"Norwegian / norsk",
  nb:"Norwegian (Bokm\xE5l) / norsk (bokm\xE5l)",
  nn:"Norwegian (Nynorsk) / norsk (nynorsk)",
  'nb-NO':"Norwegian, Bokm\xE5l (Norway) / norsk, bokm\xE5l (Norge)",
  'nn-NO':"Norwegian, Nynorsk (Norway) / norsk, nynorsk (Noreg)",
  oc:"Occitan / Occitan",
  'oc-FR':"Occitan (France) / Occitan (Fran\xE7a)",
  or:"Oriya / \u0B13\u0B21\u0B3C\u0B3F\u0B06",
  'or-IN':"Oriya (India) / \u0B13\u0B21\u0B3C\u0B3F\u0B06 (\u0B2D\u0B3E\u0B30\u0B24)",
  ps:"Pashto\u200E / \u067E\u069A\u062A\u0648\u200F",
  'ps-AF':"Pashto (Afghanistan)\u200E / \u067E\u069A\u062A\u0648 (\u0627\u0641\u063A\u0627\u0646\u0633\u062A\u0627\u0646)\u200F",
  fa:"Persian\u200E / \u0641\u0627\u0631\u0633\u0649\u200F",
  'fa-IR':"Persian\u200E / \u0641\u0627\u0631\u0633\u0649 (\u0627\u06CC\u0631\u0627\u0646)\u200F",
  pl:"Polish / polski",
  'pl-PL':"Polish (Poland) / polski (Polska)",
  pt:"Portuguese / Portugu\xEAs",
  'pt-BR':"Portuguese (Brazil) / Portugu\xEAs (Brasil)",
  'pt-PT':"Portuguese (Portugal) / portugu\xEAs (Portugal)",
  pa:"Punjabi / \u0A2A\u0A70\u0A1C\u0A3E\u0A2C\u0A40",
  'pa-IN':"Punjabi (India) / \u0A2A\u0A70\u0A1C\u0A3E\u0A2C\u0A40 (\u0A2D\u0A3E\u0A30\u0A24)",
  quz:"Quechua / runasimi",
  'quz-BO':"Quechua (Bolivia) / runasimi (Qullasuyu)",
  'quz-EC':"Quechua (Ecuador) / runasimi (Ecuador)",
  'quz-PE':"Quechua (Peru) / runasimi (Piruw)",
  ro:"Romanian / rom\xE2n\u0103",
  'ro-RO':"Romanian (Romania) / rom\xE2n\u0103 (Rom\xE2nia)",
  rm:"Romansh / Rumantsch",
  'rm-CH':"Romansh (Switzerland) / Rumantsch (Svizra)",
  ru:"Russian / \u0440\u0443\u0441\u0441\u043A\u0438\u0439",
  'ru-RU':"Russian (Russia) / \u0440\u0443\u0441\u0441\u043A\u0438\u0439 (\u0420\u043E\u0441\u0441\u0438\u044F)",
  smn:"Sami (Inari) / s\xE4mikiel\xE2",
  smj:"Sami (Lule) / julevus\xE1megiella",
  se:"Sami (Northern) / davvis\xE1megiella",
  sms:"Sami (Skolt) / s\xE4\xE4m\xB4\u01E9i\xF5ll",
  sma:"Sami (Southern) / \xE5arjelsaemiengiele",
  'smn-FI':"Sami, Inari (Finland) / s\xE4mikiel\xE2 (Suom\xE2)",
  'smj-NO':"Sami, Lule (Norway) / julevus\xE1megiella (Vuodna)",
  'smj-SE':"Sami, Lule (Sweden) / julevus\xE1megiella (Svierik)",
  'se-FI':"Sami, Northern (Finland) / davvis\xE1megiella (Suopma)",
  'se-NO':"Sami, Northern (Norway) / davvis\xE1megiella (Norga)",
  'se-SE':"Sami, Northern (Sweden) / davvis\xE1megiella (Ruo\u0167\u0167a)",
  'sms-FI':"Sami, Skolt (Finland) / s\xE4\xE4m\xB4\u01E9i\xF5ll (L\xE4\xE4\xB4ddj\xE2nnam)",
  'sma-NO':"Sami, Southern (Norway) / \xE5arjelsaemiengiele (N\xF6\xF6rje)",
  'sma-SE':"Sami, Southern (Sweden) / \xE5arjelsaemiengiele (Sveerje)",
  sa:"Sanskrit / \u0938\u0902\u0938\u094D\u0915\u0943\u0924",
  'sa-IN':"Sanskrit (India) / \u0938\u0902\u0938\u094D\u0915\u0943\u0924 (\u092D\u093E\u0930\u0924\u092E\u094D)",
  gd:"Scottish Gaelic / G\xE0idhlig",
  'gd-GB':"Scottish Gaelic (United Kingdom) / G\xE0idhlig (An R\xECoghachd Aonaichte)",
  sr:"Serbian / srpski",
  'sr-Cyrl':"Serbian (Cyrillic) / \u0441\u0440\u043F\u0441\u043A\u0438 (\u040B\u0438\u0440\u0438\u043B\u0438\u0446\u0430)",
  'sr-Cyrl-BA':"Serbian (Cyrillic, Bosnia and Herzegovina) / \u0441\u0440\u043F\u0441\u043A\u0438 (\u0411\u043E\u0441\u043D\u0430 \u0438 \u0425\u0435\u0440\u0446\u0435\u0433\u043E\u0432\u0438\u043D\u0430)",
  'sr-Cyrl-ME':"Serbian (Cyrillic, Montenegro) / \u0441\u0440\u043F\u0441\u043A\u0438 (\u0426\u0440\u043D\u0430 \u0413\u043E\u0440\u0430)",
  'sr-Cyrl-CS':"Serbian (Cyrillic, Serbia and Montenegro (Former)) / \u0441\u0440\u043F\u0441\u043A\u0438 (\u0421\u0440\u0431\u0438\u0458\u0430 \u0438 \u0426\u0440\u043D\u0430 \u0413\u043E\u0440\u0430 (\u041F\u0440\u0435\u0442\u0445\u043E\u0434\u043D\u043E))",
  'sr-Cyrl-RS':"Serbian (Cyrillic, Serbia) / \u0441\u0440\u043F\u0441\u043A\u0438 (\u0421\u0440\u0431\u0438\u0458\u0430)",
  'sr-Latn':"Serbian (Latin) / srpski (Latinica)",
  'sr-Latn-BA':"Serbian (Latin, Bosnia and Herzegovina) / srpski (Bosna i Hercegovina)",
  'sr-Latn-ME':"Serbian (Latin, Montenegro) / srpski (Crna Gora)",
  'sr-Latn-CS':"Serbian (Latin, Serbia and Montenegro (Former)) / srpski (Srbija i Crna Gora (Prethodno))",
  'sr-Latn-RS':"Serbian (Latin, Serbia) / srpski (Srbija)",
  nso:"Sesotho sa Leboa / Sesotho sa Leboa",
  'nso-ZA':"Sesotho sa Leboa (South Africa) / Sesotho sa Leboa (Afrika Borwa)",
  tn:"Setswana / Setswana",
  'tn-ZA':"Setswana (South Africa) / Setswana (Aforika Borwa)",
  si:"Sinhala / \u0DC3\u0DD2\u0D82\u0DC4",
  'si-LK':"Sinhala (Sri Lanka) / \u0DC3\u0DD2\u0D82\u0DC4 (\u0DC1\u0DCA\u200D\u0DBB\u0DD3 \u0DBD\u0D82\u0D9A\u0DCF)",
  sk:"Slovak / sloven\u010Dina",
  'sk-SK':"Slovak (Slovakia) / sloven\u010Dina (Slovensk\xE1 republika)",
  sl:"Slovenian / slovenski",
  'sl-SI':"Slovenian (Slovenia) / slovenski (Slovenija)",
  es:"Spanish / espa\xF1ol",
  'es-AR':"Spanish (Argentina) / Espa\xF1ol (Argentina)",
  'es-BO':"Spanish (Bolivia) / Espa\xF1ol (Bolivia)",
  'es-CL':"Spanish (Chile) / Espa\xF1ol (Chile)",
  'es-CO':"Spanish (Colombia) / Espa\xF1ol (Colombia)",
  'es-CR':"Spanish (Costa Rica) / Espa\xF1ol (Costa Rica)",
  'es-DO':"Spanish (Dominican Republic) / Espa\xF1ol (Rep\xFAblica Dominicana)",
  'es-EC':"Spanish (Ecuador) / Espa\xF1ol (Ecuador)",
  'es-SV':"Spanish (El Salvador) / Espa\xF1ol (El Salvador)",
  'es-GT':"Spanish (Guatemala) / Espa\xF1ol (Guatemala)",
  'es-HN':"Spanish (Honduras) / Espa\xF1ol (Honduras)",
  'es-MX':"Spanish (Mexico) / Espa\xF1ol (M\xE9xico)",
  'es-NI':"Spanish (Nicaragua) / Espa\xF1ol (Nicaragua)",
  'es-PA':"Spanish (Panama) / Espa\xF1ol (Panam\xE1)",
  'es-PY':"Spanish (Paraguay) / Espa\xF1ol (Paraguay)",
  'es-PE':"Spanish (Peru) / Espa\xF1ol (Per\xFA)",
  'es-PR':"Spanish (Puerto Rico) / Espa\xF1ol (Puerto Rico)",
  'es-ES':"Spanish (Spain, International Sort) / Espa\xF1ol (Espa\xF1a, alfabetizaci\xF3n internacional)",
  'es-US':"Spanish (United States) / Espa\xF1ol (Estados Unidos)",
  'es-UY':"Spanish (Uruguay) / Espa\xF1ol (Uruguay)",
  'es-VE':"Spanish (Venezuela) / Espa\xF1ol (Republica Bolivariana de Venezuela)",
  sv:"Swedish / svenska",
  'sv-FI':"Swedish (Finland) / svenska (Finland)",
  'sv-SE':"Swedish (Sweden) / svenska (Sverige)",
  syr:"Syriac\u200E / \u0723\u0718\u072A\u071D\u071D\u0710\u200F",
  'syr-SY':"Syriac (Syria)\u200E / \u0723\u0718\u072A\u071D\u071D\u0710 (\u0633\u0648\u0631\u064A\u0627)\u200F",
  tg:"Tajik (Cyrillic) / \u0422\u043E\u04B7\u0438\u043A\u04E3",
  'tg-Cyrl':"Tajik (Cyrillic) / \u0422\u043E\u04B7\u0438\u043A\u04E3",
  'tg-Cyrl-TJ':"Tajik (Cyrillic, Tajikistan) / \u0422\u043E\u04B7\u0438\u043A\u04E3 (\u0422\u043E\u04B7\u0438\u043A\u0438\u0441\u0442\u043E\u043D)",
  tzm:"Tamazight / Tamazight",
  'tzm-Latn':"Tamazight (Latin) / Tamazight (Latin)",
  'tzm-Latn-DZ':"Tamazight (Latin, Algeria) / Tamazight (Djaza\xEFr)",
  ta:"Tamil / \u0BA4\u0BAE\u0BBF\u0BB4\u0BCD",
  'ta-IN':"Tamil (India) / \u0BA4\u0BAE\u0BBF\u0BB4\u0BCD (\u0B87\u0BA8\u0BCD\u0BA4\u0BBF\u0BAF\u0BBE)",
  tt:"Tatar / \u0422\u0430\u0442\u0430\u0440",
  'tt-RU':"Tatar (Russia) / \u0422\u0430\u0442\u0430\u0440 (\u0420\u043E\u0441\u0441\u0438\u044F)",
  te:"Telugu / \u0C24\u0C46\u0C32\u0C41\u0C17\u0C41",
  'te-IN':"Telugu (India) / \u0C24\u0C46\u0C32\u0C41\u0C17\u0C41 (\u0C2D\u0C3E\u0C30\u0C24 \u0C26\u0C47\u0C36\u0C02)",
  th:"Thai / \u0E44\u0E17\u0E22",
  'th-TH':"Thai (Thailand) / \u0E44\u0E17\u0E22 (\u0E44\u0E17\u0E22)",
  bo:"Tibetan / \u0F56\u0F7C\u0F51\u0F0B\u0F61\u0F72\u0F42",
  'bo-CN':"Tibetan (PRC) / \u0F56\u0F7C\u0F51\u0F0B\u0F61\u0F72\u0F42 (\u0F40\u0FB2\u0F74\u0F44\u0F0B\u0F67\u0FAD\u0F0B\u0F58\u0F72\u0F0B\u0F51\u0F58\u0F44\u0F66\u0F0B\u0F66\u0FA4\u0FB1\u0F72\u0F0B\u0F58\u0F50\u0F74\u0F53\u0F0B\u0F62\u0F92\u0FB1\u0F63\u0F0B\u0F41\u0F56\u0F0D)",
  tr:"Turkish / T\xFCrk\xE7e",
  'tr-TR':"Turkish (Turkey) / T\xFCrk\xE7e (T\xFCrkiye)",
  tk:"Turkmen / t\xFCrkmen\xE7e",
  'tk-TM':"Turkmen (Turkmenistan) / t\xFCrkmen\xE7e (T\xFCrkmenistan)",
  uk:"Ukrainian / \u0443\u043A\u0440\u0430\u0457\u043D\u0441\u044C\u043A\u0430",
  'uk-UA':"Ukrainian (Ukraine) / \u0443\u043A\u0440\u0430\u0457\u043D\u0441\u044C\u043A\u0430 (\u0423\u043A\u0440\u0430\u0457\u043D\u0430)",
  hsb:"Upper Sorbian / hornjoserb\u0161\u0107ina",
  'hsb-DE':"Upper Sorbian (Germany) / hornjoserb\u0161\u0107ina (N\u011Bmska)",
  ur:"Urdu\u200E / \u0627\u064F\u0631\u062F\u0648\u200F",
  'ur-PK':"Urdu (Islamic Republic of Pakistan)\u200E / \u0627\u064F\u0631\u062F\u0648 (\u067E\u0627\u06A9\u0633\u062A\u0627\u0646)\u200F",
  ug:"Uyghur\u200E / \u0626\u06C7\u064A\u063A\u06C7\u0631 \u064A\u06D0\u0632\u0649\u0642\u0649\u200F",
  'ug-CN':"Uyghur (PRC)\u200E / (\u0626\u06C7\u064A\u063A\u06C7\u0631 \u064A\u06D0\u0632\u0649\u0642\u0649 (\u062C\u06C7\u06AD\u062E\u06C7\u0627 \u062E\u06D5\u0644\u0642 \u062C\u06C7\u0645\u06BE\u06C7\u0631\u0649\u064A\u0649\u062A\u0649\u200F",
  'uz-Cyrl':"Uzbek (Cyrillic) / \u040E\u0437\u0431\u0435\u043A",
  'uz-Cyrl-UZ':"Uzbek (Cyrillic, Uzbekistan) / \u040E\u0437\u0431\u0435\u043A (\u040E\u0437\u0431\u0435\u043A\u0438\u0441\u0442\u043E\u043D)",
  uz:"Uzbek (Latin) / U'zbek",
  'uz-Latn':"Uzbek (Latin) / U'zbek",
  'uz-Latn-UZ':"Uzbek (Latin, Uzbekistan) / U'zbek (U'zbekiston Respublikasi)",
  vi:"Vietnamese / Ti\u1EBFng Vi\u1EC7t",
  'vi-VN':"Vietnamese (Vietnam) / Ti\u1EBFng Vi\u1EC7t (Vi\u1EC7t Nam)",
  cy:"Welsh / Cymraeg",
  'cy-GB':"Welsh (United Kingdom) / Cymraeg (y Deyrnas Unedig)",
  wo:"Wolof / Wolof",
  'wo-SN':"Wolof (Senegal) / Wolof (S\xE9n\xE9gal)",
  sah:"Yakut / \u0441\u0430\u0445\u0430",
  'sah-RU':"Yakut (Russia) / \u0441\u0430\u0445\u0430 (\u0420\u043E\u0441\u0441\u0438\u044F)",
  ii:"Yi / \uA188\uA320\uA071\uA0B7",
  'ii-CN':"Yi (PRC) / \uA188\uA320\uA071\uA0B7 (\uA34F\uA278\uA3D3\uA0B1\uA1ED\uA27C\uA1E9)",
  yo:"Yoruba / Yoruba",
  'yo-NG':"Yoruba (Nigeria) / Yoruba (Nigeria)",
};

/**
 * @class LocalizeCompleter
 *
 */
let LocalizeCompleter = new Class().extends(CompleterBase);
LocalizeCompleter.definition = {

  get id()
    "localize-completer",

  get type()
    "localize",

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
    let pattern = /^\s*([a-zA-Z-]*)(\s*)("?)((?:[^"])*)("?)(\s*)(.*)/;
    let match = source.match(pattern);
    let [all, language, space, quote_start, message_id, quote_end, space2, next] = match;
    if (!space) {
      let languages = [key for ([key, ] in Iterator(locale_id_map))]
        .filter(function(iso639_language) 
          { 
            return -1 != iso639_language.toLowerCase()
              .indexOf(language.toLowerCase()); 
          });
      if (0 == languages.length) {
        listener.doCompletion(autocomplete_result);
        return -1;
      }
      let autocomplete_result = {
        type: "text",
        query: source, 
        labels: languages, 
        comments: languages.map(function(language) locale_id_map[language]),
        data: languages.map(function(language) ({
          name: language, 
          value: locale_id_map[language],
        })),
      };
      listener.doCompletion(autocomplete_result);
      return 0;
    }
    let lower_message_id = message_id.toLowerCase();

    if (!this._keys) {
      this._keys = [id for (id in coUtils.Localize.generateMessages())];
    }
    let dict = coUtils.Localize.getDictionary(language);
    let data = [
      {
        name: key,
        value: dict[key] || "",
      } for ([, key] in Iterator(this._keys))
    ].filter(function(pair) 
    {
      if (-1 != pair.name.toLowerCase().indexOf(lower_message_id)) {
        return true;
      }
      return false;
    });
    if (0 == data.length) {
      listener.doCompletion(null);
      return -1;
    }
    if (!space2) {
      let autocomplete_result = {
        type: "text",
        option: "quoted",
        query: message_id, 
        labels: data.map(function(pair) "\"" + pair.name.replace(/[\\"]/, function(ch) "\\" + ch) + "\""),
        comments: data.map(function(pair) pair.value),
        data: data,
      };
      listener.doCompletion(autocomplete_result);
      return 0;
    }
    let autocomplete_result = {
      type: "text",
      option: "quoted",
      query: next, 
      labels: data.map(function(pair) "\"" + pair.value.replace(/[\\"]/, function(ch) "\\" + ch) + "\""),
      comments: data.map(function(pair) pair.value == message_id ? "<current>": ""),
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
              text: web140_color_map_reverse[pair.value] || "",
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
                      font-size: 19px;
                      font-weight: bold; 
                      margin: 0px; 
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
      new JsCompleter(session);
      new HistoryCompleter(session);
      new OptionCompleter(session);
      new CommandCompleter(session);
      new ProfileCompleter(session);
      new FontsizeCompleter(session);
      new FontFamilyCompleter(session);
      new ColorNumberCompleter(session);
      new LocalizeCompleter(session);
      new PluginsCompleter(session);
      new CharsetCompleter(session);

      new ColorCompletionDisplayDriver(session);
      new ColorNumberCompletionDisplayDriver(session);
      new FontsizeCompletionDisplayDriver(session);
      new FontFamilyCompletionDisplayDriver(session);
      new TextCompletionDisplayDriver(session);
    });
}


