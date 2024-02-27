export type IsAny<T> = unknown extends T ? T extends {} ? T : never : never;

export type FuncKeyNotAny<T, K> =  T extends IsAny<T> ? never : K;

export type FuncKeys<T> = {
  [K in keyof T]: T[K] extends Function ? FuncKeyNotAny<T[K], K> : never;
}[keyof T]

export type OnlyFuncs<T> = Pick<T, FuncKeys<T>>; 

export type Constructor<T> = T extends abstract new (...args: infer P) => T
  ? (...args: P) => T
  : T extends (...args: any[]) => T
    ? T
    : never;

export function IntermediateClass<
  T,
  A = T
>(
  prototype?: OnlyFuncs<Omit<T, 'new'>>,
  init?: (instance: T, ...args: Parameters<Constructor<A>>) => void,
  cls?: new (...args: Parameters<Constructor<A>>) => T,
  clsName?: string,
): {
  new (...args: Parameters<Constructor<A>>): T;
  (...args: Parameters<Constructor<A>>): T;
} {
  const clazz = function (...args: Parameters<Constructor<A>>) {
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
    Object.defineProperty(clazz, 'name', { value: clsName ?? clazz.name });
  }

  if (!cls) {
    cls = clazz;
  }

  if (prototype) {
    cls.prototype = prototype;
  }

  return clazz as any;
}

export type PositiveInteger<T extends number> = number extends T 
  ? never 
  : `${T}` extends `-${string}` | `${string}.${string}` | `0`
      ? never 
      : T;
