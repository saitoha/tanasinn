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
 * @class PluginViewer
 */
let PluginViewer = new Class().extends(Plugin);
PluginViewer.definition = {

  get id()
    "plugin_viewer",

  get info()
    <plugin>
        <name>{_("Component")}</name>
        <description>{
          _("List informatioin of plugins and makes it enable to ",
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
      </>,
      childNodes: {
        tagName: "rows",
        childNodes: [
          {
            tagName: "row",
            childNodes: 
              let (module = module) // memorize "module".
              let (info = module.info) 
              let (depends = this._depends_map[module.id])
              let (depends_on = Object.keys(depends).map(function(key) depends[key], this))
              let (depended_by = Object.keys(depends).map(function(key) depends[key], this))
              [
                {
                  tagName: "checkbox",
                  align: "top",
                  style: <>
                    font-size: 1.4em;
                  </>,
                  onconstruct: function()
                    this.setAttribute("checked", module.enabled),
                  disabled: module.enabled ? 
                    depended_by.some(function(module) module.enabled):
                    depends_on.some(function(module) !module.enabled),
                  listener: {
                    type: "command",
                    handler: let (self = this) 
                      function(event) self._setState(module, this)
                  }
                },
                { 
                  tagName: "label", 
                  //className: "text-link",
                  style: <>
                    font-size: 1.4em;
                    font-weight: bold;
                  </>,
                  value: info..name.toString(),
                },
                { 
                  tagName: "label", 
                  style: <>
                    font-size: 1.4em;
                    font-weight: bold;
                  </>,
                  value: info..version.toString() 
                },
                { 
                  tagName: "vbox", 
                  childNodes: [
                    {
                      tagName: "label",
                      value: info..description.toString(),
                    },
                    {
                      tagName: "label",
                      value: _("depends on: ") + depends_on.map(function(module) module.info..name, this).join("/"),
                    },
                    {
                      tagName: "label",
                      value: _("depended by: ") + depended_by.map(function(module) module.info..name, this).join("/"),
                    },
                  ]
                },
              ],
          } for each (module in this._modules)
        ]
      }
    }),

  _viewer: null,

  /** Installs itself.
   *  @param {Session} session A session object.
   */
  "[subscribe('install/plugin_viewer'), enabled]":
  function install(session) 
  {
    this.select.enabled = true;
    this.onPanelItemRequested.enabled = true;
  },

  /** Uninstalls itself.
   *  @param {Session} session A session object.
   */
  "[subscribe('uninstall/plugin_viewer'), enabled]":
  function uninstall(session) 
  {
    this.onPanelSelected.enabled = false;
    this.select.enabled = false;
    session.notify("command/remove-panel", this.id);
  },

  "[subscribe('@get/panel-items')]": 
  function onPanelItemRequested(panel) 
  {
    this._panel = panel.alloc(this.id, _("Plugins"));
    this.onPanelSelected.enabled = true;
  },

  "[subscribe('panel-selected/plugin_viewer')]":
  function onPanelSelected(name) 
  {
    let session = this._broker;
    let modules = session.notify("get/components");
    this._modules = modules.filter(function(module) module.info)
      .sort(function(lhs, rhs) lhs.info..name > rhs.info..name ? 1: -1);
    this.update();
  },

  "[command('pluginviewer/pv'), nmap('<M-m>', '<C-S-m>'), _('Open module viewer.')]":
  function select()
  {
    let session = this._broker;
    session.notify("command/select-panel", this.id);
    return true;
  },

  update: function update()    
  {
    let depends_on = {};
    let depended_by = {};
    this._modules.forEach(function(module) 
    {
      depends_on[module.id] = depends_on[module.id] || {};
      depended_by[module.id] = depended_by[module.id] || {};
      Object.keys(module.dependency)
        .map(function(key) module.dependency[key])
        .filter(function(dependency) dependency.info)
        .forEach(function(dependency) 
        {
          depends_on[module.id][dependency.id] = dependency;
          depended_by[dependency.id] = depended_by[dependency.id] || {};
          depended_by[dependency.id][module.id] = module;
        });
    }, this);
    this._depends_map = depends_on;
    this._depended_map = depended_by;
    if (this._panel.firstChild) {
      this._panel.removeChild(this._panel.firstChild);
    }
    let session = this._broker;
    session.uniget("command/construct-chrome", this.template);
  },

  /** Fired when checkbox state is changed. */
  _setState: function _setState(plugin, checkbox) 
  {
    let enabled = !checkbox.checked;
    try {
      checkbox.setAttribute("checked", enabled);
      plugin.enabled = enabled;
      let message = coUtils.Text.format(
        _("Succeeded to %s module %s."), 
        plugin.enabled ? _("install"): _("uninstall"), 
        plugin.info..name);
      this.update();
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
 * @param {Broker} broker The Broker object.
 */
function main(broker)
{
  new PluginViewer(broker);
}

