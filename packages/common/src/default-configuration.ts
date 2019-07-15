import { Configuration } from "./configuration";

/**
 * Default implementation of the {@link Configuration} service that takes
 * configuration options from the process environment variables (see
 * `process.env`).
 *
 * @public
 */
export class DefaultConfiguration implements Configuration {

  /** {@inheritDoc Configuration.get} */
  public get(key: string): string | undefined {

    return process.env[key];
  }

  /** {@inheritDoc Configuration.getRequired} */
  public getRequired(key: string): string {

    const val = process.env[key];
    if (val === undefined) {
      throw new Error(`Missing "${key}" configuration option.`);
    }

    return val;
  }
}
