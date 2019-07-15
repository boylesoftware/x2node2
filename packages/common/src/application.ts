import { Logger } from "./logger";
import { DefaultLogger } from "./default-logger";
import { Configuration } from "./configuration";
import { DefaultConfiguration } from "./default-configuration";

/**
 * Default log message format.
 */
const DEFAULT_LOG_FORMAT = "{ts} {?ctx} {cat}: {msg}\n{?err}";

/**
 * Service key, which is name of the {@link Application} instance property, to
 * which the service instance is bound.
 *
 * @typeParam S - Corresponding service type.
 */
export type ServiceKey<S> = string;

/**
 * Interface for optional methods that may be defined on a service.
 *
 * @remarks
 * Since all members of this interface are optional, services do not
 * <em>have</em> to implement this interface.
 */
export interface Service {

  /**
   * List of services (identified by their service keys) that may not be shut
   * down before this service completes its shutdown.
   */
  readonly shutdownDependencies?: ServiceKey<unknown>[];

  /**
   * Gracefully shutdown the service.
   *
   * @remarks
   * Thrown errors and rejected promises are logged, but otherwise ignored. The
   * service is removed from the application and the shutdown process continues.
   *
   * @returns Nothing, if service shuts down synchronously, or, for asynchronous
   * shutdown, a promise that resolves when the service shutdown is complete.
   */
  shutdown?(): Promise<void> | void;
}

/**
 * Function, that creates a service instance.
 *
 * @remarks
 * Service factory functions are associated with service keys and added to the
 * application when it is being configured. When the application is initialized
 * (see {@link Application.init | init()} method), the service factory functions
 * are called to produce service instances, which are then bound to the
 * application instance under the provided service keys.
 *
 * The application instance passed into the service factory function has all
 * services configured before this one initialized and available. This makes it
 * possible for services to depend on each other.
 *
 * If the service factory function throws an error or returns a promise that
 * rejects, the initialization process is aborted, all services that have
 * already been initialized are shutdown and removed from the application, and
 * the initialization ends with the error.
 *
 * @typeParam A - The application type extended with all services configured
 * before this one.
 * @typeParam S - Type of the service the factory function creates.
 * @param app - The application with all services configured before this one
 * initialized and available.
 * @returns The service instance or a promise of it.
 */
export type ServiceFactory<A extends Application, S> = (app: A) => Promise<S> | S;

/**
 * Application extended with a service.
 *
 * @typeParam A - The base application type.
 * @typeParam K - The service key.
 * @typeParam S - The service type.
 */
export type ApplicationPlusService<A extends Application, K extends ServiceKey<S>, S> = A & {
  readonly [serviceKey in K]: S;
};

/**
 * An _x2node_ application.
 *
 * @remarks
 * A single `Application` instance serves as the top object that repsents the
 * Node application and ties all of its components together. An instance is
 * usually created in the very beginning of the application lifecycle. Once
 * created, the instance is uninitialized and is not ready to be used.
 *
 * Next step is to configure the instance. Normally, that includes adding
 * _services_ to the application via one of the `services()` methods. Services
 * are singletons stored on the application object in readonly properties with
 * names called _service keys_. This makes the services available to all other
 * application components as well as to each other.
 *
 * Once all services have been configured for the application, it then can
 * be initialized using its {@link Application.init | init()} method. The
 * initialization process creates service instances and sets them on the
 * `Application` object under the corresponding service keys. From this point
 * on, the application is ready.
 *
 * The application can be then gracefully shut down using its
 * {@link Application.shutdown | shutdown()} method. Services may optionally
 * implement {@link Service} interface to provide special shutdown logic, which
 * is invoked during the application shutdown process.
 *
 * The `Application` class can be also extended to provide additional
 * functionality.
 *
 * @public
 */
export class Application {

  /**
   * Application readiness flag.
   */
  private _ready = false;

  /**
   * Service binders.
   */
  private readonly _serviceBinders: [
    ServiceKey<unknown>,
    ServiceFactory<Application, unknown>
  ][] = [];

  /**
   * Active application initialization promise, or `null` is not initalizing.
   */
  private _initPromise: Promise<this> | null = null;

  /**
   * Active application shutdown promise, or `null` is not shutting down.
   */
  private _shutdownPromise: Promise<void> | null = null;

  /**
   * Flag used to abort active initialization.
   */
  private _abortInit = false;

  /**
   * Default configuration service.
   */
  private readonly _defaultConfig: Configuration;

  /**
   * Default logger service.
   */
  private readonly _defaultLogger: Logger;

  /**
   * Initialized application services (service key, service instance tuples).
   */
  private readonly _services: [ServiceKey<unknown>, unknown][] = [];

  /**
   * Tells if the application has been successfully initialized and is ready to
   * be used.
   *
   * @remarks
   * When a new application instance is created, this flag is initially `false`.
   * It becomes `true` after the application is successfully initialized (see
   * {@link Application.init | init()} method). When the application is shutting
   * down or has shut down (see {@link Application.shutdown | shutdown()}), this
   * flag turns back to `false`.
   */
  public get ready(): boolean { return this._ready; }

  /**
   * Application configuration service.
   *
   * @remarks
   * The configuration service is different in that it is always available on
   * the application, even before it is initialized. If not explicitely
   * configured, {@link DefaultConfiguration} is used. If explicitely
   * configured, the default configuration is used before the configured service
   * is initialized and after it is shut down.
   */
  public readonly config: Configuration;

  /**
   * Logger service.
   *
   * @remarks
   * The logger service is different in that it is always available on the
   * application, even before it is initialized. If not explicitely configured,
   * {@link DefaultLogger} is used. If explicitely configured, the default
   * logger is used before the configured logger service is initialized and
   * after it is shut down.
   *
   * The default logger format string is taken from `X2_LOG_FORMAT` environment
   * variable. If not provided, "{ts} {?ctx} {cat}: {msg}\n{?err}" is used by
   * default.
   */
  public readonly logger: Logger;

  /**
   * Create new uninitialized application instance.
   *
   * @remarks
   * The new instance must be configured (e.g. services added) and initialized
   * before it can be used.
   */
  public constructor() {

    // create default configuration
    this._defaultConfig = new DefaultConfiguration();
    this.config = this._defaultConfig;

    // create default logger
    this._defaultLogger = new DefaultLogger(
      process.env["X2_LOG_FORMAT"] || DEFAULT_LOG_FORMAT);
    this.logger = this._defaultLogger;
  }

  public services<
    K0 extends ServiceKey<S0>, S0, A0 extends ApplicationPlusService<this, K0, S0>
  >(
    binder0: [K0, ServiceFactory<this, S0>]
  ): A0;
  public services<
    K0 extends ServiceKey<S0>, S0, A0 extends ApplicationPlusService<this, K0, S0>,
    K1 extends ServiceKey<S1>, S1, A1 extends ApplicationPlusService<A0, K1, S1>
  >(
    binder0: [K0, ServiceFactory<this, S0>],
    binder1: [K1, ServiceFactory<A0, S1>]
  ): A1;

  /**
   * Configure application services.
   *
   * @remarks
   * Services are configured by specifying service keys and corresponding
   * service factory functions after the new `Application` instance is created
   * but before it is initialized. Calling this method at any other point will
   * throw an error.
   *
   * The combination of a service key and the corresponding service factory
   * function is called _service binder_. The order, in which service binders
   * are passed to the `services()` method is important: every service factory
   * function receives application instance with initialized and available
   * services that were specified before it. This allows services to depend on
   * other services.
   *
   * It is an error to provide more than ne binder for the same service key if
   * the corresponding services have shutdown logic (that is have `shutdown()`
   * method on them).
   *
   * Note, that the returned application instance does not yet have the service
   * instances bound to the service keys. That happens only after successful
   * initialization.
   *
   * @param binders - Service binders.
   * @returns Uninitialized, but configured application.
   */
  public services(
    ...binders: [ServiceKey<unknown>, ServiceFactory<Application, unknown>][]
  ): this {

    if (this._ready || this._initPromise || this._shutdownPromise) {
      throw new Error("May not add services to the application at this point.");
    }

    for (const binder of binders) {
      this._serviceBinders.push(binder);
    }

    return this;
  }

  /**
   * Initialize the application and make it ready to use.
   *
   * @remarks
   * This method must be called before the newly created and configured
   * application can be used. Calling this method creates, configures and
   * initializes all application services. After successful initialization, the
   * application's {@link Application.ready | ready} flag becomes `true` and
   * the `init()` method can no longer be called (will throw an error if
   * attempted).
   *
   * If `init()` is called (asynchronously) before active initialization is
   * complete, the same initialization promise is returned. This, however,
   * should not be normal application behavior. A corresponding warning message
   * will be logged in the console.
   *
   * An error will be thrown if `init()` is called while the application is
   * being shutdown via the {@link Application.shutdown | shutdown()} method.
   * On the other hand, it is possible to call the
   * {@link Application.shutdown | shutdown()} method before the initialization
   * is complete. In that case, the initialization will be aborted, all services
   * already initialized will be shut down. The promise returned by the `init()`
   * method will reject with an error after the shutdown is complete.
   *
   * @returns Promise, which resolves with the initialized application or
   * rejects with an application initialization error.
   */
  public async init(): Promise<this> {

    // check if already initialized
    if (this._ready) {
      throw new Error("The application is already initialized.");
    }

    // check if shutting down
    if (this._shutdownPromise) {
      throw new Error("The application is shutting down.");
    }

    // check if already initializing
    if (this._initPromise) {
      this.showMessage("warning: attempt to initialize application" +
        " that is already initializing");
      return this._initPromise;
    }

    // begin initialization
    this.showMessage("initializing application...");

    // chain service initializations
    let servicesInitPromise = Promise.resolve();
    for (const serviceBinder of this._serviceBinders) {
      let svcInitPromise: Promise<unknown>;
      try {
        svcInitPromise = Promise.resolve(serviceBinder[1](this));
      } catch (err) {
        svcInitPromise = Promise.reject(err);
      }
      servicesInitPromise = servicesInitPromise.then(
        (): Promise<unknown> => svcInitPromise
      ).then(
        (service): void => {
          const serviceKey = serviceBinder[0];
          this._services.push([serviceKey, service]);
          if (this._abortInit) {
            this._abortInit = false;
            throw new Error("The application began shutdown" +
              " before initialization was complete.");
          }
          this._addService(serviceKey, service);
        }
      );
    }

    // add initialization completion logic and return the init promise
    this._initPromise = servicesInitPromise.then(
      (): this => {
        this._initPromise = null;
        this._ready = true;
        this.showMessage("application is ready");
        return this;
      },
      async (err): Promise<never> => {
        this._initPromise = null;
        this.showMessage("error initalizing the application: " + err.message);
        return this.shutdown().then((): Promise<never> => Promise.reject(err));
      }
    );

    // return applciation initialization promise
    return this._initPromise;
  }

  /**
   * Gracefully shutdown the application.
   *
   * @remarks
   * Once called, the application starts shutting down all of its services in
   * the reverse initialization order. Any errors encountered during services
   * shutdown are logged, but otherwise ignored.
   *
   * If `shutdown()` is called when the application is already shutting down,
   * the same shutdown promise will be returned. This, however, should not be
   * normal application behavior. A corresponding warning message will be logged
   * in the console.
   *
   * It is safe to call `shutdown()` on an uninitialized application or
   * application that has been shut down. The returned promise will resolve
   * immediately.
   *
   * It is also possible to call `shutdown()` while the application is being
   * initialized via the {@link Application.init | init()} method. In that case,
   * the initialization process will be aborted, all services already
   * initialized will be shut down.
   *
   * @returns Promise the resolves when the shutdown is complete (that is when
   * all application services complete shutdown). The promise never rejects
   * since all shutdown errors are logged, but otherwise ignored.
   */
  public async shutdown(): Promise<void> {

    // check if already shutting down
    if (this._shutdownPromise) {
      this.showMessage("warning: attempt to shutdow application" +
        " that is already shutting down");
      return this._shutdownPromise;
    }

    // check if called shutdown before initialization complete
    if (this._initPromise) {
      this.showMessage("shutting down application" +
        " before it completed initialization");
      this._abortInit = true;
      return this._initPromise.then(
        (): Promise<void> => this.shutdown(),
        // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
        (): Promise<void> => this._shutdownPromise! // init() calls shutdown()
      );
    }

    // begin shutdown
    this.showMessage("shutting down application...");

    // drop the application readiness flag
    this._ready = false;

    // keep track of shutdown promises of dependent services
    const dependentShutdownPromises: { [serviceKey: string]: Promise<void>[] } = {};

    // accumulate all service shutdown promises
    const shutdownPromises: Promise<void>[] = [];

    // go over services in reverse initialization order
    let serviceBinding: [string, unknown] | undefined;
    while ((serviceBinding = this._services.pop()) !== undefined) {
      const serviceKey = serviceBinding[0];
      const service = serviceBinding[1] as Service;

      // wait for dependent services to shutdown
      const shutdownPromise = Promise.all(
        dependentShutdownPromises[serviceKey] || []
      ).then( // shutdown the service
        (): Promise<void> | void => {

          // check if service has shutdown logic
          if (service.shutdown) {

            // invoke service shutdown logic
            let shutdownResult;
            try {
              shutdownResult = service.shutdown();
            } catch (err) {
              shutdownResult = Promise.reject(err);
            }

            // wait for shutdown completion
            return Promise.resolve(
              shutdownResult
            ).catch( // catch shutdown errors
              (err): void => {
                this.showMessage(`error shutting down service "${serviceKey}"` +
                  `: ${this._errorInfo(err)}`);
              }
            ).then( // remove service from the application
              (): void => { this._removeService(serviceKey); }
            );
          } else { // no shutdown, just remove service from the application
            this._removeService(serviceKey);
          }
        }
      );

      // save shutdown promise as a dependent for shutdown dependencies
      const shutdownDependencies = service.shutdownDependencies || [];
      for (const dependencyServiceKey of shutdownDependencies) {
        let promises = dependentShutdownPromises[dependencyServiceKey];
        if (!promises) {
          promises = [];
          dependentShutdownPromises[dependencyServiceKey] = promises;
        }
        promises.push(shutdownPromise);
      }

      // save service shutdown promise
      shutdownPromises.push(shutdownPromise);
    }

    // wait for all services to shutdown
    this._shutdownPromise = Promise.all(
      shutdownPromises
    ).then( // shutdown complete
      (): void => {
        this._shutdownPromise = null;
        this.showMessage("application shutdown complete");
      }
    );

    // return application shutdown promise
    return this._shutdownPromise;
  }

  /**
   * Show message in the application console.
   *
   * @param message - The message.
   */
  protected showMessage(message: string): void {

    console.log(message);
  }

  /**
   * Add service to the application.
   *
   * @typeParam S - Service type.
   * @param serviceKey - Service key.
   * @param service - Initialized service instance.
   */
  private _addService<S>(
    serviceKey: ServiceKey<S>, service: S
  ): void {

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const app = this as any;

    // check if duplicate service
    const existingService = app[serviceKey];
    if (existingService !== undefined && existingService.shutdown) {
      throw new Error(
        `A shutdownable service is already bound to the key "${serviceKey}".`);
    }

    // add service to the application
    app[serviceKey] = service;
  }

  /**
   * Remove service reference from the application.
   *
   * @param serviceKey - Service key.
   */
  private _removeService(serviceKey: ServiceKey<unknown>): void {

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const app = this as any;

    // delete service from the application
    delete app[serviceKey];

    // restore default services
    if (serviceKey === "config") {
      app.config = this._defaultConfig;
    } else if (serviceKey === "logger") {
      app.logger = this._defaultLogger;
    }
  }

  /**
   * Get error description for a message.
   *
   * @param err - The error.
   * @returns Error description to show.
   */
  private _errorInfo(err: unknown): string {

    return (err instanceof Error ? err.stack || err.message : String(err));
  }
}
