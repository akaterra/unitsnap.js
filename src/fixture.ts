import { PositiveInteger as PositiveInt } from './utils';

export interface IFixtureEnv {
  strategy: IFixtureStrategy;
}

export class _Fixture<T = any> {
  private _name: string;
  private _strategy: IFixtureEnv['strategy'];
  private _throwOn: any;

  get env(): IFixtureEnv {
    return { strategy: this._strategy };
  }

  get name() {
    return this._name;
  }

  constructor() {
    this._name = this._strategy = null;

    this.setQueueStrategy([]).throwOnInstanceOf(Error);
  }

  setName(name) {
    this._name = name;

    return this;
  }

  setStrategy(strategy: IFixtureEnv['strategy']) {
    this._strategy = strategy;

    return this;
  }

  setCallbackStrategy(cb: FixtureCallbackStrategy['_cb']) {
    this._strategy = new FixtureCallbackStrategy(cb);

    return this;
  }

  setQueueStrategy(values: FixtureQueueStrategy['_values']) {
    this._strategy = new FixtureQueueStrategy(values);

    return this;
  }

  loadFromFsProvider(dirOrProvider: string | FixtureFsProvider) {
    this._strategy.loadFromProvider(dirOrProvider instanceof FixtureFsProvider
      ? dirOrProvider.setName(this._name)
      : new FixtureFsProvider(dirOrProvider).setName(this._name));

    return this;
  }

  loadFromMemoryProvider(dictionaryOrProvider: Record<string, any[]> | FixtureMemoryProvider) {
    this._strategy.loadFromProvider(dictionaryOrProvider instanceof FixtureMemoryProvider
      ? dictionaryOrProvider.setName(this._name)
      : new FixtureMemoryProvider(dictionaryOrProvider).setName(this._name));

    return this;
  }

  pop(): T {
    const value = this._strategy.pop();

    if (this._throwOn && this._throwOn(value)) {
      throw value;
    }

    return value;
  }

  push(...args: T[]) {
    this._strategy.push(...args);

    return this;
  }

  throwOnCallback(cb: (value) => boolean) {
    this._throwOn = cb;

    return this;
  }

  throwOnClassOf(cls) {
    return this.throwOnCallback((value) => {
      return value !== undefined && value !== null && Object.getPrototypeOf(value) && Object.getPrototypeOf(value).constructor === cls;
    });
  }

  throwOnInstanceOf(cls) {
    return this.throwOnCallback((value) => {
      return value instanceof cls;
    });
  }
}

export function Fixture<T = any>(...args: T[]) {
  return new _Fixture<T>().push(...args);
}

export interface IFixtureProvider {
  get name(): string;
  setName(name: string): this;
  load(sourceName?: string): any[];
}

export class FixtureMemoryProvider implements IFixtureProvider {
  private _dictionary: Record<string, any>;
  private _name: string;

  get dictionary() {
    return this._dictionary;
  }

  get name() {
    return this._name;
  }

  constructor(dictionary: FixtureMemoryProvider['_dictionary']) {
    this._dictionary = dictionary;
  }

  setName(name: string) {
    this._name = name;

    return this;
  }

  load(sourceName?) {
    return this._dictionary[sourceName || this._name];
  }
}

export class FixtureFsProvider implements IFixtureProvider {
  private _dir: string;
  private _name: string;

  get dir() {
    return this._dir;
  }

  get name() {
    return this._name;
  }

  constructor(dir) {
    this._dir = dir;
  }

  setName(name: string) {
    this._name = name;

    return this;
  }

  load(sourceName?: string) {
    if (!sourceName) {
      sourceName = this._name;
    }

    if (!sourceName) {
      throw new Error('Fixture source name is required');
    }

    return JSON.parse(require('fs').readFileSync(this._dir + '/' + (sourceName || this._name).replace(/\s/g, '_') + '.fixture.json'));
  }
}

export interface IFixtureStrategy {
  loadFromProvider(provider: IFixtureProvider, sourceName?: string): this;
  pop(): any;
  pop<T extends number>(count?: PositiveInt<T>): any[];
  push(...args: any[]): this;
}

export class FixtureCallbackStrategy implements IFixtureStrategy {
  private _cb: (...args: any[]) => any;

  constructor(cb: FixtureCallbackStrategy['_cb']) {
    this.set(cb);
  }

  set(cb: FixtureCallbackStrategy['_cb']) {
    if (typeof cb !== 'function') {
      throw new Error('Fixture callback must be function');
    }

    this._cb = cb;

    return this;
  }

  loadFromProvider(): this {
    throw new Error('Loading from provider is not supported for callback strategy');
  }

  pop<T extends number>(count?: PositiveInt<T>) {
    if (count) {
      return Array(count).fill(null).map(() => this._cb());
    }

    return this._cb();
  }

  push(...args: any[]) {
    this._cb.apply(null, args);

    return this;
  }
}

export class FixtureQueueStrategy implements IFixtureStrategy {
  private _values: any[];

  constructor(values?: FixtureQueueStrategy['_values']) {
    this.set(values ?? []);
  }

  set(values: FixtureQueueStrategy['_values']) {
    if (!Array.isArray(values)) {
      throw new Error('Fixture values must be array');
    }

    this._values = values;

    return this;
  }

  loadFromProvider(provider: IFixtureProvider, sourceName?: string): this {
    this.set(provider.load(sourceName));

    return this;
  }

  pop<T extends number>(count?: PositiveInt<T>) {
    if (count) {
      return this._values.splice(0, count);
    }

    return this._values.shift();
  }

  push(...args: FixtureQueueStrategy['_values']) {
    this._values = this._values.concat(args);

    return this;
  }
}
