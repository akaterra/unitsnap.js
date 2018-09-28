function History() {
  this._processors = [];

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
  end: function () {
    if (this._epochs.length === 0) {
      return this;
    }

    this._epochs.pop().callbacks.forEach(function (cb) {cb()});

    return this;
  },
  addProcessor: function (checker, cloner) {
    var basicTypeChecker = basicTypes.find(function (basicType) {
      return basicType[0] === checker;
    });

    if (typeof checker !== 'function' && ! basicTypeChecker) {
      var expectedValue = checker;

      checker = function (value) {
        return value === expectedValue;
      }
    }

    basicTypeChecker = basicTypeChecker
      ? basicTypeChecker[1].check.bind(basicTypeChecker[1])
      : checker;

    var basicTypeCloner = basicTypes.find(function (basicType) {
      return basicType[0] === (cloner === void 0 ? checker : cloner);
    });

    basicTypeCloner = basicTypeCloner
      ? basicTypeCloner[1].clone.bind(basicTypeCloner[1])
      : cloner;

    this._processors.unshift({
      checker: basicTypeChecker,
      cloner: basicTypeCloner,
    });

    return this;
  },
  addInstanceOfProcessor: function (cls, cloner) {
    var usefulCls = new typeHelpers.InstanceOfType(cls);

    return this.addProcessor(usefulCls.check.bind(usefulCls), cloner || usefulCls.serialize.bind(usefulCls));
  },
  addStrictInstanceOfProcessor: function (cls, cloner) {
    var usefulCls = new typeHelpers.StrictInstanceOfType(cls);

    return this.addProcessor(usefulCls.check.bind(usefulCls), cloner || usefulCls.serialize.bind(usefulCls));
  },
  addOnEpochEndCallback: function (cb) {
    var epoch = this.getCurrentEpoch();

    if (epoch) {
      epoch.callbacks.push(cb);
    }

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
var typeHelpers = require('./type_helpers');

var basicTypes = [
  [typeHelpers.AnyType, new typeHelpers.AnyType()],
  [Boolean, new typeHelpers.BooleanType()],
  [typeHelpers.BooleanType, new typeHelpers.BooleanType()],
  [Date, new typeHelpers.DateType()],
  [typeHelpers.Ignore, new typeHelpers.Ignore()],
  [typeHelpers.DateType, new typeHelpers.DateType()],
  [Number, new typeHelpers.NumberType()],
  [typeHelpers.NumberType, new typeHelpers.NumberType()],
  [String, new typeHelpers.StringType()],
  [typeHelpers.StringType, new typeHelpers.StringType()],
  [void 0, new typeHelpers.UndefinedType()],
  [typeHelpers.UndefinedType, new typeHelpers.UndefinedType()],
];
