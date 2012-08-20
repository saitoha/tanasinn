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
 * @class MultiDecoder
 */
var MultiDecoder = new Class().extends(Plugin);
MultiDecoder.definition = {

  get id()
    "multidecoder",

  get scheme()
    "multi",

  get info()
    <module>
        <name>{_("Multilingal Decoder")}</name>
        <version>0.1</version>
        <description>{
          _("Gecko's decoder bridge.")
        }</description>
    </module>,

  _current_scheme: "UTF-8",
  _converter: null,
  _converter_manager: null,

  /** Constructor
   */
  initialize: function initialize(broker) 
  {
    var decoder_list, charset;

    // get scriptable unicode converter
    this._converter = Components
      .classes["@mozilla.org/intl/scriptableunicodeconverter"]
      .createInstance(Components.interfaces.nsIScriptableUnicodeConverter);

    // get converter manager service
    this._converter_manager = Components
      .classes["@mozilla.org/charset-converter-manager;1"]
      .getService(Components.interfaces.nsICharsetConverterManager);

    // get decoders information
    decoder_list = this._converter_manager.getDecoderList();

    while (decoder_list.hasMore()) {

      // get character set name
      charset = decoder_list.getNext();

      // subscribe "get/decoders" message
      this._registerDecoder(charset);
    }
  },

  _registerDecoder: function _registerDecoder(charset)
  {
    var broker = this._broker,
        converter_manager = this._converter_manager,
        alias,
        title,
        group;

    try {

      // get alias
      alias = converter_manager.getCharsetAlias(charset);

      // get title
      try {
        title = converter_manager.getCharsetTitle(charset);
      } catch(e) {
        title = charset;
      }

      // get group
      group = converter_manager.getCharsetLangGroup(charset);

      // register handler
      broker.subscribe("get/decoders",
        function() 
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
  },

  activate: function activate(scheme) 
  {
    this._current_scheme = scheme;
    this._converter.charset = this._current_scheme;
  },

  decode: function decode(scanner) 
  {
    var data = [c for (c in this._generate(scanner)) ],
        str;

    if (data.length) {
      try {
        str = this._converter.convertFromByteArray(data, data.length); 
      } catch(e) {
        return ["?".charCodeAt(0)];
      }
      return function() {
        var c;

        for ([, c] in Iterator(str.split(""))) {
          yield c.charCodeAt(0);
        }
      } ();
    }
    return [];
  },

  _generate: function _generate(scanner) 
  {
    var c;

    while (!scanner.isEnd) {
      c = scanner.current();
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
var AsciiDecoder = new Class().extends(Plugin);
AsciiDecoder.definition = {

  get id()
    "ascii_decoder",

  get scheme()
    "ascii",

  get info()
    <module>
        <name>{_("ASCII Decoder")}</name>
        <version>0.1</version>
        <description>{
          _("Decoder for ISO 646-US(ASCII).")
        }</description>
    </module>,

  "[persistable] enabled_when_startup": true,
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
    var c;

    while (!scanner.isEnd) {
      c = scanner.current();
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
var CP932Decoder = new Class().extends(Plugin);
CP932Decoder.definition = {

  get id()
    "cp932_decoder",

  get scheme()
    "cp932",

  get info()
    <module>
        <name>{_("CP-932 Decoder")}</name>
        <version>0.1</version>
        <description>{
          _("Decoder module for CP-932 character set.")
        }</description>
    </module>,


  "[persistable] displacement": 0x20,

  _map: null,
  _offset: 0,

  "[subscribe('get/decoders'), enabled]": 
  function getDecoders() 
  {
    return {
      charset: this.scheme,
      converter: this,
      title: "Shift-JIS decoder implemented in js",
    };
  },

  activate: function activate() 
  {
    var resource_path = "modules/mappings/cp932.txt.js",
        json_content = coUtils.IO.readFromFile(resource_path),
        mapping = eval(json_content);

    this._map = mapping.map;    
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
    var map = this._map;

    return function(scanner)
    {
      var c1, c2;
      while (!scanner.isEnd) {
        c1 = scanner.current();// + this._offset;
        if (c1 < 0x20) { // control codes.
          break;
        } if (c1 < 0x7f) { // ASCII range.
          yield c1;
        } else if (
          (0x81 <= c1 && c1 <= 0x9f) || 
          (0xe0 <= c1 && c1 <= 0xfc)) { // cp932 first character
          scanner.moveNext();
          c2 = scanner.current();
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
 *
 * @class EUCJPDecoder
 *
 */
var EUCJPDecoder = new Class().extends(Plugin);
EUCJPDecoder.prototype = {

  get id()
    "eucjp_decoder",

  get scheme()
    "EUC-JP-js",

  get info()
    <module>
        <name>{_("EUC-JP Decoder")}</name>
        <version>0.1</version>
        <description>{
          _("Decoder module for EUC-JP character set.")
        }</description>
    </module>,

  "[persistable] displacement": 0x20,

  _map: null,

  "[subscribe('get/decoders'), enabled]": 
  function getDecoders() 
  {
    return {
      charset: this.scheme,
      converter: this,
      title: "EUC-JP decoder implemented in js",
    };
  },

  activate: function activate() 
  {
    var resource_path_jis0208 = "modules/mappings/jis0208.txt.js",
        json_content_jis0208 = coUtils.IO.readFromFile(resource_path_jis0208),
        mapping_jis0208 = eval(json_content_jis0208),
        resource_path_jis0201 = "modules/mappings/jis0201.txt.js",
        json_content_jis0201 = coUtils.IO.readFromFile(resource_path_jis0201),
        mapping_jis0201 = eval(json_content_jis0201),
        resource_path_jis0212 = "modules/mappings/jis0212.txt.js",
        json_content_jis0212 = coUtils.IO.readFromFile(resource_path_jis0212),
        mapping_jis0212 = eval(json_content_jis0212);

    this._jis0201_map = mapping_jis0201.map;    
    this._jis0208_map = mapping_jis0208.map;    
    this._jis0212_map = mapping_jis0212.map;    
  },

  /** Parse EUC-JP character byte sequence and convert it 
   *  to UCS-4 code point sequence. 
   *
   *  @param {Scanner} scanner A scanner object that attached to 
   *                   current input stream.
   *  @return {Array} Converted sequence 
   */
  decode: function decode(scanner) 
  {
    var jis0201_map = this._jis0201_map,
        jis0208_map = this._jis0208_map,
        jis0212_map = this._jis0212_map;

    return function(scanner)
    {
      var c1, c2;

      while (!scanner.isEnd) {
        c1 = scanner.current();
        if (c1 < 0x20) { // control codes.
          break;
        } if (c1 < 0x7f) { // ASCII range.
          yield c1;
        } else if (0x8e === c1) {
          scanner.moveNext();
          c2 = scanner.current();
          code = c2;
          yield jis0201_map[code];
        } else if (0x8f === c1) {
          scanner.moveNext();
          c1 = scanner.current();
          scanner.moveNext();
          c2 = scanner.current();
          code = ((c1 - 0x80) << 8) | (c2 - 0x80);
          yield jis0212_map[code];
        } else if (c1 <= 0xff)  {
          scanner.moveNext();
          c2 = scanner.current();
          if (0x80 <= c2 && c2 <= 0xff) {
            code = ((c1 - 0x80) << 8) | (c2 - 0x80);
            yield jis0208_map[code];
          } else {
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
var UTF8Decoder = new Class().extends(Component);
UTF8Decoder.definition = {

  get id()
    "utf8_decoder",

  get scheme()
    "UTF8-js",

  get info()
    <module>
        <name>{_("UTF-8 Decoder")}</name>
        <version>0.1</version>
        <description>{
          _("Decoder module for UTF-8 character set.")
        }</description>
    </module>,

  _offset: 0,

  /** Constructor **/
  "[subscribe('get/decoders'), enabled]":
  function getDecoders() 
  {
    return {
      charset: this.scheme,
      converter: this,
      title: "UTF-8 decoder implemented in js",
    };
  },

  activate: function activate() 
  {
  },

  /** Parse UTF-8 string sequence and convert it 
   *  to UCS-4 code point sequence. 
   */
  decode: function decode(scanner) 
  {
    var self = this;

    return function(scanner)
    {
      var c;

      while (!scanner.isEnd) {
        c = self._getNextCharacter(scanner);// + offset;
        if (c < 0x20 || (0x7f <= c && c < 0xa0)) {
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
    var c = scanner.current(),
        first,
        second,
        third,
        fourth;

    if (c < 0x20 || (0x7f <= c && c < 0xa0)) {
      return null;
    } else if (c < 0x7f) { // 8bit (ASCII/DEC/ISO)
      return c;
    } else if (c < 0xe0) {
      // 110xxxxx 10xxxxxx 
      // (0x00000080 - 0x000007ff) // 11bit
      first = (c & 0x1f) << 6;
      scanner.moveNext();
      second = scanner.current() & 0x3f;
      return first | second;
    } else if (c < 0xf0) {
      // 1110xxxx 10xxxxxx 10xxxxxx 
      // (0x00000800 - 0x0000ffff) // 16bit (UCS-2)
      first = (c & 0xf) << 12;
      scanner.moveNext();
      second = (scanner.current() & 0x3f) << 6;
      scanner.moveNext();
      third = scanner.current() & 0x3f;
      return first | second | third;
    } else if (c < 0xf8) {
      // 11110xxx 10xxxxxx 10xxxxxx 10xxxxxx 
      // (0x00010000 - 0x001fffff) // 21bit (UCS-4)
      first = (c & 0x7) << 18;
      scanner.moveNext();
      second = (scanner.current() & 0x3f) << 12;
      scanner.moveNext();
      third = (scanner.current() & 0x3f) << 6;
      scanner.moveNext();
      fourth = scanner.current() & 0x3f;
      return first | second | third | fourth;
    }
    return null;
  },
};


/**
 * @class UTF8_CP932Decoder
 */
var UTF8_CP932Decoder = new Class().extends(Component);
UTF8_CP932Decoder.definition = {

  get id()
    "utf8_cp932_decoder",

  get scheme()
    "utf8-cp932-js",

  get info()
    <module>
        <name>{_("UTF-8 Decoder")}</name>
        <version>0.1</version>
        <description>{
          _("Parallel decoder module for UTF-8/CP 932 character sets.")
        }</description>
    </module>,

  _cp932_map: null,
  _offset: 0,

  /** Constructor **/
  "[subscribe('get/decoders'), enabled]":
  function getDecoders(map) 
  {
    return {
      charset: this.scheme,
      converter: this,
      title: "UTF-8/Shift-JIS parallel decoder implemented in js",
    };
  },

  activate: function activate() 
  {
    var resource_path_cp932 = "modules/mappings/cp932.txt.js",
        json_content_cp932 = coUtils.IO.readFromFile(resource_path_cp932),
        mapping_cp932 = eval(json_content_cp932);

    this._cp932_map = mapping_cp932.map;    
  },

  /** Parse UTF-8 string sequence and convert it 
   *  to UCS-4 code point sequence. 
   */
  decode: function decode(scanner) 
  {
    var self = this;

    return function(scanner)
    {
      var c;

      while (!scanner.isEnd) {
        c = self._getNextCharacter(scanner);// + offset;
        if (c < 0x20 || 0x7f === c) {
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
    var c = scanner.current(),
        c2,
        first,
        second,
        third,
        fourth;

    if (c < 0x20 || 0x7f === c) {
      return null;
    } else if (c < 0x7f) { // 8bit (ASCII/DEC/ISO)
      return c;
    } else if (c < 0xe0) {
      scanner.moveNext();
      c2 = scanner.current();
      if (0x81 <= c && c <= 0x9f) { // cp932 first character
        if ((0x40 <= c2 && c2 <= 0x7e) || (0x80 <= c2 && c2 <= 0xfc)) { // cp932 second character
          code = (c << 8) | (c2);
          return this._cp932_map[code];
        }
        if (c < 0xa0) {
          return null;
        }
      } 
      // 110xxxxx 10xxxxxx 
      // (0x00000080 - 0x000007ff) // 11bit
      first = (c & 0x1f) << 6;
      second = c2 & 0x3f;
      return first | second;
    } else if (c < 0xf0) {
      scanner.moveNext();
      c2 = scanner.current();
      // 1110xxxx 10xxxxxx 10xxxxxx 
      // (0x00000800 - 0x0000ffff) // 16bit (UCS-2)
      if (0xe === c >>> 4) {
        first = (c & 0xf) << 12;
        if (0x2 === c2 >>> 6) {
          second = (c2 & 0x3f) << 6;
          scanner.moveNext();
          c2 = scanner.current();
          if (0x2 === c2 >>> 6) {
            third = c2 & 0x3f;
            return first | second | third;
          }
        }
      }
      if (0xe0 <= c && c <= 0xfc) { // cp932 first character
        if ((0x40 <= c2 && c2 <= 0x7e) || (0x80 <= c2 && c2 <= 0xfc)) { // cp932 second character
          code = (c << 8) | (c2);
          return this._cp932_map[code];
        }
      }
    } else if (c < 0xf8) {
      // 11110xxx 10xxxxxx 10xxxxxx 10xxxxxx 
      // (0x00010000 - 0x001fffff) // 21bit (UCS-4)
      first = (c & 0x7) << 18;
      scanner.moveNext();
      second = (scanner.current() & 0x3f) << 12;
      scanner.moveNext();
      third = (scanner.current() & 0x3f) << 6;
      scanner.moveNext();
      fourth = scanner.current() & 0x3f;
      return first | second | third | fourth;
    } else {
      return null;
    }
  },
}

var ST_UTF8 = 0,
    ST_CP932 = 1,
    ST_EUCJP = 2;

/**
 * @class JapaneseDecoder
 */
var JapaneseDecoder = new Class().extends(Component);
JapaneseDecoder.definition = {

  get id()
    "japanese_decoder",

  get scheme()
    "japanese-js",

  get info()
    <module>
        <name>{_("Japanese Decoder")}</name>
        <version>0.1</version>
        <description>{
          _("Parallel decoder module for Japanese character sets.")
        }</description>
    </module>,

  _cp932_map: null,
  _jis0208_map: null,
  _offset: 0,
  _state: ST_UTF8,

  /** Constructor **/
  "[subscribe('get/decoders'), enabled]":
  function getDecoders(map) 
  {
    return {
      charset: this.scheme,
      converter: this,
      title: "Japanese parallel decoder implemented in js",
    };
  },

  activate: function activate() 
  {
    var resource_path_cp932 = "modules/mappings/cp932.txt.js",
        json_content_cp932 = coUtils.IO.readFromFile(resource_path_cp932),
        mapping_cp932 = eval(json_content_cp932),
        resource_path_jis0208 = "modules/mappings/jis0208.txt.js",
        json_content_jis0208 = coUtils.IO.readFromFile(resource_path_jis0208),
        mapping_jis0208 = eval(json_content_jis0208);

    this._cp932_map = mapping_cp932.map;    
    this._jis0208_map = mapping_jis0208.map;    
  },

  /** Parse UTF-8 string sequence and convert it 
   *  to UCS-4 code point sequence. 
   */
  decode: function decode(scanner) 
  {
    var self = this;

    return function(scanner)
    {
      var c;

      while (!scanner.isEnd) {
        c = self._getNextCharacter(scanner);// + offset;
        if (c < 0x20 || 0x7f === c) {
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
    var c = scanner.current(),
        c2,
        c3,
        c4,
        first,
        second,
        third,
        fourth,
        result;

    if (c < 0x20 || 0x7f === c) {
      return null;
    } else if (c < 0x7f) { // 8bit (ASCII/DEC/ISO)
      return c;
    } else if (c < 0xe0) {
      scanner.moveNext();
      c2 = scanner.current();

      // UTF-8
      // 110xxxxx 10xxxxxx 
      // (0x00000080 - 0x000007ff) // 11bit
      if (0x6 === c >>> 5 && 0x2 === c2 >>> 6) {
        first = (c & 0x1f) << 6;
        second = c2 & 0x3f;
        return first | second;
      }

      // CP-932
      if (0x81 <= c && c <= 0x9f) { // cp932 first character
        if ((0x40 <= c2 && c2 <= 0x7e) || (0x80 <= c2 && c2 <= 0xfc)) { // cp932 second character
          code = c << 8 | c2;
          result = this._cp932_map[code];
          if (result) {
            return result;
          }
        }
      } 

      result = this._jis0208_map[c - 0x80 << 8 | c2 - 0x80];
      if (result) {
        return result;
      }

    } else if (c < 0xf0) {
      scanner.moveNext();
      c2 = scanner.current();

      // UTF-8
      // 1110xxxx 10xxxxxx 10xxxxxx 
      // (0x00000800 - 0x0000ffff) // 16bit (UCS-2)
      if (0xe === c >>> 4 && 0x2 === c2 >>> 6) {
        first = (c & 0xf) << 12;
        second = (c2 & 0x3f) << 6;
        scanner.moveNext();
        c2 = scanner.current();

        if (0x2 === c2 >>> 6) {
          third = c2 & 0x3f;
          return first | second | third;
        }
      }

      // CP-932
      if (0xe0 <= c && c <= 0xfc) { // cp932 first character
        if ((0x40 <= c2 && c2 <= 0x7e) || (0x80 <= c2 && c2 <= 0xfc)) { // cp932 second character
          code = (c << 8) | (c2);
          result = this._cp932_map[code];
          if (result) {
            return result;
          }
        }
      }

      // EUF-JP
      result = this._jis0208_map[c - 0x80 << 8 | c2 - 0x80];
      if (result) {
        return result;
      }

    } else if (c < 0xf8) {
      scanner.moveNext();
      c2 = scanner.current();

      // UTF-8
      // 11110xxx 10xxxxxx 10xxxxxx 10xxxxxx 
      // (0x00010000 - 0x001fffff) // 21bit (UCS-4)
      if (0x1e === c >>> 3 && 0x2 === c >>> 6) {
        first = (c & 0x7) << 18;
        second = (c2 & 0x3f) << 12;

        scanner.setAnchor();

        scanner.moveNext();
        c3 = scanner.current();
        if (0x2 === c3 >>> 6) {
          third = (c3 & 0x3f) << 6;
          scanner.moveNext();
          c4 = scanner.current();
          if (0x2 === c4 >>> 6) {
            fourth = c4 & 0x3f;
            return first | second | third | fourth;
          }
        }

        scanner.rollback();
      }

      // EUC-JP
      result = this._jis0208_map[c - 0x80 << 8 | c2 - 0x80];
      if (result) {
        return result;
      }

    } else {
      scanner.moveNext();
      c2 = scanner.current();

      if (c <= 0xfc) { // cp932 first character
        if ((0x40 <= c2 && c2 <= 0x7e) || (0x80 <= c2 && c2 <= 0xfc)) { // cp932 second character
          code = (c << 8) | (c2);
          result = this._cp932_map[code];
          if (result) {
            return result;
          }
        }
      }

      result = this._jis0208_map[c - 0x80 << 8 | c2 - 0x80];
      if (result) {
        return result;
      }

      return null;
    }
  },
}


/**
 * @class Decoder
 *
 */
var Decoder = new Class().extends(Plugin);
Decoder.definition = {

  get id()
    "decoder",

  get info()
    <module>
        <name>{_("Decoder")}</name>
        <version>0.1</version>
        <description>{
          _("Decode incoming data stream and convert it into internal format.")
        }</description>
    </module>,

  _parser: null,
  _decoder_map: null,
  _scheme: "ascii",
  _offset: 0,

  "[persistable] initial_scheme": "UTF8-js",
  "[persistable] enabled_when_startup": true,

  /** Gets character encoding scheme */
  get scheme()
    this.initial_scheme,

  /** Sets character encoding scheme */
  set scheme(value) 
  {
    var scheme = value,
        decoder_info = this._decoder_map[scheme],
        decoder,
        message;

    if (!decoder_info) {
      throw coUtils.Debug.Exception(
        _("Invalid character encoding schema specified: '%s'."), value);
    }

    decoder = decoder_info.converter;

    // Load resources if required.
    decoder.activate(scheme);

    this._decoder = decoder;

    this.initial_scheme = scheme;

    // print status message
    message = coUtils.Text.format(_("Character encoding changed: [%s]."), scheme);
    this.sendMessage("command/report-status-message", message); 
  },

  "[install]": 
  function install(broker) 
  {
    this._decoder_map = {};
    this.sendMessage("get/decoders").map(
      function mapfunc(information)
      {
        this._decoder_map[information.charset] = information; 
      }, this);

    this.scheme = this.initial_scheme;

    this.sendMessage("initialized/decoder", this);
  },

  "[uninstall]": 
  function uninstall(broker) 
  {
    this._decoder_map = null;
  },

  "[subscribe('change/decoder'), enabled]": 
  function changeDecoder(scheme) 
  {
    this.scheme = scheme;
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
    return this._decoder.decode(scanner);
  },

}; // Decoder

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
  new EUCJPDecoder(broker);
  new UTF8_CP932Decoder(broker);
  new JapaneseDecoder(broker);
}

// EOF
