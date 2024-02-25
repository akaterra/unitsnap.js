import * as fixture from './fixture';
import * as history from './history';
import * as mock from './mock';
import * as snapshot from './snapshot';

let observerId = 1000;

export interface IObserverEnv {
  fixture: fixture.Fixture;
  history: history.History;
  mock: mock.Mock;
  snapshot: snapshot.Snapshot;
}

export class Observer {
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

  constructor() {
    this._fixture = new fixture.Fixture();
    this._history = new history.History().link(this);
    this._id = observerId;
    this._mock = new mock.Mock(this._history);
    this._snapshot = new snapshot.Snapshot([]).link(this);

    observerId += 1;
  }

  setName(name) {
    this._fixture.setName(name);
    this._name = name;
    this._snapshot.setName(name);

    return this;
  }

  begin(epoch: history.IHistoryEpoch['epoch'], comment?: history.IHistoryEpoch['comment']) {
    this._history.begin(epoch, comment);

    return this;
  }

  end() {
    this._history.end();

    return this;
  }

  by(cls, props, bypassOnBehalfOfInstanceReplacement) {
    var mockedCls = this._mock.by(cls, props,bypassOnBehalfOfInstanceReplacement);

    mockedCls.OBSERVER = this;

    return mockedCls;
  }

  from(props, bypassOnBehalfOfInstanceReplacement) {
    var mockedCls = this._mock.from(props, bypassOnBehalfOfInstanceReplacement);

    mockedCls.OBSERVER = this;

    return mockedCls;
  }

  override(cls, props, bypassOnBehalfOfInstanceReplacement) {
    var mockedCls = this._mock.override(cls, props, bypassOnBehalfOfInstanceReplacement);

    mockedCls.OBSERVER = this;

    this._history.addOnEndCallback(function () {
      mockedCls.RESTORE();
    });

    return mockedCls;
  }

  spy(fn) {
    return this._mock.spy(fn);
  }

  push(...args) {
    this._fixture.push.apply(this._fixture, args);

    return this;
  }

  filter() {
    return this._history.filter();
  }

  snapshot() {
    return this.filter().snapshot();
  }
}

export function create() {
  return new Observer();
}

export function getSpyStats(fn) {
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
  };
}

export default new Observer();
