export type Es5ClassDef<T> = (...args: unknown[]) => T & { prototype: T };

export type Es6ClassDef<T> = new (...args: unknown[]) => T;

export type ClassDef<T> = Es5ClassDef<T> | Es6ClassDef<T>;

export type ObjectFromList<T extends ReadonlyArray<string | number | symbol>, U> = {
  [K in (T extends ReadonlyArray<infer P> ? P : never)]: U
};

export type NotNeverKeys<T> = {
  [K in keyof T]: T[K] extends never ? never : K;
}[keyof T];

export type Es5Class<
  T = any,
  TParameters extends unknown[] = T extends ClassDef<T> ? ConstructorParameters<T> : unknown[],
  TProps extends Record<string, unknown> = {},
  TStaticProps extends Record<string, unknown> = {}
> = (...args: TParameters) => Omit<T, NotNeverKeys<TProps>> & Pick<TProps, NotNeverKeys<TProps>>;

export type Es6Class<
  T = any,
  TParameters extends unknown[] = T extends ClassDef<T> ? ConstructorParameters<T> : unknown[],
  TProps extends Record<string, unknown> = {},
  TStaticProps extends Record<string, unknown> = {}
> = new (...args: TParameters) => Omit<T, NotNeverKeys<TProps>> & Pick<TProps, NotNeverKeys<TProps>>;

export type Fn<T = any, P extends unknown[] = unknown[]> = (...args: P) => T;

export type IsAny<T> = unknown extends T ? T extends {} ? T : never : never;

export type FuncKeyNotAny<T, K> =  T extends IsAny<T> ? never : K;

export type FuncKeys<T> = {
  [K in keyof T]: T[K] extends Function ? FuncKeyNotAny<T[K], K> : never;
}[keyof T]

export type OnlyFuncs<T> = Pick<T, FuncKeys<T>>; 

export type Constructor<T> = T extends new (...args: infer P) => T
  ? (...args: P) => T
  : T extends (...args: unknown[]) => T
    ? T
    : never;

export type ConstructorParameters<T> = T extends new (...args: infer P) => unknown
  ? P
  : T extends (...args: infer P) => unknown
    ? P
    : never;
  
export type ConstructorReturnType<T> = T extends new (...args: unknown[]) => infer P
  ? P
  : T extends (...args: unknown[]) => infer P
    ? P
    : never;

export type PositiveInteger<T extends number> = number extends T 
  ? never 
  : `${T}` extends `-${string}` | `${string}.${string}` | `0`
      ? never 
      : T;
