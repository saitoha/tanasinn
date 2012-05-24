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
    "persist_manager",

  "[subscribe('command/load-settings'), enabled]":
  function load(name)
  {
    var broker, filename, profile_path, content, data;

    try {
      broker = this._broker;
      filename = (name || broker.profile) + ".js";
      profile_path = broker.runtime_path 
        + "/" + broker.profile_directory 
        + "/" + filename;
      if (!coUtils.File.exists(profile_path)) {
        return;
      }

      content = coUtils.IO.readFromFile(profile_path, "utf-8");
      data = JSON.parse(content);
      if ("__load" in broker) {
        broker.__load(data);
      }
      this.sendMessage("command/before-load-persistable-data", data);
      this.sendMessage("command/load-persistable-data", data);
    } catch (e) {
      coUtils.Debug.reportWarning(e);
    }
  },

  "[subscribe('command/save-settings'), enabled]":
  function save(name)
  {
    var broker, data, filename, profile_path, serialized_data;

    broker = this._broker;
    data = {};
    if ("__persist" in broker) {
      broker.__persist(data);
    }
    this.sendMessage("command/before-save-persistable-data", data);
    this.sendMessage("command/save-persistable-data", data);
    filename = (name || broker.profile) + ".js";
    profile_path = broker.runtime_path 
      + "/" + broker.profile_directory 
      + "/" + filename;
    serialized_data = JSON.stringify(data);
    coUtils.IO.writeToFile(profile_path, serialized_data);
  },

  "[subscribe('command/delete-settings'), enabled]":
  function deleteSettings(name)
  {
    var broker, filename, profile_path, file;

    broker = this._broker;
    filename = (name || broker.profile) + ".js";
    profile_path = broker.runtime_path
      + "/" + broker.profile_directory
      + "/" + filename;
    file = coUtils.File.getFileLeafFromVirtualPath(profile_path);
    if (file.exists()) {
      file.remove(true);
    }
  },

  "[subscribe('command/get-settings'), enabled]":
  function get()
  {
    var data, broker;

    data = {};
    broker = this._broker;
    if ("__get" in broker) {
      broker.__get(data);
    }
    this.sendMessage("command/get-persistable-data", data);
    return data;
  },

}; // class PersistManager

/**
 * @fn main
 * @brief Module entry point
 * @param {Broker} broker parent broker object.
 */
function main(broker) 
{
  new PersistManager(broker);
}



