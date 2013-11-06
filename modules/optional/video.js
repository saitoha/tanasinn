/* -*- Mode: JAVASCRIPT; tab-width: 2; indent-tabs-mode: nil; c-basic-offset: 2 -*-
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
 * Portions created by the Initial Developer are Copyright (C) 2010 - 2013
 * the Initial Developer. All Rights Reserved.
 *
 * ***** END LICENSE BLOCK ***** */

"use strict";

/**
 *  @class Video
 */
var Video = new Class().extends(Plugin)
                       .depends("renderer")
                       .depends("cursorstate");
Video.definition = {

  id: "video",

  getInfo: function getInfo()
  {
    return {
      name: _("Video (BETA)"),
      version: "0.1b",
      description: _("Display overlay image on terminal screen.")
    };
  },

  getTemplate: function getTemplate()
  {
    return {
      parentNode: "#tanasinn_center_area",
      tagName: "html:div",
      id: "tanasinn_video_layer",
    };
  },

  "[persistable] enabled_when_startup": false,
  "[persistable] opacity": 0.60,

  _element: null,
  _renderer: null,
  _cursor_state: null,

  /** Installs itself.
   *  @param {InstallContext} context A InstallContext object.
   */
  "[install]":
  function install(context)
  {
    var result = this.request("command/construct-chrome", this.getTemplate());

    this._element = result.tanasinn_video_layer;
    this._renderer = context["renderer"];
    this._cursor_state = context["cursorstate"];
  },

  /** Uninstalls itself.
   */
  "[uninstall]":
  function uninstall()
  {
    if (null !== this._element) {
      this._element.parentNode.removeChild(this._element);
    }

    this._element = null;
    this._renderer = null;
    this._cursor_state = null;
  },

  /** Fired at the keypad mode is changed. */
  "[subscribe('variable-changed/video.opacity'), pnp]":
  function onOpacityChanged()
  {
    this._element.style.opacity = this.opacity;
  },

  "[subscribe('event/keypad-mode-changed')]":
  function onKeypadModeChanged(mode)
  {
    this.onKeypadModeChanged.enabled = false;
    this.close();
  },

  "[subscribe('event/screen-width-changed'), pnp]":
  function onWidthChanged(width)
  {
    this._element.style.width = width + "px";
  },

  "[subscribe('event/screen-height-changed'), pnp]":
  function onHeightChanged(height)
  {
    this._element.style.height = height + "px";
  },

  "[subscribe('@command/focus'), pnp]":
  function onFirstFocus()
  {
    if (this._element) {
      this._element.style.width = this._element.parentNode.boxObject.width + "px";
      this._element.style.height = this._element.parentNode.boxObject.height + "px";
    }
  },

  "[subscribe('sequence/osc/8812'), pnp]":
  function handleSequence(data)
  {
    coUtils.Timer.setTimeout(
      function timerproc()
      {
        var result = data.split(/\s+/),
            col = result[0],
            line = result[1],
            width = result[2],
            height = result[3],
            id = result[4],
            cursor_state = this._cursor_state;

        this.open(cursor_state.positionX - Number(col) + 1,
                  cursor_state.positionY - Number(line) + 1,
                  Number(width),
                  Number(height),
                  id);

      }, this.open_delay, this);
  },

  "[subscribe('command/open-overlay-video'), pnp]":
  function open(left, top, width, height, id)
  {
    // get renderer object
    var renderer = this._renderer,
        result = this.request(
          "command/construct-chrome",
          {
            parentNode: "#tanasinn_video_layer",
            id: tanasinn_video,
            tagName: "html:iframe",
            className: "youtube-player",
            type: "text/html",
            style: {
              position: "absolute",
              opacity: 0.6,
              left: left * renderer.char_width + "px",
              top: top * renderer.line_height + "px",
              width: width * renderer.char_width + "px",
              height: height * renderer.line_height + "px",
            },
            src: "http://www.youtube.com/embed/" + id + "?autoplay=1&enablejsapi=1",
            frameborder: "0",
          });
    this.onKeypadModeChanged.enabled = true;
  },

  "[subscribe('sequence/osc/8813 | command/close-overlay-browser'), pnp]":
  function close()
  {
    var element = this._element;

    while (element.firstChild) {
      element.removeChild(element.firstChild);
    }
  },

} // class Video

/**
 * @fn main
 * @brief Module entry point.
 * @param {Broker} broker The Broker object.
 */
function main(broker)
{
  new Video(broker);
}

// EOF
