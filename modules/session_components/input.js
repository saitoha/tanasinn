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
 * @fn coCreateKeyMap
 * @brief Create [bit-packed keycode -> terminal input sequence] map 
 *        from the definition file
 */ 
function coLoadKeyMap() 
{
  let CO_KEY_DEFINITION = "modules/key.conf";
  let keys = coUtils.IO.readFromFile(CO_KEY_DEFINITION) // load key settings from file.
    .split(/[\n\r]+/) // LF or CR is line separator.
    .filter(function(line) line) // Filter out empty lines.
    .map(function(line) line.split(/#/).shift()) // # is line comment delimiter.
    .map(function(line) line.replace(/[\s\t]+$/, '')) // chop line-end spaces.
    .map(function(line) line.split(/[\s\t]*\->[\s\t]*/)) // make (key, value) touple.
    .filter(function(pair) pair.length == 2)
  let map = keys.reduce(function(map, pair) 
    let (key = pair.shift()) (map[key] = pair.shift(), map), {});
  return map;
}

function coCreateKeyMap() 
{
  let map = {};
  let expression_map = coLoadKeyMap();
  for (let [key, value] in Iterator(expression_map)) 
  {
    let tokens = key.split(/[\s\t]+/);
    let code = tokens.pop();
    code = coUtils.Keyboard.KEYNAME_PACKEDCODE_MAP[code.toLowerCase()] 
      || code.replace(/\\x([0-9a-fA-F]+)/g, function() 
      let (code = parseInt(arguments[1], 16))
        String.fromCharCode(code)
    ).charCodeAt(0);
    code = tokens.reduce(function(code, token) code | 0x1 << { 
      ctrl: coUtils.Keyboard.KEY_CTRL,// | coUtils.Keyboard.KEY_NOCHAR, 
      alt: coUtils.Keyboard.KEY_ALT, 
      shift: coUtils.Keyboard.KEY_SHIFT, 
      meta: coUtils.Keyboard.KEY_META,// | coUtils.Keyboard.KEY_NOCHAR, 
    } [token.toLowerCase()], code);
    map[code] = value
     .replace(/\\x([0-9a-fA-F]{1,2})/g, function() 
       let (code = parseInt(arguments[1], 16)) String.fromCharCode(code))
     .replace(/\\[eE]/g, '\x1b');
  }
  return map;
}

/**
 * @class InputManager
 * @brief Listen keyboard input events and send ones to TTY device.
 */
let InputManager = new Class().extends(Plugin)
                              .depends("encoder");
InputManager.definition = {

  get id()
    "inputmanager",

  get template()
    ({ 
      parentNode: "#tanasinn_center_area",
      tagName: "bulletinboard",
//      style: "border: solid 1px red",
      childNodes: {
        tagName: "html:input",
        id: "tanasinn_default_input",
        style: <> 
          ime-mode: disabled;
          border: 0px; 
          opacity: 0.00;
        </>,
        top: 0,
        left: 0,
      },
    }),

  _key_map: null,

  "[persistable] debug_mode": false,

  /** Installs itself. 
   *  @param {Session} a session object.
   *  @notify initialized/inputmanager
   */
  "[subscribe('install/inputmanager'), enabled]":
  function install(session)
  {
    // Get [bit-packed keycode -> terminal input sequence] map
    this._key_map = coCreateKeyMap();
    let {tanasinn_default_input} 
      = session.uniget("command/construct-chrome", this.template);
    this._textbox = tanasinn_default_input;
    this._processInputSequence.enabled = true;
    this.onFocusChanged.enabled = true; 
    this.focus.enabled = true;
    this.blur.enabled = true;
    this.onkeypress.enabled = true;
    this.onkeyup.enabled = true;
    this.oninput.enabled = true;
    this.oncompositionstart.enabled = true;
    this.oncompositionend.enabled = true;
    this.inputWithMapping.enabled = true;
    this.inputWithNoMapping.enabled = true;
    this.enableInputManager.enabled = true;
    this.disableInputManager.enabled = true;
    this.blurCommand.enabled = true;
    session.notify("initialized/inputmanager", this);
  },

  /** Uninstalls itself. 
   *  @param {Session} a session object.
   */
  "[subscribe('uninstall/inputmanager'), enabled]":
  function uninstall(session)
  {
    this._key_map = null; 
    this._processInputSequence.enabled = false;
    this.onFocusChanged.enabled = false; 
    this.focus.enabled = false;
    this.blur.enabled = false;
    this.onkeypress.enabled = false;
    this.onkeyup.enabled = false;
    this.oninput.enabled = false;
    this.oncompositionstart.enabled = false;
    this.oncompositionend.enabled = false;
    this.inputWithMapping.enabled = false;
    this.inputWithNoMapping.enabled = false;
    this.enableInputManager.enabled = false;
    this.disableInputManager.enabled = false;
    this.blurCommand.enabled = false;
    this._textbox.parentNode.removeChild(this._textbox);
  },

  /** Send input sequences to TTY device. 
   *  @param {String} data a text message in Unicode string.
   *  @notify command/send-to-tty
   */ 
  "[subscribe('command/input-text')]":
  function _processInputSequence(data)
  {
    if (data) {
      let message = this.dependency["encoder"].encode(data);
      let session = this._broker;
      session.notify("command/send-to-tty", message);
    }
  },

  /** Makes input event handler enabled. */
  "[subscribe('command/enable-input-manager')]":
  function enableInputManager() 
  {
    this.onkeypress.enabled = true;
    this.oninput.enabled = true;
  },

  /** Makes input event handler disabled. */
  "[subscribe('command/disable-input-manager')]":
  function disableInputManager() 
  {
    this.onkeypress.enabled = false;
    this.oninput.enabled = false;
  },

  /** get focus on the textbox elment. */
  "[subscribe('command/focus')]":
  function focus() 
  {
    // call focus() 2 times.
    this._textbox.focus(); // <-- blur out for current element.
    this._textbox.focus(); // <-- blur out for current element.
    this._textbox.focus(); // <-- blur out for current element.
    this._textbox.focus(); // <-- set focus to textbox element.
  },

  "[command('blur', []), nmap('<M-z>', '<C-S-Z>'), _('Blur tanasinn window')]":
  function blurCommand() 
  {
    coUtils.Timer.setTimeout(function() {
      this.blur();
    }, 100, this);
  },

  /** blur focus from the textbox elment. */
  "[subscribe('command/blur')]":
  function blur() 
  {
    this._textbox.blur(); // raise blur event.
    let session = this._broker;
    let document = session.window.document;
    if (document) {
      let dispatcher = document.commandDispatcher;
      if (dispatcher) {
        dispatcher.rewindFocus();
      }
    }
    return true;
  },

  "[subscribe('event/focus-changed')]":
  function onFocusChanged(focused_element)
  {
    let target = this._textbox;
    let session = this._broker;
    let center = session.uniget(
      "command/query-selector", 
      "#tanasinn_center_area");
    if (target.isEqualNode(focused_element)) {
      center.style.opacity = 1.00;
    } else {
      center.style.opacity = 0.60;
    }
  },

  /** getter of the textbox element. */
  getInputField: function getInputField() 
  {
    return this._textbox;
  },

  "[listen('keyup', '#tanasinn_default_input', true)]":
  function onkeyup(event) 
  { // nothrow
    //this._textbox.focus();
    if (16 == event.keyCode &&
        16 == event.which &&
        !event.ctrlKey &&
        !event.altKey &&
        !event.isChar
        ) {
      let now = parseInt(new Date().getTime());
      if (now - this._last_ctrlkey_time < 350) {
        let session = this._broker;
        session.notify("command/enable-commandline")
        this._last_ctrlkey_time = 0;
      } else {
        this._last_ctrlkey_time = now;
      }
    }
  },

  /** Keypress event handler. 
   *  @param {Event} event A event object.
   */
  "[listen('keypress', '#tanasinn_default_input', true)]":
  function onkeypress(event) 
  { // nothrow
    event.preventDefault();
    let packed_code = coUtils.Keyboard.getPackedKeycodeFromEvent(event);
    if (this.debug_mode) {
      let session = this._broker;
      session.notify(
        "command/report-status-message", 
        <>
code:{event.keyCode},
which:{event.which},
shift:{event.shiftKey?"t":"f"},
ctl:{event.ctrlKey?"t":"f"},
alt:{event.altKey?"t":"f"},
meta:{event.metaKey?"t":"f"},
char:{event.isChar?"t":"f"},
{coUtils.Keyboard.convertCodeToExpression(packed_code)}
        </>);
    };
    this.inputWithMapping(packed_code);
  },

  "[subscribe('command/input-with-mapping')]": 
  function inputWithMapping(packed_code)
  {
    let session = this._broker;
    let result = session.uniget(<>event/normal-input</>, {
      textbox: this._textbox, 
      code: packed_code,
    });
    if (!result) {
      this.inputWithNoMapping(packed_code);
    }
  },

  "[subscribe('command/input-with-no-mapping')]": 
  function inputWithNoMapping(packed_code)
  {
    let message = this._key_map[packed_code];
    let c = packed_code & 0xffffff;// event.which;
    if (!message) {
      if (packed_code & (1 << coUtils.Keyboard.KEY_CTRL | 
                         1 << coUtils.Keyboard.KEY_ALT)) {
        if (0x20 <= c && c < 0x7f) {
          return; 
        }
      }
      message = String.fromCharCode(c);
    }
    let session = this._broker;
    session.notify("event/before-input", message);
    this._processInputSequence(message);
  },
  
  /** compositionstart event handler. 
   *  @{Event} event A event object.
   */
  "[listen('compositionstart', '#tanasinn_default_input')]":
  function oncompositionstart(event) 
  {
    this.oninput.enabled = false;
  },
  
  /** compositionend event handler. 
   *  @{Event} event A event object.
   */
  "[listen('compositionend', '#tanasinn_default_input')]":
  function oncompositionend(event) 
  {
    this.oninput.enabled = true;
  },
  
  /** input event handler. 
   *  @param {Event} event A event object.
   *  @notify event/input Notifies that a input event is occured.
   */
  "[listen('input', '#tanasinn_default_input')]":
  function oninput(event) 
  {
    let broker = this._broker;
    let value = this._textbox.value;
    this._textbox.value = "";
    broker.notify("command/input-text", value);
  }
};

/**
 * @fn main
 * @brief Module entry point.
 * @param {Broker} broker The Broker object.
 */
function main(broker) 
{
  new InputManager(broker);
}

