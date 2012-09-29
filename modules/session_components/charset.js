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

"use strict";


/**
 * @class CharsetModeHandler
 *
 * SCS - Select Character Set
 * 
 * Designate character sets to G-sets.
 *
 * Format
 *
 * ESC    I     Dscs
 * 1/11   ...   ...
 *
 * Parameters
 * 
 * I is the intermediate character representing the G-set designator.
 *
 * I   94-Character G-set
 * (   G0
 * )   G1
 * *   G2
 * +   G3
 * I   96-Character G-set
 * -   G1
 * .   G2
 * /   G3
 * 
 * Dscs represents a character set designator.
 * Dscs         Default 94-Character Set
 * % 5          DEC Supplemental
 * " ?          DEC Greek
 * " 4          DEC Hebrew
 * % 0          DEC Turkish
 * & 4          DEC Cyrillic
 * A            U.K. NRCS
 * R            French NRCS
 * 9 or Q       French Canadian NRCS
 * `, E, or 6   Norwegian/Danish NRCS
 * 5 or C       Finnish NRCS
 * K            German NRCS
 * Y            Italian NRCS
 * =            Swiss NRCS
 * 7 or H       Swedish NRCS
 * Z            Spanish NRCS
 * % 6          Portuguese NRCS
 * " >          Greek NRCS
 * % =          Hebrew NRCS
 * % 2          Turkish NRCS
 * % 3          SCS NRCS
 * & 5          Russian NRCS
 * 0            DEC Special Graphic
 * >            DEC Technical Character Set
 * <            User-preferred Supplemental
 * Dscs         Default 96-Character Set
 * A            ISO Latin-1 Supplemental
 * B            ISO Latin-2 Supplemental
 * F            ISO Greek Supplemental
 * H            ISO Hebrew Supplemental
 * M            ISO Latin-5 Supplemental
 * L            ISO Latin-Cyrillic
 * <            User-preferred Supplemental
 */
var CharsetModeHandler = new Class().extends(Plugin)
CharsetModeHandler.definition = {  

  id: "charsetmode",

  getInfo: function getInfo()
  {
    return {
      name: _("Charset mode Handler"),
      version: "0.1",
      description: _("Switch NRC set with escape seqnence.")
    };
  },

  "[persistable] enabled_when_startup": true,

  /** select G0 character set */
  "[profile('vt100'), sequence('ESC (%c'), _('Select Character Set G0')]": 
  function SCSG0(mode) 
  {
    this.sendMessage("sequence/g0", mode);
  },
  
  /** select G1 character set */
  "[profile('vt100'), sequence('ESC )%c'), _('Select Character Set G1')]": 
  function SCSG1(mode) 
  {
    this.sendMessage("sequence/g1", mode);
  },

  /** select G2 character set */
  "[profile('vt100'), sequence('ESC *%c'), _('Select Character Set G2')]": 
  function SCSG2(mode) 
  {
    this.sendMessage("sequence/g2", mode);
  },

  /** select G3 character set */
  "[profile('vt100'), sequence('ESC +%c'), _('Select Character Set G3')]": 
  function SCSG3(mode) 
  {
    this.sendMessage("sequence/g3", mode);
  },

  /** Select default character set. */
  "[profile('vt100'), sequence('ESC %@')]": 
  function ISO_8859_1() 
  {
    this.sendMessage("change/decoder", "ISO-8859-1");
    this.sendMessage("change/encoder", "ISO-8859-1");
  },

  /** Select UTF-8 character set. */
  "[profile('vt100'), sequence('ESC %G')]": 
  function UTF_8() 
  {
    this.sendMessage("change/decoder", "UTF-8");
    this.sendMessage("change/encoder", "UTF-8");
  },

}; // CharsetModeHandler


/**
 * @fn main
 * @brief Module entry point.
 * @param {Broker} broker The Broker object.
 */
function main(broker) 
{
  new CharsetModeHandler(broker);
}

// EOF
