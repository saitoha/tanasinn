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

var coUtils = coUtils || { };
coUtils.Constant = coUtils.Constant || { };

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
}; // Constant.LOCALE_ID_MAP

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
      var locale_service = coUtils.Services.getLocaleService(),
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
     *  @return {Array} source code text contents.
     */
    _getSources: function _getSources(search_path) 
    {
      var entries = coUtils.File.getFileEntriesFromSearchPath(search_path),
          entry,
          url,
          content,
          i = 0,
          result = [];

      for (; i < entries.length; ++i) {
        entry = entries[i];
        // make URI string such as "file://....".
        url = coUtils.File.getURLSpec(entry); 
        try {
          result.push(coUtils.IO.readFromFile(url));
        } catch (e) {
          coUtils.Debug.reportError(e);
          coUtils.Debug.reportError(
            _("An Error occured loading common module '%s'."), url);
        }
      }

      return result;
    },

    /** The generator method that extracts message-id string from source code 
     *  files.
     *  @return {Array} message-id strings.
     */
    getMessages: function getMessages() 
    {
      var pattern = /_\(("(.+?)("[\n\r\s]*,[\n\r\s]*".+?)*"|'(.+?)')\)/g,
          sources = this._getSources([ "modules/" ]),
          source,
          match,
          quoted_source,
          quote_char,
          escaped_quote_char,
          message,
          result = [],
          i = 0,
          j;

      for (; i < sources.length; ++i) {

        source = sources[i];
        match = source.match(pattern)

        if (null !== match) {
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
          for (j = 0; j < match.length; ++j) {
            result.push(match[j]);
          }
        }
      }

      return result;

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
