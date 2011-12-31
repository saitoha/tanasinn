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
 * @class Shortcut
 */
let Shortcut = new Class().extends(Plugin);
Shortcut.definition = {

  get id()
    "shortcut",

  get info()
    <plugin>
        <name>{_("Shortcut")}</name>
        <description>{
          _("Helps you to view and edit the shortcut key settings.")
        }</description>
        <version>0.1</version>
    </plugin>,

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
    this.select.enabled = true;
    let bottom_panel = this._bottom_panel;
    this._panel = bottom_panel.alloc(this.id, this.info..name);
  },

  /** Uninstalls itself */
  uninstall: function uninstall() 
  {
    this.select.enabled = false;
    let bottom_panel = this._bottom_panel;
    bottom_panel.remove(this.id);
  },

  "[key('meta + t'), _('Open shortcut manager.')]":
  function select()
  {
    this._bottom_panel.select(this.id);
  },

  "[subscribe('panel-selected/' + this.id), enabled]":
  function onSelected(name) 
  {
    let panel = this._panel;
    let session = this._broker;
    let shortcuts = session.notify("get/shortcuts");
    if (panel.firstChild) {
      panel.removeChild(panel.firstChild);
    }
    session.uniget("command/construct-chrome", {
      parentNode: panel,
      tagName: "tree", flex: 1, editable: true, treelines: true,
      style: { MozUserFocus: "ignore" },
      childNodes: [
        {
          tagName: "treecols",
          childNodes: [
            { tagName: "treecol", id: "id", label: "id", flex: 1, },
            { tagName: "splitter" },
            { tagName: "treecol", id: "description", label: "description", flex: 2, },
            { tagName: "splitter" },
            { tagName: "treecol", id: "expressions", label: "key", flex: 2, },
          ]
        },
        { tagName: "treechildren", editable: true }
      ],
      onconstruct: function onconstruct()
      {
        this.view = {
          rowCount : shortcuts.length,
          getCellText : function(row, column) {
            let value = shortcuts[row][column.id];
            if ("expressions" == column.id) {
              return value.toSource();
            }
            return value;
          },
          setCellText : function(row, column, value) {
            if ("expressions" == column.id) {
              try {
                if (session.window.content) {
                  session.window._content.focus();
                }
                session.notify("command/focus");
                let handler = shortcuts[row];
                handler.expressions = eval(value);
                if (handler.enabled) {
                  handler.enabled = false;
                  handler.enabled = true;
                }
                let [ settings ] = session.process.notify("command/get-settings", session) || [];
                if (settings) {
                  session.process.notify("command/save-settings", settings);
                  this.treebox.invalidate();
                } else {
                  throw coUtils.Debug.Exception(
                    _("'command/get-settings' returns null."));
                }
              } catch (e) {
                coUtils.Debug.reportError(e);
              }
            }
          },
          setTree: function(treebox) this.treebox = treebox,
          isContainer: function(row) false,
          isSeparator: function(row) false,
          isSorted: function() false,
          isEditable: function(row, column) "expressions" == column.id,
          getLevel: function(row) row,
          getImageSrc: function(row, col) null,
          getRowProperties: function(row, props) undefined,
          getCellProperties: function(row, col, props) undefined,
          getColumnProperties: function(colid, col, props) undefined
        };
      },
    });
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
    function(session) new Shortcut(session));
}

