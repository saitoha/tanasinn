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
 * @class Splitter
 */
let Splitter = new Class().extends(Plugin);
Splitter.definition = {

  get id()
    "splitter",

  get info()
    <module type="plugin">
        <name>Splitter</name>
        <description>{
          _("Make it enable to change the height of bottom-panel ",
            "by dragging horizontal bar like interface.")
        }</description>
        <version>0.1</version>
    </module>,

  get template()
    ({
      tagName: "splitter",
      id: "coterminal_splitter",
      height: 16,
      style: { MozAppearance: "statusbar" },
      listener: {
        type: "dragstart", 
        context: this,
        handler: this.ondragstart,
      }
    }),

  /** post-constructor */
  "[subscribe('@initialized/{screen & renderer & bottompanel}'), enabled]": 
  function onLoad(screen, renderer, tabbox) 
  {
    this._screen = screen;
    this._renderer = renderer;
    this._tabbox = tabbox;
    this.enabled = this.enabled_when_startup;
  },

  /** Installs itself. 
   *  @param {Session} session A session object.
   */
  "[subscribe('install/ + this.id')]":
  function install(session) 
  {
    let tabbox = this._tabbox;

    // create splitter element.
    let {coterminal_splitter}
      = session.uniget("command/construct-chrome", this.template);
    let tabbox_element = tabbox.getElement();
    tabbox_element.parentNode.insertBefore(coterminal_splitter, tabbox_element);

    this._splitter = coterminal_splitter;
  },

  /** Unnstalls itself.
   *  @param {Session} session A session object.
   */
  "[subscribe('uninstall/ + this.id')]":
  function uninstall(session) 
  {
    // remove splitter element
    this._splitter.parentNode.removeChild(this._splitter);
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
    let session = this._broker;
    let renderer = this._renderer;
    let screen = this._screen;
    let tabbox = this._tabbox;
    let document = session.window.document;
    let initial_height = tabbox.panelHeight;
    let initial_row = screen.height;
    let line_height = renderer.line_height;
    document.documentElement.style.cursor = "row-resize";
    let y = event.screenY;

    session.notify("event/resize-session-started");
    session.notify("command/add-domlistener", {
      target: document,
      type: "mousemove",
      id: "_DRAGGING",
      context: this,
      handler: function onmousemove(event) 
      {
        let diff = event.screenY - y;
        let row = initial_row + Math.round(diff / line_height);
        screen.height = row;
        diff = (row - initial_row) * line_height;
        if (initial_height - diff < 0) {
          tabbox.close();
          tabbox.panelHeight = initial_height;
        } else {
          tabbox.panelHeight = initial_height - diff;
        }
      },
    });
    session.notify("command/add-domlistener", {
      target: document,
      type: "mouseup", 
      id: "_DRAGGING",
      context: this,
      handler: function onmouseup() 
      {
        document.documentElement.style.cursor = "",
        session.notify("command/remove-domlistener", "_DRAGGING");
        if (screen.height == initial_row)
          return;
        session.notify("event/resize-session-closed");
      }
    });
  }
} // class Splitter


/**
 * @fn main
 * @brief Module entry point.
 * @param {Process} process The Process object.
 */
function main(process) 
{
  process.subscribe(
    "initialized/session", 
    function(session) 
    {
      new Splitter(session);
    });
}

