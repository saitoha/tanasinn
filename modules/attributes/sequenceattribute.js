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


function apply_attribute(self, broker, key, name, handler, expressions)
{
  expressions.forEach(
    function(expression) 
    {
      broker.subscribe(
        "get/sequences/" + name, 
        function getSequences() 
        {
          return {
            expression: expression,
            handler: handler,
            context: self,
          };
        }, self, id);
    }, self);
}

/**
 * @Attribute SequenceAttribute
 *
 */
var SequenceAttribute = new Attribute("sequence");
SequenceAttribute.definition = {

  get __id()
    "sequence",

  get __info()
  {
    return {
      name: _("Sequence"),
      description: _("Marks a function as a sequence handler.")
      /*
      <![CDATA[
        "sequence" attribute marks a function as sequence handler.

        usage:

          "[profile('vt100'), sequence('CSI ?%dh')]":
          function DECSET(n) 
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
    var attributes, id, key, expressions, name, handler;

    attributes = this.__attributes;
    id = this.id + "." + "__sequence";

    for (key in attributes) {

      expressions = attributes[key]["sequence"];

      if (expressions) {

        [name] = attributes[key]["profile"];
        handler = this[key];

        apply_attribute(this, broker, key, name, handler, expressions);
      }
    }

    broker.subscribe("event/broker-stopped",
      function()
      {
        broker.unsubscribe(id);
      }, this, id);

  },

};

/**
 * @Attribute ProfileAttribute
 *
 */
var ProfileAttribute = new Attribute("profile");
ProfileAttribute.definition = {

  get __id()
    "profile",

  get __info()
  {
    return {
      name: _("Profile"),
      description: _("Marks a function as a profile handler.")
      /*
      <![CDATA[
        "profile" attribute marks a sequence handler as a feature of specified mode.

        usage:

          "[profile('vt100'), sequence('CSI ?%dh')]":
          function DECSET(n) 
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
  },

};

/**
 * @fn main
 * @brief Module entry point
 * @param {target_class} target_class The Class object.
 */
function main(target_class)
{
  target_class.mix(SequenceAttribute);
  target_class.mix(ProfileAttribute);
}


// EOF
