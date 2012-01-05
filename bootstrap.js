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


Components.utils.import("resource://gre/modules/Services.jsm");
Components.utils.import("resource://gre/modules/AddonManager.jsm");

let loader = {

  file: null,

  initializeWithFileURI: function initialize(file)
  {
    this.file = file;
    Services.ww.registerNotification(this);

    // add functionality to existing windows
    let browser_windows = Services.wm.getEnumerator("navigator:browser");
    while (browser_windows.hasMoreElements()) { // enumerate existing windows.
      // only run the "start" immediately if the browser is completely loaded
      let window = browser_windows.getNext();
      if ("complete" == window.document.readyState) {
        this.dispatchWindowEvent(window);
      } else {
        // Wait for the window to finish loading before running the callback
        // Listen for one load event before checking the window type
        window.addEventListener(
          "load", 
          let (self = this) function() self.dispatchWindowEvent(window), 
          false);
      }
    } // while
  },

  uninitialize: function uninitialize()
  {
    this.file = null;
    Services.ww.unregisterNotification(this);
  },

  dispatchWindowEvent: function dispatchWindowEvent(window) 
  {
    Components.classes['@zuse.jp/coterminal/process;1']
      .getService(Components.interfaces.nsISupports)
      .wrappedJSObject
      .notify("event/new-window-detected", window);
  },

  // Handles opening new navigator window.
  observe: function observe(subject, topic, data) 
  {
    let window = subject.QueryInterface(Components.interfaces.nsIDOMWindow);
    if ("domwindowopened" == topic) {
      window.addEventListener("load", let (self = this) function onLoad() 
        {
          let document = window.document;
          let window_type = document.documentElement.getAttribute("windowtype");
          // ensure that "window" is a navigator window.
          if ("navigator:browser" == window_type) {
            window.removeEventListener("load", arguments.callee, false);
            self.dispatchWindowEvent(window);
          }
        }, false);
    }
  },
}


function startup(data, reason) 
{
  AddonManager.getAddonByID(data.id, function(addon) 
  {
    try {
      let process_file = addon.getResourceURI("modules/common/process.js").spec;
      let initialize_file = addon.getResourceURI("modules/initialize.js").spec;
      Services.scriptloader.loadSubScript(process_file);
      loader.initializeWithFileURI(initialize_file);
    } catch(e) {
      let message = <>{e.fileName}({e.lineNumber}):{e.toString()}</>.toString();
      Components.reportError(message);
    }
  });
  return true;
}

function shutdown(data, reason) 
{
  loader.uninitialize();
//  var prompts = Components.classes["@mozilla.org/embedcomp/prompt-service;1"]
//                    .getService(Components.interfaces.nsIPromptService);
//  if (reason !== APP_SHUTDOWN) unload(); 
}

//function install(data, reason) {
//}
//
//
//function uninstall(data, reason) {
//}
