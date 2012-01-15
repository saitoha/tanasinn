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
 * @class PersistManager
 */ 
let PersistManager = new Class().extends(Component);
PersistManager.definition = {

  get id()
    "persist-manager",

  "[persistable] profile_directory": "$Home/.tanasinn/profile",
  "[persistable] default_filename": "persist.js",

  "[subscribe('command/load-settings'), enabled]":
  function load(name)
  {
    try {
      let filename = this.default_filename;
      let profile_path = <>{this.profile_directory}/{filename}</>.toString();
      let content = coUtils.IO.readFromFile(profile_path, "utf-8");
      let data = eval(content);
      let session = this._broker;
      session.notify("command/before-load-persistable-data", data);
      session.notify("command/load-persistable-data", data);
    } catch (e) {
      coUtils.Debug.reportWarning(e);
    }
  },

  "[subscribe('command/save-settings'), enabled]":
  function save(data)
  {
    let filename = this.default_filename;
    let profile_path = <>{this.profile_directory}/{filename}</>.toString();
    let serialized_data = data.toSource();
    coUtils.IO.writeToFile(profile_path, serialized_data);
  },

  "[subscribe('command/get-settings'), enabled]":
  function get()
  {
    let data = {};
    let session = this._broker;
    session.notify("command/before-save-persistable-data", data);
    session.notify("command/save-persistable-data", data);
    return data;
  },

};

/**
 * @fn main
 * @brief Module entry point
 * @param {Desktop} process The Desktop object.
 */
function main(desktop) 
{
  desktop.subscribe(
    "@initialized/broker",
    function(session) 
    {
      new PersistManager(session);
    });
}



