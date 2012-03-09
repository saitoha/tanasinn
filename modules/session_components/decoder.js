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

let ASCII = [
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

let ISO_8859_Latin1 = [
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
let DEC_Multinational_Character_Set = ASCII.slice(0);

/* DEC Special Graphics Character Set */
let DEC_Special_Graphics_Character_Set = ASCII.slice(0);
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
let DEC_British_NRC_Set = ASCII.slice(0);
DEC_British_NRC_Set[0x23] = 0xa3; // pond

/* DEC Dutch NRC Set 
 * DSCS = 4
 */
let DEC_Dutch_NRC_Set = ASCII.slice(0);
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
let DEC_Finnish_NRC_Set = ASCII.slice(0);
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
let DEC_French_NRC_Set = ASCII.slice(0);
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
let DEC_French_Canadian_NRC_Set = ASCII.slice(0);
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
let DEC_German_NRC_Set = ASCII.slice(0);
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
let DEC_Italian_NRC_Set = ASCII.slice(0);
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
let DEC_Norwegian_Danish_NRC_Set = ASCII.slice(0);
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
let DEC_Spanish_NRC_Set = ASCII.slice(0);
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
let DEC_Swedish_NRC_Set = ASCII.slice(0);
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
//f9,20,e0,20,e9,e7,ea,ee,e8,20,f4,20,e4,f6,fc,fb
let DEC_Swiss_NRC_Set = ASCII.slice(0);
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
 * @class MultiDecoder
 */
let MultiDecoder = new Class().extends(Component);
MultiDecoder.definition = {

  get id()
    "multidecoder",

  get scheme()
    "multi",

  _current_scheme: "UTF-8",
  _converter: null,

  initialize: function initialize(session) 
  {
    this._converter = Components
      .classes["@mozilla.org/intl/scriptableunicodeconverter"]
      .createInstance(Components.interfaces.nsIScriptableUnicodeConverter);
    let converter_manager = Components
      .classes["@mozilla.org/charset-converter-manager;1"]
      .getService(Components.interfaces.nsICharsetConverterManager);
    let decoder_list = converter_manager.getDecoderList();
    while (decoder_list.hasMore()) {
      let charset = decoder_list.getNext();
      try {
        //let decoder = converter_manager.getCharsetTitleRaw(decoder);
        let alias = converter_manager.getCharsetAlias(charset);
        let title;
        try {
          title = converter_manager.getCharsetTitle(charset);
        } catch(e) {
          title = charset;
        }
        let group = converter_manager.getCharsetLangGroup(charset);
        session.subscribe("get/decoders", function() 
        {
          return {
            charset: charset,
            converter: this,
            title: title,
            group: group,
            alias: alias,
          };
        }, this, this.id);
      } catch (e) {
        coUtils.Debug.reportError(e);
      }
    }
  },

  activate: function activate(scheme) 
  {
    this._current_scheme = scheme;
    this._converter.charset = this._current_scheme;
  },

  decode: function decode(scanner) 
  {
    let data = [c for (c in this._generate(scanner)) ];
    if (data.length) {
      let str;
      try {
      //let str0 = String.fromCharCode.apply(String, data);
        str = this._converter.convertFromByteArray(data, data.length); 
      } catch(e) {
        return ["?".charCodeAt(0)];
      }
      return function() {
        for (let [, c] in Iterator(str.split(""))) {
          yield c.charCodeAt(0);
        }
      } ();
      //let str = String.fromCharCode.apply(String, data);
      //return this._converter.ConvertToUnicode(str).split(""); 
    }
    return [];
  },

  _generate: function _generate(scanner) 
  {
    while (!scanner.isEnd) {
      let c = scanner.current();
      if (c < 0x20) {     // controll code
        break;
      } else {
        yield c;
      }
      scanner.moveNext();
    }
  },

};


/**
 *
 * @class AsciiDecoder
 *
 */
let AsciiDecoder = new Class().extends(Component);
AsciiDecoder.definition = {

  get id()
    "ascii_decoder",

  get scheme()
    "ascii",

  "[persistable] displacement": 0x20,

  "[subscribe('get/decoders'), enabled]":
  function getDecoders() 
  {
    return {
      charset: this.scheme,
      converter: this,
      title: this.scheme,
    };
  },

  activate: function activate() 
  {
  },

  decode: function decode(scanner) 
  {
    return this._generate(scanner);
  },

  _generate: function _generate(scanner) 
  {
    while (!scanner.isEnd) {
      let c = scanner.current();
      if (c < 0x20) {     // controll code
        break;
      } else if (c < 0x80) { // ascii range.
        yield c;
      } else {
        yield this._displacement;
      }
      scanner.moveNext();
    }
  },

};

/**
 *
 * @class CP932Decoder
 *
 */
let CP932Decoder = new Class().extends(Component);
CP932Decoder.definition = {

  get id()
    "cp932_decoder",

  get scheme()
    "cp932",

  "[persistable] displacement": 0x20,

  _map: null,
  _offset: 0,

  "[subscribe('get/decoder'), enabled]": 
  function getDecoders() 
  {
    return {
      charset: this.scheme,
      converter: this,
      title: this.scheme,
    };
  },

  activate: function activate() 
  {
    let resource_path = "modules/charset/cp932.txt.js";
    let content = coUtils.IO.readFromFile(resource_path);
    let mapping = JSON.parse(content);
    this._map = mapping.map;    
  },

  "[subscribe('event/shift-out'), enabled]": 
  function shiftOut() 
  {
    this._offset += 0x80;
  },

  "[subscribe('event/shift-in'), enabled]": 
  function shiftIn() 
  {
    if (0 != this._offset) {
      this._offset -= 0x80;
    }
  },

  /** Parse CP-932 character byte sequence and convert it 
   *  to UCS-4 code point sequence. 
   *
   *  @param {Scanner} scanner A scanner object that attached to 
   *                   current input stream.
   *  @return {Array} Converted sequence 
   */
  decode: function decode(scanner) 
  {
    return let (map = this._map) function(scanner)
    {
      while (!scanner.isEnd) {
        let c1 = scanner.current();// + this._offset;
        if (c1 < 0x20) { // control codes.
          break;
        } if (c1 < 0x7f) { // ASCII range.
          yield c1;
        } else if (
          (0x81 <= c1 && c1 <= 0x9f) || 
          (0xe0 <= c1 && c1 <= 0xfc)) { // cp932 first character
          scanner.moveNext();
          let c2 = scanner.current();
          if (
            (0x40 <= c2 && c2 <= 0x7e) || 
            (0x80 <= c2 && c2 <= 0xfc)) { // cp932 second character
            code = (c1 << 8) | (c2);
            yield map[code];
          } else {
            coUtils.Debug.reportWarning(_("Invalid cp932 second character: [%d]."), c2)
            yield this.displacement; // c1
            yield this.displacement; // c2
            break;
          }
        } else {
          break;
        }
        scanner.moveNext();
      };
    } (scanner);
  },
};

/**
 * @class UTF8Decoder
 */
let UTF8Decoder = new Class().extends(Component);
UTF8Decoder.definition = {

  get id()
    "utf8_decoder",

  get scheme()
    "UTF-8-js",

  _offset: 0,

  /** Constructor **/
  "[subscribe('get/decoders'), enabled]":
  function getDecoders(map) 
  {
    return {
      charset: this.scheme,
      converter: this,
      title: "UTF-8 decoder implemented by js",
    };
  },

  "[subscribe('event/shift-out'), enabled]": 
  function shiftOut() 
  {
    this._offset += 0x80;
  },

  "[subscribe('event/shift-in'), enabled]": 
  function shiftIn() 
  {
    if (0 != this._offset) {
      this._offset -= 0x80;
    }
  },

  activate: function activate() 
  {
  },

  /** Parse UTF-8 string sequence and convert it 
   *  to UCS-4 code point sequence. 
   */
  decode: function decode(scanner) 
  {
    //let offset = this._offset;
    return let (self = this) function(scanner) {
      while (!scanner.isEnd) {
        let c = self._getNextCharacter(scanner);// + offset;
        if (c < 0x20 || (0x7f <= c && c < 0xa0) || c == 0xff) {
          break;
        }
        yield c;
        scanner.moveNext();
      };
    } (scanner);
  },

  /** Decode UTF-8 encoded byte sequences 
   *  and Return UCS-4 character set code point. 
   *
   *  @param {Scanner} scanner A scanner object that attached to 
   *                   current input stream.
   *  @return {Array} Converted sequence 
   */
  _getNextCharacter: function _getNextCharacter(scanner) 
  {
    let c = scanner.current()
    if (c < 0x20) {
      return null;
    } else if (c < 0x7f) { // 8bit (ASCII/DEC/ISO)
      return c;
//    } else if (c < 0xa0) { // 8bit (ASCII/DEC/ISO)
//      //coUtils.Debug.reportWarning("Unknown control character detected. "" + c + """);
//      return null;
    } else if (c < 0xe0) {
      // 110xxxxx 10xxxxxx 
      // (0x00000080 - 0x000007ff) // 11bit
      let first = (c & 0x1f) << 6;
      scanner.moveNext();
      let second = scanner.current() & 0x3f;
      return first | second;
    } else if (c < 0xf0) {
      // 1110xxxx 10xxxxxx 10xxxxxx 
      // (0x00000800 - 0x0000ffff) // 16bit (UCS-2)
      let first = (c & 0xf) << 12;
      scanner.moveNext();
      let second = (scanner.current() & 0x3f) << 6;
      scanner.moveNext();
      let third = scanner.current() & 0x3f;
      return first | second | third;
    } else if (c < 0xf8) {
      // 11110xxx 10xxxxxx 10xxxxxx 10xxxxxx 
      // (0x00010000 - 0x001fffff) // 21bit (UCS-4)
      let first = (c & 0x7) << 18;
      scanner.moveNext();
      let second = (scanner.current() & 0x3f) << 12;
      scanner.moveNext();
      let third = (scanner.current() & 0x3f) << 6;
      scanner.moveNext();
      let fourth = scanner.current() & 0x3f;
      return first | second | third | fourth;
    } else {
      /*
      let message = [
        "SequeneScanner.getNextCharacter: ",
        "Unknown charcter detected. ",
        "(Provabliy it\"s unchached Escape sequence.)\n",
        "Code point: ", c, "\n",
        "Character: \"", String.fromCharCode(c), "\" code: ", c
      ].join("");
      coUtils.Debug.reportWarning(message);
      return undefined;
      */
      return null;
    }
  },
}


/**
 * @class Decoder
 *
 */
let Decoder = new Class().extends(Component);
Decoder.definition = {

  get id()
    "decoder",

  _parser: null,
  _decoder_map: null,
  _scheme: "ascii",
  _offset: 0,

  _g0: ASCII,
  _g1: ASCII,
  _charset_table: {
    "0": DEC_Special_Graphics_Character_Set,
    "4": DEC_Dutch_NRC_Set,
    "5": DEC_Finnish_NRC_Set,
    "6": DEC_Norwegian_Danish_NRC_Set,
    "7": DEC_Swedish_NRC_Set,
    "B": ASCII,
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

  "[persistable] initial_scheme": "UTF-8-js",

  /** Gets character encoding scheme */
  get scheme()
    this.initial_scheme,

  /** Sets character encoding scheme */
  set scheme(value) 
  {
    let scheme = value;
    let decoder_info = this._decoder_map[scheme];
    if (!decoder_info) {
      throw coUtils.Debug.Exception(
        _("Invalid character encoding schema specified: '%s'."), value);
    }
    let decoder = decoder_info.converter;
    // Load resources if required.
    decoder.activate(scheme);
    this._decoder = decoder;
    this.initial_scheme = scheme;
    let message = coUtils.Text.format(_("Character encoding changed: [%s]."), scheme);

    let session = this._broker;
    session.notify("command/report-status-message", message); 
  },

  "[subscribe('event/broker-started'), enabled]": 
  function onLoad(session) 
  {
    this._decoder_map = {};
    session.notify("get/decoders").map(function(information)
    {
      this._decoder_map[information.charset] = information; 
    }, this);
    this.scheme = this.initial_scheme;
    session.notify("initialized/decoder", this);
  },

  "[subscribe('change/decoder'), enabled]": 
  function changeDecoder(scheme) 
  {
    this.scheme = scheme;
  },

  "[subscribe('sequence/g0'), enabled]": 
  function scsg0(dscs) 
  {
    this._g0 = this._charset_table[dscs];
  },

  "[subscribe('sequence/g1'), enabled]": 
  function scsg1(dscs) 
  {
    this._g1 = this._charset_table[dscs];
  },

  /** Read input byte-stream sequence at the specified scanner's 
   *  current position, and convert it to an UCS-4 code point sequence.
   *
   *  @param {Scanner} scanner A scanner object that attached to 
   *                   current input stream.
   *  @return {Array} Converted sequence 
   */ 
  decode: function decode(scanner) 
  {
    let decoder = this._decoder;
    let g0 = this._g0 || ASCII;
    let g1 = this._g1 || ISO_8859_Latin1;
    return function() {
      for (let c in decoder.decode(scanner)) {
        if (c < 0x80) {
          yield g0[c];
        } else if (c < 0x100) {
          yield g1[c];
        } else {
          yield c;
        }
      }
    }();
  },

};

/**
 * @fn main
 * @brief Module entry point.
 * @param {Broker} broker The Broker object.
 */
function main(broker) 
{
  new Decoder(broker);
  new MultiDecoder(broker);
  new AsciiDecoder(broker);
  new UTF8Decoder(broker);
  new CP932Decoder(broker);
}



