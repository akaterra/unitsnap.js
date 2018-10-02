const unitsnap = require('..');

describe('History', () => {
  const callback = jasmine.createSpy();
  const f = _ => _;
  const g = _ => _;
  const observer = new unitsnap.Observer();


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


  it('should add processor with custom checker and copier', () => {
    const e = new unitsnap.History().addProcessor(f, f);

    expect(e._processors).toEqual([{checker: f, copier: f}]);
  });

  it('should add processor with custom checker as matcher to primitive value', () => {
    const e = new unitsnap.History().addProcessor('checker', f);

    expect(e._processors[0].copier instanceof Function).toBeTruthy();
  });

  it('should return true on value match on added processor with custom checker as matcher to primitive value', () => {
    const e = new unitsnap.History().addProcessor('a', f);

    expect(e._processors[0].checker('a')).toBeTruthy();
  });

  it('should return false on value mismatch on added processor with custom checker as matcher to primitive value', () => {
    const e = new unitsnap.History().addProcessor('a', f);

    expect(e._processors[0].checker('b')).toBeFalsy();
  });

  it('should add processor before previously added', () => {
    const e = new unitsnap.History().addProcessor(f, f).addProcessor(g, g);

    expect(e._processors).toEqual([{checker: g, copier: g}, {checker: f, copier: f}]);
  });

  it('should add processor of basic type Any as checker', () => {
    const e = new unitsnap.History().addProcessor(unitsnap.AnyType);

    expect(e._processors[0].copier.original).toBe(unitsnap.AnyType.prototype.copy);
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
});
