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
 * @file builder.js
 * @brief Accept UI-template object and convert it to a tree of DOM element.
 *
 * [ UI-template overview ]
 *
 *   UI-template is JSON-style object that is described as based on the
 *   specific rule.
 *   It is to be converted to a node set of XUL/HTML/SVG elements by
 *   "Template Builder" object.
 *
 * [ Examples ]
 *
 * Example 1:
 *    ({                          // <--- (1)
 *      tagName: "box",           // <--- (2)
 *      flex: 1,
 *      style: {                  // <--- (3)
 *        backgroundColor: "red"  // <--- (4)
 *      }
 *    })
 *
 *    It will be converted to following XUL element.
 *
 *      <box flex="1" style="background-color: red;"/>
 *
 *    Every UI-template object consists of <Element node> (1), and it is
 *    typically a tree set of <Element node>s.
 *    It always includes "tagName" property (2), and often includes
 *    <Style node> (3).
 *    <Style node> may have some CSS properties in camelcase (4).
 *
 * Example 2:
 *    ({
 *      tagName: "html:div",
 *      parentNode: "id-of-parent", // <--- (5)
 *      style: {
 *        textAlign: "center"
 *      }
 *      childNodes: {               // <--- (6)
 *        tagName: "html:div",
 *        style: {
 *          fontSize: "1.5em"
 *        },
 *        childNodes: [             // <--- (7)
 *          {
 *            tagName: "html:span",
 *            innerText: "abcde"    // <--- (8)
 *          },
 *          {
 *            tagName: "html:div",
 *          }
 *        ]
 *      }
 *    })
 *
 *    It will be converted as below.
 *
 *    <html:div style="text-align: center;">
 *      <html:div style="font-size: 1.5em;">
 *        <html:span>abcde</html:span>
 *        <html:div/>
 *      </html:span>
 *    </html:div>
 *
 *    The "parentNode" property (5) indicates at which the current node is to
 *    be set. if the type of property value was "string", it regards as node
 *    ID of the parent node. or if its type is "object", especially
 *    HTMLElement, it regards as the parent node object itself.
 *    The "childNodes" property has an effect which cascades down
 *    following <Element node> (6). If you wanted to create two or more
 *    child nodes under the same node, you should substitute an Array of
 *    <Element node>s (7) in "childNodes" property.
 *    The "innerText" property (8) creates a text node under current
 *    <Element node>.
 *
 * Example 2:
 *    ({
 *      tagName: "hbox",
 *      id: "parent",
 *      flex: 1,
 *      onconstruct: {              // <--- (9)
 *        handler: function() { window.alert(this.id); }
 *      },
 *      childNodes: [
 *        {
 *          tagName: "vbox",
 *          id: "left",
 *          flex: 1,
 *          listener: {             // <--- (10)
 *            type: "mouseover",
 *            context: window,
 *            handler: onMouseOver
 *          }
 *        },
 *        {
 *          tagName: "vbox",
 *          id: "right",
 *          flex: 1,
 *          listener: [
 *            {
 *              type: "mouseup",
 *              handler: onMouseUp
 *            },
 *            {
 *              type: "mousedown",
 *              handler: onMouseDown
 *            }
 *          ]
 *        }
 *      ]
 *    })
 *
 *    It almost corresponds to following XUL code.
 *
 *    <hbox id="parent" flex="1">
 *      <vbox id="left" flex="1" onmouseover=""/>
 *      <vbox id="right" flex="1"/>
 *    </hbox>
 *    <script type="application/x-javascript"/>
 *      <![CDATA[
 *        var parent = document.getElementById("parent");
 *        var left = document.getElementById("left");
 *        var right = document.getElementById("right");
 *        (function() window.alert(this.id)).apply(parent);
 *        left.addEventListener("mouseover", function() {
 *          onMouseOver.apply(window, arguments);
 *        }, false);
 *        right.addEventListener("mouseup", onMouseUp, false);
 *        right.addEventListener("mousedown", onMouseOver, false);
 *      ]]>
 *    </script>
 *
 *    The "onconstruct" property (9) defines a event function which fired
 *    when the property itself is parsed.
 *    The "listener" property (10) attaches a event handler at the current
 *    <Element node>.
 */

/**
 * @class TemplateBuilder
 */
var TemplateBuilder = new Trait();
TemplateBuilder.definition = {

  /** Builds a set of nodes of XUL/HTML/SVG elements. */
  buildChrome:
  function buildChrome(template, results)
  {
    var element,
        key,
        value;

    if (Array.isArray(template)) {
      return template.map(
        function mapFunc(node)
        {
          return this.buildChrome(node, results);
        }, this);
    }
    if (!template.tagName) {
      if (!template.hasOwnProperty("text")) {
        throw coUtils.Debug.Exception(
          _("tagName property not found: %s."),
          template.toSource());
      }
      return this.request("get/root-element")
        .ownerDocument
        .createTextNode(template.text);
    }

    element = this._createElement(template.tagName);
    if (!element) {
      throw coUtils.Debug.Exception(
        _("Invalid tagName was detected: '%s'."), template.tagName);
    }
    if (template.parentNode) { // processes "parentNode" property.
      this._processParentNode({value: element}, template.parentNode);
    }
    for ([key, value] in Iterator(template)) {
      if ("tagName" === key) {
        // pass
      } else if ("id" === key) {
        element.id = String(value);
        results[value] = element;
      } else if ("parentNode" === key) {
        // pass
      } else if ("listener" === key) {
        this._processListener({value: element}, value);
      } else if ("onconstruct" === key) {
        value.call(element);
      } else if ("innerText" === key) {
        this._processInnerText(element, value);
      } else if ("childNodes" === key) {
        this._processChildChromeNodes(element, value, results);
      } else { // other properties
        this._processAttribute(element, key, value);
      }
    }
    return element;
  },

  /** Processes an "tagName" property. */
  _createElement:
  function _createElement(tagName)
  {
    var touple = tagName.split(":"), // (tagName) or (namespace, tagName).
        document = this.request("get/root-element").ownerDocument,
        namespace;

    if (1 === touple.length) {
      return document.createElement(tagName);
    } else {
      namespace = touple.shift().toLowerCase();

      if ("html" === namespace) {
        return document.createElementNS(coUtils.Constant.NS_XHTML, tagName);
      } else if ("svg" === namespace) {
        return document.createElementNS(coUtils.Constant.NS_SVG, tagName);
      } else {
        throw coUtils.Debug.Exception(
          _("Unexpected tag name: '%s'."), tagName);
      }
    }
  },

  /** Processes an "listener" property. */
  _processListener:
  function _processListener(element, value)
  {
    if (!Array.isArray(value)) {
      value = [ value ];
    };
    value.forEach(function(listener_info) {
      element.value.addEventListener(
        listener_info.type,
        function() listener_info
          .handler
          .apply(listener_info.context || element.value, arguments),
        listener_info.capture || false);
    });
  },

  /** Processes an "innerText" property. */
  _processInnerText:
  function _processInnerText(element, value)
  {
    var text_node = this.request("get/root-element")
      .ownerDocument
      .createTextNode(value);

    element.appendChild(text_node);
  },

  /** Processes a "parentNode" property. */
  _processParentNode:
  function _processParentNode(element, value)
  {
    var target_element,
        type = typeof value;

    if ("string" === type || "xml" === type) {

      target_element = this.request("get/root-element")
        .querySelector(String(value));

      if (target_element) {
        target_element.appendChild(element.value);
      } else {
        if ("#" === value.charAt(0)) {
          this._broker.subscribe(
            "@event/domnode-created/" + value.substr(1),
            function(target_element)
            {
              target_element.appendChild(element.value);
            });
        } else {
          coUtils.Debug.reportError(
            _("DOM node specified by given selecter is not found: '%s'."), value);
        }
      }
    } else {
      value.appendChild(element.value);
    }
  },

  /** Processes a "childNodes" property. */
  _processChildChromeNodes:
  function _processChildChromeNodes(element, value, results)
  {
    var i, node;

    if (Array.isArray(value)) {  // value is Array object.
      for (i = 0; i < value.length; ++i) {
        node = value[i];
        this._processChildChromeNodes(element, node, results);
      }
    } else {
      if (value.QueryInterface) {
        element.appendChild(value);
      } else {
        node = this.buildChrome(value, results)
        this._processChildChromeNodes(element, node, results);
      }
    }
  },

  /** Processes an attribute or a generic property. */
  _processAttribute:
  function _processAttribute(element, key, value)
  {
    var keys,
        i,
        key;

    if ("object" === typeof value) {
      element = element[key];
      if (!element) {
        throw coUtils.Debug.Exception(
          _("Invalid attribute/property name: '%s'"), key);
      }

      keys = Object.keys(value);

      for (i = 0; i < keys.length; ++i) {
        key = keys[i];
        this._processAttribute(element, key, value[key]); // call recersively.
      }
    } else {
      value = String(value);
      if ("style" === key) {
        element.style.cssText = value;
      } else {
        try {
          if (element.hasAttribute && element.hasAttribute(key)) {
            element.setAttribute(key, value);
          } else {
            element.setAttribute && element.setAttribute(key, value);
            element[key] = value;
          }
        } catch(e) {
          coUtils.Debug.reportError(e);
          coUtils.Debug.reportError("key: " + key + ", value: " + value);
        }
      }
    }
  },

}; // class TemplateBuilder

/**
 * @class ChromeBuilder
 */
var ChromeBuilder = new Class().extends(Component)
                               .mix(TemplateBuilder);
ChromeBuilder.definition = {

  id: "chromebuilder",

  _template_builder: null,
  _map: null,

  /** constructor */
  initialize: function initialize(broker)
  {
    this._map = {};
    this.sendMessage("initialized" + this.id, this);
  },

// public
  "[subscribe('command/construct-chrome'), enabled]":
  function constructChrome(template)
  {
    var results, root, id, element;

    results = {}
    root = this.buildChrome(template, results);

    for ([id, element] in Iterator(results)) {
      this._map[id] = element;
      this.sendMessage("event/domnode-created/" + id, element);
    }

    results["#root"] = root;
    return results;
  },

  "[subscribe('get/element'), enabled]":
  function get(id)
  {
    if (!this._map.hasOwnProperty(id)) {
      return undefined;
      //throw coUtils.Debug.Exception(_("Specified ID is not found."));
    }
    return this._map[id];
  },

  "[subscribe('event/broker-stopping'), enabled]":
  function onSessionStopping(id)
  {
    this._map = null;
  },

}; // ChromeBuilder

/**
 * @fn main
 * @brief Module entry point
 * @param {Process} process The Process object.
 */
function main(broker)
{
  new ChromeBuilder(broker);
}


// EOF
