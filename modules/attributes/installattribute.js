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
  var wrapped_handler = function() 
  {
    return handler.apply(self, arguments);
  };

  return wrapped_handler;
}

function apply_attribute(self, broker, key, topic)
{
  var handler = self[key],
      id = self.id + "." + key,
      wrapped_handler;

  if (handler.id) {
    wrapped_handler = handler;
  } else {
    wrapped_handler = make_managed_handler(self, handler, topic);
    wrapped_handler.id = id;
    wrapped_handler.topic = topic;
    self[key] = wrapped_handler;
  }

  broker.subscribe(topic, wrapped_handler, undefined, id);
}

/**
 * @Attribute InstallAttribute
 *
 */
var InstallAttribute = new Attribute("install");
InstallAttribute.definition = {

  /** constructor 
   *  @param {EventBroker} broker Parent broker object.
   */
  initialize: function initialize(broker)
  {
    var attributes = this.__attributes,
        key,
        target_attribute;

    for (key in attributes) {

      target_attribute = attributes[key]["install"];

      if (!target_attribute || !target_attribute.shift()) {
        continue;
      }

      apply_attribute(this, broker, key, "install/" + this.id);
    } // for (key in attributes)

  }, // initialize

}; // attribute InstallAttribute


/**
 * @Attribute UninstallAttribute
 *
 */
var UninstallAttribute = new Attribute("uninstall");
UninstallAttribute.definition = {

  /** constructor 
   *  @param {EventBroker} broker Parent broker object.
   */
  initialize: function initialize(broker)
  {
    var attributes, key, target_attribute;

    attributes = this.__attributes;

    for (key in attributes) {

      target_attribute = attributes[key]["uninstall"];

      if (!target_attribute || !target_attribute.shift()) {
        continue;
      }

      apply_attribute(this, broker, key, "uninstall/" + this.id);
    } // for (key in attributes)

  }, // initialize

}; // attribute UninstallAttribute


/**
 * @fn main
 * @brief Module entry point
 * @param {target_class} target_class The Class object.
 */
function main(target_class)
{
  target_class.mix(InstallAttribute);
  target_class.mix(UninstallAttribute);
}

// EOF
