import * as unitsnap from '..';

describe('Snapshot', () => {
  const f = () => {};
  const g = () => {};
  const observer = new unitsnap._Observer();

  class A {

  }

  class B extends A {

  }

  class Provider implements unitsnap.ISnapshotProvider {
    constructor(snapshots) {
      Object.assign(this, snapshots);
    }

    exists(name) {
      return name in this;
    }

    load(name) {
      return this[name];
    }

    remove(name) {
      delete this[name];

      return this;
    }

    save(name, snapshot) {
      this[name] = snapshot._entries;

      return this;
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

    expect(e.entries).toEqual([{}, {}, {}]);
  });

  it('should be constructed with memory provider', () => {
    const e = new unitsnap.Snapshot();

    expect(e.env.provider instanceof unitsnap.SnapshotMemoryProvider).toBeTruthy();
  });

  it('should link observer', () => {
    const e = new unitsnap.Snapshot();

    expect(e.link(observer).observer).toBe(observer);
  });

  it('should unlink observer', () => {
    const e = new unitsnap.Snapshot();

    expect(e.link(observer).unlink().observer).toBeNull();
  });

  it('should set config', () => {
    const e = new unitsnap.Snapshot().setConfig({a: 1});

    expect(e.config).toEqual({a: 1});
  });

  it('should set mapper', () => {
    const e = new unitsnap.Snapshot().setMapper(f);

    expect(e.env.mapper).toEqual(f);
  });

  it('should raise exception on set mapper bad argument', () => {
    const e = new unitsnap.Snapshot();

    expect(() => e.setMapper(1)).toThrow();
  });

  it('should set name', () => {
    const e = new unitsnap.Snapshot().setName('name');

    expect(e.name).toEqual('name');
  });

  it('should set fs provider', () => {
    const e = new unitsnap.Snapshot().setFsProvider('./spec/snapshots');

    expect(e.env.provider instanceof unitsnap.SnapshotFsProvider).toBeTruthy();
  });

  it('should set memory provider', () => {
    const e = new unitsnap.Snapshot().setMemoryProvider({});

    expect(e.env.provider instanceof unitsnap.SnapshotMemoryProvider).toBeTruthy();
  });

  it('should add processor with custom checker and serializer', () => {
    const e = new unitsnap.Snapshot().addProcessor(f, f);

    expect(e.env.processors).toEqual([{checker: f, serializer: f}]);
  });

  it('should add processor before previously added', () => {
    const e = new unitsnap.Snapshot().addProcessor(f, f).addProcessor(g, g);

    expect(e.env.processors).toEqual([{checker: g, serializer: g}, {checker: f, serializer: f}]);
  });

  it('should add processor of basic type Any as checker', () => {
    const e = new unitsnap.Snapshot().addProcessor(unitsnap.AnyType);

    expect(e.env.processors[0].checker.original).toBe(unitsnap.AnyType.prototype.check);
  });

  it('should add processor of basic type Any as serializer', () => {
    const e = new unitsnap.Snapshot().addProcessor(unitsnap.AnyType);

    expect(e.env.processors[0].serializer.original).toBe(unitsnap.AnyType.prototype.serialize);
  });

  it('should add processor of basic type Boolean as checker', () => {
    const e = new unitsnap.Snapshot().addProcessor(unitsnap.BooleanType);

    expect(e.env.processors[0].checker.original).toBe(unitsnap.BooleanType.prototype.check);
  });

  it('should add processor of basic type Boolean as serializer', () => {
    const e = new unitsnap.Snapshot().addProcessor(unitsnap.BooleanType);

    expect(e.env.processors[0].serializer.original).toBe(unitsnap.BooleanType.prototype.serialize);
  });

  it('should add processor of basic type Boolean as checker', () => {
    const e = new unitsnap.Snapshot().addProcessor(Boolean);

    expect(e.env.processors[0].checker.original).toBe(unitsnap.BooleanType.prototype.check);
  });

  it('should add processor of basic type Boolean as serializer', () => {
    const e = new unitsnap.Snapshot().addProcessor(Boolean);

    expect(e.env.processors[0].serializer.original).toBe(unitsnap.BooleanType.prototype.serialize);
  });

  it('should add processor of basic type Boolean as checker', () => {
    const e = new unitsnap.Snapshot().addProcessor(unitsnap.BooleanType);

    expect(e.env.processors[0].checker.original).toBe(unitsnap.BooleanType.prototype.check);
  });

  it('should add processor of basic type Boolean as serializer', () => {
    const e = new unitsnap.Snapshot().addProcessor(unitsnap.BooleanType);

    expect(e.env.processors[0].serializer.original).toBe(unitsnap.BooleanType.prototype.serialize);
  });

  it('should add processor of basic type Date as checker', () => {
    const e = new unitsnap.Snapshot().addProcessor(Date);

    expect(e.env.processors[0].checker.original).toBe(unitsnap.DateType.prototype.check);
  });

  it('should add processor of basic type Date as serializer', () => {
    const e = new unitsnap.Snapshot().addProcessor(Date);

    expect(e.env.processors[0].serializer.original).toBe(unitsnap.DateType.prototype.serialize);
  });

  it('should add processor of basic type Date as checker', () => {
    const e = new unitsnap.Snapshot().addProcessor(unitsnap.DateType);

    expect(e.env.processors[0].checker.original).toBe(unitsnap.DateType.prototype.check);
  });

  it('should add processor of basic type Date as serializer', () => {
    const e = new unitsnap.Snapshot().addProcessor(unitsnap.DateType);

    expect(e.env.processors[0].serializer.original).toBe(unitsnap.DateType.prototype.serialize);
  });

  it('should add processor of basic type Number as checker', () => {
    const e = new unitsnap.Snapshot().addProcessor(Number);

    expect(e.env.processors[0].checker.original).toBe(unitsnap.NumberType.prototype.check);
  });

  it('should add processor of basic type Number as serializer', () => {
    const e = new unitsnap.Snapshot().addProcessor(Number);

    expect(e.env.processors[0].serializer.original).toBe(unitsnap.NumberType.prototype.serialize);
  });

  it('should add processor of basic type Number as checker', () => {
    const e = new unitsnap.Snapshot().addProcessor(unitsnap.NumberType);

    expect(e.env.processors[0].checker.original).toBe(unitsnap.NumberType.prototype.check);
  });

  it('should add processor of basic type Number as serializer', () => {
    const e = new unitsnap.Snapshot().addProcessor(unitsnap.NumberType);

    expect(e.env.processors[0].serializer.original).toBe(unitsnap.NumberType.prototype.serialize);
  });

  it('should add processor of basic type String as checker', () => {
    const e = new unitsnap.Snapshot().addProcessor(String);

    expect(e.env.processors[0].checker.original).toBe(unitsnap.StringType.prototype.check);
  });

  it('should add processor of basic type String as serializer', () => {
    const e = new unitsnap.Snapshot().addProcessor(String);

    expect(e.env.processors[0].serializer.original).toBe(unitsnap.StringType.prototype.serialize);
  });

  it('should add processor of basic type String as checker', () => {
    const e = new unitsnap.Snapshot().addProcessor(unitsnap.StringType);

    expect(e.env.processors[0].checker.original).toBe(unitsnap.StringType.prototype.check);
  });

  it('should add processor of basic type String as serializer', () => {
    const e = new unitsnap.Snapshot().addProcessor(unitsnap.StringType);

    expect(e.env.processors[0].serializer.original).toBe(unitsnap.StringType.prototype.serialize);
  });

  it('should add processor of basic type Undefined as checker', () => {
    const e = new unitsnap.Snapshot().addProcessor();

    expect(e.env.processors[0].checker.original).toBe(unitsnap.UndefinedType.prototype.check);
  });

  it('should add processor of basic type Undefined as serializer', () => {
    const e = new unitsnap.Snapshot().addProcessor();

    expect(e.env.processors[0].serializer.original).toBe(unitsnap.UndefinedType.prototype.serialize);
  });

  it('should add processor of basic type Undefined as checker', () => {
    const e = new unitsnap.Snapshot().addProcessor(unitsnap.UndefinedType);

    expect(e.env.processors[0].checker.original).toBe(unitsnap.UndefinedType.prototype.check);
  });

  it('should add processor of basic type Undefined as serializer', () => {
    const e = new unitsnap.Snapshot().addProcessor(unitsnap.UndefinedType);

    expect(e.env.processors[0].serializer.original).toBe(unitsnap.UndefinedType.prototype.serialize);
  });

  it('should add processor of basic type as checker with custom serializer', () => {
    const e = new unitsnap.Snapshot().addProcessor(unitsnap.AnyType, f);

    expect(e.env.processors[0].serializer).toBe(f);
  });

  it('should add processor of basic type as serializer with custom checker', () => {
    const e = new unitsnap.Snapshot().addProcessor(f, unitsnap.AnyType);

    expect(e.env.processors[0].checker).toBe(f);
  });

  it('should add processor of class of', () => {
    const e = new unitsnap.Snapshot().addClassOfProcessor(Date);

    expect(e.env.processors[0].checker.original).toBe(unitsnap._ClassOf.prototype.check);
  });

  it('should add processor of class of with custom serializer', () => {
    const e = new unitsnap.Snapshot().addClassOfProcessor(Date, f);

    expect(e.env.processors[0].serializer).toBe(f);
  });

  it('should add processor of instance of', () => {
    const e = new unitsnap.Snapshot().addInstanceOfProcessor(Date);

    expect(e.env.processors[0].checker.original).toBe(unitsnap._InstanceOf.prototype.check);
  });

  it('should add processor of instance of with custom serializer', () => {
    const e = new unitsnap.Snapshot().addInstanceOfProcessor(Date, f);

    expect(e.env.processors[0].serializer).toBe(f);
  });

  it('should add processor of path with custom serializer', () => {
    const e = new unitsnap.Snapshot().addPathProcessor('a', f);

    expect(e.env.processors[0].serializer).toBe(f);
  });

  it('should add processor of path regex with custom serializer', () => {
    const e = new unitsnap.Snapshot().addRegexPathProcessor('a', f);

    expect(e.env.processors[0].serializer).toBe(f);
  });

  it('should add processor of path regex as prepared regex with custom serializer', () => {
    const e = new unitsnap.Snapshot().addRegexPathProcessor(/a/, f);

    expect(e.env.processors[0].serializer).toBe(f);
  });

  it('should add processor of undefined', () => {
    const e = new unitsnap.Snapshot().addUndefinedProcessor();

    expect(e.env.processors[0].checker.original).toBe(unitsnap.UndefinedType.prototype.check);
  });

  it('should add processor of undefined with custom serializer', () => {
    const e = new unitsnap.Snapshot().addUndefinedProcessor(f);

    expect(e.env.processors[0].serializer).toBe(f);
  });

  it('should enable include args', () => {
    const e = new unitsnap.Snapshot().includeArgs();

    expect(e.config.args).toBe(true);
  });

  it('should enable include calls count', () => {
    const e = new unitsnap.Snapshot().includeCallsCount();

    expect(e.config.callsCount).toBe(true);
  });

  it('should enable include epoch', () => {
    const e = new unitsnap.Snapshot().includeEpoch();

    expect(e.config.epoch).toBe(true);
  });

  it('should enable include exception', () => {
    const e = new unitsnap.Snapshot().includeException();

    expect(e.config.exception).toBe(true);
  });

  it('should enable include exceptions count', () => {
    const e = new unitsnap.Snapshot().includeExceptionsCount();

    expect(e.config.exceptionsCount).toBe(true);
  });

  it('should enable include is async', () => {
    const e = new unitsnap.Snapshot().includeIsAsync();

    expect(e.config.isAsync).toBe(true);
  });

  it('should enable include name', () => {
    const e = new unitsnap.Snapshot();

    expect(e.includeName().config.name).toBe(true);
  });

  it('should enable include type', () => {
    const e = new unitsnap.Snapshot().includeType();

    expect(e.config.type).toBe(true);
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
      }]).addPathProcessor('[0]._esult', () => 'serialized');

      expect(e.serialize()).toEqual([{
        args: [], result: 'serialized',
      }]);
    });

    it('should serialize with path serializer contained "*" as "arbitrary symbols" pattern', () => {
      const e = new unitsnap.Snapshot([{
        args: [], callsCount: 1, epoch: 'epoch', exceptionsCount: 2, isAsync: true, name: 'name', result: 3, type: 'type',
      }]).addPathProcessor('[0]*result', () => 'serialized');

      expect(e.serialize()).toEqual([{
        args: [], result: 'serialized',
      }]);
    });

    it('should serialize with path regex serializer', () => {
      const e = new unitsnap.Snapshot([{
        args: [], callsCount: 1, epoch: 'epoch', exceptionsCount: 2, isAsync: true, name: 'name', result: 3, type: 'type',
      }]).addRegexPathProcessor('[0].*result', () => 'serialized');

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
        args: [], callsCount: 1, epoch: 'epoch', exceptionsCount: 2, isAsync: true, name: 'name', result: 3, type: 'type',
      }]).includeArgs(false);

      expect(e.serialize()).toEqual([{
        result: 3,
      }]);
    });

    it('should serialize with enabled include calls count', () => {
      const e = new unitsnap.Snapshot([{
        args: [], callsCount: 1, epoch: 'epoch', exceptionsCount: 2, isAsync: true, name: 'name', result: 3, type: 'type',
      }]).includeCallsCount();

      expect(e.serialize()).toEqual([{
        args: [], callsCount: 1, result: 3,
      }]);
    });

    it('should serialize with enabled include epoch', () => {
      const e = new unitsnap.Snapshot([{
        args: [], callsCount: 1, epoch: 'epoch', exceptionsCount: 2, isAsync: true, name: 'name', result: 3, type: 'type',
      }]).includeEpoch();

      expect(e.serialize()).toEqual([{
        args: [], epoch: 'epoch', result: 3,
      }]);
    });

    it('should serialize with enabled include exception', () => {
      const e = new unitsnap.Snapshot([{
        args: [], callsCount: 1, epoch: 'epoch', exception: 'exception', exceptionsCount: 2, isAsync: true, isException: true, name: 'name', result: 3, type: 'type',
      }]).includeException();

      expect(e.serialize()).toEqual([{
        args: [], exception: 'exception',
      }]);
    });


    it('should serialize with enabled include exceptions count', () => {
      const e = new unitsnap.Snapshot([{
        args: [], callsCount: 1, epoch: 'epoch', exceptionsCount: 2, isAsync: true, name: 'name', result: 3, type: 'type',
      }]).includeExceptionsCount();

      expect(e.serialize()).toEqual([{
        args: [], exceptionsCount: 2, result: 3,
      }]);
    });

    it('should serialize with enabled include is async', () => {
      const e = new unitsnap.Snapshot([{
        args: [], callsCount: 1, epoch: 'epoch', exceptionsCount: 2, isAsync: true, name: 'name', result: 3, type: 'type',
      }]).includeIsAsync();

      expect(e.serialize()).toEqual([{
        args: [], isAsync: true, result: 3,
      }]);
    });

    it('should serialize with enabled include name', () => {
      const e = new unitsnap.Snapshot([{
        args: [], callsCount: 1, epoch: 'epoch', exceptionsCount: 2, isAsync: true, name: 'name', result: 3, type: 'type',
      }]).includeName();

      expect(e.serialize()).toEqual([{
        args: [], name: 'name', result: 3,
      }]);
    });

    it('should serialize with enabled include type', () => {
      const e = new unitsnap.Snapshot([{
        args: [], callsCount: 1, epoch: 'epoch', exceptionsCount: 2, isAsync: true, name: 'name', result: 3, type: 'type',
      }]).includeType();

      expect(e.serialize()).toEqual([{
        args: [], result: 3, type: 'type',
      }]);
    });

    it('should serialize stopping on circular references in arrays', () => {
      const result = {
        a: [

        ]
      };

      result.a.push(result.a);

      const e = new unitsnap.Snapshot([{
        result: result,
      }]);

      expect(e.serialize()).toEqual([{
        result: {a:['[[ Circular ! ]]']},
      }]);
    });

    it('should serialize stopping on circular references in objects', () => {
      const result = {
        a: {
          result: null,
        },
      };

      result.a.result = result;

      const e = new unitsnap.Snapshot([{
        result: result,
      }]);

      expect(e.serialize()).toEqual([{
        result: {a:{result: '[[ Circular ! ]]'}},
      }]);
    });
  });

  it('should create filter linked to observer', () => {
    const e = new unitsnap.Snapshot([null]);

    expect(e.filter() instanceof unitsnap.Filter).toBeTruthy();
  });

  it('should load by self name', () => {
    const e = new unitsnap.Snapshot().setName('a').setProvider(new Provider({a: [null]}));

    expect(e.load().entries).toEqual([null]);
  });

  it('should load by name', () => {
    const e = new unitsnap.Snapshot().setProvider(new Provider({a: [null]}));

    expect(e.load('a').entries).toEqual([null]);
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

    expect(copy.config).toEqual(e.config);
    expect(copy.name).toEqual(e.name);
    expect(copy.observer).toBe(e.observer);
    expect(copy.env.provider).toBe(e.env.provider);
    expect(copy.env.processors).toEqual(e.env.processors);

    expect(copy.entries).toEqual([null]);
  });

  it('should exists by self name', () => {
    const e = new unitsnap.Snapshot().setName('a').setProvider(new Provider({a: [null]}));

    expect(e.exists()).toBeTruthy();
  });

  it('should not exists by self name', () => {
    const e = new unitsnap.Snapshot().setName('b').setProvider(new Provider({a: [null]}));

    expect(e.exists()).toBeFalsy();
  });

  it('should exists by name', () => {
    const e = new unitsnap.Snapshot().setProvider(new Provider({a: [null]}));

    expect(e.exists('a')).toBeTruthy();
  });

  it('should not exists by name', () => {
    const e = new unitsnap.Snapshot().setProvider(new Provider({a: [null]}));

    expect(e.exists('b')).toBeFalsy();
  });

  it('should load copy by self name', () => {
    const e = new unitsnap.Snapshot().setName('a').setProvider(new Provider({a: [null]}));

    expect(e.loadCopy().entries).toEqual([null]);
  });

  it('should load copy by name', () => {
    const e = new unitsnap.Snapshot().setProvider(new Provider({a: [null]}));

    expect(e.loadCopy('a').entries).toEqual([null]);
  });

  it('should load copy with copy of config', () => {
    const e = new unitsnap.Snapshot().setName('a').setProvider(new Provider({a: [null]}));

    expect(e.loadCopy().config).not.toBe(e.config);
  });

  it('should load copy with copy of processors', () => {
    const e = new unitsnap.Snapshot().setName('a').setProvider(new Provider({a: [null]}));

    expect(e.loadCopy().env.processors).not.toBe(e.env.processors);
  });

  it('should remove by self name', () => {
    const e = new unitsnap.Snapshot([null]).setName('a').setProvider(new Provider({a: {}}));

    expect(e.remove().env.provider.load('a')).toBeUndefined();
  });

  it('should remove by name', () => {
    const e = new unitsnap.Snapshot([null]).setProvider(new Provider({a: {}}));

    expect(e.remove('a').env.provider.load('a')).toBeUndefined();
  });

  it('should save by self name', () => {
    const e = new unitsnap.Snapshot([null]).setName('a').setProvider(new Provider({}));

    expect(e.save().env.provider.load('a')).toEqual([null]);
  });

  it('should save by name', () => {
    const e = new unitsnap.Snapshot([null]).setProvider(new Provider({}));

    expect(e.save('a').env.provider.load('a')).toEqual([null]);
  });

  it('should assert match', () => {
    const e = new unitsnap.Snapshot([{}]);

    expect(e.assert(new unitsnap.Snapshot([{}]))).toBeTruthy();
  });

  it('should assert mismatch primitive', () => {
    const e = new unitsnap.Snapshot([{result: 1}]);

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
  it('should exist', () => {
    expect(new unitsnap.SnapshotFsProvider(__dirname + '/snapshots').exists('a')).toBeTruthy();
  });

  it('should not exist', () => {
    expect(new unitsnap.SnapshotFsProvider(__dirname + '/snapshots').exists('b')).toBeFalsy();
  });

  it('should remove', () => {
    const e = new unitsnap.SnapshotFsProvider(__dirname + '/snapshots');

    e.save('test', new unitsnap.Snapshot([{}])).remove('test');

    expect(() => e.load('test')).toThrow();
  });

  it('should save/load', () => {
    const e = new unitsnap.SnapshotFsProvider(__dirname + '/snapshots');

    e.save('test', new unitsnap.Snapshot([{}]));

    expect(e.load('test')).toEqual([{}]);
  });

  it('should save/load arbitrary object', () => {
    const e = new unitsnap.SnapshotFsProvider(__dirname + '/snapshots');

    e.save('test', [{args: null, result: null}]);

    expect(e.load('test')).toEqual([{args: null, result: null}]);
  });
});

describe('SnapshotMemoryProvider', () => {
  it('should exist', () => {
    expect(new unitsnap.SnapshotMemoryProvider({a: []}).exists('a')).toBeTruthy();
  });

  it('should not exist', () => {
    expect(new unitsnap.SnapshotMemoryProvider({a: []}).exists('b')).toBeFalsy();
  });

  it('should remove', () => {
    const e = new unitsnap.SnapshotMemoryProvider();

    e.save('test', new unitsnap.Snapshot([{}])).remove('test');

    expect(() => e.load('test')).toThrow();
  });

  it('should save/load', () => {
    const e = new unitsnap.SnapshotMemoryProvider();

    e.save('test', new unitsnap.Snapshot([{}]));

    expect(e.load('test')).toEqual([{}]);
  });

  it('should save/load arbitrary object', () => {
    const e = new unitsnap.SnapshotMemoryProvider();

    e.save('test', [{args: null, result: null}]);

    expect(e.load('test')).toEqual([{args: null, result: null}]);
  });
});
