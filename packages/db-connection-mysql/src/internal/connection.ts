// Copyright (c) Boyle Software, Inc. All rights reserved. Licensed under the MIT license.

import { DatabaseConnection, TxMode, TxResolve, StatementResult, QueryResultParser } from "@x2node/db";

import * as mysql2 from "mysql2";

/**
 * Database connection implementation.
 */
export default class MySQLDatabaseConnection implements DatabaseConnection {

  /**
   * Underlying connection.
   */
  private readonly _rawConnection: mysql2.Connection;

  /**
   * Function called to release the connection.
   */
  private readonly _releaser: (err: mysql2.ConnectionError | null) => void;

  /**
   * Tells if the connection has been released.
   */
  private _released = false;

  /**
   * Active transaction status.
   */
  private _txStatus = 0;

  /**
   * Fatal error.
   */
  private _fatalError: mysql2.ConnectionError | null = null;

  /**
   * MySQL server thread (session) id.
   */
  public readonly sessionId: string;

  /**
   * Create new connection.
   *
   * @param rawConnection - Active underlying connection.
   * @param releaser - Connection releaser function.
   */
  public constructor(
    rawConnection: mysql2.Connection,
    releaser: (err: mysql2.ConnectionError | null) => void
  ) {

    this._rawConnection = rawConnection;
    this._releaser = releaser;

    this.sessionId = String(rawConnection.threadId);
  }

  /** {@inheritDoc @x2node/db#DatabaseConnection.release} */
  public release(): void {

    this._checkReleased();

    if (this._txStatus > 0) {
      throw new Error("Cannot release connection" +
        " because in active transaction.");
    }

    this._released = true;

    this._releaser(this._fatalError);
  }

  /** {@inheritDoc @x2node/db#DatabaseConnection.beginTransaction} */
  public beginTransaction(mode: TxMode): Promise<void> {

    this._checkReleased();

    if (this._txStatus > 0) {
      throw new Error("Cannot start new transaction" +
        " because already in active transaction.");
    }

    if (this._fatalError) {
      return Promise.reject(this._fatalError);
    }

    this._txStatus = 1;

    return new Promise((resolve, reject): void => {
      this._rawConnection.query(
        (mode === TxMode.ReadOnly) ?
          "START TRANSACTION READ ONLY" : "START TRANSACTION",
        (err): void => {
          if (err) {
            this._txStatus = 0;
            if (err.fatal) {
              this._fatalError = err;
            }
            reject(err);
          } else {
            this._txStatus = 4;
            resolve();
          }
        }
      );
    });
  }

  /** {@inheritDoc @x2node/db#DatabaseConnection.endTransaction} */
  public endTransaction(res: TxResolve): Promise<void> {

    this._checkReleased();

    if (this._fatalError) {
      return Promise.reject(this._fatalError);
    }

    if (res === TxResolve.Commit) {

      if (this._txStatus < 4) {
        throw new Error("Cannot commit transaction" +
          " because no active transaction.");
      }

      this._txStatus = 2;

      return new Promise((resolve, reject): void => {
        this._rawConnection.query("COMMIT", (err): void => {
          if (err) {
            if (err.fatal) {
              this._txStatus = 0;
              err.fatal = true; // tx rollback error is always fatal
              this._fatalError = err;
            } else {
              this._txStatus = 3;
            }
            reject(err);
          } else {
            this._txStatus = 0;
            resolve();
          }
        });
      });

    } else { // rollback

      if (this._txStatus < 3) {
        throw new Error("Cannot rollback transaction" +
          " because no active transaction.");
      }

      this._txStatus = 1;

      return new Promise((resolve, reject): void => {
        this._rawConnection.query("ROLLBACK", (err): void => {
          this._txStatus = 0;
          if (err) {
            this._fatalError = err;
            reject(err);
          } else {
            resolve();
          }
        });
      });
    }
  }

  /** {@inheritDoc @x2node/db#DatabaseConnection.executeStatement} */
  public executeStatement(sql: string): Promise<StatementResult> {

    this._checkReleased();

    if (this._fatalError) {
      return Promise.reject(this._fatalError);
    }

    if (this._txStatus > 0 && this._txStatus < 4) {
      throw new Error("Cannot execute statement" +
        " because transaction is in a transitional state.");
    }

    return new Promise((resolve, reject): void => {
      this._rawConnection.query(sql, (err, result): void => {
        if (err) {
          if (err.fatal) {
            this._txStatus = 0;
            this._fatalError = err;
          }
          reject(err);
        } else {
          resolve({
            numAffectedRows: (result as mysql2.StatementResult).affectedRows,
            generatedId: (result as mysql2.StatementResult).insertId || undefined
          });
        }
      });
    });
  }

  /** {@inheritDoc @x2node/db#DatabaseConnection.executeQuery} */
  public executeQuery<R>(sql: string, parser: QueryResultParser<R>): Promise<R> {

    this._checkReleased();

    if (this._fatalError) {
      return Promise.reject(this._fatalError);
    }

    if (this._txStatus > 0 && this._txStatus < 4) {
      throw new Error("Cannot execute query" +
        " because transaction is in a transitional state.");
    }

    return new Promise((resolve, reject): void => {
      try {
        const query = this._rawConnection.query(sql);
        let error: Error | undefined;
        if (!query) {
          throw new Error("Could not create query.");
        }
        query.on("result", (row): void => {
          if (!error) {
            try {
              parser.addRow(row);
            } catch (err) {
              error = err;
            }
          }
        });
        query.on("error", (err): void => {
          if (!error) {
            error = err;
          }
        });
        query.on("end", (): void => {
          if (!error) {
            try {
              resolve(parser.getResult());
            } catch (err) {
              error = err;
            }
          }
          if (error) {
            if ((error as mysql2.ConnectionError).fatal) {
              this._txStatus = 0;
              this._fatalError = error;
            }
            reject(error);
          }
        });
      } catch (err) {
        (err as mysql2.ConnectionError).fatal = true;
        this._txStatus = 0;
        this._fatalError = err;
        reject(err);
      }
    });
  }

  // TODO: register tx temp tables
  // TODO: add before tx end actions (drop temp tables)

  /**
   * Check if connection has been released and throw an error if so.
   */
  private _checkReleased(): void {

    if (this._released) {
      throw new Error("The connection has been released.");
    }
  }
}
