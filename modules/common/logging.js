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

coUtils.Logging = {

  _ostream: null,
  _converter: null,

  log_file_path: "$Home/.tanasinn/log/tanasinn-js.log",
  max_log_size: 100000,

  /** constructor */
  initialize: function initialize()
  {
    // create nsIFile object.
    var path = coUtils.File
          .getFileLeafFromVirtualPath(this.log_file_path)
          .path,
        file = coUtils.Components.createLocalFile(path),
        ostream,
        converter;

    // check if target log file exists.
    if (file.exists()) {
      if (!file.isFile) { // check if target is file node.
        throw new Error(
          "Specified file '" + path + "' is not a file node.");
      } else if (!file.isWritable) { // check if target is writable.
        throw new Error(
          "Specified file '" + path + "' is not a writable file node.");
      } else if (file.fileSize > this.max_log_size) {
        file.remove(false);
        return this.initialize();
      }
    } else { // if target is not exists.
      // create base directories recursively (= mkdir -p).
      void function make_directory(current)
      {
        var parent = current.parent;
        if (!parent.exists()) {
          make_directory(parent);
          parent.create(coUtils.Constant.DIRECTORY_TYPE, parseInt("0700", 8));
        }
      } (file);
    }

    // create output stream.
    ostream = coUtils.Components.createFileOutputStream();

    // write (0x02), appending (0x10), "rw"
    ostream.init(
      file,
      0x02 /* PR_WRONLY */| 0x08 /* PR_CREATE_FILE */| 0x10 /* PR_APPEND */,
      -1, 0);

    converter = coUtils.Components.createConverterOutputStream();
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

}; // coUtils.Logging

coUtils.Logging.initialize();

coUtils.Debug = {

  /**
   * Makes exception object.
   * @param message
   */
  Exception: function Exception(message)
  {
    var stack,
        flag;

    if (arguments.length > 1 && "string" === typeof message) {
      message = coUtils.Text.format.apply(coUtils.Text, arguments);
    }
    stack = Components.stack.caller;  // get caller"s context.
    flag = Components.interfaces.nsIScriptError.errorFlag; // it"s warning
    return this.makeException(message, stack, flag);
  },

  /**
   * Report error to Console service.
   * @param {String} source
   */
  reportError: function reportError(source /* arg1, arg2, arg3, ... */)
  {
    var stack,
        flag;

    // check if printf style arguments is given.
    if (arguments.length > 1 && "string" === typeof source) {
      source = coUtils.Text.format.apply(coUtils.Text, arguments);
    }
    stack = Components.stack.caller;  // get caller"s context.
    flag = Components.interfaces.nsIScriptError.errorFlag; // it"s error.
    this.reportException(source, stack, flag);
  },

  /**
   * Report warning to Console service.
   * @param {String} source
   */
  reportWarning: function reportWarning(source /* arg1, arg2, arg3, ... */)
  {
    var stack,
        flag;

    if (arguments.length > 1 && "string" === typeof source) {
      source = coUtils.Text.format.apply(coUtils.Text, arguments);
    }
    stack = Components.stack.caller;  // get caller"s context.
    flag = Components.interfaces.nsIScriptError.warningFlag; // it"s warning.
    this.reportException(source, stack, flag);
  },

  /**
   * Report warning to Console service.
   * @param source
   */
  reportMessage: function reportMessage(source)
  {
    var stack,
        escaped_source,
        file,
        name,
        message;

    if (arguments.length > 1 && "string" === typeof source) {
      source = coUtils.Text.format.apply(coUtils, arguments);
    }
    stack = Components.stack.caller;
    escaped_source = String(source).replace(/"/g, "\u201d");
    file = stack.filename.split(" -> ").pop().split("?").shift().replace(/"/g, "\u201d");
    name = stack.name && stack.name.replace(/"/g, "\u201d");
    message = [
      "[",
        "JavaScript Message: \"tanasinn: ", escaped_source, "\" ",
        "{",
          "file: \"", file, "\" ",
          "line: ", stack.lineNumber, " ",
          "name: \"", name, "\"",
        "}",
      "]"
    ].join("");

    coUtils.Logging.logMessage(message);
    coUtils.Services.consoleService.logStringMessage(message);
  },

  reportException: function reportException(source, stack, flag)
  {
    var error,
        console_service = coUtils.Services.consoleService;

    if (null === source || undefined === source) {
      source = String(source);
    }
    if ("xml" === typeof source) {
      source = source.toString();
    }

    if (source && undefined !== source.queryInterface)
    {
      if (null !== source.QueryInterface(
          Components.interfaces.nsIConsoleMessage))
      {
        if (null !== source.QueryInterface(
            Components.interfaces.nsIScriptError))
        {
          source.flags |= flag
        }
        coUtils.Logging.logMessage(source.toString());
        console_service.logMessage(source);
        return;
      }
      // else fallback!
    }
    //if (Error.prototype.isPrototypeOf(source)) // if source is Error object.
    if (source.stack) {
      stack = source.stack; // use the stack of Error object.
    }
    error = this.makeException(source, stack, flag);
    coUtils.Logging.logMessage(source.toString());
    console_service.logMessage(error);
  },

  /**
   * Makes an exception object from given information.
   */
  makeException: function makeException(source, stack, flag)
  {
    var exception = coUtils.Components.createScriptError(),
        is_error_object = !!source.fileName,
        message = "tanasinn: "
                + (is_error_object ? source.message: source.toString())
                    .replace(/"/g, "\u201d"),
        file = (is_error_object ? source.fileName: stack.filename)
          .split(" -> ").pop()
          .split("?").shift()
          .replace(/"/g, "\u201d"),
        line = is_error_object ? source.lineNumber: stack.lineNumber;

    exception.init(message, file, null, line, /* column */ 0, flag, "tanasinn");

    return exception;
  },

};

// EOF
