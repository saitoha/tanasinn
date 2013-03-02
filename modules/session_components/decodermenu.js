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
 *  @class DecoderMenu
 *  @brief Makes it enable to switch terminal decoder by context menu.
 */
var DecoderMenu = new Class().extends(Plugin).depends("decoder");
DecoderMenu.definition = {

  id: "decodermenu",

  /** plugin information */
  getInfo: function getInfo()
  {
    return {
      name: _("Decoder Menu"),
      version: "0.1",
      description: _("Makes it enable to switch terminal decoder by context menu.")
    };
  },

  "[persistable] enabled_when_startup": true,
  "[persistable] send_ff_when_encoding_changed": true,

  _decoder: null,

  /** Installs itself.
   *  @param {InstallContext} context A InstallContext object.
   */
  "[install]":
  function install(context)
  {
    this._decoder = context["decoder"];
  },

  /** Uninstalls itself. */
  "[uninstall]":
  function uninstall()
  {
    this._decoder = null;
  },

  "[subscribe('get/contextmenu-entries'), pnp]":
  function onContextMenu()
  {
    var decoder = this._decoder,
        decoders = this.sendMessage("get/decoders"),
        decoder_scheme = decoder.scheme;

    return {
      tagName: "menu",
      label: _("Decoder"),
      childNodes: {
        tagName: "menupopup",
        childNodes: decoders.map(
          function mapFunc(information)
          {
            var charset = information.charset;

            return {
              tagName: "menuitem",
              type: "radio",
              label: information.title,
              name: "encoding",
              checked: decoder_scheme === charset,
              listener: {
                type: "command",
                context: this,
                handler: function onEncodingChanged()
                {
                  return this._onChange(charset);
                },
              }
            }
          }, this),
      }
    };
  },

  /** Switch terminal decoding setting.
   */
  _onChange: function(scheme)
  {
    this._scheme = scheme;
    this.sendMessage("change/decoder", scheme)

    // send control + l
    if (this.send_ff_when_encoding_changed) {
      this.sendMessage("command/send-to-tty", String.fromCharCode(0x0c));
    }
  }
};


/**
 * @fn main
 * @brief Module entry point.
 * @param {Broker} broker The Broker object.
 */
function main(broker)
{
  new DecoderMenu(broker)
}

// EOF
