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
 * Portions created by the Initial Developer are Copyright (C) 2010 - 2013
 * the Initial Developer. All Rights Reserved.
 *
 * ***** END LICENSE BLOCK ***** */

"use strict";

var coUtils = coUtils || { };
coUtils.Constant = coUtils.Constant || { };

  //
  // X11 color name definition
  //
coUtils.Constant.X11_COLOR_MAP = {
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
  };

  //
  // Web 140 safe color definition
  //
coUtils.Constant.WEB140_COLOR_MAP = {
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
  };

function generateReverseMap(source_map)
{
  var result = {},
      keys = Object.keys(source_map),
      i = 0,
      key,
      value;

  for (; i < keys.length; ++i) {
    key = keys[i];
    value = source_map[key];
    result[value] = key;
    source_map[key.toLowerCase()] = value;
  }
  return result;
};

coUtils.Constant.WEB140_COLOR_MAP_REVERSE
  = generateReverseMap(coUtils.Constant.WEB140_COLOR_MAP);

coUtils.Constant.X11_COLOR_MAP_REVERSE
  = generateReverseMap(coUtils.Constant.X11_COLOR_MAP);

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

    rgb = match[1];
    r = match[2];
    g = match[3];
    b = match[4];
    name = match[5];

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
          .map(
            function(c)
            {
              return 0x100 + (parseInt(c, 16) << 4);
            })
          .map(
            function(n)
            {
              return n.toString(16).substr(1);
            })
          .join("")
          ;
        break;

      case 6:
        result = "#" + rgb;
        break;

      case 9:
        result = "#" + rgb
          .match(/.../g)
          .map(
            function(c)
            {
              return 0x100 + (parseInt(c, 16) >>> 4);
            })
          .map(
            function(n)
            {
              return n.toString(16).substr(1);
            })
          .join("")
          ;
        break;

      case 12:
        result = "#" + rgb
          .match(/..../g)
          .map(
            function(c)
            {
              return 0x100 + (parseInt(c, 16) >>> 8);
            })
          .map(
            function(n)
            {
              return n.toString(16).substr(1);
            })
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
    var buffer = "#",
        n,
        i = 0;

    for (; i < arguments.length; ++i) {

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
          .toLowerCase(),
        color = coUtils.Constant.X11_COLOR_MAP[canonical_name]
             || coUtils.Constant.WEB140_COLOR_MAP[canonical_name];

    if (!color) {
      throw coUtils.Debug.Exception(
        _("Invalid color name was specified: %s."), name);
    }

    return color;
  }, // _convertColorName

  _getDiff: function _getDiff(lhs, rhs)
  {
     var diff = (Math.abs(lhs[0] - rhs[0]) * 299
               + Math.abs(lhs[1] - rhs[1]) * 587
               + Math.abs(lhs[2] - rhs[2]) * 114) / 1000.0;

     return diff;
  },

  _adjustToMinDiff:
  function _adjustToMinDiff(target, base, diff, mindiff)
  {
    var n = 0,
        i,
        e,
        delta;

    for (; n < 100; ++n) {
      if (diff < mindiff) {
        for (i = 0; i < 3; ++i) {
          e = target[i];
          delta = e - base[i];
          if (0 === delta) {
            delta = e > 128 ? -10 : +10;
          } else {
            delta = delta / Math.abs(delta) * Math.floor((mindiff - diff) / 3);
          }
          e += delta;
          e = Math.round(e);
          if (e > 0xff) {
            e = 0xff;
          }
          if (e < 0) {
            e = 0;
          }
          target[i] = e;
        }
        diff = this._getDiff(target, base);
      }
    }

    return diff;
  },

  _adjustToMaxDiff:
  function _adjustToMinDiff(target, base, diff, maxdiff)
  {
    var n = 0,
        i,
        e;

    for (; n < 100; ++n) {
      if (diff > maxdiff) {
        for (i = 0; i < 3; ++i) {
          e = target[i];
          e = e + (base[i] - e) * 0.1;
          e = Math.round(e);
          if (e > 0xff) {
            e = 0xff;
          }
          if (e < 0) {
            e = 0;
          }
          target[i] = e;
        }
        diff = this._getDiff(target, base);
      }
    }

    return diff;
  },

  parseCSSColor: function parseCSSColor(text)
  {
    var pattern_24bit = /#([0-9a-fA-F]{2})([0-9a-fA-F]{2})([0-9a-fA-F]{2})/,
        pattern_rgba = /rgba\(\s*([0-9]+)\s*,\s*([0-9]+)\s*,\s*([0-9]+)\s*,\s*([0-9]+)\s*\)/,
        pattern_rgb = /rgb\(\s*([0-9]+)\s*,\s*([0-9]+)\s*,\s*([0-9]+)\s*\)/,
        match;

    match = text.match(pattern_24bit);
    if (null !== match) {
      return [parseInt(match[1], 16),
              parseInt(match[2], 16),
              parseInt(match[3], 16)];
    }
    match = text.match(pattern_rgba);
    if (null !== match) {
      return [Number(match[1]),
              Number(match[2]),
              Number(match[3]),
              Number(match[4])];
    }
    match = text.match(pattern_rgb);
    if (null !== match) {
      return [Number(match[1]),
              Number(match[2]),
              Number(match[3])];
    }
    throw coUtils.Debug.Exception(_("Parse error was detected: '%s'."), text);
  },

  adjust: function adjust(lhs, rhs, mindiff, maxdiff)
  {
    var lhs_rgb = this.parseCSSColor(lhs),
        rhs_rgb = this.parseCSSColor(rhs),
        diff = this._getDiff(lhs_rgb, rhs_rgb),
        result;

    diff = this._adjustToMinDiff(lhs_rgb, rhs_rgb, diff, mindiff);
    diff = this._adjustToMaxDiff(lhs_rgb, rhs_rgb, diff, maxdiff);
    result = "#" + (0x1000000 + (lhs_rgb[0] << 16 | lhs_rgb[1] << 8 | lhs_rgb[2]))
            .toString(16)
            .substr(1);
    return result;
  },

  /**
   * @fn getAverageGlyphSize
   * @brief Test font rendering and calculate average glyph width.
   */
  inspectContentColor: function inspectContentColor()
  {
    var NS_XHTML = "http://www.w3.org/1999/xhtml",
        canvas = coUtils.getWindow()
          .document
          .createElementNS(NS_XHTML , "html:canvas"),
        context = canvas.getContext("2d"),
        content = coUtils.getWindow().content,
        data,
        w,
        h,
        i,
        r = 0,
        g = 0,
        b = 0,
        acc = 0;
    canvas.width = 10;
    canvas.height = 10;


    w = content.innerWidth  || content.document.documentElement.clientWidth;
    h = content.innerHeight || content.document.documentElement.clientHeight;
    context.imageSmoothingEnabled = true;
    context.save();
    context.scale(10.0 / w, 10.0 / h);
    context.drawWindow(content, content.scrollX, content.scrollY, w, h, "rgb(255,255,255)");
    context.restore();
    data = context.getImageData(0, 0, 10, 10).data;
    for (i = 0; i < 400; i += 44) {
      r += data[i];
      g += data[i + 1];
      b += data[i + 2];
    }
    acc = Math.round(r / 10) << 16
        | Math.round(g / 10) << 8
        | Math.round(b / 10);
    canvas = null;
    return (0x1000000 + acc).toString(16).replace(/^1/, "#");
  },

  blend: function blend(lhs, rhs)
  {
    var lhs_rgb = this.parseCSSColor(lhs),
        rhs_rgb = this.parseCSSColor(rhs),
        result = "#"
               + Math.round(0x100 + (lhs_rgb[0] + rhs_rgb[0]) / 2).toString(16).substr(1)
               + Math.round(0x100 + (lhs_rgb[1] + rhs_rgb[1]) / 2).toString(16).substr(1)
               + Math.round(0x100 + (lhs_rgb[2] + rhs_rgb[2]) / 2).toString(16).substr(1);
    return result;
  },

  reverse: function reverse(color)
  {
    return (parseInt(color.substr(1), 16) ^ 0x1ffffff)
      .toString(16)
      .replace(/^1/, "#");
  },

}; // coUtils.Color


// EOF
