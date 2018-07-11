const unitsnap = require('..');
const snapshot = require('../src/snapshot');
const typeHelpers = require('../src/type_helpers');

describe('Snapshot', () => {
  const f = _ => _;
  const g = _ => _;
  const observer = new unitsnap.Observer();

  class A {
  }

  class B extends A {
  }

  class Provider {
    constructor(snapshots) {
      Object.assign(this, snapshots);
    }

    load(name) {
      return this[name];
    }

    save(name, snapshot) {
      this[name] = snapshot._entries;
    }
  }

  const bind = Function.prototype.bind;

  afterAll(() => {
    Object.defineProperties(Function.prototype, {
      'bind': {
        value: bind,
      },
    });
  });

  beforeAll(() => {
    Object.defineProperties(Function.prototype, {
      'bind': {
        value: function () {
          var func = bind.apply(this, arguments);

          func.original = this;

          return func;
        },
      },
    });
  });

  it('should be constructed with entries', () => {
    const e = new unitsnap.Snapshot([{}, {}, {}]);

    expect(e._entries).toEqual([{}, {}, {}]);
  });

  it('should be constructed with memory provider', () => {
    const e = new unitsnap.Snapshot();

    expect(e._provider instanceof snapshot.SnapshotMemoryProvider).toBeTruthy();
  });

  it('should link observer', () => {
    const e = new unitsnap.Snapshot();

    expect(e.link(observer)._observer).toBe(observer);
  });

  it('should unlink observer', () => {
    const e = new unitsnap.Snapshot();

    expect(e.link(observer).unlink()._observer).toBeUndefined();
  });

  it('should set config', () => {
    const e = new unitsnap.Snapshot().setConfig({a: 1});

    expect(e._config).toEqual({a: 1});
  });

  it('should set mapper', () => {
    const e = new unitsnap.Snapshot().setMapper(f);

    expect(e._mapper).toEqual(f);
  });

  it('should raise exception on set mapper bad argument', () => {
    const e = new unitsnap.Snapshot();

    expect(() => e.setMapper(null)).toThrow();
  });

  it('should set name', () => {
    const e = new unitsnap.Snapshot().setName('name');

    expect(e._name).toEqual('name');
  });

  it('should set fs provider', () => {
    const e = new unitsnap.Snapshot().setFsProvider('./spec/snapshots');

    expect(e._provider instanceof snapshot.SnapshotFsProvider).toBeTruthy();
  });

  it('should set memory provider', () => {
    const e = new unitsnap.Snapshot().setMemoryProvider({});

    expect(e._provider instanceof snapshot.SnapshotMemoryProvider).toBeTruthy();
  });

  it('should add processor with custom checker and serializer', () => {
    const e = new unitsnap.Snapshot().addProcessor(f, f);

    expect(e._processors).toEqual([{checker: f, serializer: f}]);
  });

  it('should add processor before previously added', () => {
    const e = new unitsnap.Snapshot().addProcessor(f, f).addProcessor(g, g);

    expect(e._processors).toEqual([{checker: g, serializer: g}, {checker: f, serializer: f}]);
  });

  it('should add processor of basic type Any as checker', () => {
    const e = new unitsnap.Snapshot().addProcessor(typeHelpers.AnyType);

    expect(e._processors[0].checker.original).toBe(typeHelpers.AnyType.prototype.check);
  });

  it('should add processor of basic type Any as serializer', () => {
    const e = new unitsnap.Snapshot().addProcessor(typeHelpers.AnyType);

    expect(e._processors[0].serializer.original).toBe(typeHelpers.AnyType.prototype.serialize);
  });

  it('should add processor of basic type Boolean as checker', () => {
    const e = new unitsnap.Snapshot().addProcessor(typeHelpers.BooleanType);

    expect(e._processors[0].checker.original).toBe(typeHelpers.BooleanType.prototype.check);
  });

  it('should add processor of basic type Boolean as serializer', () => {
    const e = new unitsnap.Snapshot().addProcessor(typeHelpers.BooleanType);

    expect(e._processors[0].serializer.original).toBe(typeHelpers.BooleanType.prototype.serialize);
  });

  it('should add processor of basic type Boolean as checker', () => {
    const e = new unitsnap.Snapshot().addProcessor(Boolean);

    expect(e._processors[0].checker.original).toBe(typeHelpers.BooleanType.prototype.check);
  });

  it('should add processor of basic type Boolean as serializer', () => {
    const e = new unitsnap.Snapshot().addProcessor(Boolean);

    expect(e._processors[0].serializer.original).toBe(typeHelpers.BooleanType.prototype.serialize);
  });

  it('should add processor of basic type Boolean as checker', () => {
    const e = new unitsnap.Snapshot().addProcessor(typeHelpers.BooleanType);

    expect(e._processors[0].checker.original).toBe(typeHelpers.BooleanType.prototype.check);
  });

  it('should add processor of basic type Boolean as serializer', () => {
    const e = new unitsnap.Snapshot().addProcessor(typeHelpers.BooleanType);

    expect(e._processors[0].serializer.original).toBe(typeHelpers.BooleanType.prototype.serialize);
  });

  it('should add processor of basic type Date as checker', () => {
    const e = new unitsnap.Snapshot().addProcessor(Date);

    expect(e._processors[0].checker.original).toBe(typeHelpers.DateType.prototype.check);
  });

  it('should add processor of basic type Date as serializer', () => {
    const e = new unitsnap.Snapshot().addProcessor(Date);

    expect(e._processors[0].serializer.original).toBe(typeHelpers.DateType.prototype.serialize);
  });

  it('should add processor of basic type Date as checker', () => {
    const e = new unitsnap.Snapshot().addProcessor(typeHelpers.DateType);

    expect(e._processors[0].checker.original).toBe(typeHelpers.DateType.prototype.check);
  });

  it('should add processor of basic type Date as serializer', () => {
    const e = new unitsnap.Snapshot().addProcessor(typeHelpers.DateType);

    expect(e._processors[0].serializer.original).toBe(typeHelpers.DateType.prototype.serialize);
  });

  it('should add processor of basic type Number as checker', () => {
    const e = new unitsnap.Snapshot().addProcessor(Number);

    expect(e._processors[0].checker.original).toBe(typeHelpers.NumberType.prototype.check);
  });

  it('should add processor of basic type Number as serializer', () => {
    const e = new unitsnap.Snapshot().addProcessor(Number);

    expect(e._processors[0].serializer.original).toBe(typeHelpers.NumberType.prototype.serialize);
  });

  it('should add processor of basic type Number as checker', () => {
    const e = new unitsnap.Snapshot().addProcessor(typeHelpers.NumberType);

    expect(e._processors[0].checker.original).toBe(typeHelpers.NumberType.prototype.check);
  });

  it('should add processor of basic type Number as serializer', () => {
    const e = new unitsnap.Snapshot().addProcessor(typeHelpers.NumberType);

    expect(e._processors[0].serializer.original).toBe(typeHelpers.NumberType.prototype.serialize);
  });

  it('should add processor of basic type String as checker', () => {
    const e = new unitsnap.Snapshot().addProcessor(String);

    expect(e._processors[0].checker.original).toBe(typeHelpers.StringType.prototype.check);
  });

  it('should add processor of basic type String as serializer', () => {
    const e = new unitsnap.Snapshot().addProcessor(String);

    expect(e._processors[0].serializer.original).toBe(typeHelpers.StringType.prototype.serialize);
  });

  it('should add processor of basic type String as checker', () => {
    const e = new unitsnap.Snapshot().addProcessor(typeHelpers.StringType);

    expect(e._processors[0].checker.original).toBe(typeHelpers.StringType.prototype.check);
  });

  it('should add processor of basic type String as serializer', () => {
    const e = new unitsnap.Snapshot().addProcessor(typeHelpers.StringType);

    expect(e._processors[0].serializer.original).toBe(typeHelpers.StringType.prototype.serialize);
  });

  it('should add processor of basic type Undefined as checker', () => {
    const e = new unitsnap.Snapshot().addProcessor();

    expect(e._processors[0].checker.original).toBe(typeHelpers.UndefinedType.prototype.check);
  });

  it('should add processor of basic type Undefined as serializer', () => {
    const e = new unitsnap.Snapshot().addProcessor();

    expect(e._processors[0].serializer.original).toBe(typeHelpers.UndefinedType.prototype.serialize);
  });

  it('should add processor of basic type Undefined as checker', () => {
    const e = new unitsnap.Snapshot().addProcessor(typeHelpers.UndefinedType);

    expect(e._processors[0].checker.original).toBe(typeHelpers.UndefinedType.prototype.check);
  });

  it('should add processor of basic type Undefined as serializer', () => {
    const e = new unitsnap.Snapshot().addProcessor(typeHelpers.UndefinedType);

    expect(e._processors[0].serializer.original).toBe(typeHelpers.UndefinedType.prototype.serialize);
  });

  it('should add processor of basic type as checker with custom serializer', () => {
    const e = new unitsnap.Snapshot().addProcessor(typeHelpers.AnyType, f);

    expect(e._processors[0].serializer).toBe(f);
  });

  it('should add processor of basic type as serializer with custom checker', () => {
    const e = new unitsnap.Snapshot().addProcessor(f, typeHelpers.AnyType);

    expect(e._processors[0].checker).toBe(f);
  });

  it('should add processor of class of', () => {
    const e = new unitsnap.Snapshot().addClassOfProcessor(Date);

    expect(e._processors[0].checker.original).toBe(typeHelpers.ClassOfType.prototype.check);
  });

  it('should add processor of class of with custom serializer', () => {
    const e = new unitsnap.Snapshot().addClassOfProcessor(Date, f);

    expect(e._processors[0].serializer).toBe(f);
  });

  it('should add processor of instance of', () => {
    const e = new unitsnap.Snapshot().addInstanceOfProcessor(Date);

    expect(e._processors[0].checker.original).toBe(typeHelpers.InstanceOfType.prototype.check);
  });

  it('should add processor of instance of with custom serializer', () => {
    const e = new unitsnap.Snapshot().addInstanceOfProcessor(Date, f);

    expect(e._processors[0].serializer).toBe(f);
  });

  it('should add processor of path with custom serializer', () => {
    const e = new unitsnap.Snapshot().addPathProcessor('a', f);

    expect(e._processors[0].serializer).toBe(f);
  });

  it('should add processor of path regex with custom serializer', () => {
    const e = new unitsnap.Snapshot().addRegexPathProcessor('a', f);

    expect(e._processors[0].serializer).toBe(f);
  });

  it('should add processor of path regex as prepared regex with custom serializer', () => {
    const e = new unitsnap.Snapshot().addRegexPathProcessor(/a/, f);

    expect(e._processors[0].serializer).toBe(f);
  });

  it('should add processor of undefined', () => {
    const e = new unitsnap.Snapshot().addUndefinedProcessor();

    expect(e._processors[0].checker.original).toBe(typeHelpers.UndefinedType.prototype.check);
  });

  it('should add processor of undefined with custom serializer', () => {
    const e = new unitsnap.Snapshot().addUndefinedProcessor(f);

    expect(e._processors[0].serializer).toBe(f);
  });

  it('should enable include args', () => {
    const e = new unitsnap.Snapshot().includeArgs();

    expect(e._config.args).toBe(true);
  });

  it('should enable include calls count', () => {
    const e = new unitsnap.Snapshot().includeCallsCount();

    expect(e._config.callsCount).toBe(true);
  });

  it('should enable include epoch', () => {
    const e = new unitsnap.Snapshot().includeEpoch();

    expect(e._config.epoch).toBe(true);
  });

  it('should enable include exception', () => {
    const e = new unitsnap.Snapshot().includeException();

    expect(e._config.exception).toBe(true);
  });

  it('should enable include exceptions count', () => {
    const e = new unitsnap.Snapshot().includeExceptionsCount();

    expect(e._config.exceptionsCount).toBe(true);
  });

  it('should enable include is async', () => {
    const e = new unitsnap.Snapshot().includeIsAsync();

    expect(e._config.isAsync).toBe(true);
  });

  it('should enable include name', () => {
    const e = new unitsnap.Snapshot();

    expect(e.includeName()._config.name).toBe(true);
  });

  describe('when serializes', () => {
    it('should serialize with custom checker and serializer', () => {
      const checker = (d) => d instanceof A;
      const serializer = (d) => 'A';
      const e = new unitsnap.Snapshot([{
        args: [], callsCount: 1, epoch: 'epoch', exceptionsCount: 2, isAsync: true, name: 'name', result: [{a: new B()}],
      }]).addProcessor(checker, serializer);

      expect(e.serialize()).toEqual([{
        args: [], result: [{a: 'A'}],
      }]);
    });

    it('should serialize with path serializer contained "_" as "single symbol" pattern', () => {
      const e = new unitsnap.Snapshot([{
        args: [], callsCount: 1, epoch: 'epoch', exceptionsCount: 2, isAsync: true, name: 'name', result: 3,
      }]).addPathProcessor('[0]._esult', _ => 'serialized');

      expect(e.serialize()).toEqual([{
        args: [], result: 'serialized',
      }]);
    });

    it('should serialize with path serializer contained "*" as "arbitrary symbols" pattern', () => {
      const e = new unitsnap.Snapshot([{
        args: [], callsCount: 1, epoch: 'epoch', exceptionsCount: 2, isAsync: true, name: 'name', result: 3,
      }]).addPathProcessor('[0]*result', _ => 'serialized');

      expect(e.serialize()).toEqual([{
        args: [], result: 'serialized',
      }]);
    });

    it('should serialize with path regex serializer', () => {
      const e = new unitsnap.Snapshot([{
        args: [], callsCount: 1, epoch: 'epoch', exceptionsCount: 2, isAsync: true, name: 'name', result: 3,
      }]).addRegexPathProcessor('[0].*result', _ => 'serialized');

      expect(e.serialize()).toEqual([{
        args: [], result: 'serialized',
      }]);
    });

    it('should serialize ignoring values equal "Ignore" type helper', () => {
      const e = new unitsnap.Snapshot([{
        args: [unitsnap.Ignore, {a: 1, b: unitsnap.Ignore, c: 3}], result: unitsnap.Ignore,
      }]);

      expect(e.serialize()).toEqual([{
        args: [{a: 1, c: 3}],
      }]);
    });

    it('should serialize with disabled include args', () => {
      const e = new unitsnap.Snapshot([{
        args: [], callsCount: 1, epoch: 'epoch', exceptionsCount: 2, isAsync: true, name: 'name', result: 3,
      }]).includeArgs(false);

      expect(e.serialize()).toEqual([{
        result: 3,
      }]);
    });

    it('should serialize with enabled include calls count', () => {
      const e = new unitsnap.Snapshot([{
        args: [], callsCount: 1, epoch: 'epoch', exceptionsCount: 2, isAsync: true, name: 'name', result: 3,
      }]).includeCallsCount();

      expect(e.serialize()).toEqual([{
        args: [], callsCount: 1, result: 3,
      }]);
    });

    it('should serialize with enabled include epoch', () => {
      const e = new unitsnap.Snapshot([{
        args: [], callsCount: 1, epoch: 'epoch', exceptionsCount: 2, isAsync: true, name: 'name', result: 3,
      }]).includeEpoch();

      expect(e.serialize()).toEqual([{
        args: [], epoch: 'epoch', result: 3,
      }]);
    });

    it('should serialize with enabled include exception', () => {
      const e = new unitsnap.Snapshot([{
        args: [], callsCount: 1, epoch: 'epoch', exception: 'exception', exceptionsCount: 2, isAsync: true, isException: true, name: 'name', result: 3,
      }]).includeException();

      expect(e.serialize()).toEqual([{
        args: [], exception: 'exception',
      }]);
    });


    it('should serialize with enabled include exceptions count', () => {
      const e = new unitsnap.Snapshot([{
        args: [], callsCount: 1, epoch: 'epoch', exceptionsCount: 2, isAsync: true, name: 'name', result: 3,
      }]).includeExceptionsCount();

      expect(e.serialize()).toEqual([{
        args: [], exceptionsCount: 2, result: 3,
      }]);
    });

    it('should serialize with enabled include is async', () => {
      const e = new unitsnap.Snapshot([{
        args: [], callsCount: 1, epoch: 'epoch', exceptionsCount: 2, isAsync: true, name: 'name', result: 3,
      }]).includeIsAsync();

      expect(e.serialize()).toEqual([{
        args: [], isAsync: true, result: 3,
      }]);
    });

    it('should serialize with enabled include name', () => {
      const e = new unitsnap.Snapshot([{
        args: [], callsCount: 1, epoch: 'epoch', exceptionsCount: 2, isAsync: true, name: 'name', result: 3,
      }]).includeName();

      expect(e.serialize()).toEqual([{
        args: [], name: 'name', result: 3,
      }]);
    });
  });

  it('should create filter linked to observer', () => {
    const e = new unitsnap.Snapshot([null]);

    expect(e.filter() instanceof unitsnap.Filter).toBeTruthy();
  });

  it('should load by self name', () => {
    const e = new unitsnap.Snapshot().setName('a').setProvider(new Provider({a: [null]}));

    expect(e.load()._entries).toEqual([null]);
  });

  it('should load by name', () => {
    const e = new unitsnap.Snapshot().setProvider(new Provider({a: [null]}));

    expect(e.load('a')._entries).toEqual([null]);
  });

  it('should load copy configured by parent', () => {
    const e = new unitsnap.Snapshot()
      .setConfig({a: 1})
      .setName('a')
      .setProvider(new Provider({a: [null]}))
      .addClassOfProcessor(Date)
      .link(observer);

    const copy = e.loadCopy();

    expect(copy).not.toBe(e);

    expect(copy._config).toEqual(e._config);
    expect(copy._name).toEqual(e._name);
    expect(copy._observer).toBe(e._observer);
    expect(copy._provider).toBe(e._provider);
    expect(copy._processors).toEqual(e._processors);

    expect(copy._entries).toEqual([null]);
  });

  it('should load copy by self name', () => {
    const e = new unitsnap.Snapshot().setName('a').setProvider(new Provider({a: [null]}));

    expect(e.loadCopy()._entries).toEqual([null]);
  });

  it('should load copy by name', () => {
    const e = new unitsnap.Snapshot().setProvider(new Provider({a: [null]}));

    expect(e.loadCopy('a')._entries).toEqual([null]);
  });

  it('should load copy with copy of config', () => {
    const e = new unitsnap.Snapshot().setName('a').setProvider(new Provider({a: [null]}));

    expect(e.loadCopy()._config).not.toBe(e._config);
  });

  it('should load copy with copy of processors', () => {
    const e = new unitsnap.Snapshot().setName('a').setProvider(new Provider({a: [null]}));

    expect(e.loadCopy()._processors).not.toBe(e._processors);
  });

  it('should save by self name', () => {
    const e = new unitsnap.Snapshot([null]).setName('a').setProvider(new Provider({}));

    expect(e.save()._provider.a).toEqual([null]);
  });

  it('should save by name', () => {
    const e = new unitsnap.Snapshot([null]).setProvider(new Provider({}));

    expect(e.save('a')._provider.a).toEqual([null]);
  });

  it('should assert match', () => {
    const e = new unitsnap.Snapshot([{}]);

    expect(e.assert(new unitsnap.Snapshot([{}]))).toBeTruthy();
  });

  it('should assert mismatch primitive', () => {
    const e = new unitsnap.Snapshot([{}]);

    expect(e.assert(new unitsnap.Snapshot([{result: null}]))).toBe('[0].result');
  });

  it('should assert mismatch array', () => {
    const e = new unitsnap.Snapshot([{}]);

    expect(e.assert(new unitsnap.Snapshot([{}, {}]))).toBe('');
  });

  it('should assert mismatch object', () => {
    const e = new unitsnap.Snapshot([{result: {a: null}}]);

    expect(e.assert(new unitsnap.Snapshot([{result: {a: null, b: null}}]))).toBe('[0].result');
  });

  it('should assert serialized as object', () => {
    const e = new unitsnap.Snapshot([{}]);

    expect(e.assert([{}])).toBeTruthy();
  });

  it('should assert saved by self name', () => {
    const e = new unitsnap.Snapshot([{}]).setName('a').setProvider(new Provider({a: [{}]}));

    expect(e.assertSaved()).toBeTruthy();
  });

  it('should assert saved by name', () => {
    const e = new unitsnap.Snapshot([{}]).setProvider(new Provider({a: [{}]}));

    expect(e.assertSaved('a')).toBeTruthy();
  });
});

describe('SnapshotFsProvider', () => {
  it('should remove', () => {
    const e = new snapshot.SnapshotFsProvider('./spec/snapshots');

    e.save('test', new unitsnap.Snapshot([{}])).remove('test');

    expect(() => e.load('test')).toThrow();
  });

  it('should save/load', () => {
    const e = new snapshot.SnapshotFsProvider('./spec/snapshots');

    e.save('test', new unitsnap.Snapshot([{}]));

    expect(e.load('test')).toEqual([{}]);
  });

  it('should save/load arbitrary object', () => {
    const e = new snapshot.SnapshotFsProvider('./spec/snapshots');

    e.save('test', [{args: null, result: null}]);

    expect(e.load('test')).toEqual([{args: null, result: null}]);
  });
});

describe('SnapshotMemoryProvider', () => {
  it('should remove', () => {
    const e = new snapshot.SnapshotMemoryProvider();

    e.save('test', new unitsnap.Snapshot([{}])).remove('test');

    expect(() => e.load('test')).toThrow();
  });

  it('should save/load', () => {
    const e = new snapshot.SnapshotMemoryProvider();

    e.save('test', new unitsnap.Snapshot([{}]));

    expect(e.load('test')).toEqual([{args: void 0, result: void 0}]);
  });

  it('should save/load arbitrary object', () => {
    const e = new snapshot.SnapshotMemoryProvider();

    e.save('test', [{args: null, result: null}]);

    expect(e.load('test')).toEqual([{args: null, result: null}]);
  });
});
