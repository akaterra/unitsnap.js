const FN_ARGUMENT_NAMES = /(\.*[\w\d_]+(\s*:\s*[\w\d_]+)?(\s*=\s*['"\w\d_]+)?|\{.*})/g;
const FN_ES5_DECLARATION = /^(async\s*|)function\*?\s*(\w*)\s*\((.*?)\)[\r\n\s]*\{/g;
const FN_ES6_CLASS_CONSTRUCTOR_DECLARATION = /^class\s*(\w*).*[\r\n\s]*\{[\r\n\s]*()constructor\s*\((.*)\)[\r\n\s]*\{/g;
const FN_ES6_CLASS_METHOD_DECLARATION = /^(static\s*|)(async\s*|)(get\s*|set\s*|)(\w*)\s*\((.*?)\)[\r\n\s]*\{/g;
const FN_ES6_DECLARATION = /^(async\s*|)\(?(.*?)\)?\s*=>/g;
const FN_STRIP_COMMENTS = /((\/\/.*$)|(\/\*[\s\S]*?\*\/))/mg;

export function parseFunctionAnnotation(func) {
  let fnStr = func.toString().replace(FN_STRIP_COMMENTS, '').replace(/\n/g, '');
  let fnArgStr = null;
  let fnName = null;
  let matches;

  if (new RegExp(FN_ES5_DECLARATION).test(fnStr)) {
    matches = regexExecAll(FN_ES5_DECLARATION, fnStr);

    if (matches.length) {
      fnArgStr = matches[3];
      fnName = matches[2];
    }
  } else if (new RegExp(FN_ES6_CLASS_METHOD_DECLARATION).test(fnStr)) {
    matches = regexExecAll(FN_ES6_CLASS_METHOD_DECLARATION, fnStr);

    if (matches.length) {
      fnArgStr = matches[5];
      fnName = matches[4];
    }
  } else if (new RegExp(FN_ES6_DECLARATION).test(fnStr)) {
    matches = regexExecAll(FN_ES6_DECLARATION, fnStr);

    if (matches.length) {
      fnArgStr = matches[2];
      fnName = null;
    }
  } else if (fnStr.slice(0, 5) === 'class') {

    // es6 class, search for constructor
    while (fnStr.slice(0, 5) === 'class') {
      matches = regexExecAll(FN_ES6_CLASS_CONSTRUCTOR_DECLARATION, fnStr);

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
    return { args: [], argsDeclaration: '', name: fnName };
  }

  const annotations = {
    args: [],
    argsDeclaration: (fnArgStr.match(FN_ARGUMENT_NAMES) || []).join(','),
    name: fnName || null,
  };

  (fnArgStr.match(FN_ARGUMENT_NAMES) || []).forEach(function (arg) {
    annotations.args.push(parseFunctionAnnotationCreateArgDescriptor(arg));
  });

  return annotations;
}

export function parseFunctionAnnotationCreateArgDescriptor(arg) {
  if (arg.slice(0, 3) === '...') {
    return { alias: null, default: undefined, name: arg.slice(3), type: 'rest' };
  } else if (arg.slice(0, 1) === '{') {
    return {
      alias: null,
      default: undefined,
      props: (arg.slice(1, - 1).match(FN_ARGUMENT_NAMES) || []).map(parseFunctionAnnotationCreateArgDescriptor),
      type: 'unpack',
    };
  }

  let argDefault = undefined;
  const argDefaultIndex = arg.indexOf('=');

  if (argDefaultIndex !== - 1) {
    argDefault = arg.slice(argDefaultIndex + 1).trim();
    arg = arg.slice(0, argDefaultIndex).trim();
  }

  let argAlias = null;
  const argAliasIndex = arg.indexOf(':');

  if (argAliasIndex !== - 1) {
    argAlias = arg.slice(argAliasIndex + 1).trim();
    arg = arg.slice(0, argAliasIndex).trim();
  }

  return {
    alias: argAlias,
    default: argDefault,
    name: arg,
    type: 'positional',
  };
}

function regexExecAll(rgx, str) {
  rgx = new RegExp(rgx, 'mg');

  let matches = [];
  let sub;

  while (sub = rgx.exec(str)) {
    matches = matches.concat(sub);
  }

  return matches;
}

export function getAncestors(cls) {
  if (! cls) {
    return [];
  }

  const ancestors = [ cls ];

  while (true) {
    cls = Object.getPrototypeOf(cls);

    if (cls && cls instanceof Function) {
      ancestors.push(cls);
    } else {
      break;
    }
  }

  return ancestors;
}

export function getDescriptorAndType(obj, key) {
  const name = typeof obj === 'function'
    ? obj.prototype.constructor.name
    : Object.getPrototypeOf(obj) && Object.getPrototypeOf(obj).constructor.name || null;

  const descriptor: any = {
    contextName: name,
    descriptor: Object.getOwnPropertyDescriptor(obj, key),
    get: null,
    set: null,
    function: null,
    name: name ? name + '.' + key : key,
    type: null,
  };

  if (descriptor.descriptor) {
    if (descriptor.descriptor.hasOwnProperty('get') || descriptor.descriptor.hasOwnProperty('set')) {
      descriptor.type = 'getterSetter';

      if (descriptor.descriptor.get) {
        descriptor.get = parseFunctionAnnotation(descriptor.descriptor.get);
      }

      if (descriptor.descriptor.set) {
        descriptor.set = parseFunctionAnnotation(descriptor.descriptor.set);
      }
    } else if (descriptor.descriptor.hasOwnProperty('value')) {
      if (typeof descriptor.descriptor.value === 'function') { // @
        descriptor.function = parseFunctionAnnotation(descriptor.descriptor.value);
        descriptor.type = 'function';
      } else {
        descriptor.type = 'value';
      }
    }
  }

  return descriptor;
}

export function callConstructor(cls, context, args) {
  let instance;

  switch (args.length) {
  case 0:
    instance = new cls();

    break;
  case 1:
    instance = new cls(args[0]);

    break;
  case 2:
    instance = new cls(args[0], args[1]);

    break;
  case 3:
    instance = new cls(args[0], args[1], args[2]);

    break;
  case 4:
    instance = new cls(args[0], args[1], args[2], args[3]);

    break;
  case 5:
    instance = new cls(args[0], args[1], args[2], args[3], args[4]);

    break;
  case 6:
    instance = new cls(args[0], args[1], args[2], args[3], args[4], args[5]);

    break;
  case 7:
    instance = new cls(args[0], args[1], args[2], args[3], args[4], args[5], args[6]);

    break;
  case 8:
    instance = new cls(args[0], args[1], args[2], args[3], args[4], args[5], args[6], args[7]);

    break;
  case 9:
    instance = new cls(args[0], args[1], args[2], args[3], args[4], args[5], args[6], args[7], args[8]);

    break;
  case 10:
    instance = new cls(args[0], args[1], args[2], args[3], args[4], args[5], args[6], args[7], args[8], args[9]);

    break;
  default:
    throw new Error('Constructor has too many arguments');
  }

  Object.getOwnPropertyNames(instance).forEach(function (key) {
    context[key] = instance[key];
  });

  return instance;
}

export function copyConstructor(cls, explicitInstance?): any {
  const Constructor = function (...args) {
    const instance = callConstructor(cls, this, args);

    return explicitInstance || instance instanceof cls ? undefined : instance;
  };

  Constructor.prototype = cls.prototype;

  Object.defineProperty(Constructor, 'name', { value: cls.name });

  return Constructor;
}

export function copyPrototype(cls, options?) {
  const Prototype = function () {};

  Prototype.prototype = Object.getPrototypeOf(cls.prototype);

  return Object.getOwnPropertyNames(cls.prototype).reduce((acc, key) => {
    Object.defineProperty(acc, key, { ...getDescriptorAndType(cls.prototype, key).descriptor, ...options ?? {} });

    return acc;
  }, new Prototype());
}

export function copyScope(cls, options?, maxDepth?): Record<string, unknown> {
  let level = 0;
  const scope = {};

  while (true) {
    if (maxDepth !== undefined) {
      maxDepth -= 1;

      if (maxDepth < 0) {
        break;
      }
    }

    if (cls) {
      Object.getOwnPropertyNames(cls).forEach(function (key) {
        if (! Object.prototype.hasOwnProperty.call(scope, key)) {
          const descriptor = getDescriptorAndType(cls, key);

          descriptor.level = level;

          if (options) {
            Object.assign(descriptor.descriptor, options);
          }

          Object.defineProperty(scope, key, descriptor.descriptor);
        }
      });
    } else {
      break;
    }

    level += 1;
    cls = typeof cls === 'function' ? cls.prototype : Object.getPrototypeOf(cls);
  }

  return scope;
}

export function copyScopeDescriptors(cls, options?, maxDepth?) {
  let level = 0;
  const scope = {};

  while (true) {
    if (maxDepth !== undefined) {
      maxDepth -= 1;

      if (maxDepth < 0) {
        break;
      }
    }

    if (cls) {
      Object.getOwnPropertyNames(cls).forEach(function (key) {
        if (! Object.prototype.hasOwnProperty.call(scope, key)) {
          const descriptor = getDescriptorAndType(cls, key);

          descriptor.level = level;

          if (options) {
            Object.assign(descriptor.descriptor, options);
          }

          scope[key] = descriptor;
        }
      });
    } else {
      break;
    }

    level += 1;
    cls = typeof cls === 'function' ? cls.prototype : Object.getPrototypeOf(cls);
  }

  return scope;
}
