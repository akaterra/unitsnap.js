import * as snapshot from './snapshot';

export class Filter {
  private _entries: any[];
  private _not: boolean;
  private _observer: any;
  private _context: any[];
  private _custom: any[];
  private _epoch: any[];
  private _fn: any[];
  private _notPromiseResult: boolean;
  private _tags: any[];

  constructor(entries) {
    this._entries = entries || [];
    this._not = false;
  }

  link(observer) {
    this._observer = observer;

    return this;
  }

  unlink() {
    this._observer = void 0;

    return this;
  }

  context(context) {
    this._context = [context, this.notGetAndReset()];

    return this;
  }

  ctx(ctx) {
    this._context = [ctx, this.notGetAndReset()];

    return this;
  }

  custom(fn) {
    if (fn !== void 0 && ! (fn instanceof Function)) {
      throw new Error('Filter "custom" must be callable');
    }

    this._custom = [fn, this.notGetAndReset()];

    return this;
  }

  epoch(epoch) {
    this._epoch = [epoch, this.notGetAndReset()];

    return this;
  }

  fn(fn) {
    this._fn = [fn, this.notGetAndReset()];

    return this;
  }

  notPromiseResult() {
    this._notPromiseResult = this.notGetAndReset();

    return this;
  }

  tags() {
    this._tags = [Array.prototype.slice.call(arguments), this.notGetAndReset()];

    return this;
  }

  not() {
    this._not = true;

    return this;
  }

  snapshot() {
    const newSnapshot = new snapshot.Snapshot(this._entries.filter((entry) => {
      if (this._context !== void 0 && assert(this._context[0] !== entry.context, this._context[1])) {
        return false;
      }

      if (this._custom !== void 0 && ! assert(this._custom[0](entry), this._custom[1])) {
        return false;
      }

      if (this._epoch !== void 0 && assert(this._epoch[0] !== entry.epoch, this._epoch[1])) {
        return false;
      }

      if (this._fn !== void 0 && assert(this._fn[0] !== entry.origin && this._fn[0] !== entry.replacement, this._epoch[1])) {
        return false;
      }

      if (this._notPromiseResult !== void 0 && assert(entry.result instanceof Promise, this._notPromiseResult)) {
        return false;
      }

      if (this._tags !== void 0) {
        for (var i = 0, l = this._tags[0].length; i < l; i ++) {
          if (entry.tags && assert(entry.tags.indexOf(this._tags[0][i]) === - 1, this._tags[1])) {
            return false;
          }
        }
      }

      return true;
    }));

    if (this._observer) {
      newSnapshot
        .setConfig(this._observer._snapshot._config)
        .setMapper(this._observer._snapshot._mapper)
        .setProvider(this._observer._snapshot._provider)
        .addProcessors(this._observer._snapshot._processors)
        .link(this._observer);
    }

    return newSnapshot;
  }

  private notGetAndReset() {
    const not = this._not;
    this._not = false;
  
    return not;
  }
}

function assert(result, not) {
  return not ? ! result : result;
}
