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
 * @class MessageFilter
 */
let MessageFilter = new Class().extends(Plugin);
MessageFilter.definition = {

  get id()
    "messagefilter",

  get info()
    <module>
        <name>{_("Message Filter")}</name>
        <description>{
          _("Receives raw console messages and formats them.")
        }</description>
        <version>0.1</version>
    </module>,

  get style() <![CDATA[
    @import "chrome://global/skin/console/console.css";
    .coterminal-console-error   { background-color: lightpink; }
    .coterminal-console-warning { background-color: lightyellow; }
    .coterminal-console-message { background-color: lightblue; }
    .coterminal-console-native  { background-color: silver; }
    .coterminal-console-unknown { background-color: orange; }
    .coterminal-console-line {
      border-bottom: 1px solid green;
      padding: 0px 5px;
    }
    .coterminal-console > *:not([class~="error"  ]) > .coterminal-console-error { 
      display: none !important;
    }
    .coterminal-console > *:not([class~="warning"]) > .coterminal-console-warning { 
      display: none !important;
    }
    .coterminal-console > *:not([class~="message"]) > .coterminal-console-message { 
      display: none !important;
    }
    .coterminal-console > *:not([class~="native" ]) > .coterminal-console-native { 
      display: none !important;
    }
  ]]>,

  get filter_expression()
    /^\[(.+?): "(coTerminal: )?([^"]*?)" {file: "([^"]*?)" line: ([0-9]+?)( name: "([^"]*?)")?}\]$/m,
  
  _css: null,

  /** constructor 
   *  @param {Session} session A Session object.
   */
  initialize: function initialize(session) 
  {
    this.enabled = this.enabled_when_startup;
  },

  /** Installs itself.
   *  @param {Session} session A Session object.
   */
  install: function uninstall(session) 
  {
    this._css = coUtils.Style.addRule(session.root_element, this.style);
    this.onMessageFiltersRequired.enabled = true;
  },

  /** Uninstalls itself. 
   *  @param {Session} session A Session object.
   */
  uninstall: function uninstall(session) 
  {
    this.onMessageFiltersRequired.enabled = false;
    coUtils.Style.removeRule(this._css);
  },

  "[subscribe('get/message-filters')]": 
  function onMessageFiltersRequired(filters) 
  {
    return this;
  },

  test: function test(logtext) 
  {
    this.logtext = logtext;
    this.match = logtext.match(this.filter_expression);
    return null != this.match;
  },

  action: function action() 
  {
    let session = this._broker;
    let logtext = this.logtext;
    let match = this.match;
    let [, category, , message, file, line] = match;
    let class_string = this._getClassString(category);
    if ("coterminal-console-error" == class_string) {
      //let session = this._broker;
      //session.notify("an-error-occured", class_string);
      try {
        Components.classes["@mozilla.org/alerts-service;1"]
          .getService(Components.interfaces.nsIAlertsService)
          .showAlertNotification(
            //"chrome://mozapps/skin/downloads/downloadIcon.png",   // imageUrl
            "chrome://mozapps/skin/extensions/alerticon-error.png",
            category,
            message,    // text
            true,  // textClickable
            file,     // cookie
            {
              observe: function observe(subject, topic, data) 
              {
                if ("alertclickcallback" == topic) {
                  session.notify("command/select-panel", "!console.panel");
                }
              }
            },   // listener
            "" // name
            ); 
      } catch (e) {
        ; // pass
        // Ignore this error.
        // This is typically NS_ERROR_NOT_AVAILABLE,
        // which may happen, for example, on Mac OS X if Growl is not installed.
      }
    }
    return {
      tagName: "html:div",
      className: "coterminal-console-line " + class_string,
      childNodes: [
        { 
          tagName: "html:span", 
          innerText: message + " ", 
        },
        { 
          tagName: "html:span", 
          innerText: file.split("/").pop() + " ", 
          style: { color: "red" }   
        },
        { 
          tagName: "html:span", 
          innerText: "line: " + line
        }
      ]
    };
  },

  /** Returns className string which corresponds to specified message category 
   *  string. 
   *  @param {String} category A message category string.
   */
  _getClassString: function(category) 
  {
    let result = {
      "JavaScript Error"  : "coterminal-console-error",
      "JavaScript Warning": "coterminal-console-warning",
      "JavaScript Message": "coterminal-console-message",
      "Native Message"    : "coterminal-console-native",
    } [category]         || "coterminal-console-unknown";
    return result;
  },

}

/**
 * @fn main
 * @brief Module entry point.
 * @param {Process} process The Process object.
 */
function main(process) 
{
  process.subscribe(
    "initialized/session", 
    function(session) new MessageFilter(session));
}

