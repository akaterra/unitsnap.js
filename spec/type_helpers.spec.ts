import * as unitsnap from '..';

describe('Type helpers', () => {
  describe('AnyType', () => {
    it('should check and resolve any value', () => {
      const t = new unitsnap._AnyType();

      for (const v of [1, '1', null, false, Object, {}, []]) {
        expect(t.check(v)).toBeTruthy();
      }
    });

    it('should serialize value', () => {
      const t = new unitsnap._AnyType();

      expect(t.serialize()).toEqual({$$data: null, $$type: 'any'});
    });
  });

  describe('BooleanType', () => {
    it('should check and resolve instance of boolean value', () => {
      const t = new unitsnap._BooleanType();

      for (const v of [true, false]) {
        expect(t.check(v)).toBeTruthy();
      }
    });

    it('should check and reject not instance of boolean value', () => {
      const t = new unitsnap._BooleanType();

      for (const v of [1, '1', null, Object, {}, []]) {
        expect(t.check(v)).toBeFalsy();
      }
    });

    it('should serialize instance of boolean value', () => {
      const t = new unitsnap._BooleanType();

      expect(t.serialize(true)).toEqual({$$data: null, $$type: 'boolean'});
    });

    it('should serialize not instance of boolean value', () => {
      const t = new unitsnap._BooleanType();

      expect(t.serialize(1)).toEqual({$$data: 1, $$type: 'not:boolean'});
    });
  });

  describe('ClassOf', () => {
    class D extends Date {

    }

    it('should check and resolve class of value', () => {
      const t = new unitsnap._ClassOf(Date);

      for (const v of [new Date()]) {
        expect(t.check(v)).toBeTruthy();
      }
    });

    it('should check and reject not class of value', () => {
      const t = new unitsnap._ClassOf(Date);

      for (const v of [new D()]) {
        expect(t.check(v)).toBeFalsy();
      }
    });

    it('should serialize class of value', () => {
      const t = new unitsnap._ClassOf(Date);

      expect(t.serialize(new Date())).toEqual({$$data: 'Date', $$type: 'classOf'});
    });

    it('should serialize not class of value', () => {
      const t = new unitsnap._ClassOf(Date);

      expect(t.serialize(new D())).toEqual({$$data: 'Date ≠ D', $$type: 'not:classOf'});
    });
  });

  describe('DateType', () => {
    it('should check and resolve instance of date value', () => {
      const t = new unitsnap._DateType();

      for (const v of [new Date()]) {
        expect(t.check(v)).toBeTruthy();
      }
    });

    it('should check and reject not instance of date value', () => {
      const t = new unitsnap._DateType();

      for (const v of [1, '1', null, false, Object, {}, []]) {
        expect(t.check(v)).toBeFalsy();
      }
    });

    it('should serialize instance of date value', () => {
      const t = new unitsnap._DateType();

      expect(t.serialize(new Date())).toEqual({$$data: null, $$type: 'date'});
    });

    it('should serialize not instance of date value', () => {
      const t = new unitsnap._DateType();

      expect(t.serialize(1)).toEqual({$$data: null, $$type: 'not:date'});
    });
  });

  describe('DateValue', () => {
    it('should check and resolve instance of date value', () => {
      const t = new unitsnap._DateValue();

      for (const v of [new Date()]) {
        expect(t.check(v)).toBeTruthy();
      }
    });

    it('should check and reject not instance of date value', () => {
      const t = new unitsnap._DateValue();

      for (const v of [1, '1', null, false, Object, {}, []]) {
        expect(t.check(v)).toBeFalsy();
      }
    });

    it('should serialize value as string with date in ISO format', () => {
      const t = new unitsnap._DateValue();

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

  describe('In', () => {
    it('should check and resolve value is in', () => {
      const t = unitsnap.In(1, 2, 3);

      for (const v of [1, 3]) {
        expect(t.check(v)).toBeTruthy();
      }
    });

    it('should check and reject value is not in', () => {
      const t = unitsnap.In(1, 2, 3);

      for (const v of [0, 4, '1', '2', '3']) {
        expect(t.check(v)).toBeFalsy();
      }
    });

    it('should serialize value is in', () => {
      const t = unitsnap.In(1, 2, 3, "1");

      expect(t.serialize(1)).toEqual({$$data: '1,2,3,"1"', $$type: 'in'});
    });

    it('should serialize value is not in', () => {
      const t = unitsnap.In(1, 2, 3, "1");

      expect(t.serialize(0)).toEqual({$$data: '1,2,3,"1"', $$type: 'not:in'});
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

    it('should serialize instance of value', () => {
      const t = new unitsnap._InstanceOf(Date);

      expect(t.serialize(new Date('2018-01-01'))).toEqual({$$data: 'Date', $$type: 'instanceOf'});
    });

    it('should serialize not instance of value', () => {
      const t = new unitsnap._InstanceOf(Date);

      expect(t.serialize(123)).toEqual({$$data: 'Date ⊈ Number', $$type: 'not:instanceOf'});
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

    it('should serialize number close to', () => {
      const t = new unitsnap._NumberIsCloseTo(5, 0.01);

      expect(t.serialize(5)).toEqual({$$data: `5 ±0.01`, $$type: 'numberIsCloseTo'});
    });

    it('should serialize number not close to', () => {
      const t = new unitsnap._NumberIsCloseTo(5, 0.01);

      expect(t.serialize(4)).toEqual({$$data: `4 ∉ 5 ±0.01`, $$type: 'not:numberIsCloseTo'});
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

    it('should serialize number precise to', () => {
      const t = new unitsnap._NumberIsPreciseTo(5, 2);

      expect(t.serialize(5)).toEqual({$$data: `5 ±0.01`, $$type: 'numberIsPreciseTo'});
    });

    it('should serialize number not precise to', () => {
      const t = new unitsnap._NumberIsPreciseTo(5, 2);

      expect(t.serialize(4)).toEqual({$$data: `4 ∉ 5 ±0.01`, $$type: 'not:numberIsPreciseTo'});
    });
  });

  describe('NumberType', () => {
    it('should check and resolve instance of number value', () => {
      const t = new unitsnap._NumberType();

      for (const v of [1, NaN]) {
        expect(t.check(v)).toBeTruthy();
      }
    });

    it('should check and reject not instance of number value', () => {
      const t = new unitsnap._NumberType();

      for (const v of ['1', null, false, Object, {}, []]) {
        expect(t.check(v)).toBeFalsy();
      }
    });

    it('should serialize instance of number value', () => {
      const t = new unitsnap._NumberType();

      expect(t.serialize(1)).toEqual({$$data: null, $$type: 'number'});
    });

    it('should serialize instance of not number value', () => {
      const t = new unitsnap._NumberType();

      expect(t.serialize('1')).toEqual({$$data: '1', $$type: 'not:number'});
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

    it('should serialize value in range', () => {
      const t = new unitsnap._Range(1, 5);

      expect(t.serialize(3)).toEqual({$$data: `1 .. 5`, $$type: 'range'});
    });

    it('should serialize not value in range', () => {
      const t = new unitsnap._Range(1, 5);

      expect(t.serialize(0)).toEqual({$$data: `0 ∉ 1 .. 5`, $$type: 'not:range'});
    });

    it('should serialize value in range (Date instance)', () => {
      const t = new unitsnap._Range(new Date('2020-01-01'), new Date('2020-01-02'));

      expect(t.serialize(new Date('2020-01-01T12:00:00.000Z'))).toEqual({$$data: `2020-01-01T00:00:00.000Z .. 2020-01-02T00:00:00.000Z`, $$type: 'range'});
    });

    it('should serialize value not in range (Date instance)', () => {
      const t = new unitsnap._Range(new Date('2020-01-01'), new Date('2020-01-02'));

      expect(t.serialize(new Date('2020-01-03'))).toEqual({$$data: `2020-01-03T00:00:00.000Z ∉ 2020-01-01T00:00:00.000Z .. 2020-01-02T00:00:00.000Z`, $$type: 'not:range'});
    });
  });

  describe('StringType', () => {
    it('should check and resolve instance of string value', () => {
      const t = new unitsnap._StringType();

      for (const v of ['1']) {
        expect(t.check(v)).toBeTruthy();
      }
    });

    it('should check and reject not instance of string value', () => {
      const t = new unitsnap._StringType();

      for (const v of [1, null, false, Object, {}, []]) {
        expect(t.check(v)).toBeFalsy();
      }
    });

    it('should serialize instance of string value', () => {
      const t = new unitsnap._StringType();

      expect(t.serialize('')).toEqual({$$data: null, $$type: 'string'});
    });

    it('should serialize not instance of string value', () => {
      const t = new unitsnap._StringType();

      expect(t.serialize(1)).toEqual({$$data: 1, $$type: 'not:string'});
    });
  });

  describe('UndefinedType', () => {
    it('should check and resolve undefined value', () => {
      const t = new unitsnap._UndefinedType();

      for (const v of [undefined]) {
        expect(t.check(v)).toBeTruthy();
      }
    });

    it('should check and reject defined value', () => {
      const t = new unitsnap._UndefinedType();

      for (const v of [1, '1', null, false, Object, {}, []]) {
        expect(t.check(v)).toBeFalsy();
      }
    });

    it('should serialize undefined value', () => {
      const t = new unitsnap._UndefinedType();

      expect(t.serialize(undefined)).toEqual({$$data: null, $$type: 'undefined'});
    });

    it('should serialize defined value', () => {
      const t = new unitsnap._UndefinedType();

      expect(t.serialize(1)).toEqual({$$data: 1, $$type: 'not:undefined'});
    });
  });
});
