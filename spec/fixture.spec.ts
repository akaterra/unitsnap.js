import unitsnap from '..';
const fixture = require('../src/fixture');

describe('Fixture', () => {
  const f = _ => _;

  class A {}

  class B extends A {}

  class Provider {}

  it('should be constructed with queue strategy', () => {
    const e = new unitsnap.Fixture();

    expect(e._strategy instanceof fixture.FixtureQueueStrategy).toBeTruthy();
  });

  it('should set name', () => {
    const e = new unitsnap.Fixture();

    expect(e.setName('name')._name).toBe('name');
  });

  it('should set provider', () => {
    const e = new unitsnap.Fixture().setStrategy(new Provider());

    expect(e._strategy instanceof Provider).toBeTruthy();
  });

  it('should initiate fs provider for current strategy', () => {
    const e = new unitsnap.Fixture().setName('test').setFsProvider(__dirname + '/fixtures');

    expect(e._strategy._values).toEqual([1, 2, 3]);
  });

  it('should set callback strategy', () => {
    const e = new unitsnap.Fixture().setCallbackStrategy(f);

    expect(e._strategy._cb).toBe(f);
  });


  it('should set queue strategy', () => {
    const e = new unitsnap.Fixture().setQueueStrategy([1, 2, 3]);

    expect(e._strategy._values).toEqual([1, 2, 3]);
  });

  it('should set fs provider for current strategy', () => {
    const e = new unitsnap.Fixture().setName('test').setFsProvider(new fixture.FixtureFsProvider(__dirname + '/fixtures'));

    expect(e._strategy._values).toEqual([1, 2, 3]);
  });

  it('should initiate memory provider for current strategy', () => {
    const e = new unitsnap.Fixture().setName('b').setMemoryProvider({a: [1], b: [2], c: [3]});

    expect(e._strategy._values).toEqual([2]);
  });

  it('should set memory provider for current strategy', () => {
    const e = new unitsnap.Fixture().setName('b').setMemoryProvider(new fixture.FixtureMemoryProvider({a: [1], b: [2], c: [3]}));

    expect(e._strategy._values).toEqual([2]);
  });

  it('should throw exception on Error as default exception value', () => {
    const e = new unitsnap.Fixture().push(new Error());

    expect(() => e.pop()).toThrow(new Error());
  });

  it('should throw exception on class of', () => {
    const e = new unitsnap.Fixture().throwOnClassOf(A).push(new A());

    expect(() => e.pop()).toThrow(new A());
  });

  it('should not throw exception on non class of', () => {
    const e = new unitsnap.Fixture().throwOnClassOf(A).push(new B());

    expect(() => e.pop()).not.toThrow();
  });

  it('should throw exception on instance of', () => {
    const e = new unitsnap.Fixture().throwOnInstanceOf(A).push(new B);

    expect(() => e.pop()).toThrow(new B());
  });

  it('should not throw exception on non instance of', () => {
    const e = new unitsnap.Fixture().throwOnInstanceOf(B).push(new A);

    expect(() => e.pop()).not.toThrow();
  });
});

describe('FixtureCallbackStrategy', () => {
  const f = _ => _;

  it('should throw exception on construct with bad argument', () => {
    expect(() => {
      new fixture.FixtureCallbackStrategy(null);
    }).toThrow();
  });

  it('should set callback', () => {
    const e = new fixture.FixtureCallbackStrategy(() => 1);

    expect(e.set(f)._cb).toBe(f);
  });

  it('should throw exception on set with bad argument', () => {
    expect(() => {
      new fixture.FixtureCallbackStrategy(() => 1).set(null);
    }).toThrow();
  });

  it('should pop value', () => {
    const e = new fixture.FixtureCallbackStrategy(() => 1);

    expect(e.pop()).toEqual(1);
  });

  it('should push value', () => {
    let arg;

    new fixture.FixtureCallbackStrategy((d) => arg = d).push(1);

    expect(arg).toBe(1);
  });
});

describe('FixtureQueueStrategy', () => {
  const f = _ => _;

  it('should throw exception on construct with bad argument', () => {
    expect(() => {
      new fixture.FixtureQueueStrategy(null);
    }).toThrow();
  });

  it('should set values', () => {
    const e = new fixture.FixtureQueueStrategy([1, 2, 3]);

    expect(e.set([3, 2, 1])._values).toEqual([3, 2, 1]);
  });

  it('should throw exception on set with bad argument', () => {
    expect(() => {
      new fixture.FixtureQueueStrategy([1, 2, 3]).set(null);
    }).toThrow();
  });

  it('should pop value', () => {
    const e = new fixture.FixtureQueueStrategy([1, 2, 3]);

    expect(e.pop()).toEqual(1);
  });

  it('should push value', () => {
    const e = new fixture.FixtureQueueStrategy([1, 2, 3]);

    e.push(1);

    expect(e._values).toEqual([1, 2, 3, 1]);
  });
});

describe('FixtureMemoryProvider', () => {
  it('should be constructed with dictionary', () => {
    const e = new fixture.FixtureMemoryProvider({a: 1});

    expect(e._dictionary).toEqual({a: 1});
  });

  it('should set name', () => {
    const e = new fixture.FixtureMemoryProvider({a: 1});

    expect(e.setName('name')._name).toBe('name');
  });

  it('should load by name', () => {
    const e = new fixture.FixtureMemoryProvider({a: 1, b: 2, c: 3});

    expect(e.load('b')).toEqual(2);
  });

  it('should load by self name', () => {
    const e = new fixture.FixtureMemoryProvider({a: 1, b: 2, c: 3}).setName('b');

    expect(e.load()).toEqual(2);
  });
});

describe('FixtureFsProvider', () => {
  it('should be constructed with dir', () => {
    const e = new fixture.FixtureFsProvider(__dirname);

    expect(e._dir).toBe(__dirname);
  });

  it('should set name', () => {
    const e = new fixture.FixtureFsProvider(__dirname);

    expect(e.setName('name')._name).toBe('name');
  });

  it('should load by name', () => {
    const e = new fixture.FixtureFsProvider(__dirname + '/fixtures');

    expect(e.load('test')).toEqual([1, 2, 3]);
  });

  it('should load by self name', () => {
    const e = new fixture.FixtureFsProvider(__dirname + '/fixtures').setName('test');

    expect(e.load()).toEqual([1, 2, 3]);
  });
});
