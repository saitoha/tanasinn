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
 * The Original Code is coTerminal
 *
 * The Initial Developer of the Original Code is
 * Hayaki Saito.
 * Portions created by the Initial Developer are Copyright (C) 2010 - 2011
 * the Initial Developer. All Rights Reserved.
 *
 * ***** END LICENSE BLOCK ***** */

/**
 * @class FontSize
 * @brief Makes it enable to change screen font size by pressing short cut keys.
 */
let FontSize = new Class().extends(Plugin);
FontSize.definition = {

  get id()
    "fontsize",

  get info()
    <CoterminalPlugin>
        <name>Font Size</name>
        <description>{
          _("Makes it enable to change screen font size by pressing short cut keys.")
        }</description>
        <version>0.1</version>
    </CoterminalPlugin>,

  /** post-constructor */
  "[subscribe('@event/session-started'), enabled]": 
  function onLoad(session) 
  {
    this.enabled = this.enabled_when_startup;
  },

  /** Installs itself.
   *  @param {Session} session A Session object.
   */
  install: function install(session) 
  {
    this.decrease.enabled = true;
    this.increase.enabled = true;
  },

  /** Uninstalls itself.
   *  @param {Session} session A Session object.
   */
  uninstall: function uninstall() 
  {
    this.decrease.enabled = false;
    this.increase.enabled = false;
  },

  /** Makes font size smaller. */
  "[key('meta -', 'ctl -'), _('Make font size smaller.')]":
  function decrease()
  {
    this._changeFontSizeByOffset(-1);
  },

  /** Makes font size bigger. */
  "[key('meta shift \\\\+'), _('Make font size bigger.')]":
  function increase()
  {
    this._changeFontSizeByOffset(+1);
  },

  /** Increase/Decrease font size by given offset. 
   *  @param {Number} offset The offset value by which font size is 
   *                         increase or decrease.
   */
  _changeFontSizeByOffset: function(offset) 
  {
    let session = this._broker;
    session.notify("command/change-fontsize-by-offset", offset);
    session.notify("command/draw");
  },

}


/**
 * @fn main
 * @brief Module entry point.
 * @param {Process} process The Process object.
 */
function main(process) 
{
  process.subscribe(
    "initialized/session", 
    function(session) new FontSize(session));
}


