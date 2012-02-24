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

  "[subscribe('@event/broker-started'), enabled]":
  function onLoad(session)
  {
    session.subscribe(
      <>get/completer/{this.type}</>, 
      let (self = this) function() self);
  },

};


function generateFileEntries(path) 
{
  let directory = Components
    .classes["@mozilla.org/file/local;1"]
    .createInstance(Components.interfaces.nsILocalFile);
  try {
    directory.initWithPath(path);
    if (directory.exists() && directory.isDirectory()) {
      let entries = directory.directoryEntries;
      while (entries.hasMoreElements()) {
        let file = entries.getNext();
        yield file.QueryInterface(Components.interfaces.nsIFile);
      }
    }
  } catch (e) {
    coUtils.Debug.reportError(e);
  }
}

/**
 * @class CommandCompleter
 *
 */
let CommandCompleter = new Class().extends(Component);
CommandCompleter.definition = {

  get id()
    "command_completer",

  /*
   * Search for a given string and notify the result.
   *
   * @param source - The string to search for
   */
  "[subscribe('command/query-completion/command'), enabled]":
  function startSearch(context)
  {
    let { source, option } = context;
    let session = this._broker;
    let command_name = source.split(/\s+/).pop();
    let commands = session.notify("get/commands")
      .filter(function(command) {
        return 0 == command.name.replace(/[\[\]]+/g, "")
          .indexOf(command_name);
      }).sort(function(lhs, rhs) lhs.name.localeCompare(rhs.name));
    if (0 == commands.length) {
      session.notify("event/answer-completion", null);
    } else {
      session.notify("event/answer-completion", {
        type: "text",
        query: source, 
        labels: commands.map(function(command) command.name.replace(/[\[\]]+/g, "")),
        comments: commands.map(function(command) command.description),
        data: commands.map(function(command) ({
          name: command.name.replace(/[\[\]]+/g, ""),
          value: command.description,
        })),
      });
    }
  },

};

/**
 * @class CGICompleter
 *
 */
let CGICompleter = new Class().extends(CompleterBase);
CGICompleter.definition = {

  get id()
    "cgi_completer",

  get type()
    "cgi",

  /*
   * Search for a given string and notify a listener (either synchronously
   * or asynchronously) of the result
   *
   * @param source - The string to search for
   * @param listener - A listener to notify when the search is complete
   */
  "[subscribe('command/query-completion/batch'), enabled]":
  function startSearch(source, listener, option)
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

    let broker = this._broker;
    if ("global" == option) {
      broker = broker._broker;
    }

    let directory = coUtils.File.getFileLeafFromVirtualPath(broker.cgi_directory);
    let entries = generateFileEntries(directory.path);

    let lower_name = name.toLowerCase();
    let candidates = [
      {
        key: file.leafName.replace(/\.js$/, ""), 
        value: file.path,
      } for (file in entries) 
        if (file.isExecutable() && -1 != file.leafName.toLowerCase().indexOf(lower_name))
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

};


/**
 * @class BatchCompleter
 *
 */
let BatchCompleter = new Class().extends(CompleterBase);
BatchCompleter.definition = {

  get id()
    "batch_completer",

  get type()
    "batch",

  /*
   * Search for a given string and notify a listener (either synchronously
   * or asynchronously) of the result
   *
   * @param source - The string to search for
   * @param listener - A listener to notify when the search is complete
   */
  "[subscribe('command/query-completion/batch'), enabled]":
  function startSearch(source, listener, option)
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

    let broker = this._broker;
    if ("global" == option) {
      broker = broker._broker;
    }

    let directory = coUtils.File.getFileLeafFromVirtualPath(broker.batch_directory);
    let entries = generateFileEntries(directory.path);

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
  "[subscribe('command/query-completion/profile'), enabled]":
  function startSearch(source, listener, option)
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

    let broker = this._broker;
    if ("global" == option) {
      broker = broker._broker;
    }

    let entries = coUtils.File.getFileEntriesFromSerchPath([broker.profile_directory]);

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
  "[subscribe('command/query-completion/js'), enabled]":
  function startSearch(source, listener)
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
  "[subscribe('command/query-completion/history'), enabled]":
  function startSearch(source, listener)
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
  "[subscribe('command/query-completion/charset'), enabled]":
  function startSearch(source, listener, option)
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

};

/**
 * @class NMapCompleter
 *
 */
let NMapCompleter = new Class().extends(CompleterBase);
NMapCompleter.definition = {

  get id()
    "nmap-completer",

  get type()
    "nmap",

  /*
   * Search for a given string and notify a listener (either synchronously
   * or asynchronously) of the result
   *
   * @param source - The string to search for
   * @param listener - A listener to notify when the search is complete
   */
  "[subscribe('command/query-completion/nmap'), enabled]":
  function startSearch(source, listener)
  {
    let match = source.match(/^\s*(\S*)(\s*)/);
    if (null === match) {
      listener.doCompletion(null);
      return -1;
    }
    let [all, name, next] = match;
    if (next) {
      return all.length;
    }

    let broker = this._broker;
    let expressions = broker.uniget("get/registered-nmap");
    let lower_name = name.toLowerCase();
    let candidates = Object.getOwnPropertyNames(expressions)
      .filter(function(expression) {
        return -1 != expression.toLowerCase().indexOf(lower_name); 
      })
      .map(function(key) {
        return { 
          key: key, 
          value: expressions[key],
        };
      });
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

};


/**
 * @class CMapCompleter
 *
 */
let CMapCompleter = new Class().extends(CompleterBase);
CMapCompleter.definition = {

  get id()
    "cmap-completer",

  get type()
    "cmap",

  /*
   * Search for a given string and notify a listener (either synchronously
   * or asynchronously) of the result
   *
   * @param source - The string to search for
   * @param listener - A listener to notify when the search is complete
   */
  "[subscribe('command/query-completion/cmap'), enabled]":
  function startSearch(source, listener)
  {
    let match = source.match(/^\s*(\S*)(\s*)/);
    if (null === match) {
      listener.doCompletion(null);
      return -1;
    }
    let [all, name, next] = match;
    if (next) {
      return all.length;
    }

    let broker = this._broker;
    let expressions = broker.uniget("get/registered-cmap");
    let lower_name = name.toLowerCase();
    let candidates = Object.getOwnPropertyNames(expressions)
      .filter(function(expression) {
        return -1 != expression.toLowerCase().indexOf(lower_name); 
      })
      .map(function(key) {
        return { 
          key: key,
          value: expressions[key],
        };
      });
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

};


/**
 * @class ComponentsCompleter
 */
let ComponentsCompleter = new Class().extends(CompleterBase);
ComponentsCompleter.definition = {

  get id()
    "components-completer",

  get type()
    "components",

  /*
   * Search for a given string and notify a listener (either synchronously
   * or asynchronously) of the result
   *
   * @param source - The string to search for
   * @param listener - A listener to notify when the search is complete
   */
  "[subscribe('command/query-completion/components'), enabled]":
  function startSearch(source, listener, option)
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
    let modules = session.notify("get/components");
    let candidates = [
      {
        key: module.id, 
        value: module.info ? "[" + module.info..name + "] " + module.info..description: module.toString()
      } for ([, module] in Iterator(modules)) 
        if (module.id && module.id.match(source))
    ];
    //alert(modules.filter(function(module) module.id.match()))
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
  "[subscribe('command/query-completion/plugin'), enabled]":
  function startSearch(source, listener, option)
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
    let modules = session.notify("get/components");
    let candidates = [
      {
        key: module.id, 
        value: module
      } for ([, module] in Iterator(modules)) 
        if (module.id && module.id.match(source) 
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
  "[subscribe('command/query-completion/option'), enabled]":
  function startSearch(source, listener, option)
  {
    let match = source.match(/^(\s*)([$_\-@a-zA-Z\.]*)\s*(=?)\s*(.*)/);
    if (null === match) {
      listener.doCompletion(null);
      return -1;
    }
    let [, space, name, equal, next] = match;
    if (!equal && next) {
      listener.doCompletion(null);
      return -1;
    }
    
    let session = this._broker;
    let broker = "global" ==  option ? session._broker: session;
    let context = {};
    let lower_name = name.toLowerCase();
    broker.notify("command/get-persistable-data", context);
    if (!equal) {
      let options = [
        {
          key: key, 
          value: value
        } for ([key, value] in Iterator(context)) 
          if (-1 != key.toLowerCase().indexOf(lower_name))
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
        return js_completer.startSearch(next, listener);
      }
    }
    listener.doCompletion(null);
    return -1;
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
  "[subscribe('command/query-completion/fontsize'), enabled]":
  function startSearch(source, listener)
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
  "[subscribe('command/query-completion/font-family'), enabled]":
  function startSearch(source, listener)
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
  "[subscribe('command/query-completion/color-number'), enabled]":
  function startSearch(source, listener, option)
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
      } for ([key, value] in Iterator(coUtils.Constant.WEB140_COLOR_MAP))
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
  "[subscribe('command/query-completion/localize'), enabled]":
  function startSearch(source, listener, option)
  {
    let session = this._broker;
    let pattern = /^\s*([a-zA-Z-]*)(\s*)("?)((?:[^"])*)("?)(\s*)(.*)/;
    let match = source.match(pattern);
    let [all, language, space, quote_start, message_id, quote_end, space2, next] = match;
    if (!space) {
      let languages = [key for ([key, ] in Iterator(coUtils.Constant.LOCALE_ID_MAP))]
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
        comments: languages.map(function(language) coUtils.Constant.LOCALE_ID_MAP[language]),
        data: languages.map(function(language) ({
          name: language, 
          value: coUtils.Constant.LOCALE_ID_MAP[language],
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

};


/**
 * @class FileCompleter
 *
 */
let FileCompleter = new Class().extends(CompleterBase);
FileCompleter.definition = {

  get id()
    "file-completer",

  get type()
    "file",

  /*
   * Search for a given string and notify a listener (either synchronously
   * or asynchronously) of the result
   *
   * @param source - The string to search for
   * @param listener - A listener to notify when the search is complete
   */
  "[subscribe('command/query-completion/file'), enabled]":
  function startSearch(source, listener, option)
  {
    let session = this._broker;
    let pattern = /^\s*(?:(.*\/))?(.*)?/;
    let match = source.match(pattern);
    let [all, stem, leaf] = match;
    let candidates;
    let home = coUtils.File.getFileLeafFromVirtualPath("$Home");
    leaf = leaf || "";
    let lower_leaf = leaf.toLowerCase();
    let stem_length = 0;
    if (stem) {
      if (!coUtils.File.isAbsolutePath(stem)) {
        if ("WINNT" == coUtils.Runtime.os) {
          let cygwin_root = session.uniget("get/cygwin-root");
          stem = cygwin_root + coUtils.File.getPathDelimiter() + stem;
        } else {
          stem = home.path + coUtils.File.getPathDelimiter() + stem;
        }
      }
      stem_length = stem.length;
      candidates = [file for (file in generateFileEntries(stem))];
    } else {
      candidates = [file for (file in generateFileEntries(home.path))];
      stem_length = home.path.length + 1;
    }
    candidates = candidates
      .map(function(file) file.path.substr(stem_length))
      .filter(function(path) path.toLowerCase().match(lower_leaf))
    if (0 == candidates.length) {
      listener.doCompletion(autocomplete_result);
      return -1;
    }
    let autocomplete_result = {
      type: "text",
      query: leaf, 
      labels: candidates, 
      comments: candidates,
      data: candidates.map(function(path) ({
        name: path, 
        value: path,
      })),
    };
    listener.doCompletion(autocomplete_result);
    return 0;
  },

};

/**
 * @fn main
 * @brief Module entry point.
 * @param {Broker} broker The Broker object.
 */
function main(broker)
{
  new JsCompleter(broker);
  new HistoryCompleter(broker);
  new OptionCompleter(broker);
  new CommandCompleter(broker);
  new CGICompleter(broker);
  new BatchCompleter(broker);
  new ProfileCompleter(broker);
  new FontsizeCompleter(broker);
  new FontFamilyCompleter(broker);
  new ColorNumberCompleter(broker);
  new LocalizeCompleter(broker);
  new ComponentsCompleter(broker);
  new PluginsCompleter(broker);
  new CharsetCompleter(broker);
  new NMapCompleter(broker);
  new CMapCompleter(broker);
  new FileCompleter(broker);
}


