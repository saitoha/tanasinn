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
 *  @class DragPaste
 */
let DragPaste = new Class().extends(Plugin);
DragPaste.definition = {

  get id()
    "dragpaste",

  get info()
    <plugin>
        <name>{_("Drag Paste")}</name>
        <description>{
          _("Make enable to accept dragged text and send it to TTY.")
        }</description>
        <version>0.1</version>
    </plugin>,

  "[persistable] enabled_when_startup": true,

  _bracketed_paste_mode: false,

  /** Installs itself. 
   *  @param {Broker} broker A Broker object.
   */
  "[subscribe('install/dragpaste'), enabled]":
  function install(broker) 
  {
    this.ondragover.enabled = true;
    this.ondragenter.enabled = true;
    this.ondrop.enabled = true;
    this.onBracketedPasteModeChanged.enabled = true;
  },

  /** Uninstalls itself. 
   *  @param {Broker} broker A Broker object.
   */
  "[subscribe('uninstall/dragpaste'), enabled]":
  function uninstall(broker) 
  {
    this.ondragover.enabled = false;
    this.ondragenter.enabled = false;
    this.ondrop.enabled = false;
    this.onBracketedPasteModeChanged.enabled = false;
  },

  /** A dragover event handler for center area element. 
   *  @param {Event} event A event object.
   */
  "[listen('dragover', '#tanasinn_content', true)]":
  function ondragover(event) 
  {
    let data_transfer = event.dataTransfer;
    if (data_transfer.types.contains("text/plain")) {
      event.preventDefault();
    }
    if ("copy" != data_transfer.dropEffect)
      data_transfer.dropEffect = "copy";
    data_transfer.effectAllowed = "copy";
  },

  /** A dragenter event handler for center area element. 
   *  @param {Event} event A event object.
   */
  "[listen('dragenter', '#tanasinn_content', true)]":
  function ondragenter(event) 
  {
    if (event.dataTransfer.types.contains("text/plain")) {
      let broker = this._broker;
      broker.notify("command/focus");
    } else {
      event.preventDefault();
    }
  }, 

  /** A drop event handler for center area element. 
   *  @param {Event} event A event object.
   */
  "[listen('drop', '#tanasinn_content', true)]":
  function ondrop(event) 
  {
    let data_transfer = event.dataTransfer;
    if (data_transfer.types.contains("text/plain")) {
	    let text = data_transfer.getData("text/plain");

      if (true === this._bracketed_paste_mode) {
        // add bracket sequences.
        text = "\x1b[200~" + text + "\x1b[201~";
      }

      // Encodes the text message and send it to the tty device.
      let broker = this._broker;
      broker.notify("command/input-text", text);
    }
  },

  /** Set/Reset bracketed paste mode. */
  "[subscribe('command/change-bracketed-paste-mode')]":
  function onBracketedPasteModeChanged(mode) 
  {
    this._bracketed_paste_mode = mode;
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

