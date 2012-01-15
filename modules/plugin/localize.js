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
 * @aspect View
 */
let View = new Aspect();
View.definition = {

  /** Constructor */
  initialize: function initialize(session)
  {
    this._lang = coUtils.Localize.locale;
  },

// nsITreeView
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
    let data = this._data;
    this._dict[data[row].key] = value;
    this.save();
    data[row].value = value;
    this.treebox.invalidate();
  },

  setTree: function setTree(treebox) 
  {
    this.treebox = treebox;
  },

  isContainer: function isContainer(row) 
  {
    return false;
  },

  isSeparator: function isSeparator(row) 
  {
    return false;
  },

  isSorted: function isSorted() 
  {
    return false;
  },

  isEditable: function isEditable(row, column)
  {
    return "value" == column.id;
  },

  getLevel: function getLevel(row) 
  { 
    return row;
  },

  getImageSrc: function getImageSrc(row, col) 
  {
    return null;
  },

  getRowProperties: function getRowProperties(row, props) 
  {
  },

  getCellProperties: function getCellProperties(row, col, props)
  {
  },

  getColumnProperties: function getColumnProperties(colid, col, props) 
  {
  },

};

/**
 * @class Localize
 */
let Localize = new Class().extends(Plugin).mix(View);
Localize.definition = {

  get id()
    "localize",

  get info()
    <plugin>
        <name>{_("Localize")}</name>
        <description>{
          _("Help you to localize text messages.")
        }</description>
        <version>0.1</version>
    </plugin>,

  get template()
    let (self = this)
    { 
      tagName: "vbox",
      flex: 1,
      childNodes: [
        {
          tagName: "tree", flex: 1, editable: true,
          hidecolumnpicker: true,
          style: { MozUserFocus: "ignore", },
          childNodes: [
            { 
              tagName: "treecols",
              childNodes: [
                { 
                  tagName: "treecol", 
                  id: "key", 
                  label: _("Original message"), 
                  flex: 1, 
                },
                { tagName: "splitter" },
                { 
                  tagName: "treecol", 
                  id: "value", 
                  label: _("Localized message"), 
                  flex: 3, 
                  editable: true 
                },
              ],
            },
            { tagName: "treechildren", editable: true }
          ],
        },
        {
          tagName: "hbox",
          childNodes: [
            {
              tagName: "menulist",
              childNodes: {
                tagName: "menupopup",
                style: { MozUserFocus: "ignore", },
                listener: {
                  type: "command",
                  context: this,
                  handler: function(event)
                  {
                    let lang = event.target.value;
                    this._lang = lang; 
                    this.load();
                  },
                },
                childNodes: [
                  {
                    tagName: "menuitem",
                    label: lang.label,
                    value: lang.value,
                    selected: lang.value == this._lang,
                  } for ([, lang] in Iterator([
                    {
                      label: "English/US",
                      value: "en-US",
                    },
                    {
                      label: "\u65E5\u672C\u8A9E",
                      value: "ja-JP",
                    },
                  ]))
                ],
              }
            }
          ]
        },
      ],
      onconstruct: let (self = this) function()
      {
        self.load();
        this.firstChild.view = self;    
      },
    },

  _bottom_panel: null,

  /** constructor */
  "[subscribe('@initialized/bottompanel'), enabled]":
  function onLoad(bottom_panel) 
  {
    this._bottom_panel = bottom_panel;
    this.enabled = this.enabled_when_startup;
  },

  /** Installs itself */
  install: function install(session) 
  {
    let bottom_panel = this._bottom_panel;
    bottom_panel.add(this);
    this.select.enabled = true;
  },

  /** Uninstalls itself */
  uninstall: function uninstall(session) 
  {
    let bottom_panel = this._bottom_panel;
    bottom_panel.remove(this);
    this.select.enabled = false;
  },

  "[command('localizemanager/lm'), key('meta r'), _('Open localize manager.')]":
  function select()
  {
    this._bottom_panel.select(this);
  },

  /** The generator method that iterates source code text.
   *  @return {Generator} Generator that yields source code text.
   */
  generateSources: function generateSources(search_path) 
  {
    let entries = coUtils.File
      .getFileEntriesFromSerchPath(search_path);
    for (let entry in entries) {
      // make URI string such as "file://....".
      let url = coUtils.File.getURLSpec(entry); 
      try {
        let content = coUtils.IO.readFromFile(url);
        yield content;
      } catch (e) {
        coUtils.Debug.reportError(e);
        coUtils.Debug.reportError(
          _("An Error occured loading common module '%s'."), url);
      }
    }
  },

  /** The generator method that extracts message-id string from source code 
   *  files.
   *  @return {Generator} Generator that yields message-id string.
   */
  generateLocalizableMessages: function generateLocalizableMessages() 
  {
    let pattern = /_\(("(.+?)("[\n\r\s]*,[\n\r\s]*".+?)*"|'(.+?)')\)/g;
    let sources = this.generateSources([ "modules/" ]);
    for (let source in sources) {
      let match = source.match(pattern)
      if (match) {
        match = match.map(function(text) {
          return eval("[" + text.slice(2, -1)/*.replace("\\", "\\\\")*/ + "]").join("");
        })
        for (let [, message] in Iterator(match)) {
          yield message;
        }
      }
    }
  },

  /** Returns translatoin file name that correnponds to selected language. 
   *  @return {String} The file name of current language file.
   */
  getCurrentLangFileName: function getCurrentLangFileName() 
  {
    let lang = this._lang.replace("-", "_");
    let file_name = coUtils.Text.format("modules/locale/%s.js", lang);
    return file_name;
  },

  load: function load() 
  {
    let lang = this._lang;
    this._localize_info = this._localize_info || {};
    let dict = this._localize_info[lang] = this._localize_info[lang] || {};
    for (let message_id in this.generateLocalizableMessages()) {
      dict[message_id] = "";
    }
    let file_name = this.getCurrentLangFileName();
    let message_db = eval(coUtils.IO.readFromFile(file_name, "utf-8"));
    for (let [key, value] in Iterator(message_db.dict)) {
      dict[key] = value;
    }

    this._dict = dict;
    this._data = [ { 
      key: key, 
      value: value 
    } for ( [key, value] in Iterator(dict)) ]
      .sort(function(lhs, rhs) lhs.key > rhs.key ? 1: -1);

  },

  /** Saves localized message to file. */
  save: function save() 
  {
    let lang = this._lang;
    let message_db = {
      lang: lang,
      dict: this._localize_info[lang],
    };
    let file_name = this.getCurrentLangFileName();
    let text = message_db.toSource();
    coUtils.IO.writeToFile(file_name, text);
    if (lang == coUtils.Localize.locale) {
      coUtils.Localize.load();
    }
  },
};

/**
 * @fn main
 * @brief Module entry point.
 * @param {Desktop} desktop The Desktop object.
 */
function main(desktop) 
{
//  desktop.subscribe(
//    "@initialized/broker", 
//    function(session) new Localize(session));
}

