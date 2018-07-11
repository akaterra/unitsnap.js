function Fixture() {
  this._name = this._strategy = null;

  this.setQueueStrategy().throwOnInstanceOf(Error);
}

Fixture.prototype = {
  setName: function (name) {
    this._name = name;

    return this;
  },
  setStrategy: function (strategy) {
    this._strategy = strategy;

    return this;
  },
  setCallbackStrategy: function (cb) {
    this._strategy = new FixtureCallbackStrategy(cb);

    return this;
  },
  setQueueStrategy: function (values) {
    this._strategy = new FixtureQueueStrategy(values);

    return this;
  },
  setFsProvider: function (dirOrProvider) {
    this._strategy.set(dirOrProvider instanceof FixtureFsProvider
      ? dirOrProvider.load(this._name)
      : new FixtureFsProvider(dirOrProvider).load(this._name));

    return this;
  },
  setMemoryProvider: function (dictionaryOrProvider) {
    this._strategy.set(dictionaryOrProvider instanceof FixtureMemoryProvider
      ? dictionaryOrProvider.load(this._name)
      : new FixtureMemoryProvider(dictionaryOrProvider).load(this._name));

    return this;
  },
  pop: function () {
    var value = this._strategy.pop();

    if (this._throwOn && this._throwOn(value)) {
      throw value;
    }

    return value;
  },
  push: function () {
    this._strategy.push.apply(this._strategy, arguments);

    return this;
  },
  throwOnCallback: function (fn) {
    this._throwOn = fn;

    return this;
  },
  throwOnClassOf: function (cls) {
    return this.throwOnCallback(function (value) {
      return value !== void 0 && value !== null && Object.getPrototypeOf(value).constructor === cls;
    });
  },
  throwOnInstanceOf: function (cls) {
    return this.throwOnCallback(function (value) {
      return value instanceof cls;
    });
  }
};

function FixtureMemoryProvider(dictionary) {
  this._dictionary = dictionary;
}

FixtureMemoryProvider.prototype = {
  setName: function (name) {
    this._name = name;

    return this;
  },
  load: function (name) {
    return this._dictionary[name || this._name];
  },
};

function FixtureFsProvider(dir) {
  this._dir = dir;
}

FixtureFsProvider.prototype = {
  setName: function (name) {
    this._name = name;

    return this;
  },
  load: function (name) {
    return JSON.parse(require('fs').readFileSync(this._dir + '/' + (name || this._name).replace(/\s/g, '_') + '.fixture.json'));
  },
};

function FixtureCallbackStrategy(cb) {
  this.set(cb);
}

FixtureCallbackStrategy.prototype = {
  set: function (cb) {
    if (! (cb instanceof Function)) {
      throw new Error('Fixture callback must be function');
    }

    this._cb = cb;

    return this;
  },
  pop: function () {
    return this._cb();
  },
  push: function () {
    this._cb.apply(null, arguments);

    return this;
  },
};

function FixtureQueueStrategy(values) {
  this.set(values !== void 0 ? values : []);
}

FixtureQueueStrategy.prototype = {
  set: function (values) {
    if (! Array.isArray(values)) {
      throw new Error('Fixture values must be array');
    }

    this._values = values;

    return this;
  },
  pop: function () {
    return this._values.shift();
  },
  push: function () {
    this._values = this._values.concat(Array.prototype.slice.call(arguments));

    return this;
  },
};

module.exports = {
  Fixture: Fixture,
  FixtureQueueStrategy: FixtureQueueStrategy,
  FixtureCallbackStrategy: FixtureCallbackStrategy,
  FixtureFsProvider: FixtureFsProvider,
  FixtureMemoryProvider: FixtureMemoryProvider,
};
