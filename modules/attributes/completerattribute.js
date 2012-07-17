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

function apply_attribute(self, broker, key, completer_name, attribute)
{
  var handler = self[key],
      id = self.id + "." + key,
      wrapped_handler,
      old_onchange;

  if (handler.id) {
    wrapped_handler = handler;
  } else {
    wrapped_handler = make_managed_handler(self, handler);
    wrapped_handler.id = id;
    self[key] = wrapped_handler;
  }
  wrapped_handler.description = attribute.description;

  old_onchange = wrapped_handler.onChange;

  wrapped_handler.onChange = function(name, oldval, newval) 
    {
      if (old_onchange) {
        old_onchange.apply(wrapped_handler, arguments);
      }
      if (oldval !== newval) {
        if (newval) {
          broker.subscribe("command/query-completion/" + completer_name, wrapped_handler);
        } else {
          broker.unsubscribe(wrapped_handler.id);
        }
      }
      return newval;
    }

  wrapped_handler.watch("enabled", wrapped_handler.onChange);

  if (attribute["enabled"]) {
    wrapped_handler.enabled = true;
  };

}


/**
 * @trait CompleterAttribute
 *
 */
var CompleterAttribute = new Attribute("completer");
CompleterAttribute.definition = {

  get __id()
    "completer",

  get __info()
    <Attribute>
      <name>{_("Completer")}</name>
      <description>{
        _("Marks a function as a completer procedure.")
      }</description>
      <detail>
      <![CDATA[
        "completer" attribute marks a function as a completer procedure. 

        usage:

          "[completer('fontsize'), enabled]": 
          function func1() 
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
    var attributes = this.__attributes,
        key,
        attribute,
        info;

    for (key in attributes) {

      attribute = attributes[key];

      info = attribute["completer"];

      if (undefined === info) {
        continue;
      }

      apply_attribute(this, broker, key, info[0], attribute);
    }
  },
};


/**
 * @fn main
 * @brief Module entry point
 * @param {Class} target_class The Class object.
 */
function main(target_class) 
{
  target_class.mix(CompleterAttribute);
}

// EOF
