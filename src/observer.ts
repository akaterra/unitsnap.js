import * as fixture from './fixture';
import * as history from './history';
import * as mock from './mock';
import * as snapshot from './snapshot';
import { ClassDef, Fn } from './utils';

let observerId = 1000;

export interface IObserverEnv {
  fixture: fixture._Fixture;
  history: history.History;
  mock: mock._Mock;
  snapshot: snapshot.Snapshot;
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
    this._history = new history.History().link(this);
    this._id = observerId;
    this._mock = new mock._Mock(this._history);
    this._snapshot = new snapshot.Snapshot([]).link(this);

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

  by<T extends ClassDef<any>, P extends ReadonlyArray<string | number | symbol> | mock.MockPropsMap = (keyof T)[]>(
    cls: T,
    props?: P,
    bypassOnBehalfOfInstanceReplacement?,
  ) {
    const clazz = this._mock.by<T, P>(cls, props, bypassOnBehalfOfInstanceReplacement);
    clazz.OBSERVER = this;

    return clazz;
  }

  from<P extends mock.MockPropsMap>(props: P, bypassOnBehalfOfInstanceReplacement?) {
    const clazz = this._mock.from<P>(props, bypassOnBehalfOfInstanceReplacement);
    clazz.OBSERVER = this;

    return clazz;
  }

  override<T extends ClassDef<any>, P extends ReadonlyArray<string | number | symbol> | mock.MockPropsMap = (keyof T)[]>(
    cls: T,
    props?: P,
    bypassOnBehalfOfInstanceReplacement?,
  ) {
    const clazz = this._mock.override<T, P>(cls, props, bypassOnBehalfOfInstanceReplacement);
    clazz.OBSERVER = this;

    this._history.addOnEndCallback(function () {
      clazz.RESTORE();
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

export type SpiedFn<T> = (((...args: any[]) => T) | { new (...args: any[]): T }) & Partial<{
  ARGS: { '*': any[] } & Record<string, any>;
  CALLS_COUNT: number;
  EXCEPTIONS_COUNT: number;
  EXCEPTION: any;
  IS_ASYNC: boolean;
  IS_ASYNC_PENDING: boolean;
  IS_EXCEPTION: boolean;
  ORIGIN: any;
  REPLACEMENT: any;
  RESTORE: () => void;
}>;

export function getSpyStats<T>(fn: SpiedFn<T>) {
  return {
    args: fn.ARGS,
    callsCount: fn.CALLS_COUNT,
    exceptionsCount: fn.EXCEPTIONS_COUNT,
    exception: fn.EXCEPTION,
    isAsync: fn.IS_ASYNC,
    isAsyncPending: fn.IS_ASYNC_PENDING,
    isException: fn.IS_EXCEPTION,
    origin: fn.ORIGIN,
    replacement: fn.REPLACEMENT,
    restore: fn.RESTORE,
  };
}

export const stat = getSpyStats;

export default new _Observer();
