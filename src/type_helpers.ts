export class AnyType {
  check() {
    return true;
  }

  serialize() {
    return {$$data: null, $$type: 'any'};
  }
}

export class BooleanType {
  check(value) {
    return typeof value === 'boolean';
  }

  serialize() {
    return {$$data: null, $$type: 'boolean'};
  }
}

export class ClassOfType {
  private _cls: any;

  constructor(cls) {
    this._cls = cls;
  }

  check(value) {
    return value !== void 0 && value !== null && Object.getPrototypeOf(value) && Object.getPrototypeOf(value).constructor === this._cls;
  }

  serialize() {
    return {$$data: this._cls.prototype.constructor.name, $$type: 'classOf'};
  }
}

export class Continue {
  check(value) {
    return true;
  }

  serialize() {
    return Continue;
  }
}

export class DateType {
  check(value) {
    return value instanceof Date;
  }

  serialize() {
    return {$$data: null, $$type: 'date'};
  }
}

export class DateValue {
  check(value) {
    return value instanceof Date;
  }

  serialize(value) {
    return value.toISOString();
  }
}

export class Ignore {
  check(value) {
    return true;
  }

  serialize() {
    return Ignore;
  }
}

export class InstanceOfType {
  private _cls: any;

  constructor(cls) {
    this._cls = cls;
  }

  check(value) {
    return value instanceof this._cls;
  }

  serialize(value) {
    return {$$data: Object.getPrototypeOf(value).constructor.name, $$type: 'instanceOf'};
  }
}

export class NumberType {
  check(value) {
    return typeof value === 'number';
  }

  serialize() {
    return {$$data: null, $$type: 'number'};
  }
}

export class StringType {
  check(value) {
    return typeof value === 'string';
  }

  serialize() {
    return {$$data: null, $$type: 'string'};
  }
}

export class This {
  check() {
    return true;
  }

  serialize() {
    return this;
  }
}

export class UndefinedType {
  check(value) {
    return value === void 0;
  }

  serialize() {
    return {$$data: null, $$type: 'undefined'};
  }
}
