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
 * @class Decoder
 *
 */
var Decoder = new Class().extends(Plugin);
Decoder.definition = {

  id: "decoder",

  /** provide plugin information */
  getInfo: function getInfo()
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
  {
    return this.initial_scheme;
  },

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

  /** Installs itself.
   *  @param {InstallContext} context A InstallContext object.
   */
  "[install]":
  function install(context)
  {
    this._decoder_map = {};
  },

  /** Uninstalls itself.
   */
  "[uninstall]":
  function uninstall()
  {
    this._decoder_map = null;
  },

  "[subscribe('event/session-initialized'), pnp]":
  function onSessionInitialized(scheme)
  {
    var decoders = this.sendMessage("get/decoders");

    decoders.map(
      function mapfunc(information)
      {
        this._decoder_map[information.charset] = information;
      }, this);

    this.scheme = this.initial_scheme;
  },

  "[subscribe('change/decoder'), pnp]":
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

  /** Read input sequence and convert it to an UTF-16 string
   *
   *  @param {String} data input data
   *  @return {String} Converted string
   */
  decodeString: function decodeString(data)
  {
    var scanner = new ForwardInputIterator(data),
        sequence = [],
        result,
        code;

    for (code in this.decode(scanner)) {
      if (code < 0x10000) {
        sequence.push(code);
      } else {
        // emit 16bit + 16bit surrogate pair.
        code -= 0x10000;
        sequence.push((code >> 10) | 0xD800, (code & 0x3FF) | 0xDC00);
      }
    }

    return coUtils.Text.safeConvertFromArray(sequence);
  },

  /** test */
  "[test]":
  function()
  {
    var enabled = this.enabled;

    try {
      if (enabled) {
        coUtils.Debug.assert(this._decoder_map);
      }
    } finally {
      this.enabled = enabled;
    }
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
