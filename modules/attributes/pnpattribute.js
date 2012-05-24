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
 * @Attribute PnPAttribute
 */
let PnPAttribute = new Attribute("pnp");
PnPAttribute.definition = {

  get __id()
    "pnp",

  get __info()
    <Attribute>
      <name>{_("PnP")}</name>
      <description>{
        _("Marks a function as a tupstart2 pnpr.")
      }</description>
      <detail>
      <![CDATA[
        "pnp" attribute marks a function as PnP handler.

        usage:

          "[pnp('event/the-event-occured'), pnp]":
          function func1(n) 
          { 
            ....
          },

      ]]>
      </detail>
    </Attribute>,

  /** constructor 
   *  @param {EventBroker} broker Parent broker object.
   */
  initialize: function initialize(broker) 
  {
    var attributes, key, attribute, handler, id;

    attributes = this.__attributes;

    for (key in attributes) {
      attribute = attributes[key];
      if (!attribute["pnp"]) {
        continue;
      }
      handler = this[key];
      id = this.id + "." + key;

      let wrapped_handler;
      if (handler.id) {
        wrapped_handler = handler;
      } else {
        let self = this;
        wrapped_handler = function() handler.apply(self, arguments);
        wrapped_handler.id = id;
        this[key] = wrapped_handler;
      }

      broker.subscribe("install/" + this.id, 
        function() 
        {
          wrapped_handler.enabled = true;
        }, undefined, id);

      broker.subscribe("uninstall/" + this.id, 
        function() 
        {
          wrapped_handler.enabled = false;
        }, undefined, id);

    } // key for (key in attributes) 
  },

};


/**
 * @fn main
 * @brief Module entry point
 * @param {target_class} target_class The Class object.
 */
function main(target_class)
{
  target_class.mix(PnPAttribute);
}
