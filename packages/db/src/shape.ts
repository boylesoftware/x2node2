// Copyright (c) Boyle Software, Inc. All rights reserved. Licensed under the MIT license.

/**
 * Class that represents a record type.
 *
 * @public
 */
export interface RecordType {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  new (...args: any): any;
}

/**
 * Descriptor of the data stored in the database.
 *
 * @public
 */
export interface DatabaseShape {

  /**
   * All top-level record types, collections of which are stored in the
   * database.
   */
  // eslint-disable-next-line @typescript-eslint/array-type
  readonly recordTypes: ReadonlyArray<RecordType>;
}
