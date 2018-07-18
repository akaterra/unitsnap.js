function getDescriptorAndType(obj, key) {
  var descriptor = Object.getOwnPropertyDescriptor(obj, key);

  if (descriptor) {
    if (descriptor.hasOwnProperty('get') || descriptor.hasOwnProperty('set')) {
      return {descriptor: descriptor, type: 'getterSetter'};
    } else if (descriptor.hasOwnProperty('value')) {
      return {descriptor: descriptor, type: descriptor.value instanceof Function ? 'function' : 'value'};
    }
  }

  return {descriptor: descriptor, type: null};
}

function callConstructor(cls, context, a) {
  var c;

  switch (a.length) {
    case 0:
      c = new cls();

      break;

    case 1:
      c = new cls(a[0]);

      break;

    case 2:
      c = new cls(a[0], a[1]);

      break;

    case 3:
      c = new cls(a[0], a[1], a[2]);

      break;

    case 4:
      c = new cls(a[0], a[1], a[2], a[3]);

      break;

    case 5:
      c = new cls(a[0], a[1], a[2], a[3], a[4]);

      break;

    case 6:
      c = new cls(a[0], a[1], a[2], a[3], a[4], a[5]);

      break;

    case 7:
      c = new cls(a[0], a[1], a[2], a[3], a[4], a[5], a[6]);

      break;

    case 8:
      c = new cls(a[0], a[1], a[2], a[3], a[4], a[5], a[6], a[7]);

      break;

    case 9:
      c = new cls(a[0], a[1], a[2], a[3], a[4], a[5], a[6], a[7], a[8]);

      break;

    case 10:
      c = new cls(a[0], a[1], a[2], a[3], a[4], a[5], a[6], a[7], a[8], a[9]);

      break;

    default:
      throw new Error('Constructor has too many arguments');
  }

  Object.getOwnPropertyNames(c).forEach(function (key) {
    context[key] = c[key];
  });

  return c;
}

function copyConstructor(cls) {
  var Constructor = function () {
    var instance = callConstructor(cls, this, arguments);

    return instance instanceof cls ? void 0 : instance;
  };

  Constructor.prototype = cls.prototype;

  return Constructor;
}

function copyPrototype(cls, options) {
  var Prototype = function () {};

  Prototype.prototype = Object.getPrototypeOf(cls.prototype);

  return Object.getOwnPropertyNames(cls.prototype).reduce(function (acc, key) {
    Object.defineProperty(acc, key, Object.assign(getDescriptorAndType(cls.prototype, key).descriptor, options || {}));

    return acc;
  }, new Prototype());
}

function copyScope(cls, options, maxDepth) {
  var scope = {};

  while (true) {
    if (maxDepth !== void 0) {
      maxDepth -= 1;

      if (maxDepth < 0) {
        break;
      }
    }

    if (cls) {
      Object.getOwnPropertyNames(cls).forEach(function (key) {
        if (! scope.hasOwnProperty(key)) {
          var descriptor = getDescriptorAndType(cls, key);

          if (options) {
            Object.assign(descriptor.descriptor, options);
          }

          Object.defineProperty(scope, key, descriptor.descriptor);
        }
      });
    } else {
      break;
    }

    cls = cls instanceof Function ? cls.prototype : Object.getPrototypeOf(cls);
  }

  return scope;
}

function copyScopeDescriptors(cls, options, maxDepth) {
  var scope = {};

  while (true) {
    cls = cls instanceof Function ? cls.prototype : Object.getPrototypeOf(cls);

    if (maxDepth !== void 0) {
      maxDepth -= 1;

      if (maxDepth < 0) {
        break;
      }
    }

    if (cls) {
      Object.getOwnPropertyNames(cls).forEach(function (key) {
        if (! scope.hasOwnProperty(key)) {
          var descriptor = getDescriptorAndType(cls, key);

          if (options) {
            Object.assign(descriptor.descriptor, options);
          }

          scope[key] = descriptor;
        }
      });
    } else {
      break;
    }
  }

  return scope;
}

module.exports = {
  getPropertyType: getDescriptorAndType,
  callConstructor: callConstructor,
  copyConstructor: copyConstructor,
  copyPrototype: copyPrototype,
  copyScope: copyScope,
  copyScopeDescriptors: copyScopeDescriptors,
};
