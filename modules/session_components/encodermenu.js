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

/**
 *  @class EncoderMenu
 *  @brief Makes it enable to switch terminal encoding by context menu.
 */
var EncoderMenu = new Class().extends(Plugin)
                             .depends("encoder");
EncoderMenu.definition = {

  id: "encodings",

  /** plugin information */
  getInfo: function getInfo()
  {
    return {
      name: _("Encoder Menu"),
      version: "0.1",
      description: _("Makes it enable to switch terminal encoding",
                     " by context menu.")
    };
  },

  "[persistable] enabled_when_startup": true,

  _encoder: null,

  /** Installs itself.
   *  @param {InstallContext} context A InstallContext object.
   */
  "[install]":
  function install(context)
  {
    this._encoder = context["encoder"];
  },

  /** Uninstalls itself.
   */
  "[uninstall]":
  function uninstall()
  {
    this._encoder = null;
  },

  /** called when contextmenu entries is required */
  "[subscribe('get/contextmenu-entries'), pnp]":
  function onContextMenu()
  {
    var encoder = this._encoder,
        encoder_scheme = encoder.scheme;

    return {
        tagName: "menu",
        label: _("Encoder"),
        childNodes: {
          tagName: "menupopup",
          childNodes: this.sendMessage("get/encoders").map(
            function getEncoders(information)
            {
              var charset = information.charset;

              return {
                tagName: "menuitem",
                type: "radio",
                label: information.title,
                name: "encoding",
                checked: encoder_scheme === information.charset,
                listener: {
                  type: "command",
                  context: this,
                  handler: function() this._onChange(charset),
                }
              };
            }, this),
        }
      };
  },

  /** Switch terminal encoding setting.
   */
  _onChange: function(scheme)
  {
    this._scheme = scheme;
    this.sendMessage("change/encoder", scheme)
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
  new EncoderMenu(broker)
}

// EOF
