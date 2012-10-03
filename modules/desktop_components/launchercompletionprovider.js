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

/** 
 * @class LauncherCompletionProvider
 */
var LauncherCompletionProvider = new Class().extends(Component);
LauncherCompletionProvider.definition = {

  id: "launcher-completion-provider",

  "[subscribe('command/complete'), enabled]": 
  function complete(request)
  {
    var source = request.source,
        listener = request.listener, 
        position;

    if (0 === source.length || 0 === source.indexOf("&")) {

      position = this.request("get/completer/sessions")
        .startSearch(source.substr(1), listener);

      if (0 !== position) {
        this.request("get/completer/program")
          .startSearch(source, listener);
      }

    } else {
      this.request("get/completer/program")
        .startSearch(source, listener);
    }
  },
};

/**
 * @fn main
 * @brief Module entry point
 * @param {Desktop} desktop The Desktop object.
 */
function main(desktop) 
{
  new LauncherCompletionProvider(desktop);
}

// EOF
