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
 * The Original Code is coTerminal
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

  /** @property {Object} definition */
  get definition()
    this._definition,

  set definition(value) 
  {
    if (value) {
      this._definition = value;
      coUtils.Event.notifyGlobalEvent("defined/" + this.id, this);
    }
  },

  /** constructor */
  initialize: function initialize(id, definition) 
  {
    this.id = id;
    this.definition = definition;
  },

  toString: function toString()  // override
  {
    return "[Aspect " + this.id + "]";
  }

};

/**
 * @class Attribute
 */
let Attribute = function() this.initialize.apply(this, arguments);
Attribute.prototype = {

  _target: null,

  /** constructor */
  initialize: function initialize(target, context, name) 
  {
    this._target = target;
    this._context = context;
    this._name = name;
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

  toString: function toString() // override
  {
    return String(<>[Attribute enabled({this.enabled})]</>);
  }
};

/**
 * @class Prototype 
 */
function Prototype(definition, base_class, interface_list) 
{
  /** Parses decorated key and sets attributes. */
  function intercept(key) 
  {
    let match = key.match(/^([\w-@]+)$|^\[(.+)\]\s*(.*)\s*$/);
    if (!match) {
      throw coUtils.Debug.Exception(_("Ill-formed property name: '%s'."), key)
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
      with (new Attribute(target_attribute, this, name)) {
        try {
          eval(annotation);
        } catch(e) {
          coUtils.Debug.reportError(
            "Fails to parse annotation string: '" + annotation + "'");
          throw e;
        }
      }
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

  if (interface_list) {
    let interfaces = this.__interfaces = {};
    for each (let interface_info in interface_list) {
      let id = interface_info.id;
      let interface_definition = interface_info.definition;;
      interfaces[id] = interface_definition;
    }
  }

  if (base_class) {
    // attribute chain.
    if (this.__attributes && base_class.prototype.__attributes) {
      this.__attributes.__proto__ = base_class.prototype.__attributes;
    }

    // interface chain.
    if (this.__interfaces && base_class.prototype.__interfaces) {
      this.__interfaces.__proto__ = base_class.prototype.__interfaces;
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
  _interface_list: null,
  _mixin_list: null,

  /** constructor 
   * @param {Class} base_class A Class object.
   */
  initialize: function initialize(base_class) 
  {
    this._interface_list = [];
    this._mixin_list = [];
    let constructor = function() {
      if (this.initialize)
        return this.initialize.apply(this, arguments);
      return this;
    };
    if (0 < arguments.length) {
      this.extends.call(constructor, base_class);
      let args = [arg for each (arg in arguments)];
      args.shift(); // discard first argument.
      for each (let arg in args) {
        this.implements.call(constructor, arg);
      }
    }
    constructor.watch("prototype", 
      function(id, oldval, newval) this.applyDefinition(newval));
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

  /** Mix-ins specified aspect.
   * @param {Aspect} aspect
   */
  mix: function mix(aspect) 
  {
    this._mixin_list.push(aspect);
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
    coUtils.Event.notifyGlobalEvent("defined/" + this.__id__, this);
  },

  /** The watcher method of "prototype" property.
   *  @param {Object} definition A definition object which is set to "prototype" 
   *         property.
   *  @return {Object} New prototype object.
   */
  applyDefinition: function applyDefinition(definition)
  {
    let prototype = new Prototype(
      definition, this._base, this._interface_list);

    // Apply aspects.
    for (let [, aspect] in Iterator(this._mixin_list)) {
      this.applyAspect(prototype, new Prototype(aspect.definition));
    }

    // Check interface.
    for (let [, interface_info] in Iterator(this._interface_list)) {
      this.checkInterface(prototype, interface_info);
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
      //if (aspect.hasOwnProperty(key)) {
        //if ("initialize" != key) {
        //  if (prototype.__lookupGetter__(key) 
        //   || prototype.__lookupSetter__(key) 
        //   || prototype.hasOwnProperty(key))
        //  {
        //    coUtils.Debug.reportMessage(
        //      _("applyAspect '%s' is already defined."), key)
        //  }
        //}
        
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
              for (name in aspect.__attributes) {
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
      //}
    }
  },

  /** Checks prototype object if methods and properties in specified 
   *  interface was implemented. 
   *  @param {Object} prototype A prototype object.
   *  @param {Object} interface_info A interface object.
   */
  checkInterface: function(prototype, interface_info) 
  {
    let id = interface_info.id;
    let definition = interface_info.definition;
    for (let key in definition) {
      if (definition.hasOwnProperty(key)) {
        let getter = interface_info.__lookupGetter__(key);
        let setter = interface_info.__lookupSetter__(key);
        if (getter) {
          let my_getter = prototype.__lookupGetter__(key);
          if (!my_getter) {
            throw coUtils.Debug.Exception(
              _("Interface member '%s.%s' (getter function) not defined."),
              id, key);
          }
        }
        if (setter) {
          let my_getter = prototype.__lookupSetter__(key);
          if (!my_getter) {
            throw coUtils.Debug.Exception(
              _("Interface member '%s.%s' (setter function) not defined."),
              id, key);
          }
        }
        if (!getter && !setter) {
          if (undefined === prototype[key]) {
            throw coUtils.Debug.Exception(
              _("Interface member '%s.%s' not defined."),
              id, key);
          }
        }
      }
    }
  }, // checkInterface
};

/**
 * @constructor Abstruct
 */
let Abstruct = function() this.initialize.apply(this, arguments);
Abstruct.prototype = {

  applyDefinition: function(definition) 
  {
    let prototype = new Prototype(definition, this._base, this._interface_list);
    for (let [, aspect] in Iterator(this._mixin_list)) {
      this.applyAspect(prototype, new Prototype(aspect.definition));
    }
    return prototype;
  },

};
Abstruct.prototype.__proto__ = Class.prototype;

/**
 * @aspect Persistable
 */
Attribute.prototype.__defineGetter__("persistable", function() {
  let target = this._target;
  target["persistable"] = true;
  return function(flag) 
    target["persistable"] = flag;
});

// implements MS IPersist like interface.
let Persistable = new Aspect("Persistable");
Persistable.definition = {

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
  },

  /** . */
  __get_wrapper: function __get_wrapper(context) 
  {
    let attributes = this.__attributes;
    let keys = [
      key for (key in attributes) 
        if (attributes[key]["persistable"])
    ];
    if (keys.length) {
      let id = this.id;
      let current = context[id] = context[id] || {};
      for (let [, key] in Iterator(keys)) {
        try {
          context.__defineGetter__(key, let (self = this) function() {
            return self[key];
          });
          context.__defineSetter__(key, let (self = this) function(value) {
            self[key] = value;
          });
        } catch (e) {
          coUtils.Debug.reportError(e);
          coUtils.Debug.reportError(
            _("An Error occured when making wrapper '%s.%s'."),
            id, key);
        }
      }
    }
  },

  /** Load persistable parameter value from context object. */
  __load: function __load(context) 
  {
    let attributes = this.__attributes;
    let keys = [
      key for (key in attributes) 
        if (attributes[key]["persistable"])
    ];
    if (keys.length) {
      let id = this.id;
      for (let [, key] in Iterator(keys)) {
        let path = [id, key].join(".");
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
      }
    }
  },

  /** Sets persistable parameter value to context object. */
  __persist: function __persist(context) 
  {
    let attributes = this.__attributes;
    let keys = [
      key for (key in attributes) 
        if (attributes[key]["persistable"])
    ];
    if (keys.length) {
      let id = this.id;
      for each (let key in keys) {
        try {
          let path = [id, key].join(".");
          context[path] = this[key];
        } catch (e) {
          coUtils.Debug.reportError(e);
          coUtils.Debug.reportError(
            _("An Error occured when persisting member '%s'."),
            path);
        }
      }
    }
  },

}; // Persistable

/**
 * @aspect Watchable
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

let Watchable = new Aspect();
Watchable.definition = {

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
            body = value
            broker.notify("variable-changed/" + path, value);
          }
        });
      }
    } // for (key in attributes)
  },

};

/**
 * @aspect Listen
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

let Listen = new Aspect();
Listen.definition = {

  initialize: function initialize(broker) 
  {
    let attributes = this.__attributes;
    for (key in attributes) {
      let attribute = attributes[key];
      if (!attribute["listen"])
        continue;
      let handler = this[key];
      let wrapped_handler;
      if (handler.id) {
        wrapped_handler = handler;
      } else {
        let self = this;
        wrapped_handler = function() handler.apply(self, arguments);
        this[key] = wrapped_handler;
      }
      let id = [this.id, key].join(".");
      let listener_info = attribute["listen"];
      let enabled = false;
      wrapped_handler.__defineGetter__("enabled", function() enabled);
      wrapped_handler.__defineSetter__("enabled", function(value) {
        if (enabled == value)
          return;
        enabled = value;
        if (enabled) {
          listener_info.context = this;
          listener_info.handler = wrapped_handler;
          listener_info.id = listener_info.id || id;
          broker.notify("command/add-domlistener", listener_info);
        } else {
          broker.notify("command/remove-domlistener", listener_info.id);
        }
      });
      if (attribute["enabled"]) {
        wrapped_handler.enabled = true;
      };
    } // key for (key in attributes) 
  },

};


/**
 * @aspect Subscribable
 */
Attribute.prototype.subscribe = function subscribe(expression) 
{
  let target = this._target;
  target["subscribe"] = expression;
};

let Subscribable = new Aspect();
Subscribable.definition = {

  initialize: function(broker) 
  {
    let attributes = this.__attributes;
    for (key in attributes) {
      let attribute = attributes[key];
      if (!attribute["subscribe"])
        continue;
      let handler = this[key];
      let wrapped_handler;
      if (handler.id) {
        wrapped_handler = handler;
      } else {
        let self = this;
        wrapped_handler = function() handler.apply(self, arguments);
        this[key] = wrapped_handler;
      }
      let id = [this.id, key].join(".");
      let listen = function() {
        let topic = attribute.subscribe;
        broker.subscribe(topic, wrapped_handler, undefined, id);
      };
      let enabled = false;
      wrapped_handler.__defineGetter__("enabled", function() enabled);
      wrapped_handler.__defineSetter__("enabled", function(value) {
        if (enabled == value)
          return;
        enabled = value;
        if (enabled) {
          let topic = attribute.subscribe;
          broker.subscribe(topic, wrapped_handler, undefined, id);
        } else {
          broker.unsubscribe(id);
        }
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
 * @aspect Sequence
 *
 */
Attribute.prototype.sequence = function sequence()
{
  let target = this._target;
  target["sequence"] = [arg for each (arg in arguments)];
};

let Sequence = new Aspect();
Sequence.definition = {

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
 * @aspect Mappable
 *
 */
Attribute.prototype.key = function key(expression) 
{
  let target = this._target;
  target["key"] = [expression for each (expression in arguments)];
};

let Mappable = new Aspect();
Mappable.definition = {

  /** constructor 
   *  @param {EventBroker} broker Parent broker object.
   */
  initialize: function initialize(broker) 
  {
    let attributes = this.__attributes;
    for (key in attributes) {
      let attribute = attributes[key];
      let expressions = attribute["key"];
      if (!expressions)
        continue;
        let handler = this[key];
        let delegate = this[key] = handler.id ? 
          this[key]
        : let (self = this) function() handler.apply(self, arguments);
        delegate.id = delegate.id || [this.id, key].join(".");
        delegate.description = attribute.description;
        delegate.expressions = expressions;

        let enabled = false;
        delegate.__defineGetter__("enabled", function() enabled);
        delegate.__defineSetter__("enabled", function(value) {
          if (enabled == value)
            return;
          enabled = value;
          expressions.forEach(function(expression) {
            if (enabled) {
              let expressions = delegate.expressions;
              let packed_code = coUtils.Keyboard.parseExpression(expression);
              let topic = coUtils.Text.format("key-pressed/%d", packed_code);
              broker.subscribe(topic, function(info) {
                delegate.call(this, info.event);
                info.handled = true;
              }, this, delegate.id);
            } else {
              broker.unsubscribe(delegate.id);
            }
          }, this); // expressions.forEach
        });
        if (attribute["enabled"]) {
          delegate.enabled = true;
        };
        broker.subscribe("get/shortcuts", function() delegate);

        // Register load handler.
        broker.subscribe(
          "command/load-persistable-data", 
          function load(context) // Restores settings from context object.
          {
            let expressions = context[delegate.id];
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
            context[delegate.id] = delegate.expressions;
          }, this);
    }
  },
};

/** 
 * @abstruct Component
 * The base class of module.
 */
let Component = new Abstruct().mix(Persistable)
                              .mix(Watchable)
                              .mix(Sequence)
                              .mix(Mappable)
                              .mix(Subscribable)
                              .mix(Listen)
Component.definition = {

  /** constructor */
  initialize: function initialize(broker) 
  {
    this._broker = broker;
    broker.subscribe("change/enabled-state/" + this.id, 
      function(enabled) this.enabled = enabled, this);

    broker.subscribe("get/module-instances", 
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

  _enabled: false,
  "[persistable] enabled_when_startup": true,

  /** constructor */
  initialize: function initialize(session)
  {
    let topic = coUtils.Text.format("command/set-enabled/%s", this.id);
    session.subscribe(topic, function(value) this.enabled = value, this);
    session.subscribe(
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
    return this._enabled;
  },

  set enabled(value) 
  {
    value = Boolean(value);
    if (value != this._enabled) {
      let broker = this._broker;
      if (value) {
        try {
        this.install(broker);
        } catch (e) {
          alert(this.id)
        }
        broker.notify("installed/" + this.id, this);
      } else {
        broker.notify("uninstalling/" + this.id, this);
        this.uninstall(broker);
      }
      this._enabled = value;
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
    if (Components.classes[this._contractID])
      return;
    Components.manager
      .QueryInterface(Components.interfaces.nsIComponentRegistrar)
      .registerFactory(
        this._classID, this._description, this._contractID, this);
    this._registered = true;
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

  applyDefinition: function applyDefinition(definition) 
  {
    let prototype = Class.prototype.applyDefinition.apply(this, arguments);
    if (!Components.classes[prototype.contractID]) {
      new XPCOMFactory(
        this, 
        prototype.classID,
        prototype.description,
        prototype.contractID
      ).registerSelf();
    }
    return prototype;
  },

};
CoClass.prototype.__proto__ = Class.prototype;


