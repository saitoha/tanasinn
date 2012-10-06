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
 *     | The Root Event Broker +---------<| EventBroker & Component  |------------<| Component or Plugin |
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
 *
 * - System Stack
 *
 *
 *
 *
 */

"use strict";

var g_process;

void function() {

  var tanasinn_scope = {}, // create scope.
      id,
      current_file,
      loader,
      coUtils,
      EventBroker,
      Trait,
      Class,
      Process,
      getProcess = function getProcess()
      {
        if (!g_process) {
          g_process = new Process();
        }
        return g_process;
      };

  id = new Date().getTime();
  current_file = Components
    .stack.filename.split(" -> ").pop()
    .split("?").shift();
  Components
    .classes["@mozilla.org/moz/jssubscript-loader;1"]
    .getService(Components.interfaces.mozIJSSubScriptLoader)
    .loadSubScript(current_file + "/../common.js?" + id, tanasinn_scope);

  coUtils = tanasinn_scope.coUtils;

//  coUtils.Runtime.loadScript("modules/common/pot.js", tanasinn_scope);
  coUtils.Runtime.loadScript("modules/unicode/wcwidth.js", tanasinn_scope);
  coUtils.Runtime.loadScript("modules/common/tupstart.js", tanasinn_scope);
  coUtils.Runtime.loadScript("modules/common/tupbase.js", tanasinn_scope);

  EventBroker = tanasinn_scope.EventBroker;
  Trait = tanasinn_scope.Trait;
  Class = tanasinn_scope.Class;

  loader = {

    windows: [],
  
    initialize: function initialize()
    {
      var window_mediator = Components
            .classes["@mozilla.org/appshell/window-mediator;1"]
            .getService(Components.interfaces.nsIWindowMediator),
          window_types = ["navigator:browser", "mail:3pane"],
          window_type,
          self = this,
          i = 0;

      coUtils.Services.windowWatcher.registerNotification(this);

      for (; i < window_types.length; ++i) {
        window_type = window_types[i];
        // add functionality to existing windows
        void function(self)
        {
          var browser_windows = window_mediator.getEnumerator(window_type);

          while (browser_windows.hasMoreElements()) { // enumerate existing windows.
            // only run the "start" immediately if the browser is completely loaded
            void function()
            {
              var dom = {
                window: browser_windows.getNext()
              };
              if ("complete" === dom.window.document.readyState) {
                self.dispatchWindowEvent(dom.window);
              } else {
                // Wait for the window to finish loading before running the callback
                // Listen for one load event before checking the window type
                dom.window.addEventListener(
                  "load", 
                  function onLoad(event) 
                  {
                    self.dispatchWindowEvent(dom.window);
                  },
                  false);
              }
            } ();
          } // while
        } (this);
      }
    },
  
    uninitialize: function uninitialize()
    {
      var window_watcher = coUtils.Services.windowWatcher;

      window_watcher.unregisterNotification(this);
    },
  
    dispatchWindowEvent: function dispatchWindowEvent(window) 
    {
      var i = 0,
          windows = this.windows;

      for (; i < windows.length; ++i) {
        if ( w === window) {
          return;
        }
      }

      windows.push(window);

      getProcess().notify("event/new-window-detected", window);
    },
  
    // Handles opening new navigator window.
    observe: function observe(subject, topic, data) 
    {
      var self = this,
          dom = {
            window: subject.QueryInterface(Components.interfaces.nsIDOMWindow)
          };
      if ("domwindowopened" === topic) {
        dom.window.addEventListener(
          "load",
          function onLoad() 
          {
            var document = dom.window.document,
                window_type = document.documentElement.getAttribute("windowtype");

            // ensure that "window" is a navigator window.
            if (/^(navigator:browser|mail:3pane)$/.test(window_type)) {
              dom.window.removeEventListener("load", onLoad, false);
              self.dispatchWindowEvent(dom.window);
            }
          }, false);
      }
    },
  }

  var Environment = new Trait();
  Environment.definition = {

  // public properties

    /** @property runtime_path */
    get runtime_path()
    {
      return this._runtime_path || "$Home/.tanasinn";
    },

    set runtime_path(value)
    {
      this._runtime_path = value;
    },

    /** @property cygwin_root */
    get cygwin_root()
    {
      var cygwin_root = this._cygwin_root || this._guessCygwinRoot();
      return cygwin_root;
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

    _guessCygwinRoot: function _guessCygwinRoot() 
    {
      var directory,
          i = 0,
          letters = ["C", "D", "E", "F", "G", 
                     "H", "I", "J", "K", "L", 
                     "M", "N", "O", "P", "Q", 
                     "R", "S", "T", "U", "V", 
                     "W", "X", "Y", "Z"],
          search_paths = letters
            .map(function(letter)
            {
              return letter + ":\\cygwin";
            });

      search_paths.push("D:\\User\\Program\\cygwin");

      for (; i < search_paths.length; ++i) {
        directory = Components
          .classes["@mozilla.org/file/local;1"]
          .createInstance(Components.interfaces.nsILocalFile);
        directory.initWithPath(search_paths[i]);
        if (directory.exists() && directory.isDirectory) {
          return directory.path;
        }
      }
      throw coUtils.Debug.Exception(_("Cannot guess cygwin root path."));
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
      var os = coUtils.Runtime.os,
          bin_path = this.bin_path,
          executeable_postfix = "WINNT" === os ? ".exe": "",
          python_paths;

      python_paths = bin_path.split(":")
        .map(function(path) 
        {
          var directory = Components
            .classes["@mozilla.org/file/local;1"]
            .createInstance(Components.interfaces.nsILocalFile);
          var native_path;
          if ("WINNT" === os) {
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
          var paths = [ 2.9, 2.8, 2.7, 2.6, 2.5 ]
            .map(function(version) 
            {
              var file = info.directory.clone();
              file.append("python" + version + executeable_postfix);
              return file;
            }).filter(function(file)
            {
              return file.exists() && file.isExecutable();
            }).map(function(file) 
            {
              if ("WINNT" === os) {
                return info.path + "/" + file.leafName;
              }
              return file.path;
            });
          Array.prototype.push.apply(accumulator, paths);
          return accumulator;
        }, []);
      return python_paths.shift();
    },

    _observers: null,

    subscribeGlobalEvent: 
    function subscribeGlobalEvent(topic, handler, context)
    {
      var delegate,
          observer;

      if (context) {
        delegate = function delegate()
        {
          return handler.apply(context, arguments);
        };
      } else {
        delegate = handler;
      }
      observer = { 
        observe: function observe() 
        {
          delegate.apply(this, arguments);
        },
      };
      this._observers[topic] = this._observers[topic] || [];
      this._observers[topic].push(observer);
      coUtils.Services.observerService.addObserver(observer, topic, false);
    },
    
    removeGlobalEvent: function removeGlobalEvent(topic)
    {
      var observers;

      if (this._observers) {
        observers = this._observers[topic];
        if (observers) {
          observers.forEach(
            function(observer) 
            {
              try {
                coUtils.Services.observerService.removeObserver(observer, topic);
              } catch(e) {
                coUtils.Debug.reportWarning(e);
              }
            }, this);
          this._observers = null;
        }
      }
    },

  }; // trait Environment

  /**
   * @class Process
   */
  Process = new Class().extends(EventBroker).mix(Environment);
  Process.definition = {

    id: "process",
  
    get default_scope()
      function() 
      { 
        this.__proto__ = tanasinn_scope;
      },

  // nsIObserver implementation
    /**
     * Provides runtime type discovery.
     * @param aIID the IID of the requested interface.
     * @return the resulting interface pointer.
     */
    QueryInterface: function QueryInterface(a_IID)
    {
      if (!a_IID.equals(Components.interafaces.nsIObserver) 
       && !a_IID.equals(Components.interafaces.nsISupports)) {
        throw Components.results.NS_ERROR_NOT_IMPLEMENTED;
      }
      return this;
    },

    initial_settings_path: "$Home/.tanasinn.js",
 
    /** constructor. */
    initialize: function initialize() 
    {
      // load initial settings.
      var path = this.initial_settings_path,
          file = coUtils.File.getFileLeafFromVirtualPath(path);

      if (file && file.exists()) {
        try {
          coUtils.Runtime.loadScript(path, { process: this } );
        } catch (e) {
          coUtils.Debug.reportError(e);
        }
      }

      this.load(this, ["modules/process_components"], new this.default_scope);
      this._observers = {};

      this.subscribeGlobalEvent(
        "quit-application", 
        function onQuitApplication() 
        {
          this.notify("event/disabled", this);
        }, this);

      Components
        .classes["@mozilla.org/observer-service;1"]
        .getService(Components.interfaces.nsIObserverService)
        .addObserver(this, "command/terminate-tanasinn", false);
    },

    uninitialize: function uninitialize()
    {
      loader.uninitialize();  // unregister window watcher handler
      Process.destroy();      // unregister XPCOM object
    },
  
    getDesktopFromWindow: function getDesktopFromWindow(window) 
    {
      var desktops = this.notify("get/desktop-from-window", window);

      if (!desktops) {
        this.notify("event/new-window-detected", window);
        desktops = this.notify("get/desktop-from-window", window);
      }
      return desktops.shift();
    },

    observe: function observe(subject, topic, data)
    {
      var io_service = coUtils.Services.ioService,
          process = this.wrappedJSObject;

      try {
        coUtils.Services.observerService.removeObserver(topic, this);
      } catch (e) {
        // do nothing
      }

      process.notify("event/disabled");
      process.uninitialize();
    
      io_service
        .getProtocolHandler("resource")
        .QueryInterface(Components.interfaces.nsIResProtocolHandler)
        .setSubstitution("tanasinn", null);
    
      process.notify("event/shutdown");
      process.clear();
    },

    /* override */
    toString: function toString()
    {
      return "[Object Process]";
    },
  
  }; // Process

  loader.initialize();
 
} ();

// EOF
