var FN_ARGUMENT_NAMES = /([^\s,]+)/g;
var FN_ES5_DECLARATION = /^(async\s*|)function\s*(\w*)\s*\((.*)\)[\r\n\s]*\{/g;
var FN_ES6_CLASS_CONSTRUCTOR_DECLARATION = /^class\s*(\w*).*[\r\n\s]*\{[\r\n\s]*(public\s*|protected\s*|private\s*|)constructor\s*\((.*)\)[\r\n\s]*\{/g;
var FN_ES6_CLASS_METHOD_DECLARATION = /^(public\s*|protected\s*|private\s*|)(async\s*|)(\w*)\s*\((.*)\)[\r\n\s]*\{/g;
var FN_ES6_DECLARATION = /^(async\s*|)\(?(.*?)\)?\s*=>/g;
var FN_STRIP_COMMENTS = /((\/\/.*$)|(\/\*[\s\S]*?\*\/))/mg;

function getFunctionArgNames(func) {
  var fnStr = func.toString().replace(FN_STRIP_COMMENTS, '');
  var fnArgStr = null;
  var fnName = null;

  if (fnStr.substr(0, 8) === 'function') {
    var matches = regexParseAll(FN_ES5_DECLARATION, fnStr);

    if (matches.length) {
      fnArgStr = matches[3];
      fnName = matches[2];
    }
  } else if (new RegExp(FN_ES6_DECLARATION).test(fnStr)) {
    var matches = regexParseAll(FN_ES6_DECLARATION, fnStr);

    if (matches.length) {
      fnArgStr = matches[2];
      fnName = null;
    }
  } else if (new RegExp(FN_ES6_CLASS_METHOD_DECLARATION).test(fnStr)) {
    var matches = regexParseAll(FN_ES6_CLASS_METHOD_DECLARATION, fnStr);

    if (matches.length) {
      fnArgStr = matches[4];
      fnName = matches[3];
    }
  } else if (fnStr.substr(0, 5) === 'class') {

    // es6 class, search for constructor
    while (fnStr.substr(0, 5) === 'class') {
      var matches = regexParseAll(FN_ES6_CLASS_CONSTRUCTOR_DECLARATION, fnStr);

      if (matches.length) {
        fnArgStr = matches[3];
        fnName = matches[2];

        break;
      }

      func = Object.getPrototypeOf(func);

      if (func === Object) {
        break;
      }

      fnStr = func.toString();
    }
  } else {
    return [];
  }

  if (fnArgStr === null) {
    return [];
  }

  var result = fnArgStr.match(FN_ARGUMENT_NAMES);

  if (result === null) {
    return [];
  }

  return result;
}

function regexParseAll(rgx, str) {
  rgx = new RegExp(rgx, 'mg');

  var matches = [];
  var sub;

  while (sub = rgx.exec(str)) {
    matches = matches.concat(sub);
  }

  return matches;
}

function spyOnFunction(callable, options, asConstructor) {
  if (! (callable instanceof Function)) {
    throw new Error('Callable fn must be callable');
  }

  var originalCallable = callable;
  var originalCallableAnnotation;

  if (options && options.argsAnnotation !== void 0) {
    if (Array.isArray(options.argsAnnotation)) {
      originalCallableAnnotation = options.argsAnnotation;
    } else if (options.argsAnnotation instanceof Function) {
      originalCallableAnnotation = getFunctionArgNames(options.argsAnnotation);
    } else {
      throw new Error('Spy argsAnnotation must be callable or list of arguments');
    }
  } else {
    originalCallableAnnotation = getFunctionArgNames(callable);
  }

  if (options && options.onCall !== void 0) {
    if (! (options.onCall instanceof Function)) {
      throw new Error('Spy on call must be function');
    }
  }

  callable = function () {
    callable.ARGS = {'*': []};
    callable.CALLS_COUNT ++;

    Array.prototype.forEach.call(arguments, function (val, ind) {
      if (ind >= originalCallableAnnotation.length) {
        callable.ARGS['*'].push(val);
      } else {
        callable.ARGS[originalCallableAnnotation[ind]] = val;
      }
    });
    
    var result;

    try {
      if (options && options.onCall) {
        options.onCall(this, Object.assign(
          spyOnFunctionCreateArgsReport(callable, this, originalCallable, options),
          options.extra || {}
        )); // context, fn
      }

      if (asConstructor) {
        instance.callConstructor(originalCallable, this, arguments);

        result = this;
      } else {
        result = originalCallable.apply(this, arguments);
      }

      if (result instanceof Promise) {
        callable.IS_ASYNC = true;
        callable.IS_ASYNC_PENDING = true;
        callable.RESULT = result;

        return result.then(
          function (result) {
            callable.EXCEPTION = void 0;
            callable.IS_ASYNC_PENDING = false;
            callable.IS_EXCEPTION = false;
            callable.RESULT = result;

            if (options && options.onCall) {
              options.onCall(this, Object.assign(
                spyOnFunctionCreateResultReport(callable, this, originalCallable, options),
                options.extra || {}
              )); // context, fn
            }

            return result;
          },
          function (error) {
            callable.EXCEPTION = error;
            callable.IS_ASYNC_PENDING = false;
            callable.IS_EXCEPTION = true;
            callable.RESULT = void 0;

            if (options && options.onCall) {
              options.onCall(this, Object.assign(
                spyOnFunctionCreateResultReport(callable, this, originalCallable, options),
                options.extra || {}
              )); // context, fn
            }

            throw error;
          }
        );
      }

      callable.EXCEPTION = void 0;
      callable.IS_ASYNC = false;
      callable.IS_ASYNC_PENDING = false;
      callable.IS_EXCEPTION = false;
      callable.RESULT = result;

      return result;
    } catch (e) {
      callable.EXCEPTIONS_COUNT ++;

      callable.EXCEPTION = e;
      callable.IS_ASYNC = false;
      callable.IS_ASYNC_PENDING = false;
      callable.IS_EXCEPTION = true;
      callable.RESULT = void 0;

      throw e;
    } finally {
      if (options && options.onCall) {
        options.onCall(this, Object.assign(
          spyOnFunctionCreateResultReport(callable, this, originalCallable, options),
          { result: asConstructor ? void 0 : callable.RESULT }, options.extra || {}
        )); // context, fn
      }
    }
  };

  callable.ARGS = {'*': []};
  callable.CALLS_COUNT = 0;
  callable.EXCEPTION = void 0;
  callable.EXCEPTIONS_COUNT = 0;
  callable.IS_ASYNC_PENDING = false;
  callable.IS_ASYNC = false;
  callable.IS_EXCEPTION = false;
  callable.ORIGIN = options && options.origin || originalCallable;
  callable.REPLACEMENT = options && options.replacement || callable;
  callable.RESULT = void 0;

  Object.defineProperty(callable, 'name', {value: originalCallable.name, writable: false});

  return callable;
}

function spyOnFunctionCreateArgsReport(callable, context, originalCallable, options) {
  return {
    args: callable.ARGS,
    callsCount: callable.CALLS_COUNT,
    context: context,
    //exception: callable.EXCEPTION,
    //exceptionsCount: callable.EXCEPTIONS_COUNT,
    //isAsync: callable.IS_ASYNC,
    //isAsyncPending: callable.IS_ASYNC_PENDING,
    //isException: callable.IS_EXCEPTION,
    origin: options && options.origin || originalCallable,
    replacement: options && options.replacement || originalCallable.REPLACEMENT,
  };
}

function spyOnFunctionCreateResultReport(callable, context, originalCallable, options) {
  return {
    callsCount: callable.CALLS_COUNT,
    context: context,
    exception: callable.EXCEPTION,
    exceptionsCount: callable.EXCEPTIONS_COUNT,
    isAsync: callable.IS_ASYNC,
    isAsyncPending: callable.IS_ASYNC_PENDING,
    isException: callable.IS_EXCEPTION,
    origin: options && options.origin || originalCallable,
    replacement: options && options.replacement || originalCallable.REPLACEMENT,
    result: callable.RESULT,
  };
}

function spyOnDescriptor(obj, key, repDescriptor, options, bypassClass) {
  var objIsClass = obj instanceof Function;

  if (objIsClass && bypassClass !== true) {
    obj = obj.prototype;
  }

  if (! options) {
    options = {};
  }

  if (! options.extra) {
    options.extra = {};
  }

  if (repDescriptor instanceof Function) {
    repDescriptor = {value: repDescriptor};
  }

  var descriptor = instance.getPropertyType(obj, key);

  if (! descriptor.descriptor) {
    descriptor = {
      descriptor: Object.assign({}, repDescriptor),
      type: 'function',
    };
  }

  descriptor.descriptor.configurable = descriptor.descriptor.writable = true;

  switch (descriptor.type) {
    case 'getterSetter':
      descriptor = descriptor.descriptor;

      if (repDescriptor.get) {
        descriptor.get = (function (descriptor) {
          return function () {
            descriptor.get = spyOnFunction(repDescriptor.get, Object.assign({}, options, {
              extra: Object.assign({}, options.extra, {
                name: (objIsClass ? obj.constructor.name + '.' : '') + key + '[get]',
              }),
            }));

            if (repDescriptor.set) {
              descriptor.set = spyOnFunction(repDescriptor.set, Object.assign({}, options, {
                extra: Object.assign({}, options.extra, {
                  name: (objIsClass ? obj.constructor.name + '.' : '') + key + '[set]',
                }),
              }));
            }

            Object.defineProperty(this, key, descriptor);

            return this[key];
          }
        })(descriptor);

        descriptor.get.ARGS = {'*': []};
        descriptor.get.CALLS_COUNT = 0;
        descriptor.get.EXCEPTIONS_COUNT = 0;
        descriptor.get.EXCEPTION = void 0;
        descriptor.get.IS_ASYNC = false;
        descriptor.get.IS_ASYNC_PENDING = false;
        descriptor.get.IS_EXCEPTION = false;
        descriptor.get.ORIGIN = options && options.origin;
        descriptor.get.REPLACEMENT = options && options.replacement;
        descriptor.get.RESULT = void 0;
      }

      if (repDescriptor.set) {
        descriptor.set = (function (descriptor) {
          return function (val) {
            descriptor.set = spyOnFunction(repDescriptor.set, Object.assign({}, options, {
              extra: Object.assign({}, options.extra, {
                name: (objIsClass ? obj.constructor.name + '.' : '') + key + '[set]',
              }),
            }));

            if (repDescriptor.get) {
              descriptor.get = spyOnFunction(repDescriptor.get, Object.assign({}, options, {
                extra: Object.assign({}, options.extra, {
                  name: (objIsClass ? obj.constructor.name + '.' : '') + key + '[get]',
                }),
              }));
            }

            Object.defineProperty(this, key, descriptor);

            this[key] = val;
          }
        })(descriptor);

        descriptor.set.ARGS = {'*': []};
        descriptor.set.CALLS_COUNT = 0;
        descriptor.set.EXCEPTIONS_COUNT = 0;
        descriptor.set.EXCEPTION = void 0;
        descriptor.set.IS_ASYNC = false;
        descriptor.set.IS_ASYNC_PENDING = false;
        descriptor.set.IS_EXCEPTION = false;
        descriptor.set.ORIGIN = options && options.origin;
        descriptor.set.REPLACEMENT = options && options.replacement;
        descriptor.set.RESULT = void 0;
      }

      break;

    case 'function':
      descriptor = descriptor.descriptor;

      descriptor.value = (function (descriptor) {
        return function () {
          descriptor.value = spyOnFunction(repDescriptor.value, Object.assign({}, options, {
            extra: Object.assign({
              name: (objIsClass ? obj.constructor.name + '.' : '') + key,
            }, options.extra),
          }));

          Object.defineProperty(this, key, descriptor);

          return this[key].apply(this, arguments);
        }
      })(descriptor);

      descriptor.value.ARGS = {'*': []};
      descriptor.value.CALLS_COUNT = 0;
      descriptor.value.EXCEPTIONS_COUNT = 0;
      descriptor.value.EXCEPTION = void 0;
      descriptor.value.IS_ASYNC = false;
      descriptor.value.IS_ASYNC_PENDING = false;
      descriptor.value.IS_EXCEPTION = false;
      descriptor.value.ORIGIN = options && options.origin;
      descriptor.value.REPLACEMENT = options && options.replacement;
      descriptor.value.RESULT = void 0;

      break;

    default:
      descriptor = descriptor.descriptor;
  }

  Object.defineProperty(obj, key, descriptor);

  return obj;
}

function spyOnMethod(cls, key, rep, options) {
  spyOnDescriptor(cls, key, rep || cls.prototype[key], options);

  return cls;
}

function spyOnStaticDescriptor(cls, key, repDescriptor, options) {
  spyOnDescriptor(cls, key, repDescriptor, options, true);

  return cls;
}

function spyOnStaticMethod(cls, key, rep, options) {
  spyOnDescriptor(cls, key, rep || cls[key], options, true);

  return cls;
}

module.exports = {
  getFunctionArgNames: getFunctionArgNames,
  spyOnFunction: spyOnFunction,

  spyOnDescriptor: spyOnDescriptor,
  spyOnMethod: spyOnMethod,

  spyOnStaticDescriptor: spyOnStaticDescriptor,
  spyOnStaticMethod: spyOnStaticMethod,
};

var instance = require('./instance');
