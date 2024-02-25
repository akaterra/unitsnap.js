export interface IFixtureEnv {
  strategy: IFixtureStrategy;
}

export class Fixture {
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

  setCallbackStrategy(cb) {
    this._strategy = new FixtureCallbackStrategy(cb);

    return this;
  }

  setQueueStrategy(values) {
    this._strategy = new FixtureQueueStrategy(values);

    return this;
  }

  setFsProvider(dirOrProvider) {
    this._strategy.set(dirOrProvider instanceof FixtureFsProvider
      ? dirOrProvider.load(this._name)
      : new FixtureFsProvider(dirOrProvider).load(this._name));

    return this;
  }

  setMemoryProvider(dictionaryOrProvider) {
    this._strategy.set(dictionaryOrProvider instanceof FixtureMemoryProvider
      ? dictionaryOrProvider.load(this._name)
      : new FixtureMemoryProvider(dictionaryOrProvider).load(this._name));

    return this;
  }

  pop() {
    var value = this._strategy.pop();

    if (this._throwOn && this._throwOn(value)) {
      throw value;
    }

    return value;
  }

  push() {
    this._strategy.push.apply(this._strategy, arguments);

    return this;
  }

  throwOnCallback(cb) {
    this._throwOn = cb;

    return this;
  }

  throwOnClassOf(cls) {
    return this.throwOnCallback((value) => {
      return value !== void 0 && value !== null && Object.getPrototypeOf(value) && Object.getPrototypeOf(value).constructor === cls;
    });
  }

  throwOnInstanceOf(cls) {
    return this.throwOnCallback((value) => {
      return value instanceof cls;
    });
  }
}

export interface IFixtureProvider {
  setName(name: string): this;
  load(name: string): any[];
}

export class FixtureMemoryProvider implements IFixtureProvider {
  private _dictionary: Record<string, any[]>;
  private _name: string;

  constructor(dictionary: FixtureMemoryProvider['_dictionary']) {
    this._dictionary = dictionary;
  }

  setName(name: string) {
    this._name = name;

    return this;
  }

  load(name) {
    return this._dictionary[name || this._name];
  }
}

export class FixtureFsProvider implements IFixtureProvider {
  private _dir: string;
  private _name: string;

  constructor(dir) {
    this._dir = dir;
  }

  setName(name: string) {
    this._name = name;

    return this;
  }

  load(name) {
    return JSON.parse(require('fs').readFileSync(this._dir + '/' + (name || this._name).replace(/\s/g, '_') + '.fixture.json'));
  }
}

export interface IFixtureStrategy {
  pop(): any;
  push(...args: any[]): this;
}

export class FixtureCallbackStrategy implements IFixtureStrategy {
  private _cb: (...args: any[]) => any;

  constructor(cb: FixtureCallbackStrategy['_cb']) {
    this.set(cb);
  }

  set(cb: FixtureCallbackStrategy['_cb']) {
    if (! (cb instanceof Function)) {
      throw new Error('Fixture callback must be function');
    }

    this._cb = cb;

    return this;
  }

  pop() {
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
    this.set(values !== void 0 ? values : []);
  }

  set(values: FixtureQueueStrategy['_values']) {
    if (! Array.isArray(values)) {
      throw new Error('Fixture values must be array');
    }

    this._values = values;

    return this;
  }

  pop() {
    return this._values.shift();
  }

  push(...args: FixtureQueueStrategy['_values']) {
    this._values = this._values.concat(args);

    return this;
  }
}
