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
var FocusTracker = new Class().extends(Plugin);
FocusTracker.definition = {

  id: "focustracker",

  getInfo: function getInfo()
  {
    return {
      name: _("Focus"),
      version: "0.1",
      description: _("Enable focus management.")
    };
  },

  "[persistable] enabled_when_startup": true,
  
  disabled: false,

  /** Installs itself. 
   *  @param {Broker} broker A broker object.
   */
  "[install]": 
  function install(broker)
  {
    this.sendMessage("command/add-domlistener", {
      target: this.request("get/root-element").ownerDocument,
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
    this.sendMessage("command/remove-domlistener", this.id)
  },

  /** Fires when a focus event occured. 
   *  @param {Event} event A event object.
   */
  onfocus: function onfocus(event)
  {
    var dom = {
        root_element: this.request("get/root-element"),
      },
      target = event.explicitOriginalTarget,
      focused_element,
      relation;

    if (null === target) {
      return;
    }

    if (!("nodeType" in target) || target.NODE_DOCUMENT !== target.nodeType) {
      target = target.parentNode;
      if (null !== target && undefined !== target
          && target.nodeType != target.NODE_DOCUMENT) {
        relation = dom.root_element.compareDocumentPosition(target);
        if ((relation & dom.root_element.DOCUMENT_POSITION_CONTAINED_BY)) {
          if (!this.disabled) {
            this.disabled = true;
            //if (!/tanasinn/.test(coUtils.Runtime.app_name)) {
              dom.root_element.parentNode.appendChild(dom.root_element);
            //}
            coUtils.Timer.setTimeout(
              function timerProc()
              {
                this.disabled = false;
              }, 0, this);
            return;
          }
          focused_element = dom.root_element.ownerDocument.commandDispatcher.focusedElement;
          this.sendMessage("event/got-focus");
          this.sendMessage("event/focus-changed", focused_element);
        }
        else {
          this.sendMessage("event/lost-focus");
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

// EOF
