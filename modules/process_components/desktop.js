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

/**
 * @Trait Environment
 *
 */
let Environment = new Trait();
Environment.definition = {

// public properties

  /** @property runtime_path */
  get runtime_path()
  {
    let broker = this._broker;
    return broker.runtime_path;
  },

  set runtime_path(value)
  {
    let broker = this._broker;
    broker.runtime_path = value;
  },

  /** @property search_path */
  get search_path()
  {
    return this._search_path || [
      "modules/desktop_components",
      "modules/shared_components",
      String(<>{this.runtime_path}/modules/desktop_components</>),
      String(<>{this.runtime_path}/modules/shared_components</>)
    ];
  },

  set search_path(value)
  {
    this._search_path = value;
  },

};


/** 
 * @class Desktop
 */
let Desktop = new Class().extends(Component)
                         .mix(Environment)
                         .mix(EventBroker);
Desktop.definition = {

  get id()
    "desktop",

  get window()
    this._window,

  get root_element()
    this._root_element,

  "[persistable] profile_directory": "desktop_profile",
  "[persistable] profile": "default",

  command: null,
  default_command: "login -pf $USER",
  "default_command@Linux" : "$SHELL",
  "default_command@FreeBSD" : "$SHELL",
  "default_command@Darwin": "login -pf $USER",
  "default_command@WINNT" : "login -pf $USER",
  term: null,

  width: 120,
  height: 36,

  /** constructor */
  initialize: function initialize(broker)
  {
    this.load(this, this.search_path, new broker.default_scope);
  },

  initializeWithWindow: 
  function initializeWithWindow(window)
  {
    this._window = window;

    // register getter topic.
    let broker = this._broker;
    this.subscribe("get/cygwin-root", function() broker.cygwin_root);
    this.subscribe("get/bin-path", function() broker.bin_path);
    this.subscribe("get/python-path", function() broker.python_path);

    this.install(broker);
  },

  "[subscribe('install/desktop'), enabled]":
  function install(broker)
  {
    this.onShutdown.enabled = true;
    this.getDesktopFromWindow.enabled = true;
    this._root_element = this.window.document
      .documentElement
      .appendChild(this.window.document.createElement("box"));
    
    this._root_element.id = "tanasinn_desktop";
    this.notify("command/load-settings");

    this.notify("event/broker-started", this);
  },

  "[subscribe('uninstall/desktop'), enabled]":
  function uninstall(broker)
  {
    this.onShutdown.enabled = false;
    this.getDesktopFromWindow.enabled = false;
    this.clear();
    this._root_element.parentNode.removeChild(this._root_element);
  },
  
  "[subscribe('event/enabled'), enabled]":
  function onEnabled()
  {
    this.notify("event/enabled");
  },

  "[subscribe('event/disabled'), enabled]":
  function onDisabled()
  {
    this.notify("event/disabled");
  },

  "[subscribe('event/shutdown')]":
  function onShutdown()
  {
    this.notify("event/shutdown");
    this.uninstall(this._broker);
  },
  
  "[subscribe('get/desktop-from-window')]":
  function getDesktopFromWindow(window)
  {
    return window.document
      .documentElement
      .isEqualNode(this._window.document.documentElement) ? 
        this: null;
  },

  /** Creates a session object and starts it. 
   */
  start: function start(parent, command, term, size, search_path, callback) 
  {
    let broker = this._broker;
    // create request object;
    command = command 
      || this["default_command@" + coUtils.Runtime.os] 
      || this.default_command;

    let [width, height] = size || [this.width, this.height];

    let request = { 
      parent: parent, 
      command: command, 
      term: term, 
      width: width,
      height: height,
    };
    let session = this.uniget("event/session-requested", request);
    return parent;
  },

};

/**
 * @fn main
 * @brief Module entry point
 * @param {Process} process The Process object.
 */
function main(process) 
{
  process.subscribe(
    "event/new-window-detected",
    function onDesktopRequested(window) 
    {
      let desktop = new Desktop(process).initializeWithWindow(window);
      return desktop;
    });
}

