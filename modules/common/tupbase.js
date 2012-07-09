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
 * @class Trait
 */
function Trait() 
{
  return this.initialize.apply(this, arguments);
}
Trait.prototype = {

  id: null,
  _definition: null,

  /** constructor */
  initialize: function initialize() 
  {
  },

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

  /** define members. 
   * @param {Object} definition.
   */
  define: function define(definition)
  {
    if (definition) {
      this._definition = definition;
    }
  },

  /* override */
  toString: function toString()  // override
  {
    return "[Trait " + this.id + "]";
  }

}; // class Trait

/**
 * @class AttributeContext
 */
function AttributeContext()
{
  return this.initialize.apply(this, arguments);
}
AttributeContext.prototype = {

  _target: null,
  _attributes_map: [], // static

  /** constructor */
  initialize: function initialize(target) 
  {
    this._target = target;
  },

  get enabled() 
  {
    this._target["enabled"] = true;
  },

  _: function(description) 
  {
    this._target["description"] = _(description);
  },

  /** Parses and evaluate annotation string with default JS parser.
   *  @param {String} annotation A annotation string.
   */
  parse: function parse(annotation) 
  {
    try {
      // push "this" into activation context and evaluate annotation string.
      new Function("with(arguments[0]) { return (" + annotation + ");}")(this);
    } catch(e) {
      coUtils.Debug.reportError(
        _("Failed to parse annotation string: '%s'."), annotation);
      throw e;
    }
  },

  /** Define new attribute.
   *  @param {String} id
   */
  define: function define(id, attribute)
  {
    // store attribute object with id string.
    this._attributes_map[id] = attribute;

    // define id in attribute context.
    this.__defineGetter__(id, function() 
    {
      this._target[id] = [true];
      return function() this._target[id] = Array.slice(arguments);
    });
  },

  /** Returns this object's info */
  toString: function toString() // override
  {
    return "[AttributeContext enabled(" + this.enabled + ")]";
  },

}; // class AttributeContext


var ConceptContext = {

  "Object": function(value) 
  { 
    return "object" == typeof value; 
  },

  "Array": function(value) 
  { 
    return Array.isArray(value); 
  },

  "Action": function(value) 
  { 
    return "function" == typeof value
      || "undefined" == typeof value
      ; 
  },

  "Uint16": function(value) 
  { 
    return "number" == typeof value 
      && 0 <= value 
      && value < (1 << 16)
      && 0 == value % 1
      ; 
  },

  "Uint32": function(value) 
  { 
    return "number" == typeof value 
      && 0 <= value 
      && value < (1 << 32)
      && 0 == value % 1
      ; 
  },

  "Char": function(value) 
  { 
    return "string" == typeof value && 1 == value.length; 
  },

  "String": function(value) 
  { 
    return "string" == typeof value; 
  },

  "Undefined": function(value) 
  { 
    return undefined === value; 
  },

  "Boolean": function(value) 
  { 
    return true === value || false === value; 
  },

}; // ConceptContext

/**
 * @class Prototype 
 */
function Prototype(definition, base_class, dependency_list) 
{
  /** Parses decorated key and sets attributes. */
  function intercept(key) 
  {
    var match = key.match(/^([\w-@]+)$|^\[(.+)\]\s*(.*)\s*$/);
    var annotation, name;
    var attributes;
    var target_attribute;

    if (!match) {
      throw coUtils.Debug.Exception(
        _("Ill-formed property name: '%s'."), key)
    }
    [, , annotation, name] = match;
    if (annotation) {
      if (!name)
        name = definition[key].name || coUtils.Uuid.generate().toString();
      if (!this.hasOwnProperty("__attributes")) {
        this.__attributes = {};
      }
      attributes = this.__attributes;
      target_attribute = attributes[name];
      if (!target_attribute) {
        attributes[name] = target_attribute = {};
      }
      new AttributeContext(target_attribute).parse(annotation);
      return name;
    }
    return key;
  };

  function copy(definition, decorated_key, base_class) 
  {
    var getter = definition.__lookupGetter__(decorated_key);
    var setter = definition.__lookupSetter__(decorated_key);
    var key, value;

    try {
      key = intercept.call(this, decorated_key);

      if (getter) { // has getter 
        this.__defineGetter__(key, getter);
      }
      if (setter) { // has setter
        this.__defineSetter__(key, setter);
      }
      if (!getter && !setter) { // member variable or function
        value = definition[decorated_key];
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

  for (decorated_key in definition) {
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

}; // Prototype


/** 
 * @constructor Class
 *
 * The meta class constructor in tupbase.
 *
 * example 1:
 * ----
 *
 * var A = new Class();
 *
 * ----
 *
 * It creates a new class constructor.
 *
 *
 * example 2:
 * ----
 *
 * var B = new Class().extends(A);
 *
 * ----
 *
 * It creates a new class constructor derived from class A.
 *
 *
 * example 3:
 * ----
 *
 * var C = new Class().extends(B).mix(Trait1).requires(Concept2);
 *
 * ----
 *
 * It creates a new class constructor derived from class B, mixed Trait1, 
 * and requires Concept2.
 * 
 *
 */
function Class() 
{
  return this.initialize.apply(this, arguments);
}
Class.prototype = {

  _base: null,
  _dependency_list: null,
  _mixin_list: null,
  _concept_list: null,
  _defined: false,

  /** constructor 
   * @param {Class} base_class A Class object.
   */
  initialize: function initialize() 
  {
    var constructor;

    // initialize attribute lists.
    this._mixin_list = [];
    this._dependency_list = [];
    this._concept_list = [];

    constructor = function() {
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

  /** Applys concept. 
   * @param {String} name A Concept name string.
   */
  requires: function _requires(name) 
  {
    var concept;

    if (!(name in ConceptContext)) {
      throw coUtils.Debug.Exception(
        _("Specified concept name '%s' is not defined."), name);
    } 
    concept = ConceptContext[name];
    if (this._defined) {
      ConceptContext[name](this.definition);
    } else {
      this._concept_list.push(name);
    }
    return this;
  },

  /** Mixes specified trait.
   * @param {Trait} trait
   */
  mix: function mix(trait) 
  {
    if (this._defined) {
      this.applyTrait(this.definition, new Prototype(trait.definition));
    } else {
      this._mixin_list.push(trait);
    }
    return this;
  }, 

  /** Stores a id to dependency_list. */
  depends: function depends(id)
  {
    this._dependency_list.push(id);
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

  /** Stores a definition object as "prototype". */
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
    var trait;
    var concept_name;
    var i;
    var mixin_list = this._mixin_list, 
        concept_list = this._concept_list;
    var prototype = new Prototype(
      definition, this._base, this._dependency_list);

    // Apply traits.
    for (i = 0; i < mixin_list.length; ++i) {
      trait = mixin_list[i];
      this.applyTrait(prototype, new Prototype(trait.prototype));
    }

    // Apply concepts.
    for (i = 0; i < concept_list.length; ++i) {
      concept_name = concept_list[i];
      if (!(concept_name in ConceptContext)) {
        throw coUtils.Debug.Exception(
          _("Specified concept name '%s' is not defined."), concept_name);
      } 
      ConceptContext[concept_name](prototype);
    }

    this._defined = true;
    return prototype; 
  },

  /** Apply specified Trait. 
   *  @param {Object} prototype A prototype object.
   *  @param {Object} trait A trait object.
   */
  applyTrait: function applyTrait(prototype, trait) 
  {
    var key;
    var getter, setter;
    var value;
    var name, attribute;

    for (key in trait) {
      // Detects whether the property specified by given key is
      // a getter or setter. NOTE that we should NOT access property 
      // by ordinaly way, like "trait.<property-neme>".
      getter = trait.__lookupGetter__(key);
      setter = trait.__lookupSetter__(key);
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
        if ("initialize" == key && trait.initialize) {
          value = prototype.initialize;

          // makes constructor chain.
          prototype.initialize = function initialize() 
          {
            trait.initialize.apply(this, arguments);
            value.apply(this, arguments);
          };
        } else if ("__attributes" == key) {
          if (prototype.__attributes) {
            for ([name, ] in Iterator(trait.__attributes)) {
              attribute = trait.__attributes[name];
              prototype.__attributes[name] = attribute;
            }
          } else {
            prototype.__attributes = trait.__attributes;
          }
        } else {
          prototype[key] = trait[key];
        }
      }
    }
  }, // applyTrait

  /** Load *.js files from specified directories. 
   *  @param {String} search path 
   */
  loadAttributes: function loadAttributes(search_path, scope) 
  {
    var paths = coUtils.File.getFileEntriesFromSerchPath(search_path),
        entry, url, module_scope;

    for (entry in paths) {
      module_scope = new function() { this.__proto__ = scope; };
      try {
        // make URI string such as "file://....".
        url = coUtils.File.getURLSpec(entry); 
        coUtils.Runtime.loadScript(url, module_scope);
        if (module_scope.main) {
          module_scope.main(this);
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
  }, // loadAttributes

};

/**
 * @constructor Abstruct
 */
function Abstruct()
{
  return this.initialize.apply(this, arguments);
}
Abstruct.prototype = {

  __proto__: Class.prototype,

  /** Enumerates stored traits and apply them. */
  applyDefinition: function applyDefinition(definition) 
  {
    var prototype = new Prototype(definition, this._base, this._dependency_list);
    var i;
    var trait;
    var mixin_list = this._mixin_list;

    for (i = 0; i < mixin_list.length; ++i) {
      trait = mixin_list[i];
      this.applyTrait(prototype, new Prototype(trait.definition));
    }
    this._defined = true;
    return prototype;

  }, // applyDefinition

}; // Abstruct

/** 
 * @abstruct Component
 * The base class of component node in tupbase2.
 */
var Component = new Abstruct();
Component.definition = {

  dependency: null,

  /** constructor */
  initialize: function initialize(broker) 
  {
    var install_trigger;

    this._broker = broker;

    if (this.__dependency) {
      this.dependency = {};
      if (this.__dependency.length > 0) {
        install_trigger = "initialized/{" + this.__dependency.join("&") + "}";
      } else {
        install_trigger = "@event/broker-started";
      }
      broker.subscribe(
        install_trigger, 
        function onLoad() 
        {
          var args = arguments;

          this.__dependency.forEach(function(key, index) {
            this.dependency[key] = args[index];
          }, this);
          this.enabled = this.enabled_when_startup;
          broker.notify("initialized/" + this.id, this);
        }, 
        this);
    }
    broker.subscribe("get/components", 
      function(instances)
      {
        return this;
      }, this);
  },

  sendMessage: function sendMessage(topic, data)
  {
    var broker;
    
    broker = this._broker;
    if (!broker) {
      coUtils.Debug.reportError(topic + " " + data.toSource());
    }
    return broker.notify(topic, data);
  },

  postMessage: function postMessage(topic, data)
  {
    var broker;
    
    coUtils.Timer.setTimeout(
      function()
      {
        broker = this._broker;
        broker.notify(topic, data);
      }, 0)
  },

  request: function request(topic, data)
  {
    var broker;
    
    broker = this._broker;
    return broker.uniget(topic, data);
  },

  getVariable: function getVariable(topic)
  {
    var broker, result, length;
    
    broker = this._broker;
    result = broker.notify(topic);
    length = result.length;
    if (0 === length) {
      return null;
    } else {
      if (1 !== length) {
        coUtils.Debug.reportWarning(
          _("Too many subscriber is found: %s"),
          topic);
        return result[0];
      }
    }
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
    return String("[Component " + this.id + "]");
  }
  
}; // class Component


/** 
 * @class Plugin
 * The plugin base class that inherits class "Molude".
 * It has "enabled" property and derived classes are expected to implements
 * following methods: 
 *
 *  - function install(session)    Install itself.
 *  - function uninstall(session)  Uninstall itself.
 */
var Plugin = new Abstruct().extends(Component);
Plugin.definition = {

  __enabled: false,

  /** constructor */
  initialize: function initialize(broker)
  {
    broker.subscribe(
      "command/set-enabled/" + this.id, 
      function(value) 
      {
        this.enabled = value;
      }, this);

    broker.subscribe(
      "@event/broker-stopping", 
      function() 
      {
        this.enabled = false;
      },
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
    var broker, id;

    id = this.id;
    value = Boolean(value);
    broker = this._broker;

    if (value != this.__enabled) {
      if (value) {
        try {
          broker.notify("install/" + id, broker);
        } catch (e) {
          coUtils.Debug.reportError(e);
          coUtils.Debug.reportError(
            _("Failed to enable plugin: %s"), 
            this.id);
          throw e;
        }
      } else {
        broker.notify("uninstall/" + id, broker);
      }
      this.__enabled = value;
      this.enabled_when_startup = value;
    }
  },

  /** Overrids toString */
  toString: function toString() 
  {
    return "[Plugin " + this.id + "]";
  },

};   // class Plugin

/** 
 * @class XPCOMFactory
 */
var XPCOMFactory = new Class();
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

  /** get nsIComponentRegistrar service instance and register "this" 
   *  as a XPCOM component factory. 
   */
  registerSelf: function registerSelf()
  {
    var observer_service;

    if (Components.classes[this._contractID]) {
      return;
    }

    Components.manager
      .QueryInterface(Components.interfaces.nsIComponentRegistrar)
      .registerFactory(
        this._classID, this._description, this._contractID, this);
    this._registered = true;

    observer_service = Components
      .classes["@mozilla.org/observer-service;1"]
      .getService(Components.interfaces.nsIObserverService);
    observer_service.addObserver(this, "quit-application", false);
  },

  /** get nsIComponentRegistrar service instance and unregister "this" 
   *  from XPCOM factory list. 
   */
  unregisterSelf: function unregisterSelf()
  {
    var observer_service;

    if (!this._registered) {
      return;
    }
    observer_service = Components
      .classes["@mozilla.org/observer-service;1"]
      .getService(Components.interfaces.nsIObserverService);
    observer_service.removeObserver(this, "quit-application");

    // unregister
    Components.manager
      .QueryInterface(Components.interfaces.nsIComponentRegistrar)
      .unregisterFactory(this._classID, this);
    this._registered = false;
  },

// nsIFactory implementation

  /**
   * Creates an instance of a component.
   *
   * @param aOuter Pointer to a component that wishes to be aggregated
   *               in the resulting instance. This will be nsnull if no
   *               aggregation is requested.
   * @param iid    The IID of the interface being requested in
   *               the component which is being currently created.
   * @result Pointer to the newly created instance, if successful.
   * @throw  NS_NOINTERFACE - Interface not accessible.
   *         NS_ERROR_NO_AGGREGATION - if an 'outer' object is supplied, but the
   *                                   component is not aggregatable.
   *         NS_ERROR* - Method failure.
   */
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

  /**
   * LockFactory provides the client a way to keep the component
   * in memory until it is finished with it. The client can call
   * LockFactory(PR_TRUE) to lock the factory and LockFactory(PR_FALSE)
   * to release the factory.	 
   *
   * @param  {Boolean} a_lock 
   * @throw  none - If the lock operation was successful.
   *         NS_ERROR* - Method failure.
   */
  lockFactory: function lockFactory(a_lock)
  {
    throw Componetns.results.NS_ERROR_NOT_IMPLEMENTED;
  },

  /**
   * Observe will be called when there is a notification for the
   * topic |aTopic|.  This assumes that the object implementing
   * this interface has been registered with an observer service
   * such as the nsIObserverService. 
   *
   * If you expect multiple topics/subjects, the impl is 
   * responsible for filtering.
   *
   * You should not modify, add, remove, or enumerate 
   * notifications in the implemention of observe. 
   *
   * @param a_subject : Notification specific interface pointer.
   * @param a_topic   : The notification topic or subject.
   * @param a_data    : Notification specific wide string.
   *                    subject event.
   */
  observe: function observe(a_subject, a_topic, a_data) 
  {
    this.unregisterSelf();
  },

// nsIObserver implementation
  /**
   * Provides runtime type discovery.
   * @param aIID the IID of the requested interface.
   * @return the resulting interface pointer.
   */
  QueryInterface: function QueryInterface(a_IID)
  {
    if (!a_IID.equals(Components.interafaces.nsIFactory) 
     && !a_IID.equals(Components.interafaces.nsISupports))
      throw Components.results.NS_ERROR_NOT_IMPLEMENTED;
    return this;
  },

}; // class XPCOMFactory

/** @constructor CoClass
 */
function CoClass()
{
  return this.initialize.apply(this, arguments);
}
CoClass.prototype = {

  __proto__: Class.prototype,

  factory: null,

  /** Apply definition and register it as a XPCOM component. */
  applyDefinition: function applyDefinition(definition) 
  {
    var prototype = Class.prototype.applyDefinition.apply(this, arguments);
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

  /** Unregister itself from XPCOM component management list. */
  destroy: function destroy()
  {
    if (this.factory) {
      this.factory.unregisterSelf();
      this.factory = null;
    }
  },

};

/**
 * @class Attribute
 */
function Attribute()
{
  return this.initialize.apply(this, arguments);
}
Attribute.prototype = {

  __proto__: Trait.prototype,

  /** constructor */
  initialize: function initialize(id) 
  {
    AttributeContext.prototype.define(id, this);
  },

  toString: function toString()
  {
    return "[Attribute " + this.__id + "]";
  },

};

Component.loadAttributes(["modules/attributes"], { 
  ConceptContext: ConceptContext,
  Attribute: Attribute,
  coUtils: coUtils,
  _: _,
});

/**
 * @class ClassAttribute
 */
function ClassAttribute()
{
  return this.initialize.apply(this, arguments);
}
ClassAttribute.prototype = {

  __proto__: Trait.prototype,

  /** constructor */
  initialize: function initialize(id) 
  {
    AttributeContext.prototype.define(id, this);
  },

}; // ClassAttribute


/**
 * @class Concept
 */
function Concept()
{
  return this.initialize.apply(this, arguments);
}
Concept.prototype = {

  __proto__: Trait.prototype,

  /** constructor */
  initialize: function initialize(broker) 
  {
  },

  /** */
  check: function check(target)
  {
    var attributes = target.__attributes;
    var subscribers = Object
      .getOwnPropertyNames(attributes)
      .reduce(function(map, key) {
        var value = attributes[key];
        var tokens;
        var i;
        var k;
        if (value.subscribe) {
          tokens = value.subscribe.toString().split("/");
          for (i = 0; i < tokens.length; ++i) {
            k = tokens.slice(0, i + 1).join("/");
            map[k] = value;
          }
        }
        return map;
      }, {});

    this._checkImpl(target, subscribers);
    return true;

  }, // check;

  _checkImpl: function _checkImpl(target, subscribers)
  {
    var definition = this._definition;
    var rule, comment;
    var getter, setter;
    var match;
    var message, identifier, type;
    var key;

    for ([rule, comment] in Iterator(definition)) {
      getter = definition.__lookupGetter__(rule);
      setter = definition.__lookupSetter__(rule);
      if (!getter && !setter) {
        match = rule.match(/^(?:<(.+?)>|(.+?)) :: (.+)$/);
        if (null === match) {
          throw coUtils.Debug.Exception(
            _("Ill-formed concept rule expression is specified: %s."), 
            rule);
        }
        [, message, identifier, type] = match;

        if (message) {
          key = message.replace(/\/\*$/, "");
          if (undefined === subscribers[key]) {
            throw coUtils.Debug.Exception(
              _("Component '%s' does not implement required ",
                "message-concept: %s."), 
              target.id, rule);
          }
          if (subscribers[key].type) {
            if (type != subscribers[key].type) {
              throw coUtils.Debug.Exception(
                _("Component '%s' does not implement required ",
                  "message-concept: %s. - ill-typed."),
                target.id, rule);
            }
          }
          subscribers[key].description = comment;
        }

        if (identifier) {
          getter = target.__lookupGetter__(rule);
          setter = target.__lookupSetter__(rule);

          if (!getter && !setter && undefined === target[identifier]) {
            throw coUtils.Debug.Exception(
              _("Component '%s' does not implement required ",
                "signature-concept: %s."), 
              target.id, rule);

            if (target[message].type) {
              if (type != subscribers[message].type) {
                throw coUtils.Debug.Exception(
                  _("Component '%s' does not implement required ",
                    "signature-concept: %s - ill-typed."),
                  target.id, rule);
              }
            }
            target[message].description = comment;
          }
        }
      }
    }
  }, // _checkImpl

  /** define members. 
   * @param {Object} definition.
   */
  define: function define(definition) // definition
  {
    var self = this;
    ConceptContext[definition.id] = function(target) 
    { 
      return self.check(target); 
    };
    this._definition = definition;
  },

  /** override */
  toString: function toString()
  {
    return "[Trait Concept]";
  },

}; // Concept

/**
 * @concept CompletionContextConcept
 */
var CompletionContextConcept = new Concept();
CompletionContextConcept.definition = {

  get id()
    "CompletionContext",

}; // CompletionContextConcept


/**
 * @concept CompleterConcept
 */
var CompleterConcept = new Concept();
CompleterConcept.definition = {

  get id()
    "Completer",

  // signature concept
  "<command/query-completion/*> :: CompletionContext -> Undefined":
  _("Allocates n cells at once."),

}; // CompleterConcept

// EOF
