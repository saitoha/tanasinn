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

/**
 * @trait ConformanceLevel
 */
var ConformanceLevel = new Class().extends(Plugin)
                                  .depends("tty_gateway");
ConformanceLevel.definition = {

  /** Component ID */
  id: "conformanse_level",

  /** plugin information */
  getInfo: function getInfo()
  {
    return {
      name: _("Conformance Level"),
      version: "0.1.1",
      description: _("Manage conformanse level and 7bit/8bit response mode.")
    };
  },

  "[persistable] enabled_when_startup": true,

  /** Installs itself.
   *  @param {InstallContext} context A InstallContext object.
   */
  "[install]":
  function install(context)
  {
    this._tty_gateway = context["tty_gateway"];
  },

  /** uninstalls itself.
   */
  "[uninstall]":
  function uninstall()
  {
    this._tty_gateway = null;
  },

  /**
   *
   * DECSCL - Select Conformance Level
   *
   * ref: http://www.vt100.net/docs/vt510-rm/DECSCL
   *
   * You select the terminal's operating level by using the following select
   * conformance level (DECSCL) control sequences. The factory default is
   * level 4 (VT Level 4 mode, 7-bit controls).
   *
   * Note
   *
   * When you change the conformance level, the terminal performs a hard
   * reset (RIS).
   *
   */
  "[profile('vt100'), sequence('CSI Ps;Ps \" p')]":
  function DECSCL(n1, n2)
  {
    var level = n1,
        submode = n2,
        gateway = this._tty_gateway;

    if (61 === level) {
      level = 1;
      gateway.set8bitModeState(false);
    } else if (62 <= level && level <= 69) {
      if (0 === submode || 2 === submode) {
        gateway.set8bitModeState(true);
      } else if (1 === submode) {
        gateway.set8bitModeState(false);
      } else {
        coUtils.Debug.reportWarning(
          _("%s sequence [%s] was ignored."),
          "DECSCL", Array.slice(arguments));
        return;
      }
      level = 4;
    }
    gateway.setConformanceLevel(level);
  },

  /** test */
  "[test]":
  function()
  {
    var enabled = this.enabled;

    try {
      this.enabled = false;
      this.enabled = true;
      this.enabled = false;
    } finally {
      this.enabled = enabled;
    }
  },

}; // ConformanceLevel

/**
 * @fn main
 * @brief Module entry point.
 * @param {Broker} broker The Broker object.
 */
function main(broker)
{
  new ConformanceLevel(broker);
}

// EOF
