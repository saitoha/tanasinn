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

coUtils.Clipboard = {

  /** get text from clipboard */
  get: function get()
  {
    var clipboard = coUtils.Services.getClipboard(),
        transferable = coUtils.Components.createTransferable(),
        str = {},
        str_length = {},
        text = "";

    transferable.addDataFlavor("text/unicode");

    clipboard.getData(transferable, clipboard.kGlobalClipboard);
    transferable.getTransferData("text/unicode", str, str_length);

    if (str.value && str_length.value) {
      text = str.value
        .QueryInterface(Components.interfaces.nsISupportsString)
        .data
        .substring(0, str_length.value / 2);
    } else {
      return null;
    }

    return text;
  },

  /** set text to clipboard */
  set: function set(text)
  {
    var clipboard_helper = coUtils.Services.getClipboardHelper();

    clipboard_helper.copyString(text);
  },

}; // coUtils.Clipboard

// EOF
