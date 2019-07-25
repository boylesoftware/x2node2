// Copyright (c) Boyle Software, Inc. All rights reserved. Licensed under the MIT license.

/**
 * Implementation of <i>X2 Framework</i>'s database connection provider for
 * <i>MySQL</i> compatible databases.
 *
 * @remarks
 * The implementation supports {@link https://www.mysql.com/ | MySQL} (versions
 * 5.6 and up), {@link https://mariadb.org/ | MariaDB} (versions 10.0 and up) as
 * well as {@link https://aws.amazon.com/rds/aurora/ | Amazon Aurora}.
 *
 * Uses {@link https://www.npmjs.com/package/mysql2 | mysql2} module for the
 * underlying functionality.
 *
 * @packageDocumentation
 */

export * from "./options";
export * from "./provider";
