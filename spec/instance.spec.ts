import unitsnap from '..';
const instance = require('../src/instance');

describe('instance', () => {
  function Es5 () {

  }

  Es5.prototype = {
    a: 1,
    b: 2,
    c: 3,
  };

  Object.defineProperty(Es5.prototype, 'x', {
    get: function () {
      return 1;
    },
    set: function (value) {

    },
    enumerable: true,
  });

  class Es6 {
    get x() {
      return 1;
    }
    set x(value) {

    }
  }

  Object.assign(Es6.prototype, {
    a: 1,
    b: 2,
    c: 3,
  });

  describe('when uses ES5 notation', () => {
    it('should copy constructor', () => {
      const Copy = instance.copyConstructor(Es5);

      expect(Copy).not.toBe(Es5);
      expect(Copy instanceof Function).toBeTruthy();
      expect(Copy.prototype).toBe(Es5.prototype);
    });

    it('should copy prototype', () => {
      const Copy = instance.copyPrototype(Es5);

      expect(Copy).not.toBe(Es5.prototype);
      expect(Copy instanceof Object).toBeTruthy();
      expect(Copy).toEqual(Es5.prototype);
    });

    it('should copy scope', () => {
      function A() {

      }

      A.prototype = {
        a: function () {

        }
      };

      function B() {

      }

      B.prototype = Object.create(A, {
        b: function () {

        },
        x: function () {

        },
      });

      function C() {

      }

      C.prototype = Object.create(B, {
        c: function () {

        },
        y: function () {

        },
      });

      const ScopyCopy = instance.copyScope(C);

      expect(ScopyCopy.a).toBe(A.prototype.a);
      expect(ScopyCopy.b).toBe(B.prototype.b);
      expect(ScopyCopy.c).toBe(C.prototype.c);
      expect(ScopyCopy.x).toBe(B.prototype.x);
      expect(ScopyCopy.y).toBe(C.prototype.y);
    });
  });

  describe('when uses ES6 notation', () => {
    it('should copy constructor', () => {
      const Copy = instance.copyConstructor(Es6);

      expect(Copy).not.toBe(Es6);
      expect(Copy instanceof Function).toBeTruthy();
      expect(Copy.prototype).toBe(Es6.prototype);
    });

    it('should copy prototype', () => {
      const Copy = instance.copyPrototype(Es6);

      expect(Copy).not.toBe(Es6.prototype);
      expect(Copy instanceof Object).toBeTruthy();
      expect(Copy).toEqual(Es6.prototype);
    });

    it('should copy scope', () => {
      class A {
        a() {

        }
        x() {

        }
        y() {

        }
      }

      class B extends A {
        b() {

        }
        x() {

        }
      }

      class C extends B {
        c() {

        }
        y() {

        }
      }

      const ScopyCopy = instance.copyScope(C);

      expect(ScopyCopy.a).toBe(A.prototype.a);
      expect(ScopyCopy.b).toBe(B.prototype.b);
      expect(ScopyCopy.c).toBe(C.prototype.c);
      expect(ScopyCopy.x).toBe(B.prototype.x);
      expect(ScopyCopy.y).toBe(C.prototype.y);
    });
  });

  describe('when calls constructor', () => {
    it('should call with arguments', () => {
      const args = [];

      for (let i = 0; i < 11; i ++) {
        if (i > 0) {
          args.push(i);
        }

        function Clazz() {
          this.args = Array.prototype.slice.call(arguments);
          this.context = this;
        }

        const ctx = {};
        const obj = instance.callConstructor(Clazz, ctx, args);

        expect(obj.args).toEqual(args);
      }
    });

    it('should throw exception with excessive number of arguments', () => {
      expect(() => {
        instance.callConstructor(function () {

        }, {}, [1, 2, 1, 2, 1, 2, 1, 2, 1, 2, 1]);
      }).toThrow();
    })
  });

  describe('when calls constructor copy', () => {
    it('should be instance of original class', () => {
      function Cls() {
        this.args = Array.prototype.slice.call(arguments);
        this.context = this;

        return this;
      }

      const copy = new (instance.copyConstructor(Cls))(0, 1, 2, 3, 4, 5, 6, 7, 8, 9);

      expect(copy instanceof Cls).toBeTruthy();
    });

    it('should call with arguments', () => {
      function Cls() {
        this.args = Array.prototype.slice.call(arguments);
        this.context = this;

        return this;
      }

      const copy = new (instance.copyConstructor(Cls))(0, 1, 2, 3, 4, 5, 6, 7, 8, 9);

      expect(copy.args).toEqual([0, 1, 2, 3, 4, 5, 6, 7, 8, 9]);
    });

    it('should returns another "this"', () => {
      function Cls() {
        this.args = Array.prototype.slice.call(arguments);
        this.context = this;

        return Cls;
      }

      const copy = new (instance.copyConstructor(Cls))(0, 1, 2, 3, 4, 5, 6, 7, 8, 9);

      expect(copy).toBe(Cls);
    });
  });

  it('should get ancestors', () => {
    class A {
      constructor() {

      }
    }

    class B extends A {

    }

    class C extends B {
      constructor() {
        super();
      }
    }

    expect(instance.getAncestors(C)).toEqual([
      C,
      B,
      A,
    ]);
  });

  describe('when parses function annotation', () => {
    it('should parse anonymous es5 function declaration', () => {
      const e = instance.parseFunctionAnnotation(function (a, b, c) { return (x) => {
        return 1;
      }});

      expect(e).toEqual({
        args: [
          {alias: null, default: void 0, name: 'a', type: 'positional'},
          {alias: null, default: void 0, name: 'b', type: 'positional'},
          {alias: null, default: void 0, name: 'c', type: 'positional'},
        ],
        argsDeclaration: 'a,b,c',
        name: null,
      });
    });

    it('should parse named es5 function declaration', () => {
      const e = instance.parseFunctionAnnotation(function name(a, b, c) { return (x) => {
        return 1;
      }});

      expect(e).toEqual({
        args: [
          {alias: null, default: void 0, name: 'a', type: 'positional'},
          {alias: null, default: void 0, name: 'b', type: 'positional'},
          {alias: null, default: void 0, name: 'c', type: 'positional'},
        ],
        argsDeclaration: 'a,b,c',
        name: 'name',
      });
    });

    it('should parse async anonymous es5 function declaration', () => {
      const e = instance.parseFunctionAnnotation(async function (a, b, c) { return (x) => {
        return 1;
      }});

      expect(e).toEqual({
        args: [
          {alias: null, default: void 0, name: 'a', type: 'positional'},
          {alias: null, default: void 0, name: 'b', type: 'positional'},
          {alias: null, default: void 0, name: 'c', type: 'positional'},
        ],
        argsDeclaration: 'a,b,c',
        name: null,
      });
    });

    it('should parse async named es5 function declaration', () => {
      const e = instance.parseFunctionAnnotation(async function name(a, b, c) { return (x) => {
        return 1;
      }});

      expect(e).toEqual({
        args: [
          {alias: null, default: void 0, name: 'a', type: 'positional'},
          {alias: null, default: void 0, name: 'b', type: 'positional'},
          {alias: null, default: void 0, name: 'c', type: 'positional'},
        ],
        argsDeclaration: 'a,b,c',
        name: 'name',
      });
    });

    it('should parse anonymous es6 function declaration', () => {
      const e = instance.parseFunctionAnnotation((a, b, c) => (x) => {
        return 1;
      });

      expect(e).toEqual({
        args: [
          {alias: null, default: void 0, name: 'a', type: 'positional'},
          {alias: null, default: void 0, name: 'b', type: 'positional'},
          {alias: null, default: void 0, name: 'c', type: 'positional'},
        ],
        argsDeclaration: 'a,b,c',
        name: null,
      });
    });

    it('should parse async anonymous es6 function declaration', () => {
      const e = instance.parseFunctionAnnotation(async (a, b, c) => (x) => {
        return 1;
      });

      expect(e).toEqual({
        args: [
          {alias: null, default: void 0, name: 'a', type: 'positional'},
          {alias: null, default: void 0, name: 'b', type: 'positional'},
          {alias: null, default: void 0, name: 'c', type: 'positional'},
        ],
        argsDeclaration: 'a,b,c',
        name: null,
      });
    });

    it('should parse es6 class function declaration', () => {
      class A {
        a(a, b, c) {
          (x) => {
            return 1;
          }
        }
      }

      const e = instance.parseFunctionAnnotation(A.prototype.a);

      expect(e).toEqual({
        args: [
          {alias: null, default: void 0, name: 'a', type: 'positional'},
          {alias: null, default: void 0, name: 'b', type: 'positional'},
          {alias: null, default: void 0, name: 'c', type: 'positional'},
        ],
        argsDeclaration: 'a,b,c',
        name: 'a',
      });
    });

    it('should parse es6 class async function declaration', () => {
      class A {
        async a(a, b, c) {
          (x) => {
            return 1;
          }
        }
      }

      const e = instance.parseFunctionAnnotation(A.prototype.a);

      expect(e).toEqual({
        args: [
          {alias: null, default: void 0, name: 'a', type: 'positional'},
          {alias: null, default: void 0, name: 'b', type: 'positional'},
          {alias: null, default: void 0, name: 'c', type: 'positional'},
        ],
        argsDeclaration: 'a,b,c',
        name: 'a',
      });
    });
  });
});
