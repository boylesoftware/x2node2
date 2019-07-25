// Copyright (c) Boyle Software, Inc. All rights reserved. Licensed under the MIT license.

import { Application, Logger } from "@x2node/common";
import { DatabaseConnectionProvider, SQLDialect } from "@x2node/db";

import * as mysql2 from "mysql2";

import { LOG_CATEGORY } from "./constants";
import MySQLDatabaseConnection from "./connection";

/**
 * Connection pool provider implementation.
 */
export default class MySQLPoolConnectionProvider implements DatabaseConnectionProvider {

  /**
   * Logger service.
   */
  private readonly _logger: Logger;

  /**
   * The SQL dialect.
   */
  private readonly _dialect: SQLDialect;

  /**
   * Underlying connection pool.
   */
  private readonly _rawPool: mysql2.Pool;

  /**
   * Tells if the provider is shutting or shut down.
   */
  private _shutDown = false;

  /** {@inheritDoc @x2node/common#Service.shutdownDependencies} */
  public readonly shutdownDependencies = ["logger"];

  /** {@inheritDoc @x2node/db#DatabaseConnectionProvider.dialect} */
  public get dialect(): SQLDialect { return this._dialect; }

  /**
   * Create new connection pool provider.
   *
   * @param app - The application.
   * @param dialect - The SQL dialect.
   * @param rawPool - Underlying connection pool.
   */
  public constructor(
    app: Application,
    dialect: SQLDialect,
    rawPool: mysql2.Pool
  ) {

    this._logger = app.logger;

    this._dialect = dialect;
    this._rawPool = rawPool;
  }

  /**
   * Allocate connection.
   */
  public getConnection(): Promise<MySQLDatabaseConnection> {

    if (this._shutDown) {
      return Promise.reject(
        new Error("The connection provider is shutting down or is shut."));
    }

    return new Promise((resolve, reject): void => {
      this._rawPool.getConnection((err, con): void => {
        if (err) {
          reject(err);
        } else {
          resolve(new MySQLDatabaseConnection(
            con,
            (err): void => {
              if (err && err.fatal) {
                con.destroy();
              } else {
                this._rawPool.releaseConnection(con);
              }
            }
          ));
        }
      });
    });
  }

  /**
   * Shutdown the pool.
   *
   * @returns Promise that resolves when the pool shutdown is complete.
   */
  public shutdown(): Promise<void> {

    if (this._shutDown) {
      throw new Error(
        "The connection provider is already shutting down or is shut.");
    }

    this._shutDown = true;

    return new Promise((resolve, reject): void => {
      this._rawPool.end((err): void => {
        if (err) {
          reject(err);
        } else {
          this._logger.debug(LOG_CATEGORY)("database connection pool closed");
          resolve();
        }
      });
    });
  }
}
