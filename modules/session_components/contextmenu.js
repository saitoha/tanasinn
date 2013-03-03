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
 * @class Contextmenu
 */
var Contextmenu = new Class().extends(Plugin);
Contextmenu.definition = {

  id: "contextmenu",

  getInfo: function getInfo()
  {
    return {
      name: _("Context Menu"),
      version: "0.1",
      description: _("Provides context menu interface which ",
                     "emerges when we right-clicks the screen.")
    };
  },

  getTemplate: function getTemplate()
    ({
      tagName: "menupopup",
      parentNode: "#tanasinn_center_area",
      id: "tanasinn_contextmenu",
      childNodes: this._entries,
      listener: {
        type: "popuphidden",
        context: this,
        handler: this.onpopuphidden,
      } ,
    }),

  "[persistable] enabled_when_startup": true,

  "[persistable, watchable] handle_right_click_insted_of_oncontextmenu": true,

  _entries: null,

  /** Installs itself.
   *  @param {InstallContext} context A InstallContext object.
   */
  "[install]":
  function install(context)
  {
    // register DOM listener.
    this.onFlagChanged(this.handle_right_click_insted_of_oncontextmenu);
  },

  /** Uninstalls itself.
   */
  "[uninstall]":
  function uninstall()
  {
    // unregister DOM listener.
    this.onRightClick.enabled = false;
  },

  "[subscribe('variable-changed/contextmenu.handle_right_click_insted_of_oncontextmenu'), pnp]":
  function onFlagChanged(value)
  {
    this.onRightClick.enabled = value;
  },

  /** detect right click */
  "[listen('mouseup', '#tanasinn_content')]":
  function onRightClick(event)
  {
    if (2 === event.button) { // right click
      this.show(event);
    }
  },

  /** "popuphidden" event handler */
  onpopuphidden: function onpopuphidden(event)
  {
    var target = event.explicitOriginalTarget;

    if ("tanasinn_contextmenu" === target.id) {
      this.sendMessage("command/focus");
      target.parentNode.removeChild(target);
    }
  },

  /** "contextmenu" (right click or ctrl + click) event handler */
  "[listen('contextmenu', '#tanasinn_content'), pnp]":
  function oncontextmenu(event)
  {
    // suppress default action (hide default contextmenu)
    event.stopPropagation();
    event.preventDefault();

    if (!this.handle_right_click_insted_of_oncontextmenu) {
      this.show(event);
    }
  },

  /** show contextmenu */
  show: function show(event)
  {
    // get contextmenu entries
    var entries = this.sendMessage("get/contextmenu-entries")
      .filter(
        function filterFunc(entry)
        {
          return entry;
        }),
        template;

    if (0 === entries.length) {
      return;
    }

    template = this.getTemplate();
    template.childNodes = entries; // appendChild

    // construct them
    this.request("command/construct-chrome", template)
      .tanasinn_contextmenu
      .openPopupAtScreen(event.screenX, event.screenY, true);
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


}; // Contextmenu

/**
 * @fn main
 * @brief Module entry point.
 * @param {Broker} broker The Broker object.
 */
function main(broker)
{
  new Contextmenu(broker);
}

// EOF
