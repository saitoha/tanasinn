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
 * @class DragMove
 * @fn Enable Drag-and-Drop operation.
 */

var DragMove = new Class().extends(Plugin);
DragMove.definition = {

  id: "dragmove",

  getInfo: function getInfo()
  {
    return {
      name: _("Drag Move"),
      version: "0.1",
      description: _("Enable you to drag window title bar and move it.")
    };
  },

  "[persistable] enabled_when_startup": true,

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

  "[listen('dragstart', '#tanasinn_chrome'), pnp]":
  function ondragstart(dom_event)
  {
    var root_element,
        offsetY,
        offsetX,
        dom_document,
        content,
        relation;

    if (dom_event.ctrlKey) {
      return;
    }

    if (dom_event.altKey) {
      return;
    }

    root_element = this.request("get/root-element");

    offsetY = dom_event.screenY - root_element.boxObject.y;

    if (!dom_event.shiftKey) {
      content = root_element.querySelector("#tanasinn_titlebar_area");
      relation = content.compareDocumentPosition(dom_event.explicitOriginalTarget);
      if (!(relation & content.DOCUMENT_POSITION_CONTAINED_BY)) {
        return;
      }
    }

    offsetX = dom_event.screenX - root_element.boxObject.x;

    dom_event.stopPropagation();

    // get relative coodinates on target element.
    this.sendMessage("command/set-opacity", 0.30);
    // define mousemove hanler.
    dom_document = dom_event.target.ownerDocument; // managed by DOM
    this.sendMessage(
      "command/add-domlistener",
      {
        target: dom_document,
        type: "mousemove",
        id: "_DRAGGING",
        context: this,
        handler: function onmouseup(event)
        {
          var left, top;

          left = event.screenX - offsetX;
          top = event.screenY - offsetY;
          this.sendMessage("command/move-to", [left, top]);
        }
      });
    this.sendMessage(
      "command/add-domlistener",
      {
        target: dom_document,
        type: "mouseup",
        id: "_DRAGGING",
        context: this,
        handler: function onmouseup(event)
        {
          // uninstall listeners.
          this.sendMessage("command/remove-domlistener", "_DRAGGING");
          this.sendMessage("command/set-opacity", 1.00);
        },
      });
    this.sendMessage(
      "command/add-domlistener",
      {
        target: dom_document,
        type: "keyup",
        id: "_DRAGGING",
        context: this,
        handler: function onkeyup(event)
        {
          if (!event.shiftKey) {
            // uninstall listeners.
            this.sendMessage("command/remove-domlistener", "_DRAGGING");
            this.sendMessage("command/set-opacity", 1.00);
          }
        },
      });

    dom_event = null;
    dom_document = null;
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
  new DragMove(broker);
}

// EOF
