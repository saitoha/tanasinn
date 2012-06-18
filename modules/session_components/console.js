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
 * @class AlertService
 */
var AlertService = new Class().extends(Plugin);
AlertService.definition = {

  get id()
    "alert_service",

  get info()
    <module>
        <name>{_("Alert Service")}</name>
        <description>{
          _("Provides asyncronous popup alert window.")
        }</description>
        <version>0.1</version>
    </module>,

  /** Installs itself.
   *  @param {Broker} broker A Broker object.
   */
  "[install]":
  function install(broker) 
  {
    this.show.enabled = true;
  },

  /** Uninstalls itself. 
   *  @param {Broker} broker A Broker object.
   */
  "[uninstall]":
  function uninstall(broker) 
  {
    this.show.enabled = false;
  },


  "[subscribe('command/show-popup-alert')]":
  function show(data)
  {
    var self;

    self = this;
    try {
      Components.classes["@mozilla.org/alerts-service;1"]
        .getService(Components.interfaces.nsIAlertsService)
        .showAlertNotification(
          "chrome://mozapps/skin/extensions/alerticon-error.png",
          data.title,
          data.text,
          true,  // textClickable
          data.text,     // cookie
          {
            observe: function observe(subject, topic, data) 
            {
              if ("alertclickcallback" == topic) {
                self.sendMessage("command/select-panel", "!console.panel");
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
  },

}; // AlertSerice

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

  get filter_expression()
    /^\[(.+?): "(tanasinn: )?([^"]*?)" {file: "([^"]*?)" line: ([0-9]+?)( name: "([^"]*?)")?}\]$/m,
  
  "[persistable] enabled_when_startup": true,

  /** Installs itself.
   *  @param {Broker} broker A Broker object.
   */
  "[install]":
  function install(broker) 
  {
    this.sendMessage("event/console-filter-collection-changed");
  },

  /** Uninstalls itself. 
   *  @param {Broker} broker A Broker object.
   */
  "[uninstall]":
  function uninstall(broker) 
  {
    this.sendMessage("event/console-filter-collection-changed");
  },

  "[subscribe('get/message-filters'), pnp]": 
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
    let broker = this._broker;
    let logtext = this.logtext;
    let match = this.match;
    let [, category, , message, file, line] = match;
    let class_string = this._getClassString(category);
    file = file.split("/").pop().split("?").shift();
    if ("tanasinn-console-error" == class_string) {
      let title = category;
      let text = file + ":" + line + " " + message;
      this.sendMessage("command/show-popup-alert", {title: title, text: text});
    }
    return {
      parentNode: "#console_output_box",
      tagName: "row",
      className: "tanasinn-console-line " + class_string,
      style: let (color_map = {
        "JavaScript Error"  : "lightpink",
        "JavaScript Warning": "lightyellow",
        "JavaScript Message": "lightblue",
      }) <>
        background-color: { color_map[category] || "" };
        border-bottom: 1px solid green;
      </>,
      childNodes: [
        { 
          tagName: "label", 
          crop: "start",
          width: 100,
          value: file + " ", 
          style: <>
            color: red;
            width: 4em;
          </>,
        },
        { 
          tagName: "box", 
          innerText: "line: " + line,
          style: "padding: 0px 4px",
        },
        { 
          tagName: "box", 
          innerText: message, 
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

  _filters: null,
  _console: null,

  /** post-constructor */
  "[subscribe('@initialized/console'), enabled]":
  function onLoad(console) 
  {
    this._console = console;
    let session = this._broker;
    this.onConsoleFilterCollectionChanged.enabled = true;
    this.onConsoleFilterCollectionChanged();
    session.notify("initialized/displaymanager", this);
  },

  "[subscribe('event/console-filter-collection-changed')]":
  function onConsoleFilterCollectionChanged() 
  {
    let session = this._broker;
    this._filters = session.notify("get/message-filters");
  },

  /** Appends a message line to output container. 
   *  @param {String} message raw message text from console service.
   */
  append: function append(message) 
  {
    let session = this._broker;
    let template = this.applyFilters(message);
    session.uniget("command/construct-chrome", template);
    // makes scrollbar follow page's height.
    if (this.auto_scroll && this._console) {
      this._console.scrollToBottom();
    }
  },

  /** apply filters and convert a message to ui template.
   * @param {String} message raw message string from console service.
   */
  applyFilters: function applyFilters(message) 
  {
    if (this._filters) {
      for (let [, filter] in Iterator(this._filters)) {
        if (filter.test(message)) {
          return filter.action();
        }
      };
    }
    // returns fallback template.
    return {
      parentNode: "#console_output_box",
      tagName: "row",
      style: <>
        border-bottom: 1px solid green;,
      </>,
      childNodes: [
        { tagName: "box", innerText: "" },
        { tagName: "box", innerText: "" },
        { tagName: "box", innerText: message }
      ]
    };
  },
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

  "[persistable] register_delay": 1000,

  /** post-constructor */
  "[subscribe('@initialized/displaymanager'), enabled]":
  function onLoad(display_manager) 
  {
    this._console_service = Components
      .classes["@mozilla.org/consoleservice;1"]
      .getService(Components.interfaces.nsIConsoleService);
    this._display_manager = display_manager;

    // set unregistration listener.
    //this.onQuitApplication.enabled = true;
    this.onSessionStopping.enabled = true;
    
    coUtils.Timer.setTimeout(function() {
      // register object which implements nsIConsoleListener.
      this.register();

      // get histrical console messages and show them.
      this._trackHistricalMessages(this);
    }, this.register_delay, this);
  },

  "[subscribe('@command/detach')]": 
  function detach() 
  {
    coUtils.Timer.setTimeout(this.unregister, 10, this);
  },
  
  "[subscribe('@event/broker-stopping')]": 
  function onSessionStopping() 
  {
    coUtils.Timer.setTimeout(this.unregister, 10, this);
  },

// nsIConsoleListener
  /**
   * @param {nsIConsoleMessage} console_message nsIConsoleMessage beging posted.
   */
  observe: function observe(console_message)
  {
    try {
      let message = console_message.message;
      if (/tanasinn/i.test(message)) {
        this._display_manager.append(message);
      }
    } catch (e) {
      try {
        this.unregister(this);
        coUtils.Debug.reportWarning(e);
      } catch (e) {
        // Nothing to do.
        // To guard against stack overflow, 
        // we MUST not emit any console output.
      }
    }
  },

  /** Register isself to console service */
  register: function register()
  {
    // register listener.
    this._console_service.registerListener(this);
  },

  /** Unregister isself from console service */
  unregister: function unregister() 
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
    { 
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
      /*
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
//                        border-radius: 8px;
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
      */
      ]
     },

  "[persistable] enabled_when_startup": false,

  /** Installs itself */
  "[install]":
  function install(session) 
  {
    this.select.enabled = true;
    this.onPanelItemRequested.enabled = true;
  }, 

  /** Uninstalls itself. */
  "[uninstall]":
  function uninstall(session) 
  {
    this.select.enabled = false;
    this.onPanelItemRequested.enabled = false;
    session.notify("command/remove-panel", "console.panel");
  },

  "[subscribe('@get/panel-items')]": 
  function onPanelItemRequested(panel) 
  {
    let session = this._broker;
    let template = this.template;
    let panel_item = panel.alloc("console.panel", _("Console"))
    template.parentNode = panel_item;
    let {
      tanasinn_console_panel, 
      console_output_box,
    } = session.uniget("command/construct-chrome", template);
    this._console_box = tanasinn_console_panel;
    this._output_box = console_output_box;
    return panel_item;
  },

  "[command('console'), nmap('<C-S-a>', '<M-a>'), _('Open console.')]":
  function select(info) 
  {
    let session = this._broker;
    session.notify("command/select-panel", "console.panel");
    return true;
  },
  
  /** Clears all message lines from output container. 
   */
  "[subscribe('command/clear-messages')]":
  function clear() 
  {
    while (this._console_box.firstChild) {
      this._console_box.removeChild(this._console_box.firstChild);
    }
  },

  /** tracks growing scroll region. */
  scrollToBottom: function scrollToBottom() 
  {
    let output_element = this._output_box;
    if (this._output_box) {
      let frame_element = output_element.parentNode;
      if (frame_element && frame_element.scrollHeight && frame_element.boxObject) {
        let current_scroll_position 
          = frame_element.scrollTop + frame_element.boxObject.height;
        if (current_scroll_position + 50 > frame_element.scrollHeight) {
          //coUtils.Timer.setTimeout(function() {
            frame_element.scrollTop = frame_element.scrollHeight;
          //}, 10);
        }
      }
    }
  }

};

/**
 * @fn main
 * @brief Module entry point.
 * @param {Broker} broker The Broker object.
 */
function main(broker) 
{
  new Console(broker);
  new AlertService(broker);
  new MessageFilter(broker);
  new DisplayManager(broker);
  new ConsoleListener(broker);
}

