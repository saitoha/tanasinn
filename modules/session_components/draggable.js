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
 * @class DragMove
 * @fn Enable Drag-and-Drop operation.
 */

let DragMove = new Class().extends(Plugin).depends("chrome");
DragMove.definition = {

  get id()
    "dragmove",

  get info()
    <plugin>
        <name>{_("Drag Move")}</name>
        <description>{
          _("Enable you to drag window title bar and move it.")
        }</description>
        <version>0.1</version>
    </plugin>,

  /** Installs itself. */
  "[subscribe('install/dragcopy'), enabled]":
  function install(session) 
  {
    this.ondragstart.enabled = true;
  },

  /** Uninstalls itself. */
  "[subscribe('uninstall/dragcopy'), enabled]":
  function uninstall(session) 
  {
    this.ondragstart.enabled = false;
  },

  "[listen('dragstart', '#tanasinn_content', true)]":
  function ondragstart(dom_event) 
  {
    if (!dom_event.shiftKey) {
      return;
    }
    dom_event.stopPropagation();
    let session = this._broker;
    // get relative coodinates on target element.
    let offsetX = dom_event.screenX - session.root_element.boxObject.x; 
    let offsetY = dom_event.screenY - session.root_element.boxObject.y;
    session.notify("command/set-opacity", 0.30);
    // define mousemove hanler.
    let dom_document = dom_event.target.ownerDocument; // managed by DOM
    session.notify("command/add-domlistener", {
      target: dom_document, 
      type: "mousemove", 
      id: "_DRAGGING", 
      context: this,
      handler: function onmouseup(event) 
      {
        let left = event.screenX - offsetX;
        let top = event.screenY - offsetY;
        session.notify("command/move-to", [left, top]);
      }
    });
    session.notify("command/add-domlistener", {
      target: dom_document, 
      type: "mouseup", 
      id: "_DRAGGING",
      context: this,
      handler: function onmouseup(event) 
      {
        // uninstall listeners.
        session.notify("command/remove-domlistener", "_DRAGGING");
        session.notify("command/set-opacity", 1.00);
      }, 
    });
    session.notify("command/add-domlistener", {
      target: dom_document, 
      type: "keyup", 
      id: "_DRAGGING",
      context: this,
      handler: function onkeyup(event) 
      {
        if (!event.shiftKey) {
          // uninstall listeners.
          session.notify("command/remove-domlistener", "_DRAGGING");
          session.notify("command/set-opacity", 1.00);
        }
      }, 
    });

    dom_event = null;
    dom_document = null;
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

