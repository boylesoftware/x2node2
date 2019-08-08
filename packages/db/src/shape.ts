// Copyright (c) Boyle Software, Inc. All rights reserved. Licensed under the MIT license.

/**
 * Class that represents a record type.
 *
 * @typeParam R - Record type.
 *
 * @public
 */
export interface RecordType<R> {
  new (): R;
}

/**
 * Descriptor of record type.
 *
 * @typeParam R - Record type.
 *
 * @public
 */
export interface RecordShape<R> {

  /**
   * Record constructor.
   */
  readonly type: RecordType<R>;

  /**
   * Names of segment key fields.
   */
  readonly segmentKeys: readonly (keyof R)[];
}

/**
 * Descriptor of the data stored in the database.
 *
 * @public
 */
// eslint-disable-next-line @typescript-eslint/no-empty-interface
export interface DatabaseShape {

  /**
   * All top-level record types, collections of which are stored in the
   * database.
   */
  //readonly recordTypes: readonly RecordShape<unknown>[];
}
