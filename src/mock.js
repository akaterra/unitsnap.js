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
  from: function (props) {
    var maker = new ClassMaker(this, function () {}, props);

    return maker.makePrototypeFor(maker.makeConstructor(maker._cls, true), true);
  },
  override: function (cls, props) {
    var maker = new ClassMaker(this, cls, props);

    var clazz = maker.makePrototypeFor(cls, true);

    clazz.RESTORE = function () {
      Object.assign(cls, maker._clsProps);
      Object.assign(cls.prototype, maker._clsProto);

      maker._propsMetadata.extraClassProps.forEach(function (key) { delete cls[key]; });
      maker._propsMetadata.extraProps.forEach(function (key) { delete cls.prototype[key]; });

      delete cls.RESTORE;

      return cls;
    };

    return clazz;
  },
  spy: function (fn) {
    var self = this;

    return spyFunction(fn, {
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

function StaticMethod(value) {
  if (! (this instanceof StaticMethod)) {
    return new StaticMethod(value);
  } else {
    this.value = value;
  }
}

var classNativeProps = ['arguments', 'callee', 'caller', 'length', 'name', 'prototype'];

function ClassMaker(mock, cls, props) {
  if (! (cls instanceof Function)) {
    throw new Error('Class constructor must be function');
  }

  this._cls = cls;
  this._clsConstructorName = cls.prototype.hasOwnProperty('constructor') ? cls.prototype.constructor.name : cls.name;
  this._clsProps = Object.getOwnPropertyNames(cls).filter(function (key) {
      return classNativeProps.indexOf(key) === - 1;
  }).reduce(function (acc, key) {
    acc[key] = cls[key];

    return acc;
  }, {});
  this._clsProto = Object.getOwnPropertyNames(cls.prototype).reduce(function (acc, key) {
    acc[key] = cls.prototype[key];

    return acc;
  }, {});
  this._clsProtoCopy = copyPrototype(cls);
  this._clsProtoHasOwnConstructor = cls.prototype.hasOwnProperty('constructor');
  this._clsScope = copyScope(cls);
  this._mock = mock;

  if (! props) {
    props = Object.getOwnPropertyNames(cls.prototype);

    props.push('constructor');
  }

  this._props = Array.isArray(props)
    ? props.reduce(function (acc, key) {
      acc[key] = cls;

      return acc;
    }, {})
    : props;

  this._propsMetadata = { extraClassProps: [], extraProps: [] };
}

ClassMaker.prototype = {
  makeConstructor: function (cls, useOriginPrototype) {
    if (! (cls instanceof Function)) {
      throw new Error('Class constructor must be function');
    }

    var self = this;

    if (this._props.hasOwnProperty('constructor')) {
      var rep = classMakerGetReplacement(
        self._props.constructor,
        'constructor',
        self._cls,
        self._clsScope,
        self._propsMetadata
      );

      cls = spyFunction(copyConstructor(rep), {
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
        }
      }, true);
    } else {
      cls = copyConstructor(cls);
    }

    Object.assign(cls, self._clsProps);

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

      var rep;

      if (self._props[key] instanceof StaticMethod) {
        rep = classMakerGetReplacement(
          self._props[key].value,
          key,
          self._cls,
          self._clsProps,
          self._propsMetadata.extraClassProps
        );

        if (rep === fixture.Fixture) {
          rep = mockGetFixturePop(self._mock);
        }

        Object.defineProperty(rep, 'name', {value: key, writable: false});

        spyStaticMethod(cls, key, rep, {
          argsAnnotation: self._cls.prototype[key],
          extra: {
            name: self._clsConstructorName + '.' + rep.name,
            type: 'staticMethod',
          },
          origin: self._cls[key],
          replacement: rep,
          onCall: function (context, state) {
            if (self._mock._history) {
              self._mock._history.push(state);
            }
          }
        });
      } else {
        rep = classMakerGetReplacement(
          self._props[key],
          key,
          self._cls,
          self._clsScope,
          self._propsMetadata.extraProps
        );

        if (rep === fixture.Fixture) {
          rep = mockGetFixturePop(self._mock);
        }

        Object.defineProperty(rep, 'name', {value: key, writable: false});

        spyInstanceMethod(cls, key, rep, {
          argsAnnotation: self._cls.prototype[key],
          extra: {
            name: self._clsConstructorName + '.' + rep.name,
            type: 'method',
          },
          origin: self._cls.prototype[key],
          replacement: rep,
          onCall: function (context, state) {
            if (self._mock._history) {
              self._mock._history.push(state);
            }
          }
        });
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

function classMakerGetReplacement(prop, key, cls, clsProps, extraProps) {
  if (prop === cls || prop === cls.COPY_OF) {
    if (! (key in clsProps)) {
      prop = Function;
    } else {
      return clsProps[key];
    }
  }

  if (! (key in clsProps)) {
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

module.exports = {
  Mock: Mock,
  StaticMethod: StaticMethod,
};

var copyConstructor = require('./instance').copyConstructor;
var copyPrototype = require('./instance').copyPrototype;
var copyScope = require('./instance').copyScope;
var fixture = require('./fixture');
var spyStaticMethod = require('./spy').spyStaticMethod;
var spyFunction = require('./spy').spyFunction;
var spyInstanceMethod = require('./spy').spyInstanceMethod;
