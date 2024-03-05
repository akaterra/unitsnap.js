import * as unitsnap from '..';

describe('Type helpers', () => {
  describe('AnyType', () => {
    it('should check and resolve any value', () => {
      const t = new unitsnap.AnyType();

      for (const v of [1, '1', null, false, Object, {}, []]) {
        expect(t.check(v)).toBeTruthy();
      }
    });

    it('should serialize value', () => {
      const t = new unitsnap.AnyType();

      expect(t.serialize()).toEqual({$$data: null, $$type: 'any'});
    });
  });

  describe('BooleanType', () => {
    it('should check and resolve boolean value', () => {
      const t = new unitsnap.BooleanType();

      for (const v of [true, false]) {
        expect(t.check(v)).toBeTruthy();
      }
    });

    it('should check and reject not boolean value', () => {
      const t = new unitsnap.BooleanType();

      for (const v of [1, '1', null, Object, {}, []]) {
        expect(t.check(v)).toBeFalsy();
      }
    });

    it('should serialize value', () => {
      const t = new unitsnap.BooleanType();

      expect(t.serialize()).toEqual({$$data: null, $$type: 'boolean'});
    });
  });

  describe('ClassOf', () => {
    it('should check and resolve class of value', () => {
      const t = new unitsnap._ClassOf(Date);

      for (const v of [new Date()]) {
        expect(t.check(v)).toBeTruthy();
      }
    });

    it('should check and reject not class of value', () => {
      const t = new unitsnap._ClassOf(Date);

      class D extends Date {

      }

      for (const v of [new D()]) {
        expect(t.check(v)).toBeFalsy();
      }
    });

    it('should serialize value', () => {
      const t = new unitsnap._ClassOf(Date);

      expect(t.serialize()).toEqual({$$data: 'Date', $$type: 'classOf'});
    });
  });

  describe('DateType', () => {
    it('should check and resolve instance of date value', () => {
      const t = new unitsnap.DateType();

      for (const v of [new Date()]) {
        expect(t.check(v)).toBeTruthy();
      }
    });

    it('should check and reject not instance of date value', () => {
      const t = new unitsnap.DateType();

      for (const v of [1, '1', null, false, Object, {}, []]) {
        expect(t.check(v)).toBeFalsy();
      }
    });

    it('should serialize value', () => {
      const t = new unitsnap.DateType();

      expect(t.serialize()).toEqual({$$data: null, $$type: 'date'});
    });
  });

  describe('DateValue', () => {
    it('should check and resolve instance of date value', () => {
      const t = new unitsnap.DateValue();

      for (const v of [new Date()]) {
        expect(t.check(v)).toBeTruthy();
      }
    });

    it('should check and reject not instance of date value', () => {
      const t = new unitsnap.DateValue();

      for (const v of [1, '1', null, false, Object, {}, []]) {
        expect(t.check(v)).toBeFalsy();
      }
    });

    it('should serialize value as string with date in ISO format', () => {
      const t = new unitsnap.DateValue();

      expect(t.serialize(new Date('2018-01-01'))).toEqual('2018-01-01T00:00:00.000Z');
    });
  });

  describe('Ignore', () => {
    it('should check and resolve any value', () => {
      const t = new unitsnap.Ignore();

      for (const v of [1, '1', null, false, Object, {}, []]) {
        expect(t.check(v)).toBeTruthy();
      }
    });

    it('should serialize value as Ignore ref', () => {
      const t = new unitsnap.Ignore();

      expect(t.serialize()).toBe(unitsnap.Ignore);
    });
  });

  describe('InstanceOf', () => {
    it('should check and resolve instance of value', () => {
      const t = new unitsnap._InstanceOf(Date);

      class D extends Date {

      }

      for (const v of [new Date(), new D()]) {
        expect(t.check(v)).toBeTruthy();
      }
    });

    it('should check and reject not instance of value', () => {
      const t = new unitsnap._InstanceOf(Date);

      for (const v of [new Function()]) {
        expect(t.check(v)).toBeFalsy();
      }
    });

    it('should serialize value', () => {
      const t = new unitsnap._InstanceOf(Date);

      expect(t.serialize(new Date('2018-01-01'))).toEqual({$$data: 'Date', $$type: 'instanceOf'});
    });
  });

  describe('NumberIsCloseTo', () => {
    it('should check and resolve number close to', () => {
      const t = new unitsnap._NumberIsCloseTo(5, 0.01);

      for (const v of [4.99, 5, 5.01]) {
        expect(t.check(v)).toBeTruthy();
      }
    });

    it('should check and reject number not close to', () => {
      const t = new unitsnap._NumberIsCloseTo(5, 0.01);

      for (const v of [4.98, 5.02]) {
        expect(t.check(v)).toBeFalsy();
      }
    });

    it('should serialize value', () => {
      const t = new unitsnap._NumberIsCloseTo(5, 0.01);

      expect(t.serialize()).toEqual({$$data: `5 ±0.01`, $$type: 'numberIsCloseTo'});
    });
  });

  describe('NumberIsPreciseTo', () => {
    it('should check and resolve number precise to', () => {
      const t = new unitsnap._NumberIsPreciseTo(5, 2);

      for (const v of [4.99, 5, 5.01]) {
        expect(t.check(v)).toBeTruthy();
      }
    });

    it('should check and reject number not precise to', () => {
      const t = new unitsnap._NumberIsPreciseTo(5, 2);

      for (const v of [4.98, 5.02]) {
        expect(t.check(v)).toBeFalsy();
      }
    });

    it('should serialize value', () => {
      const t = new unitsnap._NumberIsPreciseTo(5, 2);

      expect(t.serialize()).toEqual({$$data: `5 ±0.01`, $$type: 'numberIsPreciseTo'});
    });
  });

  describe('NumberType', () => {
    it('should check and resolve instance of number value', () => {
      const t = new unitsnap.NumberType();

      for (const v of [1, NaN]) {
        expect(t.check(v)).toBeTruthy();
      }
    });

    it('should check and reject not instance of number value', () => {
      const t = new unitsnap.NumberType();

      for (const v of ['1', null, false, Object, {}, []]) {
        expect(t.check(v)).toBeFalsy();
      }
    });

    it('should serialize value', () => {
      const t = new unitsnap.NumberType();

      expect(t.serialize()).toEqual({$$data: null, $$type: 'number'});
    });
  });

  describe('Range', () => {
    it('should check and resolve value in range', () => {
      for (const [ min, max, v ] of [
        [ 0, 10, 5 ],
        [ 'a', 'abc', 'aa' ],
        [ new Date('2020-01-01'), new Date('2020-02-01'), new Date('2020-01-15') ],
      ]) {
        const t = new unitsnap._Range(min as any, max as any);

        expect(t.check(v)).toBeTruthy();
      }
    });

    it('should check and reject value not in range', () => {
      for (const [ min, max, v ] of [
        [ 0, 10, -1 ], [ 0, 10, 11 ],
        [ 'a', 'abc', '' ], [ 'a', 'abc', 'b' ], [ 0, 5, '3' ],
        [ new Date('2020-01-01'), new Date('2020-02-01'), new Date('2021-02-02') ], [ new Date('2020-01-01'), new Date('2020-02-01'), new Date('2019-12-31') ],
      ]) {
        const t = new unitsnap._Range(min as any, max as any);

        expect(t.check(v)).toBeFalsy();
      }
    });

    it('should serialize value', () => {
      const t = new unitsnap._Range(1, 5);

      expect(t.serialize()).toEqual({$$data: `1 .. 5`, $$type: 'range'});
    });

    it('should serialize value (Date instance)', () => {
      const t = new unitsnap._Range(new Date('2020-01-01'), new Date('2020-01-02'));

      expect(t.serialize()).toEqual({$$data: `2020-01-01T00:00:00.000Z .. 2020-01-02T00:00:00.000Z`, $$type: 'range'});
    });
  });

  describe('StringType', () => {
    it('should check and resolve instance of string value', () => {
      const t = new unitsnap.StringType();

      for (const v of ['1']) {
        expect(t.check(v)).toBeTruthy();
      }
    });

    it('should check and reject not instance of string value', () => {
      const t = new unitsnap.StringType();

      for (const v of [1, null, false, Object, {}, []]) {
        expect(t.check(v)).toBeFalsy();
      }
    });

    it('should serialize value', () => {
      const t = new unitsnap.StringType();

      expect(t.serialize()).toEqual({$$data: null, $$type: 'string'});
    });
  });

  describe('UndefinedType', () => {
    it('should check and resolve undefined value', () => {
      const t = new unitsnap.UndefinedType();

      for (const v of [undefined]) {
        expect(t.check(v)).toBeTruthy();
      }
    });

    it('should check and reject not defined value', () => {
      const t = new unitsnap.UndefinedType();

      for (const v of [1, '1', null, false, Object, {}, []]) {
        expect(t.check(v)).toBeFalsy();
      }
    });

    it('should serialize value', () => {
      const t = new unitsnap.UndefinedType();

      expect(t.serialize()).toEqual({$$data: null, $$type: 'undefined'});
    });
  });
});
