import * as fixture from './fixture';
import * as history from './history';
import * as mock from './mock';
import * as snapshot from './snapshot';
import { ensSpyState, getSpyState } from './spy';
import { ClassDef, Fn } from './utils';

let observerId = 1000;

export interface IObserverEnv {
  fixture: fixture._Fixture;
  history: history._History;
  mock: mock._Mock;
  snapshot: snapshot._Snapshot;
}

export class _Observer {
  private _fixture: IObserverEnv['fixture'];
  private _history: IObserverEnv['history'];
  private _id: number;
  private _mock: IObserverEnv['mock'];
  private _snapshot: IObserverEnv['snapshot'];
  private _name: string;

  get env(): IObserverEnv {
    return { fixture: this._fixture, history: this._history, mock: this._mock, snapshot: this._snapshot };
  }

  get id() {
    return this._id;
  }

  get name() {
    return this._name;
  }

  constructor() {
    this._fixture = new fixture._Fixture();
    this._history = new history._History().link(this);
    this._id = observerId;
    this._mock = new mock._Mock(this._history);
    this._snapshot = new snapshot._Snapshot([]).link(this);

    observerId += 1;
  }

  setName(name: _Observer['_name']): this {
    this._fixture.setName(name);
    this._name = name;
    this._snapshot.setName(name);

    return this;
  }

  begin(epoch?: history.IHistoryEpoch['epoch'], comment?: history.IHistoryEpoch['comment']): this {
    this._history.begin(epoch, comment);

    return this;
  }

  end(): this {
    this._history.end();

    return this;
  }

  by<T extends ClassDef<unknown>, P extends ReadonlyArray<string | number | symbol> | mock.MockPropsMap = (keyof T)[]>(
    cls: T,
    props?: P,
    bypassOnBehalfOfInstanceReplacement?,
  ) {
    const clazz = this._mock.by<T, P>(cls, props, bypassOnBehalfOfInstanceReplacement);

    const c = ensSpyState(clazz);
    c.observer = this;

    return clazz;
  }

  from<P extends mock.MockPropsMap>(props: P, bypassOnBehalfOfInstanceReplacement?) {
    const clazz = this._mock.from<P>(props, bypassOnBehalfOfInstanceReplacement);

    const c = ensSpyState(clazz);
    c.observer = this;

    return clazz;
  }

  override<T extends ClassDef<unknown>, P extends ReadonlyArray<string | number | symbol> | mock.MockPropsMap = (keyof T)[]>(
    cls: T,
    props?: P,
    bypassOnBehalfOfInstanceReplacement?,
  ) {
    const clazz = this._mock.override<T, P>(cls, props, bypassOnBehalfOfInstanceReplacement);

    const c = ensSpyState(clazz);
    c.observer = this;

    this._history.addOnEndCallback(() => {
      c.restore();
    });

    return clazz;
  }

  spy(fn: Fn) {
    return this._mock.spy(fn);
  }

  push(...args) {
    this._fixture.push(...args);

    return this;
  }

  filter() {
    return this._history.filter();
  }

  snapshot() {
    return this.filter().snapshot();
  }
}

export function Observer() {
  return new _Observer();
}

export const state = getSpyState;
