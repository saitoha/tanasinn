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
 *  @class OverlayBrowser
 */
var OverlayBrowser = new Class().extends(Plugin)
                                .depends("cursorstate")
                                .depends("renderer");
OverlayBrowser.definition = {

  get id()
    "overlay_browser",

  get info()
    <module>
        <name>{_("OverlayBrowser")}</name>
        <version>0.1</version>
        <description>{
          _("Display Gecko browser on terminal screen.")
        }</description>
    </module>,

  "[persistable] enabled_when_startup": true,
  "[persistable] open_delay": 20,

  _element: null,
 
  /** installs itself. 
   *  @param {Session} session A session object.
   */
  "[install]":
  function install(session) 
  {
    this.open.enabled = true;
    this.close.enabled = true;
    this.handleSequence.enabled = true;
  },

  /** Uninstalls itself.
   *  @param {Session} session A session object.
   */
  "[uninstall]":
  function uninstall(session) 
  {
    if (this._element) {
      this._element.parentNode.removeChild(this._element);
    }

    this._element = null;
    this._overlay = null;

    this.open.enabled = false;
    this.close.enabled = false;
    this.handleSequence.enabled = false;
  },

  "[subscribe('sequence/osc/210')]":
  function handleSequence(data) 
  {
    coUtils.Timer.setTimeout(
      function timerproc() 
      {
        var [col, line, width, height, url] = data.split(" "),
            cursorstate;

        cursorstate = this.dependency["cursorstate"];

        this.open(
          cursorstate.positionX - Number(col) + 1, 
          cursorstate.positionY - Number(line) + 1,
          Number(width), 
          Number(height), 
          url);

      }, this.open_delay, this);
  },

  "[subscribe('command/open-overlay-browser')]":
  function open(left, top, width, height, url) 
  {
    var renderer;

    // get renderer object
    renderer = this.dependency["renderer"];

    this.close();

    // create UI part
    var {
      tanasinn_browser_layer,
    } = this.request("command/construct-chrome", {
      parentNode: "#tanasinn_center_area",
      tagName: "bulletinboard",
      id: "tanasinn_browser_layer",
      childNodes: {
        tagName: "browser",
        id: "tanasinn_browser_overlay",
        src: url,
        left: left * renderer.char_width,
        top: top * renderer.line_height,
        width: width * renderer.char_width,
        height: height * renderer.line_height,
      },
    });

    this._element = tanasinn_browser_layer;

  },

  "[subscribe('sequence/osc/211 | command/close-overlay-browser')]":
  function close(data) 
  {
    var element;

    element = this._element;

    if (null !== element) {
      element.parentNode.removeChild(element);
      this._element = null;
    }
  },

} // class OverlayIndicator

/**
 * @fn main
 * @brief Module entry point.
 * @param {Broker} broker The Broker object.
 */
function main(broker) 
{
  new OverlayBrowser(broker);
}


