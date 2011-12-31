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
 * @class StyleManager
 */
let StyleManager = new Class().extends(Plugin);
StyleManager.definition = {

  get id()
    "stylemanager",

  get info()
    <plugin>
        <name>{_("Style")}</name>
        <description>{
          _("Makes you to be able to view and edit stylesheet.")
        }</description>
        <version>0.1</version>
    </plugin>,

  get template()
    ({
      tagName: "html:input", flex: 1,
      style: { MozUserFocus: "normal", MozAppearance: "tabpanels", overflowY: "auto" },
      //childNodes: {
      //  tagName: "html:input",
      //  value: "dfaf",
      //  //style: { MozUserFocus: "ignore", },
      //},
    }),

  _bottom_panel: null,

  /** post constructor 
   */ 
  "[subscribe('@initialized/bottompanel'), enabled]":
  function onLoad(/* bottom_panel */) 
  {
//    this.enabled = this.enabled_when_startup;
  },

  /** Installs itself.
   *  @param {Session} session A Session object.
   */
  install: function install(session) 
  {
    session.notify("command/add-panel", this); 
    this.select.enabled = true;
  },

  /** Uninstalls itself.
   *  @param {Session} session A Session object.
   */
  uninstall: function uninstall(session) 
  {
    session.notify("command/remove-panel", this); 
    this.select.enabled = false;
  },

  /** Asks the bottom panel to select this panel.
   */
  "[key('meta + y'), _('Open style manager.')]":
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
    function(session) new StyleManager(session));
}

