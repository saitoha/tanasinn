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
 * @class domEventManager
 * @brief A thin wrapper of Element.addEventListener / Element.removeEventListener.
 *
 * It provides some additional feature as follows:
 *  - ID-based registration / unregistration
 *    we need not manage/retain references of event handler.
 *  - Setting context object
 *    we need not memorize "this".
 *  - Auto error handling and reporting.
 */
let DOMEventManager = new Class().extends(Component);
DOMEventManager.definition = {

  get id()
    "domeventmanager",

  _listener_list_map: null,

  /** constructor */
  initialize: function initialize(broker) 
  {
    this._listener_list_map = {};
    broker.notify("initialized/domeventmanager", this);
  },

  /** A thin wrapper function of Element.addEventListener. 
   * @param listener {coIDOMEventListener} A listener object implements following interface.
   *
   * interface coIDOMEventListener {
   *
   *   // target element.
   *   property nsIDOMEventTarget target;
   *
   *   // event type.
   *   property string type;
   *   
   *   // ID string for registration.
   *   property string id;
   *   
   *   // use capture?
   *   property bool capture;
   *
   *   // an activation context object in handler.
   *   property object context;
   *
   *   // handler function, passed evnet object as an argument.
   *   property nsIDOMEventListener handler; 
   *
   * };
   */
  "[subscribe('command/add-domlistener'), enabled]":
  function add(listener) 
  {
    let broker = this._broker;
    let target = listener.target;
    if ("string" == typeof target) {
//      target = borker.uniget("command/query-selector", target);
      target = broker.root_element.querySelector(target);
      if (!target) {
        throw coUtils.Debug.Exception(
          _("Target element specified by given id is Not Found: %s."), 
          target);
      }
    }
    let type = listener.type;
    let capture = !!listener.capture;
    let context = listener.context || target;
    let handler = listener.handler;
    if (target && type && handler) { // validate listener object.
      let delegate = function() {
        try {
          handler.apply(context, arguments);
        } catch (e) {
          coUtils.Debug.reportError(e);
        }
      };
      target.addEventListener(type, delegate, capture); 
      let id = listener.id;
      if (id) {
        let list = this._listener_list_map[id];
        if (!list)
          list = this._listener_list_map[id] = [];
        list.push(function() target.removeEventListener(type, delegate, capture));
//        coUtils.Debug.reportMessage(_("Registered DOM listener '%s'"), id);
      }
    } else {
      throw coUtils.Debug.Exception(
        _("Invalid argument was given. id: [%s], type: [%s]."), 
        listener.id, listener.type)
    }
  },

  /** A thin wrapper function of Element.eventEventListener. 
   * @param string id ID string for unregistration.
   */
  "[subscribe('command/remove-domlistener'), enabled]":
  function remove(id)
  {
    let list = this._listener_list_map[id];
    if (list) {
      list.forEach(function(action) action());
    } else {
      coUtils.Debug.reportWarning(
        _("Registered DOM listener specified by given ID '%s' is not found."), id);
    }
  }

} // class DOMEventManager


/**
 * @fn main
 * @brief Module entry point
 * @param {Process} process The Process object.
 */
function main(process) 
{
  process.subscribe(
    "initialized/broker",
    function(desktop)
    {
      new DOMEventManager(desktop);
      desktop.subscribe(
        "initialized/broker", 
        function(session)
        {
          new DOMEventManager(session);
        });
    });
}


