import { Logger } from "./logger";

/**
 * Log message with its context.
 *
 * @public
 */
export interface LogMessage {

  /**
   * Message timestamp.
   */
  readonly ts: Date;

  /**
   * Message runtime context.
   */
  readonly context: string[];

  /**
   * Message category, "ERROR" if error message.
   */
  readonly category: string;

  /**
   * Message text.
   */
  readonly message: string;

  /**
   * Error, if any.
   */
  readonly error?: unknown;
}

/**
 * Message variable implementation.
 *
 * @param msg - Log message descriptor.
 * @param param - Parameter from the variable placeholder in the format string.
 * The parameter is the string that follows the colon after the variable name in
 * the variable placeholder.
 * @returns Variable value, or `undefined` if variable value is unavailable.
 *
 * @public
 */
export type MessageVariable = (msg: LogMessage, param?: string) => string | undefined;

/**
 * Builder for a log message part.
 *
 * @remarks
 * A message part builder can be associated with a single message variable.
 *
 * An array of part builders comprises a full message builder. To compile the
 * final message, the parts produced by the part builders are concatenated.
 */
interface MessagePartBuilder {

  /**
   * Part of the format string preceeding the variable up to the previous
   * variable or the beginning of the format string.
   */
  readonly prefix: string;

  /**
   * If `true` and the message variable value is empty, the `prefix` is not
   * included in the final log message.
   */
  readonly noPrefixIfEmpty: boolean;

  /**
   * Message variable implementation if the part is for a message variable.
   */
  readonly variable?: MessageVariable;

  /**
   * Message variable parameter (string that follows the colon after the
   * variable name in the variable placeholder in the format string), if any.
   */
  readonly variableParam?: string;
}

/**
 * Default log message variable implementations.
 */
const DEFAULT_VARS: { [key: string]: MessageVariable } = {
  "ts": (msg): string => msg.ts.toISOString(),
  "pid": (): string => String(process.pid),
  "cat": (msg): string => msg.category,
  "msg": (msg): string => msg.message,
  "env": (msg, param): string | undefined => param && process.env[param],
  "ctx": (msg): string | undefined => (
    msg.context.length > 0 ? `[${msg.context.join(", ")}]` : undefined
  ),
  "err": (msg): string | undefined => {
    const err = msg.error;
    if (err instanceof Error) {
      return err.stack || err.message;
    } else {
      switch (typeof err) {
        case "undefined": return undefined;
        case "string": return err;
        default: return String(err);
      }
    }
  }
};

/**
 * No-op debug message logger returned by {@link DefaultLogger.debug | debug()}
 * method for disabled categories.
 */
function noopLogger(): void { }

/**
 * Default logger service implementation.
 *
 * @remarks
 * This implementation uses `console.error()` and `console.log()` to output
 * error and debug messages respectively. It is used by default by applications
 * when no other logger service is configured explicitly.
 *
 * This implementation uses `NODE_DEBUG` environment variable to configure what
 * debug message categories get logged. To enable a given debug log category,
 * the environmant variable, which is a comma-separated list, must include
 * either the exact category name, or category name prefix followed by a star.
 * For the puprpose of the prefix matching, the category names are split at
 * underscores. For example, to enable debug messages for category "X2_DB_SQL",
 * the `NODE_DEBUG` must include any of the following: "X2*", "X2_DB*",
 * "X2_DB_SQL" or "X2_DB_SQL*". Note also, that `NODE_DEBUG` is
 * case-insensitive.
 *
 * Another feature of this implementation is configurable log message format,
 * which can be provided to the class constructor. The format string includes
 * variables in curly braces that get replaced by certain values. The following
 * variables are supported by default:
 *
 * * _ts_ - Message timestamp in ISO format (see `Date.toISOString()`).
 * * _pid_ - The Node process PID (see `process.pid`).
 * * _cat_ - The message category. "ERROR" for error messages.
 * * _msg_ - The message text.
 * * _env:VAR_ - Value of the environment variable, where _VAR_ if the variable
 * name (see `process.env`).
 * * _ctx_ - Comma-space-separated list of context values (see
 * {@link Logger.addContext | addContext()} on `Logger` interface). The whole
 * list is surrounded by square brackets.
 * * _err_ - Error information for error messages. Includes error stack trace if
 * the error object is an instance of `Error`.
 *
 * The variable name in a variable placeholder in the format string can be
 * prefixed with a question marks. In that case, if the variable able is empty,
 * the part of the format string preceeding the placeholder up to the previous
 * variable placeholder or the beginning of the format string is omitted. For
 * example, the default format string is "{ts} {?ctx} {cat}: {msg}\n{?err}".
 *
 * The constructor also can take definitions for additional message variables
 * not included in the default set (or overriding the defaults).
 *
 * Also, this implementation can be used as a base class for another logger
 * service implementation. The extended class can override
 * {@link DefaultLogger.writeMessage | writeMessage()} method to provide its own
 * logic for writing log messages.
 *
 * @public
 */
export class DefaultLogger implements Logger {

  /**
   * Message builder compiled from the format string.
   */
  private readonly _messageBuilder: MessagePartBuilder[];

  /**
   * Logger context.
   */
  private readonly _context: string[] = [];

  /**
   * Enabled/disabled flags for debug message categories.
   */
  private readonly _enabledCategories: {
    [category: string]: boolean;
  } = {};

  /**
   * Debug loggers for debug message categories.
   */
  private readonly _debugLoggers: {
    [category: string]: (message: string) => void;
  } = {};

  /**
   * Debug logger function that gets bound to the specific logger instance with
   * its context and a category.
   */
  private readonly _unboundDebugLogger = (category: string, message: string): void => {
    this.writeMessage(false, this._formatMessage(category, message));
  };

  /**
   * Create new logger service instance.
   *
   * @param format - The log message format string.
   * @param extraVars - Implementation for additional log message variables that
   * can be used in the `format` string.
   */
  public constructor(
    format: string,
    extraVars?: { [key: string]: MessageVariable }
  ) {

    // build message builder according to the message format
    this._messageBuilder = [];
    const re = /\{(\?)?([^}:]+)(?::([^}]+))?\}/g;
    let m: RegExpExecArray | null;
    let lastIndex = 0;
    while ((m = re.exec(format)) !== null) {
      const variable = (extraVars && extraVars[m[2]]) || DEFAULT_VARS[m[2]];
      if (variable) {
        this._messageBuilder.push({
          prefix: format.substring(lastIndex, m.index),
          noPrefixIfEmpty: (m[1] !== undefined),
          variable,
          variableParam: m[3]
        });
        lastIndex = re.lastIndex;
      }
    }
    if (lastIndex < format.length) {
      this._messageBuilder.push({
        prefix: format.substring(lastIndex),
        noPrefixIfEmpty: false
      });
    }
  }

  /** {@inheritDoc Logger.error} */
  public error(message: string, err?: unknown): void {

    this.writeMessage(true, this._formatMessage("ERROR", message, err));
  }

  /** {@inheritDoc Logger.debug} */
  public debug(category: string): (message: string) => void {

    let logger = this._debugLoggers[category];
    if (!logger) {
      if (this.isDebugEnabled(category)) {
        logger = this._unboundDebugLogger.bind(this, category);
      } else {
        logger = noopLogger;
      }
      this._debugLoggers[category] = logger;
    }

    return logger;
  }

  /** {@inheritDoc Logger.isDebugEnabled} */
  public isDebugEnabled(category: string): boolean {

    let enabled = this._enabledCategories[category];
    if (enabled === undefined) {
      const rest = (parts: string[], ind: number): string => (
        ind < parts.length - 1 ?
          `${parts[ind]}(\\*|_${rest(parts, ind + 1)})?` : `${parts[ind]}\\*?`
      );
      const categoryRE = RegExp(`(^|,)\\s*${rest(category.split("_"), 0)}\\s*(,|$)`, "i");
      enabled = categoryRE.test(process.env["NODE_DEBUG"] || "");
      this._enabledCategories[category] = enabled;
    }

    return enabled;
  }

  /** {@inheritDoc Logger.addContext} */
  public addContext(ctx: string[]): Logger {

    return Object.assign({}, this, {
      _context: this._context.concat(ctx),
      _debugLoggers: {}
    });
  }

  /**
   * Write the message to the log output.
   *
   * @remarks
   * This implementation uses `console` to write messages. The method can be
   * overriden in a subclass to provide a different log output.
   *
   * @param isError - `true` if the message is an error message, `false` if it
   * is a debug message.
   * @param message - Formatted message text to output.
   */
  protected writeMessage(isError: boolean, message: string): void {

    if (isError) {
      console.error(message);
    } else {
      console.log(message);
    }
  }

  /**
   * Create formatted log message ready to be written to the log output.
   *
   * @param category - Message category ("ERROR" for error message).
   * @param message - Message text.
   * @param err - Error, if any, for an error message.
   * @returns Formatted log message.
   */
  private _formatMessage(category: string, message: string, err?: unknown): string {

    const msg: LogMessage = {
      ts: new Date(),
      context: this._context,
      category: category,
      message: message,
      error: err
    };

    return this._messageBuilder.map((part): string => {
      const val = part.variable && part.variable(msg, part.variableParam);
      return (
        val ? `${part.prefix}${val}` : (
          part.noPrefixIfEmpty ? "" : part.prefix
        )
      );
    }).join("");
  }
}
