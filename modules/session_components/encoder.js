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
 * @class Encoder
 *
 */
var Encoder = new Class().extends(Plugin);
Encoder.definition = {

  id: "encoder",

  getInfo: function getInfo()
  {
    return {
      name: _("Encoder"),
      version: "0.1",
      description: _("Encode output data stream to specified format.")
    };
  },

  _cache: null,

  "[persistable] enabled_when_startup": true,
  "[persistable] initial_scheme": "UTF-8",

  /** Installs itself. 
   *  @param {InstallContext} context A InstallContext object.
   */
  "[install]":
  function install(context) 
  {
    this._cache = {};

    this.changeScheme(this.initial_scheme);
  },

  /** Uninstalls itself. 
   */
  "[uninstall]":
  function uninstall() 
  {
    this._cache = null;
  },

  "[subscribe('event/session-initialized'), pnp]":
  function onSessionInitialized(broker)
  {
    this.changeScheme(this.initial_scheme);
  },

  "[subscribe('change/encoder'), pnp]":
  /** Sets character encoding scheme */
  function changeScheme(value) 
  {
    var encoders = this.sendMessage("get/encoders"),
        encoder_map,
        scheme,
        encoder,
        message;

    if (!encoders) {
      return;
    }

    encoder_map = encoders.reduce(
      function reduceProc(map, information) 
      {
        map[information.charset] = information; 
        return map;
      });
    scheme = value;//.toLowerCase();
    encoder = encoder_map[scheme].converter;

    if (!encoder) {
      throw coUtils.Debug.Exception(
        _("Invalid character encoding schema specified: '%s'."), value);
    }

    // Load resources if required.
    encoder.activate(scheme);

    this._encoder = encoder;
    this.initial_scheme = scheme;

    message = coUtils.Text
      .format(_("Input character encoding changed: [%s]."), scheme);
    this.sendMessage("command/report-status-message", message); 

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

}; // Encoder

/**
 * @fn main
 * @brief Module entry point.
 * @param {Broker} broker The Broker object.
 */
function main(broker) 
{
  new Encoder(broker);
}

function test(broker)
{
}

// EOF
