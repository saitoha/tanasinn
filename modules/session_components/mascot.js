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
 *  @class Mascot
 */
var Mascot = new Class().extends(Plugin)
                        .depends("cursorstate");
Mascot.definition = {

  id: "mascot",

  getInfo: function getInfo()
  {
    return {
      name: _("Mascot"),
      version: "0.1",
      description: _("Display mascot.")
    };
  },

  getTemplate: function getTemplate()
  {
    return {
      parentNode: "#tanasinn_resizer_topright",
      //parentNode: "#tanasinn_outer_chrome",
      tagName: "box",
      id: "tanasinn_mascot_layer",
      style: "position: fixed;",
      childNodes: [
        {
          tagName: "image",
          src: this.getMascotImagePath(), 
          style: {
            position: "absolute",
            marginLeft: this.offset_left + "px",
            marginTop: this.offset_top + "px",
          },
        },
      ],
    };
  },

  "[persistable] enabled_when_startup": true,

  "[persistable] mascot_image_file": "images/mascot.svg",
  "[persistable] offset_left": -80,
  "[persistable] offset_top": -62,

  _element: null,

  /** Installs itself. 
   *  @param {InstallContext} context A InstallContext object.
   */
  "[install]":
  function install(context) 
  {
  },

  /** Uninstalls itself.
   */
  "[uninstall]":
  function uninstall() 
  {
    if (null !== this._element) {
      this._element.parentNode.removeChild(this._element);
      this._element = null;
    }
  },

  "[subscribe('@command/focus'), pnp]":
  function onFirstFocus(broker) 
  {
    this._element = this.request(
      "command/construct-chrome", 
      this.getTemplate()
    )["tanasinn_mascot_layer"];
  },

  getMascotImagePath: function getMascotImagePath()
  {
    var broker = this._broker,
        path = broker.runtime_path + "/" + this.mascot_image_file,
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

  id: "cover",

  getInfo: function getInfo()
  {
    return {
      name: _("Cover"),
      version: "0.1",
      description: _("Apply glass effect.")
    };
  },

  getTemplate: function getTemplate()
  {
    return {
      parentNode: "#tanasinn_background_frame",
      tagName: "box",
      id: "tanasinn_cover_layer",
      style: "opacity: 0.2;",
      flex: 1,
      childNodes: [
        {
          tagName: "vbox",
          flex: 1,
          style: {
            backgroundSize: "100% 100%",
            backgroundImage: "url(" + this.getMascotImagePath() + ")", 
          },
        },
      ],
    };
  },

  "[persistable] enabled_when_startup": false,

  "[persistable] mascot_image_file": "images/cover.png",

  _element: null,

  /** Installs itself. 
   *  @param {InstallContext} context A InstallContext object.
   */
  "[install]":
  function install(context) 
  {
    var result = this.request("command/construct-chrome", this.getTemplate());

    this._element = result.tanasinn_cover_layer;
  },

  /** Uninstalls itself.
   */
  "[uninstall]":
  function uninstall() 
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

} // class Cover


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

// EOF
