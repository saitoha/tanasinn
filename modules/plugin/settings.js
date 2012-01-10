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


let View = new Aspect();
View.definition = {

  "[subscribe('event/session-started'), enabled]":
  function onSessionStarted(session)
  {
    this._process = session.process;
    [ this._settings ] = this._process.notify("command/get-settings", session) || [];
    if (!this._settings) {
      throw coUtils.Debug.Exception(
        _("'command/get-settings' returns null."));
    }
    this._data = [ { 
      key: key, 
      value: value 
    } for ( [key, value] in Iterator(this._settings)) ]
      .sort(function(lhs, rhs) lhs.key > rhs.key ? 1: -1);
  },

  get rowCount() 
  {
    return this._data.length;
  },

  getCellText: function getCellText(row, column) 
  {
    return this._data[row][column.id];
  },

  setCellText: function setCellText(row, column, value) 
  {
    let session = this._broker;
    try {
      if (session.window._content) {
        session.window._content.focus();
      }
      session.notify("change-focus-mode", true);
      session.notify("command/focus");
      this._settings[this._data[row].key] = value;
      this._data[row].value = value;
      this._process.notify("command/save-settings", this._settings);
      if (this._treebox) {
        this._treebox.invalidate();
      }
    } catch (e) {
      coUtils.Debug.reportError(e);
    }
  },

  setTree: function(treebox) 
  {
    this._treebox = treebox;
  },

  isContainer: function(row) 
  {
    return false;
  },

  isSeparator: function(row) 
  {
    return false;
  },

  isSorted: function() 
  {
    return false;
  },

  isEditable: function(row, column) 
  {
    return "value" == column.id;
  },

  getLevel: function(row) 
  {
    return row;
  },

  getImageSrc: function(row, col)
  {
    return null;
  },

  getRowProperties: function(row, props)
  {
  },

  getCellProperties: function(row, col, props)
  {
  },

  getColumnProperties: function(colid, col, props)
  {
  },

};

/**
 * @class SettingsBrowser
 */
let SettingsBrowser = new Class().extends(Plugin).mix(View);
SettingsBrowser.definition = {

  get id()
    "settings_browser",

  get info()
    <plugin>
        <name>{_("Settings Browser")}</name>
        <description>{
          _("Browse settings informatioin.")
        }</description>
        <version>0.1</version>
    </plugin>,

  get template()
    ({
      tagName: "tree", flex: 1, editable: true,
      style: { MozUserFocus: "ignore", },
      childNodes: [
        { 
          tagName: "treecols",
          childNodes: [
            { tagName: "treecol", id: "key", label: _("key"), flex: 1, },
            { tagName: "splitter" },
            { tagName: "treecol", id: "value", label: _("value"), flex: 1, editable: true },
          ],
        },
        { tagName: "treechildren", editable: true }
      ],
      onconstruct: let (view = this) function()
      {
        this.view = view;
      },
    }),

  _bottom_panel: null,
  _viewer: null,

  "[subscribe('@initialized/bottompanel'), enabled]":
  function onLoad(bottom_panel) 
  {
    this._bottom_panel = bottom_panel;
    this.enabled = this.enabled_when_startup;
  },

  /** Installs itself */
  install: function install() 
  {
    let bottom_panel = this._bottom_panel;
    this.select.enabled = true;
    this._panel = bottom_panel.add(this);
  },

  /** Uninstalls itself */
  uninstall: function uninstall() 
  {
    this.select.enabled = false;
    this._bottom_panel.remove(this.id);
  },

  "[command('settingsmanager'), key('meta + s'), _('Open settings manager.')]":
  function select()
  {
    this._bottom_panel.select(this.id);
  },
};

/**
 * @fn main
 * @brief Module entry point.
 * @param {Desktop} desktop The Desktop object.
 */
function main(desktop) 
{
  desktop.subscribe(
    "initialized/session", 
    function(session) new SettingsBrowser(session));
}

