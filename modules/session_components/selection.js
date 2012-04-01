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
 * @trait Suitable
 */
let Suitable = new Trait();
Suitable.definition = {

  "[subscribe('event/screen-width-changed')]":
  function onWidthChanged(width) 
  {
    let canvas = this._canvas;
    canvas.width = width;
  },

  "[subscribe('event/screen-height-changed')]": 
  function onHeightChanged(height) 
  {
    let canvas = this._canvas;
    canvas.height = height;
  },

};

/**
 * @class Selection
 */
let Selection = new Class().extends(Plugin)
                           .mix(Suitable)
                           .depends("renderer")
                           .depends("screen");
Selection.definition = {

  get id()
    "selection",

  get info()
    <module>
        <name>{_("Selection")}</name>
        <description>{
          _("Makes it enable to select text by dragging mouse.")
        }</description>
        <version>0.1</version>
    </module>,

  "[persistable] enabled_when_startup": true,

  _canvas: null,
  _context: null,
  _range: null,
  _mouse_mode: null,

  color: "white",
  
  "[subscribe('event/mouse-tracking-mode-changed'), enabled]": 
  function onMouseTrackingModeChanged(data) 
  {
    this._mouse_mode = data;
    if (null !== data && this.enabled) {
      this.clear();
    }
  },

  /** Installs itself */
  "[subscribe('install/selection'), enabled]":
  function install(session) 
  {
    let renderer = this._renderer;
    let {selection_canvas} = session.uniget(
      "command/construct-chrome", 
      {
        parentNode: "#tanasinn_center_area",
        tagName: "html:canvas",
        id: "selection_canvas",
        style: { opacity: 0.5, },
      });
    
    this._canvas = selection_canvas;
    this._context = selection_canvas.getContext("2d");

    this.onWidthChanged.enabled = true;
    this.onHeightChanged.enabled = true;
    this.getRange.enabled = true;
    this.onFirstFocus.enabled = true;

    // register dom listeners.
    this.ondragstart.enabled = true;
    this.ondblclick.enabled = true;

    session.notify("initialized/selection", this);
  },

  /** Uninstalls itself 
   *  @param {Session} A Session object.
   */
  "[subscribe('uninstall/selection'), enabled]":
  function uninstall(session) 
  {
    this.clear();
    this.onWidthChanged.enabled = false;
    this.onHeightChanged.enabled = false;
    this.getRange.enabled = false;
    this.onFirstFocus.enabled = false;

    this.ondragstart.enabled = false;
    this.ondblclick.enabled = false;

    if (null !== this._canvas) {
      this._canvas.parentNode.removeChild(this._canvas);
      this._canvas = null;
    }
    this._context = null;

  },

  "[subscribe('@command/focus')]":
  function onFirstFocus() 
  {
    let canvas = this._canvas;
    canvas.width = canvas.parentNode.boxObject.width;
    canvas.height = canvas.parentNode.boxObject.height;
  },

  /** Doubleclick handler. It selects word under the mouse pointer. */
  "[listen('dblclick', '#tanasinn_content')]":
  function ondblclick(event) 
  {
    if (null !== this._mouse_mode)
      return;
    let [column, row] = this.convertPixelToScreen(event);
    this.selectSurroundChars(column, row);

    this._setClearAction();
  },

  /** Dragstart handler. It starts a session of dragging selection. */
  "[listen('dragstart', '#tanasinn_content')]":
  function ondragstart(event) 
  {
    if (null !== this._mouse_mode)
      return;
    let session = this._broker;
    let screen = this.dependency["screen"];
    let column = screen.width;
    let row = screen.height;
    let [x, y] = this.convertPixelToScreen(event);
    let initialPosition = y * column + x;
    if (this._range) {
      let [start, end] = this._range;
      if (start <= initialPosition && initialPosition < end) {
        return; // drag copy
      }
    }
    this._rectangle_selection_flag = event.altKey;
    this._context.fillStyle = this.color;
    let document = this._canvas.ownerDocument; 
    session.notify(
      "command/add-domlistener", 
      {
        target: document, 
        type: "mousemove", 
        id: "_DRAGGING",
        context: this,
        handler: function selection_mousemove(event) 
        {
          let [x, y] = this.convertPixelToScreen(event);
          let currentPosition = y * column + x;
          let startPosition = Math.min(initialPosition, currentPosition);
          let endPosition = Math.max(initialPosition, currentPosition) 
          startPosition = Math.max(0, startPosition);
          endPosition = Math.min(row * column, endPosition);
          this.drawSelectionRange(startPosition, endPosition);
          this.setRange(startPosition, endPosition);
        }
      });
    session.notify(
      "command/add-domlistener", 
      {
        target: document,
        type: "mouseup", 
        id: "_DRAGGING",
        context: this,
        handler: function selection_mouseup(event) {
          session.notify("command/remove-domlistener", "_DRAGGING"); 
          if (this._range) {
            this._setClearAction();
          }
        }
      });
  },

  /** This method called after selection range settled. It registers 3 DOM 
   *  listeners which wait for mouseup / dragstart / DOMMouseScroll event 
   *  and clears the selection once.
   */
  _setClearAction: function _setClearAction() 
  {
    let id = "selection.clear";
    let session = this._broker;
    session.notify("command/add-domlistener", {
      target: "#tanasinn_content",
      type: "mouseup",
      id: id,
      context: this,
      handler: function(event) 
      {
        if (2 == event.button) // right click
          return;
        session.notify("command/remove-domlistener", id); 
        this.clear();
      },
    });
    //session.notify("command/add-domlistener", {
    //  target: "#tanasinn_content",
    //  type: "dragstart",
    //  id: id,
    //  context: this,
    //  handler: function(event) 
    //  {
    //    session.notify("remove-domlistener", id); 
    //    this.clear();
    //  },
    //});
    session.notify("command/add-domlistener", {
      target: "#tanasinn_content",
      type: "DOMMouseScroll", 
      id: id,
      context: this,
      handler: function handler(event) 
      {
        session.notify("command/remove-domlistener", id); 
        this.clear();
      },
    });
  },

  /** Draw selection overlay to the canvas.
   *
   * - Line selection mode.
   *
   *    Selection overlay can be regarded as A - B - C.
   *    
   *       region B   first
   *          v         v
   *      +.............+-------------------------+
   *      +-------------+                         |
   *      |        region A (outer region)        |
   *      |                       +---------------+
   *      +-----------------------+...............+
   *                              ^        ^
   *                             last  region C
   *
   *    First, we draw region A with context.fillRect() function.
   *    then clear region B and C.
   *
   * - Rectangle selection mode.
   *
   */
  drawSelectionRange: function drawSelectionRange(first, last) 
  {
    this.clear();

    // checking precondition
    if ("number" != typeof(first) 
     || "number" != typeof(last)) {
      throw coUtils.Debug.Exception(
        _("Ill-typed arguments was given: [%d, %d]"), 
        first, last);
    }

    // if first argument was less then second argument, swaps them.
    if (first > last)
      [first, last] = arguments;

    let context = this._context;
    let screen = this.dependency["screen"];
    let renderer = this.dependency["renderer"];
    let column = screen.width;
    let char_width = renderer.char_width;
    let line_height = renderer.line_height;
    let start_row = Math.round(first / column);
    let end_row = Math.round(last / column) + 1;
    let start_column = first % column;
    let end_column = last % column;

    if (this._rectangle_selection_flag) {
      // draw outer region
      let x = start_column * char_width;
      let y = start_row * line_height;
      let width = (end_column - start_column) * char_width;
      let height = (end_row - start_row) * line_height;
      context.fillStyle = "white";
      context.fillRect(x, y, width, height);
    } else {
      // draw outer region
      let x = 0;
      let y = start_row * line_height;
      let width = column * char_width;
      let height = (end_row - start_row) * line_height;
      context.fillStyle = "white";
      context.fillRect(x, y, width, height);

      // clear pre-start region
      context.clearRect(x, y, start_column * char_width, line_height);

      // clear post-end region
      context.clearRect(end_column * char_width, y + height - line_height, 
                        width - end_column * char_width, line_height);
    }
  },

  selectSurroundChars: function selectSurroundChars(column, row) 
  {
    let context = this._context;
    let screen = this.dependency["screen"];
    let [start, end] = screen.getWordRangeFromPoint(column, row);
    this.drawSelectionRange(start, end);
    this.setRange(start, end);
  },

  "[subscribe('get/selection-info')]": 
  function getRange() 
  {
    if (!this._range)
      return null;
    let [start, end] = this._range;
    return {
      start: start, 
      end: end, 
      is_rectangle: this._rectangle_selection_flag
    };
  },

  "[subscribe('event/before-input')]":
  function onBeforeInput(message) 
  {
    this.onBeforeInput.enabled = false;
    this.clear();
  },

  setRange: function setRange(column, row) 
  {
    let session = this._broker;
    this.onBeforeInput.enabled = true;
    this._range = [column, row];
    let message = coUtils.Text.format(_("selected: [%d, %d]"), column, row);
    session.notify("command/report-status-message", message);
  },

  /** Clear selection canvas and range information. */
  clear: function clear() 
  {
    let context = this._context;
    let canvas = this._canvas;
    context.clearRect(0, 0, canvas.width, canvas.height);
    this._range = null; // clear range.
  },

  convertPixelToScreen: function convertPixelToScreen(event) 
  {
    let session = this._broker;
    let [target_element] 
      = session.notify("command/query-selector", "#tanasinn_center_area");
    let root_element = session.root_element;
    let box = target_element.boxObject;
    let offsetX = box.screenX - root_element.boxObject.screenX;
    let offsetY = box.screenY - root_element.boxObject.screenY;
    let left = event.layerX - offsetX; 
    let top = event.layerY - offsetY;
    let renderer = this.dependency["renderer"];
    let screen = this.dependency["screen"];
    let char_width = renderer.char_width;
    let line_height = renderer.line_height;
    let column = Math.round(left / char_width + 1.0);
    let row = Math.round(top / line_height + 0.0);
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
 * @param {Broker} broker The Broker object.
 */
function main(broker) 
{
  new Selection(broker);
}


