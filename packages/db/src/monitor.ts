// Copyright (c) Boyle Software, Inc. All rights reserved. Licensed under the MIT license.

import { Service } from "@x2node/common";

import { DatabaseConnection } from "./connection";

/**
 * Standard service key for the database monitor provider.
 *
 * @public
 */
export const DB_MONITOR_PROVIDER_SERVICE = "databaseMonitorProvider";

/**
 * Provider of database monitor instances.
 *
 * @public
 */
export interface DatabaseMonitorProvider extends Service {

  /**
   * Allocate monitor instance and associate it with the provided database
   * connection.
   *
   * @remarks
   * After the monitor instance no longer needed, it must be release using its
   * {@link DatabaseMonitor.release | release()} method.
   *
   * @param con - Database connection.
   * @returns Promise of the monitor. The promise is rejected if the monitor
   * cannot be allocated.
   */
  getMonitor(con: DatabaseConnection): Promise<DatabaseMonitor>;
}

/**
 * Database monitor instance associated with a specific database connection and
 * therefore a specific database transaction.
 *
 * @public
 */
export interface DatabaseMonitor {

  /**
   * Release the instance back to the provider after it is no longer needed.
   *
   * @remarks
   * The monitor instance becomes unusable after this method call.
   *
   * Note, that throwing error from this method normally leads to the
   * application crash.
   */
  release(): void;

  // transaction lifecycle methods
  // interface for transaction steps
}
