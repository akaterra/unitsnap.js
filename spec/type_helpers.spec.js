const typeHelpers = require('../src/type_helpers');

describe('Type helpers', () => {
  describe('AnyType', () => {
    it('should check and resolve any value', () => {
      var t = new typeHelpers.AnyType();

      for (const v of [1, '1', null, false, Object, {}, []]) {
        expect(t.check(v)).toBeTruthy();
      }
    });

    it('should serialize value', () => {
      var t = new typeHelpers.AnyType();

      expect(t.serialize()).toEqual({$$data: null, $$type: 'any'});
    });
  });

  describe('BooleanType', () => {
    it('should check and resolve boolean value', () => {
      var t = new typeHelpers.BooleanType();

      for (const v of [true, false]) {
        expect(t.check(v)).toBeTruthy();
      }
    });

    it('should check and reject not boolean value', () => {
      var t = new typeHelpers.BooleanType();

      for (const v of [1, '1', null, Object, {}, []]) {
        expect(t.check(v)).toBeFalsy();
      }
    });

    it('should serialize value', () => {
      var t = new typeHelpers.BooleanType();

      expect(t.serialize()).toEqual({$$data: null, $$type: 'boolean'});
    });
  });

  describe('DateType', () => {
    it('should check and resolve instance of date value', () => {
      var t = new typeHelpers.DateType();

      for (const v of [new Date()]) {
        expect(t.check(v)).toBeTruthy();
      }
    });

    it('should check and reject not instance of date value', () => {
      var t = new typeHelpers.DateType();

      for (const v of [1, '1', null, false, Object, {}, []]) {
        expect(t.check(v)).toBeFalsy();
      }
    });

    it('should serialize value', () => {
      var t = new typeHelpers.DateType();

      expect(t.serialize()).toEqual({$$data: null, $$type: 'date'});
    });
  });

  describe('DateValue', () => {
    it('should check and resolve instance of date value', () => {
      var t = new typeHelpers.DateValue();

      for (const v of [new Date()]) {
        expect(t.check(v)).toBeTruthy();
      }
    });

    it('should check and reject not instance of date value', () => {
      var t = new typeHelpers.DateValue();

      for (const v of [1, '1', null, false, Object, {}, []]) {
        expect(t.check(v)).toBeFalsy();
      }
    });

    it('should serialize value as string with date in ISO format', () => {
      var t = new typeHelpers.DateValue();

      expect(t.serialize(new Date('2018-01-01'))).toEqual('2018-01-01T00:00:00.000Z');
    });
  });

  describe('Ignore', () => {
    it('should check and resolve any value', () => {
      var t = new typeHelpers.Ignore();

      for (const v of [1, '1', null, false, Object, {}, []]) {
        expect(t.check(v)).toBeTruthy();
      }
    });

    it('should serialize value as Ignore ref', () => {
      var t = new typeHelpers.Ignore();

      expect(t.serialize()).toBe(typeHelpers.Ignore);
    });
  });

  describe('InstanceOfType', () => {
    it('should check and resolve instance of value', () => {
      var t = new typeHelpers.InstanceOfType(Date);

      class D extends Date {

      }

      for (const v of [new Date(), new D()]) {
        expect(t.check(v)).toBeTruthy();
      }
    });

    it('should check and reject not instance of value', () => {
      var t = new typeHelpers.InstanceOfType(Date);

      for (const v of [new Function()]) {
        expect(t.check(v)).toBeFalsy();
      }
    });

    it('should serialize value', () => {
      var t = new typeHelpers.InstanceOfType(Date);

      expect(t.serialize(new Date('2018-01-01'))).toEqual({$$data: 'Date', $$type: 'instanceOf'});
    });
  });

  describe('NumberType', () => {
    it('should check and resolve instance of number value', () => {
      var t = new typeHelpers.NumberType();

      for (const v of [1, NaN]) {
        expect(t.check(v)).toBeTruthy();
      }
    });

    it('should check and reject not instance of number value', () => {
      var t = new typeHelpers.NumberType();

      for (const v of ['1', null, false, Object, {}, []]) {
        expect(t.check(v)).toBeFalsy();
      }
    });

    it('should serialize value', () => {
      var t = new typeHelpers.NumberType();

      expect(t.serialize()).toEqual({$$data: null, $$type: 'number'});
    });
  });


  describe('StrictInstanceOfType', () => {
    it('should check and resolve class of value', () => {
      var t = new typeHelpers.StrictInstanceOfType(Date);

      for (const v of [new Date()]) {
        expect(t.check(v)).toBeTruthy();
      }
    });

    it('should check and reject not class of value', () => {
      var t = new typeHelpers.StrictInstanceOfType(Date);

      class D extends Date {

      }

      for (const v of [new D()]) {
        expect(t.check(v)).toBeFalsy();
      }
    });

    it('should serialize value', () => {
      var t = new typeHelpers.StrictInstanceOfType(Date);

      expect(t.serialize()).toEqual({$$data: 'Date', $$type: 'classOf'});
    });
  });

  describe('StringType', () => {
    it('should check and resolve instance of string value', () => {
      var t = new typeHelpers.StringType();

      for (const v of ['1']) {
        expect(t.check(v)).toBeTruthy();
      }
    });

    it('should check and reject not instance of string value', () => {
      var t = new typeHelpers.StringType();

      for (const v of [1, null, false, Object, {}, []]) {
        expect(t.check(v)).toBeFalsy();
      }
    });

    it('should serialize value', () => {
      var t = new typeHelpers.StringType();

      expect(t.serialize()).toEqual({$$data: null, $$type: 'string'});
    });
  });

  describe('UndefinedType', () => {
    it('should check and resolve undefined value', () => {
      var t = new typeHelpers.UndefinedType();

      for (const v of [void 0]) {
        expect(t.check(v)).toBeTruthy();
      }
    });

    it('should check and reject not defined value', () => {
      var t = new typeHelpers.UndefinedType();

      for (const v of [1, '1', null, false, Object, {}, []]) {
        expect(t.check(v)).toBeFalsy();
      }
    });

    it('should serialize value', () => {
      var t = new typeHelpers.UndefinedType();

      expect(t.serialize()).toEqual({$$data: null, $$type: 'undefined'});
    });
  });
});
