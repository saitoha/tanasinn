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


function make_managed_handler(self, handler, topic)
{
  var wrapped_handler = function() 
  {
    return handler.apply(self, arguments);
  };

  return wrapped_handler;
}

function apply_attribute(self, broker, key, info, attribute)
{
  var handler = self[key],
      id = self.id + "." + key,
      wrapped_handler,
      listener_info,
      old_onchange;

  if (handler.id) {
    wrapped_handler = handler;
  } else {
    wrapped_handler = make_managed_handler(self, handler);
    wrapped_handler.id = id;
    self[key] = wrapped_handler;
  }

  listener_info = {
    type: info[0],
    target: info[1],
    capture: info[2] || false,
  };

  old_onchange = wrapped_handler.onChange;

  wrapped_handler.onChange = function(name, oldval, newval) 
    {
      if (old_onchange) {
        old_onchange.apply(wrapped_handler, arguments);
      }
      if (oldval !== newval) {
        if (newval) {
          listener_info.context = self;
          listener_info.handler = wrapped_handler;
          listener_info.id = listener_info.id || id;
          self.sendMessage("command/add-domlistener", listener_info);
        } else {
          self.sendMessage("command/remove-domlistener", listener_info.id);
        }
      }
      return newval;
    };

  wrapped_handler.watch("enabled", wrapped_handler.onChange);

  if (attribute["enabled"]) {
    wrapped_handler.enabled = true;
  };

}



/**
 * @trait ListenAttribute
 */
var ListenAttribute = new Attribute("listen");
ListenAttribute.definition = {

  get __id()
    "listen",

  get __info()
  {
    return {
      name: _("DOM Listener"),
      description: _("Declares DOM listener procedure.")
      /*
      <![CDATA[
        "listen" attribute defines a DOM listener procedure.

        usage:

          "[listen('dblclick', '#tanasinn_content'), enabled]":
          function func1() 
          {
            ....
          },

      ]]>
      */
    };
  },

  initialize: function initialize(broker) 
  {
    var attributes, key, info, attribute;

    attributes = this.__attributes;

    for (key in attributes) {

      attribute = attributes[key];

      info = attribute["listen"];

      if (undefined === info) {
        continue;
      }

      apply_attribute(this, broker, key, info, attribute);
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
  target_class.mix(ListenAttribute);
}

// EOF
