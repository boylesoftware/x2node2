// Copyright (c) Boyle Software, Inc. All rights reserved. Licensed under the MIT license.

import { Duplex } from "stream";
import { SecureContextOptions } from "tls";

/* eslint-disable @typescript-eslint/no-explicit-any */

//////////////////////////////////////////////////////////////////////////////
// Configuration
//////////////////////////////////////////////////////////////////////////////

export interface ConnectionConfig {
  uri?: string;
  host?: string;
  port?: number;
  localAddress?: string;
  socketPath?: string;
  stream?: Duplex | ((cb: (err: Error | null, stream?: Duplex) => void) => void);
  user?: string;
  password?: string;
  passwordSha1?: string | Buffer;
  database?: string;
  charsetNumber?: number;
  charset?: string;
  timezone?: string;
  connectTimeout?: number;
  insecureAuth?: boolean;
  ssl?: "Amazon RDS" | SecureContextOptions;
  authSwitchHandler?: (data: any, cb: () => void) => any;
  compress?: boolean;
  typeCast?: boolean | ((field: any, next: () => any) => any);
  supportBigNumbers?: boolean;
  bigNumberStrings?: boolean;
  dateStrings?: boolean;
  decimalNumbers?: boolean;
  queryFormat?: (query: string, values: any) => void;
  stringifyObjects?: boolean;
  namedPlaceholders?: boolean;
  debug?: boolean;
  trace?: boolean;
  multipleStatements?: boolean;
  flags?: string;
  connectAttributes?: { [attName: string]: any };
  maxPreparedStatements?: number;
  nestTables?: boolean;
  rowsAsArray?: boolean;
  isServer?: boolean;
  pool?: any;
}

export interface PoolConfig extends ConnectionConfig {
  connectionLimit?: number;
  waitForConnections?: boolean;
  queueLimit?: number;
  Promise?: any;
}

//////////////////////////////////////////////////////////////////////////////
// Connection
//////////////////////////////////////////////////////////////////////////////

export function createConnection(config: string | ConnectionConfig): Connection;
export function createPool(config: PoolConfig): Pool;

export interface Connection {
  readonly _handshakePacket?: {
    readonly serverVersion: string;
  } | null;
  readonly _fatalError: ConnectionError | null;
  readonly threadId: number | null;
  connect(cb: (err: ConnectionError | null) => void): void;
  end(cb: (err: ConnectionError | undefined) => void): void;
  destroy(): void;
  query(sql: string, cb: (err: ConnectionError | null, result: QueryResult) => void): void;
}

export interface Pool {
  getConnection(cb: (err: Error | null, con: Connection) => void): void;
  releaseConnection(con: Connection): void;
  end(cb: (err: ConnectionError | undefined) => void): void;
}

export interface ConnectionError extends Error {
  readonly fatal?: boolean;
  readonly code?: string;
}

//////////////////////////////////////////////////////////////////////////////
// Query
//////////////////////////////////////////////////////////////////////////////

export interface QueryResult {
  readonly affectedRows: number;
  //...
}
