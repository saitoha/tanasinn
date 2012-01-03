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

  initialize: function initialize(
    search_string, search_result, default_index, 
    error_description, results, comments) 
  {
    this._search_string = search_string;
    this._search_result = search_result;
    this._default_index = default_index;
    this._error_description = error_description;
    this._results = results;
    this._comments = comments;
  },

  get searchString()
  {
    return this._search_string;
  },

  get searchResult()
  {
    return this._search_result;
  },

  get defaultIndex()
  {
    return this._default_index;
  },

  get errorDescription()
  {
    return this._error_description;
  },

  get matchCount()
  {
    return this._results.length;
  },

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
 * @abstruct CommandParserBase
 */
let CommandParserBase = new Abstruct().extends(Component);
CommandParserBase.definition = {

  "[subscribe('@initialized/commandsparser'), enabled]":
  function onLoad(commands_parser)
  {
    let session = this._broker;
    let pattern = /^(\w+)\[(\w+)\]$/;
    let match = this.name.match(pattern);
    if (!match) {
      throw coUtils.Debug.Exception(
        _("Ill-formed command name is detected, '%s'."), this.name);
    }
    let [, abbrev, extent] = match;
    commands_parser.register(abbrev, this);
    extent.split('').forEach(function(c, index) 
    {
      commands_parser.register(abbrev += c, this);
    }, this);
    session.notify("command/register-command", abbrev);
    session.notify(<>initialized/{this.id}</>, this);
  },

};

let JsCommandParser = new Class().extends(CommandParserBase);
JsCommandParser.definition = {

  get id()
    "jscommandparser",

  get name()
    "j[s]",

  complete: function parser(source) 
  {
    return "coterminal-javascript";
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

let SetCommandParser = new Class().extends(CommandParserBase);
SetCommandParser.definition = {

  get id()
    "setcommandparser",

  get name()
    "se[t]",

  complete: function parser(source)
  {
    let tokens = source.split(/\s+/);
    if (tokens.length < 2) {
      return "coterminal-variable";
    } else if (tokens.length == 2) {
      return "coterminal-expression";
    } else {
      return null;
    }
  },

  evaluate: function evaluate(arguments_string)
  {
    alert("set: " + arguments_string);
  },

};

let GoCommandParser = new Class().extends(CommandParserBase);
GoCommandParser.definition = {

  get id()
    "gocommandparser",

  get name()
    "g[o]",

  complete: function command(source)
  {
    return "history";
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
 * @class CommandsParser
 *
 */
let CommandsParser = new Class().extends(Component);
CommandsParser.definition = {

  get id()
    "commandsparser",

  _completion: null,

  "[subscribe('@event/session-started'), enabled]":
  function onLoad(session)
  {
    this._completion = {};
    session.notify("initialized/" + this.id, this);
  },

  register: function register(name, parser)
  {
    this._completion[name] = parser;
  },
  
  complete: function complete(source) 
  {
    let pattern = /^\s*(\w+)(\s+)/y;
    let match = pattern.exec(source);
    if (null === match) {
      return "coterminal-commands";
    }
    let [, command_name, /* blank */] = match;
    let next_parser = this._completion[command_name];
    if (!next_parser) {
      return null; // unknown command;
    }
    let text = source.substr(pattern.lastIndex);
    return next_parser.complete(text);
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
    let command = this._completion[command_name];
    if (!command) {
      return (null); // unknown command;
    }
    let text = source.substr(pattern.lastIndex);
    return command.evaluate(text);
    } catch (e) {alert(e)}
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

  "[subscribe('@initialized/commandsparser'), enabled]":
  function onLoad(commands_parser)
  {
    this._commands_parser = commands_parser;
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
    this._context_name = this.initial_search_context;
    this.evaluate.enabled = true;
    let session = this._broker;
    session.notify(<>initialized/{this.id}</>, this);
  },

  register: function register(name, context)
  {
    this._search_components[name] = context;
  },

  get context() 
  {
    return this._search_components[this._context_name];
  },

  complete: function complete(source) 
  {
    this._context_name = this._commands_parser.complete(source);
  },

  "[subscribe('command/eval-commandline')]":
  function evaluate(source)
  {
    this._commands_parser.evaluate(source);
  },

};

/**
 * @class JsCompleter
 */
let JsCompleter = new Class().extends(Component);
JsCompleter.definition = {

  get id()
    "jscompleter",

  _modules: null,

  "[subscribe('@initialized/command_completion_provider'), enabled]":
  function onLoad(provider)
  {
    let session = this._broker;
    this._window = session.window;
    provider.register("coterminal-javascript", this);
  },

  /*
   * Search for a given string and notify a listener (either synchronously
   * or asynchronously) of the result
   *
   * @param search_string - The string to search for
   * @param search_param - An extra parameter
   * @param previous_result - A previous result to use for faster searching
   * @param listener - A listener to notify when the search is complete
   */
  startSearch: 
  function startSearch(search_string, search_param, previous_result, listener)
  {
    try{
    let settled_position = search_param;
    let autocomplete_result = null; 
    let pattern = /(.*?)(?:(\.|\[['"]?)(\w*))?$/;
    let match = pattern.exec(search_string);
    if (match) {
      let [, settled, notation, current] = match;
      let context = this._window;
      if (notation) {
        try {
          context = new Function(
            "with (arguments[0]) { return (" + settled + ");}"
          ) (context);
        } catch (e) { 
          context = {};
        }
      } else {
        current = settled;
      }
      current = current.toLowerCase();
      let properties;
      properties = [
        {
          key: key, 
          is_number: /^[0-9]+$/.test(key),
          is_identifier: /^[$_\w][_\w]*$/.test(key),
        } for (key in context)
      ].filter(function(property) {
        if ("." == notation 
            && property.is_number 
            && !property.is_identifier) {
          // Number of no-identifier property after dot notation. 
          // etc. abc.13, (a.b).ab[a 
          return false; 
        }
        return -1 != property.key.toLowerCase().indexOf(current);
      });
      autocomplete_result = new AutoCompleteResult(
        current, 
        Components.interfaces.nsIAutoCompleteResult.RESULT_SUCCESS, // search result
        0, // default index
        "", // erro description
        context && notation ? 
          properties.map(function(property) {
            if (/^\["?$/.test(notation) && !notation.is_number) {
              return settled + <>["{property.key.replace('"', '\\"')}"]</>;
            } else if ("[\'" == notation && !notation.is_number) {
              return settled + <>['{property.key.replace("'", "\\'")}']</>;
            }
            return settled + notation + property.key;
          }):
          properties.map(function(property) property.key),
        context ?
          properties.map(function(property) {
            try {
              let value = context[property.key];
              let type = typeof value;
              if ("function" == type) {
                return "[Function]";
              } else if ("object" == type) {
                return "[Object]";
              }
              return String(value);
            } catch (e) {
              return "Error: " + e;
            }
          }):
          null);
    }
    listener.onSearchResult(this, autocomplete_result);
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
 * @class VariableCompleter
 */
let VariableCompleter = new Class().extends(Component);
VariableCompleter.definition = {

  get id()
    "variablecompleter",

  _modules: null,

  "[subscribe('@initialized/command_completion_provider'), enabled]":
  function onLoad(provider)
  {
    let session = this._broker;
    let modules = session.notify("get/module-instances");
    this._modules = modules;
    provider.register("coterminal-variable", this);
  },

  /*
   * Search for a given string and notify a listener (either synchronously
   * or asynchronously) of the result
   *
   * @param search_string - The string to search for
   * @param search_param - An extra parameter
   * @param previous_result - A previous result to use for faster searching
   * @param listener - A listener to notify when the search is complete
   */
  startSearch: 
  function startSearch(search_string, search_param, previous_result, listener)
  {
    let autocomplete_result = null; 
    let pattern = /^(\w+)\.(.*)$/;
    let match = pattern.exec(search_string);
    if (null === match) {
      let filtered_modules = this._modules
        .filter(function(module) module.id && module.id.match(search_string.split(/\s+/).pop()))
      autocomplete_result = new AutoCompleteResult(
        search_string, 
        Components.interfaces.nsIAutoCompleteResult.RESULT_SUCCESS, // search result
        0, // default index
        "", // erro description
        filtered_modules.map(function(module) module.id),
        filtered_modules.map(function(module) module.toString()))
    } else {
      let [, id, current] = match;
      let [module] = this._modules.filter(function(module) module.id == id);
      let properties = [key for (key in module) if (!key.match(/^_/))];
      let filtered_properties = properties.filter(function(property) property.match(current));
      autocomplete_result = new AutoCompleteResult(
        search_string, 
        Components.interfaces.nsIAutoCompleteResult.RESULT_SUCCESS, // search result
        0, // default index
        "", // erro description
        filtered_properties.map(function(property) id + "." + property),
        filtered_properties.map(function(property) String(module[property])))
    }
    listener.onSearchResult(this, autocomplete_result);
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

  _commands: [],

  "[subscribe('@initialized/command_completion_provider'), enabled]":
  function onLoad(provider)
  {
    provider.register("coterminal-commands", this);
  },

  "[subscribe('command/register-command'), enabled]":
  function registerCommand(name) 
  {
    this._commands.push(name);
  },

  /*
   * Search for a given string and notify a listener (either synchronously
   * or asynchronously) of the result
   *
   * @param search_string - The string to search for
   * @param search_param - An extra parameter
   * @param previous_result - A previous result to use for faster searching
   * @param listener - A listener to notify when the search is complete
   */
  startSearch: 
  function startSearch(search_string, search_param, previous_result, listener)
  {
    let autocomplete_result = new AutoCompleteResult(
      search_string, 
      Components.interfaces.nsIAutoCompleteResult.RESULT_SUCCESS, // search result
      0, // default index
      "", // erro description
      this._commands.filter(function(result) result
        .match(search_string.split(/\s+/).pop())),
      null);
    listener.onSearchResult(this, autocomplete_result);
  },

  /*
   * Stop all searches that are in progress
   */
  stopSearch: function stopSearch() 
  {
  },

};

let CompletionView = new Class().extends(Component);
CompletionView.definition = {

  get id()
    "completionview",

  _result: null,
  _completion_provider: null,
  _index: -1,

  get currentResult()
    this._result,

  "[subscribe('@initialized/command_completion_provider'), enabled]":
  function onLoad(provider)
  {
    this._completion_provider = provider
    let session = this._broker;
    session.notify("initialized/" + this.id, this);
  },

  complete: function complete(text)
  {
    this._completion_provider.complete(text);
  },

  filter: function filter(text, settled_position, listener) 
  {
    let context = this._completion_provider.context;
    if (context) {
      context.startSearch(text, settled_position, this._result, {
        onSearchResult: let (self = this) function onSearchResult(search, result) 
        { 
          try {
            const RESULT_SUCCESS = Components
              .interfaces
              .nsIAutoCompleteResult
              .RESULT_SUCCESS;
            if (result.searchResult == RESULT_SUCCESS) {
              coUtils.Timer.setTimeout(function() {
                self._result = result;
                listener.doCompletion(result);
              }, 100, this);
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
    } else {
      listener.doCompletion(undefined);
    }
  },

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

  tree: null,

  select: function select(index)
  {
    if (index < -1)
      index = -1;
    if (index > this.rowCount)
      index = this.rowCount - 1;

    let row;
    if (this._index > -1) {
      row = this.tree.childNodes[this._index];
      row.style.background = "";
      row.style.color = "";
    }
    if (index > -1) {
      row = this.tree.childNodes[index];
      row.style.background = "#226";
      row.style.color = "white";
      try {
        let scroll_box = this.tree.parentNode.parentNode;
        let box_object = scroll_box.boxObject
          .QueryInterface(Components.interfaces.nsIScrollBoxObject)
        if (box_object) {
          let scrollY = {};
          box_object.getPosition({}, scrollY);
          let first_position = row.boxObject.y - this.tree.boxObject.y;
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

  /** post constructor. */
  "[subscribe('@initialized/completionview'), enabled]":
  function onLoad(view) 
  {
    this.view = view;
    this.enabled = this.enabled_when_startup;
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
        style: "padding: 3px; background: lightgray;",
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
            style: { MozUserFocus: "ignore", },
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
    this.view.tree = this._tree;
    this.show.enabled = true;
    this.onStatusMessage.enabled = true;
    this.onfocus.enabled = true;
    this.onblur.enabled = true;
    this.oninput.enabled = true;
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

  _index: 0,

  doCompletion: function doCompletion(result) 
  {
    delete this._timer;
    let rows = this._tree;
    while (rows.firstChild) {
      rows.removeChild(rows.firstChild);
    }
    if (result) {
      let document = rows.ownerDocument;
      for (let i = 0; i < result.matchCount; ++i) {
        let row = rows.appendChild(document.createElement("row"))
        if (i == this.view.currentIndex) {
          row.style.background = "#226";
          row.style.color = "white";
        } else {
          row.style.background = "";
          row.style.color = "";
        }

        let completion_text = result.getValueAt(i);
        let search_string = result.searchString.toLowerCase();
        let match_position = completion_text.toLowerCase().indexOf(search_string);
        if (-1 != match_position) {
          let box = row.appendChild(document.createElement("hbox"));
          box.style.margin = "0px";
          box.appendChild(document.createTextNode(completion_text.substr(0, match_position)));
          label = box.appendChild(document.createElement("label"));
          label.setAttribute("value", completion_text.substr(match_position, search_string.length));
          label.style.cssText = "margin: 0px; font-weight: bold; text-decoration: underline;";
          box.appendChild(document.createTextNode(completion_text.substr(match_position + search_string.length)));
          let comment = row.appendChild(document.createElement("label"));
          comment.setAttribute("value", result.getCommentAt(i));
          comment.setAttribute("crop", "end");
        }
      }
      this.invalidate(result);
    }
  },

  invalidate: function invalidate(result) 
  {
    if (this._textbox.boxObject.scrollLeft > 0) {
      this._completion.inputField.value = "";
    } else if (this.view.rowCount > 0) {
      if ("closed" == this._popup.state || "hiding" == this._popup.state) {
        this._popup.openPopup(this._textbox, "after_start", 0, 0, true, true);
        this._textbox.focus();
        this._textbox.focus();
      }
      let index = Math.max(0, this.view.currentIndex);
      let completion_text = this.view.currentResult.getValueAt(index);
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
    let index = Math.max(0, this.view.currentIndex);
    let completion_text = this.view.currentResult.getValueAt(index);
    this._textbox.inputField.value = this._settled_text + completion_text;
    this._completion.inputField.value = "";
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
      let point = current_text.indexOf(" ") + 1;
      this._search_text = current_text.substr(point);
      this._settled_text = current_text.substr(0, point);
      if (!this._search_text)
        this._completed_text = "";
      this.view.complete(this._settled_text);
      this.view.select(-1);
      this.view.filter(this._search_text, this._completed_text.length, this);
    }, 120, this);
  },

  "[listen('input', '#coterminal_commandline', true)]":
  function oninput(event) 
  {
    this.setCompletionTrigger();
  },

  down: function down()
  {
    let index = Math.min(this.view.currentIndex + 1, this.view.rowCount - 1);
    if (index >= 0) {
      this.view.select(index);
    }
    //this.invalidate();
    this.fill();
  },

  up: function up()
  {
    let index = Math.max(this.view.currentIndex - 1, -1);
    if (index >= 0) {
      this.view.select(index);
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

  "[listen('keypress', '#coterminal_commandline', true)]":
  function onkeypress(event) 
  {
    let code = event.keyCode || event.which;
    if (event.ctrlKey) { // ^
      event.stopPropagation();
      event.preventDefault();
    }
    if ("p".charCodeAt(0) == code && event.ctrlKey) { // ^p
      code = 0x26;
    }
    if ("n".charCodeAt(0) == code && event.ctrlKey) { // ^n
      code = 0x28;
    }
    if ("j".charCodeAt(0) == code && event.ctrlKey) { // ^j
      code = 0x0d;
    }
    if ("h".charCodeAt(0) == code && event.ctrlKey) { // ^h
    }
    if (0x09 == code) { // tab
      event.stopPropagation();
      event.preventDefault();
    }
    if (0x09 == code && event.shiftKey) // shift + tab
      code = 0x26;
    if (0x09 == code && !event.shiftKey) // tab
      code = 0x28;
    if (0x26 == code) { // up 
      this.up();
    } else if (0x28 == code) { // down
      this.down();
    } else if (0x0d == code) {
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
    this._tree.view = this.view;
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

let CommandlineParser = new Class();
CommandlineParser.definition = {
  
  complete: function complete(commandline)
  {
  },

};

let CommandEvaluator = new Class().extends(Component);
CommandEvaluator.definition = {

  get id()
    "commandevaluator",

  initialize: function(session)
  {
  },

  "[subscribe('@event/session-started'), enabled]":
  function onLoad(session)
  {
  },

  "[subscribe('command/evaluate'), enabled]":
  function evaluate(commandline)
  {
    try {
      eval(commandline);
    } catch (e) {
      coUtils.Debug.reportWarning(e);
    }
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
      new CommandsParser(session);
      new GoCommandParser(session);
      new SetCommandParser(session);
      new JsCommandParser(session);
      new CommandEvaluator(session);
      new CommandCompleter(session);
      new VariableCompleter(session);
      new JsCompleter(session);
      new CompletionView(session);
      new CommandCompletionProvider(session);
      new Commandline(session);
    });
}


