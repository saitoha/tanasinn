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

const ANSI_GATM = 1
const ANSI_KAM  = 2
const ANSI_CRM  = 3
const ANSI_IRM  = 4
const ANSI_SRTM = 5
const ANSI_VEM  = 7
const ANSI_HEM  = 10
const ANSI_PUM  = 11
const ANSI_SRM  = 12
const ANSI_FEAM = 13
const ANSI_FETM = 14
const ANSI_MATM = 15
const ANSI_TTM  = 16
const ANSI_SATM = 17
const ANSI_TSM  = 18
const ANSI_EBM  = 19
const ANSI_LNM  = 20

/**
 * @class AnsiSpecifiedMode
 */
let AnsiSpecifiedMode = new Class().extends(Component);
AnsiSpecifiedMode.definition = {

  get id()
    "module.ansimode",

  GATM: false, 
  KAM: false, 
  CRM: false, 
  IRM: false, 
  SRTM: false, 
  VEM: false, 
  HEM: false, 
  PUM: false, 
  SRM: false, 
  FEAM: false, 
  FETM: false, 
  MATM: false, 
  TTM: false, 
  SATM: false, 
  TSM: false, 
  EBM: false, 

  /**
   * LNM—Line Feed/New Line Mode
   *
   * @ref http://vt100.net/docs/vt510-rm/LNM
   *
   * This control function selects the characters sent to the host when you 
   * press the Return key. LNM also controls how the terminal interprets line 
   * feed (LF), form feed (FF), and vertical tab (VT) characters.
   *
   * Note
   *
   * For compatibility with Digital's software, you should keep LNM reset 
   * (line feed).
   *
   *
   * Default: Line feed
   *
   * Format
   *
   * CSI   2     0     h
   * 9/11  3/2   3/0   6/8
   * Set: new line.
   *
   * CSI   2     0     l
   * 9/11  3/2   3/0   6/12
   * Reset: line feed.
   *
   * Description
   *
   * If LNM is set, then the cursor moves to the first column on the next 
   * line when the terminal receives an LF, FF, or VT character. When you 
   * press Return, the terminal sends both a carriage return (CR) and line 
   * feed (LF).
   *
   * If LNM is reset, then the cursor moves to the current column on the next 
   * line when the terminal receives an LF, FF, or VT character. When you 
   * press Return, the terminal sends only a carriage return (CR) character.
   *
   * Note on LNM
   *
   * When the auxiliary keypad is in keypad numeric mode (DECKPNM), the Enter 
   * key sends the same characters as the Return key.
   */

  _LNM: false, 

  get LNM()
  {
    return this._LNM;
  },
  
  set LNM(value) 
  {
    let broker = this._broker;
    if (value) {
      broker.notify("set/newline-mode", true);
    } else {
      broker.notify("set/newline-mode", false);
    }
    this._LNM = value;
  },

  /** constructor */
  "[subscribe('@event/broker-started'), enabled]":
  function onLoad(broker) 
  {
    broker.notify("initialized/ansimode", this);
  },

  set: function set(id, flag) 
  {
    let broker = this._broker;
    switch (id) {

      case ANSI_KAM:
        this.KAM = flag;
        break;

      case ANSI_CRM:
        this.CRM = flag 
        break;

      case ANSI_IRM:
        broker.notify("event/ansi-mode-changed/irm", flag);
        this.IRM = flag 
        break;

      case ANSI_SRM:
        this.SRM = flag
        break;

      case ANSI_LNM:
        this.LNM = flag
        break;

      default:
        coUtils.Debug.reportWarning(
          _("Unknown ANSI Mode ID [%d] was specified."), id);
    }
  },

  reset: function reset() 
  {
    this.GATM = false; 
    this.KAM = false; 
    this.CRM = false; 
    this.IRM = false; 
    this.SRTM = false; 
    this.VEM = false; 
    this.HEM = false; 
    this.PUM = false; 
    this.SRM = false; 
    this.FEAM = false; 
    this.FETM = false; 
    this.MATM = false; 
    this.TTM = false; 
    this.SATM = false; 
    this.TSM = false; 
    this.EBM = false; 
  },

  "[profile('vt100'), sequence('CSI %dh')]":
  function SM(n) 
  { // set ANSI-Specified Mode. 
    this.set(n, true);
  },

  "[profile('vt100'), sequence('CSI %dl')]": 
  function RM(n) 
  { // reset ANSI-Specified Mode. 
    this.set(n, false);
  },


};

/**
 * @fn main
 * @brief Module entry point.
 * @param {Broker} broker The Broker object.
 */
function main(broker) 
{
  new AnsiSpecifiedMode(broker);
}


