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
 *  @class Video
 */
var Video = new Class().extends(Plugin)
                       .depends("renderer")
                       .depends("cursorstate");
Video.definition = {

  get id()
    "video",

  get info()
    <module>
        <name>{_("Video (BETA)")}</name>
        <version>0.1b</version>
        <description>{
          _("Display overlay image on terminal screen.")
        }</description>
    </module>,

  get template()
    ({
      parentNode: "#tanasinn_center_area",
      tagName: "html:div",
      id: "tanasinn_video_layer",
      style: "position: absolute;",
    }),

  "[persistable] enabled_when_startup": true,
  "[persistable] opacity": 0.60,

  _element: null,
 
  /** installs itself. 
   *  @param {Broker} broker A broker object.
   */
  "[install]":
  function install(broker) 
  {
    var result;

    result = this.request("command/construct-chrome", this.template);
    this._element = result.tanasinn_video_layer;
  },

  /** Uninstalls itself.
   *  @param {Broker} broker A broker object.
   */
  "[uninstall]":
  function uninstall(broker) 
  {
    if (null !== this._element) {
      this._element.parentNode.removeChild(this._element);
    }

    this._element = null;
  },
    
  /** Fired at the keypad mode is changed. */
  "[subscribe('variable-changed/video.opacity'), pnp]": 
  function onOpacityChanged() 
  {
    this._element.style.opacity = this.opacity;
  },

  "[subscribe('event/keypad-mode-changed'), pnp]": 
  function onKeypadModeChanged(mode) 
  {
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
        var result, col, line, width, height, id,
            cursorstate;

        result = data.split(/\s+/);

        col = result[0];
        line = result[1];
        width = result[2];
        height = result[3];
        id = result[4];

        cursorstate = this.dependency["cursorstate"];

        this.open(
          cursorstate.positionX - Number(col) + 1, 
          cursorstate.positionY - Number(line) + 1,
          Number(width), 
          Number(height), 
          id);

      }, this.open_delay, this);
  },

  "[subscribe('command/open-overlay-video'), pnp]":
  function open(left, top, width, height, id) 
  {
    var renderer;

    // get renderer object
    renderer = this.dependency["renderer"];

    //this.close();
    // create UI part
    var {
      tanasinn_video,
    } = this.request(
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

  },

  "[subscribe('sequence/osc/8813 | command/close-overlay-browser'), pnp]":
  function close() 
  {
    var element;

    element = this._element;

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
