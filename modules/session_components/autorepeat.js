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
 * @class AutoRepeat
 *
 */
var AutoRepeat = new Class().extends(Plugin)
                            .depends("parser");
AutoRepeat.definition = {

  get id()
    "auto_repeat",

  get info()
    <module>
        <name>{_("Auto Repeat")}</name>
        <version>0.1</version>
        <description>{
          _("Enable/disable Auto repeat feature(DECARM) ",
            "by escape seqnence.")
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

  /** Activate auto-repeat feature.
   */
  "[subscribe('sequence/decset/8')]":
  function activate() 
  { 
    // Auto-repeat Keys (DECARM)
    var broker = this._broker;

    // enable auto repeat.
    broker.notify("command/change-auto-repeat-mode", true);
    coUtils.Debug.reportMessage(
      _("DECSET - DECARM (Auto-repeat Keys) is set."));
  },

  /** Deactivate auto-repeat feature
   */
  "[subscribe('sequence/decrst/8')]":
  function deactivate() 
  {
    // Auto-repeat Keys (DECARM)
    var broker = this._broker;

    // enable auto repeat.
    broker.notify("command/change-auto-repeat-mode", false);
    coUtils.Debug.reportMessage(
      _("DECRST - DECARM (Auto-repeat Keys) is reset."));
  },

}; // class AutoRepeat

/**
 * @fn main
 * @brief Module entry point.
 * @param {Broker} broker The Broker object.
 */
function main(broker) 
{
  new AutoRepeat(broker);
}


