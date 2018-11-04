var copyPrototype = require('../inspection').copyPrototype;

function Descriptor(descriptor) {
  if (this instanceof Descriptor) {
    this.descriptor = Object.assign({}, descriptor);
  } else {
    return new Descriptor(descriptor || {});
  }
}

Descriptor.prototype = {
  create: function () {
    throw new Error('"createGetterSetterDescriptor" or "createValueDescriptor" can only be used for' + (this.descriptor.name || '?'));
  },
  createGetterSetterDescriptor: function () {
    var descriptor = {};

    if (this.descriptor.hasOwnProperty('get')) {
      descriptor.get = this.descriptor.get;
    }

    if (this.descriptor.hasOwnProperty('set')) {
      descriptor.set = this.descriptor.set;
    }

    return descriptor;
  },
  createValueDescriptor: function () {
    var descriptor = {};

    if (this.descriptor.hasOwnProperty('value')) {
      descriptor.value = this.descriptor.value;
    }

    return descriptor;
  },
  get: function (get) {
    this.descriptor.get = get !== void 0 ? get : Function;

    return this;
  },
  set: function (set) {
    this.descriptor.set = set !== void 0 ? set : Function;

    return this;
  },
  value: function (value) {
    this.descriptor.value = value;

    return this;
  },
};

function GetterSetter(getter, setter) {
  if (this instanceof GetterSetter) {
    this.descriptor = {get: getter, set: setter};
  } else {
    return new GetterSetter(getter, setter);
  }
}

function Method(value) {
  if (this instanceof Method) {
    this.descriptor = {value: value !== void 0 ? value : Function};
  } else {
    return new Method(value !== void 0 ? value : Function);
  }
}

function StaticGetterSetter(getter, setter) {
  if (this instanceof StaticGetterSetter) {
    this.descriptor = {get: getter, set: setter};
  } else {
    return new StaticGetterSetter(getter, setter);
  }
}

function StaticMethod(value) {
  if (this instanceof StaticMethod) {
    this.descriptor = {value: value !== void 0 ? value : Function};
  } else {
    return new StaticMethod(value !== void 0 ? value : Function);
  }
}

function StaticValue(value) {
  if (this instanceof StaticValue) {
    this.descriptor = {value: value};
  } else {
    return new StaticValue(value);
  }
}

function Value(value) {
  if (this instanceof Value) {
    this.descriptor = {value: value};
  } else {
    return new Value(value);
  }
}

module.exports = {
  Descriptor: Descriptor,
  GetterSetter: GetterSetter,
  Method: Method,
  StaticGetterSetter: StaticGetterSetter,
  StaticValue: StaticValue,
  Value: Value,
};

var descriptorWithValueOnly = {
  create: function () {
    return this.createValueDescriptor();
  },
  createGetterSetterDescriptor: function () {
    throw new Error('Descriptor with value can only be used for: ' + (this.descriptor.name || '?'));
  },
  get: function () {
    throw new Error('Descriptor with value can only be used for: ' + (this.descriptor.name || '?'));
  },
  set: function () {
    throw new Error('Descriptor with value can only be used for: ' + (this.descriptor.name || '?'));
  },
};

var descriptorWithGetterSetterOnly = {
  create: function () {
    return this.createGetterSetterDescriptor();
  },
  createValueDescriptor: function () {
    throw new Error('Descriptor with getter/setter can only be used for: ' + (this.descriptor.name || '?'));
  },
  value: function () {
    throw new Error('Descriptor with getter/setter can only be used for: ' + (this.descriptor.name || '?'));
  },
};

GetterSetter.prototype = Object.assign(copyPrototype(Descriptor), descriptorWithGetterSetterOnly);
Method.prototype = Object.assign(copyPrototype(Descriptor), descriptorWithValueOnly);
StaticGetterSetter.prototype = Object.assign(copyPrototype(Descriptor), descriptorWithGetterSetterOnly);
StaticMethod.prototype = Object.assign(copyPrototype(Descriptor), descriptorWithValueOnly);
StaticValue.prototype = Object.assign(copyPrototype(Descriptor), descriptorWithValueOnly);
Value.prototype = Object.assign(copyPrototype(Descriptor), descriptorWithValueOnly);
