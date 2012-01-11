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
 *    It will be converted as bellow.
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
let TemplateBuilder = new Aspect();
TemplateBuilder.definition = {

  /** constructor */
  initialize: function initialize(broker)
  {
    this._root_element = broker.root_element;
  },

  /** Builds a set of nodes of XUL/HTML/SVG elements. */
  buildChrome: 
  function buildChrome(template, results) 
  {
    if (Array.prototype.isPrototypeOf(value)) {
      return value.map(function(node)
      {
        return this.buildChrome(node, results);
      }, this);
    }
    if (!template.tagName) {
      if (!template.hasOwnProperty("text")) {
        throw coUtils.Debug.Exception(_("tagName property not found: %s."), template.toSource());
      }
      let document = this._root_element.ownerDocument;
      return document.createTextNode(template.text);
    }
    let element = this._createElement(template.tagName);
    if (!element) {
      throw coUtils.Debug.Exception(
        _("Invalid tagName was detected: '%s'."), template.tagName);
    }
    if (template.parentNode) { // processes "parentNode" property.
      this._processParentNode(element, template.parentNode);
    }
    for (let [key, value] in Iterator(template)) {
      if ("tagName" == key) {
        // pass
      } else if ("id" == key) {
        element.id = String(value);
        results[value] = element;
      } else if ("parentNode" == key) {
        // pass
      } else if ("listener" == key) {
        this._processListener(element, value);
      } else if ("onconstruct" == key) {
        value.call(element);
      } else if ("innerText" == key) {
        this._processInnerText(element, value);
      } else if ("childNodes" == key) {
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
    let touple = tagName.split(":"); // (tagName) or (namespace, tagName).
    let document = this._root_element.ownerDocument;
    if (1 == touple.length) {
      return document.createElement(tagName);
    } else {
      let namespace = touple.shift().toLowerCase();
      if ("html" == namespace) {
        const NS_XHTML = "http://www.w3.org/1999/xhtml";
        return document.createElementNS(NS_XHTML, tagName);
      } else if ("svg" == namespace) {
        const NS_SVG = "http://www.w3.org/2000/svg";
        return document.createElementNS(NS_SVG, tagName);
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
    if (!Array.prototype.isPrototypeOf(value)) {
      value = [ value ];
    };
    value.forEach(function(listener_info) {
      let context = listener_info.context || element;
      element.addEventListener(
        listener_info.type, 
        function() listener_info.handler.apply(context, arguments), 
        listener_info.capture || false);
    });
  },

  /** Processes an "parentNode" property. */
  _processInnerText: 
  function _processInnerText(element, value) 
  {
    let textNode = this._root_element.ownerDocument.createTextNode(value);
    element.appendChild(textNode);
  },

  /** Processes an "parentNode" property. */
  _processParentNode: 
  function _processParentNode(element, value) 
  {
    if ("string" == typeof value) {
      let root_element = this._root_element;
      root_element.querySelector(value).appendChild(element);
    } else {
      value.appendChild(element);
    }
  },

  /** Processes an "childNodes" property. */
  _processChildChromeNodes: 
  function _processChildChromeNodes(element, value, results) 
  {

    if (Array.prototype.isPrototypeOf(value)) {  // value is Array object.
      value.forEach(function(node) {
        this._processChildChromeNodes(element, node, results);
      }, this);
    } else {
      if (value.QueryInterface) {
        element.appendChild(value);
      } else {
        let node = this.buildChrome(value, results)
        this._processChildChromeNodes(element, node, results);
      }
    }
  },

  /** Processes an attribute or a generic property. */
  _processAttribute: 
  function _processAttribute(element, key, value)  
  {
    if (typeof value == "object") {
      element = element[key];
      if (!element) {
        throw coUtils.Debug.Exception(
          _("Invalid attribute/property name: '%s'"), key);
      }
      for (let [key, value] in Iterator(value)) {
        arguments.callee(element, key, value); // call recersively.
      }
    } else {
      value = value.toString();
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
}; // class TemplateBuilder

/**
 * @class ChromeBuilder
 */
let ChromeBuilder = new Class().extends(Component)
                           .mix(TemplateBuilder); 
ChromeBuilder.definition = {

  get id()
    "chromebuilder",

  _template_builder: null,

  /** constructor */
  initialize: function initialize(session)
  {
    session.notify(<>initialized/{this.id}</>, this);
  },

// public
  "[subscribe('command/construct-chrome'), enabled]":
  function constructChrome(template) 
  {
    let results = {}
    let element = this.buildChrome(template, results);
    results["#root"] = element;
    return results;
  },

}; // ChromeBuilder

/**
 * @fn main
 * @brief Module entry point.
 * @param {Desktop} Desktop The Desktop object.
 */
function main(desktop) 
{
//  new ChromeBuilder(desktop);
  desktop.subscribe(
    "@initialized/session", 
    function(session) new ChromeBuilder(session));
}



