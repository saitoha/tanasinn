/* -*- Mode: JAVASCRIPT; tab-width: 2; indent-tabs-mode: nil; c-basic-offset: 2 -*-
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
 * @concept ScannerConcept
 */
var ScannerConcept = new Concept();
ScannerConcept.definition = {

  id: "ScannerConcept",

  // signature concept
  "assign :: String -> Undefined":
  _("Assign new string data. position is reset."),

  "current :: Uint16":
  _("Returns a code point at current scanning position."),

  "moveNext :: Undefined":
  _("Moves to next position."),

  "setAnchor :: Undefined":
  _("Momorize current position."),

  "setSurplus :: Undefined":
  _("Momorize surplus chars."),

  "getCurrentToken :: String":
  _("Returns chars from the momorized position to current position."),

}; // ScannerConcept


/**
 * @class Scanner
 * @brief Character scanner for UTF-8 characters sequence.
 */
var Scanner = new Class().extends(Plugin)
                         .requires("ScannerConcept");
Scanner.definition = {

  id: "scanner",

  /** provide plugin information */
  getInfo: function getInfo()
  {
    return {
      name: _("Scanner"),
      version: "0.1",
      description: _("Scan input text stream.")
    };
  },

  "[persistable] enabled_when_startup": true,

  _value: null,
  _position: 0,
  _anchor: 0,
  _nextvalue: null,

  /** Installs itself.
   *  @param {InstallContext} context A InstallContext object.
   */
  "[install]":
  function install(context)
  {
  },

  /** Uninstalls itself.
   */
  "[uninstall]":
  function uninstall()
  {
    this._value = null;
    this._position = null;
    this._anchor = null;
    this._nextvalue = null;
  },

  /** Assign new string data. position is reset. */
  "[type('String -> Undefined')] assign":
  function assign(value)
  { // re-assign new value.
    if (this._nextvalue) {
      this._value = this._nextvalue;  // TODO: performance improvment.
      this._nextvalue = value;
    } else {
      this._value = value;
    }
    this._position = 0;
  },

  /** Returns single byte code point. */
  "[type('Uint16')] current":
  function current()
  {
    var code = this._value.charCodeAt(this._position);
    return code;
  },

  /** Moves to next position. */
  "[type('Undefined')] moveNext":
  function moveNext()
  {
    ++this._position;
    if (this.isEnd) {
      if (this._hasNextValue()) {
        this._switchToNextValue();
      }
    }
  },

  /** Returns whether scanner position is at end. */
  get isEnd()
  {
    return this._position >= this._value.length;
  },

  "[type('Undefined')] setAnchor":
  function setAnchor()
  {
    this._anchor = this._position;
  },

  "[type('Undefined')] rollback":
  function rollback()
  {
    this._position = this._anchor;
  },

  "[type('Undefined')] setSurplus":
  function setSurplus()
  {
    this._nextvalue = this._value.substr(this._anchor);
  },

  "[type('String')] getCurrentToken":
  function getCurrentToken()
  {
    return this._value.slice(this._anchor, this._position + 1);
  },

  drain: function drain()
  {
    var value = this._value.substr(this._position + 1);

    this._value = "";
    this._position = 0;
    this._anchor = 0;
    this._anchor = 0;
    this._nextvalue = null;

    return value;
  },

  _hasNextValue: function _hasNextValue()
  {
    return null !== this._nextvalue;
  },

  _switchToNextValue: function _switchToNextValue()
  {
    this._value = this._nextvalue;
    this._nextvalue = null;
    this._position = 0;
  },

  /** test */
  "[test]":
  function()
  {
    var enabled = this.enabled;

    try {
      this.uninstall();
      this.install();

      // assign string data
      this.assign("abcde");

      // indicate first character position
      coUtils.Debug.assert("a".charCodeAt(0) === this.current());

    } finally {
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
  new Scanner(broker);
}

// EOF
