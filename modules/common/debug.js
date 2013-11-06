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

var coUtils = coUtils || { };

/** exports debug functions */
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

  assert: function assert(value)
  {
    var stack,
        flag;

    if (!value) {
      // check if printf style arguments is given.
      if (arguments.length > 1 && "string" === typeof source) {
        source = coUtils.Text.format.apply(coUtils.Text, arguments);
      }
      stack = Components.stack.caller;  // get caller"s context.
      flag = Components.interfaces.nsIScriptError.errorFlag; // it"s error.
      coUtils.Debug.reportException(source, stack, flag);
    }
  },

}; // coUtils.Debug

var assert = coUtils.Debug.assert;

// EOF
