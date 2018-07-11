const unitsnap = require('..');

describe('Mock', () => {
  const f = _ => _;
  const fixture = new unitsnap.Fixture();
  const history = new unitsnap.History();
  const observer = new unitsnap.Observer();

  class A {
    constructor(p) {

    }
  }

  class B extends A {
    a(a) {
      return a;
    }

    b(a, b) {
      return b;
    }

    c(a) {
      throw new Error('error');
    }
  }

  function C() {

  }

  C.prototype = {
    a: function () {

    }
  };

  function D() {

  }

  D.prototype = {
    a: function () {

    }
  };

  delete D.prototype.constructor;

  const bPrototype = Object.getOwnPropertyNames(B.prototype).reduce((acc, key) => {
    acc[key] = B.prototype[key];

    return acc;
  }, {});

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

  afterEach(() => {
    if (A.RESTORE) { // @see Mock
      A.RESTORE();
    }

    if (B.RESTORE) { // @see Mock
      B.RESTORE();
    }

    if (C.RESTORE) { // @see Mock
      C.RESTORE();
    }

    if (D.RESTORE) { // @see Mock
      D.RESTORE();
    }
  });

  beforeEach(() => history.flush());

  it('should be constructed with history', () => {
    const e = new unitsnap.Mock(history);

    expect(e._history).toBe(history);
  });

  describe('when builds mock by class (Mock.from)', () => {
    it('should builds mock', () => {
      const E = new unitsnap.Mock(history).from({c: f});

      expect(E.prototype.c.REPLACEMENT).toBe(f);
    });
  });

  describe('when uses mocked class (Mock.from)', () => {
    it('should mock be constructed', () => {
      const E = new unitsnap.Mock(history).from({c: f});

      expect(new E instanceof E).toBeTruthy();
    });
  });

  describe('when builds mock by class (Mock.by)', () => {
    it('should throw exception on bad argument', () => {
      const E = new unitsnap.Mock(history);

      expect(() => E.by(null)).toThrow();
    });

    it('should from mock', () => {
      const E = new unitsnap.Mock(history).by(A);

      expect(E).not.toBe(A);
    });

    it('should built mock be instance of original class', () => {
      const E = new unitsnap.Mock(history.begin()).by(A);

      expect(new E instanceof A);
    });

    it('should save original constructor in class prototype', () => {
      const E = new unitsnap.Mock(history).by(A, ['constructor']);

      expect(E.prototype.constructor).toBe(A);
    });

    describe('when uses list of props', () => {
      it('should override all props with spy', () => {
        const E = new unitsnap.Mock(history).by(B);

        expect(E.prototype.a.ORIGIN).toBe(B.prototype.a);
        expect(E.prototype.b.ORIGIN).toBe(B.prototype.b);
        expect(E.prototype.c.ORIGIN).toBe(B.prototype.c);
      });

      it('should override constructor with spy', () => {
        const E = new unitsnap.Mock(history).by(B, ['constructor']);

        expect(E.prototype.a).toBe(B.prototype.a);
        expect(E.ORIGIN).toBe(B);
        expect(E.REPLACEMENT instanceof Function).toBeTruthy();
      });

      it('should override props with spy', () => {
        const E = new unitsnap.Mock(history).by(B, ['c']);

        expect(E.prototype.a).toBe(B.prototype.a);
        expect(E.prototype.c.ORIGIN).toBe(B.prototype.c);
        expect(E.prototype.c.REPLACEMENT).toBe(B.prototype.c);
      });

      it('should stub absented props with spy', () => {
        const E = new unitsnap.Mock(history).by(B, ['x']);

        expect(E.prototype.x instanceof Function).toBeTruthy();
      });

      it('should stub constructor', () => {
        const E = new unitsnap.Mock(history).by(B, ['constructor']);

        expect(E.ORIGIN).toBe(B);
      });
    });

    describe('when uses dictionary of props (prop name: custom handler)', () => {
      it('should override constructor with spy', () => {
        const E = new unitsnap.Mock(history).by(B, {constructor: f});

        expect(E.prototype.a).toBe(B.prototype.a);
        expect(E.ORIGIN).toBe(B);
        expect(E.REPLACEMENT).toBe(f);
      });

      it('should override props with spy', () => {
        const E = new unitsnap.Mock(history).by(B, {c: f});

        expect(E.prototype.a).toBe(B.prototype.a);
        expect(E.prototype.c.ORIGIN).toBe(B.prototype.c);
        expect(E.prototype.c.REPLACEMENT).toBe(f);
      });

      it('should stub props marked as Function', () => {
        const E = new unitsnap.Mock(history).by(B, {c: Function});

        expect(E.prototype.a).toBe(B.prototype.a);
        expect(E.prototype.c.ORIGIN).toBe(B.prototype.c);
        expect(E.prototype.c instanceof Function).toBeTruthy();
      });

      it('should stub props marked as primitive value', () => {
        const E = new unitsnap.Mock(history).by(B, {c: 123});

        expect(E.prototype.a).toBe(B.prototype.a);
        expect(E.prototype.c.ORIGIN).toBe(B.prototype.c);
        expect(E.prototype.c instanceof Function).toBeTruthy();
      });

      it('should set props marked as class prototype props', () => {
        const E = new unitsnap.Mock(history).by(B, {c: B});

        expect(E.prototype.a).toBe(B.prototype.a);
        expect(E.prototype.c.ORIGIN).toBe(B.prototype.c);
        expect(E.prototype.c  instanceof Function).toBeTruthy();
      });

      it('should stub absented props with spy', () => {
        const E = new unitsnap.Mock(history).by(B, {x: f});

        expect(E.prototype.x instanceof Function).toBeTruthy();
      });

      it('should override prop linked to fixture with spy', () => {
        const E = new unitsnap.Mock(history).by(B, {c: fixture});

        expect(E.prototype.a).toBe(B.prototype.a);
        expect(E.prototype.c.ORIGIN).toBe(B.prototype.c);
        expect(E.prototype.c.REPLACEMENT.original).toBe(fixture.pop);
      });

      it('should override prop linked to fixture of observer by Fixture ref with spy', () => {
        const E = new unitsnap.Mock(new unitsnap.History().link(observer)).by(B, {c: unitsnap.Fixture});

        expect(E.prototype.a).toBe(B.prototype.a);
        expect(E.prototype.c.ORIGIN).toBe(B.prototype.c);
        expect(E.prototype.c.REPLACEMENT.original).toBe(observer._fixture.pop);
      });

      it('should throw exception on prop linked to fixture of unlinked observer by Fixture ref', () => {
        const E = new unitsnap.Mock(history);

        expect(() => E.by(B, {c: unitsnap.Fixture})).toThrow();
      });
    });
  });

  describe('when uses mocked class (Mock.by)', () => {
    it('should spy on result of call', () => {
      history.begin('epoch', 'comment');

      const e = new (new unitsnap.Mock(history).by(B, ['constructor', 'a', 'x']))(1, 2, 3);

      for (let i = 0; i < 2; i ++) {
        try {
          e.a('call');
        } catch (e) {

        }
      }

      try {
        e.x();
      } catch (e) {

      }

      history.end();

      expect(history._entries).toEqual([{
        args: {'*': [2, 3], p: 1},
        callsCount: 1,
        comment: 'comment',
        context: e,
        epoch: 'epoch',
        //exception: void 0,
        //exceptionsCount: 0,
        //isAsync: false,
        //isAsyncPending: false,
        //isException: false,
        name: 'B',
        origin: history._entries[0].origin,
        replacement: history._entries[0].replacement,
        tags: void 0,
        time: history._entries[0].time,
        type: 'constructor',
      }, {
        callsCount: 1,
        comment: 'comment',
        context: e,
        epoch: 'epoch',
        exception: void 0,
        exceptionsCount: 0,
        isAsync: false,
        isAsyncPending: false,
        isException: false,
        name: 'B',
        origin: history._entries[1].origin,
        replacement: history._entries[1].replacement,
        result: void 0, // e
        tags: void 0,
        time: history._entries[1].time,
        type: 'constructor',
      }, {
        args: {'*': [], a: 'call'},
        callsCount: 1,
        comment: 'comment',
        context: e,
        epoch: 'epoch',
        //exception: void 0,
        //exceptionsCount: 0,
        //isAsync: false,
        //isAsyncPending: false,
        //isException: false,
        name: 'B.a',
        origin: history._entries[2].origin,
        replacement: history._entries[2].replacement,
        tags: void 0,
        time: history._entries[2].time,
        type: 'method',
      }, {
        callsCount: 1,
        comment: 'comment',
        context: e,
        epoch: 'epoch',
        exception: void 0,
        exceptionsCount: 0,
        isAsync: false,
        isAsyncPending: false,
        isException: false,
        name: 'B.a',
        origin: history._entries[3].origin,
        replacement: history._entries[3].replacement,
        result: 'call',
        tags: void 0,
        time: history._entries[3].time,
        type: 'method',
      }, {
        args: {'*': [], a: 'call'},
        callsCount: 2,
        comment: 'comment',
        context: e,
        epoch: 'epoch',
        //exception: void 0,
        //exceptionsCount: 0,
        //isAsync: false,
        //isAsyncPending: false,
        //isException: false,
        name: 'B.a',
        origin: history._entries[4].origin,
        replacement: history._entries[4].replacement,
        tags: void 0,
        time: history._entries[4].time,
        type: 'method',
      }, {
        callsCount: 2,
        comment: 'comment',
        context: e,
        epoch: 'epoch',
        exception: void 0,
        exceptionsCount: 0,
        isAsync: false,
        isAsyncPending: false,
        isException: false,
        name: 'B.a',
        origin: history._entries[5].origin,
        replacement: history._entries[5].replacement,
        result: 'call',
        tags: void 0,
        time: history._entries[5].time,
        type: 'method',
      }, {
        args: {'*': []},
        callsCount: 1,
        comment: 'comment',
        context: e,
        epoch: 'epoch',
        //exception: void 0,
        //exceptionsCount: 0,
        //isAsync: false,
        //isAsyncPending: false,
        //isException: false,
        name: 'B.x',
        origin: history._entries[6].origin,
        replacement: history._entries[6].replacement,
        tags: void 0,
        time: history._entries[6].time,
        type: 'method',
      }, {
        callsCount: 1,
        comment: 'comment',
        context: e,
        epoch: 'epoch',
        exception: void 0,
        exceptionsCount: 0,
        isAsync: false,
        isAsyncPending: false,
        isException: false,
        name: 'B.x',
        origin: history._entries[7].origin,
        replacement: history._entries[7].replacement,
        result: void 0,
        tags: void 0,
        time: history._entries[7].time,
        type: 'method',
      }]);
    });

    it('should spy on exception of call', () => {
      history.begin('epoch', 'comment');

      const e = new (new unitsnap.Mock(history).by(B, {constructor: Function, c: B, x: Function}))(1);

      for (let i = 0; i < 2; i ++) {
        try {
          e.c('call');
        } catch (e) {

        }
      }

      try {
        e.x();
      } catch (e) {

      }

      history.end();

      expect(history._entries).toEqual([{
        args: {'*': [], p: 1},
        callsCount: 1,
        comment: 'comment',
        context: e,
        epoch: 'epoch',
        //exception: history._entries[0].exception,
        //exceptionsCount: 0,
        //isAsync: false,
        //isAsyncPending: false,
        //isException: false,
        name: 'B',
        origin: history._entries[0].origin,
        replacement: history._entries[0].replacement,
        tags: void 0,
        time: history._entries[0].time,
        type: 'constructor',
      }, {
        callsCount: 1,
        comment: 'comment',
        context: e,
        epoch: 'epoch',
        exception: history._entries[1].exception,
        exceptionsCount: 0,
        isAsync: false,
        isAsyncPending: false,
        isException: false,
        name: 'B',
        origin: history._entries[1].origin,
        replacement: history._entries[1].replacement,
        result: void 0, // e
        tags: void 0,
        time: history._entries[1].time,
        type: 'constructor',
      }, {
        args: {'*': [], a: 'call'},
        callsCount: 1,
        comment: 'comment',
        context: e,
        epoch: 'epoch',
        //exception: history._entries[2].exception,
        //exceptionsCount: 0,
        //isAsync: false,
        //isAsyncPending: false,
        //isException: false,
        name: 'B.c',
        origin: history._entries[2].origin,
        replacement: history._entries[2].replacement,
        tags: void 0,
        time: history._entries[2].time,
        type: 'method',
      }, {
        callsCount: 1,
        comment: 'comment',
        context: e,
        epoch: 'epoch',
        exception: history._entries[3].exception,
        exceptionsCount: 1,
        isAsync: false,
        isAsyncPending: false,
        isException: true,
        name: 'B.c',
        origin: history._entries[3].origin,
        replacement: history._entries[3].replacement,
        result: void 0,
        tags: void 0,
        time: history._entries[3].time,
        type: 'method',
      }, {
        args: {'*': [], a: 'call'},
        callsCount: 2,
        comment: 'comment',
        context: e,
        epoch: 'epoch',
        //exception: history._entries[4].exception,
        //exceptionsCount: 1,
        //isAsync: false,
        //isAsyncPending: false,
        //isException: true,
        name: 'B.c',
        origin: history._entries[4].origin,
        replacement: history._entries[4].replacement,
        tags: void 0,
        time: history._entries[4].time,
        type: 'method',
      }, {
        callsCount: 2,
        comment: 'comment',
        context: e,
        epoch: 'epoch',
        exception: history._entries[5].exception,
        exceptionsCount: 2,
        isAsync: false,
        isAsyncPending: false,
        isException: true,
        name: 'B.c',
        origin: history._entries[5].origin,
        replacement: history._entries[5].replacement,
        result: void 0,
        tags: void 0,
        time: history._entries[5].time,
        type: 'method',
      }, {
        args: {'*': []},
        callsCount: 1,
        comment: 'comment',
        context: e,
        epoch: 'epoch',
        //exception: history._entries[6].exception,
        //exceptionsCount: 0,
        //isAsync: false,
        //isAsyncPending: false,
        //isException: false,
        name: 'B.x',
        origin: history._entries[6].origin,
        replacement: history._entries[6].replacement,
        tags: void 0,
        time: history._entries[6].time,
        type: 'method',
      }, {
        callsCount: 1,
        comment: 'comment',
        context: e,
        epoch: 'epoch',
        exception: history._entries[7].exception,
        exceptionsCount: 0,
        isAsync: false,
        isAsyncPending: false,
        isException: false,
        name: 'B.x',
        origin: history._entries[7].origin,
        replacement: history._entries[7].replacement,
        result: void 0,
        tags: void 0,
        time: history._entries[7].time,
        type: 'method',
      }]);
    });

    it('should return mocked primitive value', () => {
      const e = new (new unitsnap.Mock(history.begin()).by(B, {c: 123}))();

      expect(e.c()).toBe(123);
    });

    it('should include valid class.method name on absented constructor in class prototype', () => {
      const e = new (new unitsnap.Mock(history).by(D, ['a']));

      history.begin('epoch', 'comment');

      e.a('call');

      history.end();

      expect(history._entries[0].name).toBe('D.a');
    });

    it('should include valid class.method name on presented constructor in class prototype', () => {
      const e = new (new unitsnap.Mock(history).by(C, {'a': f}));

      history.begin('epoch', 'comment');

      e.a('call');

      history.end();

      expect(history._entries[0].name).toBe('C.a');
    });
  });

  describe('when builds mock by overridden class (Mock.override)', () => {
    it('should throw exception on bad argument', () => {
      const E = new unitsnap.Mock(history);

      expect(() => E.override(null)).toThrow();
    });

    it('should from mock', () => {
      const E = new unitsnap.Mock(history).override(A);

      expect(E).toBe(A);
    });

    it('should built mock be instance of original class', () => {
      const E = new unitsnap.Mock(history).override(A);

      expect(new E instanceof A);
    });

    it('should save original constructor in class prototype', () => {
      const E = new unitsnap.Mock(history).override(A, {'constructor': f});

      expect(E.prototype.constructor).toBe(A);
    });

    describe('when uses list of props', () => {
      it('should override all props with spy', () => {
        const E = new unitsnap.Mock(history).override(B);

        expect(E.prototype.a.ORIGIN).toBe(bPrototype.a);
        expect(E.prototype.b.ORIGIN).toBe(bPrototype.b);
        expect(E.prototype.c.ORIGIN).toBe(bPrototype.c);
      });

      it('should override props with spy', () => {
        const E = new unitsnap.Mock(history).override(B, ['c']);

        expect(E.prototype.a).toBe(B.prototype.a);
        expect(E.prototype.c.ORIGIN).toBe(bPrototype.c);
        expect(E.prototype.c.REPLACEMENT).toBe(bPrototype.c);
      });

      it('should stub absented props with spy', () => {
        const E = new unitsnap.Mock(history).override(B, ['x']);

        expect(E.prototype.x instanceof Function).toBeTruthy();
      });
    });

    describe('when uses dictionary of props (prop name: custom handler)', () => {
      it('should override props with spy', () => {
        const E = new unitsnap.Mock(history).override(B, {c: f});

        expect(E.prototype.a).toBe(B.prototype.a);
        expect(E.prototype.c.ORIGIN).toBe(bPrototype.c);
        expect(E.prototype.c.REPLACEMENT).toEqual(f);
      });

      it('should stub props marked as Function', () => {
        const E = new unitsnap.Mock(history).override(B, {c: Function});

        expect(E.prototype.a).toBe(B.prototype.a);
        expect(E.prototype.c.ORIGIN).toBe(bPrototype.c);
        expect(E.prototype.c instanceof Function).toBeTruthy();
      });

      it('should stub props marked as primitive value', () => {
        const E = new unitsnap.Mock(history).override(B, {c: 123});

        expect(E.prototype.a).toBe(bPrototype.a);
        expect(E.prototype.c.ORIGIN).toBe(bPrototype.c);
        expect(E.prototype.c instanceof Function).toBeTruthy();
      });

      it('should set props marked as class prototype props', () => {
        const E = new unitsnap.Mock(history).override(B, {c: B});

        expect(E.prototype.a).toBe(bPrototype.a);
        expect(E.prototype.c.ORIGIN).toBe(bPrototype.c);
        expect(E.prototype.c  instanceof Function).toBeTruthy();
      });

      it('should stub absented props with spy', () => {
        const E = new unitsnap.Mock(history).override(B, {x: f});

        expect(E.prototype.x instanceof Function).toBeTruthy();
      });

      it('should override prop linked to fixture with spy', () => {
        const E = new unitsnap.Mock(history).override(B, {c: fixture});

        expect(E.prototype.a).toBe(bPrototype.a);
        expect(E.prototype.c.ORIGIN).toBe(bPrototype.c);
        expect(E.prototype.c.REPLACEMENT.original).toBe(fixture.pop);
      });

      it('should override prop linked to fixture of observer by Fixture ref with spy', () => {
        const E = new unitsnap.Mock(new unitsnap.History().link(observer)).override(B, {c: unitsnap.Fixture});

        expect(E.prototype.a).toBe(bPrototype.a);
        expect(E.prototype.c.ORIGIN).toBe(bPrototype.c);
        expect(E.prototype.c.REPLACEMENT.original).toBe(observer._fixture.pop);
      });

      it('should throw exception on prop linked to fixture of unlinked observer by Fixture ref', () => {
        const E = new unitsnap.Mock(history);

        expect(() => E.override(B, {c: unitsnap.Fixture})).toThrow();
      });
    });
  });

  describe('when uses mocked class (Mock.override)', () => {
    it('should spy on result of call', () => {
      const e = new (new unitsnap.Mock(history).override(B, ['constructor', 'a', 'x']));

      history.begin('epoch', 'comment');

      for (let i = 0; i < 3; i ++) {
        try {
          e.a('call');
        } catch (e) {

        }
      }

      try {
        e.x();
      } catch (e) {

      }

      history.end();

      expect(history._entries).toEqual([{
        args: {'*': [], a: 'call'},
        callsCount: 1,
        comment: 'comment',
        context: e,
        epoch: 'epoch',
        //exception: void 0,
        //exceptionsCount: 0,
        //isAsync: false,
        //isAsyncPending: false,
        //isException: false,
        name: 'B.a',
        origin: history._entries[0].origin,
        replacement: history._entries[0].replacement,
        tags: void 0,
        time: history._entries[0].time,
        type: 'method',
      }, {
        callsCount: 1,
        comment: 'comment',
        context: e,
        epoch: 'epoch',
        exception: void 0,
        exceptionsCount: 0,
        isAsync: false,
        isAsyncPending: false,
        isException: false,
        name: 'B.a',
        origin: history._entries[1].origin,
        replacement: history._entries[1].replacement,
        result: 'call',
        tags: void 0,
        time: history._entries[1].time,
        type: 'method',
      }, {
        args: {'*': [], a: 'call'},
        callsCount: 2,
        comment: 'comment',
        context: e,
        epoch: 'epoch',
        //exception: void 0,
        //exceptionsCount: 0,
        //isAsync: false,
        //isAsyncPending: false,
        //isException: false,
        name: 'B.a',
        origin: history._entries[2].origin,
        replacement: history._entries[2].replacement,
        tags: void 0,
        time: history._entries[2].time,
        type: 'method',
      }, {
        callsCount: 2,
        comment: 'comment',
        context: e,
        epoch: 'epoch',
        exception: void 0,
        exceptionsCount: 0,
        isAsync: false,
        isAsyncPending: false,
        isException: false,
        name: 'B.a',
        origin: history._entries[3].origin,
        replacement: history._entries[3].replacement,
        result: 'call',
        tags: void 0,
        time: history._entries[3].time,
        type: 'method',
      }, {
        args: {'*': [], a: 'call'},
        callsCount: 3,
        comment: 'comment',
        context: e,
        epoch: 'epoch',
        //exception: void 0,
        //exceptionsCount: 0,
        //isAsync: false,
        //isAsyncPending: false,
        //isException: false,
        name: 'B.a',
        origin: history._entries[4].origin,
        replacement: history._entries[4].replacement,
        tags: void 0,
        time: history._entries[4].time,
        type: 'method',
      }, {
        callsCount: 3,
        comment: 'comment',
        context: e,
        epoch: 'epoch',
        exception: void 0,
        exceptionsCount: 0,
        isAsync: false,
        isAsyncPending: false,
        isException: false,
        name: 'B.a',
        origin: history._entries[5].origin,
        replacement: history._entries[5].replacement,
        result: 'call',
        tags: void 0,
        time: history._entries[5].time,
        type: 'method',
      }, {
        args: {'*': []},
        callsCount: 1,
        comment: 'comment',
        context: e,
        epoch: 'epoch',
        //exception: void 0,
        //exceptionsCount: 0,
        //isAsync: false,
        //isAsyncPending: false,
        //isException: false,
        name: 'B.x',
        origin: history._entries[6].origin,
        replacement: history._entries[6].replacement,
        tags: void 0,
        time: history._entries[6].time,
        type: 'method',
      }, {
        callsCount: 1,
        comment: 'comment',
        context: e,
        epoch: 'epoch',
        exception: void 0,
        exceptionsCount: 0,
        isAsync: false,
        isAsyncPending: false,
        isException: false,
        name: 'B.x',
        origin: history._entries[7].origin,
        replacement: history._entries[7].replacement,
        result: void 0,
        tags: void 0,
        time: history._entries[7].time,
        type: 'method',
      }]);
    });

    it('should spy on exception of call', () => {
      const e = new (new unitsnap.Mock(history).override(B, {constructor: Function, c: B, x: Function}));

      history.begin('epoch', 'comment');

      for (let i = 0; i < 3; i ++) {
        try {
          e.c('call');
        } catch (e) {

        }
      }

      try {
        e.x();
      } catch (e) {

      }

      history.end();

      expect(history._entries).toEqual([{
        args: {'*': [], a: 'call'},
        callsCount: 1,
        comment: 'comment',
        context: e,
        epoch: 'epoch',
        //exception: history._entries[0].exception,
        //exceptionsCount: 0,
        //isAsync: false,
        //isAsyncPending: false,
        //isException: false,
        name: 'B.c',
        origin: history._entries[0].origin,
        replacement: history._entries[0].replacement,
        tags: void 0,
        time: history._entries[0].time,
        type: 'method',
      }, {
        callsCount: 1,
        comment: 'comment',
        context: e,
        epoch: 'epoch',
        exception: history._entries[1].exception,
        exceptionsCount: 1,
        isAsync: false,
        isAsyncPending: false,
        isException: true,
        name: 'B.c',
        origin: history._entries[1].origin,
        replacement: history._entries[1].replacement,
        result: void 0,
        tags: void 0,
        time: history._entries[1].time,
        type: 'method',
      }, {
        args: {'*': [], a: 'call'},
        callsCount: 2,
        comment: 'comment',
        context: e,
        epoch: 'epoch',
        //exception: history._entries[2].exception,
        //exceptionsCount: 1,
        //isAsync: false,
        //isAsyncPending: false,
        //isException: true,
        name: 'B.c',
        origin: history._entries[2].origin,
        replacement: history._entries[2].replacement,
        tags: void 0,
        time: history._entries[2].time,
        type: 'method',
      }, {
        callsCount: 2,
        comment: 'comment',
        context: e,
        epoch: 'epoch',
        exception: history._entries[3].exception,
        exceptionsCount: 2,
        isAsync: false,
        isAsyncPending: false,
        isException: true,
        name: 'B.c',
        origin: history._entries[3].origin,
        replacement: history._entries[3].replacement,
        result: void 0,
        tags: void 0,
        time: history._entries[3].time,
        type: 'method',
      }, {
        args: {'*': [], a: 'call'},
        callsCount: 3,
        comment: 'comment',
        context: e,
        epoch: 'epoch',
        //exception: history._entries[4].exception,
        //exceptionsCount: 2,
        //isAsync: false,
        //isAsyncPending: false,
        //isException: true,
        name: 'B.c',
        origin: history._entries[4].origin,
        replacement: history._entries[4].replacement,
        tags: void 0,
        time: history._entries[4].time,
        type: 'method',
      }, {
        callsCount: 3,
        comment: 'comment',
        context: e,
        epoch: 'epoch',
        exception: history._entries[5].exception,
        exceptionsCount: 3,
        isAsync: false,
        isAsyncPending: false,
        isException: true,
        name: 'B.c',
        origin: history._entries[5].origin,
        replacement: history._entries[5].replacement,
        result: void 0,
        tags: void 0,
        time: history._entries[5].time,
        type: 'method',
      }, {
        args: {'*': []},
        callsCount: 1,
        comment: 'comment',
        context: e,
        epoch: 'epoch',
        //exception: history._entries[6].exception,
        //exceptionsCount: 0,
        //isAsync: false,
        //isAsyncPending: false,
        //isException: false,
        name: 'B.x',
        origin: history._entries[6].origin,
        replacement: history._entries[6].replacement,
        tags: void 0,
        time: history._entries[6].time,
        type: 'method',
      }, {
        callsCount: 1,
        comment: 'comment',
        context: e,
        epoch: 'epoch',
        exception: history._entries[7].exception,
        exceptionsCount: 0,
        isAsync: false,
        isAsyncPending: false,
        isException: false,
        name: 'B.x',
        origin: history._entries[7].origin,
        replacement: history._entries[7].replacement,
        result: void 0,
        tags: void 0,
        time: history._entries[7].time,
        type: 'method',
      }]);
    });

    it('should return mocked primitive value', () => {
      const E = new unitsnap.Mock(history.begin()).override(B, {c: 123});

      expect((new E).c()).toBe(123);
    });

    it('should RESTORE overridden props by list of props', () => {
      const E = new unitsnap.Mock(history).override(B, ['a', 'b', 'x']).RESTORE();

      expect(E.prototype.a).toBe(bPrototype.a);
      expect(E.prototype.b).toBe(bPrototype.b);
      expect(E.prototype.x).toBeUndefined();
    });

    it('should RESTORE overridden props by dictionary of props', () => {
      const E = new unitsnap.Mock(history).override(B, {a: B, b: B, x: f}).RESTORE();

      expect(E.prototype.a).toBe(bPrototype.a);
      expect(E.prototype.b).toBe(bPrototype.b);
      expect(E.prototype.x).toBeUndefined();
    });

    it('should include valid "class.method" name on absented constructor in class prototype', () => {
      const e = new (new unitsnap.Mock(history).override(D, ['a']));

      history.begin('epoch', 'comment');

      e.a('call');

      history.end();

      expect(history._entries[0].name).toBe('D.a');
    });

    it('should include valid "class.method" name on presented constructor in class prototype', () => {
      const e = new (new unitsnap.Mock(history).override(C, {'a': f}));

      history.begin('epoch', 'comment');

      e.a('call');

      history.end();

      expect(history._entries[0].name).toBe('C.a');
    });
  });

  it('should from mock creating stubs on absented selected props as list', () => {
    const E = new unitsnap.Mock(history).from(['d', 'e', 'f']);

    expect(new E().d instanceof Function).toBeTruthy();
    expect(new E().e instanceof Function).toBeTruthy();
    expect(new E().f instanceof Function).toBeTruthy();
  });

  it('should from mock creating stubs on absented selected props as dictionary', () => {
    const E = new unitsnap.Mock(history).from({d: f, e: f, f: f});

    expect(new E().d instanceof Function).toBeTruthy();
    expect(new E().e instanceof Function).toBeTruthy();
    expect(new E().f instanceof Function).toBeTruthy();
  });

  it('should spy on single callable result', () => {
    const x = new unitsnap.Mock(history).spy(function x(a) { return a * 2; });

    history.begin('epoch', 'comment');

    x(5);

    history.end();

    expect(history._entries).toEqual([{
      args: {'*': [], a: 5},
      callsCount: 1,
      comment: 'comment',
      context: global,
      epoch: 'epoch',
      //exception: void 0,
      //exceptionsCount: 0,
      //isAsync: false,
      //isAsyncPending: false,
      //isException: false,
      name: 'x',
      origin: history._entries[0].origin,
      replacement: history._entries[0].replacement,
      tags: void 0,
      time: history._entries[0].time,
      type: 'single',
    }, {
      callsCount: 1,
      comment: 'comment',
      context: global,
      epoch: 'epoch',
      exception: void 0,
      exceptionsCount: 0,
      isAsync: false,
      isAsyncPending: false,
      isException: false,
      name: 'x',
      origin: history._entries[1].origin,
      replacement: history._entries[1].replacement,
      result: 10,
      tags: void 0,
      time: history._entries[1].time,
      type: 'single',
    }]);
  });

  it('should spy on single callable exception', () => {
    const x = new unitsnap.Mock(history).spy(function x(a) { throw 1; });

    history.begin('epoch', 'comment');

    try { x(5); } catch (e) {}

    history.end();

    expect(history._entries).toEqual([{
      args: {'*': [], a: 5},
      callsCount: 1,
      comment: 'comment',
      context: global,
      epoch: 'epoch',
      //exception: void 0,
      //exceptionsCount: 0,
      //isAsync: false,
      //isAsyncPending: false,
      //isException: false,
      name: 'x',
      origin: history._entries[0].origin,
      replacement: history._entries[0].replacement,
      tags: void 0,
      time: history._entries[0].time,
      type: 'single',
    }, {
      callsCount: 1,
      comment: 'comment',
      context: global,
      epoch: 'epoch',
      exception: 1,
      exceptionsCount: 1,
      isAsync: false,
      isAsyncPending: false,
      isException: true,
      name: 'x',
      origin: history._entries[1].origin,
      replacement: history._entries[1].replacement,
      result: void 0,
      tags: void 0,
      time: history._entries[1].time,
      type: 'single',
    }]);
  });

  it('should spy on single async callable result', (done) => {
    history.begin('epoch', 'comment');

    const x = new unitsnap.Mock(history).spy(function x(a) { return Promise.resolve(1); });

    const promise = x(5);

    expect(history._entries).toEqual([{
      args: {'*': [], a: 5},
      callsCount: 1,
      comment: 'comment',
      context: global,
      epoch: 'epoch',
      //exception: void 0,
      //exceptionsCount: 0,
      //isAsync: false,
      //isAsyncPending: false,
      //isException: false,
      name: 'x',
      origin: history._entries[0].origin,
      replacement: history._entries[0].replacement,
      tags: void 0,
      time: history._entries[0].time,
      type: 'single',
    }, {
      callsCount: 1,
      comment: 'comment',
      context: global,
      epoch: 'epoch',
      exception: void 0,
      exceptionsCount: 0,
      isAsync: true,
      isAsyncPending: true,
      isException: false,
      name: 'x',
      origin: history._entries[1].origin,
      replacement: history._entries[1].replacement,
      result: history._entries[1].result,
      tags: void 0,
      time: history._entries[1].time,
      type: 'single',
    }]);

    promise.then(() => {
      expect(history._entries[2]).toEqual({
        callsCount: 1,
        comment: 'comment',
        context: global,
        epoch: 'epoch',
        exception: void 0,
        exceptionsCount: 0,
        isAsync: true,
        isAsyncPending: false,
        isException: false,
        name: 'x',
        origin: history._entries[2].origin,
        replacement: history._entries[2].replacement,
        result: 1,
        tags: void 0,
        time: history._entries[2].time,
        type: 'single',
      });

      history.end();

      done();
    });
  });

  it('should spy on single async callable exception', (done) => {
    history.begin('epoch', 'comment');

    const x = new unitsnap.Mock(history).spy(function x(a) { return Promise.reject(1); });

    const promise = x(5);

    expect(history._entries).toEqual([{
      args: {'*': [], a: 5},
      callsCount: 1,
      comment: 'comment',
      context: global,
      epoch: 'epoch',
      //exception: void 0,
      //exceptionsCount: 0,
      //isAsync: false,
      //isAsyncPending: false,
      //isException: false,
      name: 'x',
      origin: history._entries[0].origin,
      replacement: history._entries[0].replacement,
      tags: void 0,
      time: history._entries[0].time,
      type: 'single',
    }, {
      callsCount: 1,
      comment: 'comment',
      context: global,
      epoch: 'epoch',
      exception: void 0,
      exceptionsCount: 0,
      isAsync: true,
      isAsyncPending: true,
      isException: false,
      name: 'x',
      origin: history._entries[1].origin,
      replacement: history._entries[1].replacement,
      result: history._entries[1].result,
      tags: void 0,
      time: history._entries[1].time,
      type: 'single',
    }]);

    promise.catch(() => {
      expect(history._entries[2]).toEqual({
        callsCount: 1,
        comment: 'comment',
        context: global,
        epoch: 'epoch',
        exception: 1,
        exceptionsCount: 0,
        isAsync: true,
        isAsyncPending: false,
        isException: true,
        name: 'x',
        origin: history._entries[2].origin,
        replacement: history._entries[2].replacement,
        result: void 0,
        tags: void 0,
        time: history._entries[2].time,
        type: 'single',
      });

      history.end();

      done();
    });
  });
});
