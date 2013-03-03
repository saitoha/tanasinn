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
 *  @class KeySnail
 *  @brief apply some fixes for KeySnail-installed environment.
 */
var KeySnail = new Class().extends(Plugin);
KeySnail.definition = {

  id: "keysnail",

  getInfo: function getInfo()
  {
    return {
      name: _("KeySnail"),
      version: "0.1",
      description: _("Apply some fixes for keysnail-installed environment.")
    };
  },

  "[persistable] enabled_when_startup": true,

  /** Installs itself.
   *  @param {InstallContext} context A InstallContext object.
   */
  "[install]":
  function install(context)
  {
    this.onGotFocus();
  },

  /** Uninstall itself.
   */
  "[uninstall]":
  function uninstall()
  {
    this.onLostFocus();
  },

  /** install focus event. */
  "[subscribe('event/got-focus | command/focus'), pnp]":
  function onGotFocus()
  {
    var key;

    key = this._getKeyModule();
    if (!key) {
      return;
    }
    if (key.status) {
      key.toggleStatus();
    }
  },

  /** install blur evnet. */
  "[subscribe('event/lost-focus | command/blur'), pnp]":
  function onLostFocus()
  {
    var key;

    key = this._getKeyModule();
    if (!key) {
      return;
    }
    if (!key.status) {
      key.toggleStatus();
    }
  },

  /** Handles stop event. */
  "[subscribe('@event/broker-stopping'), enabled]":
  function onSessionStopping()
  {
    this.onLostFocus();
  },

  /** get "KeySnail.modules" */
  _getKeyModule: function _getKeyModule()
  {
    var keysnail = this.request("get/root-element")
          .ownerDocument
          .defaultView
          .KeySnail,
        modules,
        key;

    if (!keysnail) {
      return null;
    }

    modules = keysnail.modules;
    if (!modules) {
      return null;
    }

    key = modules.key;
    if (!key) {
      return null;
    }

    return key;
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


} // class


/**
 * @fn main
 * @brief Module entry point.
 * @param {Broker} broker The Broker object.
 */
function main(broker)
{
  new KeySnail(broker);
}

// EOF
