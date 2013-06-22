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
 * @class SoftReset
 * DECSTR — Soft Terminal Reset
 *
 * Perform a soft reset to the default values listed in following Table.
 *
 * Format
 *
 * CSI    !     p
 * 9/11   2/1   7/0
 *
 * Description
 *
 * Terminal's Default Settings
 *
 * Mode                              Mnemonic   State after DECSTR
 *
 * Text cursor enable                DECTCEM    Cursor enabled.
 * Insert/replace                    IRM        TODO: Replace mode.
 * Origin                            DECOM      Absolute (cursor origin at
 *                                              upper-left of screen.)
 * Autowrap                          DECAWM     No autowrap.
 * National replacement CS           DECNRCM    TODO: Multinational set.
 * Keyboard action                   KAM        TODO: Unlocked.
 * Numeric keypad                    DECNKM     TODO: Numeric characters.
 * Cursor keys                       DECCKM     TODO: Normal (arrow keys).
 * Set top and bottom margins        DECSTBM    Top margin = 1;
 *                                              bottom margin = page length.
 * All character sets                G0-3,GL,GR Default settings.
 * Select graphic rendition          SGR        TODO: Normal rendition.
 * Select character attribute        DECSCA     TODO: Normal (erasable by DECSEL
 *                                              TODO: and DECSED).
 * Save cursor state                 DECSC      Home position.
 * Assign user-pref supplemental set DECAUPSS   TODO: Set selected in Set-Up.
 * Select active status display      DECSASD    TODO: Main display.
 * Keyboard position mode            DECKPM     TODO: Character codes.
 * Cursor direction                  DECRLM     TODO: Reset (Left-to-right),
 *                                              TODO: regardless of NVR setting.
 * PC Term mode                      DECPCTERM  TODO: Always reset.
 *
 */
var SoftReset = new Class().extends(Plugin);
SoftReset.definition = {

  id: "soft_reset",

  /** plugin information */
  getInfo: function getInfo()
  {
    return {
      name: _("Soft Reset"),
      version: "0.1",
      description: _("Soft terminal reset with escape sequence.")
    };
  },

  "[persistable] enabled_when_startup": true,

  "[profile('vt100'), sequence('CSI ! p')]":
  function DECSTR()
  { // TODO: DEC specific - Soft Terminal Reset
    // notify soft terminal reset event.
    this.sendMessage("command/soft-terminal-reset");

    coUtils.Debug.reportWarning(
      _("DECSTR is not implemented completely."));
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


}; // class SoftReset

/**
 * @fn main
 * @brief Module entry point.
 * @param {Broker} broker The Broker object.
 */
function main(broker)
{
  new SoftReset(broker);
}

// EOF
