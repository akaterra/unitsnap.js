const unitsnap = require('..');
const mock = require('../src/mock');

describe('Mock', () => {
  const f = _ => _;
  const fixture = new unitsnap.Fixture();
  const history = new unitsnap.History();
  const observer = new unitsnap.Observer();

  class A {
    constructor(p) {

    }

    m() {

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

    get d() {
      return 1;
    }

    set d(value) {

    }

    get e() {
      return 1;
    }

    set e(value) {

    }

    get f() {
      return 1;
    }

    set f(value) {

    }

    static a() {

    }

    static b() {

    }

    static c() {

    }

    static get d() {
      return 1;
    }

    static set d(value) {

    }

    static get e() {
      return 1;
    }

    static set e(value) {

    }

    static get f() {
      return 1;
    }

    static set f(value) {

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

  const bProperties = Object.getOwnPropertyNames(B).reduce((acc, key) => {
    acc[key] = B[key];

    return acc;
  }, {});

  const bPropertiesDescriptors = Object.getOwnPropertyNames(B).reduce((acc, key) => {
    acc[key] = Object.getOwnPropertyDescriptor(B, key);

    return acc;
  }, {});

  const bPrototype = Object.getOwnPropertyNames(B.prototype).reduce((acc, key) => {
    acc[key] = B.prototype[key];

    return acc;
  }, {});

  const bPrototypeDescriptors = Object.getOwnPropertyNames(B.prototype).reduce((acc, key) => {
    acc[key] = Object.getOwnPropertyDescriptor(B.prototype, key);

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
    const e = new mock.Mock(history);

    expect(e._history).toBe(history);
  });

  describe('when builds mock by class (Mock.from)', () => {
    it('should builds mock', () => {
      const E = new mock.Mock(history).from({c: f});

      expect(E.prototype.c.REPLACEMENT).toBe(f);
    });
  });

  describe('when uses mocked class (Mock.from)', () => {
    it('should mock be constructed', () => {
      const E = new mock.Mock(history).from({c: f});

      expect(new E instanceof E).toBeTruthy();
    });
  });

  describe('when builds mock by class (Mock.by)', () => {
    it('should throw exception on bad argument', () => {
      const E = new mock.Mock(history);

      expect(() => E.by(null)).toThrow();
    });

    it('should from mock', () => {
      const E = new mock.Mock(history).by(A);

      expect(E).not.toBe(A);
    });

    it('should built mock be instance of original class', () => {
      const E = new mock.Mock(history.begin()).by(A);

      expect(new E instanceof A);
    });

    it('should save original constructor in class prototype', () => {
      const E = new mock.Mock(history).by(A, ['constructor']);

      expect(E.prototype.constructor).toBe(A);
    });

    describe('when uses list of props', () => {
      it('should override all props with spy', () => {
        const E = new mock.Mock(history).by(B);

        expect(E.prototype.a.ORIGIN).toBe(B.prototype.a);
        expect(E.prototype.b.ORIGIN).toBe(B.prototype.b);
        expect(E.prototype.c.ORIGIN).toBe(B.prototype.c);
      });

      it('should override constructor with spy', () => {
        const E = new mock.Mock(history).by(B, ['constructor']);

        expect(E.prototype.a).toBe(B.prototype.a);
        expect(E.ORIGIN).toBe(B);
        expect(E.REPLACEMENT instanceof Function).toBeTruthy();
      });

      it('should override props with spy', () => {
        const E = new mock.Mock(history).by(B, ['c']);

        expect(E.prototype.a).toBe(B.prototype.a);
        expect(E.prototype.c.ORIGIN).toBe(B.prototype.c);
        expect(E.prototype.c.REPLACEMENT).toBe(B.prototype.c);
      });

      it('should stub absented props with spy', () => {
        const E = new mock.Mock(history).by(B, ['x']);

        expect(E.prototype.x instanceof Function).toBeTruthy();
      });

      it('should stub constructor', () => {
        const E = new mock.Mock(history).by(B, ['constructor']);

        expect(E.ORIGIN).toBe(B);
      });
    });

    describe('when uses dictionary of props (prop name: custom handler)', () => {
      it('should override constructor with spy', () => {
        const E = new mock.Mock(history).by(B, {constructor: f});

        expect(E.prototype.a).toBe(B.prototype.a);
        expect(E.ORIGIN).toBe(B);
        expect(E.REPLACEMENT).toBe(f);
      });

      it('should override methods with spy', () => {
        const E = new mock.Mock(history).by(B, {c: f});

        expect(E.prototype.a).toBe(B.prototype.a);
        expect(E.prototype.c.ORIGIN).toBe(B.prototype.c);
        expect(E.prototype.c.REPLACEMENT).toBe(f);
      });

      it('should override methods of parent class with spy', () => {
        const E = new mock.Mock(history).by(B, {m: f});

        expect(E.prototype.a).toBe(B.prototype.a);
        expect(E.prototype.m.ORIGIN).toBe(A.prototype.m);
        expect(E.prototype.m.REPLACEMENT).toBe(f);
      });

      it('should override static methods with spy', () => {
        const E = new mock.Mock(history).by(B, {c: mock.StaticMethod(f)});

        expect(E.a).toBe(B.a);
        expect(E.c.ORIGIN).toBe(B.c);
        expect(E.c.REPLACEMENT).toBe(f);
      });

      it('should override properties with spy on single getter', () => {
        const E = new mock.Mock(history).by(B, {d: mock.Property().get(f)});

        expect(E.prototype.a).toBe(B.prototype.a);
        expect(Object.getOwnPropertyDescriptor(E.prototype, 'd').get.ORIGIN).toBe(Object.getOwnPropertyDescriptor(B.prototype, 'd').get);
        expect(Object.getOwnPropertyDescriptor(E.prototype, 'd').get.REPLACEMENT).toBe(f);
      });

      it('should override properties with spy on single setter', () => {
        const E = new mock.Mock(history).by(B, {d: mock.Property().set(f)});

        expect(E.prototype.a).toBe(B.prototype.a);
        expect(Object.getOwnPropertyDescriptor(E.prototype, 'd').set.ORIGIN).toBe(Object.getOwnPropertyDescriptor(B.prototype, 'd').set);
        expect(Object.getOwnPropertyDescriptor(E.prototype, 'd').set.REPLACEMENT).toBe(f);
      });

      it('should override properties with spy on getter of getter/setter pair', () => {
        const E = new mock.Mock(history).by(B, {d: mock.Property().get(f).set(f)});

        expect(E.prototype.a).toBe(B.prototype.a);
        expect(Object.getOwnPropertyDescriptor(E.prototype, 'd').get.ORIGIN).toBe(Object.getOwnPropertyDescriptor(B.prototype, 'd').get);
        expect(Object.getOwnPropertyDescriptor(E.prototype, 'd').get.REPLACEMENT).toBe(f);
      });

      it('should override properties with spy on setter of getter/setter pair', () => {
        const E = new mock.Mock(history).by(B, {d: mock.Property().get(f).set(f)});

        expect(E.prototype.a).toBe(B.prototype.a);
        expect(Object.getOwnPropertyDescriptor(E.prototype, 'd').set.ORIGIN).toBe(Object.getOwnPropertyDescriptor(B.prototype, 'd').set);
        expect(Object.getOwnPropertyDescriptor(E.prototype, 'd').set.REPLACEMENT).toBe(f);
      });

      it('should override static properties with spy on single getter', () => {
        const E = new mock.Mock(history).by(B, {d: mock.StaticProperty().get(f)});

        expect(E.a).toBe(B.a);
        expect(Object.getOwnPropertyDescriptor(E, 'd').get.ORIGIN).toBe(Object.getOwnPropertyDescriptor(B, 'd').get);
        expect(Object.getOwnPropertyDescriptor(E, 'd').get.REPLACEMENT).toBe(f);
      });

      it('should override static properties with spy on single setter', () => {
        const E = new mock.Mock(history).by(B, {d: mock.StaticProperty().set(f)});

        expect(E.a).toBe(B.a);
        expect(Object.getOwnPropertyDescriptor(E, 'd').set.ORIGIN).toBe(Object.getOwnPropertyDescriptor(B, 'd').set);
        expect(Object.getOwnPropertyDescriptor(E, 'd').set.REPLACEMENT).toBe(f);
      });

      it('should override static properties with spy on getter of getter/setter pair', () => {
        const E = new mock.Mock(history).by(B, {d: mock.StaticProperty().get(f).set(f)});

        expect(E.a).toBe(B.a);
        expect(Object.getOwnPropertyDescriptor(E, 'd').get.ORIGIN).toBe(Object.getOwnPropertyDescriptor(B, 'd').get);
        expect(Object.getOwnPropertyDescriptor(E, 'd').get.REPLACEMENT).toBe(f);
      });

      it('should override static properties with spy on setter of getter/setter pair', () => {
        const E = new mock.Mock(history).by(B, {d: mock.StaticProperty().get(f).set(f)});

        expect(E.a).toBe(B.a);
        expect(Object.getOwnPropertyDescriptor(E, 'd').set.ORIGIN).toBe(Object.getOwnPropertyDescriptor(B, 'd').set);
        expect(Object.getOwnPropertyDescriptor(E, 'd').set.REPLACEMENT).toBe(f);
      });

      it('should stub methods marked as Function', () => {
        const E = new mock.Mock(history).by(B, {c: Function});

        expect(E.prototype.a).toBe(B.prototype.a);
        expect(E.prototype.c.ORIGIN).toBe(B.prototype.c);
        expect(E.prototype.c instanceof Function).toBeTruthy();
      });

      it('should stub static methods marked as Function', () => {
        const E = new mock.Mock(history).by(B, {c: mock.StaticMethod(Function)});

        expect(E.a).toBe(B.a);
        expect(E.c.ORIGIN).toBe(B.c);
        expect(E.c instanceof Function).toBeTruthy();
      });

      it('should stub methods marked as primitive value', () => {
        const E = new mock.Mock(history).by(B, {c: 123});

        expect(E.prototype.a).toBe(B.prototype.a);
        expect(E.prototype.c.ORIGIN).toBe(B.prototype.c);
        expect(E.prototype.c instanceof Function).toBeTruthy();
      });

      it('should stub static methods marked as primitive value', () => {
        const E = new mock.Mock(history).by(B, {c: mock.StaticMethod(123)});

        expect(E.a).toBe(B.a);
        expect(E.c.ORIGIN).toBe(B.c);
        expect(E.c instanceof Function).toBeTruthy();
      });

      it('should set methods marked as class prototype methods', () => {
        const E = new mock.Mock(history).by(B, {c: B});

        expect(E.prototype.a).toBe(B.prototype.a);
        expect(E.prototype.c.ORIGIN).toBe(B.prototype.c);
        expect(E.prototype.c  instanceof Function).toBeTruthy();
      });

      it('should set static methods marked as initial static methods', () => {
        const E = new mock.Mock(history).by(B, {c: mock.StaticMethod(B)});

        expect(E.a).toBe(B.a);
        expect(E.c.ORIGIN).toBe(B.c);
        expect(E.c instanceof Function).toBeTruthy();
      });

      it('should stub absented methods with spy', () => {
        const E = new mock.Mock(history).by(B, {x: f});

        expect(E.prototype.x instanceof Function).toBeTruthy();
      });

      it('should stub absented static methods with spy', () => {
        const E = new mock.Mock(history).by(B, {x: mock.StaticMethod(f)});

        expect(E.x instanceof Function).toBeTruthy();
      });

      it('should override methods linked to fixture with spy', () => {
        const E = new mock.Mock(history).by(B, {c: fixture});

        expect(E.prototype.a).toBe(B.prototype.a);
        expect(E.prototype.c.ORIGIN).toBe(B.prototype.c);
        expect(E.prototype.c.REPLACEMENT.original).toBe(fixture.pop);
      });

      it('should override static methods linked to fixture with spy', () => {
        const E = new mock.Mock(history).by(B, {c: mock.StaticMethod(fixture)});

        expect(E.a).toBe(B.a);
        expect(E.c.ORIGIN).toBe(B.c);
        expect(E.c.REPLACEMENT.original).toBe(fixture.pop);
      });

      it('should override methods linked to fixture of observer by Fixture ref with spy', () => {
        const E = new mock.Mock(new unitsnap.History().link(observer)).by(B, {c: unitsnap.Fixture});

        expect(E.prototype.a).toBe(B.prototype.a);
        expect(E.prototype.c.ORIGIN).toBe(B.prototype.c);
        expect(E.prototype.c.REPLACEMENT.original).toBe(observer._fixture.pop);
      });

      it('should override static methods linked to fixture of observer by Fixture ref with spy', () => {
        const E = new mock.Mock(new unitsnap.History().link(observer)).by(B, {c: mock.StaticMethod(unitsnap.Fixture)});

        expect(E.a).toBe(B.a);
        expect(E.c.ORIGIN).toBe(B.c);
        expect(E.c.REPLACEMENT.original).toBe(observer._fixture.pop);
      });

      it('should throw exception on methods linked to fixture of unlinked observer by Fixture ref', () => {
        const E = new mock.Mock(history);

        expect(() => E.by(B, {c: unitsnap.Fixture})).toThrow();
      });
    });
  });

  describe('when uses mocked class (Mock.by)', () => {
    it('should spy on result of call', () => {
      history.begin('epoch', 'comment');

      const e = new (new mock.Mock(history).by(B, ['constructor', 'a', 'x']))(1, 2, 3);

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

      const E = new mock.Mock(history).by(B, {
        constructor: Function,
        a: mock.StaticMethod(Function),
        c: B,
        d: mock.Property().get(1).set(Function),
        e: mock.StaticProperty().get(1).set(Function),
        x: Function,
        y: mock.Property().get(1).set(Function),
        z: mock.StaticProperty().get(1).set(Function),
      });

      const e = new E(1);

      for (let i = 0; i < 2; i ++) {
        try {
          e.c('call');
        } catch (e) {

        }
      }

      try {
        e.x();
        E.a();
        e.d;
        e.d = 1;
        E.e;
        E.e = 1;
        e.y;
        e.y = 1;
        E.z;
        E.z = 1;
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
      }, {
        args: {'*': []},
        callsCount: 1,
        comment: 'comment',
        context: history._entries[8].context,
        epoch: 'epoch',
        //exception: history._entries[6].exception,
        //exceptionsCount: 0,
        //isAsync: false,
        //isAsyncPending: false,
        //isException: false,
        name: 'B.a',
        origin: history._entries[8].origin,
        replacement: history._entries[8].replacement,
        tags: void 0,
        time: history._entries[8].time,
        type: 'staticMethod',
      }, {
        callsCount: 1,
        comment: 'comment',
        context: history._entries[9].context,
        epoch: 'epoch',
        exception: history._entries[9].exception,
        exceptionsCount: 0,
        isAsync: false,
        isAsyncPending: false,
        isException: false,
        name: 'B.a',
        origin: history._entries[9].origin,
        replacement: history._entries[9].replacement,
        result: void 0,
        tags: void 0,
        time: history._entries[9].time,
        type: 'staticMethod',
      }, {
        args: {'*': []},
        callsCount: 1,
        comment: 'comment',
        context: history._entries[10].context,
        epoch: 'epoch',
        //exception: history._entries[6].exception,
        //exceptionsCount: 0,
        //isAsync: false,
        //isAsyncPending: false,
        //isException: false,
        name: 'B.d',
        origin: history._entries[10].origin,
        replacement: history._entries[10].replacement,
        tags: void 0,
        time: history._entries[10].time,
        type: 'getter',
      }, {
        callsCount: 1,
        comment: 'comment',
        context: history._entries[11].context,
        epoch: 'epoch',
        exception: history._entries[11].exception,
        exceptionsCount: 0,
        isAsync: false,
        isAsyncPending: false,
        isException: false,
        name: 'B.d',
        origin: history._entries[11].origin,
        replacement: history._entries[11].replacement,
        result: 1,
        tags: void 0,
        time: history._entries[11].time,
        type: 'getter',
      }, {
        args: {'*': [], value: 1},
        callsCount: 1,
        comment: 'comment',
        context: history._entries[12].context,
        epoch: 'epoch',
        //exception: history._entries[6].exception,
        //exceptionsCount: 0,
        //isAsync: false,
        //isAsyncPending: false,
        //isException: false,
        name: 'B.d',
        origin: history._entries[12].origin,
        replacement: history._entries[12].replacement,
        tags: void 0,
        time: history._entries[12].time,
        type: 'setter',
      }, {
        callsCount: 1,
        comment: 'comment',
        context: history._entries[13].context,
        epoch: 'epoch',
        exception: history._entries[13].exception,
        exceptionsCount: 0,
        isAsync: false,
        isAsyncPending: false,
        isException: false,
        name: 'B.d',
        origin: history._entries[13].origin,
        replacement: history._entries[13].replacement,
        result: void 0,
        tags: void 0,
        time: history._entries[13].time,
        type: 'setter',
      }, {
        args: {'*': []},
        callsCount: 1,
        comment: 'comment',
        context: history._entries[14].context,
        epoch: 'epoch',
        //exception: history._entries[6].exception,
        //exceptionsCount: 0,
        //isAsync: false,
        //isAsyncPending: false,
        //isException: false,
        name: 'B.e',
        origin: history._entries[14].origin,
        replacement: history._entries[14].replacement,
        tags: void 0,
        time: history._entries[14].time,
        type: 'staticGetter',
      }, {
        callsCount: 1,
        comment: 'comment',
        context: history._entries[15].context,
        epoch: 'epoch',
        exception: history._entries[15].exception,
        exceptionsCount: 0,
        isAsync: false,
        isAsyncPending: false,
        isException: false,
        name: 'B.e',
        origin: history._entries[15].origin,
        replacement: history._entries[15].replacement,
        result: 1,
        tags: void 0,
        time: history._entries[15].time,
        type: 'staticGetter',
      }, {
        args: {'*': [], value: 1},
        callsCount: 1,
        comment: 'comment',
        context: history._entries[16].context,
        epoch: 'epoch',
        //exception: history._entries[6].exception,
        //exceptionsCount: 0,
        //isAsync: false,
        //isAsyncPending: false,
        //isException: false,
        name: 'B.e',
        origin: history._entries[16].origin,
        replacement: history._entries[16].replacement,
        tags: void 0,
        time: history._entries[16].time,
        type: 'staticSetter',
      }, {
        callsCount: 1,
        comment: 'comment',
        context: history._entries[17].context,
        epoch: 'epoch',
        exception: history._entries[17].exception,
        exceptionsCount: 0,
        isAsync: false,
        isAsyncPending: false,
        isException: false,
        name: 'B.e',
        origin: history._entries[17].origin,
        replacement: history._entries[17].replacement,
        result: void 0,
        tags: void 0,
        time: history._entries[17].time,
        type: 'staticSetter',
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
        name: 'B.y',
        origin: history._entries[18].origin,
        replacement: 1,
        tags: void 0,
        time: history._entries[18].time,
        type: 'getter',
      }, {
        callsCount: 1,
        comment: 'comment',
        context: e,
        epoch: 'epoch',
        exception: history._entries[19].exception,
        exceptionsCount: 0,
        isAsync: false,
        isAsyncPending: false,
        isException: false,
        name: 'B.y',
        origin: history._entries[19].origin,
        replacement: history._entries[19].replacement,
        result: 1,
        tags: void 0,
        time: history._entries[19].time,
        type: 'getter',
      }, {
        args: {'*': [1]},
        callsCount: 1,
        comment: 'comment',
        context: e,
        epoch: 'epoch',
        //exception: history._entries[6].exception,
        //exceptionsCount: 0,
        //isAsync: false,
        //isAsyncPending: false,
        //isException: false,
        name: 'B.y',
        origin: history._entries[20].origin,
        replacement: history._entries[20].replacement,
        tags: void 0,
        time: history._entries[20].time,
        type: 'setter',
      }, {
        callsCount: 1,
        comment: 'comment',
        context: e,
        epoch: 'epoch',
        exception: history._entries[21].exception,
        exceptionsCount: 0,
        isAsync: false,
        isAsyncPending: false,
        isException: false,
        name: 'B.y',
        origin: history._entries[21].origin,
        replacement: history._entries[21].replacement,
        result: void 0,
        tags: void 0,
        time: history._entries[21].time,
        type: 'setter',
      }, {
        args: {'*': []},
        callsCount: 1,
        comment: 'comment',
        context: E,
        epoch: 'epoch',
        //exception: history._entries[6].exception,
        //exceptionsCount: 0,
        //isAsync: false,
        //isAsyncPending: false,
        //isException: false,
        name: 'B.z',
        origin: history._entries[22].origin,
        replacement: 1,
        tags: void 0,
        time: history._entries[22].time,
        type: 'staticGetter',
      }, {
        callsCount: 1,
        comment: 'comment',
        context: E,
        epoch: 'epoch',
        exception: history._entries[23].exception,
        exceptionsCount: 0,
        isAsync: false,
        isAsyncPending: false,
        isException: false,
        name: 'B.z',
        origin: history._entries[23].origin,
        replacement: history._entries[23].replacement,
        result: 1,
        tags: void 0,
        time: history._entries[23].time,
        type: 'staticGetter',
      }, {
        args: {'*': [1]},
        callsCount: 1,
        comment: 'comment',
        context: E,
        epoch: 'epoch',
        //exception: history._entries[6].exception,
        //exceptionsCount: 0,
        //isAsync: false,
        //isAsyncPending: false,
        //isException: false,
        name: 'B.z',
        origin: history._entries[24].origin,
        replacement: history._entries[24].replacement,
        tags: void 0,
        time: history._entries[24].time,
        type: 'staticSetter',
      }, {
        callsCount: 1,
        comment: 'comment',
        context: E,
        epoch: 'epoch',
        exception: history._entries[25].exception,
        exceptionsCount: 0,
        isAsync: false,
        isAsyncPending: false,
        isException: false,
        name: 'B.z',
        origin: history._entries[25].origin,
        replacement: history._entries[25].replacement,
        result: void 0,
        tags: void 0,
        time: history._entries[25].time,
        type: 'staticSetter',
      }]);
    });

    it('should spy with custom args annotation', () => {
      history.begin('epoch', 'comment');

      const custom = mock.Custom(function (a, b, c) { return 0; }).argsAnnotation(['x', 'y', 'z']);

      const E = new mock.Mock(history).by(B, {
        constructor: custom,
        a: mock.StaticMethod(custom),
        c: custom,
        d: mock.Property().get(custom).set(custom),
        e: mock.StaticProperty().get(custom).set(custom),
        x: custom,
        y: mock.Property().get(custom).set(custom),
        z: mock.StaticProperty().get(custom).set(custom),
      });

      const e = new E(1, 2, 3);

      try {
        e.c(1, 2, 3);
        e.x(1, 2, 3);
        E.a(1, 2, 3);
        e.d;
        e.d = 1;
        E.e;
        E.e = 1;
        e.y;
        e.y = 1;
        E.z;
        E.z = 1;
      } catch (e) {

      }

      history.end();

      expect(history._entries[0].args).toEqual({'*': [], x: 1, y: 2, z: 3});
      expect(history._entries[2].args).toEqual({'*': [], x: 1, y: 2, z: 3});
      expect(history._entries[4].args).toEqual({'*': [], x: 1, y: 2, z: 3});
      expect(history._entries[6].args).toEqual({'*': [], x: 1, y: 2, z: 3});
      expect(history._entries[8].args).toEqual({'*': []});
      expect(history._entries[10].args).toEqual({'*': [], x: 1});
      expect(history._entries[12].args).toEqual({'*': []});
      expect(history._entries[14].args).toEqual({'*': [], x: 1});
      expect(history._entries[16].args).toEqual({'*': []});
      expect(history._entries[18].args).toEqual({'*': [], x: 1});
      expect(history._entries[20].args).toEqual({'*': []});
      expect(history._entries[22].args).toEqual({'*': [], x: 1});
    });

    it('should spy with custom exclude from history', () => {
      history.begin('epoch', 'comment');

      const custom = mock.Custom(function (a, b, c) { return 0; }).exclude();

      const E = new mock.Mock(history).by(B, {
        constructor: custom,
        a: mock.StaticMethod(custom),
        c: custom,
        d: mock.Property().get(custom).set(custom),
        e: mock.StaticProperty().get(custom).set(custom),
        x: custom,
        y: mock.Property().get(custom).set(custom),
        z: mock.StaticProperty().get(custom).set(custom),
      });

      const e = new E(1, 2, 3);

      try {
        e.c(1, 2, 3);
        e.x(1, 2, 3);
        E.a(1, 2, 3);
        e.d;
        e.d = 1;
        E.e;
        E.e = 1;
        e.y;
        e.y = 1;
        E.z;
        E.z = 1;
      } catch (e) {

      }

      history.end();

      expect(history._entries).toEqual([]);
    });


    it('should return mocked primitive value', () => {
      const e = new (new mock.Mock(history.begin()).by(B, {c: 123}))();

      expect(e.c()).toBe(123);
    });

    it('should include valid class.method name on absented constructor in class prototype', () => {
      const e = new (new mock.Mock(history).by(D, ['a']));

      history.begin('epoch', 'comment');

      e.a('call');

      history.end();

      expect(history._entries[0].name).toBe('D.a');
    });

    it('should include valid class.method name on presented constructor in class prototype', () => {
      const e = new (new mock.Mock(history).by(C, {'a': f}));

      history.begin('epoch', 'comment');

      e.a('call');

      history.end();

      expect(history._entries[0].name).toBe('C.a');
    });
  });

  describe('when builds mock by overridden class (Mock.override)', () => {
    it('should throw exception on bad argument', () => {
      const E = new mock.Mock(history);

      expect(() => E.override(null)).toThrow();
    });

    it('should from mock', () => {
      const E = new mock.Mock(history).override(A);

      expect(E).toBe(A);
    });

    it('should built mock be instance of original class', () => {
      const E = new mock.Mock(history).override(A);

      expect(new E instanceof A);
    });

    it('should save original constructor in class prototype', () => {
      const E = new mock.Mock(history).override(A, {'constructor': f});

      expect(E.prototype.constructor).toBe(A);
    });

    describe('when uses list of props', () => {
      it('should override all props with spy', () => {
        const E = new mock.Mock(history).override(B);

        expect(E.prototype.a.ORIGIN).toBe(bPrototype.a);
        expect(E.prototype.b.ORIGIN).toBe(bPrototype.b);
        expect(E.prototype.c.ORIGIN).toBe(bPrototype.c);
      });

      it('should override props with spy', () => {
        const E = new mock.Mock(history).override(B, ['c']);

        expect(E.prototype.a).toBe(B.prototype.a);
        expect(E.prototype.c.ORIGIN).toBe(bPrototype.c);
        expect(E.prototype.c.REPLACEMENT).toBe(bPrototype.c);
      });

      it('should stub absented props with spy', () => {
        const E = new mock.Mock(history).override(B, ['x']);

        expect(E.prototype.x instanceof Function).toBeTruthy();
      });
    });

    describe('when uses dictionary of props (prop name: custom handler)', () => {
      it('should override methods with spy', () => {
        const E = new mock.Mock(history).override(B, {c: f});

        expect(E.prototype.a).toBe(B.prototype.a);
        expect(E.prototype.c.ORIGIN).toBe(bPrototype.c);
        expect(E.prototype.c.REPLACEMENT).toBe(f);
      });

      it('should override methods of parent class with spy', () => {
        const E = new mock.Mock(history).override(B, {m: f});

        expect(E.prototype.a).toBe(B.prototype.a);
        expect(E.prototype.m.ORIGIN).toBe(A.prototype.m);
        expect(E.prototype.m.REPLACEMENT).toBe(f);
      });

      it('should override static methods with spy', () => {
        const E = new mock.Mock(history).override(B, {c: mock.StaticMethod(f)});

        expect(E.a).toBe(B.a);
        expect(E.c.ORIGIN).toBe(bProperties.c);
        expect(E.c.REPLACEMENT).toBe(f);
      });

      it('should override properties with spy on single getter', () => {
        const E = new mock.Mock(history).override(B, {d: mock.Property().get(f)});

        expect(E.prototype.a).toBe(B.prototype.a);
        expect(Object.getOwnPropertyDescriptor(E.prototype, 'd').get.ORIGIN).toBe(bPrototypeDescriptors.d.get);
        expect(Object.getOwnPropertyDescriptor(E.prototype, 'd').get.REPLACEMENT).toBe(f);
      });

      it('should override properties with spy on single setter', () => {
        const E = new mock.Mock(history).override(B, {d: mock.Property().set(f)});

        expect(E.prototype.a).toBe(B.prototype.a);
        expect(Object.getOwnPropertyDescriptor(E.prototype, 'd').set.ORIGIN).toBe(bPrototypeDescriptors.d.set);
        expect(Object.getOwnPropertyDescriptor(E.prototype, 'd').set.REPLACEMENT).toBe(f);
      });

      it('should override properties with spy on getter of getter/setter pair', () => {
        const E = new mock.Mock(history).override(B, {d: mock.Property().get(f).set(f)});

        expect(E.prototype.a).toBe(B.prototype.a);
        expect(Object.getOwnPropertyDescriptor(E.prototype, 'd').get.ORIGIN).toBe(bPrototypeDescriptors.d.get);
        expect(Object.getOwnPropertyDescriptor(E.prototype, 'd').get.REPLACEMENT).toBe(f);
      });

      it('should override properties with spy on setter of getter/setter pair', () => {
        const E = new mock.Mock(history).override(B, {d: mock.Property().get(f).set(f)});

        expect(E.prototype.a).toBe(B.prototype.a);
        expect(Object.getOwnPropertyDescriptor(E.prototype, 'd').set.ORIGIN).toBe(bPrototypeDescriptors.d.set);
        expect(Object.getOwnPropertyDescriptor(E.prototype, 'd').set.REPLACEMENT).toBe(f);
      });

      it('should override static properties with spy on single getter', () => {
        const E = new mock.Mock(history).override(B, {d: mock.StaticProperty().get(f)});

        expect(E.a).toBe(B.a);
        expect(Object.getOwnPropertyDescriptor(E, 'd').get.ORIGIN).toBe(bPropertiesDescriptors.d.get);
        expect(Object.getOwnPropertyDescriptor(E, 'd').get.REPLACEMENT).toBe(f);
      });

      it('should override static properties with spy on single setter', () => {
        const E = new mock.Mock(history).override(B, {d: mock.StaticProperty().set(f)});

        expect(E.a).toBe(B.a);
        expect(Object.getOwnPropertyDescriptor(E, 'd').set.ORIGIN).toBe(bPropertiesDescriptors.d.set);
        expect(Object.getOwnPropertyDescriptor(E, 'd').set.REPLACEMENT).toBe(f);
      });

      it('should override static properties with spy on getter of getter/setter pair', () => {
        const E = new mock.Mock(history).override(B, {d: mock.StaticProperty().get(f).set(f)});

        expect(E.a).toBe(B.a);
        expect(Object.getOwnPropertyDescriptor(E, 'd').get.ORIGIN).toBe(bPropertiesDescriptors.d.get);
        expect(Object.getOwnPropertyDescriptor(E, 'd').get.REPLACEMENT).toBe(f);
      });

      it('should override static properties with spy on setter of getter/setter pair', () => {
        const E = new mock.Mock(history).override(B, {d: mock.StaticProperty().get(f).set(f)});

        expect(E.a).toBe(B.a);
        expect(Object.getOwnPropertyDescriptor(E, 'd').set.ORIGIN).toBe(bPropertiesDescriptors.d.set);
        expect(Object.getOwnPropertyDescriptor(E, 'd').set.REPLACEMENT).toBe(f);
      });

      it('should stub methods marked as Function', () => {
        const E = new mock.Mock(history).override(B, {c: Function});

        expect(E.prototype.a).toBe(B.prototype.a);
        expect(E.prototype.c.ORIGIN).toBe(bPrototype.c);
        expect(E.prototype.c instanceof Function).toBeTruthy();
      });

      it('should stub static methods marked as Function', () => {
        const E = new mock.Mock(history).override(B, {c: mock.StaticMethod(Function)});

        expect(E.a).toBe(B.a);
        expect(E.c.ORIGIN).toBe(bProperties.c);
        expect(E.c instanceof Function).toBeTruthy();
      });

      it('should stub methods marked as primitive value', () => {
        const E = new mock.Mock(history).override(B, {c: 123});

        expect(E.prototype.a).toBe(bPrototype.a);
        expect(E.prototype.c.ORIGIN).toBe(bPrototype.c);
        expect(E.prototype.c instanceof Function).toBeTruthy();
      });

      it('should stub static methods marked as primitive value', () => {
        const E = new mock.Mock(history).override(B, {c: mock.StaticMethod(123)});

        expect(E.a).toBe(bProperties.a);
        expect(E.c.ORIGIN).toBe(bProperties.c);
        expect(E.c instanceof Function).toBeTruthy();
      });

      it('should set methods marked as class prototype props', () => {
        const E = new mock.Mock(history).override(B, {c: B});

        expect(E.prototype.a).toBe(bPrototype.a);
        expect(E.prototype.c.ORIGIN).toBe(bPrototype.c);
        expect(E.prototype.c instanceof Function).toBeTruthy();
      });

      it('should set static methods marked as class prototype props', () => {
        const E = new mock.Mock(history).override(B, {c: mock.StaticMethod(B)});

        expect(E.a).toBe(bProperties.a);
        expect(E.c.ORIGIN).toBe(bProperties.c);
        expect(E.c instanceof Function).toBeTruthy();
      });

      it('should stub absented methods with spy', () => {
        const E = new mock.Mock(history).override(B, {x: f});

        expect(E.prototype.x instanceof Function).toBeTruthy();
      });

      it('should stub absented static methods with spy', () => {
        const E = new mock.Mock(history).override(B, {x: mock.StaticMethod(f)});

        expect(E.x instanceof Function).toBeTruthy();
      });

      it('should override methods linked to fixture with spy', () => {
        const E = new mock.Mock(history).override(B, {c: fixture});

        expect(E.prototype.a).toBe(bPrototype.a);
        expect(E.prototype.c.ORIGIN).toBe(bPrototype.c);
        expect(E.prototype.c.REPLACEMENT.original).toBe(fixture.pop);
      });

      it('should override static methods linked to fixture with spy', () => {
        const E = new mock.Mock(history).override(B, {c: mock.StaticMethod(fixture)});

        expect(E.a).toBe(bProperties.a);
        expect(E.c.ORIGIN).toBe(bProperties.c);
        expect(E.c.REPLACEMENT.original).toBe(fixture.pop);
      });

      it('should override methods linked to fixture of observer by Fixture ref with spy', () => {
        const E = new mock.Mock(new unitsnap.History().link(observer)).override(B, {c: unitsnap.Fixture});

        expect(E.prototype.a).toBe(bPrototype.a);
        expect(E.prototype.c.ORIGIN).toBe(bPrototype.c);
        expect(E.prototype.c.REPLACEMENT.original).toBe(observer._fixture.pop);
      });

      it('should override static methods linked to fixture of observer by Fixture ref with spy', () => {
        const E = new mock.Mock(new unitsnap.History().link(observer)).override(B, {c: mock.StaticMethod(unitsnap.Fixture)});

        expect(E.a).toBe(bProperties.a);
        expect(E.c.ORIGIN).toBe(bProperties.c);
        expect(E.c.REPLACEMENT.original).toBe(observer._fixture.pop);
      });

      it('should throw exception on methods linked to fixture of unlinked observer by Fixture ref', () => {
        const E = new mock.Mock(history);

        expect(() => E.override(B, {c: unitsnap.Fixture})).toThrow();
      });
    });
  });

  describe('when uses mocked class (Mock.override)', () => {
    it('should spy on result of call', () => {
      const e = new (new mock.Mock(history).override(B, ['constructor', 'a', 'x']));

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
      const E = new mock.Mock(history).override(B, {
        constructor: Function,
        a: mock.StaticMethod(Function),
        c: B,
        d: mock.Property().get(1).set(Function),
        e: mock.StaticProperty().get(1).set(Function),
        x: Function,
        y: mock.Property().get(1).set(Function),
        z: mock.StaticProperty().get(1).set(Function),
      });

      const e = new E(1);

      history.begin('epoch', 'comment');

      for (let i = 0; i < 3; i ++) {
        try {
          e.c('call');
        } catch (e) {

        }
      }

      try {
        e.x();
        E.a();
        e.d;
        e.d = 1;
        E.e;
        E.e = 1;
        e.y;
        e.y = 1;
        E.z;
        E.z = 1;
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
      }, {
        args: {'*': []},
        callsCount: 1,
        comment: 'comment',
        context: history._entries[8].context,
        epoch: 'epoch',
        //exception: history._entries[6].exception,
        //exceptionsCount: 0,
        //isAsync: false,
        //isAsyncPending: false,
        //isException: false,
        name: 'B.a',
        origin: history._entries[8].origin,
        replacement: history._entries[8].replacement,
        tags: void 0,
        time: history._entries[8].time,
        type: 'staticMethod',
      }, {
        callsCount: 1,
        comment: 'comment',
        context: history._entries[9].context,
        epoch: 'epoch',
        exception: history._entries[9].exception,
        exceptionsCount: 0,
        isAsync: false,
        isAsyncPending: false,
        isException: false,
        name: 'B.a',
        origin: history._entries[9].origin,
        replacement: history._entries[9].replacement,
        result: void 0,
        tags: void 0,
        time: history._entries[9].time,
        type: 'staticMethod',
      }, {
        args: {'*': []},
        callsCount: 1,
        comment: 'comment',
        context: history._entries[10].context,
        epoch: 'epoch',
        //exception: history._entries[6].exception,
        //exceptionsCount: 0,
        //isAsync: false,
        //isAsyncPending: false,
        //isException: false,
        name: 'B.d',
        origin: history._entries[10].origin,
        replacement: history._entries[10].replacement,
        tags: void 0,
        time: history._entries[10].time,
        type: 'getter',
      }, {
        callsCount: 1,
        comment: 'comment',
        context: history._entries[11].context,
        epoch: 'epoch',
        exception: history._entries[11].exception,
        exceptionsCount: 0,
        isAsync: false,
        isAsyncPending: false,
        isException: false,
        name: 'B.d',
        origin: history._entries[11].origin,
        replacement: history._entries[11].replacement,
        result: 1,
        tags: void 0,
        time: history._entries[11].time,
        type: 'getter',
      }, {
        args: {'*': [], value: 1},
        callsCount: 1,
        comment: 'comment',
        context: history._entries[12].context,
        epoch: 'epoch',
        //exception: history._entries[6].exception,
        //exceptionsCount: 0,
        //isAsync: false,
        //isAsyncPending: false,
        //isException: false,
        name: 'B.d',
        origin: history._entries[12].origin,
        replacement: history._entries[12].replacement,
        tags: void 0,
        time: history._entries[12].time,
        type: 'setter',
      }, {
        callsCount: 1,
        comment: 'comment',
        context: history._entries[13].context,
        epoch: 'epoch',
        exception: history._entries[13].exception,
        exceptionsCount: 0,
        isAsync: false,
        isAsyncPending: false,
        isException: false,
        name: 'B.d',
        origin: history._entries[13].origin,
        replacement: history._entries[13].replacement,
        result: void 0,
        tags: void 0,
        time: history._entries[13].time,
        type: 'setter',
      }, {
        args: {'*': []},
        callsCount: 1,
        comment: 'comment',
        context: history._entries[14].context,
        epoch: 'epoch',
        //exception: history._entries[6].exception,
        //exceptionsCount: 0,
        //isAsync: false,
        //isAsyncPending: false,
        //isException: false,
        name: 'B.e',
        origin: history._entries[14].origin,
        replacement: history._entries[14].replacement,
        tags: void 0,
        time: history._entries[14].time,
        type: 'staticGetter',
      }, {
        callsCount: 1,
        comment: 'comment',
        context: history._entries[15].context,
        epoch: 'epoch',
        exception: history._entries[15].exception,
        exceptionsCount: 0,
        isAsync: false,
        isAsyncPending: false,
        isException: false,
        name: 'B.e',
        origin: history._entries[15].origin,
        replacement: history._entries[15].replacement,
        result: 1,
        tags: void 0,
        time: history._entries[15].time,
        type: 'staticGetter',
      }, {
        args: {'*': [], value: 1},
        callsCount: 1,
        comment: 'comment',
        context: history._entries[16].context,
        epoch: 'epoch',
        //exception: history._entries[6].exception,
        //exceptionsCount: 0,
        //isAsync: false,
        //isAsyncPending: false,
        //isException: false,
        name: 'B.e',
        origin: history._entries[16].origin,
        replacement: history._entries[16].replacement,
        tags: void 0,
        time: history._entries[16].time,
        type: 'staticSetter',
      }, {
        callsCount: 1,
        comment: 'comment',
        context: history._entries[17].context,
        epoch: 'epoch',
        exception: history._entries[17].exception,
        exceptionsCount: 0,
        isAsync: false,
        isAsyncPending: false,
        isException: false,
        name: 'B.e',
        origin: history._entries[17].origin,
        replacement: history._entries[17].replacement,
        result: void 0,
        tags: void 0,
        time: history._entries[17].time,
        type: 'staticSetter',
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
        name: 'B.y',
        origin: history._entries[18].origin,
        replacement: 1,
        tags: void 0,
        time: history._entries[18].time,
        type: 'getter',
      }, {
        callsCount: 1,
        comment: 'comment',
        context: e,
        epoch: 'epoch',
        exception: history._entries[19].exception,
        exceptionsCount: 0,
        isAsync: false,
        isAsyncPending: false,
        isException: false,
        name: 'B.y',
        origin: history._entries[19].origin,
        replacement: history._entries[19].replacement,
        result: 1,
        tags: void 0,
        time: history._entries[19].time,
        type: 'getter',
      }, {
        args: {'*': [1]},
        callsCount: 1,
        comment: 'comment',
        context: e,
        epoch: 'epoch',
        //exception: history._entries[6].exception,
        //exceptionsCount: 0,
        //isAsync: false,
        //isAsyncPending: false,
        //isException: false,
        name: 'B.y',
        origin: history._entries[20].origin,
        replacement: history._entries[20].replacement,
        tags: void 0,
        time: history._entries[20].time,
        type: 'setter',
      }, {
        callsCount: 1,
        comment: 'comment',
        context: e,
        epoch: 'epoch',
        exception: history._entries[21].exception,
        exceptionsCount: 0,
        isAsync: false,
        isAsyncPending: false,
        isException: false,
        name: 'B.y',
        origin: history._entries[21].origin,
        replacement: history._entries[21].replacement,
        result: void 0,
        tags: void 0,
        time: history._entries[21].time,
        type: 'setter',
      }, {
        args: {'*': []},
        callsCount: 1,
        comment: 'comment',
        context: E,
        epoch: 'epoch',
        //exception: history._entries[6].exception,
        //exceptionsCount: 0,
        //isAsync: false,
        //isAsyncPending: false,
        //isException: false,
        name: 'B.z',
        origin: history._entries[22].origin,
        replacement: 1,
        tags: void 0,
        time: history._entries[22].time,
        type: 'staticGetter',
      }, {
        callsCount: 1,
        comment: 'comment',
        context: E,
        epoch: 'epoch',
        exception: history._entries[23].exception,
        exceptionsCount: 0,
        isAsync: false,
        isAsyncPending: false,
        isException: false,
        name: 'B.z',
        origin: history._entries[23].origin,
        replacement: history._entries[23].replacement,
        result: 1,
        tags: void 0,
        time: history._entries[23].time,
        type: 'staticGetter',
      }, {
        args: {'*': [1]},
        callsCount: 1,
        comment: 'comment',
        context: E,
        epoch: 'epoch',
        //exception: history._entries[6].exception,
        //exceptionsCount: 0,
        //isAsync: false,
        //isAsyncPending: false,
        //isException: false,
        name: 'B.z',
        origin: history._entries[24].origin,
        replacement: history._entries[24].replacement,
        tags: void 0,
        time: history._entries[24].time,
        type: 'staticSetter',
      }, {
        callsCount: 1,
        comment: 'comment',
        context: E,
        epoch: 'epoch',
        exception: history._entries[25].exception,
        exceptionsCount: 0,
        isAsync: false,
        isAsyncPending: false,
        isException: false,
        name: 'B.z',
        origin: history._entries[25].origin,
        replacement: history._entries[25].replacement,
        result: void 0,
        tags: void 0,
        time: history._entries[25].time,
        type: 'staticSetter',
      }]);
    });

    it('should return mocked primitive value', () => {
      const E = new mock.Mock(history.begin()).override(B, {c: 123});

      expect((new E).c()).toBe(123);
    });

    it('should RESTORE overridden props by list of props', () => {
      const E = new mock.Mock(history).override(B, ['a', 'b', 'x']).RESTORE();

      expect(E.prototype.a).toBe(bPrototype.a);
      expect(E.prototype.b).toBe(bPrototype.b);
      expect(E.prototype.x).toBeUndefined();
    });

    it('should RESTORE overridden props by dictionary of props', () => {
      const E = new mock.Mock(history).override(B, {
        a: B,
        b: mock.StaticMethod(B),
        d: mock.Property(),
        e: mock.StaticProperty(),
        m: f,
        x: f
      }).RESTORE();

      expect(E.prototype.a).toBe(bPrototype.a);
      expect(E.b).toBe(bProperties.b);
      expect(Object.getOwnPropertyDescriptor(E.prototype, 'd')).toEqual(bPrototypeDescriptors.d);
      expect(Object.getOwnPropertyDescriptor(E, 'e')).toEqual(bPropertiesDescriptors.e);
      expect(E.prototype.m).toBe(A.prototype.m);
      expect(E.prototype.x).toBeUndefined();
    });

    it('should include valid "class.method" name on absented constructor in class prototype', () => {
      const e = new (new mock.Mock(history).override(D, ['a']));

      history.begin('epoch', 'comment');

      e.a('call');

      history.end();

      expect(history._entries[0].name).toBe('D.a');
    });

    it('should include valid "class.method" name on presented constructor in class prototype', () => {
      const e = new (new mock.Mock(history).override(C, {'a': f}));

      history.begin('epoch', 'comment');

      e.a('call');

      history.end();

      expect(history._entries[0].name).toBe('C.a');
    });
  });

  it('should from mock creating stubs on absented selected props as list', () => {
    const E = new mock.Mock(history).from(['d', 'e', 'f']);

    expect(new E().d instanceof Function).toBeTruthy();
    expect(new E().e instanceof Function).toBeTruthy();
    expect(new E().f instanceof Function).toBeTruthy();
  });

  it('should from mock creating stubs on absented selected props as dictionary', () => {
    const E = new mock.Mock(history).from({d: f, e: f, f: f});

    expect(new E().d instanceof Function).toBeTruthy();
    expect(new E().e instanceof Function).toBeTruthy();
    expect(new E().f instanceof Function).toBeTruthy();
  });

  it('should spy on single callable result', () => {
    const x = new mock.Mock(history).spy(function x(a) { return a * 2; });

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
    const x = new mock.Mock(history).spy(function x(a) { throw 1; });

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

    const x = new mock.Mock(history).spy(function x(a) { return Promise.resolve(1); });

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

    const x = new mock.Mock(history).spy(function x(a) { return Promise.reject(1); });

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
