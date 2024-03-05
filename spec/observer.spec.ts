import * as unitsnap from '..';

describe('Observer', () => {
  const f = () => {};

  class A {
    constructor() {

    }
  }

  class B {

  }

  Object.defineProperty(B, 'RESTORE', {
    value: jasmine.createSpy(),
  });

  let bySpy: jasmine.Spy;
  let fromSpy: jasmine.Spy;
  let overrideSpy: jasmine.Spy;
  let spySpy: jasmine.Spy;

  beforeEach(() => {
    // TODO fix
    bySpy = unitsnap._Mock.prototype.by = spyOn(unitsnap._Mock.prototype, 'by').and.callThrough().and.returnValue(f as any) as any;
    fromSpy = unitsnap._Mock.prototype.from = spyOn(unitsnap._Mock.prototype, 'from').and.callThrough().and.returnValue(f as any) as any;
    overrideSpy = unitsnap._Mock.prototype.override = spyOn(unitsnap._Mock.prototype, 'override').and.callThrough().and.returnValue(B) as any;
    spySpy = unitsnap._Mock.prototype.spy = spyOn(unitsnap._Mock.prototype, 'spy').and.callThrough().and.returnValue(f as any) as any;
  });

  afterEach(() => {
    bySpy.calls.reset();
    fromSpy.calls.reset();
    overrideSpy.calls.reset();
    spySpy.calls.reset();
  
    if (unitsnap.stat(A).restore) { // @see Mock
      unitsnap.stat(A).restore();
    }
  });

  it('should be constructed with entities linked to observer', () => {
    const e = new unitsnap._Observer();

    expect(e.env.fixture instanceof unitsnap._Fixture);
    expect(e.env.history instanceof unitsnap.History);
    expect(e.env.history.observer).toBe(e);
    expect(e.env.mock instanceof unitsnap._Mock);
    expect(e.env.mock.history).toBe(e.env.history);
    expect(e.env.snapshot instanceof unitsnap.Snapshot);
    expect(e.env.snapshot.observer).toBe(e);
  });

  it('should be constructed by "create"', () => {
    expect(unitsnap.Observer() instanceof unitsnap._Observer).toBeTruthy();
  });

  it('should set name', () => {
    const e = new unitsnap._Observer().setName('test');

    expect(e.env.fixture.name).toBe('test');
    expect(e.name).toBe('test');
    expect(e.env.snapshot.name).toBe('test');
  });

  it('should begin historical epoch', () => {
    const e = new unitsnap._Observer();

    expect(e.begin('epoch', 'comment').env.history.epochs).toEqual([{callbacks: [], comment: 'comment', epoch: 'epoch'}]);
  });

  it('should end historical epoch', () => {
    const e = new unitsnap._Observer().begin('epoch', 'comment');

    expect(e.end().env.history.epochs).toEqual([]);
  });

  it('should build mock with from', () => {
    const e = new unitsnap._Observer();
    const E = e.from({a: f});

    expect(fromSpy.calls.first().args).toEqual([{a: f}, undefined]);
    expect(fromSpy.calls.first().returnValue).toBe(f);
  });

  it('should build mock with by', () => {
    const e = new unitsnap._Observer();
    const E = e.by(A, ['a']);

    expect(bySpy.calls.first().args).toEqual([A, ['a'], undefined]);
    expect(bySpy.calls.first().returnValue).toBe(f);
  });

  it('should build mock with override', () => {
    const e = new unitsnap._Observer();
    const E = e.override(A, ['a']);

    expect(overrideSpy.calls.first().args).toEqual([A, ['a'], undefined]);
    expect(overrideSpy.calls.first().returnValue).toBe(B);
  });

  it('should spy', () => {
    const e = new unitsnap._Observer();
    const E = e.spy(f);

    expect(spySpy.calls.first().args).toEqual([f]);
    expect(spySpy.calls.first().returnValue).toBe(f);
  });

  it('should RESTORE overridden mocks on history end', () => {
    const e = new unitsnap._Observer().begin('epoch', 'comment');

    e.override(B);

    e.end();

    expect(unitsnap.stat(B).restore).toHaveBeenCalled();
  });

  it('should push fixture value', () => {
    const e = new unitsnap._Observer();

    expect(e.push(1, 2, 3).env.fixture.env.strategy.pop(3)).toEqual([1, 2, 3]);
  });

  it('should create filter', () => {
    const e = new unitsnap._Observer();

    expect(e.filter() instanceof unitsnap.Filter).toBeTruthy();
  });

  it('should create snapshot', () => {
    const e = new unitsnap._Observer();

    expect(e.snapshot() instanceof unitsnap.Snapshot).toBeTruthy();
  });
});
