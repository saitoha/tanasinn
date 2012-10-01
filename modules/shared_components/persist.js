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

"use strict";

var impl = {

  get_profile_path: function get_profile_path(broker, name)
  {
    var runtime_path = broker.runtime_path,
        profile_directory = broker.profile_directory,
        filename = (name || broker.profile) + ".js",
        profile_path = runtime_path + "/" + profile_directory + "/" + filename;
  
    return profile_path;
  },

}; // impl

/**
 * @class PersistManager
 */ 
var PersistManager = new Class().extends(Component);
PersistManager.definition = {

  id: "persist_manager",

  "[subscribe('command/load-settings'), enabled]":
  function load(name)
  {
    var broker = this._broker,
        profile_path = impl.get_profile_path(broker, name),
        data;

    try {

      if (!coUtils.File.exists(profile_path)) {
        return;
      }

      data = JSON.parse(coUtils.IO.readFromFile(profile_path, "utf-8"));

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
    var broker = this._broker,
        data = {},
        profile_path = impl.get_profile_path(broker, name),
        serialized_data;

    if ("__persist" in broker) {
      broker.__persist(data);
    }
    this.sendMessage("command/before-save-persistable-data", data);
    this.sendMessage("command/save-persistable-data", data);

    serialized_data = JSON.stringify(data);
    coUtils.IO.writeToFile(profile_path, serialized_data);
  },

  "[subscribe('command/delete-settings'), enabled]":
  function deleteSettings(name)
  {
    var broker = this._broker,
        profile_path = impl.get_profile_path(broker, name)
        file = coUtils.File.getFileLeafFromVirtualPath(profile_path);

    if (file.exists()) {
      file.remove(true);
    }
  },

  "[subscribe('command/get-settings'), enabled]":
  function get()
  {
    var broker = this._broker,
        data = {};

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

// EOF
