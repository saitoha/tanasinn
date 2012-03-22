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
 * @Attribute SubscribeAttribute
 */
let SubscribeAttribute = new Attribute("subscribe");
SubscribeAttribute.definition = {

  get __id()
    "subscribe",

  get __info()
    <Attribute>
      <name>{_("Subscribe")}</name>
      <description>{
        _("Marks a function as a tupstart2 subscriber.")
      }</description>
      <detail>
      <![CDATA[
        "subscribe" attribute marks a function as tupstart2 subscriber.

        usage:

          "[subscribe('event/the-event-occured'), enabled]":
          function func1(n) 
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
    for (key in attributes) {
      let attribute = attributes[key];
      if (!attribute["subscribe"])
        continue;
      let topic = attribute["subscribe"][0];
      if (!topic) {
        throw coUtils.Debug.Exception(_("topic is not specified."));
      }
      let handler = this[key];
      let wrapped_handler;
      let id = [this.id, key].join(".");
      if (handler.id) {
        wrapped_handler = handler;
      } else {
        let self = this;
        wrapped_handler = function() handler.apply(self, arguments);
        wrapped_handler.id = id;
        wrapped_handler.topic = topic;
        this[key] = wrapped_handler;
      }
      let listen = function() {
        broker.subscribe(topic, wrapped_handler, undefined, id);
      };
      wrapped_handler.watch("enabled", 
        wrapped_handler.onChange = let (self = this, old_onchange = wrapped_handler.onChange) 
          function(name, oldval, newval) 
          {
            if (old_onchange) {
              old_onchange.apply(wrapped_handler, arguments);
            }
            if (oldval != newval) {
              if (newval) {
                broker.subscribe(topic, wrapped_handler, undefined, id);
              } else {
                broker.unsubscribe(wrapped_handler.id);
              }
            }
            return newval;
          });
      if (attribute["enabled"]) {
        wrapped_handler.enabled = true;
      };

      broker.subscribe("get/subscribers", 
        function(subscribers) {
          subscribers[id] = handler;
        });
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
  target_class.mix(SubscribeAttribute);
}

