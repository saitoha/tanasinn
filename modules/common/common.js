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
  let result;
  let app_info = Components
    .classes["@mozilla.org/xre/app-info;1"]
    .getService(Components.interfaces.nsIXULAppInfo);
  if ("Thunderbird" == app_info.name) {
    result = windowMediator
      .getMostRecentWindow("mail:3pane") || window;
  } else {
    result = windowMediator
      .getMostRecentWindow("navigator:browser") || window;
  }
  // cache result
  return (coUtils.getWindow = function() {
    return result;
  })();
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

/** I/O Functions. */
coUtils.IO = {

  /** Get all text from the file specified by given URI string.
   *  @param {String} location A URI string of target file.
   *  @param {String} charset Target file's encoding.
   */
  readFromFile: function readFromFile(location, charset) 
  {
    let url;
    if (location.match(/^[a-z]+:\/\//)) {
      url = location;
    } else {
      let file = coUtils.File.getFileLeafFromAbstractPath(location);
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
    }
  },

  /** Writes text data asynchronously to the file that specified as argument. 
   *  @param {String} path Target file path.
   *  @param {String} data The contents written to target file.
   *  @param {Function} callback.
   */
  writeToFile: function writeToFile(path, data, callback) 
  {
    let file = coUtils.File.getFileLeafFromAbstractPath(path);
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

  saveCanvas: function saveCanvas(source_canvas, file) 
  {
    const NS_XHTML = "http://www.w3.org/1999/xhtml";
    let canvas = source_canvas.ownerDocument.createElementNS(NS_XHTML, "canvas");
    canvas.style.background = "black";
    canvas.width = 120;
    canvas.height = 80;
  
    let context = canvas.getContext("2d");
    context.fillStyle = "rgba(0, 0, 0, 0.7)";
    context.fillRect(0, 0, 120, 80);
    context.drawImage(source_canvas, 0, 0, 120, 80);
  
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
  },

};

coUtils.File = new function() {

  this.__proto__ = {

  exists: function exists(path)
  {
    let file = this.getFileLeafFromAbstractPath(path);
    return file.exists();
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
        let message = [
          "Given script file is not a File. ",
          "location: \"", location, "\"."
        ].join("");
        throw Components.Exception(message);
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
          let target_leaf = self.getFileLeafFromAbstractPath(path);
          if (!target_leaf || !target_leaf.exists()) {
            coUtils.Debug.reportWarning(
              _("Cannot get file entries from '%s'. ",
                "It seems that specified path does not exist."), path);
            return;
          }
          if (target_leaf.isFile()) {
            yield target_leaf;
          } else {
            let entries = self.getFilesRecursively(target_leaf, /\.js$/);
            for (let entry in entries) {
              yield entry;
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

  getFileLeafFromAbstractPath: 
  function getFileLeafFromAbstractPath(abstract_path) 
  {
    let target_leaf;
    let split_path = abstract_path.split(/[\/\\]/);
    let root_entry = split_path.shift();
    let match = root_entry.match(/^\$([^/]+)$/);
    if (match) {
      target_leaf = this.getSpecialDirectoryName(match.pop());
    } else if (abstract_path.match(/^([\/~\\]|[A-Za-z]:)/)) { // absolute path
      target_leaf = Components
        .classes["@mozilla.org/file/local;1"]
        .createInstance(Components.interfaces.nsILocalFile);
      target_leaf.initWithPath(abstract_path);
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

coUtils.Keyboard = {

  KEY_CTRL   : 21,
  KEY_ALT    : 22,
  KEY_SHIFT  : 23,
  KEY_NOCHAR : 24,
  KEY_META   : 25,
  KEY_APP    : 26,

  KEYNAME_PACKEDCODE_MAP: let (KEY_NOCHAR = 24) {
    space     : 0x0020,
    bs        : 0x1 << KEY_NOCHAR | 0x0008, 
    backspace : 0x1 << KEY_NOCHAR | 0x0008, 
    tab       : 0x1 << KEY_NOCHAR | 0x0009, 
    enter     : 0x1 << KEY_NOCHAR | 0x000d,
    cr        : 0x1 << KEY_NOCHAR | 0x000d,
    lf        : 0x1 << KEY_NOCHAR | 0x000a,
    pgup      : 0x1 << KEY_NOCHAR | 0x0021,
    pgdn      : 0x1 << KEY_NOCHAR | 0x0022,
    end       : 0x1 << KEY_NOCHAR | 0x0023,
    home      : 0x1 << KEY_NOCHAR | 0x0024,
    left      : 0x1 << KEY_NOCHAR | 0x0025,
    up        : 0x1 << KEY_NOCHAR | 0x0026,
    right     : 0x1 << KEY_NOCHAR | 0x0027,
    down      : 0x1 << KEY_NOCHAR | 0x0028,
    ins       : 0x1 << KEY_NOCHAR | 0x002d,
    del       : 0x1 << KEY_NOCHAR | 0x002e,
    f1        : 0x1 << KEY_NOCHAR | 0x0070,
    f2        : 0x1 << KEY_NOCHAR | 0x0071,
    f3        : 0x1 << KEY_NOCHAR | 0x0072,
    f4        : 0x1 << KEY_NOCHAR | 0x0073,
    f5        : 0x1 << KEY_NOCHAR | 0x0074,
    f6        : 0x1 << KEY_NOCHAR | 0x0075,
    f7        : 0x1 << KEY_NOCHAR | 0x0076,
    f8        : 0x1 << KEY_NOCHAR | 0x0077,
    f9        : 0x1 << KEY_NOCHAR | 0x0078,
    f10       : 0x1 << KEY_NOCHAR | 0x0079,
    f11       : 0x1 << KEY_NOCHAR | 0x007a,
    f12       : 0x1 << KEY_NOCHAR | 0x007b,
  },

  /**
   * @fn parseExpression
   * Convert from a key map expression to a packed key code.
   */
};

coUtils.Keyboard.getPackedKeycodeFromEvent 
  = function getPackedKeycodeFromEvent(event) 
  {
    let code = event.keyCode || event.which;
    if (event.shiftKey && (event.ctrlKey || event.altKey || event.metaKey)) {
      if (/* A */ 65 <= code && code <= 90 /* Z */) {
        code += 32;
      }
    }
    let packed_code = code 
      | !!event.ctrlKey   << coUtils.Keyboard.KEY_CTRL 
      | (!!event.altKey || code > 0xff) << coUtils.Keyboard.KEY_ALT 
      | !!event.shiftKey  << coUtils.Keyboard.KEY_SHIFT 
      | !!event.keyCode   << coUtils.Keyboard.KEY_NOCHAR
      | !!event.metaKey   << coUtils.Keyboard.KEY_META
      ;
    return packed_code;
  };

  /**
   * @fn parseKeymapExpression
   * Convert from a key map expression to a packed key code.
   */
coUtils.Keyboard.parseKeymapExpression = function parseKeymapExpression(expression) 
{
  let pattern = /<.+?>|./g;
  let match = expression.match(pattern);
  let strokes = match;
  let key_code_array = strokes.map(function(stroke) {
    let tokens = null;
    if (1 < stroke.length) {
      stroke = stroke.slice(1, -1); // <...> -> ...
      tokens = stroke
        .match(/\\\-|[^-]+/g)
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
//      if (/^[A-Z]+$/.test(last_key) 
//          && tokens.some(function(token) /^S$/i.test(token))) {
//        key_code = last_key.toLowerCase().charCodeAt(0);
//      } else if ("[" == last_key 
//          && tokens.some(function(token) /^C$/i.test(token))) {  
//        key_code = 27;
//      } else if ("]" == last_key 
//          && tokens.some(function(token) /^C$/i.test(token))) {  
//        key_code = 29;
//      } else if ("-" == last_key 
//          && tokens.some(function(token) /^C$/i.test(token))) {  
//        key_code = 31;
//      } else {
        key_code = last_key.charCodeAt(0);
//      }
    }
 
    tokens.forEach(function(sequence) 
    {
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
    }, this);
    return key_code;
      
  }, this); 
  return key_code_array;
};

coUtils.Unicode = {

  /**
   * @fn doubleWidthTest
   * @brief Test if given unicode character is categorized as 
   *        "East Asian Width Character".
   * @return true if given character code point is categorized in 
   *         F(FullWidth) or W(Wide).
   */
  doubleWidthTest: function(code) 
  { // TODO: See EastAsianWidth.txt
    let c = String.fromCharCode(code);
    return coUCS2EastAsianWidthTest(c);
  },

  getUTF8ByteStreamGenerator: function(str) 
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

coUtils.Font = {

  /**
   * @fn getAverageGryphWidth
   * @brief Test font rendering and calculate average gryph width.
   */
  getAverageGryphWidth: function getAverageGryphWidth(font_size, font_family, test_string)
  {
    const NS_XHTML = "http://www.w3.org/1999/xhtml";
    let canvas = coUtils.getWindow()
      .document
      .createElementNS(NS_XHTML , "html:canvas");
    let context = canvas.getContext("2d");
    let unit = test_string || "Mbc123-XYM";
    let repeat_generator = function(n) { while(n--) yield; } (10);
    let text = [ unit for (_ in repeat_generator) ].join("");
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
    return [char_width, last - first, first];
  }

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
      .getFileLeafFromAbstractPath(this.log_file_path)
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
  setTimeout: function setTimeout(timerProc, interval, context) 
  {
    let timer = Components
      .classes["@mozilla.org/timer;1"]
      .createInstance(Components.interfaces.nsITimer);
    let aType = Components.interfaces.nsITimer.TYPE_ONE_SHOT;
    let timerCallbackFunc = context ? 
      function() timerProc.apply(context, arguments)
    : timerProc;
    let observer = { notify: timerCallbackFunc };
    timer.initWithCallback(observer, interval, aType);
    return timer;
  },

  /**
   * @fn setInterval
   * @brief Set timer callback.
   */
  setInterval: function setInterval(timerProc, interval, context) 
  {
    let timer = Components
      .classes["@mozilla.org/timer;1"]
      .createInstance(Components.interfaces.nsITimer);
    let aType = Components.interfaces.nsITimer.TYPE_REPEATING_SLACK;
    let timerCallbackFunc = context ? 
      function() timerProc.apply(context, arguments)
    : timerProc;
    timer.initWithCallback({ notify: timerCallbackFunc }, interval, aType);
    return timer;
  },

};

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
      file = coUtils.File.getFileLeafFromAbstractPath(location);
      if (!file || !file.exists()) {
        throw coUtils.Debug.Exception(
          _("Cannot get file entries from '%s'. ", 
            "It seems that specified path does not exists."), file.path);
      }
      url = coUtils.File.getURLSpec(file);
    }

    // compare last modified times between cached file and current one.
    coUtils.Debug.reportMessage(_("Loading script '%s'."), file.leafName);

    // avoiding subscript-caching (firefox8's new feature).
    url += "?" + coUtils.File.getLastModifiedTime(file);

    // load
    this.subscript_loader.loadSubScript(url, scope);

  }, // loadScript

};

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
      this.locale = locale_service.getLocaleComponentForUserAgent();
    },

    /** @property locale */
    get locale() 
    {
      return this._locale;
    },

    set locale(value) 
    {
      this._locale = value;
      this.load();
    },

    /** Gets locale-mapping file for current locale. */
    getMessageFileName: function getMessageFileName() 
    {
      let locale = this._locale;
      let file_name = String(<>modules/locale/{locale}.json</>);
      return file_name;
    },

    /** Loads locale-mapping file and apply it. */
    load: function load() 
    {
      let file_name = this.getMessageFileName();
      let file = coUtils.File.getFileLeafFromAbstractPath(file_name);
      let db = null;
      if (file.exists()) {
        let content = coUtils.IO.readFromFile(file_name, "utf-8");
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
            return eval("[" + text.slice(2, -1)/*.replace("\\", "\\\\")*/ + "]").join("");
          })
          for (let [, message] in Iterator(match)) {
            yield message;
          }
        }
      }
    },

    getDictionary: function getLocalizeDictionary(language)
    {
      let location = String(<>modules/locale/{language}.json</>);
      let file = coUtils.File.getFileLeafFromAbstractPath(location);
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
      let location = String(<>modules/locale/{language}.json</>);
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

