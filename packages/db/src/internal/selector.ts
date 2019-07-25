// Copyright (c) Boyle Software, Inc. All rights reserved. Licensed under the MIT license.

import { Ref } from "./record";

export type Selector<R> = {
  [F in keyof R]?: FieldSelector<R[F]>;
} | CompositeSelector<R>;

export type CompositeSelector<R> = {
  $and: Selector<R>[];
} | {
  $or: Selector<R>[];
} | {
  $not: Selector<R>;
};

// eslint-disable-next-line @typescript-eslint/no-explicit-any
type AnyFunction = (...args: any) => any;

/* eslint-disable @typescript-eslint/indent */
export type FieldSelector<T> =
  T extends (AnyFunction | symbol | null) ? undefined : (
    { $empty: boolean } | (
      T extends string ? StringFieldSelector :
      T extends number ? NumberFieldSelector :
      T extends boolean ? BooleanFieldSelector :
      T extends Ref<infer R> ? Selector<R> :
      T extends (infer E)[] ? ArrayFieldSelector<E> :
      T extends { [key: string]: infer E } ? MapFieldSelector<E> :
      Selector<T>
    )
  );
/* eslint-enable */

export type StringFieldSelector = "#string";
export type NumberFieldSelector = "#number";
export type BooleanFieldSelector = "#boolean";
export type ArrayFieldSelector<E> = "#array";
export type MapFieldSelector<E> = "#map";


/*type ScalarStringValueExpr = string | SelectorParameter<string>;

interface SelectorParameter<T extends (string | number | boolean)> {
  $param: string;
}*/
