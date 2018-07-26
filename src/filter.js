function Filter(entries) {
  this._entries = entries || [];
  this._not = false;
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
    this._context = [context, notGetAndReset(this)];

    return this;
  },
  ctx: function (ctx) {
    this._context = [ctx, notGetAndReset(this)];

    return this;
  },
  custom: function (fn) {
    if (fn !== void 0 && ! (fn instanceof Function)) {
      throw new Error('Filter "custom" must be callable');
    }

    this._custom = [fn, notGetAndReset(this)];

    return this;
  },
  epoch: function (epoch) {
    this._epoch = [epoch, notGetAndReset(this)];

    return this;
  },
  fn: function (fn) {
    this._fn = [fn, notGetAndReset(this)];

    return this;
  },
  notPromiseResult: function () {
    this._notPromiseResult = notGetAndReset(this);

    return this;
  },
  tags: function () {
    this._tags = [Array.prototype.slice.call(arguments), notGetAndReset(this)];

    return this;
  },
  not: function () {
    this._not = true;

    return this;
  },
  snapshot: function () {
    var newSnapshot = new snapshot.Snapshot(this._entries.filter(function (entry) {
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

function assert(result, not) {
  return not ? ! result : result;
}

function notGetAndReset(filter) {
  var not = filter._not;

  filter._not = false;

  return not;
}

module.exports = {
  Filter: Filter,
};

var snapshot = require('./snapshot');
