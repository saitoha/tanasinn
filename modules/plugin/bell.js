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
        <name>Bell</name>
        <description>{
          _("Enables it to show visual bell / audio bell.")
        }</description>
        <version>0.1</version>
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

  "[persistable] duration": 150,
  "[persistable] color": "white",
  "[persistable] opacity": 0.25,
  "[persistable] visual_bell": true,
  "[persistable] sound_bell": true,

  _cover: null,
  
  /** post-constructor */
  "[subscribe('initialized/chrome'), enabled]":
  function onLoad(chrome) 
  {
    this.enabled = this.enabled_when_startup;
  },
 
  /** installs itself. 
   *  @param {Session} session A session object.
   */
  "[subscribe('install/' + this.id)]":
  function install(session) 
  {
    let {tanasinn_visual_bell}
      = session.uniget("command/construct-chrome", this.template);
    this._cover = tanasinn_visual_bell;
    this.onBell.enabled = true;
  },

  /** Uninstalls itself.
   *  @param {Session} session A session object.
   */
  "[subscribe('uninstall/' + this.id)]":
  function uninstall(session) 
  {
    if (this._cover) {
      this._cover.parentNode.removeChild(this._cover);
    }
    this.onBell.enabled = false;
  },

  "[subscribe('sequence/bel')]":
  function onBell() 
  {
    if (this.visual_bell)
      this.visualBell();
    if (this.sound_bell)
      this.beep();
  },

  /** Plays visual bell effect. */
  visualBell: function visualBell() 
  {
    let style = this._cover.style;
    style.backgroundColor = this.color;
    style.opacity = this.opacity;
    style.MozTransitionDuration = this.duration + "ms";
    coUtils.Timer.setTimeout(function() style.opacity = 0.0, this.duration);
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
 * @param {Desktop} desktop The Desktop object.
 */
function main(desktop) 
{
  desktop.subscribe(
    "initialized/session", 
    function(session) new Bell(session));
}


