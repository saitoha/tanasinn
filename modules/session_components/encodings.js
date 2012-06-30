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
 *  @class EncoderMenu
 *  @brief Makes it enable to switch terminal encoding by context menu.
 */
var EncoderMenu = new Class().extends(Plugin).depends("encoder");
EncoderMenu.definition = {

  get id()
    "encodings",

  get info()
    <TanasinnPlugin>
        <name>{_("Encoder Menu")}</name>
        <description>{
          _("Makes it enable to switch terminal encoding by context menu.")
        }</description>
        <version>0.1</version>
    </TanasinnPlugin>,

  "[persistable] enabled_when_startup": true,

  /** Installs itself. */
  "[install]":
  function install(broker) 
  {
    this.onContextMenu.enabled = true;
  },

  /** Uninstalls itself. */
  "[uninstall]":
  function uninstall(broker) 
  {
    this.onContextMenu.enabled = false;
  },

  "[subscribe('get/contextmenu-entries')]": 
  function onContextMenu() 
  {
    var encoder, encoder_scheme;

    encoder = this.dependency["encoder"];
    encoder_scheme = encoder.scheme;

    return {
        tagName: "menu",
        label: _("Encoder"),
        childNodes: {
          tagName: "menupopup",
          childNodes: this.sendMessage("get/encoders").map(
            function getEncoders(information) 
            {
              return {
                tagName: "menuitem",
                type: "radio",
                label: information.title,
                name: "encoding",
                checked: encoder_scheme == information.charset,
                listener: {
                  type: "command", 
                  context: this,
                  handler: let (encoding = information.charset)
                    function() this._onChange(encoding),
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
};

/**
 *  @class DecoderMenu
 *  @brief Makes it enable to switch terminal decoder by context menu.
 */
var DecoderMenu = new Class().extends(Plugin).depends("decoder");
DecoderMenu.definition = {

  get id()
    "decodermenu",

  get info()
    <Plugin>
        <name>{_("Decoder Menu")}</name>
        <description>{
          _("Makes it enable to switch terminal decoder by context menu.")
        }</description>
        <version>0.1</version>
    </Plugin>,

  "[persistable] enabled_when_startup": true,
  "[persistable] send_ff_when_encoding_changed": true,

  /** Installs itself. */
  "[install]":
  function install(broker) 
  {
    this.onContextMenu.enabled = true;
  },

  /** Uninstalls itself. */
  "[uninstall]":
  function uninstall(broker) 
  {
    this.onContextMenu.enabled = false;
  },

  "[subscribe('get/contextmenu-entries')]":
  function onContextMenu() 
  {
    var decoder, decoders, decoder_scheme;

    decoder = this.dependency["decoder"];
    decoders = this.sendMessage("get/decoders");
    decoder_scheme = decoder.scheme;

    return {
      tagName: "menu",
      label: _("Decoder"),
      childNodes: {
        tagName: "menupopup",
        childNodes: decoders.map(function(information) 
        { 
          return {
            tagName: "menuitem",
            type: "radio",
            label: information.title,
            name: "encoding",
            checked: decoder_scheme == information.charset,
            listener: {
              type: "command", 
              context: this,
              handler: let (encoding = information.charset)
                function() this._onChange(encoding),
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
  new EncoderMenu(broker)
  new DecoderMenu(broker)
}

// EOF
