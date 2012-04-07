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

let coUtils = coUtils || { };

coUtils.Constant = {

  CHARSET_US : "B",
  CHARSET_PC : "?",
  CHARSET_DEC: "0",

  KEYPAD_MODE_NORMAL: 0,
  KEYPAD_MODE_APPLICATION: 1,
  KEYPAD_MODE_NUMERIC: 2,

  DIRECTION_UP: 1,
  DIRECTION_DOWN: 2,
  DIRECTION_LEFT: 4,
  DIRECTION_RIGHT: 8,

  ROTATION_COUNTERCLOCKWISE: 1,
  ROTATION_CLOCKWISE: 2,

  WEB140_COLOR_MAP: {
    Black: "#000000",
    Navy: "#000080",
    DarkBlue: "#00008B",
    MediumBlue: "#0000CD",
    Blue: "#0000FF",
    DarkGreen: "#006400",
    Green: "#008000",
    Teal: "#008080",
    DarkCyan: "#008B8B",
    DeepSkyBlue: "#00BFFF",
    DarkTurquoise: "#00CED1",
    MediumSpringGreen: "#00FA9A",
    Lime: "#00FF00",
    SpringGreen: "#00FF7F",
    Aqua: "#00FFFF",
    Cyan: "#00FFFF",
    MidnightBlue: "#191970",
    DodgerBlue: "#1E90FF",
    LightSeaGreen: "#20B2AA",
    ForestGreen: "#228B22",
    SeaGreen: "#2E8B57",
    DarkSlateGray: "#2F4F4F",
    DarkSlateGrey: "#2F4F4F",
    LimeGreen: "#32CD32",
    MediumSeaGreen: "#3CB371",
    Turquoise: "#40E0D0",
    RoyalBlue: "#4169E1",
    SteelBlue: "#4682B4",
    DarkSlateBlue: "#483D8B",
    MediumTurquoise: "#48D1CC",
    Indigo: "#4B0082",
    DarkOliveGreen: "#556B2F",
    CadetBlue: "#5F9EA0",
    CornflowerBlue: "#6495ED",
    MediumAquaMarine: "#66CDAA",
    DimGray: "#696969",
    DimGrey: "#696969",
    SlateBlue: "#6A5ACD",
    OliveDrab: "#6B8E23",
    SlateGray: "#708090",
    SlateGrey: "#708090",
    LightSlateGray: "#778899",
    LightSlateGrey: "#778899",
    MediumSlateBlue: "#7B68EE",
    LawnGreen: "#7CFC00",
    Chartreuse: "#7FFF00",
    Aquamarine: "#7FFFD4",
    Maroon: "#800000",
    Purple: "#800080",
    Olive: "#808000",
    Gray: "#808080",
    Grey: "#808080",
    SkyBlue: "#87CEEB",
    LightSkyBlue: "#87CEFA",
    BlueViolet: "#8A2BE2",
    DarkRed: "#8B0000",
    DarkMagenta: "#8B008B",
    SaddleBrown: "#8B4513",
    DarkSeaGreen: "#8FBC8F",
    LightGreen: "#90EE90",
    MediumPurple: "#9370D8",
    DarkViolet: "#9400D3",
    PaleGreen: "#98FB98",
    DarkOrchid: "#9932CC",
    YellowGreen: "#9ACD32",
    Sienna: "#A0522D",
    Brown: "#A52A2A",
    DarkGray: "#A9A9A9",
    DarkGrey: "#A9A9A9",
    LightBlue: "#ADD8E6",
    GreenYellow: "#ADFF2F",
    PaleTurquoise: "#AFEEEE",
    LightSteelBlue: "#B0C4DE",
    PowderBlue: "#B0E0E6",
    FireBrick: "#B22222",
    DarkGoldenRod: "#B8860B",
    MediumOrchid: "#BA55D3",
    RosyBrown: "#BC8F8F",
    DarkKhaki: "#BDB76B",
    Silver: "#C0C0C0",
    MediumVioletRed: "#C71585",
    IndianRed: "#CD5C5C",
    Peru: "#CD853F",
    Chocolate: "#D2691E",
    Tan: "#D2B48C",
    LightGray: "#D3D3D3",
    LightGrey: "#D3D3D3",
    PaleVioletRed: "#D87093",
    Thistle: "#D8BFD8",
    Orchid: "#DA70D6",
    GoldenRod: "#DAA520",
    Crimson: "#DC143C",
    Gainsboro: "#DCDCDC",
    Plum: "#DDA0DD",
    BurlyWood: "#DEB887",
    LightCyan: "#E0FFFF",
    Lavender: "#E6E6FA",
    DarkSalmon: "#E9967A",
    Violet: "#EE82EE",
    PaleGoldenRod: "#EEE8AA",
    LightCoral: "#F08080",
    Khaki: "#F0E68C",
    AliceBlue: "#F0F8FF",
    HoneyDew: "#F0FFF0",
    Azure: "#F0FFFF",
    SandyBrown: "#F4A460",
    Wheat: "#F5DEB3",
    Beige: "#F5F5DC",
    WhiteSmoke: "#F5F5F5",
    MintCream: "#F5FFFA",
    GhostWhite: "#F8F8FF",
    Salmon: "#FA8072",
    AntiqueWhite: "#FAEBD7",
    Linen: "#FAF0E6",
    LightGoldenRodYellow: "#FAFAD2",
    OldLace: "#FDF5E6",
    Red: "#FF0000",
    Fuchsia: "#FF00FF",
    Magenta: "#FF00FF",
    DeepPink: "#FF1493",
    OrangeRed: "#FF4500",
    Tomato: "#FF6347",
    HotPink: "#FF69B4",
    Coral: "#FF7F50",
    Darkorange: "#FF8C00",
    LightSalmon: "#FFA07A",
    Orange: "#FFA500",
    LightPink: "#FFB6C1",
    Pink: "#FFC0CB",
    Gold: "#FFD700",
    PeachPuff: "#FFDAB9",
    NavajoWhite: "#FFDEAD",
    Moccasin: "#FFE4B5",
    Bisque: "#FFE4C4",
    MistyRose: "#FFE4E1",
    BlanchedAlmond: "#FFEBCD",
    PapayaWhip: "#FFEFD5",
    LavenderBlush: "#FFF0F5",
    SeaShell: "#FFF5EE",
    Cornsilk: "#FFF8DC",
    LemonChiffon: "#FFFACD",
    FloralWhite: "#FFFAF0",
    Snow: "#FFFAFA",
    Yellow: "#FFFF00",
    LightYellow: "#FFFFE0",
    Ivory: "#FFFFF0",
    White: "#FFFFFF"
  },

};

coUtils.Constant.WEB140_COLOR_MAP_REVERSE = function() {
  let result = {};
  for (let [key, value] in Iterator(coUtils.Constant.WEB140_COLOR_MAP)) {
    result[value] = key;
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
let alert = coUtils.alert = function alert(message)
{
  if (arguments.length > 1 && "string" == typeof message) {
    message = coUtils.Text.format.apply(coUtils.Text, arguments);
  }
  let promptService = Components
      .classes["@mozilla.org/embedcomp/prompt-service;1"]
      .getService(Components.interfaces.nsIPromptService)
    promptService.alert(this.window || null, "tanasinn", message);
}

/** Returns the window object.
 *  @return {Window} The window object.
 */
coUtils.getWindow = function getWindow() 
{
  let windowMediator = Components
    .classes["@mozilla.org/appshell/window-mediator;1"]
    .getService(Components.interfaces.nsIWindowMediator);
  let result = windowMediator.getMostRecentWindow("navigator:browser")
            || windowMediator.getMostRecentWindow("mail:3pane");
  // cache result
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
  let args = [].slice.apply(arguments);
  let template = args.shift();
  let result = template.replace(/%[s|f|d|i|x]/g, function(matchString) {
    let value = args.shift();
    if ("%s" == matchString) {
      return String(value);
    } else if ("%f" == matchString) {
      return parseFloat(value).toString();
    } else if ("%d" == matchString || "%i" == matchString) {
      return parseInt(value).toString();
    } else if ("%x" == matchString) {
      return parseInt(value).toString(16);
    }
    throw Components.Exception([
      _("A logical error occured."),
      " matchString: ", "\"", matchString, "\""
    ].join(""));
  });
  return result;
}

coUtils.Event = {

  _observers: {},

   /** Register system-global event handler.
    *  @param {String} topic The notification topic.
    *  @param {Function} context The handler function.
    *  @param {Object} context A "this" object in which the listener handler 
    *                  is to be evalute.
    */
  subscribeGlobalEvent: function subscribeGlobalEvent(topic, handler, context)
  {
    let delegate;
    if (context) {
      delegate = function() handler.apply(context, arguments);
    } else {
      delegate = handler;
    }
    this.observerService = this.observerService || Components
      .classes["@mozilla.org/observer-service;1"]
      .getService(Components.interfaces.nsIObserverService);
    let observer = { 
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
    if (this.observerService) {
      let observers = this._observers[topic];
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
    const NS_XHTML = "http://www.w3.org/1999/xhtml";
    let canvas = coUtils.getWindow()
      .document
      .createElementNS(NS_XHTML , "html:canvas");
    let context = canvas.getContext("2d");
    let unit = test_string || "Mbc123-XYM";
    
    let text = "";
    for (let i = 0; i < 10; ++i) {
      text += i;
    }

    let css_font_property = [font_size, "px ", font_family].join("");
    context.font = css_font_property;
    let metrics = context.measureText(text);
    let char_width = metrics.width / text.length;
    let height = metrics.height;
  
    text = "g\u3075";
    metrics = context.measureText(text);
    canvas.width = metrics.width;
    canvas.height = (font_size * 2) | 0;
    context.save();
    context.translate(0, font_size);
    context.fillText(text, 0, 0);
    context.strokeText(text, 0, 0);
    context.restore();
    let data = context.getImageData(0, 0, canvas.width, canvas.height).data; 
    let line_length = data.length / (canvas.height * 4);
  
    let first, last;
  detect_first:
    for (let i = 3; i < data.length; i += 4) {
      if (data[i]) {
        first = Math.floor(i / (canvas.width * 4));
        break detect_first;
      }
    }
  detect_last:
    for (let i = data.length - 1; i >= 0; i -= 4) {
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


/** I/O Functions. */
coUtils.IO = {

  /** Get all text from the file specified by given URI string.
   *  @param {String} location A URI string of target file.
   *  @param {String} charset Target file's encoding.
   */
  readFromFile: function readFromFile(location, charset) 
  {
    let url;
    location = String(location);
    if (location.match(/^[a-z]+:\/\//)) {
      url = location;
    } else {
      let file = coUtils.File.getFileLeafFromVirtualPath(location);
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
    let channel = Components
      .classes["@mozilla.org/network/io-service;1"]
      .getService(Components.interfaces.nsIIOService2)
      .newChannel(url, null, null);
    let input = channel.open();
    try {
      if (charset) {
        let stream = Components
          .classes["@mozilla.org/intl/converter-input-stream;1"]
          .createInstance(Components.interfaces.nsIConverterInputStream);
        stream.init(input, charset, 1024, 
          Components.interfaces.nsIConverterInputStream.DEFAULT_REPLACEMENT_CHARACTER);
        try {
          let buffer = [];
          while (true) {
            let result = {};
            let nread = stream.readString(input.available(), result);
            buffer.push(result.value);
            if (0 == nread)
              break;
          }
          return buffer.join("");
        } finally {
          stream.close();
        }
      } else {
        let stream = Components
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
  writeToFile: function writeToFile(path, data, callback) 
  {
    let file = coUtils.File.getFileLeafFromVirtualPath(path);
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
      void function make_directory(current) 
      {
        let parent = current.parent;
        if (!parent.exists()) {
          make_directory(parent);
          parent.create(Components.interfaces.nsIFile.DIRECTORY_TYPE, -1);
        }
      } (file);
    }
  	Components.utils.import("resource://gre/modules/NetUtil.jsm");
  	Components.utils.import("resource://gre/modules/FileUtils.jsm");
  	 
  	// file is nsIFile, data is a string
  	let mode = FileUtils.MODE_WRONLY | FileUtils.MODE_CREATE | FileUtils.MODE_TRUNCATE;
  	let ostream = FileUtils.openSafeFileOutputStream(file, mode);
  	let converter = Components.classes["@mozilla.org/intl/scriptableunicodeconverter"].
  	                createInstance(Components.interfaces.nsIScriptableUnicodeConverter);
  	converter.charset = "UTF-8";
  	let istream = converter.convertToInputStream(data);
  	NetUtil.asyncCopy(istream, ostream, function(status) {
      try {
  	    if (!Components.isSuccessCode(status)) {
          throw coUtils.Debug.Exception(
            _("An error occured when writing to local file [%s]. Status code is [%x]."),
            file, status);
  	    }
      } finally {
        FileUtils.closeSafeFileOutputStream(ostream);
        if (callback) {
          callback();
        }
      }
  	}); // writeToFile
  },

  saveCanvas: function saveCanvas(source_canvas, file, is_thumbnail) 
  {
    const NS_XHTML = "http://www.w3.org/1999/xhtml";
    let canvas = source_canvas
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
  
    let context = canvas.getContext("2d");
    context.fillStyle = "rgba(0, 0, 0, 0.7)";
    context.fillRect(0, 0, canvas.width, canvas.height);
    context.drawImage(source_canvas, 0, 0, canvas.width, canvas.height);
  
    // create a data url from the canvas and then create URIs of the source and targets.
    let io = Components
      .classes["@mozilla.org/network/io-service;1"]
      .getService(Components.interfaces.nsIIOService);
    let source = io.newURI(canvas.toDataURL("image/png", ""), "UTF8", null);
    let target = io.newFileURI(file)
  
    // prepare to save the canvas data  
    let persist = Components
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
    let file = this.getFileLeafFromVirtualPath(path);
    return file.exists();
  },

  getPathDelimiter: function getPathDelimiter() 
  {
    return "WINNT" == coUtils.Runtime.os ? "\\": "/";
  },
  
  isAbsolutePath: function isAbsolutePath(path) 
  {
    if ("WINNT" == coUtils.Runtime.os) {
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
    let last_modified_time = null;
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
    let io_service = Components
      .classes["@mozilla.org/network/io-service;1"]
      .getService(Components.interfaces.nsIIOService);
    let file_handler = io_service.getProtocolHandler("file")
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
    let directory_entries = directory.clone().directoryEntries;
    let callee = arguments.callee;
    return function() { // return generator.
      while (directory_entries.hasMoreElements()) {
        let file = directory_entries.getNext()
          .QueryInterface(Components.interfaces.nsIFile);
        let name = file.leafName;
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
    let self = this;
    let entries = function entries() {
      for each (let [, path] in Iterator(search_directories)) {
        try {
          if (coUtils.File.exists(path)) {
            let target_leaf = coUtils.File.getFileLeafFromVirtualPath(path);
            if (!target_leaf || !target_leaf.exists()) {
              coUtils.Debug.reportWarning(
                _("Cannot get file entries from '%s'. ",
                  "It seems that specified path does not exist."), path);
              continue;
            }
            if (target_leaf.isFile()) {
              yield target_leaf;
            } else {
              let entries = self.getFilesRecursively(target_leaf, /\.js$/);
              for (let entry in entries) {
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
    virtual_path = String(virtual_path);
    let target_leaf;
    let split_path = virtual_path.split(/[\/\\]/);
    let root_entry = split_path.shift();
    let match = root_entry.match(/^\$([^/]+)$/);
    if (match) {
      target_leaf = this.getSpecialDirectoryName(match.pop());
    } else if (coUtils.File.isAbsolutePath(virtual_path)) { // absolute path
      target_leaf = Components
        .classes["@mozilla.org/file/local;1"]
        .createInstance(Components.interfaces.nsILocalFile);
      target_leaf.initWithPath(virtual_path);
      return target_leaf;
    } else { // relative path
      let file_name = [
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
    let directoryService = Components
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
    let url = null;
    let file = null;

    // detect if given location string is a URL formatted string.
    let match = location.match(/^([a-z]+):\/\//);
    if (match) { // location is URL spec formatted.
      let [, protocol] = match;
      if ("file" == protocol) { 
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

  KEYNAME_PACKEDCODE_MAP: let (KEY_NOCHAR = 25) {
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
    space       : ("Darwin" == coUtils.Runtime.os) << KEY_NOCHAR | 0x0020,
    sp          : ("Darwin" == coUtils.Runtime.os) << KEY_NOCHAR | 0x0020,
    bs          : 0x1 << KEY_NOCHAR | 0x0008, 
    backspace   : 0x1 << KEY_NOCHAR | 0x0008, 
    tab         : 0x1 << KEY_NOCHAR | 0x0009, 
    enter       : 0x1 << KEY_NOCHAR | 0x000d,
    return      : 0x1 << KEY_NOCHAR | 0x000d,
    cr          : 0x1 << KEY_NOCHAR | 0x000d,
    lf          : 0x1 << KEY_NOCHAR | 0x000a,
    escape      : 0x1 << KEY_NOCHAR | 0x001b,
    esc         : 0x1 << KEY_NOCHAR | 0x001b,
    pgup        : 0x1 << KEY_NOCHAR | 0x0021,
    pgdn        : 0x1 << KEY_NOCHAR | 0x0022,
    end         : 0x1 << KEY_NOCHAR | 0x0023,
    home        : 0x1 << KEY_NOCHAR | 0x0024,
    left        : 0x1 << KEY_NOCHAR | 0x0025,
    up          : 0x1 << KEY_NOCHAR | 0x0026,
    right       : 0x1 << KEY_NOCHAR | 0x0027,
    down        : 0x1 << KEY_NOCHAR | 0x0028,
    ins         : 0x1 << KEY_NOCHAR | 0x002d,
    insert      : 0x1 << KEY_NOCHAR | 0x002d,
    del         : 0x1 << KEY_NOCHAR | 0x002e,
    f1          : 0x1 << KEY_NOCHAR | 0x0070,
    f2          : 0x1 << KEY_NOCHAR | 0x0071,
    f3          : 0x1 << KEY_NOCHAR | 0x0072,
    f4          : 0x1 << KEY_NOCHAR | 0x0073,
    f5          : 0x1 << KEY_NOCHAR | 0x0074,
    f6          : 0x1 << KEY_NOCHAR | 0x0075,
    f7          : 0x1 << KEY_NOCHAR | 0x0076,
    f8          : 0x1 << KEY_NOCHAR | 0x0077,
    f9          : 0x1 << KEY_NOCHAR | 0x0078,
    f10         : 0x1 << KEY_NOCHAR | 0x0079,
    f11         : 0x1 << KEY_NOCHAR | 0x007a,
    f12         : 0x1 << KEY_NOCHAR | 0x007b,
//    del         : 0x1 << KEY_NOCHAR | 0x007f,
//    delete      : 0x1 << KEY_NOCHAR | 0x007f,
  },

  getCodeToNameMap: function getCodeToNameMap() 
  {
    let result = {};
    Object.keys(this.KEYNAME_PACKEDCODE_MAP).forEach(function(name) {
      let value = this.KEYNAME_PACKEDCODE_MAP[name];
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
    let buffer = [];
    if (packed_code & (1 << coUtils.Keyboard.KEY_CTRL)) {
      buffer.push("C");
    }
    if (packed_code & (1 << coUtils.Keyboard.KEY_ALT)) {
      buffer.push("A");
    }
    if (packed_code & (1 << coUtils.Keyboard.KEY_SHIFT)) {
      buffer.push("S");
    }
    if (packed_code & (1 << coUtils.Keyboard.KEY_META)) {
      buffer.push("M");
    }
    let char = String.fromCharCode(0xffffff & packed_code);
    if (packed_code & (1 << coUtils.Keyboard.KEY_NOCHAR)) {
      let map = this.getCodeToNameMap();
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

    if ("-" == char || "<" == char || ">" == char) {
      char = "\\" + char;
    }
    buffer.push(char);
    if (1 == buffer.length) {
      if (1 == buffer[0].length) {
        return buffer.pop();
      } else {
        return "<" + buffer.pop() + ">";
      }
    } else if (2 == buffer.length && 
               "S" == buffer[0] && 
               1 == buffer[1].length) {
      return buffer.pop();
    }
    return "<" + buffer.join("-") + ">";
  },

  getPackedKeycodeFromEvent: 
  function getPackedKeycodeFromEvent(event) 
  {
    let code = event.keyCode || event.which;
    if (event.shiftKey && (
          event.ctrlKey || 
          event.altKey ||
          event.metaKey)) {
      if (/* A */ 65 <= code && code <= 90 /* Z */) {
        code += 32;
      }
    }

    // make packed code
    let packed_code = code 
      | Boolean(event.ctrlKey)   << coUtils.Keyboard.KEY_CTRL 
      | (Boolean(event.altKey) || code > 0xff) << coUtils.Keyboard.KEY_ALT 
      | Boolean(event.shiftKey)  << coUtils.Keyboard.KEY_SHIFT 
      | Boolean(event.keyCode)   << coUtils.Keyboard.KEY_NOCHAR
      | Boolean(event.metaKey)   << coUtils.Keyboard.KEY_META
      ;

    // fix for Space key with modifier.
    if (0x20 == code && (event.shiftKey || event.ctrlKey || event.altKey)) {
      packed_code |= 1 << coUtils.Keyboard.KEY_NOCHAR;
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
    let pattern = /<.+?>|./g;
    let match = expression.match(pattern);
    let strokes = match;

    let key_code_array = [];
    for (let i = 0; i < strokes.length; ++i) {
      let stroke = strokes[i];
      let tokens = null;
      if (1 < stroke.length) {
        stroke = stroke.slice(1, -1); // <...> -> ...
        tokens = stroke
          .match(/[0-9]+\-(\\\-|[^-]+)+|\\\-|[^-]+/g)
          .map(function(token) token.replace(/^\\/, ""));
      } else {
        tokens = [stroke];
      }
      let key_code = null;
      let last_key = tokens.pop();
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
   
      for (let j = 0; j < tokens.length; ++j) {
        let sequence = tokens[j];
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
  doubleWidthTest: function doubleWidthTest(code) 
  { // TODO: See EastAsianWidth.txt
    let c = String.fromCharCode(code);
    return coUCS2EastAsianWidthTest(c);
  },

  isNonSpacingMark: function isNonSpacingMark(code)
  {
    let c = String.fromCharCode(code);
    return coUCS2NonSpacingMarkTest(c);
  },

  getUTF8ByteStreamGenerator: function getUTF8ByteStreamGenerator(str) 
  {
    for each (let c in str) {
      let code = c.charCodeAt(0);
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
    if (!str)
      return "";
    let byteStream = [byte for (byte in coUtils.getUTF8ByteStreamGenerator(str))];
    return String.fromCharCode.apply(String, byteStream);
  },

};


coUtils.Logger = function() this.initialize.apply(this, arguments);
coUtils.Logger.prototype = {

  _ostream: null,
  _converter: null,

  log_file_path: "$Home/.tanasinn/log/tanasinn-js.log",

  /** constructor */
  initialize: function initialize()
  {
    // create nsIFile object.
    let path = coUtils.File
      .getFileLeafFromVirtualPath(this.log_file_path)
      .path;
    let file = Components
      .classes["@mozilla.org/file/local;1"]
      .createInstance(Components.interfaces.nsILocalFile);
    file.initWithPath(path);

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

  /** Provides printf-like formatting.
   *  @param {String} template 
   *  @return {String} Formatted string.
   */
  format: function format(/* template, arg1, arg2, .... */) 
  {
    let args = [].slice.apply(arguments);
    let template = args.shift();
    let result = template.replace(/%[s|f|d|i|x]/g, function(matchString) {
      let value = args.shift();
      if ("%s" == matchString) {
        return String(value);
      } else if ("%f" == matchString) {
        return parseFloat(value).toString();
      } else if ("%d" == matchString || "%i" == matchString) {
        return parseInt(value).toString();
      } else if ("%x" == matchString) {
        return parseInt(value).toString(16);
      }
      throw Components.Exception([
        _("A logical error occured."),
        " matchString: ", "\"", matchString, "\""
      ].join(""));
    });
    return result;
  },

};

coUtils.Xml = {
};

coUtils.Timer = {

  /**
   * @fn setTimeout
   * @brief Set timer callback.
   */
  setTimeout: function setTimeout(timer_proc, interval, context) 
  {
    let timer = Components
      .classes["@mozilla.org/timer;1"]
      .createInstance(Components.interfaces.nsITimer);
    let a_type = Components.interfaces.nsITimer.TYPE_ONE_SHOT;
    let timer_callback_func = context ? 
      function invoke() 
      {
        timer_proc.apply(context, arguments)
        timer = null;
      }
    : timer_proc;
    let observer = { notify: timer_callback_func };
    timer.initWithCallback(observer, interval, a_type);
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
    let timer = Components
      .classes["@mozilla.org/timer;1"]
      .createInstance(Components.interfaces.nsITimer);
    let a_type = Components.interfaces.nsITimer.TYPE_REPEATING_SLACK;
    let timer_callback_func = context ? 
      function invoke() 
      {
        timer_proc.apply(context, arguments);
      }
    : timer_proc;
    timer.initWithCallback({ notify: timer_callback_func }, interval, a_type);
    return {
      cancel: function cancel() {
        timer.cancel();
        timer = null;
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
    if (arguments.length > 1 && "string" == typeof message) {
      message = coUtils.Text.format.apply(coUtils.Text, arguments);
    }
    let stack = Components.stack.caller;  // get caller"s context.
    let flag = Components.interfaces.nsIScriptError.errorFlag; // it"s warning
    return this.makeException(message, stack, flag);
  },

  /**
   * Report error to Console service.
   * @param {String} source 
   */
  reportError: function reportError(source /* arg1, arg2, arg3, ... */) 
  {
    // check if printf style arguments is given. 
    if (arguments.length > 1 && "string" == typeof source) {
      source = coUtils.Text.format.apply(coUtils.Text, arguments);
    }
    let stack = Components.stack.caller;  // get caller"s context.
    let flag = Components.interfaces.nsIScriptError.errorFlag; // it"s error.
    this.reportException(source, stack, flag);
  },

  /**
   * Report warning to Console service.
   * @param {String} source 
   */
  reportWarning: function reportWarning(source /* arg1, arg2, arg3, ... */) 
  {
    if (arguments.length > 1 && "string" == typeof source) {
      source = coUtils.Text.format.apply(coUtils.Text, arguments);
    }
    let stack = Components.stack.caller;  // get caller"s context.
    let flag = Components.interfaces.nsIScriptError.warningFlag; // it"s warning.
    this.reportException(source, stack, flag);
  },

  /**
   * Report warning to Console service.
   * @param source 
   */
  reportMessage: function reportMessage(source) 
  {
    if (arguments.length > 1 && "string" == typeof source) {
      source = coUtils.format.apply(coUtils, arguments);
    }
    let stack = Components.stack.caller;
    let escapedSource = source.toString().replace(/"/g, "\u201d");
    let file = stack.filename.split(" -> ").pop().split("?").shift().replace(/"/g, "\u201d");
    let name = stack.name && stack.name.replace(/"/g, "\u201d");
    let message = [
      "[",
        "JavaScript Message: \"tanasinn: ", escapedSource, "\" ", 
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
    if (source === null || source === undefined)
      source = String(source)
    if (typeof source == "xml")
      source = source.toString();
    const consoleService = Components
      .classes["@mozilla.org/consoleservice;1"]
      .getService(Components.interfaces.nsIConsoleService);
    if (source && source.queryInterface !== undefined) 
    {
      if (source.QueryInterface(
          Components.interfaces.nsIConsoleMessage) !== null) 
      {
        if (source.QueryInterface(
            Components.interfaces.nsIScriptError) !== null) 
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
    if (source.stack)
      stack = source.stack; // use the stack of Error object.
    let error = this.makeException(source, stack, flag);
    coUtils.Logging.logMessage(source.toString());
    consoleService.logMessage(error);
    return;
  },

  /**
   * Makes an exception object from given information.
   */
  makeException: function makeException(source, stack, flag) 
  {
    let exception = Components
      .classes["@mozilla.org/scripterror;1"]
      .createInstance(Components.interfaces.nsIScriptError);
    let is_error_object = !!source.fileName;
  
    let message = "tanasinn: " 
      + (is_error_object ? source.message: source.toString()).replace(/"/g, "\u201d");
    let file = (is_error_object ? source.fileName: stack.filename)
      .split(" -> ").pop().split("?").shift().replace(/"/g, "\u201d");
    let sourceLine = is_error_object ? null: stack.sourceLine;
    let line = is_error_object ? source.lineNumber: stack.lineNumber;
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
    let uuid = this._uuid_generator.generateUUID();
    return uuid;
  },

}; // coUtils.Uuid

/**
 * @class Localize
 * Provides gettext-like message translation service.
 */
coUtils.Localize = new function()
{
  let prototype = {

    /** locale string. (en_US, ja_JP, etc...) */
    _locale: null,

    /** contains multiple dictionaries. */
    _dictionaries_store: null,

    /** constructor */
    initialize: function initialize() 
    {
      let locale_service = Components
        .classes["@mozilla.org/intl/nslocaleservice;1"]
        .getService(Components.interfaces.nsILocaleService); 
      this._dictionaries_store = {};
      let locale = locale_service.getLocaleComponentForUserAgent();
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

    switchLocale: function switchLocale(locale)
    {
      this.locale = locale;
      this.load();
    },

    /** Loads locale-mapping file and apply it. */
    load: function load() 
    {
      let locale = this._locale;
      let path = "modules/locale/" + locale + ".json";
      let file = coUtils.File.getFileLeafFromVirtualPath(path);
      let db = null;
      if (file.exists()) {
        let content = coUtils.IO.readFromFile(path, "utf-8");
        db = JSON.parse(content);
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
      let dictionary = this._dictionaries_store[this._locale] || {};
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
      let entries = coUtils.File
        .getFileEntriesFromSerchPath(search_path);
      for (let entry in entries) {
        // make URI string such as "file://....".
        let url = coUtils.File.getURLSpec(entry); 
        try {
          let content = coUtils.IO.readFromFile(url);
          yield content;
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
      let pattern = /_\(("(.+?)("[\n\r\s]*,[\n\r\s]*".+?)*"|'(.+?)')\)/g;
      let sources = this.generateSources([ "modules/" ]);
      for (let source in sources) {
        let match = source.match(pattern)
        if (match) {
          match = match.map(function(text) {
            let quoted_source = text.slice(3, -2);
            let quote_char = text[0];
            let escaped_quote_char = "\\" + quote_char;
            return quoted_source
              .replace(/"[\s\n\r]*,[\s\n\r]*"/g, "")
              .replace(new RegExp(escaped_quote_char, "g"), quote_char);
          })
          for (let [, message] in Iterator(match)) {
            yield message;
          }
        }
      }
    },

    getDictionary: function getLocalizeDictionary(language)
    {
      let location = "modules/locale/" + language + ".json";
      let file = coUtils.File.getFileLeafFromVirtualPath(location);
      let dict = null;
      if (file.exists()) {
        let content = coUtils.IO.readFromFile(location, "utf-8");
        let db = JSON.parse(content);
        return db.dict;
      } else {
        return {};
      }
    },

    setDictionary: function getLocalizeDictionary(language, dictionary)
    {
      let location = "modules/locale/" + language + ".json";
      let db = {
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
  let lines = [].slice.apply(arguments);
  if (coUtils.Localize) {
    let result =  coUtils.Localize.get(lines.join(""));
    return result;
  } else {
    return lines.join("");
  }
}

//coUtils.Runtime.loadScript("modules/common/pot.js", scope);
coUtils.Runtime.loadScript("modules/unicode/category.js", scope);  // unicode category db
coUtils.Runtime.loadScript("modules/unicode/eastasian.js", scope); // unicode eastasian db

coUtils.Runtime.loadScript("modules/common/tupstart.js", scope);
coUtils.Runtime.loadScript("modules/common/tupbase.js", scope);


