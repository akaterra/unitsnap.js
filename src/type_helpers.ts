import { DATA, TYPE } from './const';
import { ClassDef } from './utils';

export interface ITypeHelper {
  check(value?: any): boolean;
  serialize(value?: any): any;
}

abstract class BaseTypeHelper {
  protected _not = false;

  abstract check(value?: any): boolean;

  not() {
    this._not = true;

    return this;
  }

  protected _assert(value) {
    return this._not ? !value : value;
  }

  protected _formatSerialized(
    value,
    type,
    posPassPref,
    posPassData,
    posFailPref,
    posFailData,
    negPassPref,
    negPassData,
    negFailPref,
    negFailData,
  ) {
    const pass = this.check(value);

    return this._not
      ? { [ DATA ]: pass ? negPassData : negFailData, [ TYPE ]: `${pass ? negPassPref : negFailPref}${type}` }
      : { [ DATA ]: pass ? posPassData : posFailData, [ TYPE ]: `${pass ? posPassPref : posFailPref}${type}` }
  }
}

export class _AnyType extends BaseTypeHelper implements ITypeHelper {
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

export class _BooleanType extends BaseTypeHelper implements ITypeHelper {
  check(value?) {
    return this._assert(typeof value === 'boolean');
  }

  serialize(value?) {
    return this._formatSerialized(value, 'boolean', '', null, 'not:', value, 'not:', null, '', value);
  }
}

export function BooleanType() {
  return new _BooleanType();
}

export function NotBooleanType() {
  return new _BooleanType().not();
}

export class _Continue implements ITypeHelper {
  constructor(public readonly value) {

  }

  check() {
    return true;
  }

  serialize() {
    return _Continue;
  }
}

export function Continue(value: unknown) {
  return new _Continue(value);
}

export class _Copy implements ITypeHelper {
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

export class _DateType extends BaseTypeHelper implements ITypeHelper {
  check(value?) {
    return this._assert(value instanceof Date);
  }

  serialize(value?) {
    return this._formatSerialized(value, 'date', '', null, 'not:', value, 'not:', null, '', value);
  }
}

export function DateType() {
  return new _DateType();
}

export function NotDateType() {
  return new _DateType().not();
}

export class _DateValue implements ITypeHelper {
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

export class Ignore extends BaseTypeHelper implements ITypeHelper {
  check(value?) { // eslint-disable-line unused-imports/no-unused-vars
    return true;
  }

  serialize() {
    return Ignore;
  }
}

export class _In extends BaseTypeHelper implements ITypeHelper {
  constructor(private _values: unknown[]) {
    super();
  }

  check(value?) {
    return this._assert(this._values.includes(value));
  }

  serialize(value?) { // eslint-disable-line unused-imports/no-unused-vars
    const inStr = JSON.stringify(this._values).slice(1, -1);

    return this._formatSerialized(
      value,
      'in',
      '',
      inStr,
      'not:',
      `${value} ∉ ${inStr}`,
      'not:',
      inStr,
      '',
      `${value} ∈ ${inStr}`,
    );
  }
}

export function In(...values: unknown[]) {
  return new _In(values);
}

export function NotIn(...values: unknown[]) {
  return new _In(values).not();
}

export class _InstanceOf extends BaseTypeHelper implements ITypeHelper {
  constructor(private _cls: ClassDef<unknown>) {
    super();
  }

  check(value?) {
    return this._assert(value instanceof this._cls);
  }

  serialize(value?) {
    const typA = Object.getPrototypeOf(value).constructor.name;
    const typB = this._cls.name;

    return this._formatSerialized(value, 'instanceOf', '', typB, 'not:', `${typB} ⊈ ${typA}`, 'not:', typB, '', `${typB} ⊆ ${typA}`);
  }
}

export function InstanceOf(cls: ClassDef<unknown>) {
  return new _InstanceOf(cls);
}

export function NotInstanceOf(cls: ClassDef<unknown>) {
  return new _InstanceOf(cls).not();
}

export class _NullType extends BaseTypeHelper implements ITypeHelper {
  check(value?) {
    return this._assert(value === null);
  }

  serialize(value?) {
    return this._formatSerialized(value, 'null', '', null, 'not:', value, 'not:', null, '', value);
  }
}

export function NullType() {
  return new _NullType();
}

export function NotNullType() {
  return new _NullType().not();
}

export class _NumberIsCloseTo extends BaseTypeHelper implements ITypeHelper {
  constructor(private _value: number, private _diff: number) {
    super();
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
    
    return this._assert(Math.abs(this._value - value) <= this._diff);
  }

  serialize(value?) {
    const diff = this._value === Number.POSITIVE_INFINITY || this._value === Number.NEGATIVE_INFINITY
      ? 0
      : this._diff;
    const closeToStr = `${this._value} ±${diff}`;

    return this._formatSerialized(
      value,
      'numberIsCloseTo',
      '',
      closeToStr,
      'not:',
      `${value} ∉ ${this._value} ±${diff}`,
      'not:',
      closeToStr,
      '',
      `${value} ∈ ${this._value} ±${diff}`,
    );
  }
}

export function NumberIsCloseTo(value: number, diff: number) {
  return new _NumberIsPreciseTo(value, diff);
}

export function NumberIsNotCloseTo(value: number, diff: number) {
  return new _NumberIsPreciseTo(value, diff).not();
}

export class _NumberIsPreciseTo extends BaseTypeHelper implements ITypeHelper {
  constructor(private _value: number, private _precision: number) {
    super();
  }

  check(value?) {
    if (typeof value !== 'number') {
      return this._assert(false);
    }

    if (value === Number.POSITIVE_INFINITY && this._value === Number.POSITIVE_INFINITY) {
      return this._assert(true);
    }
    
    if (value === Number.NEGATIVE_INFINITY && this._value === Number.NEGATIVE_INFINITY) {
      return this._assert(true);
    }
    
    return this._assert(Math.abs(this._value - value) <= Math.pow(10, -this._precision));
  }

  serialize(value?) {
    const diff = this._value === Number.POSITIVE_INFINITY || this._value === Number.NEGATIVE_INFINITY
      ? 0
      : Math.pow(10, -this._precision);
    const priciseToStr = `${this._value} ±${diff}`;

    return this._formatSerialized(
      value,
      'numberIsPreciseTo',
      '',
      priciseToStr,
      'not:',
      `${value} ∉ ${this._value} ±${diff}`,
      'not:',
      priciseToStr,
      '',
      `${value} ∈ ${this._value} ±${diff}`,
    );
  }
}

export function NumberIsPreciseTo(value: number, precision: number) {
  return new _NumberIsPreciseTo(value, precision);
}

export function NumberIsNotPreciseTo(value: number, precision: number) {
  return new _NumberIsPreciseTo(value, precision).not();
}

export class _NumberType extends BaseTypeHelper implements ITypeHelper {
  check(value?) {
    return this._assert(typeof value === 'number');
  }

  serialize(value?) {
    return this._formatSerialized(value, 'number', '', null, 'not:', value, 'not:', null, '', value);
  }
}

export function NumberType() {
  return new _NumberType();
}

export function NotNumberType() {
  return new _NumberType().not();
}

export class _Range extends BaseTypeHelper implements ITypeHelper {
  constructor(_min: number, _max: number);

  constructor(_min: string, _max: string);

  constructor(_min: Date, _max: Date);

  constructor(private _min: number | string | Date, private _max: number | string | Date) {
    super();
  }

  check(value?) {
    if (!this.isSameType(value, this._min) || !this.isSameType(value, this._max)) {
      return this._assert(false);
    }

    return this._assert(this._min <= value && value <= this._max);
  }

  serialize(value?) {
    const rangeStr = `${this.primitive(this._min)} .. ${this.primitive(this._max)}`;

    return this._formatSerialized(
      value,
      'range',
      '',
      rangeStr,
      'not:',
      `${this.primitive(value)} ∉ ${this.primitive(this._min)} .. ${this.primitive(this._max)}`,
      'not:',
      rangeStr,
      '',
      `${this.primitive(value)} ∈ ${this.primitive(this._min)} .. ${this.primitive(this._max)}`,
    );
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

export function NotRange(min: number, max: number);

export function NotRange(min: string, max: string);

export function NotRange(min: Date, max: Date);

export function NotRange(min, max) {
  return new _Range(min, max).not();
}

export class _StrictInstanceOf extends BaseTypeHelper implements ITypeHelper {
  constructor(private _cls: ClassDef<unknown>) {
    super();
  }

  check(value?) {
    return this._assert(value !== undefined && value !== null && Object.getPrototypeOf(value) && Object.getPrototypeOf(value).constructor === this._cls);
  }

  serialize(value?) {
    const typA = Object.getPrototypeOf(value).constructor.name;
    const typB = this._cls.name;

    return this._formatSerialized(value, 'strictInstanceOf', '', typB, 'not:', `${typB} ≠ ${typA}`, 'not:', typB, '', `${typB} = ${typA}`);
  }
}

export function StrictInstanceOf(cls: ClassDef<unknown>) {
  return new _StrictInstanceOf(cls);
}

export function NotStrictInstanceOf(cls: ClassDef<unknown>) {
  return new _StrictInstanceOf(cls).not();
}

export class _StringType extends BaseTypeHelper implements ITypeHelper {
  check(value?) {
    return this._assert(typeof value === 'string');
  }

  serialize(value?) {
    return this._formatSerialized(value, 'string', '', null, 'not:', value, 'not:', null, '', value);
  }
}

export function StringType() {
  return new _StringType();
}

export function NotStringType() {
  return new _StringType().not();
}

export class _UndefinedType extends BaseTypeHelper implements ITypeHelper {
  check(value?) {
    return this._assert(value === undefined);
  }

  serialize(value?) {
    return this._formatSerialized(value, 'undefined', '', null, 'not:', value, 'not:', null, '', value);
  }
}

export function UndefinedType() {
  return new _UndefinedType();
}

export function NotUndefinedType() {
  return new _UndefinedType().not();
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
