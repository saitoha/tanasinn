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
let Trait = function() this.initialize.apply(this, arguments);
Trait.prototype = {

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
    if (definition) {
      this._definition = definition;
    }
  },

  /** constructor */
  initialize: function initialize() 
  {
  },

  /* override */
  toString: function toString()  // override
  {
    return <>[Trait {this.id}]</>;
  }

};

/**
 * @class AttributeContext
 */
let AttributeContext = function() this.initialize.apply(this, arguments);
AttributeContext.prototype = {

  _target: null,
//  _parser: null,

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

  parse: function parse(annotation) 
  {
    with (this) {
      try {
        eval(annotation);
      } catch(e) {
        coUtils.Debug.reportError(
          _("Failed to parse annotation string: '%s'."), annotation);
        throw e;
      }
    }
  },

  /** Returns this object's info */
  toString: function toString() // override
  {
    return String(<>[AttributeContext enabled({this.enabled})]</>);
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
      new AttributeContext(target_attribute, this, name).parse(annotation);
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
  _defined: false,

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
   * @param {Trait} aspect
   */
  mix: function mix(aspect) 
  {
    if (this._defined) {
      this.applyTrait(this.prototype, new Prototype(aspect.prototype));
    } else {
      this._mixin_list.push(aspect);
    }
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
      this.applyTrait(prototype, new Prototype(aspect.prototype));
    }
    this._defined = true;
    return prototype; 
  },

  /** Apply specified Trait. 
   *  @param {Object} prototype A prototype object.
   *  @param {Object} aspect A aspect object.
   */
  applyTrait: function applyTrait(prototype, aspect) 
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
            for (let [name, ] in Iterator(aspect.__attributes)) {
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

  /** Load *.js files from specified directories. 
   *  @param {String} search path 
   */
  loadAttributes: function loadAttributes(search_path, scope) 
  {
    let entries = [entry for (entry in coUtils.File.getFileEntriesFromSerchPath(search_path))];
    //entries = entries.sort();
    //entries = entries.reverse();
    for (let [, entry] in Iterator(entries)) {
      try {
        // make URI string such as "file://....".
        let url = coUtils.File.getURLSpec(entry); 
        coUtils.Runtime.loadScript(url, scope);
        if (scope.main) {
          scope.main(this);
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
      this.applyTrait(prototype, new Prototype(aspect.prototype));
    }
    this._defined = true;
    return prototype;
  },

};
Abstruct.prototype.__proto__ = Class.prototype;

/**
 * @class Attribute
 */
let Attribute = function() this.initialize.apply(this, arguments);
Attribute.prototype = {

  initialize: function initialize(id) 
  {
    AttributeContext.prototype.__defineGetter__(id, function() 
    {
      let target = this._target;
      target[id] = [true];
      return function() target[id] = Array.slice(arguments);
    });
  },

};
Attribute.prototype.__proto__ = Trait.prototype;

/** 
 * @abstruct Component
 * The base class of module.
 */
let Component = new Abstruct();
Component.definition = {

  dependency: null,

  /** constructor */
  initialize: function initialize(broker) 
  {
    if (this.__dependency) {
      this.dependency = {};
      let install_trigger;
      let uninstall_trigger;
      if (this.__dependency.length > 0) {
        install_trigger = "initialized/{" + this.__dependency.join("&") + "}";
      } else {
        install_trigger = "@event/broker-started";
      }
      broker.subscribe(
        install_trigger, 
        function onLoad() 
        {
          let args = arguments;
          this.__dependency.forEach(function(key, index) {
            this.dependency[key] = args[index];
          }, this);
          this.enabled = this.enabled_when_startup;
          broker.notify(<>initialized/{this.id}</>, this);
          broker.notify(<>installed/{this.id}</>, this);
        }, 
        this);
    }
    this._broker = broker;
    broker.subscribe("get/components", function(instances) this, this);
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
let Plugin = new Abstruct().extends(Component);
Plugin.definition = {

  __enabled: false,

  /** constructor */
  initialize: function initialize(broker)
  {
    broker.subscribe(
      <>command/set-enabled/{this.id}</>, 
      function(value) this.enabled = value, this);
    broker.subscribe(
      "@event/broker-stopping", 
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
          broker.uniget(<>install/{this.id}</>, broker);
          //this.install(broker);
        } catch (e) {
          coUtils.Debug.reportError(e);
          coUtils.Debug.reportError(_("Failed to enable plugin: %s"), this.id);
          throw e;
        }
        broker.notify(<>installed/{this.id}</>, this);
      } else {
        broker.notify(<>uninstalling/{this.id}</>, this);
        broker.uniget(<>uninstall/{this.id}</>, broker);
        //this.uninstall(broker);
      }
      this.__enabled = value;
      this.enabled_when_startup = value;
    }
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
    if (!this._registered) {
      return;
    }
    let observer_service = Components
      .classes["@mozilla.org/observer-service;1"]
      .getService(Components.interfaces.nsIObserverService);
    observer_service.removeObserver(this, "quit-application");
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

  destroy: function destroy()
  {
    if (this.factory) {
      this.factory.unregisterSelf();
      this.factory = null;
    }
  },

};
CoClass.prototype.__proto__ = Class.prototype;

Component.loadAttributes(["modules/attributes"], { Attribute: Attribute });

