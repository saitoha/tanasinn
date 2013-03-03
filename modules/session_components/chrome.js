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
 * @class Chrome
 * @brief Manage a terminal UI and a session.
 */
var InnerChrome = new Class().extends(Plugin).depends("outerchrome");
InnerChrome.definition = {

  id: "chrome",

  getInfo: function getInfo()
  {
    return {
      name: _("Inner Chrome"),
      version: "0.1.0",
      description: _("Manages '#tanasinn_content' XUL element.")
    };
  },

  _getStyle: function _getStyle()
  {
    return "margin: " + this.margin + "px;" +
           "background: " + this.background + ";";
  },

  _getTemplate: function _getTemplate()
  {
    return [
      {
        parentNode: "#tanasinn_chrome",
        id: "tanasinn_titlebar_area",
        tagName: "box",
        dir: "ltr",
      },
      {
        parentNode: "#tanasinn_chrome",
        tagName: "stack",
        id: "tanasinn_content",
        dir: "ltr",
        childNodes: [
          {
            id: "tanasinn_center_area",
            tagName: "stack",
            style: this._getStyle(),
          },
        ],
      },
      {
        parentNode: "#tanasinn_chrome",
        id: "tanasinn_panel_area",
        tagName: "box",
        dir: "ltr",
      },
      {
        parentNode: "#tanasinn_chrome",
        id: "tanasinn_commandline_area",
        tagName: "vbox",
        dir: "ltr",
      },
    ];
  },

  "[persistable] enabled_when_startup": true,

  "[persistable, watchable] margin": 8,
  "[persistable, watchable] background": "transparent",
  "[persistable] inactive_opacity": 0.20,
  "[persistable] resize_opacity": 0.50,

  _element: null,

  /** Installs itself.
   *  @param {InstallContext} context A InstallContext object.
   */
  "[install]":
  function install(context)
  {
    var result = this.request("command/construct-chrome", this._getTemplate());

    this._element = result.tanasinn_content;
    this._center = result.tanasinn_center_area;
  },

  /** Uninstalls itself.
   */
  "[uninstall]":
  function uninstall()
  {
    if (this._element && this._element.parentNode) {
      this._element.parentNode.removeChild(this._element);
      this._element = null;
    }
    this._center = null;
  },

  "[subscribe('variable-changed/chrome.{margin | background}'), pnp]":
  function updateStyle()
  {
    this._center.style.cssText = this._getStyle();
  },

  "[subscribe('command/query-selector'), enabled]":
  function querySelector(selector)
  {
    var root_element = this.request("get/root-element");
    return root_element.querySelector(selector);
  },

  /** Fired when a resize session started. */
  "[subscribe('event/resize-session-started'), enabled]":
  function onResizeSessionStarted(subject)
  {
    this.sendMessage("command/set-opacity", this.resize_opacity);
  },

  /** Fired when a resize session closed. */
  "[subscribe('event/resize-session-closed'), enabled]":
  function onResizeSessionClosed()
  {
    this.sendMessage("command/set-opacity", 1.00);
  },

  /** An event handler which is fired when the keyboard focus is got.
   */
  "[subscribe('event/got-focus'), pnp]":
  function onGotFocus()
  {
    this.onmousedown.enabled = true;
    this.sendMessage("command/set-opacity", 1.00);
  },

  /** An event handler which is fired when the keyboard focus is lost.
   */
  "[subscribe('event/lost-focus'), pnp]":
  function onLostFocus()
  {
    this.onmousedown.enabled = true;
    this.sendMessage("command/set-opacity", this.inactive_opacity);
  },

  "[listen('mousedown', '#tanasinn_content')]":
  function onmousedown()
  {
    this.sendMessage("command/focus");
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

}; // Chrome

/**
 * @fn main
 * @brief Module entry point.
 * @param {Broker} Broker The Broker object.
 */
function main(broker)
{
  new InnerChrome(broker);
}

// EOF
