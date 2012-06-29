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
var PluginViewer = new Class().extends(Plugin);
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
              let (info = ("info" in module) && module.info) 
              let (depends = this._depends_map[module.id])
              let (depended = this._depended_map[module.id])
              let (depends_on = Object.keys(depends).map(function(key) depends[key], this))
              let (depended_by = Object.keys(depended).map(function(key) depended[key], this))
              [
                {
                  tagName: "checkbox",
                  align: "top",
                  style: "font-size: 1.4em;",
                  onconstruct: function()
                    {
                      this.setAttribute("checked", module.enabled);
                    },
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
                  style: "font-size: 1.4em; font-weight: bold;",
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

  "[persistable] enabled_when_startup": true,

  _viewer: null,

  /** Uninstalls itself.
   *  @param {Broker} broker A Broker object.
   */
  "[uninstall]":
  function uninstall(broker) 
  {
    this.onPanelSelected.enabled = false;
    this.sendMessage("command/remove-panel", this.id);
  },

  "[subscribe('@get/panel-items'), pnp]": 
  function onPanelItemRequested(panel) 
  {
    this._panel = panel.alloc(this.id, _("Plugins"));
    this.onPanelSelected.enabled = true;
  },

  "[subscribe('panel-selected/plugin_viewer')]":
  function onPanelSelected(name) 
  {
    var modules;

    modules = this.sendMessage("get/components");
    this._modules = modules.filter(function(module) module.info)
      .sort(function(lhs, rhs) lhs.info..name > rhs.info..name ? 1: -1);
    this.update();
  },

  "[command('pluginviewer/pv'), nmap('<M-m>', '<C-S-m>'), _('Open module viewer.'), pnp]":
  function select()
  {
    this.sendMessage("command/select-panel", this.id);
    return true;
  },

  update: function update()    
  {
    var depends_on, depends_by;

    depends_on = {};
    depended_by = {};
    this._modules.forEach(function(module) 
    {
      depends_on[module.id] = depends_on[module.id] || {};
      depended_by[module.id] = depended_by[module.id] || {};
      Object.keys(module.dependency)
        .map(function(key) module.dependency[key])
        .filter(function(dependency) ("info" in dependency) && dependency.info)
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
    this.request("command/construct-chrome", this.template);
  },

  /** Fired when checkbox state is changed. */
  _setState: function _setState(plugin, checkbox) 
  {
    var enabled, message;

    enabled = !checkbox.checked;
    try {
      checkbox.setAttribute("checked", enabled);
      plugin.enabled = enabled;
      message = coUtils.Text.format(
        _("Succeeded to %s module %s."), 
        plugin.enabled ? _("install"): _("uninstall"), 
        plugin.info..name);
      this.update();
      this.sendMessage("command/report-status-message", message);
    } catch (e) {
      checkbox.checked = !enabled;
      message = coUtils.Text.format(
        _("Failed to %s module %s."), 
        enabled ? _("install"): _("uninstall"),
        plugin.info..name);
      this.sendMessage("command/report-status-message", message);
      coUtils.Debug.reportError(e);
    }
  },
};

/**
 * @class PluginManager
 */
var PluginManager = new Class().extends(Component);
PluginManager.definition = {

  get id()
    "plugin_manager",

  "[command('disable', ['plugin/enabled']), _('Disable a plugin.'), enabled]":
  function disable(arguments_string)
  {
    return this._impl(arguments_string, /* is_enable */ false);
  },

  "[command('enable', ['plugin/disabled']), _('Enable a plugin.'), enabled]":
  function enable(arguments_string)
  {
    return this._impl(arguments_string, /* is_enable */ true);
  },

  _impl: function _impl(arguments_string, is_enable) 
  {
    var match, modules;

    match = arguments_string.match(/^(\s*)([$_\-@a-zA-Z\.]+)(\s*)$/);
    if (null === match) {
      return {
        success: false,
        message: _("Failed to parse commandline argument."),
      };
    }
    var [, space, name, next] = match;
    modules = this.sendMessage("get/components");
    modules = modules.filter(function(module) module.id == name);
    if (0 == modules.length) {
      return {
        success: false,
        message: _("Cannot enabled the module specified by given argument."),
      };
    }
    modules.forEach(function(module) {
      try {
        module.enabled = is_enable;
      } catch(e) {
        coUtils.Debug.reportError(e); 
      }
    });
    return {
      success: true,
      message: _("Succeeded."),
    };
  },

};


/**
 * @fn main
 * @brief Module entry point.
 * @param {Broker} broker The Broker object.
 */
function main(broker)
{
  new PluginManager(broker);
  new PluginViewer(broker);
}

// EOF
