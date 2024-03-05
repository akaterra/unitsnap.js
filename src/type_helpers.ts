import { ClassDef } from './utils';

export interface IType {
  check(value?: any): boolean;
  serialize(value?: any): any;
}

export class AnyType implements IType {
  check() {
    return true;
  }

  serialize() {
    return { $$data: null, $$type: 'any' };
  }
}

export class BooleanType implements IType {
  check(value?) {
    return typeof value === 'boolean';
  }

  serialize() {
    return { $$data: null, $$type: 'boolean' };
  }
}

export class ClassOfType implements IType {
  constructor(private _cls: ClassDef<unknown>) {

  }

  check(value?) {
    return value !== undefined && value !== null && Object.getPrototypeOf(value) && Object.getPrototypeOf(value).constructor === this._cls;
  }

  serialize() {
    return { $$data: this._cls.prototype.constructor.name, $$type: 'classOf' };
  }
}

export class Continue implements IType {
  check() {
    return true;
  }

  serialize() {
    return Continue;
  }
}

export class DateType implements IType {
  check(value?) {
    return value instanceof Date;
  }

  serialize() {
    return { $$data: null, $$type: 'date' };
  }
}

export class DateValue implements IType {
  check(value?) {
    return value instanceof Date;
  }

  serialize(value?) {
    return value.toISOString();
  }
}

export class Ignore implements IType {
  check() {
    return true;
  }

  serialize() {
    return Ignore;
  }
}

export class InstanceOfType implements IType {
  constructor(private _cls: ClassDef<unknown>) {

  }

  check(value?) {
    return value instanceof this._cls;
  }

  serialize(value?) {
    return { $$data: Object.getPrototypeOf(value).constructor.name, $$type: 'instanceOf' };
  }
}

export class NumberType implements IType {
  check(value?) {
    return typeof value === 'number';
  }

  serialize() {
    return { $$data: null, $$type: 'number' };
  }
}

export class NumberIsCloseToType implements IType {
  constructor(private _value: number, private _precision: number) {

  }

  check(value?) {
    if (typeof value !== 'number') {
      return false;
    }

    if (value === Number.POSITIVE_INFINITY && this._value === Number.POSITIVE_INFINITY) {
      return true;
    }
    
    if (value === Number.NEGATIVE_INFINITY && this._value === Number.NEGATIVE_INFINITY) {
      return true;
    }
    
    return Math.abs(this._value - value) < Math.pow(10, -this._precision) / 2;
  }

  serialize() {
    return { $$data: this._precision, $$type: 'numberIsPricise' };
  }
}

export class RangeType implements IType {
  constructor(_min: number, _max: number);

  constructor(_min: string, _max: string);

  constructor(_min: Date, _max: Date);

  constructor(private _min: number | string | Date, private _max: number | string | Date) {

  }

  check(value?) {
    if (!this.isSameType(value, this._min) || !this.isSameType(value, this._max)) {
      return false;
    }

    return this._min <= value && value <= this._max;
  }

  serialize() {
    return { $$data: [ this.primitive(this._min), this.primitive(this._max) ], $$type: 'range' };
  }

  private isSameType(val1, val2): boolean {
    if (val1 instanceof Date && !(val2 instanceof Date)) {
      return false;
    }

    if (val2 instanceof Date && !(val1 instanceof Date)) {
      return false;
    }

    return typeof val1 === typeof val2;
  }

  private primitive(value: number | string | Date) {
    if (value instanceof Date) {
      return value.toISOString();
    }

    return value;
  }
}

export class StringType implements IType {
  check(value?) {
    return typeof value === 'string';
  }

  serialize() {
    return { $$data: null, $$type: 'string' };
  }
}

export class UndefinedType implements IType {
  check(value?) {
    return value === undefined;
  }

  serialize() {
    return { $$data: null, $$type: 'undefined' };
  }
}
