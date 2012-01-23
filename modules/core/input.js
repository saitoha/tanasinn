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

function getPackedKeycodeFromEvent(event) 
{
  let os = coUtils.Runtime.os;
  if ("WINNT" == os) {
    getPackedKeycodeFromEvent = function(event) 
    {
      let code = event.keyCode || event.which;
      let packed_code = code 
        | !!event.ctrlKey   << coUtils.Keyboard.KEY_CTRL 
        | !!event.altKey    << coUtils.Keyboard.KEY_ALT 
        | !!event.shiftKey  << coUtils.Keyboard.KEY_SHIFT 
        | !!event.keyCode                   << coUtils.Keyboard.KEY_NOCHAR
//        | (0 != event.keyCode && 0 == event.which) << coUtils.Keyboard.KEY_NOCHAR 
//        | !event.isChar     << coUtils.Keyboard.KEY_NOCHAR 
        | !!event.metaKey   << coUtils.Keyboard.KEY_META
        ;
      return packed_code;
    }
  } else if ("Darwin" == os) {
    getPackedKeycodeFromEvent = function(event) 
    {
      let code = event.keyCode || event.which;
      let packed_code = code 
        | !!event.ctrlKey                 << coUtils.Keyboard.KEY_CTRL 
        | (!!event.altKey || code > 0xff) << coUtils.Keyboard.KEY_ALT 
        | !!event.shiftKey                << coUtils.Keyboard.KEY_SHIFT 
//        | (0 != event.keyCode && 0 == event.which) << coUtils.Keyboard.KEY_NOCHAR 
        | !!event.keyCode                   << coUtils.Keyboard.KEY_NOCHAR
//        | 0 == event.which                << coUtils.Keyboard.KEY_NOCHAR 
//        | !event.isChar                   << coUtils.Keyboard.KEY_NOCHAR 
        | !!event.metaKey                 << coUtils.Keyboard.KEY_META
        ;
      return packed_code;
    }
  } else /* Linux */ {
    getPackedKeycodeFromEvent = function(event) 
    {
      let code = event.keyCode || event.which;
      let packed_code = code 
        | !!event.ctrlKey                 << coUtils.Keyboard.KEY_CTRL 
        | !!event.altKey                  << coUtils.Keyboard.KEY_ALT 
        | !!event.shiftKey                << coUtils.Keyboard.KEY_SHIFT 
        | !!event.keyCode                   << coUtils.Keyboard.KEY_NOCHAR
//        | !event.isChar                   << coUtils.Keyboard.KEY_NOCHAR 
        | !!event.metaKey                 << coUtils.Keyboard.KEY_META
        ;
      return packed_code;
    }
  }
     /* 
      coUtils.Debug.reportMessage(
        "code: %s, ctrl: %s, alt: %s, shift: %s, meta: %s",
        code,
        event.ctrlKey,
        event.altKey,
        event.shiftKey,
        event.meta
        );
        */
        
  return getPackedKeycodeFromEvent(event);
};


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
let InputManager = new Class().extends(Plugin);
InputManager.definition = {

  get id()
    "inputmanager",

  get template()
    ({ 
      parentNode: "#tanasinn_center_area",
      tagName: "bulletinboard",
//      style: "border: solid 1px red",
      childNodes: {
        //tagName: "textbox",
        tagName: "html:input",
        id: "tanasinn_default_input",
        style: <> 
          ime-mode: disabled;
          border: 0px; 
          opacity: 0;
        </>,
        top: 0,
        left: 0,
      },
    }),

  _key_map: null,

  /** post-constructor */
  "[subscribe('initialized/{chrome & encoder}'), enabled]": 
  function onLoad(chrome, encoder) 
  {
    this._encoder = encoder;
    this.enabled = this.enabled_when_startup;
  },

  /** Installs itself. 
   *  @param {Session} a session object.
   *  @notify initialized/inputmanager
   */
  "[subscribe('install/' + this.id)]":
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
    this.onkeydown.enabled = true;
    this.onkeyup.enabled = true;
    this.oninput.enabled = true;
    this.enableInputManager.enabled = true;
    this.disableInputManager.enabled = true;
    session.notify("initialized/inputmanager", this);
  },

  /** Uninstalls itself. 
   *  @param {Session} a session object.
   */
  "[subscribe('uninstall/' + this.id)]":
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
    this.enableInputManager.enabled = false;
    this.disableInputManager.enabled = false;
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
      let message = this._encoder.encode(data);
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

  /** blur focus from the textbox elment. */
  "[subscribe('command/blur'), key('meta + z'), _('Hide tanasinn')]":
  function blur() 
  {
    this._textbox.blur(); // raise blur event.
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

  /** Keydown event handler. 
   *  @param {Event} event A event object.
   */
  "[listen('keydown', '#tanasinn_default_input', true)]":
  function onkeydown(event) 
  { // nothrow
  //      
      this._broker.notify(
        "command/report-status-message", 
<>
  keyCode: {event.keyCode}, 
  which: {event.which}, 
  shift: {event.shiftKey}, 
  ctrl: {event.ctrlKey}, 
  alt: {event.altKey}, 
  meta: {event.metaKey},
  ischar: {event.isChar},
</>);

      try {
    if (event.ctrlKey && event.keyCode == event.which) {
      let map = { 
        9   :null,  // <C-Tab>
        13  :null,  // <C-Enter>
        27  :null,  // <C-Esc>
        32  :null,  // <C-Space>
        48  :null,  // <C-0>
        49  :null,  // <C-1>
        50  :null,  // <C-2>
        51  :null,  // <C-3>
        52  :null,  // <C-4>
        53  :null,  // <C-5>
        54  :null,  // <C-6>
        55  :null,  // <C-7>
        56  :null,  // <C-8>
        57  :null,  // <C-9>
        59  :null,  // <C-;>
        109 :null,  // <C-\->
        188 :null,  // <C-,>
        190 :null,  // <C-.>
        191 :null,  // <C-/>
        219 :null,  // <C-[>
        221 :null,  // <C-[>
      }
      if (null === map[event.keyCode]) {
        //this._processKeyEvent(event);
      }
    }
      } catch(e) {alert(e)}
  
  },

  /** Keypress event handler. 
   *  @param {Event} event A event object.
   */
  "[listen('keypress', '#tanasinn_default_input', true)]":
  function onkeypress(event) 
  { // nothrow
    this._processKeyEvent(event);
  },

  _processKeyEvent: function _processKeyEvent(event)
  {
    try {

    let packed_code = getPackedKeycodeFromEvent(event);
    let info = { 
      event: event, 
      packedCode: packed_code, 
      handled: false,
    };
    let session = this._broker;
    session.notify(<>key-pressed/{packed_code}</>, info);
    if (info.handled) {
      event.preventDefault();
    } else {
      let message = this._key_map[packed_code] 
      if (!message) {
        if (packed_code & (1 << coUtils.Keyboard.KEY_CTRL | 
                           1 << coUtils.Keyboard.KEY_ALT)) {
          if (0x20 <= event.which && event.which < 0x7f) {
            return; 
          }
        }
        message = String.fromCharCode(packed_code & 0xfffff);
      }
      session.notify("event/before-input", message);
      //session.notify(
      //  "command/report-overlay-message", event.keyCode + " " + event.which);

//      
//      session.notify(
//        "command/report-status-message", 
//        String.fromCharCode(packed_code & 0xffff) + " " +
//<>
//  keyCode: {event.keyCode}, 
//  which: {event.which}, 
//  shift: {event.shiftKey}, 
//  ctrl: {event.ctrlKey}, 
//  alt: {event.altKey}, 
//  meta: {event.metaKey},
//  ischar: {event.isChar},
//</>
//        + " -> " + message);
      
      this._processInputSequence(message);
      event.preventDefault();
    }
    } catch(e) {alert(e)}
  },

  /** input event handler. 
   *  @{Event} event A event object.
   *  @notify event/input Notifies that a input event is occured.
   */
  "[listen('input', '#tanasinn_default_input')]":
  function oninput(event) 
  {
    let session = this._broker;
    session.notify("event/input", event);
  }
} 

/**
 * @fn main
 * @brief Module entry point.
 * @param {Desktop} desktop The Desktop object.
 */
function main(desktop) 
{
  desktop.subscribe(
    "@initialized/broker", 
    function(session) new InputManager(session));
}

