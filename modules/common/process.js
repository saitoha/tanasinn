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
 * The Original Code is tanasinn
 *
 * The Initial Developer of the Original Code is
 * Hayaki Saito.
 * Portions created by the Initial Developer are Copyright (C) 2010 - 2011
 * the Initial Developer. All Rights Reserved.
 *
 * ***** END LICENSE BLOCK ***** */

let scope = {};

with (scope) {
  Components
    .classes["@mozilla.org/moz/jssubscript-loader;1"]
    .getService(Components.interfaces.mozIJSSubScriptLoader)
    .loadSubScript(<>{
      Components
        .stack.filename.split(" -> ").pop()
        .split("?").shift()
    }/../common.js?{
      new Date().getTime()
    }</>.toString(), scope);
  coUtils.Debug.reportMessage("Booting base services...");
  coUtils.Runtime.loadScript("modules/common/base.js", scope);
  coUtils.Runtime.loadScript("modules/common/event.js", scope);
  coUtils.Runtime.loadScript("modules/common/eastasian.js", scope);
}

with (scope) {
  /**
   * @class ComponentLoader
   */
  let ComponentLoader = new Aspect();
  ComponentLoader.definition = {
  
    modules: null,
  
    /** Load *.js files from specified directories. 
     *  @param {String} search path 
     */
    load: function load(desktop, search_path) 
    {
      let entries = coUtils.File.getFileEntriesFromSerchPath(search_path);
      for (let entry in entries) {
        let scope = new this.default_scope;
        try {
          // make URI string such as "file://....".
          let url = coUtils.File.getURLSpec(entry); 
          coUtils.Runtime.loadScript(url, scope);
          if (scope.main) {
            scope.main(desktop);
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
      "tanasinn Process class.",
  
    get contractID()
      "@zuse.jp/tanasinn/process;1",
   
    get default_scope()
      function() { this.__proto__ = scope; },
  
    QueryInterface: function QueryInterface(a_IID)
      this,
  
    get wrappedJSObject()
      this,

    initial_settings_path: "$Home/.tanasinn.js",
    width: 120,
    height: 36,
    command: null,
    term: null,
    //default_command: "login -pf $USER",
    default_command: "login -pf $USER",
    "default_command@Linux" : "$SHELL",
    "default_command@Darwin": "login -pf $USER",
    "default_command@WINNT" : "login -pf $USER",
    default_term: "xterm",
    runtime_path: "$Home/.tanasinn",
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
      this.load(this, this.autoload_path);
    },

    getDesktopFromWindow: function getDesktopFromWindow(window)
    {
      return this.uniget("get/desktop-from-window", window);
    },
  
    /** Creates a session object and starts it. 
     */
    start: function start(parent, command, term, size, search_path, callback, desktop) 
    {
      let document = parent.ownerDocument;
      let box = document.createElement("box");
      if ("Firefox" == coUtils.Runtime.app_name) {
        box.style.position = "fixed";
        box.style.top = "0px";
        box.style.left = "0px";
      }
      // xul app
      parent.appendChild(box);
      this.command = command 
        || this["default_command@" + coUtils.Runtime.os] 
        || this.default_command;
      this.term = term || this.default_term;
      [this.width, this.height] 
        = size || [this.width, this.height];
      desktop.clear();
      // search path list
      let path = search_path || this.default_search_path;
  
      this.load(desktop, path);
  
      return box;
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

