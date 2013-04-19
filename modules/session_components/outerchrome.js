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
 * @concept MovableConcept
 */
var MovableConcept = new Concept();
MovableConcept.definition = {

  id: "Movable",

// message concept
  "<command/move-to> :: Array -> Undefined":
  _("Moves window to specified position."),

  "<command/move-by> :: Array -> Undefined":
  _("Moves window by specified offset."),

}; // MovableConcept



/**
 * @trait Movable
 *
 */
var Movable = new Trait();
Movable.definition = {

  "[persistable] move_transition": false,
  "[persistable] move_duration": 180, // in millisecond order.

  /**
   * @fn moveTo
   * @brief Move terminal window.
   */
  "[subscribe('command/move-to'), type('Array -> Undefined'), enabled]":
  function moveTo(coordinate)
  {
    var x = coordinate[0],
        y = coordinate[1],
        target_element = this.request("get/root-element");

    if (x < -target_element.boxObject.width) {
      x = 0;
    }

    if (y < -target_element.boxObject.height) {
      y = 0;
    }

    target_element.style.left = x + "px";
    target_element.style.top = y + "px";
  },

  /**
   * @fn moveBy
   * @brief Move terminal window.
   */
  "[subscribe('command/move-by'), type('Array -> Undefined'), pnp]":
  function moveBy(offset)
  {
    var x = offset[0],
        y = offset[1],
        timer = this._timer,
        dom = {
          root_element: this.request("get/root-element")
        },
        left,
        top,
        root_element;

    if (timer) {
      timer.cancel();
    }

    if (this.move_transition) {
      dom.root_element.style.transitionProperty = "left, top";
      dom.root_element.style.transitionDuration = this.move_duration + "ms";
      this._timer = coUtils.Timer
        .setTimeout(this._onTransitionEnd, this.move_duration, this);
    }

    left = parseInt(dom.root_element.style.left) + x;
    top = parseInt(dom.root_element.style.top) + y;

    this.moveTo([left, top]);
  },

  _onTransitionEnd: function _onTransitionEnd()
  {
    var root_element = this.request("get/root-element");

    root_element.style.transitionProperty = "";
    root_element.style.transitionDuration = "0ms";
  },

};

/**
 * @class OuterChrome
 * @brief Manage a terminal UI and a session.
 */
var OuterChrome = new Class().extends(Plugin)
                             .mix(Movable)
                             .requires("Movable");
OuterChrome.definition = {

  id: "outerchrome",

  /** plugin information */
  getInfo: function getInfo()
  {
    return {
      name: _("Outer Chrome"),
      version: "0.1.0",
      description: _("Manages '#tanasinn_outer_chrome' XUL element.")
    };
  },

  "[persistable] enabled_when_startup": true,
  "[persistable] auto_color_adjustment": false,
  "[persistable, watchable] background_opacity": 0.91,
  "[persistable, watchable] background_color": "#000000",
  "[persistable, watchable] foreground_color": "#ffffff",
  "[persistable, watchable] gradation": true,
  "[persistable, watchable] border_radius": 8,
  "[persistable, watchable] box_shadow": "5px 4px 29px black",

  /** provides current frame style in css-formatted */
  _getFrameStyle: function _getFrameStyle()
  {
    return "box-shadow: " + this.box_shadow + ";" +
           "border-radius: " + this.border_radius + "px;" +
           "background-image: " + this._getBackground() + ";" +
           "background-size: 100% 100%;" +
           "opacity: " + this.background_opacity + ";" +
           "cursor: text;";
  },

  /** returns blended color between foreground and background */
  _getBlendColor: function _getBlendColor()
  {
    var f = parseInt(this.foreground_color.substr(1), 16),
        b = parseInt(this.background_color.substr(1), 16),
        color = (((((f >>> 16 & 0xff) + (b >>> 16 & 0xff) * 2) / 3.0) | 0) << 16)
              | (((((f >>>  8 & 0xff) + (b >>>  8 & 0xff) * 2) / 3.0) | 0) <<  8)
              | (((((f        & 0xff) + (b        & 0xff) * 2) / 3.0) | 0) <<  0);

    return (color + 0x1000000)
        .toString(16)
        .replace(/^1/, "#");
  },

  _getBackground: function _getBackground()
  {
    return coUtils.Text.format(
      "-moz-radial-gradient(top,%s,%s)",
      this._getBlendColor(),
      this.background_color);
  },

  _forceUpdate: function _forceUpdate()
  {
    // force redrawing
    this.moveBy([1, 0])
    this.moveBy([-1, 0])
  },

  _getImagePath: function _getImagePath()
  {
    var path = coUtils.Runtime.getRuntimePath() + "/images/cover.png",
        file = coUtils.File.getFileLeafFromVirtualPath(path);

    if (!file.exists()) {
        path = "images/cover.png";
        file = coUtils.File.getFileLeafFromVirtualPath(path);
    }

    return coUtils.File.getURLSpec(file);
  },

  /** Fired when The session is stopping. */
  "[subscribe('event/before-broker-stopping'), enabled]":
  function onSessionStoping()
  {
    var target = this._frame;

    this.sendMessage("command/blur");

    if (target && target.parentNode) {
      target.parentNode.hidden = true;
      target.parentNode.removeChild(target);
    }
    this._frame = null;

  },

  "[subscribe('command/reverse-video'), pnp]":
  function reverseVideo(value)
  {
    var reverse_color,
        color3byte;

    if (value) {
      color3byte = parseInt(this.background_color.substr(1), 16);
      reverse_color = (color3byte ^ 0x1ffffff)
          .toString(16)
          .replace(/^1/, "#");

      this._frame.style.background
        = "-moz-radial-gradient(top,"
        + reverse_color + ","
        + this._getBlendColor() + ")";
    } else {
      this._frame.style.background = this._getBackground();
    }
    this._forceUpdate();
  },

  "[subscribe('event/special-color-changed'), pnp]":
  function changeForegroundColor(value)
  {
    this.foreground_color = coUtils.Color.parseX11ColorSpec(value);
    this._frame.style.cssText = this._getFrameStyle();
  },

  /**
   * Construct the skelton of user interface with some attributes
   * and styles.
   */
  _getTemplate: function _getTemplate()
  {
    return {
      parentNode: this.request("get/root-element"),
      tagName: "box",
      id: "tanasinn_chrome_root",
      childNodes: {
        id: "tanasinn_outer_chrome",
        tagName: "stack",
        hidden: true,
        childNodes: [
          {
            tagName: "box",
            id: "tanasinn_background_frame",
            style: this._getFrameStyle(),
          },
          {
            tagName: "grid",
            className: "tanasinn",
            dir: "ltr",
            childNodes: {
              tagName: "rows",
              childNodes: [
                {
                  tagName: "row",
                  childNodes: [
                    { tagName: "box", id: "tanasinn_resizer_topleft", },
                    { tagName: "vbox", id: "tanasinn_resizer_top", },
                    { tagName: "box", id: "tanasinn_resizer_topright", },
                  ],
                },
                {
                  tagName: "row",
                  childNodes: [
                    { tagName: "hbox", id: "tanasinn_resizer_left", },
                    { tagName: "vbox", id: "tanasinn_chrome", },
                    { tagName: "hbox", id: "tanasinn_resizer_right", },
                  ]
                },
                {
                  tagName: "row",
                  childNodes: [
                    { tagName: "box", id: "tanasinn_resizer_bottomleft", },
                    { tagName: "vbox", id: "tanasinn_resizer_bottom", },
                    { tagName: "box", id: "tanasinn_resizer_bottomright", },
                  ],
                },
              ],
            },
          },
        ],
      },
    };
  },

  _element: null,
  _frame: null,
  _timer: null,
  _chrome: null,


  /** Installs itself.
   *  @param {InstallContext} context A InstallContext object.
   */
  "[install]":
  function install(context)
  {
    // construct chrome elements.
    var result = this.request("command/construct-chrome", this._getTemplate());

    this._element = result.tanasinn_outer_chrome;
    this._chrome = result.tanasinn_chrome;
    this._frame = result.tanasinn_background_frame;

    if (this.auto_color_adjustment) {
      this.foreground_color = coUtils.Color.inspectContentColor();
      this.background_color = coUtils.Color.reverse(this.foreground_color);
      this.foreground_color = coUtils.Color.adjust(this.foreground_color,
                                                   this.background_color,
                                                   180, 200);
    }
    //if (coUtils.Runtime.app_name.match(/tanasinn/)) {
    //  this._element.firstChild.style.borderRadius = "0px";
    //  this._element.firstChild.style.margin = "0px";
    //}
  },

  /** Uninstalls itself.
   */
  "[uninstall]":
  function uninstall()
  {
    // destruct chrome elements.
    if (null !== this._element) {
      if (this._element.parentNode) {
        if (this._element.parentNode.parentNode) {
          this._element.parentNode.parentNode.removeChild(this._element.parentNode);
        }
      }
      this._element = null;
    }
    if (null !== this._chrome) {
      this._chrome = null;
    }
    if (null !== this._timer) {
      this._timer.cancel();
      this._timer = null;
    }
  },

  "[subscribe('command/show'), pnp]":
  function show()
  {
    this._element.hidden = false;
  },

  "[listen('click', '#tanasinn_outer_chrome'), pnp]":
  function onclick()
  {
    this.sendMessage("command/focus");
  },

  "[subscribe('variable-changed/outerchrome.{background_color | foreground_color | gradation}'), pnp]":
  function updateColor()
  {
    this._frame.style.cssText = this._getFrameStyle();
    this._forceUpdate();
  },

  "[subscribe('variable-changed/outerchrome.{background_opacity | border_radius | box_shadow}'), pnp]":
  function updateStyle()
  {
    this._frame.style.cssText = this._getFrameStyle();
  },

  "[subscribe('event/shift-key-down'), pnp]":
  function onShiftKeyDown()
  {
    var target = this._chrome;

    if (null !== target) {
      target.style.cursor = "move";
    }
  },

  "[subscribe('event/shift-key-up'), pnp]":
  function onShiftKeyUp()
  {
    var target = this._chrome;

    if (null !== target) {
      target.style.cursor = "";
    }
  },

  "[subscribe('event/alt-key-down'), pnp]":
  function onAltKeyDown()
  {
    var target = this._chrome;

    if (null !== target) {
      target.style.cursor = "crosshair";
    }
  },

  "[subscribe('event/alt-key-up'), pnp]":
  function onAltKeyUp()
  {
    var target = this._chrome;

    if (null !== target) {
      target.style.cursor = "";
    }
  },

  "[subscribe('command/set-opacity'), pnp]":
  function setOpacity(opacity, duration)
  {
    // get target element
    var target = this._element;

    if (target.style.opacity <= opacity) {
      duration = 0;
    }

    // transition duration
    duration = duration || 160;

    if (duration) {
      target.style.transitionProperty = "opacity";
      target.style.transitionDuration = duration + "ms";
    }

    // set opacity
    target.style.opacity = opacity;

    coUtils.Timer.setTimeout(
      function clearTransitionParameters()
      {
        target.style.transitionProperty = "";
        target.style.transitionDuration = "0ms";
      }, duration);
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

}; // OuterChrome


/**
 * @fn main
 * @brief Module entry point.
 * @param {Broker} Broker The Broker object.
 */
function main(broker)
{
  new OuterChrome(broker);
}

// EOF
