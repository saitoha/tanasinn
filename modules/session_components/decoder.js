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
 * @class Decoder
 *
 */
var Decoder = new Class().extends(Plugin);
Decoder.definition = {

  get id()
    "decoder",

  get info()
  {
    return {
      name: _("Decoder"),
      version: "0.1",
      description: _("Decode incoming data stream and convert it into internal format.")
    };
  },

  _parser: null,
  _decoder_map: null,
  _scheme: "ascii",
  _offset: 0,

  "[persistable] initial_scheme": "UTF8-js",
  "[persistable] enabled_when_startup": true,

  /** Gets character encoding scheme */
  get scheme()
    this.initial_scheme,

  /** Sets character encoding scheme */
  set scheme(value) 
  {
    var scheme = value,
        decoder_info = this._decoder_map[scheme],
        decoder,
        message;

    if (!decoder_info) {
      throw coUtils.Debug.Exception(
        _("Invalid character encoding schema specified: '%s'."), value);
    }

    decoder = decoder_info.converter;

    // Load resources if required.
    decoder.activate(scheme);

    this._decoder = decoder;

    this.initial_scheme = scheme;

    // print status message
    message = coUtils.Text.format(
      _("Character encoding changed: [%s]."),
      scheme);
    this.sendMessage("command/report-status-message", message); 
  },

  "[install]": 
  function install(broker) 
  {
    this._decoder_map = {};
    this.sendMessage("get/decoders").map(
      function mapfunc(information)
      {
        this._decoder_map[information.charset] = information; 
      }, this);

    this.scheme = this.initial_scheme;

    this.sendMessage("initialized/decoder", this);
  },

  "[uninstall]": 
  function uninstall(broker) 
  {
    this._decoder_map = null;
  },

  "[subscribe('change/decoder'), enabled]": 
  function changeDecoder(scheme) 
  {
    this.scheme = scheme;
  },

  /** Read input byte-stream sequence at the specified scanner's 
   *  current position, and convert it to an UCS-4 code point sequence.
   *
   *  @param {Scanner} scanner A scanner object that attached to 
   *                   current input stream.
   *  @return {Array} Converted sequence 
   */ 
  decode: function decode(scanner) 
  {
    return this._decoder.decode(scanner);
  },

}; // Decoder

/**
 * @fn main
 * @brief Module entry point.
 * @param {Broker} broker The Broker object.
 */
function main(broker) 
{
  new Decoder(broker);
}

// EOF
