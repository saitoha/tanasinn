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
 * @class FontCommands
 */
var FontCommands = new Class().extends(Plugin);
FontCommands.definition = {

  id: "fontcommands",

  getInfo: function getInfo()
  {
    return {
      name: _("Font Commands"),
      version: "0.1",
      description: _("Provides fontsize/fontfamily/increase/decrease command.")
    };
  },

  "[persistable] enabled_when_startup": true,

  /** Installs itself.
   *  @param {InstallContext} context A InstallContext object.
   */
  "[install]":
  function install(context)
  {
  },

  /** Uninstalls itself
   */
  "[uninstall]":
  function uninstall()
  {
  },

  "[command('fontsize/fsize', ['fontsize']), _('Change terminal font size.'), pnp]":
  function fontsize(arguments_string)
  {
    var pattern, match, font_size;

    pattern = /^\s*([0-9]+)\s*$/;
    match = arguments_string.match(pattern);
    if (null === match) {
      return {
        success: false,
        message: coUtils.Text.format(
          _("Ill-formed arguments: %s."),
          arguments_string),
      };
    }

    [, font_size] = match;

    this.sendMessage("set/font-size", font_size);
    this.sendMessage("command/draw", true);
    return {
      success: true,
      message: _("Font size was changed."),
    };
  },

  "[command('fontfamily/ff', ['font-family']), _('Select terminal font family.'), pnp]":
  function fontfamily(arguments_string)
  {
    var pattern, match, font_size;

    pattern = /^\s*(.+)\s*$/;
    match = arguments_string.match(pattern);

    if (null === match) {
      return {
        success: false,
        message: coUtils.Text.format(
          _("Ill-formed arguments: %s."),
          arguments_string),
      };
    }

    [, font_family] = match;

    this.sendMessage("set/font-family", font_family);
    this.sendMessage("command/draw", true);

    return {
      success: true,
      message: _("Font family was changed."),
    };
  },

  /** Makes font size smaller. */
  "[command('decrease'), _('Make font size smaller.'), pnp]":
  function decrease()
  {
    this.sendMessage("command/change-fontsize-by-offset", -1);
    this.sendMessage("command/draw");

    return {
      success: true,
      message: _("Font size was changed."),
    };
  },

  /** Makes font size bigger. */
  "[command('increase'), _('Make font size bigger.'), pnp]":
  function increase()
  {
    this.sendMessage("command/change-fontsize-by-offset", +1);
    this.sendMessage("command/draw");

    return {
      success: true,
      message: _("Font size was changed."),
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


};

/**
 * @fn main
 * @brief Module entry point.
 * @param {Broker} broker The Broker object.
 */
function main(broker)
{
  new FontCommands(broker);
}

// EOF
