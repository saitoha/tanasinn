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
 * @trait PersistableAttribute
 */
let PersistableAttribute = new Attribute("persistable");
PersistableAttribute.definition = {

  get __id()
    "persistable",

  get __info()
    <Attribute>
      <name>{_("Persistable")}</name>
      <description>{
        _("Marks a member or property as 'persistable'.")
      }</description>
      <detail>
      <![CDATA[
        "persistable" attribute marks a member or property as "persistable".

        usage:

          "[persistable] polling_interval": 500, 

      ]]>
      </detail>
    </Attribute>,


  /** constructor 
   *  @param {EventBroker} broker The "parent" broker object in 
   *                              the Event broker hierarchy.
   */
  initialize: function initialize(broker) 
  {
    if ("__attributes" in this) { 
      let attributes = this.__attributes;
      let keys = Object.getOwnPropertyNames(attributes)
        .filter(function(key) {
          if (key in attributes) {
            let attribute = attributes[key];
            if ("persistable" in attribute) {
              return attribute["persistable"];
            }
          }
          return undefined;
        });

      broker.subscribe(
        "command/load-persistable-data", 
        function load(context) 
        {
          this.__load(context, keys);
        }, this);

      broker.subscribe(
        "command/save-persistable-data", 
        function save(context) 
        {
          this.__persist(context, keys);
        }, this);

      broker.subscribe(
        "command/get-persistable-data", 
        function get(context) 
        {
          this.__get(context, keys);
        }, this);
    }

  }, // initialize

  /** Load persistable parameter value from context object. */
  __load: function __load(context, keys) 
  {
    if ("__attributes" in this) { 
      let attributes = this.__attributes;
      keys = keys || Object.getOwnPropertyNames(attributes)
        .filter(function(key) {
          if (key in attributes) {
            let attribute = attributes[key];
            if ("persistable" in attribute) {
              return attribute["persistable"];
            }
          }
          return undefined;
        });

      keys.forEach(function(key)
      {
        let path = [this.id, key].join(".");
        try {
          let value = context[path];
          if (undefined !== value) {
            this[key] = value;
          }
        } catch (e) {
          coUtils.Debug.reportError(e);
          coUtils.Debug.reportError(
            _("An Error occured when loading member '%s'."),
            path);
        }
      }, this);
    }
  }, // __load

  /** Sets persistable parameter value to context object. */
  __persist: function __persist(context, keys) 
  {
    if ("__attributes" in this) { 
      let attributes = this.__attributes;
      keys = keys || Object.getOwnPropertyNames(attributes)
        .filter(function(key) {
          if (key in attributes) {
            let attribute = attributes[key];
            if ("persistable" in attribute) {
              return attribute["persistable"];
            }
          }
          return undefined;
        });

      keys.forEach(function(key)
      {
        try {
          if (this[key] != this.__proto__[key]) {
            let path = [this.id, key].join(".");
            context[path] = this[key];
            context[path + ".default"] = this.__proto__[key];
          }
        } catch (e) {
          coUtils.Debug.reportError(e);
          coUtils.Debug.reportError(
            _("An Error occured when persisting member '%s'."),
            path);
        }
      }, this);
    }
  }, // __persist

  /** set persistable members to context object. 
   * @param {Object} context A context object.
   */
  __get: function __get(context, keys) 
  {
    if ("__attributes" in this) { 
      let attributes = this.__attributes;
      keys = keys || Object.getOwnPropertyNames(attributes)
        .filter(function(key) {
          if (key in attributes) {
            let attribute = attributes[key];
            if ("persistable" in attribute) {
              return attribute["persistable"];
            }
          }
          return undefined;
        });

      keys.forEach(function(key)
      {
        let path = [this.id, key].join(".");
        try {
          context.__defineGetter__(path, let (self = this) function() {
            return self[key];
          });
          context.__defineSetter__(path, let (self = this) function(value) {
            self[key] = value;
          });
        } catch (e) {
          coUtils.Debug.reportError(e);
          coUtils.Debug.reportError(
            _("An Error occured when making wrapper '%s.%s'."),
            id, key);
        }
      }, this);
    }
  }, // __get

}; // PersistableAttribute


/**
 * @fn main
 * @brief Module entry point
 * @param {target_class} target_class The Class object.
 */
function main(target_class)
{
  target_class.mix(PersistableAttribute);
}

