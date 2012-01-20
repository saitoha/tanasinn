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

  "[subscribe('command/load-settings'), enabled]":
  function load(name)
  {
    try {
      let broker = this._broker;
      let filename = (name || broker.profile) + ".js";
      let profile_path = <>{broker.profile_directory}/{filename}</>.toString();
      let content = coUtils.IO.readFromFile(profile_path, "utf-8");
      let data = eval(content);
      broker.notify("command/before-load-persistable-data", data);
      broker.notify("command/load-persistable-data", data);
    } catch (e) {
      coUtils.Debug.reportWarning(e);
    }
  },

  "[subscribe('command/save-settings'), enabled]":
  function save(info)
  {
    let broker = this._broker;
    let {name, data} = info;
    let filename = (name || broker.profile) + ".js";
    let profile_path = <>{broker.profile_directory}/{filename}</>.toString();
    let serialized_data = JSON.stringfy(data);
    coUtils.IO.writeToFile(profile_path, serialized_data);
  },

  "[subscribe('command/delete-settings'), enabled]":
  function deleteSettings(name)
  {
    let broker = this._broker;
    let filename = (name || broker.profile) + ".js";
    let profile_path = <>{broker.profile_directory}/{filename}</>.toString();
    let file = coUtils.File.getFileLeafFromAbstractPath(profile_path);
    if (file.exists()) {
      file.remove(true);
    }
  },

  "[subscribe('command/get-settings'), enabled]":
  function get()
  {
    let data = {};
    let broker = this._broker;
    broker.notify("command/before-save-persistable-data", data);
    broker.notify("command/save-persistable-data", data);
    return data;
  },

};

/**
 * @fn main
 * @brief Module entry point
 * @param {Broker} broker parent broker object.
 */
function main(broker) 
{
  broker.subscribe(
    "@initialized/broker",
    function(broker) 
    {
      new PersistManager(broker);
    });
}



