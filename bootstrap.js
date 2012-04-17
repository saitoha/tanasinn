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


function startup(data, reason) 
{
var promptService = Components.classes["@mozilla.org/embedcomp/prompt-service;1"]
                                .getService(Components.interfaces.nsIPromptService);
  let io_service = Components
    .classes["@mozilla.org/network/io-service;1"]
    .getService(Components.interfaces.nsIIOService);
  let uri = io_service.newFileURI(data.installPath.clone());
  io_service.getProtocolHandler("resource")
    .QueryInterface(Components.interfaces.nsIResProtocolHandler)
    .setSubstitution("tanasinn", uri)
  let tanasinn_class = Components
    .classes["@zuse.jp/tanasinn/process;1"];
  if (tanasinn_class) {
    Components.classes['@zuse.jp/tanasinn/process;1']
      .getService(Components.interfaces.nsISupports)
      .wrappedJSObject
      .notify("event/enabled");
  } else {
    try {
      let file_handler = io_service.getProtocolHandler("file")
        .QueryInterface(Components.interfaces.nsIFileProtocolHandler);
      let process = data.installPath.clone();
      process.append("modules");
      process.append("common");
      process.append("process.js");
      let process_url = file_handler.getURLSpecFromFile(process);
      Components
        .classes["@mozilla.org/moz/jssubscript-loader;1"]
        .getService(Components.interfaces.mozIJSSubScriptLoader)
        .loadSubScript(process_url);
    } catch(e) {
      let message = <>{e.fileName}({e.lineNumber}):{e.toString()}</>.toString();
      Components.reportError(message);
      return false;
    }
  }
promptService.alert(null, null, "def");
  return true;
}

function shutdown(data, reason) 
{
  let process = Components.classes['@zuse.jp/tanasinn/process;1']
    .getService(Components.interfaces.nsISupports)
    .wrappedJSObject;
  process.notify("event/disabled");
  process.uninitialize();
  let io_service = Components
    .classes["@mozilla.org/network/io-service;1"]
    .getService(Components.interfaces.nsIIOService);
  io_service.getProtocolHandler("resource")
    .QueryInterface(Components.interfaces.nsIResProtocolHandler)
    .setSubstitution("tanasinn", null);
  process.notify("event/shutdown");
  process.destroy();
  process.clear();
  return true;
}

function install(data, reason) 
{
  return true;
}

function uninstall(data, reason) 
{
  return true;
}

