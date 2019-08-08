// Copyright (c) Boyle Software, Inc. All rights reserved. Licensed under the MIT license.

import { Service } from "@x2node/common";

import { DatabaseConnection } from "./connection";
import { Segment } from "./segment";

/**
 * Standard service key for the database monitor service.
 *
 * @public
 */
export const DB_MONITOR_SERVICE = "databaseMonitor";

/**
 * Database monitor service.
 *
 * @public
 */
export interface DatabaseMonitor extends Service {

  // TODO: single record "segments"

  /**
   * Allocate monitor for the transaction currently active on the provided
   * database connection.
   *
   * @remarks
   * Before the returned promise resolves, the monitor locks specified record
   * collection segments. All locks are released upon completion of the
   * transaction.
   *
   * The database connection passed to this method must be in active transaction
   * (its {@link DatabaseConnection.inTransaction} flag must be `true`).
   *
   * @param con - Database connection.
   * @param readSegments - Record collection segments that the transaction
   * <em>may</em> read. These segments are locked with a shared lock.
   * @param writeSegments - Record collection segments that the transaction
   * <em>may</em> change. These segments are locked with an exclusive lock.
   * @returns Promise of the transaction monitor. The promise is rejected if the
   * monitor cannot be allocated.
   */
  monitorTransaction(
    con: DatabaseConnection,
    readSegments: readonly Segment<unknown>[] | null | undefined,
    writeSegments: readonly Segment<unknown>[] | null | undefined
  ): Promise<TransactionMonitor>;
}

/**
 * Monitor instance allocated to a specific transaction.
 *
 * @public
 */
export interface TransactionMonitor {

  /**
   * Computed aggregated version of the combination of segments passed to
   * {@link DatabaseMonitor.monitorTransaction} before the transaction.
   */
  readonly currentVersion: number;

  /**
   * Most recent among the last modification timestamps of segments passed to
   * {@link DatabaseMonitor.monitorTransaction} before the transaction.
   */
  readonly currentLastModified: Date;

  /**
   * Register change being made to database records by the transaction.
   *
   * @param segment - Updated record collection segment. Must be exclusively
   * locked.
   */
  addSegmentUpdate<R>(segment: Segment<R>): void;

  /**
   * Save changes made to the database records by the transaction.
   *
   * @remarks
   * This method is called before the database transaction is committed. The
   * transaction can still be rolled back after this method call (if the
   * transaction commit fails).
   *
   * @returns Promise of the new version information. If the promise rejects,
   * the transaction is rolled back.
   */
  saveSegmentUpdates(): Promise<{
    readonly newVersion: number;
    readonly newLastModified: Date;
  }>;
}
