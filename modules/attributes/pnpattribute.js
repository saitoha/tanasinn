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

function make_managed_handler(self, handler, topic)
{
  var wrapped_handler;

  wrapped_handler = function() 
  {
    return handler.apply(self, arguments);
  };

  return wrapped_handler;
}

function apply_attribute(self, broker, key, attribute)
{
  var handler, wrapped_handler, id;

  handler = self[key];
  id = self.id + "." + key;

  if (handler.id) {
    wrapped_handler = handler;
  } else {
    wrapped_handler = make_managed_handler(self, handler);
    wrapped_handler.id = id;
    self[key] = wrapped_handler;
  }

  wrapped_handler.description = attribute.description;

  broker.subscribe("install/" + self.id, 
    function() 
    {
      wrapped_handler.enabled = true;
    }, undefined, id + ".pnp");

  broker.subscribe("uninstall/" + self.id, 
    function() 
    {
      wrapped_handler.enabled = false;
    }, undefined, id + ".pnp");
}


/**
 * @Attribute PnPAttribute
 */
var PnPAttribute = new Attribute("pnp");
PnPAttribute.definition = {

  get __id()
    "pnp",

  get __info()
  {
    return {
      name: _("PnP"),
      description: _("Marks a function as a tupstart2 pnpr.")
      /*
      <![CDATA[
        "pnp" attribute marks a function as PnP handler.

        usage:

          "[pnp('event/the-event-occured'), pnp]":
          function func1(n) 
          { 
            ....
          },

      ]]>
      */
    };
  },

  /** constructor 
   *  @param {EventBroker} broker Parent broker object.
   */
  initialize: function initialize(broker) 
  {
    var attributes = this.__attributes,
        key,
        attribute;

    for (key in attributes) {

      attribute = attributes[key];

      if (!attribute["pnp"]) {
        continue;
      }

      apply_attribute(this, broker, key, attribute)
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

// EOF
