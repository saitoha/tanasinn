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

let scope = {};
let subscript_loader = Components
  .classes["@mozilla.org/moz/jssubscript-loader;1"]
  .getService(Components.interfaces.mozIJSSubScriptLoader);

function loadScript(relational_path) 
{
  let uri = Components
    .stack.filename.split(" -> ").pop()
    .split("?").shift() + "/../" + relational_path + "?" + new Date().getTime();
  subscript_loader.loadSubScript(uri, scope);
}
loadScript("config.js", scope);
loadScript("common.js", scope);
loadScript("base.js", scope);
loadScript("event.js", scope);
loadScript("constant.js", scope);
loadScript("eastasian.js", scope);

with (scope) {

  coUtils.Debug.reportMessage("coterminal_initialize called.");
  
  /**
   * @class ComponentLoader
   */
  let ComponentLoader = new Aspect();
  ComponentLoader.definition = {
  
    modules: null,
  
    /** Load *.js files from specified directories. 
     *  @param {String} search path 
     */
    load: function load(search_path) 
    {
      let entries = coUtils.File.getFileEntriesFromSerchPath(search_path);
      for (let entry in entries) {
        let scope = new this.default_scope;
        try {
          // make URI string such as "file://....".
          let url = coUtils.File.getURLSpec(entry); 
          coUtils.Runtime.loadScript(url, scope);
          if (scope.main) {
            scope.main(this);
          } else {
            throw coUtils.Debug.Exception(
              _("Component scope symbol 'main' ",
                "required by module loader was not defined. \n",
                "file: '%s'."), 
              url.split("/").pop());
          }
        } catch (e) {
          coUtils.Debug.reportError(e);
        }
      }
    },
  } // ComponentLoader
  
  /**
   * @object Process
   */
  let Process = new CoClass().extends(EventBroker).mix(ComponentLoader);
  Process.definition = {
  
    get classID()
      Components.ID("{BA5BFE08-CEFB-4C20-BEE6-FCEE9EABBDC1}"),
  
    get description()
      "coTerminal Process class.",
  
    get contractID()
      "@zuse.jp/coterminal/process;1",
   
    get default_scope()
      function() { this.__proto__ = scope; },
  
    QueryInterface: function QueryInterface(a_IID)
      this,
  
    get wrappedJSObject()
      this,

    get window()
      this._window,

    get document()
      this._document,

    get root_element()
      this._root_element,
  
    initial_settings_path: "$Home/.coterminal.js",
    width: 120,
    height: 36,
    command: null,
    term: null,
    //default_command: "login -pf $USER",
    default_command: "/bin/zsh",
    default_term: "xterm",
    runtime_path: "$Home/.coterminal",
    search_path: null,
    autoload_path: null,
  
    /** constructor. */
    initialize: function initialize() 
    {
      // set search path.
      this.autoload_path = [
        "modules/autoload"
      ];
      this.search_path = [ 
        "modules/core",
        "modules/plugin", 
        "modules/standard", 
        this.runtime_path + "/plugin" 
      ];
      // load initial settings.
      let path = this.initial_settings_path;
      let file = coUtils.File.getFileLeafFromAbstractPath(path);
      if (file && file.exists()) {
        try {
          coUtils.Runtime.loadScript(path, new this.default_scope);
        } catch (e) {
          coUtils.Debug.reportError(e);
        }
      }
    },
  
    /** Creates a session object and starts it. 
     */
    start: function start(parent, command, term, size, search_path, callback) 
    {
      command = "/bin/zsh --login";
      let document = parent.ownerDocument;
      let box = document.createElement("box");
      box.style.position = "fixed";
      box.style.top = "60px";
      box.style.left = "0px";
      this._root_element = parent.appendChild(box);
      this._document = document; 
      this._window = document.defaultView; 
      this.command = command || this.default_command;
      this.term = term || this.default_term;
      [this.width, this.height] 
        = size || [this.width, this.height];
      this.clear();
      // search path list
      let path = search_path || this.default_search_path;
  
      this.load(path);
  
      // create session object;
      let request = { 
        parent: this._root_element, 
        command: this.command, 
        term: this.term, 
        width: this.width,
        height: this.height,
      };
      this.notify("event/process-started", this);
      let session = this.uniget("event/session-requested", request);
      if (callback) {
        let id = session.subscribe(
          "event/session-stopping", 
          function onSessionStoping() {
            session.unsubscribe(id);
            if (callback) {
              let shadow_copy = callback;
              callback = null;
              shadow_copy();
            }
          });
      }
    },

    createNewScope: function createNewScope()
    {
      return new this.default_scope;
    },
  
    /* override */
    toString: function toString()
    {
      return "[Object Process]";
    }
  
  }; // Process

} // with scope

