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
 * Portions created by the Initial Developer are Copyright (C) 2010 - 2013
 * the Initial Developer. All Rights Reserved.
 *
 * ***** END LICENSE BLOCK ***** */

"use strict";

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

  _screen: null,
  _renderer: null,
  _selection: null,

  id: "dragcopy",

  /** plugin information */
  getInfo: function getInfo()
  {
    return {
      name: _("Drag Copy"),
      version: "0.1",
      description: _("Enables to drag selected text.")
    };
  },

  /** provide UI Template */
  getTemplate: function getTemplate()
  {
    return {
      parentNode: "#tanasinn_center_area",
      id: "feedback_canvas",
      tagName: "html:canvas",
      style: {
        position: "absolute",
      },
      hidden: true,
    };
  },

  "[persistable] enabled_when_startup": true,

  /** Installs itself.
   *  @param {InstallContext} context A InstallContext object.
   */
  "[install]":
  function install(context)
  {
    var result = this.request("command/construct-chrome", this.getTemplate());

    this._feedback_canvas = result.feedback_canvas;

    this._screen = context["screen"];
    this._renderer = context["renderer"];
    this._selection = context["selection"];
  },

  /** Uninstalls itself.
   */
  "[uninstall]":
  function uninstall()
  {
    if (null !== this._feedback_canvas) {
      this._feedback_canvas.parentNode.removeChild(this._feedback_canvas);
      this._feedback_canvas = null;
    }

    this._screen = null;
    this._renderer = null;
    this._selection = null;
  },

  /** called when mouse tracking mode is changed */
  "[subscribe('event/mouse-tracking-mode-changed'), enabled]":
  function onMouseTrackingModeChanged(data)
  {
    this._mouse_mode = data;
  },

  /** called when screen width is changed */
  "[subscribe('event/screen-width-changed'), pnp]":
  function onWidthChanged(width)
  {
    this._feedback_canvas.width = width;
  },

  /** called when screen height is changed */
  "[subscribe('event/screen-height-changed'), pnp]":
  function onHeightChanged(height)
  {
    this._feedback_canvas.height = height;
  },

  /** Set selected text data and feedback image to data transfer object.
   *  @param {Event} A DOM mouse event object.
   */
  _dragCopy: function _dragCopy(event, start, end, is_rectangle)
  {
    var canvas = this._canvas,
        screen = this._screen,
        feedback_canvas = this._feedback_canvas,
        feedback_context = feedback_canvas.getContext("2d"),
        text,
        coordinate = this._getPixelMetricsFromEvent(event),
        left = coordinate[0] - 50,
        top = coordinate[1] - 40;

    if (is_rectangle) {
      text = screen
        .getTextInRect(start, end)
        .replace(/[\x00\r]/g, "");
    } else {
      text = screen
        .getTextInRange(start, end)
        .replace(/[\x00\r]/g, "");
    }
    feedback_canvas.hidden = true;

    event.dataTransfer.setData("text/plain", text);
    feedback_context.globalCompositeOperation = "source-over";
    this.sendMessage("command/paint-drag-region", feedback_context);
    feedback_context.globalCompositeOperation = "source-in";
    this.sendMessage("command/paint-foreground", feedback_context);
    event.dataTransfer.setDragImage(feedback_canvas, left * 1, top * 1);

    this.ondragend.enabled = true;
  },

  /** called when a dragging session finished */
  "[listen('dragend', '#tanasinn_content')]":
  function ondragend(event)
  {
    var feedback_canvas = this._feedback_canvas,
        feedback_context = feedback_canvas.getContext("2d"),
        width = feedback_canvas.width = feedback_canvas.width,
        height = feedback_canvas.height = feedback_canvas.height;

    // disable this handler
    this.ondragend.enabled = false;

    feedback_context.clearRect(0, 0, width, height);
    feedback_canvas.hidden = true;
  },

  /** Requires and mouse event object and convert it to a touple which
   *  indicates [x, y] position in center board element.
   *  @param {Event} A DOM mouse event object.
   */
  _getPixelMetricsFromEvent:
  function _getPixelMetricsFromEvent(event)
  {
    var target_element = event.explicitOriginalTarget,
        root_element = target_element.parentNode,
        box = target_element.boxObject,
        offsetX = box.screenX - root_element.boxObject.screenX,
        offsetY = box.screenY - root_element.boxObject.screenY,
        left = event.layerX - offsetX,
        top = event.layerY - offsetY;

    return [left, top];
  },

  _startDragging: function _startDragging(event)
  {
    var screen = this._screen,
        column = screen.getWidth(),
        coordinate = this.convertPixelToScreen(event),
        x = coordinate[0],
        y = coordinate[1],
        position = y * column + x,
        result = this.request("get/selection-info"),
        start_column,
        end_column;

    if (result) {
      if (result.start <= position && position < result.end) {
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

  /** called when a mouse drag event is dispatched */
  "[listen('dragstart', '#tanasinn_content'), pnp]":
  function ondragstart(event)
  {
    if (null === this._mouse_mode) {
      this._startDragging(event);
    }
  },

  convertPixelToScreen: function convertPixelToScreen(event)
  {
    var target_element = this.request("command/query-selector", "#tanasinn_content"),
        root_element = this.request("get/root-element"),
        box = target_element.boxObject,
        offsetX = box.screenX - root_element.boxObject.screenX,
        offsetY = box.screenY - root_element.boxObject.screenY,
        left = event.layerX - offsetX,
        top = event.layerY - offsetY,
        renderer = this._renderer,
        screen = this._screen,
        char_width = renderer.char_width,
        line_height = renderer.line_height,
        column = Math.round(left / char_width),
        row = Math.round(top / line_height),
        max_column = screen.getWidth(),
        max_row = screen.getHeight();

    if (column > max_column) {
      column = max_column;
    }
    if (row > max_row) {
      row = max_row;
    }

    return [column - 1, row - 1];
  },

  /** test */
  "[test]":
  function()
  {
    var enabled = this.enabled;

    //try {
    //  this.enabled = false;
    //  this.enabled = true;
    //  this.enabled = false;
    //} finally {
    //  this.enabled = enabled;
    //}
  },

}; // DragCopy

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
