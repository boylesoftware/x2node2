// Copyright (c) Boyle Software, Inc. All rights reserved. Licensed under the MIT license.

/**
 * Application configuration service interface.
 *
 * @remarks
 * The configuration is used to provide the application with information about
 * its runtime environment. The configuration consists of configuration options,
 * identified by names, and their values. The options may include such things as
 * the database URL, or the port, on which to listen for incoming API requests,
 * or an application encryption key, etc.
 *
 * A configuration service is always available on the application, even if not
 * explicitly configured. The {@link DefaultConfiguration} implementation is
 * used by default.
 *
 * @public
 */
export interface Configuration {

  /**
   * Get configuration option value.
   *
   * @param option - Configuration option name.
   * @returns Configuration option value, if available.
   */
  get(option: string): string | undefined;

  /**
   * Get required configuration option value. Throws an error if option is not
   * available.
   *
   * @param option - Configuration option name.
   * @returns Configuration option value.
   */
  getRequired(option: string): string;
}
