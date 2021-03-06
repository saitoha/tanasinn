/* -*- Mode: JAVASCRIPT; tab-width: 2; indent-tabs-mode: nil; c-basic-offset: 2 -*-
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
 * Portions created by the Initial Developer are Copyright (C) 2010 - 2013
 * the Initial Developer. All Rights Reserved.
 *
 * ***** END LICENSE BLOCK ***** */

"use strict";

///////////////////////////////////////////////////////////////////////////////
//
// Key mappings.
//

// Ctrl-prefixed key mappings
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
  "Ctrl 4"        : "\x1c", //  FS
  "Ctrl ]"        : "\x1d", //  GS
  "Ctrl 5"        : "\x1d", //  GS
  "Ctrl ^"        : "\x1e", //  RS
  "Ctrl 6"        : "\x1e", //  RS
  "Ctrl /"        : "\x1f", //  US
  "Ctrl Shift ?"  : "\x1f", //  US
  "Ctrl _"        : "\x1f", //  US
  "Ctrl 7"        : "\x1f", //  US
  "Ctrl 8"        : "\x7f", //  DEL
};


// cursor key mappings (normal mode)
var KEY_NORMAL_CURSOR = {
  "Left"         : "<CSI>D",     // kl / kcub1
  "Up"           : "<CSI>A",     // ku / kcuu1
  "Right"        : "<CSI>C",     // kr / kcuf1
  "Down"         : "<CSI>B",     // kd / kcud1
};

// cursor key mappings (application mode)
var KEY_APPLICATION_CURSOR = {
  "Left"         : "<SS3>D",     // kl / kcub1
  "Up"           : "<SS3>A",     // ku / kcuu1
  "Right"        : "<SS3>C",     // kr / kcuf1
  "Down"         : "<SS3>B",     // kd / kcud1
};

// cursor key mappings (vt52 mode)
var KEY_VT52_CURSOR = {
  "Left"         : "\x1bD",  // kl / kcub1
  "Up"           : "\x1bA",  // ku / kcuu1
  "Right"        : "\x1bC",  // kr / kcuf1
  "Down"         : "\x1bB",  // kd / kcud1
};

// escape key mappings (normal mode)
var KEY_NORMAL_ESCAPE = {
  "ESC"           : "\x1b",
  "Ctrl ["        : "\x1b", //  ESC
  "Ctrl \x1b"     : "\x1b", //  ESC
};

// escape key mappings (application mode)
var KEY_APPLICATION_ESCAPE = {
  "ESC"           : "\x1bO[",
  "Ctrl ["        : "\x1bO[", //  ESC
  "Ctrl \x1b"     : "\x1bO[", //  ESC
};

// Home/End mappings (normal mode)
var KEY_SUNPC_NORMAL_KEYPAD = {
  "End"    : "<CSI>H",
  "Home"   : "<CSI>F",
};

// Home/End mappings (application mode)
var KEY_SUNPC_APPLICATION_KEYPAD = {
  "End"    : "<SS3>H",
  "Home"   : "<SS3>F",
};

// kcbt (shift-tab) mappings (vt100)
var KEY_VT100_KCBT = {
  "Shift Tab"    : "\x09",
}

// kcbt (shift-tab) mappings (xterm)
var KEY_XTERM_KCBT = {
  "Shift Tab"    : "<CSI>Z",
}

// other normal keypad mappings
var KEY_NORMAL_KEYPAD = {
  "PgUp"   : "<CSI>5~", // kP / kpp
  "PgDn"   : "<CSI>6~", // kN / knp
  "End"    : "<CSI>4~", // @7 / kend
  "Home"   : "<CSI>1~", // kh / khome
  "Ins"    : "<CSI>2~",
  "Del"    : "<CSI>3~",
  "F1"     : "<SS3>P",
  "F2"     : "<SS3>Q",
  "F3"     : "<SS3>R",
  "F4"     : "<SS3>S",
  "F5"     : "<CSI>15~",
  "F6"     : "<CSI>17~",
  "F7"     : "<CSI>18~",
  "F8"     : "<CSI>19~",
  "F9"     : "<CSI>20~",
  "F10"    : "<CSI>21~",
  "F11"    : "<CSI>23~",
  "F12"    : "<CSI>24~",
  "F13"    : "<CSI>1;2P",
  "F14"    : "<CSI>1;2Q",
  "F15"    : "<CSI>1;2R",
  "F16"    : "<CSI>1;2S",
  "F17"    : "<CSI>15;2~",
  "F18"    : "<CSI>17;2~",
  "F19"    : "<CSI>18;2~",
  "F20"    : "<CSI>19;2~",
  "F21"    : "<CSI>20;2~",
  "F22"    : "<CSI>21;2~",
  "F25"    : "<CSI>1;5P",
  "F26"    : "<CSI>1;5Q",
  "F27"    : "<CSI>1;5R",
  "F28"    : "<CSI>1;5S",
  "F29"    : "<CSI>15;5~",
  "F30"    : "<CSI>17;5~",
  "F31"    : "<CSI>18;5~",
  "F32"    : "<CSI>19;5~",
  "F33"    : "<CSI>20;5~",
  "F34"    : "<CSI>21;5~",
  "F35"    : "<CSI>23;5~",
  "F36"    : "<CSI>24;5~",
  "F37"    : "<CSI>1;6P",
  "F38"    : "<CSI>1;6Q",
  "F39"    : "<CSI>1;6R",
  "F40"    : "<CSI>1;6S",
  "F41"    : "<CSI>15;6~",
  "F42"    : "<CSI>17;6~",
  "F43"    : "<CSI>18;6~",
  "F44"    : "<CSI>19;6~",
  "F45"    : "<CSI>20;6~",
  "F46"    : "<CSI>21;6~",
  "F47"    : "<CSI>23;6~",
  "F48"    : "<CSI>24;6~",
  "F49"    : "<CSI>1;3P",
  "F50"    : "<CSI>1;3Q",
  "F51"    : "<CSI>1;3R",
  "F52"    : "<CSI>1;3S",
  "F53"    : "<CSI>15;3~",
  "F54"    : "<CSI>17;3~",
  "F55"    : "<CSI>18;3~",
  "F56"    : "<CSI>19;3~",
  "F57"    : "<CSI>20;3~",
  "F58"    : "<CSI>21;3~",
  "F59"    : "<CSI>23;3~",
  "F60"    : "<CSI>24;3~",
  "F61"    : "<CSI>1;4P",
  "F62"    : "<CSI>1;4Q",
  "F63"    : "<CSI>1;4R",

  "Shift PgUp"   : "<CSI>5~",
  "Shift PgDn"   : "<CSI>6~",
  "Shift End"    : "<CSI>4~",
  "Shift Home"   : "<CSI>1~",
  "Shift Ins"    : "<CSI>2~",
  "Shift Del"    : "<CSI>3~",
  "Shift F1"     : "<CSI>25~",
  "Shift F2"     : "<CSI>26~",
  "Shift F3"     : "<CSI>28~",
  "Shift F4"     : "<CSI>29~",
  "Shift F5"     : "<CSI>31~",
  "Shift F6"     : "<CSI>32~",
  "Shift F7"     : "<CSI>33~",
  "Shift F8"     : "<CSI>34~",
  "Shift Left"   : "<CSI>1;2D",
  "Shift Up"     : "<CSI>1;2A",
  "Shift Right"  : "<CSI>1;2C",
  "Shift Down"   : "<CSI>1;2B",
  "Ctrl Left"    : "<CSI>1;5D",
  "Ctrl Up"      : "<CSI>1;5A",
  "Ctrl Right"   : "<CSI>1;5C",
  "Ctrl Down"    : "<CSI>1;5B",
};

// other application keypad mappings
var KEY_APPLICATION_KEYPAD = {

  "PgUp"   : "<CSI>5~", // kP / kpp
  "PgDn"   : "<CSI>6~", // kN / knp
  "End"    : "<CSI>4~", // @7 / kend
  "Home"   : "<CSI>1~", // kh / khome
  "Ins"    : "<CSI>2~",
  "Del"    : "<CSI>3~",
  "F1"     : "<SS3>P",
  "F2"     : "<SS3>Q",
  "F3"     : "<SS3>R",
  "F4"     : "<SS3>S",
  "F5"     : "<CSI>15~",
  "F6"     : "<CSI>17~",
  "F7"     : "<CSI>18~",
  "F8"     : "<CSI>19~",
  "F9"     : "<CSI>20~",
  "F10"    : "<CSI>21~",
  "F11"    : "<CSI>23~",
  "F12"    : "<CSI>24~",
  "F13"    : "<CSI>1;2P",
  "F14"    : "<CSI>1;2Q",
  "F15"    : "<CSI>1;2R",
  "F16"    : "<CSI>1;2S",
  "F17"    : "<CSI>15;2~",
  "F18"    : "<CSI>17;2~",
  "F19"    : "<CSI>18;2~",
  "F20"    : "<CSI>19;2~",
  "F21"    : "<CSI>20;2~",
  "F22"    : "<CSI>21;2~",
  "F25"    : "<CSI>1;5P",
  "F26"    : "<CSI>1;5Q",
  "F27"    : "<CSI>1;5R",
  "F28"    : "<CSI>1;5S",
  "F29"    : "<CSI>15;5~",
  "F30"    : "<CSI>17;5~",
  "F31"    : "<CSI>18;5~",
  "F32"    : "<CSI>19;5~",
  "F33"    : "<CSI>20;5~",
  "F34"    : "<CSI>21;5~",
  "F35"    : "<CSI>23;5~",
  "F36"    : "<CSI>24;5~",
  "F37"    : "<CSI>1;6P",
  "F38"    : "<CSI>1;6Q",
  "F39"    : "<CSI>1;6R",
  "F40"    : "<CSI>1;6S",
  "F41"    : "<CSI>15;6~",
  "F42"    : "<CSI>17;6~",
  "F43"    : "<CSI>18;6~",
  "F44"    : "<CSI>19;6~",
  "F45"    : "<CSI>20;6~",
  "F46"    : "<CSI>21;6~",
  "F47"    : "<CSI>23;6~",
  "F48"    : "<CSI>24;6~",
  "F49"    : "<CSI>1;3P",
  "F50"    : "<CSI>1;3Q",
  "F51"    : "<CSI>1;3R",
  "F52"    : "<CSI>1;3S",
  "F53"    : "<CSI>15;3~",
  "F54"    : "<CSI>17;3~",
  "F55"    : "<CSI>18;3~",
  "F56"    : "<CSI>19;3~",
  "F57"    : "<CSI>20;3~",
  "F58"    : "<CSI>21;3~",
  "F59"    : "<CSI>23;3~",
  "F60"    : "<CSI>24;3~",
  "F61"    : "<CSI>1;4P",
  "F62"    : "<CSI>1;4Q",
  "F63"    : "<CSI>1;4R",

  "Shift PgUp"   : "<CSI>5~",
  "Shift PgDn"   : "<CSI>6~",
  "Shift End"    : "<CSI>4~",
  "Shift Home"   : "<CSI>1~",
  "Shift Ins"    : "<CSI>2~",
  "Shift Del"    : "<CSI>3~",
  "Shift F1"     : "<CSI>25~",
  "Shift F2"     : "<CSI>26~",
  "Shift F3"     : "<CSI>28~",
  "Shift F4"     : "<CSI>29~",
  "Shift F5"     : "<CSI>31~",
  "Shift F6"     : "<CSI>32~",
  "Shift F7"     : "<CSI>33~",
  "Shift F8"     : "<CSI>34~",
  "Shift Left"   : "<CSI>1;2D",
  "Shift Up"     : "<CSI>1;2A",
  "Shift Right"  : "<CSI>1;2C",
  "Shift Down"   : "<CSI>1;2B",
  "Ctrl Left"    : "<CSI>1;5D",
  "Ctrl Up"      : "<CSI>1;5A",
  "Ctrl Right"   : "<CSI>1;5C",
  "Ctrl Down"    : "<CSI>1;5B",

};

// \x5c glitch for yen (Japanese)
var KEY_YEN_AS_5C = {
  "\xa5"       : "\x5c",
};

// \x5c glitch for won (Korian)
var KEY_WON_AS_5C = {
  "\u20a9"     : "\x5c",
};

// \x7f glitch DEL key (Mac)
var KEY_BACKSPACE_AS_DEL = {
  "backspace"  : "\x7f",
};

// \x7f glitch DEL key (PC)
var KEY_DELETE_AS_FUNC = {
  "delete"     : "<CSI>3~",
};

// Alt-*/Alt-Shift-* glitches for Mac
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

/** create keycode map from keymap expression */
function coCreateKeyMap(expression_map, destination_map)
{
  var map = destination_map || {},
      key,
      value,
      tokens,
      code,
      keys = Object.keys(expression_map),
      i;

  for (i = 0; i < keys.length; ++i) {
    key = keys[i];
    value = expression_map[key];
    tokens = key.split(/[\s\t]+/);

    code = tokens.pop();
    code = coUtils.Keyboard.KEYNAME_PACKEDCODE_MAP[code.toLowerCase()]
         || code.replace(/\\x([0-9a-fA-F]+)/g,
              function replaceFunc(key)
              {
                var code = parseInt(key, 16);

                return String.fromCharCode(code);
              }).charCodeAt(0);

    code = tokens.reduce(
        function reduceFunc(code, token)
        {
          var modifier = token.toLowerCase();

          return code | 0x1 << {
              ctrl: coUtils.Constant.KEY_CTRL,// | coUtils.Constant.KEY_NOCHAR,
              alt: coUtils.Constant.KEY_ALT,
              shift: coUtils.Constant.KEY_SHIFT,
              meta: coUtils.Constant.KEY_META,// | coUtils.Constant.KEY_NOCHAR,
            } [modifier];
        }, code);

    map[code] = value.replace(/\\x([0-9a-fA-F]{1,2})/g,
        function replaceFunc()
        {
          var code = parseInt(arguments[1], 16);

          return String.fromCharCode(code);
        }).replace(/\\[eE]/g, '\x1b');
  }

  return map;
}

//////////////////////////////////////////////////////////////////////////////
//
// Concepts
//

/**
 * @concept KeyMappingsConcept
 */
var KeyMappingsConcept = new Concept();
KeyMappingsConcept.definition = {

  id: "KeyMappingsConcept",

  // message concept
  "command/build-key-mappings :: Object -> Undefined":
  _('Build the trie tree for managing key map.'),

  // signature concept
  "build :: Object -> Undefined":
  _('Build the trie tree for managing key map.'),

}; // KeyMappingsConcept

//////////////////////////////////////////////////////////////////////////////
//
// Traits
//
//

/**
 * @trait ApplicationEscapeMode
 */
var ApplicationEscapeMode = new Trait("ApplicationEscapeMode")
                                    //.requires("KeyMappingsConcept")
                                    ;
ApplicationEscapeMode.definition = {

  "[subscribe('command/change-application-escape'), pnp]":
  function onChangeApplicationEscape(mode)
  {
    this._application_escape = mode;
    this.build(this._map);
  },

}; // ApplicationEscapeMode

/**
 * @class DefaultKeyMappings
 */
var DefaultKeyMappings = new Class().extends(Plugin)
                                    .mix(ApplicationEscapeMode);
DefaultKeyMappings.definition = {

  id: "default_key_mappings",

  getInfo: function getInfo()
  {
    return {
      name: _("Mode Manager"),
      version: "0.1",
      description: _("Manage modes")
    };
  },

  "[persistable] enabled_when_startup": true,

  "[persistable] yen_as_5c": true,
  "[persistable] won_as_5c": true,
  "[persistable] mac_alt_as_meta": true,
  "[persistable] backspace_as_delete": false,
  "[persistable] delete_as_function": true,
  "[persistable] xterm_kcbt": true,

  _cursor_mode: coUtils.Constant.CURSOR_MODE_NORMAL,
  _application_keypad: false,
  _application_escape: false,
  _us_escape: false,

  _map: null,

  /** Installs itself.
   *  @param {InstallContext} context A InstallContext object.
   */
  "[install]":
  function install(context)
  {
  },

  /** Uninstalls itself.
   */
  "[uninstall]":
  function uninstall()
  {
  },

  "[subscribe('command/change-cursor-mode'), pnp]":
  function onChangeCursorMode(mode)
  {
    this._cursor_mode = mode;
    this.build(this._map);
  },

  "[subscribe('command/change-emulation-mode'), pnp]":
  function onChangeEmulationMode(mode)
  {
    switch (mode) {

      case "vt100":
        if (coUtils.Constant.CURSOR_MODE_VT52 === this._cursor_mode) {
          this.sendMessage(
            "command/change-cursor-mode",
            coUtils.Constant.CURSOR_MODE_NORMAL);
        }
        break;

      case "vt52":
        this.sendMessage(
          "command/change-cursor-mode",
          coUtils.Constant.CURSOR_MODE_VT52);
        break;

      default:
        coUtils.Debug.reportError(
          _("Invalid emulation mode was specified: %s."),
          mode);

    }
  },

  "[subscribe('command/build-key-mappings'), type('Object -> Undefined'), pnp]":
  function build(map)
  {
    var settings = [ KEY_ANSI ],
        i,
        setting;

    this._map = map;

    // set cursor mode
    switch (this._cursor_mode) {

      case coUtils.Constant.CURSOR_MODE_NORMAL:
       settings.push(KEY_NORMAL_CURSOR);
       break;

      case coUtils.Constant.CURSOR_MODE_APPLICATION:
        settings.push(KEY_APPLICATION_CURSOR);
        break;

      case coUtils.Constant.CURSOR_MODE_VT52:
        settings.push(KEY_VT52_CURSOR);
        break;

      default:
        coUtils.Debug.reportError(
          _("Invalid cursor mode was specified: %s."),
          this._cursor_mode);
        settings.push(KEY_NORMAL_CURSOR);
    }

    // set application escape mode
    if (this._application_escape) {
      settings.push(KEY_APPLICATION_ESCAPE);
    } else {
      settings.push(KEY_NORMAL_ESCAPE);
    }

    // set keypad mode
    if (this._application_keypad) {
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

    if (this.xterm_kcbt) {
      settings.push(KEY_XTERM_KCBT);
    }

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

}; // DefaultKeyMappings

/**
 * @class ModeManager
 */
var ModeManager = new Class().extends(Plugin);
ModeManager.definition = {

  id: "modemanager",

  getInfo: function getInfo()
  {
    return {
      name: _("Mode Manager"),
      version: "0.1",
      description: _("Manage modes")
    };
  },

  "[persistable] enabled_when_startup": true,

  _modes: null,

  _mode: coUtils.Constant.INPUT_MODE_NORMAL,

  /** Installs itself.
   *  @param {InstallContext} context A InstallContext object.
   */
  "[install]":
  function install(context)
  {
    this._modes = this.sendMessage("get/modes");
  },

  /** Uninstalls itself.
   */
  "[uninstall]":
  function uninstall()
  {
    this._modes = null;
  },

  /** Retrieve input sequences and remap them and dispatch them in accordance
   * with the mode (normal/commandline).
   */
  "[subscribe('event/scan-keycode'), pnp]":
  function onScanKeycode(info)
  {
    var mode = info.mode || this._mode,
        code = info.code;

    switch (mode) {

      case coUtils.Constant.INPUT_MODE_NORMAL:
        this.sendMessage('command/input-with-remapping', info);
        break;

      case coUtils.Constant.INPUT_MODE_COMMANDLINE:
        this.sendMessage('event/keypress-commandline-with-remapping', code);
        break;

      default:
        throw coUtils.Debug.Exception(_("Unknown mode is specified: %s."), mode);
    }
  },

  /** Dispatch given input sequences directly in accordance with the mode
   * (normal/commandline).
   */
  "[subscribe('event/scan-keycode-with-no-remapping'), pnp]":
  function onScanKeycodeWithoutMapping(info)
  {
    var mode = info.mode || this._mode,
        code = info.code;

    switch (mode) {

      case coUtils.Constant.INPUT_MODE_NORMAL:
        this.sendMessage('command/input-with-no-remapping', info);
        break;

      case coUtils.Constant.INPUT_MODE_COMMANDLINE:
        this.sendMessage('event/keypress-commandline-with-no-remapping', code);
        break;

      default:
        throw coUtils.Debug.Exception(_("Unknown mode is specified: %s."), mode);
    }
  },

  /** Provides sendkeys command, which interprets a key sequence expression and send
   *  it to the application.
   */
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

  /** Interpret a key sequence expression and remap it, and send it to the application. */
  "[subscribe('command/input-expression-with-remapping'), pnp]":
  function inputExpressionWithMapping(expression)
  {
    var packed_code_array,
        i,
        packed_code;

    // parse expression
    packed_code_array = coUtils.Keyboard
      .parseKeymapExpression(expression);

    // process them one by one
    for (i = 0; i < packed_code_array.length; ++i) {
      packed_code = packed_code_array[i];
      this.sendMessage("event/scan-keycode", { code: packed_code });
    }
    return true;
  },

  /** Interpret a key sequence expression and directly send it to the application. */
  "[subscribe('command/input-expression-with-no-remapping'), pnp]":
  function inputExpressionWithNoRemapping(expression)
  {
    var packed_code_array,
        i,
        packed_code;

    // parse expression
    packed_code_array = coUtils.Keyboard
      .parseKeymapExpression(expression);

    // process them one by one
    for (i = 0; i < packed_code_array.length; ++i) {
      packed_code = packed_code_array[i];
      this.sendMessage(
        "event/scan-keycode-with-no-remapping",
        {
          code: packed_code
        });
    }
    return true;
  },

  /** Change the mode (normal/commandline) */
  "[subscribe('event/input-mode-changed'), pnp]":
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

  "[subscribe('event/alt-key-down'), pnp]":
  function onAltKeyDown()
  {
    this._alt_key = true;
  },

  "[subscribe('event/alt-key-up'), pnp]":
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
                              .depends("parser")
                              .depends("modemanager")
                              .depends("encoder");
InputManager.definition = {

  id: "inputmanager",

  /** plugin information */
  getInfo: function getInfo()
  {
    return {
      name: _("Input Manager"),
      version: "0.1",
      description: _("Handle keyboard input event and send it to TTY device.")
    };
  },

  getTemplate: function getTemplate()
  {
    return {
      parentNode: "#tanasinn_center_area",
      tagName: "stack",
      childNodes: {
        tagName: "textbox",
        className: "plain",
        id: "tanasinn_default_input",
        style: {
          imeMode: "disabled",
          border: "0px",
          opacity: "0.00",
        },
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
  _encoder: null,
  _parser: null,

  /** Installs itself.
   *  @param {InstallContext} context A InstallContext object.
   */
  "[install]":
  function install(context)
  {
    var map = {},
        result;

    // Get [bit-packed keycode -> terminal input sequence] map
    this.sendMessage("command/build-key-mappings", map);

    this._key_map = map;

    result = this.request(
      "command/construct-chrome",
      this.getTemplate());

    this._encoder = context["encoder"];
    this._parser = context["parser"];

    this._textbox = result.tanasinn_default_input;
    this.sendMessage("event/collection-changed/modes");

    this.onDoubleShift.enabled = true;
  },

  /** Uninstalls itself.
   */
  "[uninstall]":
  function uninstall()
  {
    this._key_map = null;
    if (null !== this._textbox) {
      this._textbox.parentNode.removeChild(this._textbox);
      this._textbox = null;
    }
    this.sendMessage("event/collection-changed/modes");

    this._encoder = null;
    this._parser = null;
    this.onDoubleShift.enabled = false;
  },

  /** switches local echo mode */
  "[subscribe('set/local-echo-mode'), pnp]":
  function setLocalEchoMode(value)
  {
    this._local_echo_mode = value;
  },

  /** switches lf/crlf mode */
  "[subscribe('set/newline-mode'), pnp]":
  function onChangeNewlineMode(mode)
  {
    this._newline_mode = mode;
  },

  /** switches auto-repeat mode */
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
    // call focus() 4 times.
    var textbox = this._textbox;
    textbox.focus(); // <-- blur out for current element.
    textbox.focus(); // <-- blur out for current element.
    textbox.focus(); // <-- blur out for current element.
    textbox.focus(); // <-- set focus to textbox element.

    this.sendMessage(
      "event/input-mode-changed",
      coUtils.Constant.INPUT_MODE_NORMAL);
  },

  /** Exports blur command, which moves focus out of the current window */
  "[command('blur', []), nmap('<M-z>', '<C-S-z>', '<C-S-Z>'), _('Blur tanasinn window'), pnp]":
  function blurCommand()
  {
    coUtils.Timer.setTimeout(
      function blur()
      {
        this.blur();
      }, 100, this);

    return {
      success: true,
      message: _("Succeeded."),
    };

  },

  /** Dispatched when the broker is stopping. */
  "[subscribe('event/before-broker-stopping')]":
  function onSessionStopping()
  {
    this.blur();
    this.enabled = false;
  },

  /** blur focus from the textbox elment. */
  "[subscribe('command/blur')]":
  function blur()
  {
    var owner_document = this.request("get/root-element").ownerDocument,
        dispatcher;

    if (owner_document) {
      dispatcher = owner_document.commandDispatcher;
      if (dispatcher) {
        dispatcher.rewindFocus();
      }
    }

    this._textbox.blur(); // raise blur event.

    return true;
  },

  /** getter of the textbox element. */
  getInputField: function getInputField()
  {
    return this._textbox;
  },

  /** handle double-shift key event, and interpret it to <2-shift> */
  "[subscribe('event/hotkey-double-shift')]":
  function onDoubleShift()
  {
    this.sendMessage(
      "command/input-expression-with-remapping",
      "<2-shift>");
  },

  /** called when the window gets the focus */
  "[subscribe('event/got-focus'), pnp]":
  function onGotFocus(event)
  {
    this.onDoubleShift.enabled = true;
  },

  /** called when the window losts the focus */
  "[subscribe('event/lost-focus'), pnp]":
  function onLostFocus(event)
  {
    this.onDoubleShift.enabled = false;
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
      // workaround for ctrl + space
      if (this.fix_for_ctrl_space) {
        if (0x20 === event.keyCode
            && 0x20 === event.which
            && event.ctrlKey) {
          this.onkeypress(event);
        }
      }
    }
    this._last_keydown_event = event;
    /*
    this.sendMessage(
      this.debug_topic,
      "code:" + event.keyCode + "," +
      "which:" + event.which + "," +
      "shift:" + (event.shiftKey ? "t": "f") + "," +
      "ctl:" + (event.ctrlKey ? "t": "f") + "," +
      "alt:" + (event.altKey ? "t": "f") + "," +
      "meta:" + (event.metaKey ? "t": "f") + "," +
      "char:" + (event.isChar ? "t": "f"));
    */

    event.stopPropagation();
  },

  "[listen('keyup', '#tanasinn_default_input', true), pnp]":
  function onkeyup(event)
  {
    this.onkeypress.enabled = true;
    this.oninput.enabled = true;

    event.preventDefault();
    event.stopPropagation();
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

    //if (event.keyCode || event.which < 0x100) {
    //  event = this._last_keydown_event;
    //}

    //if (0x00 === event.keyCode
    //    && 0x20 === event.which
    //    && event.ctrlKey) {
    //  event.keyCode = 0x20;
    //  event.isChar = false;
    //}

    if (this.debug_flag) {
      this.sendMessage(
        this.debug_topic,
        "code:" + event.keyCode + "," +
        "which:" + event.which + "," +
        "shift:" + (event.shiftKey ? "t": "f") + "," +
        "ctl:" + (event.ctrlKey ? "t": "f") + "," +
        "alt:" + (event.altKey ? "t": "f") + "," +
        "meta:" + (event.metaKey ? "t": "f") + "," +
        "char:" + (event.isChar ? "t": "f"));
    }

    this.onKeyPressEventReceived(
      {
        mode: coUtils.Constant.INPUT_MODE_NORMAL,
        event: event,
      });
    
    this.sendMessage("command/focus");

  },

  "[subscribe('event/keypress'), pnp]":
  function onKeyPressEventReceived(info)
  {
    var packed_code = coUtils.Keyboard
      .getPackedKeycodeFromEvent(info.event, this._alt_key);
      //.getPackedKeycodeFromEvent(info.event, this._alt_key);

    this.sendMessage(
      "event/scan-keycode",
      {
        mode: info.mode,
        code: packed_code,
      });
  },

  "[subscribe('command/input-with-remapping'), pnp]":
  function inputWithMapping(info)
  {
    var result = this.request(
      "event/normal-input",
      {
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
        message = this._key_map[packed_code],
        match;

    if (message) {
      match = message.match(/^<(.*)>(.*$)/);
      if (match) {
        switch (match[1]) {
          case "CSI":
            this.sendMessage("command/send-sequence/csi", match[2]);
            return;
          case "SS3":
            this.sendMessage("command/send-sequence/ss3", match[2]);
            return;
        }
      }
    } else {
      if (packed_code & (1 << coUtils.Constant.KEY_CTRL |
                         1 << coUtils.Constant.KEY_ALT)) {
        if (0x20 <= c && c < 0x7f) {
          return;
        }
      }

      if (0x08 === c && this.backspace_as_delete) {
        message = "delete";
      } else if (0x0d === c && this._newline_mode) {
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
      message = this._encoder.encode(data);
      this.sendMessage("command/send-to-tty", message);

      if (this._local_echo_mode) {
        this._parser.drive(message);
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
    var version_comparator = coUtils.Services.versionComparator;

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
    var version_comparator = coUtils.Services.versionComparator;

    if (version_comparator.compare(coUtils.Runtime.version, "10.0") >= 0) {
      this.oninput.enabled = true;
      this.oninput(event);
    }
  },

  /** test */
  "[test]":
  function()
  {
    var enabled = this.enabled;

    try {
      this.enabled = false;
      this.enabled = true;
      this.enabled = false;
    } finally {
      this.enabled = enabled;
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
