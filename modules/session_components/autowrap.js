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
 * @class AutoWrap
 *
 * DECAWM — Autowrap Mode
 *
 * This control function determines whether or not received characters 
 * automatically wrap to the next line when the cursor reaches the right 
 * border of a page in page memory.
 *
 * Default: No autowrap
 *
 * Format
 *
 * CSI    ?      7    h
 * 9/11   3/15   3/7  6/8  
 *
 * Set: autowrap.
 *
 *
 * CSI    ?      7    l
 * 9/11   3/15   3/7  6/12   
 *
 * Reset: no autowrap.
 *
 *
 * Description
 *
 * If the DECAWM function is set, then graphic characters received when the 
 * cursor is at the right border of the page appear at the beginning of the 
 * next line. Any text on the page scrolls up if the cursor is at the end of 
 * the scrolling region.
 *
 * If the DECAWM function is reset, then graphic characters received when the 
 * cursor is at the right border of the page replace characters already on the
 * page.
 *
 */
var AutoWrap = new Class().extends(Plugin);
AutoWrap.definition = {

  get id()
    "autowrap",

  get info()
    <module>
        <name>{_("Auto Wrap Mode")}</name>
        <version>0.1</version>
        <description>{
          _("Enable/disable auto-wrap feature(DECARM)",
            " with escape seqnence.")
        }</description>
    </module>,

  "[persistable] enabled_when_startup": true,

  /** Activate auto-wrap feature(DECAWM).
   */
  "[subscribe('sequence/decset/7'), pnp]":
  function activate() 
  { 
    this.sendMessage("command/enable-wraparound");
//    coUtils.Debug.reportMessage(
//      _("DECSET - DECAWM (Auto-wrap Mode) was set."));
  },

  /** Deactivate auto-wrap feature(DECAWM).
   */
  "[subscribe('sequence/decrst/7'), pnp]":
  function deactivate() 
  {
    this.sendMessage("command/disable-wraparound");
//    coUtils.Debug.reportMessage(
//      _("DECRST - DECAWM (Auto-wrap Mode) was reset."));
  },

  /** handle terminal reset event.
   */
  "[subscribe('command/{soft | hard}-terminal-reset'), pnp]":
  function reset() 
  {
    this.activate();
  },

}; // class AutoWrap

/**
 * @fn main
 * @brief Module entry point.
 * @param {Broker} broker The Broker object.
 */
function main(broker) 
{
  new AutoWrap(broker);
}

// EOF
