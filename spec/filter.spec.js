const unitsnap = require('..');

describe('Filter', () => {
  const f = _ => _;
  const observer = new unitsnap.Observer();

  it('should be constructed with entries', () => {
    const e = new unitsnap.Filter([{}, {}, {}]);

    expect(e._entries).toEqual([{}, {}, {}]);
  });

  it('should link observer', () => {
    const e = new unitsnap.Filter();

    expect(e.link(observer)._observer).toBe(observer);
  });

  it('should unlink observer', () => {
    const e = new unitsnap.Filter();

    expect(e.link(observer).unlink()._observer).toBeUndefined();
  });

  it('should set context expectation', () => {
    const e = new unitsnap.Filter([{}, {}, {}]);

    expect(e.context(1).ctx(2)._context).toBe(2);
  });

  it('should set epoch expectation', () => {
    const e = new unitsnap.Filter([{}, {}, {}]);

    expect(e.custom(f)._custom).toBe(f);
  });

  it('should set custom expectation', () => {
    const e = new unitsnap.Filter([{}, {}, {}]);

    expect(e.epoch(1)._epoch).toBe(1);
  });

  it('should set fn expectation', () => {
    const e = new unitsnap.Filter([{}, {}, {}]);

    expect(e.fn(f)._fn).toBe(f);
  });

  it('should set tags expectation', () => {
    const e = new unitsnap.Filter([{}, {}, {}]);

    expect(e.tags(1, 2, 3)._tags).toEqual([1, 2, 3]);
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

    expect(e.snapshot()._entries).toEqual([{}, {}, {}]);
  });

  it('should create snapshot with entries filtered by expectations', () => {
    const custom = (entry) => entry.a === 1;

    const e = new unitsnap.Filter([{
      a: 1,
      context: null,
      epoch: 3,
      origin: custom,
      tags: [1, 2, 3],
    }, {
      a: null,
      context: 2,
      epoch: 3,
      origin: custom,
      tags: [1, 2, 3],
    }, {
      a: 1,
      context: 2,
      epoch: null,
      origin: custom,
      tags: [1, 2, 3],
    }, {
      a: 1,
      context: 2,
      epoch: 3,
      origin: null,
      tags: [1, 2, 3],
    }, {
      a: 1,
      context: 2,
      epoch: 3,
      origin: custom,
      tags: [1],
    }, { // this one passes all expectations
      a: 1,
      context: 2,
      epoch: 3,
      origin: custom,
      tags: [1, 2, 3],
    }]);

    e.context(1).ctx(2);
    e.custom(custom);
    e.epoch(3);
    e.fn(custom);
    e.tags(1, 2, 3);

    expect(e.snapshot()._entries).toEqual([{
      a: 1,
      context: 2,
      epoch: 3,
      origin: custom,
      tags: [1, 2, 3],
    }]);
  });

  it('should create snapshot linked to observer and configured by linked observer', () => {
    const observer = new unitsnap.Observer();

    const e = new unitsnap.Filter([1, 2, 3]).link(observer);

    expect(e.snapshot()._config).toBe(observer._snapshot._config);
    expect(e.snapshot()._mapper).toBe(observer._snapshot._mapper);
    expect(e.snapshot()._observer).toBe(observer);
    expect(e.snapshot()._processors).toEqual(observer._snapshot._processors);
    expect(e.snapshot()._provider).toBe(observer._snapshot._provider);
  });
});
