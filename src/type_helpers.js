function AnyType() {

}

AnyType.prototype = {
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
  check: function (value) {
    return typeof value === 'boolean';
  },
  serialize: function () {
    return {$$data: null, $$type: 'boolean'};
  },
};

function ClassOfType(cls) {
  this._cls = cls;
}

ClassOfType.prototype = {
  check: function (value) {
    return value !== void 0 && value !== null && Object.getPrototypeOf(value) && Object.getPrototypeOf(value).constructor === this._cls;
  },
  serialize: function () {
    return {$$data: this._cls.prototype.constructor.name, $$type: 'classOf'};
  },
};

function Continue(value) {
  this.value = value;
}

Continue.prototype = {
  check: function (value) {
    return true;
  },
  serialize: function () {
    return Continue;
  },
};

function DateType() {

}

DateType.prototype = {
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
  check: function (value) {
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
  check: function (value) {
    return typeof value === 'number';
  },
  serialize: function () {
    return {$$data: null, $$type: 'number'};
  },
};

function StringType() {

}

StringType.prototype = {
  check: function (value) {
    return typeof value === 'string';
  },
  serialize: function () {
    return {$$data: null, $$type: 'string'};
  },
};

function This() {

}

This.prototype = {
  check: function () {
    return true;
  },
  serialize: function () {
    return this;
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
  ClassOfType: ClassOfType,
  Continue: Continue,
  DateType: DateType,
  DateValue: DateValue,
  Ignore: Ignore,
  InstanceOfType: InstanceOfType,
  NumberType: NumberType,
  StringType: StringType,
  This: This,
  UndefinedType: UndefinedType,
};
