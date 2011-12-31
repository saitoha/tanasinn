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
 * @class ErrorIndicator
 */
let ErrorIndicator = new Class().extends(Plugin)
ErrorIndicator.definition = {

  get id()
    "error_indicator",

  get info()
    <plugin>
        <name>{_("Error Indicator")}</name>
        <description>{
          _("Notifys you of errors and warnings that reported to console service.")
        }</description>
        <version>0.1</version>
    </plugin>,

  get template()
    let (session = this._broker)
    {
      tagName: "box",
      childNodes: [
        {
          tagName: "toolbarbutton",
          id: "coterminal-error-indicator",
          style: {
            margin: "0px",
            padding: "2px",
            width: "14px", 
            height:"14px", 
            background: "lightblue",
          },
          listener: {
            type: "click",
            context: this,
            handler: function() 
            {
              session.notify(
                "command/select-panel", 
                "console.panel");
            },
          },
        },
      ]
    },

  /** constructor */
  "[subscribe('@installed/statusbar'), enabled]":
  function construct(statusbar) 
  {
    this._statusbar = statusbar;
    this.enabled = this.enabled_when_startup;
  },

  /** Installs itself. */
  install: function install(session)
  {
    this._statusbar.add(this.id, this.template);
    [this._indicator] = session.notify(
      "command/query-selector", 
      "#coterminal-error-indicator");
    this.onErrorOccured.enabled = true;
    this.clearMessage.enabled = true;
  },

  /** Uninstalls itself. */
  uninstall: function uninstall(session) 
  {
    this._statusbar.remove(this.id);
    this.onErrorOccured.enabled = false;
    this.clearMessage.enabled = false;
  },

  "[subscribe('an-error-occured')]": 
  function onErrorOccured(class_name) 
  {
    let indicator = this._indicator;
    indicator.style.background = "red";
  },

  "[subscribe('command/clear-messages')]":
  function clearMessage() 
  {
    let indicator = this._indicator;
    indicator.style.background = "lightblue";
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
    function(session) new ErrorIndicator(session));
}




