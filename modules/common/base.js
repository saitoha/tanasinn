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
 * @class Aspect
 */
let Aspect = function() this.initialize.apply(this, arguments);
Aspect.prototype = {

  id: null,
  _definition: null,

  /** @property {Object} prototype */
  get prototype()
  {
    return this._definition;
  },

  /** @property {Object} definition */
  get definition()
  {
    return this._definition;
  },

  set definition(value) 
  {
    this.define(value);
  },

  define: function define(definition)
  {
    if (value) {
      this._definition = definition;
    }
  },

  /** constructor */
  initialize: function initialize(id, definition) 
  {
    this.id = id;
    this.definition = definition;
  },

  /* override */
  toString: function toString()  // override
  {
    return <>[Aspect {this.id}]</>;
  }

};

///** 
// * @class ForwardInputIterator
// */ 
//let ForwardInputIterator = function ForwardInputIterator() this.initialize.apply(this, arguments);
//ForwardInputIterator.prototype = {
//
//  _value: null,
//  _position: 0,
//
//  /** Assign new string data. position is reset. */
//  initialize: function initialize(value) 
//  {
//    this._value = value;
//    this._position = 0;
//  },
//
//  /** Returns single byte code point. */
//  current: function current() 
//  {
//    return this._value.charCodeAt(this._position);
//  },
//
//  /** Moves to next position. */
//  moveNext: function moveNext() 
//  {
//    ++this._position;
//  },
//
//  /** Returns whether scanner position is at end. */
//  get isEnd() 
//  {
//    return this._position >= this._value.length;
//  },
//};
//
///**
// * @class AnnotationScanner
// */
//let AnnotationScanner = function AttributeScanner() this.initialize.apply(this, arguments);
//AnnotationScanner.prototype = {
//
//  skip: function skip()
//  {
//    while (true) {
//      let c = this.current()
//      if (" ".charCodeAt(0) != c && ",".charCodeAt(0) != c) {
//        break;
//      }
//      this.moveNext();
//    }
//  },
//
//};
//AnnotationScanner.prototype.__proto__ = ForwardInputIterator.prototype;
//
////
//// IdentifierCharacter := [a-z]
//// Identifier          := IdentifierCharacter, IdentifierCharacter*
////
////
//
///**
// * @class AnnotationParser
// */
//let AnnotationParser = function AttributeParser() this.initialize.apply(this, arguments);
//AnnotationParser.prototype = {
//
//  /** Parses annotation string(decorated function name). */
//  parse: function parse(annotation)
//  {
//    let scanner = new AnnotationScanner(annotation);
//    let match_result = [];
//
//    scanner.skip();
//
//    let identifir = [ c for ( c in function() {
//      if ("a".charCodeAt(0) <= c && c <= "z".charCodeAt(0)) {
//        yield c;
//      }
//    }) ];
//
//    if (0 == identifir.length) {
//      return null; // parse error;
//    }
//
//    scanner.current();
//    if ("(".charCodeAt(0) == scanner.current()) {
//      return null; // parse error;
//    }
//
//    scanner.moveNext();
//
//    scanner.skip();
//
//    if ("(".charCodeAt(0) == c) {
//      return null; // parse error;
//    }
//    return match_result;
//  },
//
//};

/**
 * @class Attribute
 */
let Attribute = function Attribute() this.initialize.apply(this, arguments);
Attribute.prototype = {

  _target: null,
//  _parser: null,

  /** constructor */
  initialize: function initialize(target, context, name) 
  {
    this._target = target;
    this._context = context;
    this._name = name;
//    this._parser = new AnnotationParser;
  },

  get enabled() 
  {
    let target = this._target;
    target["enabled"] = true;
  },

  _: function(description) 
  {
    let target = this._target;
    target["description"] = _(description);
  },

  parse: function parse(annotation) 
  {
    with (this) {
      try {
        eval(annotation);
      } catch(e) {
        coUtils.Debug.reportError("Failed to parse annotation string: '" + annotation + "'");
//        coUtils.Debug.reportError(
//          _("Failed to parse annotation string: '%s'."), annotation);
        throw e;
      }
    }
  },

  /** Returns this object's info */
  toString: function toString() // override
  {
    return String(<>[Attribute enabled({this.enabled})]</>);
  }
};

/**
 * @class Prototype 
 */
function Prototype(definition, base_class, dependency_list) 
{
  /** Parses decorated key and sets attributes. */
  function intercept(key) 
  {
    let match = key.match(/^([\w-@]+)$|^\[(.+)\]\s*(.*)\s*$/);
    if (!match) {
      throw coUtils.Debug.Exception(
        _("Ill-formed property name: '%s'."), key)
    }
    let [, , annotation, name] = match;
    if (annotation) {
      if (!name)
        name = definition[key].name || coUtils.Uuid.generate().toString();
      if (!this.hasOwnProperty("__attributes")) {
        this.__attributes = {};
      }
      let attributes = this.__attributes;
      let target_attribute = attributes[name];
      if (!target_attribute) {
        attributes[name] = target_attribute = {};
      }
      new Attribute(target_attribute, this, name).parse(annotation);
      return name;
    }
    return key;
  };

  function copy(definition, decorated_key, base_class) 
  {
    let getter = definition.__lookupGetter__(decorated_key);
    let setter = definition.__lookupSetter__(decorated_key);
    try {
      let key = intercept.call(this, decorated_key);

      if (getter) { // has getter 
        this.__defineGetter__(key, getter);
      }
      if (setter) { // has setter
        this.__defineSetter__(key, setter);
      }
      if (!getter && !setter) { // member variable or function
        let value = definition[decorated_key];
        if ("initialize" == key && base_class && base_class.prototype.initialize) {
          // makes constructor chain.
          this.initialize = function() {
            base_class.prototype.initialize.apply(this, arguments);
            value.apply(this, arguments);
          }
        } else {
          this[key] = value;
        }
      }
    } catch (e) {
      coUtils.Debug.reportError(e);
    }
  };

  for (let decorated_key in definition) {
    copy.call(this, definition, decorated_key, base_class);
  }

  if (dependency_list) {
    this.__dependency = dependency_list.slice(0);
  }

  if (base_class) {
    // attribute chain.
    if (this.__attributes && base_class.prototype.__attributes) {
      this.__attributes.__proto__ = base_class.prototype.__attributes;
    }

    // prototype chain.
    this.__proto__ = base_class.prototype;
  }

};

/** 
 * @constructor Class
 */
let Class = function() this.initialize.apply(this, arguments);
Class.prototype = {

  _base: null,
  _dependency_list: null,
  _mixin_list: null,

  /** constructor 
   * @param {Class} base_class A Class object.
   */
  initialize: function initialize() 
  {
    this._mixin_list = [];
    this._dependency_list = [];
    let constructor = function() {
      if (this.initialize)
        return this.initialize.apply(this, arguments);
      return this;
    };
    constructor.watch("prototype", 
      function(name, oldval, newval) this.applyDefinition(newval));
    constructor.__proto__ = this;
    return constructor;
  },

  /** Makes it to be derived from base class. 
   * @param {Class} base_class A Class object.
   */
  extends: function _extends(base_class) 
  {
    this._base = base_class;
    this.prototype.__proto__ = base_class.prototype;
    return this;
  },

  /** Mixes specified aspect.
   * @param {Aspect} aspect
   */
  mix: function mix(aspect) 
  {
    this._mixin_list.push(aspect);
    return this;
  }, 

  depends: function depends(id)
  {
    if (id) {
      this._dependency_list.push(id);
    }
    return this;
  },

  /** @property definition 
   *  It is same to "prototype" property.
   */
  get definition() 
  {
    // returns prototype object.
    return this.prototype;
  },

  set definition(definition) 
  {
    // set the argument to prototype object, and raise global event.
    this.prototype = definition;
  },

  /** The watcher method of "prototype" property.
   *  @param {Object} definition A definition object which is set to "prototype" 
   *         property.
   *  @return {Object} New prototype object.
   */
  applyDefinition: function applyDefinition(definition)
  {
    let prototype = new Prototype(
      definition, this._base, this._dependency_list);

    // Apply aspects.
    for (let [, aspect] in Iterator(this._mixin_list)) {
      this.applyAspect(prototype, new Prototype(aspect.prototype));
    }

    return prototype; 
  },

  /** Apply specified Aspect. 
   *  @param {Object} prototype A prototype object.
   *  @param {Object} aspect A aspect object.
   */
  applyAspect: function applyAspect(prototype, aspect) 
  {
    for (let key in aspect) {
      // Detects whether the property specified by given key is
      // a getter or setter. NOTE that we should NOT access property 
      // by ordinaly way, like "aspect.<property-neme>".
      let getter = aspect.__lookupGetter__(key);
      let setter = aspect.__lookupSetter__(key);
      // if key is a getter method...
      if (getter) {
        prototype.__defineGetter__(key, getter);
      }
      // if key is a setter method...
      if (setter) {
        prototype.__defineSetter__(key, setter);
      }
      // if key is a generic property or method...
      if (!getter && !setter) {
        if ("initialize" == key && aspect.initialize) {
          let value = prototype.initialize;

          // makes constructor chain.
          prototype.initialize = function initialize() 
          {
            aspect.initialize.apply(this, arguments);
            value.apply(this, arguments);
          };
        } else if ("__attributes" == key) {
          if (prototype.__attributes) {
            for ([name, ] in Iterator(aspect.__attributes)) {
              let attribute = aspect.__attributes[name];
              prototype.__attributes[name] = attribute;
            }
          } else {
            prototype.__attributes = aspect.__attributes;
          }
        } else {
          prototype[key] = aspect[key];
        }
      }
    }
  },
};

/**
 * @constructor Abstruct
 */
let Abstruct = function() this.initialize.apply(this, arguments);
Abstruct.prototype = {

  applyDefinition: function(definition) 
  {
    let prototype = new Prototype(definition, this._base, this._dependency_list);
    for (let [, aspect] in Iterator(this._mixin_list)) {
      this.applyAspect(prototype, new Prototype(aspect.prototype));
    }
    return prototype;
  },

};
Abstruct.prototype.__proto__ = Class.prototype;

/**
 * @aspect PersistableAttribute
 */
Attribute.prototype.__defineGetter__("persistable", function() {
  let target = this._target;
  target["persistable"] = true;
  return function(flag) 
    target["persistable"] = flag;
});

// implements MS IPersist like interface.
let PersistableAttribute = new Aspect();
PersistableAttribute.definition = {

  /** constructor 
   *  @param {EventBroker} broker The "parent" broker object in 
   *                              the Event broker hierarchy.
   */
  initialize: function initialize(broker) 
  {
    broker.subscribe(
      "command/load-persistable-data", 
      function load(context) 
      {
        this.__load(context);
      }, this);

    broker.subscribe(
      "command/save-persistable-data", 
      function save(context) 
      {
        this.__persist(context);
      }, this);

    broker.subscribe(
      "command/get-persistable-data", 
      function get(context) 
      {
        this.__get(context);
      }, this);
  },

  /** Load persistable parameter value from context object. */
  __load: function __load(context) 
  {
    let attributes = this.__attributes;
    attributes && Object.getOwnPropertyNames(attributes)
      .filter(function(key) attributes[key]["persistable"], this)
      .forEach(function(key)
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
  },

  /** Sets persistable parameter value to context object. */
  __persist: function __persist(context) 
  {
    let attributes = this.__attributes;
    attributes && Object.getOwnPropertyNames(attributes)
      .filter(function(key) attributes[key]["persistable"], this)
      .forEach(function(key)
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
  },

  /** . */
  __get: function __get(context) 
  {
    let attributes = this.__attributes;
    let keys = [
      key for (key in attributes) 
        if (attributes[key]["persistable"])
    ];
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
  },


}; // PersistableAttribute

/**
 * @aspect WatchableAttribute
 *
 */

Attribute.prototype.__defineGetter__("watchable", function() 
{
  let target = this._target;
  target["watchable"] = true;
  return function(flag) 
  {
    target["watchable"] = flag;
  }
});

let WatchableAttribute = new Aspect();
WatchableAttribute.definition = {

  /** constructor */
  initialize: function initialize(broker)
  {
    let attributes = this.__attributes;
    for (key in attributes) {
      if (!attributes[key]["watchable"])
        continue;
      let getter = this.__lookupGetter__(key);
      let setter = this.__lookupSetter__(key);
      let path = [this.id, key].join(".");
      if (!getter && !setter) {
        let body = this[key];
        delete this[key];
        this.__defineGetter__(key, function() body);
        this.__defineSetter__(key, function(value) {
          if (body != value) {
            body = value;
            broker.notify("variable-changed/" + path, value);
          }
        });
      }
    } // for (key in attributes)
  },

};

/**
 * @aspect ListenAttribute
 */
Attribute.prototype.listen = function listen(type, target, capture) 
{
  let attribute = this._target;
  attribute["listen"] = {
    type: type,
    target: target,
    capture: capture || false,
  };
};

let ListenAttribute = new Aspect();
ListenAttribute.definition = {

  initialize: function initialize(broker) 
  {
    let attributes = this.__attributes;
    for (key in attributes) {
      let attribute = attributes[key];
      if (!attribute["listen"]) {
        continue;
      }
      let handler = this[key];
      let wrapped_handler;
      let id = [this.id, key].join(".");
      if (handler.id) {
        wrapped_handler = handler;
      } else {
        let self = this;
        wrapped_handler = function() handler.apply(self, arguments);
        wrapped_handler.id = id;
        this[key] = wrapped_handler;
      }
      let listener_info = attribute["listen"];

      wrapped_handler.watch("enabled", 
        wrapped_handler.onChange = let (self = this, old_onchange = wrapped_handler.onChange) 
          function(name, oldval, newval) 
          {
            if (old_onchange) {
              old_onchange.apply(wrapped_handler, arguments);
            }
            if (oldval != newval) {
              if (newval) {
                listener_info.context = this;
                listener_info.handler = wrapped_handler;
                listener_info.id = listener_info.id || id;
                broker.notify("command/add-domlistener", listener_info);
              } else {
                broker.notify("command/remove-domlistener", listener_info.id);
              }
            }
            return newval;
          });
      if (attribute["enabled"]) {
        wrapped_handler.enabled = true;
      };
    } // key for (key in attributes) 
  },

};


/**
 * @aspect SubscribeAttribute
 */
Attribute.prototype.subscribe = function subscribe(expression) 
{
  let target = this._target;
  target["subscribe"] = expression;
};

let SubscribeAttribute = new Aspect();
SubscribeAttribute.definition = {

  initialize: function(broker) 
  {
    let attributes = this.__attributes;
    for (key in attributes) {
      let attribute = attributes[key];
      if (!attribute["subscribe"])
        continue;
      let handler = this[key];
      let wrapped_handler;
      let id = [this.id, key].join(".");
      if (handler.id) {
        wrapped_handler = handler;
      } else {
        let self = this;
        wrapped_handler = function() handler.apply(self, arguments);
        wrapped_handler.id = id;
        this[key] = wrapped_handler;
      }
      let listen = function() {
        let topic = attribute.subscribe;
        broker.subscribe(topic, wrapped_handler, undefined, id);
      };

      wrapped_handler.watch("enabled", 
        wrapped_handler.onChange = let (self = this, old_onchange = wrapped_handler.onChange) 
          function(name, oldval, newval) 
          {
            if (old_onchange) {
              old_onchange.apply(wrapped_handler, arguments);
            }
            if (oldval != newval) {
              if (newval) {
                let topic = attribute.subscribe;
                broker.subscribe(topic, wrapped_handler, undefined, id);
              } else {
                broker.unsubscribe(wrapped_handler.id);
              }
            }
            return newval;
          });
      if (attribute["enabled"]) {
        wrapped_handler.enabled = true;
      };

      broker.subscribe("get/subscribers", 
        function(subscribers) {
          subscribers[id] = handler;
        });
    } // key for (key in attributes) 
  },

};

/**
 * @aspect SequenceAttribute
 *
 */
Attribute.prototype.sequence = function sequence()
{
  let target = this._target;
  target["sequence"] = [].slice.apply(arguments);
};

let SequenceAttribute = new Aspect();
SequenceAttribute.definition = {

  /** constructor 
   *  @param {EventBroker} broker Parent broker object.
   */
  initialize: function initialize(broker)
  {
    let attributes = this.__attributes;
    for (let key in attributes) {
      let expressions = attributes[key]["sequence"];
      if (expressions) {
        let handler = this[key];
        expressions.forEach(
          function(expression) 
          {
            broker.subscribe(
              "get/sequences", 
              function getSequences() 
              {
                return {
                  expression: expression,
                  handler: handler,
                  context: this,
                };
              }, this);
          }, this);
      }
    }
  },

}

/**
 * @aspect NmapAttribute
 *
 */
Attribute.prototype.nmap = function nmap(expression) 
{
  let target = this._target;
  target["nmap"] = [].slice.apply(arguments);
};

let NmapAttribute = new Aspect();
NmapAttribute.definition = {

  /** constructor 
   *  @param {EventBroker} broker Parent broker object.
   */
  initialize: function initialize(broker) 
  {
    let attributes = this.__attributes;
    for (key in attributes) {
      let attribute = attributes[key];
      let expressions = attribute["nmap"];
      if (!expressions)
        continue;
      let handler = this[key];
      let delegate = this[key] = handler.id ? 
        this[key]
      : let (self = this) function() handler.apply(self, arguments);
      delegate.id = delegate.id || [this.id, key].join(".");
      delegate.description = attribute.description;
      delegate.expressions = expressions;
      broker.subscribe("get/nmap", function() delegate);

      // Register load handler.
      broker.subscribe(
        "command/load-persistable-data", 
        function load(context) // Restores settings from context object.
        {
          let expressions = context[delegate.id + ".nmap"];
          if (expressions) {
            delegate.expressions = expressions;
            if (delegate.enabled) {
              delegate.enabled = false;
              delegate.enabled = true;
            }
          }
        }, this);

      // Register persist handler.
      broker.subscribe(
        "command/save-persistable-data", 
        function persist(context) // Save settings to persistent context.
        {
          if (expression.join("") != delegate.expression.join("")) {
            context[delegate.id + ".nmap"] = delegate.expressions;
          }
        }, this);
    }
  },
};


/**
 * @aspect CmapAttribute
 *
 */
Attribute.prototype.cmap = function cmap(expression) 
{
  let target = this._target;
  target["cmap"] = [].slice.apply(arguments);
};

let CmapAttribute = new Aspect();
CmapAttribute.definition = {

  /** constructor 
   *  @param {EventBroker} broker Parent broker object.
   */
  initialize: function initialize(broker) 
  {
    let attributes = this.__attributes;
    for (key in attributes) {
      let attribute = attributes[key];
      let expressions = attribute["cmap"];
      if (!expressions)
        continue;
        let handler = this[key];
        let delegate = this[key] = handler.id ? 
          this[key]
        : let (self = this) function() handler.apply(self, arguments);
        delegate.id = delegate.id || [this.id, key].join(".");
        delegate.description = attribute.description;
        delegate.expressions = expressions;

        broker.subscribe("get/cmap", function() delegate);

        // Register load handler.
        broker.subscribe(
          "command/load-persistable-data", 
          function load(context) // Restores settings from context object.
          {
            let expressions = context[delegate.id + ".cmap"];
            if (expressions) {
              delegate.expressions = expressions;
              if (delegate.enabled) {
                delegate.enabled = false;
                delegate.enabled = true;
              }
            }
          }, this);

        // Register persist handler.
        broker.subscribe(
          "command/save-persistable-data", 
          function persist(context) // Save settings to persistent context.
          {
            if (expressions.join("") != delegate.expressions.join("")) {
              context[delegate.id + ".cmap"] = delegate.expressions;
            }
          }, this);
    }
  },
};

/**
 * @aspect CommandAttribute
 *
 */
Attribute.prototype.command 
  = function command(name, args) 
{
  let target = this._target;
  target["command"] = { name: name, args: args };
};

let CommandAttribute = new Aspect();
CommandAttribute.definition = {

  /** constructor 
   *  @param {EventBroker} broker Parent broker object.
   */
  initialize: function initialize(broker) 
  {
    let attributes = this.__attributes;
    for (key in attributes) {
      let attribute = attributes[key];
      let command_info = attribute["command"];
      if (!command_info) {
        continue;
      }
      let handler = this[key];
      let delegate = this[key] = handler.id ? 
        this[key]
      : let (self = this) function() handler.apply(self, arguments);
      delegate.id = delegate.id || [this.id, key].join(".");
      delegate.description = attribute.description;

      let commands = command_info.name
        .split("/")
        .map(function(name)
        let (self = this) {
          name: name,
          description: attribute.description,
          args: command_info.args,

          complete: function complete(source, listener) 
          {
            let args = this.args;
            args && args.some(function(arg)
            {
              let [name, option] = arg.split("/");
              let completer = broker.uniget(<>get/completer/{name}</>);
              let position = completer.startSearch(source, listener, option);
              const NOT_MATCH = -1;
              const MATCH = 0;
              if (NOT_MATCH == position || MATCH == position) {
                return true;
              }
              source = source.substr(position); // advance current position
              return false;
            });
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
 * @abstruct Component
 * The base class of module.
 */
let Component = new Abstruct().mix(PersistableAttribute)
                              .mix(WatchableAttribute)
                              .mix(SequenceAttribute)
                              .mix(NmapAttribute)
                              .mix(CmapAttribute)
                              .mix(SubscribeAttribute)
                              .mix(ListenAttribute)
                              .mix(CommandAttribute)
Component.definition = {

  /** constructor */
  initialize: function initialize(broker) 
  {
    this._broker = broker;
    broker.subscribe(<>change/enabled-state/{this.id}</>, 
      function(enabled) this.enabled = enabled, this);

    broker.subscribe("get/components", 
      function(instances) this, this);

  },

  /** This method is expected to run test methods.
   *  It should return result information of test. */
  test: function test() 
  {
    throw coUtils.Debug.Exception(_("Method 'test' is not implemented."))
  },

  /** Overrids text format expression. */
  toString: function toString()  // override
  {
    return String(<>[Component {this.id}]</>);
  }
  
};

/** 
 * @class Plugin
 * The plugin base class that inherits class "Molude".
 * It has "enabled" property and derived classes are expected to implements
 * following methods: 
 *
 *  - function install(session)    Install itself.
 *  - function uninstall(session)  Uninstall itself.
 */
let Plugin = new Abstruct().extends(Component)
Plugin.definition = {

  __enabled: false,
  dependency: null,
  "[persistable] enabled_when_startup": true,

  /** constructor */
  initialize: function initialize(broker)
  {
    if (this.__dependency) {
      this.dependency = {};
      let topic;
      if (this.__dependency.length > 0) {
        topic = "@initialized/{" + this.__dependency.join("&") + "}";
      } else {
        topic = "@event/broker-started";
      }
      broker.subscribe(
        topic, 
        function onLoad() 
        {
          let args = arguments;
          this.__dependency.forEach(function(key, index) {
            this.dependency[key] = args[index];
          }, this);
          this.enabled = this.enabled_when_startup;
          broker.notify(<>initialized/{this.id}</>, this);
        }, 
        this);
    }
    broker.subscribe(
      <>command/set-enabled/{this.id}</>, 
      function(value) this.enabled = value, this);
    broker.subscribe(
      "@event/session-stopping", 
      function() this.enabled = false, 
      this);
  },

  /** 
   * @property {Boolean} enabled Boolean flag that indicates install/uninstall 
   *                     state of plugin object.  
   */
  get enabled() 
  {
    return this.__enabled;
  },

  set enabled(value) 
  {
    value = Boolean(value);
    if (value != this.__enabled) {
      let broker = this._broker;
      if (value) {
        try {
          this.install(broker);
        } catch (e) {
          coUtils.Debug.reportError(e);
          coUtils.Debug.reportError(_("Failed to enable plugin: %s"), this.id);
          throw e;
        }
        broker.notify("installed/" + this.id, this);
      } else {
        broker.notify("uninstalling/" + this.id, this);
        this.uninstall(broker);
      }
      this.__enabled = value;
      this.enabled_when_startup = value;
    }
  },

  /** This method is expected to install itself. */
  install: function install(session) 
  {
    throw coUtils.Debug.Exception(
      _("Method '%s::install' is not implemented."), this.id);
  },

  /** This method is expected to uninstall itself. */
  uninstall: function uninstall(session) 
  {
    throw coUtils.Debug.Exception(
      _("Method '%s::uninstall' is not implemented."), this.id);
  },

  /** Overrids toString */
  toString: function toString() 
  {
    return String(<>[Plugin {this.id}]</>);
  },
};  

/** 
 * @class XPCOMFactory
 */
let XPCOMFactory = new Class();
XPCOMFactory.definition = {

  _constructor: null,
  _classID: null,
  _description: null,
  _contractID: null,
  _registered: false,

  initialize: 
  function initialize(constructor, classID, description, contractID)
  {
    this._constructor = constructor;
    this._classID = classID;
    this._description = description;
    this._contractID = contractID;
  },

  registerSelf: function registerSelf()
  {
    if (Components.classes[this._contractID]) {
      return;
    }

    Components.manager
      .QueryInterface(Components.interfaces.nsIComponentRegistrar)
      .registerFactory(
        this._classID, this._description, this._contractID, this);
    this._registered = true;

    let observer_service = Components
      .classes["@mozilla.org/observer-service;1"]
      .getService(Components.interfaces.nsIObserverService);
    observer_service.addObserver(this, "quit-application", false);
  },

  unregisterSelf: function unregisterSelf()
  {
    if (!this._registered)
      return;
    Components.manager
      .QueryInterface(Components.interfaces.nsIComponentRegistrar)
      .unregisterFactory(this._classID, this);
    this._registered = false;
  },

// nsIFactory implementation
  createInstance: function createInstance(a_outer, a_IID)
  {
    if (a_outer) {
      throw Components.results.NS_ERROR_NO_AGGREGATION;
    }
    try {
      return new this._constructor().QueryInterface(a_IID);
    } catch(e) {
      coUtils.Debug.reportError(e);
      throw e;
    }
  },

  lockFactory: function lockFactory(a_lock)
  {
    throw Componetns.results.NS_ERROR_NOT_IMPLEMENTED;
  },

  observe: function observe() 
  {
    let observer_service = Components
      .classes["@mozilla.org/observer-service;1"]
      .getService(Components.interfaces.nsIObserverService);
    observer_service.removeObserver(this, "quit-application");
    this.unregisterSelf();
  },

  QueryInterface: function QueryInterface(a_IID)
  {
    if (!a_IID.equals(Components.interafaces.nsIFactory) 
     && !a_IID.equals(Components.interafaces.nsISupports))
      throw Components.results.NS_ERROR_NOT_IMPLEMENTED;
    return this;
  },
};

/** @constructor CoClass
 */
let CoClass = function() this.initialize.apply(this, arguments);
CoClass.prototype = {

  factory: null,

  applyDefinition: function applyDefinition(definition) 
  {
    let prototype = Class.prototype.applyDefinition.apply(this, arguments);
    if (!Components.classes[prototype.contractID]) {
      this.factory = new XPCOMFactory(
        this, 
        prototype.classID,
        prototype.description,
        prototype.contractID
      );
      this.factory.registerSelf();
    }
    return prototype;
  },

  destroy: function destory()
  {
    if (this.factory) {
      this.factory.unregisterSelf();
      this.factory = null;
    }
  },

};
CoClass.prototype.__proto__ = Class.prototype;


