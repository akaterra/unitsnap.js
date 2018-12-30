var filter = require('./filter');
var fixture = require('./fixture');
var history = require('./history');
var mock = require('./mock');
var snapshot = require('./snapshot');
var typeHelpers = require('./type_helpers');

var observerId = 1000;

function Observer() {
  this._fixture = new fixture.Fixture();
  this._history = new history.History().link(this);
  this._id = observerId;
  this._mock = new mock.Mock(this._history);
  this._snapshot = new snapshot.Snapshot([]).link(this);
  this._config = {fixture: this._fixture, history: this._history, mock: this._mock, snapshot: this._snapshot};

  observerId += 1;
}

Observer.prototype = {
  setName: function (name) {
    this._fixture.setName(name);
    this._name = name;
    this._snapshot.setName(name);

    return this;
  },
  config: function () {
    return this._config;
  },

  begin: function (epoch, comment) {
    this._history.begin(epoch, comment);

    return this;
  },
  end: function () {
    this._history.end();

    return this;
  },

  by: function (cls, props, bypassOnBehalfOfInstanceReplacement) {
    var mockedCls = this._mock.by(cls, props,bypassOnBehalfOfInstanceReplacement);

    mockedCls.OBSERVER = this;

    return mockedCls;
  },
  from: function (props, bypassOnBehalfOfInstanceReplacement) {
    var mockedCls = this._mock.from(props, bypassOnBehalfOfInstanceReplacement);

    mockedCls.OBSERVER = this;

    return mockedCls;
  },
  override: function (cls, props, bypassOnBehalfOfInstanceReplacement) {
    var mockedCls = this._mock.override(cls, props, bypassOnBehalfOfInstanceReplacement);

    mockedCls.OBSERVER = this;

    this._history.addOnEndCallback(function () {
      mockedCls.RESTORE();
    });

    return mockedCls;
  },
  spy: function (fn) {
    return this._mock.spy(fn);
  },

  push: function () {
    this._fixture.push.apply(this._fixture, arguments);

    return this;
  },

  filter: function () {
    return this._history.filter();
  },
  snapshot: function () {
    return this.filter().snapshot();
  }
};

module.exports = {
  AnyType: typeHelpers.AnyType,
  BooleanType: typeHelpers.BooleanType,
  ClassOfType: typeHelpers.ClassOfType,
  Continue: typeHelpers.Continue,
  DateType: typeHelpers.DateType,
  DateValue: typeHelpers.DateValue,
  Ignore: typeHelpers.Ignore,
  InstanceOfType: typeHelpers.InstanceOfType,
  NumberType: typeHelpers.NumberType,
  StringType: typeHelpers.StringType,
  This: typeHelpers.This,
  UndefinedType: typeHelpers.UndefinedType,

  Filter: filter.Filter,
  Fixture: fixture.Fixture,
  FixtureCallbackStrategy: fixture.FixtureCallbackStrategy,
  FixtureQueueStrategy: fixture.FixtureQueueStrategy,
  FixtureFsProvider: fixture.FixtureFsProvider,
  FixtureMemoryProvider: fixture.FixtureMemoryProvider,
  History: history.History,
  Mock: mock.Mock,
  Observer: Observer,
  Snapshot: snapshot.Snapshot,
  SnapshotFsProvider: snapshot.SnapshotFsProvider,
  SnapshotMemoryProvider: snapshot.SnapshotMemoryProvider,

  ArgsAnnotation: mock.ArgsAnnotation,
  Custom: mock.Custom,
  Epoch: mock.Epoch,
  Exclude: mock.Exclude,
  Initial: mock.Initial,

  Property: mock.Property,
  StaticMethod: mock.StaticMethod,
  StaticProperty: mock.StaticProperty,

  create: function () {
    return new Observer();
  },

  default: new Observer(),
};
