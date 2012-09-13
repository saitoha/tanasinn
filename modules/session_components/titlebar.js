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
 * @class Titlebar
 *
 */
var Titlebar = new Class().extends(Plugin)
                          .depends("decoder");
Titlebar.definition = {

  id: "titlebar",

  getInfo: function getInfo()
  {
    return {
      name: _("Title Bar"),
      version: "0.1",
      description: _("Provides titlebar interafce.")
    };
  },

  "[persistable] enabled_when_startup": true,
  "[persistable, watchable] font_color": "white",
  "[persistable, watchable] font_size": 12,
  "[persistable, watchable] font_family": "Lucida Console,Latha,Georgia,monospace",

  getTemplate: function getTemplate()
  {
    return {
      parentNode: "#tanasinn_titlebar_area",
      id: "tanasinn_titlebar_canvas",
      tagName: "html:canvas",
      dir: "ltr",
      height: this.font_size,
      style: {
        padding: "0px",
        margin: "-3px",
        opacity: "1.0",
        width: "100%",
        cursor: "move",
      },
    };
  },

  /** Installs itself. 
   *  @param {Broker} broker A Broker object.
   */
  "[install]":
  function install(broker) 
  {
    var result = this.request(
      "command/construct-chrome",
      this.getTemplate());

    this._decoder = this.dependency["decoder"];
    this._canvas = result.tanasinn_titlebar_canvas;
  },
  
  /** Uninstalls itself.
   *  @param {Broker} broker A Broker object.
   */
  "[uninstall]":
  function uninstall(broker) 
  {
    if (null !== this._canvas) {
      this._canvas = null;
    }
    if (null !== this._decoder) {
      this._decoder = null;
    }
  },

  "[subscribe('sequence/osc/{0 | 2}'), pnp]":
  function onCommandReceived(data0, data2) 
  { // process OSC command.
    var data = data0 || data2,
        scanner = new ForwardInputIterator(data),
        decoder = this._decoder,
        sequence = [c for (c in decoder.decode(scanner))],
        text = coUtils.Text.safeConvertFromArray(sequence);

    this._print(text);
  },

  _print: function _print(text)
  {
    var canvas = this._canvas,
        context = canvas.getContext("2d"),
        metrics,
        left;

    canvas.width = canvas.parentNode.boxObject.width;
    context.fillStyle = this.font_color;
    context.font = this.font_size + "px " + this.font_family;
    context.textBaseline = 'top';
    context.clearRect(0, 0, canvas.width, canvas.height);

    metrics = context.measureText(text);
    left = (canvas.width - metrics.width) / 2 | 0;

    context.fillText(text, left, 0);
  },


}; // class Titlebar


/**
 * @fn main
 * @brief Module entry point.
 * @param {Broker} broker The Broker object.
 */
function main(broker)
{
  new Titlebar(broker);
}

// EOF
