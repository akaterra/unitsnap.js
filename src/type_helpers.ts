import { DATA, TYPE } from './const';
import { ClassDef } from './utils';

export interface IType {
  check(value?: any): boolean;
  serialize(value?: any): any;
}

export class _AnyType implements IType {
  check(value?) { // eslint-disable-line unused-imports/no-unused-vars
    return true;
  }

  serialize() {
    return { [ DATA ]: null, [ TYPE ]: 'any' };
  }
}

export function AnyType() {
  return new _AnyType();
}

export class _BooleanType implements IType {
  check(value?) {
    return typeof value === 'boolean';
  }

  serialize(value?) {
    const pref = this.check(value) ? '' : 'not:';

    return { [ DATA ]: pref ? value : null, [ TYPE ]: `${pref}boolean` };
  }
}

export function BooleanType() {
  return new _BooleanType();
}

export class _ClassOf implements IType {
  constructor(private _cls: ClassDef<unknown>) {

  }

  check(value?) {
    return value !== undefined && value !== null && Object.getPrototypeOf(value) && Object.getPrototypeOf(value).constructor === this._cls;
  }

  serialize(value?) {
    const pref = this.check(value) ? '' : 'not:';
    const typA = Object.getPrototypeOf(value).constructor.name;
    const typB = this._cls.name;

    return { [ DATA ]: pref ? `${typB} ≠ ${typA}` : typA, [ TYPE ]: `${pref}classOf` };
  }
}

export function ClassOf(cls: ClassDef<unknown>) {
  return new _ClassOf(cls);
}

export class Continue implements IType {
  check() {
    return true;
  }

  serialize() {
    return Continue;
  }
}

export class _Copy implements IType {
  check(value?) {
    return true;
  }

  serialize(value?) {
    if (typeof structuredClone === 'undefined') {
      throw new Error('"structuredClone" is not defined, use https://github.com/ungap/structured-clone polyfill to support this feature.');
    }

    return structuredClone(value);
  }
}

export function Copy() {
  return new _Copy();
}

export class _DateType implements IType {
  check(value?) {
    return value instanceof Date;
  }

  serialize(value?) {
    const pref = this.check(value) ? '' : 'not:';

    return { [ DATA ]: null, [ TYPE ]: `${pref}date` };
  }
}

export function DateType() {
  return new _DateType();
}

export class _DateValue implements IType {
  check(value?) {
    return value instanceof Date;
  }

  serialize(value?) {
    if (!this.check(value)) {
      return null;
    }

    return value.toISOString();
  }
}

export function DateValue() {
  return new _DateValue();
}

export class Ignore implements IType {
  check(value?) { // eslint-disable-line unused-imports/no-unused-vars
    return true;
  }

  serialize() {
    return Ignore;
  }
}

export class _In implements IType {
  constructor(private _values: unknown[]) {

  }

  check(value?) {
    return this._values.includes(value);
  }

  serialize(value?) { // eslint-disable-line unused-imports/no-unused-vars
    const pref = this.check(value) ? '' : 'not:';

    return { [ DATA ]: JSON.stringify(this._values).slice(1, -1), [ TYPE ]: `${pref}in` };
  }
}

export function In(...values: unknown[]) {
  return new _In(values);
}

export class _InstanceOf implements IType {
  constructor(private _cls: ClassDef<unknown>) {

  }

  check(value?) {
    return value instanceof this._cls;
  }

  serialize(value?) {
    const pref = this.check(value) ? '' : 'not:';
    const typA = Object.getPrototypeOf(value).constructor.name;
    const typB = this._cls.name;

    return { [ DATA ]: pref ? `${typB} ⊈ ${typA}` : typA, [ TYPE ]: `${pref}instanceOf` };
  }
}

export function InstanceOf(cls: ClassDef<unknown>) {
  return new _ClassOf(cls);
}

export class _NullType implements IType {
  check(value?) {
    return value === null;
  }

  serialize(value?) {
    const pref = this.check(value) ? '' : 'not:';

    return { [ DATA ]: pref ? value : null, [ TYPE ]: `${pref}null` };
  }
}

export function NullType() {
  return new _NullType();
}

export class _NumberType implements IType {
  check(value?) {
    return typeof value === 'number';
  }

  serialize(value?) {
    const pref = this.check(value) ? '' : 'not:';

    return { [ DATA ]: pref ? value : null, [ TYPE ]: `${pref}number` };
  }
}

export function NumberType() {
  return new _NumberType();
}

export class _NumberIsCloseTo implements IType {
  constructor(private _value: number, private _diff: number) {

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
    
    return Math.abs(this._value - value) <= this._diff;
  }

  serialize(value?) {
    const pref = this.check(value) ? '' : 'not:';
    const diff = this._value === Number.POSITIVE_INFINITY || this._value === Number.NEGATIVE_INFINITY
      ? 0
      : this._diff;
    const data = pref ? `${value} ∉ ${this._value} ±${diff}` : `${this._value} ±${diff}`;

    return { [ DATA ]: data, [ TYPE ]: `${pref}numberIsCloseTo` };
  }
}

export function NumberIsCloseTo(value: number, diff: number) {
  return new _NumberIsPreciseTo(value, diff);
}

export class _NumberIsPreciseTo implements IType {
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
    
    return Math.abs(this._value - value) <= Math.pow(10, -this._precision);
  }

  serialize(value?) {
    const pref = this.check(value) ? '' : 'not:';
    const diff = this._value === Number.POSITIVE_INFINITY || this._value === Number.NEGATIVE_INFINITY
      ? 0
      : Math.pow(10, -this._precision);
    const data = pref ? `${value} ∉ ${this._value} ±${diff}` : `${this._value} ±${diff}`;

    return { [ DATA ]: data, [ TYPE ]: `${pref}numberIsPreciseTo` };
  }
}

export function NumberIsPreciseTo(value: number, precision: number) {
  return new _NumberIsPreciseTo(value, precision);
}

export class _Range implements IType {
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

  serialize(value?) {
    const pref = this.check(value) ? '' : 'not:';
    const data = pref
      ? `${this.primitive(value)} ∉ ${this.primitive(this._min)} .. ${this.primitive(this._max)}`
      : `${this.primitive(this._min)} .. ${this.primitive(this._max)}`;

    return { [ DATA ]: data, [ TYPE ]: `${pref}range` };
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

export function Range(min: number, max: number);

export function Range(min: string, max: string);

export function Range(min: Date, max: Date);

export function Range(min, max) {
  return new _Range(min, max);
}

export class _StringType implements IType {
  check(value?) {
    return typeof value === 'string';
  }

  serialize(value?) {
    const pref = this.check(value) ? '' : 'not:';

    return { [ DATA ]: pref ? value : null, [ TYPE ]: `${pref}string` };
  }
}

export function StringType() {
  return new _StringType();
}

export class _UndefinedType implements IType {
  check(value?) {
    return value === undefined;
  }

  serialize(value?) {
    const pref = this.check(value) ? '' : 'not:';

    return { [ DATA ]: pref ? value : null, [ TYPE ]: `${pref}undefined` };
  }
}

export function UndefinedType() {
  return new _UndefinedType();
}

export class Wrapped {
  constructor(public readonly value: any) {

  }

  valueOf() {
    return this.value;
  }

  toJSON() {
    return this.value;
  }

  toString() {
    return String(this.value);
  }
}
