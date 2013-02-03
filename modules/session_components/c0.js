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
 * @class C0Control
 */
var C0Control = new Class().extends(Plugin)
                           .depends("screen");
C0Control.definition = {

  id: "c0control",

  getInfo: function getInfo()
  {
    return {
      name: _("C0 Control Handlers"),
      version: "0.1",
      description: _("Handle C0 controls.")
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

  /** uninstalls itself.
   */
  "[uninstall]":
  function uninstall()
  {
    this._screen = null;
  },

  "[subscribe('set/newline-mode'), enabled]":
  function onChangeNewlineMode(mode)
  {
    this._newline_mode = mode;
  },

  /** Null.
   *
   * Ignored when received (not stored in input buffer) and used as a fill
   * character.
   *
   */
  "[profile('vt100'), sequence('0x00')]":
  function NUL()
  {
  },

  /** Start of heading.
   */
  "[profile('vt100'), sequence('0x01')]":
  function SOH()
  {
    coUtils.Debug.reportWarning(
      _("%s sequence [%s] was ignored."),
      "SOH", Array.slice(arguments));
  },

  /** Start of text.
   */
  "[profile('vt100'), sequence('0x02')]":
  function STX()
  {
    coUtils.Debug.reportWarning(
      _("%s sequence [%s] was ignored."),
      "STX", Array.slice(arguments));
  },

  /** End of text.
   *
   * Can be selected as a half-duplex turnaround character.
   *
   */
  "[profile('vt100'), sequence('0x03')]":
  function ETX()
  {
    coUtils.Debug.reportWarning(
      _("%s sequence [%s] was ignored."),
      "ETX", Array.slice(arguments));
  },

  /** End of transmission.
   *
   * This character can be selected as a disconnect character or as a
   * half-duplex turnaround character. When used as a turnaround character,
   * the disconnect character is DLE-EOT.
   *
   */
  "[profile('vt100'), sequence('0x04')]":
  function EOT()
  {
    coUtils.Debug.reportWarning(
      _("%s sequence [%s] was ignored."),
      "EOT", Array.slice(arguments));
  },

  /** Enquire.
   *
   * This character transmits the answerback message.
   *
   */
  "[profile('vt100'), sequence('0x05')]":
  function ENQ()
  {
    this.sendMessage("command/answerback");
  },

  /** Acknowledge.
   */
  "[profile('vt100'), sequence('0x06')]":
  function ACK()
  {
    coUtils.Debug.reportWarning(
      _("%s sequence [%s] was ignored."),
      "ACK", Array.slice(arguments));
  },

  /** Bell.
   *
   * Generates bell tone.
   *
   */
  "[profile('vt100'), sequence('0x07', 'ESC g')]":
  function BEL()
  {
    this.sendMessage("sequence/bel");
  },

  /** Back space.
   *
   * Moves cursor to the left one character position; if cursor is at left
   * margin, no action occurs.
   *
   */
  "[profile('vt100'), sequence('0x08')]":
  function BS()
  { // BackSpace
    this._screen.backSpace();
  },

  /** 0x09 HT is in tabcontroller.js */

  /** Linefeed.
   *
   *  Causes a linefeed or a new line operation. (See linefeed/new line mode.)
   *  Also causes printing if auto print operation selected.
   */
  "[profile('vt100'), sequence('0x0A')]":
  function LF()
  {
    var screen = this._screen;

    screen.lineFeed();

    if (this._newline_mode) {
      screen.carriageReturn();
    }
  },

  /** Vertical tabulation.
   *
   * Processed as LF.
   *
   */
  "[profile('vt100'), sequence('0x0B')]":
  function VT()
  {
    var screen = this._screen;

    screen.lineFeed();

    if (this._newline_mode) {
      screen.carriageReturn();
    }
  },

  /** Form feed.
   *
   * This character is processed as LF.
   * It can also be selected as a half-duplex turnaround character.
   *
   */
  "[profile('vt100'), sequence('0x0C')]":
  function FF()
  {
    var screen = this._screen;

    screen.lineFeed();

    if (this._newline_mode) {
      screen.carriageReturn();
    }
  },

  /** Carriage return.
   *
   *  This character moves the cursor to left margin on the current line.
   *  It can also be selected as a half-duplex turnaround character.
   *
   */
  "[profile('vt100'), sequence('0x0D')]":
  function CR()
  { // Carriage Return
    var screen;

    screen = this._screen;
    screen.carriageReturn();
  },

  /** Shift out.
   *
   * Selects G1 character set designated by a select character set sequence.
   *
   */
  "[profile('vt100'), sequence('0x0E')]":
  function SO()
  { // shift out
    this.sendMessage("event/shift-out");
  },

  /** Shift in.
   *
   * Selects G0 character set designated by a select character set sequence.
   *
   */
  "[profile('vt100'), sequence('0x0F')]":
  function SI()
  { // shift out
    this.sendMessage("event/shift-in");
  },

  /** Data link escape.
   */
  "[profile('vt100'), sequence('0x10')]":
  function DLE()
  {
    coUtils.Debug.reportWarning(
      _("%s sequence [%s] was ignored."),
      "DLE", Array.slice(arguments));
  },

  /** Device control 1.
   */
  "[profile('vt100'), sequence('0x11')]":
  function DC1()
  {
    this.sendMessage("command/flow-control", true);
  },

  /** Device control 2.
   */
  "[profile('vt100'), sequence('0x12')]":
  function DC2()
  {
    coUtils.Debug.reportWarning(
      _("%s sequence [%s] was ignored."),
      "DC2", Array.slice(arguments));
  },

  /** Device control 3.
   *
   * This character is processed as XOFF. It causes the terminal to stop
   * transmitting all characters except XOFF and XON.
   *
   * This character can also be selected as a half-duplex turnaround character.
   *
   */
  "[profile('vt100'), sequence('0x13')]":
  function DC3()
  {
    this.sendMessage("command/flow-control", false);
  },

  /** Device control 4.
   */
  "[profile('vt100'), sequence('0x14')]":
  function DC4()
  {
    coUtils.Debug.reportWarning(
      _("%s sequence [%s] was ignored."),
      "DC4", Array.slice(arguments));
  },

  /** Negative acknowledge.
   */
  "[profile('vt100'), sequence('0x15')]":
  function NAK()
  {
    coUtils.Debug.reportWarning(
      _("%s sequence [%s] was ignored."),
      "NAK", Array.slice(arguments));
  },

  /** Synchronous idle.
   */
  "[profile('vt100'), sequence('0x16')]":
  function SYN()
  {
    coUtils.Debug.reportWarning(
      _("%s sequence [%s] was ignored."),
      "SYN", Array.slice(arguments));
  },

  /** End of transmission block.
   */
  "[profile('vt100'), sequence('0x17')]":
  function ETB()
  {
    coUtils.Debug.reportWarning(
      _("%s sequence [%s] was ignored."),
      "ETB", Array.slice(arguments));
  },

  /** Cancel of previous word or charactor.
   *
   * If received during an escape or control sequence, cancels the sequence
   * and displays substitution character ([]).
   *
   */
  "[profile('vt100'), sequence('0x18')]":
  function CAN()
  {
    coUtils.Debug.reportWarning(
      _("%s sequence [%s] was ignored."),
      "CAN", Array.slice(arguments));
  },

  /** End of medium.
   */
  "[profile('vt100'), sequence('0x19')]":
  function EM()
  {
    coUtils.Debug.reportWarning(
      _("%s sequence [%s] was ignored."),
      "EM", Array.slice(arguments));
  },

  /** Substitute.
   *
   * Processed as CAN.
   *
   */
  "[profile('vt100'), sequence('0x1A')]":
  function SUB()
  {
    coUtils.Debug.reportWarning(
      _("%s sequence [%s] was ignored."),
      "SUB", Array.slice(arguments));
  },

  /** File separator.
   */
  "[profile('vt100'), sequence('0x1C')]":
  function FS()
  {
    coUtils.Debug.reportWarning(
      _("%s sequence [%s] was ignored."),
      "FS", Array.slice(arguments));
  },

  /** Group separator.
   */
  "[profile('vt100'), sequence('0x1D')]":
  function GS()
  {
    coUtils.Debug.reportWarning(
      _("%s sequence [%s] was ignored."),
      "GS", Array.slice(arguments));
  },

  /** Record separator.
   */
  "[profile('vt100'), sequence('0x1E')]":
  function RS()
  {
    coUtils.Debug.reportWarning(
      _("%s sequence [%s] was ignored."),
      "RS", Array.slice(arguments));
  },

  /** Unit separator.
   */
  "[profile('vt100'), sequence('0x1F')]":
  function US()
  {
    coUtils.Debug.reportWarning(
      _("%s sequence [%s] was ignored."),
      "US", Array.slice(arguments));
  },

  /** Delete.
   */
  "[profile('vt100'), sequence('0x7F', '0xFF')]":
  function DEL()
  {
    coUtils.Debug.reportWarning(
      _("%s sequence [%s] was ignored."),
      "DEL", Array.slice(arguments));
  },

};

/**
 * @fn main
 * @brief Module entry point.
 * @param {Broker} broker The Broker object.
 */
function main(broker)
{
  new C0Control(broker);
}

// EOF
