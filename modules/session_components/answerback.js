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
 * DECAAM - Set/Reset Auto Answerback Mode
 *
 * @ref http://www.vt100.net/docs/vt510-rm/DECAAM
 *
 * Selects whether the terminal automatically sends (enables) or does not send
 * (disables) the answerback message to the host computer after a
 * communication line connection.
 *
 * Default: Auto answerback disabled.
 *
 * Format
 *
 * CSI   ?     1     0     0     h
 * 9/11  3/15  3/1   3/0   3/0   6/8
 *
 *
 * Set: enables auto answerback.
 *
 * CSI   ?     1     0     0     l
 * 9/11  3/15  3/1   3/0   3/0   6/12
 *
 * Reset: disables auto answerback.
 *
 *
 * Description
 * 
 * When modem control is enabled, the answerback message is sent 500 ms after
 * the connection is made.
 *
 */
var AnswerBack = new Class().extends(Plugin);
AnswerBack.definition = {

  get id()
    "answerback",

  get info()
  {
    return {
      name: _("Answerback"),
      version: "0.1",
      description: _("Reply answerback message against incoming character '\x05'.")
    };
  },

  "[persistable] enabled_when_startup": true,
  "[persistable] answerback_message": "",
  "[persistable] default_value": false,

  _mode: false,

  /** installs itself. 
   *  @param {Broker} broker A Broker object.
   */
  "[install]":
  function install(broker) 
  {
    this._mode = this.default_value;
    this.reset();
  },

  /** Uninstalls itself.
   *  @param {Broker} broker A broker object.
   */
  "[uninstall]":
  function uninstall(broker) 
  {
    this._mode = null;
  },

  /** retuns answerback message */
  "[subscribe('command/answerback'), pnp]":
  function answerback()
  {
    var message;

    if (this._mode) {
      message = String(this.answerback_message);
      if (message.length) {
        this.sendMessage("command/send-to-tty", message);
      }
    }
  },

  /** Activate reverse video feature.
   */
  "[subscribe('sequence/decset/100'), pnp]":
  function activate() 
  { 
    this._mode = true;

    coUtils.Debug.reportMessage(
      _("DECAAM - DECAAM (enable answerback) was called."));
  },

  /** Deactivate reverse video feature
   */
  "[subscribe('sequence/decrst/100'), pnp]":
  function deactivate() 
  {
    this._mode = false;

    coUtils.Debug.reportMessage(
      _("DECAAM - DECAAM (disable answerback) was called."));
  },

  /** Report mode
   */
  "[subscribe('sequence/decrqm/100'), pnp]":
  function report() 
  {
    var mode = this._mode ? 1: 2,
        message = "?100;" + mode + "$y";

    this.sendMessage("command/send-sequence/csi", message);
  },

  /** handle terminal reset event.
   */
  "[subscribe('command/{soft | hard}-terminal-reset'), pnp]":
  function reset() 
  {
    if (this.default_value) {
      this.activate();
    } else {
      this.deactivate();
    }
  },

  /**
   * Serialize snd persist current state.
   */
  "[subscribe('@command/backup'), type('Object -> Undefined'), pnp]": 
  function backup(context) 
  {
    // serialize this plugin object.
    context[this.id] = {
      mode: this._mode,
    };
  },

  /**
   * Deserialize snd restore stored state.
   */
  "[subscribe('@command/restore'), type('Object -> Undefined'), pnp]": 
  function restore(context) 
  {
    var data = context[this.id];
    if (data) {
      this._mode = data.mode;
    } else {
      coUtils.Debug.reportWarning(
        _("Cannot restore last state of renderer: data not found."));
    }
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

// EOF
