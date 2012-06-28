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
 * @Attribute WatchableAttribute
 *
 */
var WatchableAttribute = new Attribute("watchable");
WatchableAttribute.definition = {

  get __id()
    "watchable",

  get __info()
    <Attribute>
      <name>{_("Watchable")}</name>
      <description>{
        _("Declare a watchable member.")
      }</description>
      <detail>
      <![CDATA[
        "watchable" declare a watchable member.

        usage:

          "[watchable] char_width": 6.5, 

      ]]>
      </detail>
    </Attribute>,

  /** constructor 
   *  @param {EventBroker} broker Parent broker object.
   */
  initialize: function initialize(broker)
  {
    var attributes, key;

    attributes = this.__attributes;

    for (key in attributes) {
      let watchable_attribute = attributes[key]["watchable"];
      if (!watchable_attribute || !watchable_attribute.shift()) {
        continue;
      }
      let getter = this.__lookupGetter__(key);
      let setter = this.__lookupSetter__(key);
      let path = this.id + "." + key;
      if (!getter && !setter) {
        let body = this[key];
        delete this[key];
        this.__defineGetter__(key, function() body);
        this.__defineSetter__(key, function(value) {
          if (body != value) {
            body = value;
            this.sendMessage("variable-changed/" + path, value);
          }
        });
      }
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

