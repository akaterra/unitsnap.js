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
  addProcessor: function (checker, copier) {
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

    var basicTypeCopier = basicTypes.find(function (basicType) {
      return basicType[0] === (copier === void 0 ? checker : copier);
    });

    basicTypeCopier = basicTypeCopier
      ? basicTypeCopier[1].copy.bind(basicTypeCopier[1])
      : copier;

    this._processors.unshift({
      checker: basicTypeChecker,
      copier: basicTypeCopier,
    });

    return this;
  },
  addInstanceOfProcessor: function (cls, copier) {
    var usefulCls = new typeHelpers.InstanceOfType(cls);

    return this.addProcessor(usefulCls.check.bind(usefulCls), copier || usefulCls.serialize.bind(usefulCls));
  },
  addStrictInstanceOfProcessor: function (cls, copier) {
    var usefulCls = new typeHelpers.StrictInstanceOfType(cls);

    return this.addProcessor(usefulCls.check.bind(usefulCls), copier || usefulCls.serialize.bind(usefulCls));
  },
  addProcessors: function (processors) {
    this._processors.unshift.apply(this._processors, processors);

    return this;
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

    state = Object.assign({
      comment: epoch.comment,
      epoch: epoch.epoch,
      tags: tags,
      time: new Date(),
    }, state);

    this._entries.push(this._processors.length ? historyCopyValue(this, state, '') : historyCopyValue(this, state, state));

    return this;
  },
};

function IgnoreInternal() {
}

function historyCopyValue(history, value, path, primitiveOnly, circular) {
  var processor = history._processors.length && history._processors.find(function (p) {
      return p.checker(value, path);
    });

  var copied;

  if (processor) {
    copied = processor.copier(value);

    if (copied === typeHelpers.Ignore) {
      return IgnoreInternal;
    }
  } else {
    copied = value;
  }

  if (! circular) {
    circular = [];
  }

  if (! primitiveOnly && Array.isArray(copied)) {
    if (circular.indexOf(value) !== - 1) {
      return value;
    }

    circular.push(value);

    copied.forEach(function (val, ind) {
      var tmp = historyCopyValue(history, val, path + '[' + ind + ']', false, circular);

      if (tmp !== copied[ind]) {
        copied[ind] = tmp;
      }
    });

    circular.pop();

    for (var i = 0; i < copied.length;) {
      if (copied[i] === IgnoreInternal) {
        copied.splice(i, 1);
      } else {
        i += 1;
      }
    }
  } else if (! primitiveOnly && copied && typeof copied === 'object') {
    if (circular.indexOf(value) !== - 1) {
      return value;
    }

    circular.push(value);

    Object.keys(copied).forEach(function (key) {
      var tmp = historyCopyValue(history, value[key], path + '.' + key, false, circular);

      if (tmp !== copied[key]) {
        copied[key] = tmp;
      }
    });

    circular.pop();

    Object.keys(copied).forEach(function (key) {
      if (copied[key] === IgnoreInternal) {
        delete copied[key];
      }
    });
  }

  return copied;
}

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
