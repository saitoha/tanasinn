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

  _disabled: false,

  /** Installs itself.
   *  @param {InstallContext} context A InstallContext object.
   */
  "[install]":
  function install(context)
  {
  },

  /** Uninstalls itself.
   */
  "[uninstall]":
  function uninstall()
  {
  },

  "[subscribe('command/enable-focus-events'), pnp]":
  function enableFocusEvents()
  {
    this._disabled = false;
  },

  "[subscribe('command/disable-focus-events'), pnp]":
  function disableFocusEvents()
  {
    this._disabled = true;
  },

  _onblurimpl: function _onblurimpl(dom)
  {
    var focused_element,
        relation;

    if (null === dom.target) {
      return;
    }
    if (undefined === dom.target) {
      return;
    }
    if (dom.target.nodeType === dom.target.NODE_DOCUMENT) {
      return;
    }

    relation = dom.root_element.compareDocumentPosition(dom.target);
    if ((relation & dom.root_element.DOCUMENT_POSITION_CONTAINED_BY)) {
      this.sendMessage("event/lost-focus");
    }
  },

  _onfocusimpl: function _onfocusimpl(dom)
  {
    var focused_element,
        relation;

    if (null === dom.target) {
      return;
    }
    if (undefined === dom.target) {
      return;
    }
    if (dom.target.nodeType === dom.target.NODE_DOCUMENT) {
      return;
    }

    relation = dom.root_element.compareDocumentPosition(dom.target);
    if ((relation & dom.root_element.DOCUMENT_POSITION_CONTAINED_BY)) {
      this._disabled = true;
      dom.root_element.parentNode.appendChild(dom.root_element);
      coUtils.Timer.setTimeout(
        function timerProc()
        {
          this._disabled = false;
        }, 30, this);
      focused_element = dom.root_element.ownerDocument.commandDispatcher.focusedElement;
      this.sendMessage("event/got-focus");
      this.sendMessage("event/focus-changed", focused_element);
    } else {
      this.sendMessage("event/lost-focus");
    }
  },

  /** Fires when a blur event occured.
   *  @param {Event} event A event object.
   */
  "[listen('blur', null, true), pnp]":
  function onblur(event)
  {
    var dom = {
        root_element: this.request("get/root-element"),
        target: event.explicitOriginalTarget,
      };

    if (null === dom.target) {
      return;
    }

    if (this._disabled) {
      return;
    }

    if (!("nodeType" in dom.target)
        || dom.target.NODE_DOCUMENT !== dom.target.nodeType) {
      dom.target = dom.target.parentNode;
      this._onblurimpl(dom);
    }
  },

  /** Fires when a focus event occured.
   *  @param {Event} event A event object.
   */

  "[listen('focus', null, true), pnp]":
  function onfocus(event)
  {
    var dom = {
        root_element: this.request("get/root-element"),
        target: event.explicitOriginalTarget,
      };

    if (null === dom.target) {
      return;
    }

    if (this._disabled) {
      return;
    }

    if (!("nodeType" in dom.target)
        || dom.target.NODE_DOCUMENT !== dom.target.nodeType) {
      dom.target = dom.target.parentNode;
      this._onfocusimpl(dom);
    }
  },

  /** test */
  "[test]":
  function()
  {
    var enabled = this.enabled;

    try {
      this.enabled = false;
      this.enabled = true;
      this.enabled = false;
    } finally {
      this.enabled = enabled;
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
