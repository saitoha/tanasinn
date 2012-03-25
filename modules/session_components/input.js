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
 * @class ModeManager
 */
let ModeManager = new Class().extends(Plugin);
ModeManager.definition = {

  get id()
    "modemanager",

  "[persistable] enabled_when_startup": true,

  _modes: null,
  _mode: "normal",

  /** Installs itself. 
   *  @param {Session} a session object.
   *  @notify collection-changed/modes
   */
  "[subscribe('install/modemanager'), enabled]":
  function install(session)
  {
    this._modes = session.notify("get/modes");
    this.onScanKeycode.enabled = true;
    this.onScanKeycodeWithoutMapping.enabled = true;
    this.onModeChanged.enabled = true;
  },

  /** Uninstalls itself. 
   *  @param {Session} a session object.
   */
  "[subscribe('uninstall/modemanager'), enabled]":
  function uninstall(session)
  {
    this._modes = null;
    this.onScanKeycode.enabled = false;
    this.onScanKeycodeWithoutMapping.enabled = false;
    this.onModeChanged.enabled = false;
  },

  "[subscribe('event/scan-keycode')]":
  function onScanKeycode(info) 
  {
    let session = this._broker;
    let mode = info.mode || this._mode;
    let code = info.code;
    if ("normal" == mode) {
      session.notify('command/input-with-remapping', info); 
    } else if ("commandline" == mode) {
      session.notify('event/keypress-commandline-with-remapping', code); 
    } else {
      throw coUtils.Debug.Exception(_("Unknown mode is specified: %s."), mode);
    }
  },

  "[subscribe('event/scan-keycode-with-no-remapping')]":
  function onScanKeycodeWithoutMapping(info) 
  {
    let broker = this._broker;
    let mode = info.mode || this._mode;
    let code = info.code;
    if ("normal" == mode) {
      broker.notify('command/input-with-no-remapping', info); 
    } else if ("commandline" == mode) {
      broker.notify('event/keypress-commandline-with-no-remapping', code); 
    } else {
      throw coUtils.Debug.Exception(_("Unknown mode is specified: %s."), mode);
    }
  },

  "[command('sendkeys/sk'), enabled]":
  function sendkeys(arguments_string) 
  {
    let broker = this._broker;
    broker.notify("command/input-expression-with-remapping", arguments_string);
    return {
      result: true,
    };
  },

  "[subscribe('command/input-expression-with-remapping'), enabled]":
  function inputExpressionWithMapping(expression) 
  {
    let packed_code_array = coUtils.Keyboard.parseKeymapExpression(expression);
    let broker = this._broker;
    packed_code_array.forEach(function(packed_code) {
      broker.notify("event/scan-keycode", { code: packed_code });
    }, this);
    return true;
  },

  "[subscribe('command/input-expression-with-no-remapping'), enabled]":
  function inputExpressionWithNoRemapping(expression) 
  {
    let packed_code_array = coUtils.Keyboard.parseKeymapExpression(expression);
    let broker = this._broker;
    packed_code_array.forEach(function(packed_code) {
      broker.notify("event/scan-keycode-with-no-remapping", { code: packed_code });
    }, this);
    return true;
  },

  "[subscribe('command/input')]":
  function input(sequence)
  {
  },

  "[subscribe('event/mode-changed')]":
  function onModeChanged(mode)
  {
    this._mode = mode;
  },

};


/**
 * @class NormalMode
 */
let NormalMode = new Class().extends(Plugin);
NormalMode.definition = {

  get id()
    "normalmode",

  "[persistable] enabled_when_startup": true,

  /** Installs itself. 
   *  @param {Session} a session object.
   *  @notify collection-changed/modes
   */
  "[subscribe('install/normalmode'), enabled]":
  function install(session)
  {
  },

  /** Uninstalls itself. 
   *  @param {Session} a session object.
   */
  "[subscribe('uninstall/normalmode'), enabled]":
  function uninstall(session)
  {
  },

};

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
        tagName: "textbox",
        className: "plain",
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

  "[persistable] enabled_when_startup": true,

  "[persistable, _('whether keypress event will be traced.')] debug_flag": false,

  "[persistable, _('where keypress event will be traced.')] debug_topic": "command/report-overlay-message",

  _key_map: null,

  /** Installs itself. 
   *  @param {Session} a session object.
   *  @notify collection-changed/modes
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
    if ("Darwin" == coUtils.Runtime.os) {
    this.onkeyup.enabled = true;
    }
    this.onDoubleShift.enabled = true;
    this.oninput.enabled = true;
    this.oncompositionstart.enabled = true;
    this.oncompositionend.enabled = true;
    this.switchToCommandline.enabled = true;
    this.inputWithMapping.enabled = true;
    this.inputWithNoMapping.enabled = true;
    this.enableInputManager.enabled = true;
    this.disableInputManager.enabled = true;
    this.blurCommand.enabled = true;
    this.onModesRequested.enabled = true;
    session.notify("event/collection-changed/modes");
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
    if ("Darwin" == coUtils.Runtime.os) {
    this.onkeyup.enabled = false;
    }
    this.onDoubleShift.enabled = false;
    this.oninput.enabled = false;
    this.oncompositionstart.enabled = false;
    this.oncompositionend.enabled = false;
    this.switchToCommandline.enabled = false;
    this.inputWithMapping.enabled = false;
    this.inputWithNoMapping.enabled = false;
    this.enableInputManager.enabled = false;
    this.disableInputManager.enabled = false;
    this.blurCommand.enabled = false;
    this.onModesRequested.enabled = false;
    this._textbox.parentNode.removeChild(this._textbox);
    session.notify("event/collection-changed/modes");
  },

  "[subscribe('install/inputmanager')]":
  function onModesRequested()
  {
    return this;
  },

  /** Makes input event handler enabled. */
  "[subscribe('command/enable-input-manager')]":
  function enableInputManager() 
  {
    this.onkeypress.enabled = true;
    this.onkeyup.enabled = true;
    this.oninput.enabled = true;
  },

  /** Makes input event handler disabled. */
  "[subscribe('command/disable-input-manager')]":
  function disableInputManager() 
  {
    this.onkeypress.enabled = false;
    this.onkeyup.enabled = false;
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
    let session = this._broker; 
    session.notify("event/mode-changed", "normal");
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
    /*
    let target = this._textbox;
    let session = this._broker;
    let center = session.uniget(
      "command/query-selector", 
      "#tanasinn_center_area");
    if (target.isEqualNode(focused_element)) {
      center.style.opacity = 1.00;
    } else {
      center.style.opacity = 1.00;
    }
    */
  },

  /** getter of the textbox element. */
  getInputField: function getInputField() 
  {
    return this._textbox;
  },

  "[subscribe('event/hotkey-double-shift')]":
  function onDoubleShift(event) 
  {
    let session = this._broker;
    session.notify("command/input-expression-with-remapping", "<2-shift>")
  },

  "[nmap('<2-shift>', '<cmode>')]":
  function switchToCommandline(event) 
  { // nothrow
    let session = this._broker;
    session.notify("command/enable-commandline")
  },

  /** Keypress event handler. 
   *  @param {Event} event A event object.
   */
  "[listen('keyup', '#tanasinn_default_input', true)]":
  function onkeyup(event) 
  { // nothrow
    if (0x20 == event.keyCode
        && 0x20 == event.which
        && event.ctrlKey) {
      this.onkeypress(event);
    }
  },

  /** Keypress event handler. 
   *  @param {Event} event A event object.
   */
  "[listen('keypress', '#tanasinn_default_input', true)]":
  function onkeypress(event) 
  { // nothrow

    event.preventDefault();
    event.stopPropagation();

    if (0x00 == event.keyCode
        && 0x20 == event.which
        && event.ctrlKey) {
      event.keyCode = 0x20;
      event.isChar = false;
    }

    let packed_code = coUtils.Keyboard
      .getPackedKeycodeFromEvent(event);

    let broker = this._broker;
    if (this.debug_flag) {
      broker.notify(
        this.debug_topic, 
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
    }
    broker.notify("event/scan-keycode", {
      mode: "normal", 
      code: packed_code,
    });
  },
  

  "[subscribe('command/input-with-remapping')]": 
  function inputWithMapping(info)
  {
    let broker = this._broker;
    let result = broker.uniget("event/normal-input", {
      textbox: this._textbox, 
      code: info.code,
    });
    if (!result && !(info.code & 1 << coUtils.Keyboard.KEY_MODE)) {
      this.inputWithNoMapping(info.code);
    }
  },

  "[subscribe('command/input-with-no-remapping')]": 
  function inputWithNoMapping(packed_code)
  {
    let c = packed_code & 0xffffff;// event.which;
    let message = this._key_map[packed_code];
    if (!message) {
      if (packed_code & (1 << coUtils.Keyboard.KEY_CTRL | 
                         1 << coUtils.Keyboard.KEY_ALT)) {
        if (0x20 <= c && c < 0x7f) {
          return; 
        }
      }
      message = String.fromCharCode(c);
    }
    let broker = this._broker;
    broker.notify("event/before-input", message);
    broker.notify("command/input-text", message);
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
//    broker.notify("command/report-status-message", "input: " + value);
    broker.notify("command/input-text", value);
  },
 
  /** compositionstart event handler. 
   *  @{Event} event A event object.
   */
  "[listen('compositionstart', '#tanasinn_default_input')]":
  function oncompositionstart(event) 
  {
      let version_comparator = Components
        .classes["@mozilla.org/xpcom/version-comparator;1"]
        .getService(Components.interfaces.nsIVersionComparator);
      if (version_comparator.compare(coUtils.Runtime.version, "10.0") >= 0)
      {
        this.oninput.enabled = false;
      }
  },
  
  /** compositionend event handler. 
   *  @{Event} event A event object.
   */
  "[listen('compositionend', '#tanasinn_default_input')]":
  function oncompositionend(event) 
  {
      let version_comparator = Components
        .classes["@mozilla.org/xpcom/version-comparator;1"]
        .getService(Components.interfaces.nsIVersionComparator);
      if (version_comparator.compare(coUtils.Runtime.version, "10.0") >= 0)
      {
        this.oninput.enabled = true;
        this.oninput(event);
      }
  },
  
};

/**
 * @fn main
 * @brief Module entry point.
 * @param {Broker} broker The Broker object.
 */
function main(broker) 
{
  new ModeManager(broker);
  new NormalMode(broker);
  new InputManager(broker);
}

