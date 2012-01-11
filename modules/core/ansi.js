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
  LNM: false, 

  /** constructor */
  "[subscribe('@event/session-started'), enabled]":
  function onLoad(session) 
  {
    session.notify("initialized/ansimode", this);
  },

  set: function set(id, flag) 
  {
      id == ANSI_KAM  ? this.KAM = flag
    : id == ANSI_CRM  ? this.CRM = flag 
    : id == ANSI_IRM  ? this.IRM = flag 
    : id == ANSI_SRM  ? this.SRM = flag
    : id == ANSI_LNM  ? this.LNM = flag
    : coUtils.Debug.reportWarning(
      _("Unknown ANSI Mode ID [%d] was specified."), id);
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

  "[sequence('CSI %dh')]":
  function SM(n) 
  { // set ANSI-Specified Mode. 
    this.set(n, true);
  },

  "[sequence('CSI %dl')]": 
  function RM(n) 
  { // reset ANSI-Specified Mode. 
    this.set(n, false);
  },


}  

/**
 * @fn main
 * @brief Module entry point.
 * @param {Desktop} desktop The desktop object.
 */
function main(desktop) 
{
  desktop.subscribe(
    "@initialized/session", 
    function(session) new AnsiSpecifiedMode(session));
}


