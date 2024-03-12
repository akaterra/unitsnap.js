import { existsSync, readFileSync, unlinkSync, writeFileSync } from 'fs';
import { _Filter } from './filter';
import { _Observer } from './observer';
import { _Processor, ProcessorChecker, ProcessorSerializer } from './processor';
import { formatCompactSnapshotEntries } from './snapshot_formatter.compact';
import { formatNativeSnapshotEntries } from './snapshot_formatter.native';
import { State, StateReportType } from './spy';
import { ClassDef } from './utils';

export interface ISnapshotEnv {
  format;
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
  private _entries: string | any[];
  private _format;
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
      format: this._format,
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

  constructor(entries?: _Snapshot['_entries']) {
    this._entries = entries || [];

    this.setMemoryProvider({});
  }

  setConfig(config) {
    this._config = config;

    return this;
  }

  setFormat(format) {
    this._format = format;

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

  addStrictInstanceOfProcessor(cls: ClassDef<unknown>, serializer?: ProcessorSerializer) {
    this._processor.strictInstanceOf(cls, serializer);

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
    return this._provider.which(name || this._name);
  }

  filter() {
    if (!Array.isArray(this._entries)) {
      throw new Error('Snapshot is not filterable');
    }

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
    this._entries = this._provider.load(name || this._name, this._format);

    return this;
  }

  loadCopy(name?: string) {
    return new _Snapshot(this._provider.load(name || this._name, this._format))
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

  serialize(format: 'compact'): string;

  serialize(format: 'native'): SnapshotNativeEntry[];

  serialize<T>(format: (snapshot: _Snapshot) => T): T;

  serialize<T>(format: ISnapshotFormatter<T>): T;

  serialize(format?) {
    if (typeof format === 'undefined') {
      format = this._format;
    }

    switch (true) {
      case typeof format === 'object':
        return format.format(this);;
      case typeof format === 'function':
        return format(this);
      case format === 'compact':
        return formatCompactSnapshotEntries(this);
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

function snapshotMapEntry(snapshot: _Snapshot, entry: State): State {
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
        (key === 'args' && entry.reportType === StateReportType.CALL_ARGS) ||
        (key === 'result' && entry.reportType === StateReportType.RETURN_VALUE)
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
  load(name: string, format?: 'native' | 'compact'): any;
  remove(name: string): this;
  save(name: string, snapshot: any): this;
  which(name: string): string;
}

export class SnapshotFsProvider implements ISnapshotProvider {
  private _dir: string;

  constructor(dir: string) {
    this._dir = dir;
  }

  load(name, format?) {
    const ext = format === 'native' ? 'json' : format === 'compact' ? 'txt' : this.which(name);

    if (!ext) {
      throw new Error('Snapshot not exists: ' + name);
    }

    const content = readFileSync(this._dir + '/' + name.replace(/\s/g, '_') + `.snapshot.${ext}`, 'utf-8');

    if (ext === 'json') {
      return JSON.parse(content);
    }

    return content;
  }

  remove(name) {
    if (name) {
      const ext = this.which(name);

      if (!ext) {
        return this;
      }

      unlinkSync(this._dir + '/' + name.replace(/\s/g, '_') + `.snapshot.${ext}`);
    }

    return this;
  }

  save(name, snapshot) {
    const content = snapshot instanceof _Snapshot ? snapshot.serialize() : snapshot;
    const ext = Array.isArray(content) ? 'json' : 'txt';

    writeFileSync(
      this._dir + '/' + name.replace(/\s/g, '_') + `.snapshot.${ext}`,
      Array.isArray(content) ? JSON.stringify(
        content,
        undefined,
        4
      ) : content,
      'utf-8',
    );

    return this;
  }

  which(name) {
    return existsSync(this._dir + '/' + name.replace(/\s/g, '_') + '.snapshot.json')
      ? 'json'
      : existsSync(this._dir + '/' + name.replace(/\s/g, '_') + '.snapshot.txt')
       ? 'txt'
       : null;
  }
}

export class SnapshotMemoryProvider implements ISnapshotProvider {
  private _dictionary: any;

  constructor(dictionary?: Record<string, any>) {
    this._dictionary = dictionary || {};
  }

  load(name) {
    if (this._dictionary.hasOwnProperty(name)) {
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

  which(name) {
    return name in this._dictionary ? (Array.isArray(this._dictionary) ? 'json' : 'txt') : null;
  }
}
