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
   * After the connection is no longer needed it must be released via its
   * {@link DatabaseConnection.release} method.
   *
   * @returns Promise of the active database connection. The promise is rejected
   * if the connection cannot be established.
   */
  getConnection(): Promise<DatabaseConnection>;
}

/**
 * Transaction mode.
 *
 * @public
 */
export enum TxMode {

  /**
   * Read/write transaction.
   */
  ReadWrite,

  /**
   * Read-only transaction.
   */
  ReadOnly
}

/**
 * Transaction resolution.
 *
 * @public
 */
export enum TxResolve {

  /**
   * Commit transaction.
   */
  Commit,

  /**
   * Rollback transaction.
   */
  Rollback
}

/**
 * Result of a SQL statement execution.
 *
 * @public
 */
export interface StatementResult {

  /**
   * Number of table rows affected by the statement (e.g. inserted, updated or
   * deleted).
   */
  readonly numAffectedRows: number;

  /**
   * When inserting into a table with an auto-generated id column, this is the
   * inserted id value.
   */
  readonly generatedId?: number;
}

/**
 * SQL query (`SELECT` statement) result parser.
 *
 * @remarks
 * A parser instance is passed into a query execution method and is fed with
 * selected data row by row constructing the result object internally. Once the
 * query execution is complete and all rows have been fed to the parser, the
 * constructed query execution result object can be retrieved from the parser.
 *
 * Errors thrown from the parser methods cause the query execution result
 * promise being rejected with the thrown error.
 *
 * @typeParam R - Type of the query result object constructed by the parser.
 *
 * @public
 */
export interface QueryResultParser<R> {

  /**
   * Add result set row to the parser.
   *
   * @param row - The result set row.
   */
  addRow(row: { [field: string]: unknown }): void;

  /**
   * Get constructed query result object once all rows have been fed to the
   * parser.
   *
   * @returns Query result object.
   */
  getResult(): R;
}

/**
 * Database connection.
 *
 * @public
 */
export interface DatabaseConnection {

  /**
   * Underlynig database connection (session) id.
   *
   * @remarks
   * This value may help identify a particular connection when a connection pool
   * is involved, or identify the corresponding session on the database server
   * side.
   */
  readonly sessionId: string;

  /**
   * Release connection back to the connection provider.
   *
   * @remarks
   * The connection object is no longer usable after this method call.
   *
   * If there is an active transaction associated with the connection (see
   * {@link DatabaseConnection.beginTransaction} method), the connection cannot
   * be released until the transaction is ended. This method throws an error and
   * the application crashes (considered a programming error) if attempted.
   *
   * Note to implementors: throwing an error from this method normally leads to
   * the application crash.
   */
  release(): void;

  /**
   * Begin database transaction.
   *
   * @remarks
   * Throws an error if there is already an active transaction associated with
   * this connection (considered a programming error).
   *
   * Once transaction is started, it must be ended using
   * {@link DatabaseConnection.endTransaction} method before the connection is
   * released.
   *
   * This method may not be called if there is already an active transaction
   * associated with the connection. An error is thrown if attempted (considered
   * a programming error).
   *
   * @param mode - Transaction mode.
   * @returns Promise that resolves when transaction is successfully started and
   * rejects if was unable to start transaction.
   */
  beginTransaction(mode: TxMode): Promise<void>;

  /**
   * End database transaction.
   *
   * @remarks
   * If `resolve` is {@link TxResolve.Commit}, throws an error if there is no
   * active transaction associated with this connection (considered a
   * programming error). Rollback is the same, but is allowed to be performed
   * after an unsuccessful commit.
   *
   * Once <em>successfully</em> ended, a new transaction can be started on the
   * same connection, or the connenction can be released.
   *
   * Connection can be released after a rollback even if it was unsuccessful.
   * Normally, if transaction rollback was unsuccessful, releasing the
   * connection destroys it (even if connection pool is utilized).
   *
   * @param res - Transaction resolution.
   * @returns Promise that resolves when transaction is successfully ended and
   * rejects if there was an error attempting to end the transaction.
   */
  endTransaction(res: TxResolve): Promise<void>;

  /**
   * Execute statement on the connection.
   *
   * @remarks
   * Not allowed when there is an unresolved promise returned by one of the
   * transaction methods (in other words when the connection is in transitional
   * transaction status).
   *
   * @param sql - Statement SQL.
   * @returns Promise of the statement execution result. The promise is rejected
   * if there was an error.
   */
  executeStatement(sql: string): Promise<StatementResult>;

  /**
   * Execute query (`SELECT` statement) on the connection.
   *
   * @remarks
   * Not allowed when there is an unresolved promise returned by one of the
   * transaction methods (in other words when the connection is in transitional
   * transaction status).
   *
   * @typeParam R - Type of the query result object.
   * @param sql - Query SQL.
   * @param parser - Query result parser.
   * @returns Promise of the query result. The promise is rejected if there was
   * an error.
   */
  executeQuery<R>(sql: string, parser: QueryResultParser<R>): Promise<R>;

  // TODO: add statement execution methods
}
