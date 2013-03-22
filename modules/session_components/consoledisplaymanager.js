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


/*
 * @class DisplayManager
 * @brief Manages sisplay state for messages.
 */
var DisplayManager = new Class().extends(Plugin)
                                .depends("console");
DisplayManager.definition = {

  id: "displaymanager",

  /** plugin information */
  getInfo: function getInfo()
  {
    return {
      name: _("DisplayManager"),
      version: "0.1",
      description: _("Display console messages.")
    };
  },

  "[persistable] enabled_when_startup": true,

  /** @Property {Boolean} whether auto scroll feature is enabled.  */
  "[persistable] auto_scroll": true,

  _mode: "vt100",

  _filters: null,
  _console: null,

  /** Installs itself.
   *  @param {InstallContext} context A InstallContext object.
   */
  "[install]":
  function install(context)
  {
    this._console = context["console"];

    this.onConsoleFilterCollectionChanged();
  },

  /** Uninstalls itself
   */
  "[uninstall]":
  function uninstall()
  {
    this._console = null;
  },

  "[subscribe('event/console-filter-collection-changed'), pnp]":
  function onConsoleFilterCollectionChanged()
  {
    this._filters = this.sendMessage("get/message-filters");
  },

  /** Appends a message line to output container.
   *  @param {String} message raw message text from console service.
   */
  append: function append(message)
  {
    var template = this.applyFilters(message);

    this.request("command/construct-chrome", template);

    // makes scrollbar follow page's height.
    if (this.auto_scroll && this._console) {
      this._console.scrollToBottom();
    }
  },

  /** apply filters and convert a message to ui template.
   * @param {String} message raw message string from console service.
   */
  applyFilters: function applyFilters(message)
  {
    var filter;

    if (this._filters) {
      for ([, filter] in Iterator(this._filters)) {
        if (filter.test(message)) {
          return filter.action();
        }
      };
    }

    // returns fallback template.
    return {
      parentNode: "#console_output_box",
      tagName: "row",
      style: {
        borderBottom: "1px solid green",
      },
      childNodes: [
        { tagName: "label", value: "" },
        { tagName: "label", value: "" },
        { tagName: "label", value: message }
      ]
    };
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


}; // DisplayManager

/**
 * @fn main
 * @brief Module entry point.
 * @param {Broker} broker The Broker object.
 */
function main(broker)
{
  new DisplayManager(broker);
}

// EOF
