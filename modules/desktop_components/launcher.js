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

"use strict";


/** 
 * @class Launcher
 */
var Launcher = new Class().extends(Plugin);
Launcher.definition = {

  id: "launcher",

  getInfo: function getInfo()
  {
    return {
      name: _("Launcher"),
      version: "0.1",
      description: _("Provides launcher UI.")
    };
  },

  top: 200,
  left: 500,

  "[persistable, watchable] enabled_when_startup": true,

  "[persistable, watchable] popup_height": 400,
  "[persistable, watchable] completion_delay": 180,
  "[persistable, watchable] font_size": "40px",
  "[persistable, watchable] font_family": "Lucida Calligraph,Times New Roman,Lucida Console",
  "[persistable, watchable] font_weight": "bold",
  "[persistable, watchable] font_style": "italic",
  "[persistable, watchable] textbox_width": "500px",
  "[persistable, watchable] textbox_color": "#ddd",

  _index: -1,
  _result: null,
  _stem_text: "",
  _last_ctrlup_time: 0,
  _last_altup_time: 0,
  _last_shiftup_time: 0,

  getRowCount: function getRowCount() 
  {
    if (!this._result) {
      return 0;
    }
    return this._result.labels.length;
  },

  getCurrentIndex: function getCurrentIndex()
  {
    return this._index;
  },

  getTextboxStyle: function getTextboxStyle()
  {
    return "font-size: " + this.font_size + ";" +
           "font-family: " + this.font_family + ";" +
           "font-weight: " + this.font_weight + ";" +
           "font-style: " + this.font_style + ";" +
           "text-shadow: 1px 1px 3px black;" +
           "width: " + this.textbox_width + ";" +
           "color: " + this.textbox_color + ";"
           ;
  },

  getTemplate: function getTemplate()
  {
    var root_element = this.request("get/root-element");

    return [
      {
        parentNode: root_element,
        tagName: "box",
        id: "tanasinn_window_layer",
      },
      {
        parentNode: root_element,
        tagName: "box",
        id: "tanasinn_launcher_layer",
        hidden: true,
        style: {
          position: "fixed",
          left: "60px",
          top: "80px",
        },
        childNodes: [
          {
            tagName: "vbox",
            style: {
              padding: "20px",
              borderRadius: "20px",
              background: "-moz-linear-gradient(top, #999, #444)",
              MozBoxShadow: "10px 10px 20px black",
              boxShadow: "10px 10px 20px black",
              opacity: "0.85",
              cursor: "move",
            },
            childNodes: {
              tagName: "textbox",
              id: "tanasinn_launcher_textbox",
              className: "plain",
              style: this.getTextboxStyle(),
            },
          },
          {
            tagName: "panel",
            style: { 
              MozAppearance: "none",
              MozUserFocus: "ignore",
              border: "1px solid #aaa",
              borderRadius: "10px",
              font: "menu",
              opacity: "0.87",
              //background: "transparent",
              background: "-moz-linear-gradient(top, #ccc, #aaa)",
            },
            noautofocus: true,
            height: this.popup_height,
            id: "tanasinn_launcher_completion_popup",
            childNodes: {
              tagName: "stack",
              flex: 1,
              childNodes: [
                {
                  tagName: "box",
                  style: { 
                    borderRadius: "12px",
                    outline: "none",
                    border: "none",
                  },
                },
                {
                  tagName: "scrollbox",
                  id: "tanasinn_launcher_completion_scroll",
                  flex: 1,
                  style: { 
                    margin: "12px",
                    overflowX: "hidden",
                    overflowY: "auto",
                  },
                  orient: "vertical", // box-packing
                  childNodes: {
                    tagName: "grid",
                    flex: 1,
                    id: "tanasinn_launcher_completion_root",
                    style: {
                      fontSize: "20px",
                      fontFamily: "'Menlo','Lucida Console'",
                      fontWeight: "bold",
                      color: "#fff",
                      textShadow: "1px 1px 7px black",
                    },
                  }
                }, // scrollbox
              ],
            }, // stack
          },  // panel
        ],
      },
    ];
  },

  /** Installs itself. 
   *  @param {InstallContext} context A InstallContext object.
   */
  "[install]":
  function install(context)
  {
    var result = this.request("command/construct-chrome", this.getTemplate());

    this._window_layer = result.tanasinn_window_layer;
    this._element = result.tanasinn_launcher_layer;
    this._textbox = result.tanasinn_launcher_textbox;
    this._popup = result.tanasinn_launcher_completion_popup;
    this._completion_root = result.tanasinn_launcher_completion_root;
    this.onEnabled();
  },

  /** Uninstalls itself. 
   *  @param {InstallContext} context A InstallContext object.
   */
  "[uninstall]":
  function uninstall(context)
  {
  },

  "[subscribe('command/move-to'), pnp]":
  function moveTo(info)
  {
    var left = info[0],
        top = info[1];

    this._element.style.left = left + "px";
    this._element.style.top = top + "px";
    this._popup.hidePopup();
  },
  
  "[subscribe('event/shutdown'), pnp]":
  function shutdown()
  {
    this.enabled = false;
    this.onDisabled();
    if (this._element) {
      this._element.removeChild(this._element);
    }
  },
  
  "[subscribe('event/enabled'), pnp]":
  function onEnabled()
  {
    var broker,
        keydown_handler,
        keyup_handler,
        self = this;

    this.onkeypress.enabled = true;
    this.onfocus.enabled = true;
    this.onblur.enabled = true;
    this.oninput.enabled = true;
    this.startSession.enabled = true;

    broker = this._broker;

    keydown_handler = function()
    {
      return self.onkeydown.apply(self, arguments);
    };
    broker.window.addEventListener("keydown", keydown_handler, /* capture */ true);
    broker.subscribe(
      "event/disabled", 
      function()
      {
        return broker.window.removeEventListener("keydown", keydown_handler, true);
      });

    keyup_handler = function()
    {
      return self.onkeyup.apply(self, arguments);
    };
    broker.window.addEventListener("keyup", keyup_handler, /* capture */ true);
    broker.subscribe(
      "event/disabled", 
      function()
      {
        return broker.window.removeEventListener("keyup", keyup_handler, true);
      });
  },

  "[subscribe('event/disabled'), pnp]":
  function onDisabled()
  {
    if (this._textbox) {
      this._textbox.blur();
    }
    this.onkeypress.enabled = false;
    this.onfocus.enabled = false;
    this.onblur.enabled = false;
    this.oninput.enabled = false;
    this.startSession.enabled = false;
  },

  "[subscribe('variable-changed/launcher.{font_size | font_family | font_weight | font_style}'), pnp]":
  function onStyleChanged(chrome, decoder) 
  {
    if (this._textbox) {
      this._textbox.style.cssText = this.getTextboxStyle();
    }
  },

  select: function select(index)
  {
    var completion_root,
        row,
        scroll_box,
        box_object,
        scrollY,
        first_position,
        last_position;

    if (index < -1) {
      index = -1;
    }
    if (index > this.getRowCount()) {
      index = this.getRowCount() - 1;
    }

    completion_root = this._completion_root;

    if (this._index > -1) {
      row = completion_root.querySelector("rows").childNodes[this._index];
      if (!row) {
        return;
      }
      row.style.background = "";
      row.style.color = "";
      row.style.textShadow = "1px 1px 7px black";
    }
    if (index > -1) {
      row = completion_root.querySelector("rows").childNodes[index];
      row.style.color = "#000000";
      row.style.background = "-moz-linear-gradient(top, #ddd, #eee)";
      row.style.borderRadius = "4px";
      row.style.textShadow = "1px 1px 7px white";

      try {
        scroll_box = completion_root.parentNode;
        box_object = scroll_box.boxObject
          .QueryInterface(Components.interfaces.nsIScrollBoxObject)

        if (box_object) {
          scrollY = {};
          box_object.getPosition({}, scrollY);

          first_position = row.boxObject.y - completion_root.boxObject.y;
          last_position = first_position - scroll_box.boxObject.height + row.boxObject.height;

          if (first_position < scrollY.value) {
            box_object.scrollTo(0, first_position);
          } else if (last_position > scrollY.value) {
            box_object.scrollTo(0, last_position);
          }
        }
      } catch (e) { 
       coUtils.Debug.reportError(e)
      }
    }
    this._index = index;

  },

  doCompletion: function doCompletion(result) 
  {
    var completion_root = this._completion_root,
        type,
        driver;

    this._result = result;
    delete this._timer;

    while (completion_root.firstChild) {
      completion_root.removeChild(completion_root.firstChild);
    }
    if (result) {

      type = result.type || "text";
      driver = this.request("get/completion-display-driver/" + type); 

      if (driver) {
        driver.drive(completion_root, result, this.getCurrentIndex());
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
    var textbox = this._textbox,
        popup,
        focused_element,
        completion_root,
        index,
        completion_text,
        settled_length,
        settled_text;

    if (textbox.boxObject.scrollLeft > 0) {
//      this._completion.inputField.value = "";
    } else if (result.labels.length > 0) {

      popup = this._popup;

      if ("closed" === popup.state || "hiding" === this._popup.state) {

        focused_element = popup.ownerDocument.commandDispatcher.focusedElement;

        if (focused_element && focused_element.isEqualNode(textbox.inputField)) {
          completion_root = this._completion_root;
          popup.width = textbox.boxObject.width;
          completion_root.height = 500;
          popup.openPopup(textbox, "after_start", 0, 0, true, true);
        }
      }

      index = Math.max(0, this.getCurrentIndex());
      completion_text = result.labels[index];

      if (completion_text && 0 === completion_text.indexOf(result.query)) {

        settled_length = this._stem_text.length - result.query.length;
        settled_text = textbox.value.substr(0, settled_length);
      } else {
      }
    } else {
      this._popup.hidePopup();
    }
  },

  down: function down()
  {
    var index = Math.min(this.getCurrentIndex() + 1, this.getRowCount() - 1);

    if (index >= 0) {
      this.select(index);
    }
    this.fill();
  },

  up: function up()
  {
    var index = Math.max(this.getCurrentIndex() - 1, -1);

    if (index >= 0) {
      this.select(index);
    }
    this.fill();
  },

  fill: function fill()
  {
    var index = Math.max(0, this.getCurrentIndex()),
        result = this._result,
        textbox,
        completion_text, 
        settled_length,
        settled_text;

    if (this._result) {
      textbox = this._textbox;
      completion_text = result.labels[index];

      settled_length = 
        this._stem_text.length - result.query.length;
      settled_text = textbox.value.substr(0, settled_length);

      textbox.inputField.value = settled_text + completion_text;
//      this._completion.inputField.value = "";
    }
  },

  setCompletionTrigger: function setCompletionTrigger() 
  {
    var current_text;

    if (this._timer) {
      this._timer.cancel();
      delete this._timer;
    }
    this._timer = coUtils.Timer.setTimeout(function() {
      delete this._timer;

      current_text = this._textbox.value;
      // if current text does not match completion text, hide it immediatly.
//      if (0 !== this._completion.value.indexOf(current_text)) {
//        this._completion.inputField.value = "";
//      }
      this._stem_text = current_text;
      this.select(-1);

      this.sendMessage(
        "command/complete", 
        {
          source: current_text, 
          listener: this,
        });

    }, this.completion_delay, this);
  },

  "[listen('input', '#tanasinn_launcher_textbox', true)]":
  function oninput(event) 
  {
    this.setCompletionTrigger();
  },

  "[listen('focus', '#tanasinn_launcher_textbox')]":
  function onfocus(event) 
  {
    this.setCompletionTrigger();
  },

  "[subscribe('event/hotkey-double-{ctrl | alt}'), pnp]":
  function onDoubleCtrl() 
  {
    var box = this._element;

    if (box.hidden) {
      this.show();
    } else {
      this.hide();
    }
  },

  "[subscribe('command/show-launcher'), pnp]":
  function show()
  {
    var box = this._element;

    box.parentNode.appendChild(box);
    box.hidden = false;

    coUtils.Timer.setTimeout(
      function timerProc()
      {
        this._textbox.focus();
        this._textbox.focus();
      }, 0, this);
  },

  "[subscribe('command/hide-launcher'), pnp]":
  function hide()
  {
    var box = this._element,
        textbox = this._textbox,
        popup = this._popup;

    if (popup.hidePopup) {
      popup.hidePopup();
    }
    textbox.blur();
    box.hidden = true;
  },

  enter: function enter() 
  {
    var command = this._textbox.value;

    this.sendMessage("command/start-session", command);
  },

  "[subscribe('command/start-session')]":
  function startSession(command) 
  {
    var desktop = this._broker,
        box = this._element.ownerDocument.createElement("box");

    if (command) {
      command = command.replace(/^\s+|\s+$/g, "");
    } else {
      command = "";
    }

    box.style.position = "fixed";
    box.style.left = "0px";
    box.style.top = "0px";
    
    this._window_layer.appendChild(box);
    desktop.start(box, command);  // command
    box.style.left = (this.left = (this.left + Math.random() * 1000) % 140 + 20) + "px";
    box.style.top = (this.top = (this.top + Math.random() * 1000) % 140 + 20) + "px";
    this.hide();
  },

  "[listen('blur', '#tanasinn_launcher_textbox')]":
  function onblur(event) 
  {
    this.hide();
  },

  "[listen('keypress', '#tanasinn_launcher_textbox')]":
  function onkeypress(event) 
  { // nothrow
    var code = event.keyCode || event.which,
        is_char = 0 === event.keyCode,
        textbox,
        length,
        start,
        end, 
        value,
        position;

    if (event.ctrlKey) { // ^
      event.stopPropagation();
      event.preventDefault();
    }
    if ("a".charCodeAt(0) === code && event.ctrlKey) { // ^a
      textbox = this._textbox;
      textbox.selectionStart = 0;
      textbox.selectionEnd = 0;
    }
    if ("e".charCodeAt(0) === code && event.ctrlKey) { // ^e
      textbox = this._textbox;
      length = this._textbox.value.length;
      textbox.selectionStart = length;
      textbox.selectionEnd = length;
    }
    if ("b".charCodeAt(0) === code && event.ctrlKey) { // ^b
      textbox = this._textbox;
      start = textbox.selectionStart;
      end = textbox.selectionEnd;

      if (start === end) {
        textbox.selectionStart = start - 1;
        textbox.selectionEnd = start - 1;
      } else {
        textbox.selectionEnd = start;
      }
    }
    if ("f".charCodeAt(0) === code && event.ctrlKey) { // ^f
      textbox = this._textbox;
      start = textbox.selectionStart;
      end = textbox.selectionEnd;

      if (start === end) {
        textbox.selectionStart = start + 1;
        textbox.selectionEnd = start + 1;
      } else {
        textbox.selectionStart = end;
      }
    }
    if ("k".charCodeAt(0) === code && event.ctrlKey) { // ^k
      textbox = this._textbox;
      value = textbox.value;
      start = textbox.selectionStart;
      end = textbox.selectionEnd;

      if (start === end) {
        this._textbox.inputField.value 
          = value.substr(0, textbox.selectionStart);
      } else {
        this._textbox.inputField.value 
          = value.substr(0, textbox.selectionStart) 
          + value.substr(textbox.selectionEnd);
        textbox.selectionStart = start;
        textbox.selectionEnd = start;
      }
      this.setCompletionTrigger();
    }
    if ("p".charCodeAt(0) === code && event.ctrlKey) { // ^p
      this.up();
    }
    if ("n".charCodeAt(0) === code && event.ctrlKey) { // ^n
      this.down();
    }
    if ("j".charCodeAt(0) === code && event.ctrlKey) { // ^j
      this.enter()
    }
    if ("h".charCodeAt(0) === code && event.ctrlKey) { // ^h
      value = this._textbox.value;
      position = this._textbox.selectionEnd;

      if (position > 0) {
        this._textbox.inputField.value 
          = value.substr(0, position - 1) + value.substr(position);
        this.setCompletionTrigger();
      }
    }
    if ("w".charCodeAt(0) === code && event.ctrlKey) { // ^w
      value = this._textbox.value;
      position = this._textbox.selectionEnd;

      this._textbox.inputField.value
        = value.substr(0, position).replace(/\w+$|\W+$/, "") 
        + value.substr(position);
      this.setCompletionTrigger();
    }
    if ("f".charCodeAt(0) === code && event.ctrlKey) { // ^h
      this._textbox.selectionStart += 1;
    }
    if ("b".charCodeAt(0) === code && event.ctrlKey) { // ^h
      this._textbox.selectionEnd -= 1;
    }
    if (0x09 === code) { // tab
      event.stopPropagation();
      event.preventDefault();
    }
    if (0x09 === code && event.shiftKey) // shift + tab
      code = 0x26;
    if (0x09 === code && !event.shiftKey) // tab
      code = 0x28;
    if (0x26 === code && !is_char) { // up 
      this.up();
    } else if (0x28 === code && !is_char) { // down
      this.down();
    } else if (0x0d === code && !is_char) {
      this.enter();
    } 
  },

  onkeyup: function onkeyup(event) 
  { // nothrow
    var now,
        diff,
        diff_min = 30,
        diff_max = 400;

    if (16 === event.keyCode && 16 === event.which && !event.isChar) {

      now = parseInt(new Date().getTime());
      diff = now - this._last_shiftup_time;

      if (diff_min < diff && diff < diff_max) {
        this.sendMessage("event/hotkey-double-shift");
        this._last_shiftup_time = 0;
      } else {
        this._last_shiftup_time = now;
      }
      this.sendMessage("event/shift-key-up");
    } else if (17 === event.keyCode && 17 === event.which && !event.isChar) {

      now = parseInt(new Date().getTime());
      diff = now - this._last_ctrlup_time;

      if (diff_min < diff && diff < diff_max) {
        this.sendMessage("event/hotkey-double-ctrl");
        this._last_ctrlup_time = 0;
      } else {
        this._last_ctrlup_time = now;
      }
      this.sendMessage("event/ctrl-key-up");
    } else if (18 === event.keyCode && 18 === event.which && !event.isChar) {

      now = parseInt(new Date().getTime());
      diff = now - this._last_altup_time;

      if (diff_min < diff && diff < diff_max) {
        this.sendMessage("event/hotkey-double-alt");
        this._last_altup_time = 0;
      } else {
        this._last_altup_time = now;
      }
      this.sendMessage("event/alt-key-up");
    }
  },

  onkeydown: function onkeydown(event) 
  { // nothrow
    if (16 === event.keyCode && 16 === event.which && !event.isChar) {
      this.sendMessage("event/shift-key-down");
    } else if (17 === event.keyCode && 17 === event.which && !event.isChar) {
      this.sendMessage("event/ctrl-key-down");
    } else if (18 === event.keyCode && 18 === event.which && !event.isChar) {
      this.sendMessage("event/alt-key-down");
    }
  },
};


/**
 * @fn main
 * @brief Module entry point
 * @param {Desktop} desktop The Desktop object.
 */
function main(desktop) 
{
  new Launcher(desktop);
}

// EOF
