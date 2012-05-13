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
 *  @class Bell
 */
let Bell = new Class().extends(Plugin);
Bell.definition = {

  get id()
    "bell",

  get info()
    <module>
        <name>{_("Bell")}</name>
        <description>{
          _("Enables it to show visual bell / audio bell.")
        }</description>
        <version>0.2.0</version>
    </module>,

  get template()
    ({
      parentNode: "#tanasinn_center_area",
      tagName: "html:canvas",
      id: "tanasinn_visual_bell",
      opacity: 0.0,
      margin: "-20px",
      MozTransitionProperty: "opacity",
    }),

  "[persistable] enabled_when_startup": true,

  "[persistable] duration": 150,
  "[persistable] color": "white",
  "[persistable] opacity": 0.25,
  "[persistable] visual_bell": true,
  "[persistable] sound_bell": true,

  _cover: null,
 
  /** installs itself. 
   *  @param {Broker} broker A Broker object.
   */
  "[install]":
  function install(broker) 
  {
    let { tanasinn_visual_bell }
      = broker.uniget("command/construct-chrome", this.template);
    this._cover = tanasinn_visual_bell;
    this.onBell.enabled = true;
  },

  /** Uninstalls itself.
   *  @param {Broker} broker A Broker object.
   */
  "[uninstall]":
  function uninstall(broker) 
  {
    if (null !== this._cover) {
      this._cover.parentNode.removeChild(this._cover);
      this._cover = null;
    }
    this.onBell.enabled = false;
  },

  "[subscribe('sequence/bel')]":
  function onBell() 
  {
    coUtils.Timer.setTimeout(function() {
      if (this.visual_bell) {
        this.visualBell();
      }
      if (this.sound_bell) {
        this.beep();
      }
    }, 10);
  },

  /** Plays visual bell effect. */
  visualBell: function visualBell() 
  {
    this._cover.style.backgroundColor = this.color;
    this._cover.style.opacity = this.opacity;
    this._cover.style.MozTransitionDuration = this.duration + "ms";
    coUtils.Timer.setTimeout(function() {
      this._cover.style.opacity = 0.0;
      this._cover = null; // prevent leak.
    }, this.duration, this);
  },

  /** Plays 'beep' sound asynchronously. */
  beep: function beep() 
  {
    let sound = Components.classes["@mozilla.org/sound;1"]
      .getService(Components.interfaces.nsISound)
    sound.beep();
    //sound.playSystemSound("Blow");
  },

} // class Bell


/**
 * @fn main
 * @brief Module entry point.
 * @param {Broker} broker The Broker object.
 */
function main(broker) 
{
  new Bell(broker);
}


