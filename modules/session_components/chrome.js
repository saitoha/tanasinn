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

/** @package ui
 *
 * [ Chrome Overview ]
 *
 * - Chrome
 */

var Vector3D = new Class();
Vector3D.definitian = {

  x: 0,
  y: 0,
  z: 0,

  initialize: function initialize(x, y, z)
  {
    this.x = x;
    this.y = y;
    this.z = z;
  },

};

var Quatanion = new Class();
Quatanion.definition = {

  x: 0,
  y: 0,
  z: 0,
  w: 0,

  initialize: function initialize(x, y, z, w)
  {
    this.x = x;
    this.y = y;
    this.z = z;
    this.w = w;
  },

};

var matrix = <>
  -moz-transform: matrix3d(
 +1.8000, -1.0000, +1.0000, -0.0003, 
 +1.0000, +1.0000, +1.0000, -0.0016, 
 -1.0000, +0.0000, +1.0000, -0.0000, 
 +0.0000, +0.0000, +0.0000, +2.5000);
</>;
//
//var matrix = <>
//  -moz-transform: matrix3d(
// +0.0001, -1.0000, +0.0000, -0.0000, 
// +1.0000, +0.0001, +0.0000, -0.0000, 
// -0.0000, +0.0000, +0.0001, -1.0000, 
// +0.0000, +0.0000, +1.0000, +1.0000);
//</>;
//
//var matrix = <>
//  -moz-transform: matrix3d(
// +0.0001, -0.0000, -1.0000, -0.0000, 
// +0.0000, +0.0001, +0.0000, +1.0000, 
// +1.0000, +0.0000, +0.0001, -0.0000, 
// +0.0000, -1.0000, +1.0000, +1.0000);
//</>;
//
//
//var matrix = <>
//  -moz-transform: matrix3d(
// +1.0000, -0.0000, -0.0000, +0.0000, 
// +0.0000, +1.0000, -0.0000, -0.0040, 
// +0.0000, +0.0000, +1.0000, -0.0000, 
// +0.0000, -0.0000, +0.0000, +1.0000);
//</>;

//var matrix = <>
//  -moz-transform: perspective(800px);
//  -moz-perspective-origin: 50% 200px;
//</>;

//var matrix = <>
//  -moz-transform: matrix3d(
// +4.0010, -1.0000, +1.0000, -0.0003, 
// +1.0000, +4.0000, +1.0000, -0.0016, 
// -1.0000, +0.0000, +1.0000, -0.0000, 
// +0.0000, +0.0000, +0.0000, +4.5000);
//</>;

//var matrix = <>
//  -moz-transform: matrix3d(
// +1.0000, -0.0000, +0.0000, -0.0000, 
// +0.0000, +1.0000, +0.0000, -0.0040, 
// -0.0000, +0.0000, +1.0000, -0.0000, 
// +0.0000, +0.0000, +0.0000, +1.0000);
//</>;

/**
 * @concept MovableConcept
 */
var MovableConcept = new Concept();
MovableConcept.definition = {

  get id()
    "Movable",

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
    var x, y, target_element;

    [x, y] = coordinate;

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
  "[subscribe('command/move-by'), type('Array -> Undefined'), enabled]":
  function moveBy(offset) 
  {
    var x, y, dom, static_scope, timer,
        left, top, root_element;

    [x, y] = offset;

    static_scope = arguments.callee;
    timer = static_scope.timer;

    if (timer) {
      timer.cancel();
    }

    dom = {
      root_element: this.request("get/root-element"),
    };

    if (this.move_transition) {
      dom.root_element.style.MozTransitionProperty = "left, top";
      dom.root_element.style.MozTransitionDuration = this.move_duration + "ms";
      static_scope.timer = coUtils.Timer.setTimeout(
        function() 
        {
          dom.root_element.style.MozTransitionProperty = "";
          dom.root_element.style.MozTransitionDuration = "0ms";
        }, this.move_duration);
    }

    left = parseInt(dom.root_element.style.left) + x;
    top = parseInt(dom.root_element.style.top) + y;

    this.moveTo([left, top]);
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

  get id()
    "outerchrome",

  get info()
    <plugin>
        <name>{_("Outer Chrome")}</name>
        <description>{
          _("Manages '#tanasinn_outer_chrome' XUL element.")
        }</description>
        <version>0.1.0</version>
    </plugin>,

  "[persistable] enabled_when_startup": true,
  "[persistable, watchable] background_opacity": 0.92,
  "[persistable, watchable] background_color": "#000000",
  "[persistable, watchable] foreground_color": "#ffffff",
  "[persistable, watchable] gradation": true,
  "[persistable, watchable] border_radius": 8,
  "[persistable, watchable] box_shadow": "5px 4px 29px black",
  "[persistable, watchable] use_matrix": false,
  "[persistable, watchable] matrix": 
//  <>
//    matrix3d(
//      +1.0000, -0.0000, +1.0000, -0.0029, 
//      +0.0000, +1.0000, +1.0000, -0.0000, 
//      -1.0000, +0.0000, +1.0000, -0.0000, 
//      +0.0000, +0.0000, +0.0000, +1.6000)
//  </>.toString(),

  <>
    matrix3d(
      +1.8000, -1.0000, +1.0000, -0.0003, 
      +1.0000, +1.0000, +1.0000, -0.0025, 
      -1.0000, +0.0000, +1.0000, -0.0000, 
      +0.0000, +0.0000, +0.0000, +2.0000) 
  </>.toString(),

  get frame_style()
    <>
      -moz-box-shadow: {this.box_shadow};
      box-shadow: {this.box_shadow};
      border-radius: {this.border_radius}px;
      background-image: {this.background}; 
      background-size: 100% 100%; 
      opacity: {this.background_opacity};
      cursor: text;
    </>.toString(),

  get blend_color()
  {
    var f, b, color;

    f = parseInt(this.foreground_color.substr(1), 16);
    b = parseInt(this.background_color.substr(1), 16);
    color = (((((f >>> 16 & 0xff) + (b >>> 16 & 0xff) * 2) / 1.5) | 0) << 16)
              | (((((f >>> 8  & 0xff) + (b >>>  8 & 0xff) * 2) / 1.5) | 0) <<  8) 
              | (((((f        & 0xff) + (b        & 0xff) * 2) / 1.5) | 0) <<  0);
    return (color + 0x1000000)
        .toString(16)
        .replace(/^1/, "#");
  },

  get background() 
  {
    return coUtils.Text.format(
      "-moz-radial-gradient(top,%s,%s)", 
      this.blend_color, this.background_color);
  },

  getImagePath: function getImagePath()
  {
    var path, file;

    path = this._broker.runtime_path + "/" + "images/cover.png";

    file = coUtils.File.getFileLeafFromVirtualPath(path);
    if (!file.exists()) {
        path = "images/cover.png";
        file = coUtils.File.getFileLeafFromVirtualPath(path);
    }
    return coUtils.File.getURLSpec(file);
  },

  "[subscribe('command/reverse-video'), enabled]": 
  function reverseVideo(value) 
  {
    var reverse_color;

    if (value) {

      reverse_color = (parseInt(this.background_color.substr(1), 16) ^ 0x1ffffff)
          .toString(16)
          .replace(/^1/, "#");

      this._frame.style.background 
        = coUtils.Text.format(
          "-moz-linear-gradient(top, %s, %s)", 
          reverse_color, this.blend_color);

    } else {
      this._frame.style.background = this.background;
    }
  },

  "[subscribe('event/special-color-changed'), enabled]": 
  function changeForegroundColor(value) 
  {
    this.foreground_color = coUtils.Color.parseX11ColorSpec(value);
    this._frame.style.cssText = this.frame_style;
  },

  /** 
   * Construct the skelton of user interface with some attributes 
   * and styles. 
   */
  get template()
    ({
      parentNode: this.request("get/root-element"), 
      id: "tanasinn_outer_chrome",
      tagName: "stack",
      hidden: true,
      childNodes: [
        {
          tagName: "box",
          id: "tanasinn_background_frame",
          style: this.frame_style,
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
    }),

  _element: null,
  _frame: null,
  board: null,

// constructor
  /** post initializer. */
  "[install]": 
  function install(broker) 
  {
    // construct chrome elements. 
    var {
      tanasinn_outer_chrome,
      tanasinn_background_frame,  
    } = this.request("command/construct-chrome", this.template);

    this._element = tanasinn_outer_chrome;
    this._frame = tanasinn_background_frame;

    if (this.use_matrix) {
      this.updateTransform();
    }

    if (coUtils.Runtime.app_name.match(/tanasinn/)) {
      this._element.firstChild.style.borderRadius = "0px";
      this._element.firstChild.style.margin = "0px";
    }
  },

  "[uninstall]":
  function uninstall(broker) 
  {
    // destruct chrome elements. 
    if (this._element && this._element.parentNode) {
      this._element.parentNode.removeChild(this._element);
      this._element = null;
    }
  },

  "[subscribe('@command/focus'), pnp]":
  function onFirstFocus() 
  {
    this._element.hidden = false;
  },

  "[listen('click', '#tanasinn_outer_chrome'), pnp]":
  function onclick()
  {
    this.sendMessage("command/focus");
  },

  "[subscribe('variable-changed/outerchrome.{use_matrix | matrix}'), pnp]": 
  function updateTransform() 
  {
    if (this.use_matrix) {
      this._element.style.MozTransform = this.matrix;
    } else {
      this._element.style.MozTransform = "";
    }
  },

  "[subscribe('variable-changed/outerchrome.{background_color | foreground_color | gradation}'), pnp]": 
  function updateColor() 
  {
    this._frame.style.cssText = this.frame_style;
  },

  "[subscribe('variable-changed/outerchrome.{background_opacity | border_radius | box_shadow}'), pnp]": 
  function updateStyle() 
  {
    this._frame.style.cssText = this.frame_style;
  },

  "[subscribe('event/shift-key-down'), enabled]": 
  function onShiftKeyDown() 
  {
    var target;
    
    target = this._element.querySelector("#tanasinn_chrome");
    target.style.cursor = "move";
  },

  "[subscribe('event/shift-key-up'), enabled]": 
  function onShiftKeyUp() 
  {
    var target;

    target = this._element.querySelector("#tanasinn_chrome");
    target.style.cursor = "";
  },

  "[subscribe('event/alt-key-down'), enabled]": 
  function onAltKeyDown() 
  {
    var target;

    target = this._element.querySelector("#tanasinn_chrome");
    target.style.cursor = "crosshair";
  },

  "[subscribe('event/alt-key-up'), enabled]": 
  function onAltKeyUp() 
  {
    var target;

    target = this._element.querySelector("#tanasinn_chrome");
    target.style.cursor = "";
  },

  /** Fired when The session is stopping. */
  "[subscribe('@event/broker-stopping'), enabled]": 
  function onSessionStoping() 
  {
    // clear the memnber "_element"
    if (null !== this._element) {
      if (this._element.parentNode) {
        this._element.parentNode.removeChild(this._element);
      }
      this._element = null;
    }
  }, 

  "[subscribe('command/set-opacity'), enabled]": 
  function setOpacity(opacity, duration) 
  {
    var target;

    // get target element
    target = this._element;

    if (target.style.opacity <= opacity) {
      duration = 0; 
    }

    // transition duration
    duration = duration || 160;

    if (duration) {
      target.style.MozTransitionProperty = "opacity";
      target.style.MozTransitionDuration = duration + "ms";
    }

    // set opacity
    target.style.opacity = opacity;

    coUtils.Timer.setTimeout(
      function clearTransitionParameters() 
      {
        target.style.MozTransitionProperty = "";
        target.style.MozTransitionDuration = "0ms";
      }, duration);
  },

};

/** 
 * @class Chrome
 * @brief Manage a terminal UI and a session.
 */
var Chrome = new Class().extends(Plugin).depends("outerchrome");
Chrome.definition = {

  get id()
    "chrome",

  get info()
    <plugin>
        <name>{_("Inner Chrome")}</name>
        <description>{
          _("Manages '#tanasinn_content' XUL element.")
        }</description>
        <version>0.1.0</version>
    </plugin>,

  get style()
    <>
      margin: {this.margin}px;
      background: {this.background};
    </>,

  get template()
    [
      {
        parentNode: "#tanasinn_chrome",
        tagName: "stack",
        id: "tanasinn_content",
        dir: "ltr",
        childNodes: [
          {
            id: "tanasinn_center_area",
            tagName: "stack",
            style: this.style,
          },
        ],
      },
      {
        parentNode: "#tanasinn_chrome",
        id: "tanasinn_panel_area",
        tagName: "box",
        dir: "ltr",
      },
      {
        parentNode: "#tanasinn_chrome",
        id: "tanasinn_commandline_area",
        tagName: "vbox",
        dir: "ltr",
      },
    ],

  "[persistable] enabled_when_startup": true,

  "[persistable, watchable] margin": 8,
  "[persistable, watchable] background": "transparent",
  "[persistable] inactive_opacity": 0.20,
  "[persistable] resize_opacity": 0.50,

  _element: null,

  "[install]": 
  function install(broker) 
  {
    var {tanasinn_content, tanasinn_center_area} 
      = this.request("command/construct-chrome", this.template);
    this._element = tanasinn_content;
    this._center = tanasinn_center_area;
  },

  "[uninstall]":
  function uninstall(broker) 
  {
    if (this._element && this._element.parentNode) {
      this._element.parentNode.removeChild(this._element);
      this._element = null;
    }
    this._center = null;
  },

  "[subscribe('variable-changed/chrome.{margin | background}'), pnp]": 
  function updateStyle()
  {
    this._center.style.cssText = this.style;
  },

  /** Fired when The session is stopping. */
  "[subscribe('@event/broker-stopping'), enabled]": 
  function onSessionStoping() 
  {
    var target;

    this.sendMessage("command/blur");

    target = this._element;

    if (target.parentNode) {
      target.parentNode.removeChild(target);
    }
  }, 

  "[subscribe('command/query-selector'), enabled]":
  function querySelector(selector) 
  {
    return this.request("get/root-element").querySelector(selector);
  },

  /** Fired when a resize session started. */
  "[subscribe('event/resize-session-started'), enabled]": 
  function onResizeSessionStarted(subject) 
  {
    this.sendMessage("command/set-opacity", this.resize_opacity);
  },

  /** Fired when a resize session closed. */
  "[subscribe('event/resize-session-closed'), enabled]":
  function onResizeSessionClosed()
  {
    this.sendMessage("command/set-opacity", 1.00);
  },

  /** An event handler which is fired when the keyboard focus is got. 
   */
  "[subscribe('event/got-focus'), pnp]":
  function onGotFocus()
  {
    this.onmousedown.enabled = true;
    this.sendMessage("command/set-opacity", 1.00);
  },

  /** An event handler which is fired when the keyboard focus is lost. 
   */
  "[subscribe('event/lost-focus'), pnp]":
  function onLostFocus()
  {
    this.onmousedown.enabled = true;
    this.sendMessage("command/set-opacity", this.inactive_opacity);
  },

  "[listen('mousedown', '#tanasinn_content')]":
  function onmousedown()
  {
    this.sendMessage("command/focus");
  },

};

/**
 * @fn main
 * @brief Module entry point.
 * @param {Broker} Broker The Broker object.
 */
function main(broker) 
{
  new OuterChrome(broker);
  new Chrome(broker);
}


// EOF
