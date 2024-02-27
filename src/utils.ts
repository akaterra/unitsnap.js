export type IsAny<T> = unknown extends T ? T extends {} ? T : never : never;

export type FuncKeyNotAny<T, K> =  T extends IsAny<T> ? never : K;

export type FuncKeys<T> = {
  [K in keyof T]: T[K] extends Function ? FuncKeyNotAny<T[K], K> : never;
}[keyof T]

export type OnlyFuncs<T> = Pick<T, FuncKeys<T>>; 

export type Func<T> = T extends abstract new (...args: infer P) => T
  ? (...args: P) => T
  : T extends (...args: any[]) => T
    ? T
    : never;

export function Intermediate<
  T,
  A = T
>(
  prototype?: OnlyFuncs<Omit<T, 'new'>>,
  init?: (instance: T, ...args: Parameters<Func<A>>) => void,
  cls?: new (...args: Parameters<Func<A>>) => T,
  clsName?: string,
): {
  new (...args: Parameters<Func<A>>): T;
  (...args: Parameters<Func<A>>): T;
} {
  const newCls = function (...args: Parameters<Func<A>>) {
    let instance;

    if (!(this instanceof cls)) {
      instance = new cls(...args);
    } else {
      instance = this;
    }

    if (init) {
      init(instance, ...args);
    }

    return instance;
  } as any;

  if (clsName ?? cls) {
    Object.defineProperty(newCls, 'name', { value: clsName ?? newCls.name });
  }

  if (!cls) {
    cls = newCls;
  }

  if (prototype) {
    cls.prototype = prototype;
  }

  return newCls as any;
}

export type PositiveInteger<T extends number> = number extends T 
  ? never 
  : `${T}` extends `-${string}` | `${string}.${string}` | `0`
      ? never 
      : T;
