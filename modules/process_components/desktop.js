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

"use strict";

/**
 * @Trait Environment
 *
 */
var Environment = new Trait();
Environment.definition = {

// public properties

  /** @property search_path */
  get search_path()
  {
    var runtimepath = coUtils.Runtime.getRuntimePath();

    return this._search_path || [
      "modules/desktop_components",
      "modules/shared_components",
      runtimepath + "/modules/desktop_components",
      runtimepath + "/modules/shared_components"
    ];
  },

  set search_path(value)
  {
    this._search_path = value;
  },

}; // Environment


/**
 * @class Desktop
 */
var Desktop = new Class().extends(Plugin)
                         .mix(Environment)
                         .mix(EventBroker);
Desktop.definition = {

  id: "desktop",

  get window()
  {
    return this._window;
  },

  get root_element()
  {
    return this._root_element;
  },

  "[persistable] profile_directory": "desktop_profile",
  "[persistable] profile": "default",

  command: null,
  default_command: "login -pf $USER",
  "default_command@Linux" : "$SHELL",
  "default_command@FreeBSD" : "$SHELL",
  "default_command@Darwin": "login -pfq $USER",
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
    window.tanasinn_desktop = this;
    this.install();
  },

  /** Installs itself.
   */
  "[install]":
  function install()
  {
    var id,
        root_element;

    root_element = this.window.document
      .documentElement
      .appendChild(this.window.document.createElement("box"));

    id = root_element.id = coUtils.Uuid.generate().toString();

    this._root_element = root_element;

    this.subscribe(
      "get/root-element",
      function()
      {
        return root_element;
      }, this, id);

    this.notify("command/load-settings", this.profile);

    this.notify("event/broker-started", this);
  },

  /** Uninstalls itself.
   */
  "[uninstall]":
  function uninstall()
  {
    this.unsubscribe(this._root_element.id);
    this.clear();

    if (this._root_element) {
      this._root_element.parentNode.removeChild(this._root_element);
      this._root_element = null;
    }
  },

  /** called when this extension is enabled
   */
  "[subscribe('event/enabled'), enabled]":
  function onEnabled()
  {
    this.notify("event/enabled");
  },

  /** called when this extension is disabled
   */
  "[subscribe('event/disabled'), enabled]":
  function onDisabled()
  {
    this.notify("event/disabled");
  },

  /** called when shutting down
   */
  "[subscribe('event/shutdown'), enabled]":
  function onShutdown()
  {
    this.notify("event/shutdown");
    this.uninstall(this._broker);
  },

  /** if specified window is current window, returns itself, or returns null.
   */
  "[subscribe('get/desktop-from-window'), enabled]":
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
    // create request object;
    command = command
      || this["default_command@" + coUtils.Runtime.os]
      || this.default_command;

    var cygwin_root = null,
        python_path = null;

    if ("WINNT" === coUtils.Runtime.os) {
      // check cygwin root path
      try {
        cygwin_root = coUtils.Runtime.getCygwinRoot();
      } catch(e) {
        // pass through
      }
      if (!cygwin_root) {
        alert(_("Terminal session can not be launched because ",
                "Cygwin directory is not found.\n",
                "If the cygwin environment is already installed,\n",
                "create the file '%USERPROFILE%\\.tanasinn.js'\n",
                "and add the following statement:\n",
                "\n",
                "    process.cygwin_root = \"<cygwin-root>\";\n",
                "\n",
                "example)\n",
                "    process.cygwin_root = \"C:\\cygwin\";\n",
                "\n"));
        return;
      }
    }

    // check python path
    try {
      python_path = coUtils.Runtime.getPythonPath();
    } catch(e) {
      // pass through
    }
    if (!python_path) {
      alert(_("Terminal session can not be launched because ",
              "Python environment is not found.\n",
              "If the python 2.x is already installed,\n",
              "create the file '%USERPROFILE%\\.tanasinn.js'\n",
              "and add the following statement:\n",
              "\n",
              "    process.python_path = \"<python-path>\"\n",
              "\n",
              "example)\n",
              "    process.python_path = \"/usr/local/bin/python\"\n",
              "\n"));
      return;
    }

    var [width, height] = size || [this.width, this.height];

    var request = {
      parent: parent,
      command: command,
      term: term,
      width: width,
      height: height,
      cygwin_root: cygwin_root,
      python_path: python_path,
    };

    this.callSync("event/session-requested", request);

    return parent;
  },

}; // Desktop

var DesktopFactory = new Class().extends(Plugin);
DesktopFactory.definition = {

  "[subscribe('event/new-window-detected'), enabled]":
  function onNewWindowDetected(window)
  {
    var desktop = new Desktop(this._broker);

    return desktop.initializeWithWindow(window);
  },

}; // DesktopFactory

/**
 * @fn main
 * @brief Module entry point
 * @param {Process} process The Process object.
 */
function main(process)
{
  new DesktopFactory(process);
}

// EOF
