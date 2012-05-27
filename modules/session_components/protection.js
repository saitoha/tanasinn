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
 * @class Protection
 *
 * DECSCA — Select Character Protection Attribute
 *
 * DECSCA defines the characters that come after it as erasable or not 
 * erasable from the screen. The selective erase control functions (DECSED
 * and DECSEL) can only erase characters defined as erasable.
 *
 * Available in: VT Level 4 mode only
 *
 * Format
 *
 * CSI    Ps   "    q
 * 9/11   3/n  2/2  7/1
 *
 * Parameters
 *
 * Ps
 * defines all characters that follow the DECSCA function as erasable or not 
 * erasable.
 *
 * Ps   Meaning
 * 0    (default)  DECSED and DECSEL can erase characters.
 * 1    DECSED and DECSEL cannot erase characters.
 * 2    Same as 0.
 *
 * Note on DECSCA
 *
 * DECSCA does not effect visual character attributes set by the select 
 * graphic rendition (SGR) function.
 *
 */
var Protection = new Class().extends(Plugin)
                            .depends("cursorstate");
Protection.definition = {

  get id()
    "protection",

  get info()
    <module>
        <name>{_("Protection")}</name>
        <version>0.1</version>
        <description>{
          _("Add protected character attribute support.")
        }</description>
    </module>,

  "[persistable] enabled_when_startup": true,

  "[install]":
  function install()
  {
    this._attr = this.dependency["cursorstate"].attr;
  },

  "[uninstall]":
  function uninstall()
  {
    this._attr = null;
  },


  "[profile('vt100'), sequence('CSI %d\"q')]":
  function DECSCA(n) 
  { // Device Status Report

    var attr;

    attr = this._attr;;

    switch (n || 0) {

      // (default)  DECSED and DECSEL can erase characters.
      case 0:
        attr.protected = true;
        break;

      // DECSED and DECSEL cannot erase characters.
      case 1:
        attr.protected = false;
        break;

      // Same as 0.
      case 2:
        attr.protected = true;
        break;

      default:
        coUtils.Debug.reportWarning(
          _("%s sequence [%s] was ignored."),
          arguments.callee.name, Array.slice(arguments));
    }
  },

}; // class Protection

/**
 * @fn main
 * @brief Module entry point.
 * @param {Broker} broker The Broker object.
 */
function main(broker) 
{
  new Protection(broker);
}


