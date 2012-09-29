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

var SnapResize = new Class().extends(Component);
SnapResize.definition = {

  id: "snapresize",

  /** post-constructor */
  "[subscribe('@initialized/{chrome & renderer}'), enabled]":
  function onLoad(chrome, renderer) 
  {
    this._chrome = chrome;
    this._renderer = renderer;
    this.onWindowResized.enabled = true;  
  },

  "[subscribe('event/window-resized')]":
  function onWindowResized(event)
  {
    var default_view = this.request("get/root-element").ownerDocument.defaultView,
        renderer = this._renderer,
        char_width = renderer.char_width,
        line_height = renderer.line_height,
        box_element = this.request("command/query-selector", "#box_element"),
        center_area = this.request("command/query-selector", "#tanasinn_content"),
        horizontal_margin = box_element.boxObject.width - center_area.boxObject.width,
        vertical_margin = (box_element.boxObject.height - center_area.boxObject.height) / 2,
        column = Math.floor((default_view.innerWidth - horizontal_margin) / char_width - 1),
        row = Math.floor((default_view.innerHeight - vertical_margin) / line_height - 1);

    this.sendMessage(
      "command/resize-screen",
      {
        column: column,
        row: row,
      });

    this.sendMessage("command/draw", true);
  },

};

/**
 *
 * @class CaptureBox
 *
 */
var CaptureBox = new Class().extends(Plugin);
CaptureBox.definition = {

  id: "capturebox",

  getInfo: function getInfo()
  {
    return {
      name: _("Capture Box"),
      version: "0.1",
      description: _("Makes easy to drag window margin.")
    };
  },

  getTemplate: function getTemplate()
    ({
      parentNode: "#tanasinn_chrome",
      tagName: "box",
      id: "tanasinn_capture_box",
      hidden: true,
      style: {
        position: "fixed",
        width: this.capture_box_size + "px", 
        height: this.capture_box_size + "px", 
        marginLeft: -this.capture_box_size / 2 + "px",
        marginTop: -this.capture_box_size / 2 + "px"
      }
    }),

  "[persistable] enabled_when_startup": true,
  "[persistable] capture_box_size": 200,

  /** post-constructor */
  "[subscribe('@initialized/chrome'), enabled]":
  function onLoad(chrome) 
  {
    var {tanasinn_capture_box} 
      = this.request("command/construct-chrome", this.getTemplate());
    this._box = tanasinn_capture_box;
  },

  "[subscribe('command/show-capture-box'), enabled]":
  function box(position) 
  {
    var x = position.x,
        y = position.y, 
        box = this._box;

    box.style.left = x + "px";
    box.style.top = y + "px";
    box.hidden = false;

    coUtils.Timer.setTimeout(function() box.hidden = true, 500, this);
  }
};

var Resizer = new Abstruct().extends(Component);
Resizer.definition = {

  getTemplate: function getTemplate()
    ({
      parentNode: this.parent,
      tagName: "box",
      id: "tanasinn_" + this.type + "_resize",
      width: 10,
      height: 10,
      style: "cursor: " + this.type + "-resize;",
      listener: [
        {
          type: "mousedown",
          context: this,
          handler: this.onmousedown,
        },
        {
          type: "dragstart",
          context: this,
          handler: this.ondragstart,
        },
      ]
    }),

  /** post-constructor */
  "[subscribe('@initialized/{chrome & renderer & screen}'), enabled]":
  function onLoad(chrome, renderer, screen) 
  {
    this._renderer = renderer;
    this._screen = screen;
    this.request("command/construct-chrome", this.getTemplate());
  },

  /** mousedown event handler. */
  onmousedown: function onmousedown(event) 
  {
    this.request(
      "command/show-capture-box", 
      {
        x: event.clientX, 
        y: event.clientY
      });
  },

  ondragstart: function ondragstart(event)
  {
    var resizer = this._resizer,
        owner_document = this.request("get/root-element").ownerDocument,
        renderer = this._renderer,
        screen = this._screen,
        initial_column = screen.width,
        initial_row = screen.height,
        originX = event.screenX,
        originY = event.screenY;
    
    //this._capture_margin.hidden = true;
    event.stopPropagation(); // cancel defaut behavior
    this.sendMessage("event/resize-session-started", this);

    this.sendMessage(
      "command/add-domlistener",
      {
        target: owner_document,
        type: "mousemove",
        id: "_DRAGGING",
        context: this,

        handler: function onmousemove(event) 
        {
          var char_width, line_height, diffX, diffY,
              column, row, screen_width_cache, screen_height_cache,
              moveX, moveY;

          char_width = renderer.char_width;
          line_height = renderer.line_height;

          diffX = Math.round((event.screenX - originX) / char_width);
          diffY = Math.round((event.screenY - originY) / line_height);

          column = initial_column + ({ e: diffX, w: -diffX }[this.type.slice(-1)] || 0);
          row = initial_row + ({ s: diffY, n: -diffY }[this.type[0]] || 0);

          if (column < 1) {
            column = 1;
          }

          if (row < 1) {
            row = 1;
          }

          screen_width_cache = screen.width;
          screen_height_cache = screen.height;

          this.sendMessage(
            "command/resize-screen", 
            {
              column: column, 
              row: row,
            });

          moveX = this.type.slice(-1) === "w" ? screen_width_cache - screen.width: 0;
          moveY = this.type[0] === "n" ? screen_height_cache - screen.height: 0;

          if (0 !== moveX || 0 !== moveY) {
            this.sendMessage("command/move-by", [moveX * char_width, moveY * line_height]);
          }
          this.sendMessage("command/draw", true);
        }
      });

    this.sendMessage(
      "command/add-domlistener", 
      {
        target: owner_document,
        type: "mouseup",
        id: "_DRAGGING",
        context: this,
        handler: function onmouseup(event) 
        {
          // uninstall listeners.
          this.sendMessage("command/remove-domlistener", "_DRAGGING");
          this.sendMessage("event/resize-session-closed", this);
          this.sendMessage("command/draw", true);
        },
      });
  },

};

var TopLeftResizer = new Class().extends(Resizer);
TopLeftResizer.definition = {

  id: "topleftresizer",

  get parent()
    "#tanasinn_resizer_topleft",

  get type()
    "nw",
};

var TopRightResizer = new Class().extends(Resizer);
TopRightResizer.definition = {

  id: "toprightresizer",

  get parent()
    "#tanasinn_resizer_topright",

  get type()
    "ne",
};

var BottomLeftResizer = new Class().extends(Resizer);
BottomLeftResizer.definition = {

  id: "bottomleftresizer",

  get parent()
    "#tanasinn_resizer_bottomleft",

  get type()
    "sw",
};

var BottomRightResizer = new Class().extends(Resizer);
BottomRightResizer.definition = {

  id: "bottomrightresizer",

  get parent()
    "#tanasinn_resizer_bottomright",

  get type()
    "se",
};

var LeftResizer = new Class().extends(Resizer);
LeftResizer.definition = {

  id: "leftresizer",

  get parent()
    "#tanasinn_resizer_left",

  get type()
    "w",
};

var RightResizer = new Class().extends(Resizer);
RightResizer.definition = {

  id: "rightresizer",

  get parent()
    "#tanasinn_resizer_right",

  get type()
    "e",
};

var TopResizer = new Class().extends(Resizer);
TopResizer.definition = {

  id: "topresizer",

  get parent()
    "#tanasinn_resizer_top",

  get type()
    "n",
};

var BottomResizer = new Class().extends(Resizer);
BottomResizer.definition = {

  id: "bottomresizer",

  get parent()
    "#tanasinn_resizer_bottom",

  get type()
    "s",
};

/**
 * @fn main
 * @brief Module entry point.
 * @param {Broker} broker The Broker object.
 */
function main(broker) 
{
  //if (!coUtils.Runtime.app_name.match(/tanasinn/)) {
    new CaptureBox(broker);
    new TopLeftResizer(broker);
    new TopRightResizer(broker);
    new BottomLeftResizer(broker);
    new BottomRightResizer(broker);
    new LeftResizer(broker);
    new RightResizer(broker);
    new TopResizer(broker);
    new BottomResizer(broker);
  //} else {
  //  new SnapResize(broker);
  //}
}

// EOF
