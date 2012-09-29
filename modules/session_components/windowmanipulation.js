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

function wait(span) 
{
  var end_time = Date.now() + span,
      current_thread = coUtils.Services.threadManager.currentThread;

  do {
    current_thread.processNextEvent(true);
  } while ((current_thread.hasPendingEvents()) || Date.now() < end_time);
}


/**
 * @class WindowManipulator
 */
var WindowManipulator = new Class().extends(Plugin)
                                   .depends("screen")
                                   .depends("renderer")
                                   ;
WindowManipulator.definition = {

  id: "window_manipulatior",

  getInfo: function getInfo()
  {
    return {
      name: _("Window Manipulator"),
      version: "0.1",
      description: _("Report/Change window state, size, position, ...etc.")
    };
  },

  "[persistable] enabled_when_startup": true,

  _hex_mode: false,
  _utf8_mode: false,

  /**
   *
   * DECSLPP - Window manipulation.
   *
   * Ps1 =  1    De-iconify window.
   *     =  2    Minimize window.
   *     =  3    Move window to [Ps2, Ps3].
   *     =  4    Resize window to height Ps2 pixels and width Ps3 pixels.
   *     =  5    Raise the window to the top of the stacking order.
   *     =  6    Lower the window to the bottom of the stacking order.
   *     =  7    Refresh window.
   *     =  8    Resize window to Ps2 lines and Ps3 columns.
   *     =  9    Change maximize state of window.
   *             Ps2 = 0    Restore maximized window.
   *                 = 1    Maximize window.
   * 
   *     = 11    Reports window state.
   *             Response: CSI s t
   *               s = 1    Normal. (non-iconified)
   *                 = 2    Iconified.
   * 
   *     = 13    Reports window position.
   *             Response: CSI 3 ; x ; y t
   *               x    X position of window.
   *               y    Y position of window.
   * 
   *     = 14    Reports window size in pixels.
   *             Response: CSI 4 ; y ; x t
   *               y    Window height in pixels.
   *               x    Window width in pixels.
   * 
   *     = 18    Reports terminal size in characters.
   *             Response: CSI 8 ; y ; x t
   *               y    Terminal height in characters. (Lines)
   *               x    Terminal width in characters. (Columns)
   * 
   *     = 19    Reports root window size in characters.
   *             Response: CSI 9 ; y ; x t
   *               y    Root window height in characters.
   *               x    Root window width in characters.
   * 
   *     = 20    Reports icon label.
   *             Response: OSC L title ST
   *               title    icon label. (window title)
   * 
   *     = 21    Reports window title.
   *             Response: OSC l title ST
   *               title    Window title.
   * 
   */
  "[profile('vt100'), sequence('CSI %dt')]":
  function DECSLPP(n1, n2, n3) 
  {
    this.sendMessage(
      "command/manipulate-window", 
      Array.slice(arguments)); 
  },

  "[subscribe('command/manipulate-window'), pnp]":
  function manipulate(args) 
  { 
     var x,
         y,
         screen,
         renderer,
         column,
         row,
         target_element,
         width,
         height,
         message,
         n1 = args.shift();

    switch (n1) {

      case 0:
        coUtils.Debug.reportWarning(
          _("DECSLPP 0: Unrecognized operation, not supported."));
        return;

      case 1:
        // TODO: De-iconify window.
        coUtils.Debug.reportWarning(
          _("DECSLPP 1: De-iconify window, is not supported."));
        break;

      case 2:
        // TODO: minimize window.
        coUtils.Debug.reportWarning(
          _("DECSLPP 2: Minimize window, is not supported."));
        break;

      case 3:
        // Move window to [Ps2, Ps3].
        y = args[0] || 0;
        x = args[1] || 0;
        this.sendMessage("command/move-to", [x, y]);
        break;

      case 4:
        // Resize window to height Ps2 pixels and width Ps3 pixels.
        y = args[0] || 100;
        x = args[1] || 100;
        renderer = this.dependency["renderer"];
        column = Math.ceil(x / renderer.char_width);
        row = Math.ceil(y / renderer.line_height);

        this.sendMessage(
          "command/resize-screen",
          {
            column: column, 
            row: row,
          });
        break;

      case 5:
        // TODO: Raise the window to the top of the stacking order.
        coUtils.Debug.reportWarning(
          _("DECSLPP 5: Raise the window to the top of the stacking order, ",
            "is not supported."));
        break;

      case 6:
        // TODO: Lower the window to the bottom of the stacking order.
        coUtils.Debug.reportWarning(
          _("DECSLPP 6: Lower the window to the bottom of the stacking order, ",
            "is not supported."));
        break;

      case 7:
        // Refresh window.
        this.sendMessage("command/draw", true);
        break;

      case 8:
        // Resize window to Ps2 lines and Ps3 columns.
        y = args[0] || 24;
        x = args[1] || 80;
        this.sendMessage(
          "command/resize-screen",
          {
            column: x, 
            row: y,
          });
        
        break;

      case 9:
        // TODO: Change maximize state of window.
        //       Ps2 = 0    Restore maximized window.
        //           = 1    Maximize window.
        coUtils.Debug.reportWarning(
          _("DECSLPP 9: Change maximize state of window."));
        break;

      case 11:
        // Reports window state.
        //       Response: CSI s t
        //         s = 1    Normal. (non-iconified)
        //           = 2    Iconified.
        this.sendMessage("command/send-sequence/csi", "1t");
        break;

      case 13:
        // Reports window position.
        //       Response: CSI 3 ; x ; y t
        //         x    X position of window.
        //         y    Y position of window.
        target_element = this.request("get/root-element");
        x = target_element.boxObject.x;
        y = target_element.boxObject.y;
        message = coUtils.Text.format("3;%d;%dt", x, y);

        this.sendMessage("command/send-sequence/csi", message); 
        break;

      case 14:
        // Reports window size in pixels.
        // Response: CSI 4 ; y ; x t
        //   y    Window height in pixels.
        //   x    Window width in pixels.
        //
        target_element = this.request("get/root-element");
        width = target_element.boxObject.width;
        height = target_element.boxObject.height;
        message = coUtils.Text.format("4;%d;%dt", height, width);

        this.sendMessage("command/send-sequence/csi", message); 
        break;

      case 18:
        // Reports terminal size in characters.
        // Response: CSI 8 ; y ; x t
        //   y    Terminal height in characters. (Lines)
        //   x    Terminal width in characters. (Columns)
        screen = this.dependency["screen"];
        width = screen.width;
        height = screen.height;
        message = coUtils.Text.format("8;%d;%dt", height, width);

        this.sendMessage("command/send-sequence/csi", message); 
        break;

      case 19:
        // Reports root window size in characters.
        //       Response: CSI 9 ; y ; x t
        //         y    Root window height in characters.
        //         x    Root window width in characters.
        target_element = this.request("get/root-element").ownerDocument.documentElement;
        width = target_element.boxObject.width;
        height = target_element.boxObject.height;
        renderer = this.dependency["renderer"];
        column = Math.floor(width / renderer.char_width);
        row = Math.floor(height / renderer.line_height);
        message = coUtils.Text.format("9;%d;%dt", row, column);

        this.sendMessage("command/send-sequence/csi", message); 
        break;

      case 20:
        // Reports icon label.
        // Response: OSC L title ST
        //   title    icon label. (window title)
        this.sendMessage("sequence/decslpp/20"); 
        break;

      case 21:
        // Reports window title.
        // Response: OSC l title ST
        //   title    Window title.
        this.sendMessage("sequence/decslpp/21"); 
        break;

      default:
        if (21 < n1 && n1 <= 72) {
          screen = this.dependency["screen"];
          width = screen.width;
          this.sendMessage(
            "command/resize-screen",
            {
              column: width, 
              row: n1,
            });
        }

       return;

    }
    coUtils.Timer.wait(0);
  },

}; // class WindowManipulator

/**
 * @fn main
 * @brief Module entry point.
 * @param {Broker} broker The Broker object.
 */
function main(broker) 
{
  new WindowManipulator(broker);
}

// EOF
