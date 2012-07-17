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

function apply_attribute(self, attribute, key)
{
  var type_signature = attribute["type"][0],
      types = type_signature
        .split(" -> ")
        .map(
          function mapProc(type_name)
          {
            return ConceptContext[type_name];
          }),
      handler = self[key],
      delegate;

  delegate = self[key] = function() 
  {
    var args = Array.slice(arguments),
        result;

    if (args.length !== types.length - 1) {
      coUtils.Debug.reportError(
        _("Invalid argument length detected. %s.%s (%s), args.length == %d."), 
        self.id, key, type_signature, args.length);
    }
    args.forEach(
      function each(arg, index)
      {
        if (types[index] && !types[index](arg)) {
          coUtils.Debug.reportError(
            _("Ill-typed argument detected. %s.%s (%d of %s) - %s."), 
            self.id, key, index, type_signature, arg);
        } 
      });

    result = handler.apply(self, arguments);
    if (types[args.length] && !types[args.length](result)) {
      coUtils.Debug.reportError(
        _("Ill-typed result value detected. %s.%s (%s) - %s."), 
        self.id, key, type_signature, result);
    } 
    return result;
  };

  delegate.id = handler.id || [self.id, key].join(".");
  delegate.description = handler.description || attribute.description;
}

/**
 * @trait TypeAttribute
 *
 */
var TypeAttribute = new Attribute("type");
TypeAttribute.definition = {

  get __id()
    "type",

  get __info()
    <Attribute>
      <name>{_("Type")}</name>
      <description>{
        _("Declares type signature of the function.")
      }</description>
      <detail>
      <![CDATA[
        "type" attribute declares signature of the function. 

        usage:

          "[type('String -> Number -> Boolean')]":
          function command1(str, num)
          {
            ....
            if (...) {
              return false
            }
            return true;
          },

      ]]>
      </detail>
    </Attribute>,


  /** constructor 
   *  @param {EventBroker} broker Parent broker object.
   */
  initialize: function initialize(broker) 
  {
    broker.subscribe(
      "@event/broker-started",
      function onLoad(broker)
      {
        var attributes,
            key,
            attribute;

        if (!broker.debug_flag) {
          return;
        }

        attributes = this.__attributes;

        for (key in attributes) {
          attribute = attributes[key];
          if (!attribute["type"]) {
            continue;
          }
          apply_attribute(this, attribute, key);
        }
      }, this);
  }, // initialize

}; // TypeAttribute


/**
 * @fn main
 * @brief Module entry point
 * @param {target_class} target_class The Class object.
 */
function main(target_class)
{
  target_class.mix(TypeAttribute);
}

// EOF
