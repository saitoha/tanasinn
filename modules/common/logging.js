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
 * Portions created by the Initial Developer are Copyright (C) 2010 - 2013
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

// EOF
