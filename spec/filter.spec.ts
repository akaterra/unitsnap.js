import * as unitsnap from '..';

describe('Filter', () => {
  const f = _ => _;
  const observer = new unitsnap.Observer();

  it('should be constructed with entries', () => {
    const e = new unitsnap.Filter([{}, {}, {}]);

    expect(e.entries).toEqual([{}, {}, {}]);
  });

  it('should link observer', () => {
    const e = new unitsnap.Filter();

    expect(e.link(observer).observer).toBe(observer);
  });

  it('should unlink observer', () => {
    const e = new unitsnap.Filter();

    expect(e.link(observer).unlink().observer).toBeNull();
  });

  it('should throw exception on non callable custom', () => {
    const e = new unitsnap.Filter();

    expect(() => e.custom(null)).toThrow();
  });

  it('should create snapshot', () => {
    const e = new unitsnap.Filter([{}, {}, {}]);

    expect(e.snapshot() instanceof unitsnap.Snapshot);
  });

  it('should create snapshot with same entries on absent expectations', () => {
    const e = new unitsnap.Filter([{}, {}, {}]);

    expect(e.snapshot().entries).toEqual([{}, {}, {}]);
  });

  it('should create snapshot with entries filtered by expectations', () => {
    const custom = (entry) => entry.a === 1;
    const promise = Promise.resolve();

    const e = new unitsnap.Filter([{
      a: 1,
      context: null,
      epoch: '3',
      origin: custom,
      result: promise,
      tags: ['1', '2', '3'],
    }, {
      a: null,
      context: 2,
      epoch: '3',
      origin: custom,
      result: promise,
      tags: ['1', '2', '3'],
    }, {
      a: 1,
      context: 2,
      epoch: null,
      origin: custom,
      result: promise,
      tags: ['1', '2', '3'],
    }, {
      a: 1,
      context: 2,
      epoch: '3',
      origin: null,
      result: promise,
      tags: ['1', '2', '3'],
    }, {
      a: 1,
      context: 2,
      epoch: '3',
      origin: custom,
      result: null,
      tags: ['1'],
    }, {
      a: 1,
      context: 2,
      epoch: '3',
      origin: custom,
      result: promise,
      tags: ['1', '2', '3'],
    }, { // this one passes all expectations
      a: 1,
      context: 2,
      epoch: '3',
      origin: custom,
      result: null,
      tags: ['1', '2', '3'],
    }]);

    e.context(2).ctx(2);
    e.custom(custom);
    e.epoch('3');
    e.fn(custom);
    e.notPromiseResult();
    e.tags('1', '2', '3');

    expect(e.snapshot().entries).toEqual([{
      a: 1,
      context: 2,
      epoch: '3',
      origin: custom,
      result: null,
      tags: ['1', '2', '3'],
    }]);
  });

  it('should create snapshot with entries filtered by disregard', () => {
    const custom = (entry) => entry.a === 1;
    const promise = Promise.resolve();

    const e = new unitsnap.Filter([{
      a: 1,
      context: null,
      epoch: '3',
      origin: custom,
      result: promise,
      tags: ['1', '2', '3'],
    }, {
      a: null,
      context: 2,
      epoch: '3',
      origin: custom,
      result: promise,
      tags: ['1', '2', '3'],
    }, {
      a: 1,
      context: 2,
      epoch: null,
      origin: custom,
      result: promise,
      tags: ['1', '2', '3'],
    }, {
      a: 1,
      context: 2,
      epoch: '3',
      origin: null,
      result: promise,
      tags: ['1', '2', '3'],
    }, {
      a: 1,
      context: 2,
      epoch: '3',
      origin: custom,
      result: null,
      tags: ['1', '2', '3'],
    }, {
      a: 1,
      context: 2,
      epoch: '3',
      origin: custom,
      result: promise,
      tags: ['1'],
    }, { // this one passes all expectations
      a: null,
      context: null,
      epoch: null,
      origin: null,
      result: promise,
      tags: ['4', '5', '6'],
    }]);

    e.not().context(2).not().ctx(2);
    e.not().custom(custom);
    e.not().epoch('3');
    e.not().fn(custom);
    e.not().notPromiseResult();
    e.not().tags('1', '2', '3');

    expect(e.snapshot().entries).toEqual([{
      a: null,
      context: null,
      epoch: null,
      origin: null,
      result: promise,
      tags: ['4', '5', '6'],
    }]);
  });

  it('should create snapshot linked to observer and configured by linked observer', () => {
    const observer = new unitsnap.Observer();

    const e = new unitsnap.Filter([ {}, {}, {} ]).link(observer);

    expect(e.snapshot().config).toBe(observer.env.snapshot.config);
    expect(e.snapshot().env.mapper).toBe(observer.env.snapshot.env.mapper);
    expect(e.snapshot().env.observer).toBe(observer);
    expect(e.snapshot().env.processors).toEqual(observer.env.snapshot.env.processors);
    expect(e.snapshot().env.provider).toBe(observer.env.snapshot.env.provider);
  });
});
