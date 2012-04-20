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
let Mascot = new Class().extends(Plugin)
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
      id: "tanasinn_mascot_layer",
      style: <>
        position: fixed;
      </>,
      childNodes: [
        {
          tagName: "image",
          src: this.getMascotImagePath(), 
          style: <>
            position: absolute;
            margin-top: -62px;
            margin-left: -80px;
          </>,
        },
      ],
    }),

  "[persistable] enabled_when_startup": true,

  "[persistable] mascot_image_file": "images/mascot.svg",

  _element: null,

  /** installs itself. 
   *  @param {Session} session A session object.
   */
  "[subscribe('install/mascot'), enabled]":
  function install(session) 
  {
    let {tanasinn_mascot_layer}
      = session.uniget("command/construct-chrome", this.template);
    this._element = tanasinn_mascot_layer;
  },

  /** Uninstalls itself.
   *  @param {Session} session A session object.
   */
  "[subscribe('uninstall/mascot'), enabled]":
  function uninstall(session) 
  {
    if (null !== this._element) {
      this._element.parentNode.removeChild(this._element);
      this._element = null;
    }
  },

  getMascotImagePath: function getMascotImagePath()
  {
    let broker = this._broker;
    let path, file;
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
}


