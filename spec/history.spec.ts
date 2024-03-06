import * as unitsnap from '..';

describe('History', () => {
  const callback = jasmine.createSpy();
  const f = () => {};
  const observer = new unitsnap._Observer();

  it('should link observer', () => {
    const e = new unitsnap._History();

    expect(e.link(observer).observer).toBe(observer);
  });

  it('should unlink observer', () => {
    const e = new unitsnap._History();

    expect(e.link(observer).unlink().observer).toBeNull();
  });

  it('should begin epoch', () => {
    const e = new unitsnap._History().begin('epoch', 'comment');

    expect(e.epochs).toEqual([{callbacks: [], comment: 'comment', epoch: 'epoch'}]);
  });

  it('should end epoch', () => {
    const e = new unitsnap._History().begin('epoch', 'comment').end().end();

    expect(e.epochs).toEqual([]);
  });

  it('should throw exception on non begun history', () => {
    const e = new unitsnap._History();

    expect(() => e.push(null)).toThrow();
  });

  it('should push entry on begun history', () => {
    const e = new unitsnap._History().begin('epoch', 'comment');

    e.push({context: 1}, ['4']);

    expect(e.entries).toEqual([{
      context: 1,
      comment: 'comment',
      epoch: 'epoch',
      tags: [ '4' ],
      time: e.entries[0].time,
    }]);
  });

  it('should push entry on sub epoch of begun history', () => {
    const e = new unitsnap._History().begin('epoch', 'comment').begin('sub epoch', 'sub comment');

    e.push({context: 1}, ['4']);

    expect(e.entries).toEqual([{
      context: 1,
      comment: 'sub comment',
      epoch: 'sub epoch',
      tags: [ '4' ],
      time: e.entries[0].time,
    }]);
  });

  it('should push entry on begun history after end of sub epoch', () => {
    const e = new unitsnap._History().begin('epoch', 'comment').begin('sub epoch', 'sub comment').end();

    e.push({context: 1}, ['4']);

    expect(e.entries).toEqual([{
      context: 1,
      comment: 'comment',
      epoch: 'epoch',
      tags: [ '4' ],
      time: e.entries[0].time,
    }]);
  });

  it('should get current epoch on begun history', () => {
    const e = new unitsnap._History().begin('1', '2').begin('3', '4');

    expect(e.getCurrentEpoch()).toEqual({callbacks: [], comment: '4', epoch: '3'});
  });

  it('should not get current epoch on not begun history', () => {
    const e = new unitsnap._History();

    expect(e.getCurrentEpoch()).toBeNull();
  });

  it('should add callback to current epoch on begun history', () => {
    const e = new unitsnap._History().begin('1', '2').addOnEndCallback(f);

    expect(e.getCurrentEpoch().callbacks).toEqual([f]);
  });

  it('should not add callback to current epoch on not begun history', () => {
    const e = new unitsnap._History().addOnEndCallback(f);

    expect(e.getCurrentEpoch()).toBeNull();
  });

  it('should call current epoch callback on epoch end', () => {
    new unitsnap._History().begin().addOnEndCallback(callback).end();

    expect(callback).toHaveBeenCalled();
  });

  it('should create filter', () => {
    const e = new unitsnap._History();

    expect(e.filter() instanceof unitsnap._Filter);
  });

  it('should create filter with same entries', () => {
    const e = new unitsnap._History().begin('epoch', 'comment').push({ context: 1 }, ['4']);

    expect(e.filter().entries).toEqual(e.entries);
  });

  it('should create filter linked to observer', () => {
    const e = new unitsnap._History().link(observer);

    expect(e.filter().observer).toBe(observer);
  });
});
