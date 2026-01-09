declare type Fn<T = any, R = T> = (...arg: T[]) => R

declare type PromiseFn<T = any, R = T> = (...arg: T[]) => Promise<R>

declare type Recordable<T = any> = Record<string, T>

declare type Key = string | number

declare type ReadonlyRecordable<T = any> = {
  readonly [key: string]: T
}
declare type Indexable<T = any> = {
  [key: string]: T
}
