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
 * @class BottomPanel
 *
 * messages:
 *
 */
let BottomPanel = new Class().extends(Plugin);
BottomPanel.definition = {

  get id()
    "bottompanel",

  get info()
    <plugin>
        <name>{_("Bottom Panel")}</name>
        <description>{
          _("Show tabbed panes which is able to contain variable plugin components ",
            "at the bottom area of window.")
        }</description>
        <version>0.1</version>
    </plugin>,

  get template()
    let (session = this._broker)
    {
      tagName: "stack",
      parentNode: "#tanasinn_chrome",
      collapsed: true,
      id: "tanasinn_bottompanel",
      style: <> 
//        background: -moz-linear-gradient(top, #999, #666);
//        border: solid 3px red;
      </>,
      childNodes: [
        {
          tagName: "vbox",
          flex: 1,
          style: <>
//            background: black;
            opacity: 0.7;
            </>,
        },
        {
          tagName: "vbox",
          childNodes: {
            tagName: "tabbox",
            id: "tanasinn_tabbox",
            width: 0,
            listener: {
              type: "select",
              handler: let (self = this) function(event) 
              {
                let panel = event.target.selectedPanel;
                let tab = this.selectedTab;
                for (let [, tab] in Iterator(this.tabs.childNodes)) {
                  tab.style.color = "#777";
                  tab.style.weight = "normal";
                }
                tab.style.color = "black";
                tab.style.weight = "bold";
                if (panel) {
//                  session.notify("command/report-overlay-message", panel.id);
                  session.notify(<>panel-selected/{panel.id}</>, panel);
                }
              },
            },
            style: <>
              //MozAppearance: "statusbar",
              //margin: "0px",
              //padding: "0px",
              -moz-appearance: none;
//              border: solid 3px green;
              overflow-x: hidden;
              overflow-y: hidden;
              border: 0px;
              outer: 0px;
              //background: -moz-linear-gradient(top, #999, #666);
            </>,
            childNodes: [
              { 
                tagName: "arrowscrollbox",
                id: "tanasinn_arrowscrollbox",
                clicktoscroll: "true",
                orient: "horizontal",
                childNodes: {
                  tagName: "tabs", 
                  id: "tanasinn_tabbox_tabs",
                  style: <>
//                    background: -moz-linear-gradient(top, #999, #666);
//                    border-top-right-radius: 4px;
                    //border: solid 3px yellow;
                  </>,
                  setfocus: false, 
                },
              },
              { 
                tagName: "tabpanels", 
                id: "tanasinn_tabbox_tabpanels",
                style: <>
                  -moz-appearance: none;
//                  border: solid 3px orange;
                  background: -moz-linear-gradient(top, #ccc, #777);
//                  outer: 0px;
                  border: 0px;
//                  background: transparent;
                </>,
              },
            ]
          }
        },
      ],
    },

  _panel_map: null,
  _tabbox: null,
  _bottom_panel: null,
  _scrollbox: null,

  /** post-constructor */
  "[subscribe('@initialized/{renderer & screen}'), enabled]":
  function onLoad(renderer, screen) 
  {
    this._renderer = renderer;
    this._screen = screen;
    this._panel_map = {};
    this.enabled = this.enabled_when_startup;
  },

  /** Installs itself 
   *  @param {Session} session A session object.
   */
  install: function install(session) 
  {
    let {
      tanasinn_bottompanel, 
      tanasinn_tabbox, 
      tanasinn_arrowscrollbox,
    } = session.uniget("command/construct-chrome", this.template);
    this._bottom_panel = tanasinn_bottompanel;
    this._tabbox = tanasinn_tabbox;
    this._scrollbox = tanasinn_arrowscrollbox;
    this.add.enabled = true;
    this.select.enabled = true;
    this.remove.enabled = true;
    this.open.enabled = true;
    this.close.enabled = true;
    session.notify(<>initialized/{this.id}</>, this);
  },

  /** Uninstalls itself 
   *  @param {Session} session A session object.
   */
  uninstall: function uninstall(session) 
  {
    this.add.enabled = false;
    this.select.enabled = false;
    this.remove.enabled = false;
    this.open.enabled = false;
    this.close.enabled = false;
    let target = this._bottom_panel;
    target.parentNode.removeChild(target);
  },

  getElement: function getElement() 
  {
    return this._tabbox;
  },

  /** Toggles show/hide state of bottom panel.
   */
  toggle: function toggle() 
  {
    if (true == this._bottom_panel.collapsed) {
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
  "[command('openpanel')]":
  function open() 
  {
    let bottomPanel = this._bottom_panel;
    let renderer = this._renderer;
    let screen = this._screen;

    // restricts bottom panel's height.
    let line_height = renderer.line_height;
    let row = screen.height;
    let max_screen_height = Math.floor(line_height * row / 2);
    for ([, panel] in Iterator(this._tabbox.tabpanels.childNodes)) {
      if (panel.height > max_screen_height); 
        panel.height = max_screen_height;
    }
    bottomPanel.setAttribute("collapsed", false);
    let diff = Math.round(bottomPanel.boxObject.height / line_height);
    if (0 != diff) {
      let session = this._broker;
      session.notify("command/shrink-row", diff);
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
  "[command('closepanel')]":
  function close() 
  {
    let bottom_panel = this._bottom_panel;
    let renderer = this._renderer;
    let line_height = renderer.line_height;
    let diff = Math.floor(bottom_panel.boxObject.height / line_height);
    bottom_panel.setAttribute("collapsed", true);
    if (0 != diff) {
      let session = this._broker;
      session.notify("command/expand-row", diff);
    }
  },

  /**
   * @property panelHeight
   */
  get panelHeight() 
  {
    let samplePanel = this._tabbox.tabpanels.firstChild;
    let result = samplePanel ? samplePanel.boxObject.height: 0;
    return result;
  },

  set panelHeight(value) 
  {
    for ([, panel] in Iterator(this._tabbox.tabpanels.childNodes)) {
      panel.height = value;
    }
  },

  /** Allocates and returns new panel element. 
   * @param {String} id A panel id.
   * @param {String} name.
   */
  alloc: function alloc(id, name) 
  {
    // check duplicated allocation.
    if (this._panel_map[id]) {
      throw coUtils.Debug.Exception(
        _("Specified id '%s' already exists."), id);
    }

    let session = this._broker;
    let {tanasinn_tab} = session.uniget(
      "command/construct-chrome", 
      {
        parentNode: "#tanasinn_tabbox_tabs",
        tagName: "tab",
        id: "tanasinn_tab",
        name: id,
        label: name,
        listener: {
          type: "select",
          handler: function(event) {
            alert(event)
          },
        },
        style: <>
          -moz-appearance: none;
          font: menu;
          color: black;
          text-shadow: 0 1px rgba(255, 255, 255, .4);
          background: -moz-linear-gradient(top, #fff, #ccc);
          border-top-left-radius: 4px;
          border-top-right-radius: 4px;
          //border: solid 1px #888;
          border-bottom: 0px;
          border-left: 2px solid #aaa;
          border-right: 2px solid #ccc;
          margin-left: -2px;
          margin-right: -4px;
//          background: transparent;
//          MozAppearance: "none",
          //margin: "0px",
          //padding: "0px",
        </>,
      });
    let tab_panel = session.uniget(
      "command/construct-chrome", 
      {
        parentNode: "#tanasinn_tabbox_tabpanels",
        tagName: "tabpanel",
        id: id,
        orient: "vertical",
        height: 180,
        style: <>
            -moz-appearance: none;
            //border: solid 3px pink;
            background: transparent;
//          padding: "0px",
//          marginTop: "-18px",
//          marginBottom: "-18px",
        </>,
      })[id];
    this._panel_map[id] = [tanasinn_tab, tab_panel];
    return tab_panel;
  },

  "[subscribe('command/add-panel')]":
  function add(panel_object) 
  {
    let id = panel_object.id;
    let name = panel_object.info..name;
    let new_panel = this.alloc(id, name);
    let session = this._broker;
    let content = session.uniget("command/construct-chrome", panel_object.template)["#root"];
    new_panel.appendChild(content);
    session.subscribe("panel-selected/" + panel_object.id, function(selected_panel) 
    {
      try {
      let template = panel_object.template;
      template.parentNode = new_panel;
      new_panel.removeChild(new_panel.firstChild);
      let content = session.uniget("command/construct-chrome", panel_object.template)["#root"];
      new_panel.appendChild(content);
      } catch (e) {alert(e)}
    }, this);
  },

  _selectTab: function _selectTab(tab) 
  {
    this._tabbox.selectedTab = tab; 
    let box_object = this._scrollbox;
    if (box_object.ensureElementIsVisible) {
      box_object.ensureElementIsVisible(tab);
    }
  },

  /** Select specified panel.
   * @param {String} id A panel id.
   */ 
  "[subscribe('command/select-panel')]":
  function select(id) 
  {
    id = id.id || id;
    let toggle = true;
    if (id.match(/^\!/)) {
      toggle = false;
      id = id.substr(1);
    }
    let panel_map = this._panel_map;
    if (id in panel_map) { // Check if specified id was registered.
      let [tab, ] = this._panel_map[id];
      // toggle open/close state.
      if (true == this._bottom_panel.collapsed) {
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
      throw coUtils.Debug.Exception(
        _("Specified tab ID '%s' not found."), id);
    }
  },

  /** Removes specified panel.
   * @param {String} id A panel id.
   * TODO: when it is removed, selected position is tilted.
   */ 
  "[subscribe('command/remove-panel')]":
  function remove(id) 
  {
    id = id.id || id;
    let panel_map = this._panel_map;
    let [tab, tab_panel] = panel_map[id];
    tab.parentNode.removeChild(tab);
    tab_panel.parentNode.removeChild(tab_panel);
    delete panel_map[id];
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
    "@initialized/session", 
    function(session) 
    {
      new BottomPanel(session);
    });
}



