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
 *  @class OverlayImage
 */
let OverlayImage = new Class().extends(Plugin)
                              .depends("renderer");
OverlayImage.definition = {

  get id()
    "overlay_image",

  get info()
    <module>
        <name>{_("Overlay Image (BETA)")}</name>
        <version>0.1b</version>
        <description>{
          _("Display overlay image on terminal screen.")
        }</description>
    </module>,

  get template()
    ({
      parentNode: "#tanasinn_center_area",
      tagName: "html:canvas",
      id: "tanasinn_image_canvas",
      //style: <>
      //  border: solid 1px red;
      //</>,
    }),

  "[persistable] enabled_when_startup": true,
  "[persistable] open_delay": 20,

  _canvas: null,
 
  /** installs itself. 
   *  @param {Session} session A session object.
   */
  "[subscribe('install/overlay_image'), enabled]":
  function install(session) 
  {
    let {tanasinn_image_canvas} = session.uniget(
      "command/construct-chrome", this.template);
    this._canvas = tanasinn_image_canvas;
    this.draw.enabled = true;
    this.clear.enabled = true;
    this.onWidthChanged.enabled = true;
    this.onHeightChanged.enabled = true;
    this.onKeypadModeChanged.enabled = true;
  },

  /** Uninstalls itself.
   *  @param {Session} session A session object.
   */
  "[subscribe('uninstall/overlay_image'), enabled]":
  function uninstall(session) 
  {
    if (this._canvas) {
      this._canvas.parentNode.removeChild(this._canvas);
    }

    this._canvas = null;

    this.draw.enabled = false;
    this.clear.enabled = false;
    this.onWidthChanged.enabled = false;
    this.onHeightChanged.enabled = false;
    this.onKeypadModeChanged.enabled = false;
  },
    
  /** Fired at the keypad mode is changed. */
  "[subscribe('event/keypad-mode-changed')]": 
  function onKeypadModeChanged(mode) 
  {
    let canvas = this._canvas;  
    if (canvas) {
      canvas.width = canvas.parentNode.boxObject.width;
      canvas.height = canvas.parentNode.boxObject.height;
    }
    let context = canvas.getContext("2d");
    if (canvas && context) {
      context.clearRect(0, 0, canvas.width, canvas.height);
    }
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

  "[subscribe('@command/focus'), enabled]":
  function onFirstFocus() 
  {
    if (this._canvas) {
      this._canvas.width = this._canvas.parentNode.boxObject.width;
      this._canvas.height = this._canvas.parentNode.boxObject.height;
    }
  },

  "[subscribe('sequence/osc/212')]":
  function draw(data) 
  {
    let broker = this._broker;
    let canvas = {
      context: this._canvas.getContext("2d")
    };
    let renderer = this.dependency["renderer"];
    let {char_width, line_height} = renderer;
    let [x, y, w, h, filename] = data.split(";");
    let pixel_x = Number(x) * char_width;
    let pixel_y = Number(y) * line_height;
    let pixel_w = Number(w) * char_width;
    let pixel_h = Number(h) * line_height;
    this._cache_holder = this._cache_holder || {};
    let cache = this._cache_holder[filename];
    let session = this._broker;
    const NS_XHTML = "http://www.w3.org/1999/xhtml";
    let image = cache 
      || broker.document.createElementNS(NS_XHTML, "img");
    if (cache) {
      // draw immediately.
      canvas.context.drawImage(image, pixel_x, pixel_y, pixel_w, pixel_h);
    } else {
      // draw after the image is fully loaded.
      let cache_holder = this._cache_holder;
      image.onload = function onload() {
        cache_holder[filename] = image;
        canvas.context.drawImage(image, pixel_x, pixel_y, pixel_w, pixel_h);
      }
      image.src = filename;
    }

    //broker.notify("command/report-overlay-message", data);
  },

  "[subscribe('sequence/osc/213')]":
  function clear(data) 
  {
    let broker = this._broker;
    let context = this._canvas.getContext("2d");
    let renderer = this.dependency["renderer"];
    let {char_width, line_height} = renderer;
    let [x, y, w, h] = data.split(";")
      .map(function(s, index) Number(s));
    let pixel_x = x * char_width;
    let pixel_y = y * line_height;
    let pixel_w = w * char_width;
    let pixel_h = h * line_height;
    context.clearRect(pixel_x, pixel_y, pixel_w, pixel_h);
  },

} // class OverlayImage

/**
 * @fn main
 * @brief Module entry point.
 * @param {Broker} broker The Broker object.
 */
function main(broker) 
{
  new OverlayImage(broker);
}

