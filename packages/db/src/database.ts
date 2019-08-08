// Copyright (c) Boyle Software, Inc. All rights reserved. Licensed under the MIT license.

import { DatabaseConnectionProvider } from "./connection";
import { DatabaseMonitor } from "./monitor";
import { DatabaseShape, RecordType } from "./shape";

import DatabaseShapeImpl from "./internal/shape";

/**
 * Options used to create database object.
 *
 * @public
 */
export interface DatabaseOptions {

  /**
   * Database connection provider.
   */
  connectionProvider: DatabaseConnectionProvider;

  /**
   * Database monitor provider.
   */
  monitor: DatabaseMonitor;

  /**
   * Record types stored in the database.
   */
  recordTypes: RecordType<unknown>[];
}

/**
 * Database.
 *
 * @public
 */
export class Database {

  /**
   * The database shape.
   */
  public readonly shape: DatabaseShape;

  /**
   * Create new database object.
   *
   * @param opts - Database options.
   */
  public constructor(opts: DatabaseOptions) {

    this.shape = new DatabaseShapeImpl(opts.recordTypes);
    //...
  }
}
