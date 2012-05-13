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
 * @class AnswerBack
 *
 */
let AnswerBack = new Class().extends(Plugin);
AnswerBack.definition = {

  get id()
    "answerback",

  get info()
    <module>
        <name>{_("Answerback")}</name>
        <version>0.1</version>
        <description>{
          _("Reply answerback message against incoming character '\x05'.")
        }</description>
    </module>,

  "[persistable] enabled_when_startup": true,
  "[persistable] answerback_message": "",

  _answerback_mode: false,

  /** installs itself. 
   *  @param {Broker} broker A Broker object.
   */
  "[install]":
  function install(broker) 
  {
    this.answerback.enabled = true;
    this.changeAnswerBackMode.enabled = true;
  },

  /** Uninstalls itself.
   *  @param {Broker} broker A broker object.
   */
  "[uninstall]":
  function uninstall(broker) 
  {
    this.answerback.enabled = false;
    this.changeAnswerBackMode.enabled = false;
  },

  /** retuns answerback message */
  "[subscribe('command/answerback')]":
  function answerback()
  {
    let message = String(this.answerback_message);
    if (message.length) {
      let broker = this._broker;
      broker.notify("command/send-to-tty", this.answerback_message);
    }
  },

  /** */
  "[subscribe('command/change-answerback-mode')]":
  function changeAnswerBackMode(mode)
  {
    this._answerback_mode = Boolean(mode);
  },

};

/**
 * @fn main
 * @brief Module entry point.
 * @param {Broker} broker The Broker object.
 */
function main(broker) 
{
  new AnswerBack(broker);
}


