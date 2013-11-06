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

var EncoderInfo = new Class();
EncoderInfo.definition = {

  _broker: null,
  _id: null,

  initialize: function initialize(broker, converter, charset, title)
  {
    this._id = coUtils.Uuid.generate();
    this._broker = broker;

    broker.subscribe(
      "get/encoders",
      function getEncoders()
      {
        return {
          charset: charset,
          converter: converter,
          title: title,
        };
      }, this._id);
  },

  uninitialize: function uninitialize()
  {
    this._broker.unsubscribe(id);
  },

}; // EncoderInfo

/**
 * @class MultiEncoder
 */
var MultiEncoder = new Class().extends(Plugin);
MultiEncoder.definition = {

  id: "multiencoder",

  /** plugin information */
  getInfo: function getInfo()
  {
    return {
      name: _("Multilingal Encoder"),
      version: "0.1",
      description: _("Encode output stream with gecko.")
    };
  },

  "[persistable] enabled_when_startup": true,

  _current_scheme: "UTF-8",

  _converter: null,
  _encoders: null,

  /** Installs itself.
   *  @param {InstallContext} context A InstallContext object.
   */
  "[install]":
  function install(context)
  {
    var converter_manager,
        encoder_list,
        charset,
        title,
        info;

    // get scriptable unicode converter
    this._converter = coUtils.Components.createScriptableUnicodeConverter();

    // get converter manager service
    converter_manager = coUtils.Services.getCharsetConverterManager();

    encoder_list = converter_manager.getEncoderList();

    this._encoders = [];

    // enumerate charcter sets.
    while (encoder_list.hasMore()) {

      charset = encoder_list.getNext();

      try {
        try {
          title = converter_manager.getCharsetTitle(charset);
        } catch (e) { // fallback
          title = charset;
        }

        info = new EncoderInfo(this._broker, this, charset, title);
        this._encoders.push(info);
      } catch (e) {
        coUtils.Debug.reportError(e);
      }
    }
  },

  /** Uninstalls itself.
   */
  "[uninstall]":
  function uninstall()
  {
  },

  activate: function active(scheme)
  {
    this._current_scheme = scheme;
    this._converter.charset = this._current_scheme;
  },

  encode: function encode(data)
  {
    return this._converter.ConvertFromUnicode(data);
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


};

/**
 * @fn main
 * @brief Module entry point.
 * @param {Broker} broker The Broker object.
 */
function main(broker)
{
  new MultiEncoder(broker);
}

// EOF
