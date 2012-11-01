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


/** 
 * @class SessionsCompleter
 */
var SessionsCompleter = new Class().extends(Plugin)
                                   .depends("process_manager");
SessionsCompleter.definition = {

  id: "sessions-completer",

  getInfo: function getInfo()
  {
    return {
      name: _("Launcher Session Completion Provider"),
      version: "0.1",
      description: _("Provides session completion information for launcher.")
    };
  },

  "[persistable, watchable] enabled_when_startup": true,

  _process_manager: null,

  /** Installs itself. 
   *  @param {InstallContext} context A InstallContext object.
   */
  "[install]":
  function install(context)
  {
    this._process_manager = context["process_manager"];
  },

  /** Uninstalls itself. 
   *  @param {InstallContext} context A InstallContext object.
   */
  "[uninstall]":
  function uninstall(context)
  {
    this._process_manager = null;
  },

  "[subscribe('get/completer/sessions'), pnp]":
  function onCompletersRequested(broker)
  {
    return this;
  },
 
  _getImageSource: function _getImageSource(request_id)
  {
    try {
      var image_path = this._broker.runtime_path 
                     + "/persist/" + request_id + ".png",
          image_file = coUtils.File.getFileLeafFromVirtualPath(image_path),
          image_url;
      //alert(this._broker.runtime_path + "/persist/" + request_id + ".png" + "\n" + image_file.path);
      //if (image_file.exists()) {
        image_url = coUtils.File.getURLSpec(image_file);
        return image_url;
     // }
    } catch (e) {
      coUtils.Debug.reportError(e);
    }

    return null; // TODO: return url for "no image".
  },

  _generateAvailableSession: function _generateAvailableSession()
  {
    var records,
        request_id,
        record,
        image_path;

    coUtils.Sessions.load();
    records = coUtils.Sessions.getRecords();
    for ([request_id, record] in Iterator(records)) {
      try {
        image_path = this._getImageSource(request_id);
        //alert(request_id + "\n" + image_path)
        if (image_path) {
          if (this._process_manager.processIsAvailable(record.pid)) {
            //alert(image_path)
            yield {
              name: "&" + request_id,
              value: record,
              image: image_path,
            };
          } else {
            coUtils.Sessions.remove(this._broker, request_id);
          } 
        } else {
          //coUtils.Sessions.remove(this._broker, request_id);
        }
      } catch (e) {
        coUtils.Debug.reportError(e);
      }
    }
    coUtils.Sessions.update();
  },

  /*
   * Search for a given string and notify a listener (either synchronously
   * or asynchronously) of the result
   *
   * @param source - The string to search for
   * @param listener - A listener to notify when the search is complete
   */
  startSearch: function startSearch(source, listener)
  {
    var candidates = [candidate for (candidate in this._generateAvailableSession())],
        lower_source = source.toLowerCase(),
        data = candidates.filter(
          function(data)
          {
            return -1 !== data.name.toLowerCase().indexOf(lower_source);
          }),
        autocomplete_result;

    if (0 === data.length) {
      listener.doCompletion(null);
      return -1;
    }

    autocomplete_result = {
      type: "sessions",
      query: source, 
      labels: data.map(
                function(data)
                {
                  return data.name;
                }),
      comments: data.map(
                function(data)
                {
                  return data.value;
                }),
      data: data,
    };
    listener.doCompletion(autocomplete_result);
    return 0;
  },

};


/**
 * @fn main
 * @brief Module entry point
 * @param {Desktop} desktop The Desktop object.
 */
function main(desktop) 
{
  new SessionsCompleter(desktop);
}

// EOF
