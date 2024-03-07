import * as instance from './instance';
import { _Custom } from './mock';
import { Fn } from './utils';

export type SpyOnFunctionOptions = {
  argsAnnotation?: _Custom['_argsAnnotation'];
  bypassOnBehalfOfInstanceReplacement?: boolean;
  epoch?: _Custom['_epoch'];
  exclude?: _Custom['_exclude'];
  extra?: Record<string, any>;
  get?: Omit<SpyOnFunctionOptions, 'get' | 'set'>;
  set?: Omit<SpyOnFunctionOptions, 'get' | 'set'>;
  origin?: Fn;
  replacement?: Fn;
  onCall?: (context: unknown, state: State) => void;
  onEnterLevel?: () => number;
  onLeaveLevel?: () => number;
}

export enum StateReportType {
  CALL_ARGS = 'callArgs',
  RETURN_VALUE = 'returnValue',
}

export enum StateType {
  CONSTRUCTOR = 'constructor',
  METHOD = 'method',
  GETTER = 'getter',
  SETTER = 'setter',
  SINGLE = 'single',
  STATIC_METHOD = 'staticMethod',
  STATIC_GETTER = 'staticGetter',
  STATIC_SETTER = 'staticSetter',
}

export interface State {
  args?: {
      '*'?: any[];
      [key: string]: any;
  };
  callsCount?: number;
  comment?: string;
  context?: any;
  epoch?: string;
  exception?: any | Error;
  exceptionsCount?: number;
  isAsync?: boolean;
  isAsyncPending?: boolean;
  isException?: boolean;
  level?: number;
  name?: string;
  origin?: (...args: any[]) => any;
  replacement?: (...args: any[]) => any;
  reportType?: StateReportType;
  result?: any;
  tags?: string[];
  time?: Date;
  type?: StateType;
}

export function spyOnFunction(callable, options?: SpyOnFunctionOptions, asConstructor?: boolean) {
  if (typeof callable !== 'function') {
    throw new Error('Callable fn must be callable');
  }

  const originalCallable = callable;
  let originalCallableAnnotation;

  if (options && options.argsAnnotation) {
    if (Array.isArray(options.argsAnnotation)) {
      originalCallableAnnotation = { args: options.argsAnnotation.map((arg) => {
        return typeof arg === 'string' ? instance.parseFunctionAnnotationCreateArgDescriptor(arg) : arg;
      }) };
    } else if (typeof options.argsAnnotation === 'function') {
      originalCallableAnnotation = instance.parseFunctionAnnotation(options.argsAnnotation);
    } else {
      throw new Error('Spy argsAnnotation must be callable or list of arguments');
    }
  } else {
    originalCallableAnnotation = instance.parseFunctionAnnotation(options && options.origin || callable);
  }

  if (options && options.onCall) {
    if (typeof options.onCall !== 'function') {
      throw new Error('Spy on call must be function');
    }
  }

  callable = function (...args: unknown[]) {
    callable.ARGS = { '*': [] };
    callable.CALLS_COUNT ++;

    let isRest = false;
    let isRestEs6Ind = null;

    args.forEach((val, ind) => {
      if (ind >= originalCallableAnnotation.args.length) {
        isRest = true;
      } else if (originalCallableAnnotation.args[ind].type === 'rest') {
        isRest = true;
        isRestEs6Ind = ind;
        callable.ARGS[originalCallableAnnotation.args[isRestEs6Ind].name] = [];

        delete callable.ARGS['*'];
      } else if (originalCallableAnnotation.args[ind].type === 'unpack') {
        originalCallableAnnotation.args[ind].props.forEach((annotation) => {
          callable.ARGS[annotation.alias || annotation.name] = val[annotation.name];
        });

        return;
      }

      if (isRest) {
        callable.ARGS[isRestEs6Ind !== null ? originalCallableAnnotation.args[isRestEs6Ind].name : '*'].push(val);
      } else {
        callable.ARGS[originalCallableAnnotation.args[ind].name] = val;
      }
    });
    
    let result;

    try {
      if (options && options.onCall) {
        if (options.exclude !== true) {
          options.onCall(this, {
            ...spyOnFunctionCreateArgsReport(callable, this, originalCallable, options),
            ...options.extra ?? {},
          }); // context, fn
        }
      }

      if (asConstructor) {
        instance.callConstructor(originalCallable, this, args);

        result = this; // eslint-disable-line @typescript-eslint/no-this-alias
      } else {
        result = originalCallable.apply(this, args);
      }

      if (result instanceof Promise) {
        callable.IS_ASYNC = true;
        callable.IS_ASYNC_PENDING = true;
        callable.RESULT = result;

        return result.then(
          function (result) {
            callable.EXCEPTION = undefined;
            callable.IS_ASYNC_PENDING = false;
            callable.IS_EXCEPTION = false;
            callable.RESULT = result;

            if (options && options.onCall) {
              if (options.exclude !== true) {
                options.onCall(this, {
                  ...spyOnFunctionCreateResultReport(callable, this, originalCallable, options),
                  ...options.extra ?? {},
                }); // context, fn
              }
            }

            return result;
          },
          function (error) {
            callable.EXCEPTION = error;
            callable.IS_ASYNC_PENDING = false;
            callable.IS_EXCEPTION = true;
            callable.RESULT = undefined;

            if (options && options.onCall) {
              if (options.exclude !== true) {
                options.onCall(this, {
                  ...spyOnFunctionCreateResultReport(callable, this, originalCallable, options),
                  ...options.extra || {},
                }); // context, fn
              }
            }

            throw error;
          }
        );
      }

      callable.EXCEPTION = undefined;
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
      callable.RESULT = undefined;

      throw e;
    } finally {
      if (options && options.onCall) {
        if (options.exclude !== true) {
          options.onCall(this, {
            ...spyOnFunctionCreateResultReport(callable, this, originalCallable, options),
            ...options.extra || {},
            result: asConstructor ? undefined : callable.RESULT
          }); // context, fn
        }
      }
    }
  };

  callable.ARGS = { '*': [] };
  callable.CALLS_COUNT = 0;
  callable.EXCEPTION = undefined;
  callable.EXCEPTIONS_COUNT = 0;
  callable.IS_ASYNC_PENDING = false;
  callable.IS_ASYNC = false;
  callable.IS_EXCEPTION = false;
  callable.ORIGIN = options && options.origin || originalCallable;
  callable.REPLACEMENT = options && options.replacement || callable;
  callable.RESULT = undefined;

  Object.defineProperty(callable, 'name', { value: originalCallable.name, writable: false });

  return callable;
}

export function spyOnFunctionCreateArgsReport(callable, context?, originalCallable?, options?: SpyOnFunctionOptions) {
  return {
    level: options?.onEnterLevel ? options.onEnterLevel() : 0,
    reportType: StateReportType.CALL_ARGS,

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

export function spyOnFunctionCreateResultReport(callable, context?, originalCallable?, options?: SpyOnFunctionOptions) {
  return {
    level: options?.onLeaveLevel ? options.onLeaveLevel() : 0,
    reportType: StateReportType.RETURN_VALUE,

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

export function spyOnDescriptor(obj, key, repDescriptor?, options?: SpyOnFunctionOptions, bypassClass?) {
  const initialObj = obj;
  const objIsClass = typeof obj === 'function' && obj.prototype instanceof Object;

  if (objIsClass && bypassClass !== true) {
    obj = obj.prototype;
  }

  if (!options) {
    options = {};
  }

  if (!options.extra) {
    options.extra = {};
  }

  if (!repDescriptor) {
    repDescriptor = Object.getOwnPropertyDescriptor(obj, key);
  }

  if (typeof repDescriptor === 'function') {
    repDescriptor = { value: repDescriptor };
  }

  let descriptor = instance.getDescriptorAndType(obj, key);

  if (!descriptor.descriptor) {
    descriptor = {
      descriptor: { ...repDescriptor },
      type: repDescriptor.get || repDescriptor.set
        ? 'getterSetter'
        : 'function'
    };
  } else {
    descriptor.descriptor = { ...descriptor.descriptor };
  }

  if (descriptor.descriptor.configurable === false) {
    throw new Error('Descriptor is not configurable: ' + key);
  }

  descriptor.descriptor.configurable = true;

  if (descriptor.type !== 'getterSetter') {
    descriptor.descriptor.writeable = true;
  }

  switch (descriptor.type) {
  case 'getterSetter':
    descriptor = descriptor.descriptor;

    if (repDescriptor.get) {
      descriptor.get = (function (descriptor) {
        return function () {
          descriptor.get = spyOnFunction(repDescriptor.get, { ...options, ...options.get || {}, ...{
            extra: {
              name: (objIsClass ? obj.constructor.name + '.' : '') + key + '[get]',
              ...options.extra,
              ...options.get && options.get.extra || {},
            },
          } });

          if (repDescriptor.set) {
            descriptor.set = spyOnFunction(repDescriptor.set, { ...options, ...options.set || {}, ...{
              extra: {
                name: (objIsClass ? obj.constructor.name + '.' : '') + key + '[set]',
                ...options.extra,
                ...options.set && options.set.extra || {},
              },
            } });
          }

          Object.defineProperty(this, key, descriptor);

          return this[key];
        }
      })(descriptor);

      descriptor.get.ARGS = { '*': [] };
      descriptor.get.CALLS_COUNT = 0;
      descriptor.get.EXCEPTIONS_COUNT = 0;
      descriptor.get.EXCEPTION = undefined;
      descriptor.get.IS_ASYNC = false;
      descriptor.get.IS_ASYNC_PENDING = false;
      descriptor.get.IS_EXCEPTION = false;
      descriptor.get.ORIGIN = options && options.get && options.get.origin;
      descriptor.get.REPLACEMENT = options && options.get && options.get.replacement;
      descriptor.get.RESULT = undefined;
    }

    if (repDescriptor.set) {
      descriptor.set = (function (descriptor) {
        return function (val) {
          descriptor.set = spyOnFunction(repDescriptor.set, { ...options, ...options.set || {}, ...{
            extra: {
              name: (objIsClass ? obj.constructor.name + '.' : '') + key + '[set]',
              ...options.extra,
              ...options.set && options.set.extra || {},
            },
          } });

          if (repDescriptor.get) {
            descriptor.get = spyOnFunction(repDescriptor.get, { ...options, ...options.get || {}, ...{
              extra: {
                name: (objIsClass ? obj.constructor.name + '.' : '') + key + '[get]',
                ...options.extra,
                ...options.get && options.get.extra || {},
              },
            } });
          }

          Object.defineProperty(this, key, descriptor);

          this[key] = val;
        }
      })(descriptor);

      descriptor.set.ARGS = { '*': [] };
      descriptor.set.CALLS_COUNT = 0;
      descriptor.set.EXCEPTIONS_COUNT = 0;
      descriptor.set.EXCEPTION = undefined;
      descriptor.set.IS_ASYNC = false;
      descriptor.set.IS_ASYNC_PENDING = false;
      descriptor.set.IS_EXCEPTION = false;
      descriptor.set.ORIGIN = options && options.set && options.set.origin;
      descriptor.set.REPLACEMENT = options && options.set && options.set.replacement;
      descriptor.set.RESULT = undefined;
    }

    break;

  case 'function':
    descriptor = descriptor.descriptor;

    if (options.bypassOnBehalfOfInstanceReplacement) {
      descriptor.value = spyOnFunction(repDescriptor.value, { ...options, ...{
        extra: {
          name: (objIsClass ? obj.constructor.name + '.' : '') + key,
          ...options.extra,
        },
      } });
    } else {
      descriptor.value = (function (descriptor) {
        return function (...args: unknown[]) {
          descriptor.value = spyOnFunction(repDescriptor.value, { ...options, ...{
            extra: {
              name: (objIsClass ? obj.constructor.name + '.' : '') + key,
              ...options.extra,
            },
          } });

          Object.defineProperty(this, key, descriptor);

          const fn = this[key];

          return fn.apply(this, args);
        }
      })(descriptor);
    }

    descriptor.value.ARGS = { '*': [] };
    descriptor.value.CALLS_COUNT = 0;
    descriptor.value.EXCEPTIONS_COUNT = 0;
    descriptor.value.EXCEPTION = undefined;
    descriptor.value.IS_ASYNC = false;
    descriptor.value.IS_ASYNC_PENDING = false;
    descriptor.value.IS_EXCEPTION = false;
    descriptor.value.ORIGIN = options && options.origin;
    descriptor.value.REPLACEMENT = options && options.replacement;
    descriptor.value.RESULT = undefined;

    break;

  default:
    descriptor = descriptor.descriptor;
  }

  Object.defineProperty(obj, key, descriptor);

  return initialObj;
}

export function spyOnMethod(cls, key, rep?, options?: SpyOnFunctionOptions) {
  spyOnDescriptor(cls, key, rep || cls.prototype[key], options);

  return cls;
}

export function spyOnStaticDescriptor(cls, key, repDescriptor?, options?: SpyOnFunctionOptions) {
  spyOnDescriptor(cls, key, repDescriptor || Object.getOwnPropertyDescriptor(cls, key), options, true);

  return cls;
}

export function spyOnStaticMethod(cls, key, rep?, options?: SpyOnFunctionOptions) {
  spyOnDescriptor(cls, key, rep || cls[key], options, true);

  return cls;
}
