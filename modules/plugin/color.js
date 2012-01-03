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
 * The Original Code is coTerminal
 *
 * The Initial Developer of the Original Code is
 * Hayaki Saito.
 * Portions created by the Initial Developer are Copyright (C) 2010 - 2011
 * the Initial Developer. All Rights Reserved.
 *
 * ***** END LICENSE BLOCK ***** */


/**
 * @class ColorManager
 */
let ColorManager = new Class().extends(Plugin);
ColorManager.definition = {

  get id()
    "color_manager",

  get info()
    <plugin>
        <name>{_("Color")}</name>
        <description>{
          _("Makes you to view and edit font/background color settings.")
        }</description>
        <version>0.1</version>
    </plugin>,

  get template()
    let (self = this) 
    let (normal_color = this._renderer.normal_color)
    {
      tagName: "hbox", flex: 1,
      style: { MozAppearance: "tabpanels", overflowY: "auto" },
      childNodes: {
        tagName: "bulletinboard",
        childNodes: [
          let (index = index)
          let (color = color)
          let (picker_size = 9)
          {
            tagName: "colorpicker",
            className: "coterminal-colormanager-picker",
            type: "button",
            style: { 
              MozUserFocus: "ignore",
              padding: "0px",
              margin: "0px",
              border: "0px",
            },
            left: index % 16 * picker_size,
            top: Math.floor(index / 16) * picker_size,
            width: picker_size,
            height: picker_size, 
            onconstruct: function() this.setAttribute("color", color),
            listener: {
              type: "select",
              context: this,
              handler: function(event) 
              {
                this.set(index, event.target.color);
                let session = this._broker;
                coUtils.Timer.setTimeout(function() 
                {
                  session.notify("command/focus");
                }, 10, this)
              },
            },
          } for ([index, color] in Iterator(normal_color)) if (index < 256)
        ],
      },
    },

  _bottom_panel: null,

  /** constructor */
  "[subscribe('@initialized/{renderer & bottompanel}'), enabled]":
  function onLoad(renderer, bottom_panel) 
  {
    this._renderer = renderer;
    this._bottom_panel = bottom_panel;
    this.enabled = this.enabled_when_startup;
  },

  /** Installs itself */
  install: function(session) 
  {
    let bottom_panel = this._bottom_panel;
    this._bottom_panel.add(this);
    this.select.enabled = true;
  },

  /** Uninstalls itself */
  uninstall: function(session) 
  {
    this._bottom_panel.remove(this);
    this.select.enabled = false;
  },

  set: function(index, value) 
  {
    let normal_color = this._renderer.normal_color;
    normal_color[index] = value;
  },

  "[key('meta + g'), _('Open color manager.')]":
  function select() 
  {
    let session = this._broker;
    session.notify("command/select-panel", this.id);
  },

};

/**
 * @fn main
 * @brief Module entry point.
 * @param {Process} process The Process object.
 */
function main(process) 
{
  process.subscribe(
    "initialized/session", 
    function(session) new ColorManager(session));
}

