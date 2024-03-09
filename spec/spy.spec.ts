import * as unitsnap from '..';

describe('Spy', () => {
  describe('when spies on function', () => {
    it('should use arguments annotations in ES5 declaration', () => {
      function es5(a, b, c) {

      }

      const spied = unitsnap.spyOnFunction(es5);

      spied(1, 2, 3, 4, 5);

      expect(unitsnap.stat(spied).args).toEqual({'*': [4, 5], a: 1, b: 2, c: 3});
    });

    it('should use arguments annotations in ES6 declaration', () => {
      const es6 = (a, {b, c=5, d:dd, e=5, f:ff=5}, ...g) => {

      };

      const spied = unitsnap.spyOnFunction(es6);

      spied(1, {b: 2, c: 3, d: 4}, 5);

      expect(unitsnap.stat(spied).args).toEqual({a: 1, b: 2, c: 3, dd: 4, e: undefined, ff: undefined, g: [5]});
    });

    it('should use arguments annotations in ES6 declaration with no brackets single argument', () => {
      const es6 = a => {

      };

      const spied = unitsnap.spyOnFunction(es6);

      spied(1, 2, 3, 4, 5);

      expect(unitsnap.stat(spied).args).toEqual({'*': [2, 3, 4, 5], a: 1});
    });

    it('should use arguments annotations in ES5 class constructor declaration', () => {
      function Es5Class(a, b, c) {

      }

      const Spied = unitsnap.spyOnFunction(Es5Class, undefined, true);

      new Spied(1, 2, 3, 4, 5);

      expect(unitsnap.stat(Spied).args).toEqual({'*': [4, 5], a: 1, b: 2, c: 3});
    });

    it('should use arguments annotations in ES6 class constructor declaration', () => {
      class Es6Class {
        constructor(a, b, c) {}
      }

      const Spied = unitsnap.spyOnFunction(Es6Class, undefined, true);

      new Spied(1, 2, 3, 4, 5);

      expect(unitsnap.stat(Spied).args).toEqual({'*': [4, 5], a: 1, b: 2, c: 3});
    });

    it('should use arguments annotations in ES6 extended class constructor declaration', () => {
      class Es6Class extends Object {
        constructor(a, b, c) { super(); }
      }

      const Spied = unitsnap.spyOnFunction(Es6Class, undefined, true);

      new Spied(1, 2, 3, 4, 5);

      expect(unitsnap.stat(Spied).args).toEqual({'*': [4, 5], a: 1, b: 2, c: 3});
    });

    it('should spy on resolved promise', (done) => {
      function async() {
        return Promise.resolve(1);
      }

      const spied = unitsnap.spyOnFunction(async);

      spied().then((result) => {
        expect(result).toBe(1);
        expect(unitsnap.stat(spied).isAsync).toBe(true);
        expect(unitsnap.stat(spied).isException).toBe(false);

        done();
      });
    });

    it('should spy on rejected promise', (done) => {
      function async() {
        return Promise.reject(1);
      }

      const spied = unitsnap.spyOnFunction(async);

      spied().catch((result) => {
        expect(result).toBe(1);
        expect(unitsnap.stat(spied).isAsync).toBe(true);
        expect(unitsnap.stat(spied).isException).toBe(true);

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

      const spied = new (unitsnap.spyOnMethod(Es5Class, 'a'));

      spied.a(1);

      expect(unitsnap.stat(spied.a).args).toEqual({'*': [], a: 1});
    });

    it('should use arguments annotations in ES6 class declaration', () => {
      class Es6Class {
        constructor(a, b, c) {

        }

        a(a) {
          return this;
        }
      }

      const spied = new (unitsnap.spyOnMethod(Es6Class, 'a'));

      spied.a(1);

      expect(unitsnap.stat(spied.a).args).toEqual({'*': [], a: 1});
    });

    it('should use arguments annotations in async ES7 class declaration', () => {
      class Es6Class {
        constructor(a, b, c) {

        }

        async a(a) {
          return this;
        }
      }

      const spied = new (unitsnap.spyOnMethod(Es6Class, 'a'));

      spied.a(1);

      expect(unitsnap.stat(spied.a).args).toEqual({'*': [], a: 1});
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

      const Spied = unitsnap.spyOnStaticMethod(Es5Class, 'a');

      Spied.a(1);

      expect(unitsnap.stat(Spied.a).args).toEqual({'*': [], a: 1});
    });

    it('should use arguments annotations in ES6 class declaration', () => {
      class Es6Class {
        constructor(a, b, c) {

        }

        static a(a) {
          return this;
        }
      }

      const Spied = unitsnap.spyOnStaticMethod(Es6Class, 'a');

      Spied.a(1);

      expect(unitsnap.stat(Spied.a).args).toEqual({'*': [], a: 1});
    });

    it('should use arguments annotations in async ES7 class declaration', () => {
      class Es7Class {
        constructor(a, b, c) {

        }

        static async a(a) {
          return this;
        }
      }

      const Spied = unitsnap.spyOnStaticMethod(Es7Class, 'a');

      Spied.a(1);

      expect(unitsnap.stat(Spied.a).args).toEqual({'*': [], a: 1});
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

      const spied = new (unitsnap.spyOnDescriptor(Es5Class, 'a', Object.getOwnPropertyDescriptor(Es5Class.prototype, 'a')));

      spied.a(1);

      expect(unitsnap.stat(spied.a).args).toEqual({'*': [], a: 1});
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

      const spied = new (unitsnap.spyOnDescriptor(Es5Class, 'a', Object.getOwnPropertyDescriptor(Es5Class.prototype, 'a')));

      spied.a;

      expect(unitsnap.stat(Object.getOwnPropertyDescriptor(spied, 'a').get).args).toEqual({'*': []});
    });

    it('should arguments annotations in ES5 class setter declaration', () => {
      function Es5Class(a, b, c) {

      }

      Object.defineProperty(Es5Class.prototype, 'a', {
        configurable: true,

        set: function (value) {

        },
      });

      const spied = new (unitsnap.spyOnDescriptor(Es5Class, 'a', Object.getOwnPropertyDescriptor(Es5Class.prototype, 'a')));

      spied.a = 5;

      expect(unitsnap.stat(Object.getOwnPropertyDescriptor(spied, 'a').set).args).toEqual({'*': [], value: 5});
    });

    it('should arguments annotations in ES6 class getter declaration', () => {
      class Es6Class {
        get a() {
          return 1;
        }
      }

      const spied = new (unitsnap.spyOnDescriptor(Es6Class, 'a', Object.getOwnPropertyDescriptor(Es6Class.prototype, 'a')));

      spied.a;

      expect(unitsnap.stat(Object.getOwnPropertyDescriptor(spied, 'a').get).args).toEqual({'*': []});
    });

    it('should arguments annotations in ES6 class setter declaration', () => {
      class Es6Class {
        set a(value) {

        }
      }

      const spied = new (unitsnap.spyOnDescriptor(Es6Class, 'a', Object.getOwnPropertyDescriptor(Es6Class.prototype, 'a')));

      spied.a = 5;

      expect(unitsnap.stat(Object.getOwnPropertyDescriptor(spied, 'a').set).args).toEqual({'*': [], value: 5});
    });
  });
});
