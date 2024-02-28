import * as unitsnap from '..';

describe('Type helpers', () => {
  describe('AnyType', () => {
    it('should check and resolve any value', () => {
      var t = new unitsnap.AnyType();

      for (const v of [1, '1', null, false, Object, {}, []]) {
        expect(t.check(v)).toBeTruthy();
      }
    });

    it('should serialize value', () => {
      var t = new unitsnap.AnyType();

      expect(t.serialize()).toEqual({$$data: null, $$type: 'any'});
    });
  });

  describe('BooleanType', () => {
    it('should check and resolve boolean value', () => {
      var t = new unitsnap.BooleanType();

      for (const v of [true, false]) {
        expect(t.check(v)).toBeTruthy();
      }
    });

    it('should check and reject not boolean value', () => {
      var t = new unitsnap.BooleanType();

      for (const v of [1, '1', null, Object, {}, []]) {
        expect(t.check(v)).toBeFalsy();
      }
    });

    it('should serialize value', () => {
      var t = new unitsnap.BooleanType();

      expect(t.serialize()).toEqual({$$data: null, $$type: 'boolean'});
    });
  });

  describe('ClassOfType', () => {
    it('should check and resolve class of value', () => {
      var t = new unitsnap.ClassOfType(Date);

      for (const v of [new Date()]) {
        expect(t.check(v)).toBeTruthy();
      }
    });

    it('should check and reject not class of value', () => {
      var t = new unitsnap.ClassOfType(Date);

      class D extends Date {

      }

      for (const v of [new D()]) {
        expect(t.check(v)).toBeFalsy();
      }
    });

    it('should serialize value', () => {
      var t = new unitsnap.ClassOfType(Date);

      expect(t.serialize()).toEqual({$$data: 'Date', $$type: 'classOf'});
    });
  });

  describe('DateType', () => {
    it('should check and resolve instance of date value', () => {
      var t = new unitsnap.DateType();

      for (const v of [new Date()]) {
        expect(t.check(v)).toBeTruthy();
      }
    });

    it('should check and reject not instance of date value', () => {
      var t = new unitsnap.DateType();

      for (const v of [1, '1', null, false, Object, {}, []]) {
        expect(t.check(v)).toBeFalsy();
      }
    });

    it('should serialize value', () => {
      var t = new unitsnap.DateType();

      expect(t.serialize()).toEqual({$$data: null, $$type: 'date'});
    });
  });

  describe('DateValue', () => {
    it('should check and resolve instance of date value', () => {
      var t = new unitsnap.DateValue();

      for (const v of [new Date()]) {
        expect(t.check(v)).toBeTruthy();
      }
    });

    it('should check and reject not instance of date value', () => {
      var t = new unitsnap.DateValue();

      for (const v of [1, '1', null, false, Object, {}, []]) {
        expect(t.check(v)).toBeFalsy();
      }
    });

    it('should serialize value as string with date in ISO format', () => {
      var t = new unitsnap.DateValue();

      expect(t.serialize(new Date('2018-01-01'))).toEqual('2018-01-01T00:00:00.000Z');
    });
  });

  describe('Ignore', () => {
    it('should check and resolve any value', () => {
      var t = new unitsnap.Ignore();

      for (const v of [1, '1', null, false, Object, {}, []]) {
        expect(t.check(v)).toBeTruthy();
      }
    });

    it('should serialize value as Ignore ref', () => {
      var t = new unitsnap.Ignore();

      expect(t.serialize()).toBe(unitsnap.Ignore);
    });
  });

  describe('InstanceOfType', () => {
    it('should check and resolve instance of value', () => {
      var t = new unitsnap.InstanceOfType(Date);

      class D extends Date {

      }

      for (const v of [new Date(), new D()]) {
        expect(t.check(v)).toBeTruthy();
      }
    });

    it('should check and reject not instance of value', () => {
      var t = new unitsnap.InstanceOfType(Date);

      for (const v of [new Function()]) {
        expect(t.check(v)).toBeFalsy();
      }
    });

    it('should serialize value', () => {
      var t = new unitsnap.InstanceOfType(Date);

      expect(t.serialize(new Date('2018-01-01'))).toEqual({$$data: 'Date', $$type: 'instanceOf'});
    });
  });

  describe('NumberType', () => {
    it('should check and resolve instance of number value', () => {
      var t = new unitsnap.NumberType();

      for (const v of [1, NaN]) {
        expect(t.check(v)).toBeTruthy();
      }
    });

    it('should check and reject not instance of number value', () => {
      var t = new unitsnap.NumberType();

      for (const v of ['1', null, false, Object, {}, []]) {
        expect(t.check(v)).toBeFalsy();
      }
    });

    it('should serialize value', () => {
      var t = new unitsnap.NumberType();

      expect(t.serialize()).toEqual({$$data: null, $$type: 'number'});
    });
  });

  describe('StringType', () => {
    it('should check and resolve instance of string value', () => {
      var t = new unitsnap.StringType();

      for (const v of ['1']) {
        expect(t.check(v)).toBeTruthy();
      }
    });

    it('should check and reject not instance of string value', () => {
      var t = new unitsnap.StringType();

      for (const v of [1, null, false, Object, {}, []]) {
        expect(t.check(v)).toBeFalsy();
      }
    });

    it('should serialize value', () => {
      var t = new unitsnap.StringType();

      expect(t.serialize()).toEqual({$$data: null, $$type: 'string'});
    });
  });

  describe('UndefinedType', () => {
    it('should check and resolve undefined value', () => {
      var t = new unitsnap.UndefinedType();

      for (const v of [undefined]) {
        expect(t.check(v)).toBeTruthy();
      }
    });

    it('should check and reject not defined value', () => {
      var t = new unitsnap.UndefinedType();

      for (const v of [1, '1', null, false, Object, {}, []]) {
        expect(t.check(v)).toBeFalsy();
      }
    });

    it('should serialize value', () => {
      var t = new unitsnap.UndefinedType();

      expect(t.serialize()).toEqual({$$data: null, $$type: 'undefined'});
    });
  });
});
