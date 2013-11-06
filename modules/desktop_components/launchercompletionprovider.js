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

/**
 * @class LauncherCompletionProvider
 */
var LauncherCompletionProvider = new Class().extends(Plugin);
LauncherCompletionProvider.definition = {

  id: "launcher-completion-provider",

  /** plugin information */
  getInfo: function getInfo()
  {
    return {
      name: _("Launcher Completion Provider"),
      version: "0.1",
      description: _("Provides completion information for launcher.")
    };
  },

  "[persistable, watchable] enabled_when_startup": true,

  /** Installs itself.
   *  @param {InstallContext} context A InstallContext object.
   */
  "[install]":
  function install(context)
  {
  },

  /** Uninstalls itself.
   *  @param {InstallContext} context A InstallContext object.
   */
  "[uninstall]":
  function uninstall(context)
  {
  },

  "[subscribe('command/complete'), pnp]":
  function complete(request)
  {
    var source = request.source,
        listener = request.listener,
        position;

    if (0 === source.length || 0 === source.indexOf("&")) {
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
