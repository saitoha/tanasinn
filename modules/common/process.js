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
/*
 * [ Overview ]
 *
 * - Herarchical Event Broker Pattern
 *
 *                                                      +----------------+
 *                                                      |                |
 *                                                      A                |
 *     +-----------------------+          +--------------------------+   |         +---------------------+
 *     |                       |          |                          +---+         |                     |
 *     | The Root Event Broker +---------<| EventBroker & Component  =------------<| Component or Plugin |
 *     |                       |          |                          |             |                     |
 *     +-----------------------+          +---------------------------             +---------------------+
 *
 *
 * - Event Bus
 *                                  +---------+
 *                                  | Process |
 *                                  +----+----+
 *                                       |
 *              process bus   -----------+---+-------
 *                                           |
 *                                      +----+----+
 *                                      | desktop |
 *                                      +----+----+
 *                                           |
 *                             ----+---------+------+------- 
 *                                 |                |
 *                            +----+-----+     +----+----+
 *                            | launcher |     | session |
 *                            +----------+     +----+----+
 *                                                  |
 *                             .... -------+--------+---+-----------+------- ....
 *                                         |            |           |
 *                                   +----------+  +----+----+  +---------+
 *                             ....  | renderer |  |   tty   |  | screen  |  ....
 *                                   +----------+  +---------+  +---------+
 */
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
  coUtils.Runtime.loadScript("modules/common/category.js", scope);
  coUtils.Runtime.loadScript("modules/common/eastasian.js", scope);
}

with (scope) {

  let Environment = new Aspect();
  Environment.definition = {

  // public properties

    /** @property cygwin_root */
    get cygwin_root()
    {
      return this._cygwin_root || this._guessCygwinRoot();
    },

    set cygwin_root(value)
    {
      this._cygwin_root = value;
    },

    /** @property bin_path */
    get bin_path()
    {
      return this._bin_path || this._guessBinPath();
    },

    set bin_path(value)
    {
      this._bin_path = value;
    },

    /** @property python_path */
    get python_path()
    {
      return this._python_path || this._guessPythonPath();
    },

    set python_path(value)
    {
      this._python_path = value;
    },

    /** @property runtime_path */
    get runtime_path()
    {
      return this._runtime_path || "$Home/.tanasinn";
    },

    set runtime_path(value)
    {
      this._runtime_path = value;
    },

    /** @property static_path */
    get static_path()
    {
      return this._static_path || [
        "modules/static_components",
        "modules/static_dynamic_components",
        String(<>{this.runtime_path}/modules/static_components</>),
        String(<>{this.runtime_path}/modules/base</>)
      ];
    },

    set static_path(value)
    {
      this._static_path = value;
    },

    /** @property dynamic_path */
    get dynamic_path()
    {
      return this._dynamic_path || [ 
        "modules/static_dynamic_components",
        "modules/dynamic_components",
        String(<>{this.runtime_path}/modules/static_dynamic_components</>),
        String(<>{this.runtime_path}/modules/dynamic_components</>)
      ];
    },

    set dynamic_path(value)
    {
      this._dynamic_path = value;
    },

    _guessCygwinRoot: function _guessCygwinRoot() 
    {
      return "C:\\cygwin";
      for (let letter in Iterator("CDEFGHIJKLMNOPQRSTUVWXYZ".split(""))) {
        let directory = Components
          .classes["@mozilla.org/file/local;1"]
          .createInstance(Components.interfaces.nsILocalFile);
        directory.initWithPath(String(<>{letter}:\cygwin</>));
        if (directory.exists() && directory.isDirectory) {
          return directory.path;
        }
      }
      return null;
    },

    _guessBinPath: function _guessBinPath()
    {
      return [
        "/bin", 
        "/usr/bin/", 
        "/usr/local/bin", 
        "/opt/local/bin"
      ].join(":");
    },

    _guessPythonPath: function _guessPythonPath() 
    {
      let os = coUtils.Runtime.os;
      let bin_path = this.bin_path;
      let executeable_postfix 
        = "WINNT" == os ? ".exe": "";
      let python_paths = bin_path.split(":")
        .map(function(path) 
        {
          let directory = Components
            .classes["@mozilla.org/file/local;1"]
            .createInstance(Components.interfaces.nsILocalFile);
          let native_path;
          if ("WINNT" == os) {
            // FIXME: this code is not works well when path includes space characters.
            native_path = this.cygwin_root + path.replace(/\//g, "\\");
          } else {
            native_path = path;
          }
          directory.initWithPath(native_path);
          return {
            directory: directory,
            path: path,
          };
        }, this).filter(function(info) 
        {
          return info.directory.exists() && info.directory.isDirectory();
        }).reduce(function(accumulator, info) {
          let paths = [ 2.9, 2.8, 2.7, 2.6, 2.5 ]
            .map(function(version) 
            {
              let file = info.directory.clone();
              file.append("python" + version + executeable_postfix);
              return file;
            }).filter(function(file)
            {
              return file.exists() && file.isExecutable();
            }).map(function(file) 
            {
              if ("WINNT" == os) {
                return info.path + "/" + file.leafName;
              }
              return file.path;
            });
          Array.prototype.push.apply(accumulator, paths);
          return accumulator;
        }, []);
      return python_paths.shift();
    },

  };

  /**
   * @class Process
   */
  let Process = new CoClass().extends(EventBroker).mix(Environment);
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

    initial_settings_path: "$Home/.tanasinn.js",
 
    /** constructor. */
    initialize: function initialize() 
    {
      // load initial settings.
      let path = this.initial_settings_path;
      let file = coUtils.File.getFileLeafFromAbstractPath(path);
      if (file && file.exists()) {
        try {
          coUtils.Runtime.loadScript(path, { process: this } );
        } catch (e) {
          coUtils.Debug.reportError(e);
        }
      }
      this.load(this, this.static_path);
    },

    checkEnvironment: function checkEnvironment()
    {
    },

    /** Load *.js files from specified directories. 
     *  @param {String} search path 
     */
    load: function load(desktop, search_path) 
    {
      search_path = search_path || this.dynamic_path;
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
  
    /* override */
    toString: function toString()
    {
      return "[Object Process]";
    }
  
  }; // Process

} // with scope

