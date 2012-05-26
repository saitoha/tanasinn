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
 * @class ReverseWrap
 *
 */
var ReverseWrap = new Class().extends(Plugin);
ReverseWrap.definition = {

  get id()
    "reversewrap",

  get info()
    <module>
        <name>{_("Reverse Wraparound Mode")}</name>
        <version>0.1</version>
        <description>{
          _("Enable/disable reverse-wraparound feature",
            " by escape seqnence.")
        }</description>
    </module>,

  "[persistable] enabled_when_startup": true,

  /** Activate auto-wrap feature.
   */
  "[subscribe('sequence/decset/45'), pnp]":
  function activate() 
  { 
    var broker = this._broker;

    // Reverse-wraparound Mode
    broker.notify("command/enable-reverse-wraparound");
    coUtils.Debug.reportMessage(
      _("DECSET 45 - Reverse-wraparound Mode was set."));
  },

  /** Deactivate reverse auto-wrap feature.
   */
  "[subscribe('sequence/decrst/45'), pnp]":
  function deactivate() 
  {
    var broker = this._broker;

    // No Reverse-wraparound Mode
    broker.notify("command/disable-reverse-wraparound");
    coUtils.Debug.reportMessage(
      _("DECRST 45 - Reverse-wraparound Mode was reset."));
  },

  /** Deactivate reverse auto-wrap feature.
   */
  "[subscribe('command/{soft | hard}-terminal-reset'), pnp]":
  function reset() 
  {
    this.deactivate();
  },

}; // class ReverseWrap

/**
 * @fn main
 * @brief Module entry point.
 * @param {Broker} broker The Broker object.
 */
function main(broker) 
{
  new ReverseWrap(broker);
}


