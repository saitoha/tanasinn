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

function start_tanasinn(tanasinn_class, data)
{
  var io_service = Components
        .classes["@mozilla.org/network/io-service;1"]
        .getService(Components.interfaces.nsIIOService),
      uri = io_service.newFileURI(data.installPath.clone()),
      file_handler, // nsIFileProtocolHandler
      process,      // tanasinn's Process object
      process_url,  // the location of process.js
      message;      // error message

  // reserve 'resource://tanasinn'
  io_service.getProtocolHandler("resource")
    .QueryInterface(Components.interfaces.nsIResProtocolHandler)
    .setSubstitution("tanasinn", uri)

  try {
    file_handler = io_service.getProtocolHandler("file")
      .QueryInterface(Components.interfaces.nsIFileProtocolHandler);

    process = data.installPath.clone();
    process.append("modules");
    process.append("common");
    process.append("process.js");

    process_url = file_handler.getURLSpecFromFile(process);

    Components
      .classes["@mozilla.org/moz/jssubscript-loader;1"]
      .getService(Components.interfaces.mozIJSSubScriptLoader)
      .loadSubScript(process_url);

  } catch(e) {
    message = e.fileName + ":" + e.lineNumber + " " + e.toString();
    Components.reportError(message);
    return false;
  }
  return true;
}

function resume_tanasinn(tanasinn_class, data)
{
  var io_service = Components
        .classes["@mozilla.org/network/io-service;1"]
        .getService(Components.interfaces.nsIIOService);

  // reserve 'resource://tanasinn'
  io_service.getProtocolHandler("resource")
    .QueryInterface(Components.interfaces.nsIResProtocolHandler)
    .setSubstitution("tanasinn", uri)

  tanasinn_class.getService(Components.interfaces.nsISupports)
    .wrappedJSObject
    .notify("event/enabled");
}

function startup(data, reason) 
{
  var tanasinn_class = Components
    .classes["@zuse.jp/tanasinn/process;1"];

  if (tanasinn_class) {
    return resume_tanasinn(tanasinn_class, data);
  }
  return start_tanasinn(tanasinn_class, data);
}

function shutdown(data, reason) 
{
  var process = Components.classes['@zuse.jp/tanasinn/process;1']
        .getService(Components.interfaces.nsISupports)
        .wrappedJSObject,
      io_service = Components
        .classes["@mozilla.org/network/io-service;1"]
        .getService(Components.interfaces.nsIIOService);

  process.notify("event/disabled");
  process.uninitialize();

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

// EOF
