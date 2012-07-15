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
 * @class ReverseVideo
 *
 * DECSCNM — Screen Mode: Light or Dark Screen
 *
 * ref: http://www.vt100.net/docs/vt510-rm/DECSCNM
 *
 * This control function selects a dark or light background on the screen.
 *
 * Default: Dark background.
 *
 * Format
 *
 * CSI   ?     5     h
 * 9/11  3/15  3/5   h
 *
 * 6/8   Set: reverse video.
 *
 * CSI   ?     5     l
 * 9/11  3/15  3/5   6/12
 *
 * Reset: normal display.
 *
 * Description
 *
 * When DECSCNM is set, the screen displays dark characters on a light
 * background.
 * When DECSCNM is reset, the screen displays light characters on a dark
 * background.
 *
 * Note on DECSCNM
 *
 * Screen mode only effects how the data appears on the screen. DECSCNM does 
 * not change the data in page memory.
 *
 */
var ReverseVideo = new Class().extends(Plugin);
ReverseVideo.definition = {

  get id()
    "reverse_video",

  get info()
    <module>
        <name>{_("Reverse Video")}</name>
        <version>0.1</version>
        <description>{
          _("Enable/disable Reverse video feature(DECSCNM)",
            " with escape seqnence.")
        }</description>
    </module>,

  "[persistable] enabled_when_startup": true,
  "[persistable] default_value": false,

  _mode: null,

  /** installs itself. 
   *  @param {Broker} broker A Broker object.
   */
  "[install]":
  function install(broker) 
  {
    this._mode = this.default_value;
    this.reset();
  },

  /** Uninstalls itself.
   *  @param {Broker} broker A broker object.
   */
  "[uninstall]":
  function uninstall(broker) 
  {
    this._mode = null;
  },

  /** Activate reverse video feature.
   */
  "[subscribe('sequence/decset/5'), pnp]":
  function activate() 
  { 
    this._mode = true;

    this.sendMessage("command/reverse-video", true);

    coUtils.Debug.reportMessage(
      _("DECSET - DECSCNM (Reverse video) was called."));
  },

  /** Deactivate reverse video feature
   */
  "[subscribe('sequence/decrst/5'), pnp]":
  function deactivate() 
  {
    this._mode = false;

    this.sendMessage("command/reverse-video", false);

    coUtils.Debug.reportMessage(
      _("DECRST - DECSCNM (Reverse video) was called."));
  },

  /** handle terminal reset event.
   */
  "[subscribe('command/{soft | hard}-terminal-reset'), pnp]":
  function reset() 
  {
    if (this.default_value) {
      this.activate();
    } else {
      this.deactivate();
    }
  },

  /**
   * Serialize snd persist current state.
   */
  "[subscribe('@command/backup'), type('Object -> Undefined'), pnp]": 
  function backup(context) 
  {
    // serialize this plugin object.
    context[this.id] = {
      mode: this._mode,
    };
  },

  /**
   * Deserialize snd restore stored state.
   */
  "[subscribe('@command/restore'), type('Object -> Undefined'), pnp]": 
  function restore(context) 
  {
    var data;

    data = context[this.id];
    if (data) {
      this._mode = data.mode;
    } else {
      coUtils.Debug.reportWarning(
        _("Cannot restore last state of renderer: data not found."));
    }
  },


}; // class ReverseVideo

/**
 * @fn main
 * @brief Module entry point.
 * @param {Broker} broker The Broker object.
 */
function main(broker) 
{
  new ReverseVideo(broker);
}

// EOF
