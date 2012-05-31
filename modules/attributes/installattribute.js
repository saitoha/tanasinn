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
 * @Attribute InstallAttribute
 *
 */
let InstallAttribute = new Attribute("install");
InstallAttribute.definition = {

  get __id()
    "install",

  get __info()
    <Attribute>
      <name>{_("Install")}</name>
      <description>{
        _("Declare a 'install' event listener.")
      }</description>
      <detail>
      <![CDATA[
        Declare a 'install' event listener.

        usage:

          "[install]":
          function install()
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
    var attributes, key;

    attributes = this.__attributes;

    for (key in attributes) {
      let install_attribute = attributes[key]["install"];
      if (!install_attribute || !install_attribute.shift()) {
        continue;
      }
      let handler = this[key];
      let wrapped_handler;
      let id = this.id + "." + key;
      if (handler.id) {
        wrapped_handler = handler;
      } else {
        let self = this;
        wrapped_handler = function() 
        {
          return handler.apply(self, arguments);
        };
        wrapped_handler.id = id;
        wrapped_handler.topic = topic;
        this[key] = wrapped_handler;
      }
      let topic = "install/" + this.id;
      broker.subscribe(topic, wrapped_handler, undefined, id);
      broker.subscribe("event/broker-stopped", function() {
        broker.unsubscribe(id);
      }, this, id);
    } // for (key in attributes)

  }, // initialize

}; // attribute InstallAttribute


/**
 * @Attribute UninstallAttribute
 *
 */
let UninstallAttribute = new Attribute("uninstall");
UninstallAttribute.definition = {

  get __id()
    "uninstall",

  get __info()
    <Attribute>
      <name>{_("Uninstall")}</name>
      <description>{
        _("Declare a 'uninstall' event listener.")
      }</description>
      <detail>
      <![CDATA[
        Declare a 'uninstall' event listener.

        usage:

          "[uninstall]":
          function uninstall()
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
    var attributes, key;

    attributes = this.__attributes;

    for (key in attributes) {
      let uninstall_attribute = attributes[key]["uninstall"];
      if (!uninstall_attribute || !uninstall_attribute.shift()) {
        continue;
      }
      let handler = this[key];
      let wrapped_handler;
      let id = this.id + "." + key;
      if (handler.id) {
        wrapped_handler = handler;
      } else {
        let self = this;
        wrapped_handler = function() 
        {
          return handler.apply(self, arguments);
        };
        wrapped_handler.id = id;
        wrapped_handler.topic = topic;
        this[key] = wrapped_handler;
      }
      let topic = "uninstall/" + this.id;
      broker.subscribe(topic, wrapped_handler, undefined, id);
      /*
      broker.subscribe("event/broker-stopped", 
        function() 
        {
          broker.unsubscribe(id);
        }, this, id);
        */
    } // for (key in attributes)

  }, // initialize

}; // attribute UninstallAttribute


/**
 * @fn main
 * @brief Module entry point
 * @param {target_class} target_class The Class object.
 */
function main(target_class)
{
  target_class.mix(InstallAttribute);
  target_class.mix(UninstallAttribute);
}

