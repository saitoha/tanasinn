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

// @class Emulator

/**
 * @class Emulator 
 * @brief Emulation core object, manages screen object, some flags and buffers.
 */
let Emulator = new Class().extends(Component);
Emulator.definition = {

  get id()
    "emurator",

  _screen: null,
  _ansi_mode: null,
  _dec_mode: null,

  "[subscribe('@initialized/{screen & ansimode & decmode}'), enabled]": 
  function onLoad(screen, ansi_mode, dec_mode) 
  {
    this._screen = screen;
    this._ansi_mode = ansi_mode;
    this._dec_mode = dec_mode;

    let session = this._broker;
    session.notify("initialized/emurator", this);
  },

  write: function write(codes) 
  {
    let insert_mode = this._ansi_mode.IRM;
    let auto_wrap_mode = this._dec_mode.AWM;
    let screen = this._screen;
    screen.write(codes, insert_mode, auto_wrap_mode);
  },
 
}; // class Emurator

/**
 * @fn main
 * @brief Module entry point.
 * @param {Broker} broker The Broker object.
 */
function main(broker) 
{
  new Emulator(broker);
}


