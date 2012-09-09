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
 * @class TextboxElement
 *
 */

/**
 * @class TextboxWidget
 *
 */
var TextboxWidget = new Class();
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
    var dom = this._dom;

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
    var dom = this._dom;

    this.value = this.value.substr(0, this.selectionStart) 
      + dom.textbox.value
      + this.value.substr(this.selectionEnd);
    dom.textbox.value = "";
  },

  _clear: function _clear()
  {
    var dom = this._dom;

    dom.context.clearRect(
      0, 0, 
      dom.canvas.width,
      dom.canvas.height);
  },

  _draw: function _draw()
  {
    var dom = this._dom,
        height = this._glyph_height,
        left,
        cursor_left,
        font,
        width;

    this._clear();

    dom.context.fillStyle = this.font_color;
    dom.context.font = this.font_size + "px " + this.font_family + " " + this.font_weight;

    height = this._glyph_height;

    if ("command" === this._mode) {
      if (this._main_buffer) {
        dom.context.fillText(this._main_buffer, 0, height + 2);
      }
      dom.context.globalAlpha = 0.5;

      left = dom.context.measureText(this._main_buffer).width;
      dom.context.fillText(
        this._completion_buffer.substr(this._main_buffer.length), left, height + 2);

      dom.context.globalAlpha = 0.5;

      cursor_left = this._main_buffer.substr(0, this._start);
      left = dom.context.measureText(cursor_left).width;

      font = dom.context.font;
      dom.context.font = "yellow";
      dom.context.fillRect(left, 0, 10, height);
      dom.context.font = font;

      dom.context.globalAlpha = 1.0;

    } else if ("status" === this._mode) {
      if (this._status_buffer) {
        dom.context.fillText(this._status_buffer, 0, height + 2);
      }
    }
    if (this._keystate_buffer) {
      width = dom.context.measureText(this._keystate_buffer).width;
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
    var dom = this._dom;

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
    var dom = this._dom;
    dom.canvas.style.opacity = 0.5;
  },

  focus: function focus() 
  {
    var dom = this._dom;
    dom.canvas.style.opacity = 0.7;
    dom.textbox.focus();
  },

  getCaretPosition: function getCaretPosition()
  {
    var dom = this._dom,
        text = this.value.substr(0, this.selectionStart),
        position = dom.context.measureText(text).width;

    dom.textbox.style.fontFamily = this.font_family;
    dom.textbox.style.fontSize = (this.font_size - 2) + "px";
    dom.textbox.style.color = this.font_color;
    dom.textbox.parentNode.previousSibling.width = position;

    return position;
  },

  calculateSize: function calculateSize() 
  {
    var dom = this._dom,
        fill_style = dom.context.fillStyle,
        font = dom.context.font,
        glyphinfo = coUtils.Font
          .getAverageGlyphSize(this.font_size, this.font_family);
        width = glyphinfo[0],
        height = glyphinfo[1],
        top = glyphinfo[2];

    dom.canvas.width = dom.canvas.parentNode.boxObject.width;
    this._glyph_height = height;

    dom.textbox.height = height + top;
    dom.canvas.height = this.font_size;
    dom.canvas.parentNode.height = dom.canvas.height;
    dom.context.fillStyle = fill_style;
    dom.context.font = font;
  },

  getInputField: function getInputField()
  {
    var dom = this._dom;
    return dom.textbox;
  },

};

/**
 * @trait CompletionView
 */
var CompletionView = new Trait();
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
    var completion_root = this._completion_root,
        scroll_box = completion_root.parentNode,
        box_object = scroll_box.boxObject
          .QueryInterface(Components.interfaces.nsIScrollBoxObject),
        scrollY,
        first_position,
        last_position;

    row.style.borderRadius = "6px";
    row.style.backgroundImage = "-moz-linear-gradient(top, #777, #555)";
    row.style.color = "white";

    if (box_object) {
      scrollY = {};
      box_object.getPosition({}, scrollY);

      first_position = row.boxObject.y - scroll_box.boxObject.y;
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

  select: function select(index)
  {
    var rows,
        row;

    // restrict range of index.
    if (index < -1) {
      index = -1;
    }
    if (index > this.rowCount) {
      index = this.rowCount - 1;
    }

    if (index !== this.currentIndex) {

      rows = this._completion_root.querySelector("rows")
      if (-1 !== this.currentIndex) {
        row = rows.childNodes[this.currentIndex];
        if (row) {
          this._unselectRow(row);
        }
      }

      if (-1 !== index) {
        row = rows.childNodes[index];
        if (row) {
          this._selectRow(row);
        }
      }
      this._index = index; // update index
    };
  },

  "[subscribe('command/select-current-candidate'), pnp]":
  function enter(info)
  {
    this.onsubmit();
  },

  "[subscribe('command/select-next-candidate'), pnp]":
  function down()
  {
    var index = Math.min(this.currentIndex + 1, this.rowCount - 1);

    if (index >= 0) {
      this.select(index);
    }
    this.sendMessage("command/fill");
  },

  "[subscribe('command/select-previous-candidate'), pnp]":
  function up()
  {
    var index = Math.max(this.currentIndex - 1, -1);

    if (index >= 0) {
      this.select(index);
    }
    this.sendMessage("command/fill");
  },

}; // CompletionView

/**
 * @class Commandline
 *
 */
var Commandline = new Class().extends(Plugin)
                             .mix(CompletionView);
Commandline.definition = {

  get id()
    "commandline",

  get info()
  {
    return {
      name: _("Commandline Interface"),
      version: "0.1",
      description: _("Provides commandline interafce.")
    };
  },

  "[persistable] enabled_when_startup": true,

  "[persistable] completion_delay": 180,
  "[persistable] completion_popup_opacity": 0.70,
  "[persistable] completion_popup_max_height": 300,
  "[persistable] completion_popup_background": "-moz-linear-gradient(top, #bbb, #777)",
  "[persistable] completion_popup_background_opacity": 0.8,

  get template()
  [
    {
      parentNode: "#tanasinn_commandline_area",
      tagName: "html:div",
      style: "position: absolute;",
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
            style: {
              marginTop: "-4px",
              paddingTop: "0px",
              opacity: "0.0",
              background: "transparent",
            },
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
      style: "opacity: 0.7; position: absolute",
    },
    {
      parentNode: "#tanasinn_chrome",
      tagName: "panel",
      id: "tanasinn_completion_popup",
      style: { 
        MozUserFocus: "ignore",
        background: "transparent",
        border: "none",
        font: "menu",
      },
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
            style: this.completion_style,
          },
          {
            tagName: "scrollbox",
            id: "tanasinn_completion_scroll",
            orient: "vertical", // box-packing
            flex: 1,
            style: "margin: 8px; overflow-y: auto;",
            childNodes: {
              tagName: "grid",
              id: "tanasinn_completion_root",
              style: { 
                background: "transparent",
                color: "white",
                fontFamily: "Lucida Console",
                fontWeight: "bold",
                fontSize: "16px",
                textShadow: "1px 2px 4px black",
              },
            }
          }, // tree
        ],
      }, // stack
    },  // panel
  ],

  get completion_style()
  {
    return {
      borderRadius: "7px",
      background: this.completion_popup_background,
      opacity: this.completion_popup_background_opacity,
    };
  },

  _result: null,

  /** Installs itself. 
   *  @param {Broker} broker A Broker object.
   */
  "[install]":
  function install(broker) 
  {
    var {
      tanasinn_commandline_canvas, 
      tanasinn_commandline, 
      tanasinn_completion_popup, 
      tanasinn_completion_scroll, 
      tanasinn_completion_root,
    } = this.request("command/construct-chrome", this.template);

    this._canvas = tanasinn_commandline_canvas;

    this._textbox = new TextboxWidget(tanasinn_commandline, this._canvas);
    this._popup = tanasinn_completion_popup;
    this._scroll = tanasinn_completion_scroll;
    this._completion_root = tanasinn_completion_root;
  },
  
  /** Uninstalls itself.
   *  @param {Broker} broker A Broker object.
   */
  "[uninstall]":
  function uninstall(broker) 
  {
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

  "[subscribe('event/screen-width-changed'), pnp]": 
  function onWidthChanged(width) 
  {
    this._canvas.width = width;
  },

  "[subscribe('command/report-status-message'), pnp]":
  function onStatusMessage(message) 
  {
    if (this._textbox) {
      this._textbox.mode = "status";
      coUtils.Timer.setTimeout(
        function()
        {
          this._textbox.status = message;
        }, 0, this);
    }
  },

  "[subscribe('command/enable-commandline'), pnp]":
  function enableCommandline() 
  {
    this._textbox.calculateSize();
    this._textbox.status = "";
    this._textbox.mode = "command";
    this._textbox.focus();
    this._textbox.focus();
    this._textbox.focus();

    this.sendMessage("event/mode-changed", "commandline");
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
  "[nmap('<M-:>'), _('Show commandline interface.'), pnp]":
  function show(info)
  {
    this._textbox.hidden = false;
    this._textbox.mode = "command";

    this._textbox.focus();
    this._textbox.focus();
    this._textbox.focus();
    return true;
  },

  "[listen('focus', '#tanasinn_commandline', true), pnp]":
  function onfocus(event) 
  {
    this._textbox.hidden = false;
    this._textbox.mode = "command";
    this.setCompletionTrigger();
  },

  "[listen('blur', '#tanasinn_commandline', true), pnp]":
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

  "[subscribe('event/answer-completion'), pnp]":
  function doCompletion(result) 
  {
    var grid = this._completion_root,
        type,
        driver;

    this._result = result;
    delete this._timer;

    // remove all popup contents
    while (grid.firstChild) {
      grid.removeChild(grid.firstChild);
    }

    if (result) {
      type = result.type || "text";
      driver = this.request("get/completion-display-driver/" + type); 

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

  "[subscribe('command/invalidate'), pnp]":
  function invalidate(result) 
  {
    var textbox = this._textbox,
        textbox,
        index,
        completion_text,
        settled_length,
        settled_text,
        text;

    if (result.data.length > 0) {
      this._popup.style.opacity = this.completion_popup_opacity;
      if ("closed" === this._popup.state || "hiding" === this._popup.state) {
        if (this.request("get/root-element").ownerDocument) {
          this._popup.width = this._canvas.width;
          this._popup.openPopup(this._canvas, "after_start", 0, 0, true, true);
        }
      }

      index = Math.max(0, this.currentIndex);
      completion_text = result.data[index].name;
      
      if (0 === completion_text.indexOf(result.query)) {
        settled_length = this._stem_text.length - result.query.length;
        settled_text = textbox.value.substr(0, settled_length);
        text = settled_text + completion_text;
        this._textbox.completion = text;
      } else {
        this._textbox.completion = "";
      }
    } else {
      this._textbox.completion = "";
      this._popup.hidePopup();
    }
  },

  "[subscribe('command/fill'), pnp]":
  function fill()
  {
    var index,
        result,
        textbox,
        completion_text,
        settled_length,
        settled_text,
        text;

    index = Math.max(0, this.currentIndex);
    result = this._result;

    if (result) {
      textbox = this._textbox;
      completion_text = result.data[index].name;
      settled_length = this._stem_text.length - result.query.length;
      settled_text = textbox.value.substr(0, settled_length);

      textbox.value = settled_text + completion_text;
      text = settled_text + completion_text;

      this._textbox.completion = "";
    }
  },

  "[subscribe('command/set-completion-trigger'), pnp]":
  function setCompletionTrigger() 
  {
    if (this._timer) {
      this._timer.cancel();
      delete this._timer;
    }

    this._timer = coUtils.Timer.setTimeout(
      function timerProc()
      {
        var textbox = this._textbox,
            current_text;

        delete this._timer;

        if (textbox) {
          current_text = textbox.value;
          // if current text does not match completion text, hide it immediatly.
          if (!textbox.completion 
            || 0 != textbox.completion.indexOf(current_text)) {
            textbox.completion = "";
          }
          this._stem_text = current_text;
          this.select(-1);

          this.sendMessage(
            "command/complete-commandline", 
            {
              source: current_text, 
            });
        }
      }, this.completion_delay, this);
  },

  "[listen('keydown', '#tanasinn_commandline', true), pnp]":
  function onkeydown(event) 
  {
    event.stopPropagation();
    event.preventDefault();
  },

  "[subscribe('event/keypress-commandline-with-remapping'), enabled]":
  function onKeypressCommandlineWithMapping(code) 
  {
    var result,
        with_ctrl,
        with_nochar,
        textbox,
        value,
        start,
        end,
        text;

    result = this.request(
      "event/commandline-input", 
      {
        textbox: this._textbox, 
        code: code,
      });

    if (!result) {

      with_ctrl = code & 1 << coUtils.Constant.KEY_CTRL;
      with_nochar = code & 1 << coUtils.Constant.KEY_NOCHAR;

      if (!with_nochar && !with_ctrl) {
        textbox = this._textbox;
        value = textbox.value;
        start = textbox.selectionStart;
        end = textbox.selectionEnd;
        text = value.substr(0, textbox.selectionStart) 
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
    var with_ctrl = code & 1 << coUtils.Constant.KEY_CTRL,
        with_nochar = code & 1 << coUtils.Constant.KEY_NOCHAR,
        textbox,
        value,
        start,
        end;

    if (!with_nochar && !with_ctrl) {
      textbox = this._textbox;
      value = textbox.value;
      start = textbox.selectionStart;
      end = textbox.selectionEnd;

      textbox.value 
        = value.substr(0, textbox.selectionStart) 
        + String.fromCharCode(code & 0xfffff)
        + value.substr(textbox.selectionEnd);

      textbox.selectionStart = start + 1;
      textbox.selectionEnd = start + 1;
      this.setCompletionTrigger();
    }
  },

  "[listen('contextmenu', '#tanasinn_commandline', true), pnp]":
  function oncontextmenu(event) 
  {
    event.preventDefault();
  },

  "[listen('keypress', '#tanasinn_commandline', true), pnp]":
  function onkeypress(event) 
  {
    var code = coUtils.Keyboard.getPackedKeycodeFromEvent(event);

    this.sendMessage("event/scan-keycode", {
      mode: "commandline", 
      code: code,
      event: event,
    });
  },

  "[listen('mousedown', '#tanasinn_completion_popup', true), pnp]":
  function onmousedown(event) 
  {
    event.stopPropagation();
  },

  onsubmit: function onsubmit() 
  {
    var command = this._textbox.value;

    // hide completion popup
    if (this._popup) {
      if (this._popup.hidePopup) {
        this._popup.hidePopup();
      }
    }

    // clear textbox
    this._textbox.value = "";
    this._textbox.completion = "";

    this.sendMessage("command/eval-commandline", command);
    
    this.sendMessage("command/focus");
  },

  "[listen('popupshown', '#tanasinn_commandline', false), pnp]":
  function onpopupshown(event) 
  {
    this._textbox.focus();
    this._textbox.focus();
  },

  "[listen('click', '#tanasinn_commandline_canvas', false), pnp]":
  function onclick(event) 
  {
    coUtils.Timer.setTimeout(
      function timerProc() 
      {
        this.sendMessage("command/enable-commandline");
      }, 0, this);
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

// EOF
