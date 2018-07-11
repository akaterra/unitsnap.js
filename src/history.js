function History() {
  this.flush();
}

History.prototype = {
  getCurrentEpoch: function () {
    return this._epochs.length
      ? this._epochs[this._epochs.length - 1]
      : null;
  },
  link: function (observer) {
    this._observer = observer;

    return this;
  },
  unlink: function () {
    this._observer = void 0;

    return this;
  },
  begin: function (epoch, comment, callbacks) {
    if (this._epochs.length === 0) {
      this._entries = [];
    }

    this._epochs.push({callbacks: callbacks || [], comment: comment, epoch: epoch});

    return this;
  },
  addOnEndCallback: function (cb) {
    var epoch = this.getCurrentEpoch();

    if (epoch) {
      epoch.callbacks.push(cb);
    }

    return this;
  },
  end: function () {
    if (this._epochs.length === 0) {
      return this;
    }

    this._epochs.pop().callbacks.forEach(function (cb) {
      cb();
    });

    return this;
  },
  flush: function () {
    this._entries = [];
    this._epochs = [];

    return this;
  },
  filter: function () {
    return new filter.Filter([].concat(this._entries)).link(this._observer);
  },
  push: function (state, tags) {
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
  },
};

module.exports = {
  History: History,
};

var filter = require('./filter');
