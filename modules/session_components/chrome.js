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
 * @aspect Movable
 *
 */
let Movable = new Aspect();
Movable.definition = {

  /**
   * @fn moveTo
   * @brief Move terminal window.
   */
  "[subscribe('command/move-to'), enabled]":
  function moveTo(coordinate) 
  {
    let [x, y] = coordinate;
    let session = this._broker;
    let target_element = session.root_element//.parentNode;
    if (x < -target_element.boxObject.width) x = 0;
    if (y < -target_element.boxObject.height) y = 0;
    target_element.style.left = x + "px";
    target_element.style.top = y + "px";
  },

  /**
   * @fn moveBy
   * @brief Move terminal window.
   */
  "[subscribe('command/move-by'), enabled]":
  function moveBy(offset) 
  {
    let [x, y] = offset;
    let session = this._broker;
    let target_element = session.root_element//.parentNode;
    let style = target_element.style;
    let static_scope = arguments.callee;
    let timer = static_scope.timer;
    if (timer) {
      timer.cancel();
    }
    const duration = 80; // in millisecond order.
    style.MozTransitionProperty = "left, top";
    style.MozTransitionDuration = duration + "ms";
    let left = parseInt(style.left) + x;
    let top = parseInt(style.top) + y;
    this.moveTo([left, top]);
    static_scope.timer = coUtils.Timer.setTimeout(function() 
    {
      style.MozTransitionProperty = "";
      style.MozTransitionDuration = "0ms";
    }, duration);
  },

};

/** 
 * @class OuterChrome
 * @brief Manage a terminal UI and a session.
 */
let OuterChrome = new Class().extends(Plugin)
                             .mix(Movable);
OuterChrome.definition = {

  get id()
    "outerchrome",

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
          style: <>
            -moz-box-shadow: 5px 4px 29px black;
            border-radius: 8px;
            background: -moz-linear-gradient(top, #444, #000);
            opacity: 0.7;
          </>,
        },
        {
          tagName: "grid",
          className: "tanasinn",
          style: <>
          </>,
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

    if (coUtils.Runtime.app_name.match(/tanasinn/)) {
      this._element.firstChild.style.borderRadius = "0px";
      this._element.firstChild.style.margin = "0px";
    }
  },

  "[subscribe('uninstall/outerchrome'), enabled]": 
  function uninstall(session) 
  {
    // destruct chrome elements. 
    if (this._element && this._element.parentNode) {
      this._element.parentNode.removeChild(this._element);
      this._element = null;
    }
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
  "[subscribe('@event/session-stopping'), enabled]": 
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

  get template()
    [
      {
        parentNode: "#tanasinn_chrome",
        tagName: "stack",
        id: "tanasinn_content",
        childNodes: [
          {
            id: "tanasinn_center_area",
            tagName: "stack",
            style: <>
              margin: {this.margin}px;
            </>,
          },
        ],
      },
      {
        parentNode: "#tanasinn_chrome",
        id: "tanasinn_panel_area",
        tagName: "box",
        style: <>
        //  border: solid green 5px;
        </>,
      },
      {
        parentNode: "#tanasinn_chrome",
        id: "tanasinn_commandline_area",
        tagName: "box",
        style: <>
        //  border: solid red 5px;
        </>,
      },
    ],

  "[persistable] margin": 8,
  "[persistable] inactive_opacity": 0.20,

  _element: null,

  "[subscribe('install/chrome'), enabled]": 
  function install(session) 
  {
    let {tanasinn_content} 
      = session.uniget("command/construct-chrome", this.template);
    this._element = tanasinn_content;
    this.onGotFocus.enabled = true;
    this.onLostFocus.enabled = true;
  },

  "[subscribe('uninstall/chrome'), enabled]": 
  function uninstall(session) 
  {
    this.onGotFocus.enabled = false;
    this.onLostFocus.enabled = false;
    if (this._element && this._element.parentNode) {
      this._element.parentNode.removeChild(this._element);
      this._element = null;
    }
  },

  /** Fired when The session is stopping. */
  "[subscribe('@event/session-stopping'), enabled]": 
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
    session.notify("command/set-opacity", 0.50);
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



