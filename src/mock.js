function Mock(history) {
  this._history = history;

  if (history && history._observer) {
    this._fixturePop = history._observer._fixture.pop.bind(history._observer._fixture);
  }
}

Mock.prototype = {
  by: function (cls, props) {
    var maker = new ClassMaker(this, cls, props);

    return maker.makePrototypeFor(maker.makeConstructor(cls, true));
  },
  byOverride: function (cls, props) {
    var maker = new ClassMaker(this, cls, props);

    return maker.makePrototypeFor(maker.makeConstructor(cls, true));
  },
  from: function (props) {
    var maker = new ClassMaker(this, function () {}, props);

    return maker.makePrototypeFor(maker.makeConstructor(maker._cls, true), true);
  },
  override: function (cls, props) {
    var maker = new ClassMaker(this, cls, props);

    var clazz = maker.makePrototypeFor(cls, true);

    clazz.RESTORE = function () {
      // class properties
      Object.keys(maker._clsPropsDescriptors).forEach(function (key) {
        var descriptor = maker._clsPropsDescriptors[key];

        if (descriptor.level === 0) {
          Object.defineProperty(cls, key, descriptor.descriptor);
        } else {
          delete cls[key];
        }
      });
      maker._propsMetadata.extraStaticProps.forEach(function (key) { delete cls[key]; });

      // instance properties
      Object.keys(maker._clsProtoPropsDescriptors).forEach(function (key) {
        var descriptor = maker._clsProtoPropsDescriptors[key];

        if (descriptor.level === 0) {
          Object.defineProperty(cls.prototype, key, descriptor.descriptor);
        } else {
          delete cls.prototype[key];
        }
      });
      maker._propsMetadata.extraProps.forEach(function (key) { delete cls.prototype[key]; });

      delete cls.RESTORE;

      return cls;
    };

    return clazz;
  },
  spy: function (fn) {
    var self = this;

    return spyOnFunction(fn, {
      argsAnnotation: fn,
      extra: {
        name: fn.name,
        type: 'single',
      },
      origin: fn,
      onCall: function (context, state) {
        if (self._history) {
          self._history.push(state);
        }
      }
    });
  },
};

var propertyGetterSetterProps = ['configurable', 'writable', 'get', 'set'];
var propertyValueProps = ['configurable', 'writable', 'value'];

function Descriptor(descriptor) {
  if (this instanceof Descriptor) {
    this.descriptor = Object.assign({}, descriptor);
  } else {
    return new Descriptor(descriptor || {});
  }
}

Descriptor.prototype = {
  create: function () {
    throw new Error('"createGetterSetterDescriptor" or "createValueDescriptor" can only be used for' + (this.descriptor.name || '?'));
  },
  createGetterSetterDescriptor: function () {
    return propertyGetterSetterProps.reduce(function (acc, key) {
      if (! this.descriptor.hasOwnProperty(key)) {
        return acc;
      }

      acc[key] = this.descriptor[key];

      return acc;
    }.bind(this), {get: this.descriptor.get || Function, set: this.descriptor.set || Function});
  },
  createValueDescriptor: function () {
    return propertyValueProps.reduce(function (acc, key) {
      if (! this.descriptor.hasOwnProperty(key)) {
        return acc;
      }

      acc[key] = this.descriptor[key];

      return acc;
    }.bind(this), {value: this.descriptor.value || Function});
  },
  get: function (get) {
    this.descriptor.get = get || Function;

    return this;
  },
  set: function (set) {
    this.descriptor.set = set || Function;

    return this;
  },
  handler: function (fn) {
    this.descriptor.value = fn || Function;

    return this;
  },
  value: function (value) {
    this.descriptor.value = value;

    return this;
  },
};

function Property(descriptor) {
  if (this instanceof Property) {
    this.descriptor = Object.assign({}, descriptor);
  } else {
    return new Property(descriptor || {});
  }
}

function StaticMethod(value) {
  if (this instanceof StaticMethod) {
    this.descriptor = {value: value};
  } else {
    return new StaticMethod(value || Function);
  }
}

function StaticProperty(descriptor) {
  if (this instanceof StaticProperty) {
    this.descriptor = Object.assign({}, descriptor);
  } else {
    return new StaticProperty(descriptor || {});
  }
}

function Custom(value) {
  if (! (this instanceof Custom)) {
    return new Custom(value || Function);
  } else {
    this.value = value;
  }
}

Custom.prototype = {
  argsAnnotation: function (argsAnnotation) {
    this.argsAnnotation = argsAnnotation;

    return this;
  },
  exclude: function () {
    this.exclude = true;

    return this;
  },
};

function ArgsAnnotation(value, argsAnnotation) {
  if (value instanceof Custom) {
    value = Custom(value.value);
  }

  return Custom(value).argsAnnotation(argsAnnotation);
}

function Exclude(value) {
  if (value instanceof Custom) {
    value = Custom(value.value);
  }

  return Custom(value).exclude();
}

function Initial() {

}

var classNativeProps = ['arguments', 'callee', 'caller', 'length', 'name', 'prototype'];

function ClassMaker(mock, cls, props) {
  if (! (cls instanceof Function)) {
    throw new Error('Class constructor must be function');
  }

  this._cls = cls;
  this._clsConstructorName = cls.prototype.hasOwnProperty('constructor') ? cls.prototype.constructor.name : cls.name;
  this._clsProps = copyScope(cls, {enumerable: true}, 1);
  this._clsProps = Object.keys(this._clsProps).filter(function (key) {
    return classNativeProps.indexOf(key) === - 1;
  }).reduce(function (acc, key) {
    Object.defineProperty(acc, key, Object.getOwnPropertyDescriptor(this._clsProps, key));

    return acc;
  }.bind(this), {});
  this._clsPropsDescriptors = copyScopeDescriptors(cls);
  this._clsProtoPropsDescriptors = copyScopeDescriptors(cls.prototype);
  this._clsProtoScope = copyScope(cls.prototype);
  this._mock = mock;

  if (! props) {
    props = Object.getOwnPropertyNames(cls.prototype);

    props.push('constructor');
  }

  var restProp;

  this._props = Array.isArray(props)
    ? props.reduce(function (acc, key) {
      if (key === '*') {
        restProp = Initial;

        return acc;
      }

      if (hasOwnProperty(this._clsProtoPropsDescriptors, key)) {
        var descriptor = this._clsProtoPropsDescriptors[key];

        switch (descriptor.type) {
          case 'function':
            acc[key] = Initial;

            break;

          default:
            acc[key] = new Property(descriptor.descriptor);
        }
      } else {
        acc[key] = Initial;
      }

      return acc;
    }.bind(this), {})
    : Object.keys(props).reduce(function (acc, key) {
      if (key === '*') {
        restProp = props[key];

        return acc;
      }

      acc[key] = props[key];

      return acc;
    }.bind(this), {});

  if (restProp) {
    Object.keys(this._clsProtoPropsDescriptors).forEach(function (key) {
      if (this._clsProtoPropsDescriptors[key].level === 0 && ! this._props.hasOwnProperty(key)) {
        var descriptor = this._clsProtoPropsDescriptors[key];

        switch (descriptor.type) {
          case 'function':
            this._props[key] = restProp instanceof Descriptor
              ? restProp.createGetterSetterDescriptor()
              : restProp;

            break;

          default:
            this._props[key] = new Property(descriptor.descriptor);
        }

        this._props[key] = restProp;
      }
    }.bind(this));
  }

  this._propsMetadata = { extraStaticProps: [], extraProps: [] };
}

ClassMaker.prototype = {
  makeConstructor: function (cls, useOriginPrototype) {
    if (! (cls instanceof Function)) {
      throw new Error('Class constructor must be function');
    }

    var custom;
    var self = this;
    var rep;

    if (this._props.hasOwnProperty('constructor')) {
      if (self._props.constructor instanceof Custom) {
        custom = self._props.constructor;
      }

      rep = classMakerGetReplacement(
        custom ? custom.value : self._props.constructor,
        'constructor',
        self._cls,
        self._clsProtoScope,
        self._propsMetadata
      );

      cls = spyOnFunction(copyConstructor(rep), Object.assign({
        argsAnnotation: self._cls,
        extra: {
          name: this._clsConstructorName,
          type: 'constructor',
        },
        origin: cls,
        replacement: rep,
        onCall: function (context, state) {
          if (self._mock._history) {
            self._mock._history.push(state);
          }
        },
      }, custom || {}), true);
    } else {
      cls = copyConstructor(cls);
    }

    Object.keys(self._clsProps).forEach(function (key) {
      Object.defineProperty(cls, key, self._clsPropsDescriptors[key].descriptor);
    });

    Object.defineProperty(cls, 'name', {value: this._cls.name, writable: false});

    if (! useOriginPrototype) {
      cls.prototype = copyPrototype(this._cls);
    } else {
      cls.prototype = this._cls.prototype;
    }

    cls.COPY_OF = this._cls;

    return cls;
  },
  makePrototypeFor: function (cls, useOriginPrototype) {
    if (! (cls instanceof Function)) {
      throw new Error('Class constructor must be function');
    }

    var self = this;

    Object.defineProperty(cls, 'name', {value: this._cls.name, writable: false});

    if (! useOriginPrototype) {
      cls.prototype = copyPrototype(this._cls);
    } else {
      cls.prototype = this._cls.prototype;
    }

    Object.keys(this._props).forEach(function (key) {
      if (key === 'constructor') {
        return;
      }

      var custom = null;
      var customGet = null;
      var customSet = null;
      var prop = self._props[key];
      var rep = null;
      var repDescriptor = null;

      if (prop instanceof StaticProperty) {
        repDescriptor = {};

        if (prop.descriptor.get) {
          if (prop.descriptor.get instanceof Custom) {
            customGet = prop.descriptor.get;
          }

          repDescriptor.get = classMakerGetReplacement(
            customGet ? customGet.value : prop.descriptor.get,
            key,
            self._cls,
            self._clsProps,
            self._propsMetadata.extraStaticProps
          );

          if (repDescriptor.get === self._cls) {
            repDescriptor.get = self._clsPropsDescriptors[key].descriptor.get;
          }

          if (repDescriptor.get === fixture.Fixture) {
            repDescriptor.get = mockGetFixturePop(self._mock);
          }
        }

        if (prop.descriptor.set) {
          if (prop.descriptor.set instanceof Custom) {
            customSet = prop.descriptor.set;
          }

          repDescriptor.set = classMakerGetReplacement(
            customSet ? customSet.value : prop.descriptor.set,
            key,
            self._cls,
            self._clsProps,
            self._propsMetadata.extraStaticProps
          );

          if (repDescriptor.set === self._cls) {
            repDescriptor.set = self._clsPropsDescriptors[key].descriptor.set;
          }

          if (repDescriptor.set === fixture.Fixture) {
            repDescriptor.set = mockGetFixturePop(self._mock);
          }
        }

        spyOnStaticDescriptor(cls, key, repDescriptor, {
          get: Object.assign({
            extra: {
              name: self._clsConstructorName + '.' + key,
              type: 'staticGetter',
            },
            origin: self._clsPropsDescriptors[key] && self._clsPropsDescriptors[key].descriptor.get,
            replacement: prop.descriptor.get,
          }, customGet || {}),
          set: Object.assign({
            extra: {
              name: self._clsConstructorName + '.' + key,
              type: 'staticSetter',
            },
            origin: self._clsPropsDescriptors[key] && self._clsPropsDescriptors[key].descriptor.set,
            replacement: prop.descriptor.set,
          }, customSet || {}),
          onCall: function (context, state) {
            if (self._mock._history) {
              self._mock._history.push(state);
            }
          },
        });
      } else if (prop instanceof Property) {
        repDescriptor = {};

        if (prop.descriptor.get) {
          if (prop.descriptor.get instanceof Custom) {
            customGet = prop.descriptor.get;
          }

          repDescriptor.get = classMakerGetReplacement(
            customGet ? customGet.value : prop.descriptor.get,
            key,
            self._cls,
            self._clsProtoScope,
            self._propsMetadata.extraProps
          );

          if (repDescriptor.get === self._cls) {
            repDescriptor.get = self._clsProtoPropsDescriptors[key].descriptor.get;
          }

          if (repDescriptor.get === fixture.Fixture) {
            repDescriptor.get = mockGetFixturePop(self._mock);
          }
        }

        if (prop.descriptor.set) {
          if (prop.descriptor.set instanceof Custom) {
            customSet = prop.descriptor.set;
          }

          repDescriptor.set = classMakerGetReplacement(
            customSet ? customSet.value : prop.descriptor.set,
            key,
            self._cls,
            self._clsProtoScope,
            self._propsMetadata.extraProps
          );

          if (repDescriptor.set === self._cls) {
            repDescriptor.set = self._clsProtoPropsDescriptors[key].descriptor.set;
          }

          if (repDescriptor.set === fixture.Fixture) {
            repDescriptor.set = mockGetFixturePop(self._mock);
          }
        }

        spyOnDescriptor(cls, key, repDescriptor, {
          get: Object.assign({
            extra: {
              name: self._clsConstructorName + '.' + key,
              type: 'getter',
            },
            origin: self._clsProtoPropsDescriptors[key] && self._clsProtoPropsDescriptors[key].descriptor.get,
            replacement: prop.descriptor.get,
          }, customGet || {}),
          set: Object.assign({
            extra: {
              name: self._clsConstructorName + '.' + key,
              type: 'setter',
            },
            origin: self._clsProtoPropsDescriptors[key] && self._clsProtoPropsDescriptors[key].descriptor.set,
            replacement: prop.descriptor.set,
          }, customSet || {}),
          onCall: function (context, state) {
            if (self._mock._history) {
              self._mock._history.push(state);
            }
          },
        });
      } else if (prop instanceof StaticMethod) {
        if (prop.descriptor.value instanceof Custom) {
          custom = prop.descriptor.value;
        }

        rep = classMakerGetReplacement(
          custom ? custom.value : prop.descriptor.value,
          key,
          self._cls,
          self._clsProps,
          self._propsMetadata.extraStaticProps
        );

        if (rep === self._cls) {
          rep = self._clsPropsDescriptors[key].descriptor.value;
        }

        if (rep === fixture.Fixture) {
          rep = mockGetFixturePop(self._mock);
        }

        Object.defineProperty(rep, 'name', {value: key, writable: false});

        spyOnStaticMethod(cls, key, rep, Object.assign({
          extra: {
            name: self._clsConstructorName + '.' + key,
            type: 'staticMethod',
          },
          origin: self._clsPropsDescriptors[key] && self._clsPropsDescriptors[key].descriptor.value,
          replacement: rep,
          onCall: function (context, state) {
            if (self._mock._history) {
              self._mock._history.push(state);
            }
          },
        }, custom || {}));
      } else {
        if (prop instanceof Custom) {
          custom = prop;
        }

        rep = classMakerGetReplacement(
          custom ? custom.value : prop,
          key,
          self._cls,
          self._clsProtoScope,
          self._propsMetadata.extraProps
        );

        if (rep === self._cls) {
          rep = self._clsProtoPropsDescriptors[key].descriptor.value;
        }

        if (rep === fixture.Fixture) {
          rep = mockGetFixturePop(self._mock);
        }

        Object.defineProperty(rep, 'name', {value: key, writable: false});

        spyOnMethod(cls, key, rep, Object.assign({
          extra: {
            name: self._clsConstructorName + '.' + key,
            type: 'method',
          },
          origin: self._clsProtoPropsDescriptors[key] && self._clsProtoPropsDescriptors[key].descriptor.value,
          replacement: rep,
          onCall: function (context, state) {
            if (self._mock._history) {
              self._mock._history.push(state);
            }
          },
        }, custom || {}));
      }
    });

    return cls;
  },
};

function mockGetFixturePop(mock) {
  if (! mock._fixturePop) {
    throw new Error('Mock observer must be defined in linked history before "Fixture" reference can be used');
  }

  return mock._fixturePop;
}

function classMakerGetReplacement(prop, key, obj, objProps, extraProps) {
  if (prop === Initial || getAncestors(obj).indexOf(prop) !== - 1 || getAncestors(obj.COPY_OF).indexOf(prop) !== - 1) {
    if (! (key in objProps)) {
      prop = Function;
    } else {
      return obj; // as reference to object self-defined property
    }
  }

  if (! (key in objProps)) {
    extraProps.push(key);
  }

  if (prop === Function) {
    return function () {};
  }

  if (prop === fixture.Fixture) {
    return fixture.Fixture;
  }

  if (prop instanceof fixture.Fixture) {
    return prop.pop.bind(prop);
  }

  if (prop instanceof Function) {
    return prop;
  }

  return function () { return prop; };
}

function hasOwnProperty(obj, key) {
  return Object.prototype.hasOwnProperty.call(obj, key);
}

module.exports = {
  ArgsAnnotation: ArgsAnnotation,
  Exclude: Exclude,
  Custom: Custom,
  Initial: Initial,
  Mock: Mock,
  Property: Property,
  StaticMethod: StaticMethod,
  StaticProperty: StaticProperty,
};

var getAncestors = require('./instance').getAncestors;
var copyConstructor = require('./instance').copyConstructor;
var copyPrototype = require('./instance').copyPrototype;
var copyScope = require('./instance').copyScope;
var copyScopeDescriptors = require('./instance').copyScopeDescriptors;
var fixture = require('./fixture');
var spyOnDescriptor = require('./spy').spyOnDescriptor;
var spyOnStaticDescriptor = require('./spy').spyOnStaticDescriptor;
var spyOnFunction = require('./spy').spyOnFunction;
var spyOnMethod = require('./spy').spyOnMethod;
var spyOnStaticMethod = require('./spy').spyOnStaticMethod;

Property.prototype = Object.assign(copyPrototype(Descriptor), {
  create: function () {
    return this.createGetterSetterDescriptor();
  },
  createValueDescriptor: function () {
    throw new Error('"createGetterSetterDescriptor" can only be used for: ' + (this.descriptor.name || '?'));
  },
});
StaticProperty.prototype = Object.assign(copyPrototype(Descriptor), {
  create: function () {
    return this.createValueDescriptor();
  },
  createGetterSetterDescriptor: function () {
    throw new Error('"createValueDescriptor" can only be used for: ' + (this.descriptor.name || '?'));
  }
});
