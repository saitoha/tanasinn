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


Components.utils.import("resource://gre/modules/Services.jsm");

let loader = {

  install_path: null,
  is_first: false,

  initializeWithFileURI: function initialize(install_path)
  {
    this.install_path = install_path;
    Services.ww.registerNotification(this);
    ["navigator:browser", "mail:3pane"].forEach(function(window_type) {
      // add functionality to existing windows
      let browser_windows = Services.wm.getEnumerator(window_type);
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
    }, this);
  },

  uninitialize: function uninitialize()
  {
    this.install_path = null;
    Services.ww.unregisterNotification(this);
  },

  dispatchWindowEvent: function dispatchWindowEvent(window) 
  {
    Components.classes['@zuse.jp/tanasinn/process;1']
      .getService(Components.interfaces.nsISupports)
      .wrappedJSObject
      .notify("event/new-window-detected", window);
    if (this.is_first) {
      this.is_first = false;
      let path = this.install_path.clone();
      path.append("doc");
      path.append("usermanual.html");
      let io_service = Components
        .classes["@mozilla.org/network/io-service;1"]
        .getService(Components.interfaces.nsIIOService);
      let file_handler = io_service.getProtocolHandler("file")
        .QueryInterface(Components.interfaces.nsIFileProtocolHandler);
      let document_url = file_handler.getURLSpecFromFile(path);

      //Components.classes["@mozilla.org/embedcomp/prompt-service;1"]
      //  .getService(Components.interfaces.nsIPromptService)
      //  .alert(null, "message", "bootstrap.js:startup called!!" + document_url);
      window.gBrowser.addTab(document_url);
    }
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
          if (/^(navigator:browser|mail:3pane)$/.test(window_type)) {
            window.removeEventListener("load", arguments.callee, false);
            self.dispatchWindowEvent(window);
          }
        }, false);
    }
  },
}


function startup(data, reason) 
{
  //Components.classes["@mozilla.org/embedcomp/prompt-service;1"]
  //  .getService(Components.interfaces.nsIPromptService)
  //  .alert(null, "message", "bootstrap.js:startup called!!");
  let tanasinn_class = Components
    .classes["@zuse.jp/tanasinn/process;1"];
  if (tanasinn_class) {
    let process = Components.classes['@zuse.jp/tanasinn/process;1']
      .getService(Components.interfaces.nsISupports)
      .wrappedJSObject;
    process.notify("event/enabled");
  } else {
//    loader.is_first = true;
    try {
      let io_service = Components
        .classes["@mozilla.org/network/io-service;1"]
        .getService(Components.interfaces.nsIIOService);
      let file_handler = io_service.getProtocolHandler("file")
        .QueryInterface(Components.interfaces.nsIFileProtocolHandler);
      let process = data.installPath.clone();
      process.append("modules");
      process.append("common");
      process.append("process.js");
      let process_url = file_handler.getURLSpecFromFile(process);
      //Components
      //  .classes["@mozilla.org/moz/jssubscript-loader;1"]
      //  .getService(Components.interfaces.mozIJSSubScriptLoader)
      //  .loadSubScript(process_url);
      Services.scriptloader.loadSubScript(process_url);
      loader.initializeWithFileURI(data.installPath);
    } catch(e) {
      let message = <>{e.fileName}({e.lineNumber}):{e.toString()}</>.toString();
      Components.reportError(message);
      return false;
    }
  }
  return true;
}

function shutdown(data, reason) 
{
  loader.uninitialize();
  let process = Components.classes['@zuse.jp/tanasinn/process;1']
    .getService(Components.interfaces.nsISupports)
    .wrappedJSObject;
  process.notify("event/disabled");
//  process.notify("event/shutdown");
//  process.clear();

//  var prompts = Components.classes["@mozilla.org/embedcomp/prompt-service;1"]
//                    .getService(Components.interfaces.nsIPromptService);
//  if (reason !== APP_SHUTDOWN) unload(); 
  return true;
}

function install(data, reason) 
{
  //Components.classes["@mozilla.org/embedcomp/prompt-service;1"]
  //  .getService(Components.interfaces.nsIPromptService)
  //  .alert(null, "message", "bootstrap.js:startup called!!");
  return true;
}


function uninstall(data, reason) 
{
  return true;
}

