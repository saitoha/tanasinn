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


function apply_attribute(self, key)
{
  var getter = self.__lookupGetter__(key),
      setter = self.__lookupSetter__(key),
      path = self.id + "." + key,
      body;

  if (!getter && !setter) {

    body = self[key];
    delete self[key];

    self.__defineGetter__(
      key,
      function getBody()
      {
        return body;
      })

    self.__defineSetter__(
      key,
      function setBody(value)
      {
        if (body !== value) {
          body = value;
          self.sendMessage("variable-changed/" + path, value);
        }
      });
  }

}

/**
 * @Attribute WatchableAttribute
 *
 */
var WatchableAttribute = new Attribute("watchable");
WatchableAttribute.definition = {

  /** constructor
   *  @param {EventBroker} broker Parent broker object.
   */
  initialize: function initialize(broker)
  {
    var attributes = this.__attributes,
        key,
        attribute;

    for (key in attributes) {

      attribute = attributes[key]["watchable"];
      if (!attribute || !attribute.shift()) {
        continue;
      }

      apply_attribute(this, key);

    } // for (key in attributes)
  }, // initialize

}; // attribute WatchableAttribute


/**
 * @fn main
 * @brief Module entry point
 * @param {target_class} target_class The Class object.
 */
function main(target_class)
{
  target_class.mix(WatchableAttribute);
}

// EOF
