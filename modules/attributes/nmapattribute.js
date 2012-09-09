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


function make_managed_handler(self, handler)
{
  var wrapped_handler = function() 
  {
    return handler.apply(self, arguments);
  };

  return wrapped_handler;
}

function apply_attribute(self, broker, key, expressions, attribute)
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
  wrapped_handler.expressions = expressions;

  broker.subscribe("get/nmap", function() wrapped_handler);

  // Register load handler.
  broker.subscribe(
    "command/load-persistable-data", 
    function load(context) // Restores settings from context object.
    {
      var expressions;

      expressions = context[wrapped_handler.id + ".nmap"];

      if (undefined !== expressions) {
        wrapped_handler.expressions = expressions;
        if (wrapped_handler.enabled) {
          wrapped_handler.enabled = false;
          wrapped_handler.enabled = true;
        }
      }
    }, self);

  // Register persist handler.
  broker.subscribe(
    "command/save-persistable-data", 
    function persist(context) // Save settings to persistent context.
    {
      if (expressions.join("") !== wrapped_handler.expressions.join("")) {
        context[wrapped_handler.id + ".nmap"] = wrapped_handler.expressions;
      }
    }, self);

}



/**
 * @Attribute NmapAttribute
 *
 */
var NmapAttribute = new Attribute("nmap");
NmapAttribute.definition = {

  get __id()
    "nmap",

  get __info()
  {
    return {
      name: _("Default NMap"),
      description: _("Provides default keybind replacement settings in normal mode.")
      /*
      <![CDATA[
        "nmap" attribute defines default keybind replacement settings in normal mode. 
        this settings are deald as "persistable".

        usage:

          "[nmap('<C-n>', '<F7>')]": 
          function func1() 
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
    var attributes, key, attribute, expressions;

    attributes = this.__attributes;

    for (key in attributes) {
      attribute = attributes[key];
      expressions = attribute["nmap"];

      if (!expressions) {
        continue;
      }

      apply_attribute(this, broker, key, expressions, attribute);
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


// EOF
