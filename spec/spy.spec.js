const unitsnap = require('..');
const spy = require('../src/spy');

describe('Spy', () => {
  describe('when spies on callable', () => {
    it('should use arguments annotations in ES5 declaration', () => {
      function Es5Class(a, b, c) {

      }

      const spied = spy.spyCallable(Es5Class);

      spied(1, 2, 3, 4, 5);

      expect(spied.ARGS).toEqual({'*': [4, 5], a: 1, b: 2, c: 3});
    });

    it('should use arguments annotations in ES6 declaration', () => {
      const es6 = (a, b, c) => {

      };

      const spied = spy.spyCallable(es6);

      spied(1, 2, 3, 4, 5);

      expect(spied.ARGS).toEqual({'*': [4, 5], a: 1, b: 2, c: 3});
    });

    it('should use arguments annotations in ES6 declaration with single argument', () => {
      const es6 = a => {

      };

      const spied = spy.spyCallable(es6);

      spied(1, 2, 3, 4, 5);

      expect(spied.ARGS).toEqual({'*': [2, 3, 4, 5], a: 1});
    });

    it('should use arguments annotations in ES6 class constructor declaration', () => {
      class Es6Class {
        constructor(a, b, c) {}
      }

      const Spied = spy.spyCallable(Es6Class, void 0, true);

      const spied = new Spied(1, 2, 3, 4, 5);

      expect(Spied.ARGS).toEqual({'*': [4, 5], a: 1, b: 2, c: 3});
    });

    it('should use arguments annotations in ES6 extended class constructor declaration', () => {
      class Parent {
        constructor(x) { }
      }

      class Es6 extends Parent {
        constructor(a, b, c) { super(); }
      }

      const Spied = spy.spyCallable(Es6, void 0, true);

      const spied = new Spied(1, 2, 3, 4, 5);

      expect(Spied.ARGS).toEqual({'*': [4, 5], a: 1, b: 2, c: 3});
    });

    it('should spy on resolved promise', (done) => {
      function async() {
        return Promise.resolve(1);
      }

      const spied = spy.spyCallable(async);

      spied().then((result) => {
        expect(result).toBe(1);
        expect(spied.IS_ASYNC).toBe(true);
        expect(spied.IS_EXCEPTION).toBe(false);

        done();
      });
    });

    it('should spy on rejected promise', (done) => {
      function async() {
        return Promise.reject(1);
      }

      const spied = spy.spyCallable(async);

      spied().catch((result) => {
        expect(result).toBe(1);
        expect(spied.IS_ASYNC).toBe(true);
        expect(spied.IS_EXCEPTION).toBe(true);

        done();
      });
    });
  });

  describe('when spies on class callable', () => {
    it('should use arguments annotations in ES5 declaration', () => {
      function Es5Class(a, b, c) {

      }
      
      Es5Class.prototype = {
        a: function (a, b, c) {
          
        }
      };

      const Spied = spy.spyClassCallable(Es5Class, 'a');

      const spied = new Spied();

      spied.a(1, 2, 3, 4, 5);

      expect(spied.a.ARGS).toEqual({'*': [4, 5], a: 1, b: 2, c: 3});
    });

    it('should use arguments annotations in ES6 declaration', () => {
      class Es6Class {
        a(a, b, c) {

        }
      }

      const Spied = spy.spyClassCallable(Es6Class, 'a');

      const spied = new Spied();

      spied.a(1, 2, 3, 4, 5);

      expect(spied.a.ARGS).toEqual({'*': [4, 5], a: 1, b: 2, c: 3});
    });

    it('should use arguments annotations in async ES7 declaration', async () => {
      class Es7Class {
        async a(a, b, c) {

        }
      }

      const Spied = spy.spyClassCallable(Es7Class, 'a');

      const spied = new Spied();

      await spied.a(1, 2, 3, 4, 5);

      expect(spied.a.ARGS).toEqual({'*': [4, 5], a: 1, b: 2, c: 3});
    });
  });
});
