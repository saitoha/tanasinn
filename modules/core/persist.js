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

/**
 * @class PersistManager
 */ 
let PersistManager = new Class().extends(Component);
PersistManager.definition = {

  get id()
    "persistmanager",

  "[persistable] path": "$Home/.coterminal/persist.js",

  "[subscribe('event/process-started'), enabled]":
  function onProcessStarted(process)
  {
    process.notify("initialized/persistmanager", this);
  },

  "[subscribe('command/load-settings'), enabled]":
  function load(session)
  {
    try {
      let content = coUtils.IO.readFromFile(this.path, "utf-8");
      let data = eval(content);
      session.notify("command/before-load-persistable-data", data);
      session.notify("command/load-persistable-data", data);
    } catch (e) {
      coUtils.Debug.reportWarning(e);
    }
  },

  "[subscribe('command/save-settings'), enabled]":
  function save(data)
  {
    let serialized_data = data.toSource();
    coUtils.IO.writeToFile(this.path, serialized_data);
  },

  "[subscribe('command/get-settings'), enabled]":
  function get(session)
  {
    let data = {};
    session.notify("command/before-save-persistable-data", data);
    session.notify("command/save-persistable-data", data);
    return data;
  },

};

/**
 * @fn main
 * @brief Module entry point.
 * @param {Process} process The Process object.
 */
function main(process)
{
  new PersistManager(process);
}

