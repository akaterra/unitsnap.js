export interface IType {
  check(value?: any): boolean;
  serialize(value?: any): any;
}

export class AnyType implements IType {
  check(value?) {
    return true;
  }

  serialize(value?) {
    return {$$data: null, $$type: 'any'};
  }
}

export class BooleanType implements IType {
  check(value?) {
    return typeof value === 'boolean';
  }

  serialize(value?) {
    return {$$data: null, $$type: 'boolean'};
  }
}

export class ClassOfType implements IType {
  private _cls: any;

  constructor(cls) {
    this._cls = cls;
  }

  check(value?) {
    return value !== undefined && value !== null && Object.getPrototypeOf(value) && Object.getPrototypeOf(value).constructor === this._cls;
  }

  serialize(value?) {
    return {$$data: this._cls.prototype.constructor.name, $$type: 'classOf'};
  }
}

export class Continue implements IType {
  check(value?) {
    return true;
  }

  serialize(value?) {
    return Continue;
  }
}

export class DateType implements IType {
  check(value?) {
    return value instanceof Date;
  }

  serialize(value?) {
    return {$$data: null, $$type: 'date'};
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
  check(value?) {
    return true;
  }

  serialize(value?) {
    return Ignore;
  }
}

export class InstanceOfType implements IType {
  private _cls: any;

  constructor(cls) {
    this._cls = cls;
  }

  check(value?) {
    return value instanceof this._cls;
  }

  serialize(value?) {
    return {$$data: Object.getPrototypeOf(value).constructor.name, $$type: 'instanceOf'};
  }
}

export class NumberType implements IType {
  check(value?) {
    return typeof value === 'number';
  }

  serialize(value?) {
    return {$$data: null, $$type: 'number'};
  }
}

export class StringType implements IType {
  check(value?) {
    return typeof value === 'string';
  }

  serialize(value?) {
    return {$$data: null, $$type: 'string'};
  }
}

export class This implements IType {
  check(value?) {
    return true;
  }

  serialize(value?) {
    return this;
  }
}

export class UndefinedType implements IType {
  check(value?) {
    return value === undefined;
  }

  serialize(value?) {
    return {$$data: null, $$type: 'undefined'};
  }
}
