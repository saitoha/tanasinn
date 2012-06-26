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
 * @class CursorState
 * @brief Manages cursor position.
 */
var CursorState = new Class().extends(Plugin)
                             .depends("linegenerator");
CursorState.definition = {

  get id()
    "cursorstate",

  positionX: 0,
  positionY: 0,

  attr: null,

  _originX: 0,
  _originY: 0,

  _DECOM: false,

  get originX()
  {
    if (this._DECOM) {
      return this._originX;
    }
    return 0;
  },

  set originX(value)
  {
    this._originX = value;
  },

  get originY()
  {
    if (this._DECOM) {
      return this._originY;
    }
    return 0;
  },

  set originY(value)
  {
    this._originY = value;
  },

  get DECOM()
  {
    return this._DECOM;
  },

  set DECOM(value)
  {
    this._DECOM = value;
    if (value) {
      this._originY = this.positionY;
      this._originX = this.positionX;
    } else {
      this._originY = 0;
      this._originX = 0;
    }
  },

  // Using this flag insted of emurator._decMode.TCEM.
  visibility: true,

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

  /** constructor */
  "[install]":
  function install(broker) 
  {
    this.attr = this.dependency["linegenerator"]
      .allocate(1, 1)
      .shift()
      .cells
      .shift();
  },

  /** reset cursor state. */
  "[subscribe('command/{soft | hard}-terminal-reset'), enabled]":
  function reset() 
  {
    this.positionX = 0;
    this.positionY = 0;
    this.originX = 0;
    this.originY = 0;
    this._backup_instance = null;
    this.blink = false;
    this.attr.clear(); // turns all character attributes off (normal settings).
  },

  /** backup current cursor state. */
  backup: function backup() 
  {
    var context;

    context = {};
    this._backup_instance = context;
    this.sendMessage("command/save-cursor", context);

    context.positionX = this.positionX;
    context.positionY = this.positionY;
    context.originX = this.originX;
    context.originY = this.originY;
    context.visibility = this.visibility;
    context.blink = this.blink;
    context.attr_value = this.attr.value;
  },

  /** restore cursor state from the backup instance. */
  restore: function restore() 
  {
    var context;

    context = this._backup_instance;
    if (null === context) {
      coUtils.Debug.reportWarning(
        _('Cursor backup instance not found.'));
      return;
    }
    this.sendMessage("command/restore-cursor", context);

    this.positionX = context.positionX;
    this.positionY = context.positionY;
    this.originX = context.originX;
    this.originY = context.originY;
    this.visibility = context.visibility;
    this.blink = context.blink;
    this.attr.value = context.attr_value;
  },

  serialize: function serialize(context)
  {
    var backup;

    context.push(this.positionX);
    context.push(this.positionY);
    context.push(this.originX);
    context.push(this.originY);
    context.push(this.visibility);
    context.push(this.blink);
    context.push(this.attr.value);
    context.push(null !== this._backup_instance);
    backup = this._backup_instance;
    if (null !== backup) {
      context.push(backup.positionX);
      context.push(backup.positionY);
      context.push(backup.originX);
      context.push(backup.originY);
      context.push(backup.visibility);
      context.push(backup.blink);
      context.push(backup.attr_value);
    }
  },

  deserialize: function deserialize(context)
  {
    var backup_exists, backup;

    this.positionX = context.shift();
    this.positionY = context.shift();
    this.originX = context.shift();
    this.originY = context.shift();
    this.visibility = context.shift();
    this.blink = context.shift();
    this.attr.value = context.shift();
    backup_exists = context.shift();
    if (backup_exists) {
      backup = this._backup_instance = {};
      backup.positionX = context.shift();
      backup.positionY = context.shift();
      backup.originX = context.shift();
      backup.originY = context.shift();
      backup.visibility = context.shift();
      backup.blink = context.shift();
      backup.attr_value = context.shift();
    }
  },
 
  "[subscribe('event/drcs-state-changed/g0'), enabled]": 
  function onDRCSStateChangedG0(state) 
  {
    if (null !== state) {
      this.attr.drcs = true;
    } else {
      this.attr.drcs = false;
    }
  },
 
  "[subscribe('event/drcs-state-changed/g1'), enabled]": 
  function onDRCSStateChangedG1(state) 
  {
    if (null !== state) {
      this.attr.drcs = true;
    } else {
      this.attr.drcs = false;
    }
  },

  /**
   *
   * DECSC — Save Cursor
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
   *   - TODO: Selective erase attribute
   *   - TODO: Any single shift 2 (SS2) or single shift 3 (SS3) functions sent
   */
  "[profile('vt100'), sequence('ESC 7')] DECSC": 
  function DECSC() 
  {
    this.backup(); 
  },
   
  /**
   * DECRC — Restore Cursor
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


