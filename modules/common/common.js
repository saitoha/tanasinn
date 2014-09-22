/* -*- Mode: JAVASCRIPT; tab-width: 2; indent-tabs-mode: nil; c-basic-offset: 2 -*-
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

/** @package common
 * Provides basic utility and services.
 */

var coUtils = coUtils || {};

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
  // Cursor mode
  //
  CURSOR_MODE_NORMAL:         0x0,
  CURSOR_MODE_APPLICATION:    0x1,
  CURSOR_MODE_VT52:           0x2,

  //
  // Input mode
  //
  INPUT_MODE_NORMAL:          0x0,
  INPUT_MODE_COMMANDLINE:     0x1,

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
  // nsIFile
  //
  DIRECTORY_TYPE             : Components.interfaces.nsIFile.DIRECTORY_TYPE,

  //
  // nsIConverterInputStream
  //
  DEFAULT_REPLACEMENT_CHARACTER:
    Components.interfaces.nsIConverterInputStream.DEFAULT_REPLACEMENT_CHARACTER,

  //
  // nsITimer
  //
  TYPE_ONE_SHOT              : Components.interfaces.nsITimer.TYPE_ONE_SHOT,
  TYPE_REPEATING_SLACK       : Components.interfaces.nsITimer.TYPE_REPEATING_SLACK,
};

coUtils.Services = {

  _prompt_service: null,
  _window_mediator: null,
  _clipboard: null,
  _clipboard_helper: null,
  _charset_converter_manager: null,
  _observer_service: null,
  _io_service: null,
  _directory_service: null,
  _app_info: null,
  _script_loader: null,
  _thread_manager: null,
  _console_service: null,
  _uuid_generator: null,
  _locale_service: null,
  _version_comparator: null,
  _socket_transport_service: null,

  getSocketTransportService: function getPromptService()
  {
    if (null === this._socket_transport_service) {
      this._socket_transport_service = Components
          .classes["@mozilla.org/network/socket-transport-service;1"]
          .getService(Components.interfaces.nsISocketTransportService)
    }

    return this._socket_transport_service;
  },

  getPromptService: function getPromptService()
  {
    if (null === this._prompt_service) {
      this._prompt_service = Components
        .classes["@mozilla.org/embedcomp/prompt-service;1"]
        .getService(Components.interfaces.nsIPromptService);
    }

    return this._prompt_service;
  },

  getWindowMediator: function getWindowMediator()
  {
    if (null === this._window_mediator) {
      this._window_mediator = Components
        .classes["@mozilla.org/appshell/window-mediator;1"]
        .getService(Components.interfaces.nsIWindowMediator);
    }

    return this._window_mediator;
  },

  getClipboard: function getClipboard()
  {
    if (null === this._clipboard) {
      this._clipboard = Components
        .classes["@mozilla.org/widget/clipboard;1"]
        .getService(Components.interfaces.nsIClipboard);
    }

    return this._clipboard;
  },

  getClipboardHelper: function getClipboardHelper()
  {
    if (null === this._clipboard_helper) {
      this._clipboard_helper = Components
        .classes["@mozilla.org/widget/clipboardhelper;1"]
        .getService(Components.interfaces.nsIClipboardHelper);
    }

    return this._clipboard_helper;
  },

  getCharsetConverterManager: function getCharsetConverterManager()
  {
    var manager_class;

    if (null === this._charset_converter_manager) {
      manager_class = Components
          .classes["@mozilla.org/charset-converter-manager;1"];
      if (manager_class) {
        this._charset_converter_manager = manager_class
          .getService(Components.interfaces.nsICharsetConverterManager);
      } else {
        this._charset_converter_manager = {
          getDecoderList: function getDecoderList() {
            return { hasMore: function hasMore() { return false; } };
          },
          getEncoderList: function getEncoderList() {
            return { hasMore: function hasMore() { return false; } };
          },
        };
      }
    }

    return this._charset_converter_manager;
  },

  getObserverService: function getObserverService()
  {
    if (null === this._observer_service) {
      this._observer_service = Components
        .classes["@mozilla.org/observer-service;1"]
        .getService(Components.interfaces.nsIObserverService);
    }

    return this._observer_service;
  },

  getIoService: function getIoService()
  {
    if (null === this._io_service) {
      this._io_service = Components
        .classes["@mozilla.org/network/io-service;1"]
        .getService(Components.interfaces.nsIIOService2);
    }

    return this._io_service;
  },

  get directoryService()
  {
    if (null === this._directory_service) {
      this._directory_service = Components
        .classes["@mozilla.org/file/directory_service;1"]
        .getService(Components.interfaces.nsIProperties);
    }

    return this._directory_service;
  },

  getAppInfo: function getAppInfo()
  {
    if (null === this._app_info) {
      this._app_info = Components
        .classes["@mozilla.org/xre/app-info;1"]
        .getService(Components.interfaces.nsIXULAppInfo);
    }

    return this._app_info;
  },

  getScriptLoader: function getScriptLoader()
  {
    if (null === this._script_loader) {
      this._script_loader = Components
        .classes["@mozilla.org/moz/jssubscript-loader;1"]
        .getService(Components.interfaces.mozIJSSubScriptLoader);
    }

    return this._script_loader;
  },

  getThreadManager: function getThreadManager()
  {
    if (null === this._thread_manager) {
      this._thread_manager = Components
        .classes["@mozilla.org/thread-manager;1"]
        .getService();
    }

    return this._thread_manager;
  },

  get consoleService()
  {
    if (null === this._console_service) {
      this._console_service = Components
        .classes["@mozilla.org/consoleservice;1"]
        .getService(Components.interfaces.nsIConsoleService);
    }

    return this._console_service;
  },

  getUUIDGenerator: function getUUIDGenerator()
  {
    if (null === this._uuid_generator) {
      this._uuid_generator = Components
        .classes["@mozilla.org/uuid-generator;1"]
        .getService(Components.interfaces.nsIUUIDGenerator);
    }

    return this._uuid_generator;
  },

  getLocaleService: function getLocaleService()
  {
    if (null === this._locale_service) {
      this._locale_service = Components
        .classes["@mozilla.org/intl/nslocaleservice;1"]
        .getService(Components.interfaces.nsILocaleService);
    }

    return this._locale_service;
  },

  get versionComparator()
  {
    if (null === this._version_comparator) {
      this._version_comparator = Components
        .classes["@mozilla.org/xpcom/version-comparator;1"]
        .getService(Components.interfaces.nsIVersionComparator);
    }

    return this._version_comparator;
  },
};

coUtils.Components = {

  _window_watcher: null,

  getWindowWatcher: function getWindowWatcher()
  {
    if (null === this._window_watcher) {
      this._window_watcher = Components
        .classes["@mozilla.org/embedcomp/window-watcher;1"]
        .getService(Components.interfaces.nsIWindowWatcher);
    }

    return this._window_watcher;
  },

  _alert_service: null,

  getAlertService: function getAlertService()
  {
    if (null === this._alert_service) {
      this._alert_service = Components
        .classes["@mozilla.org/alerts-service;1"]
        .getService(Components.interfaces.nsIAlertsService);
    }

    return this._alert_service;
  },

  _environment: null,

  getEnvironment: function getEnvironment()
  {
    if (null === this._environment) {
      this._environment = Components
        .classes["@mozilla.org/process/environment;1"].
        getService(Components.interfaces.nsIEnvironment);
    }

    return this._environment;
  },

  _sound: null,

  getSound: function getSound()
  {
    if (null === this._sound) {
      this._sound = Components
        .classes["@mozilla.org/sound;1"]
        .getService(Components.interfaces.nsISound);
    }

    return this._sound;
  },

  createLoopbackServerSocket: function createLoopbackServerSocket(listener)
  {
    var socket = Components
        .classes["@mozilla.org/network/server-socket;1"]
        .createInstance(Components.interfaces.nsIServerSocket);

    socket.init(/* port */ -1, /* loop back */ true, /* connection count */ 1);
    socket.asyncListen(listener);

    return socket;
  },

  createScriptableInputStream: function createScriptableInputStream(input_stream)
  {
    var stream = Components
          .classes["@mozilla.org/scriptableinputstream;1"]
          .createInstance(Components.interfaces.nsIScriptableInputStream);

    stream.init(input_stream);

    return stream;
  },

  createBinaryInputStream: function createBinaryInputStream(input_stream)
  {
    var stream = Components
        .classes["@mozilla.org/binaryinputstream;1"]
        .createInstance(Components.interfaces.nsIBinaryInputStream);

    stream.setInputStream(input_stream);

    return stream;
  },

  createStreamPump: function createStreamPump(input_stream, listener)
  {
    var pump = Components
          .classes["@mozilla.org/network/input-stream-pump;1"]
          .createInstance(Components.interfaces.nsIInputStreamPump);

    pump.init(input_stream, -1, -1, 0, 0, false);
    pump.asyncRead(listener, null);

    return pump;
  },

  createLocalFile: function createLocalFile(path)
  {
    var file = Components
      .classes["@mozilla.org/file/local;1"]
      .createInstance(Components.interfaces.nsIFile);

    file.initWithPath(path);

    return file;
  },

  createProcessFromFile: function createProcessFromFile(file)
  {
    var process = Components
      .classes["@mozilla.org/process/util;1"]
      .createInstance(Components.interfaces.nsIProcess);

    process.init(file);

    return process;
  },

  createWebBrowserPersist: function createWebBrowserPersist(file)
  {
    var persist = Components
      .classes["@mozilla.org/embedding/browser/nsWebBrowserPersist;1"]
      .createInstance(Components.interfaces.nsIWebBrowserPersist);

    persist.persistFlags = Components
      .interfaces.nsIWebBrowserPersist
      .PERSIST_FLAGS_REPLACE_EXISTING_FILES;
    persist.persistFlags |= Components
      .interfaces.nsIWebBrowserPersist
      .PERSIST_FLAGS_AUTODETECT_APPLY_CONVERSION;

    return persist;
  },

  createHistoryCompleter: function createHistoryCompleter()
  {
    var completer = Components
      .classes["@mozilla.org/autocomplete/search;1?name=history"]
      .createInstance(Components.interfaces.nsIAutoCompleteSearch);

    return completer;
  },

  getFontEnumerator: function getFontEnumerator()
  {
    var enumerator = Components
      .classes["@mozilla.org/gfx/fontenumerator;1"]
      .getService(Components.interfaces.nsIFontEnumerator)

    return enumerator;
  },

  getConsoleService: function getConsoleService()
  {
    var console_service = Components
      .classes["@mozilla.org/consoleservice;1"]
      .getService(Components.interfaces.nsIConsoleService);

    return console_service;
  },

  createHash: function createHash()
  {
    var crypt_hash = Components
        .classes["@mozilla.org/security/hash;1"]
        .createInstance(Components.interfaces.nsICryptoHash);

    return crypt_hash;
  },

  createFileOutputStream: function createFileOutputStream()
  {
    // create output stream.
    var ostream = Components
      .classes["@mozilla.org/network/file-output-stream;1"]
      .createInstance(Components.interfaces.nsIFileOutputStream);

    return ostream;
  },

  createConverterOutputStream: function createConverterOutputStream()
  {
    var converter = Components
      .classes["@mozilla.org/intl/converter-output-stream;1"].
      createInstance(Components.interfaces.nsIConverterOutputStream);

    return converter;
  },

  createConverterInputStream: function createConverterInputStream()
  {
    var stream = Components
      .classes["@mozilla.org/intl/converter-input-stream;1"]
      .createInstance(Components.interfaces.nsIConverterInputStream);

    return stream;
  },

  createScriptableUnicodeConverter: function createScriptableUnicodeConverter()
  {
    var converter = Components
      .classes["@mozilla.org/intl/scriptableunicodeconverter"]
      .createInstance(Components.interfaces.nsIScriptableUnicodeConverter);

    return converter;
  },

  createTimer: function createTimer()
  {
    var timer = Components
          .classes["@mozilla.org/timer;1"]
          .createInstance(Components.interfaces.nsITimer);

    return timer;
  },

  createTransferable: function createTransferable()
  {
    const nsTransferable = Components
      .Constructor("@mozilla.org/widget/transferable;1", "nsITransferable");

    var transferable = nsTransferable(),
        source;

    if ('init' in transferable) {
        // When passed a Window object, find a suitable provacy context for it.
        if (source instanceof Components.interfaces.nsIDOMWindow)
            source = source
              .QueryInterface(Components.interfaces.nsIInterfaceRequestor)
              .getInterface(Components.interfaces.nsIWebNavigation);

        transferable.init(source);
    }
    return transferable;
  },

  createScriptError: function createScriptError()
  {
    var exception = Components
          .classes["@mozilla.org/scripterror;1"]
          .createInstance(Components.interfaces.nsIScriptError);

    return exception;
  },

};

coUtils.WindowWatcher = {

  register: function register(target)
  {
    coUtils.Components.getWindowWatcher().registerNotification(target);
  },

  unregister: function unregister(target)
  {
    coUtils.Components.getWindowWatcher().unregisterNotification(target);
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
    var io_service = coUtils.Services.getIoService(),
        file_handler = io_service.getProtocolHandler("file")
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
  function getFilesRecursively(directory, filter, entries)
  {
    var directory_entries = directory.clone().directoryEntries,
        callee = getFilesRecursively,
        file,
        name;

    while (directory_entries.hasMoreElements()) {
      file = directory_entries.getNext()
        .QueryInterface(Components.interfaces.nsIFile);
      name = file.leafName;
      if (file.isFile()) {
        if (filter && filter.test(file.leafName)) {
          entries.push(file);
        }
      } else if (file.isDirectory()) {
        callee(file, filter, entries);
      }
    }
  },

  getFileEntriesFromSearchPath:
  function getFileEntriesFromSearchPath(search_directories)
  {
    var entries = [],
        path,
        target_leaf,
        entry,
        i = 0;

    for (; i < search_directories.length; ++i) {
      path = search_directories[i];
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
            entries.push(target_leaf);
          } else {
            this.getFilesRecursively(target_leaf, /\.js$/, entries);
          }
        }
      } catch (e) {
        coUtils.Debug.reportWarning(e);
        coUtils.Debug.reportWarning(
          _("Cannot get file entries from '%s'."), path);
      }
    }

    return entries;
  },

  getFileLeafFromVirtualPath:
  function getFileLeafFromVirtualPath(virtual_path)
  {
    var virtual_path = String(virtual_path),
        split_path = virtual_path.split(/[\/\\]/),
        root_entry = split_path.shift(),
        match = root_entry.match(/^\$([^/]+)$/),
        file_name,
        target_leaf,
        i = 0;

    if (match) {
      target_leaf = this.getSpecialDirectoryName(match.pop());
    } else if (coUtils.File.isAbsolutePath(virtual_path)) { // absolute path
      return coUtils.Components.createLocalFile(virtual_path);
    } else { // relative path
      file_name = [
        Components.stack.filename.split(" -> ").pop().split("?").shift()
      ].join("");
      if (file_name.match(/^resource:/)) {
        target_leaf = this.getSpecialDirectoryName("CurProcD");
      } else {
        target_leaf = coUtils.Services.getIoService()
          .getProtocolHandler("file")
          .QueryInterface(Components.interfaces.nsIFileProtocolHandler)
          .getFileFromURLSpec(file_name)
          .parent.parent.parent;
      }
      target_leaf.normalize();
      target_leaf.append(root_entry);
    }

    for (; i < split_path.length; ++i) {
      target_leaf.append(split_path[i]);
    }
    return target_leaf;
  },

  getSpecialDirectoryName:
  function getSpecialDirectoryName(name)
  {
    var directoryService = coUtils.Services.directoryService;

    return directoryService.get(name, Components.interfaces.nsIFile);
  },

  };

}; // coUtils.File

coUtils.Runtime = {

  _app_info: coUtils.Services.getAppInfo(),

  file_handler: coUtils.Services.getIoService()
    .getProtocolHandler("file")
    .QueryInterface(Components.interfaces.nsIFileProtocolHandler),

  subscript_loader: coUtils.Services.getScriptLoader(),

  /** return application ID */
  get app_id()
  {
    return this._app_info.ID;
  },

  /** return application name */
  get app_name()
  {
    return this._app_info.name;
  },

  /** return application version */
  get version()
  {
    return this._app_info.version;
  },

  /** return OS */
  get os()
  {
    return this._app_info
      .QueryInterface(Components.interfaces.nsIXULRuntime)
      .OS;
  },

  /** return bin path */
  getBinPath: function getBinPath()
  {
    return [
      "/bin",
      "/usr/bin/",
      "/usr/local/bin",
      "/opt/local/bin"
    ].join(":");
  },

  /** return runtime directory path */
  getRuntimePath: function getRuntimePath()
  {
    return "$Home/.tanasinn";
  },

  /** return tanasinnrc path */
  getResourceFilePath: function getResourceFilePath()
  {
    return this.getRuntimePath() + "/tanasinnrc";
  },

  /** return batch path */
  getBatchDirectory: function getBatchDirectory()
  {
    return this.getRuntimePath() + "/batch";
  },

  /** return cgi-bin path */
  getCGIDirectory: function getCGIDirectory()
  {
    return this.getRuntimePath() + "/cgi-bin";
  },

  /** search cygwin root path from Windows path [C-Z]:\cygwin */
  getCygwinRoot: function getCygwinRoot()
  {
    var directory,
        i = 0,
        letters = ["C", "D", "E", "F", "G",
                   "H", "I", "J", "K", "L",
                   "M", "N", "O", "P", "Q",
                   "R", "S", "T", "U", "V",
                   "W", "X", "Y", "Z"],
        search_paths = letters
          .map(function(letter)
          {
            return letter + ":\\cygwin";
          });

    search_paths.push("D:\\User\\Program\\cygwin");

    for (; i < search_paths.length; ++i) {
      directory = Components
        .classes["@mozilla.org/file/local;1"]
        .createInstance(Components.interfaces.nsIFile);
      directory.initWithPath(search_paths[i]);
      if (directory.exists() && directory.isDirectory) {
        return directory.path;
      }
    }
    throw coUtils.Debug.Exception(_("Cannot guess cygwin root path."));
  },

  getPythonPath: function getPythonPath()
  {
    var os = coUtils.Runtime.os,
        bin_path = coUtils.Runtime.getBinPath(),
        executeable_postfix = "WINNT" === os ? ".exe": "",
        python_paths;

    python_paths = bin_path.split(":")
      .map(function(path)
      {
        var native_path,
            directory;

        if ("WINNT" === os) {
          // FIXME: this code is not works well when path includes
          //        space characters.
          native_path = coUtils.Runtime.getCygwinRoot()
                      + path.replace(/\//g, "\\");
        } else {
          native_path = path;
        }

        directory = coUtils.Components.createLocalFile(native_path);

        return {
          directory: directory,
          path: path,
        };
      }, this).filter(function(info)
      {
        return info.directory.exists() && info.directory.isDirectory();
      }).reduce(function(accumulator, info) {
        var paths = [ 2.9, 2.8, 2.7, 2.6, 2.5 ]
          .map(function(version)
          {
            var file = info.directory.clone();
            file.append("python" + version + executeable_postfix);
            return file;
          }).filter(function(file)
          {
            return file.exists() && file.isExecutable();
          }).map(function(file)
          {
            if ("WINNT" === os) {
              return info.path + "/" + file.leafName;
            }
            return file.path;
          });
        Array.prototype.push.apply(accumulator, paths);
        return accumulator;
      }, []);
    return python_paths.shift();
  },

  loadScript: function loadScript(location, scope)
  {
    var url = null,
        file = null,
        match,
        protocol;

    // detect if given location string is a URL formatted string.
    match = location.match(/^([a-z]+):\/\//);
    if (match) { // location is URL spec formatted.
      protocol = match[1];
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


/** I/O Functions. */
coUtils.IO = {

  /** Get all text from the file specified by given URI string.
   *  @param {String} location A URI string of target file.
   *  @param {String} charset Target file's encoding.
   */
  readFromFile: function readFromFile(location, charset)
  {
    var url,
        file;

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
    var channel = coUtils.Services.getIoService().newChannel(url, null, null),
        input = channel.open(),
        stream,
        buffer,
        result,
        nread,
        stream;

    try {
      if (charset) {
        stream = coUtils.Components.createConverterInputStream();
        stream.init(input, charset, 1024,
          coUtils.Constant.DEFAULT_REPLACEMENT_CHARACTER);
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
        stream = coUtils.Components.createScriptableInputStream(input);
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
    var file = coUtils.File.getFileLeafFromVirtualPath(path),
        make_directory;

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
      make_directory = function make_directory(current)
      {
        var parent = current.parent;

        if (!parent.exists()) {
          make_directory(parent);
          parent.create(coUtils.Constant.DIRECTORY_TYPE, -1);
        }
      }
      make_directory(file);
    }
    this._writeToFileImpl(file, data, callback);
  },

  _writeToFileImpl:
  function _writeToFileImpl(file, data, callback)
  {
    var mode,
        ostream,
        converter,
        istream;

    Components.utils.import("resource://gre/modules/NetUtil.jsm");
    Components.utils.import("resource://gre/modules/FileUtils.jsm");

    // file is nsIFile, data is a string
    mode = FileUtils.MODE_WRONLY
         | FileUtils.MODE_CREATE
         | FileUtils.MODE_TRUNCATE;
    ostream = FileUtils.openSafeFileOutputStream(file, mode);
    converter = coUtils.Components.createScriptableUnicodeConverter();
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
  function saveCanvas(source_canvas, file, is_thumbnail, background)
  {
    var NS_XHTML = "http://www.w3.org/1999/xhtml",
        canvas = source_canvas.ownerDocument.createElementNS(NS_XHTML, "canvas"),
        context = canvas.getContext("2d"),
        io = coUtils.Services.getIoService(),
        source,
        persist = coUtils.Components.createWebBrowserPersist(),
        background = background || "black";

    if (is_thumbnail) {
      canvas.width = 120;
      canvas.height = 80;
    } else {
      canvas.width = source_canvas.width;
      canvas.height = source_canvas.height;
    }

    context.fillStyle = background;
    context.globalAlpha = 0.70;
    context.fillRect(0, 0, canvas.width, canvas.height);
    context.globalAlpha = 1.00;
    context.drawImage(source_canvas,
                      0, 0,
                      canvas.width, canvas.height);

    // create a data url from the canvas and then create URIs of the source and targets.
    source = io.newURI(canvas.toDataURL("image/png", ""), "UTF8", null);

    // save the canvas data to the file
    if (coUtils.Services.versionComparator.compare(coUtils.Runtime.version, "18.0") >= 0) {
      persist.saveURI(source, null, null, null, null, file, null);
    } else {
      persist.saveURI(source, null, null, null, null, file);
    }

    source_canvas = null;
    canvas = null;
    context = null;
  },

}; // coUtils.IO

/**
 * Show a message box dialog.
 */
var alert = coUtils.alert = function alert(message)
{
  var prompt_service = coUtils.Services.getPromptService();

  if (arguments.length > 1 && "string" === typeof message) {
    message = coUtils.Text.format.apply(coUtils.Text, arguments);
  }
  prompt_service.alert(this.window || null, "tanasinn", message);
}

coUtils.Runtime.loadScript("modules/common/color.js", this);
coUtils.Runtime.loadScript("modules/common/locale.js", this);
coUtils.Runtime.loadScript("modules/common/algorithm.js", this);


/** Returns the window object.
 *  @return {Window} The window object.
 */
coUtils.getWindow = function getWindow()
{
  // Firefox/SeaMonkey - "navigator:browser"
  // ThunderBird - "mail:3pane"
  var window_mediator = coUtils.Services.getWindowMediator(),
      result = window_mediator.getMostRecentWindow("navigator:browser")
            || window_mediator.getMostRecentWindow("mail:3pane");

  if (result) {
    return result;
  }
  return new Function("return window;")();
}

coUtils.Runtime.loadScript("modules/common/clipboard.js", this);

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
    var delegate,
        observer;

    if (context) {
      delegate = function()
      {
        return handler.apply(context, arguments);
      };
    } else {
      delegate = handler;
    }


    observer = {
      observe: function observe()
      {
        delegate.apply(this, arguments);
      },
    };

    this._observers[topic] = this._observers[topic] || [];
    this._observers[topic].push(observer);

    coUtils.Services.getObserverService().addObserver(observer, topic, false);
  },

  removeGlobalEvent: function removeGlobalEvent(topic)
  {
    var observers,
        observer,
        observer_service = coUtils.Services.getObserverService(),
        i = 0;

    observers = this._observers[topic];

    if (observers) {
      for (; i < observers.length; ++i) {
        observer = observers[i];
        observer_service.removeObserver(observer, topic);
      }
    }
  },

  /** Fires specified system-global event and notify it to subscriber.
   *  @param {String} topic The notification topic.
   *  @return {Array} An array which contains result values.
   */
  notifyGlobalEvent: function notifyGlobalEvent(topic, data)
  {
    coUtils.Services.getObserverService().notifyObservers(null, topic, data);
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
        i = 0,
        metrics,
        char_width,
        height,
        data,
        line_length,
        first,
        last;

    for (; i < 10; ++i) {
      text += unit;
    }

    context.font = font_size + "px " + font_family;
    metrics = context.measureText(text);
    char_width = metrics.width / text.length;
    height = metrics.height;

    text = "g\u3075";
    metrics = context.measureText(text);
    canvas.width = metrics.width;
    canvas.height = (font_size * 2) | 0;
    context.save();
    context.translate(0, font_size);
    context.fillText(text, 0, 0);
    context.strokeText(text, 0, 0);
    context.restore();
    data = context.getImageData(0, 0, canvas.width, canvas.height).data;
    line_length = data.length / (canvas.height * 4);

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
    var result = {},
        keys = Object.keys(this.KEYNAME_PACKEDCODE_MAP),
        name,
        value,
        i = 0;

    for (; i < keys.length; ++i) {
      name = keys[i];
      value = this.KEYNAME_PACKEDCODE_MAP[name];
      result[String.fromCharCode(value)] = name;
    }

    this.getCodeToNameMap = function getCodeToNameMap()
    {
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
    //if (0x20 === code && (event.shiftKey || event.ctrlKey || event.altKey)) {
    //  packed_code |= 1 << coUtils.Constant.KEY_NOCHAR;
    //}
    return packed_code;
  },

  /**
   * @fn parseKeymapExpression
   * Convert from a key map expression to a packed key code.
   */
  parseKeymapExpression:
  function parseKeymapExpression(expression)
  {
    var pattern = /<.+?>|./g,
        match = expression.match(pattern),
        strokes = match,
        key_code_array = [],
        i,
        j,
        stroke,
        tokens,
        key_code,
        last_key,
        sequence;

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

coUtils.Runtime.loadScript("modules/common/debug.js", this);
coUtils.Runtime.loadScript("modules/common/logging.js", this);

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
    var result,
        i,
        buffer_length,
        piece,
        str;

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

coUtils.Runtime.loadScript("modules/common/timer.js", this);
coUtils.Runtime.loadScript("modules/common/uuid.js", this);
coUtils.Runtime.loadScript("modules/common/sessions.js", this);

// EOF
