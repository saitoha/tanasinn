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
 * The Original Code is coTerminal
 *
 * The Initial Developer of the Original Code is
 * Hayaki Saito.
 * Portions created by the Initial Developer are Copyright (C) 2010 - 2011
 * the Initial Developer. All Rights Reserved.
 *
 * ***** END LICENSE BLOCK ***** */

let AutoCompleteResult = new Class();
AutoCompleteResult.definition = {

  get wrappedJSObject()
    this,

  initialize: function initialize(search_string, results, comments) 
  {
    this.searchString = search_string;
    this._results = results;
    this._comments = comments;
  },

  get matchCount()
    this._results.length,

  getValueAt: function getValueAt(index) 
  {
    if (index >= 0 && index < this._results.length)
      return this._results[index];
    return "";
  },

  getCommentAt: function getCommentAt(index)
  {
    if (this._comments && index < this._results.length)
      return this._comments[index]
    return "";
  },

  getStyleAt: function getStyleAt(index)
  {
    if (!this._comments || !this._comments[index])
      return null;
    if (index == 0)
      return "suggestfirst";
    return "suggesthint";
  },

  getImageAt: function getImageAt(index)
  {
    return "";
  },

  removeValueAt: function removeValueAt(index, removeFromDb)
  {
    this._results.splice(index, 1);
    if (this._comments) {
      this._comments.splice(index, 1);
    }
  },

  getLabelAt: function getLabelAt(index)
  {
    return this._results[index];
  },

  QueryInterface: function QueryInterface(a_IID)
  {
    if (!a_IID.equals(Components.interfaces.nsISupports)
     && !a_IID.equals(Components.interfaces.nsIAutoCompleteResult))
      throw Components.results.NS_ERROR_NOT_IMPLEMENTED;
    return this;
  },
};

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
    session.notify(<>initialized/{this.id}</>, this);
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
      autocomplete_result = new AutoCompleteResult(
        current, 
        context && notation ? 
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
        context && 
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
          }));
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
      let autocomplete_result = new AutoCompleteResult(
        source, 
        options.map(function(option) option.key),
        options.map(function(option) String(option.value)));
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

    let autocomplete_result = new AutoCompleteResult(
      source, 
      commands.map(function(command) command.name.replace(/[\[\]]+/g, "")),
      commands.map(function(command) command.description));
    listener.doCompletion(autocomplete_result);
  },

  /*
   * Stop all searches that are in progress
   */
  stopSearch: function stopSearch() 
  {
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
    });
}


