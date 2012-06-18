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
 * @class Splitter
 */
var Splitter = new Class().extends(Plugin)
                          .depends("screen")
                          .depends("renderer")
                          .depends("bottompanel")
                          ;
Splitter.definition = {

  get id()
    "splitter",

  get info()
    <module type="plugin">
        <name>{_("Splitter")}</name>
        <description>{
          _("Make it enable to change the height of bottom-panel ",
            "by dragging horizontal bar like interface.")
        }</description>
        <version>0.1</version>
    </module>,

  get template()
    ({
      tagName: "vbox",
      id: "tanasinn_splitter",
      height: 16,
      style: <> 
        -moz-appearance: none;
        cursor: ns-resize;
        background: transparent;
      </>,
      listener: {
        type: "dragstart", 
        context: this,
        handler: this.ondragstart,
      }
    }),

  "[persistable] enabled_when_startup": true,

  /** Installs itself. 
   *  @param {Session} session A session object.
   */
  "[install]":
  function install(session) 
  {
    var bottompanel, tabbox_element;
    bottompanel = this.dependency["bottompanel"];

    // create splitter element.
    var {tanasinn_splitter}
      = session.uniget("command/construct-chrome", this.template);
    tabbox_element = bottompanel.getElement();
    tabbox_element.parentNode.insertBefore(tanasinn_splitter, tabbox_element);

    this._splitter = tanasinn_splitter;
  },

  /** Unnstalls itself.
   *  @param {Session} session A session object.
   */
  "[uninstall]":
  function uninstall(session) 
  {
    // remove splitter element
    if (null !== this._splitter) {
      this._splitter.parentNode.removeChild(this._splitter);
      this._splitter = null;
    }
  },

  /** Makes splitter bar behave as vertical resizebar.
   * As closing panel, center-screen's height is expanded/shrinked
   * as mach as delta of bottom panel height.
   *
   *   +---------------+              +---------------+
   *   |               |              | center screen |
   *   | center screen |              |               |
   *   |               | splitter  -> +---------------+     
   *   +---------------+ can slids    |               |     total
   *   |               | vertically.  | bottom panel  |     height
   *   | bottom panel  |              |               |     is not
   *   +---------------+              +---------------+ <-- changed.
   */
  ondragstart: function ondragstart(event) 
  {
    var broker, renderer, screen, bottompanel, document, 
        initial_height, initial_row, line_height, y;
    broker = this._broker;
    renderer = this.dependency["renderer"];
    screen = this.dependency["screen"];
    bottompanel = this.dependency["bottompanel"];
    initial_height = bottompanel.panelHeight;
    initial_row = screen.height;
    line_height = renderer.line_height;
    broker.window.document.documentElement.style.cursor = "row-resize";
    y = event.screenY;

    this.sendMessage("event/resize-session-started");
    this.sendMessage("command/add-domlistener", {
      target: broker.window.document,
      type: "mousemove",
      id: "_DRAGGING",
      context: this,
      handler: function onmousemove(event) 
      {
        var diff, row;

        diff = event.screenY - y;
        row = initial_row + Math.round(diff / line_height);
        screen.height = row;
        diff = (row - initial_row) * line_height;
        if (initial_height - diff < 0) {
          bottompanel.close();
          bottompanel.panelHeight = initial_height;
        } else {
          bottompanel.panelHeight = initial_height - diff;
        }
      },
    });
    this.sendMessage("command/add-domlistener", {
      target: broker.window.document,
      type: "mouseup", 
      id: "_DRAGGING",
      context: this,
      handler: function onmouseup() 
      {
        broker.window.document.documentElement.style.cursor = "",
        this.sendMessage("command/remove-domlistener", "_DRAGGING");
        if (screen.height == initial_row)
          return;
        this.sendMessage("event/resize-session-closed");
      }
    });
  }
} // class Splitter


/**
 * @fn main
 * @brief Module entry point.
 * @param {Broker} broker The Broker object.
 */
function main(broker) 
{
  new Splitter(broker);
}

