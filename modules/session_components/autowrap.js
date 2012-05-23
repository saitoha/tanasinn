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
 * @class AutoWrap
 *
 */
var AuotWrap = new Class().extends(Plugin);
AuotWrap.definition = {

  get id()
    "autowrap",

  get info()
    <module>
        <name>{_("Auto Wrap Mode")}</name>
        <version>0.1</version>
        <description>{
          _("Enable/disable auto-wrap feature(DECARM)",
            " by escape seqnence.")
        }</description>
    </module>,

  "[persistable] enabled_when_startup": true,

  /** installs itself. 
   *  @param {Broker} broker A Broker object.
   */
  "[install]":
  function install(broker) 
  {
    this.activate.enabled = true;
    this.deactivate.enabled = true;
  },

  /** Uninstalls itself.
   *  @param {Broker} broker A broker object.
   */
  "[uninstall]":
  function uninstall(broker) 
  {
    this.activate.enabled = false;
    this.deactivate.enabled = false;
  },

  /** Activate auto-wrap feature(DECAWM).
   */
  "[subscribe('sequence/decset/7')]":
  function activate() 
  { 
    var broker = this._broker;

    broker.notify("command/enable-wraparound");
    coUtils.Debug.reportMessage(
      _("DECSET - DECAWM (Auto-wrap Mode) was set."));
  },

  /** Deactivate auto-wrap feature(DECAWM).
   */
  "[subscribe('sequence/decrst/7')]":
  function deactivate() 
  {
    var broker = this._broker;

    broker.notify("command/disable-wraparound");
    coUtils.Debug.reportMessage(
      _("DECRST - DECAWM (Auto-wrap Mode) was reset."));
  },

}; // class AuotWrap

/**
 * @fn main
 * @brief Module entry point.
 * @param {Broker} broker The Broker object.
 */
function main(broker) 
{
  new AuotWrap(broker);
}


