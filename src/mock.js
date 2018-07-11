function Mock(history) {
  this._history = history;
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
      Object.assign(cls.prototype, maker._clsProto);

      maker._propsMetadata.extraProps.forEach(function (key) { delete cls.prototype[key]; });

      delete cls.RESTORE;

      return cls;
    };

    return clazz;
  },
  spy: function (fn) {
    var self = this;

    return spyCallable(fn, {
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

function ClassMaker(mock, cls, props) {
  if (! (cls instanceof Function)) {
    throw new Error('Class constructor must be function');
  }

  this._cls = cls;
  this._clsConstructorName = cls.prototype.hasOwnProperty('constructor') ? cls.prototype.constructor.name : cls.name;
  this._clsProto = Object.getOwnPropertyNames(cls.prototype).reduce(function (acc, key) {
    acc[key] = cls.prototype[key];

    return acc;
  }, {});
  this._clsProtoCopy = copyPrototype(cls);
  this._clsProtoHasOwnConstructor = cls.prototype.hasOwnProperty('constructor');
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

  this._propsMetadata = { extraProps: [] };
}

ClassMaker.prototype = {
  makeConstructor: function (cls, useOriginPrototype) {
    if (! (cls instanceof Function)) {
      throw new Error('Class constructor must be function');
    }

    var self = this;

    if (this._props.hasOwnProperty('constructor')) {
      var rep = this.getPropReplacement('constructor');

      cls = spyCallable(copyConstructor(rep), {
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

      var rep = self.getPropReplacement(key);

      spyClassCallable(cls, key, rep, {
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
    });

    return cls;
  },
  getPropReplacement: function (key) {
    var prop = this._props[key];

    if (prop === this._cls || prop === this._cls.COPY_OF) {
      if (! (key in this._clsProtoCopy)) {
        prop = Function;
      } else {
        return this._clsProtoCopy[key];
      }
    }

    if (! (key in this._clsProtoCopy)) {
      this._propsMetadata.extraProps.push(key);
    }

    if (prop === Function) {
      var rep = function () {};

      Object.defineProperty(rep, 'name', {value: key, writable: false});

      return rep;
    }

    if (prop instanceof fixture.Fixture) {
      var rep = prop.pop.bind(prop);

      Object.defineProperty(rep, 'name', {value: key, writable: false});

      return rep;
    }

    if (prop === fixture.Fixture) {
      if (! this._mock._history._observer) {
        throw new Error('Mock observer must be defined in linked history before "Fixture" reference can be used.');
      }

      var rep = this._mock._history._observer._fixture.pop.bind(this._mock._history._observer._fixture);

      Object.defineProperty(rep, 'name', {value: key, writable: false});

      return rep;
    }

    if (prop instanceof Function) {
      var rep = prop;

      Object.defineProperty(rep, 'name', {value: key, writable: false});

      return rep;
    }

    rep = function () { return prop; };

    Object.defineProperty(rep, 'name', {value: key, writable: false});

    return rep;
  },
};

module.exports = {
  Mock: Mock,
};

var copyConstructor = require('./instance').copyConstructor;
var copyPrototype = require('./instance').copyPrototype;
var fixture = require('./fixture');
var spyCallable = require('./spy').spyCallable;
var spyClassCallable = require('./spy').spyClassCallable;
