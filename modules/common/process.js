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

let scope = {}; // create scope.

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
   * @class Process
   */
  let Process = new CoClass().extends(EventBroker);
  Process.definition = {

    get id()
      "process",
  
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

    "[persistable] profile_directory": "$Home/.tanasinn/globalsettings",
    "[persistable] profile": "default",

    initial_settings_path: "$Home/.tanasinn.js",
    runtime_path: "$Home/.tanasinn",
    search_path: null,
    autoload_path: null,
  
    /** constructor. */
    initialize: function initialize() 
    {
      // set search path.
      let runtime_path = this.runtime_path;
      this.autoload_path = [
        "modules/autoload",
        "modules/base",
        String(<>{runtime_path}/autoload</>),
        String(<>{runtime_path}/base</>)
      ];
      this.search_path = [ 
        "modules/core",
        "modules/plugin", 
        "modules/base",
        String(<>{runtime_path}/core</>),
        String(<>{runtime_path}/plugin</>),
        String(<>{runtime_path}/base</>)
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

    /** Load *.js files from specified directories. 
     *  @param {String} search path 
     */
    load: function load(desktop, search_path) 
    {
      search_path = search_path || this.search_path;
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

    getDesktopFromWindow: function getDesktopFromWindow(window)
    {
      return this.uniget("get/desktop-from-window", window);
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

