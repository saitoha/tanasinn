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

/** @class DoubleSizedCharacters
 *
 * DECDHL — Double-Width, Double-Height Line
 *
 * These two control functions make the line with the cursor the top or
 * bottom half of a double-height, double-width line. You must use these
 * sequences in pairs on adjacent lines. In other words, the same display
 * characters must appear in the same positions on both lines to form
 * double-height characters. If the line was single width and single height,
 * then all characters to the right of the screen center are lost.
 *
 * Format
 *
 * ESC    #    3
 * 1/11   2/3  3/3
 *
 * Top Half
 *
 *
 * ESC    #    4
 * 1/11   2/3  3/4
 *
 * Bottom Half
 *
 * Description
 *
 * The following sequences make the phrase "VT510 Video Terminal" a
 * double-height, double-width line.
 *
 * ESC#3 VT510 Video Terminal
 * ESC#4 VT510 Video Terminal
 *
 */
var DoubleSizedCharacters = new Class().extends(Plugin)
                                   .depends("screen");
DoubleSizedCharacters.definition = {

  id: "doublesized",

  getInfo: function getInfo()
  {
    return {
      name: _("Double Sized Characters"),
      version: "0.1",
      description: _("Add Support for double sized character feature",
                     " (DECDWL/DECDHL).")
    };
  },

  "[persistable] enabled_when_startup": true,

  _screen: null,

  /** Installs itself.
   *  @param {InstallContext} context A InstallContext object.
   */
  "[install]":
  function install(context)
  {
    this._screen = context["screen"];
  },

  /** uninstalls itself.
   */
  "[uninstall]":
  function uninstall()
  {
    this._screen = null;
  },

  /** DEC double-height line, top half. */
  "[profile('vt100'), sequence('ESC # 3')]":
  function DECDHLT()
  {
    var screen = this._screen,
        line = screen.getCurrentLine();

    line.type = coUtils.Constant.LINETYPE_TOP;
    line.dirty = 1;
  },

  /** DEC double-height line, bottom half. */
  "[profile('vt100'), sequence('ESC # 4')]":
  function DECDHLB()
  {
    var screen = this._screen,
        line = screen.getCurrentLine();

    line.type = coUtils.Constant.LINETYPE_BOTTOM;
    line.dirty = 1;
  },

  /**
   *
   * DECSWL — Single-Width, Single-Height Line
   *
   * DECSWL makes the line with the cursor a single-width, single-height
   * line. This line attribute is the standard for all new lines on the
   * screen.
   *
   * Format
   *
   * ESC   #     5
   * 1/11  2/3   3/5
   *
   */
  "[profile('vt100'), sequence('ESC # 5')]":
  function DECSWL()
  {
    var screen = this._screen,
        line = screen.getCurrentLine();

    line.type = coUtils.Constant.LINETYPE_NORMAL;
    line.dirty = 1;
  },

  /** DEC double-width line.
   *
   * DECDWL — Double-Width, Single-Height Line
   *
   * This control function makes the line with the cursor a double-width,
   * single-height line. If the line was single width and single height, then
   * all characters to the right of the screen's center are lost.
   *
   * Format
   *
   * ESC    #     6
   * 1/11   2/3   3/6
   *
   */
  "[profile('vt100'), sequence('ESC # 6')]":
  function DECDWL()
  {
    var screen = this._screen,
        line = screen.getCurrentLine();

    line.type = coUtils.Constant.LINETYPE_DOUBLEWIDTH;
    line.dirty = 1;
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


}; // DoubleSizedCharacters

/**
 * @fn main
 * @brief Module entry point.
 * @param {Broker} broker The Broker object.
 */
function main(broker)
{
  new DoubleSizedCharacters(broker);
}

// EOF
