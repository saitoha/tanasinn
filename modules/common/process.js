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

void function() {

  var tanasinn_scope = {}, // create scope.
      id, current_file,
      loader;
  
  with (tanasinn_scope) {

    var g_process;

    function getProcess()
    {
      if (!g_process) {
        //g_process = Components.classes['@zuse.jp/tanasinn/process;1']
        //  .getService(Components.interfaces.nsISupports)
        //  .wrappedJSObject
        g_process = new Process();
      }
      return g_process;
    }

    id = new Date().getTime();
    current_file = Components
      .stack.filename.split(" -> ").pop()
      .split("?").shift();
    Components
      .classes["@mozilla.org/moz/jssubscript-loader;1"]
      .getService(Components.interfaces.mozIJSSubScriptLoader)
      .loadSubScript(current_file + "/../common.js?" + id, tanasinn_scope);
  
  //  coUtils.Runtime.loadScript("modules/common/pot.js", tanasinn_scope);
    coUtils.Runtime.loadScript("modules/unicode/wcwidth.js", tanasinn_scope);
    coUtils.Runtime.loadScript("modules/common/tupstart.js", tanasinn_scope);
    coUtils.Runtime.loadScript("modules/common/tupbase.js", tanasinn_scope);
  
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
            i;
  
        coUtils.Services.windowWatcher.registerNotification(this);
  
        for (i = 0; i < window_types.length; ++i) {
          window_type = window_types[i];
          // add functionality to existing windows
          let browser_windows = window_mediator.getEnumerator(window_type);
          while (browser_windows.hasMoreElements()) { // enumerate existing windows.
            // only run the "start" immediately if the browser is completely loaded
            let dom = {
              window: browser_windows.getNext()
            };
            if ("complete" === dom.window.document.readyState) {
              this.dispatchWindowEvent(dom.window);
            } else {
              // Wait for the window to finish loading before running the callback
              // Listen for one load event before checking the window type
              dom.window.addEventListener(
                "load", 
                function(event) 
                {
                  self.dispatchWindowEvent(dom.window);
                },
                false);
            }
          } // while
        }
      },
    
      uninitialize: function uninitialize()
      {
        var window_watcher = coUtils.Services.windowWatcher;

        window_watcher.unregisterNotification(this);
      },
    
      dispatchWindowEvent: function dispatchWindowEvent(window) 
      {
        if (this.windows.some(function(w) w === window)) {
          return;
        }

        this.windows.push(window);
        /*
        Components.classes['@zuse.jp/tanasinn/process;1']
          .getService(Components.interfaces.nsISupports)
          .wrappedJSObject
          */
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
                dom.window.removeEventListener("load", arguments.callee, false);
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
        var path,
            directory,
            search_paths = "CDEFGHIJKLMNOPQRSTUVWXYZ"
              .split("")
              .map(function(letter) letter + ":\\cygwin");

        search_paths.push("D:\\User\\Program\\cygwin");

        for ([, path] in Iterator(search_paths)) {
          directory = Components
            .classes["@mozilla.org/file/local;1"]
            .createInstance(Components.interfaces.nsILocalFile);
          directory.initWithPath(path);
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
        var os = coUtils.Runtime.os;
        var bin_path = this.bin_path;
        var executeable_postfix = "WINNT" === os ? ".exe": "";
        var python_paths = bin_path.split(":")
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
        this.observerService.addObserver(observer, topic, false);
      },
      
      removeGlobalEvent: function removeGlobalEvent(topic)
      {
        var observers;

        if (this.observerService && this._observers) {
          observers = this._observers[topic];
          if (observers) {
            observers.forEach(
              function(observer) 
              {
                try {
                  this.observerService.removeObserver(observer, topic);
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
    var Process = new CoClass().extends(EventBroker).mix(Environment);
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

      get wrappedJSObject()
        this,
  
      initial_settings_path: "$Home/.tanasinn.js",
   
      observerService: Components
        .classes["@mozilla.org/observer-service;1"]
        .getService(Components.interfaces.nsIObserverService),
  
      /** constructor. */
      initialize: function initialize() 
      {
        // load initial settings.
        var path = this.initial_settings_path;
        var file = coUtils.File.getFileLeafFromVirtualPath(path);
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
        try {
          Components
            .classes["@mozilla.org/observer-service;1"]
            .getService(Components.interfaces.nsIObserverService)
            .removeObserver(topic, this);
        } catch (e) {
          // do nothing
        }
        var io_service = Components
          .classes["@mozilla.org/network/io-service;1"]
          .getService(Components.interfaces.nsIIOService);
      
        var process = this.wrappedJSObject;

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
 
  } // with tanasinn_scope

} ();

// EOF
