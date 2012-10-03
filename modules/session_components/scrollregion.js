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
 * @class ScrollRegion
 *
 * DECSTBM — Set Top and Bottom Margins
 *
 * This control function sets the top and bottom margins for the current 
 * page. You cannot perform scrolling outside the margins.
 *
 * Default: Margins are at the page limits.
 * 
 * Format:
 *
 *  CSI  Pt  ;    Pb  r
 *  9/11 3/n 3/11 3/n 7/2
 *
 *  Pt is the line number for the top of margin.
 *  Default: Pt = 1.
 *
 *  Pb is the line number for the bottom of margin.
 *  Default: Pb = current number of lines per screen.
 *
 *  Notes on DECSTBM
 *  - The value of the top margin (Pt) must be less than the bottom 
 *    margin (Pb).
 *  - The maximum size of the scrolling region is the page size.
 *  - DECSTBM moves the cursor to column 1, line 1 of the page.
 *
 */
var ScrollRegion = new Class().extends(Plugin)
                              .depends("screen");
ScrollRegion.definition = {

  id: "scroll_region",

  getInfo: function getInfo()
  {
    return {
      name: _("Scroll Region"),
      version: "0.1",
      description: _("Set/Reset scroll region(DECSTBM) with escape sequence.")
    };
  },

  "[persistable] enabled_when_startup": true,

  _screen: null,

  /** Installs itself. 
   *  @param {InstallContext} context A InstallContext object.
   */
  "[install]":
  function install(context)
  {
    this._screen = context["screen"];
  },

  /** Uninstalls itself. 
   */
  "[uninstall]":
  function uninstall()
  {
    this._screen = null;
  },

  "[profile('vt100'), sequence('CSI %dr', 'CSI %d>')]":
  function DECSTBM(n1, n2) 
  {
    var screen = this._screen,
        min = 0,
        max = screen.height,
        top = (n1 || min + 1) - 1,
        bottom = arguments.length > 1 ? n2: max,
        tmp;

    // set scrolling region

    // Trim top, bottom with min, max.
    top = Math.max(top, min);
    top = Math.min(top, max);
    bottom = Math.max(bottom, min);
    bottom = Math.min(bottom, max);

    if (top > bottom) {
      // swap
      tmp = top;
      top = bottom;
      bottom = top;
    }

    if (top < bottom) {
      screen.setScrollRegion(top, bottom);
      /*
      coUtils.Debug.reportMessage(
        "Scrolling region was set [%d:%d]. arguments: (%d, %d).", 
        top, bottom, n1, n2);
        */
    } else {
      coUtils.Debug.reportWarning(
        _("%s sequence [%s] was ignored."),
        "DECSTBM", Array.slice(arguments));
    }
    // TODO: I wonder if I should implement this feature.
    // DECSTBM moves the cursor to column 1, line 1 of the page.
    screen.setPositionX(0);
    screen.setPositionY(top);
//    screen.cursor.originX = screen.cursor.positionX; 
    screen.cursor.originY = screen.cursor.positionY; 

  },

  "[subscribe('sequence/decrqss/decstbm'), pnp]":
  function onRequestStatus(data) 
  {
    var screen = this._screen,
        top = screen.scrollTop + 1,
        bottom = screen.scrollBottom,
        message = "0$r" + top + ";" + bottom + "r";

    this.sendMessage("command/send-sequence/decrpss", message);
  },

  /** Reset scroll region.
   */
  "[subscribe('command/reset-scroll-region'), pnp]":
  function reset() 
  { 
    this.DECSTBM();
  },

  /** Soft/Hard terminal reset.
   */
  "[subscribe('command/{soft | hard}-terminal-reset'), pnp]":
  function reset() 
  { 
    this.DECSTBM();
  },

}; // class ScrollRegion

/**
 * @fn main
 * @brief Module entry point.
 * @param {Broker} broker The Broker object.
 */
function main(broker) 
{
  new ScrollRegion(broker);
}

// EOF
