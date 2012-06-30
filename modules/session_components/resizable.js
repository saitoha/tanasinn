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

  get id()
    "resize",

  get info()
    <plugin>
        <name>{_("Resize")}</name>
        <description>{
          _("Makes terminal window resizable.")
        }</description>
        <version>0.1</version>
    </plugin>,

  "[persistable] enabled_when_startup": true,

  "[persistable] min_column": 12,
  "[persistable] min_row": 6,

  /** Resize screen. 
   * @param {Object} A pair of {column, row} for new size.
   */ 
  "[subscribe('command/resize-screen'), pnp]":
  function resize(size) 
  {
    var column, row, screen, min_column, min_row;

    column = size.column;
    row = size.row;

    screen = this.dependency["screen"];
    // Minimam size: 12 x 6 
    min_column = this.min_column;
    min_row = this.min_row;
    if (column < min_column) {
      column = min_column;
    }
    if (row < min_row) {
      row = min_row;
    }

    screen.width = column;
    screen.height = row;
  },

  /** notify "event/screen-size-changed" event. 
   */ 
  "[subscribe('event/resize-session-closed'), pnp]":
  function update() 
  {
    var screen;

    screen = this.dependency["screen"];
    screen.dirty = true;

    this.sendMessage("event/screen-size-changed", { 
      column: screen.width, 
      row: screen.height 
    });
  },

  /** Make the screen narrower by n columns. 
   * @param {Number} n count of columns to shrink. 
   */ 
  "[subscribe('command/shrink-column'), pnp]":
  function shrinkColumn(n) 
  {
    var screen;

    screen = this.dependency["screen"];
    this.resize({column: screen.width - n, row: screen.height});
    this.update();
  },

  /** Make the screen wider by n columns.
   * @param {Number} n count of columns to expand.
   */ 
  "[subscribe('command/expand-column'), pnp]":
  function expandColumn(n) 
  {
    var screen;

    screen = this.dependency["screen"];
    this.resize({column: screen.width + n, row: screen.height});
    this.update();
  },

  /** Make the screen shorter by n rows.
   * @param {Number} n count of rows to shrink.
   */
  "[subscribe('command/shrink-row'), pnp]":
  function shrinkRow(n)
  {
    var screen;

    screen = this.dependency["screen"];
    this.resize({column: screen.width, row: screen.height - n});
    this.update();
  },
  
  /** Make the screen taller by n rows. 
   * @param {Number} n count of rows to expand.
   */ 
  "[subscribe('command/expand-row'), pnp]":
  function expandRow(n) 
  {
    var screen;

    screen = this.dependency["screen"];
    this.resize({column: screen.width, row: screen.height + n});
    this.update();
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
