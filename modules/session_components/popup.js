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

let ZshCompletion = new Trait();
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
    //let lines = data//.replace(/\x1b\[J|\n|<space>\s+<end><item>/g, "")
    //  .split(/<item>/)
      //.map(function(line) line.split(/<end>/).shift());
    let lines = data.match(/<item>(.*?)<end>/gm).map(function(s) s.slice(6, -5)).filter(function(s) !s.match(/<space>/));  
    Array.prototype.push.apply(this.lines, lines);
    let match = data.match(/\x1b.*$/);
    if (null !== match) {
      let [prompt] = match;
      this.onDataArrived.enabled = false;
      let session = this._broker;
      session.notify("command/enable-default-parser");
      session.notify("event/data-arrived", "\r" + prompt);
      this._clearGrid();
      this.display();
    }
  },

  display: function() 
  {
    let lines = this.lines;
    this.onDataArrived.enabled = false;
    let colormap = [ "", "#cdffcf", "#cdd", "#dfffdd" ];
    let session = this._broker;
    let renderer = this.dependency["renderer"];
    let selected = -1;
    let {} = session.uniget(
      "command/construct-chrome", 
      {
        parentNode: "#tanasinn_app_popup_container",
        tagName: "rows",
        style: <>
          -moz-user-focus: none;
          font-family: {renderer.font_family};
          font-size: {renderer.font_size}px;
          font-weight: bold;
          color: #ffefff;
          text-shadow: 1px 1px 3px black, 0px 0px 4px black;
        </>,
        childNodes: [
          {
            tagName: "row",
            style: <>
              padding: 0px 10px;
            </> + (index == selected && <>
              background-image: -moz-linear-gradient(top, #ddd, #eee); 
              -moz-box-shadow: 1px 1px 5px black;
              color: #ffefef;
              border-radius: 5px;
            </>),
            childNodes: [
              {
                tagName: "box",
                innerText: function() 
                { 
                  try { 
                    return cell;//coUtils.Text.base64decode(cell); 
                  } catch(e) { 
                    return cell;
                  }
                }(),
                style: <>
                  padding: 0px 5px;
                  color: {colormap[index]};
                </>,
              } for ([index, cell] in Iterator(line.split(",")))
            ]
          } for ([index, line] in Iterator(lines))
        ],
      });
    this._datum.style.height = renderer.line_height + "px";
//    this._datum.style.top = y + "px";
    this._is_showing = true;
    this._popup.openPopup(
      this._datum, 
      "after_start", 0, 0, true, true);
//    session.notify("command/focus");
    /*
    if (-1 != selected) {
      let scrollbox = this._scrollbox;
      let rows = scrollbox.querySelector("rows");
      let box_object = scrollbox.boxObject
        .QueryInterface(Components.interfaces.nsIScrollBoxObject)
      if (box_object) {
        let row = rows.childNodes[selected];
        let scrollY = {};
        box_object.getPosition({}, scrollY);
        let first_position = row.boxObject.y 
          - scrollbox.boxObject.y;
        let last_position = first_position 
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
    */
  },

  "[subscribe('sequence/osc/202')]":
  function onZshCompletion(data) 
  {
    let session = this._broker;
    session.notify("command/disable-default-parser");
    this.onDataArrived.enabled = true;
    this.lines = [];
//    coUtils.Timer.setTimeout(function() {
//      this.display();
//    }, 100, this);
  },

  "[subscribe('sequence/osc/203'), enabled]":
  function onZshCompletionCategory(data) 
  {
    //this.onDataArrived.enabled = true;
    this.lines.push("-----" + data);
  },

  "[subscribe('sequence/osc/204'), enabled]":
  function onThingy(data) 
  {
    let [kind, str] = data.split("|");
    if (3 != kind) {
      this.lines.push(str);
    }
  },

};

/**
 *  @class PopupMenu
 */
let PopupMenu = new Class().extends(Plugin)
                           .mix(ZshCompletion)
                           .depends("renderer")
                           .depends("cursorstate")
                           ;
PopupMenu.definition = {

  get id()
    "popup_menu",

  get info()
    <module>
        <name>{_("Popup Menu")}</name>
        <description>{
          _("Handles application plivate sequence and shows native popup menu.")
        }</description>
        <version>0.1</version>
    </module>,

  "[persistable] enabled_when_startup": true,

  "[persistable] duration": 150,
  "[persistable] color": "white",
  "[persistable] opacity": 0.25,
  "[persistable] max_height": 450,

  _cover: null,
  _is_showing: false,
 
  /** installs itself. 
   *  @param {Session} session A session object.
   */
  "[subscribe('install/popup_menu'), enabled]":
  function install(session) 
  {
    this.onDisplay.enabled = true;
    this.onUndisplay.enabled = true;
    this.onZshCompletion.enabled = true;
    let {
      tanasinn_app_popup_datum,
      tanasinn_app_popup,
      tanasinn_app_popup_scrollbox,
      tanasinn_app_popup_container,
    } = session.uniget(
      "command/construct-chrome", 
      [
        {
          parentNode: "#tanasinn_center_area",
          tagName: "box",
          id: "tanasinn_app_popup_datum",
          style: <>
            position: absolute;
          </>,
        },
        {
          parentNode: "#tanasinn_background_frame",
          tagName: "panel",
          id: "tanasinn_app_popup",
          style: <>
            border: 0px;
            -moz-appearance: none;
            -moz-user-focus: none;
            background-color: transparent;
          </>,
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
                style: <>
                  opacity: 0.40;
                  background-image: -moz-linear-gradient(top, #aaa, #888); 
                  border-radius: 8px;
                </>,    
              },
              {
                tagName: "scrollbox",
                id: "tanasinn_app_popup_scrollbox",
                orient: "vertical",
                flex: 1,
                maxHeight: this.max_height,
                style: <>
                  margin: 9px;
                  overflow-y: auto;
                </>,
                childNodes: {
                  tagName: "grid",
                  id: "tanasinn_app_popup_container",
                },
              },
            ],
          },
        },
      ]);
    this.onmousedown.enabled = true;
    this.onmousemove.enabled = true;
    this.onmouseup.enabled = true;
    this._datum = tanasinn_app_popup_datum;
    this._popup = tanasinn_app_popup;
    this._scrollbox = tanasinn_app_popup_scrollbox;
    this._container = tanasinn_app_popup_container;
  },

  /** Uninstalls itself.
   *  @param {Session} session A session object.
   */
  "[subscribe('uninstall/popup_menu'), enabled]":
  function uninstall(session) 
  {
    this.onmousedown.enabled = false;
    this.onmousemove.enabled = false;
    this.onmouseup.enabled = false;
    this.onDisplay.enabled = false;
    this.onUndisplay.enabled = false;
    this.onZshCompletion.enabled = false;
    this._datum.parentNode.removeChild(this._datum);
    this._popup.parentNode.removeChild(this._popup);
    this._datum = null;
    this._popup = null;
  },

  "[listen('mousedown', '#tanasinn_app_popup', true)]":
  function onmousedown(event) 
  {
    let target = event.explicitOriginalTarget;
    if (!target) {
      return;
    }
    while ("row" != target.tagName) {
      target = target.parentNode;
    }
    let diff = - this._selected;
    while ((target = target.previousSibling)) {
      ++diff;
    }

    let session = this._broker;
    this.onDisplay.enabled = false;
    this._popup.hidePopup();
    session.notify("command/focus");

    let packed_code;
    if (diff < 0) {
      packed_code = coUtils.Keyboard.parseKeymapExpression("<C-p>");
    } else {
      packed_code = coUtils.Keyboard.parseKeymapExpression("<C-n>");
    }
    for (let i = 0; i < Math.abs(diff); ++i) {
      session.notify("command/input-with-no-remapping", packed_code);
    }
    packed_code = coUtils.Keyboard.parseKeymapExpression("<Escape>");
    session.notify("command/input-with-no-remapping", packed_code);
  },

  "[listen('mousemove', '#tanasinn_app_popup', true)]":
  function onmousemove(event) 
  {
    let target = event.explicitOriginalTarget;
    while ("row" != target.tagName) {
      target = target.parentNode;
    }
    if (this._mouseover) {
      this._mouseover.style.backgroundColor = ""; 
      this._mouseover.style.borderRadius = "5px";
    }
    this._mouseover = target;
    target.style.backgroundColor = "#ccc"; 
  },

  "[listen('mouseup', '#tanasinn_app_popup', true)]":
  function onmouseup(event) 
  {
    event.stopPropagation();
    event.preventDefault();
  },

  "[subscribe('sequence/osc/200')]":
  function onDisplay(data) 
  {
    while (this._container.firstChild) {
      this._container.removeChild(this._container.firstChild);
    }
    let lines = data.split("\n");
    let [row, column, selected] = lines.shift()
      .split(",")
      .map(function(str) Number(str));
    this._selected = selected;
    let cursor_state = this.dependency["cursorstate"];
    row = row || cursor_state.positionY + 1;
    let renderer = this.dependency["renderer"];
    let line_height = renderer.line_height;
    let char_width = renderer.char_width;
    let x = column * char_width - 10;
    let y = row * line_height;

    let colormap = [ "", "#cdffcf", "#cdd", "#dfffdd" ];
    let session = this._broker;
    let {} = session.uniget(
      "command/construct-chrome", 
      {
        parentNode: "#tanasinn_app_popup_container",
        tagName: "rows",
        style: <>
          -moz-user-focus: none;
          font-family: {renderer.font_family};
          font-size: {renderer.font_size}px;
          font-weight: bold;
          color: #ffefff;
          text-shadow: 1px 1px 3px black, 0px 0px 4px black;
        </>,
        childNodes: [
          {
            tagName: "row",
            style: <>
              padding: 0px 10px;
            </> + (index == selected && <>
              background-image: -moz-linear-gradient(top, #ddd, #eee); 
              -moz-box-shadow: 1px 1px 5px black;
              color: #ffefef;
              border-radius: 5px;
            </>),
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
                style: <>
                  padding: 0px 5px;
                  color: {colormap[index]};
                </>,
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
    session.notify("command/focus");
    if (-1 != selected) {
      let scrollbox = this._scrollbox;
      let rows = scrollbox.querySelector("rows");
      let box_object = scrollbox.boxObject
        .QueryInterface(Components.interfaces.nsIScrollBoxObject)
      if (box_object) {
        let row = rows.childNodes[selected];
        let scrollY = {};
        box_object.getPosition({}, scrollY);
        let first_position = row.boxObject.y 
          - scrollbox.boxObject.y;
        let last_position = first_position 
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

  "[subscribe('sequence/osc/201')]":
  function onUndisplay() 
  {
    this._is_showing = false;
    coUtils.Timer.setTimeout(function() {
      if (false === this._is_showing) {
        this._popup.hidePopup();
        let session = this._broker;
        session.notify("command/focus");
      }
    }, 30, this);
    this.onDisplay.enabled = true;
  },

  _selectRow: function _selectRow(row)
  {
    row.style.borderRadius = "6px";
    row.style.backgroundImage 
      = "-moz-linear-gradient(top, #777, #666)";
    row.style.color = "white";
    let completion_root = this._completion_root;
    let scroll_box = completion_root.parentNode;
    let box_object = scroll_box.boxObject
      .QueryInterface(Components.interfaces.nsIScrollBoxObject)
    if (box_object) {
      let scrollY = {};
      box_object.getPosition({}, scrollY);
      let first_position = row.boxObject.y 
        - scroll_box.boxObject.y;
      let last_position = first_position 
        - scroll_box.boxObject.height 
        + row.boxObject.height;
      if (first_position < scrollY.value) {
        box_object.scrollTo(0, first_position);
      } else if (last_position > scrollY.value) {
        box_object.scrollTo(0, last_position);
      }
    }
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


