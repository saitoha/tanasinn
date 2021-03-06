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
 *  @class Bell
 */
var Bell = new Class().extends(Plugin)
                      .depends("renderer")
                      .depends("screen")
                      ;
Bell.definition = {

  id: "bell",

  /** plugin information */
  getInfo: function getInfo()
  {
    return {
      name: _("Bell"),
      version: "0.2.0",
      description: _("Enables it to show visual bell / audio bell.")
    };
  },

  /** UI template */
  getTemplate: function getTemplate()
  {
    return {
      parentNode: "#tanasinn_center_area",
      tagName: "html:canvas",
      id: "tanasinn_visual_bell",
      style: {
        opacity: 0.0,
        margin: "-20px",
      },
      transitionProperty: "opacity",
    };
  },

  "[persistable] enabled_when_startup": true,

  "[persistable] duration": 150,
  "[persistable] color": "white",
  "[persistable] opacity": 0.25,
  "[persistable] visual_bell": true,
  "[persistable] sound_bell": true,

  _cover: null,
  _renderer: null,
  _screen: null,

  /** Installs itself.
   *  @param {InstallContext} context A InstallContext object.
   */
  "[install]":
  function install(context)
  {
    var result = this.request(
                    "command/construct-chrome",
                    this.getTemplate());

    this._renderer = context["renderer"];
    this._screen = context["screen"];

    this._cover = result.tanasinn_visual_bell;
    this.onFirstFocus();
  },

  /** Uninstalls itself.
   */
  "[uninstall]":
  function uninstall()
  {
    if (null !== this._cover) {
      this._cover.parentNode.removeChild(this._cover);
      this._cover = null;
    }
  },

  "[subscribe('@command/focus'), pnp]":
  function onFirstFocus()
  {
    var renderer = this._renderer,
        screen = this._screen;

    this._cover.width = renderer.char_width * screen.getWidth();
    this._cover.height = renderer.line_height * screen.getHeight();
  },

  /** called when logical screen width is changed */
  "[subscribe('event/screen-width-changed'), pnp]":
  function onWidthChanged(width)
  {
    var cover = this._cover;

    if (cover) {
      cover.width = width;
    }
  },

  /** called when logical height width is changed */
  "[subscribe('event/screen-height-changed'), pnp]":
  function onHeightChanged(height)
  {
    var cover = this._cover;

    if (cover) {
      cover.height = height;
    }
  },

  /** called when BEL(\x07) is detected */
  "[subscribe('sequence/bel'), pnp]":
  function onBell()
  {
    coUtils.Timer.setTimeout(function() {
      if (this.visual_bell) {
        this.visualBell();
      }
      if (this.sound_bell) {
        this.beep();
      }
    }, 10, this);
  },

  _showCover: function _showCover()
  {
    this._cover.style.opacity = this.opacity;
  },

  _hideCover: function _hideCover()
  {
    this._cover.style.opacity = 0.0;
  },

  /** Plays visual bell effect. */
  visualBell: function visualBell()
  {
    var cover = this._cover;

    if (cover) {
      cover.style.backgroundColor = this.color;
      this._showCover();
      cover.style.transitionDuration = this.duration + "ms";
      coUtils.Timer.setTimeout(this._hideCover, this.duration, this);
    }
  },

  /** Plays 'beep' sound asynchronously. */
  beep: function beep()
  {
    var sound = coUtils.Components.getSound();

    sound.beep();
    //sound.playSystemSound("Blow");
  },

  /** test */
  "[test]":
  function()
  {
    var enabled = this.enabled;

    try {
      this.enabled = false;
      this.enabled = true;
      this.enabled = false;
    } finally {
      this.enabled = enabled;
    }
  },


} // class Bell


/**
 * @fn main
 * @brief Module entry point.
 * @param {Broker} broker The Broker object.
 */
function main(broker)
{
  new Bell(broker);
}


// EOF
