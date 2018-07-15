const unitsnap = require('..');
const instance = require('../src/instance');

describe('instance', () => {
  it('should copy constructor', () => {
    function Clazz () {

    }

    Clazz.prototype = {
      a: 1,
      b: 2,
      c: 3,
    };

    const ClazzCopy = instance.copyConstructor(Clazz);

    expect(ClazzCopy).not.toBe(Clazz);
    expect(ClazzCopy instanceof Function).toBeTruthy();
    expect(ClazzCopy.prototype).toBe(Clazz.prototype);
  });

  it('should copy prototype', () => {
    function Clazz () {

    }

    Clazz.prototype = {
      a: 1,
      b: 2,
      c: 3,
    };

    const PrototypeCopy = instance.copyPrototype(Clazz);

    expect(PrototypeCopy).not.toBe(Clazz.prototype);
    expect(PrototypeCopy instanceof Object).toBeTruthy();
    expect(PrototypeCopy).toEqual(Clazz.prototype);
  });

  it('should copy scope of ES5 declaration', () => {
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

    expect(ScopyCopy).toEqual({
      a: A.prototype.a,
      b: B.prototype.b,
      c: C.prototype.c,
      x: B.prototype.x,
      y: C.prototype.y,
    });
  });

  it('should copy scope of ES6 declaration', () => {
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

    expect(ScopyCopy).toEqual({
      a: A.prototype.a,
      b: B.prototype.b,
      c: C.prototype.c,
      x: B.prototype.x,
      y: C.prototype.y,
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
      function Clazz() {
        this.args = Array.prototype.slice.call(arguments);
        this.context = this;

        return this;
      }

      const copy = new (instance.copyConstructor(Clazz))(0, 1, 2, 3, 4, 5, 6, 7, 8, 9);

      expect(copy instanceof Clazz).toBeTruthy();
    });

    it('should call with arguments', () => {
      function Clazz() {
        this.args = Array.prototype.slice.call(arguments);
        this.context = this;

        return this;
      }

      const copy = new (instance.copyConstructor(Clazz))(0, 1, 2, 3, 4, 5, 6, 7, 8, 9);

      expect(copy.args).toEqual([0, 1, 2, 3, 4, 5, 6, 7, 8, 9]);
    });

    it('should returns another "this"', () => {
      function Clazz() {
        this.args = Array.prototype.slice.call(arguments);
        this.context = this;

        return Clazz;
      }

      const copy = new (instance.copyConstructor(Clazz))(0, 1, 2, 3, 4, 5, 6, 7, 8, 9);

      expect(copy).toBe(Clazz);
    });
  });
});
