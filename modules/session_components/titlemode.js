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
 * @class TitleModeHandler
 *
 */
var TitleModeHandler = new Class().extends(Plugin);
TitleModeHandler.definition = {

  id: "title_mode_handler",

  getInfo: function getInfo()
  {
    return {
      name: _("Title Mode Handler"),
      version: "0.1",
      description: _("Change xterm's title mode.")
    };
  },

  "[persistable] enabled_when_startup": true,
  
  /** Installs itself. 
   *  @param {InstallContext} context A InstallContext object.
   */
  "[install]":
  function install(context) 
  {
  },
  
  /** Uninstalls itself.
   */
  "[uninstall]":
  function uninstall() 
  {
  },

  /**
   * Set one or more features of the title modes.
   * Each parameter enables a single feature.
   *
   * Title Modes
   * 
   * The window- and icon-labels can be set or queried using control sequences.
   * As a VT220-emulator, xterm "should" limit the character encoding for the
   * corresponding strings to ISO-8859-1. Indeed, it used to be the case (and
   * was documented) that window titles had to be ISO-8859-1. This is no longer
   * the case. However, there are many applications which still assume that titles
   * are set using ISO-8859-1. So that is the default behavior.
   * 
   * If xterm is running with UTF-8 encoding, it is possible to use window- and
   * icon-labels encoded using UTF-8. That is because the underlying X libraries
   * (and many, but not all) window managers support this feature.
   * 
   * The utf8Title X resource setting tells xterm to disable a reconversion of
   * the title string back to ISO-8859-1, allowing the title strings to be
   * interpreted as UTF-8. The same feature can be enabled using the title mode
   * control sequence described in this summary.
   * 
   * Separate from the ability to set the titles, xterm provides the ability to
   * query the titles, returning them either in ISO-8859-1 or UTF-8. This choice
   * is available only while xterm is using UTF-8 encoding.
   * 
   * Finally, the characters sent to, or returned by a title control are less
   * constrained than the rest of the control sequences. To make them more
   * manageable (and constrained), for use in shell scripts, xterm has an
   * optional feature which decodes the string from hexadecimal (for setting
   * titles) or for encoding the title into hexadecimal when querying the value.
   *
   */
  "[profile('vt100'), sequence('CSI >%dT')]":
  function XT_TITLEMODE()
  {
    var i = 0,
        n;

    for (;i < arguments.length; ++i) {
      n = arguments[i];

      switch (n) {

        case 0:
          // Set window/icon labels using hexadecimal.
          this.sendMessage("command/title-set-hex-mode-disabled");
          break;

        case 1:
          // Query window/icon labels using hexadecimal.
          this.sendMessage("command/title-query-hex-mode-disabled");
          break;

        case 2:
          // Set window/icon labels using UTF-8.
          this.sendMessage("command/title-set-utf8-mode-disabled");
          break;

        case 3:
          // Do not query window/icon labels using UTF-8. 
          this.sendMessage("command/title-query-utf8-mode-disabled");
          break;

      }
    }
  },

}; // class TitleModeHandler


/**
 * @fn main
 * @brief Module entry point.
 * @param {Broker} broker The Broker object.
 */
function main(broker)
{
  new TitleModeHandler(broker);
}

// EOF
