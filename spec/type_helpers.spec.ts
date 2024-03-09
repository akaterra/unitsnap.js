import * as unitsnap from '..';
import { DATA, TYPE } from '../src/const';

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

      expect(t.serialize()).toEqual({[ DATA ]: null, [ TYPE ]: 'any'});
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

      expect(t.serialize(true)).toEqual({[ DATA ]: null, [ TYPE ]: 'boolean'});
    });

    it('should serialize not instance of boolean value', () => {
      const t = new unitsnap._BooleanType();

      expect(t.serialize(1)).toEqual({[ DATA ]: 1, [ TYPE ]: 'not:boolean'});
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

      expect(t.serialize(new Date())).toEqual({[ DATA ]: 'Date', [ TYPE ]: 'classOf'});
    });

    it('should serialize not class of value', () => {
      const t = new unitsnap._ClassOf(Date);

      expect(t.serialize(new D())).toEqual({[ DATA ]: 'Date ≠ D', [ TYPE ]: 'not:classOf'});
    });
  });

  describe('Copy', () => {
    it('should check and resolve any value', () => {
      const t = new unitsnap._Copy();

      for (const v of [1, '1', null, false, Object, {}, []]) {
        expect(t.check(v)).toBeTruthy();
      }
    });

    it('should serialize value as copy', () => {
      const t = new unitsnap._Copy();
      const o = { a: 1, b: {} };

      expect(t.serialize(o)).not.toBe(o);
      expect(t.serialize(o).b).not.toBe(o.b);
      expect(t.serialize(o)).toEqual(o);
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

      expect(t.serialize(new Date())).toEqual({[ DATA ]: null, [ TYPE ]: 'date'});
    });

    it('should serialize not instance of date value', () => {
      const t = new unitsnap._DateType();

      expect(t.serialize(1)).toEqual({[ DATA ]: null, [ TYPE ]: 'not:date'});
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

      expect(t.serialize(1)).toEqual({[ DATA ]: '1,2,3,"1"', [ TYPE ]: 'in'});
    });

    it('should serialize value is not in', () => {
      const t = unitsnap.In(1, 2, 3, "1");

      expect(t.serialize(0)).toEqual({[ DATA ]: '1,2,3,"1"', [ TYPE ]: 'not:in'});
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

      expect(t.serialize(new Date('2018-01-01'))).toEqual({[ DATA ]: 'Date', [ TYPE ]: 'instanceOf'});
    });

    it('should serialize not instance of value', () => {
      const t = new unitsnap._InstanceOf(Date);

      expect(t.serialize(123)).toEqual({[ DATA ]: 'Date ⊈ Number', [ TYPE ]: 'not:instanceOf'});
    });
  });

  describe('NullType', () => {
    it('should check and resolve undefined value', () => {
      const t = new unitsnap._NullType();

      for (const v of [null]) {
        expect(t.check(v)).toBeTruthy();
      }
    });

    it('should check and reject defined value', () => {
      const t = new unitsnap._NullType();

      for (const v of [1, '1', undefined, false, Object, {}, []]) {
        expect(t.check(v)).toBeFalsy();
      }
    });

    it('should serialize null value', () => {
      const t = new unitsnap._NullType();

      expect(t.serialize(null)).toEqual({[ DATA ]: null, [ TYPE ]: 'null'});
    });

    it('should serialize null value', () => {
      const t = new unitsnap._NullType();

      expect(t.serialize(1)).toEqual({[ DATA ]: 1, [ TYPE ]: 'not:null'});
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

      expect(t.serialize(5)).toEqual({[ DATA ]: `5 ±0.01`, [ TYPE ]: 'numberIsCloseTo'});
    });

    it('should serialize number not close to', () => {
      const t = new unitsnap._NumberIsCloseTo(5, 0.01);

      expect(t.serialize(4)).toEqual({[ DATA ]: `4 ∉ 5 ±0.01`, [ TYPE ]: 'not:numberIsCloseTo'});
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

      expect(t.serialize(5)).toEqual({[ DATA ]: `5 ±0.01`, [ TYPE ]: 'numberIsPreciseTo'});
    });

    it('should serialize number not precise to', () => {
      const t = new unitsnap._NumberIsPreciseTo(5, 2);

      expect(t.serialize(4)).toEqual({[ DATA ]: `4 ∉ 5 ±0.01`, [ TYPE ]: 'not:numberIsPreciseTo'});
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

      expect(t.serialize(1)).toEqual({[ DATA ]: null, [ TYPE ]: 'number'});
    });

    it('should serialize instance of not number value', () => {
      const t = new unitsnap._NumberType();

      expect(t.serialize('1')).toEqual({[ DATA ]: '1', [ TYPE ]: 'not:number'});
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

      expect(t.serialize(3)).toEqual({[ DATA ]: `1 .. 5`, [ TYPE ]: 'range'});
    });

    it('should serialize not value in range', () => {
      const t = new unitsnap._Range(1, 5);

      expect(t.serialize(0)).toEqual({[ DATA ]: `0 ∉ 1 .. 5`, [ TYPE ]: 'not:range'});
    });

    it('should serialize value in range (Date instance)', () => {
      const t = new unitsnap._Range(new Date('2020-01-01'), new Date('2020-01-02'));

      expect(t.serialize(new Date('2020-01-01T12:00:00.000Z'))).toEqual({[ DATA ]: `2020-01-01T00:00:00.000Z .. 2020-01-02T00:00:00.000Z`, [ TYPE ]: 'range'});
    });

    it('should serialize value not in range (Date instance)', () => {
      const t = new unitsnap._Range(new Date('2020-01-01'), new Date('2020-01-02'));

      expect(t.serialize(new Date('2020-01-03'))).toEqual({[ DATA ]: `2020-01-03T00:00:00.000Z ∉ 2020-01-01T00:00:00.000Z .. 2020-01-02T00:00:00.000Z`, [ TYPE ]: 'not:range'});
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

      expect(t.serialize('')).toEqual({[ DATA ]: null, [ TYPE ]: 'string'});
    });

    it('should serialize not instance of string value', () => {
      const t = new unitsnap._StringType();

      expect(t.serialize(1)).toEqual({[ DATA ]: 1, [ TYPE ]: 'not:string'});
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

      expect(t.serialize(undefined)).toEqual({[ DATA ]: null, [ TYPE ]: 'undefined'});
    });

    it('should serialize defined value', () => {
      const t = new unitsnap._UndefinedType();

      expect(t.serialize(1)).toEqual({[ DATA ]: 1, [ TYPE ]: 'not:undefined'});
    });
  });
});
