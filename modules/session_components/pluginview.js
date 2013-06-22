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
 * Portions created by the Initial Developer are Copyright (C) 2010 - 2013
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

  /** plugin information */
  getInfo: function getInfo()
  {
    return {
      name: _("Component"),
      version: "0.1",
      description: _("List information of plugins and makes it enable to ",
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
          handler: function oncommand(event)
          {
            self._setState(module, this);
          }
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

  /** called when panel items are requested */
  "[subscribe('@get/panel-items'), pnp]":
  function onPanelItemRequested(panel)
  {
    this._panel = panel.alloc(this.id, _("Plugins"));
    this.onPanelSelected.enabled = true;
  },

  /** called when "plugin" tab is selected */
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

  /** show plugin view */
  "[command('pluginviewer/pv'), nmap('<M-m>', '<C-S-m>'), _('Open module viewer.'), pnp]":
  function select()
  {
    this.sendMessage("command/select-panel", this.id);
    return true;
  },

  /** update all */
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

  /** update the view */
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

  /** test */
  "[test]":
  function()
  {
    var enabled = this.enabled;

    try {
      this.enabled = false;
      this.enabled = true;
      this.enabled = false;
    } finally {
      this.enabled = enabled;
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

// EOF
