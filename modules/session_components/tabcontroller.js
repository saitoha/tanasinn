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
 * @trait TabController
 */
var TabController = new Class().extends(Plugin)
                               .depends("cursorstate")
                               .depends("screen");
TabController.definition = {
  
  /** Component ID */
  get id()
    "tab_controller",

  get info()
    <plugin>
        <name>{_("Tab Controller")}</name>
        <description>{
          _("Retain tab-stop state and operate it.")
        }</description>
        <version>0.1.0</version>
    </plugin>,

  "[persistable] enabled_when_startup": true,

  _screen: null,
  _cursor: null,
  _tab_stops: null,

  /** installs itself. 
   *  @param {Broker} broker A Broker object.
   */
  "[install]":
  function install(broker)
  {
    this._screen = this.dependency["screen"];
    this._cursor = this.dependency["cursorstate"];
    this._resetTabStop();
  },

  /** uninstalls itself. 
   *  @param {Broker} broker A Broker object.
   */
  "[uninstall]":
  function uninstall(broker)
  {
    this._screen = null;
    this._cursor = null;
    this._tab_stops = null;
  },
   
  /** Horizontal tabulation.
   */
  "[profile('vt100'), sequence('0x09'), type('Undefined')]":
  function HT() 
  { // Horizontal Tab
    var cursor = this._cursor,
        tab_stops = this._tab_stops,
        screen = this._screen,
        line = screen.getCurrentLine(),
        width = screen.width,
        max,
        positionX,
        i,
        stop,
        screen;

    if (coUtils.Constant.LINETYPE_NORMAL === line.type) {
      max = 0 === tab_stops.length ? 0: tab_stops[tab_stops.length - 1];
    } else {
      max = width / 2 - 1 | 0;
    }

    positionX = cursor.positionX;
    if (positionX > max) {
      //if (this._wraparound_mode) {
        cursor.positionX = 0;
        this._screen.lineFeed();
        return;
      //}
    }

    for (i = 0; i < tab_stops.length; ++i) {
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
  "[profile('vt100'), sequence('CSI ?%dW')]":
  function DECST8C(n) 
  { 
    if (5 === n) {
      // Set Tab at Every 8 Columns
      this._resetTabStop();
    } else {
      coUtils.Debug.reportWarning(
        _("%s sequence [%s] was ignored."),
        arguments.callee.name, Array.slice(arguments));
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
        tab_stops = this._tab_stops,
        result = [],
        i;

    for (i = 0; i < tab_stops.length; ++i) {
      result.push(tab_stops[i] + 1);
    }
    result.pop();

    message = result.join("/");

    this.sendMessage("command/send-sequence/dcs", message);

  },

  /** reset tab stop on screen width changed */
  "[subscribe('variable-changed/screen.width'), pnp]":
  function onScreenWidthChanged()
  {
    this._resetTabStop();
  },

  /** reset tab stops */
  _resetTabStop: function _resetTabStop()
  {
    // update tab stops
    var width = this._screen.width,
        i;

    this._tab_stops = [];

    for (i = 8; i < width; i += 8) {
      this._tab_stops.push(i);
    }
    if (i != width - 1) {
      this._tab_stops.push(width - 1);
    }
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
    var cursor = this._cursor;

    this._tab_stops.push(cursor.positionX);
    this._tab_stops.sort(
      function(lhs, rhs)
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
  "[profile('vt100'), sequence('CSI %dg')]":
  function TBC(n) 
  { // TaB Clear
    var tab_stops, pisitionX, i, stop;

    switch (n || 0) {

      case 0:
        tab_stops = this._tab_stops;
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
          arguments.callee.name, Array.slice(arguments));

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
  "[profile('vt100'), sequence('CSI %dI')]":
  function CHT(n) 
  { // Cursor Horaizontal Tabulation
    var tab_stops = this._tab_stops,
        cursor = this._cursor,
        width = this._screen.width,
        positionX = cursor.positionX,
        i,
        stop,
        index;
 
    n = (n || 1) - 1;

    if (positionX > width - 1) {
      //if (this._wraparound_mode) {
        cursor.positionX = 0;
        this._screen.lineFeed();
        return;
      //}
    }
   
    for (i = 0; i < tab_stops.length; ++i) {
      stop = tab_stops[i];
      if (stop > positionX) {
        index = i + n;
        cursor.positionX = tab_stops[index % tab_stops.length];
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
  "[profile('vt100'), sequence('CSI %dZ')]":
  function CBT(n) 
  { // Cursor Backward Tabulation
    var tab_stops = this._tab_stops,
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
