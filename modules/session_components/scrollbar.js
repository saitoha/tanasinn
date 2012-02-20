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
 * @class Scrollbar
 * @brief Shows scrollbar interface.
 */
let Scrollbar = new Class().extends(Plugin);
Scrollbar.definition = {

  get id()
    "scrollbar",

  get info()
    <plugin>
        <name>{_("Scroll Bar")}</name>
        <description>{
          _("Shows scrollbar interface.")
        }</description>
        <version>0.1</version>
    </plugin>,

  "[persistable] active_opacity": 0.3,
  "[persistable] inner_width": 24,
  "[persistable] border_width": 4,
  "[persistable] transition_duration": 500,
  "[persistable] color": "white",
  "[persistable] background_color": "white",

  get template()
    ({
      parentNode: "#tanasinn_content",
      tagName: "vbox",
      id: "tanasinn_scrollbar_overlay",
      align: "right",
      childNodes: {
        tagName: "vbox",
        flex: 1,
        id: "tanasinn_scrollbar",
        style: { 
          opacity: 0.00,
          MozTransitionProperty: "opacity",
          MozTransitionDuration: <>{this.transition_duration}ms</>,
          borderRadius: <>{this.inner_width + this.border_width * 2}px</>,
          border: <>{this.border_width}px solid {this.color}</>,
          width: <>{this.inner_width + this.border_width * 2}px</>,
          margin: "8px",
          height: "100%",
        },
        childNodes: [
          {
            tagName: "box",
            id: "tanasinn_scrollbar_before",
            listener: [
              {
                type: "click",
                context: this,
                handler: function onclick(event) 
                {
                  event.stopPropagation();
                  this.changePosition(this._before.flex - 10);
                }
              },
            ],
          },
          {
            tagName: "box",
            id: "tanasinn_scrollbar_current",
            height: this.inner_width * 2,
            style: { 
              borderRadius: <>{this.inner_width / 2}px</>,
              backgroundColor: this.color,
            },
          },
          {
            tagName: "box",
            id: "tanasinn_scrollbar_after",
            listener: {
              type: "click",
              context: this,
              handler: function onclick(event) 
              {
                event.stopPropagation();
                this.changePosition(this._before.flex + 10);
              },
            },
          },
        ],
      },
    }),

  /** Installs itself.
   * @param {Session} session A session object.
   */
  "[subscribe('install/scrollbar'), enabled]":
  function install(session) 
  {
    let {
      tanasinn_scrollbar_overlay,
      tanasinn_scrollbar,
      tanasinn_scrollbar_before,
      tanasinn_scrollbar_current,
      tanasinn_scrollbar_after,
    } = session.uniget("command/construct-chrome", this.template);

    this._scrollbar_overlay = tanasinn_scrollbar_overlay;
    this._scrollbar = tanasinn_scrollbar;
    this._before = tanasinn_scrollbar_before;
    this._current = tanasinn_scrollbar_current;
    this._after = tanasinn_scrollbar_after;

    this.onScrollPositionChanged.enabled = true;
    this.ondblclick.enabled = true;
    this.ondragstart.enabled = true;
    this.onmouseover.enabled = true;
    this.onmouseout.enabled = true;
  },

  /** Unnstalls itself. 
   * @param {Session} session A session object.
   */
  "[subscribe('uninstall/scrollbar'), enabled]":
  function uninstall(session) 
  {
    this.onScrollPositionChanged.enabled = false;
    this.ondblclick.enabled = false;
    this.ondragstart.enabled = false;
    this.onmouseover.enabled = false;
    this.onmouseout.enabled = false;
    // remove scrollbar element
    this._scrollbar_overlay.parentNode.removeChild(this._scrollbar_overlay);
  },

  changePosition: function changePosition(position) 
  {
    let min_position = 0;
    let max_position = parseInt(this._before.flex) 
                     + parseInt(this._after.flex);
    position = Math.max(position, min_position);
    position = Math.min(position, max_position);
    if (position != this._before.flex) {
      let session = this._broker;
      session.notify("command/set-scroll-position", position);
      session.notify("command/draw");
    }
  },

  "[subscribe('event/scroll-position-changed'), enabled]":
  function onScrollPositionChanged(scroll_info) 
  {
    let scrollbar = this._scrollbar;
    let before = this._before;
    let current = this._current;
    let after = this._after;
    if (0 == scrollbar.style.opacity) {
      scrollbar.style.opacity = this.active_opacity;
    }
    before.flex = scroll_info.start;
    current.flex = scroll_info.end - scroll_info.start;
    after.flex = scroll_info.size - scroll_info.end;
    if (0 == after.flex && !this._dragging) {
      if (0.00 != scrollbar.style.opacity) {
        scrollbar.style.opacity = 0.00;
      }
    }
  },

  "[listen('dragstart', '#tanasinn_scrollbar')]":
  function ondragstart(event) 
  {
    event.stopPropagation();
  },

  "[listen('dblclick', '#tanasinn_scrollbar')]":
  function ondblclick(event) 
  {
    event.stopPropagation();
  },
  
  "[listen('mouseover', '#tanasinn_scrollbar')]":
  function onmouseover(event) 
  {
    let scrollbar = this._scrollbar;
    if (0 == this._after.flex && 0 == scrollbar.style.opacity) {
      let session = this._broker;
      session.notify("command/update-scroll-information");
      scrollbar.style.opacity = this.active_opacity;
    }
  },

  "[listen('mouseout', '#tanasinn_scrollbar')]":
  function onmouseout(event) 
  {
    let scrollbar = this._scrollbar;
    if (0 == this._after.flex && !this._dragging && 0.00 != scrollbar.style.opacity) {
      scrollbar.style.opacity = 0.00;
    }
  },

  "[listen('dragstart', '#tanasinn_scrollbar_current')]":
  function ondragstart(dom_event) 
  {
    let session = this._broker;
    this._dragging = true;
    dom_event.stopPropagation();
    //dom_event.preventDefault();
    let initial_y = dom_event.screenY;
    let dom_document = session.document; // managed by DOM
    let radius = this.inner_width + this.border_width;
    let height = this._scrollbar.boxObject.height - radius * 2;
    let before_flex = parseInt(this._before.flex);
    let current_flex = parseInt(this._current.flex);
    let after_flex = parseInt(this._after.flex);
    let flex = before_flex + current_flex + after_flex;
    let flex_per_height = flex / height;
    let initial_view_top = before_flex;

    // register mousemove listener.
    session.notify(
      "command/add-domlistener", 
      {
        type: "mousemove",
        id: "_DRAGGING",
        target: dom_document,
        context: this,
        handler: function onmousemove(event) 
        {
          let delta = event.screenY - initial_y;
          let position = Math.round(initial_view_top + flex * delta / height);
          this.changePosition(position);
        },
      });

    // register mouseup listener.
    session.notify(
      "command/add-domlistener", 
      {
        type: "mouseup",
        id: "_DRAGGING",
        target: dom_document,
        capture: true,
        context: this,
        handler: function onmouseup(event) 
        {
          this._dragging = false;
          session.notify("command/remove-domlistener", "_DRAGGING");
          if (0 == this._after.flex) {
            this._scrollbar.style.opacity = 0.00;
          }
        },
      });

    // to prevent leak.
    dom_document = null;
    dom_event = null;
  },

} // class Scrollbar

/**
 * @fn main
 * @brief Module entry point.
 * @param {Broker} broker The Broker object.
 */
function main(broker) 
{
  new Scrollbar(broker);
}

