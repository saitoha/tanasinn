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

/** @package session
 *
 * [ Session overview ]
 *
 * tanasinn's "Session" is a concept that abstracts Terminal session and 
 * all resources associated with it.
 * It behaves as a mediator object, and be associated with following session-local 
 * objects: 
 * 
 * 1. Event Manager
 * 2. TTY driver object
 * 3. Environment service
 * 4. VT Emurator. 
 * 5. Output Parser
 * 6. Input Manager
 * 7. User interface
 * 8. Renderer
 *
 */

let Environment = new Aspect();
Environment.definition = {

// public properties

  /** @property search_path */
  get search_path()
  {
    let broker = this._broker;
    return this._search_path || [ 
      "modules/shared_components",
      "modules/session_components",
      <>{broker.runtime_path}/modules/shared_components</>.toString(),
      <>{broker.runtime_path}/modules/session_components</>.toString()
  ];

  },

  set search_path(value)
  {
    this._search_path = value;
  },

};

/**
 * @aspect RouteKeyEvents
 */
let RouteKeyEvents = new Aspect()
RouteKeyEvents.definition = {

  "[subscribe('event/hotkey-double-shift'), enabled]":
  function onDoubleShift() 
  {
    this.notify("event/hotkey-double-shift", this);
  },

  "[subscribe('event/alt-key-down'), enabled]":
  function onAltKeyDown() 
  {
    this.notify("event/alt-key-down", this);
  },

  "[subscribe('event/alt-key-up'), enabled]":
  function onAltKeyUp() 
  {
    this.notify("event/alt-key-up", this);
  },

  "[subscribe('event/shift-key-down'), enabled]":
  function onShiftKeyDown() 
  {
    this.notify("event/shift-key-down", this);
  },

  "[subscribe('event/shift-key-up'), enabled]":
  function onShiftKeyUp() 
  {
    this.notify("event/shift-key-up", this);
  },

};

/**
 *
 * @class Session
 *
 */
let Session = new Class().extends(Component)
                         .mix(Environment)
                         .mix(RouteKeyEvents)
                         .mix(EventBroker);
Session.definition = {

  get id()
    "session",

  get request_id()
    this._request_id,

  get window()
    this._window,

  get document()
    this.window.document,

  get root_element()
    this._root_element,

  get command()
    this._command,

  get term()
    this._term,

  get process()
    this._broker,

  get parent()
    this._broker,

  "[persistable] profile_directory": "$Home/.tanasinn/session_profile",
  "[persistable] batch_directory": "$Home/.tanasinn/batches",
  "[persistable] cgi_directory": "$Home/.tanasinn/cgi-bin",
  "[persistable] profile": "default",
  "[persistable] initial_focus_delay": 100,

  get python_path()
  {
    let broker = this._broker;
    return broker.uniget("get/python-path");
  },

  observerService: Components
    .classes["@mozilla.org/observer-service;1"]
    .getService(Components.interfaces.nsIObserverService),

  _request_id: null,
  _observers: null,

  initialize: function initialize(broker)
  {
    this.load(this, this.search_path, new broker._broker.default_scope);
  },

  subscribeGlobalEvent: 
  function subscribeGlobalEvent(topic, handler, context)
  {
    let delegate;
    if (context) {
      delegate = function() handler.apply(context, arguments);
    } else {
      delegate = handler;
    }
    let observer = { 
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
    if (this.observerService && this._observers) {
      let observers = this._observers[topic];
      if (observers) {
        observers.forEach(function(observer) 
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

  "[subscribe('command/send-command'), enabled]":
  function sendCommand(command) 
  {
    this.notify("command/eval-commandline", command);
  },

  "[subscribe('command/send-keys'), enabled]":
  function sendKeys(expression) 
  {
    this.notify("command/input-expression-with-mapping", expression);
  },

  "[subscribe('event/disabled'), enabled]":
  function onDisabled() 
  {
    this.notify("command/detach", this);
  },

  /** Create terminal UI and start tty session. */ 
  initializeWithRequest: function initializeWithRequest(request) 
  {
    // register getter topic.
    let broker = this._broker;
    this.subscribe("get/cygwin-root", function() broker.uniget("get/cygwin-root"));
    this.subscribe("get/bin-path", function() broker.uniget("get/bin-path"));
    this.subscribe("get/python-path", function() broker.uniget("get/python-path"));

    this._request_id = coUtils.Uuid.generate().toString();

    let desktop = this._broker;
    this._observers = {};
    this.subscribeGlobalEvent(
      "quit-application", 
      function onQuitApplication() 
      {
        this.notify("command/detach", this);
      }, this);
    let document = request.parent.ownerDocument;
    this._window = document.defaultView;
    this._root_element = request.parent;
    this._command = request.command;
    this._term = request.term;

    desktop.notify("initialized/session", this);
    this.notify("command/load-settings", this.profile);
    this.notify("event/broker-started", this);
    coUtils.Timer.setTimeout(function() {
      this.notify("command/focus");
      this.notify("command/focus");
    }, this.initial_focus_delay, this);
    return this;
  },

  /** Send event/broker-stopping message. */
  "[subscribe('event/shutdown'), enabled]":
  function stop() 
  {
    this.removeGlobalEvent("quit-application");
    this.notify("event/broker-stopping", this);
    if (coUtils.Runtime.app_name.match(/tanasinn/)) {
      this.window.close(); // close window

      let application = Components
        .classes["@mozilla.org/fuel/application;1"]
        .getService(Components.interfaces.fuelIApplication);
      application.quit();
    }
  },

}; // class Session


/**
 * @fn main
 * @brief Module entry point.
 * @param {Desktop} desktop The Desktop object.
 */
function main(desktop) 
{
  desktop.subscribe(
    "event/session-requested", 
    function(request) 
    {
      new Session(desktop).initializeWithRequest(request);
    });
}


