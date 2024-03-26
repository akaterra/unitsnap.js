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
    it('should check and resolve instance of boolean type', () => {
      const t = new unitsnap._BooleanType();

      for (const v of [true, false]) {
        expect(t.check(v)).toBeTruthy();
      }
    });

    it('should check and resolve instance of not boolean type', () => {
      const t = new unitsnap._BooleanType().not();

      for (const v of [1, '1', null, Object, {}, []]) {
        expect(t.check(v)).toBeTruthy();
      }
    });

    it('should check and reject not instance of boolean type', () => {
      const t = new unitsnap._BooleanType();

      for (const v of [1, '1', null, Object, {}, []]) {
        expect(t.check(v)).toBeFalsy();
      }
    });

    it('should serialize instance of boolean type', () => {
      const t = new unitsnap._BooleanType();

      expect(t.serialize(true)).toEqual({[ DATA ]: null, [ TYPE ]: 'boolean'});
    });

    it('should serialize not instance of boolean type', () => {
      const t = new unitsnap._BooleanType();

      expect(t.serialize(1)).toEqual({[ DATA ]: 1, [ TYPE ]: 'not:boolean'});
    });

    it('should serialize not instance of boolean type negative', () => {
      const t = new unitsnap._BooleanType().not();

      expect(t.serialize(1)).toEqual({[ DATA ]: null, [ TYPE ]: 'not:boolean'});
    });

    it('should serialize instance of boolean type negative', () => {
      const t = new unitsnap._BooleanType().not();

      expect(t.serialize(true)).toEqual({[ DATA ]: true, [ TYPE ]: 'boolean'});
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
    it('should check and resolve instance of date type', () => {
      const t = new unitsnap._DateType();

      for (const v of [new Date()]) {
        expect(t.check(v)).toBeTruthy();
      }
    });

    it('should check and resolve instance of not date type', () => {
      const t = new unitsnap._DateType().not();

      for (const v of [1, '1', null, false, Object, {}, []]) {
        expect(t.check(v)).toBeTruthy();
      }
    });

    it('should check and reject not instance of date type', () => {
      const t = new unitsnap._DateType();

      for (const v of [1, '1', null, false, Object, {}, []]) {
        expect(t.check(v)).toBeFalsy();
      }
    });

    it('should serialize instance of date type', () => {
      const t = new unitsnap._DateType();

      expect(t.serialize(new Date())).toEqual({[ DATA ]: null, [ TYPE ]: 'date'});
    });
    it('should serialize not instance of date type', () => {
      const t = new unitsnap._DateType();

      expect(t.serialize(1)).toEqual({[ DATA ]: 1, [ TYPE ]: 'not:date'});
    });

    it('should serialize not instance of date type negative', () => {
      const t = new unitsnap._DateType().not();

      expect(t.serialize(1)).toEqual({[ DATA ]: null, [ TYPE ]: 'not:date'});
    });

    it('should serialize instance of date type negative', () => {
      const t = new unitsnap._DateType().not();

      expect(t.serialize(new Date('2020-01-01'))).toEqual({[ DATA ]: new Date('2020-01-01'), [ TYPE ]: 'date'});
    });
  });

  describe('DateValue', () => {
    it('should check and resolve instance of date type', () => {
      const t = new unitsnap._DateValue();

      for (const v of [new Date()]) {
        expect(t.check(v)).toBeTruthy();
      }
    });

    it('should check and reject not instance of date type', () => {
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

    it('should check and resolve value is not in', () => {
      const t = unitsnap.In(1, 2, 3).not();

      for (const v of [0, 4, '1', '2', '3']) {
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

      expect(t.serialize(0)).toEqual({[ DATA ]: '0 ∉ 1,2,3,"1"', [ TYPE ]: 'not:in'});
    });

    it('should serialize value is not in negative', () => {
      const t = unitsnap.In(1, 2, 3, "1").not();

      expect(t.serialize(0)).toEqual({[ DATA ]: '1,2,3,"1"', [ TYPE ]: 'not:in'});
    });

    it('should serialize value is in negative', () => {
      const t = unitsnap.In(1, 2, 3, "1").not();

      expect(t.serialize(1)).toEqual({[ DATA ]: '1 ∈ 1,2,3,"1"', [ TYPE ]: 'in'});
    });
  });

  describe('InstanceOf', () => {
    it('should check and resolve instance of type', () => {
      const t = new unitsnap._InstanceOf(Date);

      class D extends Date {

      }

      for (const v of [new Date(), new D()]) {
        expect(t.check(v)).toBeTruthy();
      }
    });

    it('should check and resolve not instance of type', () => {
      const t = new unitsnap._InstanceOf(Date).not();

      for (const v of [new Function()]) {
        expect(t.check(v)).toBeTruthy();
      }
    });

    it('should check and reject not instance of type', () => {
      const t = new unitsnap._InstanceOf(Date);

      for (const v of [new Function()]) {
        expect(t.check(v)).toBeFalsy();
      }
    });

    it('should serialize instance of type', () => {
      const t = new unitsnap._InstanceOf(Date);

      expect(t.serialize(new Date('2018-01-01'))).toEqual({[ DATA ]: 'Date', [ TYPE ]: 'instanceOf'});
    });

    it('should serialize not instance of type', () => {
      const t = new unitsnap._InstanceOf(Date);

      expect(t.serialize(123)).toEqual({[ DATA ]: 'Date ⊈ Number', [ TYPE ]: 'not:instanceOf'});
    });

    it('should serialize not instance of type negative', () => {
      const t = new unitsnap._InstanceOf(Date).not();

      expect(t.serialize(123)).toEqual({[ DATA ]: 'Date', [ TYPE ]: 'not:instanceOf'});
    });

    it('should serialize instance of type negative', () => {
      const t = new unitsnap._InstanceOf(Date).not();

      expect(t.serialize(new Date('2018-01-01'))).toEqual({[ DATA ]: 'Date ⊆ Date', [ TYPE ]: 'instanceOf'});
    });
  });

  describe('NullType', () => {
    it('should check and resolve null type', () => {
      const t = new unitsnap._NullType();

      for (const v of [null]) {
        expect(t.check(v)).toBeTruthy();
      }
    });

    it('should check and resolve not null type', () => {
      const t = new unitsnap._NullType().not();

      for (const v of [1, '1', undefined, false, Object, {}, []]) {
        expect(t.check(v)).toBeTruthy();
      }
    });

    it('should check and reject not null type', () => {
      const t = new unitsnap._NullType();

      for (const v of [1, '1', undefined, false, Object, {}, []]) {
        expect(t.check(v)).toBeFalsy();
      }
    });

    it('should serialize null type', () => {
      const t = new unitsnap._NullType();

      expect(t.serialize(null)).toEqual({[ DATA ]: null, [ TYPE ]: 'null'});
    });

    it('should serialize not null type', () => {
      const t = new unitsnap._NullType();

      expect(t.serialize(1)).toEqual({[ DATA ]: 1, [ TYPE ]: 'not:null'});
    });

    it('should serialize not null type negative', () => {
      const t = new unitsnap._NullType().not();

      expect(t.serialize(1)).toEqual({[ DATA ]: null, [ TYPE ]: 'not:null'});
    });

    it('should serialize null type negative', () => {
      const t = new unitsnap._NullType().not();

      expect(t.serialize(null)).toEqual({[ DATA ]: null, [ TYPE ]: 'null'});
    });
  });

  describe('NumberIsCloseTo', () => {
    it('should check and resolve number close to', () => {
      const t = new unitsnap._NumberIsCloseTo(5, 0.01);

      for (const v of [ 4.99, 5, 5.01 ]) {
        expect(t.check(v)).toBeTruthy();
      }
    });

    it('should check and resolve number close to', () => {
      const t = new unitsnap._NumberIsCloseTo(Infinity, 0.01);

      for (const v of [ Infinity ]) {
        expect(t.check(v)).toBeTruthy();
      }
    });

    it('should check and resolve number close to', () => {
      const t = new unitsnap._NumberIsCloseTo(-Infinity, 0.01);

      for (const v of [ -Infinity ]) {
        expect(t.check(v)).toBeTruthy();
      }
    });

    it('should check and resolve number not close to negative', () => {
      const t = new unitsnap._NumberIsCloseTo(5, 0.01).not();

      for (const v of [ -Infinity, 4.98, 5.02, Infinity ]) {
        expect(t.check(v)).toBeTruthy();
      }
    });

    it('should check and reject number not close to', () => {
      const t = new unitsnap._NumberIsCloseTo(5, 0.01);

      for (const v of [ -Infinity, 4.98, 5.02, Infinity ]) {
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

    it('should serialize number not close to negative', () => {
      const t = new unitsnap._NumberIsCloseTo(5, 0.01).not();

      expect(t.serialize(4)).toEqual({[ DATA ]: `5 ±0.01`, [ TYPE ]: 'not:numberIsCloseTo'});
    });

    it('should serialize number close to negative', () => {
      const t = new unitsnap._NumberIsCloseTo(5, 0.01).not();

      expect(t.serialize(5.005)).toEqual({[ DATA ]: `5.005 ∈ 5 ±0.01`, [ TYPE ]: 'numberIsCloseTo'});
    });
  });

  describe('NumberIsPreciseTo', () => {
    it('should check and resolve number precise to', () => {
      const t = new unitsnap._NumberIsPreciseTo(5, 2);

      for (const v of [ 4.99, 5, 5.01 ]) {
        expect(t.check(v)).toBeTruthy();
      }
    });

    it('should check and resolve number precise to', () => {
      const t = new unitsnap._NumberIsPreciseTo(Infinity, 2);

      for (const v of [ Infinity ]) {
        expect(t.check(v)).toBeTruthy();
      }
    });

    it('should check and resolve number precise to', () => {
      const t = new unitsnap._NumberIsPreciseTo(-Infinity, 2);

      for (const v of [ -Infinity ]) {
        expect(t.check(v)).toBeTruthy();
      }
    });

    it('should check and resolve number precise to negative', () => {
      const t = new unitsnap._NumberIsPreciseTo(5, 2).not();

      for (const v of [ -Infinity, 4.98, 5.02, Infinity ]) {
        expect(t.check(v)).toBeTruthy();
      }
    });

    it('should check and reject number not precise to', () => {
      const t = new unitsnap._NumberIsPreciseTo(5, 2);

      for (const v of [ -Infinity, 4.98, 5.02, Infinity ]) {
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

    it('should serialize number not precise to negative', () => {
      const t = new unitsnap._NumberIsPreciseTo(5, 2).not();

      expect(t.serialize(4)).toEqual({[ DATA ]: `5 ±0.01`, [ TYPE ]: 'not:numberIsPreciseTo'});
    });

    it('should serialize number close to negative', () => {
      const t = new unitsnap._NumberIsPreciseTo(5, 2).not();

      expect(t.serialize(5.005)).toEqual({[ DATA ]: `5.005 ∈ 5 ±0.01`, [ TYPE ]: 'numberIsPreciseTo'});
    });
  });

  describe('NumberType', () => {
    it('should check and resolve instance of number value', () => {
      const t = new unitsnap._NumberType();

      for (const v of [1, NaN]) {
        expect(t.check(v)).toBeTruthy();
      }
    });

    it('should check and resolve instance of number value negative', () => {
      const t = new unitsnap._NumberType().not();

      for (const v of ['1', null, false, Object, {}, []]) {
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

    it('should serialize instance of not number value negative', () => {
      const t = new unitsnap._NumberType().not();

      expect(t.serialize('1')).toEqual({[ DATA ]: null, [ TYPE ]: 'not:number'});
    });

    it('should serialize instance of number value negative', () => {
      const t = new unitsnap._NumberType().not();

      expect(t.serialize(1)).toEqual({[ DATA ]: 1, [ TYPE ]: 'number'});
    });
  });

  describe('Range', () => {
    it('should check and resolve value in range', () => {
      for (const [ min, max, v ] of [
        [ 0, 10, 5 ], [ -Infinity, Infinity, 0 ],
        [ 'a', 'abc', 'aa' ],
        [ new Date('2020-01-01'), new Date('2020-02-01'), new Date('2020-01-15') ],
      ]) {
        const t = new unitsnap._Range(min as any, max as any);

        expect(t.check(v)).toBeTruthy();
      }
    });

    it('should check and resolve value in range negative', () => {
      for (const [ min, max, v ] of [
        [ 0, 10, -1 ], [ 0, 10, 11 ],
        [ 'a', 'abc', '' ], [ 'a', 'abc', 'b' ], [ 0, 5, '3' ],
        [ new Date('2020-01-01'), new Date('2020-02-01'), new Date('2021-02-02') ], [ new Date('2020-01-01'), new Date('2020-02-01'), new Date('2019-12-31') ],
      ]) {
        const t = new unitsnap._Range(min as any, max as any).not();

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

    it('should serialize not value in range negative', () => {
      const t = new unitsnap._Range(1, 5).not();

      expect(t.serialize(0)).toEqual({[ DATA ]: `1 .. 5`, [ TYPE ]: 'not:range'});
    });

    it('should serialize value in range negative', () => {
      const t = new unitsnap._Range(1, 5).not();

      expect(t.serialize(3)).toEqual({[ DATA ]: `3 ∈ 1 .. 5`, [ TYPE ]: 'range'});
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

  describe('StrictInstanceOf', () => {
    class D extends Date {

    }

    it('should check and resolve strict instance of value', () => {
      const t = new unitsnap._StrictInstanceOf(Date);

      for (const v of [new Date()]) {
        expect(t.check(v)).toBeTruthy();
      }
    });

    it('should check and resolve strict instance of value negative', () => {
      const t = new unitsnap._StrictInstanceOf(Date).not();

      for (const v of [new D()]) {
        expect(t.check(v)).toBeTruthy();
      }
    });

    it('should check and reject not strict instance of value', () => {
      const t = new unitsnap._StrictInstanceOf(Date);

      for (const v of [new D()]) {
        expect(t.check(v)).toBeFalsy();
      }
    });

    it('should serialize strict instance of value', () => {
      const t = new unitsnap._StrictInstanceOf(Date);

      expect(t.serialize(new Date())).toEqual({[ DATA ]: 'Date', [ TYPE ]: 'strictInstanceOf'});
    });

    it('should serialize not strict instance of value', () => {
      const t = new unitsnap._StrictInstanceOf(Date);

      expect(t.serialize(new D())).toEqual({[ DATA ]: 'Date ≠ D', [ TYPE ]: 'not:strictInstanceOf'});
    });

    it('should serialize not strict instance of value negative', () => {
      const t = new unitsnap._StrictInstanceOf(Date).not();

      expect(t.serialize(new D())).toEqual({[ DATA ]: 'Date', [ TYPE ]: 'not:strictInstanceOf'});
    });

    it('should serialize strict instance of value negative', () => {
      const t = new unitsnap._StrictInstanceOf(Date).not();

      expect(t.serialize(new Date())).toEqual({[ DATA ]: 'Date = Date', [ TYPE ]: 'strictInstanceOf'});
    });
  });

  describe('StringType', () => {
    it('should check and resolve instance of string value', () => {
      const t = new unitsnap._StringType();

      for (const v of ['1']) {
        expect(t.check(v)).toBeTruthy();
      }
    });

    it('should check and resolve instance of string value negative', () => {
      const t = new unitsnap._StringType().not();

      for (const v of [1, null, false, Object, {}, []]) {
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

    it('should serialize not instance of string value negative', () => {
      const t = new unitsnap._StringType().not();

      expect(t.serialize(1)).toEqual({[ DATA ]: null, [ TYPE ]: 'not:string'});
    });

    it('should serialize instance of string value', () => {
      const t = new unitsnap._StringType().not();

      expect(t.serialize('')).toEqual({[ DATA ]: '', [ TYPE ]: 'string'});
    });
  });

  describe('UndefinedType', () => {
    it('should check and resolve undefined value', () => {
      const t = new unitsnap._UndefinedType();

      for (const v of [undefined]) {
        expect(t.check(v)).toBeTruthy();
      }
    });

    it('should check and resolve undefined value negative', () => {
      const t = new unitsnap._UndefinedType().not();

      for (const v of [1, '1', null, false, Object, {}, []]) {
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

    it('should serialize defined value negative', () => {
      const t = new unitsnap._UndefinedType().not();

      expect(t.serialize(1)).toEqual({[ DATA ]: null, [ TYPE ]: 'not:undefined'});
    });

    it('should serialize undefined value negative', () => {
      const t = new unitsnap._UndefinedType().not();

      expect(t.serialize(undefined)).toEqual({[ DATA ]: undefined, [ TYPE ]: 'undefined'});
    });
  });
});
