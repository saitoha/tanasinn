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
 *  @class ScreenshotCommand
 */
let ScreenshotCommand = new Class().extends(Component);
ScreenshotCommand.definition = {

  get id()
    "screenshot",

  "[command('screenshot'), _('Convert screen to a image file.'), enabled]":
  function screenshot(arguments_string) 
  {
    let pattern = /^(\S+)s*$/;
    let match = arguments_string.match(pattern);
    if (null === match) {
      return {
        success: false,
        message: _("Ill-formed message."),
      };
    }
    let [, name] = match;

    let broker = this._broker;
    let path = String(<>{broker.runtime_path}/screenshot/{name}.png</>);
    let file = coUtils.File
      .getFileLeafFromVirtualPath(path)
      .QueryInterface(Components.interfaces.nsILocalFile);
    // create base directories recursively (= mkdir -p).
    void function make_directory(current) 
    {
      let parent = current.parent;
      if (!parent.exists()) {
        make_directory(parent);
        parent.create(Components.interfaces.nsIFile.DIRECTORY_TYPE, -1);
      }
    } (file);

    broker.notify("command/capture-screen", {file: file, thumbnail: false});
    return {
      success: true,
      message: _("Succeeded."),
    };
  },

} // class ScreenshotCommand

/**
 * @fn main
 * @brief Module entry point.
 * @param {Broker} broker The Broker object.
 */
function main(broker) 
{
  new ScreenshotCommand(broker);
}


