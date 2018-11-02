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
    var descriptor = {};

    if (this.descriptor.hasOwnProperty('get')) {
      descriptor.get = this.descriptor.get;
    }

    if (this.descriptor.hasOwnProperty('set')) {
      descriptor.set = this.descriptor.set;
    }

    return descriptor;
  },
  createValueDescriptor: function () {
    var descriptor = {};

    if (this.descriptor.hasOwnProperty('value')) {
      descriptor.value = this.descriptor.value;
    }

    return descriptor;
  },
  get: function (get) {
    this.descriptor.get = get !== void 0 ? get : Function;

    return this;
  },
  set: function (set) {
    this.descriptor.set = set !== void 0 ? set : Function;

    return this;
  },
  value: function (value) {
    this.descriptor.value = value;

    return this;
  },
};

function GetterSetter(getter, setter) {
  if (this instanceof GetterSetter) {
    this.descriptor = {get: getter, set: setter};
  } else {
    return new GetterSetter(getter, setter);
  }
}

function Method(value) {
  if (this instanceof Method) {
    this.descriptor = {value: value !== void 0 ? value : Function};
  } else {
    return new Method(value !== void 0 ? value : Function);
  }
}

function StaticGetterSetter(getter, setter) {
  if (this instanceof StaticGetterSetter) {
    this.descriptor = {get: getter, set: setter};
  } else {
    return new StaticGetterSetter(getter, setter);
  }
}

function StaticMethod(value) {
  if (this instanceof StaticMethod) {
    this.descriptor = {value: value !== void 0 ? value : Function};
  } else {
    return new StaticMethod(value !== void 0 ? value : Function);
  }
}

function StaticValue(value) {
  if (this instanceof StaticValue) {
    this.descriptor = {value: value};
  } else {
    return new StaticValue(value);
  }
}

function Value(value) {
  if (this instanceof Value) {
    this.descriptor = {value: value};
  } else {
    return new Value(value);
  }
}

function Custom(value) {
  if (this instanceof Custom) {
    this.value = value;
  } else {
    return new Custom(value || Function);
  }
}

Custom.prototype = {
  argsAnnotation: function (argsAnnotation) {
    this.argsAnnotation = argsAnnotation;

    return this;
  },
  comment: function (comment) {
    this.comment = comment;

    return this;
  },
  exclude: function () {
    this.exclude = true;

    return this;
  },
};

function ArgsAnnotation(value, argsAnnotation) {
  if (value instanceof Custom) {
    value = value.value;
  }

  return Custom(value).argsAnnotation(argsAnnotation);
}

function Exclude(value) {
  if (value instanceof Custom) {
    value = value.value;
  }

  return Custom(value).exclude();
}

function Generator(fn, onValue, onException) {
  return function *() {
    var generator = fn.apply(this, arguments);
    var received = void 0;

    try {
      while (true) {
        var generatorValue = generator.next(received);

        if (onValue) {
          onValue(generatorValue, received);
        }

        if (generatorValue.done) {
          return;
        }

        received = yield generatorValue.value;
      }
    } catch (e) {
      if (onException) {
        onException(e);
      }

      throw e;
    }
  };
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
            acc[key] = new GetterSetter(descriptor.descriptor.get, descriptor.descriptor.set);
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

  //if (restProp) {
  //  Object.keys(this._clsProtoPropsDescriptors).forEach(function (key) {
  //    if (this._clsProtoPropsDescriptors[key].level === 0 && ! this._props.hasOwnProperty(key)) {
  //      var descriptor = this._clsProtoPropsDescriptors[key];
  //
  //      switch (descriptor.type) {
  //        case 'function':
  //          this._props[key] = restProp instanceof Descriptor
  //            ? restProp.createGetterSetterDescriptor()
  //            : restProp;
  //
  //          break;
  //
  //        default:
  //          this._props[key] = new GetterSetter(descriptor.descriptor);
  //      }
  //
  //      this._props[key] = restProp;
  //    }
  //  }.bind(this));
  //}

  this._propsMetadata = { extraStaticProps: [], extraProps: [] };
}

ClassMaker.prototype = {
  makeConstructor: function (cls, useOriginPrototype) {
    if (! (cls instanceof Function)) {
      throw new Error('Class constructor must be function');
    }

    var custom;
    var self = this;
    var replacement;

    if (this._props.hasOwnProperty('constructor')) {
      if (self._props.constructor instanceof Custom) {
        custom = self._props.constructor;
      }

      replacement = classMakerGetReplacement(
        custom ? custom.value : self._props.constructor,
        'constructor',
        self._cls,
        self._clsProtoScope,
        self._propsMetadata
      );

      cls = spyOnFunction(copyConstructor(replacement), Object.assign({
        argsAnnotation: self._cls,
        extra: {
          name: this._clsConstructorName,
          type: 'constructor',
        },
        origin: cls,
        replacement: replacement,
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
      var replacement = null;
      var replacementDescriptor = null;
      var scope = null;

      if (prop instanceof StaticGetterSetter) {
        scope = {
          extraProps: self._propsMetadata.extraStaticProps,
          obj: self._cls,
          objProps: self._clsProps,
          propsDescriptor: self._clsPropsDescriptors,
          spyOn: spyOnStaticDescriptor,
        }
      } else if (prop instanceof StaticMethod) {
        scope = {
          extraProps: self._propsMetadata.extraStaticProps,
          obj: self._cls,
          objProps: self._clsProps,
          propsDescriptor: self._clsPropsDescriptors,
          spyOn: spyOnStaticMethod,
        }
      } else if (prop instanceof GetterSetter) {
        scope = {
          extraProps: self._propsMetadata.extraProps,
          obj: self._cls,
          objProps: self._clsProtoScope,
          propsDescriptor: self._clsProtoPropsDescriptors,
          spyOn: spyOnDescriptor,
        }
      } else {
        scope = {
          extraProps: self._propsMetadata.extraProps,
          obj: self._cls,
          objProps: self._clsProtoScope,
          propsDescriptor: self._clsProtoPropsDescriptors,
          spyOn: spyOnMethod,
        }
      }

      if (prop instanceof GetterSetter || prop instanceof StaticGetterSetter) {
        replacementDescriptor = {};

        if (prop.descriptor.get !== void 0) {
          if (prop.descriptor.get instanceof Custom) {
            customGet = prop.descriptor.get;
          }

          replacementDescriptor.get = classMakerGetReplacement(
            customGet ? customGet.value : prop.descriptor.get,
            key,
            scope.obj,
            scope.objProps,
            scope.extraProps,
          );

          if (replacementDescriptor.get === self._cls) {
            replacementDescriptor.get = scope.propsDescriptor[key].descriptor.get;
          }

          if (replacementDescriptor.get === fixture.Fixture) {
            replacementDescriptor.get = mockGetFixturePop(self._mock);
          }
        }

        if (prop.descriptor.set !== void 0) {
          if (prop.descriptor.set instanceof Custom) {
            customSet = prop.descriptor.set;
          }

          replacementDescriptor.set = classMakerGetReplacement(
            customSet ? customSet.value : prop.descriptor.set,
            key,
            scope.obj,
            scope.objProps,
            scope.extraProps,
          );

          if (replacementDescriptor.set === self._cls) {
            replacementDescriptor.set = scope.propsDescriptor[key].descriptor.set;
          }

          if (replacementDescriptor.set === fixture.Fixture) {
            replacementDescriptor.set = mockGetFixturePop(self._mock);
          }
        }

        scope.spyOn(cls, key, replacementDescriptor, {
          get: Object.assign({
            extra: {
              name: self._clsConstructorName + '.' + key,
              type: prop instanceof StaticGetterSetter ? 'staticGetter' : 'getter',
            },
            origin: scope.propsDescriptor[key] && scope.propsDescriptor[key].descriptor.get,
            replacement: prop.descriptor.get,
          }, customGet || {}),
          set: Object.assign({
            extra: {
              name: self._clsConstructorName + '.' + key,
              type: prop instanceof StaticGetterSetter ? 'staticSetter' : 'setter',
            },
            origin: scope.propsDescriptor[key] && scope.propsDescriptor[key].descriptor.set,
            replacement: prop.descriptor.set,
          }, customSet || {}),
          onCall: function (context, state) {
            if (self._mock._history) {
              self._mock._history.push(state);
            }
          },
        });
      } else {
        if (prop instanceof Custom) {
          custom = prop;
        } else if (prop instanceof StaticMethod && prop.descriptor.value instanceof Custom) {
          custom = prop.descriptor.value;
        }

        replacement = classMakerGetReplacement(
          custom ? custom.value : (prop instanceof StaticMethod ? prop.descriptor.value : prop),
          key,
          scope.obj,
          scope.objProps,
          scope.extraProps,
        );

        if (replacement === self._cls) {
          replacement = scope.propsDescriptor[key].descriptor.value;
        }

        if (replacement === fixture.Fixture) {
          replacement = mockGetFixturePop(self._mock);
        }

        Object.defineProperty(replacement, 'name', {value: key, writable: false});

        scope.spyOn(cls, key, replacement, Object.assign({
          extra: {
            name: self._clsConstructorName + '.' + key,
            type: prop instanceof StaticMethod ? 'staticMethod' : 'method',
          },
          origin: scope.propsDescriptor[key] && scope.propsDescriptor[key].descriptor.value,
          replacement: replacement,
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
  Generator: Generator,
  Initial: Initial,
  Mock: Mock,
  GetterSetter: GetterSetter,
  Method: Method,
  StaticGetterSetter: StaticGetterSetter,
  StaticMethod: StaticMethod,
  StaticValue: StaticValue,
  Value: Value,
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

var descriptorWithValueOnly = {
  create: function () {
    return this.createValueDescriptor();
  },
  createGetterSetterDescriptor: function () {
    throw new Error('Descriptor with value can only be used for: ' + (this.descriptor.name || '?'));
  },
  get: function () {
    throw new Error('Descriptor with value can only be used for: ' + (this.descriptor.name || '?'));
  },
  set: function () {
    throw new Error('Descriptor with value can only be used for: ' + (this.descriptor.name || '?'));
  },
};

var descriptorWithGetterSetterOnly = {
  create: function () {
    return this.createGetterSetterDescriptor();
  },
  createValueDescriptor: function () {
    throw new Error('Descriptor with getter/setter can only be used for: ' + (this.descriptor.name || '?'));
  },
  value: function () {
    throw new Error('Descriptor with getter/setter can only be used for: ' + (this.descriptor.name || '?'));
  },
};

GetterSetter.prototype = Object.assign(copyPrototype(Descriptor), descriptorWithGetterSetterOnly);
Method.prototype = Object.assign(copyPrototype(Descriptor), descriptorWithValueOnly);
StaticGetterSetter.prototype = Object.assign(copyPrototype(Descriptor), descriptorWithGetterSetterOnly);
StaticMethod.prototype = Object.assign(copyPrototype(Descriptor), descriptorWithValueOnly);
StaticValue.prototype = Object.assign(copyPrototype(Descriptor), descriptorWithValueOnly);
Value.prototype = Object.assign(copyPrototype(Descriptor), descriptorWithValueOnly);
