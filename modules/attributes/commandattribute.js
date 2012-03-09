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
 * @trait CommandAttribute
 *
 */
let CommandAttribute = new Attribute("command");
CommandAttribute.definition = {

  /** constructor 
   *  @param {EventBroker} broker Parent broker object.
   */
  initialize: function initialize(broker) 
  {
    let attributes = this.__attributes;
    for (key in attributes) {
      let attribute = attributes[key];
      if (!attribute["command"]) {
        continue;
      }
      let [name, args] = attribute["command"];
      let command_info = {
        name: name,
        args: args,
      };
      let handler = this[key];
      let delegate = this[key] = handler.id ? 
          this[key]
        : let (self = this) function() handler.apply(self, arguments);
      delegate.id = delegate.id || [this.id, key].join(".");
      delegate.description = attribute.description;

      let commands = command_info.name
        .split("/")
        .map(function(name) let (self = this) {
          name: name,
          description: attribute.description,
          args: args && args.slice(),

          complete: function complete(source) 
          {
            let args = this.args;
            if (args && args.length) {
              let completers = args.slice(0);
              let [name, option] = completers.shift().split("/");
              let completion_context = {
                source: source,
                option: option,
                completers: completers,
              };
              broker.notify(
                <>command/query-completion/{name}</>, 
                completion_context);
            };
          },

          evaluate: function evaluate() 
          {
            return handler.apply(self, arguments);
          },
        }, this);

      delegate.watch("enabled", 
        delegate.onChange = let (self = this, old_onchange = delegate.onChange) 
          function(name, oldval, newval) 
          {
            if (old_onchange) {
              old_onchange.apply(delegate, arguments);
            }
            if (oldval != newval) {
              if (newval) {
                commands.forEach(function(command) {
                  broker.subscribe("get/commands", function() command, undefined, delegate.id);
                });
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
 * @param {target_class} target_class The Class object.
 */
function main(target_class)
{
  target_class.mix(CommandAttribute);
}

