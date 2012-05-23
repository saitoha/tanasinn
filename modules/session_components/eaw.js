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
 * @class EastAsianWidth
 *
 */
var EastAsianWidth = new Class().extends(Plugin)
                                .depends("parser");
EastAsianWidth.definition = {

  get id()
    "east_asian_width",

  get info()
    <module>
        <name>{_("East Asian Width")}</name>
        <version>0.1</version>
        <description>{
          _("Switch to treat east asian ambiguous width ",
            "characters as single/double.")
        }</description>
    </module>,


  "[persistable] enabled_when_startup": true,

  /** installs itself. 
   *  @param {Broker} broker A Broker object.
   */
  "[install]":
  function install(broker) 
  {
    this.activate.enabled = true;
    this.deactivate.enabled = true;
  },

  /** Uninstalls itself.
   *  @param {Broker} broker A broker object.
   */
  "[uninstall]":
  function uninstall(broker) 
  {
    this.activate.enabled = false;
    this.deactivate.enabled = false;
  },

  /**
   *
   */
  "[subscribe('sequence/decset/8840')]":
  function activate() 
  { // Treat ambiguous characters as double
    var parser = this.dependency["parser"];
    parser.ambiguous_as_wide = true;
  },

  /**
   *
   */
  "[subscribe('sequence/decrst/8840')]":
  function deactivate() 
  { // Treat ambiguous characters as single
    var parser = this.dependency["parser"];
    parser.ambiguous_as_wide = false;
  },

}; // class EastAsianWidth

/**
 * @fn main
 * @brief Module entry point.
 * @param {Broker} broker The Broker object.
 */
function main(broker) 
{
  new EastAsianWidth(broker);
}


