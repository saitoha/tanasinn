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
 * @class CommandlineHistory
 *
 */
let CommandlineHistory = new Class().extends(Component);
CommandlineHistory.definition = {

  get id()
    "commandline_history",

};


/**
 * @Aspect CompletionView
 *
 */
let CompletionView = new Aspect();
CompletionView.definition = {

  _index: -1,
  _history: null,
  _history_index: 0,
  history_file_path: "$Home/.tanasinn/history/commandline.txt",

  initialize: function initialize() 
  {
    this.loadHistory();
  },

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

    if (file.exists() && file.isReadable) {
      let content = coUtils.IO.readFromFile(path);
      this._history = content.split(/[\r\n]+/);
    } else {
      this._history = [];
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

  "[command('clearhistory/chistory')]":
  function clearHistory()
  {
    this.closeHistory();

    // remove history file.
    coUtils.File
      .getFileLeafFromVirtualPath(this.history_file_path)
      .remove(false);

    this.loadHistory();

    return true;
  },

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
    row.style.backgroundImage = "-moz-linear-gradient(top, #777, #666)";
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
  function enter(info)
  {
    let value = info.textbox.value;
    this._history.push(value);
    this._history_index = 0;
    try {
      this._converter.writeString(value + "\n");
    } catch (e) {
      /* Ignore any errors to prevent recursive-call. */
    }
    this.onsubmit();
  },

  "[subscribe('command/select-next-history'), enabled]":
  function nextHistory(info)
  {
    let index = ++this._history_index % this._history.length
    if (index < 0) {
      index += this._history.length;
    }
    let value = this._history[index];
    info.textbox.inputField.value = value;
    let broker = this._broker;
    broker.notify("command/fill");
  },

  "[subscribe('command/select-previous-history'), enabled]":
  function previousHistory(info)
  {
    let index = --this._history_index % this._history.length
    if (index < 0) {
      index += this._history.length;
    }
    let value = this._history[index];
//    this._broker.notify("command/report-overlay-message", value + " " + index)
    info.textbox.inputField.value = value;
    let broker = this._broker;
    broker.notify("command/fill");
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
        <version>0.1</version>
        <description>{
          _("Provides commandline interafce.")
        }</description>
    </plugin>,

  "[persistable, watchable] font_size": 16,
  "[persistable, watchable] font_family": "Lucida Console,Latha,Georgia,monospace",
  "[persistable, watchable] default_text_shadow": "1px 1px 3px #555",
  "[persistable, watchable] font_weight": "bold",
  "[persistable] completion_delay": 180,
  "[persistable] completion_popup_opacity": 1.00,
  "[persistable] completion_popup_max_height": 300,

  get default_style() <>
    font-size: {this.font_size}px;
    font-family: {this.font_family};
    text-shadow: {this.default_text_shadow};
    font-weight: {this.font_weight};
  </>,

  get template()
  [
    {
      parentNode: "#tanasinn_commandline_area",
      tagName: "stack",
      id: "tanasinn_commandline_box",
      flex: 1,
      style: this.default_style,
      childNodes: [
        {
          tagName: "textbox",
          id: "tanasinn_commandline_completion",
          value: "",
          className: "plain",
          style: <> 
            padding: 0px;
            margin: 0px;
            color: #888; 
          </>,
        },
        {
          tagName: "textbox",
          id: "tanasinn_commandline",
          className: "plain",
          newlines: "replacewithspaces",
          style: <> 
            padding: 0px;
            margin: 0px;
            color: #eee;
            text-shadow: 0px 1px 4px #484;
          </>,
        },
        {
          tagName: "box",
          id: "tanasinn_statusbar",
          hidden: true,
          style: <>
          //  border: solid 1px red;
          </>,
          childNodes: [
            {
              tagName: "box",
              flex: 1,
              style: "overflow: hidden",
              childNodes: {
                tagName: "textbox",
                className: "plain",
                flex: 1,
                id: "tanasinn_status_message",
                style: <> 
                  padding: 0px;
                  margin: 0px;
                  color: #ccc;
                  text-shadow: 0px 1px 4px #444;
                </>,
              },
            },
            {
              tagName: "label",
              id: "tanasinn_status_keystate",
              flex: 0,
              style: <> 
              //  border: solid 1px yellow,
                padding: 0px;
                margin: 0px;
                color: #ccc;
                text-shadow: 0px 1px 4px #444;
              </>,
            },
          ],
        },
      ] 
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
      onconstruct: function() {
        this.setAttribute("noautofocus", true);
        this.setAttribute("noautohide", true);
        this.setAttribute("ignorekeys", true);
      },  
      noautofocus: true,
      noautohide: true,
      ignorekeys: true,
      childNodes: {
        tagName: "stack",
        maxHeight: this.completion_popup_max_height,
//        flex: 1,
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
      tanasinn_commandline_box, 
      tanasinn_commandline_completion, 
      tanasinn_commandline, 
      tanasinn_statusbar,
      tanasinn_status_message,
      tanasinn_status_keystate,
      tanasinn_completion_popup, 
      tanasinn_completion_scroll, 
      tanasinn_completion_root,
    } = session.uniget("command/construct-chrome", this.template);

    this._element = tanasinn_commandline_box;
    this._completion = tanasinn_commandline_completion;
    this._textbox = tanasinn_commandline;
    this._popup = tanasinn_completion_popup;
    this._scroll = tanasinn_completion_scroll;
    this._completion_root = tanasinn_completion_root;
    this._statusbar = tanasinn_statusbar;
    this._status_message = tanasinn_status_message;
    this._status_keystate = tanasinn_status_keystate;

    this.show.enabled = true;
    this.fill.enabled = true;
    this.onStatusMessage.enabled = true;
    this.onfocus.enabled = true;
    this.onblur.enabled = true;
    this.oninput.enabled = true;
    this.onkeydown.enabled = true;
    this.onkeyup.enabled = true;
    this.onkeypress.enabled = true;
    this.onpopupshowing.enabled = true;
    this.onpopupshown.enabled = true;
    this.onclick.enabled = true;
    this.onchange.enabled = true;
    this.enableCommandline.enabled = true;
    this.onFirstFocus.enabled = true;
    this.setCompletionTrigger.enabled = true;
    this.sourceCommand.enabled = true;
    this.onStyleChanged.enabled = true;
    this.clearHistory.enabled = true;

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
    this.onStatusMessage.enabled = false;
    this.onfocus.enabled = false;
    this.onblur.enabled = false;
    this.oninput.enabled = false;
    this.onkeydown.enabled = false;
    this.onkeyup.enabled = false;
    this.onkeypress.enabled = false;
    this.onpopupshowing.enabled = false;
    this.onpopupshown.enabled = false;
    this.onclick.enabled = false;
    this.onchange.enabled = false;
    this.enableCommandline.enabled = false;
    this.setCompletionTrigger.enabled = false;
    this.onFirstFocus.enabled = false;
    this.sourceCommand.enabled = false;
    this.onStyleChanged.enabled = false;
    this.clearHistory.enabled = false;

    this.onmousedown.enabled = false;

    if (this._element) {
      this._element.parentNode.removeChild(this._element);
      this._element = null;
    }
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
    this._element.style.cssText = this.default_style;
  },

  "[subscribe('@command/focus')]":
  function onFirstFocus(message) 
  {
    // load rc file.
    let path = "$Home/.tanasinn/tanasinnrc";
    let session = this._broker;
    session.notify("command/source", path);
  },

  "[subscribe('command/source'), command('source', ['file']), _('load and evaluate script file.')]":
  function sourceCommand(arguments_string)
  {
    let path = arguments_string.replace(/^\s*|\s*$/g, "");
    if ("$" != path.charAt(0) && !coUtils.File.isAbsolutePath(path)) {
      if ("WINNT" == coUtils.Runtime.os) {
        let session = this._broker;
        let cygwin_root = session.uniget("get/cygwin-root");
        path = cygwin_root + coUtils.File.getPathDelimiter() + path;
      } else {
        let home = coUtils.File.getFileLeafFromVirtualPath("$Home");
        path = home.path + coUtils.File.getPathDelimiter() + path;
      }
    }
    let file = coUtils.File.getFileLeafFromVirtualPath(path);
    if (file && file.exists()) {
      try {
        let session = this._broker;
        let content = coUtils.IO.readFromFile(path, "utf-8");
        content.split(/[\n\r]+/).forEach(function(command) {
          session.notify("command/eval-commandline", command);
        });
      } catch (e) {
        coUtils.Debug.reportError(e);
      }
    }
    return true;
  },

  "[subscribe('command/report-status-message')]":
  function onStatusMessage(message) 
  {
    this._statusbar.hidden = false;
    this._textbox.hidden = true;
    this._completion.hidden = true;
    coUtils.Timer.setTimeout(function() {
      this._status_message.setAttribute("value", message);
    }, 0, this);
  },

  "[subscribe('command/enable-commandline')]":
  function enableCommandline() 
  {
    this._status_message.setAttribute("value", "");
    this._statusbar.hidden = true;
    this._textbox.hidden = false;
    this._completion.hidden = false;
    this._textbox.focus();
    this._textbox.focus();
    this._textbox.focus();
    let session = this._broker;
    session.notify("event/mode-changed", "commandline");
  },

  "[subscribe('event/input-state-changed'), enabled]":
  function onInputStateChanged(code)
  {
    this._statusbar.hidden = false;
    let current_value = this._status_keystate.getAttribute("value");
    let new_value = current_value 
      + coUtils.Keyboard.convertCodeToExpression(code);
    this._status_keystate.setAttribute("value", new_value);
  },

  "[subscribe('event/input-state-reset'), enabled]":
  function onInputStateReset(info)
  {
    this._status_keystate.setAttribute("value", "");
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
      if (this._popup) {
        this._popup.style.opacity = 0;
      }
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
        let document = session.window.document;
        if (document) {
          let focused_element = document.commandDispatcher.focusedElement;
          if (focused_element && focused_element.isEqualNode(textbox.inputField)) {
            this._popup.openPopup(this._element, "after_start", 0, 0, true, true);
          }
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

  "[listen('keydown', '#tanasinn_commandline', true)]":
  function onkeydown(event) 
  {
    event.stopPropagation();
    event.preventDefault();
  },

  "[listen('input', '#tanasinn_commandline', true)]":
  function oninput(event) 
  {
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

  "[subscribe('event/keypress-commandline-with-mapping'), enabled]":
  function onKeypressCommandlineWithMapping(event) 
  {
    let code = coUtils.Keyboard.getPackedKeycodeFromEvent(event);
    let result = this.inputCommandlineWithMapping({ code: code, event: event });
    if (!result) {
      if (!event.keyCode && !event.ctrlKey) {
        this._textbox.inputField.value += String.fromCharCode(event.which);
        this.setCompletionTrigger();
      }
    }
  },

  "[subscribe('event/keypress-commandline-with-no-mapping'), enabled]":
  function onKeypressCommandlineWithNoMapping(event) 
  {
    if (!event.keyCode && !event.ctrlKey) {
      this._textbox.inputField.value += String.fromCharCode(event.which);
      this.setCompletionTrigger();
    }
  },

  "[listen('keypress', '#tanasinn_commandline', true)]":
  function onkeypress(event) 
  {
    let key_code = coUtils.Keyboard.getPackedKeycodeFromEvent(event);
    let session = this._broker;
    session.notify("event/scan-keycode", {
      mode: "commandline", 
      code: key_code,
      event: event,
    });
  },

  "[subscribe('command/input-commandline-with-mapping'), enabled]":
  function inputCommandlineWithMapping(info)
  {
    let {event, code} = info;
    let session = this._broker;
    let result = session.uniget(
      "event/commandline-input", 
      {
        textbox: this._textbox, 
        code: code,
      });
    if (result && event) {
      event.stopPropagation();
      event.preventDefault();
    }
    return result;
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
 * @param {Broker} broker The Broker object.
 */
function main(broker)
{
  new Commandline(broker);
}



