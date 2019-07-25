// Copyright (c) Boyle Software, Inc. All rights reserved. Licensed under the MIT license.

import { Application, Logger } from "@x2node/common";
import { DatabaseConnectionProvider, SQLDialect } from "@x2node/db";

import * as mysql2 from "mysql2";

import { LOG_CATEGORY } from "./constants";
import MySQLDatabaseConnection from "./connection";

/**
 * Asynchronous blocker.
 */
class Blocker {

  /**
   * Blocker promise.
   */
  private readonly _promise: Promise<void>;

  /**
   * Unblock function.
   */
  private _unblock?: () => void;

  /**
   * Create new initially blocked blocker.
   */
  public constructor() {

    this._promise = new Promise((resolve): void => {
      this._unblock = resolve;
    });
  }

  /**
   * Wait until unblock then execute provided callback.
   *
   * @param cb - The callback.
   */
  public async waitThen<R>(cb: () => Promise<R>): Promise<R> {

    return this._promise.then(cb);
  }

  /**
   * Unblock blocker.
   */
  public unblock(): void { this._unblock && this._unblock(); }
}

/**
 * Single connection provider implementation.
 */
export default class MySQLSingleConnectionProvider implements DatabaseConnectionProvider {

  /**
   * Logger service.
   */
  private readonly _logger: Logger;

  /**
   * The SQL dialect.
   */
  private readonly _dialect: SQLDialect;

  /**
   * Underlying connection (connected).
   */
  private readonly _rawConnection: mysql2.Connection;

  /**
   * Fatal error.
   */
  private _fatalError: Error | undefined;

  /**
   * Tells if the provider is shutting or shut down.
   */
  private _shutDown = false;

  /**
   * Tells if the single connection is currently allocated and needs to be
   * released in order to be allocated again.
   */
  private _connectionAllocated = false;

  /**
   * Blocker until currently allocated connection is released.
   */
  private _connectionBlocker: Blocker | null = null;

  /** {@inheritDoc @x2node/common#Service.shutdownDependencies} */
  public readonly shutdownDependencies = ["logger"];

  /** {@inheritDoc @x2node/db#DatabaseConnectionProvider.dialect} */
  public get dialect(): SQLDialect { return this._dialect; }

  /**
   * Create new single connection provider.
   *
   * @param app - The application.
   * @param dialect - The SQL dialect.
   * @param rawConnection - Underlying connection (connected).
   */
  public constructor(
    app: Application,
    dialect: SQLDialect,
    rawConnection: mysql2.Connection
  ) {

    this._logger = app.logger;

    this._dialect = dialect;
    this._rawConnection = rawConnection;
  }

  /** {@inheritDoc @x2node/db#DatabaseConnectionProvider.getConnection} */
  public getConnection(): Promise<MySQLDatabaseConnection> {

    if (this._shutDown) {
      return Promise.reject(
        new Error("The connection provider is shutting down or is shut."));
    }

    if (this._fatalError) {
      return Promise.reject(this._fatalError);
    }

    if (this._connectionAllocated) {
      this._logger.debug(LOG_CATEGORY)(
        "blocking connection allocation until released");
      if (!this._connectionBlocker) {
        this._connectionBlocker = new Blocker();
      }
      return this._connectionBlocker.waitThen(
        (): Promise<MySQLDatabaseConnection> => this.getConnection());
    }

    this._connectionAllocated = true;

    return Promise.resolve(new MySQLDatabaseConnection(
      this._rawConnection,
      (err): void => {
        if (err && err.fatal) {
          this._fatalError = err;
          this._rawConnection.destroy();
        }
        this._connectionAllocated = false;
        const blocker = this._connectionBlocker;
        if (blocker) {
          this._connectionBlocker = null;
          blocker.unblock();
        }
      }
    ));
  }

  /**
   * Close the connection.
   *
   * @returns Promise that resolves when the connection is closed, or nothing
   * if the connection is already closed (for example, as a result of a previous
   * fatal error).
   */
  public shutdown(): Promise<void> | void {

    if (this._shutDown) {
      throw new Error(
        "The connection provider is already shutting down or is shut.");
    }

    this._shutDown = true;

    if (!this._fatalError) {
      return new Promise((resolve, reject): void => {
        this._rawConnection.end((err): void => {
          if (err) {
            reject(err);
          } else {
            this._logger.debug(LOG_CATEGORY)("database connection closed");
            resolve();
          }
        });
      });
    }
  }
}
