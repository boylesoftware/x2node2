// Copyright (c) Boyle Software, Inc. All rights reserved. Licensed under the MIT license.

import { Service } from "@x2node/common";

import { SQLDialect } from "./dialect";

/**
 * Standard service key for the database connection provider.
 *
 * @public
 */
export const DB_CONNECTION_PROVIDER_SERVICE = "databaseConnectionProvider";

/**
 * Database connection provider (such as a connection pool, for example).
 *
 * @public
 */
export interface DatabaseConnectionProvider extends Service {

  /**
   * SQL dialect used by the database.
   */
  readonly dialect: SQLDialect;

  /**
   * Allocate new database connection.
   *
   * @remarks
   * After the connection is no longer needed it must be released via it's
   * {@link DatabaseConnection.release | release()} method.
   *
   * @returns Promise of the active database connection. The promise is rejected
   * if the connection cannot be established.
   */
  getConnection(): Promise<DatabaseConnection>;
}

/**
 * Database connection.
 *
 * @public
 */
export interface DatabaseConnection {

  /**
   * Release connection back to the connection provider.
   *
   * @remarks
   * The connection object is no longer usable after this method call.
   *
   * Note for implementations: throwing an error from this method normally leads
   * to the application crash.
   */
  release(): void;

  // TODO: add statement execution methods
}
