/* -*- Mode: JAVASCRIPT; tab-width: 2; indent-tabs-mode: nil; c-basic-offset: 2 -*-
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
 * Portions created by the Initial Developer are Copyright (C) 2010 - 2013
 * the Initial Developer. All Rights Reserved.
 *
 * ***** END LICENSE BLOCK ***** */

"use strict";


/**
 * @class MessageFilter
 */
var MessageFilter = new Class().extends(Plugin);
MessageFilter.definition = {

  id: "messagefilter",

  /** plugin information */
  getInfo: function getInfo()
  {
    return {
      name: _("Message Filter"),
      version: "0.1",
      description: _("Receives raw console messages and formats them.")
    };
  },

  filter_expression:
    /^\[(.+?): "(tanasinn: )?([^"]*?)" {file: "([^"]*?)" line: ([0-9]+?)( name: "([^"]*?)")?}\]$/m,

  "[persistable] enabled_when_startup": true,
  "[persistable] show_alert_message": false,

  /** Installs itself.
   *  @param {InstallContext} context A InstallContext object.
   */
  "[install]":
  function install(context)
  {
    this.sendMessage("event/console-filter-collection-changed");
  },

  /** Uninstalls itself.
   */
  "[uninstall]":
  function uninstall()
  {
    this.sendMessage("event/console-filter-collection-changed");
  },

  "[subscribe('get/message-filters'), pnp]":
  function onMessageFiltersRequired(filters)
  {
    return this;
  },

  test: function test(logtext)
  {
    this.logtext = logtext;
    this.match = logtext.match(this.filter_expression);
    return null !== this.match;
  },

  action: function action()
  {
    var logtext = this.logtext,
        match = this.match,
        category = match[1],
        message = match[3],
        file = match[4],
        line = match[5],
        class_string = this._getClassString(category),
        title,
        text;

    file = file.split("/").pop().split("?").shift();

    if ("tanasinn-console-error" === class_string) {
      title = category;
      text = file + ":" + line + " " + message;

      if (this.show_alert_message) {
        this.sendMessage(
          "command/show-popup-alert",
          {
            title: title,
            text: text,
          });
      }
    }
    return {
      parentNode: "#console_output_box",
      tagName: "row",
      className: "tanasinn-console-line " + class_string,
      style: {
        backgroundColor: {
          "JavaScript Error"  : "lightpink",
          "JavaScript Warning": "lightyellow",
          "JavaScript Message": "lightblue",
        }[category] || "",
        borderBottom: "1px solid green",
      },
      childNodes: [
        {
          tagName: "label",
          crop: "start",
          width: 100,
          value: file + " ",
          style: "color: red; width: 4em;",
        },
        {
          tagName: "label",
          value: "line: " + line,
          style: "padding: 0px 4px",
        },
        {
          tagName: "label",
          value: message,
        },
      ]
    };
  },

  /** Returns className string which corresponds to specified message category
   *  string.
   *  @param {String} category A message category string.
   */
  _getClassString: function(category)
  {
    var result;

    result = {
      "JavaScript Error"  : "tanasinn-console-error",
      "JavaScript Warning": "tanasinn-console-warning",
      "JavaScript Message": "tanasinn-console-message",
      "Native Message"    : "tanasinn-console-native",
    } [category]         || "tanasinn-console-unknown";
    return result;
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


}; // MessageFilter

/**
 * @fn main
 * @brief Module entry point.
 * @param {Broker} broker The Broker object.
 */
function main(broker)
{
  new MessageFilter(broker);
}

// EOF
