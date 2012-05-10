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

/**
 * @concept MovableConcept
 */
let MovableConcept = new Concept();
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
let Movable = new Trait();
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
    let [x, y] = coordinate;
    let broker = this._broker;
    let target_element = broker.root_element;
    if (x < -target_element.boxObject.width) x = 0;
    if (y < -target_element.boxObject.height) y = 0;
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
    let [x, y] = offset;
    let broker = this._broker;
    let static_scope = arguments.callee;
    let timer = static_scope.timer;
    if (timer) {
      timer.cancel();
    }
    if (this.move_transition) {
      broker.root_element.style.MozTransitionProperty = "left, top";
      broker.root_element.style.MozTransitionDuration = this.move_duration + "ms";
      static_scope.timer = coUtils.Timer.setTimeout(function() 
      {
        broker.root_element.style.MozTransitionProperty = "";
        broker.root_element.style.MozTransitionDuration = "0ms";
      }, this.move_duration);
    }
    let left = parseInt(broker.root_element.style.left) + x;
    let top = parseInt(broker.root_element.style.top) + y;
    this.moveTo([left, top]);
  },

};

/** 
 * @class OuterChrome
 * @brief Manage a terminal UI and a session.
 */
let OuterChrome = new Class().extends(Plugin)
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
  "[persistable, watchable] background_opacity": 0.87,
  "[persistable, watchable] background_color": "#000000",
  "[persistable, watchable] foreground_color": "#ffffff",
  "[persistable, watchable] gradation": true,
  "[persistable, watchable] border_radius": 8,
  "[persistable, watchable] box_shadow": "5px 4px 29px black",

  get frame_style()
    <>
      -moz-box-shadow: {this.box_shadow};
      border-radius: {this.border_radius}px;
      background-image: {this.background}; 
      opacity: {this.background_opacity};
      cursor: text;
    </>.toString(),

  get blend_color()
  {
    let f = parseInt(this.foreground_color.substr(1), 16);
    let b = parseInt(this.background_color.substr(1), 16);
    let color = (((((f >>> 16 & 0xff) + (b >>> 16 & 0xff) * 2) / 3) | 0) << 16)
              | (((((f >>> 8  & 0xff) + (b >>>  8 & 0xff) * 2) / 3) | 0) <<  8) 
              | (((((f        & 0xff) + (b        & 0xff) * 2) / 3) | 0) <<  0);
    return (color + 0x1000000)
        .toString(16)
        .replace(/^1/, "#");
  },

  get background() 
  {
    return coUtils.Text.format(
      "-moz-linear-gradient(top,%s,%s)", 
      this.blend_color, this.background_color);
  },

  "[subscribe('command/reverse-video'), enabled]": 
  function reverseVideo(value) 
  {
    if (value) {
      let reverse_color = (parseInt(this.background_color.substr(1), 16) ^ 0x1ffffff)
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

  "[subscribe('sequence/osc/10'), enabled]": 
  function changeForegroundColor(value) 
  {
    this.foreground_color = coUtils.Color.parseX11ColorSpec(value);
    this._frame.style.cssText = this.frame_style;
  },

  "[subscribe('sequence/osc/11'), enabled]": 
  function changeBackgroundColor(value) 
  {
    this.background_color = coUtils.Color.parseX11ColorSpec(value);
    this._frame.style.cssText = this.frame_style;
  },

  /** 
   * Construct the skelton of user interface with some attributes 
   * and styles. 
   */
  get template()
    let (broker = this._broker)
    {
      parentNode: broker.root_element, 
      id: "tanasinn_outer_chrome",
      tagName: "stack",
      hidden: true,
      listener: {
        type: "click",
        handler: function() {
          broker.notify("command/focus");
        },
      },
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
    },

  board: null,

// constructor
  /** post initializer. */
  "[subscribe('install/outerchrome'), enabled]": 
  function install(session) 
  {
    // construct chrome elements. 
    let {
      tanasinn_outer_chrome,
      tanasinn_background_frame,  
    } = session.uniget("command/construct-chrome", this.template);
    this._element = tanasinn_outer_chrome;
    this._frame = tanasinn_background_frame;
    this.updateStyle.enabled = true;
    this.updateColor.enabled = true;

    if (coUtils.Runtime.app_name.match(/tanasinn/)) {
      this._element.firstChild.style.borderRadius = "0px";
      this._element.firstChild.style.margin = "0px";
    }
  },

  "[subscribe('uninstall/outerchrome'), enabled]": 
  function uninstall(session) 
  {
    this.updateStyle.enabled = false;
    this.updateColor.enabled = false;
    // destruct chrome elements. 
    if (this._element && this._element.parentNode) {
      this._element.parentNode.removeChild(this._element);
      this._element = null;
    }
  },

  "[subscribe('@command/focus'), enabled]":
  function onFirstFocus() 
  {
    this._element.hidden = false;
  },

  "[subscribe('variable-changed/outerchrome.{background_color | foreground_color | gradation}')]": 
  function updateColor() 
  {
    this._frame.style.cssText = this.frame_style;
  },

  "[subscribe('variable-changed/outerchrome.{background_opacity | border_radius | box_shadow}')]": 
  function updateStyle() 
  {
    this._frame.style.cssText = this.frame_style;
  },

  "[subscribe('event/shift-key-down'), enabled]": 
  function onShiftKeyDown() 
  {
    let target = this._element.querySelector("#tanasinn_chrome");
    target.style.cursor = "move";
  },

  "[subscribe('event/shift-key-up'), enabled]": 
  function onShiftKeyUp() 
  {
    let target = this._element.querySelector("#tanasinn_chrome");
    target.style.cursor = "";
  },

  "[subscribe('event/alt-key-down'), enabled]": 
  function onAltKeyDown() 
  {
    let target = this._element.querySelector("#tanasinn_chrome");
    target.style.cursor = "crosshair";
  },

  "[subscribe('event/alt-key-up'), enabled]": 
  function onAltKeyUp() 
  {
    let target = this._element.querySelector("#tanasinn_chrome");
    target.style.cursor = "";
  },

  /** Fired when The session is stopping. */
  "[subscribe('@event/broker-stopping'), enabled]": 
  function onSessionStoping() 
  {
    let target = this._element;
    if (target.parentNode) {
      target.parentNode.removeChild(target);
    }
  }, 

  "[subscribe('command/set-opacity'), enabled]": 
  function setOpacity(opacity, duration) 
  {
    let target = this._element;
    if (target.style.opacity <= opacity) {
      duration = 0; 
    }
    duration = duration || 160;
    if (duration) {
      target.style.MozTransitionProperty = "opacity";
      target.style.MozTransitionDuration = duration + "ms";
    }
    target.style.opacity = opacity;
    coUtils.Timer.setTimeout(function() {
      target.style.MozTransitionProperty = "";
      target.style.MozTransitionDuration = "0ms";
    }, duration);
  },

};

/** 
 * @class Chrome
 * @brief Manage a terminal UI and a session.
 */
let Chrome = new Class().extends(Plugin).depends("outerchrome");
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

  "[subscribe('install/chrome'), enabled]": 
  function install(session) 
  {
    let {tanasinn_content, tanasinn_center_area} 
      = session.uniget("command/construct-chrome", this.template);
    this._element = tanasinn_content;
    this._center = tanasinn_center_area;
    this.onGotFocus.enabled = true;
    this.onLostFocus.enabled = true;
    this.updateStyle.enabled = true;
  },

  "[subscribe('uninstall/chrome'), enabled]": 
  function uninstall(session) 
  {
    this.onGotFocus.enabled = false;
    this.onLostFocus.enabled = false;
    this.updateStyle.enabled = false;
    if (this._element && this._element.parentNode) {
      this._element.parentNode.removeChild(this._element);
      this._element = null;
    }
  },

  "[subscribe('variable-changed/chrome.{margin | background}'), enabled]": 
  function updateStyle()
  {
    this._center.style.cssText = this.style;
  },

  /** Fired when The session is stopping. */
  "[subscribe('@event/broker-stopping'), enabled]": 
  function onSessionStoping() 
  {
    let session = this._broker;
    session.notify("command/blur");
    let target = this._element;
    if (target.parentNode) {
      target.parentNode.removeChild(target);
    }
  }, 

  "[subscribe('command/query-selector'), enabled]":
  function querySelector(selector) 
  {
    let session = this._broker;
    return session.root_element.querySelector(selector);
  },

  /** Fired when a resize session started. */
  "[subscribe('event/resize-session-started'), enabled]": 
  function onResizeSessionStarted(subject) 
  {
    let session = this._broker;
    session.notify("command/set-opacity", this.resize_opacity);
  },

  /** Fired when a resize session closed. */
  "[subscribe('event/resize-session-closed'), enabled]":
  function onResizeSessionClosed()
  {
    let session = this._broker;
    session.notify("command/set-opacity", 1.00);
  },

  /** An event handler which is fired when the keyboard focus is got. 
   */
  "[subscribe('event/got-focus')]":
  function onGotFocus()
  {
    this.onmousedown.enabled = true;
    let session = this._broker;
    session.notify("command/set-opacity", 1.00);
  },

  /** An event handler which is fired when the keyboard focus is lost. 
   *  @notify command/focus
   */
  "[subscribe('event/lost-focus')]":
  function onLostFocus()
  {
    this.onmousedown.enabled = true;
    let session = this._broker;
    session.notify("command/set-opacity", this.inactive_opacity);
  },

  "[listen('mousedown', '#tanasinn_content')]":
  function onmousedown()
  {
    let session = this._broker;
    session.notify("command/focus");
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



