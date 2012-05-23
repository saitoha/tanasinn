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
 * @class WindowManipulator
 */
var WindowManipulator = new Class().extends(Plugin)
                                   .depends("screen");
WindowManipulator.definition = {

  get id()
    "window_manipulatior",

  get info()
    <module>
        <name>{_("Window Manipulator")}</name>
        <version>0.1</version>
        <description>{
          _("Report/Change window state, size, position, ...etc.")
        }</description>
    </module>,

  "[persistable] enabled_when_startup": true,

  /** installs itself. 
   *  @param {Broker} broker A Broker object.
   */
  "[install]":
  function install(broker) 
  {
    this.manipulate.enabled = true;
  },

  /** Uninstalls itself.
   *  @param {Broker} broker A broker object.
   */
  "[uninstall]":
  function uninstall(broker) 
  {
    this.manipulate.enabled = false;
  },


  "[subscribe('command/manipulate-window')]":
  function manipulate(args) 
  { 
    switch (args.shift()) {

      case 1:
        // TODO: De-iconify window.
        coUtils.Debug.reportWarging(
          _("DECSLPP 1: De-iconify window, is not supported."));
        break;

      case 2:
        // TODO: minimize window.
        coUtils.Debug.reportWarging(
          _("DECSLPP 2: Minimize window, is not supported."));
        break;

      case 3:
        // TODO: Move window to [Ps2, Ps3].
        coUtils.Debug.reportWarging(
          _("DECSLPP 3: Move window, is not supported."));
        break;

      case 4:
        // TODO: Resize window to height Ps2 pixels and width Ps3 pixels.
        coUtils.Debug.reportWarging(
          _("DECSLPP 4: Resize window, is not supported."));
        break;

      case 5:
        // TODO: Raise the window to the top of the stacking order.
        coUtils.Debug.reportWarging(
          _("DECSLPP 5: Raise the window to the top of the stacking order, ",
            "is not supported."));
        break;

      case 6:
        // TODO: Lower the window to the bottom of the stacking order.
        coUtils.Debug.reportWarging(
          _("DECSLPP 6: Lower the window to the bottom of the stacking order, ",
            "is not supported."));
        break;

      case 7:
        // TODO: Refresh window.
        coUtils.Debug.reportWarging(_("DECSLPP 7: Refresh window."));
        break;

      case 8:
        // TODO: Resize window to Ps2 lines and Ps3 columns.
        coUtils.Debug.reportWarging(
          _("DECSLPP 8: Resize window to Ps2 lines and Ps3 columns."));
        break;

      case 9:
        // TODO: Change maximize state of window.
        //       Ps2 = 0    Restore maximized window.
        //           = 1    Maximize window.
        coUtils.Debug.reportWarging(
          _("DECSLPP 9: Change maximize state of window."));
        break;

      case 11:
        // TODO: Reports window state.
        //       Response: CSI s t
        //         s = 1    Normal. (non-iconified)
        //           = 2    Iconified.
        coUtils.Debug.reportWarging(
          _("DECSLPP 11: Reports window state."));
        break;

      case 13:
        // TODO: Reports window position.
        //       Response: CSI 3 ; x ; y t
        //         x    X position of window.
        //         y    Y position of window.
        coUtils.Debug.reportWarging(
          _("DECSLPP 13: Reports window position."));
        break;

      case 14:
        // Reports window size in pixels.
        // Response: CSI 4 ; y ; x t
        //   y    Window height in pixels.
        //   x    Window width in pixels.
        //
        {
          var broker = this._broker;
          var target_element = broker.root_element;
          var width = target_element.boxObject.width;
          var height = target_element.boxObject.height;
          var message = coUtils.Text.format("\x1b[4;%d;%dt", height, width);
          broker.notify("command/send-to-tty", message); 
        }
        break;

      case 18:
        // TODO: Reports terminal size in characters.
        //       Response: CSI 8 ; y ; x t
        //         y    Terminal height in characters. (Lines)
        //         x    Terminal width in characters. (Columns)
        {
          var broker = this._broker;
          var target_element = broker.root_element;
          var screen = this.dependency["screen"];
          var width = screen.width;
          var height = screen.height;
          var message = coUtils.Text.format("\x1b[8;%d;%dt", height, width);
          broker.notify("command/send-to-tty", message); 
        }
        break;

      case 19:
        // TODO: Reports root window size in characters.
        //       Response: CSI 9 ; y ; x t
        //         y    Root window height in characters.
        //         x    Root window width in characters.
        coUtils.Debug.reportWarging(
          _("DECSLPP 19: Reports root window size in characters."));
        break;

      case 20:
        // TODO: Reports icon label.
        //       Response: OSC L title ST
        //         title    icon label. (window title)
        coUtils.Debug.reportWarging(
          _("DECSLPP 20: Reports icon label."));
        break;

      case 21:
        // TODO: Reports window title.
        //       Response: OSC l title ST
        //         title    Window title.
        coUtils.Debug.reportWarging(
          _("DECSLPP 21: Reports window title."));
        break;

      default:
        break;

    }
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


