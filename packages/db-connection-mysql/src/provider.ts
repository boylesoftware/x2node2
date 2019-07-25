// Copyright (c) Boyle Software, Inc. All rights reserved. Licensed under the MIT license.

import { Application, ServiceFactory } from "@x2node/common";
import { DatabaseConnectionProvider, DB_CONNECTION_PROVIDER_SERVICE, SQLDialect } from "@x2node/db";

import * as mysql2 from "mysql2";

import { MySQLConnectionOptions, MySQLConnectionPoolOptions } from "./options";
import { LOG_CATEGORY } from "./internal/constants";
import MySQLSingleConnectionProvider from "./internal/single-provider";
import MySQLPoolConnectionProvider from "./internal/pool-provider";
import MariaDB10SQLDialect from "./internal/dialects/mariadb10";
import MySQL56SQLDialect from "./internal/dialects/mysql56";

/**
 * Tell is the provided options object is connection pool options.
 *
 * @param options - The options.
 */
function isPoolOptions(
  options: string | MySQLConnectionOptions
): options is MySQLConnectionPoolOptions {

  return (typeof options !== "string") &&
    ((options as MySQLConnectionPoolOptions).connectionLimit !== undefined);
}

/**
 * Detect dialect.
 *
 * @param con - Connected connection.
 */
function detectDialect(con: mysql2.Connection): SQLDialect {

  if (!con._handshakePacket) {
    throw new Error("Could not establish connection with the database.");
  }

  const serverVersion = con._handshakePacket.serverVersion;
  if (/-10\.\d+\.\d+-MariaDB$/.test(serverVersion)) {
    return new MariaDB10SQLDialect();
  } else if (/^5\.[6-7]\.\d+$/.test(serverVersion)) {
    return new MySQL56SQLDialect();
  } else {
    throw new Error(`Unsupported server implementation or version: ${serverVersion}`);
  }
}

/**
 * Create database connection provider.
 *
 * @remarks
 * Depending on what type of options are passing in, a connection pool or a
 * single shared connection provider is created. The single shared connection
 * provider does not allow concurrent connection use.
 *
 * @param app - The application.
 * @param options - Connection or connection pool options.
 *
 * @public
 */
export function createMySQLDatabaseConnectionProvider(
  app: Application,
  options: string | MySQLConnectionOptions | MySQLConnectionPoolOptions
): Promise<DatabaseConnectionProvider> {

  // get debug log
  const log = app.logger.debug(LOG_CATEGORY);

  // check if connection pool or single connection
  if (isPoolOptions(options)) {

    // create underlying pool
    log("creating database connection pool");
    let rawPool: mysql2.Pool;
    try {
      rawPool = mysql2.createPool(options);
    } catch (err) {
      return Promise.reject(err);
    }

    // test connection and detect dialect
    return new Promise((resolve, reject): void => {
      rawPool.getConnection((err, con): void => {
        let fatalError = err;
        if (!fatalError) {
          if (con._handshakePacket) {
            log(`connected to ${con._handshakePacket.serverVersion}`);
          }
          try {
            const dialect = detectDialect(con);
            rawPool.releaseConnection(con);
            resolve(new MySQLPoolConnectionProvider(app, dialect, rawPool));
          } catch (dialectErr) {
            fatalError = dialectErr;
          }
        }
        if (fatalError) {
          log("shutting down connection pool due to an error");
          rawPool.end((endErr): void => {
            if (endErr) {
              app.logger.error("error shutting down the connection pool", endErr);
            }
            reject(fatalError);
          });
        }
      });
    });

  } else { // single connection

    // create underlying connection
    log("establishing single database connection");
    let rawConnection: mysql2.Connection;
    try {
      rawConnection = mysql2.createConnection(options);
    } catch (err) {
      return Promise.reject(err);
    }

    // connect and detect dialect
    return new Promise((resolve, reject): void => {
      rawConnection.connect((err): void => {
        let fatalError = err;
        if (!fatalError) {
          if (rawConnection._handshakePacket) {
            log(`connected to ${rawConnection._handshakePacket.serverVersion}`);
          }
          try {
            const dialect = detectDialect(rawConnection);
            resolve(new MySQLSingleConnectionProvider(app, dialect, rawConnection));
          } catch (dialectErr) {
            fatalError = dialectErr;
          }
        }
        if (fatalError) {
          reject(fatalError);
          if (rawConnection._fatalError) {
            rawConnection.destroy();
            reject(fatalError);
          } else {
            log("closing connection due to an error");
            rawConnection.end((endErr): void => {
              if (endErr) {
                app.logger.error("error closing connection", endErr);
              }
              reject(fatalError);
            });
          }
        }
      });
    });
  }
}

/**
 * Returns service binder for the MySQL database connection provider.
 *
 * @param options - Connection options or a function that returns it given the
 * application.
 * @returns Database connection provider service binder.
 *
 * @public
 */
export function mySQLDatabaseConnectionProvider<A extends Application>(
  options: (
    string | MySQLConnectionOptions | MySQLConnectionPoolOptions |
    ((app: A) => (string | MySQLConnectionOptions | MySQLConnectionPoolOptions))
  )
): [typeof DB_CONNECTION_PROVIDER_SERVICE, ServiceFactory<A, DatabaseConnectionProvider>] {

  return [
    DB_CONNECTION_PROVIDER_SERVICE,
    (app: A): Promise<DatabaseConnectionProvider> => (
      typeof options === "function" ?
        createMySQLDatabaseConnectionProvider(app, options(app)) :
        createMySQLDatabaseConnectionProvider(app, options)
    )
  ];
}
