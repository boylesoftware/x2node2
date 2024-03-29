// Copyright (c) Boyle Software, Inc. All rights reserved. Licensed under the MIT license.

/**
 * Logger service interface.
 *
 * @remarks
 * Logger service is used by the application to log unexpected application
 * errors as well as debug messages, when enabled. Debug messages are
 * categorized and logger implementations usually allow selective
 * enabling/disabling of certain message categories.
 *
 * A logger service is always available on the application, even if not
 * explicitly configured. The {@link DefaultLogger} implementation is used by
 * default.
 *
 * @public
 */
export interface Logger {

  /**
   * Log an application error.
   *
   * @param message - Error message to log.
   * @param err - The error object, if any. Normally an instance of `Error`, but
   * can be anything.
   */
  error(message: string, err?: unknown): void;

  /**
   * Get debug logger for the given category.
   *
   * @remarks
   * The application's runtime environment may be configured to only log debug
   * messages for certain categories in a way specific to the given logger
   * service implementation. This method will return a no-op function if debug
   * messages for the specified category are disabled.
   *
   * @param category - Category name.
   * @returns Debug logger function, that takes the debug message as its only
   * argument.
   */
  debug(category: string): (message: string) => void;

  /**
   * Tell if debug messages are enabled for the specified category.
   *
   * @remarks
   * If constructing a debug message is an expensive operation, it sometimes
   * worth checking if the debug messages for the given category are enabled
   * before calling the logger function returned by the {@link Logger} service's
   * {@link Logger.debug} method. The {@link Logger.isDebugEnabled} method
   * allows to perform such check.
   *
   * @param category - Category name.
   * @returns `true` if debug messages are enabled for the category, `false`
   * if the category logger is a no-op.
   */
  isDebugEnabled(category: string): boolean;

  /**
   * Create new logger based on this one and add context to it.
   *
   * @remarks
   * Log message format may include information about context, in which the
   * logged event took place. Context is application specific list of short
   * items, such as current API request id, current transaction id, etc.
   * Creating a contextualized logger is cheap, because it still uses the parent
   * logger for all the main functionality. Once the context is no more
   * relevant, the contextualized logger can be simply thrown away. A
   * contextualized logger itself can be used to create furhter contextualized
   * loggers. These loggers will include the parent logger's context, plus their
   * own.
   *
   * @param ctx - Additional context items.
   * @returns Contextualized logger.
   */
  addContext(ctx: string[]): Logger;
}
