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

//
// Key mappings.
//

var KEY_ANSI = {
  "Ctrl Space"    : "\x00", //  NUL
  "Ctrl `"        : "\x00", //  NUL
  "Ctrl 2"        : "\x00", //  NUL
  "Ctrl a"        : "\x01", //  SOH
  "Ctrl b"        : "\x02", //  STX
  "Ctrl c"        : "\x03", //  ETX
  "Ctrl d"        : "\x04", //  EOT
  "Ctrl e"        : "\x05", //  ENQ
  "Ctrl f"        : "\x06", //  ACK
  "Ctrl g"        : "\x07", //  BEL
  "Ctrl h"        : "\x08", //  BS
  "Ctrl i"        : "\x09", //  HT
  "Ctrl j"        : "\x0a", //  LF
  "Ctrl k"        : "\x0b", //  VT
  "Ctrl l"        : "\x0c", //  FF
  "Ctrl m"        : "\x0d", //  CR
  "Ctrl n"        : "\x0e", //  SO
  "Ctrl o"        : "\x0f", //  SI
  "Ctrl p"        : "\x10", //  DLE
  "Ctrl q"        : "\x11", //  DC1
  "Ctrl r"        : "\x12", //  DC2
  "Ctrl s"        : "\x13", //  DC3
  "Ctrl t"        : "\x14", //  DC4
  "Ctrl u"        : "\x15", //  NAK
  "Ctrl v"        : "\x16", //  SYN
  "Ctrl w"        : "\x17", //  ETB
  "Ctrl x"        : "\x18", //  CAN
  "Ctrl y"        : "\x19", //  EM
  "Ctrl z"        : "\x1a", //  SUB
  "Ctrl ["        : "\x1b", //  ESC
  "Ctrl 3"        : "\x1b", //  ESC
  "Ctrl \\"       : "\x1c", //  FS
  "Ctrl |"        : "\x1c", //  FS
  "Ctrl ]"        : "\x1d", //  GS
  "Ctrl ^"        : "\x1e", //  RS
  "Ctrl /"        : "\x1f", //  US
  "Ctrl Shift ?"  : "\x1f", //  US
  "Ctrl _"        : "\x1f", //  US
};


var KEY_NORMAL_CURSOR = {
  "Left"   : "\x1b[D",  // kl / kcub1
  "Up"     : "\x1b[A",  // ku / kcuu1
  "Right"  : "\x1b[C",  // kr / kcuf1
  "Down"   : "\x1b[B",  // kd / kcud1
};

var KEY_APPLICATION_CURSOR = {
  "Left"   : "\x1bOD",  // kl / kcub1
  "Up"     : "\x1bOA",  // ku / kcuu1
  "Right"  : "\x1bOC",  // kr / kcuf1
  "Down"   : "\x1bOB",  // kd / kcud1
};

var KEY_VT52_CURSOR = {
  "Left"   : "\x1bD",  // kl / kcub1
  "Up"     : "\x1bA",  // ku / kcuu1
  "Right"  : "\x1bC",  // kr / kcuf1
  "Down"   : "\x1bB",  // kd / kcud1
};

var KEY_NORMAL_KEYPAD = {

  "PgUp"   : "\x1b[5~", // kP / kpp 
  "PgDn"   : "\x1b[6~", // kN / knp
  "End"    : "\x1b[4~", // @7 / kend
  "Home"   : "\x1b[1~", // kh / khome
  "Ins"    : "\x1b[2~",
  "Del"    : "\x1b[3~",
  "F1"     : "\x1bOP",
  "F2"     : "\x1bOQ",
  "F3"     : "\x1bOR",
  "F4"     : "\x1bOS",
  "F5"     : "\x1b[15~",
  "F6"     : "\x1b[17~",
  "F7"     : "\x1b[18~",
  "F8"     : "\x1b[19~",
  "F9"     : "\x1b[20~",
  "F10"    : "\x1b[21~",
  "F11"    : "\x1b[23~",
  "F12"    : "\x1b[24~",

  "Shift PgUp" : "\x1b[5~",
  "Shift PgDn" : "\x1b[6~",
  "Shift End"  : "\x1b[4~",
  "Shift Home" : "\x1b[1~",
  "Shift Ins"  : "\x1b[2~",
  "Shift Del"  : "\x1b[3~",
  "Shift F1"   : "\x1b[25~",
  "Shift F2"   : "\x1b[26~",
  "Shift F3"   : "\x1b[28~",
  "Shift F4"   : "\x1b[29~",
  "Shift F5"   : "\x1b[31~",
  "Shift F6"   : "\x1b[32~",
  "Shift F7"   : "\x1b[33~",
  "Shift F8"   : "\x1b[34~",
};

var KEY_APPLICATION_KEYPAD = {

  "PgUp"   : "\x1b[5~", // kP / kpp 
  "PgDn"   : "\x1b[6~", // kN / knp
  "End"    : "\x1b[4~", // @7 / kend
  "Home"   : "\x1b[1~", // kh / khome
  "Ins"    : "\x1b[2~",
  "Del"    : "\x1b[3~",
  "F1"     : "\x1bOP",
  "F2"     : "\x1bOQ",
  "F3"     : "\x1bOR",
  "F4"     : "\x1bOS",
  "F5"     : "\x1b[15~",
  "F6"     : "\x1b[17~",
  "F7"     : "\x1b[18~",
  "F8"     : "\x1b[19~",
  "F9"     : "\x1b[20~",
  "F10"    : "\x1b[21~",
  "F11"    : "\x1b[23~",
  "F12"    : "\x1b[24~",

  "Shift PgUp" : "\x1b[5~",
  "Shift PgDn" : "\x1b[6~",
  "Shift End"  : "\x1b[4~",
  "Shift Home" : "\x1b[1~",
  "Shift Ins"  : "\x1b[2~",
  "Shift Del"  : "\x1b[3~",
  "Shift F1"   : "\x1b[25~",
  "Shift F2"   : "\x1b[26~",
  "Shift F3"   : "\x1b[28~",
  "Shift F4"   : "\x1b[29~",
  "Shift F5"   : "\x1b[31~",
  "Shift F6"   : "\x1b[32~",
  "Shift F7"   : "\x1b[33~",
  "Shift F8"   : "\x1b[34~",

};


var KEY_YEN_AS_5C = {
  "\xa5"       : "\x5c",
};

var KEY_WON_AS_5C = {
  "\u20a9"     : "\x5c",
};

var KEY_BACKSPACE_AS_DEL = {
  "backspace"  : "\x7f",
};

var KEY_DELETE_AS_FUNC = {
  "delete"     : "\x1b[3~",
};

var KEY_MAC_ALT_AS_META = {
  // For mac
  "Alt \u0061" : "\x1ba",
  "Alt \u0062" : "\x1bb",
  "Alt \u0063" : "\x1bc",
  "Alt \u0064" : "\x1bd",
  "Alt \u0065" : "\x1be",
  "Alt \u0066" : "\x1bf",
  "Alt \u0067" : "\x1bg",
  "Alt \u0068" : "\x1bh",
  "Alt \u0069" : "\x1bi",
  "Alt \u006a" : "\x1bj",
  "Alt \u006b" : "\x1bk",
  "Alt \u006c" : "\x1bl",
  "Alt \u006d" : "\x1bm",
  "Alt \u006e" : "\x1bn",
  "Alt \u006f" : "\x1bo",
  "Alt \u0070" : "\x1bp",
  "Alt \u0071" : "\x1bq",
  "Alt \u0072" : "\x1br",
  "Alt \u0073" : "\x1bs",
  "Alt \u0074" : "\x1bt",
  "Alt \u0075" : "\x1bu",
  "Alt \u0076" : "\x1bv",
  "Alt \u0077" : "\x1bw",
  "Alt \u0078" : "\x1bx",
  "Alt \u0079" : "\x1by",
  "Alt \u007a" : "\x1bz",
  "Alt \u00a1" : "\x1b1",
  "Alt \u2122" : "\x1b2",
  "Alt \u00a3" : "\x1b3",
  "Alt \u00a2" : "\x1b4",
  "Alt \u221e" : "\x1b5",
  "Alt \u00a7" : "\x1b6",
  "Alt \u00b6" : "\x1b7",
  "Alt \u2022" : "\x1b8",
  "Alt \u00aa" : "\x1b9",
  "Alt \u00ba" : "\x1b0",
  "Alt \u2013" : "\x1b-",
  "Alt \u2260" : "\x1b^",
  "Alt \u0153" : "\x1bq",
  "Alt \u2211" : "\x1bw",
  "Alt \u00ae" : "\x1br",
  "Alt \u2020" : "\x1bt",
  "Alt \u00a5" : "\x1by",
  "Alt \u00f8" : "\x1bo",
  "Alt \u03c0" : "\x1bp",
  "Alt \u201c" : "\x1b@",
  "Alt \u2018" : "\x1b[",
  "Alt \u00e5" : "\x1ba",
  "Alt \u00df" : "\x1bs",
  "Alt \u2202" : "\x1bd",
  "Alt \u0192" : "\x1bf",
  "Alt \u00a9" : "\x1bg",
  "Alt \u02d9" : "\x1bh",
  "Alt \u2206" : "\x1bj",
  "Alt \u02da" : "\x1bk",
  "Alt \u00ac" : "\x1bl",
  "Alt \u2026" : "\x1b;",
  "Alt \u00e6" : "\x1b:",
  "Alt \u00ab" : "\x1b]",
  "Alt \u03a9" : "\x1bz",
  "Alt \u2248" : "\x1bx",
  "Alt \u00e7" : "\x1bc",
  "Alt \u221a" : "\x1bv",
  "Alt \u222b" : "\x1bb",
  "Alt \u00b5" : "\x1bm",
  "Alt \u2264" : "\x1b,",
  "Alt \u2265" : "\x1b.",
  "Alt \u00f7" : "\x1b/", 

  "Alt Shift \u2044" : "\x1b!",
  "Alt Shift \u20ac" : "\x1b\"",
  "Alt Shift \u2039" : "\x1b#",
  "Alt Shift \u203a" : "\x1b$",
  "Alt Shift \ufb01" : "\x1b%",
  "Alt Shift \ufb02" : "\x1b&",
  "Alt Shift \u2021" : "\x1b'",
  "Alt Shift \u00b0" : "\x1b(",
  "Alt Shift \u00b7" : "\x1b)",
  "Alt Shift \u201a" : "\x1b0",
  "Alt Shift \u2014" : "\x1b=",
  "Alt Shift \u00b1" : "\x1b~",
  "Alt Shift \u007c" : "\x1b|",
  "Alt Shift \u0152" : "\x1bQ",
  "Alt Shift \u201e" : "\x1bW",
  "Alt Shift \u00b4" : "\x1bE",
  "Alt Shift \u2030" : "\x1bR",
  "Alt Shift \u02c7" : "\x1bT",
  "Alt Shift \u00c1" : "\x1bY",
  "Alt Shift \u00a8" : "\x1bU",
  "Alt Shift \u02c6" : "\x1bI",
  "Alt Shift \u00d8" : "\x1bO",
  "Alt Shift \u220f" : "\x1bP",
  "Alt Shift \u201d" : "\x1b`",
  "Alt Shift \u2019" : "\x1b\x7b",
  "Alt Shift \u00c5" : "\x1bA",
  "Alt Shift \u00cd" : "\x1bS",
  "Alt Shift \u00ce" : "\x1bD",
  "Alt Shift \u0129" : "\x1bF",
  "Alt Shift \u02dd" : "\x1bG",
  "Alt Shift \u00d3" : "\x1bH",
  "Alt Shift \u00d4" : "\x1bJ",
  "Alt Shift \uf8ff" : "\x1bK",
  "Alt Shift \u00d2" : "\x1bL",
  "Alt Shift \u00da" : "\x1b+",
  "Alt Shift \u00c6" : "\x1b*",
  "Alt Shift \u00bb" : "\x1b\x7d",
  "Alt Shift \u00b8" : "\x1bZ",
  "Alt Shift \u02db" : "\x1bX",
  "Alt Shift \u00c7" : "\x1bC",
  "Alt Shift \u25ca" : "\x1bV",
  "Alt Shift \u0131" : "\x1bB",
  "Alt Shift \u00c2" : "\x1bM",
  "Alt Shift \u00af" : "\x1b\x3c",
  "Alt Shift \u02d8" : "\x1b\x3e",
  "Alt Shift \u00bf" : "\x1b?",
  "Alt Shift \u0060" : "\x1b_",
};

function coCreateKeyMap(expression_map, destination_map) 
{
  var map = destination_map || {},
      key,
      value,
      tokens,
      code;

  for ([key, value] in Iterator(expression_map)) 
  {
    tokens = key.split(/[\s\t]+/);
    code = tokens.pop();
    code = coUtils.Keyboard.KEYNAME_PACKEDCODE_MAP[code.toLowerCase()]
         || code.replace(/\\x([0-9a-fA-F]+)/g, 
              function(key) 
              {
                var code;
                code = parseInt(key, 16);
                return String.fromCharCode(code);
              }).charCodeAt(0);
    code = tokens.reduce(
        function(code, token) 
        {
          return code | 0x1 << { 
              ctrl: coUtils.Constant.KEY_CTRL,// | coUtils.Constant.KEY_NOCHAR, 
              alt: coUtils.Constant.KEY_ALT, 
              shift: coUtils.Constant.KEY_SHIFT, 
              meta: coUtils.Constant.KEY_META,// | coUtils.Constant.KEY_NOCHAR, 
            } [token.toLowerCase()];
        }, code);
    map[code] = value.replace(/\\x([0-9a-fA-F]{1,2})/g, 
        function() 
        {
          var code;
          code = parseInt(arguments[1], 16);
          return String.fromCharCode(code);
        }).replace(/\\[eE]/g, '\x1b');
  }
  return map;
}

/**
 * @class DefaultKeyMappings
 */
var DefaultKeyMappings = new Class().extends(Component);
DefaultKeyMappings.definition = {

  get id()
    "default_key_mappings",

  "[persistable] yen_as_5c": true,
  "[persistable] won_as_5c": true,
  "[persistable] mac_alt_as_meta": true,
  "[persistable] backspace_as_delete": false,
  "[persistable] delete_as_function": true,

  cursor_mode: "normal",
  application_keypad: false,

  _map: null,

  "[subscribe('command/change-cursor-mode'), enabled]":
  function onChangeCursorMode(mode)
  {
    this.cursor_mode = mode;
    this.build(this._map);
  },

  "[subscribe('command/change-mode'), enabled]":
  function onChangeEmulationMode(mode)
  {
    switch (mode) {

      case "vt100":
        this.sendMessage("command/change-cursor-mode", "normal");
        break;

      case "vt52":
        this.sendMessage("command/change-cursor-mode", "vt52");
        break;

      default:
        coUtils.Debug.reportError(
          _("Invalid emulation mode was specified: %s."), 
          mode);

    }
  },

  "[subscribe('command/build-key-mappings'), type('Object -> Undefined'), enabled]":
  function build(map)
  {
    var settings = [ KEY_ANSI ],
        i,
        setting;

    this._map = map;

    // set cursor mode
    if ("normal" === this.cursor_mode) {
      settings.push(KEY_APPLICATION_CURSOR);
    } else if ("application" === this.cursor_mode) {
      settings.push(KEY_NORMAL_CURSOR);
    } else if ("vt52" === this.cursor_mode) {
      settings.push(KEY_VT52_CURSOR);
    } else { // fallback
      coUtils.Debug.reportError(
        _("Invalid cursor mode was specified: %s."), 
        this.cursor_mode);
      settings.push(KEY_NORMAL_CURSOR);
    }

    // set keypad mode
    if (this.application_keypad) {
      settings.push(KEY_APPLICATION_KEYPAD);
    } else {
      settings.push(KEY_NORMAL_KEYPAD);
    }

    if (this.yen_as_5c) {
      settings.push(KEY_YEN_AS_5C);
    }

    if (this.won_as_5c) {
      settings.push(KEY_WON_AS_5C);
    }

    if (this.backspace_as_delete) {
      settings.push(KEY_BACKSPACE_AS_DEL);
    }

//    if (this.delete_as_function) {
//      settings.push(KEY_DELETE_AS_FUNC);
//    }
   
    // OS specific
    switch (coUtils.Runtime.os) {

      case "WINNT":
        break;

      case "Darwin":
        if (this.mac_alt_as_meta) {
          settings.push(KEY_MAC_ALT_AS_META);
        }
        break;

      default:
        break;
    }

    for (i = 0; i < settings.length; ++i) {
      setting = settings[i];
      coCreateKeyMap(setting, map);
    }
  },

  get: function get(code)
  {
    return this._map[code] || code;
  },

};

/**
 * @class ModeManager
 */
var ModeManager = new Class().extends(Plugin);
ModeManager.definition = {

  get id()
    "modemanager",

  "[persistable] enabled_when_startup": true,

  _modes: null,
  _mode: "normal",

  /** Installs itself. 
   *  @param {Broker} a broker object.
   *  @notify collection-changed/modes
   */
  "[install]":
  function install(broker)
  {
    this._modes = this.sendMessage("get/modes");
  },

  /** Uninstalls itself. 
   *  @param {Broker} a broker object.
   */
  "[uninstall]":
  function uninstall(broker)
  {
    this._modes = null;
  },

  "[subscribe('event/scan-keycode'), pnp]":
  function onScanKeycode(info) 
  {
    var mode, code;

    mode = info.mode || this._mode;
    code = info.code;

    if ("normal" === mode) {
      this.sendMessage('command/input-with-remapping', info); 
    } else if ("commandline" === mode) {
      this.sendMessage('event/keypress-commandline-with-remapping', code); 
    } else {
      throw coUtils.Debug.Exception(_("Unknown mode is specified: %s."), mode);
    }
  },

  "[subscribe('event/scan-keycode-with-no-remapping'), pnp]":
  function onScanKeycodeWithoutMapping(info) 
  {
    var mode, code;

    mode = info.mode || this._mode;
    code = info.code;

    if ("normal" === mode) {
      this.sendMessage('command/input-with-no-remapping', info); 
    } else if ("commandline" === mode) {
      this.sendMessage('event/keypress-commandline-with-no-remapping', code); 
    } else {
      throw coUtils.Debug.Exception(_("Unknown mode is specified: %s."), mode);
    }
  },

  "[command('sendkeys/sk'), pnp]":
  function sendkeys(arguments_string) 
  {
    this.sendMessage(
      "command/input-expression-with-remapping", 
      arguments_string);

    return {
      result: true,
    };
  },

  "[subscribe('command/input-expression-with-remapping'), pnp]":
  function inputExpressionWithMapping(expression) 
  {
    var packed_code_array, i, packed_code;

    packed_code_array = coUtils.Keyboard
      .parseKeymapExpression(expression);

    for (i = 0; i < packed_code_array.length; ++i) {
      packed_code = packed_code_array[i];
      this.sendMessage("event/scan-keycode", { code: packed_code });
    }
    return true;
  },

  "[subscribe('command/input-expression-with-no-remapping'), pnp]":
  function inputExpressionWithNoRemapping(expression) 
  {
    var packed_code_array, i, packed_code;

    packed_code_array = coUtils.Keyboard
      .parseKeymapExpression(expression);

    for (i = 0; i < packed_code_array.length; ++i) {
      packed_code = packed_code_array[i];
      this.sendMessage("event/scan-keycode-with-no-remapping", { 
        code: packed_code 
      });
    }
    return true;
  },

  "[subscribe('event/mode-changed'), pnp]":
  function onModeChanged(mode)
  {
    this._mode = mode;
  },

}; // plugin ModeManager


/**
 * @class MacAltKeyWatcher
 */
var MacAltKeyWatcher = new Trait();
MacAltKeyWatcher.definition = {

  _alt_on: false,

  "[subscribe('event/alt-key-down'), enabled]":
  function onAltKeyDown()
  {
    this._alt_key = true;
  },

  "[subscribe('event/alt-key-up'), enabled]":
  function onAltKeyUp()
  {
    this._alt_key = false;
  },

}; // MacAltKeyWatcher

/**
 * @class InputManager
 * @brief Listen keyboard input events and send ones to TTY device.
 */
var InputManager = new Class().extends(Plugin)
                              .mix(MacAltKeyWatcher)
                              .depends("encoder");
InputManager.definition = {

  get id()
    "inputmanager",

  get info()
  {
    return {
      name: _("Input Manager"),
      version: "0.1",
      description: _("Handle keyboard input event and send it to TTY device.")
    };
  },

  get template()
  {
    return { 
      parentNode: "#tanasinn_center_area",
      tagName: "bulletinboard",
      childNodes: {
        tagName: "textbox",
        className: "plain",
        id: "tanasinn_default_input",
        style: {
          imeMode: "disabled",
          border: "0px", 
          opacity: "0.00",
        },
        top: 0,
        left: 0,
      },
    };
  },

  "[persistable] enabled_when_startup": true,
  "[persistable] fix_for_ctrl_space": true,

  "[persistable, _('whether keypress event will be traced.')] debug_flag": 
  false,

  "[persistable, _('where keypress event will be traced.')] debug_topic": 
  "command/report-overlay-message",

  _key_map: null,
  _auto_repeat: true,

  _newlne_mode: false,
  _local_echo_mode: false,

  /** Installs itself. 
   *  @param {Broker} brokr a Broker object.
   *  @notify collection-changed/modes
   */
  "[install]":
  function install(broker)
  {
    var map, tanasinn_default_input;

    // Get [bit-packed keycode -> terminal input sequence] map
    map = {};
    this.sendMessage("command/build-key-mappings", map);
    this._key_map = map;
    tanasinn_default_input
      = this.request("command/construct-chrome", this.template)
          .tanasinn_default_input;
    this._textbox = tanasinn_default_input;
    this.sendMessage("event/collection-changed/modes");
  },

  /** Uninstalls itself. 
   *  @param {Broker} broker a Broker object.
   */
  "[uninstall]":
  function uninstall(broker)
  {
    this._key_map = null; 
    if (null !== this._textbox) {
      this._textbox.parentNode.removeChild(this._textbox);
      this._textbox = null;
    }
    this.sendMessage("event/collection-changed/modes");
  },

  "[subscribe('set/local-echo-mode'), enabled]":
  function setLocalEchoMode(value) 
  {
    this._local_echo_mode = value;
  },

  "[subscribe('set/newline-mode'), pnp]":
  function onChangeNewlineMode(mode)
  {
    this._newline_mode = mode;
  },

  "[subscribe('command/change-auto-repeat-mode'), pnp]":
  function onAutoRepeatModeChanged(mode) 
  {
    this._auto_repeat = mode;
  },

  /** Makes input event handler enabled. */
  "[subscribe('command/enable-input-manager'), pnp]":
  function enableInputManager() 
  {
    this.onkeypress.enabled = true;
    this.onkeyup.enabled = true;
    this.oninput.enabled = true;
  },

  /** Makes input event handler disabled. */
  "[subscribe('command/disable-input-manager'), pnp]":
  function disableInputManager() 
  {
    this.onkeypress.enabled = false;
    this.onkeyup.enabled = false;
    this.oninput.enabled = false;
  },

  /** get focus on the textbox elment. */
  "[subscribe('command/focus'), pnp]":
  function focus() 
  {
    // call focus() 2 times.
    this._textbox.focus(); // <-- blur out for current element.
    this._textbox.focus(); // <-- blur out for current element.
    this._textbox.focus(); // <-- blur out for current element.
    this._textbox.focus(); // <-- set focus to textbox element.
    this.sendMessage("event/mode-changed", "normal");
  },

  "[command('blur', []), nmap('<M-z>', '<C-S-Z>'), _('Blur tanasinn window'), pnp]":
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
    var owner_document = this.request("get/root-element").ownerDocument,
        dispatcher;

    this._textbox.blur(); // raise blur event.

    if (owner_document) {
      dispatcher = owner_document.commandDispatcher;
      if (dispatcher) {
        dispatcher.rewindFocus();
      }
    }
    return true;
  },

  /** getter of the textbox element. */
  getInputField: function getInputField() 
  {
    return this._textbox;
  },

  /** handle double-shift key event, and interpret it to <2-Shift> */
  "[subscribe('event/hotkey-double-shift'), enabled]":
  function onDoubleShift(event) 
  {
    this.sendMessage(
      "command/input-expression-with-remapping", 
      "<2-shift>");
  },

  /** handle <2-shift> event, and switch focus to commandline. */
  "[nmap('<2-shift>', '<cmode>'), pnp]":
  function switchToCommandline(event) 
  { // nothrow
    this.sendMessage("command/enable-commandline")
  },

  /** Keypress event handler. 
   *  @param {Event} event A event object.
   */
  "[listen('keydown', '#tanasinn_default_input', true), pnp]":
  function onkeydown(event) 
  { // nothrow
    if ("Darwin" === coUtils.Runtime.os) {
      if (this.fix_for_ctrl_space) {
        if (0x20 === event.keyCode
            && 0x20 === event.which
            && event.ctrlKey) {
          this.onkeypress(event);
        }
      }
    }
  },

  "[listen('keyup', '#tanasinn_default_input', true), pnp]":
  function onkeyup(event) 
  {
    this.onkeypress.enabled = true;
    this.oninput.enabled = true;
  },

  /** Keypress event handler. 
   *  @param {Event} event A event object.
   */
  "[listen('keypress', '#tanasinn_default_input', true), pnp]":
  function onkeypress(event) 
  { // nothrow
    if (false === this._auto_repeat) {
      this.onkeypress.enabled = false;
      this.oninput.enabled = false;
    }

    event.preventDefault();
    event.stopPropagation();

    if (0x00 === event.keyCode
        && 0x20 === event.which
        && event.ctrlKey) {
      event.keyCode = 0x20;
      event.isChar = false;
    }

    if (this.debug_flag) {
      this.sendMessage(
        this.debug_topic, 
        "code:" + event.keyCode + "," +
        "which:" + event.which + "," +
        "shift:" + event.shiftKey ? "t": "f" + "," +
        "ctl:" + event.ctrlKey ? "t": "f" + "," +
        "alt:" + event.altKey ? "t": "f" + "," +
        "meta:" + event.metaKey ? "t": "f" + "," +
        "char:" + event.isChar ? "t": "f");
    }

    this.onKeyPressEventReceived({
      mode: "normal", 
      event: event,
    });
 
  },

  "[subscribe('event/keypress'), enabled]":
  function onKeyPressEventReceived(info) 
  {
    var packed_code = coUtils.Keyboard
      .getPackedKeycodeFromEvent(info.event, this._alt_key);
      //.getPackedKeycodeFromEvent(info.event, this._alt_key);

    this.sendMessage("event/scan-keycode", {
      mode: info.mode, 
      code: packed_code,
    });
  },

  "[subscribe('command/input-with-remapping'), pnp]": 
  function inputWithMapping(info)
  {
    var result = this.request("event/normal-input", {
      textbox: this._textbox, 
      code: info.code,
    });

    if (!result && !(info.code & (1 << coUtils.Constant.KEY_MODE))) {
      this.sendMessage("command/input-with-no-remapping", info.code);
    }
  },

  "[subscribe('command/input-with-no-remapping'), pnp]": 
  function inputWithNoMapping(packed_code)
  {
    var c = packed_code & 0xffffff,
        message = this._key_map[packed_code];

    if (!message) {
      if (packed_code & (1 << coUtils.Constant.KEY_CTRL | 
                         1 << coUtils.Constant.KEY_ALT)) {
        if (0x20 <= c && c < 0x7f) {
          return; 
        }
      }
      if (0x0d === c && this._newline_mode) {
        message = "\x0d\x0a";
      } else {
        message = String.fromCharCode(c);
      }
    }
    this.sendMessage("event/before-input", message);
    this.sendMessage("command/input-text", message);
  },

  /** Send input sequences to TTY device. 
   *  @param {String} data a text message in Unicode string.
   *  @notify command/send-to-tty
   */ 
  "[subscribe('command/input-text'), pnp]":
  function processInputSequence(data)
  {
    var message;

    if (data) {
      message = this.dependency["encoder"].encode(data);
      this.sendMessage("command/send-to-tty", message);
      if (this._local_echo_mode) {
        this.sendMessage("event/data-arrived", message);
      }
    }

  },

  /** input event handler. 
   *  @param {Event} event A event object.
   *  @notify event/input Notifies that a input event is occured.
   */
  "[listen('input', '#tanasinn_default_input'), pnp]":
  function oninput(event) 
  {
    var value = this._textbox.value;

    this._textbox.value = "";
    this.sendMessage("command/input-text", value);
  },
 
  /** compositionstart event handler. 
   *  @{Event} event A event object.
   */
  "[listen('compositionstart', '#tanasinn_default_input'), pnp]":
  function oncompositionstart(event) 
  {
    var version_comparator = Components
      .classes["@mozilla.org/xpcom/version-comparator;1"]
      .getService(Components.interfaces.nsIVersionComparator);

    if (version_comparator.compare(coUtils.Runtime.version, "10.0") >= 0) {
      this.oninput.enabled = false;
    }
  },
  
  /** compositionend event handler. 
   *  @{Event} event A event object.
   */
  "[listen('compositionend', '#tanasinn_default_input'), pnp]":
  function oncompositionend(event) 
  {
    var version_comparator = Components
      .classes["@mozilla.org/xpcom/version-comparator;1"]
      .getService(Components.interfaces.nsIVersionComparator);

    if (version_comparator.compare(coUtils.Runtime.version, "10.0") >= 0) {
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
  new DefaultKeyMappings(broker);
  new ModeManager(broker);
  new InputManager(broker);
}

// EOF
