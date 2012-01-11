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

let locale_id_map = {
  af:"Afrikaans / Afrikaans",
  'af-ZA':"Afrikaans (South Africa) / Afrikaans",
  sq:"Albanian / Albanian",
  'sq-AL':"Albanian (Albania) / Albanian",
  gsw:"Alsatian / Alsatian",
  'gsw-FR':"Alsatian (France) / Alsatian",
  am:"Amharic / Amharic",
  'am-ET':"Amharic (Ethiopia) / Amharic",
  ar:"Arabic\xE2\x80\x8E / Arabic",
  'ar-DZ':"Arabic (Algeria)\xE2\x80\x8E / Arabic",
  'ar-BH':"Arabic (Bahrain)\xE2\x80\x8E / Arabic",
  'ar-EG':"Arabic (Egypt)\xE2\x80\x8E / Arabic",
  'ar-IQ':"Arabic (Iraq)\xE2\x80\x8E / Arabic",
  'ar-JO':"Arabic (Jordan)\xE2\x80\x8E / Arabic",
  'ar-KW':"Arabic (Kuwait)\xE2\x80\x8E / Arabic",
  'ar-LB':"Arabic (Lebanon)\xE2\x80\x8E / Arabic",
  'ar-LY':"Arabic (Libya)\xE2\x80\x8E / Arabic",
  'ar-MA':"Arabic (Morocco)\xE2\x80\x8E / Arabic",
  'ar-OM':"Arabic (Oman)\xE2\x80\x8E / Arabic",
  'ar-QA':"Arabic (Qatar)\xE2\x80\x8E / Arabic",
  'ar-SA':"Arabic (Saudi Arabia)\xE2\x80\x8E / Arabic",
  'ar-SY':"Arabic (Syria)\xE2\x80\x8E / Arabic",
  'ar-TN':"Arabic (Tunisia)\xE2\x80\x8E / Arabic",
  'ar-AE':"Arabic (U.A.E.)\xE2\x80\x8E / Arabic",
  'ar-YE':"Arabic (Yemen)\xE2\x80\x8E / Arabic",
  hy:"Armenian / Armenian",
  'hy-AM':"Armenian (Armenia) / Armenian",
  as:"Assamese / Assamese",
  'as-IN':"Assamese (India) / Assamese",
  az:"Azeri / Azeri (Latin)",
  'az-Cyrl':"Azeri (Cyrillic) / Azeri (Cyrillic)",
  'az-Cyrl-AZ':"Azeri (Cyrillic, Azerbaijan) / Azeri (Cyrillic)",
  'az-Latn':"Azeri (Latin) / Azeri (Latin)",
  'az-Latn-AZ':"Azeri (Latin, Azerbaijan) / Azeri (Latin)",
  ba:"Bashkir / Bashkir",
  'ba-RU':"Bashkir (Russia) / Bashkir",
  eu:"Basque / Basque",
  'eu-ES':"Basque (Basque) / Basque",
  be:"Belarusian / Belarusian",
  'be-BY':"Belarusian (Belarus) / Belarusian",
  bn:"Bengali / Bengali",
  'bn-BD':"Bengali (Bangladesh) / Bengali",
  'bn-IN':"Bengali (India) / Bengali",
  bs:"Bosnian / Bosnian (Latin)",
  'bs-Cyrl':"Bosnian (Cyrillic) / Bosnian (Cyrillic)",
  'bs-Cyrl-BA':"Bosnian (Cyrillic, Bosnia and Herzegovina) / Bosnian (Cyrillic)",
  'bs-Latn':"Bosnian (Latin) / Bosnian (Latin)",
  'bs-Latn-BA':"Bosnian (Latin, Bosnia and Herzegovina) / Bosnian (Latin)",
  br:"Breton / Breton",
  'br-FR':"Breton (France) / Breton",
  bg:"Bulgarian / Bulgarian",
  'bg-BG':"Bulgarian (Bulgaria) / Bulgarian",
  ca:"Catalan / Catalan",
  'ca-ES':"Catalan (Catalan) / Catalan",
  zh:"Chinese / Chinese (Simplified)",
  'zh-Hans':"Chinese (Simplified) / Chinese (Simplified)",
  'zh-CN':"Chinese (Simplified, PRC) / Chinese (Simplified)",
  'zh-SG':"Chinese (Simplified, Singapore) / Chinese (Simplified)",
  'zh-Hant':"Chinese (Traditional) / Chinese (Traditional)",
  'zh-HK':"Chinese (Traditional, Hong Kong S.A.R.) / Chinese (Traditional)",
  'zh-MO':"Chinese (Traditional, Macao S.A.R.) / Chinese (Traditional)",
  'zh-TW':"Chinese (Traditional, Taiwan) / Chinese (Traditional)",
  co:"Corsican / Corsican",
  'co-FR':"Corsican (France) / Corsican",
  hr:"Croatian / Croatian",
  'hr-HR':"Croatian (Croatia) / Croatian",
  'hr-BA':"Croatian (Latin, Bosnia and Herzegovina) / Croatian (Latin)",
  cs:"Czech / Czech",
  'cs-CZ':"Czech (Czech Republic) / Czech",
  da:"Danish / Danish",
  'da-DK':"Danish (Denmark) / Danish",
  prs:"Dari\xE2\x80\x8E / Dari",
  'prs-AF':"Dari (Afghanistan)\xE2\x80\x8E / Dari",
  dv:"Divehi\xE2\x80\x8E / Divehi",
  'dv-MV':"Divehi (Maldives)\xE2\x80\x8E / Divehi",
  nl:"Dutch / Dutch",
  'nl-BE':"Dutch (Belgium) / Dutch",
  'nl-NL':"Dutch (Netherlands) / Dutch",
  en:"English / English",
  'en-AU':"English (Australia) / English",
  'en-BZ':"English (Belize) / English",
  'en-CA':"English (Canada) / English",
  'en-029':"English (Caribbean) / English",
  'en-IN':"English (India) / English",
  'en-IE':"English (Ireland) / English",
  'en-JM':"English (Jamaica) / English",
  'en-MY':"English (Malaysia) / English",
  'en-NZ':"English (New Zealand) / English",
  'en-PH':"English (Republic of the Philippines) / English",
  'en-SG':"English (Singapore) / English",
  'en-ZA':"English (South Africa) / English",
  'en-TT':"English (Trinidad and Tobago) / English",
  'en-GB':"English (United Kingdom) / English",
  'en-US':"English (United States) / English",
  'en-ZW':"English (Zimbabwe) / English",
  et:"Estonian / Estonian",
  'et-EE':"Estonian (Estonia) / Estonian",
  fo:"Faroese / Faroese",
  'fo-FO':"Faroese (Faroe Islands) / Faroese",
  fil:"Filipino / Filipino",
  'fil-PH':"Filipino (Philippines) / Filipino",
  fi:"Finnish / Finnish",
  'fi-FI':"Finnish (Finland) / Finnish",
  fr:"French / French",
  'fr-BE':"French (Belgium) / French",
  'fr-CA':"French (Canada) / French",
  'fr-FR':"French (France) / French",
  'fr-LU':"French (Luxembourg) / French",
  'fr-MC':"French (Monaco) / French",
  'fr-CH':"French (Switzerland) / French",
  fy:"Frisian / Frisian",
  'fy-NL':"Frisian (Netherlands) / Frisian",
  gl:"Galician / Galician",
  'gl-ES':"Galician (Galician) / Galician",
  ka:"Georgian / Georgian",
  'ka-GE':"Georgian (Georgia) / Georgian",
  de:"German / German",
  'de-AT':"German (Austria) / German",
  'de-DE':"German (Germany) / German",
  'de-LI':"German (Liechtenstein) / German",
  'de-LU':"German (Luxembourg) / German",
  'de-CH':"German (Switzerland) / German",
  el:"Greek / Greek",
  'el-GR':"Greek (Greece) / Greek",
  kl:"Greenlandic / Greenlandic",
  'kl-GL':"Greenlandic (Greenland) / Greenlandic",
  gu:"Gujarati / Gujarati",
  'gu-IN':"Gujarati (India) / Gujarati",
  ha:"Hausa / Hausa (Latin)",
  'ha-Latn':"Hausa (Latin) / Hausa (Latin)",
  'ha-Latn-NG':"Hausa (Latin, Nigeria) / Hausa (Latin)",
  he:"Hebrew\xE2\x80\x8E / Hebrew",
  'he-IL':"Hebrew (Israel)\xE2\x80\x8E / Hebrew",
  hi:"Hindi / Hindi",
  'hi-IN':"Hindi (India) / Hindi",
  hu:"Hungarian / Hungarian",
  'hu-HU':"Hungarian (Hungary) / Hungarian",
  is:"Icelandic / Icelandic",
  'is-IS':"Icelandic (Iceland) / Icelandic",
  ig:"Igbo / Igbo",
  'ig-NG':"Igbo (Nigeria) / Igbo",
  id:"Indonesian / Indonesian",
  'id-ID':"Indonesian (Indonesia) / Indonesian",
  iu:"Inuktitut / Inuktitut (Latin)",
  'iu-Latn':"Inuktitut (Latin) / Inuktitut (Latin)",
  'iu-Latn-CA':"Inuktitut (Latin, Canada) / Inuktitut (Latin)",
  'iu-Cans':"Inuktitut (Syllabics) / Inuktitut (Syllabics)",
  'iu-Cans-CA':"Inuktitut (Syllabics, Canada) / Inuktitut (Syllabics)",
  ga:"Irish / Irish",
  'ga-IE':"Irish (Ireland) / Irish",
  xh:"isiXhosa / isiXhosa",
  'xh-ZA':"isiXhosa (South Africa) / isiXhosa",
  zu:"isiZulu / isiZulu",
  'zu-ZA':"isiZulu (South Africa) / isiZulu",
  it:"Italian / Italian",
  'it-IT':"Italian (Italy) / Italian",
  'it-CH':"Italian (Switzerland) / Italian",
  ja:"Japanese / Japanese",
  'ja-JP':"Japanese (Japan) / Japanese",
  kn:"Kannada / Kannada",
  'kn-IN':"Kannada (India) / Kannada",
  kk:"Kazakh / Kazakh",
  'kk-KZ':"Kazakh (Kazakhstan) / Kazakh",
  km:"Khmer / Khmer",
  'km-KH':"Khmer (Cambodia) / Khmer",
  qut:"K'iche / K'iche",
  'qut-GT':"K'iche (Guatemala) / K'iche",
  rw:"Kinyarwanda / Kinyarwanda",
  'rw-RW':"Kinyarwanda (Rwanda) / Kinyarwanda",
  sw:"Kiswahili / Kiswahili",
  'sw-KE':"Kiswahili (Kenya) / Kiswahili",
  kok:"Konkani / Konkani",
  'kok-IN':"Konkani (India) / Konkani",
  ko:"Korean / Korean",
  'ko-KR':"Korean (Korea) / Korean",
  ky:"Kyrgyz / Kyrgyz",
  'ky-KG':"Kyrgyz (Kyrgyzstan) / Kyrgyz",
  lo:"Lao / Lao",
  'lo-LA':"Lao (Lao P.D.R.) / Lao",
  lv:"Latvian / Latvian",
  'lv-LV':"Latvian (Latvia) / Latvian",
  lt:"Lithuanian / Lithuanian",
  'lt-LT':"Lithuanian (Lithuania) / Lithuanian",
  dsb:"Lower Sorbian / Lower Sorbian",
  'dsb-DE':"Lower Sorbian (Germany) / Lower Sorbian",
  lb:"Luxembourgish / Luxembourgish",
  'lb-LU':"Luxembourgish (Luxembourg) / Luxembourgish",
  'mk-MK':"Macedonian (Former Yugoslav Republic of Macedonia) / Macedonian (FYROM)",
  mk:"Macedonian (FYROM) / Macedonian (FYROM)",
  ms:"Malay / Malay",
  'ms-BN':"Malay (Brunei Darussalam) / Malay",
  'ms-MY':"Malay (Malaysia) / Malay",
  ml:"Malayalam / Malayalam",
  'ml-IN':"Malayalam (India) / Malayalam",
  mt:"Maltese / Maltese",
  'mt-MT':"Maltese (Malta) / Maltese",
  mi:"Maori / Maori",
  'mi-NZ':"Maori (New Zealand) / Maori",
  arn:"Mapudungun / Mapudungun",
  'arn-CL':"Mapudungun (Chile) / Mapudungun",
  mr:"Marathi / Marathi",
  'mr-IN':"Marathi (India) / Marathi",
  moh:"Mohawk / Mohawk",
  'moh-CA':"Mohawk (Mohawk) / Mohawk",
  mn:"Mongolian (Cyrillic) / Mongolian (Cyrillic)",
  'mn-Cyrl':"Mongolian (Cyrillic) / Mongolian (Cyrillic)",
  'mn-MN':"Mongolian (Cyrillic, Mongolia) / Mongolian (Cyrillic)",
  'mn-Mong':"Mongolian (Traditional Mongolian) / Mongolian (Traditional Mongolian)",
  'mn-Mong-CN':"Mongolian (Traditional Mongolian, PRC) / Mongolian (Traditional Mongolian)",
  ne:"Nepali / Nepali",
  'ne-NP':"Nepali (Nepal) / Nepali",
  no:"Norwegian / Norwegian (Bokm\xC3\xA5l)",
  nb:"Norwegian (Bokm\xC3\xA5l) / Norwegian (Bokm\xC3\xA5l)",
  nn:"Norwegian (Nynorsk) / Norwegian (Nynorsk)",
  'nb-NO':"Norwegian, Bokm\xC3\xA5l (Norway) / Norwegian (Bokm\xC3\xA5l)",
  'nn-NO':"Norwegian, Nynorsk (Norway) / Norwegian (Nynorsk)",
  oc:"Occitan / Occitan",
  'oc-FR':"Occitan (France) / Occitan",
  or:"Oriya / Oriya",
  'or-IN':"Oriya (India) / Oriya",
  ps:"Pashto\xE2\x80\x8E / Pashto",
  'ps-AF':"Pashto (Afghanistan)\xE2\x80\x8E / Pashto",
  fa:"Persian\xE2\x80\x8E / Persian",
  'fa-IR':"Persian\xE2\x80\x8E / Persian",
  pl:"Polish / Polish",
  'pl-PL':"Polish (Poland) / Polish",
  pt:"Portuguese / Portuguese",
  'pt-BR':"Portuguese (Brazil) / Portuguese",
  'pt-PT':"Portuguese (Portugal) / Portuguese",
  pa:"Punjabi / Punjabi",
  'pa-IN':"Punjabi (India) / Punjabi",
  quz:"Quechua / Quechua",
  'quz-BO':"Quechua (Bolivia) / Quechua",
  'quz-EC':"Quechua (Ecuador) / Quechua",
  'quz-PE':"Quechua (Peru) / Quechua",
  ro:"Romanian / Romanian",
  'ro-RO':"Romanian (Romania) / Romanian",
  rm:"Romansh / Romansh",
  'rm-CH':"Romansh (Switzerland) / Romansh",
  ru:"Russian / Russian",
  'ru-RU':"Russian (Russia) / Russian",
  smn:"Sami (Inari) / Sami (Inari)",
  smj:"Sami (Lule) / Sami (Lule)",
  se:"Sami (Northern) / Sami (Northern)",
  sms:"Sami (Skolt) / Sami (Skolt)",
  sma:"Sami (Southern) / Sami (Southern)",
  'smn-FI':"Sami, Inari (Finland) / Sami (Inari)",
  'smj-NO':"Sami, Lule (Norway) / Sami (Lule)",
  'smj-SE':"Sami, Lule (Sweden) / Sami (Lule)",
  'se-FI':"Sami, Northern (Finland) / Sami (Northern)",
  'se-NO':"Sami, Northern (Norway) / Sami (Northern)",
  'se-SE':"Sami, Northern (Sweden) / Sami (Northern)",
  'sms-FI':"Sami, Skolt (Finland) / Sami (Skolt)",
  'sma-NO':"Sami, Southern (Norway) / Sami (Southern)",
  'sma-SE':"Sami, Southern (Sweden) / Sami (Southern)",
  sa:"Sanskrit / Sanskrit",
  'sa-IN':"Sanskrit (India) / Sanskrit",
  gd:"Scottish Gaelic / Scottish Gaelic",
  'gd-GB':"Scottish Gaelic (United Kingdom) / Scottish Gaelic",
  sr:"Serbian / Serbian (Latin)",
  'sr-Cyrl':"Serbian (Cyrillic) / Serbian (Cyrillic)",
  'sr-Cyrl-BA':"Serbian (Cyrillic, Bosnia and Herzegovina) / Serbian (Cyrillic)",
  'sr-Cyrl-ME':"Serbian (Cyrillic, Montenegro) / Serbian (Cyrillic)",
  'sr-Cyrl-CS':"Serbian (Cyrillic, Serbia and Montenegro (Former)) / Serbian (Cyrillic)",
  'sr-Cyrl-RS':"Serbian (Cyrillic, Serbia) / Serbian (Cyrillic)",
  'sr-Latn':"Serbian (Latin) / Serbian (Latin)",
  'sr-Latn-BA':"Serbian (Latin, Bosnia and Herzegovina) / Serbian (Latin)",
  'sr-Latn-ME':"Serbian (Latin, Montenegro) / Serbian (Latin)",
  'sr-Latn-CS':"Serbian (Latin, Serbia and Montenegro (Former)) / Serbian (Latin)",
  'sr-Latn-RS':"Serbian (Latin, Serbia) / Serbian (Latin)",
  nso:"Sesotho sa Leboa / Sesotho sa Leboa",
  'nso-ZA':"Sesotho sa Leboa (South Africa) / Sesotho sa Leboa",
  tn:"Setswana / Setswana",
  'tn-ZA':"Setswana (South Africa) / Setswana",
  si:"Sinhala / Sinhala",
  'si-LK':"Sinhala (Sri Lanka) / Sinhala",
  sk:"Slovak / Slovak",
  'sk-SK':"Slovak (Slovakia) / Slovak",
  sl:"Slovenian / Slovenian",
  'sl-SI':"Slovenian (Slovenia) / Slovenian",
  es:"Spanish / Spanish",
  'es-AR':"Spanish (Argentina) / Spanish",
  'es-BO':"Spanish (Bolivia) / Spanish",
  'es-CL':"Spanish (Chile) / Spanish",
  'es-CO':"Spanish (Colombia) / Spanish",
  'es-CR':"Spanish (Costa Rica) / Spanish",
  'es-DO':"Spanish (Dominican Republic) / Spanish",
  'es-EC':"Spanish (Ecuador) / Spanish",
  'es-SV':"Spanish (El Salvador) / Spanish",
  'es-GT':"Spanish (Guatemala) / Spanish",
  'es-HN':"Spanish (Honduras) / Spanish",
  'es-MX':"Spanish (Mexico) / Spanish",
  'es-NI':"Spanish (Nicaragua) / Spanish",
  'es-PA':"Spanish (Panama) / Spanish",
  'es-PY':"Spanish (Paraguay) / Spanish",
  'es-PE':"Spanish (Peru) / Spanish",
  'es-PR':"Spanish (Puerto Rico) / Spanish",
  'es-ES':"Spanish (Spain, International Sort) / Spanish",
  'es-US':"Spanish (United States) / Spanish",
  'es-UY':"Spanish (Uruguay) / Spanish",
  'es-VE':"Spanish (Venezuela) / Spanish",
  sv:"Swedish / Swedish",
  'sv-FI':"Swedish (Finland) / Swedish",
  'sv-SE':"Swedish (Sweden) / Swedish",
  syr:"Syriac\xE2\x80\x8E / Syriac",
  'syr-SY':"Syriac (Syria)\xE2\x80\x8E / Syriac",
  tg:"Tajik (Cyrillic) / Tajik (Cyrillic)",
  'tg-Cyrl':"Tajik (Cyrillic) / Tajik (Cyrillic)",
  'tg-Cyrl-TJ':"Tajik (Cyrillic, Tajikistan) / Tajik (Cyrillic)",
  tzm:"Tamazight / Tamazight (Latin)",
  'tzm-Latn':"Tamazight (Latin) / Tamazight (Latin)",
  'tzm-Latn-DZ':"Tamazight (Latin, Algeria) / Tamazight (Latin)",
  ta:"Tamil / Tamil",
  'ta-IN':"Tamil (India) / Tamil",
  tt:"Tatar / Tatar",
  'tt-RU':"Tatar (Russia) / Tatar",
  te:"Telugu / Telugu",
  'te-IN':"Telugu (India) / Telugu",
  th:"Thai / Thai",
  'th-TH':"Thai (Thailand) / Thai",
  bo:"Tibetan / Tibetan",
  'bo-CN':"Tibetan (PRC) / Tibetan",
  tr:"Turkish / Turkish",
  'tr-TR':"Turkish (Turkey) / Turkish",
  tk:"Turkmen / Turkmen",
  'tk-TM':"Turkmen (Turkmenistan) / Turkmen",
  uk:"Ukrainian / Ukrainian",
  'uk-UA':"Ukrainian (Ukraine) / Ukrainian",
  hsb:"Upper Sorbian / Upper Sorbian",
  'hsb-DE':"Upper Sorbian (Germany) / Upper Sorbian",
  ur:"Urdu\xE2\x80\x8E / Urdu",
  'ur-PK':"Urdu (Islamic Republic of Pakistan)\xE2\x80\x8E / Urdu",
  ug:"Uyghur\xE2\x80\x8E / Uyghur",
  'ug-CN':"Uyghur (PRC)\xE2\x80\x8E / Uyghur",
  'uz-Cyrl':"Uzbek (Cyrillic) / Uzbek (Cyrillic)",
  'uz-Cyrl-UZ':"Uzbek (Cyrillic, Uzbekistan) / Uzbek (Cyrillic)",
  uz:"Uzbek (Latin) / Uzbek (Latin)",
  'uz-Latn':"Uzbek (Latin) / Uzbek (Latin)",
  'uz-Latn-UZ':"Uzbek (Latin, Uzbekistan) / Uzbek (Latin)",
  vi:"Vietnamese / Vietnamese",
  'vi-VN':"Vietnamese (Vietnam) / Vietnamese",
  cy:"Welsh / Welsh",
  'cy-GB':"Welsh (United Kingdom) / Welsh",
  wo:"Wolof / Wolof",
  'wo-SN':"Wolof (Senegal) / Wolof",
  sah:"Yakut / Yakut",
  'sah-RU':"Yakut (Russia) / Yakut",
  ii:"Yi / Yi",
  'ii-CN':"Yi (PRC) / Yi",
  yo:"Yoruba / Yoruba",
  'yo-NG':"Yoruba (Nigeria) / Yoruba",
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
    try {
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
        value: dict[key] || " - ",
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
    } catch(e) {alert(e)}
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
              value: "abc123%& \u0353\u2874\u2953\u2231\u7453\u1123\u2123\u0123\uC642",
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
            color: white;
          </>: "",
          childNodes: [
            {
              tagName: "box",
              style: <>
                font-size: 1.2em;
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
              style: "font-size: 1em; color: #777;",
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
      new LocalizeCompleter(session);

      new ColorCompletionDisplayDriver(session);
      new ColorNumberCompletionDisplayDriver(session);
      new FontsizeCompletionDisplayDriver(session);
      new FontCompletionDisplayDriver(session);
      new TextCompletionDisplayDriver(session);
      } catch (e) {alert(e)}
    });
}


