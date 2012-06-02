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
 * @class Control
 */
var Control = new Class().extends(Component);
Control.definition = {

  get id()
    "control",

  /** Post constructor */
  "[subscribe('initialized/screen'), enabled]":
  function onLoad(screen) 
  {
    this._screen = screen;
  },

  "[subscribe('set/newline-mode'), enabled]":
  function onChangeNewlineMode(mode)
  {
    this._newline_mode = mode;
  },

  /** Null.
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
      "%s sequence [%s] was ignored.",
      arguments.callee.name, Array.slice(arguments));
  },
  
  /** Start of text.
   */
  "[profile('vt100'), sequence('0x02')]":
  function STX()  
  {
    coUtils.Debug.reportWarning(
      "%s sequence [%s] was ignored.",
      arguments.callee.name, Array.slice(arguments));
  },
 
  /** End of text.
   */
  "[profile('vt100'), sequence('0x03')]":
  function ETX() 
  {
    coUtils.Debug.reportWarning(
      "%s sequence [%s] was ignored.",
      arguments.callee.name, Array.slice(arguments));
  },

  /** Start of transmission.
   */
  "[profile('vt100'), sequence('0x04')]":
  function EOT() 
  {
    coUtils.Debug.reportWarning(
      "%s sequence [%s] was ignored.",
      arguments.callee.name, Array.slice(arguments));
  },
  
  /** Enquire.
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
      "%s sequence [%s] was ignored.",
      arguments.callee.name, Array.slice(arguments));
  },
   
  /** Bell.
   */
  "[profile('vt100'), sequence('0x07', 'ESC \\\\')]":
  function BEL() 
  {
    this.sendMessage("sequence/bel");
  },

  /** Back space.
   */
  "[profile('vt100'), sequence('0x08')]":
  function BS() 
  { // BackSpace
    var screen;

    screen = this._screen;
    screen.backSpace();
  },
   
  /** Horizontal tabulation.
   */
  "[profile('vt100'), sequence('0x09')]":
  function HT() 
  { // Horizontal Tab
    var screen;

    screen = this._screen;
    screen.horizontalTab();
  },
  
  /** Linefeed.
   */
  "[profile('vt100'), sequence('0x0A')]":
  function LF() 
  {
    var screen;

    screen = this._screen;
    screen.lineFeed();
    if (this._newline_mode) {
      screen.carriageReturn();
    }
  },
  
  /** Index.
   */
  "[profile('vt100'), sequence('0x84', 'ESC D'), _('Index')]":
  function IND() 
  {
    var screen;

    screen = this._screen;
    screen.lineFeed();
  },

  /** SS2.
   */
  "[profile('vt100'), sequence('0x8f', 'ESC O'), _('SS2')]":
  function SS2() 
  {
    this.sendMessage("sequences/ss2");
  },

  /** SS3.
   */
  "[profile('vt100'), sequence('0x90', 'ESC P'), _('SS3')]":
  function SS3() 
  {
    this.sendMessage("sequences/ss3");
  },
 
  /** Vertical tabulation.
   */
  "[profile('vt100'), sequence('0x0B')]":
  function VT() 
  {
    var screen;

    screen = this._screen;
    screen.lineFeed();
    if (this._newline_mode) {
      screen.carriageReturn();
    }
  },

  /** Form feed.
   */
  "[profile('vt100'), sequence('0x0C')]":
  function FF() 
  {
    var screen;

    screen = this._screen;
    screen.lineFeed();
    if (this._newline_mode) {
      screen.carriageReturn();
    }
  },

  /** Carriage return.
   */
  "[profile('vt100'), sequence('0x0D')]":
  function CR() 
  { // Carriage Return
    var screen;

    screen = this._screen;
    screen.carriageReturn();
  },
    
  /** Shift out.
   */
  "[profile('vt100'), sequence('0x0E')]":
  function SO() 
  { // shift out
    this.sendMessage("event/shift-out");
  },
  
  /** Shift in.
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
      "%s sequence [%s] was ignored.",
      arguments.callee.name, Array.slice(arguments));
  },
 
  /** Device control 1.
   */
  "[profile('vt100'), sequence('0x11')]":
  function DC1() 
  {
    //this.sendMessage("command/send-to-tty", "\u0011");
    this.sendMessage("command/flow-control", true);
  },
  
  /** Device control 2.
   */
  "[profile('vt100'), sequence('0x12')]":
  function DC2() 
  {
    coUtils.Debug.reportWarning(
      _("%s sequence [%s] was ignored.",
        arguments.callee.name, Array.slice(arguments)));
  },

  /** Device control 3.
   */
  "[profile('vt100'), sequence('0x13')]":
  function DC3() 
  {
    //this.sendMessage("command/send-to-tty", "\u0013");
    this.sendMessage("command/flow-control", false);
  },
  
  /** Device control 4.
   */
  "[profile('vt100'), sequence('0x14')]":
  function DC4() 
  {
    coUtils.Debug.reportWarning(
      _("%s sequence [%s] was ignored.",
        arguments.callee.name, Array.slice(arguments)));
  },
  
  /** Negative acknowledge.
   */
  "[profile('vt100'), sequence('0x15')]":
  function NAK() 
  {
    coUtils.Debug.reportWarning(
      _("%s sequence [%s] was ignored.",
        arguments.callee.name, Array.slice(arguments)));
  },
  
  /** Synchronous idle.
   */
  "[profile('vt100'), sequence('0x16')]":
  function SYN() 
  {
    coUtils.Debug.reportWarning(
      _("%s sequence [%s] was ignored.",
        arguments.callee.name, Array.slice(arguments)));
  },
  
  /** End of transmission block.
   */
  "[profile('vt100'), sequence('0x17')]":
  function ETB() 
  {
    coUtils.Debug.reportWarning(
      _("%s sequence [%s] was ignored.",
        arguments.callee.name, Array.slice(arguments)));
  },
  
  /** Cancel of previous word or charactor.
   */
  "[profile('vt100'), sequence('0x18')]":
  function CAN() 
  {
    coUtils.Debug.reportWarning(
      _("%s sequence [%s] was ignored.",
        arguments.callee.name, Array.slice(arguments)));
  },
  
  /** End of medium.
   */
  "[profile('vt100'), sequence('0x19')]":
  function EM() 
  {
    coUtils.Debug.reportWarning(
      _("%s sequence [%s] was ignored.",
        arguments.callee.name, Array.slice(arguments)));
  },
  
  /** Substitute.
   */
  "[profile('vt100'), sequence('0x1A')]":
  function SUB()
  {
    coUtils.Debug.reportWarning(
      _("%s sequence [%s] was ignored.",
        arguments.callee.name, Array.slice(arguments)));
  },
  
  /** File separator.
   */
  "[profile('vt100'), sequence('0x1C')]":
  function FS() 
  {
    coUtils.Debug.reportWarning(
      _("%s sequence [%s] was ignored.",
        arguments.callee.name, Array.slice(arguments)));
  },
 
  /** Group separator.
   */
  "[profile('vt100'), sequence('0x1D')]":
  function GS() 
  {
    coUtils.Debug.reportWarning(
      _("%s sequence [%s] was ignored.",
        arguments.callee.name, Array.slice(arguments)));
  },
  
  /** Record separator.
   */
  "[profile('vt100'), sequence('0x1E')]":
  function RS() 
  {
    coUtils.Debug.reportWarning(
      _("%s sequence [%s] was ignored.",
        arguments.callee.name, Array.slice(arguments)));
  },
  
  /** Unit separator.
   */
  "[profile('vt100'), sequence('0x1F')]":
  function US() 
  {
    coUtils.Debug.reportWarning(
      _("%s sequence [%s] was ignored.",
        arguments.callee.name, Array.slice(arguments)));
  },
  
  /** Delete.
   */
  "[profile('vt100'), sequence('0x7F', '0xFF')]":
  function DEL() 
  {
    coUtils.Debug.reportWarning(
      _("%s sequence [%s] was ignored.",
        arguments.callee.name, Array.slice(arguments)));
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
}


