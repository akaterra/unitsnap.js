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

function spyFunction(callable, options, asConstructor) {
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
          spyFunctionCreateArgsReport(callable, this, originalCallable, options),
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
                spyFunctionCreateResultReport(callable, this, originalCallable, options),
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
                spyFunctionCreateResultReport(callable, this, originalCallable, options),
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
          spyFunctionCreateResultReport(callable, this, originalCallable, options),
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

function spyFunctionCreateArgsReport(callable, context, originalCallable, options) {
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

function spyFunctionCreateResultReport(callable, context, originalCallable, options) {
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

function spyStaticMethod(cls, key, rep, options) {
  cls[key] = spyFunction(rep || cls[key], options);

  return cls;
}

function spyInstanceMethod(cls, key, rep, options) {
  if (! rep) {
    rep = cls.prototype[key];
  }

  var clsMethod = cls.prototype[key];

  cls.prototype[key] = function () {
    if (! options) {
      options = {};
    }

    if (! options.extra) {
      options.extra = {};
    }

    options.extra = Object.assign({
      name: options && options.name || (cls.prototype.constructor.name + '.' + rep.name),
    }, options.extra);

    this[key] = spyFunction(rep, options);

    return this[key].apply(this, arguments);
  };

  cls.prototype[key].ARGS = {'*': []};
  cls.prototype[key].CALLS_COUNT = 0;
  cls.prototype[key].EXCEPTIONS_COUNT = 0;
  cls.prototype[key].EXCEPTION = void 0;
  cls.prototype[key].IS_ASYNC = false;
  cls.prototype[key].IS_ASYNC_PENDING = false;
  cls.prototype[key].IS_EXCEPTION = false;
  cls.prototype[key].ORIGIN = options && options.origin || clsMethod;
  cls.prototype[key].REPLACEMENT = options && options.replacement || rep;
  cls.prototype[key].RESULT = void 0;

  return cls;
}

function spyInstanceProperty(cls, key, repGetter, repSetter, options) {
  cls[key] = spyFunction(rep || cls[key], options);

  return cls;
}

module.exports = {
  getFunctionArgNames: getFunctionArgNames,
  spyStaticMethod: spyStaticMethod,
  spyFunction: spyFunction,
  spyInstanceMethod: spyInstanceMethod,
  spyInstanceProperty: spyInstanceProperty,
};

var instance = require('./instance');
