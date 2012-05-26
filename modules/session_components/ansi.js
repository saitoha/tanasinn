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

var ANSI_GATM = 1
var ANSI_KAM  = 2
var ANSI_CRM  = 3
var ANSI_IRM  = 4
var ANSI_SRTM = 5
var ANSI_VEM  = 7
var ANSI_HEM  = 10
var ANSI_PUM  = 11
var ANSI_SRM  = 12
var ANSI_FEAM = 13
var ANSI_FETM = 14
var ANSI_MATM = 15
var ANSI_TTM  = 16
var ANSI_SATM = 17
var ANSI_TSM  = 18
var ANSI_EBM  = 19
var ANSI_LNM  = 20

/**
 * @class AnsiSpecifiedMode
 */
var AnsiSpecifiedMode = new Class().extends(Component);
AnsiSpecifiedMode.definition = {

  get id()
    "module.ansimode",

  _mode: null,

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
  "[subscribe('@event/broker-started'), enabled]":
  function onLoad(broker) 
  {
    this._mode = [];
    this.sendMessage("initialized/ansimode", this);
  },

  "[subscribe('command/{soft | hard}-terminal-reset'), enabled]":
  function reset(broker) 
  {
    this.set(ANSI_IRM, false);
  },

  set: function set(id, flag) 
  {
    switch (id) {

      case ANSI_CRM:
        this.CRM = flag 
        break;

      case ANSI_SRM:
        this.SRM = flag
        break;

      default:
        try {
          if (flag) {
            this.request("sequence/sm/" + id);
          } else {
            this.request("sequence/rm/" + id);
          }
        } catch (e) {
          coUtils.Debug.reportWarning(
            _("Unknown ANSI Mode ID [%d] was specified."), id);
        }
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
    this._mode[id] = true;
  },

  "[profile('vt100'), sequence('CSI %dl')]": 
  function RM(n) 
  { // reset ANSI-Specified Mode. 
    this.set(n, false);
    this._mode[id] = false;
  },
}; // AnsiSpecifiedMode

/**
 * @fn main
 * @brief Module entry point.
 * @param {Broker} broker The Broker object.
 */
function main(broker) 
{
  new AnsiSpecifiedMode(broker);
}


