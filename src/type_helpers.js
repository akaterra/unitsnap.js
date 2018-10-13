function AnyType() {
  if (this instanceof AnyType) {

  } else {
    return new AnyType();
  }
}

AnyType.prototype = {
  check: function () {
    return true;
  },
  copy: function (value) {
    return value;
  },
  serialize: function () {
    return {$$data: null, $$type: 'any'};
  },
};

function ArrayType() {
  if (this instanceof ArrayType) {

  } else {
    return new ArrayType();
  }
}

ArrayType.prototype = {
  check: function (value) {
    return Array.isArray(value);
  },
  copy: function (value) {
    return value.slice();
  },
  serialize: function (value) {
    return value;
  },
};

function BooleanType() {
  if (this instanceof BooleanType) {

  } else {
    return new BooleanType();
  }
}

BooleanType.prototype = {
  check: function (value) {
    return typeof value === 'boolean';
  },
  copy: function (value) {
    return value;
  },
  serialize: function () {
    return {$$data: null, $$type: 'boolean'};
  },
};

function DateType() {
  if (this instanceof DateType) {

  } else {
    return new DateType();
  }
}

DateType.prototype = {
  check: function (value) {
    return value instanceof Date;
  },
  copy: function (value) {
    return new Date(value);
  },
  serialize: function () {
    return {$$data: null, $$type: 'date'};
  },
};

function DateToIsoString() {
  if (this instanceof DateToIsoString) {

  } else {
    return new DateToIsoString();
  }
}

DateToIsoString.prototype = {
  check: function (value) {
    return value instanceof Date;
  },
  copy: function (value) {
    return value.toISOString();
  },
  serialize: function (value) {
    return value.toISOString();
  },
};

function Ignore() {
  if (this instanceof Ignore) {

  } else {
    return new Ignore();
  }
}

Ignore.prototype = {
  check: function () {
    return true;
  },
  copy: function () {
    return Ignore;
  },
  serialize: function () {
    return Ignore;
  },
};

function Initial() {
  if (this instanceof Initial) {

  } else {
    return new Initial();
  }
}

Initial.prototype = {
  check: function () {
    return true;
  },
  copy: function (value) {
    return value;
  },
  serialize: function () {
    return value;
  },
};

function InstanceOfType(cls) {
  if (this instanceof InstanceOfType) {
    this._cls = cls;
  } else {
    return new InstanceOfType(cls);
  }
}

InstanceOfType.prototype = {
  check: function (value) {
    return value instanceof this._cls;
  },
  copy: function (value) {
    return value;
  },
  serialize: function (value) {
    return {$$data: Object.getPrototypeOf(value).constructor.name, $$type: 'instanceOf'};
  },
};

function NumberType() {
  if (this instanceof NumberType) {

  } else {
    return new NumberType();
  }
}

NumberType.prototype = {
  check: function (value) {
    return typeof value === 'number';
  },
  copy: function (value) {
    return value;
  },
  serialize: function () {
    return {$$data: null, $$type: 'number'};
  },
};

function ObjectType() {
  if (this instanceof ObjectType) {

  } else {
    return new ObjectType();
  }
}

ObjectType.prototype = {
  check: function (value) {
    return value && Object.getPrototypeOf(value) === Object.prototype;
  },
  copy: function (value) {
    return Object.assign({}, value);
  },
  serialize: function (value) {
    return value;
  },
};

function Path(path) {
  if (this instanceof Path) {
    this._checkRegex = new RegExp('^' + path
        .replace(/[-[\]{}()+.,\\^$|#\s]/g, '\\$&')
        .replace(/\*/g, '.*')
        .replace(/\?/g, '.') + '$'
    );
  } else {
    return new Path(path);
  }
}

Path.prototype = {
  check: function (value, path) {
    return this._checkRegex.test(path);
  },
  copy: function (value) {
    return value;
  },
  serialize: function (value) {
    return value;
  },
};

function RegexPath(regex) {
  if (this instanceof RegexPath) {
    this._checkRegex = regex instanceof RegExp ? regex : new RegExp(regex);
  } else {
    return new RegexPath(regex);
  }
}

RegexPath.prototype = {
  check: function (value, path) {
    return this._checkRegex.test(path);
  },
  copy: function (value) {
    return value;
  },
  serialize: function (value) {
    return value;
  },
};

function ShallowCopy() {
  if (this instanceof ShallowCopy) {

  } else {
    return new ShallowCopy();
  }
}

ShallowCopy.prototype = {
  check: function () {
    return true;
  },
  copy: function (value) {
    if (Array.isArray(value)) {
      return value.slice();
    }

    if (value && typeof value === 'object') {
      return Object.assign({}, value);
    }

    return value;
  },
  serialize: function (value) {
    return this.copy(value);
  },
};

function StrictInstanceOfType(cls) {
  if (this instanceof StrictInstanceOfType) {
    this._cls = cls;
  } else {
    return new StrictInstanceOfType(cls);
  }
}

StrictInstanceOfType.prototype = {
  check: function (value) {
    return value !== void 0 && value !== null && Object.getPrototypeOf(value) && Object.getPrototypeOf(value).constructor === this._cls;
  },
  copy: function (value) {
    return value;
  },
  serialize: function () {
    return {$$data: this._cls.prototype.constructor.name, $$type: 'strictInstanceOf'};
  },
};

function StringType() {
  if (this instanceof StringType) {

  } else {
    return new StringType();
  }
}

StringType.prototype = {
  check: function (value) {
    return typeof value === 'string';
  },
  copy: function (value) {
    return value;
  },
  serialize: function () {
    return {$$data: null, $$type: 'string'};
  },
};

function ToString() {
  if (this instanceof ToString) {

  } else {
    return new ToString();
  }
}

ToString.prototype = {
  check: function () {
    return true;
  },
  copy: function (value) {
    return String(value);
  },
  serialize: function (value) {
    return this.copy(value);
  },
};

function UndefinedType() {
  if (this instanceof UndefinedType) {

  } else {
    return new UndefinedType();
  }
}

UndefinedType.prototype = {
  check: function (value) {
    return value === void 0;
  },
  copy: function () {
    return void 0;
  },
  serialize: function () {
    return {$$data: null, $$type: 'undefined'};
  },
};

module.exports = {
  AnyType: AnyType,
  ArrayType: ArrayType,
  BooleanType: BooleanType,
  DateType: DateType,
  DateToIsoString: DateToIsoString,
  Ignore: Ignore,
  Initial: Initial,
  InstanceOfType: InstanceOfType,
  NumberType: NumberType,
  ObjectType: ObjectType,
  Path: Path,
  RegexPath: RegexPath,
  ShallowCopy: ShallowCopy,
  StrictInstanceOfType: StrictInstanceOfType,
  StringType: StringType,
  ToString: ToString,
  UndefinedType: UndefinedType,
};
