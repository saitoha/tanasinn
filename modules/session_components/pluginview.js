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
 * @class PluginViewer
 */
var PluginViewer = new Class().extends(Plugin);
PluginViewer.definition = {

  id: "plugin_viewer",

  getInfo: function getInfo()
  {
    return {
      name: _("Component"),
      version: "0.1",
      description: _("List informatioin of plugins and makes it enable to ",
                     "install or uninstall plugins dynamically.")
    };
  },

  getTemplate: function getTemplate()
  {
    return {
      parentNode: this._panel,
      tagName: "grid", flex: 1,
      style: "overflow-y: auto;",
      childNodes: {
        tagName: "rows",
        childNodes: [
          {
            tagName: "row",
            childNodes: this._getRowTemplateFromModule(module),
          } for ([, module] in Iterator(this._modules))
        ]
      }
    }
  },

  _getRowTemplateFromModule: function _getRowTemplateFromModule(module)
  {
    var info = module.getInfo(),
        depends = this._depends_map[module.id],
        depended = this._depended_map[module.id],
        depends_on = Object
          .keys(depends)
          .map(
            function(key)
            {
              return depends[key];
            }),
        depended_by = Object
          .keys(depended)
          .map(
            function(key)
            {
              return depended[key];
            }),
        self = this;

    return [
      {
        tagName: "checkbox",
        align: "top",
        style: "font-size: 1.4em;",

        onconstruct: function()
          {
            this.setAttribute("checked", module.getEnabled());
            self._broker.subscribe("event/dependencies-updated",
              function()
              {
                var depends,
                    depended,
                    depends_on,
                    depended_by,
                    disabled;

                this.setAttribute("checked", module.getEnabled());

                depends = self._depends_map[module.id];
                depended = self._depended_map[module.id];
                depends_on = Object.keys(depends).map(function(key) depends[key]);
                depended_by = Object.keys(depended).map(function(key) depended[key]);

                disabled = module.getEnabled() ?
                  depended_by.some(function(module) { return module.getEnabled(); }):
                  depends_on.some(function(module) { return !module.getEnabled(); });

                this.setAttribute("disabled", disabled);
              }, this, this.id);
          },
        disabled: module.getEnabled() ?
          depended_by.some(function(module) { return module.getEnabled(); }):
          depends_on.some(function(module) { return !module.getEnabled(); }),

        listener: {
          type: "command",
          handler: function(event) self._setState(module, this)
        }
      },
      {
        tagName: "label",
        //className: "text-link",
        style: "font-size: 1.4em; font-weight: bold;",
        value: info.name
      },
      {
        tagName: "label",
        style: "font-size: 1.4em; font-weight: bold;",
        value: info.version
      },
      {
        tagName: "vbox",
        childNodes: [
          {
            tagName: "label",
            value: info.description
          },
          {
            tagName: "label",
            value: _("depends on: ")
              + depends_on.map(
                function(module)
                {
                  return module.getInfo().name;
                }, this).join("/"),
          },
          {
            tagName: "label",
            value: _("depended by: ")
              + depended_by.map(
                function(module)
                {
                  return module.getInfo().name;
                }, this).join("/"),
          },
        ]
      },
    ];
  },

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
    var modules = this.sendMessage("get/components");

    this._modules = modules.filter(
      function(module)
      {
        return module.getInfo;
      }).sort(
        function(lhs, rhs)
        {
          return lhs.getInfo().name > rhs.getInfo().name ? 1: -1;
        });
    this.firstUpdate();
  },

  "[command('pluginviewer/pv'), nmap('<M-m>', '<C-S-m>'), _('Open module viewer.'), pnp]":
  function select()
  {
    this.sendMessage("command/select-panel", this.id);
    return true;
  },

  firstUpdate: function firstUpdate()
  {
    var depends_on = {},
        depended_by = {};

    this._modules.forEach(function(module)
    {
      depends_on[module.id] = depends_on[module.id] || {};
      depended_by[module.id] = depended_by[module.id] || {};
      Object.keys(module.dependency)
        .map(
          function(key)
          {
            return module.dependency[key];
          }).filter(
            function(dependency)
            {
              return ("info" in dependency) && dependency.getInfo;
            }).forEach(
              function(dependency)
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
    this.request("command/construct-chrome", this.getTemplate());
  },

  update: function update()
  {
    var depends_on = {},
        depended_by = {};

    this._modules.forEach(function(module)
    {
      depends_on[module.id] = depends_on[module.id] || {};
      depended_by[module.id] = depended_by[module.id] || {};
      Object.keys(module.dependency)
        .map(
          function(key)
          {
            return module.dependency[key];
          }).filter(
            function(dependency)
            {
              return ("info" in dependency) && dependency.getInfo;
            }).forEach(
              function(dependency)
              {
                depends_on[module.id][dependency.id] = dependency;
                depended_by[dependency.id] = depended_by[dependency.id] || {};
                depended_by[dependency.id][module.id] = module;
              });
    }, this);
    this._depends_map = depends_on;
    this._depended_map = depended_by;
  },

  /** Fired when checkbox state is changed. */
  _setState: function _setState(plugin, checkbox)
  {
    var enabled = !checkbox.checked,
        message;

    try {
      checkbox.setAttribute("checked", enabled);
      plugin.enabled = enabled;
      message = coUtils.Text.format(
        _("Succeeded to %s module %s."),
        plugin.enabled ? _("install"): _("uninstall"),
        plugin.getInfo().name);
      this.update();

      this.sendMessage("event/dependencies-updated");
      this.sendMessage("command/report-status-message", message);
      this.sendMessage("command/calculate-layout");
    } catch (e) {
      checkbox.checked = !enabled;
      message = coUtils.Text.format(
        _("Failed to %s module %s."),
        enabled ? _("install"): _("uninstall"),
        plugin.getInfo().name);
      this.sendMessage("command/report-status-message", message);
      coUtils.Debug.reportError(e);
    }
  },
};

/**
 * @class PluginManagementCommands
 */
var PluginManagementCommands = new Class().extends(Plugin);
PluginManagementCommands.definition = {

  id: "plugin_management_commands",

  getInfo: function getInfo()
  {
    return {
      name: _("Plugin Management Commands"),
      description: _("Provides enable/disable commands."),
      version: "0.1",
    };
  },

  "[persistable] enabled_when_startup": true,

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
  },

  "[command('disable', ['plugin/enabled']), _('Disable a plugin.'), pnp]":
  function disable(arguments_string)
  {
    return this._impl(arguments_string, /* is_enable */ false);
  },

  "[command('enable', ['plugin/disabled']), _('Enable a plugin.'), pnp]":
  function enable(arguments_string)
  {
    return this._impl(arguments_string, /* is_enable */ true);
  },

  _impl: function _impl(arguments_string, is_enable)
  {
    var match = arguments_string.match(/^(\s*)([$_\-@0-9a-zA-Z\.]+)(\s*)$/),
        modules,
        space,
        name,
        next;

    if (null === match) {
      return {
        success: false,
        message: _("Failed to parse commandline argument."),
      };
    }

    space = match[1];
    name = match[2];
    next = match[3];

    modules = this.sendMessage("get/components");
    modules = modules.filter(
      function(module)
      {
        return module.id === name;
      });
    if (0 === modules.length) {
      return {
        success: false,
        message: _("Cannot enabled the module specified by given argument."),
      };
    }

    modules.forEach(
      function each(module)
      {
        try {
          module.enabled = is_enable;
        } catch(e) {
          coUtils.Debug.reportError(e);
        }
      });

    this.sendMessage("command/calculate-layout");

    return {
      success: true,
      message: _("Succeeded."),
    };
  },

}; // PluginViewer


/**
 * @fn main
 * @brief Module entry point.
 * @param {Broker} broker The Broker object.
 */
function main(broker)
{
  new PluginManagementCommands(broker);
  new PluginViewer(broker);
}

// EOF
