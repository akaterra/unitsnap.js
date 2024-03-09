import { existsSync, readFileSync, unlinkSync, writeFileSync } from 'fs';
import { _Filter } from './filter';
import { _Observer } from './observer';
import { _Processor, ProcessorChecker, ProcessorSerializer } from './processor';
import { formatNativeSnapshotEntries } from './snapshot_formatter.native';
import { formatPrettySnapshotEntries } from './snapshot_formatter.pretty';
import { State, StateReportType } from './spy';
import { ClassDef } from './utils';

export interface ISnapshotEnv {
  mapper: (snapshot: _Snapshot, entry: State) => State;
  observer: _Observer;
  processor: _Processor;
  provider: ISnapshotProvider;
}

export interface ISnapshotFormatter<T = any> {
  format(snapshot: _Snapshot): T;
}

export type SnapshotNativeEntry = Pick<State, 'name' | 'args' | 'exception' | 'result' | 'type' | 'callsCount' | 'epoch' | 'exceptionsCount' | 'isAsync'>;

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
      processor: this._processor,
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
    this._processor.classOf(cls, serializer);

    return this;
  }

  addInstanceOfProcessor(cls: ClassDef<unknown>, serializer?: ProcessorSerializer) {
    this._processor.instanceOf(cls, serializer);

    return this;
  }

  addPathProcessor(path: string, serializer: ProcessorSerializer) {
    this._processor.path(path, serializer);

    return this;
  }

  addRegexPathProcessor(regex: string | RegExp, serializer: ProcessorSerializer) {
    this._processor.regexPath(regex, serializer);

    return this;
  }

  addUndefinedProcessor(serializer?: ProcessorSerializer) {
    this._processor.undefined(serializer);

    return this;
  }

  addProcessors(...processors: ISnapshotEnv['processor']['processors']) {
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
    return new _Filter(this._entries).link(this._observer);
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

  serialize(): SnapshotNativeEntry[];

  serialize(format: 'native'): SnapshotNativeEntry[];

  serialize(format: 'pretty'): string;

  serialize<T>(format: (snapshot: _Snapshot) => T): T;

  serialize<T>(format: ISnapshotFormatter<T>): T;

  serialize(format?) {
    switch (true) {
      case typeof format === 'object':
        return format.format(this);;
      case typeof format === 'function':
        return format(this);
      case format === 'pretty':
        return formatPrettySnapshotEntries(this);
      default:
        return formatNativeSnapshotEntries(this);
    }
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

  if (snapshot.isEnabled('result') && !entry.isException) {
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
        (key === 'args' && mappedEntry.reportType === StateReportType.CALL_ARGS) ||
        (key === 'result' && mappedEntry.reportType === StateReportType.RETURN_VALUE)
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
    return existsSync(this._dir + '/' + name.replace(/\s/g, '_') + '.snapshot.json');
  }

  load(name) {
    const snapshot = JSON.parse(readFileSync(this._dir + '/' + name.replace(/\s/g, '_') + '.snapshot.json', 'utf-8'));

    return snapshot;
  }

  remove(name) {
    if (name && this.exists(name)) {
      unlinkSync(this._dir + '/' + name.replace(/\s/g, '_') + '.snapshot.json');
    }

    return this;
  }

  save(name, snapshot) {
    writeFileSync(
      this._dir + '/' + name.replace(/\s/g, '_') + '.snapshot.json',
      JSON.stringify(
        snapshot instanceof _Snapshot ? snapshot.serialize() : snapshot,
        undefined,
        4
      ),
      'utf-8',
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
