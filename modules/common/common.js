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

/** @package common
 * Provides basic utility and services.
 */

var coUtils = coUtils || { };

coUtils.Constant = {

  //
  // NRC Set
  //
  CHARSET_US :                "B",
  CHARSET_PC :                "?",
  CHARSET_DEC:                "0",

  //
  // Keypad mode
  //
  KEYPAD_MODE_NORMAL:         0x0,
  KEYPAD_MODE_APPLICATION:    0x1,
  KEYPAD_MODE_NUMERIC:        0x2,
  
  //
  // Mouse Button
  //
  BUTTON_LEFT:                0x00,
  BUTTON_MIDDLE:              0x01,
  BUTTON_RIGHT:               0x02,
  BUTTON_RELEASE:             0x03,
  BUTTON_WHEEL_UP:            0x40,
  BUTTON_WHEEL_DOWN:          0x41,

  //
  // Swipe direction
  //
  DIRECTION_UP:               0x1,
  DIRECTION_DOWN:             0x2,
  DIRECTION_LEFT:             0x4,
  DIRECTION_RIGHT:            0x8,

  //
  // Rotation gesture direction
  //
  ROTATION_COUNTERCLOCKWISE:  0x1,
  ROTATION_CLOCKWISE:         0x2,

  //
  // Mouse Tracking type
  //
  TRACKING_NONE:              0x0,
  TRACKING_X10:               0x1,
  TRACKING_NORMAL:            0x2,
  TRACKING_BUTTON:            0x3,
  TRACKING_HIGHLIGHT:         0x4,
  TRACKING_ANY:               0x5,

  //
  // Line Attribute
  //
  LINETYPE_NORMAL:            0x0,
  LINETYPE_TOP:               0x1,
  LINETYPE_BOTTOM:            0x2,
  LINETYPE_DOUBLEWIDTH:       0x3,
  LINETYPE_SIXEL:             0x4,

  //
  // Screens
  //
  SCREEN_MAIN:                0x0,
  SCREEN_ALTERNATE:           0x1,

  //
  // Cursor Style
  //
  CURSOR_STYLE_BLOCK:         0x0,
  CURSOR_STYLE_UNDERLINE:     0x1,
  CURSOR_STYLE_BEAM:          0x2,

  // 
  // KeyCode Modifiers
  //
  KEY_CTRL                   : 22,
  KEY_ALT                    : 23,
  KEY_SHIFT                  : 24,
  KEY_NOCHAR                 : 25,
  KEY_META                   : 26,
  KEY_MODE                   : 27,

  // 
  // Trace Data flags
  //
  TRACE_INPUT                : 0x1,
  TRACE_OUTPUT               : 0x2,
  TRACE_CONTROL              : 0x3,

  //
  // XML namespaces
  //
  NS_XHTML                   : "http://www.w3.org/1999/xhtml",
  NS_SVG                     : "http://www.w3.org/2000/svg",

  //
  // X11 color name definition
  //
  X11_COLOR_MAP: {
    snow                : "#fffafa",
    GhostWhite          : "#f8f8ff",
    WhiteSmoke          : "#f5f5f5",
    gainsboro           : "#dcdcdc",
    FloralWhite         : "#fffaf0",
    OldLace             : "#fdf5e6",
    linen               : "#faf0e6",
    AntiqueWhite        : "#faebd7",
    PapayaWhip          : "#ffefd5",
    BlanchedAlmond      : "#ffebcd",
    bisque              : "#ffe4c4",
    PeachPuff           : "#ffdab9",
    NavajoWhite         : "#ffdead",
    moccasin            : "#ffe4b5",
    cornsilk            : "#fff8dc",
    ivory               : "#fffff0",
    LemonChiffon        : "#fffacd",
    seashell            : "#fff5ee",
    honeydew            : "#f0fff0",
    MintCream           : "#f5fffa",
    azure               : "#f0ffff",
    AliceBlue           : "#f0f8ff",
    lavender            : "#e6e6fa",
    LavenderBlush       : "#fff0f5",
    MistyRose           : "#ffe4e1",
    white               : "#ffffff",
    black               : "#000000",
    DarkSlateGray       : "#2f4f4f",
    DarkSlateGrey       : "#2f4f4f",
    DimGray             : "#696969",
    DimGrey             : "#696969",
    SlateGray           : "#708090",
    SlateGrey           : "#708090",
    LightSlateGray      : "#778899",
    LightSlateGrey      : "#778899",
    gray                : "#bebebe",
    grey                : "#bebebe",
    LightGrey           : "#d3d3d3",
    LightGray           : "#d3d3d3",
    MidnightBlue        : "#191970",
    navy                : "#000080",
    NavyBlue            : "#000080",
    CornflowerBlue      : "#6495ed",
    DarkSlateBlue       : "#483d8b",
    SlateBlue           : "#6a5acd",
    MediumSlateBlue     : "#7b68ee",
    LightSlateBlue      : "#8470ff",
    MediumBlue          : "#0000cd",
    RoyalBlue           : "#4169e1",
    blue                : "#0000ff",
    DodgerBlue          : "#1e90ff",
    DeepSkyBlue         : "#00bfff",
    SkyBlue             : "#87ceeb",
    LightSkyBlue        : "#87cefa",
    SteelBlue           : "#4682b4",
    LightSteelBlue      : "#b0c4de",
    LightBlue           : "#add8e6",
    PowderBlue          : "#b0e0e6",
    PaleTurquoise       : "#afeeee",
    DarkTurquoise       : "#00ced1",
    MediumTurquoise     : "#48d1cc",
    turquoise           : "#40e0d0",
    cyan                : "#00ffff",
    LightCyan           : "#e0ffff",
    CadetBlue           : "#5f9ea0",
    MediumAquamarine    : "#66cdaa",
    aquamarine          : "#7fffd4",
    DarkGreen           : "#006400",
    DarkOliveGreen      : "#556b2f",
    DarkSeaGreen        : "#8fbc8f",
    SeaGreen            : "#2e8b57",
    MediumSeaGreen      : "#3cb371",
    LightSeaGreen       : "#20b2aa",
    PaleGreen           : "#98fb98",
    SpringGreen         : "#00ff7f",
    LawnGreen           : "#7cfc00",
    green               : "#00ff00",
    chartreuse          : "#7fff00",
    MediumSpringGreen   : "#00fa9a",
    GreenYellow         : "#adff2f",
    LimeGreen           : "#32cd32",
    YellowGreen         : "#9acd32",
    ForestGreen         : "#228b22",
    OliveDrab           : "#6b8e23",
    DarkKhaki           : "#bdb76b",
    khaki               : "#f0e68c",
    PaleGoldenrod       : "#eee8aa",
    LightGoldenrodYellow: "#fafad2",
    LightYellow         : "#ffffe0",
    yellow              : "#ffff00",
    gold                : "#ffd700",
    LightGoldenrod      : "#eedd82",
    goldenrod           : "#daa520",
    DarkGoldenrod       : "#b8860b",
    RosyBrown           : "#bc8f8f",
    IndianRed           : "#cd5c5c",
    SaddleBrown         : "#8b4513",
    sienna              : "#a0522d",
    peru                : "#cd853f",
    burlywood           : "#deb887",
    beige               : "#f5f5dc",
    wheat               : "#f5deb3",
    SandyBrown          : "#f4a460",
    tan                 : "#d2b48c",
    chocolate           : "#d2691e",
    firebrick           : "#b22222",
    brown               : "#a52a2a",
    DarkSalmon          : "#e9967a",
    salmon              : "#fa8072",
    LightSalmon         : "#ffa07a",
    orange              : "#ffa500",
    DarkOrange          : "#ff8c00",
    coral               : "#ff7f50",
    LightCoral          : "#f08080",
    tomato              : "#ff6347",
    OrangeRed           : "#ff4500",
    red                 : "#ff0000",
    HotPink             : "#ff69b4",
    DeepPink            : "#ff1493",
    pink                : "#ffc0cb",
    LightPink           : "#ffb6c1",
    PaleVioletRed       : "#db7093",
    maroon              : "#b03060",
    MediumVioletRed     : "#c71585",
    VioletRed           : "#d02090",
    magenta             : "#ff00ff",
    violet              : "#ee82ee",
    plum                : "#dda0dd",
    orchid              : "#da70d6",
    MediumOrchid        : "#ba55d3",
    DarkOrchid          : "#9932cc",
    DarkViolet          : "#9400d3",
    BlueViolet          : "#8a2be2",
    purple              : "#a020f0",
    MediumPurple        : "#9370db",
    thistle             : "#d8bfd8",
    snow1               : "#fffafa",
    snow2               : "#eee9e9",
    snow3               : "#cdc9c9",
    snow4               : "#8b8989",
    seashell1           : "#fff5ee",
    seashell2           : "#eee5de",
    seashell3           : "#cdc5bf",
    seashell4           : "#8b8682",
    AntiqueWhite1       : "#ffefdb",
    AntiqueWhite2       : "#eedfcc",
    AntiqueWhite3       : "#cdc0b0",
    AntiqueWhite4       : "#8b8378",
    bisque1             : "#ffe4c4",
    bisque2             : "#eed5b7",
    bisque3             : "#cdb79e",
    bisque4             : "#8b7d6b",
    PeachPuff1          : "#ffdab9",
    PeachPuff2          : "#eecbad",
    PeachPuff3          : "#cdaf95",
    PeachPuff4          : "#8b7765",
    NavajoWhite1        : "#ffdead",
    NavajoWhite2        : "#eecfa1",
    NavajoWhite3        : "#cdb38b",
    NavajoWhite4        : "#8b795e",
    LemonChiffon1       : "#fffacd",
    LemonChiffon2       : "#eee9bf",
    LemonChiffon3       : "#cdc9a5",
    LemonChiffon4       : "#8b8970",
    cornsilk1           : "#fff8dc",
    cornsilk2           : "#eee8cd",
    cornsilk3           : "#cdc8b1",
    cornsilk4           : "#8b8878",
    ivory1              : "#fffff0",
    ivory2              : "#eeeee0",
    ivory3              : "#cdcdc1",
    ivory4              : "#8b8b83",
    honeydew1           : "#f0fff0",
    honeydew2           : "#e0eee0",
    honeydew3           : "#c1cdc1",
    honeydew4           : "#838b83",
    LavenderBlush1      : "#fff0f5",
    LavenderBlush2      : "#eee0e5",
    LavenderBlush3      : "#cdc1c5",
    LavenderBlush4      : "#8b8386",
    MistyRose1          : "#ffe4e1",
    MistyRose2          : "#eed5d2",
    MistyRose3          : "#cdb7b5",
    MistyRose4          : "#8b7d7b",
    azure1              : "#f0ffff",
    azure2              : "#e0eeee",
    azure3              : "#c1cdcd",
    azure4              : "#838b8b",
    SlateBlue1          : "#836fff",
    SlateBlue2          : "#7a67ee",
    SlateBlue3          : "#6959cd",
    SlateBlue4          : "#473c8b",
    RoyalBlue1          : "#4876ff",
    RoyalBlue2          : "#436eee",
    RoyalBlue3          : "#3a5fcd",
    RoyalBlue4          : "#27408b",
    blue1               : "#0000ff",
    blue2               : "#0000ee",
    blue3               : "#0000cd",
    blue4               : "#00008b",
    DodgerBlue1         : "#1e90ff",
    DodgerBlue2         : "#1c86ee",
    DodgerBlue3         : "#1874cd",
    DodgerBlue4         : "#104e8b",
    SteelBlue1          : "#63b8ff",
    SteelBlue2          : "#5cacee",
    SteelBlue3          : "#4f94cd",
    SteelBlue4          : "#36648b",
    DeepSkyBlue1        : "#00bfff",
    DeepSkyBlue2        : "#00b2ee",
    DeepSkyBlue3        : "#009acd",
    DeepSkyBlue4        : "#00688b",
    SkyBlue1            : "#87ceff",
    SkyBlue2            : "#7ec0ee",
    SkyBlue3            : "#6ca6cd",
    SkyBlue4            : "#4a708b",
    LightSkyBlue1       : "#b0e2ff",
    LightSkyBlue2       : "#a4d3ee",
    LightSkyBlue3       : "#8db6cd",
    LightSkyBlue4       : "#607b8b",
    SlateGray1          : "#c6e2ff",
    SlateGray2          : "#b9d3ee",
    SlateGray3          : "#9fb6cd",
    SlateGray4          : "#6c7b8b",
    LightSteelBlue1     : "#cae1ff",
    LightSteelBlue2     : "#bcd2ee",
    LightSteelBlue3     : "#a2b5cd",
    LightSteelBlue4     : "#6e7b8b",
    LightBlue1          : "#bfefff",
    LightBlue2          : "#b2dfee",
    LightBlue3          : "#9ac0cd",
    LightBlue4          : "#68838b",
    LightCyan1          : "#e0ffff",
    LightCyan2          : "#d1eeee",
    LightCyan3          : "#b4cdcd",
    LightCyan4          : "#7a8b8b",
    PaleTurquoise1      : "#bbffff",
    PaleTurquoise2      : "#aeeeee",
    PaleTurquoise3      : "#96cdcd",
    PaleTurquoise4      : "#668b8b",
    CadetBlue1          : "#98f5ff",
    CadetBlue2          : "#8ee5ee",
    CadetBlue3          : "#7ac5cd",
    CadetBlue4          : "#53868b",
    turquoise1          : "#00f5ff",
    turquoise2          : "#00e5ee",
    turquoise3          : "#00c5cd",
    turquoise4          : "#00868b",
    cyan1               : "#00ffff",
    cyan2               : "#00eeee",
    cyan3               : "#00cdcd",
    cyan4               : "#008b8b",
    DarkSlateGray1      : "#97ffff",
    DarkSlateGray2      : "#8deeee",
    DarkSlateGray3      : "#79cdcd",
    DarkSlateGray4      : "#528b8b",
    aquamarine1         : "#7fffd4",
    aquamarine2         : "#76eec6",
    aquamarine3         : "#66cdaa",
    aquamarine4         : "#458b74",
    DarkSeaGreen1       : "#c1ffc1",
    DarkSeaGreen2       : "#b4eeb4",
    DarkSeaGreen3       : "#9bcd9b",
    DarkSeaGreen4       : "#698b69",
    SeaGreen1           : "#54ff9f",
    SeaGreen2           : "#4eee94",
    SeaGreen3           : "#43cd80",
    SeaGreen4           : "#2e8b57",
    PaleGreen1          : "#9aff9a",
    PaleGreen2          : "#90ee90",
    PaleGreen3          : "#7ccd7c",
    PaleGreen4          : "#548b54",
    SpringGreen1        : "#00ff7f",
    SpringGreen2        : "#00ee76",
    SpringGreen3        : "#00cd66",
    SpringGreen4        : "#008b45",
    green1              : "#00ff00",
    green2              : "#00ee00",
    green3              : "#00cd00",
    green4              : "#008b00",
    chartreuse1         : "#7fff00",
    chartreuse2         : "#76ee00",
    chartreuse3         : "#66cd00",
    chartreuse4         : "#458b00",
    OliveDrab1          : "#c0ff3e",
    OliveDrab2          : "#b3ee3a",
    OliveDrab3          : "#9acd32",
    OliveDrab4          : "#698b22",
    DarkOliveGreen1     : "#caff70",
    DarkOliveGreen2     : "#bcee68",
    DarkOliveGreen3     : "#a2cd5a",
    DarkOliveGreen4     : "#6e8b3d",
    khaki1              : "#fff68f",
    khaki2              : "#eee685",
    khaki3              : "#cdc673",
    khaki4              : "#8b864e",
    LightGoldenrod1     : "#ffec8b",
    LightGoldenrod2     : "#eedc82",
    LightGoldenrod3     : "#cdbe70",
    LightGoldenrod4     : "#8b814c",
    LightYellow1        : "#ffffe0",
    LightYellow2        : "#eeeed1",
    LightYellow3        : "#cdcdb4",
    LightYellow4        : "#8b8b7a",
    yellow1             : "#ffff00",
    yellow2             : "#eeee00",
    yellow3             : "#cdcd00",
    yellow4             : "#8b8b00",
    gold1               : "#ffd700",
    gold2               : "#eec900",
    gold3               : "#cdad00",
    gold4               : "#8b7500",
    goldenrod1          : "#ffc125",
    goldenrod2          : "#eeb422",
    goldenrod3          : "#cd9b1d",
    goldenrod4          : "#8b6914",
    DarkGoldenrod1      : "#ffb90f",
    DarkGoldenrod2      : "#eead0e",
    DarkGoldenrod3      : "#cd950c",
    DarkGoldenrod4      : "#8b6508",
    RosyBrown1          : "#ffc1c1",
    RosyBrown2          : "#eeb4b4",
    RosyBrown3          : "#cd9b9b",
    RosyBrown4          : "#8b6969",
    IndianRed1          : "#ff6a6a",
    IndianRed2          : "#ee6363",
    IndianRed3          : "#cd5555",
    IndianRed4          : "#8b3a3a",
    sienna1             : "#ff8247",
    sienna2             : "#ee7942",
    sienna3             : "#cd6839",
    sienna4             : "#8b4726",
    burlywood1          : "#ffd39b",
    burlywood2          : "#eec591",
    burlywood3          : "#cdaa7d",
    burlywood4          : "#8b7355",
    wheat1              : "#ffe7ba",
    wheat2              : "#eed8ae",
    wheat3              : "#cdba96",
    wheat4              : "#8b7e66",
    tan1                : "#ffa54f",
    tan2                : "#ee9a49",
    tan3                : "#cd853f",
    tan4                : "#8b5a2b",
    chocolate1          : "#ff7f24",
    chocolate2          : "#ee7621",
    chocolate3          : "#cd661d",
    chocolate4          : "#8b4513",
    firebrick1          : "#ff3030",
    firebrick2          : "#ee2c2c",
    firebrick3          : "#cd2626",
    firebrick4          : "#8b1a1a",
    brown1              : "#ff4040",
    brown2              : "#ee3b3b",
    brown3              : "#cd3333",
    brown4              : "#8b2323",
    salmon1             : "#ff8c69",
    salmon2             : "#ee8262",
    salmon3             : "#cd7054",
    salmon4             : "#8b4c39",
    LightSalmon1        : "#ffa07a",
    LightSalmon2        : "#ee9572",
    LightSalmon3        : "#cd8162",
    LightSalmon4        : "#8b5742",
    orange1             : "#ffa500",
    orange2             : "#ee9a00",
    orange3             : "#cd8500",
    orange4             : "#8b5a00",
    DarkOrange1         : "#ff7f00",
    DarkOrange2         : "#ee7600",
    DarkOrange3         : "#cd6600",
    DarkOrange4         : "#8b4500",
    coral1              : "#ff7256",
    coral2              : "#ee6a50",
    coral3              : "#cd5b45",
    coral4              : "#8b3e2f",
    tomato1             : "#ff6347",
    tomato2             : "#ee5c42",
    tomato3             : "#cd4f39",
    tomato4             : "#8b3626",
    OrangeRed1          : "#ff4500",
    OrangeRed2          : "#ee4000",
    OrangeRed3          : "#cd3700",
    OrangeRed4          : "#8b2500",
    red1                : "#ff0000",
    red2                : "#ee0000",
    red3                : "#cd0000",
    red4                : "#8b0000",
    DeepPink1           : "#ff1493",
    DeepPink2           : "#ee1289",
    DeepPink3           : "#cd1076",
    DeepPink4           : "#8b0a50",
    HotPink1            : "#ff6eb4",
    HotPink2            : "#ee6aa7",
    HotPink3            : "#cd6090",
    HotPink4            : "#8b3a62",
    pink1               : "#ffb5c5",
    pink2               : "#eea9b8",
    pink3               : "#cd919e",
    pink4               : "#8b636c",
    LightPink1          : "#ffaeb9",
    LightPink2          : "#eea2ad",
    LightPink3          : "#cd8c95",
    LightPink4          : "#8b5f65",
    PaleVioletRed1      : "#ff82ab",
    PaleVioletRed2      : "#ee799f",
    PaleVioletRed3      : "#cd6889",
    PaleVioletRed4      : "#8b475d",
    maroon1             : "#ff34b3",
    maroon2             : "#ee30a7",
    maroon3             : "#cd2990",
    maroon4             : "#8b1c62",
    VioletRed1          : "#ff3e96",
    VioletRed2          : "#ee3a8c",
    VioletRed3          : "#cd3278",
    VioletRed4          : "#8b2252",
    magenta1            : "#ff00ff",
    magenta2            : "#ee00ee",
    magenta3            : "#cd00cd",
    magenta4            : "#8b008b",
    orchid1             : "#ff83fa",
    orchid2             : "#ee7ae9",
    orchid3             : "#cd69c9",
    orchid4             : "#8b4789",
    plum1               : "#ffbbff",
    plum2               : "#eeaeee",
    plum3               : "#cd96cd",
    plum4               : "#8b668b",
    MediumOrchid1       : "#e066ff",
    MediumOrchid2       : "#d15fee",
    MediumOrchid3       : "#b452cd",
    MediumOrchid4       : "#7a378b",
    DarkOrchid1         : "#bf3eff",
    DarkOrchid2         : "#b23aee",
    DarkOrchid3         : "#9a32cd",
    DarkOrchid4         : "#68228b",
    purple1             : "#9b30ff",
    purple2             : "#912cee",
    purple3             : "#7d26cd",
    purple4             : "#551a8b",
    MediumPurple1       : "#ab82ff",
    MediumPurple2       : "#9f79ee",
    MediumPurple3       : "#8968cd",
    MediumPurple4       : "#5d478b",
    thistle1            : "#ffe1ff",
    thistle2            : "#eed2ee",
    thistle3            : "#cdb5cd",
    thistle4            : "#8b7b8b",
    gray0               : "#000000",
    grey0               : "#000000",
    gray1               : "#030303",
    grey1               : "#030303",
    gray2               : "#050505",
    grey2               : "#050505",
    gray3               : "#080808",
    grey3               : "#080808",
    gray4               : "#0a0a0a",
    grey4               : "#0a0a0a",
    gray5               : "#0d0d0d",
    grey5               : "#0d0d0d",
    gray6               : "#0f0f0f",
    grey6               : "#0f0f0f",
    gray7               : "#121212",
    grey7               : "#121212",
    gray8               : "#141414",
    grey8               : "#141414",
    gray9               : "#171717",
    grey9               : "#171717",
    gray10              : "#1a1a1a",
    grey10              : "#1a1a1a",
    gray11              : "#1c1c1c",
    grey11              : "#1c1c1c",
    gray12              : "#1f1f1f",
    grey12              : "#1f1f1f",
    gray13              : "#212121",
    grey13              : "#212121",
    gray14              : "#242424",
    grey14              : "#242424",
    gray15              : "#262626",
    grey15              : "#262626",
    gray16              : "#292929",
    grey16              : "#292929",
    gray17              : "#2b2b2b",
    grey17              : "#2b2b2b",
    gray18              : "#2e2e2e",
    grey18              : "#2e2e2e",
    gray19              : "#303030",
    grey19              : "#303030",
    gray20              : "#333333",
    grey20              : "#333333",
    gray21              : "#363636",
    grey21              : "#363636",
    gray22              : "#383838",
    grey22              : "#383838",
    gray23              : "#3b3b3b",
    grey23              : "#3b3b3b",
    gray24              : "#3d3d3d",
    grey24              : "#3d3d3d",
    gray25              : "#404040",
    grey25              : "#404040",
    gray26              : "#424242",
    grey26              : "#424242",
    gray27              : "#454545",
    grey27              : "#454545",
    gray28              : "#474747",
    grey28              : "#474747",
    gray29              : "#4a4a4a",
    grey29              : "#4a4a4a",
    gray30              : "#4d4d4d",
    grey30              : "#4d4d4d",
    gray31              : "#4f4f4f",
    grey31              : "#4f4f4f",
    gray32              : "#525252",
    grey32              : "#525252",
    gray33              : "#545454",
    grey33              : "#545454",
    gray34              : "#575757",
    grey34              : "#575757",
    gray35              : "#595959",
    grey35              : "#595959",
    gray36              : "#5c5c5c",
    grey36              : "#5c5c5c",
    gray37              : "#5e5e5e",
    grey37              : "#5e5e5e",
    gray38              : "#616161",
    grey38              : "#616161",
    gray39              : "#636363",
    grey39              : "#636363",
    gray40              : "#666666",
    grey40              : "#666666",
    gray41              : "#696969",
    grey41              : "#696969",
    gray42              : "#6b6b6b",
    grey42              : "#6b6b6b",
    gray43              : "#6e6e6e",
    grey43              : "#6e6e6e",
    gray44              : "#707070",
    grey44              : "#707070",
    gray45              : "#737373",
    grey45              : "#737373",
    gray46              : "#757575",
    grey46              : "#757575",
    gray47              : "#787878",
    grey47              : "#787878",
    gray48              : "#7a7a7a",
    grey48              : "#7a7a7a",
    gray49              : "#7d7d7d",
    grey49              : "#7d7d7d",
    gray50              : "#7f7f7f",
    grey50              : "#7f7f7f",
    gray51              : "#828282",
    grey51              : "#828282",
    gray52              : "#858585",
    grey52              : "#858585",
    gray53              : "#878787",
    grey53              : "#878787",
    gray54              : "#8a8a8a",
    grey54              : "#8a8a8a",
    gray55              : "#8c8c8c",
    grey55              : "#8c8c8c",
    gray56              : "#8f8f8f",
    grey56              : "#8f8f8f",
    gray57              : "#919191",
    grey57              : "#919191",
    gray58              : "#949494",
    grey58              : "#949494",
    gray59              : "#969696",
    grey59              : "#969696",
    gray60              : "#999999",
    grey60              : "#999999",
    gray61              : "#9c9c9c",
    grey61              : "#9c9c9c",
    gray62              : "#9e9e9e",
    grey62              : "#9e9e9e",
    gray63              : "#a1a1a1",
    grey63              : "#a1a1a1",
    gray64              : "#a3a3a3",
    grey64              : "#a3a3a3",
    gray65              : "#a6a6a6",
    grey65              : "#a6a6a6",
    gray66              : "#a8a8a8",
    grey66              : "#a8a8a8",
    gray67              : "#ababab",
    grey67              : "#ababab",
    gray68              : "#adadad",
    grey68              : "#adadad",
    gray69              : "#b0b0b0",
    grey69              : "#b0b0b0",
    gray70              : "#b3b3b3",
    grey70              : "#b3b3b3",
    gray71              : "#b5b5b5",
    grey71              : "#b5b5b5",
    gray72              : "#b8b8b8",
    grey72              : "#b8b8b8",
    gray73              : "#bababa",
    grey73              : "#bababa",
    gray74              : "#bdbdbd",
    grey74              : "#bdbdbd",
    gray75              : "#bfbfbf",
    grey75              : "#bfbfbf",
    gray76              : "#c2c2c2",
    grey76              : "#c2c2c2",
    gray77              : "#c4c4c4",
    grey77              : "#c4c4c4",
    gray78              : "#c7c7c7",
    grey78              : "#c7c7c7",
    gray79              : "#c9c9c9",
    grey79              : "#c9c9c9",
    gray80              : "#cccccc",
    grey80              : "#cccccc",
    gray81              : "#cfcfcf",
    grey81              : "#cfcfcf",
    gray82              : "#d1d1d1",
    grey82              : "#d1d1d1",
    gray83              : "#d4d4d4",
    grey83              : "#d4d4d4",
    gray84              : "#d6d6d6",
    grey84              : "#d6d6d6",
    gray85              : "#d9d9d9",
    grey85              : "#d9d9d9",
    gray86              : "#dbdbdb",
    grey86              : "#dbdbdb",
    gray87              : "#dedede",
    grey87              : "#dedede",
    gray88              : "#e0e0e0",
    grey88              : "#e0e0e0",
    gray89              : "#e3e3e3",
    grey89              : "#e3e3e3",
    gray90              : "#e5e5e5",
    grey90              : "#e5e5e5",
    gray91              : "#e8e8e8",
    grey91              : "#e8e8e8",
    gray92              : "#ebebeb",
    grey92              : "#ebebeb",
    gray93              : "#ededed",
    grey93              : "#ededed",
    gray94              : "#f0f0f0",
    grey94              : "#f0f0f0",
    gray95              : "#f2f2f2",
    grey95              : "#f2f2f2",
    gray96              : "#f5f5f5",
    grey96              : "#f5f5f5",
    gray97              : "#f7f7f7",
    grey97              : "#f7f7f7",
    gray98              : "#fafafa",
    grey98              : "#fafafa",
    gray99              : "#fcfcfc",
    grey99              : "#fcfcfc",
    gray100             : "#ffffff",
    grey100             : "#ffffff",
    DarkGrey            : "#a9a9a9",
    DarkGray            : "#a9a9a9",
    DarkBlue            : "#00008b",
    DarkCyan            : "#008b8b",
    DarkMagenta         : "#8b008b",
    DarkRed             : "#8b0000",
    LightGreen          : "#90ee90",
  },

  //
  // Web 140 safe color definition
  //
  WEB140_COLOR_MAP: {
    Black               : "#000000",
    Navy                : "#000080",
    DarkBlue            : "#00008B",
    MediumBlue          : "#0000CD",
    Blue                : "#0000FF",
    DarkGreen           : "#006400",
    Green               : "#008000",
    Teal                : "#008080",
    DarkCyan            : "#008B8B",
    DeepSkyBlue         : "#00BFFF",
    DarkTurquoise       : "#00CED1",
    MediumSpringGreen   : "#00FA9A",
    Lime                : "#00FF00",
    SpringGreen         : "#00FF7F",
    Aqua                : "#00FFFF",
    Cyan                : "#00FFFF",
    MidnightBlue        : "#191970",
    DodgerBlue          : "#1E90FF",
    LightSeaGreen       : "#20B2AA",
    ForestGreen         : "#228B22",
    SeaGreen            : "#2E8B57",
    DarkSlateGray       : "#2F4F4F",
    DarkSlateGrey       : "#2F4F4F",
    LimeGreen           : "#32CD32",
    MediumSeaGreen      : "#3CB371",
    Turquoise           : "#40E0D0",
    RoyalBlue           : "#4169E1",
    SteelBlue           : "#4682B4",
    DarkSlateBlue       : "#483D8B",
    MediumTurquoise     : "#48D1CC",
    Indigo              : "#4B0082",
    DarkOliveGreen      : "#556B2F",
    CadetBlue           : "#5F9EA0",
    CornflowerBlue      : "#6495ED",
    MediumAquaMarine    : "#66CDAA",
    DimGray             : "#696969",
    DimGrey             : "#696969",
    SlateBlue           : "#6A5ACD",
    OliveDrab           : "#6B8E23",
    SlateGray           : "#708090",
    SlateGrey           : "#708090",
    LightSlateGray      : "#778899",
    LightSlateGrey      : "#778899",
    MediumSlateBlue     : "#7B68EE",
    LawnGreen           : "#7CFC00",
    Chartreuse          : "#7FFF00",
    Aquamarine          : "#7FFFD4",
    Maroon              : "#800000",
    Purple              : "#800080",
    Olive               : "#808000",
    Gray                : "#808080",
    Grey                : "#808080",
    SkyBlue             : "#87CEEB",
    LightSkyBlue        : "#87CEFA",
    BlueViolet          : "#8A2BE2",
    DarkRed             : "#8B0000",
    DarkMagenta         : "#8B008B",
    SaddleBrown         : "#8B4513",
    DarkSeaGreen        : "#8FBC8F",
    LightGreen          : "#90EE90",
    MediumPurple        : "#9370D8",
    DarkViolet          : "#9400D3",
    PaleGreen           : "#98FB98",
    DarkOrchid          : "#9932CC",
    YellowGreen         : "#9ACD32",
    Sienna              : "#A0522D",
    Brown               : "#A52A2A",
    DarkGray            : "#A9A9A9",
    DarkGrey            : "#A9A9A9",
    LightBlue           : "#ADD8E6",
    GreenYellow         : "#ADFF2F",
    PaleTurquoise       : "#AFEEEE",
    LightSteelBlue      : "#B0C4DE",
    PowderBlue          : "#B0E0E6",
    FireBrick           : "#B22222",
    DarkGoldenRod       : "#B8860B",
    MediumOrchid        : "#BA55D3",
    RosyBrown           : "#BC8F8F",
    DarkKhaki           : "#BDB76B",
    Silver              : "#C0C0C0",
    MediumVioletRed     : "#C71585",
    IndianRed           : "#CD5C5C",
    Peru                : "#CD853F",
    Chocolate           : "#D2691E",
    Tan                 : "#D2B48C",
    LightGray           : "#D3D3D3",
    LightGrey           : "#D3D3D3",
    PaleVioletRed       : "#D87093",
    Thistle             : "#D8BFD8",
    Orchid              : "#DA70D6",
    GoldenRod           : "#DAA520",
    Crimson             : "#DC143C",
    Gainsboro           : "#DCDCDC",
    Plum                : "#DDA0DD",
    BurlyWood           : "#DEB887",
    LightCyan           : "#E0FFFF",
    Lavender            : "#E6E6FA",
    DarkSalmon          : "#E9967A",
    Violet              : "#EE82EE",
    PaleGoldenRod       : "#EEE8AA",
    LightCoral          : "#F08080",
    Khaki               : "#F0E68C",
    AliceBlue           : "#F0F8FF",
    HoneyDew            : "#F0FFF0",
    Azure               : "#F0FFFF",
    SandyBrown          : "#F4A460",
    Wheat               : "#F5DEB3",
    Beige               : "#F5F5DC",
    WhiteSmoke          : "#F5F5F5",
    MintCream           : "#F5FFFA",
    GhostWhite          : "#F8F8FF",
    Salmon              : "#FA8072",
    AntiqueWhite        : "#FAEBD7",
    Linen               : "#FAF0E6",
    LightGoldenRodYellow: "#FAFAD2",
    OldLace             : "#FDF5E6",
    Red                 : "#FF0000",
    Fuchsia             : "#FF00FF",
    Magenta             : "#FF00FF",
    DeepPink            : "#FF1493",
    OrangeRed           : "#FF4500",
    Tomato              : "#FF6347",
    HotPink             : "#FF69B4",
    Coral               : "#FF7F50",
    Darkorange          : "#FF8C00",
    LightSalmon         : "#FFA07A",
    Orange              : "#FFA500",
    LightPink           : "#FFB6C1",
    Pink                : "#FFC0CB",
    Gold                : "#FFD700",
    PeachPuff           : "#FFDAB9",
    NavajoWhite         : "#FFDEAD",
    Moccasin            : "#FFE4B5",
    Bisque              : "#FFE4C4",
    MistyRose           : "#FFE4E1",
    BlanchedAlmond      : "#FFEBCD",
    PapayaWhip          : "#FFEFD5",
    LavenderBlush       : "#FFF0F5",
    SeaShell            : "#FFF5EE",
    Cornsilk            : "#FFF8DC",
    LemonChiffon        : "#FFFACD",
    FloralWhite         : "#FFFAF0",
    Snow                : "#FFFAFA",
    Yellow              : "#FFFF00",
    LightYellow         : "#FFFFE0",
    Ivory               : "#FFFFF0",
    White               : "#FFFFFF"
  },

};

coUtils.Constant.WEB140_COLOR_MAP_REVERSE = function() {

  var result = {};
  var key, value;

  for ([key, value] in Iterator(coUtils.Constant.WEB140_COLOR_MAP)) {
    result[value] = key;
    coUtils.Constant.WEB140_COLOR_MAP[key.toLowerCase()] = value;
  } 
  return result;

} ();


coUtils.Constant.X11_COLOR_MAP_REVERSE = function() {

  var result = {};
  var key, value;

  for ([key, value] in Iterator(coUtils.Constant.X11_COLOR_MAP)) {
    result[value] = key;
    coUtils.Constant.X11_COLOR_MAP[key.toLowerCase()] = value;
  } 
  return result;

} ();


coUtils.Constant.LOCALE_ID_MAP = {
  af:"Afrikaans / Afrikaans",
  'af-ZA':"Afrikaans (South Africa) / Afrikaans (Suid Afrika)",
  sq:"Albanian / shqipe",
  'sq-AL':"Albanian (Albania) / shqipe (Shqip\xEBria)",
  gsw:"Alsatian / Els\xE4ssisch",
  'gsw-FR':"Alsatian (France) / Els\xE4ssisch (Fr\xE0nkrisch)",
  am:"Amharic / \u12A0\u121B\u122D\u129B",
  'am-ET':"Amharic (Ethiopia) / \u12A0\u121B\u122D\u129B (\u12A2\u1275\u12EE\u1335\u12EB)",
  ar:"Arabic\u200E / \u0627\u0644\u0639\u0631\u0628\u064A\u0629\u200F",
  'ar-DZ':"Arabic (Algeria)\u200E / \u0627\u0644\u0639\u0631\u0628\u064A\u0629 (\u0627\u0644\u062C\u0632\u0627\u0626\u0631)\u200F",
  'ar-BH':"Arabic (Bahrain)\u200E / \u0627\u0644\u0639\u0631\u0628\u064A\u0629 (\u0627\u0644\u0628\u062D\u0631\u064A\u0646)\u200F",
  'ar-EG':"Arabic (Egypt)\u200E / \u0627\u0644\u0639\u0631\u0628\u064A\u0629 (\u0645\u0635\u0631)\u200F",
  'ar-IQ':"Arabic (Iraq)\u200E / \u0627\u0644\u0639\u0631\u0628\u064A\u0629 (\u0627\u0644\u0639\u0631\u0627\u0642)\u200F",
  'ar-JO':"Arabic (Jordan)\u200E / \u0627\u0644\u0639\u0631\u0628\u064A\u0629 (\u0627\u0644\u0623\u0631\u062F\u0646)\u200F",
  'ar-KW':"Arabic (Kuwait)\u200E / \u0627\u0644\u0639\u0631\u0628\u064A\u0629 (\u0627\u0644\u0643\u0648\u064A\u062A)\u200F",
  'ar-LB':"Arabic (Lebanon)\u200E / \u0627\u0644\u0639\u0631\u0628\u064A\u0629 (\u0644\u0628\u0646\u0627\u0646)\u200F",
  'ar-LY':"Arabic (Libya)\u200E / \u0627\u0644\u0639\u0631\u0628\u064A\u0629 (\u0644\u064A\u0628\u064A\u0627)\u200F",
  'ar-MA':"Arabic (Morocco)\u200E / \u0627\u0644\u0639\u0631\u0628\u064A\u0629 (\u0627\u0644\u0645\u0645\u0644\u0643\u0629 \u0627\u0644\u0645\u063A\u0631\u0628\u064A\u0629)\u200F",
  'ar-OM':"Arabic (Oman)\u200E / \u0627\u0644\u0639\u0631\u0628\u064A\u0629 (\u0639\u0645\u0627\u0646)\u200F",
  'ar-QA':"Arabic (Qatar)\u200E / \u0627\u0644\u0639\u0631\u0628\u064A\u0629 (\u0642\u0637\u0631)\u200F",
  'ar-SA':"Arabic (Saudi Arabia)\u200E / \u0627\u0644\u0639\u0631\u0628\u064A\u0629 (\u0627\u0644\u0645\u0645\u0644\u0643\u0629 \u0627\u0644\u0639\u0631\u0628\u064A\u0629 \u0627\u0644\u0633\u0639\u0648\u062F\u064A\u0629)\u200F",
  'ar-SY':"Arabic (Syria)\u200E / \u0627\u0644\u0639\u0631\u0628\u064A\u0629 (\u0633\u0648\u0631\u064A\u0627)\u200F",
  'ar-TN':"Arabic (Tunisia)\u200E / \u0627\u0644\u0639\u0631\u0628\u064A\u0629 (\u062A\u0648\u0646\u0633)\u200F",
  'ar-AE':"Arabic (U.A.E.)\u200E / \u0627\u0644\u0639\u0631\u0628\u064A\u0629 (\u0627\u0644\u0625\u0645\u0627\u0631\u0627\u062A \u0627\u0644\u0639\u0631\u0628\u064A\u0629 \u0627\u0644\u0645\u062A\u062D\u062F\u0629)\u200F",
  'ar-YE':"Arabic (Yemen)\u200E / \u0627\u0644\u0639\u0631\u0628\u064A\u0629 (\u0627\u0644\u064A\u0645\u0646)\u200F",
  hy:"Armenian / \u0540\u0561\u0575\u0565\u0580\u0565\u0576",
  'hy-AM':"Armenian (Armenia) / \u0540\u0561\u0575\u0565\u0580\u0565\u0576 (\u0540\u0561\u0575\u0561\u057D\u057F\u0561\u0576)",
  as:"Assamese / \u0985\u09B8\u09AE\u09C0\u09AF\u09BC\u09BE",
  'as-IN':"Assamese (India) / \u0985\u09B8\u09AE\u09C0\u09AF\u09BC\u09BE (\u09AD\u09BE\u09F0\u09A4)",
  az:"Azeri / Az\u0259rbaycan\xAD\u0131l\u0131",
  'az-Cyrl':"Azeri (Cyrillic) / \u0410\u0437\u04D9\u0440\u0431\u0430\u0458\u04B9\u0430\u043D \u0434\u0438\u043B\u0438",
  'az-Cyrl-AZ':"Azeri (Cyrillic, Azerbaijan) / \u0410\u0437\u04D9\u0440\u0431\u0430\u0458\u04B9\u0430\u043D (\u0410\u0437\u04D9\u0440\u0431\u0430\u0458\u04B9\u0430\u043D)",
  'az-Latn':"Azeri (Latin) / Az\u0259rbaycan\xAD\u0131l\u0131",
  'az-Latn-AZ':"Azeri (Latin, Azerbaijan) / Az\u0259rbaycan\xAD\u0131l\u0131 (Az\u0259rbaycan)",
  ba:"Bashkir / \u0411\u0430\u0448\u04A1\u043E\u0440\u0442",
  'ba-RU':"Bashkir (Russia) / \u0411\u0430\u0448\u04A1\u043E\u0440\u0442 (\u0420\u043E\u0441\u0441\u0438\u044F)",
  eu:"Basque / euskara",
  'eu-ES':"Basque (Basque) / euskara (euskara)",
  be:"Belarusian / \u0411\u0435\u043B\u0430\u0440\u0443\u0441\u043A\u0456",
  'be-BY':"Belarusian (Belarus) / \u0411\u0435\u043B\u0430\u0440\u0443\u0441\u043A\u0456 (\u0411\u0435\u043B\u0430\u0440\u0443\u0441\u044C)",
  bn:"Bengali / \u09AC\u09BE\u0982\u09B2\u09BE",
  'bn-BD':"Bengali (Bangladesh) / \u09AC\u09BE\u0982\u09B2\u09BE (\u09AC\u09BE\u0982\u09B2\u09BE\u09A6\u09C7\u09B6)",
  'bn-IN':"Bengali (India) / \u09AC\u09BE\u0982\u09B2\u09BE (\u09AD\u09BE\u09B0\u09A4)",
  bs:"Bosnian / bosanski",
  'bs-Cyrl':"Bosnian (Cyrillic) / \u0431\u043E\u0441\u0430\u043D\u0441\u043A\u0438 (\u040B\u0438\u0440\u0438\u043B\u0438\u0446\u0430)",
  'bs-Cyrl-BA':"Bosnian (Cyrillic, Bosnia and Herzegovina) / \u0431\u043E\u0441\u0430\u043D\u0441\u043A\u0438 (\u0411\u043E\u0441\u043D\u0430 \u0438 \u0425\u0435\u0440\u0446\u0435\u0433\u043E\u0432\u0438\u043D\u0430)",
  'bs-Latn':"Bosnian (Latin) / bosanski (Latinica)",
  'bs-Latn-BA':"Bosnian (Latin, Bosnia and Herzegovina) / bosanski (Bosna i Hercegovina)",
  br:"Breton / brezhoneg",
  'br-FR':"Breton (France) / brezhoneg (Fra\xF1s)",
  bg:"Bulgarian / \u0431\u044A\u043B\u0433\u0430\u0440\u0441\u043A\u0438",
  'bg-BG':"Bulgarian (Bulgaria) / \u0431\u044A\u043B\u0433\u0430\u0440\u0441\u043A\u0438 (\u0411\u044A\u043B\u0433\u0430\u0440\u0438\u044F)",
  ca:"Catalan / catal\xE0",
  'ca-ES':"Catalan (Catalan) / catal\xE0 (catal\xE0)",
  zh:"Chinese / \u4E2D\u6587",
  'zh-Hans':"Chinese (Simplified) / \u4E2D\u6587(\u7B80\u4F53)",
  'zh-CN':"Chinese (Simplified, PRC) / \u4E2D\u6587(\u4E2D\u534E\u4EBA\u6C11\u5171\u548C\u56FD)",
  'zh-SG':"Chinese (Simplified, Singapore) / \u4E2D\u6587(\u65B0\u52A0\u5761)",
  'zh-Hant':"Chinese (Traditional) / \u4E2D\u6587(\u7E41\u9AD4)",
  'zh-HK':"Chinese (Traditional, Hong Kong S.A.R.) / \u4E2D\u6587(\u9999\u6E2F\u7279\u5225\u884C\u653F\u5340)",
  'zh-MO':"Chinese (Traditional, Macao S.A.R.) / \u4E2D\u6587(\u6FB3\u9580\u7279\u5225\u884C\u653F\u5340)",
  'zh-TW':"Chinese (Traditional, Taiwan) / \u4E2D\u6587(\u53F0\u7063)",
  co:"Corsican / Corsu",
  'co-FR':"Corsican (France) / Corsu (France)",
  hr:"Croatian / hrvatski",
  'hr-HR':"Croatian (Croatia) / hrvatski (Hrvatska)",
  'hr-BA':"Croatian (Latin, Bosnia and Herzegovina) / hrvatski (Bosna i Hercegovina)",
  cs:"Czech / \u010De\u0161tina",
  'cs-CZ':"Czech (Czech Republic) / \u010De\u0161tina (\u010Cesk\xE1 republika)",
  da:"Danish / dansk",
  'da-DK':"Danish (Denmark) / dansk (Danmark)",
  prs:"Dari\u200E / \u062F\u0631\u0649\u200F",
  'prs-AF':"Dari (Afghanistan)\u200E / \u062F\u0631\u0649 (\u0627\u0641\u063A\u0627\u0646\u0633\u062A\u0627\u0646)\u200F",
  dv:"Divehi\u200E / \u078B\u07A8\u0788\u07AC\u0780\u07A8\u0784\u07A6\u0790\u07B0\u200F",
  'dv-MV':"Divehi (Maldives)\u200E / \u078B\u07A8\u0788\u07AC\u0780\u07A8\u0784\u07A6\u0790\u07B0 (\u078B\u07A8\u0788\u07AC\u0780\u07A8 \u0783\u07A7\u0787\u07B0\u0796\u07AC)\u200F",
  nl:"Dutch / Nederlands",
  'nl-BE':"Dutch (Belgium) / Nederlands (Belgi\xEB)",
  'nl-NL':"Dutch (Netherlands) / Nederlands (Nederland)",
  en:"English / English",
  'en-AU':"English (Australia) / English (Australia)",
  'en-BZ':"English (Belize) / English (Belize)",
  'en-CA':"English (Canada) / English (Canada)",
  'en-029':"English (Caribbean) / English (Caribbean)",
  'en-IN':"English (India) / English (India)",
  'en-IE':"English (Ireland) / English (Ireland)",
  'en-JM':"English (Jamaica) / English (Jamaica)",
  'en-MY':"English (Malaysia) / English (Malaysia)",
  'en-NZ':"English (New Zealand) / English (New Zealand)",
  'en-PH':"English (Republic of the Philippines) / English (Philippines)",
  'en-SG':"English (Singapore) / English (Singapore)",
  'en-ZA':"English (South Africa) / English (South Africa)",
  'en-TT':"English (Trinidad and Tobago) / English (Trinidad y Tobago)",
  'en-GB':"English (United Kingdom) / English (United Kingdom)",
  'en-US':"English (United States) / English (United States)",
  'en-ZW':"English (Zimbabwe) / English (Zimbabwe)",
  et:"Estonian / eesti",
  'et-EE':"Estonian (Estonia) / eesti (Eesti)",
  fo:"Faroese / f\xF8royskt",
  'fo-FO':"Faroese (Faroe Islands) / f\xF8royskt (F\xF8royar)",
  fil:"Filipino / Filipino",
  'fil-PH':"Filipino (Philippines) / Filipino (Pilipinas)",
  fi:"Finnish / suomi",
  'fi-FI':"Finnish (Finland) / suomi (Suomi)",
  fr:"French / fran\xE7ais",
  'fr-BE':"French (Belgium) / fran\xE7ais (Belgique)",
  'fr-CA':"French (Canada) / fran\xE7ais (Canada)",
  'fr-FR':"French (France) / fran\xE7ais (France)",
  'fr-LU':"French (Luxembourg) / fran\xE7ais (Luxembourg)",
  'fr-MC':"French (Monaco) / fran\xE7ais (Principaut\xE9 de Monaco)",
  'fr-CH':"French (Switzerland) / fran\xE7ais (Suisse)",
  fy:"Frisian / Frysk",
  'fy-NL':"Frisian (Netherlands) / Frysk (Nederl\xE2n)",
  gl:"Galician / galego",
  'gl-ES':"Galician (Galician) / galego (galego)",
  ka:"Georgian / \u10E5\u10D0\u10E0\u10D7\u10E3\u10DA\u10D8",
  'ka-GE':"Georgian (Georgia) / \u10E5\u10D0\u10E0\u10D7\u10E3\u10DA\u10D8 (\u10E1\u10D0\u10E5\u10D0\u10E0\u10D7\u10D5\u10D4\u10DA\u10DD)",
  de:"German / Deutsch",
  'de-AT':"German (Austria) / Deutsch (\xD6sterreich)",
  'de-DE':"German (Germany) / Deutsch (Deutschland)",
  'de-LI':"German (Liechtenstein) / Deutsch (Liechtenstein)",
  'de-LU':"German (Luxembourg) / Deutsch (Luxemburg)",
  'de-CH':"German (Switzerland) / Deutsch (Schweiz)",
  el:"Greek / \u0395\u03BB\u03BB\u03B7\u03BD\u03B9\u03BA\u03AC",
  'el-GR':"Greek (Greece) / \u0395\u03BB\u03BB\u03B7\u03BD\u03B9\u03BA\u03AC (\u0395\u03BB\u03BB\u03AC\u03B4\u03B1)",
  kl:"Greenlandic / kalaallisut",
  'kl-GL':"Greenlandic (Greenland) / kalaallisut (Kalaallit Nunaat)",
  gu:"Gujarati / \u0A97\u0AC1\u0A9C\u0AB0\u0ABE\u0AA4\u0AC0",
  'gu-IN':"Gujarati (India) / \u0A97\u0AC1\u0A9C\u0AB0\u0ABE\u0AA4\u0AC0 (\u0AAD\u0ABE\u0AB0\u0AA4)",
  ha:"Hausa / Hausa",
  'ha-Latn':"Hausa (Latin) / Hausa (Latin)",
  'ha-Latn-NG':"Hausa (Latin, Nigeria) / Hausa (Nigeria)",
  he:"Hebrew\u200E / \u05E2\u05D1\u05E8\u05D9\u05EA\u200F",
  'he-IL':"Hebrew (Israel)\u200E / \u05E2\u05D1\u05E8\u05D9\u05EA (\u05D9\u05E9\u05E8\u05D0\u05DC)\u200F",
  hi:"Hindi / \u0939\u093F\u0902\u0926\u0940",
  'hi-IN':"Hindi (India) / \u0939\u093F\u0902\u0926\u0940 (\u092D\u093E\u0930\u0924)",
  hu:"Hungarian / magyar",
  'hu-HU':"Hungarian (Hungary) / magyar (Magyarorsz\xE1g)",
  is:"Icelandic / \xEDslenska",
  'is-IS':"Icelandic (Iceland) / \xEDslenska (\xCDsland)",
  ig:"Igbo / Igbo",
  'ig-NG':"Igbo (Nigeria) / Igbo (Nigeria)",
  id:"Indonesian / Bahasa Indonesia",
  'id-ID':"Indonesian (Indonesia) / Bahasa Indonesia (Indonesia)",
  iu:"Inuktitut / Inuktitut",
  'iu-Latn':"Inuktitut (Latin) / Inuktitut (Qaliujaaqpait)",
  'iu-Latn-CA':"Inuktitut (Latin, Canada) / Inuktitut",
  'iu-Cans':"Inuktitut (Syllabics) / \u1403\u14C4\u1483\u144E\u1450\u1466 (\u1583\u14C2\u1405\u152E\u1585\u1438\u1403\u1466)",
  'iu-Cans-CA':"Inuktitut (Syllabics, Canada) / \u1403\u14C4\u1483\u144E\u1450\u1466 (\u1472\u14C7\u1455\u14A5)",
  ga:"Irish / Gaeilge",
  'ga-IE':"Irish (Ireland) / Gaeilge (\xC9ire)",
  xh:"isiXhosa / isiXhosa",
  'xh-ZA':"isiXhosa (South Africa) / isiXhosa (uMzantsi Afrika)",
  zu:"isiZulu / isiZulu",
  'zu-ZA':"isiZulu (South Africa) / isiZulu (iNingizimu Afrika)",
  it:"Italian / italiano",
  'it-IT':"Italian (Italy) / italiano (Italia)",
  'it-CH':"Italian (Switzerland) / italiano (Svizzera)",
  ja:"Japanese / \u65E5\u672C\u8A9E",
  'ja-JP':"Japanese (Japan) / \u65E5\u672C\u8A9E (\u65E5\u672C)",
  kn:"Kannada / \u0C95\u0CA8\u0CCD\u0CA8\u0CA1",
  'kn-IN':"Kannada (India) / \u0C95\u0CA8\u0CCD\u0CA8\u0CA1 (\u0CAD\u0CBE\u0CB0\u0CA4)",
  kk:"Kazakh / \u049A\u0430\u0437\u0430\u049B",
  'kk-KZ':"Kazakh (Kazakhstan) / \u049A\u0430\u0437\u0430\u049B (\u049A\u0430\u0437\u0430\u049B\u0441\u0442\u0430\u043D)",
  km:"Khmer / \u1781\u17D2\u1798\u17C2\u179A",
  'km-KH':"Khmer (Cambodia) / \u1781\u17D2\u1798\u17C2\u179A (\u1780\u1798\u17D2\u1796\u17BB\u1787\u17B6)",
  qut:"K'iche / K'iche",
  'qut-GT':"K'iche (Guatemala) / K'iche (Guatemala)",
  rw:"Kinyarwanda / Kinyarwanda",
  'rw-RW':"Kinyarwanda (Rwanda) / Kinyarwanda (Rwanda)",
  sw:"Kiswahili / Kiswahili",
  'sw-KE':"Kiswahili (Kenya) / Kiswahili (Kenya)",
  kok:"Konkani / \u0915\u094B\u0902\u0915\u0923\u0940",
  'kok-IN':"Konkani (India) / \u0915\u094B\u0902\u0915\u0923\u0940 (\u092D\u093E\u0930\u0924)",
  ko:"Korean / \uD55C\uAD6D\uC5B4",
  'ko-KR':"Korean (Korea) / \uD55C\uAD6D\uC5B4 (\uB300\uD55C\uBBFC\uAD6D)",
  ky:"Kyrgyz / \u041A\u044B\u0440\u0433\u044B\u0437",
  'ky-KG':"Kyrgyz (Kyrgyzstan) / \u041A\u044B\u0440\u0433\u044B\u0437 (\u041A\u044B\u0440\u0433\u044B\u0437\u0441\u0442\u0430\u043D)",
  lo:"Lao / \u0EA5\u0EB2\u0EA7",
  'lo-LA':"Lao (Lao P.D.R.) / \u0EA5\u0EB2\u0EA7 (\u0EAA.\u0E9B.\u0E9B. \u0EA5\u0EB2\u0EA7)",
  lv:"Latvian / latvie\u0161u",
  'lv-LV':"Latvian (Latvia) / latvie\u0161u (Latvija)",
  lt:"Lithuanian / lietuvi\u0173",
  'lt-LT':"Lithuanian (Lithuania) / lietuvi\u0173 (Lietuva)",
  dsb:"Lower Sorbian / dolnoserb\u0161\u0107ina",
  'dsb-DE':"Lower Sorbian (Germany) / dolnoserb\u0161\u0107ina (Nimska)",
  lb:"Luxembourgish / L\xEBtzebuergesch",
  'lb-LU':"Luxembourgish (Luxembourg) / L\xEBtzebuergesch (Luxembourg)",
  'mk-MK':"Macedonian (Former Yugoslav Republic of Macedonia) / \u043C\u0430\u043A\u0435\u0434\u043E\u043D\u0441\u043A\u0438 \u0458\u0430\u0437\u0438\u043A (\u041C\u0430\u043A\u0435\u0434\u043E\u043D\u0438\u0458\u0430)",
  mk:"Macedonian (FYROM) / \u043C\u0430\u043A\u0435\u0434\u043E\u043D\u0441\u043A\u0438 \u0458\u0430\u0437\u0438\u043A",
  ms:"Malay / Bahasa Melayu",
  'ms-BN':"Malay (Brunei Darussalam) / Bahasa Melayu (Brunei Darussalam)",
  'ms-MY':"Malay (Malaysia) / Bahasa Melayu (Malaysia)",
  ml:"Malayalam / \u0D2E\u0D32\u0D2F\u0D3E\u0D33\u0D02",
  'ml-IN':"Malayalam (India) / \u0D2E\u0D32\u0D2F\u0D3E\u0D33\u0D02 (\u0D2D\u0D3E\u0D30\u0D24\u0D02)",
  mt:"Maltese / Malti",
  'mt-MT':"Maltese (Malta) / Malti (Malta)",
  mi:"Maori / Reo M\u0101ori",
  'mi-NZ':"Maori (New Zealand) / Reo M\u0101ori (Aotearoa)",
  arn:"Mapudungun / Mapudungun",
  'arn-CL':"Mapudungun (Chile) / Mapudungun (Chile)",
  mr:"Marathi / \u092E\u0930\u093E\u0920\u0940",
  'mr-IN':"Marathi (India) / \u092E\u0930\u093E\u0920\u0940 (\u092D\u093E\u0930\u0924)",
  moh:"Mohawk / Kanien'k\xE9ha",
  'moh-CA':"Mohawk (Mohawk) / Kanien'k\xE9ha",
  mn:"Mongolian (Cyrillic) / \u041C\u043E\u043D\u0433\u043E\u043B \u0445\u044D\u043B",
  'mn-Cyrl':"Mongolian (Cyrillic) / \u041C\u043E\u043D\u0433\u043E\u043B \u0445\u044D\u043B",
  'mn-MN':"Mongolian (Cyrillic, Mongolia) / \u041C\u043E\u043D\u0433\u043E\u043B \u0445\u044D\u043B (\u041C\u043E\u043D\u0433\u043E\u043B \u0443\u043B\u0441)",
  'mn-Mong':"Mongolian (Traditional Mongolian) / \u182E\u1824\u1828\u182D\u182D\u1824\u182F \u182C\u1821\u182F\u1821",
  'mn-Mong-CN':"Mongolian (Traditional Mongolian, PRC) / \u182E\u1824\u1828\u182D\u182D\u1824\u182F \u182C\u1821\u182F\u1821 (\u182A\u1826\u182D\u1826\u1833\u1821 \u1828\u1820\u1822\u1837\u1820\u182E\u1833\u1820\u182C\u1824 \u1833\u1824\u182E\u1833\u1820\u1833\u1824 \u1820\u1837\u1820\u1833 \u1823\u182F\u1823\u1830)",
  ne:"Nepali / \u0928\u0947\u092A\u093E\u0932\u0940",
  'ne-NP':"Nepali (Nepal) / \u0928\u0947\u092A\u093E\u0932\u0940 (\u0928\u0947\u092A\u093E\u0932)",
  no:"Norwegian / norsk",
  nb:"Norwegian (Bokm\xE5l) / norsk (bokm\xE5l)",
  nn:"Norwegian (Nynorsk) / norsk (nynorsk)",
  'nb-NO':"Norwegian, Bokm\xE5l (Norway) / norsk, bokm\xE5l (Norge)",
  'nn-NO':"Norwegian, Nynorsk (Norway) / norsk, nynorsk (Noreg)",
  oc:"Occitan / Occitan",
  'oc-FR':"Occitan (France) / Occitan (Fran\xE7a)",
  or:"Oriya / \u0B13\u0B21\u0B3C\u0B3F\u0B06",
  'or-IN':"Oriya (India) / \u0B13\u0B21\u0B3C\u0B3F\u0B06 (\u0B2D\u0B3E\u0B30\u0B24)",
  ps:"Pashto\u200E / \u067E\u069A\u062A\u0648\u200F",
  'ps-AF':"Pashto (Afghanistan)\u200E / \u067E\u069A\u062A\u0648 (\u0627\u0641\u063A\u0627\u0646\u0633\u062A\u0627\u0646)\u200F",
  fa:"Persian\u200E / \u0641\u0627\u0631\u0633\u0649\u200F",
  'fa-IR':"Persian\u200E / \u0641\u0627\u0631\u0633\u0649 (\u0627\u06CC\u0631\u0627\u0646)\u200F",
  pl:"Polish / polski",
  'pl-PL':"Polish (Poland) / polski (Polska)",
  pt:"Portuguese / Portugu\xEAs",
  'pt-BR':"Portuguese (Brazil) / Portugu\xEAs (Brasil)",
  'pt-PT':"Portuguese (Portugal) / portugu\xEAs (Portugal)",
  pa:"Punjabi / \u0A2A\u0A70\u0A1C\u0A3E\u0A2C\u0A40",
  'pa-IN':"Punjabi (India) / \u0A2A\u0A70\u0A1C\u0A3E\u0A2C\u0A40 (\u0A2D\u0A3E\u0A30\u0A24)",
  quz:"Quechua / runasimi",
  'quz-BO':"Quechua (Bolivia) / runasimi (Qullasuyu)",
  'quz-EC':"Quechua (Ecuador) / runasimi (Ecuador)",
  'quz-PE':"Quechua (Peru) / runasimi (Piruw)",
  ro:"Romanian / rom\xE2n\u0103",
  'ro-RO':"Romanian (Romania) / rom\xE2n\u0103 (Rom\xE2nia)",
  rm:"Romansh / Rumantsch",
  'rm-CH':"Romansh (Switzerland) / Rumantsch (Svizra)",
  ru:"Russian / \u0440\u0443\u0441\u0441\u043A\u0438\u0439",
  'ru-RU':"Russian (Russia) / \u0440\u0443\u0441\u0441\u043A\u0438\u0439 (\u0420\u043E\u0441\u0441\u0438\u044F)",
  smn:"Sami (Inari) / s\xE4mikiel\xE2",
  smj:"Sami (Lule) / julevus\xE1megiella",
  se:"Sami (Northern) / davvis\xE1megiella",
  sms:"Sami (Skolt) / s\xE4\xE4m\xB4\u01E9i\xF5ll",
  sma:"Sami (Southern) / \xE5arjelsaemiengiele",
  'smn-FI':"Sami, Inari (Finland) / s\xE4mikiel\xE2 (Suom\xE2)",
  'smj-NO':"Sami, Lule (Norway) / julevus\xE1megiella (Vuodna)",
  'smj-SE':"Sami, Lule (Sweden) / julevus\xE1megiella (Svierik)",
  'se-FI':"Sami, Northern (Finland) / davvis\xE1megiella (Suopma)",
  'se-NO':"Sami, Northern (Norway) / davvis\xE1megiella (Norga)",
  'se-SE':"Sami, Northern (Sweden) / davvis\xE1megiella (Ruo\u0167\u0167a)",
  'sms-FI':"Sami, Skolt (Finland) / s\xE4\xE4m\xB4\u01E9i\xF5ll (L\xE4\xE4\xB4ddj\xE2nnam)",
  'sma-NO':"Sami, Southern (Norway) / \xE5arjelsaemiengiele (N\xF6\xF6rje)",
  'sma-SE':"Sami, Southern (Sweden) / \xE5arjelsaemiengiele (Sveerje)",
  sa:"Sanskrit / \u0938\u0902\u0938\u094D\u0915\u0943\u0924",
  'sa-IN':"Sanskrit (India) / \u0938\u0902\u0938\u094D\u0915\u0943\u0924 (\u092D\u093E\u0930\u0924\u092E\u094D)",
  gd:"Scottish Gaelic / G\xE0idhlig",
  'gd-GB':"Scottish Gaelic (United Kingdom) / G\xE0idhlig (An R\xECoghachd Aonaichte)",
  sr:"Serbian / srpski",
  'sr-Cyrl':"Serbian (Cyrillic) / \u0441\u0440\u043F\u0441\u043A\u0438 (\u040B\u0438\u0440\u0438\u043B\u0438\u0446\u0430)",
  'sr-Cyrl-BA':"Serbian (Cyrillic, Bosnia and Herzegovina) / \u0441\u0440\u043F\u0441\u043A\u0438 (\u0411\u043E\u0441\u043D\u0430 \u0438 \u0425\u0435\u0440\u0446\u0435\u0433\u043E\u0432\u0438\u043D\u0430)",
  'sr-Cyrl-ME':"Serbian (Cyrillic, Montenegro) / \u0441\u0440\u043F\u0441\u043A\u0438 (\u0426\u0440\u043D\u0430 \u0413\u043E\u0440\u0430)",
  'sr-Cyrl-CS':"Serbian (Cyrillic, Serbia and Montenegro (Former)) / \u0441\u0440\u043F\u0441\u043A\u0438 (\u0421\u0440\u0431\u0438\u0458\u0430 \u0438 \u0426\u0440\u043D\u0430 \u0413\u043E\u0440\u0430 (\u041F\u0440\u0435\u0442\u0445\u043E\u0434\u043D\u043E))",
  'sr-Cyrl-RS':"Serbian (Cyrillic, Serbia) / \u0441\u0440\u043F\u0441\u043A\u0438 (\u0421\u0440\u0431\u0438\u0458\u0430)",
  'sr-Latn':"Serbian (Latin) / srpski (Latinica)",
  'sr-Latn-BA':"Serbian (Latin, Bosnia and Herzegovina) / srpski (Bosna i Hercegovina)",
  'sr-Latn-ME':"Serbian (Latin, Montenegro) / srpski (Crna Gora)",
  'sr-Latn-CS':"Serbian (Latin, Serbia and Montenegro (Former)) / srpski (Srbija i Crna Gora (Prethodno))",
  'sr-Latn-RS':"Serbian (Latin, Serbia) / srpski (Srbija)",
  nso:"Sesotho sa Leboa / Sesotho sa Leboa",
  'nso-ZA':"Sesotho sa Leboa (South Africa) / Sesotho sa Leboa (Afrika Borwa)",
  tn:"Setswana / Setswana",
  'tn-ZA':"Setswana (South Africa) / Setswana (Aforika Borwa)",
  si:"Sinhala / \u0DC3\u0DD2\u0D82\u0DC4",
  'si-LK':"Sinhala (Sri Lanka) / \u0DC3\u0DD2\u0D82\u0DC4 (\u0DC1\u0DCA\u200D\u0DBB\u0DD3 \u0DBD\u0D82\u0D9A\u0DCF)",
  sk:"Slovak / sloven\u010Dina",
  'sk-SK':"Slovak (Slovakia) / sloven\u010Dina (Slovensk\xE1 republika)",
  sl:"Slovenian / slovenski",
  'sl-SI':"Slovenian (Slovenia) / slovenski (Slovenija)",
  es:"Spanish / espa\xF1ol",
  'es-AR':"Spanish (Argentina) / Espa\xF1ol (Argentina)",
  'es-BO':"Spanish (Bolivia) / Espa\xF1ol (Bolivia)",
  'es-CL':"Spanish (Chile) / Espa\xF1ol (Chile)",
  'es-CO':"Spanish (Colombia) / Espa\xF1ol (Colombia)",
  'es-CR':"Spanish (Costa Rica) / Espa\xF1ol (Costa Rica)",
  'es-DO':"Spanish (Dominican Republic) / Espa\xF1ol (Rep\xFAblica Dominicana)",
  'es-EC':"Spanish (Ecuador) / Espa\xF1ol (Ecuador)",
  'es-SV':"Spanish (El Salvador) / Espa\xF1ol (El Salvador)",
  'es-GT':"Spanish (Guatemala) / Espa\xF1ol (Guatemala)",
  'es-HN':"Spanish (Honduras) / Espa\xF1ol (Honduras)",
  'es-MX':"Spanish (Mexico) / Espa\xF1ol (M\xE9xico)",
  'es-NI':"Spanish (Nicaragua) / Espa\xF1ol (Nicaragua)",
  'es-PA':"Spanish (Panama) / Espa\xF1ol (Panam\xE1)",
  'es-PY':"Spanish (Paraguay) / Espa\xF1ol (Paraguay)",
  'es-PE':"Spanish (Peru) / Espa\xF1ol (Per\xFA)",
  'es-PR':"Spanish (Puerto Rico) / Espa\xF1ol (Puerto Rico)",
  'es-ES':"Spanish (Spain, International Sort) / Espa\xF1ol (Espa\xF1a, alfabetizaci\xF3n internacional)",
  'es-US':"Spanish (United States) / Espa\xF1ol (Estados Unidos)",
  'es-UY':"Spanish (Uruguay) / Espa\xF1ol (Uruguay)",
  'es-VE':"Spanish (Venezuela) / Espa\xF1ol (Republica Bolivariana de Venezuela)",
  sv:"Swedish / svenska",
  'sv-FI':"Swedish (Finland) / svenska (Finland)",
  'sv-SE':"Swedish (Sweden) / svenska (Sverige)",
  syr:"Syriac\u200E / \u0723\u0718\u072A\u071D\u071D\u0710\u200F",
  'syr-SY':"Syriac (Syria)\u200E / \u0723\u0718\u072A\u071D\u071D\u0710 (\u0633\u0648\u0631\u064A\u0627)\u200F",
  tg:"Tajik (Cyrillic) / \u0422\u043E\u04B7\u0438\u043A\u04E3",
  'tg-Cyrl':"Tajik (Cyrillic) / \u0422\u043E\u04B7\u0438\u043A\u04E3",
  'tg-Cyrl-TJ':"Tajik (Cyrillic, Tajikistan) / \u0422\u043E\u04B7\u0438\u043A\u04E3 (\u0422\u043E\u04B7\u0438\u043A\u0438\u0441\u0442\u043E\u043D)",
  tzm:"Tamazight / Tamazight",
  'tzm-Latn':"Tamazight (Latin) / Tamazight (Latin)",
  'tzm-Latn-DZ':"Tamazight (Latin, Algeria) / Tamazight (Djaza\xEFr)",
  ta:"Tamil / \u0BA4\u0BAE\u0BBF\u0BB4\u0BCD",
  'ta-IN':"Tamil (India) / \u0BA4\u0BAE\u0BBF\u0BB4\u0BCD (\u0B87\u0BA8\u0BCD\u0BA4\u0BBF\u0BAF\u0BBE)",
  tt:"Tatar / \u0422\u0430\u0442\u0430\u0440",
  'tt-RU':"Tatar (Russia) / \u0422\u0430\u0442\u0430\u0440 (\u0420\u043E\u0441\u0441\u0438\u044F)",
  te:"Telugu / \u0C24\u0C46\u0C32\u0C41\u0C17\u0C41",
  'te-IN':"Telugu (India) / \u0C24\u0C46\u0C32\u0C41\u0C17\u0C41 (\u0C2D\u0C3E\u0C30\u0C24 \u0C26\u0C47\u0C36\u0C02)",
  th:"Thai / \u0E44\u0E17\u0E22",
  'th-TH':"Thai (Thailand) / \u0E44\u0E17\u0E22 (\u0E44\u0E17\u0E22)",
  bo:"Tibetan / \u0F56\u0F7C\u0F51\u0F0B\u0F61\u0F72\u0F42",
  'bo-CN':"Tibetan (PRC) / \u0F56\u0F7C\u0F51\u0F0B\u0F61\u0F72\u0F42 (\u0F40\u0FB2\u0F74\u0F44\u0F0B\u0F67\u0FAD\u0F0B\u0F58\u0F72\u0F0B\u0F51\u0F58\u0F44\u0F66\u0F0B\u0F66\u0FA4\u0FB1\u0F72\u0F0B\u0F58\u0F50\u0F74\u0F53\u0F0B\u0F62\u0F92\u0FB1\u0F63\u0F0B\u0F41\u0F56\u0F0D)",
  tr:"Turkish / T\xFCrk\xE7e",
  'tr-TR':"Turkish (Turkey) / T\xFCrk\xE7e (T\xFCrkiye)",
  tk:"Turkmen / t\xFCrkmen\xE7e",
  'tk-TM':"Turkmen (Turkmenistan) / t\xFCrkmen\xE7e (T\xFCrkmenistan)",
  uk:"Ukrainian / \u0443\u043A\u0440\u0430\u0457\u043D\u0441\u044C\u043A\u0430",
  'uk-UA':"Ukrainian (Ukraine) / \u0443\u043A\u0440\u0430\u0457\u043D\u0441\u044C\u043A\u0430 (\u0423\u043A\u0440\u0430\u0457\u043D\u0430)",
  hsb:"Upper Sorbian / hornjoserb\u0161\u0107ina",
  'hsb-DE':"Upper Sorbian (Germany) / hornjoserb\u0161\u0107ina (N\u011Bmska)",
  ur:"Urdu\u200E / \u0627\u064F\u0631\u062F\u0648\u200F",
  'ur-PK':"Urdu (Islamic Republic of Pakistan)\u200E / \u0627\u064F\u0631\u062F\u0648 (\u067E\u0627\u06A9\u0633\u062A\u0627\u0646)\u200F",
  ug:"Uyghur\u200E / \u0626\u06C7\u064A\u063A\u06C7\u0631 \u064A\u06D0\u0632\u0649\u0642\u0649\u200F",
  'ug-CN':"Uyghur (PRC)\u200E / (\u0626\u06C7\u064A\u063A\u06C7\u0631 \u064A\u06D0\u0632\u0649\u0642\u0649 (\u062C\u06C7\u06AD\u062E\u06C7\u0627 \u062E\u06D5\u0644\u0642 \u062C\u06C7\u0645\u06BE\u06C7\u0631\u0649\u064A\u0649\u062A\u0649\u200F",
  'uz-Cyrl':"Uzbek (Cyrillic) / \u040E\u0437\u0431\u0435\u043A",
  'uz-Cyrl-UZ':"Uzbek (Cyrillic, Uzbekistan) / \u040E\u0437\u0431\u0435\u043A (\u040E\u0437\u0431\u0435\u043A\u0438\u0441\u0442\u043E\u043D)",
  uz:"Uzbek (Latin) / U'zbek",
  'uz-Latn':"Uzbek (Latin) / U'zbek",
  'uz-Latn-UZ':"Uzbek (Latin, Uzbekistan) / U'zbek (U'zbekiston Respublikasi)",
  vi:"Vietnamese / Ti\u1EBFng Vi\u1EC7t",
  'vi-VN':"Vietnamese (Vietnam) / Ti\u1EBFng Vi\u1EC7t (Vi\u1EC7t Nam)",
  cy:"Welsh / Cymraeg",
  'cy-GB':"Welsh (United Kingdom) / Cymraeg (y Deyrnas Unedig)",
  wo:"Wolof / Wolof",
  'wo-SN':"Wolof (Senegal) / Wolof (S\xE9n\xE9gal)",
  sah:"Yakut / \u0441\u0430\u0445\u0430",
  'sah-RU':"Yakut (Russia) / \u0441\u0430\u0445\u0430 (\u0420\u043E\u0441\u0441\u0438\u044F)",
  ii:"Yi / \uA188\uA320\uA071\uA0B7",
  'ii-CN':"Yi (PRC) / \uA188\uA320\uA071\uA0B7 (\uA34F\uA278\uA3D3\uA0B1\uA1ED\uA27C\uA1E9)",
  yo:"Yoruba / Yoruba",
  'yo-NG':"Yoruba (Nigeria) / Yoruba (Nigeria)",
};

/**
 * Show a message box dialog.
 */
var alert = coUtils.alert = function alert(message)
{
  var prompt_service = Components
      .classes["@mozilla.org/embedcomp/prompt-service;1"]
      .getService(Components.interfaces.nsIPromptService);

  if (arguments.length > 1 && "string" === typeof message) {
    message = coUtils.Text.format.apply(coUtils.Text, arguments);
  }
  prompt_service.alert(this.window || null, "tanasinn", message);
}

/** Returns the window object.
 *  @return {Window} The window object.
 */
coUtils.getWindow = function getWindow() 
{
  var result;
  var window_mediator = Components
    .classes["@mozilla.org/appshell/window-mediator;1"]
    .getService(Components.interfaces.nsIWindowMediator);

  // Firefox/SeaMonkey - "navigator:browser"
  // ThunderBird - "mail:3pane"
  result = window_mediator.getMostRecentWindow("navigator:browser") 
        || window_mediator.getMostRecentWindow("mail:3pane"); 

  if (result) {
    return result;
  }
  return new Function("return window;")();
}

/** Provides printf-like formatting.
 *  @param {String} template 
 *  @return {String} Formatted string.
 */
coUtils.format = function format(/* template, arg1, arg2, .... */) 
{
  var args = Array.slice(arguments),
      template = args.shift(),
      result = template.replace(
        /%[s|f|d|i|x]/g,
        function replaceProc(match_string)
        {
          var value = args.shift();

          if ("%s" === match_string) {
            return String(value);
          } else if ("%f" === match_string) {
            return parseFloat(value).toString();
          } else if ("%d" === match_string || "%i" === match_string) {
            return parseInt(value).toString();
          } else if ("%x" === match_string) {
            return parseInt(value).toString(16);
          }
          throw Components.Exception([
            _("A logical error occured."),
            " match_string: ", "\"", match_string, "\""
          ].join(""));
        });
  return result;
}

coUtils.Color = {

  parseX11ColorSpec: function parseX11ColorSpec(spec)
  {
    var result,
        pattern = /^#([0-9a-fA-F]{3,12})$|^rgb:([0-9a-fA-F]+)\/([0-9a-fA-F]+)\/([0-9a-fA-F]+)$|^([a-zA-Z0-9\s]+)$/,
        match = spec.match(pattern),
        rgb,
        r,
        g,
        b,
        name;
  
    if (null === match) {
      throw coUtils.Debug.Exception(
        _("Invalid spec string: %s."), spec);
    }
  
    [, rgb, r, g, b, name] = match;
  
    if (rgb) {
      result = this._convertRGBSpec1(rgb); 
    } else if (r) {
      result = this._convertRGBSpec2(r, g, b);       
    } else {
      result = this._convertColorName(name); 
    } 

    return result;

  }, // parseX11ColorSpec 
 
  _convertRGBSpec1: function _parseRGBSpec(rgb)
  {
    var result;
    
    switch (rgb.length) {
  
      case 3:
        result = "#" + rgb
          .split("")
          .map(function(c) 0x100 + (parseInt(c, 16) << 4))
          .map(function(n) n.toString(16).substr(1))
          .join("")
          ;
        break;
  
      case 6:
        result = "#" + rgb;
        break;
  
      case 9:
        result = "#" + rgb
          .match(/.../g)
          .map(function(c) 0x100 + (parseInt(c, 16) >>> 4))
          .map(function(n) n.toString(16).substr(1))
          .join("")
          ;
        break;
  
      case 12:
        result = "#" + rgb
          .match(/..../g)
          .map(function(c) 0x100 + (parseInt(c, 16) >>> 8))
          .map(function(n) n.toString(16).substr(1))
          .join("")
          ;
        break;
  
      default:
        throw coUtils.Debug.Exception(
          _("Invalid rgb format was specified: %s."), rgb);
  
    }

    return result;
  }, // _convertRGBSpec1

  _convertRGBSpec2: function _parseRGBSpec(r, g, b)
  {
    var buffer = "#";
    var n;
    var i;
  
    for (i = 0; i < arguments.length; ++i) {

      n = arguments[i]; // r / g / b
  
      switch (n.length) {
  
        case 1:
          n = parseInt(n, 16) << 4;
          break;
  
        case 2:
          n = parseInt(n, 16);
          break;
  
        case 3:
          n = parseInt(n, 16) >>> 4;
          break;
  
        case 4:
          n = parseInt(n, 16) >>> 8;
          break;
  
        default:
          throw coUtils.Debug.Exception(
            _("Invalid rgb format was specified: %s."), spec);
      }
  
      buffer += (0x100 + n)
        .toString(16)
        .substr(1)
        ;
    }
    return buffer;

  }, // _convertRGBSpec2

  _convertColorName: function _convertColorName(name) 
  {
    var canonical_name = name
      .replace(/\s+/g, "")
      .toLowerCase()
      ;
    var color = coUtils.Constant.X11_COLOR_MAP[canonical_name]
             || coUtils.Constant.WEB140_COLOR_MAP[canonical_name];
    if (!color) {
      throw coUtils.Debug.Exception(
        _("Invalid color name was specified: %s."), name);
    }
    return color;
  }, // _convertColorName

}; // coUtils.Color

coUtils.Clipboard = {

  /** get text from clipboard */
  get: function get() 
  {
    var clipboard = Components
          .classes["@mozilla.org/widget/clipboard;1"]
          .getService(Components.interfaces.nsIClipboard),
        trans = Components
          .classes["@mozilla.org/widget/transferable;1"]
          .createInstance(Components.interfaces.nsITransferable),
        str = {},
        str_length = {},
        text = "";

    trans.addDataFlavor("text/unicode");

    clipboard.getData(trans, clipboard.kGlobalClipboard);
	  trans.getTransferData("text/unicode", str, str_length);

    if (str.value && str_length.value) {
      text = str.value
        .QueryInterface(Components.interfaces.nsISupportsString)
        .data
        .substring(0, str_length.value / 2);
    }

    return text;
  },

  /** set text to clipboard */
  set: function set(text) 
  {
    var clipboard_helper = Components
      .classes["@mozilla.org/widget/clipboardhelper;1"]
      .getService(Components.interfaces.nsIClipboardHelper);

    clipboard_helper.copyString(text);
  },

};

coUtils.Event = {

  _observers: {},

   /** Register system-global event handler.
    *  @param {String} topic The notification topic.
    *  @param {Function} context The handler function.
    *  @param {Object} context A "this" object in which the listener handler 
    *                  is to be evalute.
    */
  subscribeGlobalEvent: 
  function subscribeGlobalEvent(topic, handler, context)
  {
    var delegate;
    var observer;

    if (context) {
      delegate = function() handler.apply(context, arguments);
    } else {
      delegate = handler;
    }
    this.observerService = this.observerService || Components
      .classes["@mozilla.org/observer-service;1"]
      .getService(Components.interfaces.nsIObserverService);
    observer = { 
      observe: function observe() 
      {
        delegate.apply(this, arguments);
      },
    };
    this._observers[topic] = this._observers[topic] || [];
    this._observers[topic].push(observer);
    this.observerService.addObserver(observer, topic, false);
  },
  
  removeGlobalEvent: function removeGlobalEvent(topic)
  {
    var observers;

    if (this.observerService) {
      observers = this._observers[topic];
      if (observers) {
        observers.forEach(function(observer) 
        {
          this.observerService.removeObserver(observer, topic);
        }, this);
      }
    }
  },

  /** Fires specified system-global event and notify it to subscriber.
   *  @param {String} topic The notification topic.
   *  @return {Array} An array which contains result values.
   */
  notifyGlobalEvent: function notifyGlobalEvent(topic, data) 
  {
    this.observerService = this.observerService || Components
      .classes["@mozilla.org/observer-service;1"]
      .getService(Components.interfaces.nsIObserverService);
    this.observerService.notifyObservers(null, topic, data)
  },

};

coUtils.Font = {

  /**
   * @fn getAverageGlyphSize
   * @brief Test font rendering and calculate average glyph width.
   */
  getAverageGlyphSize: 
  function getAverageGlyphSize(font_size, font_family, test_string)
  {
    var NS_XHTML = "http://www.w3.org/1999/xhtml",
        canvas = coUtils.getWindow()
          .document
          .createElementNS(NS_XHTML , "html:canvas"),
        context = canvas.getContext("2d"),
        unit = test_string || "Mbc123-XYM",
        text = "",
        i;

    for (i = 0; i < 10; ++i) {
      text += unit;
    }

    context.font = font_size + "px " + font_family;
    var metrics = context.measureText(text);
    var char_width = metrics.width / text.length;
    var height = metrics.height;
  
    text = "g\u3075";
    metrics = context.measureText(text);
    canvas.width = metrics.width;
    canvas.height = (font_size * 2) | 0;
    context.save();
    context.translate(0, font_size);
    context.fillText(text, 0, 0);
    context.strokeText(text, 0, 0);
    context.restore();
    var data = context.getImageData(0, 0, canvas.width, canvas.height).data; 
    var line_length = data.length / (canvas.height * 4);
  
    var first, last;
    var i;
  detect_first:
    for (i = 3; i < data.length; i += 4) {
      if (data[i]) {
        first = Math.floor(i / (canvas.width * 4));
        break detect_first;
      }
    }
  detect_last:
    for (i = data.length - 1; i >= 0; i -= 4) {
      if (data[i]) {
        last = Math.floor(i / (canvas.width * 4)) + 1;
        break detect_last;
      }
    }
    canvas = null;
    context = null;
    return [char_width, last - first, first];
  }

};

coUtils.Services = {

  windowWatcher: Components
    .classes["@mozilla.org/embedcomp/window-watcher;1"]
    .getService(Components.interfaces.nsIWindowWatcher),

};

/** I/O Functions. */
coUtils.IO = {

  /** Get all text from the file specified by given URI string.
   *  @param {String} location A URI string of target file.
   *  @param {String} charset Target file's encoding.
   */
  readFromFile: function readFromFile(location, charset) 
  {
    var url;
    var file;
    location = String(location);
    if (location.match(/^[a-z]+:\/\//)) {
      url = location;
    } else {
      file = coUtils.File.getFileLeafFromVirtualPath(location);
      if (!file.exists()) {
        throw coUtils.Debug.Exception(
          coUtils.Text.format(
            _("Specified file is not found: [%s]."), location));
      }
      if (!file.isReadable) {
        throw coUtils.Debug.Exception(
          _("Specified file '%s' is not a readable file node."), file.path);
      }

      url = coUtils.File.getURLSpec(file);
    }

    return this._readFromFileImpl(url, charset);
  },

  _readFromFileImpl: function _readFromFileImpl(url, charset) 
  {
    var channel = Components
      .classes["@mozilla.org/network/io-service;1"]
      .getService(Components.interfaces.nsIIOService2)
      .newChannel(url, null, null);
    var input = channel.open();
    var stream;
    var buffer;
    var result;
    var nread;
    var stream;

    try {
      if (charset) {
        stream = Components
          .classes["@mozilla.org/intl/converter-input-stream;1"]
          .createInstance(Components.interfaces.nsIConverterInputStream);
        stream.init(input, charset, 1024, 
          Components.interfaces.nsIConverterInputStream.DEFAULT_REPLACEMENT_CHARACTER);
        try {
          buffer = [];
          while (true) {
            result = {};
            nread = stream.readString(input.available(), result);
            buffer.push(result.value);
            if (0 === nread)
              break;
          }
          return buffer.join("");
        } finally {
          stream.close();
        }
      } else {
        stream = Components
          .classes["@mozilla.org/scriptableinputstream;1"]
          .getService(Components.interfaces.nsIScriptableInputStream);
        stream.init(input); 
        try {
          return stream.read(input.available());
        } finally {
          stream.close();
        }
      }
    } finally {
      input.close();
      channel.cancel(0);
    }
  },

  /** Writes text data asynchronously to the file that specified as argument. 
   *  @param {String} path Target file path.
   *  @param {String} data The contents written to target file.
   *  @param {Function} callback.
   */
  writeToFile: 
  function writeToFile(path, data, callback) 
  {
    var file = coUtils.File.getFileLeafFromVirtualPath(path);

    if (file.exists()) { // check if target exists.
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
      function make_directory(current) 
      {
        var parent = current.parent;

        if (!parent.exists()) {
          make_directory(parent);
          parent.create(Components.interfaces.nsIFile.DIRECTORY_TYPE, -1);
        }
      }
      make_directory(file);
    }
    this._writeToFileImpl(file, data, callback);
  },	 

  _writeToFileImpl: 
  function _writeToFileImpl(file, data, callback) 
  {
    var mode, ostream, converter, istream;

  	Components.utils.import("resource://gre/modules/NetUtil.jsm");
  	Components.utils.import("resource://gre/modules/FileUtils.jsm");

  	// file is nsIFile, data is a string
  	mode = FileUtils.MODE_WRONLY 
         | FileUtils.MODE_CREATE 
         | FileUtils.MODE_TRUNCATE;
  	ostream = FileUtils.openSafeFileOutputStream(file, mode);
  	converter = Components
      .classes["@mozilla.org/intl/scriptableunicodeconverter"]
      .createInstance(Components.interfaces.nsIScriptableUnicodeConverter);
  	converter.charset = "UTF-8";
  	istream = converter.convertToInputStream(data);
  	NetUtil.asyncCopy(istream, ostream, function(status) {
      try {
  	    if (!Components.isSuccessCode(status)) {
          throw coUtils.Debug.Exception(
            _("An error occured when writing to ",
              "local file [%s]. Status code is [%x]."),
            file, status);
  	    }
      } finally {
        FileUtils.closeSafeFileOutputStream(ostream);
        if (callback) {
          callback();
        }
      }
  	}); // _writeToFileImpl
  },

  saveCanvas: 
  function saveCanvas(source_canvas, file, is_thumbnail) 
  {
    var NS_XHTML, context, canvas, source, target, io, persist;

    NS_XHTML = "http://www.w3.org/1999/xhtml";
    canvas = source_canvas
      .ownerDocument
      .createElementNS(NS_XHTML, "canvas");

    canvas.style.background = "black";

    if (is_thumbnail) {
      canvas.width = 120;
      canvas.height = 80;
    } else {
      canvas.width = source_canvas.width;
      canvas.height = source_canvas.height;
    }
  
    context = canvas.getContext("2d");
    context.fillStyle = "rgba(0, 0, 0, 0.7)";
    context.fillRect(0, 0, canvas.width, canvas.height);
    context.drawImage(source_canvas, 0, 0, canvas.width, canvas.height);
  
    // create a data url from the canvas and then create URIs of the source and targets.
    io = Components
      .classes["@mozilla.org/network/io-service;1"]
      .getService(Components.interfaces.nsIIOService);
    source = io.newURI(canvas.toDataURL("image/png", ""), "UTF8", null);
    target = io.newFileURI(file)
  
    // prepare to save the canvas data  
    persist = Components
      .classes["@mozilla.org/embedding/browser/nsWebBrowserPersist;1"]
      .createInstance(Components.interfaces.nsIWebBrowserPersist);
    
    persist.persistFlags = Components
      .interfaces.nsIWebBrowserPersist
      .PERSIST_FLAGS_REPLACE_EXISTING_FILES;
    persist.persistFlags |= Components
      .interfaces.nsIWebBrowserPersist
      .PERSIST_FLAGS_AUTODETECT_APPLY_CONVERSION;
  
    // save the canvas data to the file  
    persist.saveURI(source, null, null, null, null, file);

    source_canvas = null;
    canvas = null;
    context = null;
  },

};

coUtils.File = new function() {

  this.__proto__ = {

  exists: function exists(path)
  {
    var file = this.getFileLeafFromVirtualPath(path);
    return file.exists();
  },

  getPathDelimiter: function getPathDelimiter() 
  {
    return "WINNT" === coUtils.Runtime.os ? "\\": "/";
  },
  
  isAbsolutePath: function isAbsolutePath(path) 
  {
    if ("WINNT" === coUtils.Runtime.os) {
       return /^([a-zA-Z]:)?\\/.test(path);
    }
    return /^\//.test(path);
  },

  /** Gets last modiried time from specified file.
   *  @param {nsIFile} file A nsIFile object.
   *  @return {Number} The time when the file referenced by specified nsIFile 
   *                   was last modified. The value of this attribute is 
   *                   milliseconds since midnight (00:00:00), January 1, 
   *                   1970 Greenwich Mean Time (GMT).
   */
  getLastModifiedTime: function getLastModifiedTime(file) 
  {
    var last_modified_time = null;
    if (null !== file) {
      if (file.isSymlink()) {     // if file is symbolic link
        last_modified_time = file.lastModifiedTimeOfLink;
      } else if (file.isFile()) { // if file is generic file.
        last_modified_time = file.lastModifiedTime;
      } else {                    // directory etc...
        throw Components.Exception(
          "Given script file is not a File. location '%s'.", location);
      }
    }
    return last_modified_time;
  },
  
  /** Gets URI-formatted string from file object.
   *  @param {nsIFile} file A nsIFile object.
   */
  getURLSpec: function getURLSpec(file) 
  {
    var io_service = Components
      .classes["@mozilla.org/network/io-service;1"]
      .getService(Components.interfaces.nsIIOService);
    var file_handler = io_service.getProtocolHandler("file")
      .QueryInterface(Components.interfaces.nsIFileProtocolHandler);
    return file_handler.getURLSpecFromFile(file);
  },

  /** The Generator method which iteartes all or filterd files under 
   *  specified directory.
   *  @param {nsIFile} file A nsIFile object that indicates a directory.
   *  @param {Regexp} filter A Regexp object by which iterated file is 
   *                         filtered.
   *  @return {Generator} A generator for iterated nsIFile objects.
   */
  getFilesRecursively: 
  function getFilesRecursively(directory, filter) 
  {
    var directory_entries = directory.clone().directoryEntries;
    var callee = arguments.callee;
    return function() { // return generator.
      var file;
      var name;

      while (directory_entries.hasMoreElements()) {
        file = directory_entries.getNext()
          .QueryInterface(Components.interfaces.nsIFile);
        name = file.leafName;
        if (file.isFile()) {
          if (filter && filter.test(file.leafName)) 
            yield file;
        } else if (file.isDirectory()) {
          for (file in callee(file, filter)) {
            yield file;
          }
        }
      }
    }.call();
  },

  getFileEntriesFromSerchPath: 
  function getFileEntriesFromSerchPath(search_directories) 
  {
    var self = this;
    var entries = function entries() 
    {
      var path;
      var target_leaf;
      var entries;
      var entry;

      for each ([, path] in Iterator(search_directories)) {
        try {
          if (coUtils.File.exists(path)) {
            target_leaf = coUtils.File.getFileLeafFromVirtualPath(path);
            if (!target_leaf || !target_leaf.exists()) {
              coUtils.Debug.reportWarning(
                _("Cannot get file entries from '%s'. ",
                  "It seems that specified path does not exist."), path);
              continue;
            }
            if (target_leaf.isFile()) {
              yield target_leaf;
            } else {
              entries = self.getFilesRecursively(target_leaf, /\.js$/);
              for (entry in entries) {
                yield entry;
              }
            }
          }
        } catch (e) {
          coUtils.Debug.reportWarning(e);
          coUtils.Debug.reportWarning(
            _("Cannot get file entries from '%s'."), path);
        }
      };
    }.call();
    return entries;
  },

  getFileLeafFromVirtualPath: 
  function getFileLeafFromVirtualPath(virtual_path) 
  {
    var virtual_path = String(virtual_path),
        split_path = virtual_path.split(/[\/\\]/),
        root_entry = split_path.shift(),
        match = root_entry.match(/^\$([^/]+)$/),
        file_name;

    if (match) {
      target_leaf = this.getSpecialDirectoryName(match.pop());
    } else if (coUtils.File.isAbsolutePath(virtual_path)) { // absolute path
      target_leaf = Components
        .classes["@mozilla.org/file/local;1"]
        .createInstance(Components.interfaces.nsILocalFile);
      target_leaf.initWithPath(virtual_path);
      return target_leaf;
    } else { // relative path
      file_name = [
        Components.stack.filename.split(" -> ").pop().split("?").shift()
      ].join("");
      if (file_name.match(/^resource:/)) {
        target_leaf = this.getSpecialDirectoryName("CurProcD");
      } else {
        target_leaf = Components
          .classes["@mozilla.org/network/io-service;1"]
          .getService(Components.interfaces.nsIIOService)
          .getProtocolHandler("file")
          .QueryInterface(Components.interfaces.nsIFileProtocolHandler)
          .getFileFromURLSpec(file_name)
          .parent.parent.parent;
      }
      target_leaf.normalize();
      target_leaf.append(root_entry);
    }
    split_path.forEach(function(leaf_name) { 
      target_leaf.append(leaf_name);
    });
    return target_leaf;
  },

  getSpecialDirectoryName: 
  function getSpecialDirectoryName(name) 
  {
    var directoryService = Components
      .classes["@mozilla.org/file/directory_service;1"]
      .getService(Components.interfaces.nsIProperties);
    return directoryService.get(name, Components.interfaces.nsIFile);
  },

  };

};


coUtils.Runtime = {

  _app_info: Components
    .classes["@mozilla.org/xre/app-info;1"]
    .getService(Components.interfaces.nsIXULAppInfo),

  file_handler: Components
    .classes["@mozilla.org/network/io-service;1"]
    .getService(Components.interfaces.nsIIOService)
    .getProtocolHandler("file")
    .QueryInterface(Components.interfaces.nsIFileProtocolHandler),

  subscript_loader: Components
    .classes["@mozilla.org/moz/jssubscript-loader;1"]
    .getService(Components.interfaces.mozIJSSubScriptLoader),

  get app_id() 
  {
    return this._app_info.ID;
  },

  get app_name() 
  {
    return this._app_info.name;
  },

  get version()
  {
    return this._app_info.version;
  },

  get os()
  {
    return this._app_info
      .QueryInterface(Components.interfaces.nsIXULRuntime)
      .OS;
  },

  loadScript: function loadScript(location, scope) 
  {
    var url = null;
    var file = null;
    var match;
    var protocol;

    // detect if given location string is a URL formatted string.
    match = location.match(/^([a-z]+):\/\//);
    if (match) { // location is URL spec formatted.
      [, protocol] = match;
      if ("file" === protocol) { 
        file = this.file_handler.getFileFromURLSpec(location);
      } else {
        throw coUtils.Debug.Exception(
          _("'%s' is unknown protocol. location: '%s'."), protocol, location);
      }
      url = location;
    } else { // location is platform-specific formatted path.
      file = coUtils.File.getFileLeafFromVirtualPath(location);
      if (!file || !file.exists()) {
        throw coUtils.Debug.Exception(
          _("Cannot get file entries from '%s'. ", 
            "It seems that specified path does not exists."), file.path);
      }
      url = coUtils.File.getURLSpec(file);
    }

    // compare last modified times between cached file and current one.
//    coUtils.Debug.reportMessage(_("Loading script '%s'."), file.leafName);

    // avoiding subscript-caching (firefox8's new feature).
    url += "?" + coUtils.File.getLastModifiedTime(file);

    // load
    this.subscript_loader.loadSubScript(url, scope, "UTF-8");

  }, // loadScript

}; // coUtils.Runtime

/**
 * Layout of keycode:
 *
 *   prefix:  000000xxxxx000000000000000000000
 *
 *   char:    00000000000xxxxxxxxxxxxxxxxxxxxx
 *   mode:    000001mmmmmxxxxxxxxxxxxxxxxxxxxx
 *   gesture: ggggg000000000000000000000000001
 */
coUtils.Keyboard = {

  KEY_CTRL   : 22,
  KEY_ALT    : 23,
  KEY_SHIFT  : 24,
  KEY_NOCHAR : 25,
  KEY_META   : 26,
  KEY_MODE   : 27,

  KEYNAME_PACKEDCODE_MAP: {
    leader      : 0x08000001,
    nmode       : 0x18000001,
    cmode       : 0x28000001,
    "2-shift"   : 0x50000001,
    "2-alt"     : 0x60000001,
    "2-ctrl"    : 0x70000001,
    pinchopen   : 0x80000001,
    pinchclose  : 0x90000001,
    swipeleft   : 0xa0000001,
    swiperight  : 0xb0000001,
    swipeup     : 0xc0000001,
    swipedown   : 0xd0000001,
    rotateleft  : 0xe0000001,
    rotateright : 0xf0000001,
    space       : ("Darwin" === coUtils.Runtime.os) << coUtils.Constant.KEY_NOCHAR | 0x0020,
    sp          : ("Darwin" === coUtils.Runtime.os) << coUtils.Constant.KEY_NOCHAR | 0x0020,
    bs          : 0x1 << coUtils.Constant.KEY_NOCHAR | 0x0008, 
    backspace   : 0x1 << coUtils.Constant.KEY_NOCHAR | 0x0008, 
    tab         : 0x1 << coUtils.Constant.KEY_NOCHAR | 0x0009, 
    enter       : 0x1 << coUtils.Constant.KEY_NOCHAR | 0x000d,
    return      : 0x1 << coUtils.Constant.KEY_NOCHAR | 0x000d,
    cr          : 0x1 << coUtils.Constant.KEY_NOCHAR | 0x000d,
    lf          : 0x1 << coUtils.Constant.KEY_NOCHAR | 0x000a,
    escape      : 0x1 << coUtils.Constant.KEY_NOCHAR | 0x001b,
    esc         : 0x1 << coUtils.Constant.KEY_NOCHAR | 0x001b,
    pgup        : 0x1 << coUtils.Constant.KEY_NOCHAR | 0x0021,
    pgdn        : 0x1 << coUtils.Constant.KEY_NOCHAR | 0x0022,
    end         : 0x1 << coUtils.Constant.KEY_NOCHAR | 0x0023,
    home        : 0x1 << coUtils.Constant.KEY_NOCHAR | 0x0024,
    left        : 0x1 << coUtils.Constant.KEY_NOCHAR | 0x0025,
    up          : 0x1 << coUtils.Constant.KEY_NOCHAR | 0x0026,
    right       : 0x1 << coUtils.Constant.KEY_NOCHAR | 0x0027,
    down        : 0x1 << coUtils.Constant.KEY_NOCHAR | 0x0028,
    ins         : 0x1 << coUtils.Constant.KEY_NOCHAR | 0x002d,
    insert      : 0x1 << coUtils.Constant.KEY_NOCHAR | 0x002d,
    del         : 0x1 << coUtils.Constant.KEY_NOCHAR | 0x002e,
    delete      : 0x1 << coUtils.Constant.KEY_NOCHAR | 0x002e,
    clear       : 0x1 << coUtils.Constant.KEY_NOCHAR | 0x000c,
    f1          : 0x1 << coUtils.Constant.KEY_NOCHAR | 0x0070,
    f2          : 0x1 << coUtils.Constant.KEY_NOCHAR | 0x0071,
    f3          : 0x1 << coUtils.Constant.KEY_NOCHAR | 0x0072,
    f4          : 0x1 << coUtils.Constant.KEY_NOCHAR | 0x0073,
    f5          : 0x1 << coUtils.Constant.KEY_NOCHAR | 0x0074,
    f6          : 0x1 << coUtils.Constant.KEY_NOCHAR | 0x0075,
    f7          : 0x1 << coUtils.Constant.KEY_NOCHAR | 0x0076,
    f8          : 0x1 << coUtils.Constant.KEY_NOCHAR | 0x0077,
    f9          : 0x1 << coUtils.Constant.KEY_NOCHAR | 0x0078,
    f10         : 0x1 << coUtils.Constant.KEY_NOCHAR | 0x0079,
    f11         : 0x1 << coUtils.Constant.KEY_NOCHAR | 0x007a,
    f12         : 0x1 << coUtils.Constant.KEY_NOCHAR | 0x007b,
    f13         : 0x1 << coUtils.Constant.KEY_NOCHAR | 0x002c,
    f14         : 0x1 << coUtils.Constant.KEY_NOCHAR | 0x0091,
    f15         : 0x1 << coUtils.Constant.KEY_NOCHAR | 0x0013,
    f16         : 0x1 << coUtils.Constant.KEY_NOCHAR | 0xf713,
    f17         : 0x1 << coUtils.Constant.KEY_NOCHAR | 0xf714,
    f18         : 0x1 << coUtils.Constant.KEY_NOCHAR | 0xf715,
    f19         : 0x1 << coUtils.Constant.KEY_NOCHAR | 0xf716,
  },

  getCodeToNameMap: function getCodeToNameMap() 
  {
    var result = {};
    Object.keys(this.KEYNAME_PACKEDCODE_MAP).forEach(function(name) {
      var value = this.KEYNAME_PACKEDCODE_MAP[name];
      result[String.fromCharCode(value)] = name;
    }, this);
    this.getCodeToNameMap = function getCodeToNameMap() {
      return result;
    };
    return result;
  },

  convertCodeToExpression: 
  function convertCodeToExpression(packed_code)
  {
    var char;
    var buffer = [];
    var map;

    if (packed_code & (1 << coUtils.Constant.KEY_CTRL)) {
      buffer.push("C");
    }

    if (packed_code & (1 << coUtils.Constant.KEY_ALT)) {
      buffer.push("A");
    }

    if (packed_code & (1 << coUtils.Constant.KEY_SHIFT)) {
      buffer.push("S");
    }

    if (packed_code & (1 << coUtils.Constant.KEY_META)) {
      buffer.push("M");
    }

    char = String.fromCharCode(0xffffff & packed_code);

    if (packed_code & (1 << coUtils.Constant.KEY_NOCHAR)) {
      map = this.getCodeToNameMap();
      char = map[char] || char;
    } else {
      char = {
        "\x1b": "\x5b", // [
        "\x1c": "\x5c", // \
        "\x1d": "\x5d", // ]
        "\x1e": "\x5e", // ^
        "\x1f": "\x5f", // _
      } [char] || char;
    }

    if ("-" === char || "<" === char || ">" === char) {
      char = "\\" + char;
    }
    buffer.push(char);
    if (1 === buffer.length) {
      if (1 === buffer[0].length) {
        return buffer.pop();
      } else {
        return "<" + buffer.pop() + ">";
      }
    } else if (2 === buffer.length && 
               "S" === buffer[0] && 
               1 === buffer[1].length) {
      return buffer.pop();
    }
    return "<" + buffer.join("-") + ">";
  },

  getPackedKeycodeFromEvent: 
  function getPackedKeycodeFromEvent(event, alt) 
  {
    var packed_code;
    var code = event.keyCode || event.which;
    if (event.shiftKey && (
          event.ctrlKey || 
          event.altKey ||
          event.metaKey)) {
      if (/* A */ 65 <= code && code <= 90 /* Z */) {
        code += 32;
      }
    }

    // make packed code
    packed_code = code 
      | Boolean(event.ctrlKey)   << coUtils.Constant.KEY_CTRL 
      | (Boolean(event.altKey) || alt) << coUtils.Constant.KEY_ALT 
      | Boolean(event.shiftKey)  << coUtils.Constant.KEY_SHIFT 
      | Boolean(event.keyCode)   << coUtils.Constant.KEY_NOCHAR
      | Boolean(event.metaKey)   << coUtils.Constant.KEY_META
      ;

    // fix for Space key with modifier.
    if (0x20 === code && (event.shiftKey || event.ctrlKey || event.altKey)) {
      packed_code |= 1 << coUtils.Constant.KEY_NOCHAR;
    }
    return packed_code;
  },

  /**
   * @fn parseKeymapExpression
   * Convert from a key map expression to a packed key code.
   */
  parseKeymapExpression: 
  function parseKeymapExpression(expression) 
  {
    var pattern = /<.+?>|./g;
    var match = expression.match(pattern);
    var strokes = match;
    var key_code_array = [];
    var i, j;
    var stroke;
    var tokens;
    var key_code;
    var last_key;
    var sequence;

    for (i = 0; i < strokes.length; ++i) {
      stroke = strokes[i];
      tokens = null;
      if (1 < stroke.length) {
        stroke = stroke.slice(1, -1); // <...> -> ...
        tokens = stroke
          .match(/[0-9]+\-(\\\-|[^-]+)+|\\\-|[^-]+/g)
          .map(function(token) token.replace(/^\\/, ""));
      } else {
        tokens = [stroke];
      }
      key_code = null;
      last_key = tokens.pop();
      if (!last_key.match(/^.$/)) {
        // if last_key is not a printable character (ex. space, f1, del) ...
        key_code = coUtils.Keyboard.KEYNAME_PACKEDCODE_MAP[last_key.toLowerCase()];
        if (!key_code) {
          throw coUtils.Debug.Exception(
            _("Invalid last key sequence. '%s'. \nSource text: '%s'"),
            last_key, expression);
        }
      } else {
        // if last_key is a printable character (ex, a, b, X, Y)
        key_code = last_key.charCodeAt(0);
      }
   
      for (j = 0; j < tokens.length; ++j) {
        sequence = tokens[j];
        if (sequence.match(/^C$/i)) {
          key_code |= 0x1 << this.KEY_CTRL;
        } else if (sequence.match(/^A$/i)) {
          key_code |= 0x1 << this.KEY_ALT;
        } else if (sequence.match(/^S$/i)) {
          key_code |= 0x1 << this.KEY_SHIFT;
        } else if (sequence.match(/^M$/i)) {
          key_code |= 0x1 << this.KEY_META;
        } else {
          throw coUtils.Debug.Exception(
            _("Invalid key sequence '%s'."), sequence);
        }
      }
      key_code_array.push(key_code);
    } 
    return key_code_array;
  },

}; // coUtils.Keyboard

coUtils.Unicode = {

  /**
   * @fn doubleWidthTest
   * @brief Test if given unicode character is categorized as 
   *        "East Asian Width Character".
   * @return true if given character code point is categorized in 
   *         F(FullWidth) or W(Wide).
   */
  doubleWidthTest: function doubleWidthTest(c) 
  { // TODO: See EastAsianWidth.txt
    return coUCS2EastAsianWidthTest(c);
  },

  isNonSpacingMark: function isNonSpacingMark(code)
  {
    var c = String.fromCharCode(code);
    return coUCS2NonSpacingMarkTest(c);
  },

  getUTF8ByteStreamGenerator: function getUTF8ByteStreamGenerator(str) 
  {
    var c;
    var code;

    for each (c in str) {
      code = c.charCodeAt(0);
      if (code < 0x80)
        // xxxxxxxx -> xxxxxxxx
        yield code;
      else if (code < 0x800) {
        // 00000xxx xxxxxxxx -> 110xxxxx 10xxxxxx
        yield (code >>> 6) | 0xc0;
        yield (code & 0x3f) | 0x80; 
      }
      else if (code < 0x10000) {
        // xxxxxxxx xxxxxxxx -> 1110xxxx 10xxxxxx 10xxxxxx
        yield (code >>> 12) | 0xe0;
        yield ((code >>> 6) & 0x3f) | 0x80;
        yield (code & 0x3f) | 0x80; 
      }
      else  {
        // 000xxxxx xxxxxxxx xxxxxxxx -> 11110xxx 10xxxxxx 10xxxxxx 10xxxxxx
        yield (code >>> 18) | 0xf0;
        yield ((code >>> 12) & 0x3f) | 0x80; 
        yield ((code >>> 6) & 0x3f) | 0x80; 
        yield (code & 0x3f) | 0x80; 
      }
    }
  },

  encodeUCS4toUTF8: function(str) 
  {
    var byte_stream;
    if (!str) {
      return "";
    }
    byte_stream = [byte for (byte in coUtils.getUTF8ByteStreamGenerator(str))];
    return String.fromCharCode.apply(String, byte_stream);
  },

};


coUtils.Logger = function() 
{
  return this.initialize.apply(this, arguments);
};
coUtils.Logger.prototype = {

  _ostream: null,
  _converter: null,

  log_file_path: "$Home/.tanasinn/log/tanasinn-js.log",
  max_log_size: 100000,

  /** constructor */
  initialize: function initialize()
  {
    // create nsIFile object.
    var path = coUtils.File
          .getFileLeafFromVirtualPath(this.log_file_path)
          .path,
        file = Components
          .classes["@mozilla.org/file/local;1"]
          .createInstance(Components.interfaces.nsILocalFile),
        ostream,
        converter;
    
    file.initWithPath(path);

    // check if target log file exists.
    if (file.exists()) {
      if (!file.isFile) { // check if target is file node.
        throw coUtils.Debug.Exception(
          _("Specified file '%s' is not a file node."), path);
      } else if (!file.isWritable) { // check if target is writable.
        throw coUtils.Debug.Exception(
          _("Specified file '%s' is not a writable file node."), path);
      } else if (file.fileSize > this.max_log_size) {
        file.remove(false);
        return this.initialize();
      }
    } else { // if target is not exists.
      // create base directories recursively (= mkdir -p).
      void function make_directory(current) 
      {
        var parent = current.parent;
        if (!parent.exists()) {
          make_directory(parent);
          parent.create(Components.interfaces.nsIFile.DIRECTORY_TYPE, -1);
        }
      } (file);
    }
   
    // create output stream.
    ostream = Components
      .classes["@mozilla.org/network/file-output-stream;1"]
      .createInstance(Components.interfaces.nsIFileOutputStream);  
      
    // write (0x02), appending (0x10), "rw"
    const PR_WRONLY = 0x02;
    const PR_CREATE_FILE = 0x08;
    const PR_APPEND = 0x10;
    const PR_TRUNCATE = 0x20;
    ostream.init(file, PR_WRONLY| PR_CREATE_FILE| PR_APPEND, -1, 0);   
    
    converter = Components
      .classes["@mozilla.org/intl/converter-output-stream;1"].  
      createInstance(Components.interfaces.nsIConverterOutputStream);  

    converter.init(ostream, "UTF-8", 0, 0);  

    this.logMessage("");  
    this.logMessage("---------------------------------------");  
    this.logMessage("-----" + new Date().toString() + "-----");  
    this.logMessage("---------------------------------------");  

    this._converter = converter;
  },

  uninitialize: function uninitialize() 
  {
    this._converter.close(); // closes the output stream.  
  },

  logMessage: function logMessage(message)
  {
    try {
      this._converter.writeString(message + "\n");  
    } catch (e) {
      /* Ignore any errors to prevent recursive-call. */
    }
  },

}; // coUtils.logger

coUtils.Logging = new coUtils.Logger();

coUtils.Text = {

  base64decode: function base64decode(str) 
  {
    return coUtils.getWindow().atob(str);
  },
  
  base64encode: function base64encode(str) 
  {
    return coUtils.getWindow().btoa(str);
  },

  safeConvertFromArray: function safaConvertFromArray(codes)
  {
    var result;
    var i, buffer_length;
    var piece;
    var str;
  
    if (65000 > codes.length) {
      result = String.fromCharCode.apply(String, codes);
    } else {
      result = "";
      buffer_length = 65000;
      for (i = 0; i < codes.length; i += buffer_length) {
        piece = Array.slice(codes, i, i + buffer_length);
        str = String.fromCharCode.apply(String, piece);
        result += str;
      }
    }
    return result;
  },

  /** Provides printf-like formatting.
   *  @param {String} template 
   *  @return {String} Formatted string.
   */
  format: function format(/* template, arg1, arg2, .... */) 
  {
    var args = Array.slice(arguments),
        template = args.shift(),
        result = template.replace(
          /%[s|f|d|i|x]/g, 
          function replaceProc(match_string)
          {
            var value = args.shift();

            if ("%s" === match_string) {
              return String(value);
            } else if ("%f" === match_string) {
              return parseFloat(value).toString();
            } else if ("%d" === match_string || "%i" === match_string) {
              return parseInt(value).toString();
            } else if ("%x" === match_string) {
              return parseInt(value).toString(16);
            }
            throw Components.Exception([
              _("A logical error occured."),
              " match_string: ", "\"", match_string, "\""
            ].join(""));
          });
    return result;
  },

};

coUtils.Timer = {

  _thread_manager: Components
    .classes["@mozilla.org/thread-manager;1"]
    .getService(),

  wait: function wait(wait) 
  {
    var enc_time;

    end_time = Date.now() + wait;
    do {
      this._thread_manager.mainThread.processNextEvent(true);
    } while ( (mainThread.hasPendingEvents()) || Date.now() < end_time );
  },

  /**
   * @fn setTimeout
   * @brief Set timer callback.
   */
  setTimeout: function setTimeout(timer_proc, interval, context) 
  {
    var timer, type, observer, timer_callback_func;

    timer = Components
      .classes["@mozilla.org/timer;1"]
      .createInstance(Components.interfaces.nsITimer);
    type = Components.interfaces.nsITimer.TYPE_ONE_SHOT;
    timer_callback_func = context ? 
      function invoke() 
      {
        timer_proc.apply(context, arguments)
        timer = null;
      }
    : timer_proc;

    observer = { notify: timer_callback_func };
    timer.initWithCallback(observer, interval, type);
    return {
      cancel: function cancel() {
        timer.cancel();
        timer = null;
      },
    };
  },

  /**
   * @fn setInterval
   * @brief Set timer callback.
   */
  setInterval: function setInterval(timer_proc, interval, context) 
  {
    var timer = Components
      .classes["@mozilla.org/timer;1"]
      .createInstance(Components.interfaces.nsITimer);
    var type = Components.interfaces.nsITimer.TYPE_REPEATING_SLACK;
    var timer_callback_func = context ? 
      function invoke() 
      {
        timer_proc.apply(context, arguments);
      }
    : timer_proc;

    timer.initWithCallback({ notify: timer_callback_func }, interval, type);
    return {
      cancel: function cancel() {
        if (null !== timer) {
          timer.cancel();
          timer = null;
        }
      },
    };
  },

}; // coUtils.Timer

coUtils.Debug = {

  /**
   * Makes exception object.
   * @param message 
   */
  Exception: function Exception(message) 
  {
    var stack, flag;

    if (arguments.length > 1 && "string" === typeof message) {
      message = coUtils.Text.format.apply(coUtils.Text, arguments);
    }
    stack = Components.stack.caller;  // get caller"s context.
    flag = Components.interfaces.nsIScriptError.errorFlag; // it"s warning
    return this.makeException(message, stack, flag);
  },

  /**
   * Report error to Console service.
   * @param {String} source 
   */
  reportError: function reportError(source /* arg1, arg2, arg3, ... */) 
  {
    var stack, flag;

    // check if printf style arguments is given. 
    if (arguments.length > 1 && "string" === typeof source) {
      source = coUtils.Text.format.apply(coUtils.Text, arguments);
    }
    stack = Components.stack.caller;  // get caller"s context.
    flag = Components.interfaces.nsIScriptError.errorFlag; // it"s error.
    this.reportException(source, stack, flag);
  },

  /**
   * Report warning to Console service.
   * @param {String} source 
   */
  reportWarning: function reportWarning(source /* arg1, arg2, arg3, ... */) 
  {
    var stack, flag;

    if (arguments.length > 1 && "string" === typeof source) {
      source = coUtils.Text.format.apply(coUtils.Text, arguments);
    }
    stack = Components.stack.caller;  // get caller"s context.
    flag = Components.interfaces.nsIScriptError.warningFlag; // it"s warning.
    this.reportException(source, stack, flag);
  },

  /**
   * Report warning to Console service.
   * @param source 
   */
  reportMessage: function reportMessage(source) 
  {
    var stack;
    var escaped_source;
    var file, name, message;

    if (arguments.length > 1 && "string" === typeof source) {
      source = coUtils.format.apply(coUtils, arguments);
    }
    stack = Components.stack.caller;
    escaped_source = String(source).replace(/"/g, "\u201d");
    file = stack.filename.split(" -> ").pop().split("?").shift().replace(/"/g, "\u201d");
    name = stack.name && stack.name.replace(/"/g, "\u201d");
    message = [
      "[",
        "JavaScript Message: \"tanasinn: ", escaped_source, "\" ", 
        "{",
          "file: \"", file, "\" ",
          "line: ", stack.lineNumber, " ",
          "name: \"", name, "\"",
        "}",
      "]"
    ].join("");
    const consoleService = Components
      .classes["@mozilla.org/consoleservice;1"]
      .getService(Components.interfaces.nsIConsoleService);
    coUtils.Logging.logMessage(message);
    consoleService.logStringMessage(message);
  },

  reportException: function reportException(source, stack, flag) 
  {
    var error;

    if (null === source || undefined === source) {
      source = String(source);
    }
    if ("xml" === typeof source) {
      source = source.toString();
    }

    const consoleService = Components
      .classes["@mozilla.org/consoleservice;1"]
      .getService(Components.interfaces.nsIConsoleService);

    if (source && undefined !== source.queryInterface) 
    {
      if (null !== source.QueryInterface(
          Components.interfaces.nsIConsoleMessage)) 
      {
        if (null !== source.QueryInterface(
            Components.interfaces.nsIScriptError)) 
        {
          source.flags |= flag
        }
        coUtils.Logging.logMessage(source.toString());
        consoleService.logMessage(source);
        return;
      }
      // else fallback!
    }
    //if (Error.prototype.isPrototypeOf(source)) // if source is Error object.
    if (source.stack) {
      stack = source.stack; // use the stack of Error object.
    }
    error = this.makeException(source, stack, flag);
    coUtils.Logging.logMessage(source.toString());
    consoleService.logMessage(error);
  },

  /**
   * Makes an exception object from given information.
   */
  makeException: function makeException(source, stack, flag) 
  {
    var exception = Components
          .classes["@mozilla.org/scripterror;1"]
          .createInstance(Components.interfaces.nsIScriptError),
        is_error_object = !!source.fileName,
        message = "tanasinn: " 
                + (is_error_object ? source.message: source.toString())
                    .replace(/"/g, "\u201d"),
        file = (is_error_object ? source.fileName: stack.filename)
          .split(" -> ").pop()
          .split("?").shift()
          .replace(/"/g, "\u201d"),
        line = is_error_object ? source.lineNumber: stack.lineNumber;

    exception.init(message, file, null, line, /* column */ 0, flag, "tanasinn");
    return exception;
  },

};

coUtils.Uuid = {

  _uuid_generator: Components
    .classes["@mozilla.org/uuid-generator;1"]
    .getService(Components.interfaces.nsIUUIDGenerator),

  /** Generates and returns UUID object. 
   *  @return {Object} Generated UUID object.
   */
  generate: function generate() 
  {
    var uuid = this._uuid_generator.generateUUID();

    return uuid;
  },

}; // coUtils.Uuid

/**
 * @class Localize
 * Provides gettext-like message translation service.
 */
coUtils.Localize = new function()
{
  var prototype = {

    /** locale string. (en_US, ja_JP, etc...) */
    _locale: null,

    /** contains multiple dictionaries. */
    _dictionaries_store: null,

    /** constructor */
    initialize: function initialize() 
    {
      var locale_service = Components
            .classes["@mozilla.org/intl/nslocaleservice;1"]
            .getService(Components.interfaces.nsILocaleService),
          locale = locale_service.getLocaleComponentForUserAgent();

      this._dictionaries_store = {};
      this.switchLocale(locale);
    },

    /** @property locale */
    get locale() 
    {
      return this._locale;
    },

    set locale(value) 
    {
      this._locale = value;
    },

    /** switch UI locale */
    switchLocale: function switchLocale(locale)
    {
      this.locale = locale;
      this.load();
    },

    /** Loads locale-mapping file and apply it. */
    load: function load() 
    {
      var locale = this._locale,
          path = "modules/locale/" + locale + ".json",
          file = coUtils.File.getFileLeafFromVirtualPath(path),
          db = null,
          content;

      if (file.exists()) {
        db = JSON.parse(coUtils.IO.readFromFile(path, "utf-8"));
      } else {
        db = {
          lang: this._locale, 
          dict: {},
        };
      }
      this._dictionaries_store[db.lang] = db.dict;
    },
    
    /** Translate message text. */
    get: function get(text) 
    {
      var dictionary = this._dictionaries_store[this._locale] || {};

      return dictionary[text] || text;
    },

    /** Set locale. 
     * @param locale
     */
    setLocale: function setLocale(locale)  
    {
      this._locale = locale;
    },

    /** The generator method that iterates source code text.
     *  @return {Generator} Generator that yields source code text.
     */
    generateSources: function generateSources(search_path) 
    {
      var entries = coUtils.File
            .getFileEntriesFromSerchPath(search_path),
          entry,
          url,
          content;

      for (entry in entries) {
        // make URI string such as "file://....".
        url = coUtils.File.getURLSpec(entry); 
        try {
          yield coUtils.IO.readFromFile(url);
        } catch (e) {
          coUtils.Debug.reportError(e);
          coUtils.Debug.reportError(
            _("An Error occured loading common module '%s'."), url);
        }
      }
    },

    /** The generator method that extracts message-id string from source code 
     *  files.
     *  @return {Generator} Generator that yields message-id string.
     */
    generateMessages: function generateLocalizableMessages() 
    {
      var pattern = /_\(("(.+?)("[\n\r\s]*,[\n\r\s]*".+?)*"|'(.+?)')\)/g,
          sources = this.generateSources([ "modules/" ]),
          source,
          match,
          quoted_source,
          quote_char,
          escaped_quote_char,
          message;

      for (source in sources) {
        match = source.match(pattern)
        if (match) {
          match = match.map(
            function mapFunc(text)
            {
              quoted_source = text.slice(3, -2);
              quote_char = text[0];
              escaped_quote_char = "\\" + quote_char;
              return quoted_source
                .replace(/"[\s\n\r]*,[\s\n\r]*"/g, "")
                .replace(new RegExp(escaped_quote_char, "g"), quote_char);
            });
          for ([, message] in Iterator(match)) {
            yield message;
          }
        }
      }
    },

    getDictionary: function getLocalizeDictionary(language)
    {
      var location = "modules/locale/" + language + ".json",
          file = coUtils.File.getFileLeafFromVirtualPath(location),
          dict = null,
          content,
          db;

      if (file.exists()) {
        db = JSON.parse(coUtils.IO.readFromFile(location, "utf-8"));
        return db.dict;
      } else {
        return {};
      }
    },

    setDictionary: function getLocalizeDictionary(language, dictionary)
    {
      var location = "modules/locale/" + language + ".json",
          db = {
            lang: language,
            dict: dictionary,
          };

      coUtils.IO.writeToFile(location, JSON.stringify(db));
      this._dictionaries_store[db.lang] = db.dict;
    },

  };
  prototype.initialize();
  return prototype; 
};

/**
 * @fn _
 */
function _() 
{
  var lines = [].slice.apply(arguments),
      result;

  if (coUtils.Localize) {
    result =  coUtils.Localize.get(lines.join(""));
    return result;
  } else {
    return lines.join("");
  }
}

// EOF
