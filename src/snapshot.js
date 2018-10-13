function Snapshot(entries) {
  this._config = {
    args: true,
    exception: true,
    result: true,
  };
  this._entries = entries || [];
  this._mapper = snapshotMapEntry;
  this._name = this._provider = null;
  this._processors = [];

  this.setMemoryProvider({});
}

Snapshot.prototype = {
  setConfig: function (config) {
    this._config = config;

    return this;
  },
  setMapper: function (mapper) {
    if (mapper !== void 0 && ! (mapper instanceof Function)) {
      throw new Error('Snapshot mapper must be callable');
    }

    this._mapper = mapper;

    return this;
  },
  setName: function (name) {
    this._name = name;

    return this;
  },
  setProvider: function (provider) {
    this._provider = provider;

    return this;
  },
  setFsProvider: function (dir) {
    this._provider = new SnapshotFsProvider(dir);

    return this;
  },
  setMemoryProvider: function (dictionary) {
    this._provider = new SnapshotMemoryProvider(dictionary);

    return this;
  },
  link: function (observer) {
    this._observer = observer;

    return this;
  },
  unlink: function () {
    this._observer = void 0;

    return this;
  },
  addProcessor: function (checker, serializer) {
    var basicTypeChecker = basicTypes.find(function (basicType) {
      return basicType[0] === checker;
    });

    if (typeof checker !== 'function' && ! basicTypeChecker) {
      var expectedValue = checker;

      checker = function (value) {
        return value === expectedValue;
      }
    }

    basicTypeChecker = basicTypeChecker
      ? basicTypeChecker[1].check.bind(basicTypeChecker[1])
      : checker;

    var basicTypeSerializer = basicTypes.find(function (basicType) {
      return basicType[0] === (serializer === void 0 ? checker : serializer);
    });

    basicTypeSerializer = basicTypeSerializer
      ? basicTypeSerializer[1].serialize.bind(basicTypeSerializer[1])
      : serializer;

    this._processors.unshift({
      checker: basicTypeChecker,
      serializer: basicTypeSerializer,
    });

    return this;
  },
  addInstanceOfProcessor: function (cls, serializer) {
    var checker = new typeHelpers.InstanceOfType(cls);

    return this.addProcessor(checker.check.bind(checker), serializer || checker.serialize.bind(checker));
  },
  addPathProcessor: function (path, serializer) {
    var checker = new typeHelpers.Path(path);

    return this.addProcessor(checker.check.bind(checker), serializer || checker.serialize.bind(checker));
  },
  addRegexPathProcessor: function (regex, serializer) {
    var checker = new typeHelpers.RegexPath(regex);

    return this.addProcessor(checker.check.bind(checker), serializer || checker.serialize.bind(checker));
  },
  addStrictInstanceOfProcessor: function (cls, serializer) {
    var checker = new typeHelpers.StrictInstanceOfType(cls);

    return this.addProcessor(checker.check.bind(checker), serializer || checker.serialize.bind(checker));
  },
  addUndefinedProcessor: function (serializer) {
    var checker = new typeHelpers.UndefinedType();

    return this.addProcessor(checker.check.bind(checker), serializer || checker.serialize.bind(checker));
  },
  addProcessors: function (processors) {
    this._processors.unshift.apply(this._processors, processors);

    return this;
  },
  assert: function (snapshot) {
    return snapshotAssert(this.serialize(), snapshot instanceof Snapshot ? snapshot.serialize() : snapshot, '');
  },
  assertSaved: function (name) {
    return this.assert(this.loadCopy(name));
  },
  exists: function (name) {
    return this._provider.exists(name || this._name);
  },
  filter: function () {
    return new filter.Filter(this._entries).link(this._observer);
  },
  includeArgs: function (flag) {
    this._config.args = flag !== false;

    return this;
  },
  includeCallsCount: function (flag) {
    this._config.callsCount = flag !== false;

    return this;
  },
  includeEpoch: function (flag) {
    this._config.epoch = flag !== false;

    return this;
  },
  includeException: function (flag) {
    this._config.exception = flag !== false;

    return this;
  },
  includeExceptionsCount: function (flag) {
    this._config.exceptionsCount = flag !== false;

    return this;
  },
  includeIsAsync: function (flag) {
    this._config.isAsync = flag !== false;

    return this;
  },
  includeName: function (flag) {
    this._config.name = flag !== false;

    return this;
  },
  includeType: function (flag) {
    this._config.type = flag !== false;

    return this;
  },
  isEnabled: function (flag) {
    return this._config[flag] === true;
  },
  load: function (name) {
    this._entries = this._provider.load(name || this._name);

    return this;
  },
  loadCopy: function (name) {
    return new Snapshot(this._provider.load(name || this._name))
      .setConfig(Object.assign({}, this._config))
      .setName(this._name)
      .setProvider(this._provider)
      .addProcessors([].concat(this._processors))
      .link(this._observer);
  },
  remove: function (name) {
    this._provider.remove(name || this._name);

    return this;
  },
  save: function (name) {
    this._provider.save(name || this._name, this);

    return this;
  },
  serialize: function () {
    return this._entries.map(function (entry, ind) {
      return snapshotSerializeEntry(
        this,
        this._mapper(this, entry),
        '[' + ind + ']'
      );
    }.bind(this));
  },
};

function snapshotAssert(source, target, path) {
  if (source === target) {
    return true;
  }

  if (Array.isArray(source)) {
    if (! Array.isArray(target) || source.length !== target.length) {
      return path;
    }

    return every(source, function (val, ind) {
      return snapshotAssert(source[ind], target[ind], path + '[' + ind + ']');
    });
  }

  if (source !== null && typeof source === 'object') {
    var keys = Object.keys(source);

    if (! (target !== null && typeof target === 'object') || keys.length !== Object.keys(target).length) {
      return path;
    }

    return every(keys, function (key) {
      return snapshotAssert(source[key], target[key], path + '.' + key);
    });
  }

  return path;
}

function IgnoreInternal() {
}

function snapshotSerializeEntry(snapshot, entry, path, primitiveOnly) {
  return snapshotSerializeValue(snapshot, entry, path, primitiveOnly, void 0, true);
}

function snapshotSerializeValue(snapshot, value, path, primitiveOnly, circular, notApplyProcessors) {
  var processor;

  if (notApplyProcessors !== true) {
    processor = snapshot._processors.length && snapshot._processors.find(function (p) {
      return p.checker(value, path);
    });
  }

  var serialized;

  if (processor) {
    serialized = processor.serializer(value);

    if (serialized === typeHelpers.Ignore) {
      return IgnoreInternal;
    }
  } else {
    serialized = value;
  }

  if (! circular) {
    circular = [];
  }

  if (! primitiveOnly && Array.isArray(serialized)) {
    if (circular.indexOf(value) !== - 1) {
      return '[[ Circular ! ]]';
    }

    circular.push(value);

    serialized.forEach(function (val, ind) {
      var tmp = snapshotSerializeValue(snapshot, val, path + '[' + ind + ']', false, circular);

      if (tmp !== serialized[ind]) {
        serialized[ind] = tmp;
      }
    });

    circular.pop();

    for (var i = 0; i < serialized.length;) {
      if (serialized[i] === IgnoreInternal) {
        serialized.splice(i, 1);
      } else {
        i += 1;
      }
    }
  } else if (! primitiveOnly && serialized && typeof serialized === 'object') {
    if (circular.indexOf(value) !== - 1) {
      return '[[ Circular ! ]]';
    }

    circular.push(value);

    Object.keys(serialized).forEach(function (key) {
      var tmp = snapshotSerializeValue(snapshot, value[key], path + '.' + key, false, circular);

      if (tmp !== serialized[key]) {
        serialized[key] = tmp;
      }
    });

    circular.pop();

    Object.keys(serialized).forEach(function (key) {
      if (serialized[key] === IgnoreInternal) {
        delete serialized[key];
      }
    });
  }

  return serialized;
}

function snapshotMapEntry(snapshot, entry) {
  var mappedEntry = {};

  if (snapshot.isEnabled('name')) {
    mappedEntry.name = entry.name;
  }

  if (snapshot.isEnabled('args')) {
    mappedEntry.args = entry.args;
  }

  if (snapshot.isEnabled('exception') && entry.isException) {
    mappedEntry.exception = entry.exception;
  }

  if (snapshot.isEnabled('result') && ! entry.isException) {
    mappedEntry.result = entry.result;
  }

  if (snapshot.isEnabled('type')) {
    mappedEntry.type = entry.type;
  }

  if (snapshot.isEnabled('callsCount')) {
    mappedEntry.callsCount = entry.callsCount;
  }

  if (snapshot.isEnabled('epoch')) {
    mappedEntry.epoch = entry.epoch;
  }

  if (snapshot.isEnabled('exceptionsCount')) {
    mappedEntry.exceptionsCount = entry.exceptionsCount;
  }

  if (snapshot.isEnabled('isAsync')) {
    mappedEntry.isAsync = entry.isAsync;
  }

  return mappedEntry;
}

function every(arr, fn) {
  for (var i = 0, l = arr.length; i < l; i ++) {
    var check = fn(arr[i], i);

    if (check !== true) {
      return check;
    }
  }

  return true;
}

function SnapshotFsProvider(dir) {
  this._dir = dir;
}

SnapshotFsProvider.prototype = {
  exists: function (name) {
    return require('fs').existsSync(this._dir + '/' + name.replace(/\s/g, '_') + '.snapshot.json');
  },
  load: function (name) {
    var snapshot = JSON.parse(require('fs').readFileSync(this._dir + '/' + name.replace(/\s/g, '_') + '.snapshot.json'));

    return snapshot;
  },
  remove: function (name) {
    if (name && this.exists(name)) {
      require('fs').unlinkSync(this._dir + '/' + name.replace(/\s/g, '_') + '.snapshot.json');
    }

    return this;
  },
  save: function (name, snapshot) {
    require('fs').writeFileSync(
      this._dir + '/' + name.replace(/\s/g, '_') + '.snapshot.json',
      JSON.stringify(
        snapshot instanceof Snapshot ? snapshot.serialize() : snapshot,
        void 0,
        4
      )
    );

    return this;
  },
};

function SnapshotMemoryProvider(dictionary) {
  this._dictionary = dictionary || {};
}

SnapshotMemoryProvider.prototype = {
  exists: function (name) {
    return name in this._dictionary;
  },
  load: function (name) {
    if (name in this._dictionary) {
      return this._dictionary[name];
    }

    throw new Error('Snapshot not exists: ' + name);
  },
  remove: function (name) {
    delete this._dictionary[name];

    return this;
  },
  save: function (name, snapshot) {
    this._dictionary[name] = snapshot instanceof Snapshot ? snapshot.serialize() : snapshot;

    return this;
  }
};

module.exports = {
  Snapshot: Snapshot,
  SnapshotFsProvider: SnapshotFsProvider,
  SnapshotMemoryProvider: SnapshotMemoryProvider,
};

var filter = require('./filter');
var typeHelpers = require('./type_helpers');

var basicTypes = [
  [typeHelpers.AnyType, new typeHelpers.AnyType()],
  [Array, new typeHelpers.ArrayType()],
  [typeHelpers.ArrayType, new typeHelpers.ArrayType()],
  [Boolean, new typeHelpers.BooleanType()],
  [typeHelpers.BooleanType, new typeHelpers.BooleanType()],
  [Date, new typeHelpers.DateType()],
  [typeHelpers.Ignore, new typeHelpers.Ignore()],
  [typeHelpers.DateType, new typeHelpers.DateType()],
  [Number, new typeHelpers.NumberType()],
  [typeHelpers.NumberType, new typeHelpers.NumberType()],
  [Object, new typeHelpers.ObjectType()],
  [typeHelpers.ObjectType, new typeHelpers.ObjectType()],
  [typeHelpers.ShallowCopy, new typeHelpers.ShallowCopy()],
  [String, new typeHelpers.StringType()],
  [typeHelpers.StringType, new typeHelpers.StringType()],
  [void 0, new typeHelpers.UndefinedType()],
  [typeHelpers.UndefinedType, new typeHelpers.UndefinedType()],
];
