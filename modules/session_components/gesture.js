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
 *  @class Gesture
 */
var Gesture = new Class().extends(Plugin);
Gesture.definition = {

  id: "gesture",

  getInfo: function getInfo()
  {
    return {
      name: _("Gesture (BETA)"),
      version: "0.1b",
      description: _("Interpret mouse gestures.")
    };
  },

  getTemplate: function getTemplate()
  {
    return {
      parentNode: "#tanasinn_center_area",
      tagName: "box",
      orient: "vertical",
      hidden: true,
      id: "tanasinn_gesture_frame",
      childNodes: {
        tagName: "html:canvas",
        id: "tanasinn_gesture_canvas",
      },
    };
  },

  "[persistable] enabled_when_startup": false,

  "[persistable] fadeout_duration": 500,
  "[persistable] opacity": 0.80,
  "[persistable, watchable] color": "white",
  "[persistable, watchable] fontSize": "30px",
  "[persistable, watchable] padding": "0.3em",
  "[persistable, watchable] borderRadius": "0.5em",
  "[persistable, watchable] border": "solid 8px white",
  "[persistable, watchable] background": "-moz-linear-gradient(top, #777, #000)",

  _element: null,
  _timer: null,
 
  /** installs itself. 
   *  @param {Broker} broker A Broker object.
   */
  "[install]":
  function install(broker) 
  {
    var {tanasinn_gesture_frame, tanasinn_gesture_canvas}
      = this.request("command/construct-chrome", this.getTemplate());
    this._frame = tanasinn_gesture_frame;
    this._canvas = tanasinn_gesture_canvas;
  },

  /** Uninstalls itself.
   *  @param {Broker} broker A Broker object.
   */
  "[uninstall]":
  function uninstall(broker) 
  {
    if (this._frame) {
      this._frame.parentNode.removeChild(this._element);
      this._frame = null;
    }
    this._canvas = null;
    this.ondragend.enabled = false;
  },

  "[subscribe('event/screen-width-changed'), pnp]": 
  function onWidthChanged(width) 
  {
    this._canvas.width = width;
  },

  "[subscribe('event/screen-height-changed'), pnp]": 
  function onHeightChanged(height) 
  {
    this._canvas.height = height;
  },

  "[listen('mousedown', '#tanasinn_outer_chrome'), pnp]":
  function ondragstart(event) 
  {
    var x, y;

    if (event.ctrlKey && !event.altKey && !event.shiftKey) {
      this.onmousemove.enabled = true;
      this.ondragend.enabled = true;
      this._frame.hidden = false;

      x = event.screenX - this._frame.boxObject.screenX;
      y = event.screenY - this._frame.boxObject.screenY;

      this._position = [x, y];
    }
  },

  "[listen('mouseup', '#tanasinn_outer_chrome')]":
  function ondragend(event) 
  {
    this.onmousemove.enabled = false;
    this.ondragend.enabled = false;
    this._frame.hidden = true;
    this._position = null;
    event.preventDefault();
  },

  _position: null,

  "[listen('mousemove', '#tanasinn_outer_chrome')]":
  function onmousemove(event) 
  {
    var canvas, context, x, y, previousX, previousY;

    canvas = this._canvas;
    context = canvas.getContext("2d");

    x = event.screenX - this._frame.boxObject.screenX;
    y = event.screenY - this._frame.boxObject.screenY;

    if (this._position) {
      [previousX, previousY] = this._position;
      context.strokeStyle = "white";
      context.fillStyle = "rgb(200, 0, 0)";
      context.beginPath();
      context.moveTo(previousX, previousY);
      context.lineTo(x, y);
      context.stroke();
    }
    this._position = [x, y];
  },

} // class Gesture


/**
 * @fn main
 * @brief Module entry point.
 * @param {Broker} broker The Broker object.
 */
function main(broker) 
{
  new Gesture(broker);
}

// EOF
