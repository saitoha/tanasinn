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
    let target;
    if (!listener.target) {
      this._addImpl(listener, broker.window.target);
    } else if ("string" == typeof listener.target) {
      let id = listener.target.substr(1);
      try {
        target = broker.uniget("get/element", id);
        //if (!target) {
        //  target = broker.root_element.querySelector(listener.target);
        //}
      } catch(e) {
        target = null;
      }
      if (target) {
        this._addImpl(listener, target);
      } else {
//          alert(listener.target)
        if ("#" == listener.target.charAt(0)) {
          broker.subscribe(
            <>@event/domnode-created/{id}</>, 
            function onNodeCreated(target_element) 
            {
              this._addImpl(listener, target_element);
            }, this);
        } else {
          throw coUtils.Debug.Exception(
            _("Target element specified by given id is Not Found: %s."), 
            listener.target);
        }
      }
    } else {
      this._addImpl(listener, listener.target);
    }
  },

  _addImpl: function _addImpl(listener, target)
  {
    let broker = this._broker;
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
        this._listener_list_map = this._listener_list_map || {};
        let list = this._listener_list_map[id];
        if (!list)
          list = this._listener_list_map[id] = [];
        list.push(function() {
          target.removeEventListener(type, delegate, capture);
          target = null;
        });
//        coUtils.Debug.reportMessage(_("Registered DOM listener '%s'"), id);
      }
      listener = null;
      broker = null;
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
    this._listener_list_map = this._listener_list_map || {};
    let list = this._listener_list_map[id];
    if (list) {
      list.forEach(function(action) action());
      delete this._listener_list_map[id];
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
function main(broker) 
{
  new DOMEventManager(broker);
}


