const unitsnap = require('..');
const inspection = require('../src/inspection');

describe('inspection', () => {
  function es5Function(a, b = 2, {c = 3}, ...r) {

  }

  const es6ArrowFunction = (a, b = 2, {c = 3}, ...r) => {

  };

  function *es6GeneratorFunction(a, b = 2, {c = 3}, ...r) {

  }

  async function es7AsyncFunction(a, b = 2, {c = 3}, ...r) {

  }

  const es7AsyncArrowFunction = async (a, b = 2, {c = 3}, ...r) => {

  };

  async function *es7AsyncGeneratorFunction(a, b = 2, {c = 3}, ...r) {

  }

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

  describe('when parses function annotation', () => {
    it('should parse ES5 function', () => {
      const annotation = inspection.parseFunctionAnnotation(es5Function);

      expect(annotation).toEqual({
        args: [
          {
            alias: null,
            default: void 0,
            name: 'a',
            type: 'positional',
          },
          {
            alias: null,
            default: '2',
            name: 'b',
            type: 'positional',
          },
          {
            alias: null,
            default: void 0,
            props: [
              {
                alias: null,
                default: '3',
                name: 'c',
                type: 'positional',
              },
            ],
            type: 'unpack',
          },
          {
            alias: null,
            default: void 0,
            name: 'r',
            type: 'rest',
          }
        ],
        argsDeclaration: 'a,b = 2,{c = 3},...r',
        isAsync: false,
        isGenerator: false,
        name: 'es5Function',
      });
    });

    it('should parse ES6 function', () => {
      const annotation = inspection.parseFunctionAnnotation(es6ArrowFunction);

      expect(annotation).toEqual({
        args: [
          {
            alias: null,
            default: void 0,
            name: 'a',
            type: 'positional',
          },
          {
            alias: null,
            default: '2',
            name: 'b',
            type: 'positional',
          },
          {
            alias: null,
            default: void 0,
            props: [
              {
                alias: null,
                default: '3',
                name: 'c',
                type: 'positional',
              },
            ],
            type: 'unpack',
          },
          {
            alias: null,
            default: void 0,
            name: 'r',
            type: 'rest',
          }
        ],
        argsDeclaration: 'a,b = 2,{c = 3},...r',
        isAsync: false,
        isGenerator: false,
        name: null,
      });
    });

    it('should parse ES6 generator function', () => {
      const annotation = inspection.parseFunctionAnnotation(es6GeneratorFunction);

      expect(annotation).toEqual({
        args: [
          {
            alias: null,
            default: void 0,
            name: 'a',
            type: 'positional',
          },
          {
            alias: null,
            default: '2',
            name: 'b',
            type: 'positional',
          },
          {
            alias: null,
            default: void 0,
            props: [
              {
                alias: null,
                default: '3',
                name: 'c',
                type: 'positional',
              },
            ],
            type: 'unpack',
          },
          {
            alias: null,
            default: void 0,
            name: 'r',
            type: 'rest',
          }
        ],
        argsDeclaration: 'a,b = 2,{c = 3},...r',
        isAsync: false,
        isGenerator: true,
        name: 'es6GeneratorFunction',
      });
    });
  });

  it('should parse ES7 async function', () => {
    const annotation = inspection.parseFunctionAnnotation(es7AsyncFunction);

    expect(annotation).toEqual({
      args: [
        {
          alias: null,
          default: void 0,
          name: 'a',
          type: 'positional',
        },
        {
          alias: null,
          default: '2',
          name: 'b',
          type: 'positional',
        },
        {
          alias: null,
          default: void 0,
          props: [
            {
              alias: null,
              default: '3',
              name: 'c',
              type: 'positional',
            },
          ],
          type: 'unpack',
        },
        {
          alias: null,
          default: void 0,
          name: 'r',
          type: 'rest',
        }
      ],
      argsDeclaration: 'a,b = 2,{c = 3},...r',
      isAsync: true,
      isGenerator: false,
      name: 'es7AsyncFunction',
    });
  });

  it('should parse ES7 async arrow function', () => {
    const annotation = inspection.parseFunctionAnnotation(es7AsyncArrowFunction);

    expect(annotation).toEqual({
      args: [
        {
          alias: null,
          default: void 0,
          name: 'a',
          type: 'positional',
        },
        {
          alias: null,
          default: '2',
          name: 'b',
          type: 'positional',
        },
        {
          alias: null,
          default: void 0,
          props: [
            {
              alias: null,
              default: '3',
              name: 'c',
              type: 'positional',
            },
          ],
          type: 'unpack',
        },
        {
          alias: null,
          default: void 0,
          name: 'r',
          type: 'rest',
        }
      ],
      argsDeclaration: 'a,b = 2,{c = 3},...r',
      isAsync: true,
      isGenerator: false,
      name: null,
    });
  });

  it('should parse ES7 async generator function', () => {
    const annotation = inspection.parseFunctionAnnotation(es7AsyncGeneratorFunction);

    expect(annotation).toEqual({
      args: [
        {
          alias: null,
          default: void 0,
          name: 'a',
          type: 'positional',
        },
        {
          alias: null,
          default: '2',
          name: 'b',
          type: 'positional',
        },
        {
          alias: null,
          default: void 0,
          props: [
            {
              alias: null,
              default: '3',
              name: 'c',
              type: 'positional',
            },
          ],
          type: 'unpack',
        },
        {
          alias: null,
          default: void 0,
          name: 'r',
          type: 'rest',
        }
      ],
      argsDeclaration: 'a,b = 2,{c = 3},...r',
      isAsync: true,
      isGenerator: true,
      name: 'es7AsyncGeneratorFunction',
    });
  });

  describe('when uses ES5 notation', () => {
    it('should copy constructor', () => {
      const Copy = inspection.copyConstructor(Es5);

      expect(Copy).not.toBe(Es5);
      expect(Copy instanceof Function).toBeTruthy();
      expect(Copy.prototype).toBe(Es5.prototype);
    });

    it('should copy prototype', () => {
      const Copy = inspection.copyPrototype(Es5);

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

      const ScopyCopy = inspection.copyScope(C);

      expect(ScopyCopy.a).toBe(A.prototype.a);
      expect(ScopyCopy.b).toBe(B.prototype.b);
      expect(ScopyCopy.c).toBe(C.prototype.c);
      expect(ScopyCopy.x).toBe(B.prototype.x);
      expect(ScopyCopy.y).toBe(C.prototype.y);
    });
  });

  describe('when uses ES6 notation', () => {
    it('should copy constructor', () => {
      const Copy = inspection.copyConstructor(Es6);

      expect(Copy).not.toBe(Es6);
      expect(Copy instanceof Function).toBeTruthy();
      expect(Copy.prototype).toBe(Es6.prototype);
    });

    it('should copy prototype', () => {
      const Copy = inspection.copyPrototype(Es6);

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

      const ScopyCopy = inspection.copyScope(C);

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
        const obj = inspection.callConstructor(Clazz, ctx, args);

        expect(obj.args).toEqual(args);
      }
    });

    it('should throw exception with excessive number of arguments', () => {
      expect(() => {
        inspection.callConstructor(function () {

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

      const copy = new (inspection.copyConstructor(Cls))(0, 1, 2, 3, 4, 5, 6, 7, 8, 9);

      expect(copy instanceof Cls).toBeTruthy();
    });

    it('should call with arguments', () => {
      function Cls() {
        this.args = Array.prototype.slice.call(arguments);
        this.context = this;

        return this;
      }

      const copy = new (inspection.copyConstructor(Cls))(0, 1, 2, 3, 4, 5, 6, 7, 8, 9);

      expect(copy.args).toEqual([0, 1, 2, 3, 4, 5, 6, 7, 8, 9]);
    });

    it('should returns another "this"', () => {
      function Cls() {
        this.args = Array.prototype.slice.call(arguments);
        this.context = this;

        return Cls;
      }

      const copy = new (inspection.copyConstructor(Cls))(0, 1, 2, 3, 4, 5, 6, 7, 8, 9);

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

    expect(inspection.getAncestors(C)).toEqual([
      C,
      B,
      A,
    ]);
  });
});
