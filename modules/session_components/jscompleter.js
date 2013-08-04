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
 * @class JsCompleter
 */
var JsCompleter = new Class().extends(Plugin);
JsCompleter.definition = {

  id: "jscompleter",

  /** plugin information */
  getInfo: function getInfo()
  {
    return {
      name: _("Javascript Completer"),
      description: _("Provides javascript completion."),
      version: "0.1",
    };
  },

  "[persistable] enabled_when_startup": true,

  /** Installs itself.
   *  @param {InstallContext} context A InstallContext object.
   */
  "[install]":
  function install(context)
  {
  },

  /** Uninstalls itself.
   */
  "[uninstall]":
  function uninstall()
  {
  },


  /*
   * Search for a given string and notify a listener (either synchronously
   * or asynchronously) of the result
   *
   * @param context - The completion context object.
   */
  "[completer('js'), pnp]":
  function complete(context)
  {
    var autocomplete_result = null,
        pattern = /(.*?)(?:(\.|\[|\['|\[")(\w*))?$/,
        match = pattern.exec(context.source),
        settled,
        notation,
        current,
        context,
        code,
        properties,
        lower_current,
        root_element,
        dom;

    if (match) {

      settled = match[1];
      notation = match[2];
      current = match[3];

      root_element = this.request("get/root-element");
      if (!root_element) {
        return;
      }

      dom = {
        window: root_element.ownerDocument.defaultView,
      };

      context = new function() { this.__proto__ = dom.window; };

      if (notation) {
        try {
          code = "with (arguments[0]) { return (" + settled + ");}";
          context = new Function(code) (context);
          if (!context) {
            this.sendMessage("event/answer-completion", null);
            return;
          }
        } catch (e) {
          this.sendMessage("event/answer-completion", null);
          return;
        }
      } else {
        current = settled;
      }

      // enumerate and gather properties.
      properties = [ key for (key in context) ];

      if (true) {
        // add own property names.
        if (null !== context && typeof context !== "undefined") {
          Array.prototype.push.apply(
            properties,
            Object.getOwnPropertyNames(context.__proto__)
              .map(function mapFunc(key)
                {
                  return key;
                }));
        }
      }

      lower_current = current.toLowerCase();

      properties = properties.filter(
        function filterFunc(key)
        {
          if ("." === notation ) {
            if ("number" === typeof key) {
              // Number property after dot notation.
              // etc. abc.13, abc.3
              return false;
            }
            if (!/^[$_a-zA-Z]+$/.test(key)) {
              // A property consists of identifier-chars after dot notation.
              // etc. abc.ab[a cde.er=e
              return false;
            }
          }
          return -1 !== String(key)
            .toLowerCase()
            .indexOf(lower_current);
        }).sort(
          function sortFunc(lhs, rhs)
          {
            return String(lhs).toLowerCase().indexOf(current) ? 1: -1;
          });
      if (0 === properties.lenth) {
        this.sendMessage("event/answer-completion", null);
        return;
      }
      autocomplete_result = {
        type: "text",
        query: current,
        data: properties.map(
          function mapFunc(key)
          {
            var value,
                type;

            try {
              value = context[key];
              type = typeof value;
            } catch (e) { }
            return {
              name: context && notation ?
                ("string" === typeof key) ?
                  (/^\["?$/.test(notation)) ?
                    key.replace('"', '\\"') + "\"]"
                  : ("[\'" === notation) ?
                    key.replace("'", "\\'") + "']"
                  : key
                : key
              : key,
              value: ("function" === type) ?
                    "[Function " + value.name + "] "
                   : ("object" === type) ? // may be null
                     String(value)
                   : ("undefined" === type) ?
                     "undefined"
                   : ("string" === type) ?
                     value.replace('"', '\\"') + "\""
                   : String(value)
            };
          }),
      };
    }

    this.sendMessage("event/answer-completion", autocomplete_result);
  },

  /** test */
  "[test]":
  function()
  {
    var enabled = this.enabled;

    try {
      this.enabled = false;
      this.enabled = true;
      this.enabled = false;
    } finally {
      this.enabled = enabled;
    }
  },


}; // JsCompleter


/**
 * @fn main
 * @brief Module entry point.
 * @param {Broker} broker The Broker object.
 */
function main(broker)
{
  new JsCompleter(broker);
}

// EOF
