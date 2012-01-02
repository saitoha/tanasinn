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
 * @class FontSelector
 */
let FontSelector = new Class().extends(Plugin);
FontSelector.definition = {

  get id()
    "fontselector",

  get info()
    <plugin>
        <name>{_("Font")}</name>
        <description>{
          _("Makes you to be able to select terminal font.")
        }</description>
        <version>0.1</version>
    </plugin>,

  get template()
    ({
      tagName: "vbox",
      flex: 1,
      childNodes: [
        {
          tagName: "hbox",
          flex: 1,
          style: { MozAppearance: "tabpanels", overflowY: "auto" },
          childNodes: [
            {
              tagName: "vbox",
              flex: 1,
              style: "overflowY: scroll;",
              childNodes: this._fonts,
            },
          ],
        },
        {
          tagName: "hbox",
          id: "coterminal-font-sample",
          innerText: "abcde",
          style: {
            fontSize: "40px",    
          },
        },
      ],
    }),

  _bottom_panel: null,

  /** constructor */
  "[subscribe('@initialized/bottompanel'), enabled]":
  function onLoad(renderer, bottom_panel) 
  {
    this._renderer = renderer;
    let font_list = Components
      .classes["@mozilla.org/gfx/fontenumerator;1"]
      .getService(Components.interfaces.nsIFontEnumerator)
      .EnumerateFonts("", "", {})
      .filter(function(font_family) {
        let [pitch1] = coUtils
          .Font
          .getAverageGryphWidth(10, font_family, "abcdefgHIJ");
        let [pitch2] = coUtils
          .Font
          .getAverageGryphWidth(10, font_family, "KLMNOPQRST");
        return pitch1 == pitch2;
      });

    font_list.unshift("monospace");

    this._fonts = font_list.map(function(font) ({ 
      tagName: "vbox",
      childNodes: [
        {
          tagName: "hbox", 
          innerText: font, 
        },
        {
          tagName: "hbox", 
          style: { 
            fontFamily: font, 
            color: "white", 
            background: "black", 
          },
          innerText: "abcde", 
        },
      ],
    }));
    this._bottom_panel = bottom_panel;
    this.enabled = this.enabled_when_startup;
  },

  /** Installs itself */
  install: function install(session) 
  {
    session.notify("command/add-panel", this);
    this.onFontSizeChanged.enabled = true;
    this.onFontFamilyChanged.enabled = true;
    this.select.enabled = true;
  },

  /** Uninstalls itself */
  uninstall: function uninstall(session) 
  {
    session.notify("command/remove-panel", this);
    this.onFontSizeChanged.enabled = false;
    this.onFontFamilyChanged.enabled = false;
    this.select.enabled = false;
  },

  onSelectFont: function onSelectFont(event)
  {
    let font_family = event.target.value;
    let session = this._broker;
    session.notify("set/font-family", font_family);
    session.notify("command/draw", true);
  },

  "[subscribe('variable-changed/renderer.font_size')]":
  function onFontSizeChanged(font_size) 
  {
    let session = this._broker;
    let [sample] = session.notify("command/query-selector", "#coterminal-font-sample");
    sample.style.fontSize = font_size;
  },

  "[subscribe('variable-changed/renderer.font_family')]":
  function onFontFamilyChanged(font_family) 
  {
    let session = this._broker;
    let [sample] = session.notify("command/query-selector", "#coterminal-font-sample");
    sample.style.fontFamily = font_family;
  },

  "[key('meta + 4'), _('Open font selector.')]":
  function select() 
  {
    let session = this._broker;
    session.notify("command/select-panel", this);
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
    function(session) new FontSelector(session));
}

