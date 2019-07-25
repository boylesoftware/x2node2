// Copyright (c) Boyle Software, Inc. All rights reserved. Licensed under the MIT license.

import { DatabaseShape as IDatabaseShape, RecordType } from "../shape";

/**
 * Descriptor of the data stored in the database.
 */
export default class DatabaseShape implements IDatabaseShape {

  /**
   * Top-level record types.
   */
  private readonly _recordTypes: RecordType[];

  /**
   * Create new database shape descriptor.
   *
   * @param recordTypes - All top-level record types, collections of which are
   * stored in the database.
   */
  public constructor(recordTypes: RecordType[]) {

    this._recordTypes = recordTypes;
  }

  /** {@inheritDoc IDatabaseShape.recordTypes} */
  // eslint-disable-next-line @typescript-eslint/array-type
  public get recordTypes(): ReadonlyArray<RecordType> { return this._recordTypes; }
}
