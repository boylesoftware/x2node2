// Copyright (c) Boyle Software, Inc. All rights reserved. Licensed under the MIT license.

import { RecordShape } from "./shape";

/**
 * Record collection segment descriptor.
 *
 * @typeParam R - Record type.
 *
 * @public
 */
export interface Segment<R> {

  /**
   * Record type descriptor.
   */
  recordType: RecordShape<R>;

  // TODO: figure it out

  keys?: {
    [K in keyof R]?: R[K]
  };

  keys1?: {
    name: keyof R;
    values?: unknown[];
  }[];
}

/*class A {
  public prop1: string = "qqq";
  public prop2: number = 2;
  public prop3?: boolean;
  public constructor() { }
}
class AShape implements RecordShape<A> {
  public type = A;
  public segmentKeys: ("prop1" | "prop2" | "prop3")[] = ["prop1", "prop2"];
}
const a: Segment<A> = {
  recordType: new AShape(),
  keys: {
    prop1: "32"
  }
};
console.log(a);*/
