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
 * @fn decSpecialCharacterMap
 * @brief Convert DEC Special character set -> Unicode characters.
 *
 * -*- from "VT220 Programmer Reference Manual" -*-
 * http://vt100.net/docs/vt220-rm/table2-4.html 
 *
 * -*- from manpage of terminfo -*-
 *
 * Glyph                     ACS           Ascii    VT100
 * Name                      Name          Default  Name
 *
 * UK pound sign             ACS_STERLING  f        }
 * arrow pointing down       ACS_DARROW    v        .
 * arrow pointing left       ACS_LARROW    <        ,
 * arrow pointing right      ACS_RARROW    >        +
 * arrow pointing up         ACS_UARROW    ^        -
 * board of squares          ACS_BOARD     #        h
 * bullet                    ACS_BULLET    o        ~
 * checker board (stipple)   ACS_CKBOARD   :        a
 * degree symbol             ACS_DEGREE    \        f
 * diamond                   ACS_DIAMOND   +        `
 * greater-than-or-equal-to  ACS_GEQUAL    >        z
 * greek pi                  ACS_PI        *        {
 * horizontal line           ACS_HLINE     -        q
 * lantern symbol            ACS_LANTERN   #        i
 * large plus or crossover   ACS_PLUS      +        n
 * less-than-or-equal-to     ACS_LEQUAL    <        y
 * lower left corner         ACS_LLCORNER  +        m
 * lower right corner        ACS_LRCORNER  +        j
 * not-equal                 ACS_NEQUAL    !        |
 * plus/minus                ACS_PLMINUS   #        g
 * scan line 1               ACS_S1        ~        o
 * scan line 3               ACS_S3        -        p
 * scan line 7               ACS_S7        -        r
 * scan line 9               ACS_S9        _        s
 * solid square block        ACS_BLOCK     #        0
 * tee pointing down         ACS_TTEE      +        w
 * tee pointing left         ACS_RTEE      +        u
 * tee pointing right        ACS_LTEE      +        t
 * tee pointing up           ACS_BTEE      +        v
 * upper left corner         ACS_ULCORNER  +        l
 * upper right corner        ACS_URCORNER  +        k
 * vertical line             ACS_VLINE     |        x
 */

var USASCII = [
  0x00, /* NUL  */
  0x01, /* SOH  */
  0x02, /* STX  */
  0x03, /* ETX  */
  0x04, /* EOT  */
  0x05, /* ENQ  */
  0x06, /* ACK  */
  0x07, /* BEL  */
  0x08, /* BS   */
  0x09, /* HT   */
  0x0a, /* LF   */
  0x0b, /* VT   */
  0x0c, /* FF   */
  0x0d, /* CR   */
  0x0e, /* SO   */
  0x0f, /* SI   */
  0x10, /* DLE  */
  0x11, /* DC1  */
  0x12, /* DC2  */
  0x13, /* DC3  */
  0x14, /* DC4  */
  0x15, /* NAK  */
  0x16, /* SYN  */
  0x17, /* ETB  */
  0x18, /* CAN  */
  0x19, /* EM   */
  0x1a, /* SUB  */
  0x1b, /* ESC  */
  0x1c, /* FS   */
  0x1d, /* GS   */
  0x1e, /* RS   */
  0x1f, /* US   */
  0x20, /* sp   */
  0x21, /* !    */
  0x22, /* "    */
  0x23, /* #    */
  0x24, /* $    */
  0x25, /* %    */
  0x26, /* &    */
  0x27, /* '    */
  0x28, /* (    */
  0x29, /* )    */
  0x2a, /* *    */
  0x2b, /* +    */
  0x2c, /* ,    */
  0x2d, /* -    */
  0x2e, /* .    */
  0x2f, /* /    */
  0x30, /* 0    */
  0x31, /* 1    */
  0x32, /* 2    */
  0x33, /* 3    */
  0x34, /* 4    */
  0x35, /* 5    */
  0x36, /* 6    */
  0x37, /* 7    */
  0x38, /* 8    */
  0x39, /* 9    */
  0x3a, /* :    */
  0x3b, /* ;    */
  0x3c, /* <    */
  0x3d, /* =    */
  0x3e, /* >    */
  0x3f, /* ?    */
  0x40, /* @    */
  0x41, /* A    */
  0x42, /* B    */
  0x43, /* C    */
  0x44, /* D    */
  0x45, /* E    */
  0x46, /* F    */
  0x47, /* G    */
  0x48, /* H    */
  0x49, /* I    */
  0x4a, /* J    */
  0x4b, /* K    */
  0x4c, /* L    */
  0x4d, /* M    */
  0x4e, /* N    */
  0x4f, /* O    */
  0x50, /* P    */
  0x51, /* Q    */
  0x52, /* R    */
  0x53, /* S    */
  0x54, /* T    */
  0x55, /* U    */
  0x56, /* V    */
  0x57, /* W    */
  0x58, /* X    */
  0x59, /* Y    */
  0x5a, /* Z    */
  0x5b, /* [    */
  0x5c, /* \    */
  0x5d, /* ]    */
  0x5e, /* ^    */
  0x5f, /* _    */
  0x60, /* `    */
  0x61, /* a    */
  0x62, /* b    */
  0x63, /* c    */
  0x64, /* d    */
  0x65, /* e    */
  0x66, /* f    */
  0x67, /* g    */
  0x68, /* h    */
  0x69, /* i    */
  0x6a, /* j    */
  0x6b, /* k    */
  0x6c, /* l    */
  0x6d, /* m    */
  0x6e, /* n    */
  0x6f, /* o    */
  0x70, /* p    */
  0x71, /* q    */
  0x72, /* r    */
  0x73, /* s    */
  0x74, /* t    */
  0x75, /* u    */
  0x76, /* v    */
  0x77, /* w    */
  0x78, /* x    */
  0x79, /* y    */
  0x7a, /* z    */
  0x7b, /* {    */
  0x7c, /* |    */
  0x7d, /* }    */
  0x7e, /* ~    */
  0x7f, /* DEL  */
];

var ISO_8859_Latin1 = [
  0x80, /*  */
  0x81, /*  */
  0x82, /*  */
  0x83, /*  */
  0x84, /*  */
  0x85, /*  */
  0x86, /*  */
  0x87, /*  */
  0x88, /*  */
  0x89, /*  */
  0x8a, /*  */
  0x8b, /*  */
  0x8c, /*  */
  0x8d, /*  */
  0x8e, /*  */
  0x8f, /*  */
  0x90, /*  */
  0x91, /*  */
  0x92, /*  */
  0x93, /*  */
  0x94, /*  */
  0x95, /*  */
  0x96, /*  */
  0x97, /*  */
  0x98, /*  */
  0x99, /*  */
  0x9a, /*  */
  0x9b, /*  */
  0x9c, /*  */
  0x9d, /*  */
  0x9e, /*  */
  0x9f, /*  */
  0xa0, /*  */
  0xa1, /*  */
  0xa2, /*  */
  0xa3, /*  */
  0xa4, /*  */
  0xa5, /*  */
  0xa6, /*  */
  0xa7, /*  */
  0xa8, /*  */
  0xa9, /*  */
  0xaa, /*  */
  0xab, /*  */
  0xac, /*  */
  0xad, /*  */
  0xae, /*  */
  0xaf, /*  */
  0xb0, /*  */
  0xb1, /*  */
  0xb2, /*  */
  0xb3, /*  */
  0xb4, /*  */
  0xb5, /*  */
  0xb6, /*  */
  0xb7, /*  */
  0xb8, /*  */
  0xb9, /*  */
  0xba, /*  */
  0xbb, /*  */
  0xbc, /*  */
  0xbd, /*  */
  0xbe, /*  */
  0xbf, /*  */
  0xc0, /*  */
  0xc1, /*  */
  0xc2, /*  */
  0xc3, /*  */
  0xc4, /*  */
  0xc5, /*  */
  0xc6, /*  */
  0xc7, /*  */
  0xc8, /*  */
  0xc9, /*  */
  0xca, /*  */
  0xcb, /*  */
  0xcc, /*  */
  0xcd, /*  */
  0xce, /*  */
  0xcf, /*  */
  0xd0, /*  */
  0xd1, /*  */
  0xd2, /*  */
  0xd3, /*  */
  0xd4, /*  */
  0xd5, /*  */
  0xd6, /*  */
  0xd7, /*  */
  0xd8, /*  */
  0xd9, /*  */
  0xda, /*  */
  0xdb, /*  */
  0xdc, /*  */
  0xdd, /*  */
  0xde, /*  */
  0xdf, /*  */
  0xe0, /*  */
  0xe1, /*  */
  0xe2, /*  */
  0xe3, /*  */
  0xe4, /*  */
  0xe5, /*  */
  0xe6, /*  */
  0xe7, /*  */
  0xe8, /*  */
  0xe9, /*  */
  0xea, /*  */
  0xeb, /*  */
  0xec, /*  */
  0xed, /*  */
  0xee, /*  */
  0xef, /*  */
  0xf0, /*  */
  0xf1, /*  */
  0xf2, /*  */
  0xf3, /*  */
  0xf4, /*  */
  0xf5, /*  */
  0xf6, /*  */
  0xf7, /*  */
  0xf8, /*  */
  0xf9, /*  */
  0xfa, /*  */
  0xfb, /*  */
  0xfc, /*  */
  0xfd, /*  */
  0xfe, /*  */
  0xff, /*  */
];

/* DEC Multinational Character Set */
var DEC_Multinational_Character_Set = USASCII.slice(0);

/* DEC Special Graphics Character Set */
var DEC_Special_Graphics_Character_Set = USASCII.slice(0);
DEC_Special_Graphics_Character_Set[0x60] = 0x25c6; // 
DEC_Special_Graphics_Character_Set[0x61] = 0x2592; // 
DEC_Special_Graphics_Character_Set[0x62] = 0x2409; // HT
DEC_Special_Graphics_Character_Set[0x63] = 0x240c; // FF
DEC_Special_Graphics_Character_Set[0x64] = 0x240d; // CR
DEC_Special_Graphics_Character_Set[0x65] = 0x240a; // LF
DEC_Special_Graphics_Character_Set[0x66] = 0xb0; // 
DEC_Special_Graphics_Character_Set[0x67] = 0xb1; // 
DEC_Special_Graphics_Character_Set[0x68] = 0x2424; // NL
DEC_Special_Graphics_Character_Set[0x69] = 0x240b; // VT
DEC_Special_Graphics_Character_Set[0x6a] = 0x2518; // 
DEC_Special_Graphics_Character_Set[0x6b] = 0x2510; // 
DEC_Special_Graphics_Character_Set[0x6c] = 0x250c; // 
DEC_Special_Graphics_Character_Set[0x6d] = 0x2514; // 
DEC_Special_Graphics_Character_Set[0x6e] = 0x253c; // 
DEC_Special_Graphics_Character_Set[0x6f] = 0x23ba; // 
DEC_Special_Graphics_Character_Set[0x70] = 0x23bb; // 
DEC_Special_Graphics_Character_Set[0x71] = 0x2500; // 
DEC_Special_Graphics_Character_Set[0x72] = 0x23bc; // 
DEC_Special_Graphics_Character_Set[0x73] = 0x23bd; // 
DEC_Special_Graphics_Character_Set[0x74] = 0x251c; // 
DEC_Special_Graphics_Character_Set[0x75] = 0x2524; // 
DEC_Special_Graphics_Character_Set[0x76] = 0x2534; // 
DEC_Special_Graphics_Character_Set[0x77] = 0x252c; // 
DEC_Special_Graphics_Character_Set[0x78] = 0x2502; // 
DEC_Special_Graphics_Character_Set[0x79] = 0x2264; // 
DEC_Special_Graphics_Character_Set[0x7a] = 0x2265; // 
DEC_Special_Graphics_Character_Set[0x7b] = 0x03c0; // 
DEC_Special_Graphics_Character_Set[0x7c] = 0x2260; // 
DEC_Special_Graphics_Character_Set[0x7d] = 0xa3; // 
DEC_Special_Graphics_Character_Set[0x7e] = 0xb7; // 

/* DEC British NRC Set 
 * DSCS = B
 */
var DEC_British_NRC_Set = USASCII.slice(0);
DEC_British_NRC_Set[0x23] = 0xa3; // pond

/* DEC Dutch NRC Set 
 * DSCS = 4
 */
var DEC_Dutch_NRC_Set = USASCII.slice(0);
DEC_Dutch_NRC_Set[0x23] = 0xa3; // pond
DEC_Dutch_NRC_Set[0x40] = 0xbe; // 3/4
DEC_Dutch_NRC_Set[0x5b] = 0xff; // ij
DEC_Dutch_NRC_Set[0x5c] = 0xbd; // 1/2
DEC_Dutch_NRC_Set[0x5d] = 0x7c; // |
DEC_Dutch_NRC_Set[0x7b] = 0xa8; // 
DEC_Dutch_NRC_Set[0x7c] = 0x66; // 0x0192; // 
DEC_Dutch_NRC_Set[0x7d] = 0xbc; // 
DEC_Dutch_NRC_Set[0x7e] = 0xb4; // 

/* DEC Finnish NRC Set 
 * DSCS = 5, C
 */
var DEC_Finnish_NRC_Set = USASCII.slice(0);
DEC_Finnish_NRC_Set[0x5b] = 0xc4; // 
DEC_Finnish_NRC_Set[0x5c] = 0xd6; // 
DEC_Finnish_NRC_Set[0x5d] = 0xc5; // 
DEC_Finnish_NRC_Set[0x5e] = 0xdc; // 
DEC_Finnish_NRC_Set[0x60] = 0xe9; // 
DEC_Finnish_NRC_Set[0x7b] = 0xe4; // 
DEC_Finnish_NRC_Set[0x7c] = 0xf6; // 
DEC_Finnish_NRC_Set[0x7d] = 0xe5; // 
DEC_Finnish_NRC_Set[0x7e] = 0xfc; // 

/* DEC French NRC Set 
 * DSCS = R
 */
var DEC_French_NRC_Set = USASCII.slice(0);
DEC_French_NRC_Set[0x23] = 0xa3; // 
DEC_French_NRC_Set[0x40] = 0xe0; // 
DEC_French_NRC_Set[0x5b] = 0xb0; // 
DEC_French_NRC_Set[0x5c] = 0xe7; // 
DEC_French_NRC_Set[0x5d] = 0xa7; // 
DEC_French_NRC_Set[0x7b] = 0xe9; // 
DEC_French_NRC_Set[0x7c] = 0xf9; // 
DEC_French_NRC_Set[0x7d] = 0xe8; // 
DEC_French_NRC_Set[0x7e] = 0xa8; // 

/* DEC French Canadian NRC Set 
 * DSCS = Q
 */
var DEC_French_Canadian_NRC_Set = USASCII.slice(0);
DEC_French_Canadian_NRC_Set[0x40] = 0xe0; // 
DEC_French_Canadian_NRC_Set[0x5b] = 0xe2; // 
DEC_French_Canadian_NRC_Set[0x5c] = 0xe7; // 
DEC_French_Canadian_NRC_Set[0x5d] = 0xea; // 
DEC_French_Canadian_NRC_Set[0x5e] = 0xee; // 
DEC_French_Canadian_NRC_Set[0x60] = 0xf4; // 
DEC_French_Canadian_NRC_Set[0x7b] = 0xe9; // 
DEC_French_Canadian_NRC_Set[0x7c] = 0xf9; // 
DEC_French_Canadian_NRC_Set[0x7d] = 0xe8; // 
DEC_French_Canadian_NRC_Set[0x7e] = 0xfb; // 

/* DEC German NRC Set 
 * DSCS = K
 */
var DEC_German_NRC_Set = USASCII.slice(0);
DEC_German_NRC_Set[0x40] = 0xa7; // 
DEC_German_NRC_Set[0x5b] = 0xc4; // 
DEC_German_NRC_Set[0x5c] = 0xd6; // 
DEC_German_NRC_Set[0x5d] = 0xdc; // 
DEC_German_NRC_Set[0x7b] = 0xe4; // 
DEC_German_NRC_Set[0x7c] = 0xf6; // 
DEC_German_NRC_Set[0x7d] = 0xfc; // 
DEC_German_NRC_Set[0x7e] = 0xdf; // 

/* DEC Italian German NRC Set 
 * DSCS = Y
 */
var DEC_Italian_NRC_Set = USASCII.slice(0);
DEC_Italian_NRC_Set[0x23] = 0xa3; // 
DEC_Italian_NRC_Set[0x40] = 0xa7; // 
DEC_Italian_NRC_Set[0x5b] = 0xb0; // 
DEC_Italian_NRC_Set[0x5c] = 0xe7; // 
DEC_Italian_NRC_Set[0x5d] = 0xe9; // 
DEC_Italian_NRC_Set[0x60] = 0xf9; // 
DEC_Italian_NRC_Set[0x7b] = 0xe0; // 
DEC_Italian_NRC_Set[0x7c] = 0xf2; // 
DEC_Italian_NRC_Set[0x7d] = 0xe8; // 
DEC_Italian_NRC_Set[0x7e] = 0xec; // 

/* DEC Norwegian/Danish NRC Set 
 * DSCS = E, 6
 */
var DEC_Norwegian_Danish_NRC_Set = USASCII.slice(0);
DEC_Norwegian_Danish_NRC_Set[0x40] = 0xc4; // 
DEC_Norwegian_Danish_NRC_Set[0x5b] = 0xc6; // 
DEC_Norwegian_Danish_NRC_Set[0x5c] = 0xd8; // 
DEC_Norwegian_Danish_NRC_Set[0x5d] = 0xc5; // 
DEC_Norwegian_Danish_NRC_Set[0x5e] = 0xdc; // 
DEC_Norwegian_Danish_NRC_Set[0x60] = 0xe4; // 
DEC_Norwegian_Danish_NRC_Set[0x7b] = 0xe6; // 
DEC_Norwegian_Danish_NRC_Set[0x7c] = 0xf8; // 
DEC_Norwegian_Danish_NRC_Set[0x7d] = 0xe5; // 
DEC_Norwegian_Danish_NRC_Set[0x7e] = 0xfc; // 

/* DEC Spanish NRC Set 
 * DSCS = Z
 */
var DEC_Spanish_NRC_Set = USASCII.slice(0);
DEC_Spanish_NRC_Set[0x23] = 0xa3; // 
DEC_Spanish_NRC_Set[0x40] = 0xa7; // 
DEC_Spanish_NRC_Set[0x5b] = 0xa1; // 
DEC_Spanish_NRC_Set[0x5c] = 0xd1; // 
DEC_Spanish_NRC_Set[0x5d] = 0xbf; // 
DEC_Spanish_NRC_Set[0x7b] = 0xb0; // 
DEC_Spanish_NRC_Set[0x7c] = 0xf1; // 
DEC_Spanish_NRC_Set[0x7d] = 0xe7; // 

/* DEC Swedish NRC Set 
 * DSCS = H, 7
 */
var DEC_Swedish_NRC_Set = USASCII.slice(0);
DEC_Swedish_NRC_Set[0x40] = 0xc9; // 
DEC_Swedish_NRC_Set[0x5b] = 0xc4; // 
DEC_Swedish_NRC_Set[0x5c] = 0xd6; // 
DEC_Swedish_NRC_Set[0x5d] = 0xc5; // 
DEC_Swedish_NRC_Set[0x5e] = 0xdc; // 
DEC_Swedish_NRC_Set[0x60] = 0xe9; // 
DEC_Swedish_NRC_Set[0x7b] = 0xe4; // 
DEC_Swedish_NRC_Set[0x7c] = 0xf6; // 
DEC_Swedish_NRC_Set[0x7d] = 0xe5; // 
DEC_Swedish_NRC_Set[0x7e] = 0xfc; // 

/* DEC Swiss NRC Set 
 * DSCS = =
 */
var DEC_Swiss_NRC_Set = USASCII.slice(0);
DEC_Swiss_NRC_Set[0x23] = 0xf9; // 
DEC_Swiss_NRC_Set[0x40] = 0xe0; // 
DEC_Swiss_NRC_Set[0x5b] = 0xe9; // 
DEC_Swiss_NRC_Set[0x5c] = 0xe7; // 
DEC_Swiss_NRC_Set[0x5d] = 0xea; // 
DEC_Swiss_NRC_Set[0x5e] = 0xee; // 
DEC_Swiss_NRC_Set[0x5f] = 0xe8; // 
DEC_Swiss_NRC_Set[0x60] = 0xf4; // 
DEC_Swiss_NRC_Set[0x7b] = 0xe4; // 
DEC_Swiss_NRC_Set[0x7c] = 0xf6; // 
DEC_Swiss_NRC_Set[0x7d] = 0xfc; // 
DEC_Swiss_NRC_Set[0x7e] = 0xfb; // 


/**
 * @class NRCSConverter
 *
 */
var NRCSConverter = new Class().extends(Plugin);
NRCSConverter.definition = {

  id: "drcs_converter",

  getInfo: function getInfo()
  {
    return {
      name: _("NRCS Converter"),
      version: "0.1",
      description: _("Provides NRCS support.")
    };
  },

  "[persistable] enabled_when_startup": true,

  _gl: 0,
  _gr: 0,
  _next: 0,

  _charset_table: {
    "0": DEC_Special_Graphics_Character_Set,
    "4": DEC_Dutch_NRC_Set,
    "5": DEC_Finnish_NRC_Set,
    "6": DEC_Norwegian_Danish_NRC_Set,
    "7": DEC_Swedish_NRC_Set,
    "B": USASCII,
    "C": DEC_Finnish_NRC_Set,
    "E": DEC_Norwegian_Danish_NRC_Set,
    "H": DEC_Swedish_NRC_Set,
    "K": DEC_German_NRC_Set,
    "R": DEC_French_NRC_Set,
    "Q": DEC_French_Canadian_NRC_Set,
    "Y": DEC_Italian_NRC_Set,
    "Z": DEC_Spanish_NRC_Set,
    "=": DEC_Swiss_NRC_Set,
  },

  /** Installs itself. 
   *  @param {Broker} broker A Broker object.
   */
  "[install]": 
  function install(broker) 
  {
    this._g = [];
  },

  /** Uninstalls itself. 
   *  @param {Broker} broker A Broker object.
   */
  "[uninstall]": 
  function uninstall(broker) 
  {
    this._g = null;
    this._gl = 0;
    this._gr = 0;
    this._next = 0;
  },

  "[subscribe('event/shift-in'), enabled]": 
  function shiftIn() 
  {
    this._gl = 0;
  },

  "[subscribe('event/shift-out'), enabled]": 
  function shiftOut() 
  {
    this._gl = 1;
  },

  "[subscribe('sequence/ss2'), enabled]": 
  function ss2() 
  {
    this._next = 2;
  },

  "[subscribe('sequence/ss3'), enabled]": 
  function ss3() 
  {
    this._next = 3;
  },

  "[subscribe('sequence/g0'), enabled]": 
  function scsg0(dscs) 
  {
    //coUtils.Debug.reportMessage("g0 = " + dscs);
    var new_charset = this._charset_table[dscs];

    if (undefined !== new_charset) {
      this._g[0] = new_charset;
    }
  },

  "[subscribe('sequence/g1'), enabled]": 
  function scsg1(dscs) 
  {
    //coUtils.Debug.reportMessage("g1 = " + dscs);
    var new_charset = this._charset_table[dscs];

    if (undefined !== new_charset) {
      this._g[1] = new_charset;
    }
  },

  "[subscribe('sequence/g2'), enabled]": 
  function scsg2(dscs) 
  {
    //coUtils.Debug.reportMessage("g2 = " + dscs);
    var new_charset = this._charset_table[dscs];

    if (undefined !== new_charset) {
      this._g[2] = new_charset;
    }
  },

  "[subscribe('sequence/g3'), enabled]": 
  function scsg3(dscs) 
  {
    var new_charset = this._charset_table[dscs];

    if (undefined !== new_charset) {
      this._g[3] = new_charset;
    }
  },

  "[subscribe('command/save-cursor'), enabled]": 
  function saveCursor(context) 
  {
    context.g0 = this._g[0];
    context.g1 = this._g[1];
    context.g2 = this._g[2];
    context.g3 = this._g[3];
    context.gl = this._gl;
    context.gr = this._gr;
  },

  "[subscribe('command/restore-cursor'), enabled]": 
  function restoreCursor(context) 
  {
    this._g[0] = context.g0;
    this._g[1] = context.g1;
    this._g[2] = context.g2;
    this._g[3] = context.g3;
    this._gl = context.gl;
    this._gr = context.gr;
  },

  "[subscribe('command/{soft | hard}-terminal-reset'), enabled]":
  function reset(context) 
  {
    this._g[0] = USASCII;
    this._g[1] = ISO_8859_Latin1;
    this._g[2] = ISO_8859_Latin1;
    this._g[3] = ISO_8859_Latin1;
    this._gl = 0;
    this._gr = 1;
  },

  "[subscribe('command/alloc-drcs'), enabled]":
  function allocDRCS(drcs)
  {
    this._charset_table[drcs.dscs] = drcs; 
  },

  convert: function convert(codes) 
  {
    var left = this._g[this._next || this._gl] || USASCII,
        right = this._g[this._gr] || USASCII,
        result,
        i,
        c;

    if (USASCII === left && ISO_8859_Latin1 === right) {
      return codes;
    }

    this._next = 0;

    result = [];

    if (left.dscs) {
      for (i = 0; i < codes.length; ++i ) {
        c = codes[i];
        if (c < 0x80) { // GL
          c = 0x100000 | left.dscs.charCodeAt(left.dscs.length - 1) << 8 | c;
        }
        result.push(c);
      }
    } else {
      for (i = 0; i < codes.length; ++i ) {
        c = codes[i];
        if (c < 0x80) { // GL
          result.push(left[c]);
        } else if (c < 0xff) { // GR
          result.push(right[c]);
        } else {
          result.push(c);
        }
      }
    }

    return result;
  },

}; // NRCS converter

/**
 * @fn main
 * @brief Module entry point.
 * @param {Broker} broker The Broker object.
 */
function main(broker) 
{
  new NRCSConverter(broker);
}

// EOF
