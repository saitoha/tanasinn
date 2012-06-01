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
 * @class ForwardInputIterator
 */ 
var ForwardInputIterator = new Class();
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
var OverlayIndicator = new Class().extends(Plugin)
                                  .depends("decoder");
OverlayIndicator.definition = {

  get id()
    "overlayindicator",

  get info()
    <module>
        <name>{_("Overlay Indicator")}</name>
        <description>{
          _("Enables overlay indicator.")
        }</description>
        <version>0.1</version>
    </module>,

  get template()
    ({
      parentNode: "#tanasinn_outer_chrome",
      tagName: "box",
      orient: "vertical",
      align: "center",
      valign: "middle",
      id: "tanasinn_overlay_indicator",
      style: <>
        visibility: hidden;
        opacity: 0.00;
        max-width: 0px;
      </>,
      MozTransitionProperty: "opacity",
      childNodes: {
        tagName: "label",
        crop: "end",
        id: "tanasinn_overlay_indicator_content",
        style: <> 
          background: {this.background};
          color: {this.color};
          font-size: {this.fontSize};
          padding: {this.padding}; 
          border-radius: {this.borderRadius}; 
          border: {this.border};
        </>,
      },
    }),

  "[persistable] enabled_when_startup": true,

  "[persistable] fadeout_duration": 500,
  "[persistable] opacity": 0.80,
  "[persistable, watchable] color": "white",
  "[persistable, watchable] fontSize": "30px",
  "[persistable, watchable] padding": "0.3em",
  "[persistable, watchable] borderRadius": "0.5em",
  "[persistable, watchable] border": "solid 8px white",
  "[persistable, watchable] background": "-moz-linear-gradient(top, #777, #000)",

  _element: null,
  _content: null,
  _timer: null,
 
  /** installs itself. 
   *  @param {Session} session A session object.
   */
  "[install]":
  function install(session) 
  {
    var {tanasinn_overlay_indicator, tanasinn_overlay_indicator_content}
      = this.request("command/construct-chrome", this.template);

    this._element = tanasinn_overlay_indicator;
    this._content = tanasinn_overlay_indicator_content;
  },

  /** Uninstalls itself.
   *  @param {Session} session A session object.
   */
  "[uninstall]":
  function uninstall(session) 
  {
    if (null !== this._element) {
      this._element.parentNode.removeChild(this._element);
      this._element = null;
    }
    if (null !== this._content) {
      this._content = null;
    }
    if (null !== this._timer) {
      this._timer = null;
    }
  },

  "[subscribe('command/report-overlay-message'), pnp]":
  function report(message) 
  {
    this.print(message);
    this.show(2000);
  },

  "[subscribe('variable-changed/overlayindicator.{background | color | fontSize | padding | borderRadius | border}'), pnp]":
  function onStyleChanged(chrome, decoder) 
  {
    if (null !== this._content) {
      this._content.style.cssText = <> 
        background: {this.background};
        color: {this.color};
        font-size: {this.fontSize};
        padding: {this.padding}; 
        border-radius: {this.borderRadius}; 
        border: {this.border};
      </>;
    }
  },

  show: function show(timeout) 
  {
    if (null !== this._timer) {
      this._timer.cancel();
    }
    this._element.style.visibility = "visible";
    this._element.style.MozTransitionDuration = "0ms";
    this._element.style.opacity = this.opacity;
    if (timeout) {
      this._timer = coUtils.Timer.setTimeout(
        function() 
        {
          this._timer = null;
          this.hide();
        }, timeout, this);
    }
  },

  hide: function hide() 
  {
    if (null !== this._element) {
      this._element.style.MozTransitionDuration = this.fadeout_duration + "ms";
      this._element.style.opacity = 0.0; 
      coUtils.Timer.setTimeout(
        function() 
        {
          if (this._element) {
            this._element.style.visibility = "hidden";
          }
        }, this.fadeout_duration, this);
    }
  },

  print: function print(message) 
  {
    this._content.setAttribute("value", String(message));
  },

  "[subscribe('command/resize-screen'), pnp]":
  function onScreenSizeChanged(size)
  {
    var message;

    message = size.column + " x " + size.row;
    this.print(message);
    this.show(2000);
  },

  "[subscribe('event/font-size-changed'), pnp]":
  function onFontSizeChanged(size)
  {
    var message;

    message = size + "px";
    this.print(message);
    this.show(2000);
  },

  "[subscribe('sequence/osc/{0 | 2}'), pnp]":
  function onCommandReceived(data0, data2) 
  { // process OSC command.
    var scanner, decoder, sequence, text, data;

    data = data0 || data2;
    scanner = new ForwardInputIterator(data);
    decoder = this.dependency["decoder"];
    sequence = [c for (c in decoder.decode(scanner))];
    text = String.fromCharCode.apply(String, sequence);

    this.print(text);
    this.show(400);
  },

} // class OverlayIndicator


/**
 * @fn main
 * @brief Module entry point.
 * @param {Broker} broker The Broker object.
 */
function main(broker) 
{
  new OverlayIndicator(broker);
}


