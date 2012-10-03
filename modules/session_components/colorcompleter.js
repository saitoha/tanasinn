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
 * Portions created by the Initial Developer are Copyright (C) 2010 - 2011
 * the Initial Developer. All Rights Reserved.
 *
 * ***** END LICENSE BLOCK ***** */

"use strict";

/**
 * @class ColorNumberCompleter
 *
 */
var ColorNumberCompleter = new Class().extends(Plugin)
                                      .depends("renderer");
ColorNumberCompleter.definition = {

  id: "colorcompleter",

  getInfo: function getInfo()
  {
    return {
      name: _("Color Number Completer"),
      version: "0.1",
      description: _("Provides color number completion service.")
    };
  },

  "[persistable] enabled_when_startup": true,

  _renderer: null,

  /** Installs itself. 
   *  @param {InstallContext} context A InstallContext object.
   */
  "[install]":
  function install(context) 
  {
    this._renderer = context["renderer"];
  },

  /** Uninstalls itself.
   */
  "[uninstall]":
  function uninstall() 
  {
    this._renderer = null;
  },

  /*
   * Search for a given string and notify a listener (either synchronously
   * or asynchronously) of the result
   *
   * @param context - The completion context object. 
   */
  "[completer('color-number'), enabled]":
  function complete(context)
  {
    var color_map = this._getColorMap(context.option),
        renderer, 
        pattern,
        match,
        all,
        number,
        space,
        name,
        next,
        numbers,
        lower_name,
        data;

    if (null === color_map) {
      coUtils.Debug.reportError(
        _("Unknown option is detected: '%s'."),
        context.option);
      this.sendMessage("event/answer-completion", null);
      return;
    }

    pattern = /^\s*([0-9]*)(\s*)(.*)(\s?)/;
    match = context.source.match(pattern);

    [all, number, space, name, next] = match;

    if (next) {
      this._doNextCompletion(context.completers, context.source, all.length);
    } else if (!space) {
      numbers = [i for (i in function() { for (var i = 0; i < 256; ++i) yield i; }())]
        .map(
          function mapFunc(number)
          {
            return number.toString();
          }).filter(
            function filterFunc(number_as_string)
            {
              return -1 !== number_as_string.indexOf(number);
            });
      if (0 === numbers.length) {
        this.sendMessage("event/answer-completion", autocomplete_result);
      } else {
        this.sendMessage(
          "event/answer-completion",
          {
            type: "color-number",
            query: context.source, 
            data: numbers.map(
              function(number) 
              {
                return {
                  name: number, 
                  value: color_map[number],
                };
              }),
          });
      }
    } else {
      lower_name = name.toLowerCase();
      data = [
        {
          name: key,
          value: value,
        } for ([key, value] in Iterator(coUtils.Constant.WEB140_COLOR_MAP))
      ].filter(function(pair) 
      {
        if (-1 !== pair.name.toLowerCase().indexOf(lower_name)) {
          return true;
        }
        if (0 === pair.value.toLowerCase().indexOf(lower_name)) {
          return true;
        }
        return false;
      });

      if (0 === data.length) {
        this.sendMessage("event/answer-completion", null);
      } else {
        this.sendMessage(
          "event/answer-completion",
          {
            type: "color",
            query: name, 
            option: color_map[number],
            data: data,
          });
      }
    }
  },

  _getColorMap: function _getColorMap(option)
  {
    var renderer = this._renderer;

    switch (option) {

      case "fg":
        return renderer.color;
        break;

      case "bg":
        return renderer.color;

      default:
        return null;
    }
  },

  _doNextCompletion: function _doNextCompletion(completers, source, all_length)
  {
    var next_completer_info = completers.shift(),
        next_completer,
        option;

    if (next_completer_info) {
      [next_completer, option] = next_completer_info.split("/");
      this.sendMessage(
        "command/query-completion/" + next_completer, 
        {
          source: source.substr(all_length),
          option: option,
          completers: completers,
        });
    } else {
      this.sendMessage("event/answer-completion", null);
    }
  },
}; // ColorNumberCompleter

/**
 * @fn main
 * @brief Module entry point.
 * @param {Broker} broker The Broker object.
 */
function main(broker)
{
  new ColorNumberCompleter(broker);
}

// EOF
