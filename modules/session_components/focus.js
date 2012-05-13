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
        <version>0.1</version>
        <description>{
          _("Enable focus management.")
        }</description>
    </plugin>,

  "[persistable] enabled_when_startup": true,
  
  disabled: false,

  /** Installs itself. 
   *  @param {Broker} broker A broker object.
   */
  "[install]": 
  function install(broker)
  {
    broker.notify("command/add-domlistener", {
      target: broker.window.document,
      type: "focus",
      context: this,
      handler: this.onfocus,
      capture: true,
      id: this.id,
    });
  },

  /** Uninstalls itself. 
   *  @param {Broker} broker A broker object.
   */
  "[uninstall]":
  function uninstall(broker)
  {
    broker.notify("command/remove-domlistener", this.id)
  },

  /** Fires when a focus event occured. 
   *  @param {Event} event A event object.
   */
  onfocus: function onfocus(event)
  {
    let broker = this._broker;
    let command_dispatcher = broker.document.commandDispatcher;
    let root_element = broker.root_element;
    let target = event.explicitOriginalTarget;
    if (null !== target && 
        (!("nodeType" in target) || target.nodeType != target.NODE_DOCUMENT)) {
      target = target.parentNode;
      if (null !== target && undefined !== target
          && target.nodeType != target.NODE_DOCUMENT) {
        let relation = root_element.compareDocumentPosition(target);
//        coUtils.Debug.reportMessage("focus-relation: " + relation);
        if ((relation & root_element.DOCUMENT_POSITION_CONTAINED_BY)) {
//         || (relation & root_element.DOCUMENT_POSITION_IMPLEMENTATION_SPECIFIC)) {
          if (!this.disabled) {
            this.disabled = true;
            if (!/tanasinn/.test(coUtils.Runtime.app_name)) {
              broker.root_element.parentNode.appendChild(broker.root_element);
            }
            coUtils.Timer.setTimeout(function() {
              this.disabled = false;
            }, 0, this);
            return;
          }
          let focused_element = command_dispatcher.focusedElement;
          broker.notify("event/got-focus");
          broker.notify("event/focus-changed", focused_element);
        }
        else {
          broker.notify("event/lost-focus");
        }
      }
    }
  },
};

/**
 * @fn main
 * @brief Module entry point.
 * @param {Broker} broker The Broker object.
 */
function main(broker)
{
  new FocusTracker(broker);
}

