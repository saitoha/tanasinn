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


function make_managed_handler(self, handler)
{
  var wrapped_handler;

  wrapped_handler = function() 
  {
    return handler.apply(self, arguments);
  };

  return wrapped_handler;
}

function apply_attribute(self, broker, key, command_arguments, attribute)
{
  var handler, wrapped_handler, name, args, old_onchange, commands;

  handler = self[key];
  id = self.id + "." + key;

  if (handler.id) {
    wrapped_handler = handler;
  } else {
    wrapped_handler = make_managed_handler(self, handler);
    wrapped_handler.id = id;
    self[key] = wrapped_handler;
  }
  wrapped_handler.description = attribute.description;

  name = command_arguments[0];
  args = command_arguments.length > 1 && command_arguments[1];

  commands = name
    .split("/")
    .map(function(name)
      {
        return {
          name: name,
          description: attribute.description,
          args: args && args.slice(),

          complete: function complete(source) 
          {
            var completers, name, option, completion_context;

            args = this.args;
            if (args && args.length) {
              completers = args.slice(0);
              [name, option] = completers.shift().split("/");
              completion_context = {
                source: source,
                option: option,
                completers: completers,
              };
              self.sendMessage(
                "command/query-completion/" + name, 
                completion_context);
            };
          },

          evaluate: function evaluate() 
          {
            return handler.apply(self, arguments);
          },

          register: function register(id)
          {
            broker.subscribe(
              "get/commands", 
              function() 
              {
                return this;
              }, this, id);
          },

        };

      }, self);

  old_onchange = wrapped_handler.onChange;
  wrapped_handler.onChange = function(name, oldval, newval) 
    {
      var i;

      if (old_onchange) {
        old_onchange.apply(wrapped_handler, arguments);
      }

      if (oldval != newval) {
        if (newval) {
          for (i = 0; i < commands.length; ++i) {
            commands[i].register(wrapped_handler.id);
          };
        } else {
          broker.unsubscribe(wrapped_handler.id);
        }
      }
      return newval;
    };

  wrapped_handler.watch("enabled", wrapped_handler.onChange);

  if (attribute["enabled"]) {
    wrapped_handler.enabled = true;
  };

}


/**
 * @trait CommandAttribute
 *
 */
var CommandAttribute = new Attribute("command");
CommandAttribute.definition = {

  get __id()
    "completer",

  get __info()
    <Attribute>
      <name>{_("Command")}</name>
      <description>{
        _("Declares a command procedure.")
      }</description>
      <detail>
      <![CDATA[
        "command" attribute declares a command procedure. 

        usage:

          "[command('command1', ['arg1_completer']), _('description.'), enabled]":
          function command1(arguments_string)
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
    var attributes, key, attribute, command_arguments;

    attributes = this.__attributes;

    for (key in attributes) {

      attribute = attributes[key];
      command_arguments = attribute["command"];

      if (undefined === command_arguments) {
        continue;
      }

      apply_attribute(this, broker, key, command_arguments, attribute);
    }
  },
}; // CommandAttribute

/**
 * @fn main
 * @brief Module entry point
 * @param {target_class} target_class The Class object.
 */
function main(target_class)
{
  target_class.mix(CommandAttribute);
}

// EOF
