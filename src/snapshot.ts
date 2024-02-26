import * as filter from './filter';
import { Observer } from './observer';
import * as typeHelpers from './type_helpers';

export interface State {
  args?: {
      '*': any[];
      [key: string]: any;
  };
  callsCount?: number;
  comment?: string;
  context?: any;
  epoch?: string;
  exception?: any | Error;
  exceptionsCount?: number;
  isAsync?: boolean;
  isAsyncPending?: boolean;
  isException?: boolean;
  name?: string;
  origin?: (...args: any[]) => any;
  replacement?: (...args: any[]) => any;
  result?: any;
  tags?: string[];
  time?: Date;
  type?: 'constructor'|'method'|'getter'|'setter'|'single'|'staticMethod'|'staticGetter'|'staticSetter';
}

export interface ISnapshotEnv {
  mapper: (snapshot: Snapshot, entry: State) => State;
  observer: Observer;
  processors: any[];
  provider: ISnapshotProvider;
}

export class Snapshot {
  private _config: any;
  private _entries: any[];
  private _mapper: ISnapshotEnv['mapper'];
  private _name: string;
  private _observer: ISnapshotEnv['observer'] = null;
  private _processors: ISnapshotEnv['processors'];
  private _provider: ISnapshotEnv['provider'];

  get config() {
    return this._config;
  }

  get env(): ISnapshotEnv {
    return { mapper: this._mapper, observer: this._observer, processors: this._processors, provider: this._provider };
  }

  get entries() {
    return this._entries;
  }

  constructor(entries) {
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

  setConfig(config) {
    this._config = config;

    return this;
  }

  setMapper(mapper) {
    if (mapper !== void 0 && ! (mapper instanceof Function)) {
      throw new Error('Snapshot mapper must be callable');
    }

    this._mapper = mapper;

    return this;
  }

  setName(name) {
    this._name = name;

    return this;
  }

  setProvider(provider: ISnapshotProvider) {
    this._provider = provider;

    return this;
  }

  setFsProvider(dir: string) {
    this._provider = new SnapshotFsProvider(dir);

    return this;
  }

  setMemoryProvider(dictionary: Record<string, any>) {
    this._provider = new SnapshotMemoryProvider(dictionary);

    return this;
  }

  link(observer: Observer) {
    this._observer = observer;

    return this;
  }

  unlink() {
    this._observer = null;

    return this;
  }

  addProcessor(checker, serializer) {
    let [ ,basicTypeChecker ] = basicTypes.find(function (basicType) {
      return basicType[0] === checker;
    }) ?? [];

    basicTypeChecker = basicTypeChecker
      ? basicTypeChecker[1].check.bind(basicTypeChecker[1])
      : checker;

    let [ ,basicTypeSerializer ] = basicTypes.find(function (basicType) {
      return basicType[0] === (serializer === void 0 ? checker : serializer);
    }) ?? [];

    basicTypeSerializer = basicTypeSerializer
      ? basicTypeSerializer[1].serialize.bind(basicTypeSerializer[1])
      : serializer;

    this._processors.unshift({
      checker: basicTypeChecker,
      serializer: basicTypeSerializer,
    });

    return this;
  }

  addClassOfProcessor(cls, serializer) {
    var usefulCls = new typeHelpers.ClassOfType(cls);

    return this.addProcessor(usefulCls.check.bind(usefulCls), serializer || usefulCls.serialize.bind(usefulCls));
  }

  addInstanceOfProcessor(cls, serializer) {
    var usefulCls = new typeHelpers.InstanceOfType(cls);

    return this.addProcessor(usefulCls.check.bind(usefulCls), serializer || usefulCls.serialize.bind(usefulCls));
  }

  addPathProcessor(path, serializer) {
    var usefulRegex = RegExp('^' + path
      .replace(/[-[\]{}()+?.,\\^$|#\s]/g, '\\$&')
      .replace(/\*/g, '.*')
      .replace(/_/g, '.') + '$'
    );

    return this.addProcessor((value, path) => {
      return usefulRegex.test(path);
    }, serializer);
  }

  addRegexPathProcessor(regex, serializer) {
    var usefulRegex = regex instanceof RegExp ? regex : RegExp(regex);

    return this.addProcessor((value, path) => {
      return usefulRegex.test(path);
    }, serializer);
  }

  addUndefinedProcessor(serializer) {
    var usefulCls = new typeHelpers.UndefinedType();

    return this.addProcessor(usefulCls.check.bind(usefulCls), serializer || usefulCls.serialize.bind(usefulCls));
  }

  addProcessors(processors) {
    this._processors.unshift.apply(this._processors, processors);

    return this;
  }

  assert(snapshot) {
    return snapshotAssert(this.serialize(), snapshot instanceof Snapshot ? snapshot.serialize() : snapshot, '');
  }

  assertSaved(name) {
    return this.assert(this.loadCopy(name));
  }

  exists(name) {
    return this._provider.exists(name || this._name);
  }

  filter() {
    return new filter.Filter(this._entries).link(this._observer);
  }

  includeArgs(flag?: boolean) {
    this._config.args = flag !== false;

    return this;
  }

  includeCallsCount(flag?: boolean) {
    this._config.callsCount = flag !== false;

    return this;
  }

  includeEpoch(flag?: boolean) {
    this._config.epoch = flag !== false;

    return this;
  }

  includeException(flag?: boolean) {
    this._config.exception = flag !== false;

    return this;
  }

  includeExceptionsCount(flag?: boolean) {
    this._config.exceptionsCount = flag !== false;

    return this;
  }

  includeIsAsync(flag?: boolean) {
    this._config.isAsync = flag !== false;

    return this;
  }

  includeName(flag?: boolean) {
    this._config.name = flag !== false;

    return this;
  }

  includeType(flag?: boolean) {
    this._config.type = flag !== false;

    return this;
  }

  isEnabled(flag?: keyof typeof Snapshot.prototype._config): boolean {
    return this._config[flag] === true;
  }

  load(name: string) {
    this._entries = this._provider.load(name || this._name);

    return this;
  }

  loadCopy(name: string) {
    return new Snapshot(this._provider.load(name || this._name))
      .setConfig(Object.assign({}, this._config))
      .setName(this._name)
      .setProvider(this._provider)
      .addProcessors([].concat(this._processors))
      .link(this._observer);
  }

  remove(name) {
    this._provider.remove(name || this._name);

    return this;
  }

  save(name) {
    this._provider.save(name || this._name, this);

    return this;
  }

  serialize() {
    return this._entries.map(function (entry, ind) {
      return snapshotSerializeValue(
        this,
        this._mapper(this, entry),
        '[' + ind + ']'
      );
    }.bind(this));
  }
}

function snapshotAssert(source, target, path) {
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

  return source === target ? true : path;
}

function snapshotSerializeValue(snapshot, value, path, primitiveOnly?, circular?) {
  snapshot._processors.length && snapshot._processors.some(function (p) {
    if (p.checker(value, path)) {
      value = p.serializer(value);

      if (! (value instanceof typeHelpers.Continue)) {
        return true;
      }

      value = (value as any).value;
    }
  });

  if (! circular) {
    circular = [];
  }

  var serialized;

  if (!primitiveOnly && Array.isArray(value)) {
    if (circular.indexOf(value) !== - 1) {
      return '[[ Circular ! ]]'
    }

    circular.push(value);

    serialized = value.map(function (val, ind) {
      return snapshotSerializeValue(snapshot, val, path + '[' + ind + ']', false, circular);
    }).filter(function (val) {
      return val !== typeHelpers.Ignore;
    });

    circular.pop();

    return serialized;
  }

  if (!primitiveOnly && value && typeof value === 'object') {
    if (circular.indexOf(value) !== - 1) {
      return '[[ Circular ! ]]'
    }

    circular.push(value);

    serialized = Object.keys(value).reduce(function (acc, key) {
      var serialized = snapshotSerializeValue(snapshot, value[key], path + '.' + key, false, circular);

      if (serialized !== typeHelpers.Ignore) {
        acc[key] = serialized;
      }

      return acc;
    }, {});

    circular.pop();

    return serialized;
  }

  return value;
}

function snapshotMapEntry(snapshot, entry: State): State {
  const mappedEntry: State = {};

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

export interface ISnapshotProvider {
  exists(name: string): boolean;
  load(name: string): any;
  remove(name: string): this;
  save(name: string, snapshot: any): this;
}

export class SnapshotFsProvider implements ISnapshotProvider {
  private _dir: string;

  constructor(dir) {
    this._dir = dir;
  }

  exists(name) {
    return require('fs').existsSync(this._dir + '/' + name.replace(/\s/g, '_') + '.snapshot.json');
  }

  load(name) {
    var snapshot = JSON.parse(require('fs').readFileSync(this._dir + '/' + name.replace(/\s/g, '_') + '.snapshot.json'));

    return snapshot;
  }

  remove(name) {
    if (name && this.exists(name)) {
      require('fs').unlinkSync(this._dir + '/' + name.replace(/\s/g, '_') + '.snapshot.json');
    }

    return this;
  }

  save(name, snapshot) {
    require('fs').writeFileSync(
      this._dir + '/' + name.replace(/\s/g, '_') + '.snapshot.json',
      JSON.stringify(
        snapshot instanceof Snapshot ? snapshot.serialize() : snapshot,
        void 0,
        4
      )
    );

    return this;
  }
}

export class SnapshotMemoryProvider implements ISnapshotProvider {
  private _dictionary: any;

  constructor(dictionary) {
    this._dictionary = dictionary || {};
  }

  exists(name) {
    return name in this._dictionary;
  }

  load(name) {
    if (name in this._dictionary) {
      return this._dictionary[name];
    }

    throw new Error('Snapshot not exists: ' + name);
  }

  remove(name) {
    delete this._dictionary[name];

    return this;
  }

  save(name, snapshot) {
    this._dictionary[name] = snapshot instanceof Snapshot ? snapshot.serialize() : snapshot;

    return this;
  }
}

const basicTypes = [
  [typeHelpers.AnyType, new typeHelpers.AnyType()],
  [Boolean, new typeHelpers.BooleanType()],
  [typeHelpers.BooleanType, new typeHelpers.BooleanType()],
  [Date, new typeHelpers.DateType()],
  [typeHelpers.Ignore, new typeHelpers.Ignore()],
  [typeHelpers.DateType, new typeHelpers.DateType()],
  [typeHelpers.DateValue, new typeHelpers.DateValue()],
  [Number, new typeHelpers.NumberType()],
  [typeHelpers.NumberType, new typeHelpers.NumberType()],
  [String, new typeHelpers.StringType()],
  [typeHelpers.StringType, new typeHelpers.StringType()],
  [typeHelpers.This, new typeHelpers.This()],
  [void 0, new typeHelpers.UndefinedType()],
  [typeHelpers.UndefinedType, new typeHelpers.UndefinedType()],
];
