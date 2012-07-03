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
 * @class DragCopy
 */
var DragCopy = new Class().extends(Plugin)
                          .depends("screen")
                          .depends("renderer")
                          .depends("selection");
DragCopy.definition = {

  _feedback_canvas: null,
  
  _mouse_mode: null,

  get id()
    "dragcopy",

  get info()
    <plugin>
        <name>{_("Drag Copy")}</name>
        <description>{
          _("Enables to drag selected text.")
        }</description>
        <version>0.1</version>
    </plugin>,

  "[persistable] enabled_when_startup": true,

  /** Installs itself. */
  "[install]":
  function install(session)
  {
    var {feedback_canvas} = session.uniget(
      "command/construct-chrome", 
      {
        parentNode: "#tanasinn_center_area",
        id: "feedback_canvas",
        tagName: "html:canvas",
        style: "position: absolute;",
        hidden: true,
      });
    this._feedback_canvas  = feedback_canvas;
  },

  /** Uninstalls itself. */
  "[uninstall]":
  function uninstall(session)
  {
    if (null !== this._feedback_canvas) {
      this._feedback_canvas.parentNode.removeChild(this._feedback_canvas);
      this._feedback_canvas = null;
    }
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
    var canvas, screen, feedback_canvas, foreground_canvas,
        width, height, text, feedback_context, selection_canvas,
        left, top;

    canvas = this._canvas;
    screen = this.dependency["screen"];

    feedback_canvas = this._feedback_canvas;
    feedback_canvas.hidden = false;

    foreground_canvas = this.request("command/query-selector", "#foreground_canvas");

    width = feedback_canvas.width = foreground_canvas.width;
    height = feedback_canvas.height = foreground_canvas.height;

    text = screen.getTextInRange(start, end, is_rectangle);
    event.dataTransfer.setData("text/plain", text);

    feedback_context = feedback_canvas.getContext("2d");
    selection_canvas = this.request("command/query-selector", "#selection_canvas");

    [left, top] = this._getPixelMetricsFromEvent(event);

    feedback_context.globalCompositeOperation = "source-over";
    feedback_context.drawImage(selection_canvas, 0, 0);
    feedback_context.globalCompositeOperation = "source-in";
    feedback_context.drawImage(foreground_canvas, 0, 0);
    event.dataTransfer.setDragImage(feedback_canvas, left * 1, top * 1);

    this.sendMessage("command/add-domlistener", {
      target: "#tanasinn_content",
      type: "dragend", 
      id: "_DRAGGING",
      context: this,
      handler: function onmouseup(event) 
      {
        this.sendMessage("command/remove-domlistener", "_DRAGGING"); 
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
    var target_element, root_element, box, offsetX, offsetY,
        left, top;

    target_element = session.uniget("command/query-selector", "#tanasinn_content");

    root_element = target_element.parentNode;
    box = target_element.boxObject;

    offsetX = box.screenX - root_element.boxObject.screenX;
    offsetY = box.screenY - root_element.boxObject.screenY;

    left = event.layerX - offsetX; 
    top = event.layerY - offsetY;

    return [left, top];
  },

  "[listen('dragstart', '#tanasinn_content'), pnp]":
  function ondragstart(event)
  {
    var screen, column, x, y, position, result,
        start_column, end_column;

    if (null !== this._mouse_mode) {
      return;
    }

    screen = this.dependency["screen"];
    column = screen.width;

    [x, y] = this.convertPixelToScreen(event);

    position = y * column + x;
    result = this.request("get/selection-info");

    if (result) {
      if (start <= position && position < end) {
        if (result.is_rectangle) {

          start_column = result.start % column;
          end_column = result.end % column;

          if ((start_column <= x && x <= end_column) 
           || (start_column >= x && x >= end_column)) {
            this._dragCopy(event, result.start, result.end, result.is_rectangle);
          }
        } else {
          this._dragCopy(event, result.start, result.end, result.is_rectangle);
        }
      }
    }
    
  },

  convertPixelToScreen: function convertPixelToScreen(event) 
  {
    var target_element, root_element, box, offsetX, offsetY,
        left, top, renderer, screen, char_width, line_height,
        column, row, max_column, max_row;

    target_element = this.request("command/query-selector", "#tanasinn_content");
    root_element = this.request("get/root-element");

    box = target_element.boxObject;

    offsetX = box.screenX - root_element.boxObject.screenX;
    offsetY = box.screenY - root_element.boxObject.screenY;

    left = event.layerX - offsetX; 
    top = event.layerY - offsetY;

    renderer = this.dependency["renderer"];
    screen = this.dependency["screen"];

    char_width = renderer.char_width;
    line_height = renderer.line_height;

    column = Math.round(left / char_width);
    row = Math.round(top / line_height);

    max_column = screen.width;
    max_row = screen.height;

    column = column > max_column ? max_column: column;
    row = row > max_row ? max_row: row;

    return [column - 1, row - 1];
  },

};

/**
 * @fn main
 * @brief Module entry point.
 * @param {Broker} broker The Broker object.
 */
function main(broker) 
{
  new DragCopy(broker);
}

// EOF
