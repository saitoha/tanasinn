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
 * @trait ListenAttribute
 */
var ListenAttribute = new Attribute("listen");
ListenAttribute.definition = {

  get __id()
    "listen",

  get __info()
    <Attribute>
      <name>{_("DOM Listener")}</name>
      <description>{
        _("Declares DOM listener procedure.")
      }</description>
      <detail>
      <![CDATA[
        "listen" attribute defines a DOM listener procedure.

        usage:

          "[listen('dblclick', '#tanasinn_content'), enabled]":
          function func1() 
          {
            ....
          },

      ]]>
      </detail>
    </Attribute>,


  initialize: function initialize(broker) 
  {
    let attributes = this.__attributes;
    let key;
    for (key in attributes) {
      let attribute = attributes[key];
      if (!attribute["listen"]) {
        continue;
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
        this[key] = wrapped_handler;
      }
      let [type, target, capture] = attribute["listen"];
      let listener_info = attribute["listen"] = {
        type: type,
        target: target,
        capture: capture || false,
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
                listener_info.context = this;
                listener_info.handler = wrapped_handler;
                listener_info.id = listener_info.id || id;
                self.sendMessage("command/add-domlistener", listener_info);
              } else {
                self.sendMessage("command/remove-domlistener", listener_info.id);
              }
            }
            return newval;
          });
      if (attribute["enabled"]) {
        wrapped_handler.enabled = true;
      };
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


