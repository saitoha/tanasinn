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
 * @trait CompleterAttribute
 *
 */
let CompleterAttribute = new Attribute("completer");
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
    let attributes = this.__attributes;
    let key;
    for (key in attributes) {
      let attribute = attributes[key];
      if (!attribute["completer"]) {
        continue;
      }
      let [completer_name] = attribute["completer"];
      let handler = this[key];
      let delegate = this[key] = handler.id ? 
          this[key]
        : let (self = this) function() handler.apply(self, arguments);
      delegate.id = delegate.id || [this.id, key].join(".");
      delegate.description = attribute.description;
      delegate.watch("enabled", 
        delegate.onChange = let (self = this, old_onchange = delegate.onChange) 
          function(name, oldval, newval) 
          {
            if (old_onchange) {
              old_onchange.apply(delegate, arguments);
            }
            if (oldval != newval) {
              if (newval) {
                broker.subscribe("command/query-completion/" + completer_name, delegate);
              } else {
                broker.unsubscribe(delegate.id);
              }
            }
            return newval;
          });
      if (attribute["enabled"]) {
        delegate.enabled = true;
      };
    }
  },
};


/**
 * @trait TypeAttribute
 *
 */
let TypeAttribute = new Attribute("type");
TypeAttribute.definition = {

  /** constructor 
   *  @param {EventBroker} broker Parent broker object.
   */
  initialize: function initialize(broker) 
  {
    let attributes = this.__attributes;
    let key;
    for (key in attributes) {
      let attribute = attributes[key];
      if (!attribute["type"]) {
        continue;
      }
      let [completer_name] = attribute["type"];
      let handler = this[key];
      let delegate = this[key] = handler.id ? 
          this[key]
        : let (self = this) function() handler.apply(self, arguments);
      delegate.id = delegate.id || [this.id, key].join(".");
      delegate.description = attribute.description;
      delegate.watch("enabled", 
        delegate.onChange = let (self = this, old_onchange = delegate.onChange) 
          function(name, oldval, newval) 
          {
            if (old_onchange) {
              old_onchange.apply(delegate, arguments);
            }
            if (oldval != newval) {
              if (newval) {
                broker.subscribe("command/query-completion/" + completer_name, delegate);
              } else {
                broker.unsubscribe(delegate.id);
              }
            }
            return newval;
          });
      if (attribute["enabled"]) {
        delegate.enabled = true;
      };
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

