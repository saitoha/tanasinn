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
 *  @class Mascot
 */
var Mascot = new Class().extends(Plugin)
                        .depends("cursorstate");
Mascot.definition = {

  get id()
    "mascot",

  get info()
    <module>
        <name>{_("Mascot")}</name>
        <description>{
          _("Display mascot.")
        }</description>
        <version>0.1</version>
    </module>,

  get template()
    ({
      parentNode: "#tanasinn_resizer_topright",
      //parentNode: "#tanasinn_outer_chrome",
      tagName: "box",
      id: "tanasinn_cover_layer",
      style: <>
        background: url('{this.getMascotImagePath()}'); 
      </>,
    }),

  "[persistable] enabled_when_startup": false,

  "[persistable] mascot_image_file": "images/mascot.svg",

  _element: null,

  /** installs itself. 
   *  @param {Broker} broker A broker object.
   */
  "[install]":
  function install(broker) 
  {
    var {tanasinn_mascot_layer}
      = this.request("command/construct-chrome", this.template);
    this._element = tanasinn_mascot_layer;
  },

  /** Uninstalls itself.
   *  @param {Broker} broker A broker object.
   */
  "[uninstall]":
  function uninstall(broker) 
  {
    if (null !== this._element) {
      this._element.parentNode.removeChild(this._element);
      this._element = null;
    }
  },

  getMascotImagePath: function getMascotImagePath()
  {
    var broker, path, file;

    broker = this._broker;
    path = broker.runtime_path + "/" + this.mascot_image_file;
    file = coUtils.File.getFileLeafFromVirtualPath(path);
    if (!file.exists()) {
        path = this.mascot_image_file;
        file = coUtils.File.getFileLeafFromVirtualPath(path);
    }
    return coUtils.File.getURLSpec(file);
  },

} // class Mascot

/**
 *  @class Cover
 */
var Cover = new Class().extends(Plugin);
Cover.definition = {

  get id()
    "cover",

  get info()
    <module>
        <name>{_("Cover")}</name>
        <description>{
          _("Apply glass effect.")
        }</description>
        <version>0.1</version>
    </module>,

  get template()
    ({
      parentNode: "#tanasinn_background_frame",
      tagName: "box",
      id: "tanasinn_cover_layer",
      style: "opacity: 0.5;",
      childNodes: [
        {
          tagName: "image",
          src: this.getMascotImagePath(), 
        },
      ],
    }),

  "[persistable] enabled_when_startup": false,

  "[persistable] mascot_image_file": "images/cover.png",

  _element: null,

  /** installs itself. 
   *  @param {Broker} broker A broker object.
   */
  "[install]":
  function install(broker) 
  {
    var {tanasinn_mascot_layer}
      = this.request("command/construct-chrome", this.template);
    this._element = tanasinn_mascot_layer;
  },

  /** Uninstalls itself.
   *  @param {Broker} broker A broker object.
   */
  "[uninstall]":
  function uninstall(broker) 
  {
    if (null !== this._element) {
      this._element.parentNode.removeChild(this._element);
      this._element = null;
    }
  },

  getMascotImagePath: function getMascotImagePath()
  {
    var broker, path, file;

    broker = this._broker;
    path = broker.runtime_path + "/" + this.mascot_image_file;
    file = coUtils.File.getFileLeafFromVirtualPath(path);
    if (!file.exists()) {
        path = this.mascot_image_file;
        file = coUtils.File.getFileLeafFromVirtualPath(path);
    }
    return coUtils.File.getURLSpec(file);
  },

} // class Mascot


/**
 * @fn main
 * @brief Module entry point.
 * @param {Broker} broker The Broker object.
 */
function main(broker) 
{
  new Mascot(broker);
  new Cover(broker);
}


