export type PositiveInteger<T extends number> = number extends T 
  ? never 
  : `${T}` extends `-${string}` | `${string}.${string}` | `0`
      ? never 
      : T;
