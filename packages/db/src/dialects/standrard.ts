// Copyright (c) Boyle Software, Inc. All rights reserved. Licensed under the MIT license.

import { SQLDialect } from "../dialect";

/**
 * Standard SQL dialect implementation that can be used as a base class for more
 * specific dialect imlementations.
 *
 * @public
 */
export abstract class StandardSQLDialect implements SQLDialect {

  /**
   * Returns passed in string in single quotes and escapes all single quotes
   * inside the string with a double single quote.
   */
  public stringLiteral(val: string): string {

    return "'" + val.replace(/'/g, "''") + "'";
  }

  /**
   * Returns literals "TRUE" or "FALSE".
   */
  public booleanLiteral(val: boolean): string {

    return (val ? "TRUE" : "FALSE");
  }
}
