import unitsnap from '..';
const spy = require('../src/spy');

describe('Observer', () => {
  const f = _ => _;

  class A {
    constructor() {

    }
  }

  class B {

  }

  Object.defineProperty(B, 'RESTORE', {
    value: jasmine.createSpy(),
  });

  class MockStub {

  }

  MockStub.prototype.by = jasmine.createSpy('by').and.callFake(function () { return true; });
  MockStub.prototype.from = jasmine.createSpy('from').and.callFake(function () { return true; });
  MockStub.prototype.override = jasmine.createSpy('override').and.callFake(function () { return B; });
  MockStub.prototype.spy = jasmine.createSpy('spy').and.callFake(function () { return true; });

  afterEach(() => {
    if (A.RESTORE) { // @see Mock
      A.RESTORE();
    }
  });

  it('should be constructed with entities linked to observer', () => {
    const e = new unitsnap.Observer();

    expect(e._fixture instanceof unitsnap.Fixture);
    expect(e._history instanceof unitsnap.History);
    expect(e._history._observer).toBe(e);
    expect(e._mock instanceof unitsnap.Mock);
    expect(e._mock._history).toBe(e._history);
    expect(e._snapshot instanceof unitsnap.Snapshot);
    expect(e._snapshot._observer).toBe(e);
    expect(e._config).toEqual({
      fixture: e._fixture,
      history: e._history,
      mock: e._mock,
      snapshot: e._snapshot,
    });
  });

  it('should be constructed by "create"', () => {
    expect(unitsnap.create() instanceof unitsnap.Observer).toBeTruthy();
  });

  it('should get config', () => {
    const e = new unitsnap.Observer();

    expect(e.config()).toBe(e._config);
  });

  it('should set name', () => {
    const e = new unitsnap.Observer().setName('test');

    expect(e._fixture._name).toBe('test');
    expect(e._name).toBe('test');
    expect(e._snapshot._name).toBe('test');
  });

  it('should begin historical epoch', () => {
    const e = new unitsnap.Observer();

    expect(e.begin('epoch', 'comment')._history._epochs).toEqual([{callbacks: [], comment: 'comment', epoch: 'epoch'}]);
  });

  it('should end historical epoch', () => {
    const e = new unitsnap.Observer().begin('epoch', 'comment');

    expect(e.end()._history._epochs).toEqual([]);
  });

  it('should from mock with from', () => {
    const e = new unitsnap.Observer();

    e._mock = new MockStub();

    const E = e.from({a: f});

    expect(e._mock.from.calls.first().args).toEqual([{a: f}, void 0]);
    expect(e._mock.from.calls.first().returnValue).toBe(true);
  });

  it('should from mock with by', () => {
    const e = new unitsnap.Observer();

    e._mock = new MockStub();

    const E = e.by(A, ['a']);

    expect(e._mock.by.calls.first().args).toEqual([A, ['a'], void 0]);
    expect(e._mock.by.calls.first().returnValue).toBe(true);
  });

  it('should from mock with override', () => {
    const e = new unitsnap.Observer();

    e._mock = new MockStub();

    const E = e.override(A, ['a']);

    expect(e._mock.override.calls.first().args).toEqual([A, ['a'], void 0]);
    expect(e._mock.override.calls.first().returnValue).toBe(B);
  });

  it('should spy', () => {
    const e = new unitsnap.Observer();

    e._mock = new MockStub();

    const E = e.spy(f);

    expect(e._mock.spy.calls.first().args).toEqual([f]);
    expect(e._mock.spy.calls.first().returnValue).toBe(true);
  });

  it('should RESTORE overridden mocks on history end', () => {
    const e = new unitsnap.Observer().begin('epoch', 'comment');

    e.override(B);

    e.end();

    expect(B.RESTORE).toHaveBeenCalled();
  });

  it('should push fixture value', () => {
    const e = new unitsnap.Observer();

    expect(e.push(1, 2, 3)._fixture._strategy._values).toEqual([1, 2, 3]);
  });

  it('should create filter', () => {
    const e = new unitsnap.Observer();

    expect(e.filter() instanceof unitsnap.Filter).toBeTruthy();
  });

  it('should create snapshot', () => {
    const e = new unitsnap.Observer();

    expect(e.snapshot() instanceof unitsnap.Snapshot).toBeTruthy();
  });
});
