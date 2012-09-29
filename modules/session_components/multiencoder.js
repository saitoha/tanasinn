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

var EncoderInfo = new Class();
EncoderInfo.definition = {

  initialize: function(broker, converter, charset, title)
  {
    broker.subscribe(
      "get/encoders", 
      function getEncoders() 
      {
        return {
          charset: charset,
          converter: converter,
          title: title,
        };
      });
  },
};

/**
 * @class MultiEncoder
 */
var MultiEncoder = new Class().extends(Plugin);
MultiEncoder.definition = {

  id: "multiencoder",

  getInfo: function getInfo()
  {
    return {
      name: _("Multilingal Encoder"),
      version: "0.1",
      description: _("Encode output stream with gecko.")
    };
  },


  _current_scheme: "UTF-8",

  _converter: null,

  /** constructor */
  initialize: function initialize(broker) 
  {
    var converter_manager,
        encoder_list,
        charset,
        title,
        info;

    this._converter = Components
      .classes["@mozilla.org/intl/scriptableunicodeconverter"]
      .createInstance(Components.interfaces.nsIScriptableUnicodeConverter);

    converter_manager = Components
      .classes["@mozilla.org/charset-converter-manager;1"]
      .getService(Components.interfaces.nsICharsetConverterManager);

    encoder_list = converter_manager.getEncoderList();

    // enumerate charcter sets.
    while (encoder_list.hasMore()) {

      charset = encoder_list.getNext();

      try {
        try {
          title = converter_manager.getCharsetTitle(charset);
        } catch (e) { // fallback
          title = charset;
        }
        new EncoderInfo(broker, this, charset, title);
      } catch (e) {
        coUtils.Debug.reportError(e);
      }
    }
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
