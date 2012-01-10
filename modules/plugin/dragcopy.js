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
 * The Original Code is coTerminal
 *
 * The Initial Developer of the Original Code is
 * Hayaki Saito.
 * Portions created by the Initial Developer are Copyright (C) 2010 - 2011
 * the Initial Developer. All Rights Reserved.
 *
 * ***** END LICENSE BLOCK ***** */

/**
 * @class DragCopy
 */
let DragCopy = new Class().extends(Plugin);
DragCopy.definition = {

  _feedback_canvas: null,
  
  _mouse_mode: null,

  get id()
    "comopnents.dragcopy",

  get info()
    <plugin>
        <name>{_("Drag Copy")}</name>
        <description>{
          _("Enables to drag selected text.")
        }</description>
        <version>0.1</version>
    </plugin>,

  /** post-constructor */
  "[subscribe('@initialized/{screen & renderer & selection}'), enabled]":
  function onLoad(screen, renderer, selection) 
  {
    this._screen = screen;
    this._renderer = renderer;
    this.enabled = this.enabled_when_startup;
  },

  install: function install(session)
  {
    let {feedback_canvas} = session.uniget(
      "command/construct-chrome", 
      {
        parentNode: "#coterminal_center_area",
        id: "feedback_canvas",
        tagName: "html:canvas",
        hidden: true,
      });
    this._feedback_canvas  = feedback_canvas;
    this.ondragstart.enabled = true;
  },

  uninstall: function install(session)
  {
    this.ondragstart.enabled = false;
    this._feedback_canvas.parentNode.removeChild(this._feedback_canvas);
    this._feedback_canvas = null;
  },
  
  "[subscribe('event/mouse-tracking-mode-changed'), enabled]": 
  function onMouseTrackingModeChanged(data) 
  {
    this._mouse_mode = data;
  },

  /** Set selected text data and feedback image to data transfer object. 
   *  @param {Event} A DOM mouse event object.
   */
  _dragCopy: function _dragCopy(event, start, end, is_rectangle) 
  {
    session = this._broker;

    let canvas = this._canvas;
    let screen = this._screen;
    let feedback_canvas = this._feedback_canvas;
    feedback_canvas.hidden = false;
    let foreground_canvas = session.uniget("command/query-selector", "#foreground_canvas");
    let width = feedback_canvas.width = foreground_canvas.width;
    let height = feedback_canvas.height = foreground_canvas.height;
    let text = screen.getTextInRange(start, end, is_rectangle);
    event.dataTransfer.setData("text/plain", text);
    let feedback_context = feedback_canvas.getContext("2d");
    let selection_canvas = session.uniget("command/query-selector", "#selection_canvas");
    let [left, top] = this._getPixelMetricsFromEvent(event);
    feedback_context.globalCompositeOperation = "source-over";
    feedback_context.drawImage(selection_canvas, 0, 0);
    feedback_context.globalCompositeOperation = "source-in";
    feedback_context.drawImage(foreground_canvas, 0, 0);
    event.dataTransfer.setDragImage(feedback_canvas, left * 1, top * 1);

    session.notify("command/add-domlistener", {
      target: "#coterminal_content",
      type: "dragend", 
      id: "_DRAGGING",
      context: this,
      handler: function onmouseup(event) 
      {
        session.notify("command/remove-domlistener", "_DRAGGING"); 
        feedback_context.clearRect(0, 0, width, height);
        selection_canvas.getContext("2d").clearRect(0, 0, width, height);
        feedback_canvas.hidden = true;
      }
    });
  },

  /** Requires and mouse event object and convert it to a touple which 
   *  indicates [x, y] position in center board element.
   *  @param {Event} A DOM mouse event object.
   */
  _getPixelMetricsFromEvent: 
  function _getPixelMetricsFromEvent(event) 
  {
    let target_element 
      = session.uniget("command/query-selector", "#coterminal_content");
    let root_element = target_element.parentNode;
    let box = target_element.boxObject;
    let offsetX = box.screenX - root_element.boxObject.screenX;
    let offsetY = box.screenY - root_element.boxObject.screenY;
    let left = event.layerX - offsetX; 
    let top = event.layerY - offsetY;
    return [left, top];
  },

  "[listen('dragstart', '#coterminal_content')]":
  function ondragstart(event)
  {
    if (null !== this._mouse_mode)
      return;
    let session = this._broker;
    let screen = this._screen;
    let column = screen.width;
    let [x, y] = this.convertPixelToScreen(event);
    let position = y * column + x;
    let result = session.uniget("get/selection-info");
    if (result) {
      let {start, end, is_rectangle} = result;
      if (start <= position && position < end) {
        if (is_rectangle) {
          let start_column = start % column;
          let end_column = end % column;
          if ((start_column <= x && x <= end_column) 
           || (start_column >= x && x >= end_column)) {
            this._dragCopy(event, start, end, is_rectangle);
          }
        } else {
          this._dragCopy(event, start, end, is_rectangle);
        }
      }
    }
    
  },

  convertPixelToScreen: function convertPixelToScreen(event) 
  {
    let session = this._broker;
    let target_element
      = session.uniget("command/query-selector", "#coterminal_content");
    let root_element = session.root_element;
    let box = target_element.boxObject;
    let offsetX = box.screenX - root_element.boxObject.screenX;
    let offsetY = box.screenY - root_element.boxObject.screenY;
    let left = event.layerX - offsetX; 
    let top = event.layerY - offsetY;
    let renderer = this._renderer;
    let screen = this._screen;
    let char_width = renderer.char_width;
    let line_height = renderer.line_height;
    let column = Math.round(left / char_width);
    let row = Math.round(top / line_height);
    let maxColumn = screen.width;
    let maxRow = screen.height;
    column = column > maxColumn ? maxColumn: column;
    row = row > maxRow ? maxRow: row;
    return [column - 1, row - 1];
  },

};

/**
 * @fn main
 * @brief Module entry point.
 * @param {Desktop} desktop The Desktop object.
 */
function main(desktop) 
{
  desktop.subscribe(
    "initialized/session", 
    function(session) new DragCopy(session));
}

