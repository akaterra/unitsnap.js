function Filter(entries) {
  this._entries = entries || [];
}

Filter.prototype = {
  link: function (observer) {
    this._observer = observer;

    return this;
  },
  unlink: function () {
    this._observer = void 0;

    return this;
  },
  context: function (context) {
    this._context = context;

    return this;
  },
  ctx: function (ctx) {
    this._context = ctx;

    return this;
  },
  custom: function (custom) {
    if (custom !== void 0 && ! (custom instanceof Function)) {
      throw new Error('Filter "custom" must be callable');
    }

    this._custom = custom;

    return this;
  },
  epoch: function (epoch) {
    this._epoch = epoch;

    return this;
  },
  fn: function (fn) {
    this._fn = fn;

    return this;
  },
  tags: function () {
    this._tags = Array.prototype.slice.call(arguments);

    return this;
  },
  snapshot: function () {
    var newSnapshot = new snapshot.Snapshot(this._entries.filter(function (entry) {
      if (this._context !== void 0 && this._context !== entry.context) {
        return false;
      }

      if (this._custom !== void 0 && ! this._custom(entry)) {
        return false;
      }

      if (this._epoch !== void 0 && this._epoch !== entry.epoch) {
        return false;
      }

      if (this._fn !== void 0 && this._fn !== entry.origin && this._fn !== entry.replacement) {
        return false;
      }

      if (this._tags !== void 0) {
        for (var i = 0, l = this._tags.length; i < l; i ++) {
          if (entry.tags && entry.tags.indexOf(this._tags[i]) === - 1) {
            return false;
          }
        }
      }

      return true;
    }.bind(this)));

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
};

module.exports = {
  Filter: Filter,
};

var snapshot = require('./snapshot');
