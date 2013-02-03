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

  id: "launcher-dragmove",

  "[persistable] enabled_when_startup": true,

  /** Installs itself.
   *  @param {InstallContext} context A InstallContext object.
   */
  "[install]":
  function install(context)
  {
    var result = this.request(
      "command/construct-chrome",
      {
        parentNode: "#tanasinn_launcher_layer",
        tagName: "box",
        id: "tanasinn_drag_cover",
        hidden: true,
        style: {
          position: "absolute",
          left: "-100px",
          top: "-200px",
          width: "800px",
          height: "400px",
          padding: "100px",
        },
      });

    this._drag_cover = result.tanasinn_drag_cover;
  },

  /** Uninstalls itself.
   */
  "[uninstall]":
  function uninstall()
  {
    this._drag_cover.parentNode.removeChild(this._drag_cover);
  },

  "[listen('mousemove')]":
  function onmousemove(event)
  {
    var left = event.clientX - this._offsetX,
        top = event.clientY - this._offsetY;

    this.sendMessage("command/move-to", [left, top]);
  },

  "[listen('mouseup')]":
  function onmouseup(event)
  {
    // uninstall listeners.
    this.onmousemove.enabled = false;
    this.onmouseup.enabled = false;
    this.onkeyup.enabled = false;
    this.sendMessage("command/set-opacity", 1.00);
    this._drag_cover.hidden = true;
  },

  "[listen('keyup')]":
  function onkeyup(event)
  {
    if (!event.shiftKey) {
      // uninstall listeners.
      this.onmousemove.enabled = false;
      this.onmouseup.enabled = false;
      this.onkeyup.enabled = false;
      this.sendMessage("command/set-opacity", 1.00);
    }
  },

  "[listen('dragstart', '#tanasinn_launcher_layer', true), pnp]":
  function ondragstart(dom_event)
  {
    dom_event.stopPropagation();

    // get relative coodinates on target element.
    this._offsetX = dom_event.clientX - dom_event.target.boxObject.x;
    this._offsetY = dom_event.clientY - dom_event.target.boxObject.y;

    this._drag_cover.hidden = false;

    this.sendMessage("command/set-opacity", 0.30);

    this.onmousemove.enabled = true;
    this.onmouseup.enabled = true;
    this.onkeyup.enabled = true;

  },
};


/**
 * @fn main
 * @brief Module entry point
 * @param {Desktop} desktop The Desktop object.
 */
function main(desktop)
{
  new DragMove(desktop);
}

// EOF
