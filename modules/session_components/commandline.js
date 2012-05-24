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
 * @class TextboxWidget
 *
 */
let TextboxWidget = new Class();
TextboxWidget.definition = {

  "[persistable, watchable] font_color": "white",
  "[persistable, watchable] font_size": 16,
  "[persistable, watchable] font_family": "Lucida Console,Latha,Georgia,monospace",
  "[persistable, watchable] default_text_shadow": "1px 1px 3px #555",
  "[persistable, watchable] font_weight": "bold",

  _dom: null,
  _start: 0,
  _end: 0,
  _mode: "command",

  initialize: function initialize(element, canvas)
  {
    this._main_buffer = "";
    this._completion_buffer = "";
    this._status_buffer = "";
    this._keystate_buffer = "";
    this._dom = {
      textbox: element,
      canvas: canvas,
      context: canvas.getContext("2d"),
    };
  },

  dispose: function dispose(broker) 
  {
    let dom = this._dom;
    if (dom.canvas) {
      dom.canvas.parentNode.removeChild(dom.canvas);
      dom.canvas = null;
    }
    if (dom.context) {
      dom.context = null;
    }
    if (dom.textbox) {
      dom.textbox.parentNode.removeChild(dom.textbox);
      dom.textbox = null;
    }
  }, // clear

  get mode()
  {
    this._mode;
  },

  set mode(mode_name)
  {
    this._mode = mode_name;
  },

  get keystate() 
  {
    return this._keystate_buffer;
  },

  set keystate(text) 
  {
    this._keystate_buffer = text || "";
    this._draw();
  },

  get status() 
  {
    return this._status_buffer;
  },

  set status(text) 
  {
    this.calculateSize();
    this._status_buffer = text || "";
    this._draw();
  },

  get value() 
  {
    return this._main_buffer;
  },

  set value(text) 
  {
    this._main_buffer = text;
    this._start = text.length;
    this._draw();
  },

  commit: function commit()
  {
    let dom = this._dom;
    this.value = this.value.substr(0, this.selectionStart) 
      + dom.textbox.value
      + this.value.substr(this.selectionEnd);
    dom.textbox.value = "";
  },

  _clear: function _clear()
  {
    let dom = this._dom;
    dom.context.clearRect(
      0, 0, 
      dom.canvas.width, dom.canvas.height);
  },

  _draw: function _draw()
  {
    this._clear();
    let dom = this._dom;
    dom.context.fillStyle = this.font_color;
    dom.context.font = this.font_size + "px " + this.font_family + " " + this.font_weight;
    let height = this._glyph_height;

    if ("command" == this._mode) {
      if (this._main_buffer) {
        dom.context.fillText(this._main_buffer, 0, height + 2);
      }
      dom.context.globalAlpha = 0.5;
      let left = dom.context.measureText(this._main_buffer).width;
      dom.context.fillText(
        this._completion_buffer.substr(this._main_buffer.length), left, height + 2);

      dom.context.globalAlpha = 0.5;

      let cursor_left = this._main_buffer.substr(0, this._start);
      left = dom.context.measureText(cursor_left).width;
      let font = dom.context.font;
      dom.context.font = "yellow";
      dom.context.fillRect(left, 0, 10, height);
      dom.context.font = font;

      dom.context.globalAlpha = 1.0;

    } else if ("status" == this._mode) {
      if (this._status_buffer) {
        dom.context.fillText(this._status_buffer, 0, height + 2);
      }
    }
    if (this._keystate_buffer) {
      let width = dom.context.measureText(this._keystate_buffer).width;
      dom.context.clearRect(dom.canvas.width - width, 0, width, height);
      dom.context.fillText(this._keystate_buffer, dom.canvas.width - width, height + 2);
    }

  },

  get selectionStart() 
  {
    return this._start;
  },

  set selectionStart(position) 
  {
    this._start = position;
    this._draw();
  },

  get selectionEnd() 
  {
    return this._start;
  },

  set selectionEnd(position) 
  {
    let dom = this._dom;
    this._end = position;
    dom.textbox.selectionEnd = position;
    this._draw();
  },

  get statusline()
  {
    return this._status_buffer;
  },

  set statusline(text)
  {
    this._statusline_buffer = text;
    this._draw();
  },

  get completion()
  {
    return this._completion_buffer;
  },

  set completion(text)
  {
    this._completion_buffer = text;
    this._draw();
  },

  blur: function blur() 
  {
    let dom = this._dom;
    dom.canvas.style.opacity = 0.7;
  },

  focus: function focus() 
  {
    let dom = this._dom;
    dom.textbox.focus();
  },

  getCaretPosition: function getCaretPosition()
  {
    let dom = this._dom;
    let text = this.value.substr(0, this.selectionStart);
    let position = dom.context.measureText(text).width;
    dom.textbox.style.fontFamily = this.font_family;
    dom.textbox.style.fontSize = (this.font_size - 2) + "px";
    dom.textbox.style.color = this.font_color;
    dom.textbox.parentNode.previousSibling.width = position;
    return position;
  },

  calculateSize: function calculateSize() 
  {
    let dom = this._dom;
    let fill_style = dom.context.fillStyle;
    let font = dom.context.font;
    let [width, height, top] = coUtils.Font
      .getAverageGlyphSize(this.font_size, this.font_family);
    dom.canvas.width = dom.canvas.parentNode.boxObject.width;
    this._glyph_height = height;
    dom.canvas.height = height + top;
    dom.context.fillStyle = fill_style;
    dom.context.font = font;
  },

  getInputField: function getInputField()
  {
    let dom = this._dom;
    return dom.textbox;
  },

};

/**
 * @trait CompletionView
 */
let CompletionView = new Trait();
CompletionView.definition = {

  _index: -1,

  get rowCount() 
  {
    if (!this._result) {
      return 0;
    }
    return this._result.data.length;
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
    row.style.backgroundImage = "-moz-linear-gradient(top, #777, #555)";
    row.style.color = "white";
    let completion_root = this._completion_root;
    let scroll_box = completion_root.parentNode;
    let box_object = scroll_box.boxObject
      .QueryInterface(Components.interfaces.nsIScrollBoxObject)
    if (box_object) {
      let scrollY = {};
      box_object.getPosition({}, scrollY);
      let first_position = row.boxObject.y - scroll_box.boxObject.y;
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
      let rows = this._completion_root.querySelector("rows")
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
  function enter(info)
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

}; // CompletionView

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
        <version>0.1</version>
        <description>{
          _("Provides commandline interafce.")
        }</description>
    </plugin>,

  "[persistable] enabled_when_startup": true,

  "[persistable] completion_delay": 180,
  "[persistable] completion_popup_opacity": 1.00,
  "[persistable] completion_popup_max_height": 300,

  get template()
  [
    {
      parentNode: "#tanasinn_commandline_area",
      tagName: "box",
      style: <>
        position: absolute;
      </>,
      childNodes: [
        {
          tagName: "box",
          id: "tanasinn_input_stem",
        },
        {
          tagName: "box",
          childNodes: {
            tagName: "html:input",
            id: "tanasinn_commandline",
            style: <> 
              margin-top: -4px;
              padding-top: 0px;
              opacity: 0.0;
              background: transparent;
            </>,
          },
        },
      ],
    },
    {
      parentNode: "#tanasinn_commandline_area",
      id: "tanasinn_commandline_canvas",
      tagName: "html:canvas",
      dir: "ltr",
      height: this.font_size,
      style: <>
        opacity: 0.7;
      </>,
    },
    {
      parentNode: "#tanasinn_chrome",
      tagName: "panel",
      id: "tanasinn_completion_popup",
      style: <> 
        -moz-appearance: none;
        -moz-user-focus: ignore;
        background: transparent;
        border: none;
        font: menu;
      </>,
      noautofocus: true,
      //noautohide: true, // commented out for linux.
      ignorekeys: true,
      childNodes: {
        tagName: "stack",
        maxHeight: this.completion_popup_max_height,
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
              overflow-y: auto;
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
              </>,
            }
          }, // tree
        ],
      }, // stack
    },  // panel
  ],

  _result: null,

  /** Installs itself. 
   *  @param {Broker} broker A Broker object.
   */
  "[install]":
  function install(broker) 
  {
    let {
      tanasinn_commandline_canvas, 
      tanasinn_commandline, 
      tanasinn_completion_popup, 
      tanasinn_completion_scroll, 
      tanasinn_completion_root,
    } = broker.uniget("command/construct-chrome", this.template);

    this._canvas = tanasinn_commandline_canvas;

    this._textbox = new TextboxWidget(tanasinn_commandline, this._canvas);
    this._popup = tanasinn_completion_popup;
    this._scroll = tanasinn_completion_scroll;
    this._completion_root = tanasinn_completion_root;

    this.show.enabled = true;
    this.fill.enabled = true;
    this.invalidate.enabled = true;
    this.onStatusMessage.enabled = true;
    this.onfocus.enabled = true;
    this.onblur.enabled = true;
    this.onkeydown.enabled = true;
    this.onkeypress.enabled = true;
    this.onpopupshowing.enabled = true;
    this.onpopupshown.enabled = true;
    this.onclick.enabled = true;
    this.onchange.enabled = true;
    this.enableCommandline.enabled = true;
//    this.onFirstFocus.enabled = true;
    this.setCompletionTrigger.enabled = true;
    this.onStyleChanged.enabled = true;
    this.onWidthChanged.enabled = true;
    this.doCompletion.enabled = true;

    this.onmousedown.enabled = true;
  },
  
  /** Uninstalls itself.
   *  @param {Broker} broker A Broker object.
   */
  "[uninstall]":
  function uninstall(broker) 
  {
    this.show.enabled = false;
    this.fill.enabled = false;
    this.invalidate.enabled = false;
    this.onStatusMessage.enabled = false;
    this.onfocus.enabled = false;
    this.onblur.enabled = false;
    this.onkeydown.enabled = false;
    this.onkeypress.enabled = false;
    this.onpopupshowing.enabled = false;
    this.onpopupshown.enabled = false;
    this.onclick.enabled = false;
    this.onchange.enabled = false;
    this.enableCommandline.enabled = false;
    this.setCompletionTrigger.enabled = false;
//    this.onFirstFocus.enabled = false;
    this.onStyleChanged.enabled = false;
    this.onWidthChanged.enabled = false;
    this.doCompletion.enabled = false;

    this.onmousedown.enabled = false;
    if (this._popup) {
      if (undefined !== this._popup.hidePopup) {
        this._popup.hidePopup();
      }
      while (this._popup.firstChild) {
        this._popup.removeChild(this._popup.firstChild);
      }
      this._popup.parentNode.removeChild(this._popup);
      this._popup = null;
    }
    if (null !== this._canvas) {
      this._canvas = null;
    }
    if (null !== this._textbox) {
      this._textbox.dispose();
      this._textbox = null;
    }
  },

  "[subscribe('variable-changed/commandline.{font_weight | font_size | default_text_shadow | font_family}')]":
  function onStyleChanged() 
  {
  },

  getCaretPosition: function getCaretPosition() 
  {
    this._textbox.getCaretPosition();
  },

  commit: function commit() 
  {
    this._textbox.commit();
  },

  getInputField: function getInputField() 
  {
    if (null === this._textbox) {
      return null;
    }
    return this._textbox.getInputField();
  },

  "[subscribe('event/screen-width-changed')]": 
  function onWidthChanged(width) 
  {
    this._canvas.width = width;
  },

  "[subscribe('command/report-status-message')]":
  function onStatusMessage(message) 
  {
    if (this._textbox) {
      this._textbox.mode = "status";
      coUtils.Timer.setTimeout(function() {
        this._textbox.status = message;
      }, 0, this);
    }
  },

  "[subscribe('command/enable-commandline')]":
  function enableCommandline() 
  {
    this._textbox.calculateSize();
    this._textbox.status = "";
    this._textbox.mode = "command";
    this._textbox.focus();
    this._textbox.focus();
    this._textbox.focus();

    let broker = this._broker;
    broker.notify("event/mode-changed", "commandline");
  },

  "[subscribe('event/input-state-changed'), enabled]":
  function onInputStateChanged(code)
  {
    this._textbox.keystate += coUtils.Keyboard.convertCodeToExpression(code);
  },

  "[subscribe('event/input-state-reset'), enabled]":
  function onInputStateReset(info)
  {
    this._textbox.keystate = "";
  },

  /** Shows commandline interface. 
   *  @param {Object} A shortcut information object.
   */
  "[nmap('<M-:>'), _('Show commandline interface.')]":
  function show(info)
  {
    this._textbox.hidden = false;
    this._textbox.mode = "command";

    this._textbox.focus();
    this._textbox.focus();
    this._textbox.focus();
    return true;
  },

  "[listen('focus', '#tanasinn_commandline', true)]":
  function onfocus(event) 
  {
    let session = this._broker;
    this._textbox.hidden = false;
    this._textbox.mode = "command";
    this.setCompletionTrigger();
  },

  "[listen('blur', '#tanasinn_commandline', true)]":
  function onblur(event) 
  {
    this._textbox.blur();
    if (this._timer) {
      this._timer.cancel();
      delete this._timer;
    }
    if (this._popup) {
      if (this._popup.hidePopup) {
        this._popup.hidePopup();
      }
    }
  },

  "[subscribe('event/answer-completion')]":
  function doCompletion(result) 
  {
    this._result = result;
    delete this._timer;
    let grid = this._completion_root;
    while (grid.firstChild) {
      grid.removeChild(grid.firstChild);
    }
    if (result) {
      let type = result.type || "text";
      let broker = this._broker;
      let driver = broker.uniget("get/completion-display-driver/" + type); 
      if (driver) {
        driver.drive(grid, result, this.currentIndex);
        this.invalidate(result);
      } else {
        coUtils.Debug.reportError(
          _("Unknown completion display driver type: '%s'."), 
          type);
      }
    } else {
      if (this._popup) {
        this._popup.style.opacity = 0;
      }
    }
  },

  "[subscribe('command/invalidate')]":
  function invalidate(result) 
  {
    let textbox = this._textbox;
    if (result.data.length > 0) {
      this._popup.style.opacity = this.completion_popup_opacity;
      if ("closed" == this._popup.state || "hiding" == this._popup.state) {
        let broker = this._broker;
        let document = broker.window.document;
        if (document) {
          this._popup.width = this._canvas.width;
          this._popup.openPopup(this._canvas, "after_start", 0, 0, true, true);
        }
      }
      let index = Math.max(0, this.currentIndex);
      let completion_text = result.data[index].name;
      if (0 == completion_text.indexOf(result.query)) {
        let settled_length = 
          this._stem_text.length - result.query.length;
        let settled_text = textbox.value.substr(0, settled_length);
        let text = settled_text + completion_text;
        this._textbox.completion = text;
      } else {
        this._textbox.completion = "";
      }
    } else {
      this._textbox.completion = "";
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
      let completion_text = result.data[index].name;
      let settled_length = 
        this._stem_text.length - result.query.length;
      let settled_text = textbox.value.substr(0, settled_length);

      textbox.value = settled_text + completion_text;
      let text = settled_text + completion_text;

      this._textbox.completion = "";
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
      let textbox = this._textbox;
      if (textbox) {
        let current_text = this._textbox.value;
        // if current text does not match completion text, hide it immediatly.
        if (!this._textbox.completion 
          || 0 != this._textbox.completion.indexOf(current_text)) {
          this._textbox.completion = "";
        }
        this._stem_text = current_text;
        this.select(-1);
        let broker = this._broker;
        broker.notify(
          "command/complete-commandline", 
          {
            source: current_text, 
          });
      }
    }, this.completion_delay, this);
  },

  "[listen('keydown', '#tanasinn_commandline', true)]":
  function onkeydown(event) 
  {
    event.stopPropagation();
    event.preventDefault();
  },

  "[subscribe('event/keypress-commandline-with-remapping'), enabled]":
  function onKeypressCommandlineWithMapping(code) 
  {
    let broker = this._broker;
    let result = broker.uniget(
      "event/commandline-input", 
      {
        textbox: this._textbox, 
        code: code,
      });
    if (!result) {
      let with_ctrl = code & 1 << coUtils.Keyboard.KEY_CTRL;
      let with_nochar = code & 1 << coUtils.Keyboard.KEY_NOCHAR;
      if (!with_nochar && !with_ctrl) {
        let textbox = this._textbox;
        let value = textbox.value;
        let start = textbox.selectionStart;
        let end = textbox.selectionEnd;
        let text = value.substr(0, textbox.selectionStart) 
          + String.fromCharCode(code & 0xfffff)
          + value.substr(textbox.selectionEnd);

        textbox.value = text;

        textbox.selectionStart = start + 1;
        textbox.selectionEnd = start + 1;
        this.setCompletionTrigger();
      }
    }
  },

  "[subscribe('event/keypress-commandline-with-no-remapping'), enabled]":
  function onKeypressCommandlineWithNoMapping(code) 
  {
    let with_ctrl = code & 1 << coUtils.Keyboard.KEY_CTRL;
    let with_nochar = code & 1 << coUtils.Keyboard.KEY_NOCHAR;
    if (!with_nochar && !with_ctrl) {
      let textbox = this._textbox;
      let value = textbox.value;
      let start = textbox.selectionStart;
      let end = textbox.selectionEnd;
      textbox.value 
        = value.substr(0, textbox.selectionStart) 
        + String.fromCharCode(code & 0xfffff)
        + value.substr(textbox.selectionEnd);
      textbox.selectionStart = start + 1;
      textbox.selectionEnd = start + 1;
      this.setCompletionTrigger();
    }
  },

  "[listen('contextmenu', '#tanasinn_commandline', true), enabled]":
  function oncontextmenu(event) 
  {
    event.preventDefault();
  },

  "[listen('keypress', '#tanasinn_commandline', true)]":
  function onkeypress(event) 
  {
    let code = coUtils.Keyboard.getPackedKeycodeFromEvent(event);
    let broker = this._broker;
    broker.notify("event/scan-keycode", {
      mode: "commandline", 
      code: code,
      event: event,
    });
  },

  "[listen('mousedown', '#tanasinn_completion_popup', true)]":
  function onmousedown(event) 
  {
    event.stopPropagation();
  },

  onsubmit: function onsubmit() 
  {
    let broker = this._broker;
    let command = this._textbox.value;

    this._textbox.value = "";
    this._textbox.completion = "";
    broker.notify("command/eval-commandline", command);
//    this._textbox.blur();
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

  "[listen('click', '#tanasinn_commandline_canvas', false)]":
  function onclick(event) 
  {
    let broker = this._broker;
    coUtils.Timer.setTimeout(function() {
      broker.notify("command/enable-commandline");
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
 * @param {Broker} broker The Broker object.
 */
function main(broker)
{
  new Commandline(broker);
}



