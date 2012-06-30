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
var OverlayImage = new Class().extends(Plugin)
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
    }),

  "[persistable] enabled_when_startup": false,
  "[persistable] open_delay": 20,

  _canvas: null,
 
  /** installs itself. 
   *  @param {Broker} broker A broker object.
   */
  "[install]":
  function install(broker) 
  {
    var {tanasinn_image_canvas} = this.request(
      "command/construct-chrome", this.template);
    this._canvas = tanasinn_image_canvas;
    this.draw.enabled = true;
    this.clear.enabled = true;
    this.onWidthChanged.enabled = true;
    this.onHeightChanged.enabled = true;
    this.onKeypadModeChanged.enabled = true;
  },

  /** Uninstalls itself.
   *  @param {Broker} broker A broker object.
   */
  "[uninstall]":
  function uninstall(broker) 
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
    var canvas, context;

    canvas = this._canvas;  
    if (canvas) {
      canvas.width = canvas.parentNode.boxObject.width;
      canvas.height = canvas.parentNode.boxObject.height;
    }

    context = canvas.getContext("2d");
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
    var canvas, renderer, x, y, w, h, filename,
        pixel_x, pixel_y, pixel_w, pixe._h,
        cache, image, cache_holder,
        NS_XHTML = "http://www.w3.org/1999/xhtml";

    canvas = {
      context: this._canvas.getContext("2d")
    };
    renderer = this.dependency["renderer"];

    var {char_width, line_height} = renderer;
    
    [x, y, w, h, filename] = data.split(";");

    pixel_x = Number(x) * char_width;
    pixel_y = Number(y) * line_height;
    pixel_w = Number(w) * char_width;
    pixel_h = Number(h) * line_height;

    this._cache_holder = this._cache_holder || {};

    cache = this._cache_holder[filename];
    image = cache 
      || this.request("get/root-element").ownderDocument.createElementNS(NS_XHTML, "img");
    if (cache) {
      // draw immediately.
      canvas.context.drawImage(image, pixel_x, pixel_y, pixel_w, pixel_h);
    } else {
      // draw after the image is fully loaded.
      cache_holder = this._cache_holder;
      image.onload = function onload()
      {
        cache_holder[filename] = image;
        canvas.context.drawImage(image, pixel_x, pixel_y, pixel_w, pixel_h);
      }
      image.src = filename;
    }

    //this.sendMessage("command/report-overlay-message", data);
  },

  "[subscribe('sequence/osc/213')]":
  function clear(data) 
  {
    var context, renderer, x, y, w, h,
        pixel_x, pixel_y, pixel_w, pixel_h;

    context = this._canvas.getContext("2d");
    renderer = this.dependency["renderer"];
    var {char_width, line_height} = renderer;

    [x, y, w, h] = data.split(";")
      .map(function(s, index) Number(s));

    pixel_x = x * char_width;
    pixel_y = y * line_height;
    pixel_w = w * char_width;
    pixel_h = h * line_height;

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

// EOF
