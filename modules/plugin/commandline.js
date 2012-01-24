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

let CompletionView = new Aspect();
CompletionView.definition = {

  _index: -1,

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

  _unselectRow: function _unselectRow(row)
  {
    row.style.borderRadius = "0px";
    row.style.background = "";
    row.style.color = "";
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

  select: function select(index)
  {
    // restrict range of index.
    if (index < -1) {
      index = -1;
    }
    if (index > this.rowCount) {
      index = this.rowCount - 1;
    }

    if (index != this.currentIndex) {
      let rows = this._completion_root
          .querySelector("rows")
      if (-1 != this.currentIndex) {
        let row = rows.childNodes[this.currentIndex];
        if (row) {
          this._unselectRow(row);
        }
      }
      if (-1 != index) {
        let row = rows.childNodes[index];
        if (row) {
          this._selectRow(row);
        }
      }
      this._index = index; // update index
    };
  },

  "[subscribe('command/select-current-candidate'), enabled]":
  function enter()
  {
    this.onsubmit();
  },

  "[subscribe('command/select-next-candidate'), enabled]":
  function down()
  {
    let index = Math.min(this.currentIndex + 1, this.rowCount - 1);
    if (index >= 0) {
      this.select(index);
    }
    let broker = this._broker;
    broker.notify("command/fill");
  },

  "[subscribe('command/select-previous-candidate'), enabled]":
  function up()
  {
    let index = Math.max(this.currentIndex - 1, -1);
    if (index >= 0) {
      this.select(index);
    }
    let broker = this._broker;
    broker.notify("command/fill");
  },

};


/**
 * @class Commandline
 *
 */
let Commandline = new Class().extends(Plugin)
                             .mix(CompletionView);
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

  "[persistable] completion_delay": 180,
  "[persistable] completion_popup_opacity": 1.00,
  "[persistable] completion_popup_max_height": 300,

  _result: null,

  /** post constructor. */
  "[subscribe('@event/broker-started'), enabled]":
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
      tanasinn_commandline_box, 
      tanasinn_commandline_completion, 
      tanasinn_commandline, 
      tanasinn_statusbar,
      tanasinn_completion_popup, 
      tanasinn_completion_scroll, 
      tanasinn_completion_root,
    } = session.uniget(
      "command/construct-chrome", 
      {
        parentNode: "#tanasinn_chrome",
        tagName: "stack",
        id: "tanasinn_commandline_box",
        style: <>
          font-size: 19px;
          font-family: 'Lucida Console',Latha,'Georgia',monospace;
          text-shadow: 1px 1px 3px #555;
          font-weight: bold;
        </>,
        childNodes: [
          {
            id: "tanasinn_commandline_completion",
            value: "",
            tagName: "textbox",
            className: "plain",
            style: <> 
              padding: 0px;
              margin: 0px;
              color: #888; 
              background-color: transparent;
            </>,
          },
          {
            tagName: "textbox",
            id: "tanasinn_commandline",
            className: "plain",
            //placeholder: "input commands here.",
            newlines: "replacewithspaces",
            style: <> 
              padding: 0px;
              margin: 0px;
              color: #eee;
              text-shadow: 0px 1px 4px #484;
            </>,
          },
          {
            tagName: "textbox",
            id: "tanasinn_statusbar",
            className: "plain",
            style: <> 
              padding: 0px;
              margin: 0px;
              color: #ccc;
              text-shadow: 0px 1px 4px #444;
            </>,
            hidden: true,
          },
          {
            tagName: "panel",
            id: "tanasinn_completion_popup",
            style: <> 
              -moz-appearance: none;
              -moz-user-focus: ignore;
              background: transparent;
              margin: 0px;
              border: none;
              //-moz-box-shadow: 3px 3px 8px black;
              //border-radius: 7px;
              font: menu;
              
            </>,
            noautofocus: true,
            childNodes: {
              tagName: "stack",
              maxHeight: this.completion_popup_max_height,
//              flex: 1,
              style: <>
              </>,
              childNodes: [
                {
                  tagName: "box",
                  flex: 1,
                  style: <>
                    border-radius: 7px;
                    background: -moz-linear-gradient(top, #bbb, #888);
                    opacity: 0.8;
                  </>,
                },
                {
                  tagName: "scrollbox",
                  id: "tanasinn_completion_scroll",
                  orient: "vertical", // box-packing
                  flex: 1,
                  style: <>
                    margin: 8px;
                      //overflow-x: auto; 
                      overflow-y: auto;
                     // background: transparent;
                    </>,
                  childNodes: {
                    tagName: "grid",
                    id: "tanasinn_completion_root",
                    style: <> 
                      background: transparent;
                      color: white;
                      font-family: 'Lucida Console';
                      font-weight: bold;
                      font-size: 16px;
                      text-shadow: 1px 2px 4px black;
                      //overflow-x: auto; 
                      //overflow-y: auto;
                    </>,
                  }
                }, // tree
              ],
            }, // stack
          },  // panel
        ] 
      });
    this._element = tanasinn_commandline_box;
    this._completion = tanasinn_commandline_completion;
    this._textbox = tanasinn_commandline;
    this._popup = tanasinn_completion_popup;
    this._scroll = tanasinn_completion_scroll;
    this._completion_root = tanasinn_completion_root;
    this._statusbar = tanasinn_statusbar;
    this.show.enabled = true;
    this.fill.enabled = true;
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
    this.enableCommandline.enabled = true;
    this.setCompletionTrigger.enabled = true;
  },
  
  /** Uninstalls itself.
   *  @param {Session} session A Session object.
   */
  "[subscribe('uninstall/ + this.id')]":
  function uninstall(session) 
  {
    this.show.enabled = false;
    this.fill.enabled = false;
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
    this.enableCommandline.enabled = false;
    this.setCompletionTrigger.enabled = false;
    this._element.parentNode.removeChild(this._element);
  },

  "[subscribe('command/report-status-message')]":
  function onStatusMessage(message) 
  {
    this._statusbar.hidden = false;
    this._textbox.hidden = true;
    this._completion.hidden = true;
    coUtils.Timer.setTimeout(function() {
      this._statusbar.inputField.value = message;
    }, 0, this);
  },

  "[subscribe('command/enable-commandline')]":
  function enableCommandline() 
  {
    this._statusbar.inputField.value = "";
    this._statusbar.hidden = true;
    this._textbox.hidden = false;
    this._completion.hidden = false;
    this._textbox.focus();
    this._textbox.focus();
    this._textbox.focus();
  },

  /** Shows commandline interface. 
   *  @param {Object} A shortcut information object.
   */
  "[nmap('<M-:>'), _('Show commandline interface.')]":
  function show(info)
  {
    this._statusbar.hidden = true;
    this._textbox.hidden = false;
    this._completion.hidden = false;
    this._textbox.focus();
    this._textbox.focus();
    this._textbox.focus();
    return true;
  },

  "[listen('focus', '#tanasinn_commandline', true)]":
  function onfocus(event) 
  {
    let session = this._broker;
    this._statusbar.hidden = true;
    this._textbox.hidden = false;
    this._completion.hidden = false;
    this._completion_root.parentNode.width = this._textbox.boxObject.width;
    this.setCompletionTrigger();
  },

  "[listen('blur', '#tanasinn_commandline', true)]":
  function onblur(event) 
  {
    this._popup.hidePopup();
  },

  doCompletion: function doCompletion(result) 
  {
    this._result = result;
    delete this._timer;
    let grid = this._completion_root;
    while (grid.firstChild) {
      grid.removeChild(grid.firstChild);
    }
    if (result) {
      let type = result.type || "text";
      let session = this._broker;
      let driver = session
        .uniget(<>get/completion-display-driver/{type}</>); 
      if (driver) {
        driver.drive(grid, result, this.currentIndex);
        this.invalidate(result);
      } else {
        coUtils.Debug.reportError(
          _("Unknown completion display driver type: '%s'."), 
          type);
      }
    } else {
      this._popup.style.opacity = 0;
    }
  },

  invalidate: function invalidate(result) 
  {

    let textbox = this._textbox;
    if (textbox.boxObject.scrollLeft > 0) {
      this._completion.inputField.value = "";
    } else if (result.labels.length > 0) {
      this._popup.style.opacity = this.completion_popup_opacity;
      if ("closed" == this._popup.state || "hiding" == this._popup.state) {
        let session = this._broker;
        let focused_element = session.document.commandDispatcher.focusedElement;
        if (focused_element && focused_element.isEqualNode(textbox.inputField)) {
          this._popup.openPopup(this._element, "after_start", 0, 0, true, true);
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

  "[subscribe('command/fill')]":
  function fill()
  {
    let index = Math.max(0, this.currentIndex);
    let result = this._result;
    if (result) {
      let textbox = this._textbox;
      let completion_text = result.labels[index];
      let settled_length = 
        this._stem_text.length - result.query.length;
      let settled_text = textbox.value.substr(0, settled_length);
      textbox.inputField.value = settled_text + completion_text;
      this._completion.inputField.value = "";
    }
  },

  "[subscribe('command/set-completion-trigger')]":
  function setCompletionTrigger() 
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
        if (this._completion.inputField) {
          this._completion.inputField.value = "";
        }
      }
      this._stem_text = current_text;
      this.select(-1);
      let session = this._broker;
      session.notify(
        "command/complete-commandline", 
        {
          source: current_text, 
          listener: this,
        });
    }, this.completion_delay, this);
  },

  "[listen('input', '#tanasinn_commandline', true)]":
  function oninput(event) 
  {
    this.setCompletionTrigger();
  },

  "[listen('keyup', '#tanasinn_commandline', true)]":
  function onkeyup(event) 
  { // nothrow
    if (16 == event.keyCode && 16 == event.which &&
        !event.ctrlKey && !event.altKey && !event.isChar) {
      let now = parseInt(new Date().getTime());
      let diff = now - this._last_ctrlkey_time;
      if (30 < diff && diff < 400) {
        let session = this._broker;
        session.notify("command/focus")
        this._last_ctrlkey_time = 0;
      } else {
        this._last_ctrlkey_time = now;
      }
    }
  },

  "[listen('keypress', '#tanasinn_commandline', true)]":
  function onkeypress(event) 
  {
    /*
    this._broker.notify(
      "command/report-overlay-message", 
      [event.keyCode,event.which,event.isChar].join("/"));
      */
    let key_code = coUtils.Keyboard.getPackedKeycodeFromEvent(event);
    let session = this._broker;
    let result = session.uniget(
      <>event/commandline-input</>, 
      {
        textbox: this._textbox, 
        code: key_code,
      });
    if (result) {
      event.stopPropagation();
      event.preventDefault();
    }
  },

  onsubmit: function onsubmit() 
  {
    let session = this._broker;
    let command = this._textbox.value;
    this._textbox.inputField.value = "";
    this._completion.inputField.value = "";
    session.notify("command/eval-commandline", command);
    this._textbox.blur();
    let broker = this._broker;
    broker.notify("command/focus");
  },

  "[listen('popupshown', '#tanasinn_commandline', false)]":
  function onpopupshown(event) 
  {
    this._textbox.focus();
    this._textbox.focus();
  },

  "[listen('popupshowing', '#tanasinn_commandline', false)]":
  function onpopupshowing(event) 
  {
  },

  "[listen('click', '#tanasinn_commandline_box', false)]":
  function onclick(event) 
  {
    let session = this._broker;
    //session.notify("command/blur");
    coUtils.Timer.setTimeout(function() {
      session.notify("command/enable-commandline");
    }, 0);
  },

  "[listen('change', '#tanasinn_commandline', true)]":
  function onchange(event) 
  {
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
    "@initialized/broker", 
    function(session) 
    {
      new Commandline(session);
    });
}



