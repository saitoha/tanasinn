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
 * @class Commandline
 */
let Commandline = new Class().extends(Plugin);
Commandline.definition = {

  get id()
    "commandline",

  get info()
    <plugin>
        <name>{_("Commandline Interface")}</name>
        <description>{
          _("Provides commandline interafce.")
        }</description>
        <version>0.1</version>
    </plugin>,

  _result: null,
  "[persistable] completion_delay": 180,

  get rowCount() 
  {
    if (!this._result) {
      return 0;
    }
    return this._result.labels.length;
  },

  get currentIndex()
  {
    return this._index;
  },

  _index: -1,

  select: function select(index)
  {
    if (index < -1)
      index = -1;
    if (index > this.rowCount)
      index = this.rowCount - 1;

    let row;
    if (this._index > -1) {
      row = this._tree.querySelector("rows").childNodes[this._index];
      if (!row)
        return;
      row.style.background = "";
      row.style.color = "";
    }
    if (index > -1) {
      row = this._tree.querySelector("rows").childNodes[index];
      row.style.background = "#999";
      row.style.color = "white";
      try {
        let scroll_box = this._tree.parentNode;
        let box_object = scroll_box.boxObject
          .QueryInterface(Components.interfaces.nsIScrollBoxObject)
        if (box_object) {
          let scrollY = {};
          box_object.getPosition({}, scrollY);
          let first_position = row.boxObject.y - this._tree.boxObject.y;
          let last_position = first_position - scroll_box.boxObject.height + row.boxObject.height;
          if (first_position < scrollY.value) {
            box_object.scrollTo(0, first_position);
          } else if (last_position > scrollY.value) {
            box_object.scrollTo(0, last_position);
          }
        }
      } catch (e) { 
       alert(e)
      }
    }
    this._index = index;

  },

  /** post constructor. */
  "[subscribe('@event/session-started'), enabled]":
  function onLoad(session) 
  {
    this.enabled = this.enabled_when_startup;
    session.notify(<>initialized/{this.id}</>, this);
  },

  /** Installs itself. 
   *  @param {Session} session A Session object.
   */
  "[subscribe('install/ + this.id')]":
  function install(session) 
  {
    let {
      coterminal_commandline_box, 
      coterminal_commandline_completion, 
      coterminal_commandline, 
      coterminal_statusbar,
      coterminal_completion_popup, 
      coterminal_completion_scroll, 
      coterminal_completion_tree
    } = session.uniget(
      "command/construct-chrome", 
      {
        parentNode: "#coterminal_chrome",
        tagName: "stack",
        id: "coterminal_commandline_box",
        style: {
          //background: "#4c4c4c",
          //background: "transparent",
        },
        childNodes: [
          {
            id: "coterminal_commandline_background",
            tagName: "box",
            margin: 0,
            style: { 
              backgroundColor: "black", 
              opacity: 0.7, 
              borderBottomLeftRadius: "8px",
              borderBottomRightRadius: "8px",
            },
          },
          {
            tagName: "stack",
            style: {
              padding: "2px 8px 3px 8px", 
            },
            childNodes: [
              {
                id: "coterminal_commandline_completion",
                value: "",
                tagName: "textbox",
                className: "plain",
                style: { color: "#888", backgroundColor: "transparent", },
              },
              {
                tagName: "textbox",
                id: "coterminal_commandline",
                className: "plain",
                //placeholder: "input commands here.",
                newlines: "replacewithspaces",
                style: { color: "#fff", },
              },
              {
                tagName: "textbox",
                className: "plain",
                readonly: "true",
                id: "coterminal_statusbar",
                hidden: true,
                style: { color: "#fff", },
              },
              {
                tagName: "panel",
                //style: { MozAppearance: "none", },
                style: { MozUserFocus: "ignore", /*font: "menu",*/ },
                noautofocus: true,
                height: 200,
                id: "coterminal_completion_popup",
                childNodes: {
                  tagName: "scrollbox",
                  id: "coterminal_completion_scroll",
                  orient: "vertical", // box-packing
                  flex: 1,
                  style: { overflowY: "auto", },
                  childNodes: {
                    tagName: "grid",
                    id: "coterminal_completion_tree",
                  }
                }, // tree
              },  // panel
            ]
          } // stack
        ] 
      });
    this._element = coterminal_commandline_box;
    this._completion = coterminal_commandline_completion;
    this._textbox = coterminal_commandline;
    this._popup = coterminal_completion_popup;
    this._scroll = coterminal_completion_scroll;
    this._tree = coterminal_completion_tree;
    this._statusbar = coterminal_statusbar;
    this.show.enabled = true;
    this.onStatusMessage.enabled = true;
    this.onfocus.enabled = true;
    this.onblur.enabled = true;
    this.oninput.enabled = true;
    this.onkeyup.enabled = true;
    this.onkeypress.enabled = true;
    this.onpopupshowing.enabled = true;
    this.onpopupshown.enabled = true;
    this.onclick.enabled = true;
    this.onchange.enabled = true;
    this.onselect.enabled = true;
    this.enableCommandline.enabled = true;
  },
  
  /** Uninstalls itself.
   *  @param {Session} session A Session object.
   */
  "[subscribe('uninstall/ + this.id')]":
  function uninstall(session) 
  {
    this.show.enabled = false;
    this.onStatusMessage.enabled = false;
    this.onfocus.enabled = false;
    this.onblur.enabled = false;
    this.oninput.enabled = false;
    this.onkeyup.enabled = false;
    this.onkeypress.enabled = false;
    this.onpopupshowing.enabled = false;
    this.onpopupshown.enabled = false;
    this.onclick.enabled = false;
    this.onchange.enabled = false;
    this.onselect.enabled = false;
    this.enableCommandline.enabled = false;
    this._element.parentNode.removeChild(this._element);
  },

  "[subscribe('command/report-status-message')]":
  function onStatusMessage(message) 
  {
    this._statusbar.hidden = false;
    this._textbox.hidden = true;
    this._completion.hidden = true;
    this._statusbar.value = message;
  },

  "[subscribe('command/enable-commandline')]":
  function enableCommandline() 
  {
    this._statusbar.hidden = true;
    this._textbox.hidden = false;
    this._completion.hidden = false;
    this._textbox.focus();
    this._textbox.focus();
  },

  /** Shows commandline interface. 
   *  @param {Object} A shortcut information object.
   */
  "[key('meta + :', 'ctrl + shift + *'), _('Show commandline interface.')]":
  function show(info)
  {
    this._statusbar.hidden = true;
    this._textbox.hidden = false;
    this._completion.hidden = false;
    this._textbox.focus();
    this._textbox.focus();
  },

  "[listen('focus', '#coterminal_commandline', true)]":
  function onfocus(event) 
  {
    let session = this._broker;
    this._statusbar.hidden = true;
    this._textbox.hidden = false;
    this._completion.hidden = false;
    this._popup.width = this._textbox.boxObject.width;
    this.setCompletionTrigger();
  },

  "[listen('blur', '#coterminal_commandline', true)]":
  function onblur(event) 
  {
    this._popup.hidePopup();
    //let session = this._broker;
    //session.notify("command/focus");
  },


  doCompletion: function doCompletion(result) 
  {
    this._result = result;
    delete this._timer;
    let grid = this._tree;
    if (grid.firstChild) {
      grid.removeChild(grid.firstChild);
    }
    if (result) {
      let type = result.type || "text";
      let session = this._broker;
      let driver = session.uniget(<>get/completion-display-driver/{type}</>); 
      if (driver) {
        driver.drive(grid, result, this.currentIndex);
        this.invalidate(result);
      } else {
        coUtils.Debug.reportError(
          _("Unknown completion display driver type: '%s'."), 
          type);
      }
    }
  },

  invalidate: function invalidate(result) 
  {

  let textbox = this._textbox;
  if (textbox.boxObject.scrollLeft > 0) {
      this._completion.inputField.value = "";
    } else if (result.labels.length > 0) {
      if ("closed" == this._popup.state || "hiding" == this._popup.state) {
        let session = this._broker;
        let focused_element = session.document.commandDispatcher.focusedElement;
        if (focused_element && focused_element.isEqualNode(textbox.inputField)) {
          this._popup.openPopup(textbox, "after_start", 0, 0, true, true);
        }
      }
      let index = Math.max(0, this.currentIndex);
      let completion_text = result.labels[index];
      if (0 == completion_text.indexOf(result.query)) {
        let settled_length = 
          this._stem_text.length - result.query.length;
        let settled_text = textbox.value.substr(0, settled_length);
        this._completion.inputField.value 
          = settled_text + completion_text;
      } else {
        this._completion.inputField.value = "";
      }
    } else {
      this._completion.inputField.value = "";
      this._popup.hidePopup();
    }
  },

  fill: function fill()
  {
    let index = Math.max(0, this.currentIndex);
    let result = this._result;
    if (this._result) {
      let textbox = this._textbox;
      let completion_text = result.labels[index];
      let settled_length = 
        this._stem_text.length - result.query.length;
      let settled_text = textbox.value.substr(0, settled_length);
      textbox.inputField.value = settled_text + completion_text;
      this._completion.inputField.value = "";
    }
  },

  setCompletionTrigger: function setCompletionTrigger() 
  {
    if (this._timer) {
      this._timer.cancel();
      delete this._timer;
    }
    this._timer = coUtils.Timer.setTimeout(function() {
      delete this._timer;
      let current_text = this._textbox.value;
      // if current text does not match completion text, hide it immediatly.
      if (0 != this._completion.value.indexOf(current_text)) {
        this._completion.inputField.value = "";
      }
      this._stem_text = current_text;
      this.select(-1);
      let session = this._broker;
      session.notify(
        "command/complete", 
        {
          source: current_text, 
          listener: this,
        });
    }, this.completion_delay, this);
  },

  "[listen('input', '#coterminal_commandline', true)]":
  function oninput(event) 
  {
    this.setCompletionTrigger();
  },

  down: function down()
  {
    let index = Math.min(this.currentIndex + 1, this.rowCount - 1);
    try {
    if (index >= 0) {
      this.select(index);
    }
    //this.invalidate();
    this.fill();
    } catch (e) {
      alert(e + e.lineNumber);
    }
  },

  up: function up()
  {
    let index = Math.max(this.currentIndex - 1, -1);
    if (index >= 0) {
      this.select(index);
    }
    //this.invalidate();
    this.fill();
  },

  enter: function enter()
  {
    this.onselect();
    this._textbox.blur();
    let session = this._broker;
    session.notify("command/focus");
  },

  "[listen('keyup', '#coterminal_commandline', true)]":
  function onkeyup(event) 
  { // nothrow
    if (16 == event.keyCode &&
        16 == event.which &&
        !event.ctrlKey &&
        !event.altKey &&
        !event.shiftKey &&
        !event.isChar
        ) {
      let now = parseInt(new Date().getTime());
      if (now - this._last_ctrlkey_time < 500) {
        let session = this._broker;
        session.notify("command/focus")
        this._last_ctrlkey_time = 0;
      } else {
        this._last_ctrlkey_time = now;
      }
    }
  },

  "[listen('keypress', '#coterminal_commandline', true)]":
  function onkeypress(event) 
  {
    let code = event.keyCode || event.which;
    this._broker.notify(
      "command/report-overlay-message", 
      [event.keyCode,event.which,event.isChar].join("/"));
    let is_char = 0 == event.keyCode;

    if (event.ctrlKey) { // ^
      event.stopPropagation();
      event.preventDefault();
    }
    if ("p".charCodeAt(0) == code && event.ctrlKey) { // ^p
      this.up();
    }
    if ("n".charCodeAt(0) == code && event.ctrlKey) { // ^n
      this.down();
    }
    if ("j".charCodeAt(0) == code && event.ctrlKey) { // ^j
      this.enter()
    }
    if ("h".charCodeAt(0) == code && event.ctrlKey) { // ^h
      let value = this._textbox.value;
      let position = this._textbox.selectionEnd;
      if (position > 0) {
        this._textbox.inputField.value 
          = value.substr(0, position - 1) + value.substr(position);
      }
    }
    if ("w".charCodeAt(0) == code && event.ctrlKey) { // ^w
      let value = this._textbox.value;
      let position = this._textbox.selectionEnd;
      this._textbox.inputField.value
        = value.substr(0, position).replace(/\w+$|\W+$/, "") 
        + value.substr(position);
    }
    if ("f".charCodeAt(0) == code && event.ctrlKey) { // ^h
      this._textbox.selectionStart += 1;
    }
    if ("b".charCodeAt(0) == code && event.ctrlKey) { // ^h
      this._textbox.selectionEnd -= 1;
    }
    if (0x09 == code) { // tab
      event.stopPropagation();
      event.preventDefault();
    }
    if (0x09 == code && event.shiftKey) // shift + tab
      code = 0x26;
    if (0x09 == code && !event.shiftKey) // tab
      code = 0x28;
    if (0x26 == code && !is_char) { // up 
      this.up();
    } else if (0x28 == code && !is_char) { // down
      this.down();
    } else if (0x0d == code && !is_char) {
      this.enter();
    } 
    //this._completion.inputField.value = "";
  },

  "[listen('select', '#coterminal_commandline', true)]":
  function onselect(event) 
  {
    let session = this._broker;
    let command = this._textbox.value;
    this._textbox.inputField.value = "";
    this._completion.inputField.value = "";
    session.notify("command/eval-commandline", command);
  },

  "[listen('popupshown', '#coterminal_commandline', false)]":
  function onpopupshown(event) 
  {
    this._textbox.focus();
    this._textbox.focus();
  },

  "[listen('popupshowing', '#coterminal_commandline', true)]":
  function onpopupshowing(event) 
  {
  },

  "[listen('click', '#coterminal_commandline', true)]":
  function onclick(event) 
  {
    this.onfocus();
  },

  "[listen('change', '#coterminal_commandline', true)]":
  function onchange(event) 
  {
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
    function(session) 
    {
      new Commandline(session);
    });
}


