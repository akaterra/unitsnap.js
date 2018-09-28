function AnyType() {

}

AnyType.prototype = {
  clone: function (value) {
    return value;
  },
  check: function () {
    return true;
  },
  serialize: function () {
    return {$$data: null, $$type: 'any'};
  },
};

function BooleanType() {

}

BooleanType.prototype = {
  clone: function (value) {
    return value;
  },
  check: function (value) {
    return typeof value === 'boolean';
  },
  serialize: function () {
    return {$$data: null, $$type: 'boolean'};
  },
};

function ConvertToString() {

}

ConvertToString.prototype = {
  clone: function (value) {
    return String(value);
  },
  check: function (value) {
    return true;
  },
  serialize: function (value) {
    return value;
  },
};

function Copy() {

}

Copy.prototype = {
  clone: function (value) {
    return value;
  },
  check: function (value) {
    return true;
  },
  serialize: function (value) {
    return value;
  },
};

function DateType() {

}

DateType.prototype = {
  clone: function (value) {
    return value;
  },
  check: function (value) {
    return value instanceof Date;
  },
  serialize: function () {
    return {$$data: null, $$type: 'date'};
  },
};

function DateValue() {

}

DateValue.prototype = {
  clone: function (value) {
    return value;
  },
  check: function (value) {
    return value instanceof Date;
  },
  serialize: function (value) {
    return value.toISOString();
  },
};

function Ignore() {

}

Ignore.prototype = {
  clone: function (value) {
    return value;
  },
  check: function () {
    return true;
  },
  serialize: function () {
    return Ignore;
  },
};

function InstanceOfType(cls) {
  this._cls = cls;
}

InstanceOfType.prototype = {
  clone: function (value) {
    return value;
  },
  check: function (value) {
    return value instanceof this._cls;
  },
  serialize: function (value) {
    return {$$data: Object.getPrototypeOf(value).constructor.name, $$type: 'instanceOf'};
  },
};

function NumberType() {

}

NumberType.prototype = {
  clone: function (value) {
    return value;
  },
  check: function (value) {
    return typeof value === 'number';
  },
  serialize: function () {
    return {$$data: null, $$type: 'number'};
  },
};

function StrictInstanceOfType(cls) {
  this._cls = cls;
}

StrictInstanceOfType.prototype = {
  clone: function (value) {
    return value;
  },
  check: function (value) {
    return value !== void 0 && value !== null && Object.getPrototypeOf(value) && Object.getPrototypeOf(value).constructor === this._cls;
  },
  serialize: function () {
    return {$$data: this._cls.prototype.constructor.name, $$type: 'classOf'};
  },
};

function StringType() {

}

StringType.prototype = {
  clone: function (value) {
    return value;
  },
  check: function (value) {
    return typeof value === 'string';
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
  serialize: function () {
    return {$$data: null, $$type: 'undefined'};
  },
};

module.exports = {
  AnyType: AnyType,
  BooleanType: BooleanType,
  ConvertToString: ConvertToString,
  Copy: Copy,
  DateType: DateType,
  DateValue: DateValue,
  Ignore: Ignore,
  InstanceOfType: InstanceOfType,
  NumberType: NumberType,
  StrictInstanceOfType: StrictInstanceOfType,
  StringType: StringType,
  UndefinedType: UndefinedType,
};
