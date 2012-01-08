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
 * @class ForwardInputIterator
 */ 
let ForwardInputIterator = new Class();
ForwardInputIterator.definition = {

  _value: null,
  _position: 0,

  /** Assign new string data. position is reset. */
  initialize: function initialize(value) 
  {
    this._value = value;
    this._position = 0;
  },

  /** Returns single byte code point. */
  current: function current() 
  {
    return this._value.charCodeAt(this._position);
  },

  /** Moves to next position. */
  moveNext: function moveNext() 
  {
    ++this._position;
  },

  /** Returns whether scanner position is at end. */
  get isEnd() 
  {
    return this._position >= this._value.length;
  },
};

/**
 *  @class OverlayIndicator
 */
let OverlayIndicator = new Class().extends(Plugin);
OverlayIndicator.definition = {

  get id()
    "overlayindicator",

  get info()
    <module>
        <name>Overlay Indicator</name>
        <description>{
          _("Enables overlay indicator.")
        }</description>
        <version>0.1</version>
    </module>,

  get template()
    ({
      parentNode: "#coterminal_center_area",
      tagName: "box",
      orient: "vertical",
      align: "center",
      valign: "middle",
      style: {
        opacity: 0.00,
        maxWidth: "0px",
      },
      id: "coterminal_overlay_indicator",
      MozTransitionProperty: "opacity",
      childNodes: {
        tagName: "label",
        crop: "end",
        id: "coterminal_overlay_indicator_content",
        style: {
          background: "black",
          color: "white",
          fontSize: "30px",
          padding: "0.3em", 
          borderRadius: "0.5em", 
          border: "solid 8px white",
        },
      },
    }),

  "[persistable] duration": 500,
  "[persistable] color": "white",
  "[persistable] opacity": 0.80,
  "[persistable] visual_bell": true,
  "[persistable] sound_bell": true,

  _element: null,
  
  /** post-constructor */
  "[subscribe('initialized/{chrome & decoder}'), enabled]":
  function onLoad(chrome, decoder) 
  {
    this._decoder = decoder;
    this.enabled = this.enabled_when_startup;
  },
 
  /** installs itself. 
   *  @param {Session} session A session object.
   */
  "[subscribe('install/' + this.id)]":
  function install(session) 
  {
    let {coterminal_overlay_indicator, coterminal_overlay_indicator_content}
      = session.uniget("command/construct-chrome", this.template);
    this._element = coterminal_overlay_indicator;
    this._content = coterminal_overlay_indicator_content;
    this.report.enabled = true;
    this.onScreenSizeChanged.enabled = true;
    this.onFontSizeChanged.enabled = true;
    this.onCommandReceived.enabled = true;
  },

  /** Uninstalls itself.
   *  @param {Session} session A session object.
   */
  "[subscribe('uninstall/' + this.id)]":
  function uninstall(session) 
  {
    if (this._element) {
      this._element.parentNode.removeChild(this._element);
    }
    this.report.enabled = false;
    this.onScreenSizeChanged.enabled = false;
    this.onFontSizeChanged.enabled = false;
    this.onCommandReceived.enabled = false;
  },

  "[subscribe('command/report-overlay-message')]":
  function report(message) 
  {
    this.print(message);
    this.show(2000);
  },

  show: function show(timeout) 
  {
    this._enabled = true;
    let style = this._element.style;
    style.MozTransitionDuration = "0ms";
    style.opacity = this.opacity;
    if (timeout) {
      coUtils.Timer.setTimeout(function() {
        if (this._enabled) {
          this.hide();
        }
      }, timeout, this);
    }
  },

  hide: function hide() 
  {
    this._enabled = false;
    let style = this._element.style;
    style.MozTransitionDuration = this.duration + "ms";
    style.opacity = 0.0; 
  },

  print: function print(message) 
  {
    this._content.setAttribute("value", message);
  },

  "[subscribe('event/screen-size-changed')]":
  function onScreenSizeChanged(size)
  {
    let {column, row} = size;
    let message = <>{column} x {row}</>.toString();
    this.print(message);
    this.show(2000);
  },

  "[subscribe('event/font-size-changed')]":
  function onFontSizeChanged(size)
  {
    let message = <>{size}px</>.toString();
    this.print(message);
    this.show(2000);
  },

  "[subscribe('sequence/osc/2')]":
  function onCommandReceived(data) 
  { // process OSC command.
    let scanner = new ForwardInputIterator(data);
    let sequence = this._decoder.decode(scanner);
    let text = String.fromCharCode.apply(String, sequence);
    this.print(text);
    this.show(400);
  },

} // class OverlayIndicator


/**
 * @fn main
 * @brief Module entry point.
 * @param {Process} process The Process object.
 */
function main(process) 
{
  process.subscribe(
    "initialized/session", 
    function(session) new OverlayIndicator(session));
}


