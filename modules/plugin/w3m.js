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
 * The Original Code is coTerminal
 *
 * The Initial Developer of the Original Code is
 * Hayaki Saito.
 * Portions created by the Initial Developer are Copyright (C) 2010 - 2011
 * the Initial Developer. All Rights Reserved.
 *
 * ***** END LICENSE BLOCK ***** */

/**
 * @class W3m
 * @fn Handle OSC command and draw w3m's inline image.
 */
let W3m = new Class().extends(Plugin);
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
      parentNode: "#coterminal_center_area",
      tagName: "html:canvas",
      id: "coterminal_w3m_canvas",
//      style: "border: solid 1px red",
    }),

  _canvas: null,
  _context: null,
  _cache_holder: null,
  _renderer: null,

  /** post-constructor */
  "[subscribe('@initialized/renderer'), enabled]": 
  function onLoad(renderer) 
  {
    this._cache_holder = {};
    this._renderer = renderer;
    this.enabled = this.enabled_when_startup;
  },

  /** Installs itself. 
   *  @param {Session} session A session object.
   */ 
  install: function install(session) 
  {
    let renderer = this._renderer;
    let {coterminal_w3m_canvas} = session.uniget(
      "command/construct-chrome", this.template);
    // set initial size.
    this._canvas = coterminal_w3m_canvas;
    this._canvas.width = this._canvas.parentNode.boxObject.width;
    this._canvas.height = this._canvas.parentNode.boxObject.height;
    this._context = this._canvas.getContext("2d");

    this.onWidthChanged.enabled = true;
    this.onHeightChanged.enabled = true;
    this.osc99.enabled = true;

  }, 

  /** Uninstall itself. 
   *  @param {Session} session A session object.
   */
  uninstall: function uninstall(session) 
  {
    this.onWidthChanged.enabled = false;
    this.onHeightChanged.enabled = false;
    this.osc99.enabled = false;
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
    let args = command.split(":");
    let operation = args.shift();     // retrieve operation name.
    let verb = this[operation];
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
    x = parseInt(x);
    y = parseInt(y);
    h = parseInt(h);
    w = parseInt(w);
    sx = parseInt(sx);
    sy = parseInt(sy);
    sh = parseInt(sh);
    sw = parseInt(sw);
    let cache = this._cache_holder[filename];
    let session = this._broker;
    const NS_XHTML = "http://www.w3.org/1999/xhtml";
    let image = cache || session.document.createElementNS(NS_XHTML, "img");//new Image;
    if (cache) {
      this._draw(image, x, y, w, h, sx, sy, sw, sh); // draw immediately.
    } else {
      // draw after the image is fully loaded.
      let self = this;
      image.onload = function onload() {
        self._cache_holder[filename] = image;
        self._draw(image, x, y, w, h, sx, sy, sw, sh);
      }
      image.src = "file://" + filename;
    }
  },

  /** Process "w3m-size" command. */
  "w3m-size": function(op, filename)
  {
    let cacheHolder = this._cache_holder;
    let cache = cacheHolder[filename];
    if (cache) {
      this._sendSize(cache); // send immediately.
    } else {
      let session = this._broker;
      const NS_XHTML = "http://www.w3.org/1999/xhtml";
      let cache = session.document.createElementNS(NS_XHTML, "img");//new Image;
      // get metrics and send after the image is fully loaded.
      let self = this;
      cache.onload = function() { 
        cacheHolder[filename] = cache; // cache loaded image.
        self._sendSize(cache);
      }
      cache.src = "file://" + filename;
    }
  },

  /** Process "w3m-clear" command. */
  "w3m-clear": function() 
  {
    let context = this._context;
    let canvas = this._canvas;
    let width = canvas.width;
    let height = canvas.height;
    context.clearRect(0, 0, width, height);
  },

  /** Process "w3m-getcharsize" command. */
  "w3m-getcharsize": function(x, y) 
  {
    coUtils.Debug.reportMessage(_("w3m-getcharsize called."));
    let canvas = this._canvas;
    let renderer = this._renderer;
    let char_width = renderer.char_width;
    let line_height = renderer.line_height;
    let w = 0 | (x * char_width + 0.5); // round off
    let h = 0 | (y * line_height + 0.5);
    let reply = [w, " ", h, "\n"].join("");
    let session = this._broker;
    session.notify("command/send-to-tty", reply);
    coUtils.Debug.reportMessage(
      _("w3m-getcharsize succeeded. reply: '%d'."), 
      reply);
  },

  /** draws image in specified size.
   */
  _draw: function(image, x, y, w, h, sx, sy, sw, sh) 
  {
    try {
      let naturalWidth = image.naturalWidth;
      let naturalHeight = image.naturalHeight;
      if (sx >= naturalWidth || sy >= naturalHeight) {
        coUtils.Debug.reportMessage(
          _("Invalid metrics was given : [%s]."),
          [sx, sy, sw, sh, x, y, w, h].join(","));
        return; 
      }
      // trim and normalize [sw, sh].
      if (parseInt(sx) + parseInt(sw) >= naturalWidth) {
        sw = naturalWidth - sx;
      }
      if (parseInt(sy) + parseInt(sh) >= naturalHeight) {
        sh = naturalHeight - sy;
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

    let width = parseInt(image.naturalWidth) || 0;
    if (0 == width) {
      coUtils.Debug.reportWarning(
        _("image.naturalWidth is zero. source: '%s'."), filename);
    }

    let height = parseInt(image.naturalHeight) || 0;
    if (0 == height) {
      coUtils.Debug.reportWarning(
        _("image.naturalHeight is zero. source: '%s'."), filename);
    }
    let message = coUtils.Text.format("%d %d\n", width, height);
    let session = this._broker;
    session.notify("command/send-to-tty", message);
  },

}

/**
 * @fn main
 * @brief Module entry point.
 * @param {Process} process The Process object.
 */
function main(process) 
{
  process.subscribe(
    "initialized/session", 
    function(session) new W3m(session));
}

