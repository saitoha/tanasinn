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
 * @file resizable.js
 * @brief define resize manager.
 */

/**
 * @trait ResizeShortcut
 */
var ResizeShortcut = new Trait();
ResizeShortcut.definition = {

  /** Make the screen narrower by 1 column. */
  "[command('narrower'), nmap('<M-,>', '<C-S-,>'), _('Make the screen narrower.'), pnp]":
  function makeNarrower()
  {
    this.shrinkColumn(1);
    return true;
  },

  /** Make the screen wider by 1 column. */
  "[command('wider'), nmap('<M-.>', '<C-S-.>'), _('Make the screen wider.'), pnp]":
  function makeWider()
  {
    this.expandColumn(1);
    return true;
  },

  /** Make the screen shorter by 1 row. */
  "[command('shorter'), nmap('<M-S-(>', '<C-S-8>'), _('Make the screen shorter.'), pnp]":
  function makeShorter()
  {
    this.shrinkRow(1);
    return true;
  },

  /** Make the screen taller by 1 row. */
  "[command('taller'), nmap('<M-S-)>', '<C-S-9>'), _('Make the screen taller.'), pnp]":
  function makeTaller()
  {
    this.expandRow(1);
    return true;
  },

};

/**
 * @class Resize
 * @fn Enable resizable operation.
 */
var Resize = new Class().extends(Plugin)
                        .mix(ResizeShortcut)
                        .depends("screen");
Resize.definition = {

  id: "resize",

  /** plugin information */
  getInfo: function getInfo()
  {
    return {
      name: _("Resize"),
      version: "0.1",
      description: _("Makes terminal window resizable.")
    };
  },

  "[persistable] enabled_when_startup": true,

  "[persistable] min_column": 1,
  "[persistable] min_row": 1,

  _screen: null,

  /** Installs itself.
   *  @param {InstallContext} context A InstallContext object.
   */
  "[install]":
  function install(context)
  {
    this._screen = context["screen"];
  },

  /** Uninstalls itself.
   */
  "[uninstall]":
  function uninstall()
  {
    this._screen = null;
  },


  /** Resize screen.
   * @param {Object} A pair of {column, row} for new size.
   */
  "[subscribe('command/resize-screen'), pnp]":
  function resize(size)
  {
    var column = size.column,
        row = size.row,
        screen = this._screen,
        // Minimam size: 12 x 6
        min_column = this.min_column,
        min_row = this.min_row;

    if (column < min_column) {
      column = min_column;
    }
    if (row < min_row) {
      row = min_row;
    }

    screen.setWidth(column);
    screen.setHeight(row);
  },

  /** notify "event/screen-size-changed" event.
   */
  "[subscribe('event/resize-session-closed'), pnp]":
  function update()
  {
    var screen = this._screen;

    screen.setDirty();

    this.sendMessage(
      "event/screen-size-changed",
      {
        column: screen.getWidth(),
        row: screen.getHeight()
      });
  },

  /** Make the screen narrower by n columns.
   * @param {Number} n count of columns to shrink.
   */
  "[subscribe('command/shrink-column'), pnp]":
  function shrinkColumn(n)
  {
    var screen = this._screen;

    this.resize({
      column: screen.getWidth() - n,
      row: screen.getHeight()
    });
    this.update();
  },

  /** Make the screen wider by n columns.
   * @param {Number} n count of columns to expand.
   */
  "[subscribe('command/expand-column'), pnp]":
  function expandColumn(n)
  {
    var screen = this._screen;

    this.resize({
      column: screen.getWidth() + n,
      row: screen.getHeight()
    });
    this.update();
  },

  /** Make the screen shorter by n rows.
   * @param {Number} n count of rows to shrink.
   */
  "[subscribe('command/shrink-row'), pnp]":
  function shrinkRow(n)
  {
    var screen = this._screen;

    this.resize({
      column: screen.getWidth(),
      row: screen.getHeight() - n
    });
    this.update();
  },

  /** Make the screen taller by n rows.
   * @param {Number} n count of rows to expand.
   */
  "[subscribe('command/expand-row'), pnp]":
  function expandRow(n)
  {
    var screen = this._screen;

    this.resize({
      column: screen.getWidth(),
      row: screen.getHeight() + n
    });
    this.update();
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
 * @param {Broker} Broker The Broker object.
 */
function main(broker)
{
  new Resize(broker);
}

// EOF
