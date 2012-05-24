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

  /** Treat ambiguous width characters as double-width.
   */
  "[subscribe('sequence/decset/8840'), pnp]":
  function activate() 
  { // Treat ambiguous characters as double
    var parser = this.dependency["parser"];
    parser.ambiguous_as_wide = true;
  },

  /** Treat ambiguous width characters as single-width.
   */
  "[subscribe('sequence/decrst/8840'), pnp]":
  function deactivate() 
  { // Treat ambiguous characters as single
    var parser = this.dependency["parser"];
    parser.ambiguous_as_wide = false;
  },

}; // class EastAsianWidth


/**
 * @class AmbiguousWidthReporting
 *
 * http://code.google.com/p/mintty/wiki/CtrlSeqs
 *
 * Applications can ask to be notified when the width of the so-called 
 * ambiguous width character category changes due to the user changing font.
 *
 * sequence   reporting
 * ^[[?7700l  disabled
 * ^[[?7700h  enabled
 *
 * When enabled, ^[[1W is sent when changing to an "ambiguous narrow" font 
 * and ^[[2W is sent when changing to an "ambiguous wide" font. 
 */
var AmbiguousWidthReporting = new Class().extends(Plugin)
                                .depends("parser");
AmbiguousWidthReporting.definition = {

  get id()
    "ambiguous_width_reporting",

  get info()
    <module>
        <name>{_("Ambiguous Width Reporting")}</name>
        <version>0.1</version>
        <description>{
          _("Switch ambiguous width reporting. ")
        }</description>
    </module>,

  "[persistable] enabled_when_startup": true,

  /** Enable ambiguous width reporting.
   */
  "[subscribe('sequence/decset/7700'), pnp]":
  function activate() 
  { // Enable ambiguous width reporting
    this.onAmbiguousWidthChanged.enabled = true;
  },

  /** Disable ambiguous width reporting.
   */
  "[subscribe('sequence/decrst/7700'), pnp]":
  function deactivate() 
  { // Disable ambigous width reporting
    this.onAmbiguousWidthChanged.enabled = false;
  },

  /** Disable ambiguous width reporting.
   */
  "[subscribe('variable-changed/parser.ambiguous_as_wide')]":
  function onAmbiguousWidthChanged(value) 
  { // Disable ambigous width reporting
    var message;

    if (value) {
      message = "\x1b[1W";
    } else {
      message = "\x1b[2W";
    }
    this.sendMessage("command/send-to-tty", message);
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
  new AmbiguousWidthReporting(broker);
}


