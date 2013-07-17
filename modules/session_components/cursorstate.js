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
 * @class CursorState
 * @brief Manages cursor position.
 */
var CursorState = new Class().extends(Plugin)
                             .depends("linegenerator");
CursorState.definition = {

  id: "cursorstate",

  /** plugin information */
  getInfo: function getInfo()
  {
    return {
      name: _("Cursor State"),
      version: "0.1",
      description: _("The cursor state object.")
    };
  },

  position_x: 0,
  position_y: 0,

  attr: null,

  _blink: true,

  _backup_instance: null,

  _drcs_state: null,

  "[persistable] enabled_when_startup": true,

  get blink()
  {
    return this._blink;
  },

  set blink(value)
  {
    if (this._blink !== value) {
      this.sendMessage("command/terminal-cursor-blinking-mode-change", value);
    }
    this._blink = value;;
  },

  /** Installs itself.
   *  @param {InstallContext} context A InstallContext object.
   */
  "[install]":
  function install(context)
  {
    this.attr = context["linegenerator"]
      .allocate(1, 1)
      .shift()
      .cells
      .shift();
  },

  /** Uninstalls itself.
   */
  "[uninstall]":
  function uninstall()
  {
    this.attr = null;
  },

  "[subscribe('sequence/sm/33'), pnp]":
  function WYSTCURM_ON()
  {
    this._cursor_state.blink = true;
  },

  "[subscribe('sequence/rm/33'), pnp]":
  function WYSTCURM_OFF()
  {
    this._cursor_state.blink = false;
  },

  /** reset cursor state. */
  "[subscribe('command/{soft | hard}-terminal-reset'), enabled]":
  function reset()
  {
    this.position_x = 0;
    this.position_y = 0;
    this._backup_instance = null;
    this.blink = false;
    this.attr.clear(); // turns all character attributes off (normal settings).
  },

  /** backup current cursor state. */
  "[subscribe('command/backup-cursor-state'), enabled]":
  function backup()
  {
    var context = {};

    this._backup_instance = context;
    this.sendMessage("command/save-cursor", context);

    context.position_x = this.position_x;
    context.position_y = this.position_y;
    context.blink = this.blink;
    context.attr_value = this.attr.value;
  },

  /** restore cursor state from the backup instance. */
  "[subscribe('command/restore-cursor-state'), enabled]":
  function restore()
  {
    var context = this._backup_instance;

    if (null !== context) {
      this.position_x = context.position_x;
      this.position_y = context.position_y;
      this.blink = context.blink;
      this.attr.value = context.attr_value;
      this.sendMessage("command/restore-cursor", context);
    }
  },

  serialize: function serialize(context)
  {
    var backup;

    context.push(this.position_x);
    context.push(this.position_y);
    context.push(this.blink);
    context.push(this.attr.value);
    context.push(null !== this._backup_instance);

    backup = this._backup_instance;

    if (null !== backup) {
      context.push(backup.position_x);
      context.push(backup.position_y);
      context.push(backup.blink);
      context.push(backup.attr_value);
    }
  },

  deserialize: function deserialize(context)
  {
    var backup_exists, backup;

    this.position_x = context.shift();
    this.position_y = context.shift();
    this.blink = context.shift();
    this.attr.value = context.shift();

    backup_exists = context.shift();

    if (backup_exists) {
      backup = this._backup_instance = {};
      backup.position_x = context.shift();
      backup.position_y = context.shift();
      backup.blink = context.shift();
      backup.attr_value = context.shift();
    }
  },

  /**
   *
   * DECSC - Save Cursor
   *
   * Format
   *    ESC    7
   *    1/11   3/7
   *
   * Description
   *
   * Saves the following items in the terminal's memory:
   *
   *   - Cursor position
   *   - Character attributes set by the SGR command
   *   - Character sets (G0, G1, G2, or G3) currently in GL and GR
   *   - TODO: Wrap flag (autowrap or no autowrap)
   *   - State of origin mode (DECOM)
   *   - Selective erase attribute
   *   - TODO: Any single shift 2 (SS2) or single shift 3 (SS3) functions sent
   */
  "[profile('vt100'), sequence('ESC 7')] DECSC":
  function DECSC()
  {
    this.backup();
  },

  /**
   * DECRC - Restore Cursor
   *
   * Restores the terminal to the state saved by the save cursor (DECSC) function.
   *
   * Format
   *    ESC     8
   *    1/11    3/8
   *
   * Description
   *
   * If nothing was saved by DECSC, then DECRC performs the following actions:
   *
   *   - Moves the cursor to the home position (upper left of screen).
   *   - Resets origin mode (DECOM).
   *   - Turns all character attributes off (normal setting).
   *   - TODO: Maps the ASCII character set into GL, and the DEC Supplemental
   *     Graphic set into GR.
   *
   * Notes on DECSC and DECRC
   *
   * The terminal maintains a separate DECSC buffer for the main display and
   * the status line. This feature lets you save a separate operating state
   * for the main display and the status line.
   */
  "[profile('vt100'), sequence('ESC 8')] DECRC":
  function DECRC()
  {
    this.restore();
  },

  "[profile('vt100'), sequence('CSI u')] RCP":
  function SCORCP()
  {
    this.restore();
  },

  /**
   *
   * DECCIR - Cursor Information Report (Terminal to Host)
   *
   * The terminal sends this sequence in response to a request presentation
   * state report (DECRQPSR) sequence, CSI 1 $ w. DECCIR reports the status of
   * the cursor position, including visual attributes and character protection
   * attributes. DECCIR also reports the status of origin mode (DECOM) and the
   * current active character sets.
   *
   * Format
   *
   * DCS   1     $     u     D ... D   ST
   * 9/0   3/1   2/4   7/5   D ... D   9/12
   *
   * Description
   *
   * DECCIR reports all the character sets if they are assigned to one of the
   * G0, G1, G2, or G3 sets. Refer to SCS - Select Character Set for all
   * character set designators.
   *
   * Parameters
   *
   * D...D
   * is the data string containing the cursor information. The format for this
   * data string is as follows:
   *
   * Pr; Pc; Pp; Srend; Satt; Sflag; Pgl; Pgr; Scss; Sdesig
   *
   * Pr
   * is the number of the line the cursor is on.
   *
   * Pc
   * is the number of the column the cursor is at.
   *
   * Pp
   * is the number of the current page.
   *
   * Srend
   * is one or more characters indicating the visual attributes, such as bold
   * or blinking, currently in use for writing. To find out what attributes
   * are set, you must convert the character to an 8-bit binary number. The
   * bits are used as follows.
   *
   * --------------------------------------------------------------------------
   * Bit   Attribute              Bit Value
   * --------------------------------------------------------------------------
   * 8     -                      Always 0 (off).
   * 7     -                      Always 1 (on).
   * 6     Extension indicator    1 = another character (byte) of visual
   *                                  attribute data follows this one.
   *                              0 = no more attribute data.
   * 5     -                      Always 0 (off).
   * 4     Reverse video          0 = off.
   *                              1 = on.
   * 3     Blinking               0 = off.
   *                              1 = on.
   * 2     Underline              0 = off.
   *                              1 = on.
   * 1     Bold                   0 = off.
   *                              1 = on.
   * --------------------------------------------------------------------------
   *
   * Example
   * If the bold and underline attributes are currently set for writing, Srend
   * is the ASCII uppercase C character (010000112).
   *
   * Satt
   * is one or more characters indicating any selective erase attributes
   * currently set for writing.
   *
   * To find what attributes are set, you must convert each character to an
   * 8-bit binary number. Use the following table to find the meaning of the
   * 8-bit binary number:
   *
   * --------------------------------------------------------------------------
   * Bit   Attribute                  Bit Value
   * --------------------------------------------------------------------------
   * 8     -                          Always 0 (off).
   * 7     -                          Always 1 (on).
   * 6     Extension indicator        1 = another character (byte) of selective
   *                                      erase data follows this one.
   *                                  0 = no more protection data.
   * 5     -                          0 Reserved for future use.
   * 4     -                          0 Reserved for future use.
   * 3     -                          0 Reserved for future use.
   * 2     -                          0 Reserved for future use.
   * 1     Selective erase (DECSCA)   0 = off.
   *                                  1 = on.
   * --------------------------------------------------------------------------
   *
   * Example
   * If the selective erase protection attribute is currently set for writing,
   * then Satt is the ASCII uppercase A character (010000012).
   *
   * Sflag
   * is one or more characters that indicate several flags and modes the
   * terminal must save.
   *
   * To see the current state of the flags and modes, you must convert each
   * character to an 8-bit binary number. Use the following table to find the
   * meaning of the 8-bit binary number:
   *
   * --------------------------------------------------------------------------
   * Bit   Attribute                      Bit Value
   * --------------------------------------------------------------------------
   * 8     -                              Always 0 (off).
   * 7     -                              Always 1 (on).
   * 6     Extension indicator            1 = another character (byte) of flag
   *                                          data follows this one.
   *                                      0 = no more flag data.
   * 5     -                              0 Reserved for future use.
   * 4     Autowrap                       1 = autowrap pending.
   *                                      0 = autowrap not pending.
   * 3     Single shift 3 (SS3) setting   1 = G3 is mapped into GL for the next
   *                                          typed character only.
   *                                      0 = single shift 3 is off.
   * 2     Single shift 2 (SS2) setting   1 = G2 is mapped into GL for the next
   *                                          typed character only.
   *                                      0 = single shift 2 is off.
   * 1     Origin mode                    1 = origin mode set.
   *                                      0 = origin mode reset.
   * --------------------------------------------------------------------------
   *
   * Example
   * If origin mode is set, autowrap is pending, and a single shift 3 has been
   * received, then Sflag is the ASCII uppercase M character (010011012).
   *
   * Pgl
   * indicates the number of the logical character set (G0 through G3) mapped
   * into GL.
   *
   * 0 = G0 is in GL.  2 = G2 is in GL.
   * 1 = G1 is in GL.  3 = G3 is in GL.
   *
   * Pgr
   * indicates the number of the logical character set (G0 through G3) mapped
   * into GR.
   *
   * 0 = G0 is in GR.  2 = G2 is in GR.
   * 1 = G1 is in GR.  3 = G3 is in GR.
   *
   * Scss
   * is a character indicating the size of the character sets in G0 through G3.
   *
   * To find out what the character means, you must convert it to an 8-bit
   * binary number. Use the following table to find the meaning of the 8-bit binary number:
   *
   * --------------------------------------------------------------------------
   * Bit   Attribute              Bit Value
   * --------------------------------------------------------------------------
   * 8     -                      Always 0 (off).
   * 7     -                      Always 1 (on).
   * 6     Extension indicator    1 = another character (byte) of character
   *                                  size data follows this one.
   *                              0 = no more size data.
   * 5     -                      0 Reserved for future use.
   * 4     G3 set size            0 = 94 characters.
   *                              1 = 96 characters.
   * 3     G2 set size            0 = 94 characters.
   *                              1 = 96 characters.
   * 2     G1 set size            0 = 94 characters.
   *                              1 = 96 characters.
   * 1     G0 set size            0 = 94 characters.
   *                              1 = 96 characters.
   * --------------------------------------------------------------------------
   *
   * Example
   * Suppose the following conditions exist:
   *
   *     The ISO Latin-1 supplemental set is designated as G2 and G3.
   *     The ASCII set is designated as G0 and G1.
   *     Single shift 2 (SS2) is set.
   *
   * Then Scss is the ASCII backslash \ character (010111002).
   *
   * Sdesig
   * is a string of intermediate and final characters indicating the character
   * sets designated as G0 through G3. These final characters are the same as
   * those used in select character set (SCS) sequences.
   *
   * Example
   *
   * Suppose the ASCII character set is designated as G0, DEC Special Graphic
   * as G1, and DEC Supplemental Graphic as G2 and G3. The Sdesig string would
   * be B0%5%5. Each character corresponds to a final character in an SCS
   * sequence, as follows:
   *
   * G0   B   ASCII set
   * G1   0   DEC Special Graphic
   * G2   %5  DEC Supplemental Graphic
   * G3   %5  DEC Supplemental Graphic
   *
   * Example
   *
   * The following is an example of a cursor information report:
   *
   * DCS 1 $ u 1; 1; 1; @; @; @; 0; 2; @; BB%5%5 ST
   *
   * 1; 1; 1; indicates that the cursor is at row 1, column 1, on the first
   * page.
   *
   * @; @; @; indicates that (1) no visual character attributes or selective
   * erase attributes are set for writing, (2) DECOM is reset, and (3) there
   * is no SS2, SS3, or autowrap pending.
   *
   * 0; 2; indicates that G0 is mapped into GL, and G2 is in GR.
   *
   * @; indicates that all character sets have 94 characters.
   *
   * BB%5%5 indicates that ASCII is in G0 and G1, and DEC Supplemental Graphic
   * is in G2 and G3.
   *
   * Notes on DECCIR
   *
   *     The cursor information in a DECCIR sequence is the same information
   *     saved through a save cursor (DECSC) command.
   *
   */
  "[subscribe('command/report-cursor-information'), pnp]":
  function DECCIR()
  {
    var pr,
        pc,
        pp,
        srend,
        satt,
        sflag,
        pgl,
        pgr,
        css,
        sdesig;

    pr = position_y + 1;
    pc = position_x + 1;

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


};

/**
 * @fn main
 * @brief Module entry point.
 * @param {Broker} broker The Broker object.
 */
function main(broker)
{
  new CursorState(broker);
}

// EOF
