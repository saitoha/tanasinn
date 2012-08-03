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
 * @class AlternateScreen
 *
 */
var AlternateScreen = new Class().extends(Plugin)
                                 .depends("screen");
AlternateScreen.definition = {

  get id()
    "alternate_screen",

  get info()
    <module>
        <name>{_("Alternate Screen")}</name>
        <version>0.1</version>
        <description>{
          _("Switches between Main Alternate screens.")
        }</description>
    </module>,

  "[persistable] enabled_when_startup": true,
  "[persistable] default_value": false,

  _mode: null,
  _screen: null,

  /** installs itself. 
   *  @param {Broker} broker A Broker object.
   */
  "[install]":
  function install(broker) 
  {
    this._mode = this.default_value;
    this._screen = this.dependency["screen"];
    //this.reset();
  },

  /** Uninstalls itself.
   *  @param {Broker} broker A broker object.
   */
  "[uninstall]":
  function uninstall(broker) 
  {
    this._mode = null;
    this._screen = null;
  },

  /** Use Alternate Screen Buffer 
   * (unless disabled by the titleInhibit resource)
   */
  "[subscribe('sequence/decset/47'), pnp]":
  function activate() 
  { 
    var screen = this._screen;

    this._mode = true;

    screen.switchToAlternateScreen();

    coUtils.Debug.reportMessage(
      _("DECSET - 47 (switch to alternate screen) was called."));
  },

  /** Use Normal Screen Buffer 
   * (unless disabled by the titleInhibit resource)
   */
  "[subscribe('sequence/decrst/47'), pnp]":
  function deactivate() 
  {
    var screen = this._screen;

    this._mode = false;

    screen.switchToMainScreen();

    coUtils.Debug.reportMessage(
      _("DECRST - 47 (switch to main screen) was called."));
  },

  /** Report mode
   */
  "[subscribe('sequence/decrqm/47'), pnp]":
  function report() 
  {
    var mode = this._mode ? 1: 2,
        message = "?47;" + mode + "$y";

    this.sendMessage("command/send-sequence/csi", message);
  },

  /** Use Alternate Screen Buffer 
   * (unless disabled by the titleInhibit resource)
   */
  "[subscribe('sequence/decset/1047'), pnp]":
  function activate1047() 
  { 
    var screen = this._screen;

    this._mode = true;

    screen.switchToAlternateScreen();

    coUtils.Debug.reportMessage(
      _("DECSET - 1047 (switch to alternate screen) was called."));
  },

  /** Use Normal Screen Buffer, clearing screen first if in the 
   * Alternate Screen (unless disabled by the titleinhibit resource)
   */
  "[subscribe('sequence/decrst/1047'), pnp]":
  function deactivate1047() 
  {
    var screen = this._screen;

    this._mode = false;

    screen.eraseScreenAll();
    screen.switchToMainScreen();

    coUtils.Debug.reportMessage(
      _("DECRST - 1047 (switch to main screen) was called."));
  },

  /** Report mode
   */
  "[subscribe('sequence/decrqm/1047'), pnp]":
  function report1047() 
  {
    var mode = this._mode ? 1: 2,
        message = "?1047;" + mode + "$y";

    this.sendMessage("command/send-sequence/csi", message);
  },

  /** Save cursor as in DECSC and use Alternate Screen Buffer, 
   * clearing it first (unless disabled by the titleinhibit resource)
   */
  "[subscribe('sequence/decset/1049'), pnp]":
  function activate1049() 
  { 
    var screen = this._screen;

    this._mode = true;

    screen.selectAlternateScreen();

    coUtils.Debug.reportMessage(
      _("DECSET - 1049 (switch to alternate screen) was called."));
  },

  /** Use Normal Screen Buffer and restore cursor as in DECRC 
   * (unless disabled by the titleinhibit resource)
   */
  "[subscribe('sequence/decrst/1049'), pnp]":
  function deactivate1049() 
  {
    var screen = this._screen;

    this._mode = false;

    screen.eraseScreenAll();
    screen.selectMainScreen();

    coUtils.Debug.reportMessage(
      _("DECRST - 1049 (switch to main screen) was called."));
  },

  /** Report mode
   */
  "[subscribe('sequence/decrqm/1049'), pnp]":
  function report1049() 
  {
    var mode = this._mode ? 1: 2,
        message = "?1049;" + mode + "$y";

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
    var data;

    data = context[this.id];
    if (data) {
      this._mode = data.mode;
    } else {
      coUtils.Debug.reportWarning(
        _("Cannot restore last state of renderer: data not found."));
    }
  },


}; // class ReverseVideo

/**
 * @fn main
 * @brief Module entry point.
 * @param {Broker} broker The Broker object.
 */
function main(broker) 
{
  new AlternateScreen(broker);
}

// EOF
