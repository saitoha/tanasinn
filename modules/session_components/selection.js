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
 * @trait Suitable
 */
var Suitable = new Trait();
Suitable.definition = {

  "[subscribe('event/screen-width-changed'), pnp]":
  function onWidthChanged(width) 
  {
    var canvas;

    canvas = this._canvas;
    canvas.width = width;
  },

  "[subscribe('event/screen-height-changed'), pnp]": 
  function onHeightChanged(height) 
  {
    var canvas = this._canvas;

    canvas.height = height;
  },

};

/**
 * @trait DragSelect
 */
var DragSelect = new Trait();
DragSelect.definition = {

  _initial_position: null,

  /** Dragstart handler. It starts a session of dragging selection. */
  "[listen('dragstart', '#tanasinn_content'), pnp]":
  function ondragstart(event) 
  {
    var screen = this._screen,
        initial_position,
        start,
        end,
        text;

    if (event.ctrlKey) {
      return;
    }

    if (event.shiftKey) {
      return;
    }

    initial_position = this._convertPixelToPosition(event);

    text = screen.getTextInRange(initial_position - 1, initial_position);

    if ("\x00" === text) {
      ++initial_position;
    }

    if (this._range) {

      start = this._range[0];
      end = this._range[1];

      if (start <= initial_position && initial_position < end) {
        return; // drag copy
      }
      this._range = null;
    }

    this._initial_position = initial_position; // store initial_position

    this._rectangle_selection_flag = event.altKey;
    this._color = this.normal_selection_color;
    this._context.lineJoin = "round";
    this._context.fillStyle = this._color;
    this._context.strokeStyle = this._color;

    this.ondragmove.enabled = true;
    this.ondragend.enabled = true;
    event.explicitOriginalTarget.style.cursor = "text";
  },

  /** Dragmove handler */
  "[listen('mousemove')]":
  function ondragmove(event) 
  {
    var initial_position = this._initial_position,
        current_position = this._convertPixelToPosition(event),
        screen = this._screen,
        text = screen.getTextInRange(current_position - 1, current_position),
        start_position,
        end_position;

    if ("\x00" === text) {
      ++current_position;
    }

    start_position = Math.min(initial_position, current_position),
    end_position = Math.max(initial_position, current_position);

    this.drawSelectionRange(start_position, end_position);
    this.setRange(start_position, end_position);
  },

  /** Dragend handler */
  "[listen('mouseup')]":
  function ondragend(event) 
  {
    var initial_position = this._initial_position,
        current_position,
        start,
        end,
        text;

    this.ondragmove.enabled = false;
    this.ondragend.enabled = false;

    current_position = this._convertPixelToPosition(event),
    start = Math.min(initial_position, current_position),
    end = Math.max(initial_position, current_position);

    this._doAccessibilityHack(start, end);

    this._initial_position = null;
    event.explicitOriginalTarget.style.cursor = "";

    if (this._range) {
      this._setClearAction();
      this._reportRange();
    }
  },

  _doAccessibilityHack: function _doAccessibilityHack(start, end)
  {
    var screen = this._screen,
        text = screen.getTextInRange(start, end);

    this._textbox.readOnly = true;

    this._textbox.value = text;
    this._textbox.select();
  },

}; // DragSelect


/**
 * @class Selection
 */
var Selection = new Class().extends(Plugin)
                           .mix(Suitable)
                           .mix(DragSelect)
                           .depends("renderer")
                           .depends("screen")
                           .depends("palette")
                           .depends("inputmanager");
Selection.definition = {

  id: "selection",

  getInfo: function getInfo()
  {
    return {
      name: _("Selection"),
      version: "0.2",
      description: _("Makes it enable to select text by dragging mouse.")
    };
  },

  "[persistable] enabled_when_startup": true,
  "[persistable] normal_selection_color": "rgba(255, 255, 0, 0.05)",
  "[persistable] highlight_selection_color": "rgba(170, 255, 170, 0.15)",
  "[persistable] edge_color": "rgba(255, 255, 0, 0.4)",
  "[persistable] shadow_color": "#ffffff",
  _color: "#ffffff",
  _canvas: null,
  _working_canvas: null,
  _context: null,
  _range: null,
  _highlight_region: null,

  _textbox: null,
  _screen: null,
  _renderer: null,

  "[subscribe('event/mouse-tracking-mode-changed'), enabled]": 
  function onMouseTrackingModeChanged(data) 
  {
    if (coUtils.Constant.TRACKING_NONE === data 
     || coUtils.Constant.TRACKING_HIGHLIGHT === data) {
      this.ondblclick.enabled = true;
    } else {
      this.ondblclick.enabled = false;
    }
    if (coUtils.Constant.TRACKING_NONE === data) {
      this.ondragstart.enabled = true;
    } else {
      this.ondragstart.enabled = false;
    }
    if (this.enabled) {
      this.clear();
    }
  },

  "[subscribe('command/change-locator-reporting-mode'), enabled]": 
  function onChangeLocatorReportingMode(mode) 
  {
    if (null === mode) {
      this.ondragstart.enabled = true;
      this.ondblclick.enabled = false;
    } else {
      this.ondragstart.enabled = false;
      this.ondblclick.enabled = true;
    }
    if (this.enabled) {
      this.clear();
    }
  },

  /** Installs itself. 
   *  @param {InstallContext} context A InstallContext object.
   */
  "[install]":
  function install(context) 
  {
    var result;
    
    this._renderer = context["renderer"];
    this._screen = context["screen"];
    this._palette = context["palette"];
    this._textbox = context["inputmanager"].getInputField(),
    //coUtils.Color.adjust(
    result = this.request(
      "command/construct-chrome", 
      {
        parentNode: "#tanasinn_center_area",
        tagName: "html:canvas",
        id: "selection_canvas",
      });
    
    this._canvas = result.selection_canvas;
    this._context = result.selection_canvas.getContext("2d");

    result = this.request(
      "command/construct-chrome", 
      {
        tagName: "html:canvas",
        id: "selection_working_canvas",
      });

    this._working_canvas = result.selection_working_canvas;
    this._working_context = result.selection_working_canvas.getContext("2d");
  },

  /** Uninstalls itself 
   */
  "[uninstall]":
  function uninstall() 
  {
    if (null !== this._canvas) {
      this._canvas.parentNode.removeChild(this._canvas);
      this._canvas = null;
      this._working_canvas = null;
    }
    if (null !== this._context) {
      this.clear();
      this._context = null;
      this._working_context = null;
    }

  },

  "[subscribe('@command/focus'), pnp]":
  function onFirstFocus() 
  {
    var canvas = this._canvas;

    canvas.width = canvas.parentNode.boxObject.width;
    canvas.height = canvas.parentNode.boxObject.height;
  },

  /** Doubleclick handler. It selects word under the mouse pointer. */
  "[listen('dblclick', '#tanasinn_content'), pnp]":
  function ondblclick(event) 
  {
    var pos = this.convertPixelToScreen(event),
        column = pos[0],
        row = pos[1];

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
    var func,
        screen,
        column,
        row,
        x,
        y,
        min_row,
        max_row,
        initial_position,
        start,
        end,
        text;

    func = args[0];
    if (0 === func) {
      this.clear();
      return;
    }

    screen = this._screen;
    column = screen.width;

    row = screen.height;
    x = args[1] - 1;
    y = args[2] - 1;;

    min_row = args[3] - 1;
    max_row = args[4] - 1;

    initial_position = y * column + x;

    if (this._range) {
      [start, end] = this._range;
      if (start <= initial_position && initial_position < end) {
        return; // drag copy
      }
    }

    text = screen.getTextInRange(initial_position, initial_position + 1);
    if ("\x00" === text) {
      ++initial_position;
    }

    this._rectangle_selection_flag = false;
    this._color = this.highlight_selection_color;
    this._context.fillStyle = this._color;

    this.sendMessage(
      "command/add-domlistener", 
      {
        target: this._canvas.ownerDocument, 
        type: "dragstart", 
        id: "_DRAGGING",
        context: this,
        handler: function selection_dragstart(event) 
        {
          this.sendMessage(
            "command/add-domlistener", 
            {
              target: this._canvas.ownerDocument, 
              type: "mousemove", 
              id: "_DRAGGING",
              context: this,
              handler: function selection_mousemove(event) 
              {
                var coordinate = this.convertPixelToScreen(event),
                    x = coordinate[0],
                    y = coordinate[1],
                    current_position,
                    start_position,
                    end_position,
                    text;

                if (y < min_row) {
                  y = min_row;
                }
                if (y > max_row - 1) {
                  y = max_row - 1;
                }

                current_position = y * column + x;
                text = screen.getTextInRange(current_position, current_position + 1);
                if ("\x00" === text) {
                  --current_position;
                }
                
                start_position = Math.min(initial_position, current_position);
                end_position = Math.max(initial_position, current_position) 

                start_position = Math.max(0, start_position);
                end_position = Math.min(row * column, end_position);

                this.drawSelectionRange(start_position, end_position);
                this.setRange(start_position, end_position);
              }
            });

          this.sendMessage(
            "command/add-domlistener", 
            {
              target: this._canvas.ownerDocument,
              type: "mouseup", 
              id: "_DRAGGING",
              context: this,
              handler: function selection_mouseup(event) 
              {
                this.sendMessage("command/remove-domlistener", "_DRAGGING"); 
                if (this._range) {
                  this._setClearAction();
                  this._reportRange();
                }
              }
            });
          }
        });
  },
 
  /** This method called after selection range settled. It registers 3 DOM 
   *  listeners which wait for mouseup / dragstart / DOMMouseScroll event 
   *  and clears the selection once.
   */
  _setClearAction: function _setClearAction() 
  {
    coUtils.Timer.setTimeout(
      function()
      {
        this.onClickAfterSelect.enabled = true;
        this.onScrollAfterSelect.enabled = true;
      }, 100, this);
  },

  "[listen('mouseup', '#tanasinn_content')]":
  function onClickAfterSelect(event) 
  {
    if (2 === event.button) { // right click
      return;
    }
    this.onClickAfterSelect.enabled = false;
    this.clear();
  },

  "[listen('DOMMouseScroll', '#tanasinn_content')]":
  function onScrollAfterSelect(event) 
  {
    this.onScrollAfterSelect.enabled = false;
    this.clear();
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
    var text,
        context,
        screen,
        renderer,
        column,
        char_width,
        line_height,
        start_row,
        end_row,
        start_column,
        end_column,
        x,
        y,
        width,
        height,
        lines,
        i,
        line,
        match,
        right_blank_length,
        pi = Math.PI,
        r1,
        r2,
        length,
	j;

    this.clear();

    // checking precondition
    if ("number" !== typeof(first) 
     || "number" !== typeof(last)) {
      throw coUtils.Debug.Exception(
        _("Ill-typed arguments was given: [%d, %d]"), 
        first, last);
    }

    // if first argument was less then second argument, swaps them.
    if (first > last) {
      [first, last] = arguments;
    }

    context = this._context;

    screen = this._screen;
    renderer = this._renderer;

    column = screen.width;
    char_width = renderer.char_width;
    line_height = renderer.line_height;
    start_row = Math.floor(first / column);
    end_row = Math.floor(last / column + 1.0);
    start_column = first % column;
    end_column = last % column;

    if (this._rectangle_selection_flag) {

      // draw outer region
      x = Math.min(start_column, end_column) * char_width;
      y = Math.min(start_row, end_row) * line_height;

      width = Math.abs(end_column - start_column) * char_width;
      height = Math.abs(end_row - start_row) * line_height;

      context.fillStyle = this._color;
      r1 = 4;
      r2 = 4;
      context.beginPath();
      context.arc(x + r1, y + r1, r2, pi * 1.0 , pi * 1.5, false); 
      context.lineTo(x - r1 + width, y + r1 - r2); 
      context.arc(x - r1 + width, y + r1, r2, pi * 1.5 , pi * 0, false); 
      context.lineTo(x - r1 + width + r2, y - r1 + height); 
      context.arc(x - r1 + width, y - r1 + height, r2, pi * 0, pi * 0.5, false); 
      context.lineTo(x + r1, y - r1 + height + r2); 
      context.arc(x + r1, y - r1 + height, r2, pi * 0.5, pi * 1.0, false); 
      context.lineTo(x + r1 - r2, y + r1); 
    } else {

      // draw outer region
      x = 0;
      y = start_row * line_height;

      width = column * char_width;
      height = (end_row - start_row) * line_height;

      context.beginPath();
 
      text = screen.getTextInRange(first, last).replace(/\n/g, "");
      lines = text.split("\r");

      right_blank_length = column - lines[0].length - start_column;
      if (Math.abs(start_row - end_row) <= 1) {
        x = Math.min(start_column, end_column) * char_width;
        y = Math.min(start_row, end_row) * line_height;
        width = Math.abs(start_column - end_column) * char_width;
        height = 1 * line_height;
        r1 = 4;
        r2 = 4;
        context.shadowBlur = 0;
        context.shadowColor = "white";
        context.arc(x + r1, y + r1, r2, pi * 1.0 , pi * 1.5, false); 
        context.lineTo(x - r1 + width, y + r1 - r2); 
        context.arc(x - r1 + width, y + r1, r2, pi * 1.5 , pi * 0, false); 
        context.lineTo(x - r1 + width + r2, y - r1 + height); 
        context.arc(x - r1 + width, y - r1 + height, r2, pi * 0, pi * 0.5, false); 
        context.lineTo(x + r1, y - r1 + height + r2); 
        context.arc(x + r1, y - r1 + height, r2, pi * 0.5, pi * 1.0, false); 
        context.lineTo(x + r1 - r2, y + r1); 
      } else {
        r1 = 4;
        r2 = 4;
        x = start_column * char_width;
        y = start_row * line_height;
        context.shadowBlur = 0;
        context.shadowColor = "white";
        context.arc(x + r1, y + r1, r2, pi * 1.0 , pi * 1.5, false); 
        length = start_column + lines[0].length;
        x = length * char_width;
        //context.lineTo(x - r1, y + r1 - r2); 
        context.arc(x - r1, y + r1, r2, pi * 1.5 , pi * 0, false); 
        for (i = start_row + 1; i < end_row; ++i) {
          line = lines[i - start_row];
          if (undefined !== line) {
            if (line.length < length) {
              context.arc(x - r1, i * line_height - r1, r2, pi * 0, pi * 0.5); 
              x = line.length * char_width;
              context.lineTo(x - r1 + r2, i * line_height); 
              length = line.length;
            } else if (line.length > length) {
              context.lineTo(x - r1 + r2, i * line_height); 
              x = line.length * char_width;
              context.arc(x - r1, i * line_height + r1, r2, pi * 1.5, pi * 2); 
              length = line.length;
            }
          }
        }
        x = Math.min(line.length, end_column) * char_width;
        context.arc(x - r1, i * line_height - r1, r2, pi * 0, pi * 0.5, false); 
        context.arc(0 + r1, i * line_height - r1, r2, pi * 0.5, pi * 1.0, false); 
        context.arc(0 + r1, (start_row + 1) * line_height + r1, r2, pi * 1.0 , pi * 1.5, false); 
        context.lineTo(start_column * char_width + r1 - r2, y + line_height); 
        context.lineTo(start_column * char_width + r1 - r2, y + r1); 
        context.arc(start_column * char_width + r1, y + r1, r2, pi * 1.0 , pi * 1.5, false); 
      }
    }

    context.shadowColor = this._shadowColor;
    context.fillStyle = this._color;
    context.fill();
    context.shadowBlur = 18;
    context.fillStyle = context.createPattern(this._renderer.getCanvas(), "");
    context.fill();
    context.strokeStyle = this.edge_color;
    context.lineWidth = 4;
    context.stroke();
  },

  selectSurroundChars: function selectSurroundChars(column, row) 
  {
    var context = this._context,
        screen = this._screen,
        range = screen.getWordRangeFromPoint(column, row),
        start = range[0],
        end = range[1];

    this._color = this.normal_selection_color;
    this.drawSelectionRange(start, end);
    this._doAccessibilityHack(start, end);
    this.setRange(start, end);
    this._reportRange();
  },

  "[subscribe('command/paint-drag-region'), pnp]": 
  function paintForeground(context) 
  {
    var i;
    for (i = 0; i < 10; ++i) {
      context.drawImage(this._canvas, 0, 0);
    }
  },

  "[subscribe('get/selection-info'), pnp]": 
  function getRange() 
  {
    var start, end;

    if (null === this._range) {
      return null;
    }

    start = this._range[0];
    end = this._range[1];

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
    this.onBeforeInput.enabled = true;
    this._range = [column, row];
  },

  _reportRange: function _reportRange()
  {
    var column = this._range[0],
        row = this._range[1],
        message = coUtils.Text.format(_("selected: [%d, %d]"), column, row);

    this.sendMessage("command/report-status-message", message);
  },

  /** Clear selection canvas and range information. */
  clear: function clear() 
  {
    var context = this._context,
        canvas = this._canvas;

    if (canvas && context) {
      //this._textbox.value = "";
      this._textbox.readOnly = false;
      //this._textbox.reset();
      context.clearRect(0, 0, canvas.width, canvas.height);
      this._range = null; // clear range.
    }
  },

  _convertPixelToPosition: function convertPixelToScreen(event) 
  {
    var screen = this._screen,
        result = this.convertPixelToScreen(event);

    return screen.width * result[1] + result[0];
  },

  convertPixelToScreen: function convertPixelToScreen(event) 
  {
    var target_element = this.request(
          "command/query-selector", 
          "#tanasinn_center_area"),
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
        column = Math.floor(left / char_width + 1.0),
        row = Math.floor(top / line_height + 1.0),
        max_column = screen.width,
        max_row = screen.height,
        column = column > max_column ? max_column: column,
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
  new Selection(broker);
}

// EOF
