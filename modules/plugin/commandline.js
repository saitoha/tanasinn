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
    this._search_string = search_string;
    this._results = results;
    this._comments = comments;
  },

  get searchString()
    this._search_string,

  get searchResult()
    this._search_result,

  get defaultIndex()
    this._default_index,

  get errorDescription()
    this._error_description,

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
 * @abstruct CommandBase
 */
let CommandBase = new Abstruct().extends(Component);
CommandBase.definition = {

  "[subscribe('@event/session-started'), enabled]":
  function onLoad(session)
  {
    session.notify(<>initialized/{this.id}</>, this);
  },

  "[subscribe('get/commands'), enabled]":
  function onLoad(session)
  {
    return this;
  },
};

//////////////////////////////////////////////////////////////////////////////
//
// Command js
//
/**
 * @class JsCompleter
 */
let JsCompleter = new Class().extends(Component);
JsCompleter.definition = {

  get id()
    "jscompleter",

  _modules: null,

  "[subscribe('@event/session-started'), enabled]":
  function onLoad(session)
  {
    session.notify(<>initialized/{this.id}</>, this);
  },

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
        } catch (e) { 
          listener.doCompletion(null);
          return;
        }
      } else {
        current = settled;
      }
      current = current.toLowerCase();
      let properties = [ key for ([key, ] in Iterator(context)) ];
      if (null !== context && typeof context != "undefined") {
        Array.prototype.push.apply(
          properties, 
          Object.getOwnPropertyNames(context.__proto__)
            .map(function(key) key));
      }
      properties = properties.filter(function(key) {
        if ("." == notation ) {
          if ("number" == typeof key) {
            // Number property after dot notation. 
            // etc. abc.13, abc.3
            return false; 
          }
          if (!/^[$_\w][_\w]*$/.test(key)) {
            // A property consists of identifier-chars after dot notation. 
            // etc. abc.ab[a cde.er=e
            return false; 
          }
        }
        return -1 != String(key).toLowerCase().indexOf(current);
      }).sort(function(lhs, rhs) String(lhs).toLowerCase().indexOf(current) ? 1: -1);
      autocomplete_result = new AutoCompleteResult(
        current, 
        context && notation ? 
          properties.map(function(key) {
            if ("string" == typeof key) {
              if (/^\["?$/.test(notation)) {
                return settled + <>["{key.replace('"', '\\"')}"]</>;
              } else if ("[\'" == notation) {
                return settled + <>['{key.replace("'", "\\'")}']</>;
              }
            }
            return settled + notation + key;
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
  },

  /*
   * Stop all searches that are in progress
   */
  stopSearch: function stopSearch() 
  {
  },

};

/**
 *
 */
let JsCommandParser = new Class().extends(CommandBase);
JsCommandParser.definition = {

  get id()
    "jscommandparser",

  get name()
    "js",

  get description()
    "Run a javascript code in chrome window context.",

  "[subscribe('@initialized/jscompleter'), enabled]":
  function onCompleterInitialized(completer) 
  {
    this._completer = completer
  },

  complete: function parser(source, listener) 
  {
    this._completer.startSearch(source, listener);
  },

  evaluate: function evaluate(arguments_string)
  {
    let session = this._broker;
    try {
      let result = new Function(
        "with (arguments[0]) { return (" + arguments_string + ");}"
      ) (session.window);
    } catch (e) {
      session.notify("command/report-status-message", e);
    }
  },
};

/**
 * @class HistoryCompleter
 */
let HistoryCompleter = new Class().extends(Component);
HistoryCompleter.definition = {

  get id()
    "historycompleter",

  "[subscribe('@event/session-started'), enabled]":
  function onLoad(session)
  {
    let component = Components
      .classes["@mozilla.org/autocomplete/search;1?name=history"]
      .createInstance(Components.interfaces.nsIAutoCompleteSearch);
    this._completion_component = component;
    session.notify(<>initialized/{this.id}</>, this);
  },

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

let SetCommandParser = new Class().extends(CommandBase);
SetCommandParser.definition = {

  get id()
    "setcommandparser",

  get name()
    "set",

  get description()
    "set an option.",

  "[subscribe('@initialized/{variable,js}completer'), enabled]":
  function onCompleterInitialized(variable, js) 
  {
    this._variable_completer = variable;
    this._js_completer = js;
  },

  complete: function parser(source, listener)
  {
    let tokens = source.split(/\s+/);
    if (tokens.length < 2) {
      this._variable_completer.startSearch(source, listener);
    } else if (tokens.length == 2) {
      this._js_completer.startSearch(source, listener);
    }
  },

  evaluate: function evaluate(arguments_string)
  {
    alert("set: " + arguments_string);
  },

};

let GoCommandParser = new Class().extends(CommandBase);
GoCommandParser.definition = {

  get id()
    "gocommandparser",

  get name()
    "go",

  get description()
    "open specified URL in current content window.",

  "[subscribe('@initialized/historycompleter'), enabled]":
  function onCompleterInitialized(completer) 
  {
    this._completer = completer
  },

  complete: function complete(source, listener)
  {
    this._completer.startSearch(source, listener);
  },

  evaluate: function evaluate(arguments_string)
  {
    let session = this._broker;
    let content = session.window._content;
    if (content) {
      content.location.href = arguments_string;
      session.notify("command/focus");
      session.notify("command/blur");
      session.notify("event/lost-focus");
    }
  },
};

/**
 * @class CommandProvider
 *
 */
let CommandProvider = new Class().extends(Component);
CommandProvider.definition = {

  get id()
    "commandprovider",

  "[subscribe('@initialized/commandcompleter'), enabled]":
  function onLoad(completer)
  {
    this._completer = completer;
    let session = this._broker;
    session.notify(<>initialized/{this.id}</>, this);
  },

  register: function register(name, parser)
  {
  },

  getCommand: function(command_name)
  {
    let session = this._broker;
    let commands = session.notify("get/commands");
    let filtered_command = commands.filter(function(command) {
      if (0 == command.name.replace(/[\[\]]/g, "").indexOf(command_name)) {
        return true;
      }
      return false;
    });
    if (filtered_command.length == 0) {
      return null;
    }
    if (filtered_command.length > 1) {
      throw coUtils.Debug.Exception(
        _("Ambiguous command name detected: %s"), command_name);
    }
    let [command] = filtered_command;
    return command;
  },
  
  complete: function complete(source, listener) 
  {
    let pattern = /^\s*(\w+)(\s+)/y;
    let match = pattern.exec(source);
    if (null === match) {
      this._completer.startSearch(source, listener);
    } else {
      let [, command_name, /* blank */] = match;
      let command = this.getCommand(command_name);
      let text = source.substr(pattern.lastIndex);
      command.complete(text, listener);
    }
  },
  
  evaluate: function evaluate(source) 
  {
    try {
    let pattern = /^\s*(\w+)(\s*)/y;
    let match = pattern.exec(source);
    if (null === match) {
      return (null)
    }
    let [, command_name, /* blank */] = match;
    let command = this.getCommand(command_name);
    if (!command) {
      return null; // unknown command;
    }
    let text = source.substr(pattern.lastIndex);
    return command.evaluate(text);
    } catch (e) {
      alert(e)
      return null;
    }
  },
};

/**
 * @class CommandCompletionProvider
 */
let CommandCompletionProvider = new Class().extends(Component);
CommandCompletionProvider.definition = {

  get id()
    "command_completion_provider",

  "[persistable] initial_search_context": "coterminal-commands",

  "[subscribe('@initialized/commandprovider'), enabled]":
  function onLoad(command_provider)
  {
    this._command_provider = command_provider;
    this._search_components = {};
    [
      "history", 
      "places-tag-autocomplete",
      "form-history",
    ].forEach(function(name) {
      let component = Components
        .classes["@mozilla.org/autocomplete/search;1?name=" + name]
        .createInstance(Components.interfaces.nsIAutoCompleteSearch);
      this._search_components[name] = component;
    }, this);
    this.evaluate.enabled = true;
    let session = this._broker;
    session.notify(<>initialized/{this.id}</>, this);
  },

  complete: function complete(source, listener) 
  {
    this._command_provider.complete(source, listener);
  },

  "[subscribe('command/eval-commandline')]":
  function evaluate(source)
  {
    this._command_provider.evaluate(source);
  },

};

/**
 * @class VariableCompleter
 */
let VariableCompleter = new Class().extends(Component);
VariableCompleter.definition = {

  get id()
    "variablecompleter",

  _modules: null,

  "[subscribe('@event/session-started'), enabled]":
  function onLoad(session)
  {
    let modules = session.notify("get/module-instances");
    this._modules = modules;
    session.notify(<>initialized/{this.id}</>, this);
  },

  /*
   * Search for a given string and notify a listener (either synchronously
   * or asynchronously) of the result
   *
   * @param source - The string to search for
   * @param listener - A listener to notify when the search is complete
   */
  startSearch: function startSearch(source, listener)
  {
    let autocomplete_result = null; 
    let pattern = /^(\w+)\.(.*)$/;
    let match = pattern.exec(source);
    if (null === match) {
      let filtered_modules = this._modules
        .filter(function(module) module.id && module.id.match(source.split(/\s+/).pop()))
      autocomplete_result = new AutoCompleteResult(
        source, 
        filtered_modules.map(function(module) module.id),
        filtered_modules.map(function(module) module.description))
    } else {
      let [, id, current] = match;
      let [module] = this._modules.filter(function(module) module.id == id);
      let properties = [key for (key in module) if (!key.match(/^_/))];
      let filtered_properties = properties.filter(function(property) property.match(current));
      autocomplete_result = new AutoCompleteResult(
        source, 
        filtered_properties.map(function(property) id + "." + property),
        filtered_properties.map(function(property) String(module[property])))
    }
    listener.doCompletion(autocomplete_result);
  },

  /*
   * Stop all searches that are in progress
   */
  stopSearch: function stopSearch() 
  {
  },

};


let CommandCompleter = new Class().extends(Component);
CommandCompleter.definition = {

  get id()
    "commandcompleter",

  "[subscribe('@event/session-started'), enabled]":
  function onLoad(session) 
  {
    session.notify(<>initialized/{this.id}</>, this);
  },

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
        return 0 == command.name.replace(/[\[\]]/g, "").indexOf(command_name);
      });
    //  this._broker.notify("command/report-overlay-message", ["not match"].join("/"));

    let autocomplete_result = new AutoCompleteResult(
      source, 
      commands.map(function(command) command.name),
      commands.map(function(command) command.toString()));
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
 * @class Commandline
 */
let Commandline = new Class().extends(Plugin);
Commandline.definition = {

  get id()
    "commandline",

  get info()
    <plugin>
        <name>{_("Commandline Interface")}</name>
        <description>{
          _("Provides commandline interafce.")
        }</description>
        <version>0.1</version>
    </plugin>,

  _result: null,
  "[persistable] completion_delay": 180,

  get rowCount() 
  {
    if (!this._result) {
      return 0;
    }
    return this._result.matchCount;
  },

  get currentIndex()
  {
    return this._index;
  },

  _index: -1,

  select: function select(index)
  {
    if (index < -1)
      index = -1;
    if (index > this.rowCount)
      index = this.rowCount - 1;

    let row;
    if (this._index > -1) {
      row = this._tree.childNodes[this._index];
      if (!row)
        return;
      row.style.background = "";
      row.style.color = "";
    }
    if (index > -1) {
      row = this._tree.childNodes[index];
      row.style.background = "#226";
      row.style.color = "white";
      try {
        let scroll_box = this._tree.parentNode.parentNode;
        let box_object = scroll_box.boxObject
          .QueryInterface(Components.interfaces.nsIScrollBoxObject)
        if (box_object) {
          let scrollY = {};
          box_object.getPosition({}, scrollY);
          let first_position = row.boxObject.y - this._tree.boxObject.y;
          let last_position = first_position - scroll_box.boxObject.height + row.boxObject.height;
          if (first_position < scrollY.value) {
            box_object.scrollTo(0, first_position);
          } else if (last_position > scrollY.value) {
            box_object.scrollTo(0, last_position);
          }
        }
      } catch (e) { 
       alert(e)
      }
    }
    this._index = index;

  },

  /** post constructor. */
  "[subscribe('@initialized/command_completion_provider'), enabled]":
  function onLoad(provider) 
  {
    this._completion_provider = provider
    this.enabled = this.enabled_when_startup;
    let session = this._broker;
    session.notify(<>initialized/{this.id}</>, this);
  },

  /** Installs itself. 
   *  @param {Session} session A Session object.
   */
  "[subscribe('install/ + this.id')]":
  function install(session) 
  {
    let {
      coterminal_commandline_box, 
      coterminal_commandline_completion, 
      coterminal_commandline, 
      coterminal_statusbar,
      coterminal_completion_popup, 
      coterminal_completion_scroll, 
      coterminal_completion_tree
    } = session.uniget(
      "command/construct-chrome", 
      {
        parentNode: "#coterminal_chrome",
        tagName: "stack",
        style: {
          padding: "2px 8px 3px 8px", 
          background: "lightgray",
          borderBottomLeftRadius: "8px",
          borderBottomRightRadius: "8px",
        },
        id: "coterminal_commandline_box",
        childNodes: [
          {
            id: "coterminal_commandline_completion",
            value: "",
            tagName: "textbox",
            className: "plain",
            style: {
              color: "red",
            },
          },
          {
            tagName: "textbox",
            id: "coterminal_commandline",
            className: "plain",
            //placeholder: "input commands here.",
            newlines: "replacewithspaces",
          },
          {
            tagName: "textbox",
            className: "plain",
            readonly: "true",
            id: "coterminal_statusbar",
            hidden: true,
          },
          {
            tagName: "panel",
            //style: { MozAppearance: "none", },
            style: { MozUserFocus: "ignore", /*font: "menu",*/ },
            noautofocus: true,
            height: 200,
            id: "coterminal_completion_popup",
            childNodes: {
              tagName: "scrollbox",
              id: "coterminal_completion_scroll",
              orient: "vertical", // box-packing
              flex: 1,
              style: { overflowY: "auto", },
              childNodes: {
                tagName: "grid",
                childNodes: {
                  tagName: "rows",
                  id: "coterminal_completion_tree",
                }
              }
            }, // tree
          },  // panel
        ] 
      });
    this._element = coterminal_commandline_box;
    this._completion = coterminal_commandline_completion;
    this._textbox = coterminal_commandline;
    this._popup = coterminal_completion_popup;
    this._scroll = coterminal_completion_scroll;
    this._tree = coterminal_completion_tree;
    this._statusbar = coterminal_statusbar;
    this.show.enabled = true;
    this.onStatusMessage.enabled = true;
    this.onfocus.enabled = true;
    this.onblur.enabled = true;
    this.oninput.enabled = true;
    this.onkeydown.enabled = true;
    this.onkeypress.enabled = true;
    this.onpopupshowing.enabled = true;
    this.onpopupshown.enabled = true;
    this.onclick.enabled = true;
    this.onchange.enabled = true;
    this.onselect.enabled = true;
    this.onCommandIntroducer.enabled = true;
  },
  
  /** Uninstalls itself.
   *  @param {Session} session A Session object.
   */
  "[subscribe('uninstall/ + this.id')]":
  function uninstall(session) 
  {
    this.show.enabled = false;
    this.onStatusMessage.enabled = false;
    this.onfocus.enabled = false;
    this.onblur.enabled = false;
    this.oninput.enabled = false;
    this.onkeydown.enabled = false;
    this.onkeypress.enabled = false;
    this.onpopupshowing.enabled = false;
    this.onpopupshown.enabled = false;
    this.onclick.enabled = false;
    this.onchange.enabled = false;
    this.onselect.enabled = false;
    this.onCommandIntroducer.enabled = false;
    this._element.parentNode.removeChild(this._element);
  },

  "[subscribe('command/report-status-message')]":
  function onStatusMessage(message) 
  {
    this._statusbar.hidden = false;
    this._textbox.hidden = true;
    this._completion.hidden = true;
    this._statusbar.value = message;
  },

  "[subscribe('introducer-pressed/double-ctrl')]":
  function onCommandIntroducer() 
  {
    this._statusbar.hidden = true;
    this._textbox.hidden = false;
    this._completion.hidden = false;
    this._textbox.focus();
    this._textbox.focus();
  },

  /** Shows commandline interface. 
   *  @param {Object} A shortcut information object.
   */
  "[key('meta + :', 'ctrl + shift + *'), _('Show commandline interface.')]":
  function show(info)
  {
    this._statusbar.hidden = true;
    this._textbox.hidden = false;
    this._completion.hidden = false;
    this._textbox.focus();
    this._textbox.focus();
  },

  "[listen('focus', '#coterminal_commandline', true)]":
  function onfocus(event) 
  {
    let session = this._broker;
    this._statusbar.hidden = true;
    this._textbox.hidden = false;
    this._completion.hidden = false;
    this._popup.width = this._textbox.boxObject.width;
    this.setCompletionTrigger();
  },

  "[listen('blur', '#coterminal_commandline', true)]":
  function onblur(event) 
  {
    this._popup.hidePopup();
    let session = this._broker;
    session.notify("command/focus");
  },

  doCompletion: function doCompletion(result) 
  {
    this._result = result;
    delete this._timer;
    let rows = this._tree;
    while (rows.firstChild) {
      rows.removeChild(rows.firstChild);
    }
    if (result) {
      let document = rows.ownerDocument;
      for (let i = 0; i < result.matchCount; ++i) {
        let row = rows.appendChild(document.createElement("row"))
        if (i == this.currentIndex) {
          row.style.background = "#226";
          row.style.color = "white";
        } else {
          row.style.background = "";
          row.style.color = "";
        }

        let search_string = result.searchString.toLowerCase();
        let completion_text = result.getValueAt(i);
        this._broker.notify("command/report-overlay-message", [search_string, completion_text].join("/"));
        if (completion_text) {
          //completion_text = completion_text.substr(this._search_text.length - search_string.length);
          let match_position = completion_text.toLowerCase().indexOf(search_string);
          if (-1 != match_position) {
            let box = row.appendChild(document.createElement("hbox"));
            box.style.margin = "0px";
            box.appendChild(document.createTextNode(completion_text.substr(0, match_position)));
            label = box.appendChild(document.createElement("label"));
            label.setAttribute("value", completion_text.substr(match_position, search_string.length));
            label.style.cssText = "margin: 0px; font-weight: bold; color: #f00; text-decoration: underline;";
            box.appendChild(document.createTextNode(completion_text.substr(match_position + search_string.length)));
            let comment = row.appendChild(document.createElement("label"));
            comment.setAttribute("value", result.getCommentAt(i));
            comment.setAttribute("crop", "end");
          }
        }
      }
      this.invalidate(result);
    }
  },

  invalidate: function invalidate(result) 
  {

  if (this._textbox.boxObject.scrollLeft > 0) {
      this._completion.inputField.value = "";
    } else if (result.matchCount > 0) {
      if ("closed" == this._popup.state || "hiding" == this._popup.state) {
        let session = this._broker;
        let focused_element = session.document.commandDispatcher.focusedElement;
        if (focused_element.isEqualNode(this._textbox.inputField)) {
          this._popup.openPopup(this._textbox, "after_start", 0, 0, true, true);
        }
      }
      let index = Math.max(0, this.currentIndex);
      let completion_text = this._result.getValueAt(index);
      if (0 == completion_text.indexOf(this._search_text)) {
        this._completion.inputField.value = this._settled_text + completion_text;
      } else {
        this._completion.inputField.value = "";
      }
    } else {
      this._completion.inputField.value = "";
      this._popup.hidePopup();
    }
  },

  fill: function fill()
  {
    let index = Math.max(0, this.currentIndex);
    if (this._result) {
      let completion_text = this._result.getValueAt(index);
      this._textbox.inputField.value = this._settled_text + completion_text;
      this._completion.inputField.value = "";
    }
  },

  setCompletionTrigger: function setCompletionTrigger() 
  {
    if (this._timer) {
      this._timer.cancel();
      delete this._timer;
    }
    this._timer = coUtils.Timer.setTimeout(function() {
      delete this._timer;
      let current_text = this._textbox.value;
      // if current text does not match completion text, hide it immediatly.
      if (0 != this._completion.value.indexOf(current_text)) {
        this._completion.inputField.value = "";
      }
      let point = current_text.indexOf(" ") + 1;
      this._settled_text = current_text.substr(0, point);
      this._search_text = current_text.substr(point);
      this.select(-1);
      this._completion_provider.complete(current_text, this);
    }, this.completion_delay, this);
  },

  "[listen('input', '#coterminal_commandline', true)]":
  function oninput(event) 
  {
    this.setCompletionTrigger();
  },

  down: function down()
  {
    let index = Math.min(this.currentIndex + 1, this.rowCount - 1);
    try {
    if (index >= 0) {
      this.select(index);
    }
    //this.invalidate();
    this.fill();
    } catch (e) {
      alert(e + e.lineNumber);
    }
  },

  up: function up()
  {
    let index = Math.max(this.currentIndex - 1, -1);
    if (index >= 0) {
      this.select(index);
    }
    //this.invalidate();
    this.fill();
  },

  enter: function enter()
  {
    this.onselect();
    this._textbox.blur();
    let session = this._broker;
    session.notify("command/focus");
  },

  "[listen('keydown', '#coterminal_commandline', true)]":
  function onkeydown(event) 
  { // nothrow
    if (17 == event.keyCode &&
        17 == event.which &&
        event.ctrlKey &&
        !event.altKey &&
        !event.shiftKey &&
        !event.isChar
        ) {
      let now = parseInt(new Date().getTime());
      if (now - this._last_ctrlkey_time < 500) {
        let session = this._broker;
        session.notify("command/focus")
        this._last_ctrlkey_time = 0;
      } else {
        this._last_ctrlkey_time = now;
      }
    }
  },

  "[listen('keypress', '#coterminal_commandline', true)]":
  function onkeypress(event) 
  {
    let code = event.keyCode || event.which;

    if (event.ctrlKey) { // ^
      event.stopPropagation();
      event.preventDefault();
    }
    if ("p".charCodeAt(0) == code && event.ctrlKey) { // ^p
      this.up();
    }
    if ("n".charCodeAt(0) == code && event.ctrlKey) { // ^n
      this.down();
    }
    if ("j".charCodeAt(0) == code && event.ctrlKey) { // ^j
      this.enter()
    }
    if ("h".charCodeAt(0) == code && event.ctrlKey) { // ^h
      let value = this._textbox.value;
      let position = this._textbox.selectionEnd;
      if (position > 0) {
        this._textbox.inputField.value 
          = value.substr(0, position - 1) + value.substr(position);
      }
    }
    if ("w".charCodeAt(0) == code && event.ctrlKey) { // ^w
      let value = this._textbox.value;
      let position = this._textbox.selectionEnd;
      this._textbox.inputField.value
        = value.substr(0, position).replace(/\w+$|\W+$/, "") 
        + value.substr(position);
    }
    if ("f".charCodeAt(0) == code && event.ctrlKey) { // ^h
      this._textbox.selectionStart += 1;
    }
    if ("b".charCodeAt(0) == code && event.ctrlKey) { // ^h
      this._textbox.selectionEnd -= 1;
    }
    if (0x09 == code) { // tab
      event.stopPropagation();
      event.preventDefault();
    }
    if (0x09 == code && event.shiftKey) // shift + tab
      code = 0x26;
    if (0x09 == code && !event.shiftKey) // tab
      code = 0x28;
    if (0x26 == code && !event.isChar) { // up 
      this.up();
    } else if (0x28 == code && !event.isChar) { // down
      this.down();
    } else if (0x0d == code && !event.isChar) {
      this.enter();
    } 
    //this._completion.inputField.value = "";
  },

  "[listen('select', '#coterminal_commandline', true)]":
  function onselect(event) 
  {
    let session = this._broker;
    session.notify("command/eval-commandline", this._textbox.value);
  },

  "[listen('popupshown', '#coterminal_commandline', false)]":
  function onpopupshown(event) 
  {
    this._textbox.focus();
    this._textbox.focus();
  },

  "[listen('popupshowing', '#coterminal_commandline', true)]":
  function onpopupshowing(event) 
  {
  },

  "[listen('click', '#coterminal_commandline', true)]":
  function onclick(event) 
  {
    this.onfocus();
  },

  "[listen('change', '#coterminal_commandline', true)]":
  function onchange(event) 
  {
  },

};

/**
 * @class CommandlineScanner
 */
let CommandlineScanner = new Class();
CommandlineScanner.definition = {

  first: 0,
  last: 0,
  _text: null,

  initialize: function initialize(source) 
  {
    this._text = source;
    this._regexp = /\S+/y;
  },
  
  scan: function scan()
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
      try {
      new CommandProvider(session);
      new GoCommandParser(session);
      new SetCommandParser(session);
      new CommandCompleter(session);
      new VariableCompleter(session);
      new HistoryCompleter(session);
      new CommandCompletionProvider(session);
      new Commandline(session);
      new JsCommandParser(session);
      new JsCompleter(session);
      } catch (e) {
        alert(e)
      }
    });
}


