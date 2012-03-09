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
 * @Attribute NmapAttribute
 *
 */
let NmapAttribute = new Attribute("nmap");
NmapAttribute.definition = {

  /** constructor 
   *  @param {EventBroker} broker Parent broker object.
   */
  initialize: function initialize(broker) 
  {
    let attributes = this.__attributes;
    for (key in attributes) {
      let attribute = attributes[key];
      let expressions = attribute["nmap"];
      if (!expressions)
        continue;
      let handler = this[key];
      let delegate = this[key] = handler.id ? 
        this[key]
      : let (self = this) function() handler.apply(self, arguments);
      delegate.id = delegate.id || [this.id, key].join(".");
      delegate.description = attribute.description;
      delegate.expressions = expressions;
      broker.subscribe("get/nmap", function() delegate);

      // Register load handler.
      broker.subscribe(
        "command/load-persistable-data", 
        function load(context) // Restores settings from context object.
        {
          let expressions = context[delegate.id + ".nmap"];
          if (expressions) {
            delegate.expressions = expressions;
            if (delegate.enabled) {
              delegate.enabled = false;
              delegate.enabled = true;
            }
          }
        }, this);

      // Register persist handler.
      broker.subscribe(
        "command/save-persistable-data", 
        function persist(context) // Save settings to persistent context.
        {
          if (expressions.join("") != delegate.expressions.join("")) {
            context[delegate.id + ".nmap"] = delegate.expressions;
          }
        }, this);
    }
  },
};

/**
 * @fn main
 * @brief Module entry point
 * @param {target_class} target_class The Class object.
 */
function main(target_class)
{
  target_class.mix(NmapAttribute);
}



