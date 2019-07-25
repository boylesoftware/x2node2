// Copyright (c) Boyle Software, Inc. All rights reserved. Licensed under the MIT license.

/**
 * SQL dialect.
 *
 * @public
 */
export interface SQLDialect {

  /**
   * Get SQL string literal for the specified value.
   *
   * @param val - String value.
   * @returns SQL value expression that represents the provided string value.
   */
  stringLiteral(val: string): string;

  /**
   * Get SQL Boolean literal for the specified value.
   *
   * @param val - Boolean value.
   * @returns SQL value expression that represents the provided Boolean value.
   */
  booleanLiteral(val: boolean): string;

  //...
}
