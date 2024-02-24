import * as filter from './filter';

export class History {
  private _entries: any[];
  private _epochs: any[];
  private _observer: any;

  constructor() {
    this.flush();
  }

  getCurrentEpoch() {
    return this._epochs.length
      ? this._epochs[this._epochs.length - 1]
      : null;
  }

  link(observer) {
    this._observer = observer;

    return this;
  }

  unlink() {
    this._observer = void 0;

    return this;
  }

  begin(epoch, comment, callbacks) {
    if (this._epochs.length === 0) {
      this._entries = [];
    }

    this._epochs.push({callbacks: callbacks || [], comment: comment, epoch: epoch});

    return this;
  }

  end() {
    if (this._epochs.length === 0) {
      return this;
    }

    this._epochs.pop().callbacks.forEach(function (cb) {cb()});

    return this;
  }

  addOnEndCallback(cb) {
    var epoch = this.getCurrentEpoch();

    if (epoch) {
      epoch.callbacks.push(cb);
    }

    return this;
  }

  flush() {
    this._entries = [];
    this._epochs = [];

    return this;
  }

  filter() {
    return new filter.Filter([].concat(this._entries)).link(this._observer);
  }

  push(state, tags?) {
    if (this._epochs.length === 0) {
      throw new Error('History is not yet begun');
    }

    var epoch = this._epochs[this._epochs.length - 1];

    this._entries.push(Object.assign({
      comment: epoch.comment,
      epoch: epoch.epoch,
      tags: tags,
      time: new Date(),
    }, state));

    return this;
  }
}
