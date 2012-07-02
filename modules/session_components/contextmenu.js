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
 * @class Contextmenu
 */
var Contextmenu = new Class().extends(Plugin);
Contextmenu.definition = {

  get id()
    "contextmenu",

  get info()
    <plugin>
        <name>{_("Context Menu")}</name>
        <description>{
          _("Provides context menu interface which ",
            "emerges when we right-clicks the screen.")
        }</description>
        <version>0.1</version>
    </plugin>,

  get template() 
    ({
      tagName: "menupopup",
      parentNode: "#tanasinn_center_area",
      id: "tanasinn_contextmenu",
      childNodes: this._entries,
      listener: {
        type: "popuphidden", 
        context: this,
        handler: function onpopuphidden(event) 
        {
          var target = event.explicitOriginalTarget;

          if ("tanasinn_contextmenu" === target.id) {
            this.sendMessage("command/focus");
            target.parentNode.removeChild(target);
          }
        },
      } ,
    }),

  "[persistable] enabled_when_startup": true,

  "[persistable, watchable] handle_right_click_insted_of_oncontextmenu": true,

  _entries: null,

  /** Installs itself.
   *  @param {Broker} broker A Broker object.
   */
  "[install]": 
  function install(broker) 
  {
    // register DOM listener.
    this.onFlagChanged(this.handle_right_click_insted_of_oncontextmenu);
  },

  /** Uninstalls itself.
   *  @param {Broker} broker A Broker object.
   */
  "[uninstall]":
  function uninstall(broker) 
  {
    // unregister DOM listener.
    this.onrightbuttondown.enabled = false;
  },

  "[subscribe('variable-changed/contextmenu.handle_right_click_insted_of_oncontextmenu'), pnp]":
  function onFlagChanged(value) 
  {
    this.onrightbuttondown.enabled = value;
  },

  "[listen('click', '#tanasinn_content')]":
  function onrightbuttondown(event) 
  {
    if (2 === event.button) {
      this.show(event);
    }
  },

  "[listen('contextmenu', '#tanasinn_content'), pnp]":
  function oncontextmenu(event) 
  {
    event.stopPropagation();
    event.preventDefault();
    if (!this.handle_right_click_insted_of_oncontextmenu) {
      this.show(event);
    }
  },

  show: function show(event) 
  {
    var entries;

    entries = this.sendMessage("get/contextmenu-entries")
      .filter(function(entry) entry);

    if (0 === entries.length) {
      return;
    }

    this._entries = entries;
    var {tanasinn_contextmenu} 
      = this.request("command/construct-chrome", this.template);
    tanasinn_contextmenu.openPopupAtScreen(event.screenX, event.screenY, true);
  },
};

/**
 * @fn main
 * @brief Module entry point.
 * @param {Broker} broker The Broker object.
 */
function main(broker) 
{
  new Contextmenu(broker);
}


// EOF
