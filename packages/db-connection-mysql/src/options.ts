// Copyright (c) Boyle Software, Inc. All rights reserved. Licensed under the MIT license.

import { Duplex } from "stream";
import { SecureContextOptions } from "tls";

/**
 * Database value type.
 *
 * @public
 */
export type ValueType = (
  "DECIMAL" |
  "TINY" |
  "SHORT" |
  "LONG" |
  "FLOAT" |
  "DOUBLE" |
  "NULL" |
  "TIMESTAMP" |
  "LONGLONG" |
  "INT24" |
  "DATE" |
  "TIME" |
  "DATETIME" |
  "YEAR" |
  "NEWDATE" |
  "VARCHAR" |
  "BIT" |
  "JSON" |
  "NEWDECIMAL" |
  "ENUM" |
  "SET" |
  "TINY_BLOB" |
  "MEDIUM_BLOB" |
  "LONG_BLOB" |
  "BLOB" |
  "VAR_STRING" |
  "STRING" |
  "GEOMETRY"
);

/**
 * Database `POINT` type value.
 *
 * @public
 */
export interface PointValue { x: number; y: number }

/**
 * Database `GEOMERTY` type value.
 *
 * @public
 */
export type GeometryValue = PointValue | GeometryValueArray;

/**
 * Array of database `GEOMETRY` type values.
 *
 * @public
 */
// eslint-disable-next-line @typescript-eslint/no-empty-interface
export interface GeometryValueArray extends Array<GeometryValue> { }

/**
 * Descrpitor of a field that comes from the database (e.g. `SELECT` query
 * result set).
 *
 * @public
 */
export interface FieldInfo {

  /**
   * Value type.
   */
  readonly type: ValueType;

  /**
   * Value field width in bytes.
   */
  readonly length: number;

  /**
   * Database name or empty string.
   */
  readonly db: string;

  /**
   * Table name (alias) or empty string.
   */
  readonly table: string;

  /**
   * Column name (alias) or empty string.
   */
  readonly name: string;

  /**
   * Function for getting the field string value.
   */
  string: () => string | null;

  /**
   * Function for getting the field binary value.
   */
  buffer: () => Buffer | null;

  /**
   * Function for getting the field geometry value.
   */
  geometry: () => GeometryValue | null;
}

/**
 * Custom type caster function.
 *
 * @public
 */
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export type TypeCastFunc = (field: FieldInfo, next: () => any) => any;

/**
 * Authentication switch handler function.
 *
 * @public
 */
export type AuthSwitchHandler = (
  params: {
    pluginName?: string;
    pluginData: Buffer;
  },
  cb: (err: Error | null, data?: Buffer) => void
) => void;

/**
 * Database connection options.
 *
 * @remarks
 * This is mostly the {@link https://www.npmjs.com/package/mysql2 | mysql2}
 * module connection configuration object with some farmework specific
 * constraints.
 *
 * <em>Note, that only own properties are effective.</em>
 *
 * @public
 */
export interface MySQLConnectionOptions {

  /**
   * Database URI.
   *
   * @remarks
   * May include host, port, database, username and password. Any additional
   * options can be provided as query string parameters.
   *
   * Any option individually specified in the options object overrides anything
   * extracted from the URI.
   */
  uri?: string;

  /**
   * Database host.
   *
   * @defaultValue "localhost"
   */
  host?: string;

  /**
   * Database port.
   *
   * @defaultValue 3306
   */
  port?: number;

  /**
   * Unused (the underlying module does not use this functionality).
   *
   * @remarks
   * Originally, the source IP address to use for TCP connection.
   */
  localAddress?: string;

  /**
   * Path to a Unix domain socket to connect to.
   *
   * @remarks
   * Overrides {@link MySQLConnectionOptions.host} and
   * {@link MySQLConnectionOptions.port} options.
   */
  socketPath?: string;

  /**
   * Stream to use for the connection, or a function that provides the stream.
   *
   * @remarks
   * Overrides {@link MySQLConnectionOptions.socketPath},
   * {@link MySQLConnectionOptions.host} and
   * {@link MySQLConnectionOptions.port} options.
   */
  stream?: Duplex | ((cb: (err: Error | null, stream?: Duplex) => void) => void);

  /**
   * Milliseconds before a timeout occurs during the initial connection to the
   * MySQL server.
   *
   * @defaultValue 10000
   */
  connectTimeout?: number;

  /**
   * Unused (the underlying module does not use this functionality).
   *
   * @remarks
   * Originally, allow connecting to MySQL instances that ask for the old
   * (insecure) authentication method.
   *
   * @defaultValue `false`
   */
  insecureAuth?: boolean;

  /**
   * SSL options for the database connection.
   */
  ssl?: "Amazon RDS" | SecureContextOptions;

  /**
   * Authentication switch handler.
   */
  authSwitchHandler?: AuthSwitchHandler;

  /**
   * Use compressed protocol (recommended).
   *
   * @defaultValue `false`
   */
  compress?: boolean;

  /**
   * Database user name.
   */
  user?: string;

  /**
   * Database user password.
   */
  password?: string;

  /**
   * SHA-1 digest of the database user password.
   *
   * @remarks
   * Overrides {@link MySQLConnectionOptions.password} option.
   */
  passwordSha1?: Buffer;

  /**
   * Database name.
   */
  database?: string;

  /**
   * Collation ID for the connection.
   *
   * @remarks
   * See
   * {@link https://dev.mysql.com/doc/refman/5.6/en/adding-collation-choosing-id.html}.
   *
   * @defaultValue 224 (corresponds to "utf8mb4_general_ci")
   */
  charsetNumber?: number;

  /**
   * Collation for the connection.
   *
   * @remarks
   * Overrides {@link MySQLConnectionOptions.charsetNumber} option.
   *
   * @defaultValue "utf8mb4_general_ci"
   */
  charset?: string;

  /**
   * MySQL server's timezone.
   *
   * @remarks
   * MySQL stores datetime values without timezone information. The value of
   * this option is used to interpret the timezone of the values stored in the
   * database and serialize/deserialize `Date` instances.
   *
   * Can be "local" (same as the application timezone), "Z" (UTC) or offset in
   * the form "+HH:MM" or "-HH:MM".
   *
   * @defaultValue "local"
   */
  timezone?: string;

  /**
   * Determines how column values are converted into JavaScript types.
   *
   * @remarks
   * A custom type cast function can be provided. Otherwise, must be `true` or
   * omitted to use the default.
   *
   * The framework relies on the default type casting logic being enabled, so
   * any custom type cast function must respect it.
   *
   * @defaultValue `true`
   */
  typeCast?: true | TypeCastFunc;

  /**
   * If `true`, the underlying module prints debug information to the console.
   *
   * @defaultValue `false`
   */
  debug?: boolean;

  /**
   * Unused (the underlying module does not use this functionality).
   *
   * @remarks
   * Originally, generate stack traces on errors.
   *
   * @defaultValue `true`
   */
  trace?: boolean;

  /**
   * Comma-separated list of connection flags to add or to remove (if flag is
   * prefixed with a minus sign) to/from the default flags.
   */
  flags?: string;

  /**
   * Connection attributes.
   *
   * @remarks
   * See
   * {@link https://dev.mysql.com/doc/refman/5.6/en/performance-schema-connection-attribute-tables.html}.
   */
  connectAttributes?: { [attName: string]: string };

  /**
   * Maximum number of cached prepared statements.
   *
   * @defaultValue 16000
   */
  maxPreparedStatements?: number;

  /**
   * Determines if numbers returned from the database that do not fit in
   * JavaScript's `Number` are represented as strings instead.
   *
   * @remarks
   * The framework relies on numbers to be always represented as `Number`
   * instances. Therefore, this option must be `false` or omitted. Use string
   * (or other) data types to represent numeric values that can be large enough
   * to not fit in a `Number`.
   *
   * @defaultValue `false`
   */
  supportBigNumbers?: false;

  /**
   * Determines if big number values are always returned as strings even if the
   * value fits in a `Number`.
   *
   * @remarks
   * This option is relevant only when
   * {@link MySQLConnectionOptions.supportBigNumbers} is `true` and since
   * {@link MySQLConnectionOptions.supportBigNumbers} is forced to be `false`,
   * this option is never relevant.
   */
  bigNumberStrings?: boolean;

  /**
   * Return date values as strings instead of converting them to `Date` objects.
   *
   * @remarks
   * The framework relies on date values returned as `Date` objects, therefore
   * this option must be `false` or omitted.
   *
   * @defaultValue `false`
   */
  dateStrings?: false;

  /**
   * Return `DECIMAL` values as numbers instead of strings.
   *
   * @remarks
   * The framework relies on `DECIMAL` values to be returned as strings,
   * therefore this option must be `false` or omitted.
   *
   * @defaultValue `false`
   */
  decimalNumbers?: false;

  /**
   * Nest columns in table objects in result sets.
   *
   * @remarks
   * The framework relies on a certain shape of the result sets returned by the
   * underlying module, so this option must be `false` or omitted.
   *
   * @defaultValue `false`
   */
  nestTables?: false;

  /**
   * Return rows are arrays instead of objects.
   *
   * @remarks
   * The framework relies on a certain shape of the result sets returned by the
   * underlying module, so this option must be `false` or omitted.
   *
   * @defaultValue `false`
   */
  rowsAsArray?: false;

  /**
   * Irrelevant (the framework does not use this functionality of the underlying
   * module).
   *
   * @remarks
   * Originally, tells if objects passed as values to SQL statements with
   * placeholders are substituted with object string values (via calling
   * `toString()` on the object) (if `true`), or expanded to comma-separated
   * lists of `field = value` constructs (if `false`).
   *
   * @defaultValue `false`
   */
  stringifyObjects?: boolean;

  /**
   * Irrelevant (the framework does not use this functionality of the underlying
   * module).
   *
   * @remarks
   * Originally, allow multiple SQL statements per query.
   *
   * @defaultValue `false`
   */
  multipleStatements?: boolean;

  /**
   * Irrelevant (the framework does not use this functionality of the underlying
   * module).
   *
   * @remarks
   * Originally, allow named placeholders in SQL queries.
   */
  namedPlaceholders?: boolean;
}

/**
 * Database connection pool options.
 *
 * @remarks
 * <em>Note, that only own properties are effective.</em>
 *
 * @public
 */
export interface MySQLConnectionPoolOptions extends MySQLConnectionOptions {

  /**
   * Maximum number of connections in the pool.
   *
   * @remarks
   * If 0, there is no limit.
   */
  connectionLimit: number;

  /**
   * Wait for a connection to be returned to the pool if new connection is
   * requested and {@link MySQLConnectionPoolOptions.connectionLimit}
   * connections have been already issued.
   *
   * @defaultValue `true`
   */
  waitForConnections?: boolean;

  /**
   * When {@link MySQLConnectionPoolOptions.waitForConnections} is `true`,
   * maximum number of connections allowed to wait.
   *
   * @remarks
   * If 0, there is no limit.
   *
   * @defaultValue 0
   */
  queueLimit?: number;
}
