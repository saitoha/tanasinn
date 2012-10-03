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
 * @class Splitter
 */
var Splitter = new Class().extends(Plugin)
                          .depends("screen")
                          .depends("renderer")
                          .depends("bottompanel")
                          ;
Splitter.definition = {

  id: "splitter",

  getInfo: function getInfo()
  {
    return {
      name: _("Splitter"),
      version: "0.1",
      description: _("Make it enable to change the height of bottom-panel ",
                     "by dragging horizontal bar like interface.")
    };
  },

  getTemplate: function getTemplate()
  {
    return {
      tagName: "vbox",
      id: "tanasinn_splitter",
      height: 16,
      style: {
        MozAppearance: "none",
        cursor: "ns-resize",
        background: "transparent",
      },
      listener: {
        type: "dragstart", 
        context: this,
        handler: this.ondragstart,
      }
    };
  },

  "[persistable] enabled_when_startup": true,

  _renderer: null,
  _screen: null,
  _bottompanel: null,

  /** Installs itself. 
   *  @param {InstallContext} context A InstallContext object.
   */
  "[install]":
  function install(context) 
  {
    var bottompanel = context["bottompanel"],
        tanasinn_splitter = this.request(
          "command/construct-chrome",
          this.getTemplate()).tanasinn_splitter,
        tabbox_element = bottompanel.getElement();

    this._renderer = context["renderer"];
    this._screen = context["screen"];
    this._bottompanel = context["bottompanel"];

    // create splitter element.
    tabbox_element.parentNode.insertBefore(tanasinn_splitter, tabbox_element);

    this._splitter = tanasinn_splitter;
  },

  /** Unnstalls itself.
   */
  "[uninstall]":
  function uninstall() 
  {
    // remove splitter element
    if (null !== this._splitter) {
      this._splitter.parentNode.removeChild(this._splitter);
      this._splitter = null;
    }

    this._renderer = null;
    this._screen = null;
    this._bottompanel = null;
  },

  /** Makes splitter bar behave as vertical resizebar.
   * As closing panel, center-screen's height is expanded/shrinked
   * as mach as delta of bottom panel height.
   *
   *   +---------------+              +---------------+
   *   |               |              | center screen |
   *   | center screen |              |               |
   *   |               | splitter  -> +---------------+     
   *   +---------------+ can slids    |               |     total
   *   |               | vertically.  | bottom panel  |     height
   *   | bottom panel  |              |               |     is not
   *   +---------------+              +---------------+ <-- changed.
   */
  ondragstart: function ondragstart(event) 
  {
    var dom = {
          document: this.request("get/root-element").ownerDocument,
        },
        renderer = this._renderer,
        screen = this._screen,
        bottompanel = this._bottompanel,
        initial_height = bottompanel.panelHeight,
        initial_row = screen.height,
        line_height = renderer.line_height,
        y = event.screenY;

    dom.document.documentElement.style.cursor = "row-resize";

    this.sendMessage("event/resize-session-started");
    this.sendMessage("command/add-domlistener", {
      target: dom.document,
      type: "mousemove",
      id: "_DRAGGING",
      context: this,
      handler: function onmousemove(event) 
      {
        var diff, row;

        diff = event.screenY - y;
        row = initial_row + Math.round(diff / line_height);
        screen.height = row;
        diff = (row - initial_row) * line_height;
        if (initial_height - diff < 0) {
          bottompanel.close();
          bottompanel.panelHeight = initial_height;
        } else {
          bottompanel.panelHeight = initial_height - diff;
        }
      },
    });
    this.sendMessage(
      "command/add-domlistener",
      {
        target: dom.document,
        type: "mouseup", 
        id: "_DRAGGING",
        context: this,
        handler: function onmouseup() 
        {
          dom.document.documentElement.style.cursor = "",
          this.sendMessage("command/remove-domlistener", "_DRAGGING");
          if (screen.height === initial_row) {
            return;
          }
          this.sendMessage("event/resize-session-closed");
        }
      });
  }
} // class Splitter


/**
 * @fn main
 * @brief Module entry point.
 * @param {Broker} broker The Broker object.
 */
function main(broker) 
{
  new Splitter(broker);
}

// EOF
