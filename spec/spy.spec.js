const unitsnap = require('..');
const spy = require('../src/spy');

describe('Spy', () => {
  describe('when spies on function', () => {
    it('should use arguments annotations in ES5 declaration', () => {
      function es5(a, b, c) {

      }

      const spied = spy.spyOnFunction(es5);

      spied(1, 2, 3, 4, 5);

      expect(spied.ARGS).toEqual({'*': [4, 5], a: 1, b: 2, c: 3});
    });

    it('should use arguments annotations in ES6 declaration', () => {
      const es6 = (a, {b, c=5, d:dd, e=5, f:ff=5}, ...g) => {

      };

      const spied = spy.spyOnFunction(es6);

      spied(1, {b: 2, c: 3, d: 4}, 5);

      expect(spied.ARGS).toEqual({a: 1, b: 2, c: 3, dd: 4, e: void 0, ff: void 0, g: [5]});
    });

    it('should use arguments annotations in ES6 declaration with no brackets single argument', () => {
      const es6 = a => {

      };

      const spied = spy.spyOnFunction(es6);

      spied(1, 2, 3, 4, 5);

      expect(spied.ARGS).toEqual({'*': [2, 3, 4, 5], a: 1});
    });

    it('should use arguments annotations in ES5 class constructor declaration', () => {
      function Es5Class(a, b, c) {

      }

      const Spied = spy.spyOnFunction(Es5Class, void 0, true);

      new Spied(1, 2, 3, 4, 5);

      expect(Spied.ARGS).toEqual({'*': [4, 5], a: 1, b: 2, c: 3});
    });

    it('should use arguments annotations in ES6 class constructor declaration', () => {
      class Es6Class {
        constructor(a, b, c) {}
      }

      const Spied = spy.spyOnFunction(Es6Class, void 0, true);

      new Spied(1, 2, 3, 4, 5);

      expect(Spied.ARGS).toEqual({'*': [4, 5], a: 1, b: 2, c: 3});
    });

    it('should use arguments annotations in ES6 extended class constructor declaration', () => {
      class Es6Class extends Object {
        constructor(a, b, c) { super(); }
      }

      const Spied = spy.spyOnFunction(Es6Class, void 0, true);

      new Spied(1, 2, 3, 4, 5);

      expect(Spied.ARGS).toEqual({'*': [4, 5], a: 1, b: 2, c: 3});
    });

    it('should spy on resolved promise', (done) => {
      function async() {
        return Promise.resolve(1);
      }

      const spied = spy.spyOnFunction(async);

      spied().then((result) => {
        expect(result).toBe(1);
        expect(spied.IS_ASYNC_RESULT).toBe(true);
        expect(spied.IS_EXCEPTION).toBe(false);

        done();
      });
    });

    it('should spy on rejected promise', (done) => {
      function async() {
        return Promise.reject(1);
      }

      const spied = spy.spyOnFunction(async);

      spied().catch((result) => {
        expect(result).toBe(1);
        expect(spied.IS_ASYNC_RESULT).toBe(true);
        expect(spied.IS_EXCEPTION).toBe(true);

        done();
      });
    });
  });

  describe('when spies on method', () => {
    it('should use arguments annotations in ES5 class declaration', () => {
      function Es5Class(a, b, c) {

      }

      Es5Class.prototype = {
        a: function (a) {
          return this;
        },
      };

      const spied = new (spy.spyOnMethod(Es5Class, 'a'));

      spied.a(1);

      expect(spied.a.ARGS).toEqual({'*': [], a: 1});
    });

    it('should use arguments annotations in ES6 class declaration', () => {
      class Es6Class {
        constructor(a, b, c) {

        }

        a(a) {
          return this;
        }
      }

      const spied = new (spy.spyOnMethod(Es6Class, 'a'));

      spied.a(1);

      expect(spied.a.ARGS).toEqual({'*': [], a: 1});
    });

    it('should use arguments annotations in async ES7 class declaration', () => {
      class Es6Class {
        constructor(a, b, c) {

        }

        async a(a) {
          return this;
        }
      }

      const spied = new (spy.spyOnMethod(Es6Class, 'a'));

      spied.a(1);

      expect(spied.a.ARGS).toEqual({'*': [], a: 1});
    });
  });

  describe('when spies on static method', () => {
    it('should use arguments annotations in ES5 class declaration', () => {
      function Es5Class(a, b, c) {

      }

      Object.assign(Es5Class, {
        a: function (a) {
          return this;
        },
      });

      const Spied = spy.spyOnStaticMethod(Es5Class, 'a');

      Spied.a(1);

      expect(Spied.a.ARGS).toEqual({'*': [], a: 1});
    });

    it('should use arguments annotations in ES6 class declaration', () => {
      class Es6Class {
        constructor(a, b, c) {

        }

        static a(a) {
          return this;
        }
      }

      const Spied = spy.spyOnStaticMethod(Es6Class, 'a');

      Spied.a(1);

      expect(Spied.a.ARGS).toEqual({'*': [], a: 1});
    });

    it('should use arguments annotations in async ES7 class declaration', () => {
      class Es7Class {
        constructor(a, b, c) {

        }

        static async a(a) {
          return this;
        }
      }

      const Spied = spy.spyOnStaticMethod(Es7Class, 'a');

      Spied.a(1);

      expect(Spied.a.ARGS).toEqual({'*': [], a: 1});
    });
  });

  describe('when spies on descriptor', () => {
    it('should use arguments annotations in ES5 class declaration of method', () => {
      function Es5Class(a, b, c) {

      }

      Es5Class.prototype = {
        a: function (a) {
          return this;
        },
      };

      const spied = new (spy.spyOnDescriptor(Es5Class, 'a', Object.getOwnPropertyDescriptor(Es5Class.prototype, 'a')));

      spied.a(1);

      expect(spied.a.ARGS).toEqual({'*': [], a: 1});
    });

    it('should arguments annotations in ES5 class getter declaration', () => {
      function Es5Class(a, b, c) {

      }

      Object.defineProperty(Es5Class.prototype, 'a', {
        configurable: true,

        get: function () {
          return 1;
        },
      });

      const spied = new (spy.spyOnDescriptor(Es5Class, 'a', Object.getOwnPropertyDescriptor(Es5Class.prototype, 'a')));

      spied.a;

      expect(Object.getOwnPropertyDescriptor(spied, 'a').get.ARGS).toEqual({'*': []});
    });

    it('should arguments annotations in ES5 class setter declaration', () => {
      function Es5Class(a, b, c) {

      }

      Object.defineProperty(Es5Class.prototype, 'a', {
        configurable: true,

        set: function (value) {

        },
      });

      const spied = new (spy.spyOnDescriptor(Es5Class, 'a', Object.getOwnPropertyDescriptor(Es5Class.prototype, 'a')));

      spied.a = 5;

      expect(Object.getOwnPropertyDescriptor(spied, 'a').set.ARGS).toEqual({'*': [], value: 5});
    });

    it('should arguments annotations in ES6 class getter declaration', () => {
      class Es6Class {
        get a() {
          return 1;
        }
      }

      const spied = new (spy.spyOnDescriptor(Es6Class, 'a', Object.getOwnPropertyDescriptor(Es6Class.prototype, 'a')));

      spied.a;

      expect(Object.getOwnPropertyDescriptor(spied, 'a').get.ARGS).toEqual({'*': []});
    });

    it('should arguments annotations in ES6 class setter declaration', () => {
      class Es6Class {
        set a(value) {

        }
      }

      const spied = new (spy.spyOnDescriptor(Es6Class, 'a', Object.getOwnPropertyDescriptor(Es6Class.prototype, 'a')));

      spied.a = 5;

      expect(Object.getOwnPropertyDescriptor(spied, 'a').set.ARGS).toEqual({'*': [], value: 5});
    });
  });
});
