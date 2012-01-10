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
 * @class FocusTracker
 */
let FocusTracker = new Class().extends(Plugin);
FocusTracker.definition = {

  get id()
    "focustracker",

  get info()
    <plugin>
        <name>{_("Focus")}</name>
        <description>{
          _("Enable focus management.")
        }</description>
        <version>0.1</version>
    </plugin>,

  /** post-constructor 
   *  @param {Session} session A session object.
   */
  "[subscribe('event/session-started'), enabled]": 
  function onLoad(session) 
  {
    this._command_dispatcher = session.document.commandDispatcher;
    this._window = session.window;
    this.enabled = this.enabled_when_startup;
  },

  /** Installs itself. 
   *  @param {Session} session A session object.
   */
  install: function install(session)
  {
    session.post("command/add-domlistener", {
      target: session.window,
      type: "focus",
      context: this,
      handler: this.onfocus,
      capture: true,
      id: this.id,
    });
  },

  /** Uninstalls itself. 
   *  @param {Session} session A session object.
   */
  uninstall: function uninstall(session)
  {
    session.notify("command/remove-domlistener", this.id)
  },

  disabled: false,

  /** Fires when a focus event occured. 
   *  @param {Event} event A event object.
   */
  onfocus: function onfocus(event)
  {
    let command_dispatcher = this._command_dispatcher;
    let session = this._broker;
    let root_element = session.root_element;
    let target = event.explicitOriginalTarget;
    if (null !== target && target.nodeType != target.NODE_DOCUMENT) {
      target = target.parentNode;
      if (null !== target && target.nodeType != target.NODE_DOCUMENT) {
        let relation = root_element.compareDocumentPosition(target);
//        coUtils.Debug.reportMessage("focus-relation: " + relation);
        if ((relation & root_element.DOCUMENT_POSITION_CONTAINED_BY)) {
//         || (relation & root_element.DOCUMENT_POSITION_IMPLEMENTATION_SPECIFIC)) {
          if (!this.disabled) {
            this.disabled = true;
            session.root_element.parentNode.appendChild(session.root_element);
            coUtils.Timer.setTimeout(function() {
              this.disabled = false;
            }, 0, this);
            return;
          }
          let focused_element = command_dispatcher.focusedElement;
          session.notify("event/got-focus");
          session.notify("event/focus-changed", focused_element);
        }
        else {
          session.notify("event/lost-focus");
        }
      }
    }
  },
};

/**
 * @fn main
 * @brief Module entry point.
 * @param {Desktop} desktop The Desktop object.
 */
function main(desktop)
{
  desktop.subscribe(
    "initialized/session", 
    function(session) new FocusTracker(session));
}



