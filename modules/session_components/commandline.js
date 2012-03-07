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

  _element: null,
  _canvas: null,
  _cantext: null,
  _start: 0,
  _end: 0,
  _mode: "command",

  initialize: function initialize(element, canvas)
  {
    this._main_buffer = "";
    this._completion_buffer = "";
    this._status_buffer = "";
    this._keystate_buffer = "";
    this._element = element;
    this._canvas = canvas;
    this._context = canvas.getContext("2d");
  },

  "[subscribe('install/textbox_widget'), enabled]":
  function install(broker) 
  {
  },

  "[subscribe('uninstall/textbox_widget'), enabled]":
  function uninstall(broker) 
  {
    if (this._canvas) {
      this._canvas.parentNode.removeChild(this._canvas);
      this._canvas = null;
    }
    if (this._element) {
      this._element.parentNode.removeChild(this._element);
      this._element = null;
    }
  },

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
    this.value = this.value.substr(0, this.selectionStart) 
      + this._element.value
      + this.value.substr(this.selectionEnd);
    this._element.value = "";
  },

  _clear: function _clear()
  {
    this._context.clearRect(
      0, 0, 
      this._canvas.width, this._canvas.height);
  },

  _draw: function _draw()
  {
    this._clear();

    this._context.fillStyle = this.font_color;
    this._context.font = this.font_size + "px " + this.font_family + " " + this.font_weight;
    let height = this._glyph_height;
    if ("command" == this._mode) {
      if (this._main_buffer) {
        this._context.fillText(this._main_buffer, 0, height);
      }
      this._context.globalAlpha = 0.5;
      let left = this._context.measureText(this._main_buffer).width;
      this._context.fillText(
        this._completion_buffer.substr(this._main_buffer.length), left, height);

      this._context.globalAlpha = 0.5;

      let cursor_left = this._main_buffer.substr(0, this._start);
      left = this._context.measureText(cursor_left).width;
      let font = this._context.font;
      this._context.font = "yellow";
      this._context.fillRect(left, 0, 10, height);
      this._context.font = font;

      this._context.globalAlpha = 1.0;

    } else if ("status" == this._mode) {
      if (this._status_buffer) {
        this._context.fillText(this._status_buffer, 0, height);
      }
    }
    if (this._keystate_buffer) {
      let width = this._context.measureText(this._keystate_buffer).width;
      this._context.clearRect(this._canvas.width - width, 0, width, height);
      this._context.fillText(this._keystate_buffer, this._canvas.width - width, height);
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
    this._end = position;
    this._element.selectionEnd = position;
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

  blur: function() 
  {
    this._canvas.style.opacity = 0.7;
  },

  focus: function() 
  {
    this._element.focus();
  },

  getCaretPosition: function getCaretPosition()
  {
    let text = this.value.substr(0, this.selectionStart);
    let position = this._context.measureText(text).width;
    this._element.style.fontFamily = this.font_family;
    this._element.style.fontSize = (this.font_size - 2) + "px";
    this._element.style.color = this.font_color;
    this._element.parentNode.previousSibling.width = position;
    return position;
  },

  calculateSize: function() 
  {
    let fill_style = this._context.fillStyle;
    let font = this._context.font;
    let [width, height, top] = coUtils.Font
      .getAverageGryphWidth(this.font_size, this.font_family);
    this._canvas.width = this._canvas.parentNode.boxObject.width;
    this._glyph_height = height;
    this._canvas.height = height + top;
    this._context.fillStyle = fill_style;
    this._context.font = font;
  },

  getInputField: function getInputField()
  {
    return this._element;
  },

};

/**
 * @class CommandlineHistory
 *
 */
let CommandlineHistory = new Class().extends(Plugin);
CommandlineHistory.definition = {

  get id()
    "commandline_history",

  get info()
    <plugin>
        <name>{_("Commandline History")}</name>
        <version>0.1</version>
        <description>{
          _("Provides commandline history database.")
        }</description>
    </plugin>,

  _history: null,
  _history_index: 0,
  history_file_path: "$Home/.tanasinn/history/commandline.txt",

  /** Installs itself. 
   *  @param {Session} session A Session object.
   */
  "[subscribe('install/commandline_history'), enabled]":
  function install(session) 
  {
    this.clearHistory.enabled = true;
    this.nextHistory.enabled = true;
    this.previousHistory.enabled = true;
    this.onCommand.enabled = true;
    this.loadHistory();
  },

  /** Uninstalls itself. 
   *  @param {Session} session A Session object.
   */
  "[subscribe('uninstall/commandline_history'), enabled]":
  function uninstall(session) 
  {
    this.clearHistory.enabled = false;
    this.nextHistory.enabled = false;
    this.previousHistory.enabled = false;
    this.onCommand.enabled = false;

    this._converter.flush();
    this._converter.close();
    this._converter = null;
    this._file = null;
    coUtils.Debug.reportMessage(
      _("Resources in CommandlineHistory have been cleared."));
  },

  /**
   *
   */
  loadHistory: function loadHistory() 
  {
    // create nsIFile object.
    let path = coUtils.File
      .getFileLeafFromVirtualPath(this.history_file_path)
      .path;
    let file = Components
      .classes["@mozilla.org/file/local;1"]
      .createInstance(Components.interfaces.nsILocalFile);
    file.initWithPath(path);
    this._file = file;
    if (file.exists() && file.isReadable) {
      let content = coUtils.IO.readFromFile(path, "UTF-8");
      this._history = content.split(/[\r\n]+/)
        .reduce(function(prev, current) {
          prev[current] = true;
          return prev;
        }, {});
    } else {
      this._history = {};
    }

    // check if target log file exists.
    if (file.exists()) {
      // check if target is file node.
      if (!file.isFile) {
        throw coUtils.Debug.Exception(
          _("Specified file '%s' is not a file node."), path);
      }
      // check if target is writable.
      if (!file.isWritable) {
        throw coUtils.Debug.Exception(
          _("Specified file '%s' is not a writable file node."), path);
      }
    } else { // if target is not exists.
      // create base directories recursively (= mkdir -p).
      void function make_directory(current) 
      {
        let parent = current.parent;
        if (!parent.exists()) {
          make_directory(parent);
          parent.create(Components.interfaces.nsIFile.DIRECTORY_TYPE, -1);
        }
      } (file);
    }
   
    // create output stream.
    let ostream = Components
      .classes["@mozilla.org/network/file-output-stream;1"]
      .createInstance(Components.interfaces.nsIFileOutputStream);  
      
    // write (0x02), appending (0x10), "rw"
    const PR_WRONLY = 0x02;
    const PR_CREATE_FILE = 0x08;
    const PR_APPEND = 0x10;
    const PR_TRUNCATE = 0x20;
    ostream.init(file, PR_WRONLY| PR_CREATE_FILE| PR_APPEND, -1, 0);   
    
    let converter = Components
      .classes["@mozilla.org/intl/converter-output-stream;1"].  
      createInstance(Components.interfaces.nsIConverterOutputStream);  
    converter.init(ostream, "UTF-8", 0, 0);  
    this._converter = converter;
  },

  closeHistory: function closeHistory()
  {
    // close history file.
    if (this._converter) {
      this._converter.close(); // closes the output stream.  
    }
  },

  "[command('clearhistory/chistory'), _('clear command line history.')]":
  function clearHistory()
  {
    this.closeHistory();

    // remove history file.
    coUtils.File
      .getFileLeafFromVirtualPath(this.history_file_path)
      .remove(false);

    this.loadHistory();

    return {
      success: true,
      message: _("History file was removed successfully."),
    };
  },

  "[subscribe('command/select-next-history')]":
  function nextHistory(info)
  {
    let history_list = Object.keys(this._history);
    let index = ++this._history_index % history_list.length
    if (index < 0) {
      index += history_list.length;
    }
    let value = history_list[index];
    info.textbox.value = value;
  },

  "[subscribe('command/select-previous-history')]":
  function previousHistory(info)
  {
    let history_list = Object.keys(this._history);
    let index = --this._history_index % history_list.length
    if (index < 0) {
      index += history_list.length;
    }
    let value = history_list[index];
    info.textbox.value = value;
  },

  "[subscribe('command/eval-commandline')]":
  function onCommand(command)
  {
    this._history[command] = true;
    this._history_index = 0;
    try {
      this._converter.writeString(command + "\n");
    } catch (e) {
      /* Ignore any errors to prevent recursive-call. */
    }
  },

}; // CommandlineHistory


/**
 * @Aspect CompletionView
 */
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

  "[persistable] completion_delay": 180,
  "[persistable] completion_popup_opacity": 1.00,
  "[persistable] completion_popup_max_height": 300,

  get template()
  [
    {
      parentNode: "#tanasinn_commandline_area",
      tagName: "box",
      style: <>position: absolute;</>,
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
              //position: absolute;
              margin-top: -4px;
              padding-top: 0px;
              opacity: 1.0;
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
      height: this.font_size,
      style: <>
        padding-top: 2px,
        opacity: 0.7,
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
      noautohide: true,
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
   *  @param {Session} session A Session object.
   */
  "[subscribe('install/commandline'), enabled]":
  function install(session) 
  {
    let {
      tanasinn_commandline_canvas, 
      tanasinn_commandline, 
      tanasinn_completion_popup, 
      tanasinn_completion_scroll, 
      tanasinn_completion_root,
    } = session.uniget("command/construct-chrome", this.template);

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
   *  @param {Session} session A Session object.
   */
  "[subscribe('uninstall/commandline'), enabled]":
  function uninstall(session) 
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

//    if (this._textbox) {
//      this._texbox.clear();
//    }
    if (this._popup) {
      while (this._popup.firstChild) {
        this._popup.removeChild(this._popup.firstChild);
      }
      if (this._popup.hidePopup) {
        this._popup.hidePopup();
      }
      this._popup.parentNode.removeChild(this._popup);
      this._popup = null;
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
    this._textbox.mode = "status";
    //coUtils.Timer.setTimeout(function() {
      this._textbox.status = message;
    //}, 0, this);
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
    let session = this._broker;
    session.notify("event/mode-changed", "commandline");
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
    this._popup.hidePopup();
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
    if (result.labels.length > 0) {
      this._popup.style.opacity = this.completion_popup_opacity;
      if ("closed" == this._popup.state || "hiding" == this._popup.state) {
        let session = this._broker;
        let document = session.window.document;
        if (document) {
          this._popup.width = this._canvas.width;
          this._popup.openPopup(this._canvas, "after_start", 0, 0, true, true);
        }
      }
      let index = Math.max(0, this.currentIndex);
      let completion_text = result.labels[index];
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
      let completion_text = result.labels[index];
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
      let current_text = this._textbox.value;
      // if current text does not match completion text, hide it immediatly.
      if (!this._textbox.completion 
        || 0 != this._textbox.completion.indexOf(current_text)) {
        this._textbox.completion = "";
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

  "[listen('keydown', '#tanasinn_commandline', true)]":
  function onkeydown(event) 
  {
    event.stopPropagation();
    event.preventDefault();
  },

  "[subscribe('event/keypress-commandline-with-mapping'), enabled]":
  function onKeypressCommandlineWithMapping(code) 
  {
    let session = this._broker;
    let result = session.uniget(
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

  "[subscribe('event/keypress-commandline-with-no-mapping'), enabled]":
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
    let session = this._broker;
    session.notify("event/scan-keycode", {
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
    let session = this._broker;
    let command = this._textbox.value;

    this._textbox.value = "";
    this._textbox.completion = "";
    session.notify("command/eval-commandline", command);
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
    let session = this._broker;
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
 * @param {Broker} broker The Broker object.
 */
function main(broker)
{
  new Commandline(broker);
  new CommandlineHistory(broker);
}



