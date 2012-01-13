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
    @import "chrome://global/skin/viewbuttons.css";
    .tanasinn-console-error   { background-color: lightpink; }
    .tanasinn-console-warning { background-color: lightyellow; }
    .tanasinn-console-message { background-color: lightblue; }
    .tanasinn-console-native  { background-color: silver; }
    .tanasinn-console-unknown { background-color: orange; }
    .tanasinn-console-line { border-bottom: 1px solid green; padding: 0px 5px; }
    .tanasinn-console > *:not([class~="error"  ]) > .tanasinn-console-error { display: none !important; }
    .tanasinn-console > *:not([class~="warning"]) > .tanasinn-console-warning { display: none !important; }
    .tanasinn-console > *:not([class~="message"]) > .tanasinn-console-message { display: none !important; }
    .tanasinn-console > *:not([class~="native" ]) > .tanasinn-console-native { display: none !important; }
  ]]>,

  get filter_expression()
    /^\[(.+?): "(tanasinn: )?([^"]*?)" {file: "([^"]*?)" line: ([0-9]+?)( name: "([^"]*?)")?}\]$/m,
  
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
    file = file.split("/").pop().split("?").shift();
    if ("tanasinn-console-error" == class_string) {
      //let session = this._broker;
      //session.notify("an-error-occured", class_string);
      try {
        Components.classes["@mozilla.org/alerts-service;1"]
          .getService(Components.interfaces.nsIAlertsService)
          .showAlertNotification(
            //"chrome://mozapps/skin/downloads/downloadIcon.png",   // imageUrl
            "chrome://mozapps/skin/extensions/alerticon-error.png",
            category,
            file + ":" + line + " " + message,    // text
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
      tagName: "row",
      className: "tanasinn-console-line " + class_string,
      childNodes: [
        { 
          tagName: "label", 
          crop: "start",
          width: 100,
          value: file + " ", 
          style: { color: "red", width: "4em", }   
        },
        { 
          tagName: "box", 
          innerText: "line: " + line
        },
        { 
          tagName: "box", 
          innerText: message + " ", 
        },
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
      "JavaScript Error"  : "tanasinn-console-error",
      "JavaScript Warning": "tanasinn-console-warning",
      "JavaScript Message": "tanasinn-console-message",
      "Native Message"    : "tanasinn-console-native",
    } [category]         || "tanasinn-console-unknown";
    return result;
  },

}

/*
 * @class DisplayManager
 * @brief Manages sisplay state for messages.
 */
let DisplayManager = new Class().extends(Component);
DisplayManager.definition = {

  get id()
    "displaymanager",

  /** @Property {Boolean} whether auto scroll feature is enabled.  */
  "[persistable] auto_scroll": true,

  _ui: null,
  _output_element: null,
  _filters: null,

  /** post-constructor */
  "[subscribe('@initialized/console'), enabled]":
  function onLoad(console) 
  {
    let session = this._broker;
    let id = "#console_output_box";
    this._output_element = session.uniget("command/query-selector", id);
    session.subscribe("command/clear-messages", function() this.clear(), this);
    this._filters = session.notify("get/message-filters", this._filters);
    session.notify("initialized/displaymanager", this);
  },

  /** Appends a message line to output container. 
   *  @param {String} message raw message text from console service.
   */
  append: function append(message) 
  {
    let output_element = this._output_element;
    if (output_element) {
      let session = this._broker;
      let template = this.applyFilters(message);
      template.parentNode = output_element;
      session.uniget("command/construct-chrome", template);
      // makes scrollbar follow page's height.
      if (this.auto_scroll) {
        this.scrollToBottom();
      }
    }
  },
  
  /** Clears all message lines from output container. 
   */
  clear: function clear() 
  {
    let output_element = this._output_element;
    while (output_element.firstChild) { // MUST NOT allow infinity loop.
      output_element.removeChild(output_element.firstChild);
    }
  },

  /** apply filters and convert a message to ui template.
   * @param {String} message raw message string from console service.
   */
  applyFilters: function applyFilters(message) 
  {
    for (let [, filter] in Iterator(this._filters)) {
      if (filter.test(message)) {
        return filter.action();
      }
    };
    // returns fallback template.
    return {
      tagName: "row",
      style: { borderBottom: "1px solid green" },
      childNodes: [
        { tagName: "box", innerText: "" },
        { tagName: "box", innerText: "" },
        { tagName: "box", innerText: message }
      ]
    };
  },
  
  /** tracks growing scroll region. */
  scrollToBottom: function scrollToBottom() 
  {
    let output_element = this._output_element;
    let frameElement = output_element//.parentNode;
    if (frameElement && frameElement.scrollHeight && frameElement.boxObject) {
      let currentScrollPosition 
        = frameElement.scrollTop + frameElement.boxObject.height;
      if (currentScrollPosition + 50 > frameElement.scrollHeight) {
        coUtils.Timer.setTimeout(function() {
          frameElement.scrollTop = frameElement.scrollHeight;
        }, 10);
      }
    }
  }
};

/** 
 * @class ConsoleListener
 * Listen console messages and pass them to display manager.
 */ 
let ConsoleListener = new Class().extends(Component);
ConsoleListener.definition = {

  get id()
    "consolelistener",

  _console_service: null,
  _display_manager: null,

  /** post-constructor */
  "[subscribe('initialized/displaymanager'), enabled]":
  function onLoad(display_manager) 
  {
    this._console_service = Components
      .classes["@mozilla.org/consoleservice;1"]
      .getService(Components.interfaces.nsIConsoleService);
    this._display_manager = display_manager;

    // set unregistration listener.
    //this.onQuitApplication.enabled = true;
    this.onSessionStopping.enabled = true;
    
    // register object which implements nsIConsoleListener.
    this.register();

    // get histrical console messages and show them.
    this._trackHistricalMessages(this);

    let session = this._broker;
    session.notify("initialized/consolelistener", this);
  },

  "[subscribe('@command/detach')]": 
  function detach() 
  {
    coUtils.Timer.setTimeout(this.unregister, 10, this);
  },
  
  "[subscribe('@event/session-stopping')]": 
  function onSessionStopping() 
  {
    coUtils.Timer.setTimeout(this.unregister, 10, this);
  },

// nsIConsoleListener
  /**
   * @param {nsIConsoleMessage} console_message nsIConsoleMessage beging posted.
   */
  observe: function(console_message)
  {
    try {
      let message = console_message.message;
      if (/tanasinn/i.test(message)) {
        this._display_manager.append(message);
      }
    } catch (e) {
      try {
        this.unregister(this);
        coUtils.Debug.reportError(e);
      } catch (e) {
        // Nothing to do.
        // To guard against stack overflow, 
        // we MUST not emit any console output.
      }
    }
  },

  /** Register isself to console service */
  "[subscribe('command/register-console-listener'), enabled]":
  function register()
  {
    // register listener.
    this._console_service.registerListener(this);
  },

  /** Unregister isself from console service */
  "[subscribe('command/unregister-console-listener'), enabled]":
  function unregister() 
  {
    coUtils.Debug.reportMessage(
      _("Unregister listener from console service."));
    this._console_service.unregisterListener(this);
    coUtils.Debug.reportMessage(
      _("Succeeded to unregister console listener."));
    this.onSessionStopping.enabled = false;
    //this.onQuitApplication.enabled = false;
  },

  /** Get recent console messages from buffer of console services. */
  _getMessageArray: function _getMessageArray()
  {
    // get latest 250 messages.
    let message_array = {};
    this._console_service.getMessageArray(message_array, {});
    return message_array;
  },

  _trackHistricalMessages: function _trackHistricalMessages()
  {
    // in case messages are not found, consoleService returns null.
    let message_array = this._getMessageArray();
    if (null !== message_array) {
      //for (let [index, message] in Iterator(message_array.value.reverse())) {
      //  if (/tanasinn_initialize/.test(message.message)) {
          message_array.value
      //      .slice(0, index + 1)
      //      .reverse()
            .forEach(function(message) this.observe(message), this);
      //    break;
      //  }
      //}
    }
  },
};

/**
 * @class Console
 * @brief Shows formmated console messages.
 */
let Console = new Class().extends(Plugin);
Console.definition = {

  get id()
    "console",

  get info()
    <plugin>
        <name>{_("Console")}</name>
        <description>{
          _("Connects the console service and display formatted messages.")
        }</description>
        <version>0.1</version>
    </plugin>,

  get template()
    let (session = this._broker) 
    let (bottom_panel = this._bottom_panel)
    let (tab_panel = bottom_panel.alloc("console.panel", _("Console")))
    { 
       parentNode: tab_panel,
       tagName: "vbox",
       id: "tanasinn_console_panel",
       className: "tanasinn-console",
       flex: 1,
       style: { 
         margin: "0px",
       },
       childNodes: [
         {  // output box
           tagName: "grid",
           flex: 1,
           style: {
             MozAppearance: "tabpanels",
             overflowY: "auto",
             fontSize: "12px",
             fontWeight: "bold",
           },
           childNodes: {
             tagName: "rows",
             id: "console_output_box",
             className: "error",
           }
         },
         {
           tagName: "vbox",
           align: "center",
           valign: "top",
           childNodes: {
             tagName: "hbox",
             style: {
               overflow: "hidden", 
               margin: "0px", 
               MozBoxPack: "center",
             },
             childNodes: [
               {
                 tagName: "toolbar",
                 style: <>
                   -moz-appearance: none;
                   //-moz-box-pack: center;
                   border-radius: 8px;
                   //border: solid 1px black;
                   //margin: 0px 9px;
                 </>,
                 childNodes: [
                   {
                     tagName: "toolbarbutton",
                     type: "radio",
                     label: mode.label,
                     value: mode.value,
                     group: "mode",
                     style: {
                       cssText: <>
                         background: -moz-linear-gradient(top, #ccc, #777);
                         -moz-appearance: none;
//                         border-radius: 8px;
                         font: menu;
                         text-shadow: 0 1px rgba(255, 255, 255, .4);
                         margin: 0px;
                         //margin-left: -1px;
                         margin-right: -1px;
                         padding: 0px 4px;
                         border-radius: 2px;
                         border: solid 1px black;
                         //heihgt: 22px;
                       </>,
                     },
                     listener: {
                       type: "command",
                       handler: function(event) 
                       { 
                         let id = "#console_output_box";
                         let output_box = tab_panel.querySelector(id);
                         output_box.className = this.value;
                       },
                     },
                     onconstruct: function() {
                       if ("error" == this.value) {
                         coUtils.Timer.setTimeout(
                           function() this.checked = true, 
                           10, this);
                       }
                     },
                   } for each (mode in [
                     { label: _("All"),     value: "error warning message native" },
                     { label: _("Error"),   value: "error" },
                     { label: _("Warning"), value: "warning" },
                     { label: _("Message"), value: "message" },
                     { label: _("native"),  value: "native" },
                   ])
                 ]
               },
               { tagName: "toolbarseparator", },
               {
                 tagName: "toolbarbutton",
                 label: _("Clear"),
                 //id: "Console:clear",
                 style: { 
                   cssText: <>
                     //-moz-box-orient: vertical;
                     //-moz-box-align: center;
                     -moz-appearance: none;
                     background: -moz-linear-gradient(top, #ccc, #777);
                     font: menu;
                     border-radius: 2px;
                     border: solid 1px #444;
                     text-shadow: 0 1px rgba(255, 255, 255, .4);
                     margin: 0px 9px;
                     padding: 0px 7px 0px 4px;
                   </>
                 },
                 listener: {
                   type: "command",
                   context: this,
                   handler: function() session.notify("command/clear-messages"),
                 }
               }
             ]
           }
         },
       ]
     },

  enabled_when_startup: false, // override

  /** constructor */
  "[subscribe('@initialized/{chrome & bottompanel}'), enabled]":
  function onLoad(chrome, bottom_panel) 
  {
    this._bottom_panel = bottom_panel;
    this.enabled = this.enabled_when_startup;
  },

  /** Installs itself */
  install: function install(session) 
  {
    let {
      tanasinn_console_panel, 
      console_output_box,
    } = session.uniget("command/construct-chrome", this.template);
    this._console_box = tanasinn_console_panel;
    this._output_box = console_output_box;
    this.select.enabled = true;
    session.notify("initialized/console", this);
  }, 

  /** Uninstalls itself. */
  uninstall: function uninstall(session) 
  {
    this.select.enabled = false;
    this._bottom_panel.remove("console.panel");
  },

  "[command('console'), key('meta a'), _('Open console.')]":
  function select(info) 
  {
    this._bottom_panel.select("console.panel");
  },

};


/**
 * @fn main
 * @brief Module entry point.
 * @param {Desktop} desktop The Desktop object.
 */
function main(desktop) 
{
//  if (false) // now it is disabled dealing with performance issue.
  desktop.subscribe(
    "@initialized/session", 
    function(session)
    {
      new Console(session);
      new MessageFilter(session);
      new DisplayManager(session);
      new ConsoleListener(session);
    });
}

