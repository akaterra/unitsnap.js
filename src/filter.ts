import { _Observer } from './observer';
import * as snapshot from './snapshot';
import { Fn } from './utils';

export type Check = (entry) => boolean;
export type IsNot = boolean;

export class Filter {
  private _entries: any[];
  private _filters: [Check, IsNot][] = [];
  private _not: boolean = false;
  private _observer: _Observer = null;

  get entries() {
    return this._entries;
  }

  get observer() {
    return this._observer;
  }

  constructor(entries?) {
    this._entries = entries || [];
    this._not = false;
  }

  link(observer: _Observer) {
    this._observer = observer;

    return this;
  }

  unlink() {
    this._observer = null;

    return this;
  }

  context(context) {
    this._filters.push([ (entry) => entry.context === context, this.isNot() ]);

    return this;
  }

  ctx(ctx) {
    this._filters.push([ (entry) => entry.context === ctx, this.isNot() ]);

    return this;
  }

  custom(fn: (entry) => boolean): this {
    if (typeof fn !== 'function') {
      throw new Error('Filter "custom" must be callable');
    }

    this._filters.push([ fn, this.isNot() ]);

    return this;
  }

  epoch(epoch: snapshot.State['epoch']) {
    this._filters.push([ (entry) => entry.epoch === epoch, this.isNot() ]);

    return this;
  }

  fn(fn: Fn) {
    this._filters.push([ (entry) => entry.origin === fn || entry.replacement === fn, this.isNot() ]);

    return this;
  }

  notPromiseResult() {
    this._filters.push([ (entry) => !(entry.result instanceof Promise), this.isNot() ]);

    return this;
  }

  tags(...tags: string[]) {
    this._filters.push([ (entry) => {
      for (const tag of tags) {
        if (entry.tags.indexOf(tag) === - 1) {
          return false;
        }
      }

      return true;
    }, this.isNot() ]);

    return this;
  }

  not() {
    this._not = true;

    return this;
  }

  snapshot(): snapshot.Snapshot {
    const newSnapshot = new snapshot.Snapshot(this._entries.filter((entry) => {
      for (const [ check, isNot ] of this._filters) {
        if (!assert(check(entry), isNot)) {
          return false;
        }
      }

      return true;
    }));

    if (this._observer) {
      newSnapshot
        .setConfig(this._observer.env.snapshot.config)
        .setMapper(this._observer.env.snapshot.env.mapper)
        .setProvider(this._observer.env.snapshot.env.provider)
        .addProcessors(...this._observer.env.snapshot.env.processors)
        .link(this._observer);
    }

    return newSnapshot;
  }

  private isNot() {
    const not = this._not;
    this._not = false;
  
    return not;
  }
}

function assert(result, not) {
  return not ? !result : result;
}
