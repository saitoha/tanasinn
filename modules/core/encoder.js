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
 * @class MultiEncoder
 */
let MultiEncoder = new Class().extends(Component);
MultiEncoder.definition = {

  get id()
    "multiencoder",

  _current_scheme: "UTF-8",
  _converter: null,

  /** constructor */
  initialize: function initialize(session) 
  {
    this._converter = Components
      .classes["@mozilla.org/intl/scriptableunicodeconverter"]
      .createInstance(Components.interfaces.nsIScriptableUnicodeConverter);
    let converter_manager = Components
      .classes["@mozilla.org/charset-converter-manager;1"]
      .getService(Components.interfaces.nsICharsetConverterManager);
    let encoder_list = converter_manager.getEncoderList();
    while (encoder_list.hasMore()) {
      let charset = encoder_list.getNext();
      try {
        let alias = converter_manager.getCharsetAlias(charset);
        let title;
        try {
          title = converter_manager.getCharsetTitle(charset);
        } catch (e) {
          title = charset;
        }
        //let group = converter_manager.getCharsetLangGroup(charset);
        session.subscribe(
          "get/encoders", 
          function getEncoders() 
          {
            return {
              charset: charset,
              converter: this,
              title: title,
//              group: group,
              alias: alias,
            };
          }, this);
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
 * @class Encoder
 *
 */
let Encoder = new Class().extends(Component);
Encoder.definition = {

  get id()
    "encoder",

  _parser: null,
  _encoder_map: null,
  _cache: null,

  "[persistable] initial_scheme": "UTF-8",

  /** Gets character encoding scheme */
  get scheme()
    this.initial_scheme,

  /** Sets character encoding scheme */
  set scheme(value) 
  {
    let scheme = value;//.toLowerCase();

    let encoder = this._encoder_map[scheme].converter;

    if (!encoder) {
      throw coUtils.Debug.Exception(
        _("Invalid character encoding schema specified: '%s'."), value);
    }

    // Load resources if required.
    encoder.activate(scheme);

    this._encoder = encoder;
    this.initial_scheme = scheme;

    let message = coUtils
      .format(_("Input character encoding changed: [%s]."), scheme);
    let session = this._broker;
    session.notify("command/report-status-message", message); 
  },

  "[subscribe('@event/session-started'), enabled]": 
  function onLoad(session) 
  {
    this._cache = {};
    this._encoder_map = session
      .notify("get/encoders")
      .reduce(function(map, information) 
      {
        map[information.charset] = information; 
        return map;
      });
    this.scheme = this.initial_scheme;
    session.subscribe("change/encoder", 
      function(scheme) this.scheme = scheme, this)
    session.notify("initialized/encoder", this);
  },

  /** Encode incoming string data.
   *
   *  @param {String} data a text message in Unicode string.
   *  @return {String} Converted string. 
   */ 
  encode: function encode(data) 
  {
    return this._encoder.encode(data);
  },

};

/**
 * @fn main
 * @brief Module entry point.
 * @param {Desktop} desktop The Desktop object.
 */
function main(desktop) 
{
  desktop.subscribe(
    "initialized/session", 
    function(session) 
    {
      new Encoder(session);
      new MultiEncoder(session);
    });
}



