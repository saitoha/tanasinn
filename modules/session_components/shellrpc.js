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
 * @class ForwardInputIterator
 */ 
let ForwardInputIterator = new Class();
ForwardInputIterator.definition = {

  _value: null,
  _position: 0,

  /** Assign new string data. position is reset. */
  initialize: function initialize(value) 
  {
    this._value = value;
    this._position = 0;
  },

  /** Returns single byte code point. */
  current: function current() 
  {
    return this._value.charCodeAt(this._position);
  },

  /** Moves to next position. */
  moveNext: function moveNext() 
  {
    ++this._position;
  },

  /** Returns whether scanner position is at end. */
  get isEnd() 
  {
    return this._position >= this._value.length;
  },
};


/**
 *  @class ShellRPC
 */
let ShellRPC = new Class().extends(Plugin).depends("decoder");
ShellRPC.definition = {

  get id()
    "shell_rpc",

  get info()
    <module>
        <name>{_("Shell RPC")}</name>
        <version>0.1</version>
        <description>{
          _("Provides command line bridge between shell <-> tanasinn.")
        }</description>
    </module>,

  "[persistable] enabled_when_startup": true,

  /** installs itself. 
   *  @param {Session} session A session object.
   */
  "[install]":
  function install(session) 
  {
    this.onCall.enabled = true;
  },

  /** Uninstalls itself.
   *  @param {Session} session A session object.
   */
  "[uninstall]":
  function uninstall(session) 
  {
    this.onCall.enabled = false;
  },

  "[subscribe('sequence/osc/220')]":
  function onCall(data) 
  {
    let scanner = new ForwardInputIterator(data);
    let decoder = this.dependency["decoder"];
    let session = this._broker;
    do {
      let sequence = [c for (c in decoder.decode(scanner))];
      let command = String.fromCharCode.apply(String, sequence);
      session.notify("command/eval-commandline", command);
      if (scanner.isEnd) {
        break;
      }
      scanner.moveNext();
    } while (!scanner.isEnd);
  },

} // class OverlayIndicator

/**
 * @fn main
 * @brief Module entry point.
 * @param {Broker} broker The Broker object.
 */
function main(broker) 
{
//  new ShellRPC(broker);
}


