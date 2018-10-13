var filter = require('./filter');
var fixture = require('./fixture');
var history = require('./history');
var mock = require('./mock');
var snapshot = require('./snapshot');
var typeHelpers = require('./type_helpers');

function Observer() {
  this._fixture = new fixture.Fixture();
  this._history = new history.History().link(this);
  this._mock = new mock.Mock(this._history);
  this._snapshot = new snapshot.Snapshot([]).link(this);
  this._config = {fixture: this._fixture, history: this._history, mock: this._mock, snapshot: this._snapshot};
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

  by: function (cls, props) {
    return this._mock.by(cls, props);
  },
  byOverride: function (cls, props) {
    return this._mock.byOverride(cls, props);
  },
  from: function (props) {
    return this._mock.from(props);
  },
  override: function (cls, props) {
    var mockedCls = this._mock.override(cls, props);

    this._history.addOnEpochEndCallback(function () {
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
  ArrayType: typeHelpers.ArrayType,
  BooleanType: typeHelpers.BooleanType,
  ToString: typeHelpers.ToString,
  ShallowCopy: typeHelpers.ShallowCopy,
  DateType: typeHelpers.DateType,
  DateToIsoString: typeHelpers.DateToIsoString,
  Ignore: typeHelpers.Ignore,
  Initial: typeHelpers.Initial,
  InstanceOfType: typeHelpers.InstanceOfType,
  NumberType: typeHelpers.NumberType,
  ObjectType: typeHelpers.ObjectType,
  Path: typeHelpers.Path,
  RegexPath: typeHelpers.RegexPath,
  StrictInstanceOfType: typeHelpers.StrictInstanceOfType,
  StringType: typeHelpers.StringType,
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
  Exclude: mock.Exclude,
  // Initial: mock.Initial,

  Property: mock.Property,
  StaticMethod: mock.StaticMethod,
  StaticProperty: mock.StaticProperty,

  create: function () {
    return new Observer();
  },

  default: new Observer(),
};
