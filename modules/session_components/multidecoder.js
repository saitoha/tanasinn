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

  id: "multidecoder",

  get scheme()
    "multi",

  getInfo: function getInfo()
  {
    return {
      name: _("Multilingal Decoder"),
      version: "0.1",
      description: _("Gecko's decoder bridge.")
    };
  },

  _current_scheme: "UTF-8",
  _converter: null,
  _converter_manager: null,

  /** Constructor
   */
  initialize: function initialize(broker) 
  {
    var decoder_list,
        charset;

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
      if (!/^ISO-2022/.test(charset)) {
        this._registerDecoder(charset);
      }
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

      //// get alias
      //try {
      //  alias = converter_manager.getCharsetAlias(charset);
      //} catch (e) {
      //  // pass
      //}

      // get title
      try {
        title = converter_manager.getCharsetTitle(charset);
      } catch(e) {
        title = charset;
      }

      //// get group
      //try {
      //  group = converter_manager.getCharsetLangGroup(charset);
      //} catch (e) {
      //  group = "other";
      //}

      // register handler
      broker.subscribe(
        "get/decoders",
        function() 
        {
          return {
            charset: charset,
            converter: this,
            title: title,
//            group: group,
//            alias: alias,
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
        this._converter.charset = this._converter.charset;
        return null;
      }
      return function()
      {
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

}; // class MultiDecoder

/**
 * @fn main
 * @brief Module entry point.
 * @param {Broker} broker The Broker object.
 */
function main(broker) 
{
  new MultiDecoder(broker);
}

// EOF
