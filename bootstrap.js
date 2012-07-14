/* -*- Mode: JAVASCRIPT; tab-width: 1; indent-tabs-mode: nil; c-basic-offset: 4 -*-
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

function alert(message)
{
  Components.classes["@mozilla.org/embedcomp/prompt-service;1"]
    .getService(Components.interfaces.nsIPromptService)
    .alert(null, "test", String(message));
}

function start_tanasinn(data)
{
  var io_service = Components
        .classes["@mozilla.org/network/io-service;1"]
        .getService(Components.interfaces.nsIIOService),
      uri = io_service.newFileURI(data.installPath.clone()),
      file_handler, // nsIFileProtocolHandler
      process_file, // tanasinn's Process file
      process_url,  // the location of process.js
      message;      // error message

  terminate_tanasinn();

  // reserve 'resource://tanasinn'
  io_service.getProtocolHandler("resource")
    .QueryInterface(Components.interfaces.nsIResProtocolHandler)
    .setSubstitution("tanasinn", uri)

  try {
    file_handler = io_service.getProtocolHandler("file")
      .QueryInterface(Components.interfaces.nsIFileProtocolHandler);

    process_file = data.installPath.clone();
    process_file.append("modules");
    process_file.append("common");
    process_file.append("process.js");

    process_url = file_handler.getURLSpecFromFile(process_file);

    var scope = {};
    Components
      .classes["@mozilla.org/moz/jssubscript-loader;1"]
      .getService(Components.interfaces.mozIJSSubScriptLoader)
      .loadSubScript(process_url + "?" + new Date().getTime(), scope);
  } catch(e) {
    message = e.fileName + ":" + e.lineNumber + " " + e.toString();
    Components.reportError(message);
    return false;
  }
  return true;
}

function terminate_tanasinn()
{
  Components
    .classes["@mozilla.org/observer-service;1"]
    .getService(Components.interfaces.nsIObserverService)
    .notifyObservers(null, "command/terminate-tanasinn", null);
}

function startup(data, reason) 
{
  try {
    return start_tanasinn(data);
  } catch (e) {
    message = e.fileName + ":" + e.lineNumber + " " + e.toString();
    Components.reportError(message);
    return false;
  }
}

function shutdown(data, reason) 
{
  var io_service;

  try {
    terminate_tanasinn();
  } catch (e) {
    message = e.fileName + ":" + e.lineNumber + " " + e.toString();
    Components.reportError(message);
    return false;
  }
  return true;
}

function install(data, reason) 
{
  try {
  } catch (e) {
    message = e.fileName + ":" + e.lineNumber + " " + e.toString();
    Components.reportError(message);
    return false;
  }
  return true;
}

function uninstall(data, reason) 
{
  try {
    terminate_tanasinn();
  } catch (e) {
    message = e.fileName + ":" + e.lineNumber + " " + e.toString();
    Components.reportError(message);
    return false;
  }
  return true;
}

// EOF
