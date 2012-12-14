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

"use strict";

/**
 * @file tupstart.js
 *
 * Defines class EventBroker, which is able to interpret and evaluate 
 * "Topic" and "Event Expression".
 *
 * [ "Topic" Overview ]
 *
 *    In this event system, registered events is concerned by "topic" that
 *    is string variable consists of some digits and alphabets.
 *     
 *    If you registered an event as follows:
 *
 *       var id = broker.subscribe(<topic>, <handler>, ....);
 *
 *    This event handler could be fired as fllowing code:
 *
 *       broker.notify(<topic>);
 *
 *    The subscribe method retuns an ID string.
 *    When you want to unregister handler, use it as follows:
 *
 *       broker.unsubscribe(id);
 *
 *    NOTE that this ID is NOT correnponds to a handler, one-to-one.
 *    The relation between Topic-ID is as same as that, because this event 
 *    system is based on the concept of multicast delegate system.
 * 
 *    +----------+ n      1 +-----------+ n      1 +-----------+
 *    | handler  |>---------|    ID     |>---------|   topic   |
 *    +----------+          +-----------+          +-----------+
 *    
 *
 * [ "Event Expression" Overview ]
 *
 *    Event Expression indicates how the broker waits multiple events.
 *    It was given to subscriber method, that called such as: 
 *
 *       broker.subscribe(<expression>, ....);
 *
 *    <expression> consists of 1 or multiple event topics and other tokens, 
 *    that ruled by simple grammer. the detail of it is as below...
 *
 *
 * [ Grammer of Event Expression ]
 *
 *    IdentifierCharacter := '_' | '-' | digit | alphabet
 *
 *    NormalToken := IdentifierCharacter, IdentifierCharacter*
 *
 *    GlobToken := '{', NormalToken, '}'
 *               | '{', NormalToken, '}', NormalToken
 *               | NormalToken, '{', NormalToken, '}'
 *               | NormalToken, '{', NormalToken, '}', NormalToken
 *
 *    GlobToken := NormalToken | GlobToken
 *
 *    PrimaryExpression := Token | '(', Expression, ')'
 *
 *    UnaryOperator := '@' | '~'
 *
 *    UnaryExpression := PrimaryExpression | UnaryOperator, PrimaryExpression 
 *
 *    BinaryOperator := 'and' | 'or' | '&' | '|'
 *
 *    BinaryExpression := UnaryExpression 
 *                      | UnaryExpression, BinaryOperator, UnaryExpression 
 *
 *    Expression := BinaryExpression
 *
 *
 * [ Event Expression Exsample ]
 *
 *    - case 1.
 *
 *      "A"  
 *
 *       -> it triggered when the event "A" is signaled.
 *
 *    - case 2.
 *
 *      "A | B"
 *
 *      -> wait for multiple events "A" OR "B". 
 *         it is triggerd when one of either events is signaled. 
 *
 *    - case 3.
 *
 *      "A & B"
 *
 *      -> wait for both events "A" AND "B" 
 *         it is triggerd when both of these events is signaled. 
 *
 *
 */

/** 
 * @class EventBrokerBase
 * @brief Provides loose-coupling muticast event system service. 
 *
 * This class is similar to, but different from nsIObserverservice. 
 * It does not manages application-global event, but local-scoped one.
 * Stored observers are not objects, but simple delegate functions.
 *
 */
function EventBrokerBase() 
{
  this.initialize.apply(this, arguments);
}
EventBrokerBase.prototype = {

  /** 
   * @property {Object} A map of stored delegate lists, indexed by topic.
   */
  _delegate_map: null,

  /** Constructor */
  initialize: function initialize() 
  {
    this._delegate_map = {}; 
  },

  /** Subscribes event handler with a topic. 
   *  @param {String} topic The notification topic. This string-valued 
   *                        key uniquely identifies the notification. 
   *                        This parameter MUST NOT includes any space characters.
   *  @param {Function} delegate The handler function.
   *  @param {String} id specified event ID string.
   *  @return {String} An event ID string which is needed to unregister the 
   *                   handler from event map.
   */ 
  addListener: function addListener(topic, delegate, id) 
  {
    var delegate_map;
    var delegate_list;

    //coUtils.Debug.reportMessage(_("event registered: '%s'."), topic); 
    if (/\s/.test(topic)) { // detect whether topic includes space characters.
      throw Components.Exception(
        _("Ill-formed topic string '%s' was given. ",
          "It includs space characters."), 
        topic);
    }
    id = id || coUtils.Uuid.generate().toString(); // generate new ID string if it was empty.
    delegate_map = this._delegate_map;
    if (!delegate_map.hasOwnProperty(topic)) { // if delegate list associated with given 
      delegate_map[topic] = []; // topic was not found, create new list.
    }
    delegate_list = delegate_map[topic];
    delegate_list.push({ id: id, action: delegate }); // register given delegate
    return id;
  },

  /** Unsubscribes specified handler from event map. 
   *  @param {String} id An ID of registered event.
   *  @return {Number} Number in which it succeeded to remove from event map.
   */ 
  removeListener: function removeListener(id) 
  {
    var count = 0,
        delegates,
        key,
        i,
        value;

    // iterate delegate list and search target delegate(s) specified 
    // by the argument.
    for ([key, delegates] in Iterator(this._delegate_map)) {
      for ([i, value] in Iterator(delegates)) {
        if (value && value.id === id) {
          if (1 === delegates.length) {
            delete this._delegate_map[key];   
          } else {
            delegates.splice(i, 1); // remove registered delegate.
          }
          ++count;
        }
      }
    }
    return count;
  },
    
  /** Notify event to subscriber, as firing delegate handlers
   *  associated with the topic specified by the first argument. 
   *  @param {String} topic The notification topic.
   *  @return {Array} An array which contains result values.
   */
  post: function post(topic, data) 
  {
    var events = this._delegate_map[topic];
    var i, delegate, stack;
    if (events) {
      for (i = 0; i < events.length; ++i) { 
        delegate = events[i];
        try {
          delegate.action(data);
        } catch (e) {
          stack = Components.stack.caller.caller.caller;
          coUtils.Debug.reportError(e);
          coUtils.Debug.reportError(
            _("called at: '%s'.\n", 
              "The above Error is trapped in the ",
              "following local event handler. '%s'."), 
            stack.filename
              .split("->").pop()
              .split("?").shift() + ": " + stack.lineNumber, 
            topic);
        }
      };
    }
  },

    
  /** Notify event to subscriber, as firing delegate handlers
   *  associated with the topic specified by the first argument. 
   *  @param {String} topic The notification topic.
   *  @return {Array} An array which contains result values.
   */
  multicast: function multicast(topic, data) 
  {
    var events = this._delegate_map[topic],
        stack;

    if (events) {
      return events.map(function(delegate) 
      { 
        try {
          return delegate.action(data);
        } catch (e) {
          stack = Components.stack.caller.caller.caller;
          coUtils.Debug.reportError(e);
          coUtils.Debug.reportError(
            _("called at: '%s'.\n", 
              "The above Error is trapped in the ",
              "following local event handler. '%s'."), 
            stack.filename
              .split("->").pop()
              .split("?").shift() + ": " + stack.lineNumber, 
            topic);
          return null;
        }
      });
    }
    return null;
  },

    
  /** Notify event to subscriber, as firing delegate handlers
   *  associated with the topic specified by the first argument. 
   *  @param {String} topic The notification topic.
   *  @return An result value which is returned by the delegate handler.
   */
  callSync: function callSync(topic, data) 
  {
    var events = this._delegate_map[topic],
        stack,
        delegate;

    if (!events) {
      throw coUtils.Debug.Exception(
        _("Subscriber not Found: '%s'."), topic);
    } else if (1 !== events.length) {
      coUtils.Debug.reportError(
        _("Too many subscribers are found (length: %d): '%s'."), 
        events.length, topic);
    }

    try {
      delegate = events[0];
      return delegate.action(data);
    } catch (e) {
      stack = Components.stack.caller.caller.caller;
      coUtils.Debug.reportError(e);
      coUtils.Debug.reportError(
        _("called at: '%s'.\n", 
          "The above Error is trapped in the ",
          "following local event handler. '%s'."), 
        stack.filename.split("->")
          .pop().split("?")
          .shift() + ": " + stack.lineNumber, 
        topic);
      return null;
    }
  },

  callAsync: function callAsync(topic, data, complete)
  {
    var events = this._delegate_map[topic],
        stack,
        delegate;

    if (!events) {
      throw coUtils.Debug.Exception(
        _("Subscriber not Found: '%s'."), topic);
    } else if (1 !== events.length) {
      coUtils.Debug.reportError(
        _("Too many subscribers are found (length: %d): '%s'."), 
        events.length, topic);
    }

    try {
      delegate = events[0];
      complete(delegate.action(data));
    } catch (e) {
      stack = Components.stack.caller.caller.caller;
      coUtils.Debug.reportError(e);
      coUtils.Debug.reportError(
        _("called at: '%s'.\n", 
          "The above Error is trapped in the ",
          "following local event handler. '%s'."), 
        stack.filename.split("->")
          .pop().split("?")
          .shift() + ": " + stack.lineNumber, 
        topic);
    }
  },

  /** Reset event map. */
  clearEvents: function clearEvents()
  {
    this._delegate_map = {}; 
  },

}

/** Provides high-level, loose-coupling muticast event system service. 
 *  It can understand Event Expression, and interpret it to a complex of 
 *  multiple topics.
 */
var EventBroker = {}; // Abstruct
EventBroker.prototype = {

  /** constructor */
  initialize: function initialize(parent)
  {
    //this._parent = parent;
    this._base = new EventBrokerBase;
    this._processer = new EventExpressionProcesser(this._base);
  },

  /** Subscribe local event 
   *  @param {String} expression An event expression.
   *  @param {Function} listener The handler function.
   *  @param {Object} context A "this" object in which the listener handler 
   *                  is to be evalute.
   *  @param {String} id specified event ID string.
   *  @return {String} An event ID string which is needed to unregister the 
   *                   handler from event map.
   * */
  subscribe: function subscribe(expression, listener, context, id) 
  {
    var delegate = function()
    {
      return listener.apply(context, arguments);
    }
    this._processer.subscribe(expression, delegate, id);
    //if (this._parent) {
    //  this._parent.subscribe(expression, delegate, id);
    //}
  },

  /** Unsubscribe local event 
   *  @param {String} id An ID of registered event.
   *  @return {Number} Number in which it succeeded to remove from event map.
   */
  unsubscribe: function unsubscribe(id)
  {
    //if (this._parent) {
    //  this._parent.unsubscribe(id);
    //}
    return this._base.removeListener(id);
  },

  /** Notify listeners that event is occurring. 
   *  NOTE that Delegate handler is fired in current thread context.
   *  @param topic The notification topic.
   *  @param data An argument value which is given to event handlers.
   *  @return {Array} An array which contains result values.
   */
  notify: function notify(topic, data)
  {
    var base = this._base;

    return base.multicast(String(topic), data);
  },

  /** Notify listeners that event is occurring. 
   *  NOTE that Delegate handler is fired in current thread context.
   *  @param topic The notification topic.
   *  @param data An argument value which is given to event handlers.
   */
  post: function post(topic, data)
  {
    var base = this._base;

    base.post(String(topic), data);
  },

  /** Notify listeners that event is occurring. 
   *  NOTE that Delegate handler is fired in current thread context.
   *  @param topic The notification topic.
   *  @param data An argument value which is given to event handlers.
   *  @return {Array} An array which contains result values.
   */
  multiget: function multiget(topic, data)
  {
    var base = this._base,
        result = base.multiget(String(topic), data);

    return result;
  },

  /** Notify a listener that event is occurring. 
   *  NOTE that Delegate handler is fired in current thread context.
   *  @param {String} topic The notification topic.
   *  @param data An argument value which is given to event handlers.
   *  @return result value.
   */
  callSync: function callSync(topic, data)
  {
    var base = this._base,
        result = base.callSync(String(topic), data);

    return result;
  },

  callAsync: function callAsync(topic, data, complete)
  {
    this._base.callSync(String(topic), data, complete);
  },

  /** Reset event map. */
  clear: function clear()
  {
    var base = this._base;
    return base.clearEvents();
  },

  /** Load *.js files from specified directories. 
   *  @param {String} search path 
   */
  load: function load(broker, search_path, scope) 
  {
    var paths = coUtils.File.getFileEntriesFromSearchPath(search_path),
        entry,
        url,
        i = 0;

    paths = paths.sort(function(lhs, rhs)
                    {
                      return lhs > rhs
                    });
    //paths = paths.reverse()

    for (; i < paths.length; ++i) {
      entry = paths[i];
      try {
        // make URI string such as "file://....".
        url = coUtils.File.getURLSpec(entry); 
        coUtils.Runtime.loadScript(url, scope);
        if (scope.main) {
          scope.main(broker);
        } else {
          throw coUtils.Debug.Exception(
            _("Component scope symbol 'main' ",
              "required by module loader was not defined. \n",
              "file: '%s'."), 
            url.split("/").pop());
        }
      } catch (e) {
        coUtils.Debug.reportError(e);
      }
    }
  }, // load

};

//
// helper Classes for EventBroker.subscribe
//

/** The event expression node class for unary operator '@'. */
function Once(rhs) 
{
  return { 

    rhs: rhs,

    get test() 
    {
      return this.rhs.test;
    },

    get value() 
    {
      return this.rhs.value;
    },

    reset: function reset() 
    {
      this.rhs = null;
      this.__defineGetter__(
        "test",
        function test()
        {
          return false;
        });
    },

    toString: function toString()
    {
      return "[Once " + this.rhs + " ]";
    }

  };

} // class Once

/** The event expression node class for unary operator '~'. */
function Not(rhs) 
{ 
  return {

    rhs: rhs,

    get test() 
    {
      return !this.rhs.test;
    },

    get value() 
    {
      return this.rhs.value;
    },

    reset: function reset() 
    {
      this.rhs.reset();
    },

    toString: function toString()
    {
      return "[Not " + this.lhs + " " + this.rhs + " ]";
    }

  };

}; // class Not

/** The event expression node class for binary operator '&'. */
function And(lhs, rhs)
{
  return { 

    lhs: lhs,
    rhs: rhs,
  
    get test() 
    {
      return this.lhs.test && this.rhs.test;
    },
  
    get value() 
    {
      return this.lhs.value.concat(this.rhs.value);
    },
  
    reset: function reset() 
    {
      this.lhs.reset();
      this.rhs.reset();
    },
  
    toString: function toString()
    {
      "[And " + this.lhs + " " + this.rhs + " ]";
    },

  };

} // class And

/** The event expression node class for binary operator '|'. */
function Or(lhs, rhs) 
{
  return { 

    lhs: lhs,
    rhs: rhs,

    get test() 
    {
      return this.lhs.test || this.rhs.test;
    },

    get value() 
    {
      return this.lhs.value.concat(this.rhs.value);
    },

    reset: function reset() 
    {
      this.lhs.reset();
      this.rhs.reset();
    },

    toString: function toString()
    { 
      return "[Or " + this.lhs + " " + this.rhs + " ]";
    },

  };

} // class Or

function Actor(broker, token, stack, delegate, id)
{

  var self = this;

  this.__proto__ = { 

    test: false,

    value: [ null ],

    reset: function reset() 
    { 
      this.value = [ null ];
      this.test = false;
    },

    toString: function toString()
    {
      return "[Actor " + token + "]";
    }

  };

  broker.addListener(token, function(subject) 
  {
    var result,
        root;

    self.test = true;
    self.value = [ subject ];
    root = stack[0]; // get root node of parse tree from stack top.
    if (root.test) {
      result = delegate.apply(broker, root.value);
      root.reset();
      return result;
    }

    return null;

  }, id);

} // class Actor

/**
 * @class EventExpressionProcesser
 *
 * Parses Event Expressions and evaluates them.
 */
function EventExpressionProcesser() 
{
  return this.initialize.apply(this, arguments);
}
EventExpressionProcesser.prototype = {

  /** constructor */
  initialize: function _generateTokens(broker) 
  {
    this._broker = broker;
  },

  /** An generator method which iterates identifiers and operators. 
   *  @param text {String} An source text which is to be tokenized.
   */
  _generateTokens: function _generateTokens(text) 
  {
    // [blank] or [operators] or [identifier]
    var pattern = new RegExp(/\s*(?:(@|~|&|\||\(|\))|([A-Za-z0-9_\-\/\.]*)\{([^\}]+)\}([A-Za-z0-9_\-\/\.]*)|([A-Za-z0-9_\-\/\.]+))/y),
        match,
        operator,
        first,
        expression,
        last,
        identifier,
        token;

    //pattern.lastIndex = 0;
    while (true) {
      match = pattern.exec(text);
      if (!match) {
        break;
      }
      [/* blank */, operator, first, expression, last, identifier] = match;
      if (operator) {
        yield operator;
      } else if (identifier) {
        yield identifier;
      } else {
        for (token in this._generateTokens(expression)) { // expand grob.
          if (token.match(/^(&|\||\(|\))$/)) {
            yield token; // normal tokens.
          } else {
            yield [first, token, last].join(""); // expanded identifier.
          }
        }
      }
    }
  },

  /** An parser method which parse tokens and convert that to node tree. 
   *  @param {Array[String]} tokens Tokenized strings.
   *  @param {Function} delegate An event handler function.
   *  @param {String} id specified event ID string.
   */
  _parseExpression: function _parseExpression(tokens, delegate, id) 
  {
    var stack = [];
    while (tokens.length) {
      void function impl() {
        var token = tokens.shift();
        var lhs, rhs;
        if ("(" === token) {
          while (tokens.length) {
            impl.call(this);
          }
        } else if (")" === token) {
          return;
        } else if ("@" === token) {
          impl.call(this);
          rhs = stack.pop();
          stack.push(new Once(rhs));
        } else if ("~" === token) {
          impl.call(this);
          rhs = stack.pop();
          stack.push(new Not(rhs));
        } else if ("&" === token || "and" === token) {
          impl.call(this);
          rhs = stack.pop();
          lhs = stack.pop();
          stack.push(new And(lhs, rhs));
        } else if ("|" === token || "or" === token) {
          impl.call(this);
          rhs = stack.pop();
          lhs = stack.pop();
          stack.push(new Or(lhs, rhs));
        } else {
          stack.push(new Actor(this._broker, token, stack, delegate, id));
        }
      }.call(this);
    };
    if (1 !== stack.length) {
      throw coUtils.Debug.Exception(_("Invalid Expression: '%s'."), tokens);
    }
  },

  /** Parses event expresson and makes tree of actors. 
   */
  subscribe: function subscribe(expression, delegate, id) 
  {
    var token_generator = this._generateTokens(expression);
    var tokens = [token for (token in token_generator)];
    this._parseExpression(tokens, delegate, id);
  }

} // class EventExpressionProcesser

// EOF
