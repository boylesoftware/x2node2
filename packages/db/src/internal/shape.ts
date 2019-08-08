// Copyright (c) Boyle Software, Inc. All rights reserved. Licensed under the MIT license.

import { DatabaseShape as IDatabaseShape, RecordType } from "../shape";

/**
 * Descriptor of the data stored in the database.
 */
export default class DatabaseShape implements IDatabaseShape {

  /**
   * Top-level record types.
   */
  private readonly _recordTypes: RecordType<unknown>[];

  /**
   * Create new database shape descriptor.
   *
   * @param recordTypes - All top-level record types, collections of which are
   * stored in the database.
   */
  public constructor(recordTypes: RecordType<unknown>[]) {

    this._recordTypes = recordTypes;
  }

  /** {@inheritDoc IDatabaseShape.recordTypes} */
  public get recordTypes(): readonly RecordType<unknown>[] { return this._recordTypes; }
}
