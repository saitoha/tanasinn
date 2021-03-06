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
 * @class ChangePaletteCommand
 */
var ChangePaletteCommand = new Class().extends(Plugin)
                               .depends("palette");
ChangePaletteCommand.definition = {

  id: "colorcommands",

  /** plugin information */
  getInfo: function getInfo()
  {
    return {
      name: _("Change Palette Command"),
      version: "0.1",
      description: _("Provides changepalette command.")
    };
  },

  "[persistable] enabled_when_startup": true,

  _palette: null,

  /** Installs itself.
   *  @param {InstallContext} context A InstallContext object.
   */
  "[install]":
  function install(context)
  {
    this._palette = context["palette"];
  },

  /** Uninstalls itself
   */
  "[uninstall]":
  function uninstall()
  {
    this._palette = null;
  },

  "[command('changepallet', ['color-number/fg']), _('Change pallet.'), pnp]":
  function changepallet(arguments_string)
  {
    var pattern = /\s*([0-9]+)\s+([a-zA-Z]+|#[0-9a-fA-F]+)/,
        match = arguments_string.match(pattern),
        number,
        color,
        palette = this._palette;

    if (null === match) {
      return {
        success: false,
        message: coUtils.Text.format(
          _("Ill-formed arguments: %s."),
          arguments_string),
      };
    }

    number = match[1];
    color = match[2];

    palette.color[number] = color;

    this.sendMessage("command/draw", /* redraw */true);

    return {
      success: true,
      message: coUtils.Text.format(_("Color #%d was changed."), number),
    };
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


}; // ChangePaletteCommand

/**
 * @fn main
 * @brief Module entry point.
 * @param {Broker} broker The Broker object.
 */
function main(broker)
{
  new ChangePaletteCommand(broker);
}

// EOF
