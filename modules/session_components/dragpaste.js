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
 *  @class DragPaste
 */
var DragPaste = new Class().extends(Plugin);
DragPaste.definition = {

  id: "dragpaste",

  /** plugin information */
  getInfo: function getInfo()
  {
    return {
      name: _("Drag Paste"),
      version: "0.1",
      description: _("Make enable to accept dragged text and send it to TTY.")
    };
  },

  "[persistable] enabled_when_startup": true,

  _bracketed_paste_mode: false,

  /** Installs itself.
   *  @param {InstallContext} context A InstallContext object.
   */
  "[install]":
  function install(context)
  {
  },

  /** Uninstalls itself.
   */
  "[uninstall]":
  function uninstall()
  {
  },

  /** A dragover event handler for center area element.
   *  @param {Event} event A event object.
   */
  "[listen('dragover', '#tanasinn_content', true), pnp]":
  function ondragover(event)
  {
    var data_transfer = event.dataTransfer;

    if (data_transfer.types.contains("text/plain")) {
      event.preventDefault();
    }

    if ("copy" !== data_transfer.dropEffect) {
      data_transfer.dropEffect = "copy";
    }
    data_transfer.effectAllowed = "copy";
  },

  /** A dragenter event handler for center area element.
   *  @param {Event} event A event object.
   */
  "[listen('dragenter', '#tanasinn_content', true), pnp]":
  function ondragenter(event)
  {
    if (event.dataTransfer.types.contains("text/plain")) {
      this.sendMessage("command/focus");
    } else {
      event.preventDefault();
    }
  },

  /** A drop event handler for center area element.
   *  @param {Event} event A event object.
   */
  "[listen('drop', '#tanasinn_content', true), pnp]":
  function ondrop(event)
  {
    var data_transfer = event.dataTransfer,
        text;

    if (data_transfer.types.contains("text/plain")) {
	    text = data_transfer.getData("text/plain");

      // sanitize text.
      text = text.replace(/[\x00-\x08\x0a-\x0c\x0e-\x1f]/g, "");

      // Encodes the text message and send it to the tty device.
      if (this._bracketed_paste_mode) {
        // add bracket sequences.
        this.sendMessage("command/send-sequence/csi", "200~");
        this.sendMessage("command/input-text", text);
        this.sendMessage("command/send-sequence/csi", "201~");
      } else {
        this.sendMessage("command/input-text", text);
      }
    }
  },

  /** Set/Reset bracketed paste mode. */
  "[subscribe('command/change-bracketed-paste-mode'), pnp]":
  function onBracketedPasteModeChanged(mode)
  {
    this._bracketed_paste_mode = mode;
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
  new DragPaste(broker);
}

// EOF
