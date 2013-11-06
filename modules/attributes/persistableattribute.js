/* -*- Mode: JAVASCRIPT; tab-width: 2; indent-tabs-mode: nil; c-basic-offset: 2 -*-
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
 * Portions created by the Initial Developer are Copyright (C) 2010 - 2013
 * the Initial Developer. All Rights Reserved.
 *
 * ***** END LICENSE BLOCK ***** */


"use strict";

/**
 * @trait PersistableAttribute
 */
var PersistableAttribute = new Attribute("persistable");
PersistableAttribute.definition = {

  /** constructor
   *  @param {EventBroker} broker The "parent" broker object in
   *                              the Event broker hierarchy.
   */
  initialize: function initialize(broker)
  {
    var attributes, keys;

    if ("__attributes" in this) {

      attributes = this.__attributes;
      keys = Object.getOwnPropertyNames(attributes)
        .filter(function(key)
          {
            var attribute;

            if (key in attributes) {

              attribute = attributes[key];

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
    var attributes;

    if ("__attributes" in this) {
      attributes = this.__attributes;
      keys = keys || Object.getOwnPropertyNames(attributes)
        .filter(function(key)
        {
          var attribute;

          if (key in attributes) {
            attribute = attributes[key];
            if ("persistable" in attribute) {
              return attribute["persistable"];
            }
          }
          return undefined;
        });

      keys.forEach(function(key)
      {
        var path, value;

        path = [this.id, key].join(".");

        try {

          value = context[path];
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
    var attributes;

    if ("__attributes" in this) {
      attributes = this.__attributes;
      if (!keys) {
        keys = Object.getOwnPropertyNames(attributes)
          .filter(function(key)
          {
            var attribute;

            if (key in attributes) {

              attribute = attributes[key];

              if ("persistable" in attribute) {
                return attribute["persistable"];
              }
            }
            return undefined;
          });
      }

      keys.forEach(function(key)
      {
        var path;

        try {
          if (this[key] !== this.__proto__[key] || Array.isArray(this[key])) {
            path = [this.id, key].join(".");
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
    var attributes;

    if ("__attributes" in this) {
      attributes = this.__attributes;
      if (!keys) {
        keys = Object.getOwnPropertyNames(attributes)
          .filter(function(key)
          {
            var attribute;

            if (key in attributes) {
              attribute = attributes[key];
              if ("persistable" in attribute) {
                return attribute["persistable"];
              }
            }
            return undefined;
          });
      }

      keys.forEach(function(key)
      {
        var path, self;

        self = this;

        path = [this.id, key].join(".");

        try {
          context.__defineGetter__(path,
            function()
            {
              return self[key];
            });
          context.__defineSetter__(path,
            function(value)
            {
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

// EOF
