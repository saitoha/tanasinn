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
 * @class Protection
 *
 */
var Protection = new Class().extends(Plugin)
                            .depends("cursorstate")
                            .depends("screen");
Protection.definition = {

  id: "protection",

  /** plugin information */
  getInfo: function getInfo()
  {
    return {
      name: _("Protection"),
      version: "0.1",
      description: _("Add protected character attribute support.")
    };
  },

  "[persistable] enabled_when_startup": true,

  _screen: null, // reference of screen object
  _cursor_state: null,

  /** Installs itself.
   *  @param {InstallContext} context A InstallContext object.
   */
  "[install]":
  function install(context)
  {
    this._screen = context["screen"];
    this._cursor_state = context["cursorstate"];
  },

  /** Uninstalls itself.
   */
  "[uninstall]":
  function uninstall()
  {
    this._screen = null;
    this._cursor_state = null;
  },

  /**
   *
   * DECSCA - Select Character Protection Attribute
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
  "[profile('vt100'), sequence('CSI Ps \" q')]":
  function DECSCA(n)
  { // Device Status Report

    var attr = this._cursor_state.attr;

    switch (n || 0) {

      // (default)  DECSED and DECSEL can erase characters.
      case 0:
        attr.protected = 0;
        break;

      // DECSED and DECSEL cannot erase characters.
      case 1:
        attr.protected = 1;
        break;

      // Same as 0.
      case 2:
        attr.protected = 0;
        break;

      default:
        coUtils.Debug.reportWarning(
          _("%s sequence [%s] was ignored."),
          "DECSCA", Array.slice(arguments));
    }
  },

  "[subscribe('sequence/decrqss/decsca'), pnp]":
  function onRequestStatus(data)
  { // Device Status Report
    var attr = this._cursor_state.attr,
        param,
        message;

    if (1 === attr.protected) {
      param = 1;
    } else {
      param = 0;
    }

    message = "0$r" + param + "\"q";

    this.sendMessage("command/send-sequence/dcs", message);
  },

  /**
   *
   * DECSEL - Selective Erase in Line
   *
   * This control function erases some or all of the erasable characters in
   * a single line of text. DECSEL erases only those characters defined as
   * erasable by the DECSCA control function. DECSEL works inside or outside
   * the scrolling margins.
   *
   * Available in: VT Level 4 mode only
   *
   * Format
   *
   * CSI    ?      Ps   K
   * 9/11   3/15   3/n  4/11
   *
   * Parameters
   *
   * Ps
   * represents the section of the line to erase, as follows:
   *
   * Ps   Section Erased
   * 0    (default)  From the cursor through the end of the line
   * 1    From the beginning of the line through the cursor
   * 2    The complete line
   *
   */
  "[profile('vt100'), sequence('CSI ? Ps K')]":
  function DECSEL(n)
  { // Selective Erase Line
    var screen = this._screen;

    switch (n || 0) {

      case 0: // erase to right
        screen.selectiveEraseLineToRight();
        break;

      case 1: // erase to left
        screen.selectiveEraseLineToLeft();
        break;

      case 2: // erase all
        screen.selectiveEraseLine();
        break;

      default:
        coUtils.Debug.reportWarning(
          _("%s sequence [%s] was ignored."),
          "DECSCL", Array.slice(arguments));
    }
  },

  /**
   *
   * DECSED - Selective Erase in Display
   *
   * This control function erases some or all of the erasable characters in
   * the display. DECSED can only erase characters defined as erasable by the
   * DECSCA control function. DECSED works inside or outside the scrolling
   * margins.
   *
   * Available in: VT Level 4 mode only
   *
   * Format
   *
   * CSI    ?      Ps   J
   * 9/11   3/15   3/n  4/10
   *
   * Parameters
   *
   * Ps
   * represents the area of the display to erase, as follows:
   *
   * Ps   Area Erased
   * 0    (default)  From the cursor through the end of the display
   * 1    From the beginning of the display through the cursor
   * 2    The complete display
   *
   */
  "[profile('vt100'), sequence('CSI ? Ps J')]":
  function DECSED(n)
  { // Selective Erase Display
    var screen = this._screen;

    switch (n || 0) {

      case 0:   // erase below
        screen.selectiveEraseScreenBelow();
        break;

      case 1:   // erase above
        screen.selectiveEraseScreenAbove();
        break;

      case 2: // erase all
        screen.selectiveEraseScreenAll();
        break;

      default:
        coUtils.Debug.reportWarning(
          _("%s sequence [%s] was ignored."),
          "DECSED", Array.slice(arguments));
    }

  },

  /**
   * DECSERA - Selective Erase Rectangular Area
   *
   * This control function erases all erasable characters from a specified
   * rectangular area in page memory. The select character protection
   * attribute (DECSCA) control function defines whether or not DECSERA can
   * erase characters.
   *
   * When an area is erased, DECSERA replaces character positions with the
   * space character (2/0). DECSERA does not change:
   *
   * - Visual attributes set by the select graphic rendition (SGR) function
   * - Protection attributes set by DECSCA
   * - Line attributes
   *
   * Available in: VT Level 4 mode only
   *
   * Format
   *
   * CSI    Pt   ;      Pl   ;      Pb   ;      Pr   $    {
   * 9/11   3/n  3/11   3/n  3/11   3/n  3/11   3/n  2/4  7/11
   *
   *
   * Parameters
   *
   * Pt, Pl, Pb, and Pr
   * define the rectangular area to be selectively erased:
   *
   * Pt is the top-line border. Pt must be less than or equal to Pb.
   * Default: Pt = 1.
   *
   * Pl is the left-column border. Pl must be less than or equal to Pr.
   * Default: Pl = 1.
   *
   * Pb is the bottom-line border.
   * Default: Pb = the last line of the active page.
   *
   * Pr is the right-column border.
   * Default: Pr = the last column of the active page.
   *
   *
   * Notes on DECSERA
   *
   * The coordinates of the rectangular area are affected by the setting of
   * origin mode (DECOM).
   * DECSERA is not affected by the page margins.
   * If the value of Pt, Pl, Pb, or Pr exceeds the width or height of the
   * active page, then the value is treated as the width or height of that page.
   * DECSERA does not change the active cursor position.
   *
   */
  "[profile('vt100'), sequence('CSI Ps $ {')]":
  function DECSERA(n1, n2, n3, n4)
  { // Selective Erase Rectangle Area
    var screen = this._screen,
        top = (n1 || 1) - 1,
        left = (n2 || 1) - 1,
        bottom = (n3 || 1) - 1,
        right = (n4 || 1) - 1;

    if (top >= bottom || left >= right) {
      throw coUtils.Debug.Exception(
        _("Invalid arguments detected in %s [%s]."),
        "DECSERA", Array.slice(arguments));
    }

    if (bottom > screen.height) {
      bottom = screen.height;
    }
    if (right > screen.width) {
      right = screen.width;
    }

    screen.selectiveEraseRectangle(top, left, bottom, right);
  },

  /** test */
  "[test]":
  function()
  {
    var enabled = this.enabled;

    try {
      this.enabled = false;
      this.enabled = true;
      this.enabled = false;
    } finally {
      this.enabled = enabled;
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

// EOF
