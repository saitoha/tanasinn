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

var Canvas = new Class();
Canvas.definition = {

  initialize: function initialize(canvas)
  {
    this._canvas = canvas;
  }, 

  dispose: function dispose()
  {
  }

};

/**
 * @class W3m
 * @fn Handle OSC command and draw w3m's inline image.
 */
var W3m = new Class().extends(Plugin).depends("renderer");
W3m.definition = {

  get id()
    "w3m",

  get info()
    <plugin>
        <name>{_("w3m")}</name>
        <description>{
          _("Makes it Cooperate with w3m.")
        }</description>
        <version>0.1</version>
    </plugin>,

  get template()
    ({
      parentNode: "#tanasinn_center_area",
      tagName: "html:canvas",
      id: "tanasinn_w3m_canvas",
    }),

  "[persistable] enabled_when_startup": true,

  _canvas: null,
  _context: null,
  _cache_holder: null,

  /** Installs itself. 
   *  @param {Broker} broker A Broker object.
   */ 
  "[install]":
  function install(broker) 
  {
    var renderer,
        { tanasinn_w3m_canvas } = this.request(
          "command/construct-chrome", 
          this.template);

    renderer = this.dependency["renderer"];
    // set initial size.
    this._canvas = tanasinn_w3m_canvas;
    this._context = this._canvas.getContext("2d");

    this.onWidthChanged.enabled = true;
    this.onHeightChanged.enabled = true;
    this.onFirstFocus.enabled = true;
    this.onKeypadModeChanged.enabled = true;
    this.osc99.enabled = true;

  }, 

  /** Uninstall itself. 
   *  @param {Broker} broker A Broker object.
   */
  "[uninstall]":
  function uninstall(broker) 
  {
    this.onWidthChanged.enabled = false;
    this.onHeightChanged.enabled = false;
    this.onFirstFocus.enabled = false;
    this.onKeypadModeChanged.enabled = false;
    this.osc99.enabled = false;
    if (null !== this._canvas) {
      this._canvas.parentNode.removeChild(this._canvas);
      this._canvas = null
    }
    if (null !== this._context) {
      this._context = null;
    }
  },
    
  /** Fired at the keypad mode is changed. */
  "[subscribe('event/keypad-mode-changed')]": 
  function onKeypadModeChanged(mode) 
  {
    var canvas, context;

    canvas = this._canvas;  
    context = canvas.getContext("2d");

    if (canvas && context) {
      context.clearRect(0, 0, canvas.width, canvas.height);
    }
  },

  "[subscribe('@command/focus')]":
  function onFirstFocus() 
  {
    var canvas;

    canvas = this._canvas;

    canvas.width = canvas.parentNode.boxObject.width;
    canvas.height = canvas.parentNode.boxObject.height;
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

  "[subscribe('sequence/osc/99')]":
  function osc99(command) 
  {
    var args, operation, verb;

    args = command.split(":");
    operation = args.shift();     // retrieve operation name.
    verb = this[operation];

    if (verb) {
      verb.apply(this, args); // dispatch command.
    } else {
      coUtils.Debug.reportError(
        _("Unknown w3m command received. '%s'."), 
        operation);
    }
  },

// operations

  /** Process "w3m-draw" command. */
  "w3m-draw": function w3m_draw(bindex, index, x, y, w, h, sx, sy, sw, sh, filename) 
  {
    var cache, broker, image,
        self = this,
        NS_XHTML = "http://www.w3.org/1999/xhtml";

    x = parseInt(x);
    y = parseInt(y);
    h = parseInt(h);
    w = parseInt(w);

    sx = parseInt(sx);
    sy = parseInt(sy);
    sh = parseInt(sh);
    sw = parseInt(sw);

    this._cache_holder = this._cache_holder || {};
    cache = this._cache_holder[filename];
    broker = this._broker;

    image = cache || broker.document.createElementNS(NS_XHTML, "img");//new Image;

    if (cache) {
      this._draw(image, x, y, w, h, sx, sy, sw, sh); // draw immediately.
    } else {
      // draw after the image is fully loaded.
      image.onload = function onload() 
        {
          self._cache_holder[filename] = image;
          self._draw(image, x, y, w, h, sx, sy, sw, sh);
        }
      image.src = "file://" + filename;
    }
  },

  /** Process "w3m-size" command. */
  "w3m-size": function(op, filename)
  {
    var cache_holder, cache, broker, 
        self = this,
        NS_XHTML = "http://www.w3.org/1999/xhtml";

    this._cache_holder = this._cache_holder || {};

    cache_holder = this._cache_holder;
    cache = cache_holder[filename];

    if (cache) {
      this._sendSize(cache); // send immediately.
    } else {
      broker = this._broker;
      cache = broker.document.createElementNS(NS_XHTML, "img");//new Image;
      // get metrics and send after the image is fully loaded.

      cache.onload = function() 
        { 
          cache_holder[filename] = cache; // cache loaded image.
          self._sendSize(cache);
        }

      cache.src = "file://" + filename;
    }
  },

  /** Process "w3m-clear" command. */
  "w3m-clear": function() 
  {
    var context, canvas, width, height;

    context = this._context;
    canvas = this._canvas;
    width = canvas.width;
    height = canvas.height;

    context.clearRect(0, 0, width, height);
  },

  /** Process "w3m-getcharsize" command. */
  "w3m-getcharsize": function(x, y) 
  {
    var canvs, renderer, char_width, line_height, w, h, reply;

    coUtils.Debug.reportMessage(_("w3m-getcharsize called."));

    canvas = this._canvas;
    renderer = this.dependency["renderer"];
    char_width = renderer.char_width;
    line_height = renderer.line_height;
    w = 0 | (x * char_width + 0.5); // round off
    h = 0 | (y * line_height + 0.5);
    reply = [w, " ", h, "\n"].join("");

    this.sendMessage("command/send-to-tty", reply);

    coUtils.Debug.reportMessage(
      _("w3m-getcharsize succeeded. reply: '%d'."), 
      reply);
  },

  /** draws image in specified size.
   */
  _draw: function(image, x, y, w, h, sx, sy, sw, sh) 
  {
    var natural_width, natural_height;

    try {

      natural_width = image.naturalWidth;
      natural_height = image.naturalHeight;

      if (sx >= natural_width || sy >= natural_height) {

        coUtils.Debug.reportMessage(
          _("Invalid metrics was given : [%s]."),
          [sx, sy, sw, sh, x, y, w, h].join(","));
        return; 
      }

      // trim and normalize [sw, sh].
      if (parseInt(sx) + parseInt(sw) >= natural_width) {
        sw = natural_width - sx;
      }
      if (parseInt(sy) + parseInt(sh) >= natural_height) {
        sh = natural_height - sy;
      }
      this._context.drawImage(image, sx, sy, sw, sh, x, y, w, h);

    } catch (e) {
      coUtils.Debug.reportError(e);
      coUtils.Debug.reportMessage(
          [image.naturalWidth,
           image.naturalHeight,
           sx, sy, sw, sh, x, y, w, h].join(";"));
    }
  },

  /** Sends width and height to w3m.
   */
  _sendSize: function _sendSize(image) 
  {
    var width, height, message;

    width = parseInt(image.naturalWidth) || 0;
    if (0 == width) {
      coUtils.Debug.reportWarning(
        _("image.naturalWidth is zero. source: '%s'."), filename);
    }

    height = parseInt(image.naturalHeight) || 0;
    if (0 == height) {
      coUtils.Debug.reportWarning(
        _("image.naturalHeight is zero. source: '%s'."), filename);
    }

    message = coUtils.Text.format("%d %d\n", width, height);

    this.sendMessage("command/send-to-tty", message);
  },

};

/**
 * @fn main
 * @brief Module entry point.
 * @param {Broker} broker The Broker object.
 */
function main(broker) 
{
  new W3m(broker);
}

// EOF
