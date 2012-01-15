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
 * @class ComponentViewer
 */
let ComponentViewer = new Class().extends(Plugin);
ComponentViewer.definition = {

  get id()
    "module_viewer",

  get info()
    <plugin>
        <name>{_("Component")}</name>
        <description>{
          _("List informatioin of modules and makes it enable to ",
            "install or uninstall plugins dynamically.")
        }</description>
        <version>0.1</version>
    </plugin>,

  get template()
    ({
      parentNode: this._panel,
      tagName: "grid", flex: 1,
      style: <> 
        overflow-y: auto;
//        background: transient;//-moz-linear-gradient(top, #ccc, #aaa);
//        border: solid 3px orange;
      </>,
      childNodes: {
        tagName: "rows",
        childNodes: [
          {
            tagName: "row",
            childNodes: 
              let (module = module) // memorize "module".
              let (info = module.info) 
              [
                {
                  tagName: "checkbox",
                  className: "tanasinn-moduleviewer-checkbox",
                  onconstruct: function()
                    this.setAttribute("checked", module.enabled),
                  listener: {
                    type: "command",
                    handler: let (self = this) 
                      function(event) self._setState(module, this)
                  }
                },
                { tagName: "label", style: { fontWeight: "bold" }, value: info..name.toString() },
                { tagName: "label", value: info..version.toString() },
                { tagName: "label", value: info..description.toString() },
              ],
          } for each (module in this._modules)
        ]
      }
    }),

  _bottom_panel: null,
  _viewer: null,

  "[subscribe('initialized/bottompanel'), enabled]": 
  function onLoad(bottom_panel) 
  {
    this._bottom_panel = bottom_panel;
    this.enabled = this.enabled_when_startup;
  },

  /** Installs itself.
   *  @param {Session} session A session object.
   */
  "[subscribe('install/ + this.id')]":
  function install(session) 
  {
    let bottom_panel = this._bottom_panel;
    this._panel = bottom_panel.alloc(this.id, _("Component"));
    this.onPanelSelected.enabled = true;
    this.select.enabled = true;
  },

  /** Uninstalls itself.
   *  @param {Session} session A session object.
   */
  "[subscribe('uninstall/ + this.id')]":
  function uninstall(session) 
  {
    this.onPanelSelected.enabled = false;
    this.select.enabled = false;
    this._bottom_panel.remove(this.id);
  },

  "[subscribe('panel-selected/' + this.id)]":
  function onPanelSelected(name) 
  {
    let session = this._broker;
    let modules = session.notify("get/module-instances");
    this._modules = modules.filter(function(module) module.info)
      .sort(function(lhs, rhs) lhs.info..name > rhs.info..name ? 1: -1);
    this.update();
  },

  "[command('moduleviewer/mv'), key('meta m'), _('Open module viewer.')]":
  function select()
  {
    this._bottom_panel.select(this.id);
  },

  update: function update()    
  {
    if (this._panel.firstChild) {
      this._panel.removeChild(this._panel.firstChild);
    }
    let session = this._broker;
    session.uniget("command/construct-chrome", this.template);
  },

  /** Fired when checkbox state is changed. */
  _setState: function _setState(plugin, checkbox) 
  {
    let enabled = checkbox.checked;
    try {
      plugin.enabled = enabled;
      let message = coUtils.Text.format(
        _("Succeeded to %s module %s."), 
        plugin.enabled ? _("install"): _("uninstall"), 
        plugin.info..name);
      let session = this._broker;
      session.notify("command/report-status-message", message);
    } catch (e) {
      checkbox.checked = !enabled;
      let message = coUtils.Text.format(
        _("Failed to %s module %s."), 
        enabled ? _("install"): _("uninstall"),
        plugin.info..name);
      let session = this._broker;
      session.notify("command/report-status-message", message);
      coUtils.Debug.reportError(e);
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
  desktop.subscribe(
    "@initialized/broker", 
    function(session) new ComponentViewer(session));
}

