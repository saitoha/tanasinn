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

/**
 * @class HardReset
 *
 */
var HardReset = new Class().extends(Plugin);
HardReset.definition = {

  get id()
    "soft_reset",

  get info()
    <module>
        <name>{_("Soft Reset")}</name>
        <version>0.1</version>
        <description>{
          _("Soft terminal reset with escape sequence.")
        }</description>
    </module>,

  "[persistable] enabled_when_startup": true,

  "[profile('vt100'), sequence('CSI !p')]": 
  function DECSTR() 
  { // TODO: DEC specific - Soft Terminal Reset
    this.DECSET(25); // DECTCEM

    // notify soft terminal reset event.
    this.sendMessage("command/soft-terminal-reset");

    coUtils.Debug.reportWarning(
      _("DECSTR is not implemented completely."));
  },

}; // class HardReset

/**
 * @fn main
 * @brief Module entry point.
 * @param {Broker} broker The Broker object.
 */
function main(broker) 
{
  new HardReset(broker);
}


