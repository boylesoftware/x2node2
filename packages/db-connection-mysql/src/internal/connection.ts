// Copyright (c) Boyle Software, Inc. All rights reserved. Licensed under the MIT license.

import { DatabaseConnection } from "@x2node/db";

import * as mysql2 from "mysql2";

/**
 * Database connection implementation.
 */
export default class MySQLDatabaseConnection implements DatabaseConnection {

  //private readonly _rawConnection: mysql2.Connection;

  /**
   * Function called to release the connection.
   */
  private readonly _releaser: (err: mysql2.ConnectionError | null) => void;

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

    //this._rawConnection = rawConnection;
    this._releaser = releaser;
  }

  /** {@inheritDoc @x2node/db#DatabaseConnection.release} */
  public release(): void {

    this._releaser(null);
  }
}
