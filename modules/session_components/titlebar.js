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
 * Portions created by the Initial Developer are Copyright (C) 2010 - 2013
 * the Initial Developer. All Rights Reserved.
 *
 * ***** END LICENSE BLOCK ***** */

"use strict";


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

}; // ForwardInputIterator

/**
 * @class Titlebar
 *
 */
var Titlebar = new Class().extends(Plugin)
                          .depends("decoder")
                          .depends("encoder");
Titlebar.definition = {

  id: "titlebar",

  /** plugin information */
  getInfo: function getInfo()
  {
    return {
      name: _("Title Bar"),
      version: "0.1",
      description: _("Provides titlebar interafce.")
    };
  },

  "[persistable] enabled_when_startup": true,

  "[persistable, watchable] initial_set_hex_mode": false,
  "[persistable, watchable] initial_set_utf8_mode": true,
  "[persistable, watchable] initial_query_hex_mode": false,
  "[persistable, watchable] initial_query_utf8_mode": true,
  "[persistable, watchable] enable_title_reporting": false,

  "[persistable, watchable] default_title": "tanasinn",
  "[persistable, watchable] font_color": "white",
  "[persistable, watchable] font_size": 12,
  "[persistable, watchable] font_family": "Lucida Console,Latha,Georgia,monospace",

  _title_text: "",
  _icon_title_text: "",

  _title_stack: null,
  _icon_title_stack: null,

  _set_hex_mode: false,
  _set_utf8_mode: true,
  _query_hex_mode: false,
  _query_utf8_mode: true,

  _encoder: null,
  _decoder: null,

  /** provide UI template */
  getTemplate: function getTemplate()
  {
    return {
      parentNode: "#tanasinn_titlebar_area",
      id: "tanasinn_titlebar_canvas",
      tagName: "html:canvas",
      dir: "ltr",
      height: this.font_size + 4,
      style: {
        padding: "0px",
        paddingBottom: "7px",
        borderRadius: "2px",
        opacity: "1.0",
        width: "100%",
        cursor: "move",
      },
    };
  },

  /** Installs itself.
   *  @param {InstallContext} context A InstallContext object.
   */
  "[install]":
  function install(context)
  {
    var result = this.request(
      "command/construct-chrome",
      this.getTemplate());

    this._decoder = context["decoder"];
    this._encoder = context["encoder"];

    this._title_stack = [];
    this._icon_title_stack = [];

    this._canvas = result.tanasinn_titlebar_canvas;
    this._set_hex_mode = this.initial_set_hex_mode;
    this._set_utf8_mode = this.initial_set_utf8_mode;
    this._query_hex_mode = this.initial_query_hex_mode;
    this._query_utf8_mode = this.initial_query_utf8_mode;

  },

  /** Uninstalls itself.
   */
  "[uninstall]":
  function uninstall()
  {
    this._canvas = null;
    this._decoder = null;
    this._encoder = null;

    this._title_stack = null;
    this._icon_title_stack = null;

    this._set_hex_mode = false;
    this._set_utf8_mode = true;
    this._query_hex_mode = false;
    this._query_utf8_mode = true;

    this._title_text = "";
    this._icon_title_text = "";
  },

  /** When session is initialized */
  "[subscribe('event/session-initialized'), pnp]":
  function onSessionInitialized(session)
  {
    this._canvas.width = this._canvas.parentNode.boxObject.width;
  },

  "[subscribe('command/send-titlebar-string'), pnp]":
  function sendTitlebarString(value)
  {
    this._title_text = value;
    this._print();
  },

  /** When default title is changed */
  "[subscribe('variable-changed/titlebar.default_title'), pnp]":
  function onDefaultTitleChanged(title)
  {
    this._print();
  },

  /** When screen size is changed */
  "[subscribe('event/screen-width-changed'), pnp]":
  function onWidthChanged(width)
  {
    this._canvas.width = width;
  },

  /** set the title setting utf-8 mode enabled */
  "[subscribe('command/title-set-utf8-mode-enabled'), pnp]":
  function onTitleSetUtf8ModeEnabled()
  {
    this._set_utf8_mode = true;
  },

  /** set the title setting hex mode enabled */
  "[subscribe('command/title-set-hex-mode-enabled'), pnp]":
  function onTitleSetHexModeEnabled()
  {
    this._set_hex_mode = true;
  },

  /** set the title query utf-8 mode enabled */
  "[subscribe('command/title-query-utf8-mode-enabled'), pnp]":
  function onTitleQueryUtf8ModeEnabled()
  {
    this._query_utf8_mode = true;
  },

  /** set the title query hex mode enabled */
  "[subscribe('command/title-query-hex-mode-enabled'), pnp]":
  function onTitleQueryHexModeEnabled()
  {
    this._query_hex_mode = true;
  },

  /** set the title setting utf-8 mode disabled */
  "[subscribe('command/title-set-utf8-mode-disabled'), pnp]":
  function onTitleSetUtf8ModeDisabled()
  {
    this._set_utf8_mode = false;
  },

  /** set the title setting hex mode disabled */
  "[subscribe('command/title-set-hex-mode-disabled'), pnp]":
  function onTitleSetHexModeDisabled()
  {
    this._set_hex_mode = false;
  },

  /** set the title query utf-8 mode disabled */
  "[subscribe('command/title-query-utf8-mode-disabled'), pnp]":
  function onTitleQueryUtf8ModeDisabled()
  {
    this._query_utf8_mode = false;
  },

  /** set the title query hex mode disabled */
  "[subscribe('command/title-query-hex-mode-disabled'), pnp]":
  function onTitleQueryHexModeDisabled()
  {
    this._query_hex_mode = false;
  },

  // Reports window title.
  // Response: OSC L title ST
  //   title    icon label. (window title)
  "[subscribe('sequence/decslpp/20'), pnp]":
  function onTitleQueryHexModeDisabled()
  {
    var message = this._getIconTitle();

    this.sendMessage("command/send-sequence/osc", "L" + message)
  },

  // Reports window title.
  // Response: OSC l title ST
  //   title    Window title.
  "[subscribe('sequence/decslpp/21'), pnp]":
  function onTitleQueryHexModeDisabled()
  {
    var message = this._getTitle();

    this.sendMessage("command/send-sequence/osc", "l" + message)
  },

  "[subscribe('sequence/decslpp/22'), pnp]":
  function onTitlePush(n)
  {
    switch (n) {
      case 0:
        this._title_stack.push(this._title_text);
        this._icon_title_stack.push(this._icon_title_text);
        break;

      case 1:
        this._icon_title_stack.push(this._icon_title_text);
        break;

      case 2:
        this._title_stack.push(this._title_text);
        break;
    }
  },

  "[subscribe('sequence/decslpp/23'), pnp]":
  function onTitlePop(n)
  {
    switch (n) {

      case 0:
        if (this._title_stack.length > 0) {
          this._title_text = this._title_stack.pop();
        } else {
          this._title_text = "";
        }
        if (this._icon_title_stack.length > 0) {
          this._icon_title_text = this._icon_title_stack.pop();
        } else {
          this._icon_title_text = "";
        }
        this._print();
        break;

      case 1:
        if (this._icon_title_stack.length > 0) {
          this._icon_title_text = this._icon_title_stack.pop();
        } else {
          this._icon_title_text = "";
        }
        this._print();
        break;

      case 2:
        if (this._title_stack.length > 0) {
          this._title_text = this._title_stack.pop();
        } else {
          this._title_text = "";
        }
        this._print();
        break;
    }
  },

  _getTitle: function _getTitle(data)
  {
    var message = "";

    if (this.enable_title_reporting) {
      if (this._query_utf8_mode) {
        message += this._encoder.encode(this._title_text);
      } else {
        message += this._title_text;
      }

      if (this._query_hex_mode) {
        message = message.split("").map(
          function mapFunc(c)
          {
            return c.charCodeAt(0).toString(16);
          }).join("");
      }
    }

    return message;
  },

  _getIconTitle: function _getTitle(data)
  {
    var message = "";

    if (this.enable_title_reporting) {
      if (this._query_utf8_mode) {
        message += this._encoder.encode(this._title_text);
      } else {
        message += this._icon_title_text;
      }

      if (this._query_hex_mode) {
        message = message.split("").map(
          function mapFunc(c)
          {
            return c.charCodeAt(0).toString(16);
          }).join("");
      }
    }

    return message;
  },

  _setTitle: function _setTitle(data)
  {
    var text,
        match,
        i;

    if (this._set_hex_mode) {
      match = data.match(/[a-zA-Z0-9]/g);
      for (data = []; i < match.length; ++i) {
        data.push(parseInt(match[i], 16));
      }
    }

    if (this._set_utf8_mode) {
      text = this._decoder.decodeString(data);
    } else {
      text = coUtils.Text.safeConvertFromArray(data);
    }

    this._title_text = text;
    this._print();
  },

  _setIconTitle: function _setIconTitle(data)
  {
    var text,
        match,
        i;

    if (this._set_hex_mode) {
      match = data.match(/[a-zA-Z0-9]/g);
      for (data = []; i < match.length; ++i) {
        data.push(parseInt(match[i], 16));
      }
    }

    if (this._set_utf8_mode) {
      text = this._decoder.decodeString(data);
    } else {
      text = coUtils.Text.safeConvertFromArray(data);
    }

    this._icon_title_text = text;
    this._print();
  },

  "[subscribe('sequence/osc/0'), pnp]":
  function osc0(data)
  {
    this._setTitle(data);
    this._setIconTitle(data);
    this._print();
  },

  "[subscribe('sequence/osc/1'), pnp]":
  function osc1(data)
  { // process OSC command.
    this._setIconTitle(data);
    this._print();
  },

  "[subscribe('sequence/osc/2'), pnp]":
  function osc2(data)
  { // process OSC command.
    this._setTitle(data);
    this._print();
  },

  _print: function _print()
  {
    var canvas = this._canvas,
        context = canvas.getContext("2d"),
        metrics,
        left,
        text;

    if (this._title_text === this._icon_title_text) {
      text = this._title_text;
    } else if ("" === this._title_text && "" === this._icon_title_text) {
      text = this.default_title;
    } else {
      text = this._title_text + " " + this._icon_title_text;
    }

    canvas.width = canvas.parentNode.boxObject.width;
    context.fillStyle = this.font_color;
    context.font = this.font_size + "px " + this.font_family;
    context.textBaseline = 'top';
    context.clearRect(0, 0, canvas.width, canvas.height);

    metrics = context.measureText(text);
    left = (canvas.width - metrics.width) / 2 | 0;

    context.fillText(text, left, 0);
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
