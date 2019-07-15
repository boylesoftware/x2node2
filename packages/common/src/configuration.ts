/**
 * Application configuration service interface.
 *
 * @remarks
 * A configuration service is always available on the application, even if not
 * explicitly configured. The {@link DefaultConfiguration} implementation is
 * used by default.
 */
export interface Configuration {

  /**
   * Get configuration option value.
   *
   * @param key - Configuration option key.
   * @returns Configuration option value, if available.
   */
  get(key: string): string | undefined;

  /**
   * Get required configuration option value. Throws an error if option is not
   * available.
   *
   * @param key - Configuration option key.
   * @returns Configuration option value.
   */
  getRequired(key: string): string;
}
