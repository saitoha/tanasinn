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

Components.utils.import("resource://gre/modules/devtools/Require.jsm", this);
Components.utils.import("resource://gre/modules/devtools/gcli.jsm", this);


/**
 * @class GCLI
 */
var GCLI = new Class().extends(Plugin);
GCLI.definition = {

  id: "gcli",

  "[persistable] enabled_when_startup": true,

  /** Installs itself. 
   *  @param {InstallContext} context A InstallContext object.
   */
  "[install]":
  function install() 
  {
    var self = this;

    gcli.addCommand({
      name: "tanasinn",
      description: "run tanasinn",
      params: [
        {
          name: "commandline",
          type: { name: "array", subtype: "string" },
          description: "command line",
          defaultValue: [""]
        }
      ],
      exec: function tanasinn(args, context)
        {
          var command = args.commandline.join(" "),
              desktop = self._getCurrentDesktop();

          desktop.callSync("command/start-session", command);
        }
    });
  },

  _getCurrentDesktop: function _getDesktop() 
  {
    var window = coUtils.getWindow(),
        desktops = this.sendMessage("get/desktop-from-window", window),
        desktop;
  
    if (desktops) {
      desktop = desktops.filter(
        function filterProc(desktop)
        {
          return desktop;
        })[0];
      if (desktop) {
        return desktop;
      }
    }
    desktop = this.sendMessage("event/new-window-detected", window).pop();
    return desktop;
  }
  
};

/**
 * @fn main
 * @brief Module entry point
 * @param {Desktop} desktop The Desktop object.
 */
function main(process) 
{
  new GCLI(process).install();
}

// EOF
