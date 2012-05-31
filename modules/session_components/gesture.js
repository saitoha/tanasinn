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
 *  @class Gesture
 */
var Gesture = new Class().extends(Plugin);
Gesture.definition = {

  get id()
    "gesture",

  get info()
    <module>
        <name>{_("Gesture (BETA)")}</name>
        <description>{
          _("Interpret mouse gestures.")
        }</description>
        <version>0.1b</version>
    </module>,

  get template()
    ({
      parentNode: "#tanasinn_center_area",
      tagName: "box",
      orient: "vertical",
      hidden: true,
      id: "tanasinn_gesture_frame",
      childNodes: {
        tagName: "html:canvas",
        id: "tanasinn_gesture_canvas",
      },
    }),

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
   *  @param {Session} session A session object.
   */
  "[install]":
  function install(session) 
  {
    let {tanasinn_gesture_frame, tanasinn_gesture_canvas}
      = session.uniget("command/construct-chrome", this.template);
    this._frame = tanasinn_gesture_frame;
    this._canvas = tanasinn_gesture_canvas;
    this.onWidthChanged.enabled = true;
    this.onHeightChanged.enabled = true;
    this.ondragstart.enabled = true;
  },

  /** Uninstalls itself.
   *  @param {Session} session A session object.
   */
  "[uninstall]":
  function uninstall(session) 
  {
    if (this._frame) {
      this._frame.parentNode.removeChild(this._element);
      this._frame = null;
    }
    this._canvas = null;
    this.onWidthChanged.enabled = false;
    this.onHeightChanged.enabled = false;
    this.ondragstart.enabled = false;
    this.ondragend.enabled = false;
  },

  "[subscribe('event/screen-width-changed')]": 
  function onWidthChanged(width) 
  {
    this._canvas.width = width;
  },

  "[subscribe('event/screen-height-changed')]": 
  function onHeightChanged(height) 
  {
    this._canvas.height = height;
  },

  "[listen('mousedown', '#tanasinn_outer_chrome')]":
  function ondragstart(event) 
  {
    if (event.ctrlKey && !event.altKey && !event.shiftKey) {
      this.onmousemove.enabled = true;
      this.ondragend.enabled = true;
      this._frame.hidden = false;
      let x = event.screenX - this._frame.boxObject.screenX;
      let y = event.screenY - this._frame.boxObject.screenY;
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
    let canvas = this._canvas;
    let context = canvas.getContext("2d");
    let broker = this._broker;
    let x = event.screenX - this._frame.boxObject.screenX;
    let y = event.screenY - this._frame.boxObject.screenY;
    if (this._position) {
      let [previousX, previousY] = this._position;
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


