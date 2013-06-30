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
 * Portions created by the Initial Developer are Copyright (C) 2010 - 2013
 * the Initial Developer. All Rights Reserved.
 *
 * ***** END LICENSE BLOCK ***** */

"use strict";


/**
 * @trait TabController
 */
var TabController = new Class().extends(Plugin)
                               .depends("cursorstate")
                               .depends("screen");
TabController.definition = {

  /** Component ID */
  id: "tab_controller",

  getInfo: function getInfo()
  {
    return {
      name: _("Tab Controller"),
      version: "0.1.0",
      description: _("Retain tab-stop state and operate it.")
    };
  },

  "[persistable] enabled_when_startup": true,

  _screen: null,
  _cursor: null,
  _tab_stops: null,

  /** Installs itself.
   *  @param {InstallContext} context A InstallContext object.
   */
  "[install]":
  function install(context)
  {
    this._screen = context["screen"];
    this._cursor = context["cursorstate"];
  },

  /** uninstalls itself.
   */
  "[uninstall]":
  function uninstall()
  {
    this._screen = null;
    this._cursor = null;
    this._tab_stops = null;
  },

  /** Horizontal tabulation.
   *
   * Moves cursor to next tab stop, or to right margin if there are no more
   * tab stops.
   *
   * In edit mode, the tab character positions the cursor, and the character
   * is not held in memory. When the character is received, the cursor moves
   * to one of the following locations.
   *
   *  - Next tab stop
   *  - Next field boundary (if erasure mode is set)
   *  - Next unprotected field (if erasure mode is reset)
   *  - First unprotected character position in the scrolling region (if the
   *    cursor is above the scrolling region)
   *  - Last character position of the screen (if the cursor is below the
   *    scrolling region)
   *
   * In edit mode, a tab received with no more tab stops or fields, causes the
   * cursor to move to the end of the screen region.
   *
   */
  "[profile('vt100'), sequence('0x09'), type('Undefined')]":
  function HT()
  { // Horizontal Tab
    var cursor = this._cursor,
        tab_stops = this._getTabStops(),
        screen = this._screen,
        line = screen.getCurrentLine(),
        width = screen.width,
        max,
        positionX,
        i = 0,
        stop,
        left_margin,
        right_margin;

    if (screen.hasLeftRightMargin()) {
      left_margin = screen.getScrollLeft();
      right_margin = screen.getScrollRight();
      if (0 === tab_stops.length) {
        max = left_margin;
      } else {
        max = left_margin + tab_stops[tab_stops.length - 1];
      }
    } else {
      left_margin = 0; 
      right_margin = screen.width; 

      if (coUtils.Constant.LINETYPE_NORMAL === line.type) {
        max = 0 === tab_stops.length ? 0: tab_stops[tab_stops.length - 1];
      } else {
        max = right_margin / 2 - 1 | 0;
      }
    }

    positionX = cursor.positionX;
    if (positionX > max) {
      //if (this._wraparound_mode) {
        cursor.positionX = left_margin;
        screen.lineFeed();
        return;
      //}
    }

    for (; i < tab_stops.length; ++i) {
      stop = tab_stops[i];
      if (stop > positionX) {
        cursor.positionX = stop;
        if (cursor.positionX >= max) {
          break;
        }
        return;
      }
    }

    cursor.positionX = max;
  },

  /**
   *
   * DECST8C - Set Tab at Every 8 Columns
   *
   * Set a tab stop at every eight columns starting with column 9.
   *
   * Format
   *
   * CSI    ?      5     W
   * 9/11   3/15   3/5   5/7
   *
   * Description
   *
   * Any tab stop setting before this command is executed is cleared
   * automatically. Control function TBC clears the tab stops on the display;
   * HTS sets a horizontal tab stop at the active column.
   *
   */
  "[profile('vt100'), sequence('CSI ? Pn W')]":
  function DECST8C(n)
  {
    if (5 === n) {
      // Set Tab at Every 8 Columns
      this._resetTabStop();
    } else {
      coUtils.Debug.reportWarning(
        _("%s sequence [%s] was ignored."),
        "DECST8C", Array.slice(arguments));
    }
  },

  /**
   *
   * DECTABSR - Tab Stop Report
   *
   * The terminal sends this sequence to the host in response to a request
   * presentation state report (DECRQPSR) sequence. DECTABSR informs the host
   * of the terminal's current tab settings.
   *
   * Programming Tip
   *
   * Applications can use information in the tab stop report to save the
   * current tab stops. Later, the application can restore the saved tab stops.
   *
   * This operation is useful for applications that need to temporarily change
   * the terminal's tab stops. When the application is finished, it can restore
   * the tab stops that were in effect before the application changed them. You
   * use the restore presentation state (DECRSPS) function to restore tab
   * stops. Refer to DECRSPS - Restore Presentation State for additional information.
   *
   * Format
   *
   * DCS   2     $     u     D ... D  ST
   * 9/0   3/2   2/4   7/5   ...      9/12
   *
   * Parameters
   *
   * D...D
   * is a data string indicating the column number location of each tab stop.
   *
   * Example
   *
   * The following is an example of a DECTABSR sequence:
   *
   * DCS 2 $ u 9/ 17/ 25/ 33/ 41/ 49/ 57/ 65/ 73 ST
   *
   * 9, 17, 25, 33, 41, 49, 57, 65, and 73 are the column numbers for tab stops.
   *
   */
  "[subscribe('command/report-tabstop-information'), pnp]":
  function DECTABSR()
  {
    var message,
        tab_stops = this._getTabStops(),
        result = [],
        i = 0;

    for (; i < tab_stops.length; ++i) {
      result.push(tab_stops[i] + 1);
    }
    result.pop();

    message = result.join("/");

    this.sendMessage("command/send-sequence/dcs", message);

  },

  /**
   * HTS - Horizontal Tab Set
   *
   * HTS sets a horizontal tab stop at the column position indicated by the
   * value of the active column when the terminal receives an HTS.
   *
   * You can use either one of the following formats:
   *
   * Format
   * HTS  or  ESC    H
   * 8/8  or  1/11   4/8
   *
   * Description
   * Executing an HTS does not effect the other horizontal tab stop settings.
   *
   */
  "[profile('vt100'), sequence('0x88', 'ESC H'), _('Tab set.')]":
  function HTS()
  {
    var cursor = this._cursor,
        tab_stops = this._getTabStops();

    tab_stops.push(cursor.positionX);
    tab_stops.sort(
      function sortFunc(lhs, rhs)
      {
        return lhs > rhs;
      });
  },

  /**
   *
   * TBC - Tab Clear
   *
   * This control function clears tab stops.
   *
   * Format
   *
   * CSI    Ps    g
   * 9/11   3/n   6/7
   *
   * Parameters
   *
   * Ps
   * indicates the tab stops to clear. There are only two values for Ps, 0 and 3.
   *
   * 0 or none (default) - The terminal only clears the tab stop at the cursor.
   * 3                   - The terminal clears all tab stops.
   *
   */
  "[profile('vt100'), sequence('CSI Ps g')]":
  function TBC(n)
  { // TaB Clear
    var tab_stops,
        positionX,
        i,
        stop;

    switch (n || 0) {

      case 0:
        tab_stops = this._getTabStops();
        positionX = this._cursor.positionX;;
        for (i = 0; i < tab_stops.length; ++i) {
          stop = tab_stops[i];
          if (stop === positionX) {
            tab_stops.splice(i, 1); // remove current tabstop.
          } else if (stop > positionX) {
            break;
          }
        }
        break;

      case 3:
        this._tab_stops = [];
        break;

      defalut:
        coUtils.Debug.reportWarning(
          _("%s sequence [%s] was ignored."),
          "TBC", Array.slice(arguments));

    }
  },

  /**
   *
   * CHT - Cursor Horizontal Forward Tabulation
   *
   * Move the active position n tabs forward.
   *
   * Default: 1.
   *
   * Format
   *
   * CSI    Pn   I
   * 9/11   3/n  4/9
   *
   * Parameters
   *
   * Pn is the number of active position tabs to move forward.
   * Description
   *
   * The active position is moved to the character position corresponding to
   * the following n-th horizontal tabulation stop.
   *
   */
  "[profile('vt100'), sequence('CSI Pn I')]":
  function CHT(n)
  { // Cursor Horaizontal Tabulation
    var tab_stops = this._getTabStops(),
        cursor = this._cursor,
        screen = this._screen,
        positionX = cursor.positionX,
        left_margin,
        right_margin,
        i,
        stop,
        index,
        length;

    if (screen.hasLeftRightMargin()) {
      left_margin = screen.getScrollLeft();
      right_margin = screen.getScrollRight();
    } else {
      left_margin = 0; 
      right_margin = screen.width; 
    }

    n = (n || 1) - 1;

    if (positionX > right_margin - 1) {
      screen.carriageReturn();
      screen.lineFeed();
      return;
    }

    length = tab_stops.length;

    for (i = 0; i < length; ++i) {
      stop = tab_stops[i];
      if (stop > positionX) {
        index = i + n;
        cursor.positionX = tab_stops[index % length];
        return;
      }
    }
  },

  /**
   *
   * CBT - Cursor Backward Tabulation
   *
   * Move the active position n tabs backward.
   *
   * Default: 1.
   *
   * Format
   *
   * CSI    Pn   Z
   * 9/11   3/n  5/10
   *
   * Parameters
   *
   * Pn is the number of active position tabs to move backward.
   *
   * Description
   *
   * The active position is moved to the character position corresponding to
   * the n-th preceding horizontal tabulation stop. If an attempt is made to
   * move the active position past the first character position on the line,
   * then the active position stays at column one.
   *
   */
  "[profile('vt100'), sequence('CSI Pn Z')]":
  function CBT(n)
  { // Cursor Backward Tabulation
    var tab_stops = this._getTabStops(),
        cursor = this._cursor,
        positionX = cursor.positionX,
        i,
        stop,
        index;

    n = (n || 1) - 1;

    for (i = tab_stops.length - 1; i >= 0; --i) {
      stop = tab_stops[i];
      if (stop < positionX) {
        index = Math.max(0, i - n);
        cursor.positionX = tab_stops[index];
        break;
      }
    }
  },

// event handlers
  /** reset tab stop on screen width changed */
  "[subscribe('variable-changed/screen.width'), pnp]":
  function onScreenWidthChanged()
  {
    this._tab_stops = null;
  },

  /** enable/disable left/right margin mode */
  "[subscribe('command/change-left-right-margin-mode'), pnp]":
  function onChangeLeftRightMarginMode(mode)
  {
    this._tab_stops = null;
  },

  /** enable/disable left/right margin mode */
  "[subscribe('event/left-right-margin-changed'), pnp]":
  function onLeftRightMarginChanged(mode)
  {
    this._tab_stops = null;
  },

// helpers
  /** get tab stops */
  _getTabStops: function _getTabStops()
  {
    if (null === this._tab_stops) {
      this._resetTabStops(); 
    }
    return this._tab_stops;
  },

  /** reset tab stops */
  _resetTabStops: function _resetTabStops()
  {
    // update tab stops
    var screen = this._screen,
        left_margin,
        right_margin,
        tab_stops = [],
        pos;

    if (screen.hasLeftRightMargin()) {
      left_margin = screen.getScrollLeft();
      right_margin = screen.getScrollRight();
    } else {
      left_margin = 0; 
      right_margin = screen.width; 
    }

    tab_stops.push(left_margin);
    for (pos = left_margin + 8 - left_margin % 8; pos < right_margin; pos += 8) {
      tab_stops.push(pos);
    }
    if (pos !== right_margin - 1) {
      tab_stops.push(right_margin - 1);
    }

    this._tab_stops = tab_stops;
  },

  /** test */
  "[test]":
  function()
  {
    var enabled = this.enabled;

    try {
      if (enabled) {
        assert(null !== this._screen);
        assert(null !== this._cursor);
      } else {
        assert(null === this._screen);
        assert(null === this._cursor);
      }
    } finally {
    }
  },


}; // TabController


/**
 * @fn main
 * @brief Module entry point.
 * @param {Broker} broker The Broker object.
 */
function main(broker)
{
  new TabController(broker);
}

// EOF
