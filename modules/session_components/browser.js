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
 *  @class OverlayBrowser
 */
var OverlayBrowser = new Class().extends(Plugin)
                                .depends("cursorstate")
                                .depends("renderer");
OverlayBrowser.definition = {

  id: "overlay_browser",

  getInfo: function getInfo()
  {
    return {
      name: _("OverlayBrowser"),
      version: "0.1",
      description: _("Display Gecko browser on terminal screen.")
    };
  },

  "[persistable] enabled_when_startup": false,
  "[persistable] open_delay": 20,

  _element: null,
  _cursor_state: null,
  _renderer: null,

  /** Installs itself.
   *  @param {InstallContext} context A InstallContext object.
   */
  "[install]":
  function install(context)
  {
    this._cursor_state = context["cursorstate"];
    this._renderer = context["renderer"];
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
    this._overlay = null;
    this._cursor_state = null;
    this._renderer = null;
  },

  "[subscribe('sequence/osc/210'), pnp]":
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
            url = result[4],
            cursorstate = this._cursor_state;

        this.open(cursorstate.positionX - Number(col) + 1,
                  cursorstate.positionY - Number(line) + 1,
                  Number(width),
                  Number(height),
                  url);

      }, this.open_delay, this);
  },

  "[subscribe('command/open-overlay-browser'), pnp]":
  function open(left, top, width, height, url)
  {
    // get renderer object
    var renderer = this._renderer,
        result;

    this.close();

    // create UI part
    result = this.request(
      "command/construct-chrome",
      {
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

    this._element = result.tanasinn_browser_layer;

  },

  "[subscribe('sequence/osc/211 | command/close-overlay-browser'), pnp]":
  function close(data)
  {
    var element = this._element;

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

// EOF
