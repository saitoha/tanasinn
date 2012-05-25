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
 * @class NewLineMode
 *
 * LNM — Line Feed/New Line Mode
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
var NewLineMode = new Class().extends(Plugin);
NewLineMode.definition = {

  get id()
    "new_line_mode",

  get info()
    <module>
        <name>{_("LNM Switch")}</name>
        <version>0.1</version>
        <description>{
          _("Switch Line Feed/New Line mode(NLM) with escape seqnence.")
        }</description>
    </module>,


  "[persistable] enabled_when_startup": true,

  /** Activate auto-repeat feature.
   */
  "[subscribe('sequence/sm/20'), pnp]":
  function activate() 
  { 
    // enable insert mode.
    this.sendMessage("set/newline-mode", true);
  },

  /** Deactivate auto-repeat feature
   */
  "[subscribe('sequence/rm/20'), pnp]":
  function deactivate() 
  {
    // disable insert mode.
    this.sendMessage("set/newline-mode", false);
  },

}; // class NewLineMode

/**
 * @fn main
 * @brief Module entry point.
 * @param {Broker} broker The Broker object.
 */
function main(broker) 
{
  new NewLineMode(broker);
}


