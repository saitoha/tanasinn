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
var SessionsCompleter = new Class().extends(Component)
                                   .depends("process_manager");
SessionsCompleter.definition = {

  id: "sessions-completer",

  "[subscribe('get/completer/sessions'), enabled]":
  function onCompletersRequested(broker)
  {
    return this;
  },
 
  _generateAvailableSession: function _generateAvailableSession()
  {
    var records,
        request_id,
        record;

    coUtils.Sessions.load();
    records = coUtils.Sessions.getRecords();

    for ([request_id, record] in Iterator(records)) {
      try {
        if (this.dependency["process_manager"].processIsAvailable(record.pid)) {
          yield {
            name: "&" + request_id,
            value: record,
          };
        } else {
          coUtils.Sessions.remove(this._broker, request_id);
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
