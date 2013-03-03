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
 * @class BottomPanel
 *
 * messages:
 *
 */
var BottomPanel = new Class().extends(Plugin)
                             .depends("renderer")
                             .depends("screen");
BottomPanel.definition = {

  id: "bottompanel",

  getInfo: function getInfo()
  {
    return {
      name: _("Bottom Panel"),
      version: "0.1",
      description: _("Show tabbed panes which is able to ",
                     "contain variable plugin components ",
                     "at the bottom area of window.")
    };
  },

  getTemplate: function getTemplate()
  {
    return {
      tagName: "stack",
      parentNode: "#tanasinn_panel_area",
      flex: 1,
      collapsed: true,
      id: "tanasinn_bottompanel",
      childNodes: [
        {
          tagName: "vbox",
          flex: 1,
          style: {
            opacity: "0.7",
          },
        },
        {
          tagName: "vbox",
          childNodes: {
            tagName: "tabbox",
            id: "tanasinn_tabbox",
            width: 0,
            listener: {
              type: "select",
              context: this,
              handler: function handler(event)
              {
                var target = event.target,
                    panel = target.selectedPanel,
                    tab = target.parentNode.selectedTab,
                    nodes = target.parentNode.tabs.childNodes,
                    node,
                    i;

                for (i = 0; i < nodes.length; ++i) {
                  node = nodes[i];
                  node.style.color = "#777";
                  node.style.weight = "normal";
                }

                tab.style.color = "black";
                tab.style.weight = "bold";

                if (panel) {
                  this.sendMessage("panel-selected/" + panel.id, panel);
                }
              },
            },
            style: "-moz-appearance: none; overflow-x: hidden; overflow-y: hidden; border: 0px;",
            childNodes: [
              {
                tagName: "arrowscrollbox",
                id: "tanasinn_arrowscrollbox",
                clicktoscroll: "true",
                orient: "horizontal",
                childNodes: {
                  tagName: "tabs",
                  id: "tanasinn_tabbox_tabs",
                  setfocus: false,
                },
              },
              {
                tagName: "tabpanels",
                id: "tanasinn_tabbox_tabpanels",
                style: {
                  MozAppearance: "none",
                  background: "-moz-linear-gradient(top, #ccc, #777)",
                  border: "0px",
                },
              },
            ]
          }
        },
      ],
    };
  },

  "[persistable] enabled_when_startup": true,

  _panel_map: null,
  _tabbox: null,
  _bottom_panel: null,
  _scrollbox: null,

  _renderer: null,
  _screen: null,

  /** Installs itself.
   *  @param {InstallContext} context A InstallContext object.
   */
  "[install]":
  function install(context)
  {
    var result = this.request("command/construct-chrome", this.getTemplate());

    this._bottom_panel = result.tanasinn_bottompanel;
    this._tabbox = result.tanasinn_tabbox;
    this._scrollbox = result.tanasinn_arrowscrollbox;

    this._renderer = context["renderer"];
    this._screen = context["screen"];
  },

  /** Uninstalls itself
   */
  "[uninstall]":
  function uninstall()
  {
    var bottom_panel = this._bottom_panel;

    if (null !== this._bottom_panel) {
      bottom_panel.parentNode.removeChild(bottom_panel);
      this._bottom_panel = null;
    }
    this._scrollbox = null;
    this._tabbox = null;

    this._renderer = null;
    this._screen = null;
  },

  getElement: function getElement()
  {
    return this._tabbox;
  },

  /** Toggles show/hide state of bottom panel.
   */
  toggle: function toggle()
  {
    if (this._bottom_panel.collapsed) {
      this.open();
    } else {
      this.close();
    }
  },

  /** Shows bottom panel.
   * As openning panel, center-screen's height is shrinked.
   * If bottom panel height was more larger than 1/3 of screen's one,
   * We cut off bottom panel's height.
   *
   *   +---------------+             +---------------+
   *   |               | center      |               |
   *   |               | panel's     | center screen |
   *   | center screen | height is   |               |
   *   |               | shrinked.-> +---------------+     total
   *   |               |             |               |     height
   *   |               |             | bottom panel  |     is not
   *   +---------------+             +---------------+ <-- changed.
   */
  "[command('openpanel'), _('Open bottom panel.'), pnp]":
  function open()
  {
    var bottom_panel = this._bottom_panel,
        renderer = this._renderer,
        screen = this._screen,
        // restricts bottom panel's height.
        line_height = renderer.line_height,
        row = screen.height,
        max_screen_height = Math.floor(line_height * row / 2),
        panels = this._tabbox.tabpanels.childNodes,
        panel,
        diff,
        i;

    this.sendMessage("get/panel-items", this);

    for (i = 0; i < panels.length; ++i) {
      panel = panels[i];
      if (panel.height > max_screen_height) {
        panel.height = max_screen_height;
      }
    }

    // open.
    bottom_panel.setAttribute("collapsed", false);

    // shrink screen's row.
    diff = Math.round(bottom_panel.boxObject.height / line_height);

    if (0 !== diff) {
      this.sendMessage("command/shrink-row", diff);
    }
  },

  /** Hide bottom panel.
   * As closing panel, center-screen's height is expanded as mach as
   * bottom panel's height.
   *
   *   +---------------+             +---------------+
   *   |               |             |               |
   *   | center screen |             |               |
   *   |               |             | center screen |
   *   +---------------+ center      |               |     total
   *   |               | panel's     |               |     height
   *   | bottom panel  | height is   |               |     is not
   *   +---------------+ expanded.-> +---------------+ <-- changed.
   */
  "[command('closepanel'), _('Close bottom panel'), pnp]":
  function close()
  {
    var bottom_panel = this._bottom_panel,
        renderer = this._renderer,
        line_height = renderer.line_height,
        diff = Math.floor(bottom_panel.boxObject.height / line_height);

    bottom_panel.setAttribute("collapsed", true);

    if (0 !== diff) {
      this.sendMessage("command/expand-row", diff);
    }
  },

  /**
   * @property panelHeight
   */
  get panelHeight()
  {
    var sample_panel = this._tabbox.tabpanels.firstChild;

    if (sample_panel) {
      return sample_panel.boxObject.height;
    }

    return 0;
  },

  set panelHeight(value)
  {
    var panel,
        panels = this._tabbox.tabpanels.childNodes,
        i;

    for (i = 0; i < panels.length; ++i) {
      panel = panels[i];
      panel.height = value;
    }
  },

  /** Allocates and returns new panel element.
   * @param {String} id A panel id.
   * @param {String} name.
   */
  alloc: function alloc(id, name)
  {
    var tanasinn_tab,
        tab_panel;

    // check duplicated allocation.
    this._panel_map = this._panel_map || {};
    if (this._panel_map[id]) {
      throw coUtils.Debug.Exception(
        _("Specified id '%s' already exists."), id);
    }

    tanasinn_tab = this.request(
      "command/construct-chrome",
      {
        parentNode: "#tanasinn_tabbox_tabs",
        tagName: "tab",
        id: id,
        label: name,
        style: {
          MozAppearance: "none",
          font: "menu",
          color: "black",
          textShadow: "0 1px rgba(255, 255, 255, .4)",
          background: "-moz-linear-gradient(top, #fff, #ccc)",
          borderTopLeftRadius: "4px",
          borderTopRightRadius: "4px",
          borderBottom: "0px",
          borderLeft: "2px solid #aaa",
          borderRight: "2px solid #ccc",
          marginLeft: "-2px",
          marginRight: "-4px",
        },
      })[id];

    tab_panel = this.request(
      "command/construct-chrome",
      {
        parentNode: "#tanasinn_tabbox_tabpanels",
        tagName: "tabpanel",
        id: id,
        orient: "vertical",
        height: 180,
        style: "-moz-appearance: none; background: transparent;",
      })[id];

    this._panel_map[id] = [tanasinn_tab, tab_panel];

    return tab_panel;
  },

  _selectTab: function _selectTab(tab)
  {
    var box_object;

    this._tabbox.selectedTab = tab;

    box_object = this._scrollbox;

    if (box_object.ensureElementIsVisible) {
      box_object.ensureElementIsVisible(tab);
    }
  },

  /** Select specified panel.
   * @param {String} id A panel id.
   */
  "[subscribe('command/select-panel'), pnp]":
  function select(id)
  {
    var toggle,
        panel_map,
        tab;

    id = id.id || id;

    toggle = true;
    if (id.match(/^\!/)) {
      toggle = false;
      id = id.substr(1);
    }

    this.sendMessage("get/panel-items", this);

    this._panel_map = this._panel_map || {};
    panel_map = this._panel_map;

    if (id in panel_map) { // Check if specified id was registered.
      tab = this._panel_map[id][0];
      // toggle open/close state.
      if (this._bottom_panel.collapsed) {
        // Select specified tab and open the panel.
        this._selectTab(tab);
        this.open();
      } else if (toggle && tab.isEqualNode(this._tabbox.selectedTab)) {
        // If the tab specified by ID was already opend, we close it.
        this.close();
      } else {
        // Select specified tab.
        this._selectTab(tab);
      }
    } else { // Invalid ID was specified.
//      throw coUtils.Debug.Exception(
//        _("Specified tab ID '%s' not found."), id);
    }
  },

  /** Removes specified panel.
   * @param {String} id A panel id.
   * TODO: when it is removed, selected position is tilted.
   */
  "[subscribe('command/remove-panel'), pnp]":
  function remove(id)
  {
    var panel_map,
        tab,
        tab_panel;

    id = id.id || id;
    this._panel_map = this._panel_map || {};

    panel_map = this._panel_map;

    if (panel_map[id]) {
      [tab, tab_panel] = panel_map[id];
      tab.parentNode.removeChild(tab);
      tab_panel.parentNode.removeChild(tab_panel);
      delete panel_map[id];
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


}; // BottomPanel


/**
 * @fn main
 * @brief Module entry point.
 * @param {Broker} broker The Broker object.
 */
function main(broker)
{
  new BottomPanel(broker);
}


// EOF
