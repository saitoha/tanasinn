/**
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
 * Portions created by the Initial Developer are Copyright (C) 2010 - 2012
 * the Initial Developer. All Rights Reserved.
 *
 * ***** END LICENSE BLOCK ***** */

"use strict";

/**
 * @class OpenTanasinn
 * @fn Context menu integration.
 */
var OpenTanasinn = new Class().extends(Plugin);
OpenTanasinn.definition = {

  id: "open-tanasinn",

  "[persistable] enabled_when_startup": true,

  _menupopup: null,

  /** Installs itself.
   * @param {InstallContext} context A InstallContext object.
   */
  "[install]":
  function install(context)
  {
    var broker = this._broker,
        id = "resume-tanasinn",
        contextmenu,
        menupopup;

    broker.window._tanasinn_resume = this;

    if (!broker.window.document.getElementById(id)) {
      contextmenu = broker.window.document.getElementById("contentAreaContextMenu");
      if (!contextmenu) {
        contextmenu = broker.window.document.getElementById("mailContext");
        if (!contextmenu) {
          contextmenu = broker.window.document.getElementById("menu_ToolsPopup");
          if (!contextmenu) {
            contextmenu = broker.window.document.getElementById("messagePaneContext");
            if (!contextmenu) {
              contextmenu = broker.window.document.getElementById("messageComposeContext");
            }
          }
        }
      }
      menupopup = this.request(
        "command/construct-chrome",
        {
          parentNode: contextmenu,
          tagName: "menu",
          id: id,
          label: _("tanasinn"),
          childNodes: {
            tagName: "menupopup",
            id: "tanasinn_menupopup",
          },
        }).tanasinn_menupopup;

      this._menupopup = menupopup;
    }
  },

  /** Uninstalls itself.
   */
  "[uninstall]":
  function uninstall()
  {
    var menupopup = this._menupopup;

    if (menupopup) {
      if (menupopup.parentNode) {
        menupopup.parentNode.parentNode.removeChild(menupopup.parentNode);
      }
    }
    this._menupopup = null;
    this._broker._tanasinn_resume = null;
  },

  addNew: function addNew()
  {
    this.sendMessage("command/start-session");
  },

  showLauncher: function showLauncher()
  {
    this.sendMessage("command/show-launcher");
  },

  resumeSession: function resumeSession(id)
  {
    this.sendMessage("command/start-session", "&" + id);
  },

  "[listen('popupshowing', '#tanasinn_menupopup'), pnp]":
  function onPopupShowing()
  {
    var completer = this.request("get/completer/sessions");

    completer.startSearch("", this);
  },

  doCompletion: function doCompletion(result)
  {
    var i,
        image_url,
        id;

    while (this._menupopup.childNodes.length > 0) {
      this._menupopup.removeChild(this._menupopup.lastChild);
    }
    this.request(
      "command/construct-chrome",
      [
        {
          parentNode: this._menupopup,
          tagName: "menuitem",
          label: _("Add new session"),
          oncommand: "_tanasinn_resume.addNew()",
        },
        {
          parentNode: this._menupopup,
          tagName: "menuitem",
          label: _("Run command"),
          oncommand: "_tanasinn_resume.showLauncher()",
        },
        {
          parentNode: this._menupopup,
          tagName: "menuseparator",
        },
      ]);

    if (!result) {
      return;
    }

    for (i = 0; i < result.labels.length; ++i) {

      image_url = result.data[i].image;

      if (image_url) {

        id = result.comments[i].request_id;

        // prevent code injection
        if (!/^\{[0-9a-f\-]+\}$/.test(id)) {
          continue;
        }

        this.request(
          "command/construct-chrome",
          {
            parentNode: this._menupopup,
            tagName: "menuitem",
            flex: 1,
            oncommand: "_tanasinn_resume.resumeSession('" + id + "')",
            childNodes: [
              {
                tagName: "vbox",
                style: {
                  fontSize: "1.2em",
                  margin: "0px",
                  overflow: "hidden",
                  paddingLeft: "8px",
                },
                childNodes: {
                  tagName: "image",
                  width: 120,
                  height: 80,
                  style: {
                    border: "1px solid #66f",
                    margin: "9px",
                  },
                  src: image_url || "",
                },
              },
              {
                tagName: "vbox",
                width: 200,
                style: {
                  fontSize: "1.2em",
                  width: "50%",
                  margin: "0px",
                  overflow: "hidden",
                  paddingLeft: "8px",
                },
                childNodes: [
                  {
                    tagName: "label",
                    value: result.comments[i].command,
                  },
                  {
                    tagName: "label",
                    value: "$$" + result.comments[i].pid,
                  },
                ],
              },
            ],
          });
      }
    } // for i
  },

}; // OpenTanasinn

/**
 * @fn main
 * @brief Module entry point
 * @param {Desktop} desktop The Desktop object.
 */
function main(desktop)
{
  new OpenTanasinn(desktop);
}


// EOF
