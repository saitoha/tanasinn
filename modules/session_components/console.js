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

"use strict";


/**
 * @class Console
 * @brief Shows formmated console messages.
 */
var Console = new Class().extends(Plugin);
Console.definition = {

  id: "console",

  getInfo: function getInfo()
  {
    return {
      name: _("Console"),
      version: "0.1",
      description: _("Connects the console service and display formatted messages.")
    };
  },

  getTemplate: function getTemplate()
  {
    return {
      tagName: "vbox",
      id: "tanasinn_console_panel",
      className: "tanasinn-console",
      flex: 1,
      style: {
        margin: "0px",
      },
      childNodes: [
        {  // output box
          tagName: "vbox",
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
                style: {
                  MozAppearance: "none",
                  borderRadius: "8px",
                },
                childNodes: [
                  {
                    tagName: "toolbarbutton",
                    type: "radio",
                    label: mode.label,
                    value: mode.value,
                    group: "mode",
                    style: {
                      background: "-moz-linear-gradient(top, #ccc, #777)",
                      MozAppearance: "none",
                      font: "menu",
                      textShadow: "0 1px rgba(255, 255, 255, .4)",
                      margin: "0px",
                      marginRight: "-1px",
                      padding: "0px 4px",
                      borderRadius: "2px",
                      border: "solid 1px black",
                    },
                    listener: {
                      type: "command",
                      handler: function(event)
                      {
                        var id = "#console_output_box";
                        var output_box = tab_panel.querySelector(id);
                        output_box.className = this.value;
                      },
                    },
                    onconstruct: function() {
                      if ("error" === this.value) {
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
                  MozAppearance: "none",
                  background: "-moz-linear-gradient(top, #ccc, #777)",
                  font: "menu",
                  borderRadius: "2px",
                  border: "solid 1px #444",
                  textShadow: "0 1px rgba(255, 255, 255, .4)",
                  margin: "0px 9px",
                  padding: "0px 7px 0px 4px",
                },
                listener: {
                  type: "command",
                  context: this,
                  handler: function() this.sendMessage("command/clear-messages"),
                }
              }
            ]
          }
        },
      */
      ]
     };
  },

  "[persistable] enabled_when_startup": false,

  /** Installs itself.
   *  @param {InstallContext} context A InstallContext object.
   */
  "[install]":
  function install(context)
  {
  },

  /** Uninstalls itself.
   */
  "[uninstall]":
  function uninstall()
  {
    this.sendMessage("command/remove-panel", "console.panel");
  },

  "[subscribe('@get/panel-items'), pnp]":
  function onPanelItemRequested(panel)
  {
    var template = this.getTemplate(),
        panel_item = panel.alloc("console.panel", _("Console")),
        result;

    template.parentNode = panel_item;

    result = this.request("command/construct-chrome", template);

    this._console_box = result.tanasinn_console_panel;
    this._output_box = result.console_output_box;
    return panel_item;
  },

  "[command('console'), nmap('<C-S-a>', '<M-a>'), _('Open console.'), pnp]":
  function select(info)
  {
    this.sendMessage("command/select-panel", "console.panel");
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
    var output_element = this._output_box,
        frame_element,
        current_scroll_position;

    if (this._output_box) {
      frame_element = output_element.parentNode;

      if (frame_element && frame_element.scrollHeight && frame_element.boxObject) {
        current_scroll_position
          = frame_element.scrollTop + frame_element.boxObject.height;
        if (current_scroll_position + 50 > frame_element.scrollHeight) {
          //coUtils.Timer.setTimeout(function() {
            frame_element.scrollTop = frame_element.scrollHeight;
          //}, 10);
        }
      }
    }
  },

};

/**
 * @fn main
 * @brief Module entry point.
 * @param {Broker} broker The Broker object.
 */
function main(broker)
{
  new Console(broker);
}

// EOF
