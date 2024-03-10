import * as instance from './instance';
import { _Custom } from './mock';
import {_Observer} from './observer';
import { Es6ClassDef, Fn } from './utils';

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
  origin?: Fn;
  replacement?: Fn;
  reportType?: StateReportType;
  result?: any;
  tags?: string[];
  time?: Date;
  type?: StateType;
}

export interface SpyState {
  args?: {
    '*'?: any[];
    [key: string]: any;
  };
  callsCount?: number;
  exception?: any | Error;
  exceptionsCount?: number;
  isAsync?: boolean;
  isAsyncPending?: boolean;
  isException?: boolean;
  origin?: Fn & { original?: Fn };
  replacement?: Fn & { original?: Fn };
  result?: any;

  observer?: _Observer;
  restore?: () => void;
}

const callStates = new WeakMap<Fn | Es6ClassDef<any>, SpyState>();

export function ensSpyState(fn: Fn | Es6ClassDef<any>): SpyState {
  if (!callStates.has(fn)) {
    callStates.set(fn, {});
  }

  return callStates.get(fn);
}

export function getSpyState(fn: Fn | Es6ClassDef<any>) {
  const c = callStates.get(fn);

  return {
    args: c?.args ?? {},
    callsCount: c?.callsCount ?? 0,
    exceptionsCount: c?.exceptionsCount ?? 0,
    exception: c?.exception ?? undefined,
    isAsync: c?.isAsync ?? false,
    isAsyncPending: c?.isAsyncPending ?? false,
    isException: c?.isException ?? false,
    origin: c?.origin ?? undefined,
    replacement: c?.replacement ?? undefined,
    restore: c?.restore ?? (() => {}),
    observer: c?.observer ?? null,
  };
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
    const c = ensSpyState(callable);
    c.args = { '*': [] };
    c.callsCount += 1;

    let isRest = false;
    let isRestEs6Ind = null;

    args.forEach((val, ind) => {
      if (ind >= originalCallableAnnotation.args.length) {
        isRest = true;
      } else if (originalCallableAnnotation.args[ind].type === 'rest') {
        isRest = true;
        isRestEs6Ind = ind;
        c.args[originalCallableAnnotation.args[isRestEs6Ind].name] = [];

        delete c.args['*'];
      } else if (originalCallableAnnotation.args[ind].type === 'unpack') {
        originalCallableAnnotation.args[ind].props.forEach((annotation) => {
          c.args[annotation.alias || annotation.name] = val[annotation.name];
        });

        return;
      }

      if (isRest) {
        c.args[isRestEs6Ind !== null ? originalCallableAnnotation.args[isRestEs6Ind].name : '*'].push(val);
      } else {
        c.args[originalCallableAnnotation.args[ind].name] = val;
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
        const c = ensSpyState(callable);
        c.isAsync = true;
        c.isAsyncPending = true;
        c.result = result;

        return result.then(
          (result) => {
            const c = ensSpyState(callable);
            c.exception = undefined;
            c.isAsyncPending = false;
            c.isException = false;
            c.result = result;

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
          (error) => {
            const c = ensSpyState(callable);
            c.exception = error;
            c.isAsyncPending = false;
            c.isException = true;
            c.result = undefined;

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

      const c = ensSpyState(callable);
      c.exception = undefined;
      c.isAsync = false;
      c.isAsyncPending = false;
      c.isException = false;
      c.result = result;

      return result;
    } catch (e) {
      const c = ensSpyState(callable);
      c.exceptionsCount += 1;

      c.exception = e;
      c.isAsync = false;
      c.isAsyncPending = false;
      c.isException = true;
      c.result = undefined;

      throw e;
    } finally {
      const c = ensSpyState(callable);

      if (options && options.onCall) {
        if (options.exclude !== true) {
          options.onCall(this, {
            ...spyOnFunctionCreateResultReport(callable, this, originalCallable, options),
            ...options.extra || {},
            result: asConstructor ? undefined : c.result,
          }); // context, fn
        }
      }
    }
  }

  const c = ensSpyState(callable);
  c.args = { '*': [] };
  c.callsCount = 0;
  c.exception = undefined;
  c.exceptionsCount = 0;
  c.isAsyncPending = false;
  c.isAsync = false;
  c.isException = false;
  c.origin = options && options.origin || originalCallable;
  c.replacement = options && options.replacement || callable;
  c.result = undefined;

  Object.defineProperty(callable, 'length', { value: originalCallable.length, writable: false });
  Object.defineProperty(callable, 'name', { value: originalCallable.name, writable: false });

  return callable;
}

export function spyOnFunctionCreateArgsReport(callable, context?, originalCallable?, options?: SpyOnFunctionOptions) {
  const c = ensSpyState(callable);

  return {
    level: options?.onEnterLevel ? options.onEnterLevel() : 0,
    reportType: StateReportType.CALL_ARGS,

    args: c.args,
    callsCount: c.callsCount,
    context: context,
    // exception: c.exception,
    // exceptionsCount: c.exceptionsCount,
    // isAsync: c.isAsync,
    // isAsyncPending: c.isAsyncPending,
    // isException: c.isException,
    origin: options && options.origin || originalCallable,
    replacement: options && options.replacement || c.replacement,
  };
}

export function spyOnFunctionCreateResultReport(callable, context?, originalCallable?, options?: SpyOnFunctionOptions) {
  const c = ensSpyState(callable);

  return {
    level: options?.onLeaveLevel ? options.onLeaveLevel() : 0,
    reportType: StateReportType.RETURN_VALUE,

    callsCount: c.callsCount,
    context: context,
    exception: c.exception,
    exceptionsCount: c.exceptionsCount,
    isAsync: c.isAsync,
    isAsyncPending: c.isAsyncPending,
    isException: c.isException,
    origin: options && options.origin || originalCallable,
    replacement: options && options.replacement || c.replacement,
    result: c.result,
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

      const c = ensSpyState(descriptor.get);
      c.args = { '*': [] };
      c.callsCount = 0;
      c.exceptionsCount = 0;
      c.exception = undefined;
      c.isAsync = false;
      c.isAsyncPending = false;
      c.isException = false;
      c.origin = options && options.get && options.get.origin;
      c.replacement = options && options.get && options.get.replacement;
      c.result = undefined;
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

      const c = ensSpyState(descriptor.set);
      c.args = { '*': [] };
      c.callsCount = 0;
      c.exceptionsCount = 0;
      c.exception = undefined;
      c.isAsync = false;
      c.isAsyncPending = false;
      c.isException = false;
      c.origin = options && options.set && options.set.origin;
      c.replacement = options && options.set && options.set.replacement;
      c.result = undefined;
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

    const c = ensSpyState(descriptor.value);
    c.args = { '*': [] };
    c.callsCount = 0;
    c.exceptionsCount = 0;
    c.exception = undefined;
    c.isAsync = false;
    c.isAsyncPending = false;
    c.isException = false;
    c.origin = options && options.origin;
    c.replacement = options && options.replacement;
    c.result = undefined;

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
