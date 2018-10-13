const unitsnap = require('..');

describe('History', () => {
  const callback = jasmine.createSpy();
  const f = _ => _;
  const g = _ => _;
  const observer = new unitsnap.Observer();

  class A {
  }

  const a = new A();

  class B extends A {
  }

  const b = new B();

  class C {
  }

  const c = new C();

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

  it('should link observer', () => {
    const e = new unitsnap.History();

    expect(e.link(observer)._observer).toBe(observer);
  });

  it('should unlink observer', () => {
    const e = new unitsnap.History();

    expect(e.link(observer).unlink()._observer).toBeUndefined();
  });

  it('should add processor before previously added', () => {
    const e = new unitsnap.History().addProcessor(f, f).addProcessor(g, g);

    expect(e._processors).toEqual([{checker: g, copier: g}, {checker: f, copier: f}]);
  });

  it('should add processor with custom checker and copier', () => {
    const e = new unitsnap.History().addProcessor(f, f);

    expect(e._processors).toEqual([{checker: f, copier: f}]);
  });

  it('should add processor with custom checker as matcher to primitive value', () => {
    const e = new unitsnap.History().addProcessor('checker', f);

    expect(e._processors[0].copier instanceof Function).toBeTruthy();
  });

  it('should add processor of basic type as checker with custom copier', () => {
    const e = new unitsnap.History().addProcessor(unitsnap.AnyType, f);

    expect(e._processors[0].copier).toBe(f);
  });

  it('should add processor of basic type as copier with custom checker', () => {
    const e = new unitsnap.History().addProcessor(f, unitsnap.AnyType);

    expect(e._processors[0].checker).toBe(f);
  });

  it('should add processor of basic types as checker', () => {
    const types = [
      [unitsnap.AnyType],
      [unitsnap.ArrayType],
      [Array, unitsnap.ArrayType],
      [unitsnap.BooleanType],
      [Boolean, unitsnap.BooleanType],
      [unitsnap.DateType],
      [Date, unitsnap.DateType],
      [unitsnap.NumberType],
      [Number, unitsnap.NumberType],
      [unitsnap.ObjectType],
      [Object, unitsnap.ObjectType],
      [unitsnap.StringType],
      [String, unitsnap.StringType],
      [unitsnap.UndefinedType],
      [void 0, unitsnap.UndefinedType],
    ];

    for (const type of types) {
      const e = new unitsnap.History().addProcessor(type[0]);

      if (type.length === 1) {
        expect(e._processors[0].checker.original).toBe(type[0].prototype.check, type[0]);
      } else {
        expect(e._processors[0].checker.original).toBe(type[1].prototype.check, type[1]);
      }
    }
  });

  it('should add processor of basic types as copier', () => {
    const types = [
      [unitsnap.AnyType],
      [unitsnap.ArrayType],
      [Array, unitsnap.ArrayType],
      [unitsnap.BooleanType],
      [Boolean, unitsnap.BooleanType],
      [unitsnap.DateType],
      [Date, unitsnap.DateType],
      [unitsnap.NumberType],
      [Number, unitsnap.NumberType],
      [unitsnap.ObjectType],
      [Object, unitsnap.ObjectType],
      [unitsnap.StringType],
      [String, unitsnap.StringType],
      [unitsnap.UndefinedType],
      [void 0, unitsnap.UndefinedType],
    ];

    for (const type of types) {
      const e = new unitsnap.History().addProcessor(type[0]);

      if (type.length === 1) {
        expect(e._processors[0].copier.original).toBe(type[0].prototype.copy, type[0]);
      } else {
        expect(e._processors[0].copier.original).toBe(type[1].prototype.copy, type[1]);
      }
    }
  });

  it('should add processor of instance of', () => {
    const e = new unitsnap.History().addInstanceOfProcessor(Date);

    expect(e._processors[0].checker.original).toBe(unitsnap.InstanceOfType.prototype.check);
  });

  it('should add processor of instance of with custom copier', () => {
    const e = new unitsnap.History().addInstanceOfProcessor(Date, f);

    expect(e._processors[0].copier).toBe(f);
  });

  it('should add processor of path with custom copier', () => {
    const e = new unitsnap.History().addPathProcessor('a', f);

    expect(e._processors[0].copier).toBe(f);
  });

  it('should add processor of path regex with custom copier', () => {
    const e = new unitsnap.History().addRegexPathProcessor('a', f);

    expect(e._processors[0].copier).toBe(f);
  });

  it('should add processor of path regex as prepared regex with custom copier', () => {
    const e = new unitsnap.History().addRegexPathProcessor(/a/, f);

    expect(e._processors[0].copier).toBe(f);
  });

  it('should add processor of strict instance of', () => {
    const e = new unitsnap.History().addStrictInstanceOfProcessor(Date);

    expect(e._processors[0].checker.original).toBe(unitsnap.StrictInstanceOfType.prototype.check);
  });

  it('should add processor of strict instance of with custom copier', () => {
    const e = new unitsnap.History().addStrictInstanceOfProcessor(Date, f);

    expect(e._processors[0].copier).toBe(f);
  });

  it('should begin epoch', () => {
    const e = new unitsnap.History().begin('epoch', 'comment');

    expect(e._epochs).toEqual([{callbacks: [], comment: 'comment', epoch: 'epoch'}]);
  });

  it('should end epoch', () => {
    const e = new unitsnap.History().begin('epoch', 'comment').end().end();

    expect(e._epochs).toEqual([]);
  });

  it('should throw exception on non begun history', () => {
    const e = new unitsnap.History();

    expect(() => e.push()).toThrow();
  });

  it('should push entry on begun history', () => {
    const e = new unitsnap.History().begin('epoch', 'comment');

    e.push({a: 1}, 4);

    expect(e._entries).toEqual([{
      a: 1,
      comment: 'comment',
      epoch: 'epoch',
      tags: 4,
      time: e._entries[0].time,
    }]);
  });

  it('should push entry on sub epoch of begun history', () => {
    const e = new unitsnap.History().begin('epoch', 'comment').begin('sub epoch', 'sub comment');

    e.push({a: 1}, 4);

    expect(e._entries).toEqual([{
      a: 1,
      comment: 'sub comment',
      epoch: 'sub epoch',
      tags: 4,
      time: e._entries[0].time,
    }]);
  });

  it('should push entry on begun history after end of sub epoch', () => {
    const e = new unitsnap.History().begin('epoch', 'comment').begin('sub epoch', 'sub comment').end();

    e.push({a: 1}, 4);

    expect(e._entries).toEqual([{
      a: 1,
      comment: 'comment',
      epoch: 'epoch',
      tags: 4,
      time: e._entries[0].time,
    }]);
  });

  it('should get current epoch on begun history', () => {
    const e = new unitsnap.History().begin('1', '2').begin('3', '4');

    expect(e.getCurrentEpoch()).toEqual({callbacks: [], comment: '4', epoch: '3'});
  });

  it('should not get current epoch on not begun history', () => {
    const e = new unitsnap.History();

    expect(e.getCurrentEpoch()).toBeNull();
  });

  it('should add callback to current epoch on begun history', () => {
    const e = new unitsnap.History().begin('1', '2').addOnEpochEndCallback(f);

    expect(e.getCurrentEpoch().callbacks).toEqual([f]);
  });

  it('should not add callback to current epoch on not begun history', () => {
    const e = new unitsnap.History().addOnEpochEndCallback(f);

    expect(e.getCurrentEpoch()).toBeNull();
  });

  it('should call current epoch callback on epoch end', () => {
    new unitsnap.History().begin().addOnEpochEndCallback(callback).end();

    expect(callback).toHaveBeenCalled();
  });

  it('should create filter', () => {
    const e = new unitsnap.History();

    expect(e.filter() instanceof unitsnap.Filter);
  });

  it('should create filter with same entries', () => {
    const e = new unitsnap.History().begin('epoch', 'comment').push({a: 1}, 4);

    expect(e.filter()._entries).toEqual(e._entries);
  });

  it('should create filter linked to observer', () => {
    const e = new unitsnap.History().link(observer);

    expect(e.filter()._observer).toBe(observer);
  });

  describe('when copies', () => {
    it('should copy with custom checker and copier', () => {
      const e = new unitsnap.History().addProcessor(_ => _ instanceof A, _ => 'copied');

      e.begin().push({result: [{a: a, c: c}]});

      expect(e._entries[0].result).toEqual([{a: 'copied', c: c}]);
    });

    it('should copy with added processor with custom checker as matcher to primitive value', () => {
      const e = new unitsnap.History().addProcessor('a', _ => 'copied');

      e.begin().push({result: [{a: 'a', c: c}]});

      expect(e._entries[0].result).toEqual([{a: 'copied', c: c}]);
    });

    it('should copy with path copier contained "?" as "single arbitrary symbol" pattern', () => {
      const e = new unitsnap.History().addPathProcessor('[0].?es?lt', _ => 'copied');

      e.begin().push({result: [{a: 'a', c: c}]});

      expect(e._entries[0].result).toEqual('copied');
    });

    it('should copy with path copier contained "*" as "any arbitrary symbols" pattern', () => {
      const e = new unitsnap.History().addPathProcessor('[0]*res*ult', _ => 'copied');

      e.begin().push({result: [{a: 'a', c: c}]});

      expect(e._entries[0].result).toEqual('copied');
    });

    it('should copy with path regex copier', () => {
      const e = new unitsnap.History().addRegexPathProcessor('[0].*result', _ => 'copied');

      e.begin().push({result: [{a: 'a', c: c}]});

      expect(e._entries[0].result).toEqual('copied');
    });

    it('should copy ignoring PROCESSED values equal "Ignore" type helper', () => {
      const e = new unitsnap.History().addProcessor('ignore', unitsnap.Ignore);

      e.begin().push({result: [{a: 'ignore', c: c}]});

      expect(e._entries[0].result).toEqual([{c: c}]);
    });
  });
});
