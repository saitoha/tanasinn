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
  _tracking_mode: null,
  _highlight_region: null,

  "[persistable] normal_selection_color": "white",
  "[persistable] highlight_selection_color": "yellow",

  _color: "white",

  "[subscribe('event/mouse-tracking-mode-changed'), enabled]": 
  function onMouseTrackingModeChanged(data) 
  {
    this._tracking_mode = data;
    if (this.enabled) {
      this.clear();
    }
  },

  /** Installs itself */
  "[subscribe('install/selection'), enabled]":
  function install(broker) 
  {
    let renderer = this._renderer;
    let {selection_canvas} = broker.uniget(
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

    broker.notify("initialized/selection", this);
  },

  /** Uninstalls itself 
   *  @param {Broker} A Broker object.
   */
  "[subscribe('uninstall/selection'), enabled]":
  function uninstall(broker) 
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
    let tracking_mode = this._tracking_mode;
    if (null !== tracking_mode) {
//      if (coUtils.Constant.TRACKING_HIGHLIGHT != tracking_mode) {
        return;
//      }
    }
    let [column, row] = this.convertPixelToScreen(event);
    this.selectSurroundChars(column, row);

    this._setClearAction();
  },
  
  /**
   *
   * Mouse highlight tracking notifies a program of a button press, receives 
   * a range of lines from the program, highlights the region covered by the 
   * mouse within that range until button release, and then sends the program 
   * the release coordinates. It is enabled by specifying parameter 1001 to
   * DECSET. Highlighting is performed only for button 1, though other button 
   * events can be received. Warning: use of this mode requires a cooperating 
   * program or it will hang xterm. On button press, the same information as 
   * for normal tracking is generated; xterm then waits for the program to 
   * send mouse tracking information. All X events are ignored until the 
   * proper escape sequence is received from the pty: 
   *
   * CSI P s ; P s ; P s ; P s ; P s T . 
   *
   * The parameters are func, startx, starty, firstrow, and lastrow. 
   * func is non-zero to initiate highlight tracking and zero to abort. 
   * startx and starty give the starting x and y location for the highlighted 
   * region. The ending location tracks the mouse, but will never be above row
   * firstrow and will always be above row lastrow. (The top of the screen is 
   * row 1.) When the button is released, xterm reports the ending position 
   * one of two ways: if the start and end coordinates are valid text 
   * locations: CSI t C x C y . If either coordinate is past the end of the 
   * line: CSI T C x C y C x C y C x C y . The parameters are startx, starty, 
   * endx, endy, mousex, and mousey. startx, starty, endx, and endy give the 
   * starting and ending character positions of the region. mousex and mousey 
   * give the location of the mouse at button up, which may not be over a 
   * character.
   *
   */
  "[subscribe('event/start-highlight-mouse'), enabled]":
  function onStartHighlightMouse(args)
  {
    let tracking_mode = this._tracking_mode;
    if (coUtils.Constant.TRACKING_HIGHLIGHT != tracking_mode) {
      return;
    }

    let func = args[0];
    if (0 == func) {
      this.clear();
      return;
    }

    let broker = this._broker;
    let screen = this.dependency["screen"];
    let column = screen.width;
    let row = screen.height;
    let x = args[1] - 1;
    let y = args[2] - 1;;
    let min_row = args[3] - 1;
    let max_row = args[4] - 1;
    let initial_position = y * column + x;
    if (this._range) {
      let [start, end] = this._range;
      if (start <= initial_position && initial_position < end) {
        return; // drag copy
      }
    }
    this._rectangle_selection_flag = false;
    this._color = this.highlight_selection_color;
    this._context.fillStyle = this._color;

    broker.notify(
      "command/add-domlistener", 
      {
        target: this._canvas.ownerDocument, 
        type: "dragstart", 
        id: "_DRAGGING",
        context: this,
        handler: function selection_dragstart(event) 
        {

    broker.notify(
      "command/add-domlistener", 
      {
        target: this._canvas.ownerDocument, 
        type: "mousemove", 
        id: "_DRAGGING",
        context: this,
        handler: function selection_mousemove(event) 
        {
          let [x, y] = this.convertPixelToScreen(event);
          if (y < min_row) {
            y = min_row;
          }
          if (y > max_row - 1) {
            y = max_row - 1;
          }
          let current_position = y * column + x;
          let start_position = Math.min(initial_position, current_position);
          let end_position = Math.max(initial_position, current_position) 
          start_position = Math.max(0, start_position);
          end_position = Math.min(row * column, end_position);
          this.drawSelectionRange(start_position, end_position);
          this.setRange(start_position, end_position);
        }
      });

    broker.notify(
      "command/add-domlistener", 
      {
        target: this._canvas.ownerDocument,
        type: "mouseup", 
        id: "_DRAGGING",
        context: this,
        handler: function selection_mouseup(event) 
        {
          broker.notify("command/remove-domlistener", "_DRAGGING"); 
          if (this._range) {
            this._setClearAction();
          }
        }
      });
          }
        });
  },

  /** Dragstart handler. It starts a session of dragging selection. */
  "[listen('dragstart', '#tanasinn_content')]":
  function ondragstart(event) 
  {
    let tracking_mode = this._tracking_mode;
    if (null !== tracking_mode) {
//      if (coUtils.Constant.TRACKING_HIGHLIGHT != tracking_mode) {
        return;
//      }
    }
    let broker = this._broker;
    let screen = this.dependency["screen"];
    let column = screen.width;
    let row = screen.height;
    let [x, y] = this.convertPixelToScreen(event);
    let initial_position = y * column + x;
    if (this._range) {
      let [start, end] = this._range;
      if (start <= initial_position && initial_position < end) {
        return; // drag copy
      }
    }
    this._rectangle_selection_flag = event.altKey;
    this._color = this.normal_selection_color;
    this._context.fillStyle = this._color;

    broker.notify(
      "command/add-domlistener", 
      {
        target: this._canvas.ownerDocument, 
        type: "mousemove", 
        id: "_DRAGGING",
        context: this,
        handler: function selection_mousemove(event) 
        {
          let [x, y] = this.convertPixelToScreen(event);
          let current_position = y * column + x;
          let start_position = Math.min(initial_position, current_position);
          let end_position = Math.max(initial_position, current_position) 
          start_position = Math.max(0, start_position);
          end_position = Math.min(row * column, end_position);
          this.drawSelectionRange(start_position, end_position);
          this.setRange(start_position, end_position);
        }
      });

    broker.notify(
      "command/add-domlistener", 
      {
        target: this._canvas.ownerDocument,
        type: "mouseup", 
        id: "_DRAGGING",
        context: this,
        handler: function selection_mouseup(event) 
        {
          broker.notify("command/remove-domlistener", "_DRAGGING"); 
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
    let broker = this._broker;
    broker.notify("command/add-domlistener", {
      target: "#tanasinn_content",
      type: "mouseup",
      id: id,
      context: this,
      handler: function(event) 
      {
        if (2 == event.button) { // right click
          return;
        }
        broker.notify("command/remove-domlistener", id); 
        this.clear();
      },
    });
    broker.notify("command/add-domlistener", {
      target: "#tanasinn_content",
      type: "DOMMouseScroll", 
      id: id,
      context: this,
      handler: function handler(event) 
      {
        broker.notify("command/remove-domlistener", id); 
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
      context.fillStyle = this._color;
      context.fillRect(x, y, width, height);
    } else {
      // draw outer region
      let x = 0;
      let y = start_row * line_height;
      let width = column * char_width;
      let height = (end_row - start_row) * line_height;
      context.fillStyle = this._color;
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
    if (null === this._range) {
      return null;
    }
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
    let broker = this._broker;
    this.onBeforeInput.enabled = true;
    this._range = [column, row];
    let message = coUtils.Text.format(_("selected: [%d, %d]"), column, row);
    broker.notify("command/report-status-message", message);
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
    let broker = this._broker;
    let target_element = broker.uniget("command/query-selector", "#tanasinn_center_area");
    let root_element = broker.root_element;
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


