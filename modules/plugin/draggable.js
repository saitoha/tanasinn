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

let DragMove = new Class().extends(Plugin);
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

  /** post-constructor */
  "[subscribe('@event/broker-started'), enabled]":
  function onLoad(session) 
  {
    this.enabled = this.enabled_when_startup;
  },

  /** Installs itself. */
  install: function install(session) 
  {
    this.ondragstart.enabled = true;
  },

  /** Uninstalls itself. */
  uninstall: function uninstall(session) 
  {
    this.ondragstart.enabled = false;
  },

  "[listen('dragstart', '#tanasinn_content', true)]":
  function ondragstart(event) 
  {
    if (!event.shiftKey) {
      return;
    }
    event.stopPropagation();
    let session = this._broker;
    // get relative coodinates on target element.
    let offsetX = event.screenX - session.root_element.boxObject.x; 
    let offsetY = event.screenY - session.root_element.boxObject.y;
    session.notify("command/set-opacity", 0.30);
    // define mousemove hanler.
    let document = event.target.ownerDocument; // managed by DOM
    session.notify("command/add-domlistener", {
      target: document, 
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
      target: document, 
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
      target: document, 
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

    event = null;
    document = null;
  },
};


/**
 * @fn main
 * @brief Module entry point.
 * @param {Desktop} desktop The Desktop object.
 */
function main(desktop) {
  desktop.subscribe(
    "@initialized/broker", 
    function(session) new DragMove(session));
}

