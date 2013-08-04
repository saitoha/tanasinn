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


var CO_XTERM_256_COLOR_PROFILE = [
  /* 0       */ "#000000", // black
  /* 1       */ "#cd9988", // red
  /* 2       */ "#44cd44", // green
  /* 3       */ "#cdcd88", // yellow
  /* 4       */ "#8899ef", // blue
  /* 5       */ "#cd88cd", // magenta
  /* 6       */ "#66cdcd", // cyan
  /* 7       */ "#e5e5e5", // white
  /* 8       */ "#7f7f7f", // blight black
  /* 9       */ "#ff0000", // blight red
  /* 10      */ "#00ff00", // blight green
  /* 11      */ "#ffff00", // blight yellow
  /* 12      */ "#5c5cff", // blight blue
  /* 13      */ "#ff00ff", // blight magenta
  /* 14      */ "#00ffff", // blight cyan
  /* 15      */ "#ffffff", // blight white
  /* 16 -19  */ "#000000", "#00005f", "#000087", "#0000af",
  /* 20 -23  */ "#0000d7", "#0000ff", "#005f00", "#005f5f",
  /* 24 -27  */ "#005f87", "#005faf", "#005fd7", "#005fff",
  /* 28 -31  */ "#008700", "#00875f", "#008787", "#0087af",
  /* 32 -35  */ "#0087d7", "#0087ff", "#00af00", "#00af5f",
  /* 36 -39  */ "#00af87", "#00afaf", "#00afd7", "#00afff",
  /* 40 -43  */ "#00d700", "#00d75f", "#00d787", "#00d7af",
  /* 44 -47  */ "#00d7d7", "#00d7ff", "#00ff00", "#00ff5f",
  /* 48 -51  */ "#00ff87", "#00ffaf", "#00ffd7", "#00ffff",
  /* 52 -55  */ "#5f0000", "#5f005f", "#5f0087", "#5f00af",
  /* 56 -59  */ "#5f00d7", "#5f00ff", "#5f5f00", "#5f5f5f",
  /* 60 -63  */ "#5f5f87", "#5f5faf", "#5f5fd7", "#5f5fff",
  /* 64 -67  */ "#5f8700", "#5f875f", "#5f8787", "#5f87af",
  /* 68 -71  */ "#5f87d7", "#5f87ff", "#5faf00", "#5faf5f",
  /* 72 -75  */ "#5faf87", "#5fafaf", "#5fafd7", "#5fafff",
  /* 76 -79  */ "#5fd700", "#5fd75f", "#5fd787", "#5fd7af",
  /* 80 -83  */ "#5fd7d7", "#5fd7ff", "#5fff00", "#5fff5f",
  /* 84 -87  */ "#5fff87", "#5fffaf", "#5fffd7", "#5fffff",
  /* 88 -91  */ "#870000", "#87005f", "#870087", "#8700af",
  /* 92 -95  */ "#8700d7", "#8700ff", "#875f00", "#875f5f",
  /* 96 -99  */ "#875f87", "#875faf", "#875fd7", "#875fff",
  /* 100-103 */ "#878700", "#87875f", "#878787", "#8787af",
  /* 104-107 */ "#8787d7", "#8787ff", "#87af00", "#87af5f",
  /* 108-111 */ "#87af87", "#87afaf", "#87afd7", "#87afff",
  /* 112-115 */ "#87d700", "#87d75f", "#87d787", "#87d7af",
  /* 116-119 */ "#87d7d7", "#87d7ff", "#87ff00", "#87ff5f",
  /* 120-123 */ "#87ff87", "#87ffaf", "#87ffd7", "#87ffff",
  /* 124-127 */ "#af0000", "#af005f", "#af0087", "#af00af",
  /* 128-131 */ "#af00d7", "#af00ff", "#af5f00", "#af5f5f",
  /* 132-135 */ "#af5f87", "#af5faf", "#af5fd7", "#af5fff",
  /* 136-139 */ "#af8700", "#af875f", "#af8787", "#af87af",
  /* 140-143 */ "#af87d7", "#af87ff", "#afaf00", "#afaf5f",
  /* 144-147 */ "#afaf87", "#afafaf", "#afafd7", "#afafff",
  /* 148-151 */ "#afd700", "#afd75f", "#afd787", "#afd7af",
  /* 152-155 */ "#afd7d7", "#afd7ff", "#afff00", "#afff5f",
  /* 156-159 */ "#afff87", "#afffaf", "#afffd7", "#afffff",
  /* 160-163 */ "#d70000", "#d7005f", "#d70087", "#d700af",
  /* 164-167 */ "#d700d7", "#d700ff", "#d75f00", "#d75f5f",
  /* 168-171 */ "#d75f87", "#d75faf", "#d75fd7", "#d75fff",
  /* 172-175 */ "#d78700", "#d7875f", "#d78787", "#d787af",
  /* 176-179 */ "#d787d7", "#d787ff", "#d7af00", "#d7af5f",
  /* 180-183 */ "#d7af87", "#d7afaf", "#d7afd7", "#d7afff",
  /* 184-187 */ "#d7d700", "#d7d75f", "#d7d787", "#d7d7af",
  /* 188-191 */ "#d7d7d7", "#d7d7ff", "#d7ff00", "#d7ff5f",
  /* 192-195 */ "#d7ff87", "#d7ffaf", "#d7ffd7", "#d7ffff",
  /* 196-199 */ "#ff0000", "#ff005f", "#ff0087", "#ff00af",
  /* 200-203 */ "#ff00d7", "#ff00ff", "#ff5f00", "#ff5f5f",
  /* 204-207 */ "#ff5f87", "#ff5faf", "#ff5fd7", "#ff5fff",
  /* 208-211 */ "#ff8700", "#ff875f", "#ff8787", "#ff87af",
  /* 212-215 */ "#ff87d7", "#ff87ff", "#ffaf00", "#ffaf5f",
  /* 216-219 */ "#ffaf87", "#ffafaf", "#ffafd7", "#ffafff",
  /* 220-223 */ "#ffd700", "#ffd75f", "#ffd787", "#ffd7af",
  /* 224-227 */ "#ffd7d7", "#ffd7ff", "#ffff00", "#ffff5f",
  /* 228-231 */ "#ffff87", "#ffffaf", "#ffffd7", "#ffffff",
  /* 232-235 */ "#080808", "#121212", "#1c1c1c", "#262626",
  /* 236-239 */ "#303030", "#3a3a3a", "#444444", "#4e4e4e",
  /* 240-243 */ "#585858", "#626262", "#6c6c6c", "#767676",
  /* 244-247 */ "#808080", "#8a8a8a", "#949494", "#9e9e9e",
  /* 248-251 */ "#a8a8a8", "#b2b2b2", "#bcbcbc", "#c6c6c6",
  /* 252-255 */ "#d0d0d0", "#dadada", "#e4e4e4", "#eeeeee"
]; // CO_XTERM_256_COLOR_PROFILE

/**
 * @trait PaletteManager
 */
var PaletteManager = new Class().extends(Plugin)
                                .depends("outerchrome");
PaletteManager.definition = {

  id: "palette",

  /** plugin information */
  getInfo: function getInfo()
  {
    return {
      name: _("Palette Manager"),
      version: "0.1.0",
      description: _("Manage color palette.")
    };
  },

  "[persistable] enabled_when_startup": true,
  // color map (index No. is spacified by SGR escape sequences)

  /** color map for Normal characters. */
  "[watchable, persistable] color": CO_XTERM_256_COLOR_PROFILE.slice(0),
  "[persistable] enable_adjustment": true,

  foreground_color: null,
  background_color: null,
  adjusted_fgcolor: null,
  adjusted_bgcolor: null,

  _reverse: false,
  _outerchrome: null,

  /** Installs itself.
   *  @param {InstallContext} context A InstallContext object.
   */
  "[install]":
  function install(context)
  {
    var outerchrome = context["outerchrome"];

    this._outerchrome = outerchrome;

    this.foreground_color = outerchrome.foreground_color;
    this.background_color = outerchrome.background_color;

    this.adjust_colors();
  },

  /** Uninstalls itself.
   */
  "[uninstall]":
  function uninstall()
  {
    this._outerchrome = null;

    this.foreground_color = null;
    this.background_color = null;
    this.adjusted_fgcolor = null;
  },

  adjust_colors: function adjust_colors()
  {
    var i,
        base_color = this.background_color;

    if (this.enable_adjustment) {
      this.adjusted_fgcolor = this.adjusted_fgcolor || this.color.slice(0);
      this.adjusted_bgcolor = this.adjusted_bgcolor || this.color.slice(0);

      for (i = 0; i < 16; ++i) {
        this.adjusted_fgcolor[i] = coUtils
          .Color
          .adjust(this.color[i], base_color, 180, 200);
      }

      for (i = 0; i < 16; ++i) {
        this.adjusted_bgcolor[i] = coUtils
          .Color
          .adjust(this.color[i], base_color, 100, 120);
      }
      this.inverted_foreground_color = coUtils
        .Color
        .adjust(this.background_color, base_color, 120, 150);

      this.foreground_color = coUtils
        .Color
        .adjust(this.foreground_color, base_color, 150, 180);

      this.inverted_background_color = coUtils
        .Color
        .adjust(this.foreground_color, base_color, 120, 150);
    } else {
      this.adjusted_fgcolor = this.color;
      this.adjusted_bgcolor = this.color;
      this.inverted_foreground_color = this.background_color;
      this.inverted_background_color = this.foreground_color;
    }

  },

  /**
   * Set specified palette color
   */
  "[subscribe('sequence/osc/4'), enabled]":
  function osc4(value)
  {
    var message,
        color,
        args = value.split(";"),
        number = args[0],
        spec = args[1];

    // range check.
    if (0 > number && number > 255) {
      throw coUtils.Debug.Exception(
        _("Specified number is out of range: %d."), number);
    }

    // parse arguments.
    if ("?" === spec) { // get specified color value
      color = this.color[number];
      color = "rgb:" + color.substr(1, 2) + "00"
            + "/" + color.substr(3, 2) + "00"
            + "/" + color.substr(5, 2) + "00"
      message = "4;" + number + ";" + color;
      this.sendMessage("command/send-sequence/osc", message);
    } else { // set color
      color = coUtils.Color.parseX11ColorSpec(spec);
      this.color[number] = color;
      this.adjusted_fgcolor[number] = color;
      this.adjusted_bgcolor[number] = color;
    }
  },

  /**
   * Reset specified palette color
   */
  "[subscribe('sequence/osc/104'), pnp]":
  function osc104(value)
  {
    var color,
        number = value.split(";")[0],
        scope = {};

    // range check.
    if (0 > number && number > 255) {
      throw coUtils.Debug.Exception(
        _("Specified number is out of range: %d."), number);
    }

    this.sendMessage("command/load-persistable-data", scope);

    color = scope["palette.color"] || this.__proto__.color;
    this.color[number] = color[number];
    this.adjusted_fgcolor[number] = color[number];
    this.adjusted_bgcolor[number] = color[number];
  },

  /**
   * Set foreground color (xterm)
   *
   */
  "[subscribe('sequence/osc/10'), pnp]":
  function osc10(value)
  {
    var outerchrome = this._outerchrome,
        color,
        message;

    if ("?" === value) {
      color = outerchrome.foreground_color;
      color = "rgb:" + color.substr(1, 2) + "00"
            + "/" + color.substr(3, 2) + "00"
            + "/" + color.substr(5, 2) + "00"
      message = "10;" + color;
      this.sendMessage("command/send-sequence/osc", message);
    } else {
      color = coUtils.Color.parseX11ColorSpec(value);
      outerchrome.foreground_color = color;
      this.foreground_color = color;
      this.sendMessage("command/draw", true);
    }
  },

  "[subscribe('sequence/osc/110'), pnp]":
  function osc110()
  {
    var outerchrome = this._outerchrome,
        scope = {};

    this.sendMessage("command/load-persistable-data", scope);

    outerchrome.foreground_color
      = scope["outerchrome.foreground_color"]
      || outerchrome.__proto__.foreground_color;
  },

  /**
   * Set background color (xterm)
   *
   */
  "[subscribe('sequence/osc/11'), pnp]":
  function osc11(value)
  {
    var outerchrome = this._outerchrome,
        color,
        message;

    if ("?" === value) {
      color = outerchrome.background_color;
      color = "rgb:" + color.substr(1, 2) + "00"
            + "/" + color.substr(3, 2) + "00"
            + "/" + color.substr(5, 2) + "00"
      message = "11;" + color;
      this.sendMessage("command/send-sequence/osc", message);
    } else {
      color = coUtils.Color.parseX11ColorSpec(value);
      outerchrome.background_color = color;
      this.background_color = color;
      this.adjust_colors();
      this.sendMessage("command/draw", true);
    }
  },

  /**
   * Reset background color
   */
  "[subscribe('sequence/osc/111'), pnp]":
  function osc111()
  {
    var outerchrome = this._outerchrome,
        scope = {};

    this.sendMessage("command/load-persistable-data", scope);

    outerchrome.background_color
      = scope["outerchrome.background_color"]
      || outerchrome.__proto__.background_color;
  },

  /**
   * Enable reverse video
   */
  "[subscribe('command/reverse-video'), enabled]":
  function reverseVideo(value)
  {
    var map,
        i,
        value;

    if (this._reverse !== value) {

      this._reverse = value;

      map = this.color;

      for (i = 0; i < map.length; ++i) {
        map[i] = coUtils.Color.reverse(map[i]);
      }

      this.color = map;
      this.background_color = coUtils.Color.reverse(this.background_color);
      this.foreground_color = coUtils.Color.reverse(this.foreground_color);

      this.sendMessage("command/draw");
    }

  },

  /**
   * Serialize snd persist current state.
   */
  "[subscribe('@command/backup'), type('Object -> Undefined'), pnp]":
  function backup(context)
  {
    var path,
        file;

    // serialize this plugin object.
    context[this.id] = {
      reverse: this._reverse,
      color: this.color,
    };
  },

  /**
   * Deserialize snd restore stored state.
   */
  "[subscribe('@command/restore'), type('Object -> Undefined'), pnp]":
  function restore(context)
  {
    var data = context[this.id];

    if (data) {
      this._reverse = data.reverse;
      this.color = data.color;
    } else {
      coUtils.Debug.reportWarning(
        _("Cannot restore last state of renderer: data not found."));
    }
  },


  getForeColor: function getForeColor(attr)
  {
    var fore_color;

    // Get hexadecimal formatted text color (#xxxxxx)
    // form given attribute structure.
    if (1 === attr.fgcolor) {
      if (1 === attr.bgcolor) {
        if (1 === attr.inverse) {
          fore_color = this.color[attr.bg];
        } else {
          fore_color = this.adjusted_fgcolor[attr.fg];
        }
      } else {
        if (1 === attr.inverse) {
          fore_color = this.adjusted_fgcolor[attr.bg];
        } else {
          fore_color = this.adjusted_fgcolor[attr.fg];
        }
      }
    } else {
      if (1 === attr.inverse) {
        fore_color = this.background_color;
      } else {
        fore_color = this.foreground_color;
      }
    }

    return fore_color;

  },

  getBackColor: function getBackColor(attr)
  {
    var back_color;

    /* Get hexadecimal formatted background color (#xxxxxx)
     * form given attribute structure. */
    if (1 === attr.bgcolor) {
      if (1 === attr.inverse) {
        back_color = this.adjusted_bgcolor[attr.fg];
      } else {
        back_color = this.adjusted_bgcolor[attr.bg];
      }
    } else {
      if (1 === attr.inverse) {
        back_color = this.inverted_background_color;
      } else {
        return null;
      }
    }

//    if (this._reverse) {
//      back_color = (parseInt(back_color.substr(1), 16) ^ 0x1ffffff)
//        .toString(16)
//        .replace(/^1/, "#");
//    }

    return back_color;
  },

  getApproximateColorNumber:
  function getApproximateColorNumber(r, g, b)
  {
    var color = this.color,
        length = color.length,
        i,
        color_origin,
        diff,
        r_origin,
        g_origin,
        b_origin,
        diff_min = 0xff * 0xff * 3,
        result_color = 0;

    for (i = 0; i < length; ++i) {
      color_origin = parseInt(color[i].substr(1), 16);

      r_origin = color_origin >>> 16 & 0xff;
      g_origin = color_origin >>> 8 & 0xff;
      b_origin = color_origin & 0xff;

      diff = (r_origin - r) * (r_origin - r)
           + (g_origin - g) * (g_origin - g)
           + (b_origin - b) * (b_origin - b);

      if (diff_min > diff) {
        diff_min = diff;
        result_color = i;
      }
    }
    return result_color;
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

}; // PaletteManager


/**
 * @fn main
 * @brief Module entry point.
 * @param {Broker} broker The Broker object.
 */
function main(broker)
{
  new PaletteManager(broker);
}

// EOF
