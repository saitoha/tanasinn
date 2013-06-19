/* -*- Mode: JAVASCRIPT; tab-width: 2; indent-tabs-mode: nil; c-basic-offset: 4 -*-
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

var ZshCompletion = new Trait();
ZshCompletion.definition = {

  _clearGrid: function _clearGrid()
  {
    while (this._container.firstChild) {
      this._container.removeChild(this._container.firstChild);
    }
  },

  "[subscribe('event/data-arrived')]":
  function onDataArrived(data)
  {
    var lines = data.match(/<item>(.*?)<end>/gm)
          .map(
            function mapFunc(s)
            {
              return s.slice(6, -5);
            })
          .filter(
            function filterFunc(s)
            {
              return !s.match(/<space>/);
            }),
        match = data.match(/\x1b.*$/),
        prompt;

    Array.prototype.push.apply(this.lines, lines);

    if (null !== match) {
      prompt = match[0];
      this.onDataArrived.enabled = false;
      this.sendMessage("command/enable-default-parser");
      this.sendMessage("event/data-arrived", "\r" + prompt);
      this._clearGrid();
      this.display();
    }
  },

  display: function display()
  {
    var lines = this.lines,
        colormap = [ "", "#cdffcf", "#cdd", "#dfffdd" ],
        renderer = this._renderer,
        selected = -1;

    this.onDataArrived.enabled = false;

    this.request(
      "command/construct-chrome",
      {
        parentNode: "#tanasinn_app_popup_container",
        tagName: "rows",
        style: {
          MozUserFocus: "none",
          fontFamily: renderer.font_family,
          fontSize: renderer.font_size + "px",
          fontWeight: "bold",
          color: "#ffefff",
          textShadow: "1px 1px 3px black, 0px 0px 4px black",
        },
        childNodes: [
          {
            tagName: "row",
            style: "padding: 0px 10px;" + (index !== selected ? "":
              "background-image: -moz-linear-gradient(top, #ddd, #eee); " +
              "box-shadow: 1px 1px 5px black;" +
              "color: #ffefef;" +
              "border-radius: 5px;"),
            childNodes: [
              {
                tagName: "box",
                innerText: function()
                {
                  try {
                    return coUtils.Text.base64decode(cell);
                  } catch(e) {
                    return cell;
                  }
                }(),
                style: "padding: 0px 5px; color: {colormap[index]};",
              } for ([index, cell] in Iterator(line.split(",")))
            ]
          } for ([index, line] in Iterator(lines))
        ],
      });
    this._datum.style.height = renderer.line_height + "px";
    this._is_showing = true;
    this._popup.openPopup(
      this._datum,
      "after_start", 0, 0, true, true);
  },

  "[subscribe('sequence/osc/202'), pnp]":
  function onZshCompletion(data)
  {
    this.sendMessage("command/disable-default-parser");
    this.onDataArrived.enabled = true;
    this.lines = [];
  },

  "[subscribe('sequence/osc/203'), enabled]":
  function onZshCompletionCategory(data)
  {
    this.lines.push("-----" + data);
  },

  "[subscribe('sequence/osc/204'), enabled]":
  function onThingy(data)
  {
    var kind, str;

    [kind, str] = data.split("|");

    if (3 !== kind) {
      this.lines.push(str);
    }
  },

};

/**
 *  @class PopupMenu
 */
var PopupMenu = new Class().extends(Plugin)
                           .mix(ZshCompletion)
                           .depends("renderer")
                           .depends("cursorstate")
                           ;
PopupMenu.definition = {

  id: "popup_menu",

  /** plugin information */
  getInfo: function getInfo()
  {
    return {
      name: _("Popup Menu"),
      version: "0.1",
      description: _("Handles application plivate sequence and",
                     " shows native popup menu.")
    };
  },

  "[persistable] enabled_when_startup": true,

  "[persistable] duration": 150,
  "[persistable] color": "white",
  "[persistable] opacity": 0.25,
  "[persistable] max_height": 450,

  _cover: null,
  _is_showing: false,
  _renderer: null,
  _target: null,

  /** Installs itself.
   *  @param {InstallContext} context A InstallContext object.
   */
  "[install]":
  function install(context)
  {
    var {
      tanasinn_app_popup_datum,
      tanasinn_app_popup,
      tanasinn_app_popup_scrollbox,
      tanasinn_app_popup_container,
    } = this.request(
      "command/construct-chrome",
      [
        {
          parentNode: "#tanasinn_center_area",
          tagName: "box",
          id: "tanasinn_app_popup_datum",
          style: "position: absolute;",
        },
        {
          parentNode: "#tanasinn_background_frame",
          tagName: "panel",
          id: "tanasinn_app_popup",
          style: {
            border: "0px",
            MozAppearance: "none",
            MozUserFocus: "none",
            backgroundColor: "transparent",
          },
          noautofocus: true,
          noautohide: true,
          ignorekeys: true,
          childNodes: {
            tagName: "stack",
            flex: 1,
            childNodes: [
              {
                tagName: "box",
                flex: 1,
                style: {
                  opacity: "0.40",
                  backgroundImage: "-moz-linear-gradient(top, #aaa, #888)",
                  borderRadius: "8px",
                },
              },
              {
                tagName: "scrollbox",
                id: "tanasinn_app_popup_scrollbox",
                orient: "vertical",
                flex: 1,
                maxHeight: this.max_height,
                style: "margin: 9px; overflow-y: auto;",
                childNodes: {
                  tagName: "grid",
                  id: "tanasinn_app_popup_container",
                },
              },
            ],
          },
        },
      ]);
    this._datum = tanasinn_app_popup_datum;
    this._popup = tanasinn_app_popup;
    this._scrollbox = tanasinn_app_popup_scrollbox;
    this._container = tanasinn_app_popup_container;

    this._renderer = context["renderer"];
    this._cursor_state = context["cursor_state"];
  },

  /** Uninstalls itself.
   */
  "[uninstall]":
  function uninstall()
  {
    if (null !== this._datum) {
      this._datum.parentNode.removeChild(this._datum);
      this._datum = null;
    }
    if (null !== this._popup) {
      this._popup.parentNode.removeChild(this._popup);
      this._popup = null;
    }

    this._renderer = null;
    this._cursor_state = null;
    this._target = null;
  },

  "[listen('mousedown', '#tanasinn_app_popup', true), pnp]":
  function onmousedown(event)
  {
    var target = event.explicitOriginalTarget;
        diff,
        packed_code,
        i;

    if (!target) {
      return;
    }

    while ("row" !== target.tagName) {
      target = target.parentNode;
    }

    diff = - this._selected;

    while ((target = target.previousSibling)) {
      ++diff;
    }

    this.onDisplay.enabled = false;
    this._popup.hidePopup();

    this.sendMessage("command/focus");

    if (diff < 0) {
      packed_code = coUtils.Keyboard.parseKeymapExpression("<C-p>");
    } else {
      packed_code = coUtils.Keyboard.parseKeymapExpression("<C-n>");
    }
    for (i = 0; i < Math.abs(diff); ++i) {
      this.sendMessage("command/input-with-no-remapping", packed_code);
    }
    packed_code = coUtils.Keyboard.parseKeymapExpression("<Escape>");

    this.sendMessage("command/input-with-no-remapping", packed_code);
  },

  "[listen('mousemove', '#tanasinn_app_popup', true), pnp]":
  function onmousemove(event)
  {
    var target = event.explicitOriginalTarget;

    while ("row" !== target.tagName) {
      target = target.parentNode;
    }

    if (this._target) {
      this._target.style.backgroundColor = "";
      this._target.style.borderRadius = "5px";
    }

    this._target = target;
    target.style.backgroundColor = "#ccc";
  },

  "[listen('mouseup', '#tanasinn_app_popup', true), pnp]":
  function onmouseup(event)
  {
    event.stopPropagation();
    event.preventDefault();
  },

  "[subscribe('sequence/osc/200'), pnp]":
  function onDisplay(data)
  {
    var lines = data.split("\n"),
        renderer = this._renderer,
        line_height = renderer.line_height,
        char_width = renderer.char_width,
        row,
        column,
        selected,
        cursor_state,
        x,
        y,
        colormap,
        scrollbox,
        rows,
        box_object,
        row,
        scrollY,
        first_position,
        last_position;

    while (this._container.firstChild) {
      this._container.removeChild(this._container.firstChild);
    }

    [row, column, selected] = lines.shift()
      .split(",")
      .map(function(str) Number(str));
    this._selected = selected;

    cursor_state = this._cursor_state;
    row = row || cursor_state.positionY + 1;

    x = column * char_width - 10;
    y = row * line_height;

    colormap = [ "", "#cdffcf", "#cdd", "#dfffdd" ];

    this.request(
      "command/construct-chrome",
      {
        parentNode: "#tanasinn_app_popup_container",
        tagName: "rows",
        style: {
          MozUserFocus: "none",
          fontFamily: renderer.font_family,
          fontSize: renderer.font_size + "px",
          fontWeight: "bold",
          color: "#ffefff",
          textShadow: "1px 1px 3px black, 0px 0px 4px black",
        },
        childNodes: [
          {
            tagName: "row",
            style: "padding: 0px 10px;" + (index !== selected ? "":
              "background-image: -moz-linear-gradient(top, #ddd, #eee);" +
              "box-shadow: 1px 1px 5px black;" +
              "color: #ffefef;" +
              "border-radius: 5px;"),
            childNodes: [
              {
                tagName: "box",
                innerText: function()
                {
                  try {
                    return coUtils.Text.base64decode(cell);
                  } catch(e) {
                    coUtils.Debug.reportError(e);
                    coUtils.Debug.reportError("text: " + cell);
                    return cell;
                  }
                }(),
                style: {
                  padding: "0px 5px",
                  color: colormap[index],
                },
              } for ([index, cell] in Iterator(line.split(",")))
            ]
          } for ([index, line] in Iterator(lines))
        ],
      });
    this._datum.style.height = renderer.line_height + "px";
    this._datum.style.top = y + "px";
    //if (/^(?:closed|hiding)$/.test(this._popup.state)) {
    //if (!this._is_showing) {
      this._is_showing = true;
      this._popup.openPopup(
        this._datum,
        "after_start", x, 0, true, true);
    //}
    //
    this.sendMessage("command/focus");

    if (-1 !== selected) {
      scrollbox = this._scrollbox;
      rows = scrollbox.querySelector("rows");
      box_object = scrollbox.boxObject
        .QueryInterface(Components.interfaces.nsIScrollBoxObject)
      if (box_object) {
        row = rows.childNodes[selected];
        scrollY = {};
        box_object.getPosition({}, scrollY);
        first_position = row.boxObject.y
          - scrollbox.boxObject.y;
        last_position = first_position
          - scrollbox.boxObject.height
          + row.boxObject.height;
        if (first_position < scrollY.value) {
          box_object.scrollTo(0, first_position);
        } else if (last_position > scrollY.value) {
          box_object.scrollTo(0, last_position);
        }
      }
      scrollbox.setAttribute("orient", "vertical");
    }
//    box_object.scrollTo(0, selected * rows.firstChild.boxObject.height);
  },

  "[subscribe('sequence/osc/201'), pnp]":
  function onUndisplay()
  {
    this._is_showing = false;
    coUtils.Timer.setTimeout(
      function()
      {
        if (false === this._is_showing) {
          this._popup.hidePopup();
          this.sendMessage("command/focus");
        }
      }, 30, this);
    this.onDisplay.enabled = true;
  },

  _selectRow: function _selectRow(row)
  {
    var completion_root = this._completion_root,
        scroll_box = completion_root.parentNode,
        box_object = scroll_box.boxObject
          .QueryInterface(Components.interfaces.nsIScrollBoxObject),
        scrollY,
        first_position,
        last_position;

    row.style.borderRadius = "6px";
    row.style.backgroundImage
      = "-moz-linear-gradient(top, #777, #666)";
    row.style.color = "white";

    if (box_object) {
      scrollY = {};

      box_object.getPosition({}, scrollY);

      first_position = row.boxObject.y
        - scroll_box.boxObject.y;
      last_position = first_position
        - scroll_box.boxObject.height
        + row.boxObject.height;
      if (first_position < scrollY.value) {
        box_object.scrollTo(0, first_position);
      } else if (last_position > scrollY.value) {
        box_object.scrollTo(0, last_position);
      }
    }
  },

  /** test */
  "[test]":
  function()
  {
    var enabled = this.enabled;

    //try {
    //  this.enabled = false;
    //  this.enabled = true;
    //  this.enabled = false;
    //} finally {
    //  this.enabled = enabled;
    //}
  },


} // class Popup


/**
 * @fn main
 * @brief Module entry point.
 * @param {Broker} broker The Broker object.
 */
function main(broker)
{
  new PopupMenu(broker);
}

// EOF
