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
 * @class AnswerBack
 *
 */
let AnswerBack = new Class().extends(Component);
AnswerBack.definition = {

  "[persistable] answerback_message": "tanasinn\r",

  _answerback_mode: false,

  /** retuns answerback message */
  "[subscribe('command/answerback'), enabled]":
  function answerback()
  {
    let session = this._broker;
    session.notify("command/send-to-tty", this.answerback_message);
  },

  /** */
  "[subscribe('command/change-answerback-mode'), enabled]":
  function changeAnswerBackMode(mode)
  {
    this._answerback_mode = Boolean(mode);
  },

};

/**
 * @class Control
 */
let Control = new Class().extends(Component);
Control.definition = {

  get id()
    "control",

  /** Post constructor */
  "[subscribe('initialized/{screen & ansimode}'), enabled]":
  function onLoad(screen, ansi_mode) 
  {
    this._screen = screen;
    this._ansi_mode = ansi_mode;
  },

  /** Null.
   */
  "[sequence('0x00')]":
  function NUL() 
  {
  },
  
  /** Start of heading.
   */
  "[sequence('0x01')]":
  function SOH() 
  {
    coUtils.Debug.reportWarning(
      "%s sequence [%s] was ignored.",
      arguments.callee.name, [].slice.apply(arguments));
  },
  
  /** Start of text.
   */
  "[sequence('0x02')]":
  function STX()  
  {
    coUtils.Debug.reportWarning(
      "%s sequence [%s] was ignored.",
      arguments.callee.name, [].slice.apply(arguments));
  },
 
  /** End of text.
   */
  "[sequence('0x03')]":
  function ETX() 
  {
    coUtils.Debug.reportWarning(
      "%s sequence [%s] was ignored.",
      arguments.callee.name, [].slice.apply(arguments));
  },

  /** Start of transmission.
   */
  "[sequence('0x04')]":
  function EOT() 
  {
    coUtils.Debug.reportWarning(
      "%s sequence [%s] was ignored.",
      arguments.callee.name, [].slice.apply(arguments));
  },
  
  /** Enquire.
   */
  "[sequence('0x05')]":
  function ENQ() 
  {
    let session = this._broker;
    session.notify("command/answerback");
  },
  
  /** Acknowledge.
   */
  "[sequence('0x06')]":
  function ACK() 
  {
    coUtils.Debug.reportWarning(
      "%s sequence [%s] was ignored.",
      arguments.callee.name, [].slice.apply(arguments));
  },
   
  /** Bell.
   */
  "[sequence('0x07', 'ESC \\\\')]":
  function BEL() 
  {
    let session = this._broker;
    session.notify("sequence/bel");
  },

  /** Back space.
   */
  "[sequence('0x08')]":
  function BS() 
  { // BackSpace
    let screen = this._screen;
    screen.backSpace();
  },
   
  /** Horizontal tabulation.
   */
  "[sequence('0x09')]":
  function HT() 
  { // Horizontal Tab
    let screen = this._screen;
    screen.horizontalTab();
  },
 
  /** Linefeed.
   */
  "[sequence('0x0A', 'ESC D')]":
  function LF() 
  {
    let screen = this._screen;
    screen.lineFeed();
    if (this._ansi_mode.LNM) {
      screen.carriageReturn();
    }
  },
  
  /** Vertical tabulation.
   */
  "[sequence('0x0B')]":
  function VT() 
  {
    let screen = this._screen;
    screen.lineFeed();
    if (this._ansi_mode.LNM) {
      screen.carriageReturn();
    }
  },

  /** Form feed.
   */
  "[sequence('0x0C')]":
  function FF() 
  {
    let screen = this._screen;
    screen.lineFeed();
    if (this._ansi_mode.LNM) {
      screen.carriageReturn();
    }
  },

  /** Carriage return.
   */
  "[sequence('0x0D', 'ESC E')]":
  function CR() 
  { // Carriage Return
    let screen = this._screen;
    screen.carriageReturn();
  },
    
  /** Shift out.
   */
  "[sequence('0x0E')]":
  function SO() 
  { // shift out
    let session = this._broker;
    session.notify("event/shift-out");
  },
  
  /** Shift in.
   */
  "[sequence('0x0F')]":
  function SI() 
  { // shift out
    let session = this._broker;
    session.notify("event/shift-in");
  },

  /** Data link escape.
   */
  "[sequence('0x10')]":
  function DLE() 
  {
    coUtils.Debug.reportWarning(
      "%s sequence [%s] was ignored.",
      arguments.callee.name, [].slice.apply(arguments));
  },
 
  /** Device control 1.
   */
  "[sequence('0x11')]":
  function DC1() 
  {
    let session = this._broker;
    //session.notify("command/send-to-tty", "\u0011");
    session.notify("command/flow-control", true);
  },
  
  /** Device control 2.
   */
  "[sequence('0x12')]":
  function DC2() 
  {
    coUtils.Debug.reportWarning(
      _("%s sequence [%s] was ignored.",
        arguments.callee.name, [].slice.apply(arguments)));
  },

  /** Device control 3.
   */
  "[sequence('0x13')]":
  function DC3() 
  {
    let session = this._broker;
    //session.notify("command/send-to-tty", "\u0013");
    session.notify("command/flow-control", false);
  },
  
  /** Device control 4.
   */
  "[sequence('0x14')]":
  function DC4() 
  {
    coUtils.Debug.reportWarning(
      _("%s sequence [%s] was ignored.",
        arguments.callee.name, [].slice.apply(arguments)));
  },
  
  /** Negative acknowledge.
   */
  "[sequence('0x15')]":
  function NAK() 
  {
    coUtils.Debug.reportWarning(
      _("%s sequence [%s] was ignored.",
        arguments.callee.name, [].slice.apply(arguments)));
  },
  
  /** Synchronous idle.
   */
  "[sequence('0x16')]":
  function SYN() 
  {
    coUtils.Debug.reportWarning(
      _("%s sequence [%s] was ignored.",
        arguments.callee.name, [].slice.apply(arguments)));
  },
  
  /** End of transmission block.
   */
  "[sequence('0x17')]":
  function ETB() 
  {
    coUtils.Debug.reportWarning(
      _("%s sequence [%s] was ignored.",
        arguments.callee.name, [].slice.apply(arguments)));
  },
  
  /** Cancel of previous word or charactor.
   */
  "[sequence('0x18')]":
  function CAN() 
  {
    coUtils.Debug.reportWarning(
      _("%s sequence [%s] was ignored.",
        arguments.callee.name, [].slice.apply(arguments)));
  },
  
  /** End of medium.
   */
  "[sequence('0x19')]":
  function EM() 
  {
    coUtils.Debug.reportWarning(
      _("%s sequence [%s] was ignored.",
        arguments.callee.name, [].slice.apply(arguments)));
  },
  
  /** Substitute.
   */
  "[sequence('0x1A')]":
  function SUB()
  {
    coUtils.Debug.reportWarning(
      _("%s sequence [%s] was ignored.",
        arguments.callee.name, [].slice.apply(arguments)));
  },
  
  /** File separator.
   */
  "[sequence('0x1C')]":
  function FS() 
  {
    coUtils.Debug.reportWarning(
      _("%s sequence [%s] was ignored.",
        arguments.callee.name, [].slice.apply(arguments)));
  },
 
  /** Group separator.
   */
  "[sequence('0x1D')]":
  function GS() 
  {
    coUtils.Debug.reportWarning(
      _("%s sequence [%s] was ignored.",
        arguments.callee.name, [].slice.apply(arguments)));
  },
  
  /** Record separator.
   */
  "[sequence('0x1E')]":
  function RS() 
  {
    coUtils.Debug.reportWarning(
      _("%s sequence [%s] was ignored.",
        arguments.callee.name, [].slice.apply(arguments)));
  },
  
  /** Unit separator.
   */
  "[sequence('0x1F')]":
  function US() 
  {
    coUtils.Debug.reportWarning(
      _("%s sequence [%s] was ignored.",
        arguments.callee.name, [].slice.apply(arguments)));
  },
  
  /** Delete.
   */
  "[sequence('0x7F', '0xFF')]":
  function DEL() 
  {
  },

};

/**
 * @fn main
 * @brief Module entry point.
 * @param {Broker} broker The Broker object.
 */
function main(broker) 
{
  new Control(broker);
  new AnswerBack(broker);
}


