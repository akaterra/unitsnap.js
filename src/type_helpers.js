function AnyType() {

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

function BooleanType() {

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

function ConvertToString() {

}

ConvertToString.prototype = {
  check: function (value) {
    return true;
  },
  copy: function (value) {
    return String(value);
  },
  serialize: function (value) {
    return this.copy(value);
  },
};

function DateType() {

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

function DateValue() {

}

DateValue.prototype = {
  check: function (value) {
    return value instanceof Date;
  },
  copy: function (value) {
    return new Date(value);
  },
  serialize: function (value) {
    return value.toISOString();
  },
};

function Ignore() {

}

Ignore.prototype = {
  check: function () {
    return true;
  },
  copy: function (value) {
    return value;
  },
  serialize: function () {
    return Ignore;
  },
};

function Initial() {

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
  this._cls = cls;
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

function ShallowCopy() {

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
  this._cls = cls;
}

StrictInstanceOfType.prototype = {
  check: function (value) {
    return value !== void 0 && value !== null && Object.getPrototypeOf(value) && Object.getPrototypeOf(value).constructor === this._cls;
  },
  copy: function (value) {
    return value;
  },
  serialize: function () {
    return {$$data: this._cls.prototype.constructor.name, $$type: 'classOf'};
  },
};

function StringType() {

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

function UndefinedType() {

}

UndefinedType.prototype = {
  check: function (value) {
    return value === void 0;
  },
  copy: function (value) {
    return value;
  },
  serialize: function () {
    return {$$data: null, $$type: 'undefined'};
  },
};

module.exports = {
  AnyType: AnyType,
  BooleanType: BooleanType,
  ConvertToString: ConvertToString,
  DateType: DateType,
  DateValue: DateValue,
  Ignore: Ignore,
  Initial: Initial,
  InstanceOfType: InstanceOfType,
  NumberType: NumberType,
  ShallowCopy: ShallowCopy,
  StrictInstanceOfType: StrictInstanceOfType,
  StringType: StringType,
  UndefinedType: UndefinedType,
};
