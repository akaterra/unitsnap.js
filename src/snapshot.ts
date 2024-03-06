import * as filter from './filter';
import { _Observer } from './observer';
import { _Processor, ProcessorChecker, ProcessorSerializer } from './processor';
import { ClassDef, Fn } from './utils';

export interface State {
  args?: {
      '*'?: any[];
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
  reportType?: 'call'|'returnValue';
  result?: any;
  tags?: string[];
  time?: Date;
  type?: 'constructor'|'method'|'getter'|'setter'|'single'|'staticMethod'|'staticGetter'|'staticSetter';
}

export interface ISnapshotEnv {
  mapper: (snapshot: _Snapshot, entry: State) => State;
  observer: _Observer;
  processors: { checker: Fn & { original?: Fn }, serializer: Fn & { original?: Fn } }[];
  provider: ISnapshotProvider;
}

export class _Snapshot {
  private _config: any = {
    args: true,
    exception: true,
    result: true,
  };
  private _entries: any[];
  private _mapper: ISnapshotEnv['mapper'] = snapshotMapEntry;
  private _name: string = null;
  private _observer: ISnapshotEnv['observer'] = null;
  private _processor = new _Processor();
  private _provider: ISnapshotEnv['provider'] = null;

  get config() {
    return this._config;
  }

  get env(): ISnapshotEnv {
    return {
      mapper: this._mapper,
      observer: this._observer,
      processors: this._processor.processors,
      provider: this._provider,
    };
  }

  get entries() {
    return this._entries;
  }

  get observer() {
    return this._observer;
  }

  get name() {
    return this._name;
  }

  constructor(entries?) {
    this._entries = entries || [];

    this.setMemoryProvider({});
  }

  setConfig(config) {
    this._config = config;

    return this;
  }

  setMapper(mapper) {
    if (mapper !== undefined && typeof mapper !== 'function') {
      throw new Error('Snapshot mapper must be callable');
    }

    this._mapper = mapper;

    return this;
  }

  setName(name: _Snapshot['_name']) {
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

  link(observer: _Observer) {
    this._observer = observer;

    return this;
  }

  unlink() {
    this._observer = null;

    return this;
  }

  addProcessor(checker: ProcessorChecker, serializer?: ProcessorSerializer) {
    this._processor.add(checker, serializer);

    return this;
  }

  addClassOfProcessor(cls: ClassDef<unknown>, serializer?: ProcessorSerializer) {
    this._processor.addClassOf(cls, serializer);

    return this;
  }

  addInstanceOfProcessor(cls: ClassDef<unknown>, serializer?: ProcessorSerializer) {
    this._processor.addInstanceOf(cls, serializer);

    return this;
  }

  addPathProcessor(path: string, serializer: ProcessorSerializer) {
    this._processor.addPath(path, serializer);

    return this;
  }

  addRegexPathProcessor(regex: string | RegExp, serializer: ProcessorSerializer) {
    this._processor.addRegexPath(regex, serializer);

    return this;
  }

  addUndefinedProcessor(serializer?: ProcessorSerializer) {
    this._processor.addUndefined(serializer);

    return this;
  }

  addProcessors(...processors: ISnapshotEnv['processors']) {
    processors.forEach((processor) => this.addProcessor(processor.checker, processor.serializer));

    return this;
  }

  assert(snapshot) {
    return snapshotAssert(this.serialize(), snapshot instanceof _Snapshot ? snapshot.serialize() : snapshot, '');
  }

  assertSaved(name?) {
    return this.assert(this.loadCopy(name));
  }

  exists(name?) {
    return this._provider.exists(name || this._name);
  }

  filter() {
    return new filter._Filter(this._entries).link(this._observer);
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

  isEnabled(flag?: keyof typeof _Snapshot.prototype._config): boolean {
    return this._config[flag] === true;
  }

  load(name?: string) {
    this._entries = this._provider.load(name || this._name);

    return this;
  }

  loadCopy(name?: string) {
    return new _Snapshot(this._provider.load(name || this._name))
      .setConfig({ ...this._config })
      .setName(this._name)
      .setProvider(this._provider)
      .addProcessors(...this._processor.processors)
      .link(this._observer);
  }

  remove(name?) {
    this._provider.remove(name || this._name);

    return this;
  }

  save(name?) {
    this._provider.save(name || this._name, this);

    return this;
  }

  serialize() {
    return this._entries.map((entry, ind) => this._processor.serialize(
      this._mapper(this, entry),
      `[${ind}]`,
    ));
  }
}

export function Snapshot(entries?: _Snapshot['_entries']) {
  return new _Snapshot(entries);
}

function snapshotAssert(source, target, path) {
  if (Array.isArray(source)) {
    if (!Array.isArray(target) || source.length !== target.length) {
      return path;
    }

    return every(source, (val, ind) => {
      return snapshotAssert(source[ind], target[ind], path + '[' + ind + ']');
    });
  }

  if (source && typeof source === 'object') {
    const keys = Object.keys(source);

    if (!(target && typeof target === 'object') || keys.length !== Object.keys(target).length) {
      return path;
    }

    return every(keys, (key) => {
      return snapshotAssert(source[key], target[key], path + '.' + key);
    });
  }

  return source === target ? true : path;
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

  for (const key of Object.keys(mappedEntry)) {
    if (mappedEntry[key] === undefined) {
      if (
        (key === 'args' && mappedEntry.reportType === 'call') ||
        (key === 'result' && mappedEntry.reportType === 'returnValue')
      ) {
        continue;
      }

      delete mappedEntry[key];
    }
  }

  return mappedEntry;
}

function every(arr, fn) {
  for (let i = 0, l = arr.length; i < l; i ++) {
    const check = fn(arr[i], i);

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

  constructor(dir: string) {
    this._dir = dir;
  }

  exists(name) {
    return require('fs').existsSync(this._dir + '/' + name.replace(/\s/g, '_') + '.snapshot.json');
  }

  load(name) {
    const snapshot = JSON.parse(require('fs').readFileSync(this._dir + '/' + name.replace(/\s/g, '_') + '.snapshot.json'));

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
        snapshot instanceof _Snapshot ? snapshot.serialize() : snapshot,
        undefined,
        4
      )
    );

    return this;
  }
}

export class SnapshotMemoryProvider implements ISnapshotProvider {
  private _dictionary: any;

  constructor(dictionary?: Record<string, any>) {
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
    this._dictionary[name] = snapshot instanceof _Snapshot ? snapshot.serialize() : snapshot;

    return this;
  }
}
