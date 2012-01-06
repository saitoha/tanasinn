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
 * The Original Code is coTerminal
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
 * @aspect ResizeShortcut
 */
let ResizeShortcut = new Aspect();
ResizeShortcut.definition = {

  /** Make the screen narrower by 1 column. */ 
  "[command('narrower'), key('meta ,'), _('Make the screen narrower.')]":
  function makeNarrower() 
  {
    this.shrinkColumn(1);
  },

  /** Make the screen wider by 1 column. */ 
  "[command('wider'), key('meta .'), _('Make the screen wider.')]":
  function makeWider() 
  {
    this.expandColumn(1);
  },

  /** Make the screen shorter by 1 row. */ 
  "[command('shorter'), key('meta ['), _('Make the screen shorter.')]":
  function makeShorter() 
  {
    this.shrinkRow(1);
  },

  /** Make the screen taller by 1 row. */ 
  "[command('taller'), key('meta ]'), _('Make the screen taller.')]":
  function makeTaller() 
  {
    this.expandRow(1);
  },

};

/**
 * @class Resize
 * @fn Enable resizable operation.
 */
let Resize = new Class().extends(Plugin).mix(ResizeShortcut);
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

  "[persistable] min_column": 48,
  "[persistable] min_row": 20,

  _screen: null,

  /** constructor */
  "[subscribe('@initialized/screen'), enabled]":
  function onLoad(screen) 
  {
    this._screen = screen;
    this.enabled = this.enabled_when_startup;
  },

  /** Installs itself. */
  install: function install(session) 
  {
    this.makeNarrower.enabled = true;
    this.makeWider.enabled = true;
    this.makeShorter.enabled = true;
    this.makeTaller.enabled = true;
    this.shrinkColumn.enabled = true;
    this.expandColumn.enabled = true;
    this.shrinkRow.enabled = true;
    this.expandRow.enabled = true;
    this.update.enabled = true;
    this.resize.enabled = true;
    session.notify("initialized/resizemanager", this);
  },

  /** Unnstalls itself. */
  uninstall: function uninstall(session)
  {
    this.makeNarrower.enabled = false;
    this.makeWider.enabled = false;
    this.makeShorter.enabled = false;
    this.makeTaller.enabled = false;
    this.shrinkColumn.enabled = false;
    this.expandColumn.enabled = false;
    this.shrinkRow.enabled = false;
    this.expandRow.enabled = false;
    this.update.enabled = false;
    this.resize.enabled = false;
  },

  /** Resize screen. 
   * @param {Object} A pair of {column, row} for new size.
   */ 
  "[subscribe('command/resize-screen')]":
  function resize(size) 
  {
    let {column, row} = size;
    let screen = this._screen;
    // Minimam size: 48 x 12 
    let {min_column, min_row} = this;
    if (column < min_column) column = min_column;
    if (row < min_row) row = min_row;
    screen.width = column;
    screen.height = row;
    this.update();
  },

  /** notify "event/screen-size-changed" event. 
   */ 
  "[subscribe('event/resize-session-closed')]":
  function update() 
  {
    let screen = this._screen;
    screen.dirty = true;

    let session = this._broker;
    session.notify("event/screen-size-changed", { 
      column: screen.width, 
      row: screen.height 
    });
  },

  /** Make the screen narrower by n columns. 
   * @param {Number} n count of columns to shrink. 
   */ 
  "[subscribe('command/shrink-column')]":
  function shrinkColumn(n) 
  {
    let screen = this._screen;
    this.resize({column: screen.width - n, row: screen.height});
  },

  /** Make the screen wider by n columns.
   * @param {Number} n count of columns to expand.
   */ 
  "[subscribe('command/expand-column')]":
  function expandColumn(n) 
  {
    let screen = this._screen;
    this.resize({column: screen.width + n, row: screen.height});
  },

  /** Make the screen shorter by n rows.
   * @param {Number} n count of rows to shrink.
   */
  "[subscribe('command/shrink-row')]":
  function shrinkRow(n)
  {
    let screen = this._screen;
    this.resize({column: screen.width, row: screen.height - n});
  },
  
  /** Make the screen taller by n rows. 
   * @param {Number} n count of rows to expand.
   */ 
  "[subscribe('command/expand-row')]":
  function expandRow(n) 
  {
    let screen = this._screen;
    this.resize({column: screen.width, row: screen.height + n});
  },
};


/**
 * @fn main
 * @brief Module entry point.
 * @param {Process} process The Process object.
 */
function main(process) 
{
  process.subscribe(
    "initialized/session", 
    function(session) new Resize(session));
}

