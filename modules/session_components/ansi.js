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

var ANSI_GATM = 1,
    ANSI_KAM  = 2,
    ANSI_CRM  = 3,
    ANSI_IRM  = 4,
    ANSI_SRTM = 5,
    ANSI_VEM  = 7,
    ANSI_HEM  = 10,
    ANSI_PUM  = 11,
    ANSI_SRM  = 12,
    ANSI_FEAM = 13,
    ANSI_FETM = 14,
    ANSI_MATM = 15,
    ANSI_TTM  = 16,
    ANSI_SATM = 17,
    ANSI_TSM  = 18,
    ANSI_EBM  = 19,
    ANSI_LNM  = 20;

/**
 * @class AnsiMode
 */
var AnsiMode = new Class().extends(Plugin);
AnsiMode.definition = {

  id: "ansimode",

  getInfo: function getInfo()
  {
    return {
      name: _("ANSI Mode"),
      version: "0.1",
      description: _("Handle ANSI mode switches (CSI Pm h).")
    };
  },

  "[persistable] enabled_when_startup": true,

  set: function set(id, flag)
  {
    switch (id) {

      default:
        try {
          if (flag) {
            this.request("sequence/sm/" + id);
          } else {
            this.request("sequence/rm/" + id);
          }
        } catch (e) {
          coUtils.Debug.reportWarning(
            _("Unknown ANSI Mode ID [%d] was specified."), id);
        }
    }
  },

  reset: function reset()
  {
  },

  "[profile('vt100'), sequence('CSI Pm h')]":
  function SM(n)
  { // set ANSI-Specified Mode.
    try {
      this.request("sequence/sm/" + n);
    } catch (e) {
      coUtils.Debug.reportWarning(
        _("SM: Unknown ANSI Mode ID [%d] was specified."), n);
    }
    this.set(n, true);
  },

  "[profile('vt100'), sequence('CSI Pm l')]":
  function RM(n)
  { // reset ANSI-Specified Mode.
    try {
      this.request("sequence/rm/" + n);
    } catch (e) {
      coUtils.Debug.reportWarning(
        _("RM: Unknown ANSI Mode ID [%d] was specified."), n);
    }
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


}; // AnsiMode

/**
 * @fn main
 * @brief Module entry point.
 * @param {Broker} broker The Broker object.
 */
function main(broker)
{
  new AnsiMode(broker);
}

// EOF
