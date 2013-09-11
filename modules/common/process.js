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
 * Portions created by the Initial Developer are Copyright (C) 2010 - 2013
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

/*
function alert(message)
{
  Components.classes["@mozilla.org/embedcomp/prompt-service;1"]
    .getService(Components.interfaces.nsIPromptService)
    .alert(null, "test", String(message));
}
*/

var g_process = null;

void function() {

  var Core = {

    _id: new Date().getTime(),
    _current_file: Components
                    .stack.filename.split(" -> ").pop()
                    .split("?")
                    .shift(),

    loadScript: function loadScript(filename, scope)
    {
      var path = this._current_file + "/../" + filename + "?" + this._id;
      Components
        .classes["@mozilla.org/moz/jssubscript-loader;1"]
        .getService(Components.interfaces.mozIJSSubScriptLoader)
        .loadSubScript(path, scope);
    }

  }; // Core

  var tanasinn_scope = {}, // create scope.
      current_file,
      loader,
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

  Core.loadScript("common.js", tanasinn_scope);
  Core.loadScript("../unicode/wcwidth.js", tanasinn_scope);
  Core.loadScript("config.js", tanasinn_scope);
  Core.loadScript("tupstart.js", tanasinn_scope);
  Core.loadScript("tupbase.js", tanasinn_scope);

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
          i;

      tanasinn_scope.coUtils.WindowWatcher.register(this);

      for (i = 0; i < window_types.length; ++i) {
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
                    dom.window.removeEventListener("load", onLoad, false);
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
      tanasinn_scope.coUtils.WindowWatcher.unregister(this);
    },

    dispatchWindowEvent: function dispatchWindowEvent(window)
    {
      var i,
          windows = this.windows,
          process;

      for (i = 0; i < windows.length; ++i) {
        if (window === windows[i]) {
          return;
        }
      }

      windows.push(window);

      process = getProcess();
      process.notify("event/new-window-detected", window);
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
            var window_type = dom.window.document
                                .documentElement
                                .getAttribute("windowtype");

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
    _observer_service: tanasinn_scope.coUtils.Services.getObserverService(),

    _observers: null,

    subscribeGlobalEvent:
    function subscribeGlobalEvent(topic, handler, context)
    {
      var delegate,
          observer;

      if (context) {
        delegate = function delegate(a_subject, a_topic, a_data)
        {
          return handler.apply(context, arguments);
        };
      } else {
        delegate = handler;
      }
      observer = {

        observe: function observe(a_subject, a_topic, a_data)
        {
          delegate.apply(this, arguments);
        },

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
      };
      this._observers[topic] = this._observers[topic] || [];
      this._observers[topic].push(observer);
      this._observer_service.addObserver(observer, topic, false);
    },

    removeGlobalEvent: function removeGlobalEvent(topic)
    {
      var observers,
          i;

      if (this._observers) {
        observers = this._observers[topic];
        if (observers) {
          for (i = 0; i < observers.length; ++i) {
            try {
              this._observer_service.removeObserver(observers[i], topic);
            } catch(e) {
              tanasinn_scope.coUtils.Debug.reportWarning(e);
            }
          }
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
    {
      return function scope()
      {
        this.__proto__ = tanasinn_scope;
      };
    },

    initial_settings_path: "$Home/.tanasinn.js",

    /** constructor. */
    initialize: function initialize()
    {
      // load initial settings.
      var path = this.initial_settings_path,
          file = tanasinn_scope.coUtils.File.getFileLeafFromVirtualPath(path);

      if (file && file.exists()) {
        try {
          tanasinn_scope.coUtils.Runtime.loadScript(path, { process: this } );
        } catch (e) {
          tanasinn_scope.coUtils.Debug.reportError(e);
        }
      }

      this.load(this, ["modules/process_components"], new this.default_scope);
      this._observers = {};
    },

    /* destructor */
    uninitialize: function uninitialize()
    {
      loader.uninitialize();  // unregister window watcher handler
    },

    getDesktopFromWindow: function getDesktopFromWindow(window)
    {
      var desktops = this.notify("get/desktop-from-window", window),
          desktop;

      if (desktops) {
        desktop = desktops.filter(
          function filterProc(desktop)
          {
            return desktop;
          })[0];
        if (desktop) {
          return desktop;
        }
      }
      return this.callSync("event/new-window-detected", window);
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
