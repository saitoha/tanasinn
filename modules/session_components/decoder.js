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
    let c = scanner.current()
    if (c < 0x20 || c == 0x7f) {
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

    let broker = this._broker;
    broker.notify("command/report-status-message", message); 
  },

  "[subscribe('event/broker-started'), enabled]": 
  function onLoad(broker) 
  {
    this._decoder_map = {};
    broker.notify("get/decoders").map(function(information)
    {
      this._decoder_map[information.charset] = information; 
    }, this);
    this.scheme = this.initial_scheme;
    broker.notify("initialized/decoder", this);
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
    let input_decoder = this._decoder;
    return input_decoder.decode(scanner);
  },

}; // 

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



