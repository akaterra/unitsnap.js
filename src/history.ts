import { _Filter } from './filter';
import { _Observer } from './observer';
import { State } from './spy';

export interface IHistoryEpoch {
  callbacks: (() => void)[];
  comment: string;
  epoch: string;
}

export class _History {
  private _entries: State[];
  private _level: number = -1;
  private _epochs: IHistoryEpoch[];
  private _observer: _Observer = null;

  get entries() {
    return this._entries;
  }

  get epochs() {
    return this._epochs;
  }

  get observer() {
    return this._observer;
  }

  get enterLevel() {
    const level = this._level;
    this._level += 1;

    return level;
  }

  get leaveLevel() {
    const level = this._level;
    this._level = level > 0 ? level - 1 : 0;

    return level;
  }

  constructor() {
    this.flush();
  }

  getCurrentEpoch(): IHistoryEpoch {
    return this._epochs.length
      ? this._epochs[this._epochs.length - 1]
      : null;
  }

  link(observer: _Observer) {
    this._observer = observer;

    return this;
  }

  unlink() {
    this._observer = null;

    return this;
  }

  begin(epoch?: IHistoryEpoch['epoch'], comment?: IHistoryEpoch['comment'], callbacks?: IHistoryEpoch['callbacks']) {
    if (this._epochs.length === 0) {
      this._entries = [];
    }

    this._epochs.push({ callbacks: callbacks || [], comment: comment, epoch: epoch });

    return this;
  }

  end() {
    if (this._epochs.length === 0) {
      return this;
    }

    this._epochs.pop().callbacks.forEach((cb) => cb());

    return this;
  }

  addOnEndCallback(cb: () => void) {
    const epoch = this.getCurrentEpoch();

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

  filter(): _Filter {
    return new _Filter(this._entries.slice()).link(this._observer);
  }

  push(state: State, tags?: State['tags']) {
    if (this._epochs.length === 0) {
      throw new Error('History is not yet begun');
    }

    const epoch = this._epochs[this._epochs.length - 1];

    this._entries.push({
      comment: epoch.comment,
      epoch: epoch.epoch,
      tags: tags,
      time: new Date(),
      ...state,
    });

    return this;
  }
}

export function History() {
  return new _History();
}
